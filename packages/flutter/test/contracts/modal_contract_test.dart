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
    'packages/contracts/schemas/modal.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final titleText = scenario.props['title'] as String? ?? 'Modal';
        final closable = scenario.props['closable'] as bool? ?? true;

        await tester.pumpWidget(
          _buildContractApp(
            JoyModal(
              title: Text(titleText),
              content: Text('${scenario.id} content'),
              closable: closable,
              onClose: () => tracker.trigger('close'),
            ),
          ),
        );

        Size? touchTargetSize;
        if (scenario.expect.minTouchTarget != null) {
          final targetFinder = find.byKey(const Key('joy-modal-close-button'));
          if (targetFinder.evaluate().isNotEmpty) {
            touchTargetSize = tester.getSize(targetFinder);
          }
        }

        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap':
              await tester.tap(find.byKey(const Key('joy-modal-close-button')));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in modal contract runner',
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

        if (scenario.expect.minTouchTarget != null && touchTargetSize != null) {
          expect(
            touchTargetSize.width,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.width),
          );
          expect(
            touchTargetSize.height,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.height),
          );
        }
      });
    }
  });
}
