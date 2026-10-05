import 'package:flutter/material.dart';
import 'package:joymify_flutter/joymify_flutter.dart';
import 'bridge.dart';

void main() {
  runApp(const JoyFlutterHubApp());
}

/// Root widget for Joymify Flutter Web Hub.
class JoyFlutterHubApp extends StatefulWidget {
  const JoyFlutterHubApp({super.key});

  @override
  State<JoyFlutterHubApp> createState() => _JoyFlutterHubAppState();
}

class _JoyFlutterHubAppState extends State<JoyFlutterHubApp> {
  String _currentTheme = 'light';

  @override
  void initState() {
    super.initState();
    JoyHubBridge.initialize(
      initialTheme: _currentTheme,
      onThemeChange: (theme) {
        if (mounted) {
          setState(() {
            _currentTheme = theme;
          });
        }
      },
      onButtonClick: (_) {
        if (mounted) {
          setState(() {});
        }
      },
    );
  }

  void _toggleTheme() {
    final nextTheme = _currentTheme == 'dark' ? 'light' : 'dark';
    JoyHubBridge.setTheme(nextTheme);
  }

  @override
  Widget build(BuildContext context) {
    final tokens = _currentTheme == 'dark'
        ? JoyThemeTokens.dark
        : JoyThemeTokens.light;

    return MaterialApp(
      title: 'Joymify Flutter Hub',
      debugShowCheckedModeBanner: false,
      theme: JoyTheme.themeData(tokens),
      home: Scaffold(
        backgroundColor: tokens.surface.canvas,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(JoySpacing.s32),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 880.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildHeader(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildInteractiveCounterSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildVariantsSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildSizesSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildStatesSection(tokens),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(JoyThemeTokens tokens) {
    return Container(
      padding: const EdgeInsets.all(JoySpacing.s24),
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        border: Border.all(color: tokens.border.base),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Joymify Flutter Hub',
                style: TextStyle(
                  fontSize: 24.0,
                  fontWeight: FontWeight.w700,
                  color: tokens.text.primary,
                ),
              ),
              const SizedBox(height: JoySpacing.s4),
              Text(
                'Cross-platform Flutter Web Showcase & Playwright Bridge',
                style: TextStyle(
                  fontSize: 14.0,
                  color: tokens.text.secondary,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: JoySpacing.s12,
                  vertical: JoySpacing.s4,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(JoyRadius.control),
                  border: Border.all(color: tokens.border.base),
                ),
                child: Text(
                  _currentTheme.toUpperCase(),
                  key: const ValueKey('theme-badge'),
                  style: TextStyle(
                    fontSize: 12.0,
                    fontWeight: FontWeight.w600,
                    color: tokens.text.primary,
                  ),
                ),
              ),
              const SizedBox(width: JoySpacing.s12),
              JoyButton(
                key: const ValueKey('theme-toggle-btn'),
                variant: JoyButtonVariant.outline,
                size: JoyButtonSize.sm,
                onPressed: _toggleTheme,
                child: Text(
                  _currentTheme == 'dark' ? 'Switch to Light' : 'Switch to Dark',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInteractiveCounterSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Interactive Playwright Counter',
      subtitle: 'Button click triggers bridge update and increments count',
      content: Row(
        children: [
          JoyButton(
            key: const ValueKey('interactive-counter-btn'),
            variant: JoyButtonVariant.solid,
            size: JoyButtonSize.lg,
            onPressed: () {
              setState(() {
                JoyHubBridge.incrementButtonClick();
              });
            },
            child: Text('Clicked: ${JoyHubBridge.buttonClickCount}'),
          ),
          const SizedBox(width: JoySpacing.s16),
          Text(
            'Total Clicks: ${JoyHubBridge.buttonClickCount}',
            key: const ValueKey('counter-label'),
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.secondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVariantsSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Button Variants',
      subtitle: 'All 5 styling variants across the design system token ramp',
      content: Wrap(
        spacing: JoySpacing.s12,
        runSpacing: JoySpacing.s12,
        children: [
          JoyButton(
            variant: JoyButtonVariant.solid,
            onPressed: () {},
            child: const Text('Solid'),
          ),
          JoyButton(
            variant: JoyButtonVariant.outline,
            onPressed: () {},
            child: const Text('Outline'),
          ),
          JoyButton(
            variant: JoyButtonVariant.ghost,
            onPressed: () {},
            child: const Text('Ghost'),
          ),
          JoyButton(
            variant: JoyButtonVariant.danger,
            onPressed: () {},
            child: const Text('Danger'),
          ),
          JoyButton(
            variant: JoyButtonVariant.link,
            onPressed: () {},
            child: const Text('Link'),
          ),
        ],
      ),
    );
  }

  Widget _buildSizesSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Button Sizes',
      subtitle: 'All sizes enforce minimum 44px coarse hit targets',
      content: Wrap(
        spacing: JoySpacing.s12,
        runSpacing: JoySpacing.s12,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          JoyButton(
            size: JoyButtonSize.sm,
            onPressed: () {},
            child: const Text('Small (sm)'),
          ),
          JoyButton(
            size: JoyButtonSize.md,
            onPressed: () {},
            child: const Text('Medium (md)'),
          ),
          JoyButton(
            size: JoyButtonSize.lg,
            onPressed: () {},
            child: const Text('Large (lg)'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatesSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Button States',
      subtitle: 'Interactive suppression for disabled and loading states',
      content: Wrap(
        spacing: JoySpacing.s12,
        runSpacing: JoySpacing.s12,
        children: [
          JoyButton(
            disabled: true,
            onPressed: () {},
            child: const Text('Disabled'),
          ),
          JoyButton(
            loading: true,
            onPressed: () {},
            child: const Text('Loading'),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required JoyThemeTokens tokens,
    required String title,
    required String subtitle,
    required Widget content,
  }) {
    return Container(
      padding: const EdgeInsets.all(JoySpacing.s24),
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        border: Border.all(color: tokens.border.base),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 16.0,
              fontWeight: FontWeight.w700,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 13.0,
              color: tokens.text.secondary,
            ),
          ),
          const SizedBox(height: JoySpacing.s20),
          content,
        ],
      ),
    );
  }
}
