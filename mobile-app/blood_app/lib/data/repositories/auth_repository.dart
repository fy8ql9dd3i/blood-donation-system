import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import '../../core/constants/app_constants.dart';

class AuthRepository {
  final AuthService _authService;

  // Constructor
  AuthRepository({required AuthService authService})
      : _authService = authService;

  // =========================
  // 📝 REGISTER DONOR
  // =========================
  Future<void> register(Map<String, dynamic> userData) async {
    final response = await _authService.register(userData);
    
    // Save token so backend returns unauthorized if missing
    final prefs = await SharedPreferences.getInstance();
    if (response['token'] != null) {
      await prefs.setString(AppConstants.tokenKey, response['token']);
    }
  }
}
