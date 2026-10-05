import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Typography variants matching Joymify typography tokens.
enum JoyTextVariant {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  body,
  bodyLarge,
  caption,
  code;

  double get fontSize {
    switch (this) {
      case JoyTextVariant.h1:
        return 32.0;
      case JoyTextVariant.h2:
        return 24.0;
      case JoyTextVariant.h3:
        return 20.0;
      case JoyTextVariant.h4:
        return 18.0;
      case JoyTextVariant.h5:
        return 16.0;
      case JoyTextVariant.h6:
        return 14.0;
      case JoyTextVariant.body:
        return 14.0;
      case JoyTextVariant.bodyLarge:
        return 16.0;
      case JoyTextVariant.caption:
        return 12.0;
      case JoyTextVariant.code:
        return 13.0;
    }
  }

  FontWeight get defaultFontWeight {
    switch (this) {
      case JoyTextVariant.h1:
        return FontWeight.w700;
      case JoyTextVariant.h2:
      case JoyTextVariant.h3:
      case JoyTextVariant.h4:
      case JoyTextVariant.h5:
      case JoyTextVariant.h6:
        return FontWeight.w600;
      case JoyTextVariant.body:
      case JoyTextVariant.bodyLarge:
      case JoyTextVariant.caption:
      case JoyTextVariant.code:
        return FontWeight.w400;
    }
  }

  double get defaultLineHeight {
    switch (this) {
      case JoyTextVariant.h1:
        return 1.15;
      case JoyTextVariant.h2:
      case JoyTextVariant.h3:
      case JoyTextVariant.h4:
      case JoyTextVariant.h5:
      case JoyTextVariant.h6:
        return 1.375;
      case JoyTextVariant.body:
      case JoyTextVariant.bodyLarge:
      case JoyTextVariant.code:
        return 1.5;
      case JoyTextVariant.caption:
        return 1.4;
    }
  }

  String? get fontFamily {
    if (this == JoyTextVariant.code) {
      return 'monospace';
    }
    return null;
  }
}

/// Semantic color variants for [JoyText].
enum JoyTextColor {
  primary,
  secondary,
  tertiary,
  inverse,
  success,
  warning,
  danger,
  accent;

  Color resolve(JoyThemeTokens tokens) {
    switch (this) {
      case JoyTextColor.primary:
        return tokens.text.primary;
      case JoyTextColor.secondary:
        return tokens.text.secondary;
      case JoyTextColor.tertiary:
        return tokens.text.tertiary;
      case JoyTextColor.inverse:
        return tokens.text.inverse;
      case JoyTextColor.success:
        return tokens.status.success.fg;
      case JoyTextColor.warning:
        return tokens.status.warning.fg;
      case JoyTextColor.danger:
        return tokens.status.danger.fg;
      case JoyTextColor.accent:
        return tokens.accent.base;
    }
  }
}

/// Joymify typography text component wrapping Flutter [Text].
///
/// Automatically resolves colors and typography scales from [JoyThemeTokens]
/// and strictly forbids hardcoded color literals.
class JoyText extends StatelessWidget {
  final String text;
  final JoyTextVariant variant;
  final JoyTextColor color;
  final FontWeight? weight;
  final TextAlign? align;
  final int? maxLines;
  final TextOverflow? overflow;
  final TextStyle? style;
  final bool? softWrap;
  final String? semanticsLabel;

  const JoyText(
    this.text, {
    super.key,
    this.variant = JoyTextVariant.body,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  });

  const JoyText.h1(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.h1;

  const JoyText.h2(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.h2;

  const JoyText.h3(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.h3;

  const JoyText.h4(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.h4;

  const JoyText.h5(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.h5;

  const JoyText.h6(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.h6;

  const JoyText.body(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.body;

  const JoyText.bodyLarge(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.bodyLarge;

  const JoyText.caption(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.caption;

  const JoyText.code(
    this.text, {
    super.key,
    this.color = JoyTextColor.primary,
    this.weight,
    this.align,
    this.maxLines,
    this.overflow,
    this.style,
    this.softWrap,
    this.semanticsLabel,
  }) : variant = JoyTextVariant.code;

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final resolvedColor = color.resolve(tokens);

    final baseStyle = TextStyle(
      fontSize: variant.fontSize,
      fontWeight: weight ?? variant.defaultFontWeight,
      height: variant.defaultLineHeight,
      fontFamily: variant.fontFamily,
      color: resolvedColor,
    );

    final effectiveStyle = style != null ? baseStyle.merge(style) : baseStyle;

    return Text(
      text,
      style: effectiveStyle,
      textAlign: align,
      maxLines: maxLines,
      overflow: overflow,
      softWrap: softWrap,
      semanticsLabel: semanticsLabel,
    );
  }
}
