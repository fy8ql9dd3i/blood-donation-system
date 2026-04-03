import '../models/donor_model.dart';
import '../models/donation_model.dart';
import '../services/donor_service.dart';

class DonorRepository {
  final DonorService _donorService;

  DonorRepository({required DonorService donorService})
    : _donorService = donorService;

  Future<DonorModel> getProfile() async {
    final data = await _donorService.getProfile();
    return DonorModel.fromJson(data);
  }

  Future<void> updateProfile(DonorModel donor) async {
    await _donorService.updateProfile(donor.toJson());
  }

  Future<List<DonationModel>> getHistory() async {
    final list = await _donorService.getHistory();
    return list.map((json) => DonationModel.fromJson(json)).toList();
  }
}
