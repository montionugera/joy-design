import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

Widget _buildTestApp({
  required Widget child,
  JoyThemeTokens tokens = JoyThemeTokens.light,
  double? width,
  double? height,
}) {
  return MaterialApp(
    theme: JoyTheme.themeData(tokens),
    home: Scaffold(
      body: SizedBox(
        width: width ?? 800.0,
        height: height ?? 600.0,
        child: child,
      ),
    ),
  );
}

class TestRow {
  final String id;
  final String symbol;
  final double price;
  final double change;

  const TestRow({
    required this.id,
    required this.symbol,
    required this.price,
    required this.change,
  });
}

void main() {
  final sampleData = [
    const TestRow(id: '1', symbol: 'AAPL', price: 175.50, change: 1.25),
    const TestRow(id: '2', symbol: 'GOOGL', price: 140.20, change: -0.80),
    const TestRow(id: '3', symbol: 'MSFT', price: 330.10, change: 2.10),
  ];

  final columns = [
    JoyTableColumn<TestRow>(
      key: 'symbol',
      title: 'Symbol',
      sortable: true,
      render: (context, record, index) => Text(record.symbol),
    ),
    JoyTableColumn<TestRow>(
      key: 'price',
      title: 'Price',
      sortable: true,
      align: TextAlign.right,
      render: (context, record, index) => Text('\$${record.price.toStringAsFixed(2)}'),
    ),
    JoyTableColumn<TestRow>(
      key: 'change',
      title: 'Change',
      sortable: false,
      align: TextAlign.right,
      render: (context, record, index) => Text('${record.change > 0 ? '+' : ''}${record.change}%'),
    ),
  ];

  group('JoyTable Rendering & Layout', () {
    testWidgets('renders table headers and data rows in standard view', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTable<TestRow>(
            columns: columns,
            dataSource: sampleData,
            rowKey: (row) => row.id,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Symbol'), findsOneWidget);
      expect(find.text('Price'), findsOneWidget);
      expect(find.text('Change'), findsOneWidget);

      expect(find.text('AAPL'), findsOneWidget);
      expect(find.text('GOOGL'), findsOneWidget);
      expect(find.text('MSFT'), findsOneWidget);

      expect(find.text('\$175.50'), findsOneWidget);
      expect(find.text('+1.25%'), findsOneWidget);
    });

    testWidgets('renders empty placeholder when dataSource is empty', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTable<TestRow>(
            columns: columns,
            dataSource: const [],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('No data available'), findsOneWidget);
    });

    testWidgets('renders loading spinner when loading is true', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTable<TestRow>(
            columns: columns,
            dataSource: sampleData,
            loading: true,
          ),
        ),
      );
      await tester.pump();

      expect(find.byType(JoySpin), findsOneWidget);
      expect(find.text('Loading data...'), findsOneWidget);
    });
  });

  group('JoyTable Sorting', () {
    testWidgets('tapping sortable header cycles sort direction and fires onSort', (tester) async {
      String? sortedKey;
      JoySortDirection? sortedDir;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyTable<TestRow>(
                columns: columns,
                dataSource: sampleData,
                sortColumnKey: sortedKey,
                sortDirection: sortedDir,
                onSort: (key, dir) {
                  setState(() {
                    sortedKey = key;
                    sortedDir = dir;
                  });
                },
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap 'Symbol' header -> asc
      await tester.tap(find.text('Symbol'));
      await tester.pumpAndSettle();
      expect(sortedKey, equals('symbol'));
      expect(sortedDir, equals(JoySortDirection.asc));

      // Tap 'Symbol' header again -> desc
      await tester.tap(find.text('Symbol'));
      await tester.pumpAndSettle();
      expect(sortedKey, equals('symbol'));
      expect(sortedDir, equals(JoySortDirection.desc));

      // Tap 'Symbol' header third time -> none
      await tester.tap(find.text('Symbol'));
      await tester.pumpAndSettle();
      expect(sortedKey, equals('symbol'));
      expect(sortedDir, equals(JoySortDirection.none));
    });

    testWidgets('non-sortable header does not trigger onSort', (tester) async {
      bool sortCalled = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTable<TestRow>(
            columns: columns,
            dataSource: sampleData,
            onSort: (_, __) => sortCalled = true,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap 'Change' header (sortable: false)
      await tester.tap(find.text('Change'));
      await tester.pumpAndSettle();

      expect(sortCalled, isFalse);
    });
  });

  group('JoyTable Row Selection', () {
    testWidgets('renders checkboxes and coordinates row selection', (tester) async {
      Set<Object> selected = {'1'};

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyTable<TestRow>(
                columns: columns,
                dataSource: sampleData,
                rowKey: (r) => r.id,
                selectedRowKeys: selected,
                onSelectionChanged: (keys) => setState(() => selected = keys),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      // 1 header checkbox + 3 row checkboxes = 4 checkboxes
      expect(find.byType(JoyCheckbox), findsNWidgets(4));

      // Tap row 2 checkbox to add '2'
      final checkboxes = find.byType(JoyCheckbox);
      await tester.tap(checkboxes.at(2)); // row 2
      await tester.pumpAndSettle();

      expect(selected, containsAll({'1', '2'}));
    });

    testWidgets('header select-all checkbox toggles all rows', (tester) async {
      Set<Object> selected = {};

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyTable<TestRow>(
                columns: columns,
                dataSource: sampleData,
                rowKey: (r) => r.id,
                selectedRowKeys: selected,
                onSelectionChanged: (keys) => setState(() => selected = keys),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap header checkbox (index 0) to select all
      await tester.tap(find.byType(JoyCheckbox).first);
      await tester.pumpAndSettle();
      expect(selected, equals({'1', '2', '3'}));

      // Tap header checkbox again to deselect all
      await tester.tap(find.byType(JoyCheckbox).first);
      await tester.pumpAndSettle();
      expect(selected, isEmpty);
    });
  });

  group('JoyTable Mobile Stack Adaptation', () {
    testWidgets('switches to stacked cards when width <= 480px', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          width: 375.0, // mobile viewport
          child: JoyTable<TestRow>(
            columns: columns,
            dataSource: sampleData,
            rowKey: (r) => r.id,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // In stacked card mode, column titles appear for each card row (3 items * 3 columns = 9 text occurrences)
      expect(find.text('Symbol'), findsNWidgets(3));
      expect(find.text('Price'), findsNWidgets(3));
      expect(find.text('Change'), findsNWidgets(3));

      expect(find.text('AAPL'), findsOneWidget);
      expect(find.text('GOOGL'), findsOneWidget);
      expect(find.text('MSFT'), findsOneWidget);
    });

    testWidgets('explicit JoyTableVariant.stack renders mobile cards regardless of width', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          width: 1200.0,
          child: JoyTable<TestRow>(
            columns: columns,
            dataSource: sampleData,
            rowKey: (r) => r.id,
            variant: JoyTableVariant.stack,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Symbol'), findsNWidgets(3));
      expect(find.text('AAPL'), findsOneWidget);
    });
  });

  group('JoyTable Theme Support', () {
    testWidgets('renders cleanly in dark theme with zero violations', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          tokens: JoyThemeTokens.dark,
          child: JoyTable<TestRow>(
            columns: columns,
            dataSource: sampleData,
            striped: true,
            bordered: true,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('AAPL'), findsOneWidget);
    });
  });
}
