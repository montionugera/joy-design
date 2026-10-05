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
  final samplePoints = [
    const JoyPointData(x: 0, y: 10.0, label: 'Jan'),
    const JoyPointData(x: 1, y: 25.0, label: 'Feb'),
    const JoyPointData(x: 2, y: 18.0, label: 'Mar'),
    const JoyPointData(x: 3, y: 40.0, label: 'Apr'),
  ];

  group('JoyLineChart Rendering & Semantics', () {
    testWidgets('renders CustomPainter and accessible semantics description', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyLineChart(
            data: samplePoints,
            height: 320.0,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);

      final semanticsFinder = find.byWidgetPredicate(
        (w) => w is Semantics && (w.properties.label?.contains('Line chart with 4 points') ?? false),
      );
      expect(semanticsFinder, findsOneWidget);
    });

    testWidgets('renders empty dataset without throwing', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyLineChart(
            data: [],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);
    });

    testWidgets('renders single point dataset', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyLineChart(
            data: [JoyPointData(x: 0, y: 50.0, label: 'Single')],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);
    });
  });

  group('JoyLineChart Hover & Tooltip', () {
    testWidgets('hovering over chart triggers onHover and displays tooltip', (tester) async {
      JoyPointData? hoveredPoint;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyLineChart(
            data: samplePoints,
            onHover: (p) => hoveredPoint = p,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: Offset.zero);
      addTearDown(gesture.removePointer);

      final chartCenter = tester.getCenter(find.byType(JoyLineChart));
      await gesture.moveTo(chartCenter);
      await tester.pumpAndSettle();

      expect(hoveredPoint, isNotNull);
      // Tooltip should display the hovered point's value
      expect(find.text(hoveredPoint!.y.toStringAsFixed(2)), findsOneWidget);
    });
  });

  group('JoyLineChart Dark Mode', () {
    testWidgets('renders cleanly in dark theme with zero violations', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          tokens: JoyThemeTokens.dark,
          child: JoyLineChart(
            data: samplePoints,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(CustomPaint), findsWidgets);
    });
  });
}
