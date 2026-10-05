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
    'packages/contracts/schemas/line-chart.contract.json',
  );

  const sampleData = [
    JoyPointData(x: 0, y: 100.0, label: '09:00'),
    JoyPointData(x: 1, y: 125.0, label: '10:00'),
    JoyPointData(x: 2, y: 110.0, label: '11:00'),
    JoyPointData(x: 3, y: 140.0, label: '12:00'),
  ];

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final height = (scenario.props['height'] as num?)?.toDouble() ?? 320.0;
        final showGrid = scenario.props['showGrid'] as bool? ?? true;
        final showArea = scenario.props['showArea'] as bool? ?? true;

        await tester.pumpWidget(
          _buildContractApp(
            JoyLineChart(
              data: sampleData,
              height: height,
              showGrid: showGrid,
              showArea: showArea,
              onHover: (point) {
                if (point != null) tracker.trigger('hover');
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
              final chartCenter = tester.getCenter(find.byType(JoyLineChart));
              await gesture.moveTo(chartCenter);
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in line chart contract runner',
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
