import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../core/api_config.dart';
import '../models/medicine.dart';
import '../models/sale_response.dart';
import '../models/cart_item.dart';

class PosApiService {
  final http.Client _client;

  PosApiService({http.Client? client}) : _client = client ?? http.Client();

  /// Search medicines by query string
  Future<List<Medicine>> searchMedicines(String query) async {
    try {
      final response = await _client.get(
        Uri.parse('${ApiConfig.apiUrl}/medicines/search/?q=${Uri.encodeComponent(query)}&limit=10'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Medicine.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load medicines: ${response.statusCode}');
      }
    } on SocketException {
      throw Exception('No Internet connection. Please check your network.');
    } on FormatException {
      throw Exception('Received invalid format from server.');
    } catch (e) {
      throw Exception('An unexpected error occurred: $e');
    }
  }

  /// Process a POS sale
  Future<SaleResponse> processSale(List<CartItem> items, {String? token}) async {
    try {
      final Map<String, dynamic> body = {
        'items': items.map((item) => {
          'medicine_id': item.medicineId,
          'quantity': item.quantity,
        }).toList(),
      };

      final response = await _client.post(
        Uri.parse('${ApiConfig.apiUrl}/sales/pos_sale/'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode(body),
      ).timeout(const Duration(seconds: 15));

      final responseData = json.decode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return SaleResponse.fromJson(responseData);
      } else if (response.statusCode == 400) {
        // Backend validation errors
        final message = responseData['detail'] ?? responseData['message'] ?? 'Validation error occurred';
        throw Exception(message);
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized. Please login again.');
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } on SocketException {
      throw Exception('Network error. Check your connection to the POS server.');
    } on FormatException {
      throw Exception('Bad response format from server.');
    } catch (e) {
      rethrow;
    }
  }
}
