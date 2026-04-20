import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../data/mock_medicine_catalog.dart';

import '../models/medicine.dart';
import '../models/tracked_medication.dart';
import '../models/reservation.dart';
import '../providers/medicine_search_provider.dart';
import '../providers/medication_tracker_provider.dart';
import '../providers/reservation_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'medicine_detail.dart';
import 'pharmacy_map_screen.dart';
import 'login_screen.dart';
import '../providers/language_provider.dart';

class MedicineSearchScreen extends ConsumerStatefulWidget {
  const MedicineSearchScreen({super.key});

  @override
  ConsumerState<MedicineSearchScreen> createState() =>
      _MedicineSearchScreenState();
}

class _MedicineSearchScreenState extends ConsumerState<MedicineSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _activeCategory = 'All';
  int _currentIndex = 0;

  static const List<Map<String, dynamic>> _categories = [
    {'name': 'all', 'icon': Icons.grid_view_rounded},
    {'name': 'tablets', 'icon': Icons.medication_outlined},
    {'name': 'drops', 'icon': Icons.water_drop_outlined},
    {'name': 'syrup', 'icon': Icons.local_drink_outlined},
    {'name': 'first_aid', 'icon': Icons.medical_services_outlined},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Medicine> _applyCategory(List<Medicine> medicines) {
    final active = _activeCategory.toLowerCase();
    if (active == 'all') return medicines;

    return medicines.where((medicine) {
      final medCat = (medicine.category ?? '').toLowerCase();
      final medName = medicine.name.toLowerCase();
      
      // 1. Try direct category match from backend
      if (medCat.contains(active)) return true;

      // 2. Smart fallbacks for untagged items
      if (active == 'tablets') {
        return medCat.contains('tablet') || medName.contains('tablet') || medName.contains('mg');
      }
      if (active == 'drops') {
        return medCat.contains('drop') || medName.contains('drop') || medName.contains('eye');
      }
      if (active == 'syrup') {
        return medCat.contains('syrup') || medName.contains('syrup') || medName.contains('liquid');
      }
      if (active == 'first_aid') {
        return medCat.contains('aid') || medName.contains('cream') || medName.contains('bandage');
      }
      
      return false;
    }).toList();
  }

  Future<void> _onFindNearbyPharmacyTap() async {
    bool serviceEnabled;
    LocationPermission permission;

    // 1. Check if location services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location services are disabled. Please enable them.')),
      );
      return;
    }

    // 2. Check/Request permissions
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permissions are denied.')),
        );
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location permissions are permanently denied.')),
      );
      return;
    }

    // 3. Get actual location
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Acquiring location...'), duration: Duration(seconds: 1)),
    );

    try {
      Position position = await Geolocator.getCurrentPosition();
      
      // Update the provider with the real location and trigger a proximity search
      ref.read(medicineSearchProvider.notifier).updateLocation(position);
      ref.read(medicineSearchProvider.notifier).search(_searchController.text, lat: position.latitude, lng: position.longitude);
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Search results updated with your current location.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error getting location: $e')),
      );
    }
  }

  void _showNearbyRecommendations(List<MapEntry<Medicine, double>> recommendations) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFFF8FAF9),
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Nearby Pharmacies',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF13231A)),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'Based on location',
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                TextButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PharmacyMapScreen(
                          medicine: recommendations.isNotEmpty ? recommendations.first.key : mockMedicineCatalog.first,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.map_outlined, size: 18),
                  label: const Text('Map', style: TextStyle(fontSize: 13)),
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFF34C759),
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (recommendations.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Text('No pharmacies found within 5km of your location.', textAlign: TextAlign.center),
                ),
              )
            else
              Expanded(
                child: ListView.builder(
                  itemCount: recommendations.length,
                  itemBuilder: (context, index) {
                    final pharmacy = recommendations[index].key;
                    final distance = recommendations[index].value / 1000;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F5E9),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(Icons.local_pharmacy_rounded, color: Color(0xFF34C759)),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  pharmacy.pharmacyName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  pharmacy.pharmacyAddress ?? 'Arba Minch',
                                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${distance.toStringAsFixed(1)} km away',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.blueGrey),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => PharmacyMapScreen(medicine: pharmacy),
                                ),
                              );
                            },
                            icon: const Icon(Icons.near_me_rounded, color: Color(0xFF13231A)),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _performManualSearch() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    // Check location before searching
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (!mounted) return;
      final openSettings = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Location Required'),
          content: const Text('To recommend the nearest pharmacies, please enable location services.'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Open Settings')),
          ],
        ),
      );
      if (openSettings == true) {
        await Geolocator.openLocationSettings();
      }
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    if (!mounted) return;
    
    try {
      Position position = await Geolocator.getCurrentPosition();
      ref.read(medicineSearchProvider.notifier).updateLocation(position);
      ref.read(medicineSearchProvider.notifier).search(query, lat: position.latitude, lng: position.longitude);
    } catch (e) {
      ref.read(medicineSearchProvider.notifier).search(query);
    }
  }

  Future<void> _showPrescriptionOptions() async {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Upload Prescription',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF13231A),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Select a method to upload your prescription',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _uploadOption(Icons.camera_alt_rounded, 'Camera', () async {
                  Navigator.pop(context);
                  final picker = ImagePicker();
                  final XFile? image = await picker.pickImage(source: ImageSource.camera);
                  if (image != null) _onFileUploaded(image.name);
                }),
                _uploadOption(Icons.photo_library_rounded, 'Gallery', () async {
                  Navigator.pop(context);
                  final picker = ImagePicker();
                  final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                  if (image != null) _onFileUploaded(image.name);
                }),
                _uploadOption(Icons.description_rounded, 'Document', () async {
                  Navigator.pop(context);
                  try {
                    // Forced dynamic access to the class itself
                    final result = await (FilePicker as dynamic).platform.pickFiles(
                      type: FileType.custom,
                      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'png'],
                    );
                    if (result != null) {
                      _onFileUploaded(result.files.single.name);
                    }
                  } catch (e) {
                    debugPrint('File picker error: $e');
                  }
                }),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _uploadOption(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: const Color(0xFF34C759), size: 30),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: Color(0xFF13231A),
            ),
          ),
        ],
      ),
    );
  }

  void _onFileUploaded(String fileName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Successfully uploaded: $fileName'),
        backgroundColor: const Color(0xFF34C759),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(medicineSearchProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF34C759),
        unselectedItemColor: Colors.grey[500],
        showUnselectedLabels: true,
        backgroundColor: Colors.white,
        elevation: 10,
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.home_filled), label: 'home'.tr(context)),
          BottomNavigationBarItem(icon: const Icon(Icons.calendar_today_rounded), label: 'schedule'.tr(context)),
          BottomNavigationBarItem(icon: const Icon(Icons.receipt_long), label: 'orders'.tr(context)),
          BottomNavigationBarItem(icon: const Icon(Icons.person_outline), label: 'profile'.tr(context)),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return _buildHome();
      case 1:
        return _ScheduleFullScreenTab(
          medications: ref.watch(medicationTrackerProvider),
          onToggle: (id) => ref.read(medicationTrackerProvider.notifier).toggleTaken(id),
        );
      case 2:
        return _OrdersTabContent(
          reservations: ref.watch(reservationProvider),
          onRefresh: () => ref.read(reservationProvider.notifier).refresh(),
        );
      case 3:
        return const _ProfileView();
      default:
        return const Center(child: Text('Coming Soon...'));
    }
  }

  Widget _buildHome() {
    final searchState = ref.watch(medicineSearchProvider);
    final authState = ref.watch(authProvider);
    final isAmharic = ref.watch(languageProvider).languageCode == 'am';
    
    final greeting = isAmharic 
        ? 'welcome_user'.tr(context)
        : (authState.isAuthenticated 
            ? '${'hello_prefix'.tr(context)}, ${authState.firstName ?? 'User'} 👋'
            : 'welcome_user'.tr(context));

    return Column(
      children: [
                // FIXED TOP HEADER & SEARCH
                Container(
                  padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 20),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFFE8F5E9), Colors.white],
                      stops: [0.0, 1.0],
                    ),
                  ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  greeting,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: isAmharic ? 22 : 28,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF13231A),
                  ),
                ),
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      final notifier = ref.read(languageProvider.notifier);
                      notifier.setLanguage(notifier.isAmharic ? 'en' : 'am');
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF13231A),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        ref.watch(languageProvider).languageCode == 'en' ? 'አማ' : 'EN',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Stack(
                    children: [
                      const Icon(Icons.notifications_none_rounded, size: 30),
                      Positioned(
                        right: 2,
                        top: 0,
                        child: Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF34C759),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 1.5),
                          ),
                          child: const Text('3', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                        ),
                      )
                    ],
                  )
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 15,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 20),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          cursorColor: const Color(0xFF4A554E),
                          onSubmitted: (val) => _performManualSearch(),
                          decoration: InputDecoration(
                            hintText: 'search_hint'.tr(context),
                            hintStyle: const TextStyle(color: Color(0xFFA5B2A9), fontSize: 16),
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            errorBorder: InputBorder.none,
                            disabledBorder: InputBorder.none,
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.search_rounded, color: Color(0xFF34C759)),
                        onPressed: _performManualSearch,
                      ),
                      const SizedBox(width: 8),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () async {
                  final ImagePicker picker = ImagePicker();
                  final XFile? image = await picker.pickImage(source: ImageSource.camera);
                  if (image != null) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('scanner'.tr(context) + '...')));
                    final result = await ApiService().scanPrescription(image.path);
                    if (result != null && result['medicines'] != null) {
                      final meds = (result['medicines'] as List).join(', ');
                      _searchController.text = (result['medicines'] as List).first.toString();
                      _performManualSearch();
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('AI Scanner Results'),
                          content: Text('Found: $meds'),
                          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cool!'))],
                        ),
                      );
                    }
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF13231A),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.document_scanner_rounded, color: Color(0xFFBDFC70), size: 24),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _onFindNearbyPharmacyTap,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.location_on_outlined, color: Color(0xFF34C759), size: 18),
                const SizedBox(width: 6),
                Text(
                  'nearby'.tr(context),
                  style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(width: 4),
                Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey[600], size: 18),
              ],
            ),
          )
        ],
      ),
    ).animate().fade().slideY(begin: -0.1),

          // SCROLLABLE AREA
          Expanded(
            child: searchState.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(child: Text(error.toString())),
              data: (data) {
                final medicines = _applyCategory(data);

                return SingleChildScrollView(
                  padding: const EdgeInsets.only(bottom: 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Prescription Upload Hero Banner
                      _UploadHeroBanner(onTap: _showPrescriptionOptions)
                          .animate()
                          .fade(delay: 100.ms)
                          .slideX(begin: 0.05),

                      const SizedBox(height: 24),

                      // Category Chips
                      SizedBox(
                        height: 40,
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          scrollDirection: Axis.horizontal,
                          itemCount: _categories.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 10),
                          itemBuilder: (context, index) {
                            final categoryMap = _categories[index];
                            final categoryName = categoryMap['name'] as String;
                            final isSelected = categoryName == _activeCategory;

                            return GestureDetector(
                              onTap: () => setState(
                                  () => _activeCategory = categoryName),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFF34C759)
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFF34C759)
                                        : const Color(0xFF34C759).withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      categoryMap['icon'] as IconData,
                                      size: 16,
                                      color: isSelected
                                          ? Colors.white
                                          : const Color(0xFF34C759),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      categoryName.tr(context),
                                      style: TextStyle(
                                        color: isSelected
                                            ? Colors.white
                                            : const Color(0xFF13231A),
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ).animate().fade(delay: 200.ms),

                      const SizedBox(height: 24),

                      // Step 6: Trending Sections (Only if search is empty)
                      if (_searchController.text.isEmpty)
                        ref.watch(medicineTrendingProvider).when(
                          data: (trends) => _TrendingSection(trends: trends),
                          loading: () => const SizedBox.shrink(),
                          error: (_, __) => const SizedBox.shrink(),
                        ),

                      // Featured Medicines List
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Text(
                          'featured'.tr(context),
                          style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF13231A)),
                        ),
                      ).animate().fade(delay: 300.ms),

                      const SizedBox(height: 16),

                      if (medicines.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.only(top: 40),
                            child: Text('No medicines match your search.'),
                          ),
                        )
                      else
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: GridView.builder(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                              childAspectRatio: 0.72,
                            ),
                            itemCount: medicines.length,
                            itemBuilder: (context, index) {
                              final med = medicines[index];
                              return GestureDetector(
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        MedicineDetailScreen(medicine: med),
                                  ),
                                ),
                                child: _GridMedicineCard(
                                  medicine: med,
                                ),
                              );
                            },
                          ),
                        ).animate().fade(delay: 400.ms).slideY(begin: 0.1),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      );
  }
}

