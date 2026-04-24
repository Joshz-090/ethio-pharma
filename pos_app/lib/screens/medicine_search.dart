import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:image_picker/image_picker.dart';

import '../models/medicine.dart';
import '../models/reservation.dart';
import '../providers/medicine_search_provider.dart';
import '../providers/reservation_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../services/api_service.dart';
import 'medicine_detail.dart';
import 'pharmacy_map_screen.dart';
import 'login_screen.dart';
import 'schedule_screen.dart';

class MedicineSearchScreen extends ConsumerStatefulWidget {
  const MedicineSearchScreen({super.key});

  @override
  ConsumerState<MedicineSearchScreen> createState() =>
      _MedicineSearchScreenState();
}

class _MedicineSearchScreenState extends ConsumerState<MedicineSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(allMedicinesProvider.notifier).refresh();
    });
  }

  void _performManualSearch() {
    final query = _searchController.text.trim();
    ref.read(searchQueryProvider.notifier).state = query;
  }

  void _onFindNearbyPharmacyTap() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PharmacyMapScreen()),
    );
  }

  void _showPrescriptionOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_rounded, color: Color(0xFF34C759)),
              title: const Text('Take a photo', style: TextStyle(fontWeight: FontWeight.bold)),
              onTap: () async {
                Navigator.pop(context);
                final ImagePicker picker = ImagePicker();
                final XFile? image = await picker.pickImage(source: ImageSource.camera);
                if (image != null) {
                  _processPrescription(image.path);
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_rounded, color: Color(0xFF34C759)),
              title: const Text('Choose from gallery', style: TextStyle(fontWeight: FontWeight.bold)),
              onTap: () async {
                Navigator.pop(context);
                final ImagePicker picker = ImagePicker();
                final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                if (image != null) {
                  _processPrescription(image.path);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _processPrescription(String path) async {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Processing prescription...')));
    final result = await ApiService().scanPrescription(path);
    if (result != null && result['medicines'] != null) {
      final meds = (result['medicines'] as List).join(', ');
      final firstMed = (result['medicines'] as List).first.toString();
      _searchController.text = firstMed;
      ref.read(searchQueryProvider.notifier).state = firstMed;
      
      if (mounted) {
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF34C759),
        unselectedItemColor: Colors.grey[400],
        showSelectedLabels: true,
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.search_rounded), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today_rounded), label: 'Schedule'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long_rounded), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
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
        return const ScheduleScreen();
      case 2:
        return _OrdersTabContent(
          reservations: ref.watch(reservationProvider),
          onRefresh: () => ref.read(reservationProvider.notifier).refresh(),
        );
      case 3:
        return const _ProfileView();
      default:
        return _buildHome();
    }
  }

  Widget _buildHome() {
    final authState = ref.watch(authProvider);
    final greeting = authState.isAuthenticated 
            ? 'Hello, ${authState.firstName ?? 'User'} 👋'
            : 'Welcome User';

    return Column(
      children: [
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
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF13231A),
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
                      const Icon(Icons.notifications_none_rounded, size: 30),
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
                            color: Colors.black.withOpacity(0.05),
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
                              decoration: const InputDecoration(
                                hintText: 'Search medicine...',
                                hintStyle: TextStyle(color: Color(0xFFA5B2A9), fontSize: 16),
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.search_rounded, color: Color(0xFF34C759)),
                            onPressed: _performManualSearch,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _showPrescriptionOptions,
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
                      'Find Nearby Pharmacy',
                      style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                  ],
                ),
              )
            ],
          ),
        ).animate().fade().slideY(begin: -0.1),

        Expanded(
          child: ref.watch(medicineSearchProvider).when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => Center(child: Text(error.toString())),
            data: (medicines) {
              final categories = ref.watch(categoriesProvider);
              final activeCat = ref.watch(activeCategoryProvider);

              return SingleChildScrollView(
                padding: const EdgeInsets.only(bottom: 40),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _UploadHeroBanner(onTap: _showPrescriptionOptions)
                        .animate()
                        .fade(delay: 100.ms)
                        .slideX(begin: 0.05),

                    Padding(
                      padding: const EdgeInsets.only(left: 24, right: 24, bottom: 8),
                      child: Text(
                        '${medicines.length} medicines found',
                        style: TextStyle(color: Colors.grey[500], fontSize: 11),
                      ),
                    ),

                    SizedBox(
                      height: 40,
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        scrollDirection: Axis.horizontal,
                        itemCount: categories.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (context, index) {
                          final catName = categories[index];
                          final isSelected = activeCat == catName;
                          return GestureDetector(
                            onTap: () => ref.read(activeCategoryProvider.notifier).state = catName,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF34C759) : Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF34C759).withOpacity(0.3)),
                              ),
                              child: Center(
                                child: Text(
                                  catName,
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : const Color(0xFF13231A),
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 24),

                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        'Featured Medicines',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF13231A)),
                      ),
                    ),

                    const SizedBox(height: 16),

                    if (medicines.isEmpty)
                      const Center(child: Padding(padding: EdgeInsets.only(top: 40), child: Text('No medicines match your search.')))
                    else
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: GridView.builder(
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
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
                                MaterialPageRoute(builder: (context) => MedicineDetailScreen(medicine: med)),
                              ),
                              child: _GridMedicineCard(medicine: med),
                            );
                          },
                        ),
                      ),
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
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 140,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: const LinearGradient(colors: [Color(0xFF5ED582), Color(0xFF3FBF66)]),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.document_scanner_outlined, color: Colors.white, size: 32),
                const SizedBox(height: 8),
                const Text('Upload Prescription', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('Get AI-powered medicine matches', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12)),
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
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 8))],
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
                  width: 80, height: 80,
                  decoration: BoxDecoration(color: const Color(0xFFF0F5F2), borderRadius: BorderRadius.circular(16)),
                  child: const Icon(Icons.medication_liquid_rounded, color: Color(0xFF86B095), size: 40),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(medicine.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          Text(medicine.pharmacyName, style: const TextStyle(color: Color(0xFF34C759), fontSize: 11, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${medicine.price.toStringAsFixed(0)} ETB', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
              if (medicine.distanceKm != null)
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 10, color: Colors.grey),
                    const SizedBox(width: 2),
                    Text('${medicine.distanceKm!.toStringAsFixed(1)} km', style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _OrdersTabContent extends ConsumerWidget {
  final AsyncValue<List<Reservation>> reservations;
  final VoidCallback onRefresh;
  const _OrdersTabContent({required this.reservations, required this.onRefresh});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      color: const Color(0xFFF8FAF9),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 20),
            decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(bottom: Radius.circular(32))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('My Orders', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF13231A))),
                IconButton(onPressed: onRefresh, icon: const Icon(Icons.refresh_rounded, color: Color(0xFF34C759))),
              ],
            ),
          ),
          Expanded(
            child: reservations.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Error: $err')),
              data: (list) {
                if (list.isEmpty) return const Center(child: Text('No active reservations'));
                return ListView.separated(
                  padding: const EdgeInsets.all(24),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) => _OrderListItem(reservation: list[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderListItem extends StatelessWidget {
  final Reservation reservation;
  const _OrderListItem({required this.reservation});

  @override
  Widget build(BuildContext context) {
    final isExpired = reservation.isExpired;
    final statusColor = isExpired ? Colors.red : (reservation.status == 'fulfilled' ? const Color(0xFF34C759) : Colors.orange);
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F5F2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF34C759)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reservation.medicineName,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF13231A)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      reservation.pharmacyName,
                      style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isExpired ? 'EXPIRED' : reservation.status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Cost', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    '${(reservation.price * reservation.quantity).toStringAsFixed(0)} ETB',
                    style: const TextStyle(color: Color(0xFF34C759), fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Quantity', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    '${reservation.quantity}x',
                    style: const TextStyle(color: Color(0xFF13231A), fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ],
              ),
            ],
          ),
          if (!isExpired && reservation.status == 'pending') ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.access_time_rounded, color: Colors.orange, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    'Expires in: ${reservation.remainingTime.inMinutes} mins',
                    style: const TextStyle(color: Colors.orange, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ]
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
    final displayName = authState.isAuthenticated ? authState.displayName : 'Guest User';
    // Optionally fetch email or phone if available in authState. 
    // Here we just use a generic subtitle for visual flair.
    final subtitle = authState.isAuthenticated ? 'Verified Patient' : 'Log in to manage your health';

    return Container(
      color: const Color(0xFFF8FAF9),
      child: Column(
        children: [
          // Elegant Header with curve
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 80, bottom: 40, left: 24, right: 24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF13231A), Color(0xFF1B3024)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(40)),
            ),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    CircleAvatar(
                      radius: 56,
                      backgroundColor: Colors.white.withOpacity(0.1),
                      child: CircleAvatar(
                        radius: 52,
                        backgroundColor: const Color(0xFFE8F5E9),
                        backgroundImage: NetworkImage('https://ui-avatars.com/api/?name=${Uri.encodeComponent(displayName)}&background=E8F5E9&color=13231A&size=200'),
                      ),
                    ),
                    if (authState.isAuthenticated)
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF34C759),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF1B3024), width: 3),
                        ),
                        child: const Icon(Icons.check_rounded, color: Colors.white, size: 14),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  displayName,
                  style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.7), fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                children: [
                  // Menu Items
                  _buildMenuItem(Icons.person_outline_rounded, 'Personal Information', onTap: () {}),
                  _buildMenuItem(Icons.medical_information_outlined, 'My Prescriptions', onTap: () {}),
                  _buildMenuItem(Icons.notifications_none_rounded, 'Notification Settings', onTap: () {}),
                  _buildMenuItem(Icons.help_outline_rounded, 'Help & Support', onTap: () {}),
                  
                  const SizedBox(height: 32),
                  const Divider(height: 1, color: Color(0xFFE8F5E9)),
                  const SizedBox(height: 32),
                  
                  // Auth Buttons
                  if (!authState.isAuthenticated)
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const LoginScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF34C759),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        minimumSize: const Size(double.infinity, 56),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: const Text('Login / Register', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    )
                  else
                    ElevatedButton.icon(
                      onPressed: () {
                        ref.read(authProvider.notifier).logout();
                      },
                      icon: const Icon(Icons.logout_rounded, size: 20),
                      label: const Text('Logout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF6B6B).withOpacity(0.1),
                        foregroundColor: const Color(0xFFFF6B6B),
                        elevation: 0,
                        minimumSize: const Size(double.infinity, 56),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, {required VoidCallback onTap}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F5F2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: const Color(0xFF13231A), size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF13231A)),
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Colors.grey, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
