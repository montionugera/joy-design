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
  group('JoyProgress Line Type', () {
    testWidgets('renders line progress with percentage label', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyProgress.line(
            percent: 45.0,
          ),
        ),
      );

      expect(find.text('45%'), findsOneWidget);
    });

    testWidgets('clamps negative percent to 0%', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyProgress.line(
            percent: -20.0,
          ),
        ),
      );

      expect(find.text('0%'), findsOneWidget);
    });

    testWidgets('auto-resolves to success status when percent >= 100', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyProgress.line(
            percent: 100.0,
          ),
        ),
      );

      // Status success shows check icon instead of percentage string
      expect(find.byType(JoyIcon), findsOneWidget);
    });

    testWidgets('error status shows close icon', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyProgress.line(
            percent: 50.0,
            status: JoyProgressStatus.error,
          ),
        ),
      );

      expect(find.byType(JoyIcon), findsOneWidget);
    });

    testWidgets('custom format is respected', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyProgress.line(
            percent: 60.0,
            format: (p) => 'Step ${p.toInt()}/100',
          ),
        ),
      );

      expect(find.text('Step 60/100'), findsOneWidget);
    });
  });

  group('JoyProgress Circle Type', () {
    testWidgets('renders circle progress with CustomPaint', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyProgress.circle(
            percent: 75.0,
            size: 100.0,
          ),
        ),
      );

      expect(find.text('75%'), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
    });
  });
}
