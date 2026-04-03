import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import '../../core/constants/app_constants.dart';

class AuthRepository {
  final AuthService _authService;

  // Constructor
  AuthRepository({required AuthService authService})
    : _authService = authService;

  // =========================
  // 🔐 LOGIN
  // =========================
  Future<void> login(String email, String password) async {
    final response = await _authService.login(email, password);

    final prefs = await SharedPreferences.getInstance();

    await prefs.setString(AppConstants.tokenKey, response['token'] ?? '');

    await prefs.setInt(AppConstants.userIdKey, response['userId'] ?? 0);
  }

  // =========================
  // 📝 REGISTER
  // =========================
  Future<void> register(Map<String, dynamic> userData) async {
    await _authService.register(userData);
  }

  // =========================
  // 🚪 LOGOUT
  // =========================
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userIdKey);
  }

  // =========================
  // ✅ CHECK LOGIN STATUS
  // =========================
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey) != null;
  }

  // =========================
  // 📦 GET TOKEN (Optional helper)
  // =========================
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  // =========================
  // 👤 GET USER ID (Optional helper)
  // =========================
  Future<int?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(AppConstants.userIdKey);
  }
}
