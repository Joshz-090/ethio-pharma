class Medicine {
  final int id;
  final String name;
  final String sku;
  final double price;
  final int stock;

  Medicine({
    required this.id,
    required this.name,
    required this.sku,
    required this.price,
    required this.stock,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    return Medicine(
      id: json['id'] as int,
      name: json['name'] as String,
      sku: json['sku'] as String,
      price: (json['price'] as num).toDouble(),
      stock: json['stock'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'sku': sku,
      'price': price,
      'stock': stock,
    };
  }
}
