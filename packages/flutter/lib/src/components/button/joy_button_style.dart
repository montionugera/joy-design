import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Available visual variants for JoyButton.
enum JoyButtonVariant {
  solid,
  outline,
  ghost,
  danger,
  link,
}

/// Available size variants for JoyButton.
enum JoyButtonSize {
  sm,
  md,
  lg,
}

/// Resolved style output from [resolveJoyButtonStyle].
@immutable
class JoyButtonResolvedStyle {
  final Color? backgroundColor;
  final BorderSide? border;
  final Color foregroundColor;
  final EdgeInsetsGeometry padding;
  final BorderRadius borderRadius;
  final double minHeight;
  final TextStyle textStyle;
  final Color loaderColor;
  final List<BoxShadow>? boxShadow;

  const JoyButtonResolvedStyle({
    required this.backgroundColor,
    required this.border,
    required this.foregroundColor,
    required this.padding,
    required this.borderRadius,
    required this.minHeight,
    required this.textStyle,
    required this.loaderColor,
    this.boxShadow,
  });
}

/// Pure style resolver mapping button props and interaction states to concrete styling.
/// STRICT: Zero hardcoded color literals. All colors are resolved from [tokens].
JoyButtonResolvedStyle resolveJoyButtonStyle({
  required JoyThemeTokens tokens,
  required JoyButtonVariant variant,
  required JoyButtonSize size,
  required bool isHovered,
  required bool isFocused,
  required bool isPressed,
  required bool isDisabled,
  required bool isLoading,
}) {
  final bool nonInteractive = isDisabled || isLoading;

  // Resolve dimensions based on size
  final double minHeight;
  final double fontSize;
  final EdgeInsetsGeometry horizontalPadding;

  switch (size) {
    case JoyButtonSize.sm:
      minHeight = 32.0;
      fontSize = 13.0;
      horizontalPadding = const EdgeInsets.symmetric(horizontal: JoySpacing.s12);
    case JoyButtonSize.md:
      minHeight = 40.0;
      fontSize = 14.0;
      horizontalPadding = const EdgeInsets.symmetric(horizontal: JoySpacing.s16);
    case JoyButtonSize.lg:
      minHeight = 48.0;
      fontSize = 16.0;
      horizontalPadding = const EdgeInsets.symmetric(horizontal: JoySpacing.s24);
  }

  Color? backgroundColor;
  BorderSide? border;
  Color foregroundColor;
  Color loaderColor;
  TextDecoration textDecoration = TextDecoration.none;
  List<BoxShadow>? boxShadow;

  if (nonInteractive) {
    // Disabled / loading state
    switch (variant) {
      case JoyButtonVariant.link:
        backgroundColor = null;
        border = null;
        foregroundColor = tokens.text.disabled;
        loaderColor = tokens.text.disabled;
      case JoyButtonVariant.solid:
      case JoyButtonVariant.outline:
      case JoyButtonVariant.ghost:
      case JoyButtonVariant.danger:
        backgroundColor = tokens.surface.disabled;
        border = BorderSide(color: tokens.border.disabled, width: 1.0);
        foregroundColor = tokens.text.disabled;
        loaderColor = tokens.text.disabled;
    }
  } else {
    // Interactive states
    switch (variant) {
      case JoyButtonVariant.solid:
        backgroundColor = isPressed
            ? tokens.accent.active
            : (isHovered ? tokens.accent.hover : tokens.accent.base);
        border = BorderSide(color: tokens.accent.gradientEnd, width: 1.0);
        foregroundColor = tokens.text.onAccent;
        loaderColor = tokens.text.onAccent;

      case JoyButtonVariant.outline:
        backgroundColor = isPressed
            ? tokens.surface.sunken
            : (isHovered ? tokens.surface.raised : null);
        border = BorderSide(
          color: isFocused ? tokens.border.focus : tokens.border.strong,
          width: 1.0,
        );
        foregroundColor = tokens.text.primary;
        loaderColor = tokens.text.primary;

      case JoyButtonVariant.ghost:
        backgroundColor = isPressed
            ? tokens.surface.sunken
            : (isHovered ? tokens.surface.raised : null);
        border = BorderSide(
          color: isFocused
              ? tokens.border.focus
              : (isHovered ? tokens.border.base : tokens.border.subtle),
          width: 1.0,
        );
        foregroundColor = tokens.text.primary;
        loaderColor = tokens.text.primary;

      case JoyButtonVariant.danger:
        backgroundColor = tokens.status.dangerSolidBg;
        border = BorderSide(color: tokens.status.dangerSolidBorder, width: 1.0);
        foregroundColor = tokens.status.dangerSolidFg;
        loaderColor = tokens.status.dangerSolidFg;

      case JoyButtonVariant.link:
        backgroundColor = null;
        border = null;
        foregroundColor = tokens.text.link;
        loaderColor = tokens.text.link;
        textDecoration = isHovered ? TextDecoration.underline : TextDecoration.none;
    }

    if (isFocused && variant != JoyButtonVariant.link) {
      boxShadow = [
        BoxShadow(
          color: tokens.focusRing.color,
          spreadRadius: tokens.focusRing.width,
        ),
      ];
    }
  }

  final BorderRadius borderRadius = variant == JoyButtonVariant.link
      ? BorderRadius.zero
      : const BorderRadius.all(Radius.circular(JoyRadius.control));

  final EdgeInsetsGeometry padding = variant == JoyButtonVariant.link
      ? EdgeInsets.zero
      : horizontalPadding;

  final TextStyle textStyle = TextStyle(
    fontSize: fontSize,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.1,
    color: foregroundColor,
    decoration: textDecoration,
    decorationColor: foregroundColor,
  );

  return JoyButtonResolvedStyle(
    backgroundColor: backgroundColor,
    border: border,
    foregroundColor: foregroundColor,
    padding: padding,
    borderRadius: borderRadius,
    minHeight: minHeight,
    textStyle: textStyle,
    loaderColor: loaderColor,
    boxShadow: boxShadow,
  );
}
