import '../../../core/models/donor_model.dart';
import '../../../core/models/donation_model.dart';
import 'donor_service.dart';
import 'package:url_launcher/url_launcher.dart';

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

  Future<List<DonationModel>> getHistory([String? phone]) async {
    final list = await _donorService.getHistory(phone);
    return list.map((json) => DonationModel.fromJson(json)).toList();
  }

  Future<bool> openExternalUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (await canLaunchUrl(url)) {
      return await launchUrl(url, mode: LaunchMode.externalApplication);
    }
    return false;
  }

  Future<String> reverseGeocode(double lat, double lon) async {
    return await _donorService.reverseGeocode(lat, lon);
  }
}
