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
      body: child,
    ),
  );
}

void main() {
  group('JoyDrawer Presentation & Scrim', () {
    test('scrimColor derives from navy900 at 60% opacity', () {
      final scrim = JoyDrawer.scrimColor;
      expect((scrim.a * 255.0).round() & 0xff, 153);
      expect((scrim.r * 255.0).round() & 0xff, (JoyColorRamps.navy900.r * 255.0).round() & 0xff);
      expect((scrim.g * 255.0).round() & 0xff, (JoyColorRamps.navy900.g * 255.0).round() & 0xff);
      expect((scrim.b * 255.0).round() & 0xff, (JoyColorRamps.navy900.b * 255.0).round() & 0xff);
    });

    testWidgets('JoyDrawer.show displays title, content and dismisses on close', (tester) async {
      bool closed = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  JoyDrawer.show<void>(
                    context: context,
                    title: const Text('Navigation Drawer'),
                    content: const Text('Drawer Links'),
                    placement: JoyDrawerPlacement.right,
                    onClose: () {
                      closed = true;
                    },
                  );
                },
                child: const Text('Open Drawer'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Open Drawer'));
      await tester.pumpAndSettle();

      expect(find.text('Navigation Drawer'), findsOneWidget);
      expect(find.text('Drawer Links'), findsOneWidget);

      final closeButton = find.byKey(const Key('joy-drawer-close-button'));
      expect(closeButton, findsOneWidget);

      final size = tester.getSize(closeButton);
      expect(size.width, greaterThanOrEqualTo(44.0));
      expect(size.height, greaterThanOrEqualTo(44.0));

      await tester.tap(closeButton);
      await tester.pumpAndSettle();

      expect(closed, isTrue);
      expect(find.text('Navigation Drawer'), findsNothing);
    });
  });

  group('JoyDrawer Placements & Mobile Adaptation', () {
    testWidgets('mobile <=480px automatically adapts to bottom sheet', (tester) async {
      tester.view.physicalSize = const Size(360, 640);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  JoyDrawer.show<void>(
                    context: context,
                    placement: JoyDrawerPlacement.right, // requested right, mobile adapts to bottom
                    title: const Text('Mobile Adaptive Drawer'),
                    content: const Text('Adaptive Content'),
                  );
                },
                child: const Text('Open Adaptive'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Open Adaptive'));
      await tester.pumpAndSettle();

      expect(find.text('Mobile Adaptive Drawer'), findsOneWidget);
      final drawerWidget = tester.widget<JoyDrawer>(find.byType(JoyDrawer));
      expect(drawerWidget.placement, JoyDrawerPlacement.bottom);
    });
  });
}
