import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../models/medicine.dart';
import '../services/api_service.dart';
import '../data/mock_medicine_catalog.dart';

class MedicineSearchNotifier extends StateNotifier<AsyncValue<List<Medicine>>> {
  Timer? _debounceTimer;
  Position? _currentPosition;

  MedicineSearchNotifier() : super(const AsyncValue.loading()) {
    _initLocationAndSearch();
  }

  Future<void> _initLocationAndSearch() async {
    try {
      // Try to get location silently for initial sorting
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        _currentPosition = await Geolocator.getCurrentPosition();
      }
    } catch (_) {
      // Ignore location errors here, just proceed with search
    }
    search(''); 
  }

  void onSearchChanged(String query) {
    // Disabled as per manual search requirement
  }

  Future<void> search(String query, {double? lat, double? lng}) async {
    state = const AsyncValue.loading();
    try {
      final targetLat = lat ?? _currentPosition?.latitude;
      final targetLng = lng ?? _currentPosition?.longitude;

      final jsonList = await ApiService().fetchInventory(
        query: query,
        lat: targetLat,
        lng: targetLng,
      );
      
      final medicines = jsonList.map((json) => Medicine.fromJson(json)).toList();
      state = AsyncValue.data(medicines);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  void updateLocation(Position position) {
    _currentPosition = position;
    // Optionally re-search with new location if search bar isn't empty
    if (state.hasValue) {
      // Re-trigger search with current query to update distance sorting
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

final medicineSearchProvider =
    StateNotifierProvider.autoDispose<
      MedicineSearchNotifier,
      AsyncValue<List<Medicine>>
    >((ref) {
      return MedicineSearchNotifier();
    });

final medicineTrendingProvider = FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  return await ApiService().fetchTrending();
});
