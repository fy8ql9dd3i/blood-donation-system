class NotificationModel {
  final String id;
  final int donorId;
  final String title;
  final String message;
  final String type; // EMERGENCY / REMINDER / GENERAL
  final bool read;
  final String language;
  final String response; // PENDING / ACCEPTED / DECLINED / NO_RESPONSE
  final DateTime? responseDate;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.donorId,
    required this.title,
    required this.message,
    required this.type,
    required this.read,
    required this.language,
    required this.response,
    this.responseDate,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? '',
      donorId: json['donorId'] ?? 0,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'GENERAL',
      read: json['read'] ?? false,
      language: json['language'] ?? 'en',
      response: json['response'] ?? 'PENDING',
      responseDate: json['responseDate'] != null
          ? DateTime.tryParse(json['responseDate'])
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'donorId': donorId,
      'title': title,
      'message': message,
      'type': type,
      'read': read,
      'language': language,
      'response': response,
      'responseDate': responseDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
