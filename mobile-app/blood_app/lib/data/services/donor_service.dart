import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';

class DonorService {
  final ApiClient _apiClient;

  DonorService(this._apiClient);

  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _apiClient.get(ApiConstants.profile);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.put(ApiConstants.profile, data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<dynamic>> getHistory() async {
    try {
      final response = await _apiClient.get(ApiConstants.history);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response != null) {
      return error.response?.data['message'] ?? 'Server error';
    } else {
      return 'Network error: ${error.message}';
    }
  }
}
