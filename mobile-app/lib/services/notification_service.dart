import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api/api_constants.dart';
import '../models/notification_model.dart';
import 'storage_service.dart';

class NotificationService {
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

  /// Get notifications for the logged-in donor
  static Future<List<NotificationModel>> getNotifications() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.notifications}');
      final response = await http.get(
        url,
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final isSuccess = data['status'] == 'success' || data['success'] == true;
        if (isSuccess && data['data'] != null) {
          final List<dynamic> list = data['data'];
          return list.map((item) => NotificationModel.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Error getting notifications: $e');
      return [];
    }
  }

  /// Respond ACCEPTED or DECLINED to an emergency alert
  static Future<Map<String, dynamic>> respondToEmergency(
    String notificationId,
    String responseStatus,
  ) async {
    try {
      // POST /api/notifications/respond/:notificationId
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.respondNotification}/$notificationId');
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({
          'response': responseStatus, // ACCEPTED or DECLINED
        }),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      final isSuccess = data['status'] == 'success' || data['success'] == true;
      data['success'] = isSuccess;
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error responding to emergency: ${e.toString()}',
      };
    }
  }
}
