import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // Override with: flutter run --dart-define=API_BASE_URL=http://192.168.1.20:8000
  static const String _overrideBaseUrl = String.fromEnvironment('API_BASE_URL');

  // Android emulator reaches the host machine through 10.0.2.2.
  static const String androidEmulatorBaseUrl = 'http://10.0.2.2:8000';

  // Update this to Eyasu's current LAN IP when using a physical device.
  static const String eyasuLocalBaseUrl = 'http://192.168.1.20:8000';

  // Fallback hosted backend.
  static const String renderBaseUrl = 'https://ethio-pharma.onrender.com';

  static String get baseUrl {
    if (_overrideBaseUrl.isNotEmpty) {
      return _overrideBaseUrl;
    }

    // Default to Render URL for production/testing
    return renderBaseUrl;
  }

  static const String apiVersion = 'v1';
  static String get apiUrl => '$baseUrl/api/$apiVersion';
}
