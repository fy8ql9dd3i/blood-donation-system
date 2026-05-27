import 'package:flutter/foundation.dart';

class ApiConstants {
  // Dynamically set baseUrl based on whether the app is running on Web (Chrome) or Mobile:
  static const String baseUrl = kIsWeb
      ? 'http://localhost:5000/api'
      : 'http://192.168.122.10:5000/api';

  // Donor
  static const String registerDonor = '/auth/register-donor';
  static const String login = '/auth/login';
  static const String profile = '/donors/profile';
  static const String updateProfile = '/donors/profile';
  static const String updateDeviceToken = '/donors/device-token';
  static const String history = '/donations/history';
  static const String getAllDonors = '/donors';
  static const String checkPhone = '/auth/check-phone';

  // Notifications
  static const String notifications = '/notifications';
  static const String respondNotification = '/notifications/respond';

  // Other
  static const String mapCoordinates = '/map/coordinates';
  static const String mapReverse = '/map/reverse';
}

