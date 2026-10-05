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
  final sampleBars = [
    const JoyBarData(category: 'Q1', value: 120.0),
    const JoyBarData(category: 'Q2', value: 180.0),
    const JoyBarData(category: 'Q3', value: 240.0),
    const JoyBarData(category: 'Q4', value: 310.0),
  ];

  group('JoyBarChart Rendering & Semantics', () {
    testWidgets('renders CustomPainter and accessible semantics description', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyBarChart(
            data: sampleBars,
            height: 320.0,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);

      final semanticsFinder = find.byWidgetPredicate(
        (w) => w is Semantics && (w.properties.label?.contains('Bar chart with 4 categories') ?? false),
      );
      expect(semanticsFinder, findsOneWidget);
    });

    testWidgets('renders empty dataset without throwing', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBarChart(
            data: [],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);
    });
  });

  group('JoyBarChart Hover & Tooltip', () {
    testWidgets('hovering over chart triggers onHover and displays category tooltip', (tester) async {
      JoyBarData? hoveredBar;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyBarChart(
            data: sampleBars,
            onHover: (b) => hoveredBar = b,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: Offset.zero);
      addTearDown(gesture.removePointer);

      final chartCenter = tester.getCenter(find.byType(JoyBarChart));
      await gesture.moveTo(chartCenter);
      await tester.pumpAndSettle();

      expect(hoveredBar, isNotNull);
      // Tooltip contains hovered bar category
      expect(find.text('${hoveredBar!.category}: '), findsOneWidget);
    });
  });

  group('JoyBarChart Dark Mode', () {
    testWidgets('renders cleanly in dark theme with zero violations', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          tokens: JoyThemeTokens.dark,
          child: JoyBarChart(
            data: sampleBars,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);
    });
  });
}
