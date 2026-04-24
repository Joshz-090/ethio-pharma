import 'package:flutter/material.dart';

class Reservation {
  final String id;
  final String medicineName;
  final String pharmacyName;
  final int quantity;
  final double price;
  final DateTime createdAt;
  final DateTime expiresAt;
  final String status;

  Reservation({
    required this.id,
    required this.medicineName,
    required this.pharmacyName,
    required this.quantity,
    required this.price,
    required this.createdAt,
    required this.expiresAt,
    required this.status,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    // Handle both real API structure and demo fallback structure
    final inventory = json['inventory_item'] ?? json['inventory_item_details'] ?? {};
    final medicine = inventory['medicine'] ?? inventory['medicine_details'] ?? {};
    final pharmacy = inventory['pharmacy'] ?? json['pharmacy_details'] ?? {};
    
    // Price might be a string in real API (e.g., "120.00") or a number in demo fallback
    double priceValue = 0.0;
    if (inventory['price'] != null) {
      priceValue = double.tryParse(inventory['price'].toString()) ?? 0.0;
    }

    return Reservation(
      id: json['id'] as String,
      medicineName: medicine['name'] ?? 'Unknown Medicine',
      pharmacyName: pharmacy['name'] ?? 'Unknown Pharmacy',
      quantity: json['quantity'] as int? ?? 1,
      price: priceValue,
      createdAt: DateTime.parse(json['created_at']),
      expiresAt: DateTime.parse(json['expires_at']),
      status: json['status'] as String? ?? 'pending',
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  
  Duration get remainingTime {
    final now = DateTime.now();
    if (now.isAfter(expiresAt)) return Duration.zero;
    return expiresAt.difference(now);
  }
}
