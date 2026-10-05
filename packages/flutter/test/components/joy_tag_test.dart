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
  group('JoyTag Content & Variants', () {
    for (final variant in JoyTagVariant.values) {
      testWidgets('renders $variant in Light theme', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: JoyThemeTokens.light,
            child: JoyTag(
              variant: variant,
              text: variant.name,
            ),
          ),
        );

        expect(find.text(variant.name), findsOneWidget);
      });

      testWidgets('renders $variant in Dark theme', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: JoyThemeTokens.dark,
            child: JoyTag(
              variant: variant,
              text: variant.name,
            ),
          ),
        );

        expect(find.text(variant.name), findsOneWidget);
      });
    }

    testWidgets('renders custom child widget and icon', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyTag(
            icon: Icon(Icons.label, size: 12),
            child: Text('Custom Content'),
          ),
        ),
      );

      expect(find.text('Custom Content'), findsOneWidget);
      expect(find.byIcon(Icons.label), findsOneWidget);
    });
  });

  group('JoyTag Closable & 44px Hit Bounds', () {
    testWidgets('renders close button when closable is true', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTag.closable(
            text: 'Closable Tag',
            onClose: () {},
          ),
        ),
      );

      expect(find.byKey(const Key('joy_tag_close_button')), findsOneWidget);
    });

    testWidgets('enforces >= 44x44px touch target on close button', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTag.closable(
            text: 'Hit Target Tag',
            onClose: () {},
          ),
        ),
      );

      final closeFinder = find.byKey(const Key('joy_tag_close_button'));
      expect(closeFinder, findsOneWidget);
      final size = tester.getSize(closeFinder);
      expect(size.width, greaterThanOrEqualTo(44.0));
      expect(size.height, greaterThanOrEqualTo(44.0));
    });

    testWidgets('triggers onClose when close button is tapped', (tester) async {
      int closeCount = 0;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTag.closable(
            text: 'Dismissible',
            onClose: () => closeCount++,
          ),
        ),
      );

      await tester.tap(find.byKey(const Key('joy_tag_close_button')));
      await tester.pumpAndSettle();

      expect(closeCount, equals(1));
    });
  });

  group('JoyTag Checkable / Selectable', () {
    testWidgets('fires onChanged with toggled value when tapped', (tester) async {
      bool? updatedValue;
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTag.checkable(
            text: 'Selectable',
            checked: false,
            onChanged: (val) => updatedValue = val,
          ),
        ),
      );

      await tester.tap(find.byType(JoyTag));
      await tester.pumpAndSettle();

      expect(updatedValue, isTrue);
    });

    testWidgets('renders checked state correctly', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTag.checkable(
            text: 'Selected',
            checked: true,
            onChanged: (_) {},
          ),
        ),
      );

      expect(find.text('Selected'), findsOneWidget);
    });
  });
}
