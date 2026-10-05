import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

Widget _buildTestApp({
  required Widget child,
  JoyThemeTokens tokens = JoyThemeTokens.light,
}) {
  return MaterialApp(
    theme: JoyTheme.themeData(tokens),
    home: Scaffold(
      body: Center(child: child),
    ),
  );
}

void main() {
  group('JoyRate Star Rating & Stepping', () {
    testWidgets('tapping on star updates rating value', (tester) async {
      double currentValue = 2.0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRate(
                value: currentValue,
                count: 5,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      expect(currentValue, equals(2.0));

      // Tap on 4th star
      final stars = find.descendant(
        of: find.byType(JoyRate),
        matching: find.byType(CustomPaint),
      );
      expect(stars, findsNWidgets(5));

      await tester.tap(stars.at(3));
      await tester.pumpAndSettle();

      expect(currentValue, equals(4.0));
    });

    testWidgets('allowHalf enables half-star selection on tapping left half', (tester) async {
      double currentValue = 1.0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRate(
                value: currentValue,
                count: 5,
                allowHalf: true,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      final stars = find.descendant(
        of: find.byType(JoyRate),
        matching: find.byType(CustomPaint),
      );
      final thirdStarBox = tester.getTopLeft(stars.at(2));

      // Tap near the left side of the 3rd star (e.g. 5px from left edge)
      await tester.tapAt(Offset(thirdStarBox.dx + 5.0, thirdStarBox.dy + 10.0));
      await tester.pumpAndSettle();

      expect(currentValue, equals(2.5));
    });

    testWidgets('keyboard navigation adjusts rating value', (tester) async {
      double currentValue = 3.0;
      final focusNode = FocusNode();

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRate(
                value: currentValue,
                count: 5,
                focusNode: focusNode,
                autofocus: true,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      focusNode.requestFocus();
      await tester.pump();

      // Right arrow increments
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(currentValue, equals(4.0));

      // Left arrow decrements
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(currentValue, equals(3.0));

      // Home sets 0
      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(currentValue, equals(0.0));

      // End sets 5
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(currentValue, equals(5.0));
    });
  });

  group('JoyRate Disabled and ReadOnly Modes', () {
    testWidgets('disabled rate suppresses taps', (tester) async {
      double currentValue = 3.0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRate(
                value: currentValue,
                count: 5,
                disabled: true,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      final stars = find.descendant(
        of: find.byType(JoyRate),
        matching: find.byType(CustomPaint),
      );
      await tester.tap(stars.at(4));
      await tester.pumpAndSettle();

      expect(currentValue, equals(3.0));
    });

    testWidgets('readOnly rate suppresses taps', (tester) async {
      double currentValue = 3.0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRate(
                value: currentValue,
                count: 5,
                readOnly: true,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      final stars = find.descendant(
        of: find.byType(JoyRate),
        matching: find.byType(CustomPaint),
      );
      await tester.tap(stars.at(0));
      await tester.pumpAndSettle();

      expect(currentValue, equals(3.0));
    });
  });

  group('JoyRate Coarse Pointer Hit Bounds', () {
    testWidgets('enforces at least 44x44px hit bounds per star', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyRate(
            value: 3.0,
            size: 16.0, // smaller icon size, but hit bounds must still be 44x44px
            onChanged: (_) {},
          ),
        ),
      );

      // Find the ConstrainedBox widgets inside JoyRate
      final rateWidget = find.byType(JoyRate);
      expect(rateWidget, findsOneWidget);

      final starBoxes = find.descendant(
        of: rateWidget,
        matching: find.byType(ConstrainedBox),
      );
      expect(starBoxes, findsAtLeastNWidgets(5));

      final firstBox = tester.renderObject<RenderBox>(starBoxes.first);
      expect(firstBox.size.width, greaterThanOrEqualTo(44.0));
      expect(firstBox.size.height, greaterThanOrEqualTo(44.0));
    });
  });

  group('JoyRate Pure Token Theming', () {
    testWidgets('renders cleanly in both Light and Dark themes', (tester) async {
      for (final tokens in [JoyThemeTokens.light, JoyThemeTokens.dark]) {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoyRate(
              value: 4.5,
              allowHalf: true,
              onChanged: (_) {},
            ),
          ),
        );

        expect(find.byType(JoyRate), findsOneWidget);
      }
    });
  });
}
