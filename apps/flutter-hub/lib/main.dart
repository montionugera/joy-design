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
  bool _checkableTagValue = true;
  bool _dismissedTag = false;
  String _inputText = 'Search design system...';
  double _inputNumber = 42.0;
  bool? _checkboxValue = true;
  String _radioValue = 'pro';
  bool _switchValue = true;
  double _sliderValue = 65.0;
  double _rateValue = 4.5;
  String _segmentedValue = 'monthly';
  String _activeLineTabKey = 'overview';
  String _activeCardTabKey = 'metrics';
  int _paginationCurrent = 3;
  int _paginationCompact = 2;
  String _breadcrumbNavigated = 'Workspace';
  int _stepsHorizontalCurrent = 1;
  int _stepsVerticalCurrent = 2;
  Set<Object> _selectedPositions = {'1', '2'};
  String? _positionsSortKey = 'symbol';
  JoySortDirection _positionsSortDirection = JoySortDirection.asc;
  JoyTableVariant _positionsTableVariant = JoyTableVariant.auto;
  JoyCandleData? _hoveredCandle;
  JoyPointData? _hoveredPoint;
  JoyBarData? _hoveredBar;

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
                    _buildInputsSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildChoiceSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildTogglesAndSlidersSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildButtonsSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildTypographySection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildIconsSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildLayoutSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildDisplaySection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildFeedbackSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildOverlaysSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildNotificationsSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildNavigationAndWorkflowSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildTableAndMetricsSection(tokens),
                    const SizedBox(height: JoySpacing.s32),
                    _buildFinancialChartsSection(tokens),
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

  Widget _buildButtonsSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Button Variants & Sizes',
      subtitle: 'All 5 variants and 3 sizes enforcing 44px hit bounds',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
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
        ],
      ),
    );
  }

  Widget _buildTypographySection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Typography: JoyText Scales & Colors',
      subtitle: 'Pure semantic typography resolving tokens across Light and Dark themes',
      content: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          JoyText.h1('Heading 1 (32px Bold)'),
          SizedBox(height: JoySpacing.s8),
          JoyText.h2('Heading 2 (24px SemiBold)'),
          SizedBox(height: JoySpacing.s8),
          JoyText.h3('Heading 3 (20px SemiBold)'),
          SizedBox(height: JoySpacing.s8),
          JoyText.bodyLarge(
            'Body Large: High-contrast primary reading typography engineered for mobile readability.',
          ),
          SizedBox(height: JoySpacing.s8),
          JoyText.body(
            'Body: Standard paragraph scale mapped to design system typography scale.',
            color: JoyTextColor.secondary,
          ),
          SizedBox(height: JoySpacing.s8),
          JoyText.caption(
            'Caption: Supporting annotations, timestamps, and secondary metadata.',
            color: JoyTextColor.tertiary,
          ),
          SizedBox(height: JoySpacing.s8),
          JoyText.code(
            'const tokens = context.joyTheme; // Monospace code variant',
            color: JoyTextColor.accent,
          ),
          SizedBox(height: JoySpacing.s16),
          Wrap(
            spacing: JoySpacing.s12,
            runSpacing: JoySpacing.s8,
            children: [
              JoyText('Primary', color: JoyTextColor.primary),
              JoyText('Secondary', color: JoyTextColor.secondary),
              JoyText('Tertiary', color: JoyTextColor.tertiary),
              JoyText('Accent', color: JoyTextColor.accent),
              JoyText('Success', color: JoyTextColor.success),
              JoyText('Warning', color: JoyTextColor.warning),
              JoyText('Danger', color: JoyTextColor.danger),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIconsSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Vector Icons: JoyIcon & JoyIcons',
      subtitle: 'Crisp vector SVGs adhering strictly to Zero Emoji policy',
      content: Wrap(
        spacing: JoySpacing.s16,
        runSpacing: JoySpacing.s16,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          JoyIcon(JoyIcons.search, size: JoyIconSize.lg, color: tokens.text.primary),
          JoyIcon(JoyIcons.check, size: JoyIconSize.lg, color: tokens.status.success.fg),
          JoyIcon(JoyIcons.close, size: JoyIconSize.lg, color: tokens.status.danger.fg),
          JoyIcon(JoyIcons.alertTriangle, size: JoyIconSize.lg, color: tokens.status.warning.fg),
          JoyIcon(JoyIcons.star, size: JoyIconSize.lg, color: tokens.accent.base),
          JoyIcon(JoyIcons.user, size: JoyIconSize.lg, color: tokens.text.primary),
          JoyIcon(JoyIcons.edit, size: JoyIconSize.lg, color: tokens.text.secondary),
          JoyIcon(JoyIcons.trash, size: JoyIconSize.lg, color: tokens.status.danger.fg),
          JoyIcon(JoyIcons.info, size: JoyIconSize.lg, color: tokens.status.info.fg),
          JoyIcon(JoyIcons.plus, size: JoyIconSize.md, color: tokens.text.primary),
          JoyIcon(JoyIcons.minus, size: JoyIconSize.md, color: tokens.text.primary),
          JoyIcon(JoyIcons.chevronRight, size: JoyIconSize.sm, color: tokens.text.secondary),
        ],
      ),
    );
  }

  Widget _buildLayoutSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Layout Primitives: Box, Flex, Space, Grid, Divider',
      subtitle: 'Responsive container and structural building blocks',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          JoyBox(
            padding: const EdgeInsets.all(JoySpacing.s16),
            backgroundColor: tokens.surface.sunken,
            borderRadius: BorderRadius.circular(JoyRadius.control),
            borderColor: tokens.border.subtle,
            child: Row(
              children: [
                JoyIcon(JoyIcons.info, color: tokens.status.info.fg),
                const SizedBox(width: JoySpacing.s12),
                const Expanded(
                  child: JoyText.body(
                    'JoyBox layout container with tokenized background and border.',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: JoySpacing.s16),
          const JoyDivider(dashed: false),
          const SizedBox(height: JoySpacing.s16),
          JoySpace(
            direction: Axis.horizontal,
            size: JoySpacing.s8,
            children: [
              JoyBox(
                padding: const EdgeInsets.all(JoySpacing.s8),
                backgroundColor: tokens.surface.card,
                borderColor: tokens.border.base,
                child: const JoyText.caption('Item 1'),
              ),
              JoyBox(
                padding: const EdgeInsets.all(JoySpacing.s8),
                backgroundColor: tokens.surface.card,
                borderColor: tokens.border.base,
                child: const JoyText.caption('Item 2'),
              ),
              JoyBox(
                padding: const EdgeInsets.all(JoySpacing.s8),
                backgroundColor: tokens.surface.card,
                borderColor: tokens.border.base,
                child: const JoyText.caption('Item 3'),
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s16),
          const JoyDivider(
            dashed: true,
            child: JoyText.caption(
              'Dashed Divider',
              color: JoyTextColor.tertiary,
            ),
          ),
          const SizedBox(height: JoySpacing.s16),
          JoyGrid(
            columns: 3,
            gutter: JoySpacing.s8,
            children: [
              JoyBox(
                padding: const EdgeInsets.all(JoySpacing.s12),
                backgroundColor: tokens.surface.raised,
                child: const Center(child: JoyText.caption('Col 1')),
              ),
              JoyBox(
                padding: const EdgeInsets.all(JoySpacing.s12),
                backgroundColor: tokens.surface.raised,
                child: const Center(child: JoyText.caption('Col 2')),
              ),
              JoyBox(
                padding: const EdgeInsets.all(JoySpacing.s12),
                backgroundColor: tokens.surface.raised,
                child: const Center(child: JoyText.caption('Col 3')),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDisplaySection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Visual Display: Badge, Tag, Avatar',
      subtitle: 'Component triplet parity with 44px coarse hit targets',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const JoyText.h6('Badges'),
          const SizedBox(height: JoySpacing.s8),
          Wrap(
            spacing: JoySpacing.s16,
            runSpacing: JoySpacing.s12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              const JoyBadge(count: 5),
              const JoyBadge(count: 120, overflowCount: 99),
              const JoyBadge.dot(status: JoyBadgeStatus.success),
              const JoyBadge.dot(status: JoyBadgeStatus.danger),
              JoyBadge.count(
                count: 3,
                child: Container(
                  padding: const EdgeInsets.all(JoySpacing.s8),
                  decoration: BoxDecoration(
                    color: tokens.surface.sunken,
                    borderRadius: BorderRadius.circular(JoyRadius.control),
                  ),
                  child: JoyIcon(JoyIcons.user, size: JoyIconSize.md),
                ),
              ),
              const JoyBadge(status: JoyBadgeStatus.success, text: 'ACTIVE'),
              const JoyBadge(status: JoyBadgeStatus.warning, text: 'PENDING'),
              const JoyBadge(status: JoyBadgeStatus.danger, text: 'HIGH'),
            ],
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Tags'),
          const SizedBox(height: JoySpacing.s8),
          Wrap(
            spacing: JoySpacing.s12,
            runSpacing: JoySpacing.s12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              const JoyTag(text: 'Default Tag'),
              const JoyTag(variant: JoyTagVariant.accent, text: 'Accent Tag'),
              const JoyTag(variant: JoyTagVariant.success, text: 'Success'),
              const JoyTag(variant: JoyTagVariant.warning, text: 'Warning'),
              const JoyTag(variant: JoyTagVariant.danger, text: 'Danger'),
              const JoyTag(variant: JoyTagVariant.info, text: 'Info'),
              if (!_dismissedTag)
                JoyTag.closable(
                  text: 'Dismissible',
                  onClose: () {
                    setState(() {
                      _dismissedTag = true;
                    });
                  },
                ),
              JoyTag.checkable(
                text: 'Selectable',
                checked: _checkableTagValue,
                onChanged: (val) {
                  setState(() {
                    _checkableTagValue = val;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Avatars'),
          const SizedBox(height: JoySpacing.s8),
          const Wrap(
            spacing: JoySpacing.s16,
            runSpacing: JoySpacing.s12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              JoyAvatar(
                name: 'Joy Design',
                size: JoyAvatarSize.sm,
              ),
              JoyAvatar(
                name: 'Alex Turner',
                size: JoyAvatarSize.md,
              ),
              JoyAvatar(
                name: 'Morgan Stanley',
                size: JoyAvatarSize.lg,
              ),
              JoyAvatar.square(
                name: 'Square Avatar',
                size: JoyAvatarSize.md,
              ),
              JoyAvatar(
                initials: 'VIP',
                ringWidth: 3.0,
                size: JoyAvatarSize.md,
              ),
              JoyAvatar(
                size: JoyAvatarSize.md,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInputsSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Form Inputs & Stepper',
      subtitle:
          'JoyInput text control with prefix/suffix addons, status variants, clear button, and JoyInputNumber numeric stepper',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const JoyText.h6('Text Input with Prefix & Clear Button'),
          const SizedBox(height: JoySpacing.s8),
          JoyInput(
            initialValue: _inputText,
            placeholder: 'Type to search...',
            prefix: JoyIcon(JoyIcons.search, size: JoyIconSize.sm, color: tokens.text.secondary),
            clearable: true,
            onChanged: (val) {
              setState(() {
                _inputText = val;
              });
            },
          ),
          const SizedBox(height: JoySpacing.s16),
          const JoyText.h6('Status Variants (Error & Warning)'),
          const SizedBox(height: JoySpacing.s8),
          Row(
            children: [
              Expanded(
                child: JoyInput(
                  initialValue: 'invalid.email@',
                  status: JoyInputStatus.error,
                  placeholder: 'Error input',
                  prefix: JoyIcon(JoyIcons.alertTriangle, size: JoyIconSize.sm, color: tokens.status.danger.fg),
                ),
              ),
              const SizedBox(width: JoySpacing.s16),
              Expanded(
                child: JoyInput(
                  initialValue: 'weak-password',
                  status: JoyInputStatus.warning,
                  placeholder: 'Warning input',
                  prefix: JoyIcon(JoyIcons.info, size: JoyIconSize.sm, color: tokens.status.warning.fg),
                ),
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s16),
          const JoyText.h6('Numeric Stepper (JoyInputNumber)'),
          const SizedBox(height: JoySpacing.s8),
          Row(
            children: [
              SizedBox(
                width: 200.0,
                child: JoyInputNumber(
                  value: _inputNumber,
                  min: 0,
                  max: 100,
                  step: 1,
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _inputNumber = val.toDouble();
                      });
                    }
                  },
                ),
              ),
              const SizedBox(width: JoySpacing.s16),
              JoyText.body(
                'Current Value: ${_inputNumber.toStringAsFixed(0)}',
                color: JoyTextColor.secondary,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChoiceSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Choice Controls',
      subtitle:
          'JoyCheckbox tri-state selection and JoyRadioGroup single-choice options in horizontal and vertical directions',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const JoyText.h6('Checkbox States (Checked, Unchecked, Indeterminate, Disabled)'),
          const SizedBox(height: JoySpacing.s8),
          Wrap(
            spacing: JoySpacing.s24,
            runSpacing: JoySpacing.s12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              JoyCheckbox(
                value: _checkboxValue,
                labelText: 'Interactive (${_checkboxValue == null ? "Indeterminate" : (_checkboxValue! ? "Checked" : "Unchecked")})',
                onChanged: (val) {
                  setState(() {
                    _checkboxValue = val;
                  });
                },
              ),
              const JoyCheckbox(
                value: true,
                labelText: 'Checked',
                onChanged: null,
              ),
              const JoyCheckbox(
                value: null,
                labelText: 'Indeterminate',
                onChanged: null,
              ),
              const JoyCheckbox(
                value: false,
                disabled: true,
                labelText: 'Disabled',
                onChanged: null,
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Radio Group — Horizontal Direction'),
          const SizedBox(height: JoySpacing.s8),
          JoyRadioGroup<String>(
            value: _radioValue,
            direction: Axis.horizontal,
            gap: JoySpacing.s16,
            options: const [
              JoyRadioOption(value: 'starter', label: 'Starter'),
              JoyRadioOption(value: 'pro', label: 'Professional'),
              JoyRadioOption(value: 'enterprise', label: 'Enterprise'),
            ],
            onChanged: (val) {
              if (val != null) {
                setState(() {
                  _radioValue = val;
                });
              }
            },
          ),
          const SizedBox(height: JoySpacing.s16),
          const JoyText.h6('Radio Group — Vertical Direction'),
          const SizedBox(height: JoySpacing.s8),
          JoyRadioGroup<String>(
            value: _radioValue,
            direction: Axis.vertical,
            gap: JoySpacing.s8,
            options: const [
              JoyRadioOption(value: 'starter', label: 'Standard Delivery (3-5 business days)'),
              JoyRadioOption(value: 'pro', label: 'Express Courier (Next day delivery)'),
              JoyRadioOption(value: 'enterprise', label: 'Same-day Priority Courier (Disabled)', disabled: true),
            ],
            onChanged: (val) {
              if (val != null) {
                setState(() {
                  _radioValue = val;
                });
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTogglesAndSlidersSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Toggles & Sliders',
      subtitle:
          'JoySwitch interactive & loading switches, JoySlider precision control, JoyRate vector ratings, and JoySegmented sliding pill tabs',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const JoyText.h6('Switches (Interactive, Small, Loading, Disabled)'),
          const SizedBox(height: JoySpacing.s8),
          Wrap(
            spacing: JoySpacing.s24,
            runSpacing: JoySpacing.s12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              JoySwitch(
                value: _switchValue,
                labelText: _switchValue ? 'Realtime sync: ON' : 'Realtime sync: OFF',
                onChanged: (val) {
                  setState(() {
                    _switchValue = val;
                  });
                },
              ),
              JoySwitch(
                value: _switchValue,
                size: JoySwitchSize.sm,
                labelText: 'Small switch',
                onChanged: (val) {
                  setState(() {
                    _switchValue = val;
                  });
                },
              ),
              const JoySwitch(
                value: true,
                loading: true,
                labelText: 'Loading state',
                onChanged: null,
              ),
              const JoySwitch(
                value: false,
                disabled: true,
                labelText: 'Disabled switch',
                onChanged: null,
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Slider (JoySlider with 44px Coarse Touch Area)'),
          const SizedBox(height: JoySpacing.s8),
          Row(
            children: [
              Expanded(
                child: JoySlider(
                  value: _sliderValue,
                  min: 0.0,
                  max: 100.0,
                  step: 1.0,
                  onChanged: (val) {
                    setState(() {
                      _sliderValue = val;
                    });
                  },
                ),
              ),
              const SizedBox(width: JoySpacing.s16),
              SizedBox(
                width: 80.0,
                child: JoyText.code(
                  '${_sliderValue.toStringAsFixed(0)}%',
                  weight: FontWeight.w600,
                  color: JoyTextColor.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Star Rating (JoyRate Vector SVGs with Half-Stars)'),
          const SizedBox(height: JoySpacing.s8),
          Row(
            children: [
              JoyRate(
                value: _rateValue,
                allowHalf: true,
                count: 5,
                onChanged: (val) {
                  setState(() {
                    _rateValue = val;
                  });
                },
              ),
              const SizedBox(width: JoySpacing.s16),
              JoyText.body(
                '$_rateValue / 5.0 rating',
                weight: FontWeight.w600,
                color: JoyTextColor.secondary,
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Segmented Controls (JoySegmented Sliding Pills)'),
          const SizedBox(height: JoySpacing.s8),
          JoySegmented<String>(
            value: _segmentedValue,
            size: JoySegmentedSize.md,
            options: const [
              JoySegmentedOption(value: 'daily', labelText: 'Daily'),
              JoySegmentedOption(value: 'weekly', labelText: 'Weekly'),
              JoySegmentedOption(value: 'monthly', labelText: 'Monthly'),
              JoySegmentedOption(value: 'annual', labelText: 'Annual'),
            ],
            onChanged: (val) {
              setState(() {
                _segmentedValue = val;
              });
            },
          ),
          const SizedBox(height: JoySpacing.s12),
          JoySegmented<String>(
            value: _segmentedValue,
            block: true,
            size: JoySegmentedSize.sm,
            options: const [
              JoySegmentedOption(value: 'daily', labelText: 'Day'),
              JoySegmentedOption(value: 'weekly', labelText: 'Week'),
              JoySegmentedOption(value: 'monthly', labelText: 'Month'),
              JoySegmentedOption(value: 'annual', labelText: 'Year'),
            ],
            onChanged: (val) {
              setState(() {
                _segmentedValue = val;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFeedbackSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Feedback Components (JoyAlert, JoyProgress, JoySpin, JoySkeleton)',
      subtitle:
          'Semantic status banners with zero side-stripes, linear and circular progress indicators, spinning indicators, and loading skeleton placeholders.',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const JoyText.h6('Status Alerts (JoyAlert Variants)'),
          const SizedBox(height: JoySpacing.s8),
          const JoyAlert.info(
            title: Text('Information Notice'),
            description: Text('System updates scheduled for Sunday at 02:00 UTC.'),
            closable: true,
          ),
          const SizedBox(height: JoySpacing.s8),
          const JoyAlert.success(
            title: Text('Operation Succeeded'),
            description: Text('All data packages synchronized with zero errors.'),
            closable: true,
          ),
          const SizedBox(height: JoySpacing.s8),
          const JoyAlert.warning(
            title: Text('Storage Space Low'),
            description: Text('Workspace storage usage is at 88% capacity.'),
            closable: true,
          ),
          const SizedBox(height: JoySpacing.s8),
          const JoyAlert.danger(
            title: Text('Connection Terminated'),
            description: Text('TLS certificate validation failed for endpoint.'),
            closable: true,
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Progress Indicators (JoyProgress Bar & Circle)'),
          const SizedBox(height: JoySpacing.s12),
          const JoyProgress.line(
            percent: 68.0,
            status: JoyProgressStatus.active,
          ),
          const SizedBox(height: JoySpacing.s12),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              JoyProgress.circle(
                percent: 75.0,
                status: JoyProgressStatus.normal,
                size: 96.0,
              ),
              JoyProgress.circle(
                percent: 100.0,
                status: JoyProgressStatus.success,
                size: 96.0,
              ),
              JoyProgress.circle(
                percent: 45.0,
                status: JoyProgressStatus.error,
                size: 96.0,
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Loading Spinner (JoySpin)'),
          const SizedBox(height: JoySpacing.s12),
          JoySpin(
            spinning: true,
            tip: 'Loading design tokens...',
            child: Container(
              height: 80.0,
              decoration: BoxDecoration(
                color: tokens.surface.sunken,
                borderRadius: BorderRadius.circular(JoyRadius.control),
              ),
              alignment: Alignment.center,
              child: Text(
                'Container Content being loaded',
                style: TextStyle(color: tokens.text.muted),
              ),
            ),
          ),
          const SizedBox(height: JoySpacing.s24),
          const JoyText.h6('Placeholders (JoySkeleton Line, Avatar & Button)'),
          const SizedBox(height: JoySpacing.s12),
          const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              JoySkeleton.avatar(size: 48.0),
              SizedBox(width: JoySpacing.s16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    JoySkeleton.line(lines: 3),
                    SizedBox(height: JoySpacing.s12),
                    JoySkeleton.button(width: 96.0, height: 36.0),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOverlaysSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Overlays & Dialogs (JoyModal, JoyDrawer, JoyPopconfirm, JoyTooltip)',
      subtitle:
          'Modal dialogs with 60% navy900 scrim, responsive sliding off-canvas drawers, popconfirm popovers, and interactive tooltips.',
      content: Builder(
        builder: (context) {
          return Wrap(
            spacing: JoySpacing.s16,
            runSpacing: JoySpacing.s16,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              JoyButton(
                key: const Key('open-modal-showcase-btn'),
                variant: JoyButtonVariant.solid,
                onPressed: () {
                  JoyModal.show<void>(
                    context: context,
                    title: const Text('Confirm Cluster Restart'),
                    content: const Text(
                      'Are you sure you want to execute a rolling restart on 3 worker nodes? This operation will preserve running workloads.',
                    ),
                    footer: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        JoyButton(
                          variant: JoyButtonVariant.ghost,
                          onPressed: () =>
                              Navigator.of(context, rootNavigator: true).pop(),
                          child: const Text('Cancel'),
                        ),
                        const SizedBox(width: JoySpacing.s8),
                        JoyButton(
                          variant: JoyButtonVariant.solid,
                          onPressed: () =>
                              Navigator.of(context, rootNavigator: true).pop(),
                          child: const Text('Confirm Restart'),
                        ),
                      ],
                    ),
                  );
                },
                child: const Text('Open Modal Dialog'),
              ),
              JoyButton(
                key: const Key('open-drawer-showcase-btn'),
                variant: JoyButtonVariant.outline,
                onPressed: () {
                  JoyDrawer.show<void>(
                    context: context,
                    title: const Text('Workspace Settings'),
                    placement: JoyDrawerPlacement.right,
                    content: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Configure design system variables, token overlays, and regional locale options.',
                          style: TextStyle(color: tokens.text.secondary),
                        ),
                        const SizedBox(height: JoySpacing.s16),
                        const JoySkeleton.line(lines: 4),
                      ],
                    ),
                  );
                },
                child: const Text('Open Right Drawer'),
              ),
              JoyPopconfirm.text(
                title: 'Delete this API key permanently?',
                confirmText: 'Delete',
                cancelText: 'Keep',
                onConfirm: () {
                  JoyMessage.show(
                    context,
                    content: 'API key successfully revoked',
                    type: JoyMessageType.success,
                  );
                },
                child: const JoyButton(
                  variant: JoyButtonVariant.danger,
                  child: Text('Delete Key Popconfirm'),
                ),
              ),
              JoyTooltip.text(
                title: 'WCAG 2.2 AA compliant contrast ratio: 7.2:1',
                child: const JoyButton(
                  variant: JoyButtonVariant.ghost,
                  child: Text('Hover or Tap for Tooltip'),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildNotificationsSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Floating Notifications & Toasts (JoyNotification & JoyMessage)',
      subtitle:
          'Asynchronous status notifications at top-right/top-center and lightweight top-center pill toasts with smooth enter/exit animations.',
      content: Builder(
        builder: (context) {
          return Wrap(
            spacing: JoySpacing.s16,
            runSpacing: JoySpacing.s16,
            children: [
              JoyButton(
                key: const Key('trigger-notification-info-btn'),
                variant: JoyButtonVariant.outline,
                onPressed: () {
                  JoyNotification.show(
                    context,
                    title: const Text('System Deployment Ready'),
                    description: const Text(
                      'All 14 microservices have passed automated Gate 1 prechecks.',
                    ),
                    type: JoyNotificationType.info,
                  );
                },
                child: const Text('Show Info Notification'),
              ),
              JoyButton(
                key: const Key('trigger-notification-success-btn'),
                variant: JoyButtonVariant.outline,
                onPressed: () {
                  JoyNotification.show(
                    context,
                    title: const Text('Invoice Paid'),
                    description: const Text(
                      'Payment received for invoice INV-2026-09. Receipt sent to billing contact.',
                    ),
                    type: JoyNotificationType.success,
                  );
                },
                child: const Text('Show Success Notification'),
              ),
              JoyButton(
                key: const Key('trigger-message-success-btn'),
                variant: JoyButtonVariant.solid,
                onPressed: () {
                  JoyMessage.show(
                    context,
                    content: 'Workspace configuration saved successfully',
                    type: JoyMessageType.success,
                  );
                },
                child: const Text('Trigger Success Toast'),
              ),
              JoyButton(
                key: const Key('trigger-message-warning-btn'),
                variant: JoyButtonVariant.ghost,
                onPressed: () {
                  JoyMessage.show(
                    context,
                    content: 'Network latency exceeds 250ms threshold',
                    type: JoyMessageType.warning,
                  );
                },
                child: const Text('Trigger Warning Toast'),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildNavigationAndWorkflowSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Navigation & Workflow Primitives (JoyTabs, JoyPagination, JoyBreadcrumb, JoySteps, JoyTimeline)',
      subtitle:
          'Comprehensive navigation hierarchy, windowed pagination, multi-step workflows, and chronological event timelines.',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. JoyTabs
          Text(
            'JoyTabs (Line and Card Modes)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s12),
          Text(
            'Line mode with animated sliding indicator:',
            style: TextStyle(fontSize: 12.0, color: tokens.text.secondary),
          ),
          const SizedBox(height: JoySpacing.s8),
          JoyTabs(
            key: const Key('joy-tabs-line-showcase'),
            activeKey: _activeLineTabKey,
            type: JoyTabsType.line,
            onChange: (key) => setState(() => _activeLineTabKey = key),
            items: [
              JoyTabItem.text(
                key: 'overview',
                label: 'Overview',
                icon: JoyIcon(JoyIcons.info, size: JoyIconSize.sm),
                content: Padding(
                  padding: const EdgeInsets.symmetric(vertical: JoySpacing.s16),
                  child: Text(
                    'System Overview: All operational nodes running with optimal throughput.',
                    style: TextStyle(color: tokens.text.secondary),
                  ),
                ),
              ),
              JoyTabItem.text(
                key: 'analytics',
                label: 'Analytics',
                icon: JoyIcon(JoyIcons.search, size: JoyIconSize.sm),
                content: Padding(
                  padding: const EdgeInsets.symmetric(vertical: JoySpacing.s16),
                  child: Text(
                    'Realtime Analytics: 99.98% SLA across all monitored endpoints.',
                    style: TextStyle(color: tokens.text.secondary),
                  ),
                ),
              ),
              JoyTabItem.text(
                key: 'audit',
                label: 'Security & Audit',
                icon: JoyIcon(JoyIcons.alertCircle, size: JoyIconSize.sm),
                content: Padding(
                  padding: const EdgeInsets.symmetric(vertical: JoySpacing.s16),
                  child: Text(
                    'Audit Ledger: Zero unauthorized credential attempts in the last 24h.',
                    style: TextStyle(color: tokens.text.secondary),
                  ),
                ),
              ),
              const JoyTabItem(
                key: 'disabled_tab',
                label: 'Legacy Archive',
                disabled: true,
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s20),
          Text(
            'Card mode with structured tabs:',
            style: TextStyle(fontSize: 12.0, color: tokens.text.secondary),
          ),
          const SizedBox(height: JoySpacing.s8),
          JoyTabs(
            key: const Key('joy-tabs-card-showcase'),
            activeKey: _activeCardTabKey,
            type: JoyTabsType.card,
            onChange: (key) => setState(() => _activeCardTabKey = key),
            items: [
              JoyTabItem.text(
                key: 'metrics',
                label: 'Cluster Metrics',
                content: Padding(
                  padding: const EdgeInsets.symmetric(vertical: JoySpacing.s16),
                  child: Text(
                    'Cluster utilization is healthy at 42% CPU and 58% Memory.',
                    style: TextStyle(color: tokens.text.secondary),
                  ),
                ),
              ),
              JoyTabItem.text(
                key: 'deployments',
                label: 'Active Deployments',
                content: Padding(
                  padding: const EdgeInsets.symmetric(vertical: JoySpacing.s16),
                  child: Text(
                    'Three blue/green rollouts currently staging in us-east-1.',
                    style: TextStyle(color: tokens.text.secondary),
                  ),
                ),
              ),
              JoyTabItem.text(
                key: 'configs',
                label: 'Environment Configs',
                content: Padding(
                  padding: const EdgeInsets.symmetric(vertical: JoySpacing.s16),
                  child: Text(
                    'Tokens and secret references synchronized with vault.',
                    style: TextStyle(color: tokens.text.secondary),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: JoySpacing.s32),

          // 2. JoyPagination
          Text(
            'JoyPagination (Windowed & Compact Modes)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s8),
          Text(
            'Standard windowed pagination with chevrons and hit targets (Page $_paginationCurrent of 15):',
            style: TextStyle(fontSize: 12.0, color: tokens.text.secondary),
          ),
          const SizedBox(height: JoySpacing.s8),
          JoyPagination(
            key: const Key('joy-pagination-standard'),
            current: _paginationCurrent,
            total: 150,
            pageSize: 10,
            onChange: (p) => setState(() => _paginationCurrent = p),
          ),
          const SizedBox(height: JoySpacing.s16),
          Text(
            'Compact pagination mode (Page $_paginationCompact of 8):',
            style: TextStyle(fontSize: 12.0, color: tokens.text.secondary),
          ),
          const SizedBox(height: JoySpacing.s8),
          JoyPagination(
            key: const Key('joy-pagination-compact'),
            current: _paginationCompact,
            total: 80,
            pageSize: 10,
            simple: true,
            onChange: (p) => setState(() => _paginationCompact = p),
          ),

          const SizedBox(height: JoySpacing.s32),

          // 3. JoyBreadcrumb
          Text(
            'JoyBreadcrumb (Navigation Trails & Click Handlers)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s8),
          Text(
            'Current Location: $_breadcrumbNavigated',
            style: TextStyle(fontSize: 12.0, color: tokens.accent.base, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: JoySpacing.s8),
          JoyBreadcrumb(
            key: const Key('joy-breadcrumb-standard'),
            items: [
              JoyBreadcrumbItem.text(
                'Dashboard',
                icon: JoyIcon(JoyIcons.user, size: JoyIconSize.sm),
                onClick: () => setState(() => _breadcrumbNavigated = 'Dashboard'),
              ),
              JoyBreadcrumbItem.text(
                'Workspaces',
                onClick: () => setState(() => _breadcrumbNavigated = 'Workspaces'),
              ),
              JoyBreadcrumbItem.text(
                'Joymify Design System',
                onClick: () => setState(() => _breadcrumbNavigated = 'Joymify Design System'),
              ),
              JoyBreadcrumbItem.text(
                'Slice 4 Navigation',
              ),
            ],
          ),

          const SizedBox(height: JoySpacing.s32),

          // 4. JoySteps
          Text(
            'JoySteps (Horizontal & Vertical Workflow Progress)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s8),
          Text(
            'Horizontal step workflow with interactive progress (Current: Step ${_stepsHorizontalCurrent + 1}):',
            style: TextStyle(fontSize: 12.0, color: tokens.text.secondary),
          ),
          const SizedBox(height: JoySpacing.s12),
          JoySteps(
            key: const Key('joy-steps-horizontal'),
            current: _stepsHorizontalCurrent,
            direction: Axis.horizontal,
            onChange: (step) => setState(() => _stepsHorizontalCurrent = step),
            items: [
              JoyStepItem.text(
                title: 'Contract Definition',
                description: 'JSON Schema v2 verification',
              ),
              JoyStepItem.text(
                title: 'Implementation',
                description: 'Component architecture',
              ),
              JoyStepItem.text(
                title: 'Verification',
                description: 'Zero emoji and color literal checks',
              ),
              JoyStepItem.text(
                title: 'Promotion',
                description: 'Release rollout to cluster',
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s20),
          Text(
            'Vertical step workflow with error status:',
            style: TextStyle(fontSize: 12.0, color: tokens.text.secondary),
          ),
          const SizedBox(height: JoySpacing.s12),
          JoySteps(
            key: const Key('joy-steps-vertical'),
            current: _stepsVerticalCurrent,
            direction: Axis.vertical,
            onChange: (step) => setState(() => _stepsVerticalCurrent = step),
            items: [
              JoyStepItem.text(
                title: 'Repository Worktree Check',
                description: 'Cloned into isolated branch',
                status: JoyStepStatus.finish,
              ),
              JoyStepItem.text(
                title: 'Unit Test Execution',
                description: '314 tests running in parallel',
                status: JoyStepStatus.finish,
              ),
              JoyStepItem.text(
                title: 'Color Literal Scan',
                description: 'Active scanner validation',
                status: JoyStepStatus.process,
              ),
              JoyStepItem.text(
                title: 'Automated Deployment',
                description: 'Pending stage validation',
                status: JoyStepStatus.wait,
              ),
            ],
          ),

          const SizedBox(height: JoySpacing.s32),

          // 5. JoyTimeline
          Text(
            'JoyTimeline (Chronological Status Events)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s12),
          JoyTimeline(
            key: const Key('joy-timeline-showcase'),
            items: [
              JoyTimelineItem.text(
                title: 'Production Rollout Finalized',
                content: 'Version 2.0.0 promoted to all edge regions with zero downtime.',
                timestamp: '14:20 UTC',
                status: JoyTimelineStatus.success,
              ),
              JoyTimelineItem.text(
                title: 'Automated Contract Verification',
                content: 'All 12 contract scenarios across Tabs, Pagination, Breadcrumb, and Steps passed.',
                timestamp: '14:15 UTC',
                status: JoyTimelineStatus.accent,
              ),
              JoyTimelineItem.text(
                title: 'Resource Allocation Warning',
                content: 'Memory usage in staging cluster reached 78% of soft limit.',
                timestamp: '14:02 UTC',
                status: JoyTimelineStatus.warning,
              ),
              JoyTimelineItem.text(
                title: 'Security Scan Anomaly',
                content: 'Dependency vulnerability flagged and patched in automated build pipeline.',
                timestamp: '13:45 UTC',
                status: JoyTimelineStatus.danger,
              ),
              JoyTimelineItem.text(
                title: 'Snapshot Backup Created',
                content: 'System state archived to cold storage.',
                timestamp: '13:30 UTC',
                status: JoyTimelineStatus.info,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTableAndMetricsSection(JoyThemeTokens tokens) {
    final sortedPositions = List<_HubPositionRecord>.from(_hubPositions);
    if (_positionsSortKey != null && _positionsSortDirection != JoySortDirection.none) {
      sortedPositions.sort((a, b) {
        int cmp = 0;
        switch (_positionsSortKey) {
          case 'symbol':
            cmp = a.symbol.compareTo(b.symbol);
          case 'size':
            cmp = a.size.compareTo(b.size);
          case 'entryPrice':
            cmp = a.entryPrice.compareTo(b.entryPrice);
          case 'markPrice':
            cmp = a.markPrice.compareTo(b.markPrice);
          case 'pnl':
            cmp = a.pnl.compareTo(b.pnl);
          case 'pnlPercent':
            cmp = a.pnlPercent.compareTo(b.pnlPercent);
          default:
            cmp = 0;
        }
        return _positionsSortDirection == JoySortDirection.asc ? cmp : -cmp;
      });
    }

    final columns = [
      JoyTableColumn<_HubPositionRecord>(
        key: 'symbol',
        title: 'Contract',
        sortable: true,
        render: (context, record, index) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              record.symbol,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: tokens.text.primary,
              ),
            ),
            Text(
              record.assetName,
              style: TextStyle(
                fontSize: 11.0,
                color: tokens.text.secondary,
              ),
            ),
          ],
        ),
      ),
      JoyTableColumn<_HubPositionRecord>(
        key: 'side',
        title: 'Side',
        render: (context, record, index) {
          final isLong = record.side == 'LONG';
          return Container(
            padding: const EdgeInsets.symmetric(
              horizontal: JoySpacing.s8,
              vertical: JoySpacing.s2,
            ),
            decoration: BoxDecoration(
              color: isLong ? tokens.status.successBg : tokens.status.dangerBg,
              borderRadius: BorderRadius.circular(JoyRadius.control),
            ),
            child: Text(
              record.side,
              style: TextStyle(
                fontSize: 11.0,
                fontWeight: FontWeight.w600,
                color: isLong ? tokens.status.successFg : tokens.status.dangerFg,
              ),
            ),
          );
        },
      ),
      JoyTableColumn<_HubPositionRecord>(
        key: 'size',
        title: 'Size',
        sortable: true,
        align: TextAlign.right,
        render: (context, record, index) => Text(
          record.size.toStringAsFixed(record.size >= 10 ? 0 : 2),
          style: TextStyle(color: tokens.text.primary),
        ),
      ),
      JoyTableColumn<_HubPositionRecord>(
        key: 'entryPrice',
        title: 'Entry Price',
        sortable: true,
        align: TextAlign.right,
        render: (context, record, index) => Text(
          '\$${record.entryPrice.toStringAsFixed(2)}',
          style: TextStyle(color: tokens.text.secondary),
        ),
      ),
      JoyTableColumn<_HubPositionRecord>(
        key: 'markPrice',
        title: 'Mark Price',
        sortable: true,
        align: TextAlign.right,
        render: (context, record, index) => Text(
          '\$${record.markPrice.toStringAsFixed(2)}',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: tokens.text.primary,
          ),
        ),
      ),
      JoyTableColumn<_HubPositionRecord>(
        key: 'pnl',
        title: 'Unrealized PnL',
        sortable: true,
        align: TextAlign.right,
        render: (context, record, index) {
          final isPositive = record.pnl >= 0;
          final prefix = isPositive ? '+\$' : '-\$';
          final absVal = record.pnl.abs().toStringAsFixed(2);
          return Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$prefix$absVal',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: isPositive ? tokens.status.successFg : tokens.status.dangerFg,
                ),
              ),
              Text(
                '${isPositive ? '+' : ''}${record.pnlPercent.toStringAsFixed(2)}%',
                style: TextStyle(
                  fontSize: 11.0,
                  color: isPositive ? tokens.status.successFg : tokens.status.dangerFg,
                ),
              ),
            ],
          );
        },
      ),
    ];

    return _buildSectionCard(
      tokens: tokens,
      title: 'High-Density Table & Financial Metrics',
      subtitle: 'Adaptive responsive data tables, KPI metric tiles, and financial stat cards',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. KPI Metric Tiles
          Text(
            'JoyMetricTile (KPI Metrics with Positive, Negative, and Neutral Deltas)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s12),
          Wrap(
            spacing: JoySpacing.s16,
            runSpacing: JoySpacing.s16,
            children: [
              SizedBox(
                width: 260.0,
                child: JoyMetricTile(
                  title: 'Total Portfolio Equity',
                  value: '\$1,482,900',
                  delta: 8.4,
                  deltaPeriod: 'vs yesterday',
                  trend: JoyMetricTrend.up,
                  onTap: () {},
                ),
              ),
              SizedBox(
                width: 260.0,
                child: JoyMetricTile(
                  title: 'Maximum Drawdown',
                  value: '-\$42,150',
                  delta: -3.2,
                  deltaPeriod: 'vs 30d peak',
                  trend: JoyMetricTrend.down,
                  onTap: () {},
                ),
              ),
              SizedBox(
                width: 260.0,
                child: JoyMetricTile(
                  title: 'Allocated Collateral',
                  value: '\$250,000',
                  delta: 0.0,
                  deltaPeriod: 'target neutral',
                  trend: JoyMetricTrend.neutral,
                  onTap: () {},
                ),
              ),
            ],
          ),

          const SizedBox(height: JoySpacing.s24),

          // 2. JoyStatCard KPI Cards
          Text(
            'JoyStatCard (Enterprise Financial Cards with Eyebrow and Strategy Footers)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s12),
          Wrap(
            spacing: JoySpacing.s16,
            runSpacing: JoySpacing.s16,
            children: [
              SizedBox(
                width: 260.0,
                child: JoyStatCard(
                  eyebrow: 'ALPHA STRATEGY',
                  title: 'Net Realized Return',
                  value: '+\$94,800',
                  delta: 8.4,
                  deltaPeriod: 'YTD Alpha',
                  trend: JoyMetricTrend.up,
                  footer: Text(
                    'Outperforming benchmark by +4.2%',
                    style: TextStyle(fontSize: 11.0, color: tokens.text.secondary),
                  ),
                ),
              ),
              SizedBox(
                width: 260.0,
                child: JoyStatCard(
                  eyebrow: 'RISK EXPOSURE',
                  title: 'Overnight VAR (99%)',
                  value: '-\$12,400',
                  delta: -3.2,
                  deltaPeriod: 'risk factor',
                  trend: JoyMetricTrend.down,
                  footer: Text(
                    'Well inside 5% capital risk ceiling',
                    style: TextStyle(fontSize: 11.0, color: tokens.text.secondary),
                  ),
                ),
              ),
              SizedBox(
                width: 260.0,
                child: JoyStatCard(
                  eyebrow: 'TREASURY REBALANCE',
                  title: 'Target Cash Reserve',
                  value: '\$500,000',
                  delta: 0.0,
                  deltaPeriod: 'balanced pool',
                  trend: JoyMetricTrend.neutral,
                  footer: Text(
                    'Fully collateralized across vaults',
                    style: TextStyle(fontSize: 11.0, color: tokens.text.secondary),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: JoySpacing.s32),

          // 3. Interactive JoyTable
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Financial Positions & Orders (High-Density Adaptive Table)',
                style: TextStyle(
                  fontSize: 14.0,
                  fontWeight: FontWeight.w600,
                  color: tokens.text.primary,
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Layout View: ',
                    style: TextStyle(
                      fontSize: 12.0,
                      color: tokens.text.secondary,
                    ),
                  ),
                  const SizedBox(width: JoySpacing.s8),
                  JoySegmented<String>(
                    value: _positionsTableVariant == JoyTableVariant.auto
                        ? 'auto'
                        : _positionsTableVariant == JoyTableVariant.table
                            ? 'table'
                            : 'stack',
                    size: JoySegmentedSize.sm,
                    options: const [
                      JoySegmentedOption(value: 'auto', labelText: 'Adaptive'),
                      JoySegmentedOption(value: 'table', labelText: 'Table'),
                      JoySegmentedOption(value: 'stack', labelText: 'Mobile Cards'),
                    ],
                    onChanged: (val) {
                      setState(() {
                        if (val == 'auto') _positionsTableVariant = JoyTableVariant.auto;
                        if (val == 'table') _positionsTableVariant = JoyTableVariant.table;
                        if (val == 'stack') _positionsTableVariant = JoyTableVariant.stack;
                      });
                    },
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: JoySpacing.s12),
          JoyTable<_HubPositionRecord>(
            columns: columns,
            dataSource: sortedPositions,
            rowKey: (r) => r.id,
            striped: true,
            bordered: true,
            variant: _positionsTableVariant,
            sortColumnKey: _positionsSortKey,
            sortDirection: _positionsSortDirection,
            selectedRowKeys: _selectedPositions,
            onSelectionChanged: (selected) {
              setState(() {
                _selectedPositions = selected;
              });
            },
            onSort: (colKey, dir) {
              setState(() {
                _positionsSortKey = colKey;
                _positionsSortDirection = dir;
              });
            },
          ),
          const SizedBox(height: JoySpacing.s8),
          Text(
            'Selected positions: ${_selectedPositions.length} of ${_hubPositions.length} rows | Sorted by: ${_positionsSortKey ?? "none"} (${_positionsSortDirection.name})',
            style: TextStyle(
              fontSize: 12.0,
              color: tokens.text.secondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialChartsSection(JoyThemeTokens tokens) {
    return _buildSectionCard(
      tokens: tokens,
      title: 'Financial & Trading Charts',
      subtitle: 'Interactive Canvas OHLC candlesticks, timeseries curves with area fills, and volume bars',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Candlestick Chart
          Text(
            'JoyCandlestickChart (Live OHLC with Canvas HUD Banner & Magnetic Crosshair)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s8),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: JoySpacing.s16,
              vertical: JoySpacing.s12,
            ),
            decoration: BoxDecoration(
              color: tokens.surface.sunken,
              borderRadius: BorderRadius.circular(JoyRadius.control),
              border: Border.all(color: tokens.border.subtle),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'HUD TELEMETRY: ',
                      style: TextStyle(
                        fontSize: 11.0,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                        color: tokens.accent.base,
                      ),
                    ),
                    Text(
                      _hoveredCandle != null
                          ? '${formatCandleTime(_hoveredCandle!.time)} | O: \$${_hoveredCandle!.open.toStringAsFixed(2)}  H: \$${_hoveredCandle!.high.toStringAsFixed(2)}  L: \$${_hoveredCandle!.low.toStringAsFixed(2)}  C: \$${_hoveredCandle!.close.toStringAsFixed(2)}  Vol: ${_hoveredCandle!.volume}'
                          : 'Hover over candlestick bars to inspect OHLC tick telemetry',
                      style: TextStyle(
                        fontSize: 12.0,
                        fontWeight: FontWeight.w500,
                        color: tokens.text.primary,
                      ),
                    ),
                  ],
                ),
                if (_hoveredCandle != null)
                  Text(
                    _hoveredCandle!.isBull ? '+BULL' : '-BEAR',
                    style: TextStyle(
                      fontSize: 11.0,
                      fontWeight: FontWeight.w700,
                      color: _hoveredCandle!.isBull
                          ? tokens.status.successFg
                          : tokens.status.dangerFg,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: JoySpacing.s12),
          JoyCandlestickChart(
            data: _hubCandleData,
            height: 360.0,
            showGrid: true,
            showCrosshair: true,
            onHover: (candle) {
              setState(() {
                _hoveredCandle = candle;
              });
            },
          ),

          const SizedBox(height: JoySpacing.s32),

          // 2. Line Chart
          Text(
            'JoyLineChart (Smooth Timeseries Curve with Gradient Area Fill & Hover Crosshair)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s8),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: JoySpacing.s16,
              vertical: JoySpacing.s12,
            ),
            decoration: BoxDecoration(
              color: tokens.surface.sunken,
              borderRadius: BorderRadius.circular(JoyRadius.control),
              border: Border.all(color: tokens.border.subtle),
            ),
            child: Row(
              children: [
                Text(
                  'LINE TELEMETRY: ',
                  style: TextStyle(
                    fontSize: 11.0,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                    color: tokens.accent.base,
                  ),
                ),
                Text(
                  _hoveredPoint != null
                      ? 'Point ${_hoveredPoint!.x.toInt() + 1} (${_hoveredPoint!.label ?? ""}) | Price: \$${_hoveredPoint!.y.toStringAsFixed(2)}'
                      : 'Hover over curve to activate magnetic tooltip crosshair',
                  style: TextStyle(
                    fontSize: 12.0,
                    fontWeight: FontWeight.w500,
                    color: tokens.text.primary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: JoySpacing.s12),
          JoyLineChart(
            data: _hubLinePoints,
            height: 320.0,
            showGrid: true,
            showArea: true,
            onHover: (point) {
              setState(() {
                _hoveredPoint = point;
              });
            },
          ),

          const SizedBox(height: JoySpacing.s32),

          // 3. Bar Chart
          Text(
            'JoyBarChart (Asset Category Volumes with Rounded Bar Tops & Category Labels)',
            style: TextStyle(
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: tokens.text.primary,
            ),
          ),
          const SizedBox(height: JoySpacing.s8),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: JoySpacing.s16,
              vertical: JoySpacing.s12,
            ),
            decoration: BoxDecoration(
              color: tokens.surface.sunken,
              borderRadius: BorderRadius.circular(JoyRadius.control),
              border: Border.all(color: tokens.border.subtle),
            ),
            child: Row(
              children: [
                Text(
                  'VOLUME TELEMETRY: ',
                  style: TextStyle(
                    fontSize: 11.0,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                    color: tokens.accent.base,
                  ),
                ),
                Text(
                  _hoveredBar != null
                      ? '${_hoveredBar!.category}: ${_hoveredBar!.label ?? _hoveredBar!.value.toStringAsFixed(1)}'
                      : 'Hover over bars to inspect category trade volume',
                  style: TextStyle(
                    fontSize: 12.0,
                    fontWeight: FontWeight.w500,
                    color: tokens.text.primary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: JoySpacing.s12),
          JoyBarChart(
            data: _hubBarData,
            height: 280.0,
            showGrid: true,
            onHover: (bar) {
              setState(() {
                _hoveredBar = bar;
              });
            },
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

class _HubPositionRecord {
  final String id;
  final String symbol;
  final String assetName;
  final String side;
  final double size;
  final double entryPrice;
  final double markPrice;
  final double pnl;
  final double pnlPercent;

  const _HubPositionRecord({
    required this.id,
    required this.symbol,
    required this.assetName,
    required this.side,
    required this.size,
    required this.entryPrice,
    required this.markPrice,
    required this.pnl,
    required this.pnlPercent,
  });
}

final _hubPositions = [
  const _HubPositionRecord(
    id: '1',
    symbol: 'AAPL',
    assetName: 'Apple Inc.',
    side: 'LONG',
    size: 250,
    entryPrice: 172.50,
    markPrice: 184.20,
    pnl: 2925.00,
    pnlPercent: 6.78,
  ),
  const _HubPositionRecord(
    id: '2',
    symbol: 'NVDA',
    assetName: 'NVIDIA Corp.',
    side: 'LONG',
    size: 120,
    entryPrice: 420.00,
    markPrice: 485.40,
    pnl: 7848.00,
    pnlPercent: 15.57,
  ),
  const _HubPositionRecord(
    id: '3',
    symbol: 'TSLA',
    assetName: 'Tesla Inc.',
    side: 'SHORT',
    size: 180,
    entryPrice: 245.00,
    markPrice: 252.80,
    pnl: -1404.00,
    pnlPercent: -3.18,
  ),
  const _HubPositionRecord(
    id: '4',
    symbol: 'BTC/USD',
    assetName: 'Bitcoin Index',
    side: 'LONG',
    size: 2.5,
    entryPrice: 62400.00,
    markPrice: 65120.00,
    pnl: 6800.00,
    pnlPercent: 4.36,
  ),
  const _HubPositionRecord(
    id: '5',
    symbol: 'ETH/USD',
    assetName: 'Ethereum Index',
    side: 'SHORT',
    size: 35.0,
    entryPrice: 3450.00,
    markPrice: 3410.00,
    pnl: 1400.00,
    pnlPercent: 1.16,
  ),
];

final _hubCandleData = [
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 9, 30),
    open: 178.20,
    high: 180.50,
    low: 177.80,
    close: 179.90,
    volume: 142000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 10, 0),
    open: 179.90,
    high: 182.10,
    low: 179.40,
    close: 181.60,
    volume: 185000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 10, 30),
    open: 181.60,
    high: 182.40,
    low: 180.10,
    close: 180.80,
    volume: 98000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 11, 0),
    open: 180.80,
    high: 183.50,
    low: 180.50,
    close: 183.20,
    volume: 210000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 11, 30),
    open: 183.20,
    high: 184.00,
    low: 182.20,
    close: 183.80,
    volume: 130000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 12, 0),
    open: 183.80,
    high: 184.50,
    low: 182.90,
    close: 184.10,
    volume: 115000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 12, 30),
    open: 184.10,
    high: 185.20,
    low: 183.60,
    close: 184.90,
    volume: 160000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 13, 0),
    open: 184.90,
    high: 186.10,
    low: 184.30,
    close: 185.80,
    volume: 245000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 13, 30),
    open: 185.80,
    high: 186.40,
    low: 184.80,
    close: 185.20,
    volume: 175000,
  ),
  JoyCandleData(
    time: DateTime.utc(2026, 10, 5, 14, 0),
    open: 185.20,
    high: 187.00,
    low: 185.00,
    close: 186.75,
    volume: 310000,
  ),
];

const _hubLinePoints = [
  JoyPointData(x: 0, y: 175.20, label: '09:30'),
  JoyPointData(x: 1, y: 177.80, label: '10:00'),
  JoyPointData(x: 2, y: 176.90, label: '10:30'),
  JoyPointData(x: 3, y: 180.40, label: '11:00'),
  JoyPointData(x: 4, y: 182.10, label: '11:30'),
  JoyPointData(x: 5, y: 181.50, label: '12:00'),
  JoyPointData(x: 6, y: 184.20, label: '12:30'),
  JoyPointData(x: 7, y: 183.90, label: '13:00'),
  JoyPointData(x: 8, y: 186.30, label: '13:30'),
  JoyPointData(x: 9, y: 188.50, label: '14:00'),
];

const _hubBarData = [
  JoyBarData(category: 'Equities', value: 1420.0, label: '\$1.42M'),
  JoyBarData(category: 'Crypto', value: 890.0, label: '\$890K'),
  JoyBarData(category: 'Forex', value: 650.0, label: '\$650K'),
  JoyBarData(category: 'Commodities', value: 480.0, label: '\$480K'),
  JoyBarData(category: 'Options', value: 1120.0, label: '\$1.12M'),
  JoyBarData(category: 'Bonds', value: 310.0, label: '\$310K'),
];
