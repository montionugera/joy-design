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
  group('JoyRadio Standalone Selection', () {
    testWidgets('selects radio option and triggers onChanged', (tester) async {
      String? selectedValue = 'apple';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRadio<String>(
                value: 'banana',
                groupValue: selectedValue,
                labelText: 'Banana',
                onChanged: (val) {
                  setState(() => selectedValue = val);
                },
              );
            },
          ),
        ),
      );

      expect(find.text('Banana'), findsOneWidget);

      await tester.tap(find.byType(JoyRadio<String>));
      await tester.pump();

      expect(selectedValue, equals('banana'));
    });

    testWidgets('enforces at least 44x44px hit bounds floor on raw radio', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyRadio<String>(
            value: 'opt',
            groupValue: null,
            onChanged: (_) {},
          ),
        ),
      );

      final renderBox = tester.renderObject<RenderBox>(find.byType(JoyRadio<String>));
      expect(renderBox.size.width, greaterThanOrEqualTo(44.0));
      expect(renderBox.size.height, greaterThanOrEqualTo(44.0));
    });
  });

  group('JoyRadioGroup Management & Coordination', () {
    testWidgets('coordinates multiple radio options via options parameter', (tester) async {
      String? selected = 'item1';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRadioGroup<String>(
                value: selected,
                onChanged: (val) {
                  setState(() => selected = val);
                },
                options: const [
                  JoyRadioOption(value: 'item1', label: 'Item 1'),
                  JoyRadioOption(value: 'item2', label: 'Item 2'),
                  JoyRadioOption(value: 'item3', label: 'Item 3'),
                ],
              );
            },
          ),
        ),
      );

      expect(find.text('Item 1'), findsOneWidget);
      expect(find.text('Item 2'), findsOneWidget);
      expect(find.text('Item 3'), findsOneWidget);

      // Tap Item 2
      await tester.tap(find.text('Item 2'));
      await tester.pump();

      expect(selected, equals('item2'));

      // Tap Item 3
      await tester.tap(find.text('Item 3'));
      await tester.pump();

      expect(selected, equals('item3'));
    });

    testWidgets('coordinates multiple radio options via explicit children', (tester) async {
      int? selected = 1;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRadioGroup<int>(
                value: selected,
                onChanged: (val) {
                  setState(() => selected = val);
                },
                children: const [
                  JoyRadio<int>(value: 1, labelText: 'One'),
                  JoyRadio<int>(value: 2, labelText: 'Two'),
                ],
              );
            },
          ),
        ),
      );

      expect(selected, equals(1));

      await tester.tap(find.text('Two'));
      await tester.pump();

      expect(selected, equals(2));
    });

    testWidgets('disabled option in group ignores taps', (tester) async {
      String? selected = 'optA';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRadioGroup<String>(
                value: selected,
                onChanged: (val) {
                  setState(() => selected = val);
                },
                options: const [
                  JoyRadioOption(value: 'optA', label: 'Option A'),
                  JoyRadioOption(value: 'optB', label: 'Option B', disabled: true),
                ],
              );
            },
          ),
        ),
      );

      // Tap disabled Option B
      await tester.tap(find.text('Option B'));
      await tester.pump();

      // Value remains optA
      expect(selected, equals('optA'));
    });

    testWidgets('cascades group-level disabled to all radio children', (tester) async {
      String? selected = 'opt1';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyRadioGroup<String>(
                value: selected,
                disabled: true,
                onChanged: (val) {
                  setState(() => selected = val);
                },
                options: const [
                  JoyRadioOption(value: 'opt1', label: 'Option 1'),
                  JoyRadioOption(value: 'opt2', label: 'Option 2'),
                ],
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Option 2'));
      await tester.pump();

      expect(selected, equals('opt1'));
    });

    testWidgets('supports horizontal and vertical group orientations', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyRadioGroup<String>.horizontal(
            value: 'h1',
            options: [
              JoyRadioOption(value: 'h1', label: 'Horizontal 1'),
              JoyRadioOption(value: 'h2', label: 'Horizontal 2'),
            ],
          ),
        ),
      );

      final flexFinder = find.byType(JoyFlex);
      expect(flexFinder, findsOneWidget);
      final flexWidget = tester.widget<JoyFlex>(flexFinder);
      expect(flexWidget.direction, equals(Axis.horizontal));
    });
  });
}
