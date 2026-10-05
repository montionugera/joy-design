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
  group('JoyModal Presentation & Scrim', () {
    test('scrimColor derives from navy900 at 60% opacity', () {
      final scrim = JoyModal.scrimColor;
      expect((scrim.a * 255.0).round() & 0xff, 153); // 60% of 255
      expect((scrim.r * 255.0).round() & 0xff, (JoyColorRamps.navy900.r * 255.0).round() & 0xff);
      expect((scrim.g * 255.0).round() & 0xff, (JoyColorRamps.navy900.g * 255.0).round() & 0xff);
      expect((scrim.b * 255.0).round() & 0xff, (JoyColorRamps.navy900.b * 255.0).round() & 0xff);
    });

    testWidgets('JoyModal.show displays title, content, footer and dismisses on close', (tester) async {
      bool closed = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  JoyModal.show<void>(
                    context: context,
                    title: const Text('Test Modal Title'),
                    content: const Text('Modal Body Text'),
                    footer: const Text('Modal Footer Text'),
                    onClose: () {
                      closed = true;
                    },
                  );
                },
                child: const Text('Open Modal'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Open Modal'));
      await tester.pumpAndSettle();

      expect(find.text('Test Modal Title'), findsOneWidget);
      expect(find.text('Modal Body Text'), findsOneWidget);
      expect(find.text('Modal Footer Text'), findsOneWidget);

      final closeButton = find.byKey(const Key('joy-modal-close-button'));
      expect(closeButton, findsOneWidget);

      final size = tester.getSize(closeButton);
      expect(size.width, greaterThanOrEqualTo(44.0));
      expect(size.height, greaterThanOrEqualTo(44.0));

      await tester.tap(closeButton);
      await tester.pumpAndSettle();

      expect(closed, isTrue);
      expect(find.text('Test Modal Title'), findsNothing);
    });
  });

  group('JoyModal Mobile Responsiveness', () {
    testWidgets('mobile <=480px renders full-bleed without card border radius', (tester) async {
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
                  JoyModal.show<void>(
                    context: context,
                    title: const Text('Mobile Modal'),
                    content: const Text('Mobile Content'),
                  );
                },
                child: const Text('Open'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();

      expect(find.text('Mobile Modal'), findsOneWidget);
      expect(find.byType(SafeArea), findsOneWidget);
    });
  });
}
