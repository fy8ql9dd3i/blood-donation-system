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
      donationId: json['donationId'] ?? json['donationID'] ?? json['id'],
      donorId: json['donorId'] ?? json['donorID'],
      donationDate: DateTime.parse(json['donationDate']),
      location: json['location'],
      amount: json['amount'] ?? json['quantity'],
    );
  }
}
