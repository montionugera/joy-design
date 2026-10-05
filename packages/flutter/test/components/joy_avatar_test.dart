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
  group('JoyAvatar Initials & Name Computation', () {
    testWidgets('computes initials from two-word name', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar(
            name: 'Joy Design',
          ),
        ),
      );

      expect(find.text('JD'), findsOneWidget);
    });

    testWidgets('computes initials from single-word name', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar(
            name: 'Flutter',
          ),
        ),
      );

      expect(find.text('FL'), findsOneWidget);
    });

    testWidgets('respects explicit initials override', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar(
            name: 'John Doe',
            initials: 'XX',
          ),
        ),
      );

      expect(find.text('XX'), findsOneWidget);
      expect(find.text('JD'), findsNothing);
    });

    testWidgets('renders fallback icon when no name or initials are provided', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar(),
        ),
      );

      expect(find.byType(JoyIcon), findsOneWidget);
    });

    testWidgets('renders custom fallback widget when provided', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar(
            fallback: Text('custom_fallback'),
          ),
        ),
      );

      expect(find.text('custom_fallback'), findsOneWidget);
    });
  });

  group('JoyAvatar Sizes', () {
    for (final size in JoyAvatarSize.values) {
      testWidgets('renders standard size $size with ${size.dimension}px dimension', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyAvatar(
              size: size,
              initials: 'A',
            ),
          ),
        );

        final finder = find.byType(JoyAvatar);
        expect(finder, findsOneWidget);
        final renderSize = tester.getSize(finder);
        expect(renderSize.width, equals(size.dimension));
        expect(renderSize.height, equals(size.dimension));
      });
    }

    testWidgets('renders custom numeric size correctly', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar(
            customSize: 64.0,
            initials: 'C',
          ),
        ),
      );

      final renderSize = tester.getSize(find.byType(JoyAvatar));
      expect(renderSize.width, equals(64.0));
      expect(renderSize.height, equals(64.0));
    });
  });

  group('JoyAvatar Shapes & Ring Border', () {
    testWidgets('renders circle shape', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar.circle(
            initials: 'CR',
          ),
        ),
      );

      expect(find.text('CR'), findsOneWidget);
    });

    testWidgets('renders square shape', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar.square(
            initials: 'SQ',
          ),
        ),
      );

      expect(find.text('SQ'), findsOneWidget);
    });

    testWidgets('renders with ring border when ringWidth > 0', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyAvatar(
            initials: 'RB',
            ringWidth: 3.0,
          ),
        ),
      );

      expect(find.text('RB'), findsOneWidget);
      expect(find.byType(JoyAvatar), findsOneWidget);
    });
  });

  group('JoyAvatar Variants & Theming', () {
    for (final variant in JoyAvatarVariant.values) {
      testWidgets('renders variant $variant in Light theme', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: JoyThemeTokens.light,
            child: JoyAvatar(
              variant: variant,
              initials: 'T',
            ),
          ),
        );

        expect(find.text('T'), findsOneWidget);
      });

      testWidgets('renders variant $variant in Dark theme', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: JoyThemeTokens.dark,
            child: JoyAvatar(
              variant: variant,
              initials: 'T',
            ),
          ),
        );

        expect(find.text('T'), findsOneWidget);
      });
    }
  });
}
