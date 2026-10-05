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
  group('JoyNotification Standalone Widget & Tokens', () {
    testWidgets('renders title and description with card tokens', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyNotification(
            title: Text('Notification Title'),
            description: Text('Notification Details'),
            type: JoyNotificationType.info,
          ),
        ),
      );

      expect(find.text('Notification Title'), findsOneWidget);
      expect(find.text('Notification Details'), findsOneWidget);

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoyNotification),
          matching: find.byType(Container),
        ).first,
      );
      final decoration = container.decoration as BoxDecoration;

      expect(decoration.color, JoyThemeTokens.light.surface.card);
      expect(decoration.border?.top.color, JoyThemeTokens.light.border.subtle);
      expect(decoration.boxShadow, JoyThemeTokens.light.elevation.level3);
    });

    testWidgets('close button satisfies >=44x44px touch target bounds', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyNotification(
            title: Text('Closable Notification'),
            closable: true,
          ),
        ),
      );

      final closeButtonFinder =
          find.byKey(const Key('joy-notification-close-button'));
      expect(closeButtonFinder, findsOneWidget);

      final size = tester.getSize(closeButtonFinder);
      expect(size.width, greaterThanOrEqualTo(44.0));
      expect(size.height, greaterThanOrEqualTo(44.0));
    });

    testWidgets('supports all 4 semantic notification types', (tester) async {
      for (final type in JoyNotificationType.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyNotification(
              title: Text('Type ${type.name}'),
              type: type,
            ),
          ),
        );
        expect(find.text('Type ${type.name}'), findsOneWidget);
      }
    });
  });

  group('JoyNotification.show Floating Overlay & Dismissal', () {
    testWidgets('shows in overlay, dismisses on close button and calls onClose',
        (tester) async {
      bool closed = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  JoyNotification.show(
                    context,
                    title: const Text('Floating Notice'),
                    description: const Text('Details here'),
                    type: JoyNotificationType.success,
                    onClose: () {
                      closed = true;
                    },
                  );
                },
                child: const Text('Trigger Notification'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Trigger Notification'));
      await tester.pumpAndSettle();

      expect(find.text('Floating Notice'), findsOneWidget);
      expect(find.text('Details here'), findsOneWidget);

      final closeBtn = find.byKey(const Key('joy-notification-close-button'));
      expect(closeBtn, findsOneWidget);

      await tester.tap(closeBtn);
      await tester.pumpAndSettle();

      expect(closed, isTrue);
      expect(find.text('Floating Notice'), findsNothing);
    });

    testWidgets('auto-dismisses when duration expires', (tester) async {
      bool closed = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  JoyNotification.show(
                    context,
                    title: const Text('Auto Expiring Notice'),
                    duration: const Duration(milliseconds: 500),
                    onClose: () {
                      closed = true;
                    },
                  );
                },
                child: const Text('Trigger Auto Notice'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Trigger Auto Notice'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Auto Expiring Notice'), findsOneWidget);

      // Advance past duration + exit animation
      await tester.pump(const Duration(milliseconds: 450));
      await tester.pumpAndSettle();

      expect(closed, isTrue);
      expect(find.text('Auto Expiring Notice'), findsNothing);
    });

    testWidgets('allows programmatic dismissal via JoyNotificationEntry',
        (tester) async {
      late JoyNotificationEntry entry;

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  entry = JoyNotification.show(
                    context,
                    title: const Text('Programmatic Notice'),
                    duration: const Duration(seconds: 30),
                  );
                },
                child: const Text('Trigger Programmatic Notice'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Trigger Programmatic Notice'));
      await tester.pumpAndSettle();

      expect(find.text('Programmatic Notice'), findsOneWidget);
      expect(entry.isDismissed, isFalse);

      entry.close();
      await tester.pumpAndSettle();

      expect(entry.isDismissed, isTrue);
      expect(find.text('Programmatic Notice'), findsNothing);
    });

    testWidgets('adapts layout for mobile viewports <=480px', (tester) async {
      tester.view.physicalSize = const Size(375, 667);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  JoyNotification.show(
                    context,
                    title: const Text('Mobile Notice'),
                  );
                },
                child: const Text('Trigger Mobile Notice'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Trigger Mobile Notice'));
      await tester.pumpAndSettle();

      expect(find.text('Mobile Notice'), findsOneWidget);
      expect(find.byType(SafeArea), findsWidgets);
    });
  });
}
