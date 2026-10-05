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
  group('JoySteps Workflow & States', () {
    testWidgets('renders horizontal steps with status icons and numbers', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoySteps(
            current: 1, // Step 0 finish, Step 1 process, Step 2 wait
            items: [
              JoyStepItem.text(title: 'Step 1', description: 'Finished'),
              JoyStepItem.text(title: 'Step 2', description: 'In Progress'),
              JoyStepItem.text(title: 'Step 3', description: 'Waiting'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Step 1'), findsOneWidget);
      expect(find.text('Step 2'), findsOneWidget);
      expect(find.text('Step 3'), findsOneWidget);

      // Finished step has check icon
      expect(find.byType(JoyIcon), findsWidgets);
      // In progress step has '2'
      expect(find.text('2'), findsOneWidget);
      // Wait step has '3'
      expect(find.text('3'), findsOneWidget);
    });

    testWidgets('error status renders error close icon', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoySteps(
            current: 1,
            status: JoyStepStatus.error,
            items: [
              JoyStepItem.text(title: 'First'),
              JoyStepItem.text(title: 'Failed'),
              JoyStepItem.text(title: 'Third'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Failed'), findsOneWidget);
      // Both finish (Step 0) and error (Step 1) use JoyIcon
      expect(find.byType(JoyIcon), findsNWidgets(2));
    });

    testWidgets('supports vertical direction', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoySteps(
            current: 0,
            direction: Axis.vertical,
            items: [
              JoyStepItem.text(title: 'Vertical 1', description: 'Desc 1'),
              JoyStepItem.text(title: 'Vertical 2', description: 'Desc 2'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Vertical 1'), findsOneWidget);
      expect(find.text('Vertical 2'), findsOneWidget);
      expect(find.text('Desc 1'), findsOneWidget);
    });

    testWidgets('clicking step triggers onChange when provided', (tester) async {
      int activeStep = 0;

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoySteps(
                current: activeStep,
                onChange: (idx) => setState(() => activeStep = idx),
                items: [
                  JoyStepItem.text(title: 'Account'),
                  JoyStepItem.text(title: 'Profile'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Profile'));
      await tester.pumpAndSettle();

      expect(activeStep, equals(1));
    });

    testWidgets('supports sizes sm and md', (tester) async {
      for (final size in JoyStepsSize.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoySteps(
              current: 0,
              size: size,
              items: [
                JoyStepItem.text(title: 'One'),
                JoyStepItem.text(title: 'Two'),
              ],
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('One'), findsOneWidget);
        expect(find.text('Two'), findsOneWidget);
      }
    });
  });
}
