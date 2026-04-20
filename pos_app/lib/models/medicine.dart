class Medicine {
  final String id; // This is the inventory_item id from backend
  final String name;
  final String sku;
  final double price;
  final int stock;
  final String pharmacyName;
  final double? distanceKm;
  final double? pharmacyLatitude;
  final double? pharmacyLongitude;
  final String? pharmacyAddress;
  final String? usageInstructions;
  final List<dynamic>? reviews;
  final String? category;
  final bool requiresPrescription;
  final double? averageRating;

  const Medicine({
    required this.id,
    required this.name,
    required this.sku,
    required this.price,
    required this.stock,
    this.pharmacyName = 'Unknown Pharmacy',
    this.distanceKm,
    this.pharmacyLatitude,
    this.pharmacyLongitude,
    this.pharmacyAddress,
    this.usageInstructions,
    this.reviews,
    this.category,
    this.requiresPrescription = false,
    this.averageRating,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    // 1. Core structural maps
    final medicalInfo = json['medicine'] as Map<String, dynamic>?;
    final pharmacyInfo = json['pharmacy'] as Map<String, dynamic>?;
    final dynamic distanceRaw = json['distance_km'] ?? json['distance'];

    // 2. Safe Price Parsing (Backend sends price as a string "-6144.21")
    double priceValue = 0.0;
    if (json['price'] != null) {
      priceValue = double.tryParse(json['price'].toString()) ?? 0.0;
      if (priceValue < 0) priceValue = priceValue.abs(); // Correcting negative mock data
    }

    // 3. Status/Name parsing
    final medName = (medicalInfo?['name'] ?? json['name'] ?? 'Unknown Medicine').toString();

    return Medicine(
      id: (json['id'] ?? '').toString(),
      name: medName,
      sku: (medicalInfo?['sku'] ?? json['sku'] ?? json['brand'] ?? '').toString(),
      price: priceValue,
      stock: (json['quantity'] as num?)?.toInt() ?? 0,
      pharmacyName: (pharmacyInfo?['name'] ?? 'Nearby Pharmacy').toString(),
      distanceKm: distanceRaw == null ? null : (distanceRaw as num).toDouble(),
      pharmacyLatitude: (pharmacyInfo?['latitude'] as num?)?.toDouble(),
      pharmacyLongitude: (pharmacyInfo?['longitude'] as num?)?.toDouble(),
      pharmacyAddress: (pharmacyInfo?['address'])?.toString(),
      usageInstructions: (json['usage_instructions'] ?? medicalInfo?['usage_instructions'])?.toString(),
      reviews: (medicalInfo?['reviews'] ?? json['reviews']) as List<dynamic>?,
      category: (medicalInfo?['category'])?.toString(),
      requiresPrescription: medicalInfo?['requires_prescription'] ?? false,
      averageRating: double.tryParse(medicalInfo?['average_rating']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'sku': sku,
      'price': price,
      'stock': stock,
      'pharmacy_name': pharmacyName,
      'distance_km': distanceKm,
      'pharmacy_latitude': pharmacyLatitude,
      'pharmacy_longitude': pharmacyLongitude,
      'pharmacy_address': pharmacyAddress,
      'usage_instructions': usageInstructions,
      'reviews': reviews,
    };
  }
}
