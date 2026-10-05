import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
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
  group('JoyIcon Vector SVG Rendering', () {
    testWidgets('renders JoyIconData vector icon correctly', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyIcon(JoyIcons.search),
        ),
      );

      expect(find.byType(JoyIcon), findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);
    });

    testWidgets('renders raw SVG markup string correctly', (tester) async {
      const rawSvg =
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyIcon.svg(rawSvg),
        ),
      );

      expect(find.byType(JoyIcon), findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);
    });

    testWidgets('renders JoyIcon via primary dynamic constructor with raw SVG string', (tester) async {
      const rawSvg =
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyIcon(rawSvg),
        ),
      );

      expect(find.byType(JoyIcon), findsOneWidget);
      expect(find.byType(SvgPicture), findsOneWidget);
    });
  });

  group('JoyIcon Sizing', () {
    testWidgets('renders standard sizes: sm (16), md (20), lg (24)', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: Column(
            children: [
              JoyIcon(JoyIcons.check, size: JoyIconSize.sm),
              JoyIcon(JoyIcons.check, size: JoyIconSize.md),
              JoyIcon(JoyIcons.check, size: JoyIconSize.lg),
            ],
          ),
        ),
      );

      final svgWidgets = tester.widgetList<SvgPicture>(find.byType(SvgPicture)).toList();
      expect(svgWidgets.length, equals(3));

      expect(svgWidgets[0].width, equals(16.0));
      expect(svgWidgets[0].height, equals(16.0));

      expect(svgWidgets[1].width, equals(20.0));
      expect(svgWidgets[1].height, equals(20.0));

      expect(svgWidgets[2].width, equals(24.0));
      expect(svgWidgets[2].height, equals(24.0));
    });

    testWidgets('renders custom numeric double size', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyIcon(JoyIcons.check, customSize: 36.0),
        ),
      );

      final svgWidget = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(svgWidget.width, equals(36.0));
      expect(svgWidget.height, equals(36.0));
    });

    testWidgets('accepts numeric size via primary constructor', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyIcon(JoyIcons.close, size: 28.0),
        ),
      );

      final svgWidget = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(svgWidget.width, equals(28.0));
      expect(svgWidget.height, equals(28.0));
    });
  });

  group('JoyIcon Color Tinting & Theme Parity', () {
    testWidgets('defaults color to tokens.text.primary in light theme', (tester) async {
      const tokens = JoyThemeTokens.light;

      await tester.pumpWidget(
        _buildTestApp(
          tokens: tokens,
          child: JoyIcon(JoyIcons.info),
        ),
      );

      final svgWidget = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(svgWidget.colorFilter, isNotNull);
      expect(
        svgWidget.colorFilter,
        equals(ColorFilter.mode(tokens.text.primary, BlendMode.srcIn)),
      );
    });

    testWidgets('defaults color to tokens.text.primary in dark theme', (tester) async {
      const tokens = JoyThemeTokens.dark;

      await tester.pumpWidget(
        _buildTestApp(
          tokens: tokens,
          child: JoyIcon(JoyIcons.info),
        ),
      );

      final svgWidget = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(svgWidget.colorFilter, isNotNull);
      expect(
        svgWidget.colorFilter,
        equals(ColorFilter.mode(tokens.text.primary, BlendMode.srcIn)),
      );
    });

    testWidgets('applies explicit semantic color tint override', (tester) async {
      const tokens = JoyThemeTokens.light;
      final accentColor = tokens.accent.base;

      await tester.pumpWidget(
        _buildTestApp(
          tokens: tokens,
          child: JoyIcon(JoyIcons.star, color: accentColor),
        ),
      );

      final svgWidget = tester.widget<SvgPicture>(find.byType(SvgPicture));
      expect(
        svgWidget.colorFilter,
        equals(ColorFilter.mode(accentColor, BlendMode.srcIn)),
      );
    });
  });

  group('JoyIcon Zero Emoji Policy Enforcement', () {
    test('strictly rejects raw OS emojis at construction', () {
      expect(
        () => JoyIcon('\u{1F50D}'),
        throwsA(isA<ArgumentError>()),
      );

      expect(
        () => JoyIcon.svg('<svg>\u{1F600}</svg>'),
        throwsA(isA<ArgumentError>()),
      );
    });
  });
}
