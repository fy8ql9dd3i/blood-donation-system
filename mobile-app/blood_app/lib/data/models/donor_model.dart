class DonorModel {
  final int donorID;
  final int userId;
  final String name;
  final int age;
  final String? bloodType;
  final String? phoneNumber;
  final DateTime? lastDonationDate;
  final bool eligibilityStatus;
  final DateTime registrationDate;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String language;

  DonorModel({
    required this.donorID,
    required this.userId,
    required this.name,
    required this.age,
    this.bloodType,
    this.phoneNumber,
    this.lastDonationDate,
    required this.eligibilityStatus,
    required this.registrationDate,
    this.address,
    this.latitude,
    this.longitude,
    required this.language,
  });

  factory DonorModel.fromJson(Map<String, dynamic> json) {
    return DonorModel(
      donorID: json['donorID'],
      userId: json['userId'],
      name: json['name'],
      age: json['age'],
      bloodType: json['bloodType'],
      phoneNumber: json['phoneNumber'],
      lastDonationDate: json['lastDonationDate'] != null
          ? DateTime.parse(json['lastDonationDate'])
          : null,
      eligibilityStatus: json['eligibilityStatus'],
      registrationDate: DateTime.parse(json['registrationDate']),
      address: json['address'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      language: json['language'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'donorID': donorID,
      'userId': userId,
      'name': name,
      'age': age,
      'bloodType': bloodType,
      'phoneNumber': phoneNumber,
      'lastDonationDate': lastDonationDate?.toIso8601String(),
      'eligibilityStatus': eligibilityStatus,
      'registrationDate': registrationDate.toIso8601String(),
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'language': language,
    };
  }
}
