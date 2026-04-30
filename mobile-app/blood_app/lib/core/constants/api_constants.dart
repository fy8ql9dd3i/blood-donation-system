class ApiConstants {
  // Use ONE of these depending on how you are testing the app:
  
  // 1️⃣ For Web Browser (Chrome) or iOS Simulator:
  // static const String baseUrl = 'http://127.0.0.1:5000/api'; 
  
  // 2️⃣ For Android Emulator:
  // static const String baseUrl = 'http://10.0.2.2:5000/api'; 

  // 3️⃣ For Physical Mobile Device (must be on same Wi-Fi as your PC):
  static const String baseUrl = 'http://10.200.106.161:5000/api';

  // Donor
  static const String registerDonor = '/auth/register-donor';
  static const String login = '/auth/login';
  static const String profile = '/donors/profile';
  static const String updateProfile = '/donors/profile';
  static const String updateDeviceToken = '/donors/device-token';
  static const String history = '/donations/history';
  static const String getAllDonors = '/donors';

  // Notifications
  static const String notifications = '/notifications';
  static const String respondNotification = '/notifications/respond';

  // Other
  static const String mapCoordinates = '/map/coordinates';
}

