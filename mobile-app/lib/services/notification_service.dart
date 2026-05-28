import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../api/api_constants.dart';
import '../models/notification_model.dart';
import 'storage_service.dart';

class NotificationService {
  static IO.Socket? _socket;
  static Function(NotificationModel)? _onEmergencyAlert;
  static Function(NotificationModel)? _onNewNotification;
  static bool _isConnected = false;

  static Map<String, String> _getHeaders() {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
    };
    final token = StorageService.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Initialize real-time socket connection for donor notifications
  static Future<void> initializeSocket(int donorId) async {
    try {
      if (_socket != null && _socket!.connected) {
        print('[Socket] Already connected');
        return;
      }

      // Extract base URL without path
      final baseUrl = ApiConstants.baseUrl.replaceAll(RegExp(r'/api/?$'), '');

      _socket = IO.io(
        baseUrl,
        IO.OptionBuilder().setTransports(['websocket', 'polling']).build(),
      );

      _socket!.onConnect((_) {
        print('[Socket] Connected to server');
        _isConnected = true;
        // Register donor ID with backend
        _socket!.emit('register_donor', donorId);
        print('[Socket] Registered donor: $donorId');
      });

      _socket!.on('emergency_alert', (data) {
        print('[Socket] Emergency alert received: $data');
        try {
          final alert = NotificationModel.fromJson(data);
          if (_onEmergencyAlert != null) {
            _onEmergencyAlert!(alert);
          }
        } catch (e) {
          print('[Socket] Error parsing alert: $e');
        }
      });

      _socket!.on('new_notification', (data) {
        print('[Socket] New notification received: $data');
        try {
          final notification = NotificationModel.fromJson(data);
          if (_onNewNotification != null) {
            _onNewNotification!(notification);
          }
        } catch (e) {
          print('[Socket] Error parsing new notification: $e');
        }
      });

      _socket!.on('connection_success', (data) {
        print('[Socket] Connection success: $data');
      });

      _socket!.onDisconnect((_) {
        print('[Socket] Disconnected from server');
        _isConnected = false;
      });

      _socket!.onError((error) {
        print('[Socket] Error: $error');
      });
    } catch (e) {
      print('Socket initialization error: $e');
    }
  }

  /// Register callback for emergency alerts
  static void onEmergencyAlert(Function(NotificationModel) callback) {
    _onEmergencyAlert = callback;
  }

  /// Register callback for new notifications (general/appreciation)
  static void onNewNotification(Function(NotificationModel) callback) {
    _onNewNotification = callback;
  }

  /// Disconnect socket
  static void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket = null;
      _isConnected = false;
      _onEmergencyAlert = null;
      _onNewNotification = null;
      print('[Socket] Disconnected');
    }
  }

  /// Check if socket is connected
  static bool isConnected() => _isConnected;

  /// Get notifications for the logged-in donor
  static Future<List<NotificationModel>> getNotifications() async {
    try {
      final url =
          Uri.parse('${ApiConstants.baseUrl}${ApiConstants.notifications}');
      final response = await http
          .get(
            url,
            headers: _getHeaders(),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final isSuccess =
            data['status'] == 'success' || data['success'] == true;
        if (isSuccess && data['data'] != null) {
          final List<dynamic> list = data['data'];
          return list.map((item) => NotificationModel.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Error getting notifications: $e');
      return [];
    }
  }

  /// Respond ACCEPTED or DECLINED to an emergency alert
  static Future<Map<String, dynamic>> respondToEmergency(
    String notificationId,
    String responseStatus,
  ) async {
    try {
      // POST /api/notifications/respond/:notificationId
      final url = Uri.parse(
          '${ApiConstants.baseUrl}${ApiConstants.respondNotification}/$notificationId');
      final response = await http
          .post(
            url,
            headers: _getHeaders(),
            body: jsonEncode({
              'response': responseStatus, // ACCEPTED or DECLINED
            }),
          )
          .timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      final isSuccess = data['status'] == 'success' || data['success'] == true;
      data['success'] = isSuccess;
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error responding to emergency: ${e.toString()}',
      };
    }
  }
}
