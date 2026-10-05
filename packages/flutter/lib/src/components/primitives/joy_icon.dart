import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../tokens/joy_tokens.g.dart';

/// Predefined standard sizes for [JoyIcon].
enum JoyIconSize {
  sm(16.0),
  md(20.0),
  lg(24.0);

  final double pixels;
  const JoyIconSize(this.pixels);
}

/// Representation of vector SVG icon data.
@immutable
class JoyIconData {
  final String svgString;
  final String? name;

  const JoyIconData(this.svgString, {this.name});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is JoyIconData &&
          runtimeType == other.runtimeType &&
          svgString == other.svgString;

  @override
  int get hashCode => svgString.hashCode;

  @override
  String toString() => name != null ? 'JoyIconData($name)' : 'JoyIconData()';
}

/// Curated vector SVG icons for Joymify Design System.
/// Strictly enforces the Zero Emoji Policy with crisp, scalable vector graphics.
abstract final class JoyIcons {
  JoyIcons._();

  static const JoyIconData search = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    name: 'search',
  );

  static const JoyIconData check = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    name: 'check',
  );

  static const JoyIconData close = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    name: 'close',
  );

  static const JoyIconData plus = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    name: 'plus',
  );

  static const JoyIconData minus = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    name: 'minus',
  );

  static const JoyIconData info = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    name: 'info',
  );

  static const JoyIconData alertTriangle = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    name: 'alertTriangle',
  );

  static const JoyIconData alertCircle = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    name: 'alertCircle',
  );

  static const JoyIconData checkCircle = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    name: 'checkCircle',
  );

  static const JoyIconData chevronDown = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    name: 'chevronDown',
  );

  static const JoyIconData chevronUp = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
    name: 'chevronUp',
  );

  static const JoyIconData chevronLeft = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    name: 'chevronLeft',
  );

  static const JoyIconData chevronRight = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    name: 'chevronRight',
  );

  static const JoyIconData trash = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    name: 'trash',
  );

  static const JoyIconData edit = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    name: 'edit',
  );

  static const JoyIconData star = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    name: 'star',
  );

  static const JoyIconData starOutline = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    name: 'starOutline',
  );

  static const JoyIconData starFilled = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    name: 'starFilled',
  );

  static const JoyIconData starHalf = JoyIconData(
    '<svg viewBox="0 0 24 24"><path d="M12 2L8.91 8.26L2 9.27L7 14.14L5.82 21.02L12 17.77Z" fill="currentColor"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    name: 'starHalf',
  );

  static const JoyIconData user = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    name: 'user',
  );

  static const JoyIconData trendingUp = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    name: 'trendingUp',
  );

  static const JoyIconData trendingDown = JoyIconData(
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
    name: 'trendingDown',
  );
}

/// Joymify vector icon widget rendering SVG vector icons.
///
/// Accepts [JoyIconData], raw SVG markup string, or an asset path.
/// Sizes default to [JoyIconSize.md] (20px), and colors resolve to [JoyTextTokens.primary].
class JoyIcon extends StatelessWidget {
  final JoyIconData? icon;
  final String? svgString;
  final String? assetPath;
  final JoyIconSize size;
  final double? customSize;
  final Color? color;
  final String? semanticLabel;

  static final RegExp _emojiRegex = RegExp(
    r'[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]',
    unicode: true,
  );

  static void _validateNoEmoji(String value) {
    if (_emojiRegex.hasMatch(value)) {
      throw ArgumentError(
        'Zero Emoji Policy Violation: JoyIcon only accepts vector SVG icons or JoyIconData, never OS emojis.',
      );
    }
  }

  /// Primary constructor accepting [JoyIconData] or a String (SVG markup or asset path).
  JoyIcon(
    Object source, {
    super.key,
    Object? size = JoyIconSize.md,
    double? customSize,
    this.color,
    this.semanticLabel,
  }) : icon = source is JoyIconData ? source : null,
       svgString = source is String && source.trim().startsWith('<') ? source : null,
       assetPath = source is String && !source.trim().startsWith('<') ? source : null,
       size = size is JoyIconSize ? size : JoyIconSize.md,
       customSize = customSize ?? (size is num ? size.toDouble() : null) {
    if (source is String) {
      _validateNoEmoji(source);
    }
  }

  /// Explicit constructor for [JoyIconData].
  const JoyIcon.data(
    JoyIconData this.icon, {
    super.key,
    this.size = JoyIconSize.md,
    this.customSize,
    this.color,
    this.semanticLabel,
  }) : svgString = null,
       assetPath = null;

  /// Explicit constructor for raw SVG markup.
  JoyIcon.svg(
    String this.svgString, {
    super.key,
    this.size = JoyIconSize.md,
    this.customSize,
    this.color,
    this.semanticLabel,
  }) : icon = null,
       assetPath = null {
    _validateNoEmoji(svgString!);
  }

  /// Explicit constructor for asset path.
  JoyIcon.asset(
    String this.assetPath, {
    super.key,
    this.size = JoyIconSize.md,
    this.customSize,
    this.color,
    this.semanticLabel,
  }) : icon = null,
       svgString = null {
    _validateNoEmoji(assetPath!);
  }

  double get effectiveSize => customSize ?? size.pixels;

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final effectiveColor = color ?? tokens.text.primary;
    final pixelSize = effectiveSize;
    final colorFilter = ColorFilter.mode(effectiveColor, BlendMode.srcIn);

    if (svgString != null) {
      return SvgPicture.string(
        svgString!,
        width: pixelSize,
        height: pixelSize,
        colorFilter: colorFilter,
        semanticsLabel: semanticLabel,
      );
    } else if (icon != null) {
      return SvgPicture.string(
        icon!.svgString,
        width: pixelSize,
        height: pixelSize,
        colorFilter: colorFilter,
        semanticsLabel: semanticLabel ?? icon!.name,
      );
    } else if (assetPath != null) {
      return SvgPicture.asset(
        assetPath!,
        width: pixelSize,
        height: pixelSize,
        colorFilter: colorFilter,
        semanticsLabel: semanticLabel,
      );
    }

    return SizedBox(width: pixelSize, height: pixelSize);
  }
}
