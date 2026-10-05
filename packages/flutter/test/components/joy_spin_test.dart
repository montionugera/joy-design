import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

Widget _buildTestApp({
  required Widget child,
  JoyThemeTokens tokens = JoyThemeTokens.light,
}) {
  return MaterialApp(
    theme: JoyTheme.themeData(tokens),
    home: Scaffold(
      body: Center(
        child: child,
      ),
    ),
  );
}

void main() {
  group('JoySpin Standalone', () {
    testWidgets('renders spinner when spinning is true', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySpin(
            spinning: true,
          ),
        ),
      );

      expect(find.byType(JoySpin), findsOneWidget);
      final spinPaint = find.descendant(
        of: find.byType(JoySpin),
        matching: find.byType(CustomPaint),
      );
      expect(spinPaint, findsOneWidget);
    });

    testWidgets('hides spinner when spinning is false without child', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySpin(
            spinning: false,
          ),
        ),
      );

      final spinPaint = find.descendant(
        of: find.byType(JoySpin),
        matching: find.byType(CustomPaint),
      );
      expect(spinPaint, findsNothing);
    });

    testWidgets('renders tip text alongside spinner', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySpin(
            tip: 'Loading data...',
          ),
        ),
      );

      expect(find.text('Loading data...'), findsOneWidget);
    });
  });

  group('JoySpin With Child (Overlay Mode)', () {
    testWidgets('renders child and mask overlay when spinning is true', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySpin(
            spinning: true,
            tip: 'Processing...',
            child: SizedBox(
              width: 200,
              height: 100,
              child: Text('Content Card'),
            ),
          ),
        ),
      );

      expect(find.text('Content Card'), findsOneWidget);
      expect(find.text('Processing...'), findsOneWidget);

      final spinPaint = find.descendant(
        of: find.byType(JoySpin),
        matching: find.byType(CustomPaint),
      );
      expect(spinPaint, findsOneWidget);
    });

    testWidgets('renders child without mask overlay when spinning is false', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySpin(
            spinning: false,
            tip: 'Processing...',
            child: SizedBox(
              width: 200,
              height: 100,
              child: Text('Content Card'),
            ),
          ),
        ),
      );

      expect(find.text('Content Card'), findsOneWidget);
      expect(find.text('Processing...'), findsNothing);

      final spinPaint = find.descendant(
        of: find.byType(JoySpin),
        matching: find.byType(CustomPaint),
      );
      expect(spinPaint, findsNothing);
    });
  });
}
