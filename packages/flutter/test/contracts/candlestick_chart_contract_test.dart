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
    'packages/contracts/schemas/candlestick-chart.contract.json',
  );

  final sampleData = [
    JoyCandleData(
      time: DateTime.utc(2026, 10, 5, 9, 30),
      open: 150.0,
      high: 155.0,
      low: 148.0,
      close: 153.0,
      volume: 12000,
    ),
    JoyCandleData(
      time: DateTime.utc(2026, 10, 5, 9, 31),
      open: 153.0,
      high: 154.0,
      low: 151.0,
      close: 152.0,
      volume: 8500,
    ),
    JoyCandleData(
      time: DateTime.utc(2026, 10, 5, 9, 32),
      open: 152.0,
      high: 158.0,
      low: 151.5,
      close: 157.0,
      volume: 16400,
    ),
  ];

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final height = (scenario.props['height'] as num?)?.toDouble() ?? 360.0;
        final showGrid = scenario.props['showGrid'] as bool? ?? true;
        final showCrosshair = scenario.props['showCrosshair'] as bool? ?? true;

        await tester.pumpWidget(
          _buildContractApp(
            JoyCandlestickChart(
              data: sampleData,
              height: height,
              showGrid: showGrid,
              showCrosshair: showCrosshair,
              onHover: (candle) {
                if (candle != null) tracker.trigger('hover');
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
              final chartCenter = tester.getCenter(find.byType(JoyCandlestickChart));
              await gesture.moveTo(chartCenter);
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in candlestick chart contract runner',
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
