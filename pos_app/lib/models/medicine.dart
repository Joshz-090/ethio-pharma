class Medicine {
  final String id; // This is the inventory_item id from backend
  final String? medicineModelId;
  final String? pharmacyId;
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
  final String? brand;
  final String? strength;
  final String? frequency;
  final String? recommendedDuration;
  final String? description;
  final String? expiryDate;
  final String? pharmacyPhone;

  const Medicine({
    required this.id,
    this.medicineModelId,
    this.pharmacyId,
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
    this.brand,
    this.strength,
    this.frequency,
    this.recommendedDuration,
    this.description,
    this.expiryDate,
    this.pharmacyPhone,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    // 1. Core structural maps
    final medicalInfo = json['medicine'] as Map<String, dynamic>?;
    final pharmacyInfo = json['pharmacy'] as Map<String, dynamic>?;
    final dynamic distanceRaw = json['distance_km'] ?? json['distance'];

    // 2. Safe Price Parsing (Backend sends price as a string e.g. "4.10")
    double priceValue = 0.0;
    if (json['price'] != null) {
      priceValue = double.tryParse(json['price'].toString()) ?? 0.0;
      if (priceValue < 0) priceValue = priceValue.abs(); // Correcting negative mock data
    }

    // 3. Status/Name parsing
    final medName = (medicalInfo?['name'] ?? json['name'] ?? 'Unknown Medicine').toString();

    // 4. Build strength label: brand + strength from backend
    final brandRaw = (json['brand'] ?? '').toString().trim();
    final strengthRaw = (json['strength'] ?? '').toString().trim();

    return Medicine(
      id: (json['id'] ?? '').toString(),
      medicineModelId: medicalInfo?['id']?.toString(),
      pharmacyId: pharmacyInfo?['id']?.toString(),
      name: medName,
      sku: (medicalInfo?['sku'] ?? json['sku'] ?? json['brand'] ?? '').toString(),
      price: priceValue,
      stock: int.tryParse(json['quantity']?.toString() ?? '') ?? 0,
      pharmacyName: (pharmacyInfo?['name'] ?? 'Nearby Pharmacy').toString(),
      distanceKm: double.tryParse(distanceRaw?.toString() ?? ''),
      pharmacyLatitude: double.tryParse(pharmacyInfo?['latitude']?.toString() ?? ''),
      pharmacyLongitude: double.tryParse(pharmacyInfo?['longitude']?.toString() ?? ''),
      pharmacyAddress: (pharmacyInfo?['address'])?.toString(),
      usageInstructions: (json['usage_instructions'] ?? medicalInfo?['usage_instructions'])?.toString(),
      reviews: (medicalInfo?['reviews'] ?? json['reviews']) as List<dynamic>?,
      category: medicalInfo?['category'] != null 
          ? (medicalInfo!['category'] is Map 
              ? medicalInfo['category']['name']?.toString() 
              : medicalInfo['category'].toString())
          : (json['category_name'] ?? json['category'])?.toString(),
      requiresPrescription: medicalInfo?['requires_prescription'] ?? false,
      averageRating: double.tryParse(medicalInfo?['average_rating']?.toString() ?? ''),
      brand: brandRaw.isNotEmpty ? brandRaw : null,
      strength: strengthRaw.isNotEmpty ? strengthRaw : null,
      frequency: json['frequency']?.toString(),
      recommendedDuration: json['recommended_duration']?.toString(),
      description: (medicalInfo?['description'] ?? json['description'])?.toString(),
      expiryDate: (json['expiry_date'] ?? json['expiry'])?.toString(),
      pharmacyPhone: (pharmacyInfo?['phone_number'] ?? json['pharmacy_phone'])?.toString(),
    );
  }

  Medicine copyWith({
    double? distanceKm,
  }) {
    return Medicine(
      id: id,
      medicineModelId: medicineModelId,
      pharmacyId: pharmacyId,
      name: name,
      sku: sku,
      price: price,
      stock: stock,
      pharmacyName: pharmacyName,
      distanceKm: distanceKm ?? this.distanceKm,
      pharmacyLatitude: pharmacyLatitude,
      pharmacyLongitude: pharmacyLongitude,
      pharmacyAddress: pharmacyAddress,
      usageInstructions: usageInstructions,
      reviews: reviews,
      category: category,
      requiresPrescription: requiresPrescription,
      averageRating: averageRating,
      brand: brand,
      strength: strength,
      frequency: frequency,
      recommendedDuration: recommendedDuration,
      description: description,
      expiryDate: expiryDate,
      pharmacyPhone: pharmacyPhone,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'medicine_model_id': medicineModelId,
      'pharmacy_id': pharmacyId,
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
      'brand': brand,
      'strength': strength,
      'description': description,
      'expiry_date': expiryDate,
    };
  }
}
