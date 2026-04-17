import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'screens/pos_main_screen.dart';

class EthioPharmaApp extends StatelessWidget {
  const EthioPharmaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ethio Pharma POS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const PosMainScreen(),
    );
  }
}
