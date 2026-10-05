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
  group('JoySwitch State Toggling', () {
    testWidgets('toggling switch updates value correctly', (tester) async {
      bool currentValue = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySwitch(
                value: currentValue,
                labelText: 'Enable feature',
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      expect(find.text('Enable feature'), findsOneWidget);
      expect(currentValue, isFalse);

      // Tap to toggle on
      await tester.tap(find.byType(JoySwitch));
      await tester.pumpAndSettle();
      expect(currentValue, isTrue);

      // Tap to toggle off
      await tester.tap(find.byType(JoySwitch));
      await tester.pumpAndSettle();
      expect(currentValue, isFalse);
    });

    testWidgets('supports both JoySwitchSize.sm and JoySwitchSize.md', (tester) async {
      for (final size in JoySwitchSize.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoySwitch(
              value: true,
              size: size,
              labelText: 'Size ${size.name}',
              onChanged: (_) {},
            ),
          ),
        );

        expect(find.byType(JoySwitch), findsOneWidget);
        expect(find.text('Size ${size.name}'), findsOneWidget);
      }
    });

    testWidgets('keyboard space and enter toggle switch', (tester) async {
      bool currentValue = false;
      final focusNode = FocusNode();

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySwitch(
                value: currentValue,
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

      // Press Space
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(currentValue, isTrue);

      // Press Enter
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(currentValue, isFalse);
    });
  });

  group('JoySwitch Disabled & Loading State', () {
    testWidgets('disabled switch suppresses taps and onChanged', (tester) async {
      bool called = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoySwitch(
            value: false,
            disabled: true,
            onChanged: (_) => called = true,
          ),
        ),
      );

      await tester.tap(find.byType(JoySwitch));
      await tester.pumpAndSettle();
      expect(called, isFalse);
    });

    testWidgets('loading switch displays spinner and suppresses taps', (tester) async {
      bool called = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoySwitch(
            value: true,
            loading: true,
            onChanged: (_) => called = true,
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.tap(find.byType(JoySwitch));
      await tester.pump(const Duration(milliseconds: 50));
      expect(called, isFalse);
    });

    testWidgets('null onChanged renders non-interactive switch', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySwitch(
            value: true,
            onChanged: null,
          ),
        ),
      );

      expect(find.byType(JoySwitch), findsOneWidget);
    });
  });

  group('JoySwitch Coarse Pointer Hit Target', () {
    testWidgets('enforces at least 44x44px minimum hit bounds', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoySwitch(
            value: false,
            size: JoySwitchSize.sm,
            onChanged: (_) {},
          ),
        ),
      );

      final renderBox = tester.renderObject<RenderBox>(find.byType(JoySwitch));
      expect(renderBox.size.width, greaterThanOrEqualTo(44.0));
      expect(renderBox.size.height, greaterThanOrEqualTo(44.0));
    });
  });

  group('JoySwitch Pure Token Theming', () {
    testWidgets('renders cleanly in both Light and Dark themes', (tester) async {
      for (final tokens in [JoyThemeTokens.light, JoyThemeTokens.dark]) {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoySwitch(
              value: true,
              labelText: 'Theme test',
              onChanged: (_) {},
            ),
          ),
        );

        expect(find.byType(JoySwitch), findsOneWidget);
      }
    });
  });
}
