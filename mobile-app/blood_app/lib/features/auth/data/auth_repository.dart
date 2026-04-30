import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';
import '../../../core/constants/app_constants.dart';

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
    
    // Save token if successful
    if (response['success'] == true && response['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, response['token']);
    }
  }

  // =========================
  // 🔑 LOGIN
  // =========================
  Future<void> login({
    String? email,
    String? phoneNumber,
    required String password,
  }) async {
    final response = await _authService.login(email, phoneNumber, password);

    if (response['success'] == true && response['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, response['token']);
      
      // Optionally save user data
      if (response['data'] != null) {
        // You can save user info here if needed
      }
    } else {
      throw response['message'] ?? 'Login failed';
    }
  }
}
