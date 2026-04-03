import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geocoding/geocoding.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  late GoogleMapController _mapController;
  final Set<Marker> _markers = {};
  LatLng _initialPosition = const LatLng(9.0227, 38.7468); // Addis Ababa

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Find Donor Centers')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Enter address',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onSubmitted: (value) async {
                try {
                  List<Location> locations = await locationFromAddress(value);
                  if (locations.isNotEmpty) {
                    final loc = locations.first;
                    final latLng = LatLng(loc.latitude, loc.longitude);
                    _mapController.animateCamera(
                      CameraUpdate.newLatLngZoom(latLng, 14),
                    );
                    setState(() {
                      _markers.clear();
                      _markers.add(
                        Marker(
                          markerId: const MarkerId('search'),
                          position: latLng,
                          infoWindow: InfoWindow(title: value),
                        ),
                      );
                    });
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Could not find location: $e')),
                  );
                }
              },
            ),
          ),
          Expanded(
            child: GoogleMap(
              onMapCreated: (controller) => _mapController = controller,
              initialCameraPosition: CameraPosition(
                target: _initialPosition,
                zoom: 12,
              ),
              markers: _markers,
              myLocationEnabled: true,
            ),
          ),
        ],
      ),
    );
  }
}
