import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

enum _JoyBoxPreset {
  standard,
  card,
  canvas,
  sunken,
  raised,
  subtle,
}

/// Token-driven container widget for Joymify Design System.
///
/// Supports padding, margin, border, border radius, background color,
/// and semantic surface presets resolving strictly from [JoyThemeTokens].
class JoyBox extends StatelessWidget {
  final Widget? child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Color? borderColor;
  final double borderWidth;
  final BorderRadiusGeometry? borderRadius;
  final double? width;
  final double? height;
  final AlignmentGeometry? alignment;
  final BoxConstraints? constraints;
  final Clip clipBehavior;
  final _JoyBoxPreset _preset;

  const JoyBox({
    super.key,
    this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.borderRadius,
    this.width,
    this.height,
    this.alignment,
    this.constraints,
    this.clipBehavior = Clip.none,
  }) : _preset = _JoyBoxPreset.standard;

  /// Card surface container with subtle border and card border radius.
  const JoyBox.card({
    super.key,
    this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.borderRadius = const BorderRadius.all(Radius.circular(JoyRadius.card)),
    this.width,
    this.height,
    this.alignment,
    this.constraints,
    this.clipBehavior = Clip.none,
  }) : _preset = _JoyBoxPreset.card;

  /// Canvas surface container matching app canvas background.
  const JoyBox.canvas({
    super.key,
    this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.borderRadius,
    this.width,
    this.height,
    this.alignment,
    this.constraints,
    this.clipBehavior = Clip.none,
  }) : _preset = _JoyBoxPreset.canvas;

  /// Sunken surface container for recessed backgrounds.
  const JoyBox.sunken({
    super.key,
    this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.borderRadius,
    this.width,
    this.height,
    this.alignment,
    this.constraints,
    this.clipBehavior = Clip.none,
  }) : _preset = _JoyBoxPreset.sunken;

  /// Raised surface container for elevated cards and sheets.
  const JoyBox.raised({
    super.key,
    this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.borderRadius,
    this.width,
    this.height,
    this.alignment,
    this.constraints,
    this.clipBehavior = Clip.none,
  }) : _preset = _JoyBoxPreset.raised;

  /// Subtle container with card surface and subtle border.
  const JoyBox.subtle({
    super.key,
    this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.0,
    this.borderRadius,
    this.width,
    this.height,
    this.alignment,
    this.constraints,
    this.clipBehavior = Clip.none,
  }) : _preset = _JoyBoxPreset.subtle;

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;

    Color? resolvedBg = backgroundColor;
    Color? resolvedBorder = borderColor;

    switch (_preset) {
      case _JoyBoxPreset.card:
        resolvedBg ??= tokens.surface.card;
        resolvedBorder ??= tokens.border.subtle;
      case _JoyBoxPreset.canvas:
        resolvedBg ??= tokens.surface.canvas;
      case _JoyBoxPreset.sunken:
        resolvedBg ??= tokens.surface.sunken;
      case _JoyBoxPreset.raised:
        resolvedBg ??= tokens.surface.raised;
      case _JoyBoxPreset.subtle:
        resolvedBg ??= tokens.surface.card;
        resolvedBorder ??= tokens.border.subtle;
      case _JoyBoxPreset.standard:
        break;
    }

    final hasDecoration =
        resolvedBg != null || resolvedBorder != null || borderRadius != null;

    final decoration = hasDecoration
        ? BoxDecoration(
            color: resolvedBg,
            border: resolvedBorder != null
                ? Border.all(color: resolvedBorder, width: borderWidth)
                : null,
            borderRadius: borderRadius,
          )
        : null;

    return Container(
      width: width,
      height: height,
      padding: padding,
      margin: margin,
      alignment: alignment,
      constraints: constraints,
      decoration: decoration,
      clipBehavior: clipBehavior,
      child: child,
    );
  }
}
