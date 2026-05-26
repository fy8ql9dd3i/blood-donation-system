import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  final List<Marker> _markers = [];
  final LatLng _initialPosition = const LatLng(9.0227, 38.7468); // Addis Ababa
  bool _isLoadingStaff = false;
  bool _useGoogleStreet = true;

  Future<void> _findStaffAndCenters() async {
    setState(() => _isLoadingStaff = true);
    try {
      final response = await context.read<ApiClient>().get('/hospitals/public');
      if (response.statusCode == 200) {
        final data = response.data['data'] as List;
        setState(() {
          _markers.clear();
          for (var center in data) {
            if (center['latitude'] != null && center['longitude'] != null) {
              final latLng = LatLng(
                double.parse(center['latitude'].toString()),
                double.parse(center['longitude'].toString())
              );
              _markers.add(
                Marker(
                  point: latLng,
                  width: 50,
                  height: 50,
                  child: Column(
                    children: [
                      const Icon(Icons.local_hospital_rounded, color: Colors.red, size: 30),
                      Text(
                        center['name'].toString().split(' ').first, 
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, backgroundColor: Colors.white),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            }
          }
        });
        if (_markers.isNotEmpty) {
          _mapController.move(_markers.first.point, 12.0);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Found ${_markers.length} staff centers!')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No staff centers found with locations.')),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error finding staff: $e')),
      );
    } finally {
      setState(() => _isLoadingStaff = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('find_donor_centers'.tr())),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'enter_address'.tr(),
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(),
              ),
              onSubmitted: (value) async {
                try {
                  final response = await context.read<ApiClient>().post(
                    ApiConstants.mapCoordinates,
                    data: {'address': value},
                  );
                  final location = response.data['location'];
                  
                  if (location != null) {
                    final latLng = LatLng(
                      double.parse(location['latitude'].toString()),
                      double.parse(location['longitude'].toString())
                    );
                    _mapController.move(latLng, 14.0);
                    setState(() {
                      _markers.clear();
                      _markers.add(
                        Marker(
                          point: latLng,
                          width: 40,
                          height: 40,
                          child: const Icon(Icons.location_pin, color: Colors.red, size: 40),
                        ),
                      );
                    });
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('could_not_find_location'.tr())),
                  );
                }
              },
            ),
          ),
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _initialPosition,
                    initialZoom: 12.0,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: _useGoogleStreet
                          ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.example.blood_app',
                    ),
                    MarkerLayer(markers: _markers),
                  ],
                ),
                Positioned(
                  top: 16,
                  right: 16,
                  child: Card(
                    elevation: 4,
                    shape: const CircleBorder(),
                    child: FloatingActionButton.small(
                      heroTag: 'map_layer_toggle',
                      onPressed: () {
                        setState(() {
                          _useGoogleStreet = !_useGoogleStreet;
                        });
                        ScaffoldMessenger.of(context).hideCurrentSnackBar();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(_useGoogleStreet 
                                ? 'Switched to Google Maps Street view' 
                                : 'Switched to OpenStreetMap view'),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      backgroundColor: Colors.white,
                      child: Icon(
                        _useGoogleStreet ? Icons.map_rounded : Icons.satellite_rounded,
                        color: Colors.red.shade700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isLoadingStaff ? null : _findStaffAndCenters,
        backgroundColor: Colors.red.shade700,
        icon: _isLoadingStaff 
            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Icon(Icons.people_alt_rounded, color: Colors.white),
        label: const Text('Find Staff', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
