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
  group('JoyMessage Standalone Widget & Tokens', () {
    testWidgets('renders message content with card and elevation tokens',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyMessage(
            content: 'Changes saved successfully',
            type: JoyMessageType.success,
          ),
        ),
      );

      expect(find.text('Changes saved successfully'), findsOneWidget);

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(JoyMessage),
          matching: find.byType(Container),
        ).first,
      );
      final decoration = container.decoration as BoxDecoration;

      expect(decoration.color, JoyThemeTokens.light.surface.card);
      expect(decoration.border?.top.color, JoyThemeTokens.light.border.subtle);
      expect(decoration.boxShadow, JoyThemeTokens.light.elevation.level2);
    });

    testWidgets('supports all 4 semantic message types', (tester) async {
      for (final type in JoyMessageType.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyMessage(
              content: 'Message ${type.name}',
              type: type,
            ),
          ),
        );
        expect(find.text('Message ${type.name}'), findsOneWidget);
      }
    });
  });

  group('JoyMessage.show Floating Pill Toast & Auto-Dismiss', () {
    testWidgets('shows centered pill toast and auto-dismisses on timeout',
        (tester) async {
      bool closed = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  JoyMessage.show(
                    context,
                    content: 'Operation completed',
                    type: JoyMessageType.info,
                    duration: const Duration(milliseconds: 500),
                    onClose: () {
                      closed = true;
                    },
                  );
                },
                child: const Text('Trigger Message'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Trigger Message'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Operation completed'), findsOneWidget);

      // Advance past duration + exit animation
      await tester.pump(const Duration(milliseconds: 450));
      await tester.pumpAndSettle();

      expect(closed, isTrue);
      expect(find.text('Operation completed'), findsNothing);
    });

    testWidgets('supports programmatic dismissal via JoyMessageEntry',
        (tester) async {
      late JoyMessageEntry entry;

      await tester.pumpWidget(
        _buildTestApp(
          child: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () {
                  entry = JoyMessage.show(
                    context,
                    content: 'Dismissible message',
                    duration: const Duration(seconds: 30),
                  );
                },
                child: const Text('Trigger'),
              );
            },
          ),
        ),
      );

      await tester.tap(find.text('Trigger'));
      await tester.pumpAndSettle();

      expect(find.text('Dismissible message'), findsOneWidget);
      expect(entry.isDismissed, isFalse);

      entry.close();
      await tester.pumpAndSettle();

      expect(entry.isDismissed, isTrue);
      expect(find.text('Dismissible message'), findsNothing);
    });
  });
}
