import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';
import 'contract_runner.dart';

Widget _buildContractApp(Widget child) {
  return MaterialApp(
    theme: JoyTheme.themeData(JoyThemeTokens.light),
    home: Scaffold(
      body: Center(child: child),
    ),
  );
}

void main() {
  final suite = ContractSuite.loadFromFile(
    'packages/contracts/schemas/switch.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final value = scenario.props['value'] as bool? ?? false;
        final disabled = scenario.props['disabled'] as bool? ?? false;
        final loading = scenario.props['loading'] as bool? ?? false;
        final sizeStr = scenario.props['size'] as String? ?? 'md';

        final size = JoySwitchSize.values.firstWhere(
          (s) => s.name == sizeStr,
          orElse: () => JoySwitchSize.md,
        );

        await tester.pumpWidget(
          _buildContractApp(
            JoySwitch(
              value: value,
              disabled: disabled,
              loading: loading,
              size: size,
              onChanged: (_) => tracker.trigger('change'),
            ),
          ),
        );

        // Execute scenario actions
        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap':
              await tester.tap(find.byType(JoySwitch));
              if (loading) {
                await tester.pump(const Duration(milliseconds: 50));
              } else {
                await tester.pumpAndSettle();
              }
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in switch contract runner',
              );
          }
        }

        // Verify event counts
        for (final expectedEvent in scenario.expect.events.entries) {
          final actualCount = tracker.count(expectedEvent.key);
          expect(
            actualCount,
            equals(expectedEvent.value),
            reason:
                'Event "${expectedEvent.key}" count mismatch for scenario ${scenario.id}',
          );
        }

        // Verify minimum touch target constraints
        if (scenario.expect.minTouchTarget != null) {
          final renderSize = tester.getSize(find.byType(JoySwitch));
          expect(
            renderSize.width,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.width),
          );
          expect(
            renderSize.height,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.height),
          );
        }
      });
    }
  });
}
