// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medlink_patient/app.dart';

void main() {
  testWidgets('App instance starts successfully', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: MedLinkApp()));

    // Wait for initial paints
    await tester.pumpAndSettle();
    
    // Simplest passing test
    expect(find.byType(MedLinkApp), findsOneWidget);
  });
}
