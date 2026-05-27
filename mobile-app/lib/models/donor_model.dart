class DonorModel {
  final int donorId;
  final int? userId;
  final String name;
  final int age;
  final String? gender;
  final String phone;
  final String address;
  final bool eligibilityStatus;
  final DateTime? lastDonationDate;
  final String? bloodType;
  final String status; // pending / approved / rejected
  final int totalDonations;
  final String language;

  DonorModel({
    required this.donorId,
    this.userId,
    required this.name,
    required this.age,
    this.gender,
    required this.phone,
    required this.address,
    required this.eligibilityStatus,
    this.lastDonationDate,
    this.bloodType,
    required this.status,
    required this.totalDonations,
    required this.language,
  });

  factory DonorModel.fromJson(Map<String, dynamic> json) {
    return DonorModel(
      donorId: json['donorID'] ?? json['donorId'] ?? 0,
      userId: json['userId'],
      name: json['name'] ?? '',
      age: json['age'] ?? 0,
      gender: json['gender'],
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      eligibilityStatus:
          json['eligibilityStatus'] ?? json['eligibilitystatus'] ?? false,
      lastDonationDate: json['lastDonationDate'] != null
          ? DateTime.tryParse(json['lastDonationDate'])
          : null,
      bloodType: json['bloodType'] ?? json['blood_type'],
      status: json['status'] ?? 'pending',
      totalDonations: json['totalDonations'] ?? 0,
      language: json['language'] ?? 'en',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'donorID': donorId,
      'userId': userId,
      'name': name,
      'age': age,
      'gender': gender,
      'phone': phone,
      'address': address,
      'eligibilityStatus': eligibilityStatus,
      'lastDonationDate': lastDonationDate?.toIso8601String(),
      'bloodType': bloodType,
      'status': status,
      'totalDonations': totalDonations,
      'language': language,
    };
  }
}
