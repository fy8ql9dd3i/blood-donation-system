import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/constants/app_constants.dart';

class DonorService {
  final ApiClient _apiClient;

  DonorService(this._apiClient);

  // ------------------------
  // GET TOKEN
  // ------------------------
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  // ------------------------
  // GET PROFILE (Dio)
  // ------------------------
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _apiClient.get(ApiConstants.profile);
      return response.data['data'] ?? response.data;
    } on DioException catch (error) {
      throw _handleError(error);
    }
  }

  // ------------------------
  // UPDATE PROFILE (Dio)
  // ------------------------
  Future<Map<String, dynamic>> updateProfile(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _apiClient.put(ApiConstants.profile, data: data);
      return response.data['data'] ?? response.data;
    } on DioException catch (error) {
      throw _handleError(error);
    }
  }

  // ------------------------
  // GET HISTORY (Dio)
  // ------------------------
  Future<List<dynamic>> getHistory() async {
    try {
      final response = await _apiClient.get(ApiConstants.history);
      return response.data['data'] ?? response.data;
    } on DioException catch (error) {
      throw _handleError(error);
    }
  }

  // ------------------------
  // GET ALL DONORS (http)
  // ------------------------
  static Future<List<dynamic>?> getAllDonors() async {
    String? token = await getToken();
    if (token == null) return null;

    final url = Uri.parse(ApiConstants.baseUrl + ApiConstants.getAllDonors);

    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      print('Get All Donors Error: ${response.body}');
      return null;
    }
  }

  // ------------------------
  // GET NOTIFICATIONS (http)
  // ------------------------
  static Future<List<dynamic>?> getNotifications() async {
    String? token = await getToken();
    if (token == null) return null;

    final url = Uri.parse(ApiConstants.baseUrl + ApiConstants.notifications);

    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      print('Get Notifications Error: ${response.body}');
      return null;
    }
  }

  // ------------------------
  // RESPOND TO NOTIFICATION
  // ------------------------
  static Future<bool> respondNotification({
    required String notificationId,
    required String responseStatus, // "ACCEPTED" or "DECLINED"
  }) async {
    String? token = await getToken();
    if (token == null) return false;

    final url = Uri.parse(
      '${ApiConstants.baseUrl}/notifications/respond/$notificationId',
    );

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'response': responseStatus}),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      print('Respond Notification Error: ${response.body}');
      return false;
    }
  }

  // ------------------------
  // ERROR HANDLER
  // ------------------------
  String _handleError(DioException error) {
    if (error.response != null) {
      return error.response?.data['message'] ?? 'Server error';
    }
    return 'Network error: ${error.message}';
  }
}