class _UploadHeroBanner extends StatelessWidget {
  const _UploadHeroBanner({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 160,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: const LinearGradient(
              colors: [Color(0xFF5ED582), Color(0xFF3FBF66)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Stack(
              children: [
                // Inner frosted container
                Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                      child: Container(
                        width: double.infinity,
                        margin: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 10),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.4),
                              width: 1.5),
                        ),
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.document_scanner_outlined,
                                  color: Colors.white, size: 28),
                              const SizedBox(height: 4),
                              const Text(
                                'Upload & Order Easily',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 18, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Text('Upload Prescription',
                                    style: TextStyle(
                                        color: Color(0xFF13231A),
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold)),
                              )
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GridMedicineCard extends StatelessWidget {
  const _GridMedicineCard({required this.medicine});

  final Medicine medicine;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Center(
              child: Hero(
                tag: 'med_image_${medicine.id}',
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F5F2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.medication_liquid_rounded,
                      color: Color(0xFF86B095), size: 40),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            medicine.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 4),
          Text(
            '10 Tablets | Paracetamol',
            style: TextStyle(color: Colors.grey[600], fontSize: 10),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                NumberFormat.currency(symbol: '\$').format(medicine.price / 4),
                style: const TextStyle(
                    fontWeight: FontWeight.w800, fontSize: 14),
              ),
              Row(
                children: [
                  const Icon(Icons.star, color: Colors.orange, size: 12),
                  const SizedBox(width: 2),
                  const Text('4.8',
                      style:
                          TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF34C759),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 14),
                  )
                ],
              )
            ],
          )
        ],
      ),
    );
  }
}

