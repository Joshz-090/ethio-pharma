import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../models/medicine.dart';
import '../providers/auth_provider.dart';
import '../providers/reservation_provider.dart';
import '../providers/medicine_search_provider.dart';
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
                    Opacity(
                      opacity: 0.1,
                      child: Transform.scale(
                        scale: 2,
                        child: const Icon(Icons.medication_liquid_rounded, size: 300, color: Color(0xFF34C759)),
                      ),
                    ),
                    Transform.rotate(
                      angle: -0.1,
                      child: Container(
                        padding: const EdgeInsets.all(40),
                        decoration: BoxDecoration(
                          color: const Color(0xFFBDFC70),
                          borderRadius: BorderRadius.circular(40),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
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
                    color: Colors.white.withOpacity(0.7),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(40)),
                    border: Border.all(color: Colors.white.withOpacity(0.5), width: 1.5),
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
                                  () {
                                    final parts = <String>[
                                      if (widget.medicine.brand?.isNotEmpty == true) widget.medicine.brand!,
                                      if (widget.medicine.strength?.isNotEmpty == true) widget.medicine.strength!,
                                    ];
                                    if (parts.isNotEmpty) return parts.join(' · ');
                                    if (widget.medicine.category?.isNotEmpty == true) return widget.medicine.category!;
                                    return widget.medicine.pharmacyName;
                                  }(),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.5),
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
                                  '${(widget.medicine.price * _quantity).toStringAsFixed(0)} ETB',
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

                                  final success = await ref.read(reservationProvider.notifier).reserveForOneHour(
                                    widget.medicine.id, 
                                    _quantity,
                                    pharmacyId: widget.medicine.pharmacyId,
                                  );

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
              color: Colors.white.withOpacity(0.3),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withOpacity(0.3)),
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
          color: isSelected ? Colors.white.withOpacity(0.5) : Colors.transparent,
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

  static void _showReviewDialog(BuildContext context, WidgetRef ref, Medicine medicine) {
    if (!ref.read(authProvider).isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to write a review')),
      );
      return;
    }

    int selectedRating = 5;
    final commentController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Write a Review', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) => IconButton(
                  onPressed: () => setDialogState(() => selectedRating = index + 1),
                  icon: Icon(
                    index < selectedRating ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: Colors.amber,
                    size: 32,
                  ),
                )),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: commentController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Share your experience...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  filled: true,
                  fillColor: Colors.grey[50]
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                final success = await ApiService().addReview(
                  medicineId: medicine.medicineModelId,
                  pharmacyId: medicine.pharmacyId,
                  rating: selectedRating,
                  comment: commentController.text,
                );
                if (context.mounted) {
                  Navigator.pop(context);
                  if (success) {
                    ref.invalidate(allMedicinesProvider);
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(success ? 'Review submitted! Refreshing...' : 'Failed to submit review'),
                      backgroundColor: success ? const Color(0xFF34C759) : Colors.red,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFBDFC70),
                foregroundColor: const Color(0xFF13231A),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Submit'),
            ),
          ],
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
    final hasDescription = medicine.description != null && medicine.description!.isNotEmpty;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (medicine.brand != null && medicine.brand!.isNotEmpty)
                _InfoChip(label: 'Brand', value: medicine.brand!),
              if (medicine.strength != null && medicine.strength!.isNotEmpty)
                _InfoChip(label: 'Strength', value: medicine.strength!),
              if (medicine.category != null && medicine.category!.isNotEmpty)
                _InfoChip(label: 'Category', value: medicine.category!),
              if (medicine.expiryDate != null)
                _InfoChip(label: 'Expires', value: medicine.expiryDate!, isWarning: true),
              if (medicine.distanceKm != null)
                _InfoChip(label: 'Distance', value: '${medicine.distanceKm!.toStringAsFixed(1)} km'),
              _InfoChip(label: 'Rx', value: medicine.requiresPrescription ? 'Required' : 'Not required'),
              _InfoChip(label: 'In Stock', value: medicine.stock.toString()),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            'product_summary'.tr(context),
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF13231A)),
          ),
          const SizedBox(height: 8),
          Text(
            hasDescription
                ? medicine.description!
                : 'No description available for ${medicine.name}.',
            style: TextStyle(fontSize: 14, color: Colors.grey[700], height: 1.6),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final String value;
  final bool isWarning;
  const _InfoChip({required this.label, required this.value, this.isWarning = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isWarning
            ? const Color(0xFFFF6B6B).withOpacity(0.08)
            : const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isWarning
              ? const Color(0xFFFF6B6B).withOpacity(0.3)
              : const Color(0xFF34C759).withOpacity(0.3),
        ),
      ),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(fontSize: 11),
          children: [
            TextSpan(
              text: '$label: ',
              style: TextStyle(
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
            TextSpan(
              text: value,
              style: TextStyle(
                color: isWarning ? const Color(0xFFFF6B6B) : const Color(0xFF13231A),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReviewBody extends ConsumerWidget {
  final Medicine medicine;
  const _ReviewBody({required this.medicine});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
              Row(
                children: [
                  Text(
                    '${reviews.length} reviews',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => _MedicineDetailScreenState._showReviewDialog(context, ref, medicine),
                    icon: const Icon(Icons.add_comment_rounded, color: Color(0xFF34C759), size: 20),
                    visualDensity: VisualDensity.compact,
                  ),
                ],
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
    final name = review['user_name'] ?? 'Anonymous';
    final initials = name.split(' ').map((e) => e[0].toUpperCase()).take(2).join();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: const Color(0xFF34C759).withOpacity(0.1),
                child: Text(
                  initials,
                  style: const TextStyle(
                    color: Color(0xFF34C759),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF13231A)),
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
              ),
              if (review['created_at'] != null)
                Text(
                  DateFormat('MMM d').format(DateTime.parse(review['created_at'])),
                  style: TextStyle(fontSize: 10, color: Colors.grey[400]),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            review['comment'] ?? 'No comment provided.',
            style: TextStyle(fontSize: 13, color: Colors.grey[700], height: 1.4),
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
              color: const Color(0xFFBDFC70).withOpacity(0.2),
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
