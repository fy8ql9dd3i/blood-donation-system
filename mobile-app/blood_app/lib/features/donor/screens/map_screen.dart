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
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _initialPosition,
                initialZoom: 12.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.example.blood_app',
                ),
                MarkerLayer(markers: _markers),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
