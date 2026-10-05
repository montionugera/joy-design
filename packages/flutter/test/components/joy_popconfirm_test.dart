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
  group('JoyPopconfirm Interaction & Actions', () {
    testWidgets('tapping trigger displays confirmation popover', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyPopconfirm.text(
            title: 'Delete this item?',
            child: const Text('Delete Action'),
          ),
        ),
      );

      expect(find.text('Delete Action'), findsOneWidget);
      expect(find.text('Delete this item?'), findsNothing);

      await tester.tap(find.text('Delete Action'));
      await tester.pumpAndSettle();

      expect(find.text('Delete this item?'), findsOneWidget);
      expect(find.byKey(const Key('joy-popconfirm-confirm-button')), findsOneWidget);
      expect(find.byKey(const Key('joy-popconfirm-cancel-button')), findsOneWidget);
    });

    testWidgets('confirm button triggers onConfirm and closes popover', (tester) async {
      bool confirmed = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyPopconfirm.text(
            title: 'Are you sure?',
            onConfirm: () {
              confirmed = true;
            },
            child: const Text('Confirm Trigger'),
          ),
        ),
      );

      await tester.tap(find.text('Confirm Trigger'));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('joy-popconfirm-confirm-button')));
      await tester.pumpAndSettle();

      expect(confirmed, isTrue);
      expect(find.text('Are you sure?'), findsNothing);
    });

    testWidgets('cancel button triggers onCancel and closes popover', (tester) async {
      bool canceled = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyPopconfirm.text(
            title: 'Are you sure?',
            onCancel: () {
              canceled = true;
            },
            child: const Text('Cancel Trigger'),
          ),
        ),
      );

      await tester.tap(find.text('Cancel Trigger'));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('joy-popconfirm-cancel-button')));
      await tester.pumpAndSettle();

      expect(canceled, isTrue);
      expect(find.text('Are you sure?'), findsNothing);
    });

    testWidgets('disabled popconfirm does not open on trigger tap', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyPopconfirm.text(
            title: 'Disabled confirm',
            disabled: true,
            child: const Text('Disabled Trigger'),
          ),
        ),
      );

      await tester.tap(find.text('Disabled Trigger'));
      await tester.pumpAndSettle();

      expect(find.text('Disabled confirm'), findsNothing);
    });
  });
}
