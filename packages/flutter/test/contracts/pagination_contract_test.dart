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
    'packages/contracts/schemas/pagination.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final current = (scenario.props['current'] as num?)?.toInt() ?? 1;
        final total = (scenario.props['total'] as num?)?.toInt() ?? 50;
        final pageSize = (scenario.props['pageSize'] as num?)?.toInt() ?? 10;
        final disabled = scenario.props['disabled'] as bool? ?? false;

        await tester.pumpWidget(
          _buildContractApp(
            JoyPagination(
              current: current,
              total: total,
              pageSize: pageSize,
              disabled: disabled,
              onChange: (page) => tracker.trigger('change'),
            ),
          ),
        );

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap_page_2':
              await tester.tap(find.text('2'));
              await tester.pumpAndSettle();
            case 'tap_next':
              final nextIcon = find.byWidgetPredicate(
                (w) => w is JoyIcon && w.icon == JoyIcons.chevronRight,
              );
              await tester.tap(nextIcon);
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in pagination contract runner',
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
          final pageTargetFinder = find.ancestor(
            of: find.text('1'),
            matching: find.byType(GestureDetector),
          );
          final touchSize = tester.getSize(pageTargetFinder.first);
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
