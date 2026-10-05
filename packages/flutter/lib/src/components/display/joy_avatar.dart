import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Predefined sizes for [JoyAvatar].
enum JoyAvatarSize {
  sm(24.0, 10.0, 14.0),
  md(32.0, 13.0, 18.0),
  lg(40.0, 16.0, 22.0);

  final double dimension;
  final double fontSize;
  final double iconSize;

  const JoyAvatarSize(this.dimension, this.fontSize, this.iconSize);
}

/// Geometric shapes for [JoyAvatar].
enum JoyAvatarShape {
  circle,
  square;
}

/// Semantic color variants for [JoyAvatar].
enum JoyAvatarVariant {
  defaultVariant,
  neutral,
  accent,
  info,
  success,
  warning,
  danger;
}

/// An avatar component representing users, entities, or initials.
///
/// Supports remote network images, clean fallback to computed initials or icons,
/// circle/square geometric shapes, and ring borders.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyAvatar extends StatelessWidget {
  final String? imageUrl;
  final ImageProvider? image;
  final String? name;
  final String? initials;
  final Widget? fallback;
  final JoyAvatarSize size;
  final double? customSize;
  final JoyAvatarShape shape;
  final JoyAvatarVariant variant;
  final double ringWidth;
  final Color? ringColor;
  final Color? backgroundColor;
  final Color? textColor;

  const JoyAvatar({
    super.key,
    this.imageUrl,
    this.image,
    this.name,
    this.initials,
    this.fallback,
    this.size = JoyAvatarSize.md,
    this.customSize,
    this.shape = JoyAvatarShape.circle,
    this.variant = JoyAvatarVariant.defaultVariant,
    this.ringWidth = 0.0,
    this.ringColor,
    this.backgroundColor,
    this.textColor,
  });

  /// Circle avatar constructor.
  const JoyAvatar.circle({
    super.key,
    this.imageUrl,
    this.image,
    this.name,
    this.initials,
    this.fallback,
    this.size = JoyAvatarSize.md,
    this.customSize,
    this.variant = JoyAvatarVariant.defaultVariant,
    this.ringWidth = 0.0,
    this.ringColor,
    this.backgroundColor,
    this.textColor,
  }) : shape = JoyAvatarShape.circle;

  /// Square avatar constructor.
  const JoyAvatar.square({
    super.key,
    this.imageUrl,
    this.image,
    this.name,
    this.initials,
    this.fallback,
    this.size = JoyAvatarSize.md,
    this.customSize,
    this.variant = JoyAvatarVariant.defaultVariant,
    this.ringWidth = 0.0,
    this.ringColor,
    this.backgroundColor,
    this.textColor,
  }) : shape = JoyAvatarShape.square;

  static String computeInitials(String rawName) {
    final trimmed = rawName.trim();
    if (trimmed.isEmpty) return '';
    final parts = trimmed.split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      final first = parts.first;
      final last = parts.last;
      if (first.isNotEmpty && last.isNotEmpty) {
        return (first[0] + last[0]).toUpperCase();
      }
    }
    final len = math.min(2, trimmed.length);
    return trimmed.substring(0, len).toUpperCase();
  }

  Color _resolveBg(JoyThemeTokens tokens) {
    if (backgroundColor != null) return backgroundColor!;
    switch (variant) {
      case JoyAvatarVariant.defaultVariant:
      case JoyAvatarVariant.neutral:
        return tokens.surface.sunken;
      case JoyAvatarVariant.accent:
        return tokens.accent.subtle;
      case JoyAvatarVariant.info:
        return tokens.status.info.bg;
      case JoyAvatarVariant.success:
        return tokens.status.success.bg;
      case JoyAvatarVariant.warning:
        return tokens.status.warning.bg;
      case JoyAvatarVariant.danger:
        return tokens.status.danger.bg;
    }
  }

  Color _resolveFg(JoyThemeTokens tokens) {
    if (textColor != null) return textColor!;
    switch (variant) {
      case JoyAvatarVariant.defaultVariant:
      case JoyAvatarVariant.neutral:
        return tokens.text.primary;
      case JoyAvatarVariant.accent:
        return tokens.accent.text;
      case JoyAvatarVariant.info:
        return tokens.status.info.fg;
      case JoyAvatarVariant.success:
        return tokens.status.success.fg;
      case JoyAvatarVariant.warning:
        return tokens.status.warning.fg;
      case JoyAvatarVariant.danger:
        return tokens.status.danger.fg;
    }
  }

  Color _resolveBorder(JoyThemeTokens tokens) {
    switch (variant) {
      case JoyAvatarVariant.defaultVariant:
      case JoyAvatarVariant.neutral:
        return tokens.border.base;
      case JoyAvatarVariant.accent:
        return tokens.accent.base;
      case JoyAvatarVariant.info:
        return tokens.status.info.border;
      case JoyAvatarVariant.success:
        return tokens.status.success.border;
      case JoyAvatarVariant.warning:
        return tokens.status.warning.border;
      case JoyAvatarVariant.danger:
        return tokens.status.danger.border;
    }
  }

  Widget _buildFallback(BuildContext context, Color fg, double fontSize, double iconSize) {
    final resolvedInitials = initials ?? (name != null ? computeInitials(name!) : '');

    if (resolvedInitials.isNotEmpty) {
      return Center(
        child: Text(
          resolvedInitials,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            color: fg,
            height: 1.0,
          ),
        ),
      );
    }

    if (fallback != null) {
      return Center(child: fallback!);
    }

    return Center(
      child: JoyIcon(
        JoyIcons.user,
        customSize: iconSize,
        color: fg,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final dimension = customSize ?? size.dimension;
    final fontSize = customSize != null ? customSize! * 0.4 : size.fontSize;
    final iconSize = customSize != null ? customSize! * 0.5 : size.iconSize;

    final bg = _resolveBg(tokens);
    final fg = _resolveFg(tokens);
    final border = _resolveBorder(tokens);
    final effectiveRingColor = ringColor ?? tokens.surface.canvas;

    final isCircle = shape == JoyAvatarShape.circle;
    final borderRadius = isCircle ? null : BorderRadius.circular(JoyRadius.control);

    Widget innerContent;
    if (image != null) {
      innerContent = Image(
        image: image!,
        fit: BoxFit.cover,
        width: dimension,
        height: dimension,
        errorBuilder: (ctx, err, stack) => _buildFallback(context, fg, fontSize, iconSize),
      );
    } else if (imageUrl != null && imageUrl!.isNotEmpty) {
      innerContent = Image.network(
        imageUrl!,
        fit: BoxFit.cover,
        width: dimension,
        height: dimension,
        errorBuilder: (ctx, err, stack) => _buildFallback(context, fg, fontSize, iconSize),
      );
    } else {
      innerContent = _buildFallback(context, fg, fontSize, iconSize);
    }

    Widget avatarWidget = Container(
      width: dimension,
      height: dimension,
      decoration: BoxDecoration(
        color: bg,
        shape: isCircle ? BoxShape.circle : BoxShape.rectangle,
        borderRadius: borderRadius,
        border: Border.all(color: border, width: 1.0),
      ),
      clipBehavior: Clip.antiAlias,
      child: innerContent,
    );

    if (ringWidth > 0) {
      avatarWidget = Container(
        decoration: BoxDecoration(
          shape: isCircle ? BoxShape.circle : BoxShape.rectangle,
          borderRadius: borderRadius != null
              ? BorderRadius.circular(JoyRadius.control + ringWidth)
              : null,
          border: Border.all(
            color: effectiveRingColor,
            width: ringWidth,
          ),
        ),
        child: avatarWidget,
      );
    }

    return Semantics(
      image: true,
      label: name ?? initials ?? 'Avatar',
      child: avatarWidget,
    );
  }
}
