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
    'packages/contracts/schemas/metric-tile.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final title = scenario.props['title'] as String? ?? 'Metric';
        final value = scenario.props['value'] as String? ?? '0';
        final delta = (scenario.props['delta'] as num?)?.toDouble();
        final loading = scenario.props['loading'] as bool? ?? false;
        final trendStr = scenario.props['trend'] as String?;
        final JoyMetricTrend? trend = trendStr == 'up'
            ? JoyMetricTrend.up
            : trendStr == 'down'
                ? JoyMetricTrend.down
                : trendStr == 'neutral'
                    ? JoyMetricTrend.neutral
                    : null;

        await tester.pumpWidget(
          _buildContractApp(
            JoyMetricTile(
              title: title,
              value: value,
              delta: delta,
              trend: trend,
              loading: loading,
              onTap: () => tracker.trigger('tap'),
            ),
          ),
        );
        if (loading) {
          await tester.pump();
        } else {
          await tester.pumpAndSettle();
        }

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap':
              await tester.tap(find.byType(JoyMetricTile));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in metric-tile contract runner',
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
          final renderSize = tester.getSize(find.byType(JoyMetricTile));
          expect(
            renderSize.width,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.width),
            reason:
                'Width ${renderSize.width} < minTouchTarget ${scenario.expect.minTouchTarget!.width}',
          );
          expect(
            renderSize.height,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.height),
            reason:
                'Height ${renderSize.height} < minTouchTarget ${scenario.expect.minTouchTarget!.height}',
          );
        }
      });
    }
  });
}
