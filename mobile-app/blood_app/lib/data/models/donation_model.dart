class DonationModel {
  final int donationId;
  final int donorId;
  final DateTime donationDate;
  final String? location;
  final int amount; // in ml

  DonationModel({
    required this.donationId,
    required this.donorId,
    required this.donationDate,
    this.location,
    required this.amount,
  });

  factory DonationModel.fromJson(Map<String, dynamic> json) {
    return DonationModel(
      donationId: json['donationId'],
      donorId: json['donorId'],
      donationDate: DateTime.parse(json['donationDate']),
      location: json['location'],
      amount: json['amount'],
    );
  }
}
