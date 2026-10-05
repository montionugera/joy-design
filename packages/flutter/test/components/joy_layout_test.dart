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
  group('JoyBox Layout Primitive', () {
    testWidgets('renders custom box properties correctly', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBox(
            width: 200,
            height: 100,
            padding: EdgeInsets.all(JoySpacing.s16),
            margin: EdgeInsets.all(JoySpacing.s8),
            borderRadius: BorderRadius.all(Radius.circular(JoyRadius.md)),
            child: Text('Box Content'),
          ),
        ),
      );

      final containerFinder = find.byType(Container);
      expect(containerFinder, findsOneWidget);

      final container = tester.widget<Container>(containerFinder);
      expect(container.constraints?.minWidth, equals(200.0));
      expect(container.constraints?.minHeight, equals(100.0));
      expect(container.padding, equals(const EdgeInsets.all(JoySpacing.s16)));
      expect(container.margin, equals(const EdgeInsets.all(JoySpacing.s8)));

      final decoration = container.decoration as BoxDecoration?;
      expect(
        decoration?.borderRadius,
        equals(const BorderRadius.all(Radius.circular(JoyRadius.md))),
      );
    });

    testWidgets('renders JoyBox.card with semantic tokens', (tester) async {
      const tokens = JoyThemeTokens.light;

      await tester.pumpWidget(
        _buildTestApp(
          tokens: tokens,
          child: const JoyBox.card(
            child: Text('Card Content'),
          ),
        ),
      );

      final container = tester.widget<Container>(find.byType(Container));
      final decoration = container.decoration as BoxDecoration?;

      expect(decoration?.color, equals(tokens.surface.card));
      expect(decoration?.border?.top.color, equals(tokens.border.subtle));
      expect(
        decoration?.borderRadius,
        equals(const BorderRadius.all(Radius.circular(JoyRadius.card))),
      );
    });

    testWidgets('renders JoyBox.sunken and JoyBox.raised surface tokens', (tester) async {
      const tokens = JoyThemeTokens.dark;

      await tester.pumpWidget(
        _buildTestApp(
          tokens: tokens,
          child: const Column(
            children: [
              JoyBox.sunken(child: Text('Sunken')),
              JoyBox.raised(child: Text('Raised')),
              JoyBox.canvas(child: Text('Canvas')),
            ],
          ),
        ),
      );

      final sunkenBox = tester.widget<Container>(
        find.ancestor(of: find.text('Sunken'), matching: find.byType(Container)),
      );
      final sunkenDec = sunkenBox.decoration as BoxDecoration?;
      expect(sunkenDec?.color, equals(tokens.surface.sunken));

      final raisedBox = tester.widget<Container>(
        find.ancestor(of: find.text('Raised'), matching: find.byType(Container)),
      );
      final raisedDec = raisedBox.decoration as BoxDecoration?;
      expect(raisedDec?.color, equals(tokens.surface.raised));

      final canvasBox = tester.widget<Container>(
        find.ancestor(of: find.text('Canvas'), matching: find.byType(Container)),
      );
      final canvasDec = canvasBox.decoration as BoxDecoration?;
      expect(canvasDec?.color, equals(tokens.surface.canvas));
    });
  });

  group('JoyFlex Layout Primitive', () {
    testWidgets('interleaves horizontal token gap correctly', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyFlex.horizontal(
            gap: JoySpacing.s16,
            children: [
              Text('Item 1'),
              Text('Item 2'),
              Text('Item 3'),
            ],
          ),
        ),
      );

      final flexWidget = tester.widget<Flex>(find.byType(Flex));
      expect(flexWidget.direction, equals(Axis.horizontal));
      // 3 items + 2 spacers = 5 children
      expect(flexWidget.children.length, equals(5));

      final spacer1 = flexWidget.children[1] as SizedBox;
      final spacer2 = flexWidget.children[3] as SizedBox;
      expect(spacer1.width, equals(JoySpacing.s16));
      expect(spacer2.width, equals(JoySpacing.s16));
    });

    testWidgets('interleaves vertical token gap correctly', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyFlex.vertical(
            gap: JoySpacing.s24,
            children: [
              Text('Top'),
              Text('Bottom'),
            ],
          ),
        ),
      );

      final flexWidget = tester.widget<Flex>(find.byType(Flex));
      expect(flexWidget.direction, equals(Axis.vertical));
      // 2 items + 1 spacer = 3 children
      expect(flexWidget.children.length, equals(3));

      final spacer = flexWidget.children[1] as SizedBox;
      expect(spacer.height, equals(JoySpacing.s24));
    });

    testWidgets('renders Wrap widget when wrap is true', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyFlex(
            wrap: true,
            gap: JoySpacing.s12,
            children: [
              Text('Wrap 1'),
              Text('Wrap 2'),
            ],
          ),
        ),
      );

      expect(find.byType(Wrap), findsOneWidget);
      final wrapWidget = tester.widget<Wrap>(find.byType(Wrap));
      expect(wrapWidget.spacing, equals(JoySpacing.s12));
      expect(wrapWidget.runSpacing, equals(JoySpacing.s12));
    });
  });

  group('JoySpace Layout Primitive', () {
    testWidgets('renders horizontal spacer SizedBox', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const Row(
            children: [
              Text('A'),
              JoySpace.horizontal(JoySpacing.s16),
              Text('B'),
            ],
          ),
        ),
      );

      final spaceFinder = find.byType(JoySpace);
      expect(spaceFinder, findsOneWidget);

      final sizedBoxes = tester.widgetList<SizedBox>(
        find.descendant(of: spaceFinder, matching: find.byType(SizedBox)),
      );
      expect(sizedBoxes.first.width, equals(JoySpacing.s16));
    });

    testWidgets('renders vertical spacer SizedBox', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const Column(
            children: [
              Text('Top'),
              JoySpace.vertical(JoySpacing.s24),
              Text('Bottom'),
            ],
          ),
        ),
      );

      final spaceFinder = find.byType(JoySpace);
      expect(spaceFinder, findsOneWidget);

      final sizedBoxes = tester.widgetList<SizedBox>(
        find.descendant(of: spaceFinder, matching: find.byType(SizedBox)),
      );
      expect(sizedBoxes.first.height, equals(JoySpacing.s24));
    });

    testWidgets('renders spaced children container when children are passed', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoySpace(
            size: JoySpacing.s8,
            children: [
              Text('C1'),
              Text('C2'),
            ],
          ),
        ),
      );

      expect(find.byType(JoyFlex), findsOneWidget);
      expect(find.text('C1'), findsOneWidget);
      expect(find.text('C2'), findsOneWidget);
    });
  });

  group('JoyGrid Layout Primitive', () {
    testWidgets('computes multi-column widths correctly from constraints', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const SizedBox(
            width: 400,
            child: JoyGrid(
              columns: 2,
              gutter: JoySpacing.s16, // 16.0
              children: [
                Text('Col 1'),
                Text('Col 2'),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(JoyGrid), findsOneWidget);
      expect(find.byType(Wrap), findsOneWidget);

      // Width calculation: (400 - 16) / 2 = 384 / 2 = 192.0
      final itemBoxes = tester.widgetList<SizedBox>(
        find.descendant(of: find.byType(JoyGrid), matching: find.byType(SizedBox)),
      ).toList();

      expect(itemBoxes[0].width, equals(192.0));
      expect(itemBoxes[1].width, equals(192.0));
    });

    testWidgets('supports dynamic responsiveColumns callback', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: SizedBox(
            width: 600,
            child: JoyGrid(
              gutter: 10.0,
              responsiveColumns: (maxWidth) => maxWidth > 500 ? 3 : 1,
              children: const [
                Text('R1'),
                Text('R2'),
                Text('R3'),
              ],
            ),
          ),
        ),
      );

      // Width: (600 - (3-1)*10) / 3 = (600 - 20) / 3 = 580 / 3 = 193.333...
      final itemBoxes = tester.widgetList<SizedBox>(
        find.descendant(of: find.byType(JoyGrid), matching: find.byType(SizedBox)),
      ).toList();

      expect(itemBoxes[0].width, closeTo(193.33, 0.01));
    });
  });

  group('JoyDivider Layout Primitive', () {
    testWidgets('renders horizontal hairline divider with border.subtle color', (tester) async {
      const tokens = JoyThemeTokens.light;

      await tester.pumpWidget(
        _buildTestApp(
          tokens: tokens,
          child: const JoyDivider.horizontal(),
        ),
      );

      expect(find.byType(JoyDivider), findsOneWidget);

      final container = tester.widget<Container>(
        find.descendant(of: find.byType(JoyDivider), matching: find.byType(Container)),
      );
      expect(container.constraints?.maxHeight, equals(1.0));
      expect(container.color, equals(tokens.border.subtle));
    });

    testWidgets('renders vertical hairline divider with thickness 1.0', (tester) async {
      const tokens = JoyThemeTokens.dark;

      await tester.pumpWidget(
        _buildTestApp(
          tokens: tokens,
          child: const SizedBox(
            height: 100,
            child: JoyDivider.vertical(),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(of: find.byType(JoyDivider), matching: find.byType(Container)),
      );
      expect(container.constraints?.maxWidth, equals(1.0));
      expect(container.color, equals(tokens.border.subtle));
    });

    testWidgets('renders divider with child text and horizontal spacing', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyDivider(
            child: Text('OR'),
          ),
        ),
      );

      expect(find.text('OR'), findsOneWidget);
      expect(find.byType(Row), findsOneWidget);
      expect(find.byType(Expanded), findsNWidgets(2));
    });

    testWidgets('renders dashed divider using CustomPaint', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyDivider(dashed: true),
        ),
      );

      final customPaintFinder = find.descendant(
        of: find.byType(JoyDivider),
        matching: find.byType(CustomPaint),
      );
      expect(customPaintFinder, findsOneWidget);
    });
  });
}
