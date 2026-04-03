class NotificationModel {
  final int id;
  final int donorId;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool read;

  NotificationModel({
    required this.id,
    required this.donorId,
    required this.title,
    required this.body,
    required this.createdAt,
    required this.read,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      donorId: json['donorId'],
      title: json['title'],
      body: json['body'],
      createdAt: DateTime.parse(json['createdAt']),
      read: json['read'],
    );
  }
}
