import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

Widget _buildTestApp({
  required Widget child,
  JoyThemeTokens tokens = JoyThemeTokens.light,
  Size? surfaceSize,
}) {
  return MaterialApp(
    theme: JoyTheme.themeData(tokens),
    home: Scaffold(
      body: surfaceSize != null
          ? MediaQuery(
              data: MediaQueryData(size: surfaceSize),
              child: Center(child: child),
            )
          : Center(child: child),
    ),
  );
}

void main() {
  group('JoyInput Basic Rendering & Sizes', () {
    for (final size in JoyInputSize.values) {
      testWidgets('renders $size input correctly with target height', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyInput(
              size: size,
              placeholder: 'Enter text',
            ),
          ),
        );

        expect(find.byType(JoyInput), findsOneWidget);
        final containerFinder = find.descendant(
          of: find.byType(JoyInput),
          matching: find.byType(Container),
        );
        expect(containerFinder, findsWidgets);

        final containerSize = tester.getSize(containerFinder.first);
        expect(containerSize.height, equals(size.height));
      });
    }

    testWidgets('renders placeholder text when empty', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyInput(
            placeholder: 'Search items...',
          ),
        ),
      );

      expect(find.text('Search items...'), findsOneWidget);
    });

    testWidgets('renders prefix and suffix elements', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyInput(
            prefixText: 'https://',
            suffixText: '.com',
            prefix: Icon(Icons.link),
            suffix: Icon(Icons.check),
          ),
        ),
      );

      expect(find.text('https://'), findsOneWidget);
      expect(find.text('.com'), findsOneWidget);
      expect(find.byIcon(Icons.link), findsOneWidget);
      expect(find.byIcon(Icons.check), findsOneWidget);
    });
  });

  group('JoyInput Typing & Controller', () {
    testWidgets('types text and invokes onChanged callback', (tester) async {
      String changedValue = '';
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInput(
            onChanged: (val) => changedValue = val,
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'Hello Joymify');
      await tester.pump();

      expect(find.text('Hello Joymify'), findsOneWidget);
      expect(changedValue, equals('Hello Joymify'));
    });

    testWidgets('submits text and invokes onSubmitted callback', (tester) async {
      String submittedValue = '';
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInput(
            onSubmitted: (val) => submittedValue = val,
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'Submitted text');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();

      expect(submittedValue, equals('Submitted text'));
    });
  });

  group('JoyInput Clearable Feature', () {
    testWidgets('shows clear button when text is present and clears on tap', (tester) async {
      String changedValue = 'initial';
      final controller = TextEditingController(text: 'Clear me');

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyInput(
            controller: controller,
            clearable: true,
            onChanged: (val) => changedValue = val,
          ),
        ),
      );

      expect(find.byKey(const Key('joy_input_clear_button')), findsOneWidget);

      await tester.tap(find.byKey(const Key('joy_input_clear_button')));
      await tester.pump();

      expect(controller.text, isEmpty);
      expect(changedValue, isEmpty);
      expect(find.byKey(const Key('joy_input_clear_button')), findsNothing);
    });

    testWidgets('does not show clear button when text is empty', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyInput(
            clearable: true,
          ),
        ),
      );

      expect(find.byKey(const Key('joy_input_clear_button')), findsNothing);
    });
  });

  group('JoyInput Disabled & ReadOnly States', () {
    testWidgets('disabled input ignores text entry and applies disabled styling', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyInput(
            disabled: true,
            initialValue: 'Disabled text',
            clearable: true,
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.enabled, isFalse);
      expect(find.byKey(const Key('joy_input_clear_button')), findsNothing);
    });

    testWidgets('readOnly input prevents editing', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyInput(
            readOnly: true,
            initialValue: 'Read-only text',
            clearable: true,
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.readOnly, isTrue);
      expect(find.byKey(const Key('joy_input_clear_button')), findsNothing);
    });
  });

  group('JoyInput Status Borders & Token Resolution', () {
    testWidgets('resolves status colors for error, warning, and success', (tester) async {
      const tokens = JoyThemeTokens.light;

      for (final status in JoyInputStatus.values) {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoyInput(
              status: status,
              placeholder: status.name,
            ),
          ),
        );

        final container = tester.widget<Container>(
          find.descendant(
            of: find.byType(JoyInput),
            matching: find.byType(Container),
          ).first,
        );

        final decoration = container.decoration as BoxDecoration;
        final border = decoration.border as Border;

        switch (status) {
          case JoyInputStatus.error:
            expect(border.top.color, equals(tokens.status.danger.border));
          case JoyInputStatus.warning:
            expect(border.top.color, equals(tokens.status.warning.border));
          case JoyInputStatus.success:
            expect(border.top.color, equals(tokens.status.success.border));
          case JoyInputStatus.defaultStatus:
            expect(border.top.color, equals(tokens.border.base));
        }
      }
    });
  });

  group('JoyInput Mobile Ergonomics (Font Size Floor)', () {
    testWidgets('enforces 16px minimum font size on mobile viewports (< 768px)', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          surfaceSize: const Size(375, 812),
          child: const JoyInput(
            size: JoyInputSize.sm, // normally 13.0 on desktop
            placeholder: 'Mobile viewport input',
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.style?.fontSize, greaterThanOrEqualTo(16.0));
      expect(textField.decoration?.hintStyle?.fontSize, greaterThanOrEqualTo(16.0));
    });

    testWidgets('preserves base font size on desktop viewports (>= 768px)', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          surfaceSize: const Size(1280, 800),
          child: const JoyInput(
            size: JoyInputSize.sm, // baseFontSize 13.0
            isMobile: false,
            placeholder: 'Desktop viewport input',
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.style?.fontSize, equals(JoyInputSize.sm.baseFontSize));
    });
  });
}
