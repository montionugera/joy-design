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
  group('JoyMetricTile Display & Values', () {
    testWidgets('renders title and value accurately', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyMetricTile(
            title: 'Total Revenue',
            value: '\$1,245,800',
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Total Revenue'), findsOneWidget);
      expect(find.text('\$1,245,800'), findsOneWidget);
    });

    testWidgets('renders positive delta with up trend pill', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyMetricTile(
            title: 'Active Users',
            value: '42,150',
            delta: 12.5,
            deltaPeriod: 'vs last week',
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('+12.5%'), findsOneWidget);
      expect(find.text('vs last week'), findsOneWidget);
      expect(find.byType(JoyIcon), findsOneWidget);
    });

    testWidgets('renders negative delta with down trend pill', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyMetricTile(
            title: 'Churn Rate',
            value: '2.1%',
            delta: -0.8,
            deltaPeriod: 'MoM',
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('-0.8%'), findsOneWidget);
      expect(find.text('MoM'), findsOneWidget);
      expect(find.byType(JoyIcon), findsOneWidget);
    });

    testWidgets('renders prefix and suffix elements', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyMetricTile(
            title: 'Portfolio Value',
            value: '98,400',
            prefix: Text('\$'),
            suffix: Text('USD'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('\$'), findsOneWidget);
      expect(find.text('98,400'), findsOneWidget);
      expect(find.text('USD'), findsOneWidget);
    });

    testWidgets('tapping invokes onTap callback', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: JoyMetricTile(
            title: 'Clickable Metric',
            value: '100',
            onTap: () => tapped = true,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Clickable Metric'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('renders skeleton during loading state', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyMetricTile(
            title: 'Loading Tile',
            value: '999',
            loading: true,
          ),
        ),
      );
      await tester.pump();

      expect(find.byType(JoySkeleton), findsNWidgets(3));
      expect(find.text('Loading Tile'), findsNothing);
    });
  });

  group('JoyStatCard Features', () {
    testWidgets('renders eyebrow, title, value, delta, chart slot, and footer', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyStatCard(
            eyebrow: 'REAL-TIME TELEMETRY',
            title: 'Net Profit Margin',
            value: '24.8%',
            delta: 3.2,
            deltaPeriod: 'QoQ',
            chart: SizedBox(key: Key('mock-chart'), height: 30.0),
            footer: Text('Updated 5m ago'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('REAL-TIME TELEMETRY'), findsOneWidget);
      expect(find.text('Net Profit Margin'), findsOneWidget);
      expect(find.text('24.8%'), findsOneWidget);
      expect(find.text('+3.2%'), findsOneWidget);
      expect(find.text('QoQ'), findsOneWidget);
      expect(find.byKey(const Key('mock-chart')), findsOneWidget);
      expect(find.text('Updated 5m ago'), findsOneWidget);
    });
  });

  group('JoyMetricTile Theme & Dark Mode', () {
    testWidgets('renders cleanly in dark theme with zero violations', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          tokens: JoyThemeTokens.dark,
          child: const JoyMetricTile(
            title: 'Dark Mode Metric',
            value: '8,400',
            delta: 5.0,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Dark Mode Metric'), findsOneWidget);
      expect(find.text('+5.0%'), findsOneWidget);
    });
  });
}
