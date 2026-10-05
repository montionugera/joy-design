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
