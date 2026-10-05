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
  group('JoySegmented Selection & Stepping', () {
    testWidgets('tapping option updates value and triggers onChanged', (tester) async {
      String currentValue = 'daily';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySegmented<String>(
                value: currentValue,
                options: const [
                  JoySegmentedOption(value: 'daily', labelText: 'Daily'),
                  JoySegmentedOption(value: 'weekly', labelText: 'Weekly'),
                  JoySegmentedOption(value: 'monthly', labelText: 'Monthly'),
                ],
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      expect(currentValue, equals('daily'));

      // Tap 'Weekly'
      await tester.tap(find.text('Weekly'));
      await tester.pumpAndSettle();

      expect(currentValue, equals('weekly'));

      // Tap 'Monthly'
      await tester.tap(find.text('Monthly'));
      await tester.pumpAndSettle();

      expect(currentValue, equals('monthly'));
    });

    testWidgets('supports sizes sm, md, lg', (tester) async {
      for (final size in JoySegmentedSize.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoySegmented<int>(
              value: 1,
              size: size,
              options: const [
                JoySegmentedOption(value: 1, labelText: 'One'),
                JoySegmentedOption(value: 2, labelText: 'Two'),
              ],
              onChanged: (_) {},
            ),
          ),
        );

        expect(find.byType(JoySegmented<int>), findsOneWidget);
        expect(find.text('One'), findsOneWidget);
      }
    });

    testWidgets('block mode expands to full available width', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: SizedBox(
            width: 320.0,
            child: JoySegmented<String>(
              value: 'a',
              block: true,
              options: const [
                JoySegmentedOption(value: 'a', labelText: 'Alpha'),
                JoySegmentedOption(value: 'b', labelText: 'Beta'),
              ],
              onChanged: (_) {},
            ),
          ),
        ),
      );

      final renderBox = tester.renderObject<RenderBox>(find.byType(JoySegmented<String>));
      expect(renderBox.size.width, equals(320.0));
    });

    testWidgets('keyboard navigation cycles through options', (tester) async {
      String currentValue = 'a';
      final focusNode = FocusNode();

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySegmented<String>(
                value: currentValue,
                focusNode: focusNode,
                autofocus: true,
                options: const [
                  JoySegmentedOption(value: 'a', labelText: 'A'),
                  JoySegmentedOption(value: 'b', labelText: 'B'),
                  JoySegmentedOption(value: 'c', labelText: 'C'),
                ],
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

      // Right arrow selects 'b'
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(currentValue, equals('b'));

      // Right arrow selects 'c'
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(currentValue, equals('c'));

      // Left arrow selects 'b'
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(currentValue, equals('b'));

      // Home sets 'a'
      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(currentValue, equals('a'));

      // End sets 'c'
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(currentValue, equals('c'));
    });
  });

  group('JoySegmented Disabled State', () {
    testWidgets('disabled segmented control ignores taps', (tester) async {
      String currentValue = 'apple';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySegmented<String>(
                value: currentValue,
                disabled: true,
                options: const [
                  JoySegmentedOption(value: 'apple', labelText: 'Apple'),
                  JoySegmentedOption(value: 'orange', labelText: 'Orange'),
                ],
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Orange'));
      await tester.pumpAndSettle();

      expect(currentValue, equals('apple'));
    });

    testWidgets('individual disabled option ignores taps', (tester) async {
      String currentValue = 'free';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySegmented<String>(
                value: currentValue,
                options: const [
                  JoySegmentedOption(value: 'free', labelText: 'Free'),
                  JoySegmentedOption(value: 'pro', labelText: 'Pro', disabled: true),
                ],
                onChanged: (val) {
                  setState(() => currentValue = val);
                },
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Pro'));
      await tester.pumpAndSettle();

      expect(currentValue, equals('free'));
    });
  });

  group('JoySegmented Coarse Pointer Hit Bounds', () {
    testWidgets('enforces at least 44px height floor', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoySegmented<String>(
            value: 'a',
            size: JoySegmentedSize.sm,
            options: const [
              JoySegmentedOption(value: 'a', labelText: 'A'),
              JoySegmentedOption(value: 'b', labelText: 'B'),
            ],
            onChanged: (_) {},
          ),
        ),
      );

      final renderBox = tester.renderObject<RenderBox>(find.byType(JoySegmented<String>));
      expect(renderBox.size.height, greaterThanOrEqualTo(44.0));
    });
  });

  group('JoySegmented Pure Token Theming', () {
    testWidgets('renders cleanly in both Light and Dark themes', (tester) async {
      for (final tokens in [JoyThemeTokens.light, JoyThemeTokens.dark]) {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoySegmented<String>(
              value: 'tab1',
              options: const [
                JoySegmentedOption(value: 'tab1', labelText: 'Tab 1'),
                JoySegmentedOption(value: 'tab2', labelText: 'Tab 2'),
              ],
              onChanged: (_) {},
            ),
          ),
        );

        expect(find.byType(JoySegmented<String>), findsOneWidget);
      }
    });
  });
}
