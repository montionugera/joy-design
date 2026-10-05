import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import 'joy_flex.dart';

/// Spacing and spacer layout primitive.
///
/// Can be used as a standalone spacer between widgets or as a flex layout container
/// spacing a list of child widgets with token spacing.
class JoySpace extends StatelessWidget {
  final Axis direction;
  final double size;
  final List<Widget>? children;
  final CrossAxisAlignment? align;
  final bool wrap;

  const JoySpace({
    super.key,
    this.direction = Axis.horizontal,
    this.size = JoySpacing.s8,
    this.children,
    this.align,
    this.wrap = false,
  });

  /// Horizontal spacer with given size from [JoySpacing].
  const JoySpace.horizontal(
    this.size, {
    super.key,
    this.children,
    this.align,
    this.wrap = false,
  }) : direction = Axis.horizontal;

  /// Vertical spacer with given size from [JoySpacing].
  const JoySpace.vertical(
    this.size, {
    super.key,
    this.children,
    this.align,
    this.wrap = false,
  }) : direction = Axis.vertical;

  /// Square spacer with equal width and height.
  const JoySpace.all(
    this.size, {
    super.key,
  })  : direction = Axis.horizontal,
        children = null,
        align = null,
        wrap = false;

  @override
  Widget build(BuildContext context) {
    if (children != null && children!.isNotEmpty) {
      return JoyFlex(
        direction: direction,
        gap: size,
        crossAxisAlignment: align ?? CrossAxisAlignment.center,
        wrap: wrap,
        children: children!,
      );
    }

    if (direction == Axis.horizontal) {
      return SizedBox(width: size);
    } else {
      return SizedBox(height: size);
    }
  }
}
