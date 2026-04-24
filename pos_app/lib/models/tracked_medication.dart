class TrackedMedication {
  final String id;
  final String name;
  final int totalTablets;
  final int tabletsRemaining;
  final int frequencyHours; // 6, 8, 12, 24
  final DateTime? lastTakenTime;
  final DateTime nextScheduledTime;
  final bool isCompleted;

  const TrackedMedication({
    required this.id,
    required this.name,
    required this.totalTablets,
    required this.tabletsRemaining,
    required this.frequencyHours,
    this.lastTakenTime,
    required this.nextScheduledTime,
    this.isCompleted = false,
  });

  TrackedMedication copyWith({
    String? id,
    String? name,
    int? totalTablets,
    int? tabletsRemaining,
    int? frequencyHours,
    DateTime? lastTakenTime,
    DateTime? nextScheduledTime,
    bool? isCompleted,
  }) {
    return TrackedMedication(
      id: id ?? this.id,
      name: name ?? this.name,
      totalTablets: totalTablets ?? this.totalTablets,
      tabletsRemaining: tabletsRemaining ?? this.tabletsRemaining,
      frequencyHours: frequencyHours ?? this.frequencyHours,
      lastTakenTime: lastTakenTime ?? this.lastTakenTime,
      nextScheduledTime: nextScheduledTime ?? this.nextScheduledTime,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'totalTablets': totalTablets,
      'tabletsRemaining': tabletsRemaining,
      'frequencyHours': frequencyHours,
      'lastTakenTime': lastTakenTime?.toIso8601String(),
      'nextScheduledTime': nextScheduledTime.toIso8601String(),
      'isCompleted': isCompleted,
    };
  }

  factory TrackedMedication.fromJson(Map<String, dynamic> json) {
    return TrackedMedication(
      id: json['id'],
      name: json['name'],
      totalTablets: json['totalTablets'],
      tabletsRemaining: json['tabletsRemaining'],
      frequencyHours: json['frequencyHours'],
      lastTakenTime: json['lastTakenTime'] != null ? DateTime.parse(json['lastTakenTime']) : null,
      nextScheduledTime: DateTime.parse(json['nextScheduledTime']),
      isCompleted: json['isCompleted'] ?? false,
    );
  }
}
