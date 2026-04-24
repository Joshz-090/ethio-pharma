class CartItem {
  final String medicineId;
  final String name;
  final double price;
  final int quantity;
  final int stockLimit;

  CartItem({
    required this.medicineId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.stockLimit,
  });

  double get subtotal => price * quantity;

  CartItem copyWith({
    String? medicineId,
    String? name,
    double? price,
    int? quantity,
    int? stockLimit,
  }) {
    return CartItem(
      medicineId: medicineId ?? this.medicineId,
      name: name ?? this.name,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
      stockLimit: stockLimit ?? this.stockLimit,
    );
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      medicineId: json['medicine_id'].toString(),
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'] as int,
      stockLimit: json['stock_limit'] as int? ?? 999,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'medicine_id': medicineId,
      'name': name,
      'price': price,
      'quantity': quantity,
      'stock_limit': stockLimit,
    };
  }
}
