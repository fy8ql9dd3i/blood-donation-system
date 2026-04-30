import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_constants.dart';

class NewsService {
  Future<List<dynamic>> fetchNews(String languageCode) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/news?lang=$languageCode'),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      }
      return [];
    } catch (e) {
      print('Error fetching news: $e');
      return [];
    }
  }
}
