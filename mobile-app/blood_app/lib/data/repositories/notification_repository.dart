import '../models/notification_model.dart';
import '../services/notification_service.dart';

class NotificationRepository {
  final NotificationService _notificationService;

  NotificationRepository({required NotificationService notificationService})
    : _notificationService = notificationService;

  Future<List<NotificationModel>> getNotifications() async {
    final list = await _notificationService.getNotifications();
    return list.map((json) => NotificationModel.fromJson(json)).toList();
  }
}
