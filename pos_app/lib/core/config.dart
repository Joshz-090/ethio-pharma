class AppConfig {
  static const String baseUrl = 'https://ethio-pharma.onrender.com/api';
  
  // Use production link for all environments as requested by the user
  static const String emulatorBaseUrl = 'https://ethio-pharma.onrender.com/api';
  
  static String get apiBaseUrl => baseUrl;
}
