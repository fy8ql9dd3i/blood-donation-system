import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api/api_constants.dart';
import '../models/donor_model.dart';
import 'storage_service.dart';

class DonorService {
  // Helper for auth headers
  static Map<String, String> _getHeaders({bool requireAuth = true}) {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    if (requireAuth) {
      final token = StorageService.getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  /// Check if phone number is already registered
  static Future<Map<String, dynamic>> checkPhoneExists(String phone) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.checkPhone}/$phone');
      final response = await http.get(
        url,
        headers: _getHeaders(requireAuth: false),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'exists': false,
        'message': 'Connection error checking phone: ${e.toString()}',
      };
    }
  }

  /// Authenticate/Login an existing donor using Name and Phone Number (Passwordless re-login)
  static Future<Map<String, dynamic>> loginDonor({
    required String fullName,
    required String phoneNumber,
  }) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/auth/donor-login');
      final response = await http.post(
        url,
        headers: _getHeaders(requireAuth: false),
        body: jsonEncode({
          'fullName': fullName,
          'phoneNumber': phoneNumber,
        }),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      // Backend returns { status: 'success', token: '...' }
      final isSuccess = data['status'] == 'success' || data['success'] == true;
      if (isSuccess && data['token'] != null) {
        await StorageService.saveToken(data['token']);
        await StorageService.saveDonorDetails(fullName, phoneNumber);
      }
      // Normalize to success:true for Flutter code
      data['success'] = isSuccess;
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error during login: ${e.toString()}',
      };
    }
  }

  /// Register a new donor with fullname, phone number, age, gender, address
  static Future<Map<String, dynamic>> registerDonor({
    required String fullName,
    required String phoneNumber,
    required int age,
    required String address,
    String? gender,
    String? language,
  }) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.registerDonor}');

      final body = <String, dynamic>{
        'name': fullName,
        'phoneNumber': phoneNumber,
        'age': age,
        'address': address,
        'gender': gender,
        'role': 'donor',
        'sendToLabTest': true,
      };

      if (language != null) {
        body['language'] = language;
      }

      final response = await http.post(
        url,
        headers: _getHeaders(requireAuth: false),
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      // Backend returns { status: 'success', token: '...' }
      final isSuccess = data['status'] == 'success' || data['success'] == true;
      if (isSuccess && data['token'] != null) {
        await StorageService.saveToken(data['token']);
        await StorageService.saveDonorDetails(fullName, phoneNumber);
      }
      // Normalize to success:true for Flutter code
      data['success'] = isSuccess;
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error during registration: ${e.toString()}',
      };
    }
  }

  /// Get logged-in donor profile — returns donor or null, plus error message
  static Future<Map<String, dynamic>> getProfileResult() async {
    try {
      final token = StorageService.getToken();
      if (token == null || token.isEmpty) {
        return {'success': false, 'message': 'Not logged in — no token found', 'donor': null};
      }

      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.profile}');
      final response = await http.get(
        url,
        headers: _getHeaders(requireAuth: true),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Backend format: { status: 'success', data: <donor object> }
        final isSuccess = data['status'] == 'success' || data['success'] == true;
        if (isSuccess && data['data'] != null) {
          final donor = DonorModel.fromJson(data['data']);
          await StorageService.saveDonorDetails(donor.name, donor.phone);
          return {'success': true, 'donor': donor};
        }
        return {'success': false, 'message': data['message'] ?? 'Server returned no profile data', 'donor': null};
      } else if (response.statusCode == 401) {
        // Token expired or invalid — clear it
        await StorageService.clearSession();
        return {'success': false, 'message': 'Session expired. Please register again.', 'donor': null, 'unauthorized': true};
      } else if (response.statusCode == 404) {
        return {'success': false, 'message': 'Donor profile not found on server.', 'donor': null};
      } else {
        String msg = 'Server error (${response.statusCode})';
        try {
          final data = jsonDecode(response.body);
          msg = data['message'] ?? msg;
        } catch (_) {}
        return {'success': false, 'message': msg, 'donor': null};
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error: ${e.toString()}',
        'donor': null,
      };
    }
  }

  /// Get logged-in donor profile (legacy simple call)
  static Future<DonorModel?> getProfile() async {
    final result = await getProfileResult();
    return result['donor'] as DonorModel?;
  }

  /// Update logged-in donor profile (includes language preference)
  static Future<Map<String, dynamic>> updateProfile({
    required String name,
    required int age,
    required String address,
    String? gender,
    String? language,
  }) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.updateProfile}');

      final body = <String, dynamic>{
        'name': name,
        'age': age,
        'address': address,
        'gender': gender,
      };

      if (language != null) {
        body['language'] = language;
      }

      final response = await http.put(
        url,
        headers: _getHeaders(requireAuth: true),
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      final isSuccess = data['status'] == 'success' || data['success'] == true;
      data['success'] = isSuccess;
      if (isSuccess) {
        final phone = StorageService.getDonorPhone() ?? '';
        await StorageService.saveDonorDetails(name, phone);
      }
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error updating profile: ${e.toString()}',
      };
    }
  }

  /// Update only the language preference on the backend
  static Future<Map<String, dynamic>> updateLanguage(String languageCode) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.updateProfile}');
      final response = await http.put(
        url,
        headers: _getHeaders(requireAuth: true),
        body: jsonEncode({
          'language': languageCode,
        }),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error updating language: ${e.toString()}',
      };
    }
  }
}
