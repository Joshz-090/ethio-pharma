import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/mock_medicine_catalog.dart';
import '../models/medicine.dart';
import '../providers/reservation_provider.dart';
import 'pharmacy_map_screen.dart';

class ReservationScreen extends ConsumerStatefulWidget {
  const ReservationScreen({super.key, required this.medicine});

  final Medicine medicine;

  @override
  ConsumerState<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends ConsumerState<ReservationScreen> {
  int _quantity = 2;
  int _tabIndex = 0;
  bool _isSearchingNearby = false;
  bool _hasSearchedNearby = false;
  List<Medicine> _nearbyResults = const [];

  static const List<String> _tabs = ['Description', 'Review', 'How To Use'];

  List<Medicine> _nearbyPharmacies(Medicine current) {
    final nearby =
        mockMedicineCatalog
            .where((m) => m.pharmacyName != current.pharmacyName)
            .toList()
          ..sort(
            (a, b) => (a.distanceKm ?? 999).compareTo(b.distanceKm ?? 999),
          );

    return nearby.take(3).toList();
  }

  Future<void> _findNearbyAvailability(Medicine medicine) async {
    setState(() {
      _isSearchingNearby = true;
      _hasSearchedNearby = true;
      _nearbyResults = const [];
    });

    await Future<void>.delayed(const Duration(milliseconds: 900));

    final results = _nearbyPharmacies(
      medicine,
    ).where((item) => item.stock > 0).toList();

    if (!mounted) return;
    setState(() {
      _nearbyResults = results;
      _isSearchingNearby = false;
    });
  }

  void _openMap(Medicine medicine) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => PharmacyMapScreen(medicine: medicine)),
    );
  }

  Future<void> _startRoute(Medicine medicine) async {
    final destination =
        medicine.pharmacyLatitude != null && medicine.pharmacyLongitude != null
        ? '${medicine.pharmacyLatitude},${medicine.pharmacyLongitude}'
        : '${medicine.pharmacyName}, Arba Minch';

    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(destination)}&travelmode=driving',
    );

    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) &&
        mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not start navigation.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final reservationState = ref.watch(reservationProvider);
    final medicine = widget.medicine;

    // Removed the listener as it caused redirection loops and used the wrong data type.
    // We will now handle navigation directly in the Reserve button callback.

    return Scaffold(
      backgroundColor: const Color(0xFF9DC5CD),
      body: Stack(
        children: [
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF98C4CD), Color(0xFF7DB0B9)],
                ),
              ),
            ),
          ),
          Positioned(
            top: -30,
            right: -40,
            child: Container(
              width: 210,
              height: 210,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.18),
                shape: BoxShape.circle,
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.arrow_back_ios_new_rounded),
                      ),
                      const Expanded(
                        child: Center(
                          child: Text(
                            'Details',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.more_horiz_rounded),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Expanded(
                  child: Stack(
                    children: [
                      Align(
                        alignment: Alignment.topCenter,
                        child: Transform.rotate(
                          angle: -0.34,
                          child: Container(
                            width: 262,
                            height: 262,
                            decoration: BoxDecoration(
                              color: const Color(0xFF90EC25),
                              borderRadius: BorderRadius.circular(42),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(
                                    0xFF4D7513,
                                  ).withOpacity(0.36),
                                  blurRadius: 30,
                                  offset: const Offset(0, 18),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.medication_rounded,
                              size: 142,
                              color: Color(0xFF1C3612),
                            ),
                          ),
                        ),
                      ),
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(34),
                          ),
                          child: Container(
                            width: double.infinity,
                            margin: const EdgeInsets.only(top: 170),
                            padding: const EdgeInsets.fromLTRB(22, 22, 22, 18),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.66),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.35),
                              ),
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(34),
                              ),
                            ),
                            child: SingleChildScrollView(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          medicine.name,
                                          style: const TextStyle(
                                            fontSize: 42,
                                            height: 0.95,
                                            color: Color(0xFF202C27),
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.62),
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            _QuantityButton(
                                              icon: Icons.add,
                                              onTap: () => setState(
                                                () => _quantity += 1,
                                              ),
                                            ),
                                            Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 10,
                                                  ),
                                              child: Text(
                                                '$_quantity',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                  color: Color(0xFF28342E),
                                                ),
                                              ),
                                            ),
                                            _QuantityButton(
                                              icon: Icons.remove,
                                              onTap: () {
                                                if (_quantity > 1) {
                                                  setState(
                                                    () => _quantity -= 1,
                                                  );
                                                }
                                              },
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'High Blood Pressure',
                                    style: TextStyle(color: Color(0xFF6C7872)),
                                  ),
                                  const SizedBox(height: 14),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 5,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.42),
                                      borderRadius: BorderRadius.circular(18),
                                    ),
                                    child: Row(
                                      children: [
                                        for (int i = 0; i < _tabs.length; i++)
                                          Expanded(
                                            child: GestureDetector(
                                              onTap: () =>
                                                  setState(() => _tabIndex = i),
                                              child: AnimatedContainer(
                                                duration: const Duration(
                                                  milliseconds: 180,
                                                ),
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      vertical: 8,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: i == _tabIndex
                                                      ? Colors.white
                                                      : Colors.transparent,
                                                  borderRadius:
                                                      BorderRadius.circular(14),
                                                ),
                                                child: Text(
                                                  _tabs[i],
                                                  textAlign: TextAlign.center,
                                                  style: TextStyle(
                                                    color: i == _tabIndex
                                                        ? const Color(
                                                            0xFF2A322D,
                                                          )
                                                        : const Color(
                                                            0xFF6F7B75,
                                                          ),
                                                    fontWeight: FontWeight.w600,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  const Text(
                                    'A prescription medication belonging to a class of drugs called angiotensin II receptor blockers (ARBs). It works by relaxing and widening blood vessels.',
                                    style: TextStyle(
                                      color: Color(0xFF5D6863),
                                      fontSize: 15,
                                      height: 1.35,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton.icon(
                                          onPressed: () => _openMap(medicine),
                                          icon: const Icon(Icons.map_outlined),
                                          label: const Text('View Map'),
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: const Color(
                                              0xFF24443A,
                                            ),
                                            side: BorderSide(
                                              color: Colors.white.withOpacity(
                                                0.75,
                                              ),
                                            ),
                                            backgroundColor: Colors.white
                                                .withOpacity(0.45),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          onPressed: () =>
                                              _startRoute(medicine),
                                          icon: const Icon(
                                            Icons.navigation_rounded,
                                          ),
                                          label: const Text('Track Route'),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(
                                              0xFF1E3A30,
                                            ),
                                            foregroundColor: Colors.white,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  SizedBox(
                                    width: double.infinity,
                                    child: OutlinedButton.icon(
                                      onPressed: _isSearchingNearby
                                          ? null
                                          : () => _findNearbyAvailability(
                                              medicine,
                                            ),
                                      icon: _isSearchingNearby
                                          ? const SizedBox(
                                              width: 16,
                                              height: 16,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : const Icon(
                                              Icons.travel_explore_rounded,
                                            ),
                                      label: Text(
                                        _isSearchingNearby
                                            ? 'Searching nearby pharmacies...'
                                            : 'Find Nearby Availability',
                                      ),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: const Color(
                                          0xFF234238,
                                        ),
                                        side: BorderSide(
                                          color: Colors.white.withOpacity(0.75),
                                        ),
                                        backgroundColor: Colors.white
                                            .withOpacity(0.45),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  if (_hasSearchedNearby) ...[
                                    const SizedBox(height: 10),
                                    if (_nearbyResults.isEmpty)
                                      const Text(
                                        'No nearby pharmacy currently shows availability for this medicine.',
                                        style: TextStyle(
                                          color: Color(0xFF5D6963),
                                          fontSize: 12,
                                        ),
                                      )
                                    else
                                      SizedBox(
                                        height: 82,
                                        child: ListView.separated(
                                          scrollDirection: Axis.horizontal,
                                          itemCount: _nearbyResults.length,
                                          separatorBuilder: (_, __) =>
                                              const SizedBox(width: 10),
                                          itemBuilder: (context, index) {
                                            final pharmacy =
                                                _nearbyResults[index];
                                            return _NearbyPharmacyCard(
                                              pharmacy: pharmacy,
                                              onTrack: () =>
                                                  _startRoute(pharmacy),
                                            );
                                          },
                                        ),
                                      ),
                                  ],
                                  const SizedBox(height: 18),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Total Cost',
                                              style: TextStyle(
                                                color: Color(0xFF616D67),
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              NumberFormat.currency(
                                                symbol: '\$',
                                              ).format(
                                                (medicine.price * _quantity) /
                                                    4,
                                              ),
                                              style: const TextStyle(
                                                fontSize: 38,
                                                height: 1,
                                                color: Color(0xFF1F2A25),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        child: SizedBox(
                                          height: 56,
                                          child: ElevatedButton(
                                            onPressed:
                                                reservationState.isLoading
                                                ? null
                                                : () async {
                                                    final success = await ref
                                                        .read(
                                                          reservationProvider
                                                              .notifier,
                                                        )
                                                        .reserveForOneHour(
                                                          medicine.id,
                                                          _quantity,
                                                        );
                                                    
                                                    if (mounted && success) {
                                                      Navigator.of(context).pushReplacement(
                                                        MaterialPageRoute(
                                                          builder: (_) => ReservationConfirmationScreen(
                                                            medicine: medicine,
                                                            reservationCode: 'RES-${DateTime.now().millisecondsSinceEpoch % 10000}',
                                                          ),
                                                        ),
                                                      );
                                                    }
                                                  },
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(
                                                0xFF77E31B,
                                              ),
                                              foregroundColor: const Color(
                                                0xFF1C2A15,
                                              ),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(30),
                                              ),
                                              textStyle: const TextStyle(
                                                fontSize: 19,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                            child: reservationState.isLoading
                                                ? const SizedBox(
                                                    width: 22,
                                                    height: 22,
                                                    child:
                                                        CircularProgressIndicator(
                                                          strokeWidth: 2,
                                                        ),
                                                  )
                                                : const Text('Reserve Now'),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  const _QuantityButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 26,
        height: 26,
        decoration: const BoxDecoration(
          color: Color(0xFFEBF1EE),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 16, color: Color(0xFF4E5953)),
      ),
    );
  }
}

class _NearbyPharmacyCard extends StatelessWidget {
  const _NearbyPharmacyCard({required this.pharmacy, required this.onTrack});

  final Medicine pharmacy;
  final VoidCallback onTrack;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 196,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.48),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: const BoxDecoration(
              color: Color(0xFFDBF6CA),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.local_pharmacy_outlined,
              size: 18,
              color: Color(0xFF2A4A23),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  pharmacy.pharmacyName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                    color: Color(0xFF24342D),
                  ),
                ),
                Text(
                  '${pharmacy.distanceKm?.toStringAsFixed(1) ?? 'N/A'} km nearby',
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF5D6963),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onTrack,
            icon: const Icon(
              Icons.near_me_rounded,
              color: Color(0xFF1F392F),
              size: 19,
            ),
            tooltip: 'Track',
          ),
        ],
      ),
    );
  }
}

class ReservationConfirmationScreen extends StatelessWidget {
  const ReservationConfirmationScreen({
    super.key,
    required this.medicine,
    required this.reservationCode,
  });

  final Medicine medicine;
  final String reservationCode;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEEF4EC),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 430),
          child: Container(
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(26),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 74,
                  height: 74,
                  decoration: const BoxDecoration(
                    color: Color(0xFF77E31B),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_rounded,
                    size: 44,
                    color: Color(0xFF1D3413),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Reservation Confirmed',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 10),
                Text(
                  medicine.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  medicine.pharmacyName,
                  style: const TextStyle(color: Color(0xFF6E7973)),
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F7F2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    'Code: $reservationCode',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Your hold is active for 60 minutes.',
                  style: TextStyle(color: Color(0xFF68726D)),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () =>
                        Navigator.of(context).popUntil((r) => r.isFirst),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF77E31B),
                      foregroundColor: const Color(0xFF1A2B13),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                    ),
                    child: const Text('Back to Home'),
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
