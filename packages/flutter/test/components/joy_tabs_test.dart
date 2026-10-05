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
  group('JoyTabs Navigation & Selection', () {
    testWidgets('tapping tab updates active tab and invokes onChange', (tester) async {
      String activeTab = 'tab1';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyTabs(
                activeKey: activeTab,
                onChange: (key) => setState(() => activeTab = key),
                items: const [
                  JoyTabItem.text(key: 'tab1', label: 'Overview', content: Text('Overview Content')),
                  JoyTabItem.text(key: 'tab2', label: 'Analytics', content: Text('Analytics Content')),
                  JoyTabItem.text(key: 'tab3', label: 'Settings', content: Text('Settings Content')),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Overview'), findsOneWidget);
      expect(find.text('Analytics'), findsOneWidget);
      expect(find.text('Overview Content'), findsOneWidget);
      expect(find.text('Analytics Content'), findsNothing);

      // Tap Analytics
      await tester.tap(find.text('Analytics'));
      await tester.pumpAndSettle();

      expect(activeTab, equals('tab2'));
      expect(find.text('Analytics Content'), findsOneWidget);
      expect(find.text('Overview Content'), findsNothing);
    });

    testWidgets('disabled tab ignores tap events', (tester) async {
      String activeTab = 'tab1';

      await tester.pumpWidget(
        _buildTestApp(
          child: StatefulBuilder(
            builder: (context, setState) {
              return JoyTabs(
                activeKey: activeTab,
                onChange: (key) => setState(() => activeTab = key),
                items: const [
                  JoyTabItem.text(key: 'tab1', label: 'Active Tab'),
                  JoyTabItem.text(key: 'tab2', label: 'Disabled Tab', disabled: true),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Disabled Tab'));
      await tester.pumpAndSettle();

      expect(activeTab, equals('tab1'));
    });

    testWidgets('supports sizes sm, md, lg', (tester) async {
      for (final size in JoyTabsSize.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyTabs(
              activeKey: 'tab1',
              size: size,
              items: const [
                JoyTabItem.text(key: 'tab1', label: 'Tab 1'),
                JoyTabItem.text(key: 'tab2', label: 'Tab 2'),
              ],
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Tab 1'), findsOneWidget);
        expect(find.text('Tab 2'), findsOneWidget);
      }
    });

    testWidgets('supports types line and card', (tester) async {
      for (final type in JoyTabsType.values) {
        await tester.pumpWidget(
          _buildTestApp(
            child: JoyTabs(
              activeKey: 'tab1',
              type: type,
              items: const [
                JoyTabItem.text(key: 'tab1', label: 'Line/Card Tab 1'),
                JoyTabItem.text(key: 'tab2', label: 'Line/Card Tab 2'),
              ],
            ),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Line/Card Tab 1'), findsOneWidget);
        expect(find.text('Line/Card Tab 2'), findsOneWidget);
      }
    });

    testWidgets('enforces >= 44x44px touch target bounds on tab items', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const JoyTabs(
            activeKey: 'tab1',
            size: JoyTabsSize.sm, // sm visual height is 34, coarse bound must be >= 44
            items: [
              JoyTabItem.text(key: 'tab1', label: 'TouchTargetTab'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      final boxFinder = find.byWidgetPredicate(
        (w) => w is ConstrainedBox && w.constraints.minHeight >= 44.0 && w.constraints.minWidth >= 44.0,
      );
      expect(boxFinder, findsWidgets);
    });

    testWidgets('renders tab with icon', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: JoyTabs(
            activeKey: 'tab1',
            items: [
              JoyTabItem(
                key: 'tab1',
                label: 'Search',
                icon: JoyIcon(JoyIcons.search),
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Search'), findsOneWidget);
      expect(find.byType(JoyIcon), findsOneWidget);
    });
  });
}
