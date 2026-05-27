class DonationModel {
  final int id;
  final int donorId;
  final DateTime collectionDate;
  final String bloodType;
  final int units;
  final int? labTestId;
  final DateTime createdAt;

  DonationModel({
    required this.id,
    required this.donorId,
    required this.collectionDate,
    required this.bloodType,
    required this.units,
    this.labTestId,
    required this.createdAt,
  });

  factory DonationModel.fromJson(Map<String, dynamic> json) {
    return DonationModel(
      id: json['id'] ?? 0,
      donorId: json['donorId'] ?? 0,
      collectionDate: json['collectionDate'] != null
          ? DateTime.tryParse(json['collectionDate']) ?? DateTime.now()
          : DateTime.now(),
      bloodType: json['bloodType'] ?? '',
      units: json['units'] ?? 0,
      labTestId: json['lab_test_id'] ?? json['labTestId'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'donorId': donorId,
      'collectionDate': collectionDate.toIso8601String(),
      'bloodType': bloodType,
      'units': units,
      'lab_test_id': labTestId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
