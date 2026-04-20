import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/medicine.dart';
import '../models/tracked_medication.dart';
import '../providers/medication_tracker_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/reservation_provider.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import '../providers/language_provider.dart';

class MedicineDetailScreen extends ConsumerStatefulWidget {
  final Medicine medicine;

  const MedicineDetailScreen({super.key, required this.medicine});

  @override
  ConsumerState<MedicineDetailScreen> createState() => _MedicineDetailScreenState();
}

class _MedicineDetailScreenState extends ConsumerState<MedicineDetailScreen> {
  int _quantity = 1;
  String _activeTab = 'description';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F5F2),
      body: Stack(
        children: [
          // 1. Background Image / Hero Area
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: MediaQuery.of(context).size.height * 0.55,
            child: Hero(
              tag: 'med_image_${widget.medicine.id}',
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFE8F5E9), Color(0xFFF0F5F2)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Subtle background pattern
                    Opacity(
                      opacity: 0.1,
                      child: Transform.scale(
                        scale: 2,
                        child: const Icon(Icons.medication_liquid_rounded, size: 300, color: Color(0xFF34C759)),
                      ),
                    ),
                    // Main Medicine Image (Simulated with Icon for now as per image style)
                    Transform.rotate(
                      angle: -0.1,
                      child: Container(
                        padding: const EdgeInsets.all(40),
                        decoration: BoxDecoration(
                          color: const Color(0xFFBDFC70),
                          borderRadius: BorderRadius.circular(40),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 30,
                              offset: const Offset(0, 20),
                            ),
                          ],
                        ),
                        child: FittedBox(
                          fit: BoxFit.contain,
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.add_moderator, size: 80, color: Color(0xFF13231A)),
                                const SizedBox(height: 12),
                                Text(
                                  widget.medicine.name,
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF13231A),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ).animate().scale(delay: 200.ms, duration: 600.ms, curve: Curves.easeOutBack).rotate(begin: 0.1, end: 0),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 2. Custom AppBar
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCircleButton(context, Icons.arrow_back_ios_new_rounded, () => Navigator.pop(context)),
                Text('details'.tr(context), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF13231A))),
                _buildCircleButton(context, Icons.more_vert_rounded, () {}),
              ],
            ),
          ),

          // 3. Frosted Details Card
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            height: MediaQuery.of(context).size.height * 0.52,
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(40)),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 25, sigmaY: 25),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(30, 40, 30, 30),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.7),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(40)),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 1.5),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.medicine.name,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF13231A),
                                    height: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'High Blood Pressure', // Category/Subtitle
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Quantity Selector
                          Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(30),
                            ),
                            child: Row(
                              children: [
                                _qtyBtn(Icons.add, () => setState(() => _quantity++)),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  child: Text('$_quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                ),
                                _qtyBtn(Icons.remove, () {
                                  if (_quantity > 1) setState(() => _quantity--);
                                }),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      
                      // Tabs
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _tab('description'),
                            _tab('review'),
                            _tab('instructions'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Tab Content
                      Expanded(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: _activeTab == 'description'
                            ? _DescriptionBody(medicine: widget.medicine)
                            : _activeTab == 'review'
                              ? _ReviewBody(medicine: widget.medicine)
                              : _InstructionsBody(medicine: widget.medicine),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Bottom Pricing Bar
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('total_cost'.tr(context), style: TextStyle(color: Colors.grey[600], fontSize: 11)),
                                const SizedBox(height: 2),
                                Text(
                                  NumberFormat.currency(symbol: '\$').format((widget.medicine.price / 4) * _quantity),
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF13231A)),
                                ),
                              ],
                            ),
                            const SizedBox(width: 20),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () async {
                                  if (!ref.read(authProvider).isAuthenticated) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('login_to_reserve'.tr(context))),
                                    );
                                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
                                    return;
                                  }

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('processing'.tr(context)), duration: const Duration(seconds: 1)),
                                  );

                                  final success = await ref.read(reservationProvider.notifier).reserveForOneHour(widget.medicine.id, _quantity);

                                  if (!mounted) return;

                                  if (success) {
                                    showDialog(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                        title: Text('success'.tr(context)),
                                        content: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF34C759), size: 64),
                                            const SizedBox(height: 16),
                                            Text('Reserved ${widget.medicine.name} successfully.'),
                                            const SizedBox(height: 8),
                                            Text('held_for'.tr(context)),
                                          ],
                                        ),
                                        actions: [
                                          TextButton(
                                            onPressed: () {
                                              Navigator.pop(context);
                                              Navigator.pop(context);
                                            },
                                            child: Text('ok'.tr(context)),
                                          ),
                                        ],
                                      ),
                                    );
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Reservation failed.'), backgroundColor: Colors.red),
                                    );
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFBDFC70),
                                  foregroundColor: const Color(0xFF13231A),
                                  elevation: 0,
                                  minimumSize: const Size(double.infinity, 44),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                ),
                                child: Text('reserve'.tr(context), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        ),
                      ).animate().slideY(begin: 0.2, delay: 500.ms).fadeIn(),
                    ],
                  ),
                ),
              ),
            ).animate().slideY(begin: 1.0, duration: 800.ms, curve: Curves.easeOutQuart),
          ),
        ],
      ),
    );
  }

  Widget _buildCircleButton(BuildContext context, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.3),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
            ),
            child: Icon(icon, size: 20, color: const Color(0xFF13231A)),
          ),
        ),
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
        child: Icon(icon, size: 16, color: const Color(0xFF13231A)),
      ),
    );
  }

  Widget _tab(String title) {
    final isSelected = _activeTab == title;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = title),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white.withValues(alpha: 0.5) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          title.tr(context),
          style: TextStyle(
            color: isSelected ? const Color(0xFF13231A) : Colors.grey[500],
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}

