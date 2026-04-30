import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  // ------------------------
  // REGISTER DONOR
  // ------------------------
  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.registerDonor,
        data: userData,
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ------------------------
  // LOGIN
  // ------------------------
  Future<Map<String, dynamic>> login(String? email, String? phoneNumber, String password) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.login,
        data: {
          if (email != null) 'email': email,
          if (phoneNumber != null) 'phoneNumber': phoneNumber,
          'password': password,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ------------------------
  // ERROR HANDLER
  // ------------------------
  String _handleError(DioException error) {
    if (error.response != null) {
      return error.response?.data['message'] ?? 'Server error';
    } else {
      return 'Network error: ${error.message}';
    }
  }
}