class _ScheduleFullScreenTab extends StatelessWidget {
  final List<TrackedMedication> medications;
  final Function(String) onToggle;

  const _ScheduleFullScreenTab({
    required this.medications,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final takenToday = medications.where((m) => m.isTakenToday).length;
    final progress = medications.isEmpty ? 0.0 : takenToday / medications.length;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFE8F5E9), Colors.white],
          stops: [0.0, 0.3],
        ),
      ),
      child: Column(
        children: [
          // HEADER AREA
          Container(
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Medication',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF13231A),
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          'Schedule',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF34C759),
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                    _CircularProgressWidget(progress: progress, takenCount: takenToday, totalCount: medications.length),
                  ],
                ),
                const SizedBox(height: 24),

                // DATE PICKER CHIPS (MOCK)
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: List.generate(7, (index) {
                      final day = DateTime.now().add(Duration(days: index - 3));
                      final isToday = index == 3;
                      return Container(
                        margin: const EdgeInsets.only(right: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: isToday ? const Color(0xFF34C759) : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            if (isToday)
                              BoxShadow(
                                color: const Color(0xFF34C759).withValues(alpha: 0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Text(
                              DateFormat('E').format(day),
                              style: TextStyle(
                                color: isToday ? Colors.white : Colors.grey[400],
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              day.day.toString(),
                              style: TextStyle(
                                color: isToday ? Colors.white : const Color(0xFF13231A),
                                fontWeight: FontWeight.w900,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),

          // LIST AREA
          Expanded(
            child: medications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.medication_liquid_rounded, size: 80, color: Colors.grey[200]),
                        const SizedBox(height: 16),
                        Text('No medications scheduled', style: TextStyle(color: Colors.grey[500], fontSize: 16)),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                    itemCount: medications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final med = medications[index];
                      return _ScheduleListItem(
                        medication: med,
                        onToggle: () => onToggle(med.id),
                      ).animate().fade(delay: (index * 100).ms).slideX(begin: 0.1);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _CircularProgressWidget extends StatelessWidget {
  final double progress;
  final int takenCount;
  final int totalCount;

  const _CircularProgressWidget({
    required this.progress,
    required this.takenCount,
    required this.totalCount,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          width: 70,
          height: 70,
          child: CircularProgressIndicator(
            value: progress,
            backgroundColor: Colors.white,
            color: const Color(0xFF34C759),
            strokeWidth: 8,
            strokeCap: StrokeCap.round,
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$takenCount/$totalCount',
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 14,
                color: Color(0xFF13231A),
              ),
            ),
            Text(
              'Done',
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ScheduleListItem extends StatelessWidget {
  final TrackedMedication medication;
  final VoidCallback onToggle;

  const _ScheduleListItem({
    required this.medication,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final timeString = medication.scheduleTime.format(context);
    final isTaken = medication.isTakenToday;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isTaken ? const Color(0xFF34C759) : Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: isTaken 
                ? const Color(0xFF34C759).withValues(alpha: 0.2)
                : Colors.black.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isTaken ? Colors.white.withValues(alpha: 0.2) : const Color(0xFFF1F8F4),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(
              isTaken ? Icons.check_rounded : Icons.medication_rounded,
              color: isTaken ? Colors.white : const Color(0xFF34C759),
              size: 28,
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  medication.name,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: isTaken ? Colors.white : const Color(0xFF13231A),
                  ),
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 12,
                  runSpacing: 4,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.access_time_rounded,
                          size: 14,
                          color: isTaken ? Colors.white.withValues(alpha: 0.7) : Colors.grey[500],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          timeString,
                          style: TextStyle(
                            fontSize: 12,
                            color: isTaken ? Colors.white.withValues(alpha: 0.7) : Colors.grey[500],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.info_outline_rounded,
                          size: 14,
                          color: isTaken ? Colors.white.withValues(alpha: 0.7) : Colors.grey[500],
                        ),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            medication.dosage,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              color: isTaken ? Colors.white.withValues(alpha: 0.7) : Colors.grey[500],
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: onToggle,
            child: Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                color: isTaken ? Colors.white : const Color(0xFF34C759),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isTaken ? Icons.undo_rounded : Icons.add_rounded,
                color: isTaken ? const Color(0xFF34C759) : Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrdersTabContent extends ConsumerWidget {
  final AsyncValue<List<Reservation>> reservations;
  final VoidCallback onRefresh;

  const _OrdersTabContent({super.key, required this.reservations, required this.onRefresh});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.lock_person_outlined, size: 80, color: Colors.grey[200]),
              const SizedBox(height: 24),
              const Text(
                'Sign in to see your orders',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF13231A)),
              ),
              const SizedBox(height: 12),
              Text(
                'Keep track of your medicine reservations and pickup times conveniently.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF34C759),
                  padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Login / Register', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      color: const Color(0xFFF8FAF9),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'My Orders',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF13231A)),
                ),
                IconButton(
                  onPressed: onRefresh,
                  icon: const Icon(Icons.refresh_rounded, color: Color(0xFF34C759)),
                ),
              ],
            ),
          ),
          Expanded(
            child: reservations.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Error: $err')),
              data: (list) {
                if (list.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.receipt_long_outlined, size: 80, color: Colors.grey[200]),
                        const SizedBox(height: 16),
                        Text('No active reservations', style: TextStyle(color: Colors.grey[500])),
                      ],
                    ),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(24),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    return _OrderListItem(reservation: list[index]);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderListItem extends StatefulWidget {
  final Reservation reservation;
  const _OrderListItem({required this.reservation});

  @override
  State<_OrderListItem> createState() => _OrderListItemState();
}

class _OrderListItemState extends State<_OrderListItem> {
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String _formatDuration(Duration d) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String minutes = twoDigits(d.inMinutes.remainder(60));
    String seconds = twoDigits(d.inSeconds.remainder(60));
    return "$minutes:$seconds";
  }

  @override
  Widget build(BuildContext context) {
    final res = widget.reservation;
    final remaining = res.remainingTime;
    final isExpired = res.isExpired;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF13231A).withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Stack(
          children: [
            // Subtle side accent
            Positioned(
              left: 0,
              top: 0,
              bottom: 0,
              width: 6,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: isExpired 
                      ? [Colors.red[300]!, Colors.red[100]!]
                      : [const Color(0xFF34C759), const Color(0xFFBDFC70)],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          res.medicineName,
                          style: const TextStyle(
                            fontSize: 20, 
                            fontWeight: FontWeight.w900, 
                            color: Color(0xFF13231A),
                            letterSpacing: -0.5
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isExpired ? Colors.red[50] : const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isExpired ? Colors.red[100]! : const Color(0xFF34C759).withValues(alpha: 0.2),
                          )
                        ),
                        child: Text(
                          isExpired ? 'EXPIRED' : 'ACTIVE',
                          style: TextStyle(
                            fontSize: 10, 
                            letterSpacing: 1,
                            fontWeight: FontWeight.w900,
                            color: isExpired ? Colors.red : const Color(0xFF13231A)
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.storefront_rounded, size: 14, color: Colors.grey[400]),
                      const SizedBox(width: 6),
                      Text(
                        res.pharmacyName, 
                        style: TextStyle(
                          color: Colors.grey[600], 
                          fontSize: 14,
                          fontWeight: FontWeight.w500
                        )
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          _buildMiniInfo('Quantity', '${res.quantity}x'),
                          const SizedBox(width: 24),
                          _buildMiniInfo('Price', '${res.price.toStringAsFixed(0)} ETB'),
                        ],
                      ),
                      if (!isExpired)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF13231A), Color(0xFF2D3E33)],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF13231A).withValues(alpha: 0.2),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.av_timer_rounded, color: Color(0xFFBDFC70), size: 18),
                              const SizedBox(width: 8),
                              Text(
                                _formatDuration(remaining),
                                style: const TextStyle(
                                  color: Colors.white, 
                                  fontWeight: FontWeight.w800, 
                                  fontSize: 15,
                                  fontFeatures: [FontFeature.tabularFigures()],
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniInfo(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(), 
          style: TextStyle(color: Colors.grey[400], fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)
        ),
        const SizedBox(height: 2),
        Text(
          value, 
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF13231A))
        ),
      ],
    );
  }
}

class _TrendingSection extends StatelessWidget {
  final Map<String, dynamic>? trends;
  const _TrendingSection({required this.trends});

  @override
  Widget build(BuildContext context) {
    if (trends == null) return const SizedBox.shrink();

    final global = (trends!['global_trending'] as List? ?? []);
    final recent = (trends!['user_recent'] as List? ?? []);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (global.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'trending'.tr(context),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF13231A)),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 100,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              scrollDirection: Axis.horizontal,
              itemCount: global.length,
              itemBuilder: (context, index) => _TrendingItem(name: global[index].toString(), isHot: true),
            ),
          ),
          const SizedBox(height: 24),
        ],
        if (recent.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'recent'.tr(context),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF13231A)),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 100,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              scrollDirection: Axis.horizontal,
              itemCount: recent.length,
              itemBuilder: (context, index) => _TrendingItem(name: recent[index].toString(), isHot: false),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ],
    );
  }
}

