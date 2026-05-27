import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api/api_constants.dart';
import '../models/donation_model.dart';
import 'storage_service.dart';

class DonationService {
  static Map<String, String> _getHeaders() {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    final token = StorageService.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Get the donation history of the logged-in donor
  static Future<List<DonationModel>> getDonationHistory() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.history}');
      final response = await http.get(
        url,
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final isSuccess = data['status'] == 'success' || data['success'] == true;
        if (isSuccess && data['data'] != null) {
          final List<dynamic> list = data['data'];
          return list.map((item) => DonationModel.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Error getting donation history: $e');
      return [];
    }
  }
}
