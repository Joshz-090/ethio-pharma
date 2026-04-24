import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/medicine_search_provider.dart';
import '../models/medicine.dart';

class PharmacyMapScreen extends ConsumerStatefulWidget {
  final Medicine? medicine;

  const PharmacyMapScreen({super.key, this.medicine});

  @override
  ConsumerState<PharmacyMapScreen> createState() => _PharmacyMapScreenState();
}

class _PharmacyMapScreenState extends ConsumerState<PharmacyMapScreen> {
  LatLng? _userLocation;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _getUserLocation();
  }

  Future<void> _getUserLocation() async {
    try {
      Position position = await Geolocator.getCurrentPosition();
      setState(() {
        _userLocation = LatLng(position.latitude, position.longitude);
      });
      // If no medicine specified, center on user
      if (widget.medicine == null) {
        _mapController.move(_userLocation!, 14);
      }
    } catch (e) {
      debugPrint('Error getting location for map: $e');
    }
  }

  LatLng get _centerLocation {
    if (widget.medicine?.pharmacyLatitude != null && widget.medicine?.pharmacyLongitude != null) {
      return LatLng(widget.medicine!.pharmacyLatitude!, widget.medicine!.pharmacyLongitude!);
    }
    if (_userLocation != null) return _userLocation!;
    return const LatLng(6.0333, 37.55); // Arba Minch fallback
  }

  @override
  Widget build(BuildContext context) {
    final allMedsAsync = ref.watch(allMedicinesProvider);
    final otherMeds = allMedsAsync.when(
      data: (list) => list.where((m) => m.id != widget.medicine?.id && m.pharmacyLatitude != null).toList(),
      loading: () => <Medicine>[],
      error: (_, __) => <Medicine>[],
    );

    final markers = <Marker>[
      // Selected Pharmacy Marker (if any)
      if (widget.medicine != null)
        Marker(
          point: _centerLocation,
          width: 100,
          height: 100,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF13231A),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10)],
                ),
                child: const Text('Target', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              const Icon(Icons.location_on_rounded, size: 48, color: Color(0xFF34C759)),
            ],
          ),
        ),

      // Other Pharmacies
      ...otherMeds
          .map((m) => Marker(
                point: LatLng(m.pharmacyLatitude!, m.pharmacyLongitude!),
                width: 50,
                height: 50,
                child: GestureDetector(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m.pharmacyName)));
                  },
                  child: const Icon(Icons.local_pharmacy_rounded, color: Color(0xFF24443A), size: 30),
                ),
              )),

      // User Location Marker
      if (_userLocation != null)
        Marker(
          point: _userLocation!,
          width: 60,
          height: 60,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: const Center(
              child: Icon(Icons.my_location_rounded, color: Colors.blue, size: 24),
            ),
          ),
        ),
    ];

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('MedLink Map', style: TextStyle(fontWeight: FontWeight.w900)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            onPressed: () => Navigator.pop(context),
            color: const Color(0xFF13231A),
          ),
        ),
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _centerLocation,
              initialZoom: 14,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.medlink.patient',
              ),
              MarkerLayer(markers: markers),
            ],
          ),

          // Bottom Info Card
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.location_city_rounded, color: Color(0xFF34C759)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.medicine?.pharmacyName ?? 'Nearby Pharmacies',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF13231A)),
                            ),
                            Text(
                              widget.medicine?.pharmacyAddress ?? 'Showing all pharmacies in your area',
                              style: const TextStyle(color: Colors.grey, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      _mapController.move(_centerLocation, 16);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF13231A),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 54),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      elevation: 0,
                    ),
                    child: const Text('Re-center', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
