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
    'packages/contracts/schemas/tooltip.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final titleText = scenario.props['title'] as String? ?? 'Tooltip';

        await tester.pumpWidget(
          _buildContractApp(
            JoyTooltip.text(
              title: titleText,
              child: SizedBox(
                width: 44.0,
                height: 44.0,
                child: Center(child: Text(scenario.id)),
              ),
            ),
          ),
        );

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap':
              await tester.tap(find.text(scenario.id));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in tooltip contract runner',
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

        if (scenario.expect.minTouchTarget != null) {
          final renderSize = tester.getSize(find.byType(JoyTooltip));
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
