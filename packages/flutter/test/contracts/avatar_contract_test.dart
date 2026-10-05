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
    'packages/contracts/schemas/avatar.contract.json',
  );

  group('${suite.component} v${suite.version} Contract Suite', () {
    for (final scenario in suite.scenarios) {
      testWidgets('${scenario.id}: ${scenario.description}', (tester) async {
        final name = scenario.props['name'] as String?;
        final initials = scenario.props['initials'] as String?;
        final sizeStr = scenario.props['size'] as String? ?? 'md';
        final shapeStr = scenario.props['shape'] as String? ?? 'circle';

        final size = JoyAvatarSize.values.firstWhere(
          (s) => s.name == sizeStr,
          orElse: () => JoyAvatarSize.md,
        );

        final shape = JoyAvatarShape.values.firstWhere(
          (s) => s.name == shapeStr,
          orElse: () => JoyAvatarShape.circle,
        );

        await tester.pumpWidget(
          _buildContractApp(
            JoyAvatar(
              name: name,
              initials: initials,
              size: size,
              shape: shape,
            ),
          ),
        );

        // Execute scenario actions
        for (final action in scenario.actions) {
          switch (action.type) {
            case 'tap':
              await tester.tap(find.byType(JoyAvatar));
              await tester.pumpAndSettle();
            default:
              throw UnimplementedError(
                'Action type "${action.type}" not supported in avatar contract runner',
              );
          }
        }

        // Scenario assertions
        if (scenario.id == 'avatar_initials_render') {
          expect(find.text('JD'), findsOneWidget);
        } else if (scenario.id == 'avatar_explicit_initials') {
          expect(find.text('JD'), findsOneWidget);
        }

        // Check geometry constraints
        final renderSize = tester.getSize(find.byType(JoyAvatar));
        expect(renderSize.width, equals(size.dimension));
        expect(renderSize.height, equals(size.dimension));
      });
    }
  });
}
