class SaleResponse {
  final String receiptNumber;
  final double totalAmount;
  final int itemsProcessed;
  final String status;
  final String pharmacistName;
  final DateTime createdAt;

  SaleResponse({
    required this.receiptNumber,
    required this.totalAmount,
    required this.itemsProcessed,
    required this.status,
    required this.pharmacistName,
    required this.createdAt,
  });

  factory SaleResponse.fromJson(Map<String, dynamic> json) {
    return SaleResponse(
      receiptNumber: json['receipt_number'] ?? 'N/A',
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0.0,
      itemsProcessed: json['items_processed'] as int? ?? 0,
      status: json['status'] as String? ?? 'success',
      pharmacistName: json['pharmacist_name'] ?? json['pharmacist'] ?? 'System',
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'receipt_number': receiptNumber,
      'total_amount': totalAmount,
      'items_processed': itemsProcessed,
      'status': status,
      'pharmacist_name': pharmacistName,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
