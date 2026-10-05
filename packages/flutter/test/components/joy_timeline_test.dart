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
  group('JoyTimeline Event Streams & Layouts', () {
    testWidgets('renders timeline items with titles, contents, and timestamps', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTimeline(
            items: [
              JoyTimelineItem.text(
                title: 'Order Created',
                content: 'Payment processed successfully',
                timestamp: '10:00 AM',
                status: JoyTimelineStatus.success,
              ),
              JoyTimelineItem.text(
                title: 'Shipped',
                content: 'Package in transit',
                timestamp: '02:30 PM',
                status: JoyTimelineStatus.info,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Order Created'), findsOneWidget);
      expect(find.text('Payment processed successfully'), findsOneWidget);
      expect(find.text('10:00 AM'), findsOneWidget);
      expect(find.text('Shipped'), findsOneWidget);
      expect(find.text('Package in transit'), findsOneWidget);
      expect(find.text('02:30 PM'), findsOneWidget);
    });

    testWidgets('supports modes left, right, and alternate', (tester) async {
      for (final mode in JoyTimelineMode.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyTimeline(
              mode: mode,
              items: [
                JoyTimelineItem.text(
                  content: 'Event A',
                  timestamp: '01:00',
                ),
                JoyTimelineItem.text(
                  content: 'Event B',
                  timestamp: '02:00',
                ),
              ],
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Event A'), findsOneWidget);
        expect(find.text('Event B'), findsOneWidget);
      }
    });

    testWidgets('renders pending state row when pending widget is set', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTimeline(
            pending: const Text('Syncing updates...'),
            items: [
              JoyTimelineItem.text(content: 'Finalized event'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Finalized event'), findsOneWidget);
      expect(find.text('Syncing updates...'), findsOneWidget);
    });

    testWidgets('supports reverse ordering', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTimeline(
            reverse: true,
            items: [
              JoyTimelineItem.text(content: 'First in list'),
              JoyTimelineItem.text(content: 'Second in list'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('First in list'), findsOneWidget);
      expect(find.text('Second in list'), findsOneWidget);
    });
  });
}
