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
      body: Center(
        child: SizedBox(
          width: 300.0,
          child: child,
        ),
      ),
    ),
  );
}

void main() {
  group('JoySlider Value & Stepping', () {
    testWidgets('tapping slider updates value within min/max bounds', (tester) async {
      double currentValue = 20.0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySlider(
                value: currentValue,
                min: 0.0,
                max: 100.0,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      expect(currentValue, equals(20.0));

      // Tap near the center (offset 150 of 300) -> should be near 50
      final center = tester.getCenter(find.byType(JoySlider));
      await tester.tapAt(center);
      await tester.pumpAndSettle();

      expect(currentValue, closeTo(50.0, 5.0));
    });

    testWidgets('respects step quantization', (tester) async {
      double currentValue = 0.0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySlider(
                value: currentValue,
                min: 0.0,
                max: 100.0,
                step: 25.0,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      // Tap at 1/4 of the width (offset 75 of 300)
      final topLeft = tester.getTopLeft(find.byType(JoySlider));
      await tester.tapAt(Offset(topLeft.dx + 75.0, topLeft.dy + 22.0));
      await tester.pumpAndSettle();

      expect(currentValue % 25.0, equals(0.0));
    });

    testWidgets('keyboard arrows and home/end keys adjust value', (tester) async {
      double currentValue = 50.0;
      final focusNode = FocusNode();

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySlider(
                value: currentValue,
                min: 0.0,
                max: 100.0,
                step: 10.0,
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

      // Right arrow increases by step (10)
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(currentValue, equals(60.0));

      // Left arrow decreases by step (10)
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(currentValue, equals(50.0));

      // Home key sets to min (0)
      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(currentValue, equals(0.0));

      // End key sets to max (100)
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(currentValue, equals(100.0));
    });
  });

  group('JoySlider Disabled State', () {
    testWidgets('disabled slider ignores taps and drags', (tester) async {
      double currentValue = 20.0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySlider(
                value: currentValue,
                disabled: true,
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      final center = tester.getCenter(find.byType(JoySlider));
      await tester.tapAt(center);
      await tester.pumpAndSettle();

      expect(currentValue, equals(20.0));
    });
  });

  group('JoySlider Coarse Pointer Hit Bounds', () {
    testWidgets('enforces at least 44px height floor', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoySlider(
            value: 10.0,
            onChanged: (_) {},
          ),
        ),
      );

      final renderBox = tester.renderObject<RenderBox>(find.byType(JoySlider));
      expect(renderBox.size.height, greaterThanOrEqualTo(44.0));
    });
  });

  group('JoySlider Pure Token Theming', () {
    testWidgets('renders cleanly in both Light and Dark themes', (tester) async {
      for (final tokens in [JoyThemeTokens.light, JoyThemeTokens.dark]) {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoySlider(
              value: 40.0,
              onChanged: (_) {},
            ),
          ),
        );

        expect(find.byType(JoySlider), findsOneWidget);
      }
    });
  });
}
