class DonationModel {
  final int id;
  final int donorId;
  final DateTime collectionDate;
  final String bloodType;
  final int units;

  DonationModel({
    required this.id,
    required this.donorId,
    required this.collectionDate,
    required this.bloodType,
    required this.units,
  });

  factory DonationModel.fromJson(Map<String, dynamic> json) {
    return DonationModel(
      id: json['id'] ?? 0,
      donorId: json['donorId'] ?? 0,
      collectionDate: DateTime.parse(json['collectionDate'] ?? DateTime.now().toIso8601String()),
      bloodType: json['bloodType'] ?? 'Unknown',
      units: json['units'] ?? 0,
    );
  }
}
