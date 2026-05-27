class NewsModel {
  final String id;
  final String title;
  final String content;
  final String? imageUrl;
  final String language;
  final bool isActive;
  final DateTime createdAt;

  NewsModel({
    required this.id,
    required this.title,
    required this.content,
    this.imageUrl,
    required this.language,
    required this.isActive,
    required this.createdAt,
  });

  factory NewsModel.fromJson(Map<String, dynamic> json) {
    return NewsModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      imageUrl: json['imageUrl'],
      language: json['language'] ?? 'en',
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'imageUrl': imageUrl,
      'language': language,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
