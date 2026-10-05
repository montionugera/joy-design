import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Semantic variants for [JoyTag].
enum JoyTagVariant {
  defaultStatus,
  accent,
  success,
  warning,
  danger,
  info;
}

/// A compact tag component for categorizing, labeling, or filtering content.
///
/// Supports closable tags with a mandatory 44px coarse hit-target floor,
/// checkable/selectable toggle states, and token-based color styling.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyTag extends StatelessWidget {
  final String? text;
  final Widget? child;
  final Widget? icon;
  final JoyTagVariant variant;
  final bool closable;
  final VoidCallback? onClose;
  final bool checkable;
  final bool checked;
  final ValueChanged<bool>? onChanged;
  final VoidCallback? onTap;

  const JoyTag({
    super.key,
    this.text,
    this.child,
    this.icon,
    this.variant = JoyTagVariant.defaultStatus,
    this.closable = false,
    this.onClose,
    this.checkable = false,
    this.checked = false,
    this.onChanged,
    this.onTap,
  }) : assert(
          text != null || child != null,
          'Either text or child must be provided to JoyTag',
        );

  /// Closable tag variant constructor.
  const JoyTag.closable({
    super.key,
    this.text,
    this.child,
    this.icon,
    this.variant = JoyTagVariant.defaultStatus,
    required this.onClose,
  })  : closable = true,
        checkable = false,
        checked = false,
        onChanged = null,
        onTap = null,
        assert(
          text != null || child != null,
          'Either text or child must be provided to JoyTag',
        );

  /// Checkable/selectable tag variant constructor.
  const JoyTag.checkable({
    super.key,
    this.text,
    this.child,
    this.icon,
    this.variant = JoyTagVariant.defaultStatus,
    required this.checked,
    required this.onChanged,
  })  : closable = false,
        onClose = null,
        checkable = true,
        onTap = null,
        assert(
          text != null || child != null,
          'Either text or child must be provided to JoyTag',
        );

  Color _resolveBg(JoyThemeTokens tokens) {
    if (checkable && checked) {
      return tokens.accent.base;
    }
    switch (variant) {
      case JoyTagVariant.defaultStatus:
      case JoyTagVariant.accent:
        return tokens.surface.raised;
      case JoyTagVariant.success:
        return tokens.status.success.bg;
      case JoyTagVariant.warning:
        return tokens.status.warning.bg;
      case JoyTagVariant.danger:
        return tokens.status.danger.bg;
      case JoyTagVariant.info:
        return tokens.status.info.bg;
    }
  }

  Color _resolveBorder(JoyThemeTokens tokens) {
    if (checkable && checked) {
      return tokens.accent.base;
    }
    switch (variant) {
      case JoyTagVariant.defaultStatus:
        return tokens.border.subtle;
      case JoyTagVariant.accent:
        return tokens.accent.base;
      case JoyTagVariant.success:
        return tokens.status.success.border;
      case JoyTagVariant.warning:
        return tokens.status.warning.border;
      case JoyTagVariant.danger:
        return tokens.status.danger.border;
      case JoyTagVariant.info:
        return tokens.status.info.border;
    }
  }

  Color _resolveFg(JoyThemeTokens tokens) {
    if (checkable && checked) {
      return tokens.text.onAccent;
    }
    switch (variant) {
      case JoyTagVariant.defaultStatus:
        return tokens.text.primary;
      case JoyTagVariant.accent:
        return tokens.accent.text;
      case JoyTagVariant.success:
        return tokens.status.success.fg;
      case JoyTagVariant.warning:
        return tokens.status.warning.fg;
      case JoyTagVariant.danger:
        return tokens.status.danger.fg;
      case JoyTagVariant.info:
        return tokens.status.info.fg;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final bg = _resolveBg(tokens);
    final border = _resolveBorder(tokens);
    final fg = _resolveFg(tokens);

    Widget content = child ??
        Text(
          text!,
          style: TextStyle(
            fontSize: 12.0,
            fontWeight: FontWeight.w500,
            color: fg,
            height: 1.5,
          ),
        );

    if (icon != null) {
      content = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          icon!,
          const SizedBox(width: JoySpacing.s4),
          content,
        ],
      );
    }

    Widget tagBody = Container(
      padding: EdgeInsets.only(
        left: JoySpacing.s8,
        right: closable ? JoySpacing.s2 : JoySpacing.s8,
        top: JoySpacing.s2,
        bottom: JoySpacing.s2,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(JoyRadius.control),
        border: Border.all(color: border, width: 1.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          content,
          if (closable) ...[
            const SizedBox(width: JoySpacing.s4),
            GestureDetector(
              key: const Key('joy_tag_close_button'),
              behavior: HitTestBehavior.opaque,
              onTap: onClose,
              child: Semantics(
                button: true,
                label: 'Close tag',
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    minWidth: 44.0,
                    minHeight: 44.0,
                  ),
                  child: Center(
                    child: JoyIcon(
                      JoyIcons.close,
                      customSize: 12.0,
                      color: fg,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );

    if (checkable || onTap != null) {
      tagBody = GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          if (checkable) {
            onChanged?.call(!checked);
          } else {
            onTap?.call();
          }
        },
        child: Semantics(
          button: true,
          checked: checkable ? checked : null,
          child: tagBody,
        ),
      );
    }

    return tagBody;
  }
}
