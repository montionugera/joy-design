import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';
import 'contract_runner.dart';

Widget _buildContractApp(Widget child) {
  return MaterialApp(
    theme: JoyTheme.themeData(JoyThemeTokens.light),
    home: Scaffold(
      body: SizedBox(
        width: 800,
        height: 600,
        child: child,
      ),
    ),
  );
}

class _TestRow {
  final String id;
  final String name;
  final double value;

  const _TestRow({required this.id, required this.name, required this.value});
}

void main() {
  final suite = ContractSuite.loadFromFile(
    'packages/contracts/schemas/table.contract.json',
  );

  final sampleData = [
    const _TestRow(id: '1', name: 'Alpha', value: 100.0),
    const _TestRow(id: '2', name: 'Beta', value: 200.0),
  ];

  final columns = [
    JoyTableColumn<_TestRow>(
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (context, record, index) => Text(record.name),
    ),
    JoyTableColumn<_TestRow>(
      key: 'value',
      title: 'Value',
      sortable: false,
      render: (context, record, index) => Text('${record.value}'),
    ),
  ];

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final striped = scenario.props['striped'] as bool? ?? false;
        final bordered = scenario.props['bordered'] as bool? ?? false;

        Set<Object> selectedRows = {};

        await tester.pumpWidget(
          _buildContractApp(
            StatefulBuilder(
              builder: (context, setState) {
                return JoyTable<_TestRow>(
                  columns: columns,
                  dataSource: sampleData,
                  rowKey: (row) => row.id,
                  striped: striped,
                  bordered: bordered,
                  selectedRowKeys: selectedRows,
                  onSort: (key, dir) => tracker.trigger('sort'),
                  onSelectionChanged: (keys) {
                    setState(() => selectedRows = keys);
                    tracker.trigger('selection');
                  },
                );
              },
            ),
          ),
        );
        await tester.pumpAndSettle();

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap_header':
              await tester.tap(find.text('Name'));
              await tester.pumpAndSettle();
            case 'tap_checkbox':
              await tester.tap(find.byType(JoyCheckbox).first);
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in table contract runner',
              );
          }
        }

        for (final expectedEvent in scenario.expect.events.entries) {
          final actualCount = tracker.count(expectedEvent.key);
          expect(
            actualCount,
            equals(expectedEvent.value),
            reason:
                'Event "${expectedEvent.key}" count mismatch for scenario ${scenario.id}',
          );
        }
      });
    }
  });
}
