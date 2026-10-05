import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Status variants for [JoyBadge].
enum JoyBadgeStatus {
  defaultStatus,
  success,
  warning,
  danger,
  info;
}

/// Size variants for [JoyBadge].
enum JoyBadgeSize {
  sm,
  md;

  EdgeInsets get padding {
    switch (this) {
      case JoyBadgeSize.sm:
        return const EdgeInsets.symmetric(horizontal: JoySpacing.s8, vertical: JoySpacing.s2);
      case JoyBadgeSize.md:
        return const EdgeInsets.symmetric(horizontal: JoySpacing.s8 + JoySpacing.s2, vertical: JoySpacing.s4);
    }
  }

  double get fontSize {
    switch (this) {
      case JoyBadgeSize.sm:
        return 12.0;
      case JoyBadgeSize.md:
        return 13.0;
    }
  }

  double get dotSize {
    switch (this) {
      case JoyBadgeSize.sm:
        return 6.0;
      case JoyBadgeSize.md:
        return 8.0;
    }
  }
}

/// A badge component for notifications, counters, and status indicators.
///
/// Can wrap a [child] widget to position a badge at its top-end corner,
/// or render standalone as a pill or dot indicator.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyBadge extends StatelessWidget {
  final Widget? child;
  final int? count;
  final int overflowCount;
  final bool dot;
  final bool showZero;
  final String? text;
  final JoyBadgeStatus status;
  final JoyBadgeSize size;
  final Color? backgroundColor;
  final Color? textColor;
  final Offset? offset;

  const JoyBadge({
    super.key,
    this.child,
    this.count,
    this.overflowCount = 99,
    this.dot = false,
    this.showZero = false,
    this.text,
    this.status = JoyBadgeStatus.defaultStatus,
    this.size = JoyBadgeSize.md,
    this.backgroundColor,
    this.textColor,
    this.offset,
  });

  /// Status dot badge variant.
  const JoyBadge.dot({
    super.key,
    this.child,
    this.status = JoyBadgeStatus.defaultStatus,
    this.size = JoyBadgeSize.md,
    this.backgroundColor,
    this.offset,
  })  : count = null,
        overflowCount = 99,
        dot = true,
        showZero = false,
        text = null,
        textColor = null;

  /// Numeric count badge variant.
  const JoyBadge.count({
    super.key,
    this.child,
    required this.count,
    this.overflowCount = 99,
    this.showZero = false,
    this.status = JoyBadgeStatus.danger,
    this.size = JoyBadgeSize.md,
    this.backgroundColor,
    this.textColor,
    this.offset,
  })  : dot = false,
        text = null;

  Color _resolveBg(JoyThemeTokens tokens) {
    if (backgroundColor != null) return backgroundColor!;
    if (dot) {
      switch (status) {
        case JoyBadgeStatus.defaultStatus:
          return tokens.accent.base;
        case JoyBadgeStatus.success:
          return tokens.status.success.fg;
        case JoyBadgeStatus.warning:
          return tokens.status.warning.fg;
        case JoyBadgeStatus.danger:
          return tokens.status.danger.fg;
        case JoyBadgeStatus.info:
          return tokens.status.info.fg;
      }
    }
    switch (status) {
      case JoyBadgeStatus.defaultStatus:
        return tokens.surface.sunken;
      case JoyBadgeStatus.success:
        return tokens.status.success.bg;
      case JoyBadgeStatus.warning:
        return tokens.status.warning.bg;
      case JoyBadgeStatus.danger:
        return tokens.status.danger.bg;
      case JoyBadgeStatus.info:
        return tokens.status.info.bg;
    }
  }

  Color _resolveFg(JoyThemeTokens tokens) {
    if (textColor != null) return textColor!;
    switch (status) {
      case JoyBadgeStatus.defaultStatus:
        return tokens.text.primary;
      case JoyBadgeStatus.success:
        return tokens.status.success.fg;
      case JoyBadgeStatus.warning:
        return tokens.status.warning.fg;
      case JoyBadgeStatus.danger:
        return tokens.status.danger.fg;
      case JoyBadgeStatus.info:
        return tokens.status.info.fg;
    }
  }

  Color _resolveBorder(JoyThemeTokens tokens) {
    switch (status) {
      case JoyBadgeStatus.defaultStatus:
        return tokens.border.subtle;
      case JoyBadgeStatus.success:
        return tokens.status.success.border;
      case JoyBadgeStatus.warning:
        return tokens.status.warning.border;
      case JoyBadgeStatus.danger:
        return tokens.status.danger.border;
      case JoyBadgeStatus.info:
        return tokens.status.info.border;
    }
  }

  String? _displayText() {
    if (dot) return null;
    if (text != null) return text;
    if (count != null) {
      if (count! > overflowCount) {
        return '$overflowCount+';
      }
      return '$count';
    }
    return null;
  }

  bool _shouldDisplay() {
    if (dot) return true;
    if (text != null && text!.isNotEmpty) return true;
    if (count != null) {
      if (count == 0 && !showZero) return false;
      return true;
    }
    return false;
  }

  Widget _buildBadge(BuildContext context) {
    final tokens = context.joyTheme;
    final bg = _resolveBg(tokens);
    final fg = _resolveFg(tokens);
    final border = _resolveBorder(tokens);

    if (dot) {
      return Container(
        width: size.dotSize,
        height: size.dotSize,
        decoration: BoxDecoration(
          color: bg,
          shape: BoxShape.circle,
        ),
      );
    }

    final displayText = _displayText() ?? '';

    return Container(
      padding: size.padding,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(JoyRadius.pill),
        border: Border.all(color: border, width: 1.0),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: size.fontSize,
          fontWeight: FontWeight.w600,
          color: fg,
          height: 1.0,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (child == null) {
      if (!_shouldDisplay()) {
        return const SizedBox.shrink();
      }
      return _buildBadge(context);
    }

    final shouldDisplay = _shouldDisplay();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child!,
        if (shouldDisplay)
          PositionedDirectional(
            top: offset?.dy ?? -JoySpacing.s4,
            end: offset?.dx ?? -JoySpacing.s4,
            child: _buildBadge(context),
          ),
      ],
    );
  }
}
