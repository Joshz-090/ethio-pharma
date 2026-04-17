import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/cart_item.dart';
import '../models/medicine.dart';

class CartNotifier extends Notifier<List<CartItem>> {
  @override
  List<CartItem> build() => [];

  void addItem(Medicine medicine) {
    final existingIndex = state.indexWhere((item) => item.medicineId == medicine.id);

    if (existingIndex >= 0) {
      final item = state[existingIndex];
      if (item.quantity < medicine.stock) {
        state = [
          for (int i = 0; i < state.length; i++)
            if (i == existingIndex)
              state[i].copyWith(quantity: state[i].quantity + 1)
            else
              state[i]
        ];
      }
    } else {
      if (medicine.stock > 0) {
        state = [
          ...state,
          CartItem(
            medicineId: medicine.id,
            name: medicine.name,
            price: medicine.price,
            quantity: 1,
            stockLimit: medicine.stock,
          ),
        ];
      }
    }
  }

  void removeItem(int medicineId) {
    state = state.where((item) => item.medicineId != medicineId).toList();
  }

  void increaseQuantity(int medicineId) {
    state = [
      for (final item in state)
        if (item.medicineId == medicineId && item.quantity < item.stockLimit)
          item.copyWith(quantity: item.quantity + 1)
        else
          item
    ];
  }

  void decreaseQuantity(int medicineId) {
    state = [
      for (final item in state)
        if (item.medicineId == medicineId && item.quantity > 1)
          item.copyWith(quantity: item.quantity - 1)
        else
          item
    ];
  }

  void clearCart() {
    state = [];
  }
}

final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(CartNotifier.new);

final cartTotalProvider = Provider<double>((ref) {
  final cart = ref.watch(cartProvider);
  return cart.fold(0, (sum, item) => sum + item.subtotal);
});

final cartItemCountProvider = Provider<int>((ref) {
  final cart = ref.watch(cartProvider);
  return cart.fold(0, (sum, item) => sum + item.quantity);
});
