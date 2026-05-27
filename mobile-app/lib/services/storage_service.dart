import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _tokenKey = 'auth_token';
  static const String _donorNameKey = 'donor_name';
  static const String _donorPhoneKey = 'donor_phone';
  static const String _languageKey = 'app_language';

  static SharedPreferences? _prefs;

  // Initialize SharedPreferences
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token methods
  static Future<bool> saveToken(String token) async {
    _prefs ??= await SharedPreferences.getInstance();
    return await _prefs!.setString(_tokenKey, token);
  }

  static String? getToken() {
    return _prefs?.getString(_tokenKey);
  }

  static Future<bool> clearToken() async {
    _prefs ??= await SharedPreferences.getInstance();
    return await _prefs!.remove(_tokenKey);
  }

  // Donor details persistence
  static Future<bool> saveDonorDetails(String name, String phone) async {
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs!.setString(_donorNameKey, name);
    return await _prefs!.setString(_donorPhoneKey, phone);
  }

  static String? getDonorName() {
    return _prefs?.getString(_donorNameKey);
  }

  static String? getDonorPhone() {
    return _prefs?.getString(_donorPhoneKey);
  }

  // Language preference persistence
  static Future<bool> saveLanguage(String languageCode) async {
    _prefs ??= await SharedPreferences.getInstance();
    return await _prefs!.setString(_languageKey, languageCode);
  }

  static String? getLanguage() {
    return _prefs?.getString(_languageKey);
  }

  static Future<bool> clearSession() async {
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs!.remove(_tokenKey);
    await _prefs!.remove(_donorNameKey);
    return await _prefs!.remove(_donorPhoneKey);
    // Note: Language preference is NOT cleared on logout – it persists
  }

  static bool isLoggedIn() {
    final token = getToken();
    return token != null && token.isNotEmpty;
  }
}
