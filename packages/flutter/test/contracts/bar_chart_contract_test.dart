import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';
import 'contract_runner.dart';

Widget _buildContractApp(Widget child) {
  return MaterialApp(
    theme: JoyTheme.themeData(JoyThemeTokens.light),
    home: Scaffold(
      body: SizedBox(
        width: 800,
        height: 500,
        child: child,
      ),
    ),
  );
}

void main() {
  final suite = ContractSuite.loadFromFile(
    'packages/contracts/schemas/bar-chart.contract.json',
  );

  final List<JoyBarData> sampleData = [
    const JoyBarData(category: 'Mon', value: 45.0, label: 'Mon'),
    const JoyBarData(category: 'Tue', value: 80.0, label: 'Tue'),
    const JoyBarData(category: 'Wed', value: 65.0, label: 'Wed'),
    const JoyBarData(category: 'Thu', value: 95.0, label: 'Thu'),
  ];

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final height = (scenario.props['height'] as num?)?.toDouble() ?? 320.0;
        final showGrid = scenario.props['showGrid'] as bool? ?? true;

        await tester.pumpWidget(
          _buildContractApp(
            JoyBarChart(
              data: sampleData,
              height: height,
              showGrid: showGrid,
              onHover: (bar) {
                if (bar != null) tracker.trigger('hover');
              },
            ),
          ),
        );
        await tester.pumpAndSettle();

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'hover':
              final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
              await gesture.addPointer(location: Offset.zero);
              addTearDown(gesture.removePointer);
              final chartCenter = tester.getCenter(find.byType(JoyBarChart));
              await gesture.moveTo(chartCenter);
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in bar chart contract runner',
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
