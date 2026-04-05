class NotificationModel {
  final String id;
  final int donorId;
  final String title;
  final String message;
  final DateTime createdAt;
  final bool read;
  final String response;

  NotificationModel({
    required this.id,
    required this.donorId,
    required this.title,
    required this.message,
    required this.createdAt,
    required this.read,
    required this.response,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'].toString(), // UUID
      donorId: json['donorId'],
      title: json['title'],
      message: json['message'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      read: json['read'] ?? false,
      response: json['response'] ?? 'NO_RESPONSE',
    );
  }
}
