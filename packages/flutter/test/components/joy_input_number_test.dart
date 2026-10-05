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
  group('JoyInputNumber Basic Rendering & Sizes', () {
    for (final size in JoyInputSize.values) {
      testWidgets('renders $size correctly with target height', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyInputNumber(
              size: size,
              defaultValue: 10,
            ),
          ),
        );

        expect(find.byType(JoyInputNumber), findsOneWidget);
        expect(find.text('10'), findsOneWidget);
        expect(find.byKey(const Key('joy_input_number_up')), findsOneWidget);
        expect(find.byKey(const Key('joy_input_number_down')), findsOneWidget);

        final containerFinder = find.descendant(
          of: find.byType(JoyInputNumber),
          matching: find.byType(Container),
        );
        final containerSize = tester.getSize(containerFinder.first);
        expect(containerSize.height, equals(size.height));
      });
    }
  });

  group('JoyInputNumber Stepping Controls', () {
    testWidgets('increments and decrements value via stepper buttons', (tester) async {
      num? currentValue = 5;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInputNumber(
            value: currentValue,
            step: 2,
            onChanged: (val) => currentValue = val,
          ),
        ),
      );

      expect(find.text('5'), findsOneWidget);

      // Increment by step 2 -> 7
      await tester.tap(find.byKey(const Key('joy_input_number_up')));
      await tester.pump();
      expect(currentValue, equals(7));

      // Decrement by step 2 -> 5
      await tester.tap(find.byKey(const Key('joy_input_number_down')));
      await tester.pump();
      expect(currentValue, equals(5));
    });

    testWidgets('enforces min and max bounds during stepping', (tester) async {
      num? currentValue = 9;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInputNumber(
            value: currentValue,
            min: 8,
            max: 10,
            step: 1,
            onChanged: (val) => currentValue = val,
          ),
        ),
      );

      // Step up to max (10)
      await tester.tap(find.byKey(const Key('joy_input_number_up')));
      await tester.pump();
      expect(currentValue, equals(10));

      // Attempt to step up past max -> remains 10
      await tester.tap(find.byKey(const Key('joy_input_number_up')));
      await tester.pump();
      expect(currentValue, equals(10));

      // Step down to 9
      await tester.tap(find.byKey(const Key('joy_input_number_down')));
      await tester.pump();
      expect(currentValue, equals(9));

      // Step down to min (8)
      await tester.tap(find.byKey(const Key('joy_input_number_down')));
      await tester.pump();
      expect(currentValue, equals(8));

      // Attempt to step down past min -> remains 8
      await tester.tap(find.byKey(const Key('joy_input_number_down')));
      await tester.pump();
      expect(currentValue, equals(8));
    });

    testWidgets('respects precision formatting', (tester) async {
      num? currentValue = 1.25;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInputNumber(
            value: currentValue,
            precision: 2,
            step: 0.05,
            onChanged: (val) => currentValue = val,
          ),
        ),
      );

      expect(find.text('1.25'), findsOneWidget);

      await tester.tap(find.byKey(const Key('joy_input_number_up')));
      await tester.pump();
      expect(currentValue, equals(1.30));
      expect(find.text('1.30'), findsOneWidget);
    });
  });

  group('JoyInputNumber Direct Keyboard Entry', () {
    testWidgets('updates value from text entry and clamps on submit', (tester) async {
      num? currentValue = 0;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInputNumber(
            defaultValue: 0,
            min: 0,
            max: 100,
            onChanged: (val) => currentValue = val,
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '42');
      await tester.pump();
      expect(currentValue, equals(42));

      // Enter value exceeding max -> submitted clamps to max (100)
      await tester.enterText(find.byType(TextField), '150');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();

      expect(currentValue, equals(100));
      expect(find.text('100'), findsOneWidget);
    });

    testWidgets('handles empty input gracefully', (tester) async {
      num? currentValue = 10;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInputNumber(
            defaultValue: 10,
            onChanged: (val) => currentValue = val,
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '');
      await tester.pump();
      expect(currentValue, isNull);
    });
  });

  group('JoyInputNumber Disabled & ReadOnly', () {
    testWidgets('disabled state prevents stepping and editing', (tester) async {
      num? currentValue = 5;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInputNumber(
            value: currentValue,
            disabled: true,
            onChanged: (val) => currentValue = val,
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.enabled, isFalse);

      await tester.tap(find.byKey(const Key('joy_input_number_up')));
      await tester.pump();
      expect(currentValue, equals(5));
    });
  });
}
