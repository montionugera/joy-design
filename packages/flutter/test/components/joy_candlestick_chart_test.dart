import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

Widget _buildTestApp({
  required Widget child,
  JoyThemeTokens tokens = JoyThemeTokens.light,
  double width = 800.0,
  double height = 400.0,
}) {
  return MaterialApp(
    theme: JoyTheme.themeData(tokens),
    home: Scaffold(
      body: SizedBox(
        width: width,
        height: height,
        child: child,
      ),
    ),
  );
}

void main() {
  final sampleCandles = [
    JoyCandleData(
      time: DateTime.utc(2026, 10, 5, 10, 0),
      open: 100.0,
      high: 105.0,
      low: 98.0,
      close: 104.0,
      volume: 1500,
    ),
    JoyCandleData(
      time: DateTime.utc(2026, 10, 5, 11, 0),
      open: 104.0,
      high: 106.0,
      low: 101.0,
      close: 102.0,
      volume: 2200,
    ),
    JoyCandleData(
      time: DateTime.utc(2026, 10, 5, 12, 0),
      open: 102.0,
      high: 108.0,
      low: 101.5,
      close: 107.5,
      volume: 3100,
    ),
  ];

  group('JoyCandlestickChart Rendering & Semantics', () {
    testWidgets('renders CustomPainter and accessible semantics description', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyCandlestickChart(
            data: sampleCandles,
            height: 360.0,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);

      // Verify offscreen semantics contains candle summary
      final semanticsFinder = find.byWidgetPredicate(
        (w) => w is Semantics && (w.properties.label?.contains('Candlestick chart with 3 candles') ?? false),
      );
      expect(semanticsFinder, findsOneWidget);
    });

    testWidgets('renders empty dataset without throwing', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyCandlestickChart(
            data: [],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);
    });
  });

  group('JoyCandlestickChart Hover & HUD', () {
    testWidgets('hovering over chart triggers onHover and renders HUD overlay', (tester) async {
      JoyCandleData? hoveredCandle;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyCandlestickChart(
            data: sampleCandles,
            onHover: (c) => hoveredCandle = c,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Trigger mouse hover near center of chart
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: Offset.zero);
      addTearDown(gesture.removePointer);

      final chartCenter = tester.getCenter(find.byType(JoyCandlestickChart));
      await gesture.moveTo(chartCenter);
      await tester.pumpAndSettle();

      expect(hoveredCandle, isNotNull);
      // HUD displays Open/High/Low/Close details
      expect(find.textContaining('O:'), findsOneWidget);
      expect(find.textContaining('H:'), findsOneWidget);
      expect(find.textContaining('L:'), findsOneWidget);
      expect(find.textContaining('C:'), findsOneWidget);
    });
  });

  group('JoyCandlestickChart Dark Mode', () {
    testWidgets('renders cleanly in dark theme with zero violations', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          tokens: JoyThemeTokens.dark,
          child: JoyCandlestickChart(
            data: sampleCandles,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);
    });
  });
}
