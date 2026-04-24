import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../models/medicine.dart';
import '../services/api_service.dart';

// ---------------------------------------------------------------------------
// All-medicines provider: loads the FULL inventory once and caches it.
// Uses a simpler, faster initialization.
// ---------------------------------------------------------------------------
class AllMedicinesNotifier extends StateNotifier<AsyncValue<List<Medicine>>> {
  Position? _currentPosition;
  bool _isInitialized = false;

  AllMedicinesNotifier() : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    if (_isInitialized) return;
    _isInitialized = true;
    
    await ApiService().init();
    // Fast initial load without waiting for precise GPS
    await _loadAll();
  }

  Future<void> _loadAll({double? lat, double? lng}) async {
    // Only show loading if we have no data at all
    if (state.value == null) {
      state = const AsyncValue.loading();
    }
    
    try {
      // 1. Get Location first
      Position? currentPos = _currentPosition;
      if (lat == null && currentPos == null) {
        try {
          currentPos = await Geolocator.getLastKnownPosition();
        } catch (_) {}
      }
      if (currentPos != null && _currentPosition == null) {
        _currentPosition = currentPos;
      }
      
      final targetLat = lat ?? currentPos?.latitude;
      final targetLng = lng ?? currentPos?.longitude;

      // 2. Fetch from API WITH location to let backend compute distance
      final jsonList = await ApiService().fetchInventory(
        lat: targetLat,
        lng: targetLng,
      ) as List<dynamic>;

      final List<Medicine> medicines = jsonList
          .map((j) => Medicine.fromJson(j as Map<String, dynamic>))
          .toList();
      
      // 2. Fast sorting
      
      List<Medicine> processedMeds = medicines;
      if (targetLat != null && targetLng != null) {
        processedMeds = _applyDistanceCalculation(medicines, targetLat, targetLng);
      }
      
      state = AsyncValue.data(processedMeds);
      
      // 3. Background: Get precise location and re-sort without showing loader
      if (lat == null && _currentPosition == null) {
        _backgroundUpdateLocation();
      }

    } catch (e, st) {
      debugPrint('[AllMedicines] Load failed: $e');
      if (state.value == null) {
        state = AsyncValue.error(e, st);
      }
    }
  }

  Future<void> _backgroundUpdateLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.low, timeLimit: Duration(seconds: 5))
        );
        updateLocation(pos);
      }
    } catch (_) {}
  }

  List<Medicine> _applyDistanceCalculation(List<Medicine> medicines, double userLat, double userLng) {
    final updated = medicines.map((m) {
      if (m.pharmacyLatitude != null && m.pharmacyLongitude != null) {
        final distanceInMeters = Geolocator.distanceBetween(
          userLat, userLng, m.pharmacyLatitude!, m.pharmacyLongitude!
        );
        return m.copyWith(distanceKm: distanceInMeters / 1000);
      }
      return m;
    }).toList();

    updated.sort((a, b) => (a.distanceKm ?? 9999).compareTo(b.distanceKm ?? 9999));
    return updated;
  }

  void updateLocation(Position position) {
    _currentPosition = position;
    final currentData = state.value;
    if (currentData != null) {
      state = AsyncValue.data(_applyDistanceCalculation(currentData, position.latitude, position.longitude));
    }
  }

  Future<void> refresh({double? lat, double? lng}) => _loadAll(lat: lat, lng: lng);
}

final allMedicinesProvider =
    StateNotifierProvider<AllMedicinesNotifier, AsyncValue<List<Medicine>>>(
  (ref) => AllMedicinesNotifier(),
);

// ---------------------------------------------------------------------------
// Search query provider — simple string state the UI writes to.
// ---------------------------------------------------------------------------
final searchQueryProvider = StateProvider<String>((ref) => '');

// ---------------------------------------------------------------------------
// Active category provider — 'All' means no category filter.
// ---------------------------------------------------------------------------
final activeCategoryProvider = StateProvider<String>((ref) => 'All');

// ---------------------------------------------------------------------------
// Dynamic categories extracted from the loaded medicines list.
// Returns ['All', ...unique real categories from backend].
// ---------------------------------------------------------------------------
final categoriesProvider = Provider<List<String>>((ref) {
  final allAsync = ref.watch(allMedicinesProvider);
  return allAsync.maybeWhen(
    data: (medicines) {
      final cats = medicines
          .map((m) => m.category)
          .where((c) => c != null && c.isNotEmpty)
          .map((c) => _capitalize(c!))
          .toSet()
          .toList()
        ..sort();
      return ['All', ...cats];
    },
    orElse: () => ['All'],
  );
});

