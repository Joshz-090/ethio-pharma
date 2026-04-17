import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/medicine.dart';
import 'checkout_provider.dart';

class MedicineSearchNotifier extends StateNotifier<AsyncValue<List<Medicine>>> {
  final Ref ref;
  Timer? _debounceTimer;

  MedicineSearchNotifier(this.ref) : super(const AsyncValue.data([]));

  void onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      search(query);
    });
  }

  Future<void> search(String query) async {
    if (query.isEmpty) {
      state = const AsyncValue.data([]);
      return;
    }

    state = const AsyncValue.loading();
    
    state = await AsyncValue.guard(() async {
      final apiService = ref.read(apiServiceProvider);
      return await apiService.searchMedicines(query);
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

final medicineSearchProvider = StateNotifierProvider.autoDispose<MedicineSearchNotifier, AsyncValue<List<Medicine>>>((ref) {
  return MedicineSearchNotifier(ref);
});
