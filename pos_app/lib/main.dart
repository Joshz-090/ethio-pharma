import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'services/notification_service.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Notification Service
  await NotificationService().init();
  
  // Initialize API Service (loads tokens)
  await ApiService().init();
  
  runApp(
    const ProviderScope(
      child: MedLinkApp(),
    ),
  );
}
