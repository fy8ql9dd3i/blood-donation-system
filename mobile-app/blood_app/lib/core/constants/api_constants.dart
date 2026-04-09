class ApiConstants {
  // static const String baseUrl = 'http://localhost:5000/api'; // Use for local browser dev
  static const String baseUrl = 'http://10.161.121.202:5000/api'; // Use for mobile device dev (matches current IP)

  // Donor
  static const String registerDonor = '/auth/register-donor';
  static const String profile = '/donors/profile';
  static const String updateProfile = '/donors/profile';
  static const String history = '/donations/history';
  static const String getAllDonors = '/donors';

  // Notifications
  static const String notifications = '/notifications';
  static const String respondNotification = '/notifications/respond';

  // Other
  static const String mapCoordinates = '/map/coordinates';
}

