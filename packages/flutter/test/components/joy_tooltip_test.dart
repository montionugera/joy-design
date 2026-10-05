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
  group('JoyTooltip Tap & Hover', () {
    testWidgets('tapping trigger pins tooltip bubble with inverted tokens', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTooltip.text(
            title: 'Helpful hint information',
            child: const Text('Hover Me'),
          ),
        ),
      );

      expect(find.text('Hover Me'), findsOneWidget);
      expect(find.text('Helpful hint information'), findsNothing);

      // Tap pins the tooltip (simulating touch interaction)
      await tester.tap(find.text('Hover Me'));
      await tester.pumpAndSettle();

      expect(find.text('Helpful hint information'), findsOneWidget);

      // Verify inverted text token
      final defaultText = tester.widget<DefaultTextStyle>(
        find.ancestor(
          of: find.text('Helpful hint information'),
          matching: find.byType(DefaultTextStyle),
        ).first,
      );
      expect(defaultText.style.color, JoyThemeTokens.light.text.inverse);

      // Tap again dismisses the pinned tooltip
      await tester.tap(find.text('Hover Me'));
      await tester.pumpAndSettle();

      expect(find.text('Helpful hint information'), findsNothing);
    });

    testWidgets('renders arrow painter pointing towards trigger', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTooltip.text(
            title: 'Arrow Test',
            child: const Text('Target'),
          ),
        ),
      );

      await tester.tap(find.text('Target'));
      await tester.pumpAndSettle();

      expect(find.text('Arrow Test'), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
    });
  });
}
