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
    'packages/contracts/schemas/tag.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final tracker = ContractEventTracker();

        final text = scenario.props['text'] as String? ?? 'Tag';
        final closable = scenario.props['closable'] as bool? ?? false;
        final checkable = scenario.props['checkable'] as bool? ?? false;
        final checked = scenario.props['checked'] as bool? ?? false;

        await tester.pumpWidget(
          _buildContractApp(
            JoyTag(
              text: text,
              closable: closable,
              onClose: () => tracker.trigger('close'),
              checkable: checkable,
              checked: checked,
              onChanged: (_) => tracker.trigger('change'),
            ),
          ),
        );

        // Execute scenario actions
        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap_close':
              await tester.tap(find.byKey(const Key('joy_tag_close_button')));
              await tester.pumpAndSettle();
            case 'tap':
              await tester.tap(find.byType(JoyTag));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in tag contract runner',
              );
          }
        }

        // Verify event counts
        for (final expectedEvent in scenario.expect.events.entries) {
          final actualCount = tracker.count(expectedEvent.key);
          expect(
            actualCount,
            equals(expectedEvent.value),
            reason: 'Event "${expectedEvent.key}" count mismatch for scenario ${scenario.id}',
          );
        }

        // Verify minimum touch target constraints
        if (scenario.expect.minTouchTarget != null) {
          final targetFinder = closable
              ? find.byKey(const Key('joy_tag_close_button'))
              : find.byType(JoyTag);
          final renderSize = tester.getSize(targetFinder);
          expect(
            renderSize.width,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.width),
            reason: 'Width ${renderSize.width} < minTouchTarget ${scenario.expect.minTouchTarget!.width}',
          );
          expect(
            renderSize.height,
            greaterThanOrEqualTo(scenario.expect.minTouchTarget!.height),
            reason: 'Height ${renderSize.height} < minTouchTarget ${scenario.expect.minTouchTarget!.height}',
          );
        }
      });
    }
  });
}
