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
  group('JoyButton Rendering Variants', () {
    for (final variant in JoyButtonVariant.values) {
      testWidgets('renders $variant variant correctly', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyButton(
              variant: variant,
              onPressed: () {},
              child: Text(variant.name),
            ),
          ),
        );

        expect(find.byType(JoyButton), findsOneWidget);
        expect(find.text(variant.name), findsOneWidget);
      });
    }
  });

  group('JoyButton Sizes', () {
    for (final size in JoyButtonSize.values) {
      testWidgets('renders $size size correctly', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyButton(
              size: size,
              onPressed: () {},
              child: Text(size.name),
            ),
          ),
        );

        expect(find.byType(JoyButton), findsOneWidget);
        expect(find.text(size.name), findsOneWidget);
      });
    }
  });

  group('JoyButton Interactivity & Tap Handling', () {
    testWidgets('increments counter on tap when interactive', (tester) async {
      int tapCount = 0;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyButton(
            onPressed: () => tapCount++,
            child: const Text('Tap Me'),
          ),
        ),
      );

      await tester.tap(find.byType(JoyButton));
      await tester.pumpAndSettle();

      expect(tapCount, 1);
    });

    testWidgets('does not fire tap handler when disabled: true', (tester) async {
      int tapCount = 0;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyButton(
            disabled: true,
            onPressed: () => tapCount++,
            child: const Text('Disabled'),
          ),
        ),
      );

      await tester.tap(find.byType(JoyButton));
      await tester.pumpAndSettle();

      expect(tapCount, 0);
    });

    testWidgets('does not fire tap handler when loading: true', (tester) async {
      int tapCount = 0;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyButton(
            loading: true,
            onPressed: () => tapCount++,
            child: const Text('Loading'),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.tap(find.byType(JoyButton));
      await tester.pump(const Duration(milliseconds: 100));

      expect(tapCount, 0);
    });
  });

  group('JoyButton 44px Minimum Hit Bounds', () {
    for (final size in JoyButtonSize.values) {
      testWidgets('enforces >= 44x44px bounds for $size size', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyButton(
              size: size,
              onPressed: () {},
              child: const Text('X'),
            ),
          ),
        );

        final renderSize = tester.getSize(find.byType(JoyButton));
        expect(renderSize.height, greaterThanOrEqualTo(44.0));
        expect(renderSize.width, greaterThanOrEqualTo(44.0));
      });
    }
  });

  group('JoyButton Accessibility & Semantics', () {
    testWidgets('exposes enabled button semantics when interactive', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyButton(
            onPressed: () {},
            child: const Text('Accessible Button'),
          ),
        ),
      );

      expect(
        tester.getSemantics(find.byType(JoyButton)),
        matchesSemantics(
          isButton: true,
          isEnabled: true,
          hasEnabledState: true,
          isFocusable: true,
          label: 'Accessible Button',
        ),
      );
    });

    testWidgets('exposes disabled semantics when disabled: true', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyButton(
            disabled: true,
            onPressed: () {},
            child: const Text('Disabled Button'),
          ),
        ),
      );

      expect(
        tester.getSemantics(find.byType(JoyButton)),
        matchesSemantics(
          isButton: true,
          isEnabled: false,
          hasEnabledState: true,
          label: 'Disabled Button',
        ),
      );
    });
  });

  group('JoyButton Token Resolution (Light vs Dark)', () {
    test('pure style resolver flips colors properly between Light and Dark', () {
      const light = JoyThemeTokens.light;
      const dark = JoyThemeTokens.dark;

      final lightOutline = resolveJoyButtonStyle(
        tokens: light,
        variant: JoyButtonVariant.outline,
        size: JoyButtonSize.md,
        isHovered: false,
        isFocused: false,
        isPressed: false,
        isDisabled: false,
        isLoading: false,
      );

      final darkOutline = resolveJoyButtonStyle(
        tokens: dark,
        variant: JoyButtonVariant.outline,
        size: JoyButtonSize.md,
        isHovered: false,
        isFocused: false,
        isPressed: false,
        isDisabled: false,
        isLoading: false,
      );

      expect(lightOutline.foregroundColor, equals(light.text.primary));
      expect(darkOutline.foregroundColor, equals(dark.text.primary));
      expect(lightOutline.foregroundColor, isNot(equals(darkOutline.foregroundColor)));

      final lightDanger = resolveJoyButtonStyle(
        tokens: light,
        variant: JoyButtonVariant.danger,
        size: JoyButtonSize.md,
        isHovered: false,
        isFocused: false,
        isPressed: false,
        isDisabled: false,
        isLoading: false,
      );

      final darkDanger = resolveJoyButtonStyle(
        tokens: dark,
        variant: JoyButtonVariant.danger,
        size: JoyButtonSize.md,
        isHovered: false,
        isFocused: false,
        isPressed: false,
        isDisabled: false,
        isLoading: false,
      );

      expect(lightDanger.backgroundColor, equals(light.status.dangerSolidBg));
      expect(darkDanger.backgroundColor, equals(dark.status.dangerSolidBg));
    });
  });
}
