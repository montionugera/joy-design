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
    'packages/contracts/schemas/tabs.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final activeKey = scenario.props['activeKey'] as String? ?? 'tab1';
        final typeStr = scenario.props['type'] as String? ?? 'line';
        final tabsType = typeStr == 'card' ? JoyTabsType.card : JoyTabsType.line;

        await tester.pumpWidget(
          _buildContractApp(
            JoyTabs(
              activeKey: activeKey,
              type: tabsType,
              onChange: (key) => tracker.trigger('change'),
              items: const [
                JoyTabItem.text(key: 'tab1', label: 'Tab 1'),
                JoyTabItem.text(key: 'tab2', label: 'Tab 2'),
                JoyTabItem.text(key: 'tab3', label: 'Tab 3', disabled: true),
              ],
            ),
          ),
        );

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap':
              await tester.tap(find.text('Tab 2'));
              await tester.pumpAndSettle();
            case 'tap_disabled':
              await tester.tap(find.text('Tab 3'));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in tabs contract runner',
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
          final tabTargetFinder = find.ancestor(
            of: find.text('Tab 1'),
            matching: find.byType(ConstrainedBox),
          );
          final touchSize = tester.getSize(tabTargetFinder.first);
          expect(
            touchSize.width,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.width),
          );
          expect(
            touchSize.height,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.height),
          );
        }
      });
    }
  });
}
