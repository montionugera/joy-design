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
    'packages/contracts/schemas/badge.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final count = (scenario.props['count'] as num?)?.toInt();
        final overflowCount = (scenario.props['overflowCount'] as num?)?.toInt() ?? 99;
        final dot = scenario.props['dot'] as bool? ?? false;
        final statusStr = scenario.props['status'] as String? ?? 'defaultStatus';

        final status = JoyBadgeStatus.values.firstWhere(
          (s) => s.name == statusStr,
          orElse: () => JoyBadgeStatus.defaultStatus,
        );

        await tester.pumpWidget(
          _buildContractApp(
            JoyBadge(
              count: count,
              overflowCount: overflowCount,
              dot: dot,
              status: status,
            ),
          ),
        );

        // Execute scenario actions
        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap':
              await tester.tap(find.byType(JoyBadge));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in badge contract runner',
              );
          }
        }

        // Specific scenario assertions
        if (scenario.id == 'badge_count_default') {
          expect(find.text('$count'), findsOneWidget);
        } else if (scenario.id == 'badge_count_overflow') {
          expect(find.text('$overflowCount+'), findsOneWidget);
        } else if (scenario.id == 'badge_dot_indicator') {
          expect(find.byType(JoyBadge), findsOneWidget);
          expect(find.byType(Text), findsNothing);
        }

        // Verify event counts
        for (final expectedEvent in scenario.expect.events.entries) {
          final actualCount = tracker.count(expectedEvent.key);
          expect(
            actualCount,
            equals(expectedEvent.value),
            reason: 'Event "${expectedEvent.key}" count mismatch for scenario ${scenario.id}',
          );
        }

        // Verify minimum touch target constraints
        if (scenario.expect.minTouchTarget != null) {
          final renderSize = tester.getSize(find.byType(JoyBadge));
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