class _DescriptionBody extends StatelessWidget {
  final Medicine medicine;
  const _DescriptionBody({required this.medicine});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'product_summary'.tr(context),
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF13231A)),
          ),
          const SizedBox(height: 8),
          Text(
            'This medication is a highly effective treatment for ${medicine.name}. It works by targeting specific receptors to provide fast-acting relief while maintaining long-term stability.',
            style: TextStyle(fontSize: 14, color: Colors.grey[700], height: 1.6),
          ),
        ],
      ),
    );
  }
}

class _ReviewBody extends StatelessWidget {
  final Medicine medicine;
  const _ReviewBody({required this.medicine});

  @override
  Widget build(BuildContext context) {
    final reviews = medicine.reviews ?? [];
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Reviews',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF13231A)),
              ),
              Text(
                '${reviews.length} reviews',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (reviews.isEmpty)
             const Center(
               child: Padding(
                 padding: EdgeInsets.symmetric(vertical: 20),
                 child: Text('No reviews yet. Be the first!'),
               ),
             )
          else
            ...reviews.map((r) => _ReviewItem(review: r)),
        ],
      ),
    );
  }
}

class _ReviewItem extends StatelessWidget {
  final dynamic review;
  const _ReviewItem({required this.review});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                review['user_name'] ?? 'Anonymous',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              Row(
                children: List.generate(5, (i) => Icon(
                  Icons.star_rounded, 
                  size: 14, 
                  color: i < (review['rating'] ?? 5) ? Colors.amber : Colors.grey[200]
                )),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            review['comment'] ?? 'No comment provided.',
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}

class _InstructionsBody extends StatelessWidget {
  final Medicine medicine;
  const _InstructionsBody({required this.medicine});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Usage Instructions',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF13231A)),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFBDFC70).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFBDFC70)),
            ),
            child: Text(
              medicine.usageInstructions ?? 'Please consult with your pharmacist for specific dosage and administration instructions.',
              style: const TextStyle(fontSize: 13, height: 1.5, fontStyle: FontStyle.italic),
            ),
          ),
          const SizedBox(height: 20),
          _instructionStep(Icons.timer_outlined, 'Consistent Timing', 'Take at the same time every day.'),
          _instructionStep(Icons.water_drop_outlined, 'With Water', 'Take with a full glass of water.'),
        ],
      ),
    );
  }

  Widget _instructionStep(IconData icon, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF34C759), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(desc, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
