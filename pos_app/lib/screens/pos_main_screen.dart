import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/medicine.dart';
import '../models/cart_item.dart';
import '../models/sale_response.dart';
import '../providers/cart_provider.dart';
import '../providers/medicine_search_provider.dart';
import '../providers/checkout_provider.dart';
import 'receipt_screen.dart';

class PosMainScreen extends ConsumerWidget {
  const PosMainScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Listen for checkout success
    ref.listen(checkoutProvider, (previous, next) {
      if (next.hasValue && next.value != null) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => ReceiptScreen(saleResponse: next.value!),
          ),
        );
      }
      if (next.hasError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Checkout Failed: ${next.error}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pharmacy POS - Ethio Pharma'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return const _DesktopLayout();
          } else {
            return const _MobileLayout();
          }
        },
      ),
    );
  }
}

class _DesktopLayout extends StatelessWidget {
  const _DesktopLayout();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 6,
          child: _ProductSearchArea(),
        ),
        VerticalDivider(width: 1, color: Colors.grey.shade300),
        Expanded(
          flex: 4,
          child: _CartArea(),
        ),
      ],
    );
  }
}

class _MobileLayout extends ConsumerWidget {
  const _MobileLayout();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartItemCountProvider);
    final total = ref.watch(cartTotalProvider);

    return Stack(
      children: [
        Column(
          children: [
            Expanded(
              child: _ProductSearchArea(),
            ),
            if (cartCount > 0)
              const SizedBox(height: 80), // Space for bottom bar
          ],
        ),
        if (cartCount > 0)
          Align(
            alignment: Alignment.bottomCenter,
            child: GestureDetector(
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  builder: (context) => SizedBox(
                    height: MediaQuery.of(context).size.height * 0.7,
                    child: _CartArea(),
                  ),
                );
              },
              child: Container(
                height: 70,
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, -2))
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shopping_cart, color: Colors.white),
                    const SizedBox(width: 12),
                    Text(
                      '$cartCount items',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    Text(
                      NumberFormat.currency(symbol: 'ETB ').format(total),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.keyboard_arrow_up, color: Colors.white),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ProductSearchArea extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchResults = ref.watch(medicineSearchProvider);

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            onChanged: (value) => ref.read(medicineSearchProvider.notifier).onSearchChanged(value),
            decoration: InputDecoration(
              hintText: 'Search medications...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                icon: const Icon(Icons.qr_code_scanner),
                onPressed: () {},
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: searchResults.when(
              data: (medicines) => ListView.builder(
                itemCount: medicines.length,
                itemBuilder: (context, index) {
                  final medicine = medicines[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      title: Text(medicine.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('SKU: ${medicine.sku} • Stock: ${medicine.stock}'),
                      trailing: Text(
                        NumberFormat.currency(symbol: 'ETB ').format(medicine.price),
                        style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                      ),
                      onTap: medicine.stock > 0 
                        ? () => ref.read(cartProvider.notifier).addItem(medicine)
                        : null,
                      enabled: medicine.stock > 0,
                    ),
                  );
                },
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
            ),
          ),
        ],
      ),
    );
  }
}

class _CartArea extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);
    final checkoutState = ref.watch(checkoutProvider);

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Current Sale',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              if (cart.isNotEmpty)
                TextButton.icon(
                  onPressed: () => ref.read(cartProvider.notifier).clearCart(),
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  label: const Text('Clear', style: TextStyle(color: Colors.red)),
                )
            ],
          ),
          const SizedBox(height: 8),
          Expanded(
            child: cart.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_cart_outlined, size: 48, color: Colors.grey),
                        SizedBox(height: 8),
                        Text('No items in cart', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: cart.length,
                    itemBuilder: (context, index) {
                      final item = cart[index];
                      return _CartItemTile(item: item);
                    },
                  ),
          ),
          const Divider(),
          _CartSummary(total: total),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: (cart.isEmpty || checkoutState.isLoading)
                ? null
                : () => ref.read(checkoutProvider.notifier).processCheckout(),
            child: checkoutState.isLoading
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('CHECKOUT'),
          ),
        ],
      ),
    );
  }
}

class _CartItemTile extends ConsumerWidget {
  final CartItem item;
  const _CartItemTile({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(item.name, overflow: TextOverflow.ellipsis),
      subtitle: Text('${NumberFormat.currency(symbol: 'ETB ').format(item.price)} x ${item.quantity}'),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove_circle_outline),
            onPressed: () => ref.read(cartProvider.notifier).decreaseQuantity(item.medicineId),
          ),
          Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: item.quantity < item.stockLimit
                ? () => ref.read(cartProvider.notifier).increaseQuantity(item.medicineId)
                : null,
          ),
          IconButton(
            icon: const Icon(Icons.close, color: Colors.red),
            onPressed: () => ref.read(cartProvider.notifier).removeItem(item.medicineId),
          ),
        ],
      ),
    );
  }
}

class _CartSummary extends StatelessWidget {
  final double total;
  const _CartSummary({required this.total});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Subtotal:', style: TextStyle(color: Colors.grey)),
              Text(NumberFormat.currency(symbol: 'ETB ').format(total)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Tax (0%):', style: TextStyle(color: Colors.grey)),
              Text(NumberFormat.currency(symbol: 'ETB ').format(0)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total:', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              Text(
                NumberFormat.currency(symbol: 'ETB ').format(total),
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

