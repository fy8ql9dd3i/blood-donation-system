import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';

class NotificationService {
  final ApiClient _apiClient;

  NotificationService(this._apiClient);

  Future<List<dynamic>> getNotifications() async {
    try {
      final response = await _apiClient.get(ApiConstants.notifications);
      return response.data['data'] ?? response.data;
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
