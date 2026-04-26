import 'package:flutter/foundation.dart' show kIsWeb;

class AppConfig {
  // Local Development (using your computer's LAN IP for physical device)
  static const String lanIp = '10.144.59.201';
  static const String localBaseUrl = 'http://$lanIp:8000/api';
  
  // Production Backend (Render)
  static const String productionBaseUrl = 'https://ethio-pharma.onrender.com/api';

  // Toggle this to switch between Local and Production
  static const bool useProduction = true;
  
  static String get apiBaseUrl => useProduction ? productionBaseUrl : localBaseUrl;
}
