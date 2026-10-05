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
  group('JoyBadge Count & Overflow', () {
    testWidgets('renders numeric count correctly', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge(
            count: 7,
          ),
        ),
      );

      expect(find.text('7'), findsOneWidget);
    });

    testWidgets('renders overflow count pill when exceeding threshold', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge(
            count: 120,
            overflowCount: 99,
          ),
        ),
      );

      expect(find.text('99+'), findsOneWidget);
    });

    testWidgets('custom overflowCount is respected', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge(
            count: 15,
            overflowCount: 9,
          ),
        ),
      );

      expect(find.text('9+'), findsOneWidget);
    });

    testWidgets('hides badge when count is zero and showZero is false', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge(
            count: 0,
            showZero: false,
          ),
        ),
      );

      expect(find.text('0'), findsNothing);
    });

    testWidgets('displays badge when count is zero and showZero is true', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge(
            count: 0,
            showZero: true,
          ),
        ),
      );

      expect(find.text('0'), findsOneWidget);
    });
  });

  group('JoyBadge Dot Variant', () {
    testWidgets('renders dot indicator without text', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge.dot(),
        ),
      );

      expect(find.byType(JoyBadge), findsOneWidget);
      expect(find.byType(Text), findsNothing);
    });

    testWidgets('renders dot indicator on child widget', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge.dot(
            child: SizedBox(
              key: Key('badge_child'),
              width: 40,
              height: 40,
            ),
          ),
        ),
      );

      expect(find.byKey(const Key('badge_child')), findsOneWidget);
      expect(
        find.descendant(
          of: find.byType(JoyBadge),
          matching: find.byType(Stack),
        ),
        findsOneWidget,
      );
    });
  });

  group('JoyBadge Status Variants & Theming', () {
    for (final status in JoyBadgeStatus.values) {
      testWidgets('renders $status in Light theme', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: JoyThemeTokens.light,
            child: JoyBadge(
              status: status,
              text: status.name,
            ),
          ),
        );

        expect(find.text(status.name), findsOneWidget);
      });

      testWidgets('renders $status in Dark theme', (tester) async {
        await tester.pumpWidget(
          _buildTestApp(
            tokens: JoyThemeTokens.dark,
            child: JoyBadge(
              status: status,
              text: status.name,
            ),
          ),
        );

        expect(find.text(status.name), findsOneWidget);
      });
    }
  });

  group('JoyBadge Child Wrapping & Positioning', () {
    testWidgets('wraps child and positions count badge over child', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyBadge.count(
            count: 5,
            child: Icon(Icons.notifications),
          ),
        ),
      );

      expect(find.byIcon(Icons.notifications), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
      expect(
        find.descendant(
          of: find.byType(JoyBadge),
          matching: find.byType(Stack),
        ),
        findsOneWidget,
      );
    });
  });
}
