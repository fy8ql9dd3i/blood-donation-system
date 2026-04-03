import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/repositories/notification_repository.dart';
import '../../../data/models/notification_model.dart';
import '../../../widgets/loading_widget.dart';
import '../widgets/notification_item.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: FutureBuilder<List<NotificationModel>>(
        future: context.read<NotificationRepository>().getNotifications(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No notifications'));
          }
          final notifications = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              return NotificationItem(notification: notifications[index]);
            },
          );
        },
      ),
    );
  }
}
