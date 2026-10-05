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
  group('JoySkeleton Shapes & Variants', () {
    testWidgets('renders line skeleton with specified dimensions', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySkeleton.line(
            width: 200.0,
            height: 20.0,
          ),
        ),
      );

      final skeleton = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoySkeleton),
          matching: find.byType(Container),
        ).first,
      );

      final decoration = skeleton.decoration as BoxDecoration;
      expect(decoration.shape, BoxShape.rectangle);
      expect(tester.getSize(find.byType(JoySkeleton)).width, 200.0);
      expect(tester.getSize(find.byType(JoySkeleton)).height, 20.0);
    });

    testWidgets('renders multiple lines with last line shortened', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const SizedBox(
            width: 300.0,
            child: JoySkeleton.line(
              width: 300.0,
              lines: 3,
            ),
          ),
        ),
      );

      expect(find.byType(JoySkeleton), findsOneWidget);
      final containers = tester.widgetList<Container>(
        find.descendant(
          of: find.byType(JoySkeleton),
          matching: find.byType(Container),
        ),
      ).toList();

      expect(containers.length, 3);
      // Last container width is 70% of 300 = 210
      expect(containers[0].constraints?.maxWidth ?? 300.0, 300.0);
      expect(containers[2].constraints?.maxWidth ?? 210.0, 210.0);
    });

    testWidgets('renders avatar skeleton with circle shape', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySkeleton.avatar(
            size: 48.0,
          ),
        ),
      );

      final skeleton = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoySkeleton),
          matching: find.byType(Container),
        ).first,
      );

      final decoration = skeleton.decoration as BoxDecoration;
      expect(decoration.shape, BoxShape.circle);
      expect(tester.getSize(find.byType(JoySkeleton)).width, 48.0);
      expect(tester.getSize(find.byType(JoySkeleton)).height, 48.0);
    });

    testWidgets('renders button skeleton with control border radius', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySkeleton.button(
            width: 100.0,
            height: 40.0,
          ),
        ),
      );

      expect(tester.getSize(find.byType(JoySkeleton)).width, 100.0);
      expect(tester.getSize(find.byType(JoySkeleton)).height, 40.0);
    });

    testWidgets('static non-active skeleton uses base sunken token color', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySkeleton(
            width: 80.0,
            height: 20.0,
            active: false,
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoySkeleton),
          matching: find.byType(Container),
        ).first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, JoyThemeTokens.light.surface.sunken);
    });
  });
}
