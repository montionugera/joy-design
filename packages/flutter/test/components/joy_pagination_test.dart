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
  group('JoyPagination Navigation & Windowing', () {
    testWidgets('tapping page number invokes onChange', (tester) async {
      int activePage = 1;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyPagination(
                current: activePage,
                total: 50,
                pageSize: 10,
                onChange: (page) => setState(() => activePage = page),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('1'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);

      // Tap page 3
      await tester.tap(find.text('3'));
      await tester.pumpAndSettle();

      expect(activePage, equals(3));
    });

    testWidgets('next and prev chevron buttons navigate correctly', (tester) async {
      int activePage = 1;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyPagination(
                current: activePage,
                total: 30,
                pageSize: 10,
                onChange: (page) => setState(() => activePage = page),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Find chevrons
      final chevrons = find.byType(JoyIcon);
      expect(chevrons, findsNWidgets(2));

      // Page is 1, so prev should do nothing
      await tester.tap(chevrons.first);
      await tester.pumpAndSettle();
      expect(activePage, equals(1));

      // Tap next
      await tester.tap(chevrons.last);
      await tester.pumpAndSettle();
      expect(activePage, equals(2));

      // Tap next again
      await tester.tap(chevrons.last);
      await tester.pumpAndSettle();
      expect(activePage, equals(3));

      // Page is 3 (last page of 30 items with pageSize 10), tap next should do nothing
      await tester.tap(chevrons.last);
      await tester.pumpAndSettle();
      expect(activePage, equals(3));

      // Tap prev
      await tester.tap(chevrons.first);
      await tester.pumpAndSettle();
      expect(activePage, equals(2));
    });

    testWidgets('renders windowed pages and ellipsis for large page count', (tester) async {
      int activePage = 1;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyPagination(
                current: activePage,
                total: 200, // 20 pages
                pageSize: 10,
                onChange: (page) => setState(() => activePage = page),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('1'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
      expect(find.text('20'), findsOneWidget);
      expect(find.text('•••'), findsOneWidget);

      // Tap ellipsis to jump forward
      await tester.tap(find.text('•••'));
      await tester.pumpAndSettle();

      expect(activePage, equals(6));
    });

    testWidgets('compact mode switches to "prev [page / total] next" layout', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyPagination(
            current: 2,
            total: 100,
            pageSize: 10,
            simple: true,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('2 / 10'), findsOneWidget);
      expect(find.byType(JoyIcon), findsNWidgets(2)); // prev and next chevrons
    });

    testWidgets('enforces >= 44x44px touch target bounds on buttons', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyPagination(
            current: 1,
            total: 20,
            pageSize: 10,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final boxFinder = find.byWidgetPredicate(
        (w) => w is ConstrainedBox && w.constraints.minHeight >= 44.0 && w.constraints.minWidth >= 44.0,
      );
      expect(boxFinder, findsWidgets);
    });

    testWidgets('disabled pagination prevents interactions', (tester) async {
      int activePage = 1;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyPagination(
                current: activePage,
                total: 50,
                pageSize: 10,
                disabled: true,
                onChange: (page) => setState(() => activePage = page),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('2'));
      await tester.pumpAndSettle();

      expect(activePage, equals(1));
    });
  });
}
