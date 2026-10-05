import 'dart:convert';
import 'dart:io';

/// Touch target constraints defined by contract schema.
class ContractTouchTarget {
  final double width;
  final double height;

  const ContractTouchTarget({required this.width, required this.height});

  factory ContractTouchTarget.fromJson(Map<String, dynamic> json) {
    return ContractTouchTarget(
      width: (json['width'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
    );
  }
}

/// Scenario expectations: fired event counts and hit-bounds constraints.
class ContractExpect {
  final Map<String, int> events;
  final ContractTouchTarget? minTouchTarget;

  const ContractExpect({
    this.events = const <String, int>{},
    this.minTouchTarget,
  });

  factory ContractExpect.fromJson(Map<String, dynamic> json) {
    final rawEvents = json['events'] as Map<String, dynamic>?;
    final events = <String, int>{};
    if (rawEvents != null) {
      for (final entry in rawEvents.entries) {
        events[entry.key] = (entry.value as num).toInt();
      }
    }

    final rawTarget = json['minTouchTarget'] as Map<String, dynamic>?;
    final minTouchTarget = rawTarget != null
        ? ContractTouchTarget.fromJson(rawTarget)
        : null;

    return ContractExpect(
      events: events,
      minTouchTarget: minTouchTarget,
    );
  }
}

/// Action to execute on the component during scenario evaluation.
class ContractAction {
  final String type;

  const ContractAction({required this.type});

  factory ContractAction.fromJson(Map<String, dynamic> json) {
    return ContractAction(
      type: json['type'] as String,
    );
  }
}

/// A single contract test scenario.
class ContractScenario {
  final String id;
  final String description;
  final Map<String, dynamic> props;
  final List<ContractAction> actions;
  final ContractExpect expect;

  const ContractScenario({
    required this.id,
    required this.description,
    required this.props,
    required this.actions,
    required this.expect,
  });

  factory ContractScenario.fromJson(Map<String, dynamic> json) {
    final rawActions = json['actions'] as List<dynamic>? ?? <dynamic>[];
    final actions = rawActions
        .map((a) => ContractAction.fromJson(a as Map<String, dynamic>))
        .toList();

    return ContractScenario(
      id: json['id'] as String,
      description: json['description'] as String,
      props: json['props'] as Map<String, dynamic>? ?? <String, dynamic>{},
      actions: actions,
      expect: ContractExpect.fromJson(json['expect'] as Map<String, dynamic>),
    );
  }
}

/// Contract suite loaded from a JSON contract schema file.
class ContractSuite {
  final String component;
  final String version;
  final List<ContractScenario> scenarios;

  const ContractSuite({
    required this.component,
    required this.version,
    required this.scenarios,
  });

  factory ContractSuite.fromJson(Map<String, dynamic> json) {
    final rawScenarios = json['scenarios'] as List<dynamic>? ?? <dynamic>[];
    final scenarios = rawScenarios
        .map((s) => ContractScenario.fromJson(s as Map<String, dynamic>))
        .toList();

    return ContractSuite(
      component: json['component'] as String,
      version: json['version'] as String,
      scenarios: scenarios,
    );
  }

  /// Locates and loads contract JSON schema file relative to repository or package root.
  static ContractSuite loadFromFile(String relativePath) {
    final candidates = <String>[
      relativePath,
      '../../$relativePath',
      '../$relativePath',
      '../../../$relativePath',
    ];
    for (final candidate in candidates) {
      final file = File(candidate);
      if (file.existsSync()) {
        final content = file.readAsStringSync();
        final json = jsonDecode(content) as Map<String, dynamic>;
        return ContractSuite.fromJson(json);
      }
    }
    throw StateError('Cannot locate contract file at $relativePath');
  }
}

/// Helper tracking event invocations during contract scenario tests.
class ContractEventTracker {
  final Map<String, int> _counts = <String, int>{};

  void trigger(String eventName) {
    _counts[eventName] = (_counts[eventName] ?? 0) + 1;
  }

  int count(String eventName) => _counts[eventName] ?? 0;
}
