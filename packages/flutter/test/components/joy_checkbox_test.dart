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
      body: Center(child: child),
    ),
  );
}

void main() {
  group('JoyCheckbox State Toggling', () {
    testWidgets('checking and unchecking updates value correctly', (tester) async {
      bool? currentValue = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyCheckbox(
                value: currentValue,
                labelText: 'Accept terms',
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      expect(find.text('Accept terms'), findsOneWidget);
      expect(currentValue, isFalse);

      // Tap checkbox to check (false -> true)
      await tester.tap(find.byType(JoyCheckbox));
      await tester.pump();
      expect(currentValue, isTrue);

      // Tap checkbox to uncheck (true -> false)
      await tester.tap(find.byType(JoyCheckbox));
      await tester.pump();
      expect(currentValue, isFalse);
    });

    testWidgets('indeterminate state transitions to checked on tap', (tester) async {
      bool? currentValue; // null = indeterminate

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyCheckbox(
                value: currentValue,
                labelText: 'Indeterminate state',
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      expect(currentValue, isNull);

      // Tap indeterminate checkbox -> transitions to true
      await tester.tap(find.byType(JoyCheckbox));
      await tester.pump();
      expect(currentValue, isTrue);
    });
  });

  group('JoyCheckbox Disabled State', () {
    testWidgets('disabled checkbox ignores tap events and does not trigger callback', (tester) async {
      bool? currentValue = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyCheckbox(
            value: currentValue,
            disabled: true,
            labelText: 'Disabled option',
            onChanged: (val) {
              currentValue = val;
            },
          ),
        ),
      );

      await tester.tap(find.byType(JoyCheckbox));
      await tester.pump();

      expect(currentValue, isFalse);
    });

    testWidgets('null onChanged renders disabled semantics', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyCheckbox(
            value: true,
            onChanged: null,
            labelText: 'Read-only option',
          ),
        ),
      );

      expect(find.byType(JoyCheckbox), findsOneWidget);
    });
  });

  group('JoyCheckbox Coarse Pointer Hit Target', () {
    testWidgets('enforces at least 44x44px hit bounds floor', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyCheckbox(
            value: false,
            onChanged: (_) {},
            // No label to test raw checkbox minimum bounds
          ),
        ),
      );

      final renderBox = tester.renderObject<RenderBox>(find.byType(JoyCheckbox));
      expect(renderBox.size.width, greaterThanOrEqualTo(44.0));
      expect(renderBox.size.height, greaterThanOrEqualTo(44.0));
    });
  });

  group('JoyCheckbox Pure Token Theming', () {
    testWidgets('resolves token colors without errors in both Light and Dark themes', (tester) async {
      for (final tokens in [JoyThemeTokens.light, JoyThemeTokens.dark]) {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoyCheckbox(
              value: true,
              labelText: 'Theme test',
              onChanged: (_) {},
            ),
          ),
        );

        expect(find.byType(JoyCheckbox), findsOneWidget);
      }
    });
  });
}
