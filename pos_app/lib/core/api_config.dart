import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000';
    }
    
    if (Platform.isAndroid) {
      // Android emulator points to 10.0.2.2 for host localhost
      return 'http://10.0.2.2:8000';
    } else if (Platform.isWindows || Platform.isMacOS || Platform.isLinux) {
      return 'http://localhost:8000';
    }
    
    return 'http://localhost:8000';
  }
  
  static const String apiVersion = 'v1';
  static String get apiUrl => '$baseUrl/api/$apiVersion';
}
