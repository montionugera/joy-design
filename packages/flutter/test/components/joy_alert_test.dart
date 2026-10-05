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
  group('JoyAlert Variants & Tokens', () {
    testWidgets('renders info variant with info status tokens', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAlert.info(
            title: Text('Info Title'),
            description: Text('Info Description'),
          ),
        ),
      );

      expect(find.text('Info Title'), findsOneWidget);
      expect(find.text('Info Description'), findsOneWidget);

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoyAlert),
          matching: find.byType(Container),
        ).first,
      );
      final decoration = container.decoration as BoxDecoration;

      expect(decoration.color, JoyThemeTokens.light.status.info.bg);
      final border = decoration.border as Border?;
      expect(border?.top.color, JoyThemeTokens.light.status.info.border);
      expect(border?.top.width, 1.0);
      expect(border?.bottom.width, 1.0);
      expect(border?.left.width, 1.0);
      expect(border?.right.width, 1.0);
      expect(border?.isUniform, isTrue);
    });

    testWidgets('renders success variant with success status tokens', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAlert.success(
            title: Text('Success Title'),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoyAlert),
          matching: find.byType(Container),
        ).first,
      );
      final decoration = container.decoration as BoxDecoration;

      expect(decoration.color, JoyThemeTokens.light.status.success.bg);
      expect(decoration.border?.top.color, JoyThemeTokens.light.status.success.border);
    });

    testWidgets('renders warning variant with warning status tokens', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAlert.warning(
            title: Text('Warning Title'),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoyAlert),
          matching: find.byType(Container),
        ).first,
      );
      final decoration = container.decoration as BoxDecoration;

      expect(decoration.color, JoyThemeTokens.light.status.warning.bg);
      expect(decoration.border?.top.color, JoyThemeTokens.light.status.warning.border);
    });

    testWidgets('renders danger variant with danger status tokens', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAlert.danger(
            title: Text('Danger Title'),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoyAlert),
          matching: find.byType(Container),
        ).first,
      );
      final decoration = container.decoration as BoxDecoration;

      expect(decoration.color, JoyThemeTokens.light.status.danger.bg);
      expect(decoration.border?.top.color, JoyThemeTokens.light.status.danger.border);
    });
  });

  group('JoyAlert Dismiss & Touch Target', () {
    testWidgets('close button enforces >= 44x44px touch target bounds', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAlert(
            title: Text('Closable Alert'),
            closable: true,
          ),
        ),
      );

      final closeButtonFinder = find.byKey(const Key('joy-alert-close-button'));
      expect(closeButtonFinder, findsOneWidget);

      final size = tester.getSize(closeButtonFinder);
      expect(size.width, greaterThanOrEqualTo(44.0));
      expect(size.height, greaterThanOrEqualTo(44.0));
    });

    testWidgets('dismisses alert and calls onClose callback', (tester) async {
      bool closed = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyAlert(
            title: const Text('Dismissable'),
            closable: true,
            onClose: () {
              closed = true;
            },
          ),
        ),
      );

      expect(find.text('Dismissable'), findsOneWidget);

      await tester.tap(find.byKey(const Key('joy-alert-close-button')));
      await tester.pumpAndSettle();

      expect(closed, isTrue);
      expect(find.text('Dismissable'), findsNothing);
    });
  });
}
