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
  group('JoyBreadcrumb Hierarchy & Interaction', () {
    testWidgets('renders items with default "/" separator', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyBreadcrumb(
            items: [
              JoyBreadcrumbItem.text('Home'),
              JoyBreadcrumbItem.text('Products'),
              JoyBreadcrumbItem.text('Category'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Products'), findsOneWidget);
      expect(find.text('Category'), findsOneWidget);
      // 3 items have 2 separators
      expect(find.text('/'), findsNWidgets(2));
    });

    testWidgets('renders custom separator widget', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyBreadcrumb(
            separator: const Text('>'),
            items: [
              JoyBreadcrumbItem.text('Dashboard'),
              JoyBreadcrumbItem.text('Settings'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Dashboard'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('>'), findsOneWidget);
    });

    testWidgets('clicking clickable item invokes onClick callback', (tester) async {
      var clicked = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyBreadcrumb(
            items: [
              JoyBreadcrumbItem.text('Home', onClick: () => clicked = true),
              JoyBreadcrumbItem.text('Current Page'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Home'));
      await tester.pumpAndSettle();

      expect(clicked, isTrue);
    });

    testWidgets('renders breadcrumb items with icons', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyBreadcrumb(
            items: [
              JoyBreadcrumbItem(
                title: const Text('Search'),
                icon: JoyIcon(JoyIcons.search),
              ),
              JoyBreadcrumbItem.text('Results'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Search'), findsOneWidget);
      expect(find.byType(JoyIcon), findsOneWidget);
      expect(find.text('Results'), findsOneWidget);
    });
  });
}