class _TrendingItem extends StatelessWidget {
  final String name;
  final bool isHot;
  const _TrendingItem({required this.name, required this.isHot});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isHot ? const Color(0xFF13231A) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isHot ? Icons.trending_up : Icons.history,
            color: isHot ? const Color(0xFFBDFC70) : const Color(0xFF34C759),
            size: 20,
          ),
          const SizedBox(height: 8),
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 14,
              color: isHot ? Colors.white : const Color(0xFF13231A),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileView extends ConsumerWidget {
  const _ProfileView();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final displayName = authState.isAuthenticated ? authState.displayName : 'welcome_user'.tr(context);
    final email = authState.isAuthenticated ? (authState.email ?? '') : 'guest_session'.tr(context);

    final isAmharic = ref.watch(languageProvider).languageCode == 'am';

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.only(top: 80, bottom: 40),
          width: double.infinity,
          decoration: BoxDecoration(
            color: const Color(0xFF13231A),
            borderRadius: BorderRadius.zero,
          ),
          child: Column(
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: Colors.grey,
                backgroundImage: NetworkImage(
                    'https://ui-avatars.com/api/?name=$displayName&background=E8F5E9&color=13231A'),
              ),
              const SizedBox(height: 16),
              Text(
                displayName,
                style: TextStyle(
                  fontSize: isAmharic ? 20 : 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                email,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[400],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              if (authState.isAuthenticated) ...[
                _profileTile(Icons.person_outline, 'profile'.tr(context), () {}),
                _profileTile(Icons.history, 'recent'.tr(context), () {}),
              ] else ...[
                _profileTile(Icons.login, 'Login / Register', () {
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
                }),
              ],
              _profileTile(Icons.language, 'አማ/EN', () {
                final notifier = ref.read(languageProvider.notifier);
                notifier.setLanguage(notifier.isAmharic ? 'en' : 'am');
              }),
              const Divider(height: 40),
              if (authState.isAuthenticated)
                _profileTile(Icons.logout, 'Logout', () {
                  ref.read(authProvider.notifier).logout();
                }, isDestructive: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _profileTile(IconData icon, String title, VoidCallback onTap, {bool isDestructive = false}) {
    return ListTile(
      leading: Icon(icon, color: isDestructive ? Colors.red : const Color(0xFF13231A)),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: isDestructive ? Colors.red : const Color(0xFF13231A),
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
      onTap: onTap,
    );
  }
}
