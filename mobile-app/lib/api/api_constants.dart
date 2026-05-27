import 'package:flutter/foundation.dart';

// lib/api/api_constants.dart
class ApiConstants {
  // Base URL – use the physical device address (update for your network)
  static const String baseUrl = kIsWeb
      ? 'http://localhost:5000/api'
      : 'http://10.196.242.198:5000/api';

  // ─── Auth endpoints ────────────────────────────────────────────────
  static const String registerDonor     = '/auth/register-donor';
  static const String login             = '/auth/login';
  static const String checkPhone        = '/auth/check-phone'; // GET /auth/check-phone/:phone

  // ─── Donor endpoints ───────────────────────────────────────────────
  static const String profile           = '/donors/profile';    // GET/PUT (needs token)
  static const String updateProfile     = '/donors/profile';
  static const String updateDeviceToken = '/donors/device-token';

  // ─── Donation history ──────────────────────────────────────────────
  static const String history           = '/donations/history'; // GET (needs token)

  // ─── Notifications ─────────────────────────────────────────────────
  static const String notifications     = '/notifications';                      // GET (donor)
  static const String respondNotification = '/notifications/respond';

  // ─── News / Announcements ──────────────────────────────────────────
  static const String news              = '/news';              // GET (public)

  // ─── Appreciation Letters ──────────────────────────────────────────
  // Letters targeted to a specific donor are delivered via Notifications
  // The donor sees them as notifications of type GENERAL with title containing "Thank"
}
