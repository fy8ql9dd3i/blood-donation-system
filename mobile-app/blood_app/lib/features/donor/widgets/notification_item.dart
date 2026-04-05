import 'package:flutter/material.dart';
import '../../../data/models/notification_model.dart';
import '../../../core/utils/helpers.dart';
import '../../../data/services/donor_service.dart';

class NotificationItem extends StatelessWidget {
  final NotificationModel notification;

  const NotificationItem({super.key, required this.notification});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(
          Icons.notifications,
          color: notification.read ? Colors.grey : Colors.red,
        ),
        title: Text(
          notification.title,
          style: TextStyle(
            fontWeight: notification.read ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(notification.message),
            const SizedBox(height: 4),
            Text(
              Helpers.formatDate(notification.createdAt),
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            if (notification.response == 'PENDING')
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Row(
                  children: [
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                      onPressed: () async {
                        await _handleResponse(context, 'ACCEPTED');
                      },
                      child: const Text('Accept', style: TextStyle(color: Colors.white)),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton(
                      onPressed: () async {
                        await _handleResponse(context, 'DECLINED');
                      },
                      child: const Text('Decline'),
                    ),
                  ],
                ),
              )
            else if (notification.response != 'NO_RESPONSE')
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  'Status: ${notification.response}',
                  style: TextStyle(
                    color: notification.response == 'ACCEPTED' ? Colors.green : Colors.red,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        isThreeLine: true,
      ),
    );
  }

  Future<void> _handleResponse(BuildContext context, String status) async {
    final success = await DonorService.respondNotification(
      notificationId: notification.id,
      responseStatus: status,
    );
    if (success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Successfully $status')),
      );
      // Let the parent rebuild or handle state reload if necessary
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update response')),
      );
    }
  }
}
