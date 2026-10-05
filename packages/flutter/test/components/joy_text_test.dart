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
  group('JoyText Typography Scales', () {
    final expectedScales = <JoyTextVariant, double>{
      JoyTextVariant.h1: 32.0,
      JoyTextVariant.h2: 24.0,
      JoyTextVariant.h3: 20.0,
      JoyTextVariant.h4: 18.0,
      JoyTextVariant.h5: 16.0,
      JoyTextVariant.h6: 14.0,
      JoyTextVariant.body: 14.0,
      JoyTextVariant.bodyLarge: 16.0,
      JoyTextVariant.caption: 12.0,
      JoyTextVariant.code: 13.0,
    };

    for (final entry in expectedScales.entries) {
      testWidgets('renders ${entry.key.name} with font size ${entry.value}', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyText('Sample ${entry.key.name}', variant: entry.key),
          ),
        );

        final textFinder = find.text('Sample ${entry.key.name}');
        expect(textFinder, findsOneWidget);

        final textWidget = tester.widget<Text>(textFinder);
        expect(textWidget.style?.fontSize, equals(entry.value));
        expect(textWidget.style?.fontWeight, equals(entry.key.defaultFontWeight));
        if (entry.key == JoyTextVariant.code) {
          expect(textWidget.style?.fontFamily, equals('monospace'));
        }
      });
    }

    testWidgets('named constructors match variant configurations', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const Column(
            children: [
              JoyText.h1('H1'),
              JoyText.h2('H2'),
              JoyText.h3('H3'),
              JoyText.h4('H4'),
              JoyText.h5('H5'),
              JoyText.h6('H6'),
              JoyText.body('Body'),
              JoyText.bodyLarge('BodyLarge'),
              JoyText.caption('Caption'),
              JoyText.code('Code'),
            ],
          ),
        ),
      );

      expect(tester.widget<Text>(find.text('H1')).style?.fontSize, equals(32.0));
      expect(tester.widget<Text>(find.text('H2')).style?.fontSize, equals(24.0));
      expect(tester.widget<Text>(find.text('H3')).style?.fontSize, equals(20.0));
      expect(tester.widget<Text>(find.text('H4')).style?.fontSize, equals(18.0));
      expect(tester.widget<Text>(find.text('H5')).style?.fontSize, equals(16.0));
      expect(tester.widget<Text>(find.text('H6')).style?.fontSize, equals(14.0));
      expect(tester.widget<Text>(find.text('Body')).style?.fontSize, equals(14.0));
      expect(tester.widget<Text>(find.text('BodyLarge')).style?.fontSize, equals(16.0));
      expect(tester.widget<Text>(find.text('Caption')).style?.fontSize, equals(12.0));
      expect(tester.widget<Text>(find.text('Code')).style?.fontSize, equals(13.0));
      expect(tester.widget<Text>(find.text('Code')).style?.fontFamily, equals('monospace'));
    });
  });

  group('JoyText Color Variants & Theming', () {
    for (final colorVariant in JoyTextColor.values) {
      testWidgets('resolves ${colorVariant.name} in Light theme', (tester) async {
        const tokens = JoyThemeTokens.light;
        final expectedColor = colorVariant.resolve(tokens);

        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoyText('Light ${colorVariant.name}', color: colorVariant),
          ),
        );

        final textWidget = tester.widget<Text>(find.text('Light ${colorVariant.name}'));
        expect(textWidget.style?.color, equals(expectedColor));
      });

      testWidgets('resolves ${colorVariant.name} in Dark theme', (tester) async {
        const tokens = JoyThemeTokens.dark;
        final expectedColor = colorVariant.resolve(tokens);

        await tester.pumpWidget(
          _buildTestApp(
            tokens: tokens,
            child: JoyText('Dark ${colorVariant.name}', color: colorVariant),
          ),
        );

        final textWidget = tester.widget<Text>(find.text('Dark ${colorVariant.name}'));
        expect(textWidget.style?.color, equals(expectedColor));
      });
    }

    testWidgets('adapts primary text color dynamically across theme switch', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          tokens: JoyThemeTokens.light,
          child: const JoyText('Adaptive Theme'),
        ),
      );
      await tester.pumpAndSettle();

      final lightColor = tester.widget<Text>(find.text('Adaptive Theme')).style?.color;
      expect(lightColor, equals(JoyThemeTokens.light.text.primary));

      await tester.pumpWidget(
        _buildTestApp(
          tokens: JoyThemeTokens.dark,
          child: const JoyText('Adaptive Theme'),
        ),
      );
      await tester.pumpAndSettle();

      final darkColor = tester.widget<Text>(find.text('Adaptive Theme')).style?.color;
      expect(darkColor, equals(JoyThemeTokens.dark.text.primary));
      expect(lightColor, isNot(equals(darkColor)));
    });
  });

  group('JoyText Property Overrides', () {
    testWidgets('honors weight, align, maxLines, and overflow overrides', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyText(
            'Overridden Text',
            weight: FontWeight.w900,
            align: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      );

      final textWidget = tester.widget<Text>(find.text('Overridden Text'));
      expect(textWidget.style?.fontWeight, equals(FontWeight.w900));
      expect(textWidget.textAlign, equals(TextAlign.center));
      expect(textWidget.maxLines, equals(2));
      expect(textWidget.overflow, equals(TextOverflow.ellipsis));
    });

    testWidgets('merges custom TextStyle while preserving token defaults', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyText(
            'Styled Text',
            variant: JoyTextVariant.h1,
            style: TextStyle(letterSpacing: 2.0),
          ),
        ),
      );

      final textWidget = tester.widget<Text>(find.text('Styled Text'));
      expect(textWidget.style?.fontSize, equals(32.0));
      expect(textWidget.style?.letterSpacing, equals(2.0));
      expect(textWidget.style?.color, equals(JoyThemeTokens.light.text.primary));
    });
  });
}
