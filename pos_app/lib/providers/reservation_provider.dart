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

  Future<bool> reserveForOneHour(String medicineId, int quantity) async {
    final result = await ApiService().createReservation(medicineId, quantity);
    
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
}

final reservationProvider =
    AsyncNotifierProvider<ReservationNotifier, List<Reservation>>(
      ReservationNotifier.new,
    );
