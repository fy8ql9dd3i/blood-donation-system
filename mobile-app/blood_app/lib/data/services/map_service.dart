import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';

class MapService {
  final ApiClient _apiClient;

  MapService(this._apiClient);

  Future<Map<String, double>> getCoordinates(String address) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.mapCoordinates,
        data: {'address': address},
      );
      return {
        'lat': response.data['latitude'],
        'lng': response.data['longitude'],
      };
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
