import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/notification_service.dart';
import '../models/notification_model.dart';
import '../services/storage_service.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({Key? key}) : super(key: key);

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeAndLoad();
  }

  Future<void> _initializeAndLoad() async {
    // Load initial notifications
    await _loadNotifications();

    // Initialize socket for real-time alerts
    _initializeSocketListener();
  }

  Future<void> _initializeSocketListener() async {
    try {
      final donorId = StorageService.getDonorId();
      if (donorId != null) {
        await NotificationService.initializeSocket(donorId);

        // Register callback for emergency alerts
        NotificationService.onEmergencyAlert((alert) {
          if (mounted) {
            setState(() {
              // Check if notification already exists
              final exists = _notifications.any((n) => n.id == alert.id);
              if (!exists) {
                _notifications.insert(0, alert); // Add to top
              }
            });

            // Show local notification popup
            _showAlertNotification(alert);
          }
        });

        print('[Emergency Screen] Socket listener initialized');
      }
    } catch (e) {
      print('[Emergency Screen] Socket initialization error: $e');
    }
  }

  void _showAlertNotification(NotificationModel alert) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    alert.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    alert.message,
                    style: const TextStyle(color: Colors.white70),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: Colors.red.shade900,
        duration: const Duration(seconds: 10),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    final list = await NotificationService.getNotifications();
    // Filter to only include EMERGENCY or REMINDER types
    final filtered = list
        .where((n) => n.type == 'EMERGENCY' || n.type == 'REMINDER')
        .toList();
    if (mounted) {
      setState(() {
        _notifications = filtered;
        _isLoading = false;
      });
    }
  }

  Future<void> _respond(String id, String status) async {
    // Optimistic UI state update
    setState(() {
      _notifications = _notifications.map((n) {
        if (n.id == id) {
          // recreate notification model with updated response
          return NotificationModel(
            id: n.id,
            donorId: n.donorId,
            title: n.title,
            message: n.message,
            type: n.type,
            read: true,
            language: n.language,
            response: status,
            responseDate: DateTime.now(),
            createdAt: n.createdAt,
          );
        }
        return n;
      }).toList();
    });

    final result = await NotificationService.respondToEmergency(id, status);
    if (result['success'] == true) {
      _showSnackBar(
        status == 'ACCEPTED'
            ? 'Thank you! Your acceptance has been recorded.'
            : 'You declined this request.',
        Colors.green.shade700,
      );
    } else {
      _showSnackBar(
        result['message'] ?? 'Failed to submit response. Retrying...',
        Colors.red.shade700,
      );
      // Revert loading state
      _loadNotifications();
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  void dispose() {
    NotificationService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeColor = const Color(0xFFB71C1C);

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        backgroundColor: themeColor,
        elevation: 0,
        title: const Text('🚨 Emergency & Reminders',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (!NotificationService.isConnected())
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Tooltip(
                message: 'Connecting to real-time alerts...',
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation(Colors.yellow.shade700),
                    strokeWidth: 2,
                  ),
                ),
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Tooltip(
                message: 'Connected to real-time alerts',
                child: Icon(
                  Icons.cloud_done,
                  color: Colors.green.shade300,
                ),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadNotifications,
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation(Color(0xFFB71C1C))))
            : _notifications.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final item = _notifications[index];
                      return _buildNotificationCard(item, themeColor);
                    },
                  ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.25),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.notifications_off_outlined,
                  size: 72, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              const Text(
                'No Alerts Found',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87),
              ),
              const SizedBox(height: 6),
              const Text(
                'You have no urgent emergency requests or eligibility reminders.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black54),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNotificationCard(NotificationModel item, Color themeColor) {
    final bool isEmergency = item.type == 'EMERGENCY';
    final DateFormat formatter = DateFormat('MMM dd, yyyy - hh:mm a');

    return Card(
      elevation: 3,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (isEmergency ? Colors.red : Colors.blue)
                        .withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isEmergency
                        ? Icons.warning_amber_rounded
                        : Icons.calendar_today_outlined,
                    color: isEmergency ? Colors.red : Colors.blue.shade700,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        formatter.format(item.createdAt),
                        style: const TextStyle(
                            fontSize: 11, color: Colors.black45),
                      ),
                    ],
                  ),
                ),
                if (!isEmergency)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Reminder',
                      style: TextStyle(
                          color: Colors.blue.shade800,
                          fontSize: 10,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              item.message,
              style: const TextStyle(
                  fontSize: 14, color: Colors.black87, height: 1.35),
            ),

            // Emergency Action Buttons
            if (isEmergency) ...[
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              if (item.response == 'PENDING')
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _respond(item.id, 'DECLINED'),
                      icon: const Icon(Icons.close, color: Colors.red),
                      label: const Text('Decline',
                          style: TextStyle(
                              color: Colors.red, fontWeight: FontWeight.w600)),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: () => _respond(item.id, 'ACCEPTED'),
                      icon: const Icon(Icons.check,
                          color: Colors.white, size: 18),
                      label: const Text('Accept',
                          style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade700,
                        elevation: 1,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                )
              else
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: item.response == 'ACCEPTED'
                            ? Colors.green.withOpacity(0.12)
                            : Colors.red.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            item.response == 'ACCEPTED'
                                ? Icons.check_circle
                                : Icons.cancel,
                            color: item.response == 'ACCEPTED'
                                ? Colors.green.shade700
                                : Colors.red.shade700,
                            size: 18,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            item.response == 'ACCEPTED'
                                ? 'Response: Accepted'
                                : 'Response: Declined',
                            style: TextStyle(
                              color: item.response == 'ACCEPTED'
                                  ? Colors.green.shade700
                                  : Colors.red.shade700,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
            ],
          ],
        ),
      ),
    );
  }
}
