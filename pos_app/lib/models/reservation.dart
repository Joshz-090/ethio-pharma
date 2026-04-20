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
    // Note: Backend structure might vary, adapting to common nested fields
    final inventory = json['inventory_item_details'] ?? {};
    final medicine = inventory['medicine_details'] ?? {};
    final pharmacy = json['pharmacy_details'] ?? {};
    
    return Reservation(
      id: json['id'] as String,
      medicineName: medicine['name'] ?? 'Unknown Medicine',
      pharmacyName: pharmacy['name'] ?? 'Unknown Pharmacy',
      quantity: json['quantity'] as int? ?? 1,
      price: (inventory['price'] as num?)?.toDouble() ?? 0.0,
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
