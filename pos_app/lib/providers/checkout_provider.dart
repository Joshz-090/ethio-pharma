import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/pos_api_service.dart';
import '../models/sale_response.dart';
import 'cart_provider.dart';

final apiServiceProvider = Provider((ref) => PosApiService());

class CheckoutNotifier extends AutoDisposeAsyncNotifier<SaleResponse?> {
  @override
  Future<SaleResponse?> build() async => null;

  Future<void> processCheckout() async {
    final cart = ref.read(cartProvider);
    if (cart.isEmpty) return;

    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.processSale(cart);
      
      // On success, clear the cart
      ref.read(cartProvider.notifier).clearCart();
      
      return response;
    });
  }
}

final checkoutProvider = AsyncNotifierProvider.autoDispose<CheckoutNotifier, SaleResponse?>(
  CheckoutNotifier.new,
);
