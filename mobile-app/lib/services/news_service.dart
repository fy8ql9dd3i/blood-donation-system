import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api/api_constants.dart';
import '../models/news_model.dart';

class NewsService {
  /// Get all active public news and announcements
  static Future<List<NewsModel>> getNews() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.news}');
      final response = await http.get(
        url,
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final isSuccess = data['status'] == 'success' || data['success'] == true;
        if (isSuccess && data['data'] != null) {
          final List<dynamic> list = data['data'];
          // Filter only active news if the backend doesn't already
          return list
              .map((item) => NewsModel.fromJson(item))
              .where((news) => news.isActive)
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error getting news/announcements: $e');
      return [];
    }
  }
}