String _capitalize(String s) =>
    s.isEmpty ? s : s[0].toUpperCase() + s.substring(1).toLowerCase();

// ---------------------------------------------------------------------------
// Data source indicator — 'live' or 'mock'.
// ---------------------------------------------------------------------------
final dataSourceProvider = Provider<String>((ref) {
  final allAsync = ref.watch(allMedicinesProvider);
  return allAsync.maybeWhen(
    data: (medicines) {
      // Mock data has very specific IDs (single digit numbers or 'mock_')
      if (medicines.isEmpty) return 'empty';
      final firstId = medicines.first.id;
      final isMock = int.tryParse(firstId) != null ||
          firstId.startsWith('mock') ||
          firstId.length < 10;
      return isMock ? 'mock' : 'live';
    },
    orElse: () => 'loading',
  );
});

// ---------------------------------------------------------------------------
// Filtered medicines provider — derived from allMedicines + query + category.
// ---------------------------------------------------------------------------
final medicineSearchProvider =
    Provider.autoDispose<AsyncValue<List<Medicine>>>((ref) {
  final allAsync = ref.watch(allMedicinesProvider);
  final query = ref.watch(searchQueryProvider).toLowerCase().trim();
  final activeCategory = ref.watch(activeCategoryProvider);

  return allAsync.when(
    loading: () => const AsyncValue.loading(),
    error: (e, st) => AsyncValue.error(e, st),
    data: (medicines) {
      var filtered = medicines;

      // 1. Category filter
      if (activeCategory != 'All') {
        final cat = activeCategory.toLowerCase();
        filtered = filtered.where((m) {
          final medCat = (m.category ?? '').toLowerCase();
          final medName = m.name.toLowerCase();
          return medCat.contains(cat) ||
              medName.contains(cat) ||
              // Smart keyword fallbacks
              (cat == 'tablets' && (medName.contains('mg') || medName.contains('tablet'))) ||
              (cat == 'syrup' && (medName.contains('syrup') || medName.contains('liquid'))) ||
              (cat == 'drops' && (medName.contains('drop') || medName.contains('eye')));
        }).toList();
      }

      // 2. Text search filter
      if (query.isNotEmpty) {
        filtered = filtered.where((m) {
          return m.name.toLowerCase().contains(query) ||
              (m.brand?.toLowerCase().contains(query) ?? false) ||
              (m.category?.toLowerCase().contains(query) ?? false) ||
              (m.description?.toLowerCase().contains(query) ?? false) ||
              (m.pharmacyName.toLowerCase().contains(query)) ||
              (m.strength?.toLowerCase().contains(query) ?? false);
        }).toList();
      }

      return AsyncValue.data(filtered);
    },
  );
});

// ---------------------------------------------------------------------------
// Legacy notifier kept for backward-compat (map screen, etc.).
// ---------------------------------------------------------------------------
class MedicineSearchNotifier
    extends StateNotifier<AsyncValue<List<Medicine>>> {
  Timer? _debounceTimer;
  Position? _currentPosition;

  MedicineSearchNotifier() : super(const AsyncValue.loading()) {
    _initLocationAndSearch();
  }

  Future<void> _initLocationAndSearch() async {
    await ApiService().init();
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse) {
        _currentPosition = await Geolocator.getCurrentPosition();
      }
    } catch (_) {}
    search('');
  }

  void onSearchChanged(String query) {}

  Future<void> search(String query, {double? lat, double? lng}) async {
    state = const AsyncValue.loading();
    try {
      final jsonList = await ApiService().fetchInventory(
        query: query,
        lat: lat ?? _currentPosition?.latitude,
        lng: lng ?? _currentPosition?.longitude,
      );
      state = AsyncValue.data(
        jsonList
            .map((j) => Medicine.fromJson(j as Map<String, dynamic>))
            .toList(),
      );
    } catch (e, st) {
      debugPrint('[LegacySearch] Connection Error: $e');
      state = AsyncValue.error(e, st);
    }
  }

  void updateLocation(Position position) {
    _currentPosition = position;
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

final legacyMedicineSearchProvider =
    StateNotifierProvider.autoDispose<MedicineSearchNotifier,
        AsyncValue<List<Medicine>>>((ref) => MedicineSearchNotifier());

final medicineTrendingProvider =
    FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  return await ApiService().fetchTrending();
});
