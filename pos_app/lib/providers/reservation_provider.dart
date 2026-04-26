import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../models/reservation.dart';

class ReservationNotifier extends AsyncNotifier<List<Reservation>> {
  final List<Reservation> _localMockReservations = [];

  @override
  Future<List<Reservation>> build() async {
    return _fetchAndMerge();
  }

  Future<List<Reservation>> _fetchAndMerge() async {
    final jsonList = await ApiService().fetchReservations();
    final remote = jsonList.map((json) => Reservation.fromJson(json)).toList();
    
    // Combine remote data with our local session-only mocked data
    return [...remote, ..._localMockReservations];
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _fetchAndMerge());
  }

  Future<bool> reserveForOneHour(String medicineId, int quantity, {String? pharmacyId}) async {
    final result = await ApiService().createReservation(medicineId, quantity, pharmacyId: pharmacyId);
    
    if (result != null) {
      // If server returned a mocked ID (demo_res_...), save it locally for this session
      if (result['id'].toString().startsWith('demo_res_')) {
        _localMockReservations.add(Reservation.fromJson(result));
      }
      
      state = AsyncValue.data(await _fetchAndMerge());
      return true;
    }
    return false;
  }

  Future<bool> cancelReservation(String reservationId) async {
    final success = await ApiService().cancelReservation(reservationId);
    if (success) {
      // Remove from local mock list if it was a mock
      _localMockReservations.removeWhere((r) => r.id == reservationId);
      await refresh();
      return true;
    }
    return false;
  }
}

final reservationProvider =
    AsyncNotifierProvider<ReservationNotifier, List<Reservation>>(
      ReservationNotifier.new,
    );
