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
    'packages/contracts/schemas/steps.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final current = (scenario.props['current'] as num?)?.toInt() ?? 0;
        final dirStr = scenario.props['direction'] as String? ?? 'horizontal';
        final direction = dirStr == 'vertical' ? Axis.vertical : Axis.horizontal;

        await tester.pumpWidget(
          _buildContractApp(
            JoySteps(
              current: current,
              direction: direction,
              onChange: (step) => tracker.trigger('change'),
              items: [
                JoyStepItem.text(title: 'Step 1', description: 'First'),
                JoyStepItem.text(title: 'Step 2', description: 'Second'),
                JoyStepItem.text(title: 'Step 3', description: 'Third', disabled: true),
              ],
            ),
          ),
        );

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap_step':
              await tester.tap(find.text('Step 2'));
              await tester.pumpAndSettle();
            case 'tap_disabled_step':
              await tester.tap(find.text('Step 3'));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in steps contract runner',
              );
          }
        }

        for (final expectedEvent in scenario.expect.events.entries) {
          final actualCount = tracker.count(expectedEvent.key);
          expect(
            actualCount,
            equals(expectedEvent.value),
            reason:
                'Event "${expectedEvent.key}" count mismatch for scenario ${scenario.id}',
          );
        }
      });
    }
  });
}
