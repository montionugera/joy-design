import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';
import 'contract_runner.dart';

Widget _buildContractApp(Widget child) {
  return MaterialApp(
    theme: JoyTheme.themeData(JoyThemeTokens.light),
    home: Scaffold(
      body: Center(child: child),
    ),
  );
}

void main() {
  final suite = ContractSuite.loadFromFile(
    'packages/contracts/schemas/breadcrumb.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final separator = scenario.props['separator'] as String? ?? '/';

        await tester.pumpWidget(
          _buildContractApp(
            JoyBreadcrumb(
              separator: Text(separator),
              items: [
                JoyBreadcrumbItem.text(
                  'Home',
                  onClick: () => tracker.trigger('click'),
                ),
                JoyBreadcrumbItem.text('Library'),
              ],
            ),
          ),
        );

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap_item':
              await tester.tap(find.text('Home'));
              await tester.pumpAndSettle();
            case 'tap_leaf':
              await tester.tap(find.text('Library'));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in breadcrumb contract runner',
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
