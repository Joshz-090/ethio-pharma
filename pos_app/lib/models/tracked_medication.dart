import 'package:flutter/material.dart';

class TrackedMedication {
  final String id;
  final String name;
  final String dosage; // e.g., "1 Tablet"
  final TimeOfDay scheduleTime;
  final String instructions; // e.g., "After meal"
  final bool isTakenToday;

  TrackedMedication({
    required this.id,
    required this.name,
    required this.dosage,
    required this.scheduleTime,
    this.instructions = '',
    this.isTakenToday = false,
  });

  TrackedMedication copyWith({
    String? id,
    String? name,
    String? dosage,
    TimeOfDay? scheduleTime,
    String? instructions,
    bool? isTakenToday,
  }) {
    return TrackedMedication(
      id: id ?? this.id,
      name: name ?? this.name,
      dosage: dosage ?? this.dosage,
      scheduleTime: scheduleTime ?? this.scheduleTime,
      instructions: instructions ?? this.instructions,
      isTakenToday: isTakenToday ?? this.isTakenToday,
    );
  }
}
