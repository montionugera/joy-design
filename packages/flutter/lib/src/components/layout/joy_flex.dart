import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Flex layout primitive supporting spacing gaps, direction, alignment, and wrapping.
class JoyFlex extends StatelessWidget {
  final Axis direction;
  final double gap;
  final MainAxisAlignment mainAxisAlignment;
  final CrossAxisAlignment crossAxisAlignment;
  final MainAxisSize mainAxisSize;
  final bool wrap;
  final List<Widget> children;

  const JoyFlex({
    super.key,
    this.direction = Axis.horizontal,
    this.gap = JoySpacing.s8,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.mainAxisSize = MainAxisSize.max,
    this.wrap = false,
    this.children = const <Widget>[],
  });

  /// Horizontal flex layout (Row equivalent with token gap).
  const JoyFlex.horizontal({
    super.key,
    this.gap = JoySpacing.s8,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.mainAxisSize = MainAxisSize.max,
    this.wrap = false,
    this.children = const <Widget>[],
  }) : direction = Axis.horizontal;

  /// Vertical flex layout (Column equivalent with token gap).
  const JoyFlex.vertical({
    super.key,
    this.gap = JoySpacing.s8,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.mainAxisSize = MainAxisSize.max,
    this.wrap = false,
    this.children = const <Widget>[],
  }) : direction = Axis.vertical;

  WrapAlignment _mapWrapAlignment(MainAxisAlignment align) {
    switch (align) {
      case MainAxisAlignment.start:
        return WrapAlignment.start;
      case MainAxisAlignment.end:
        return WrapAlignment.end;
      case MainAxisAlignment.center:
        return WrapAlignment.center;
      case MainAxisAlignment.spaceBetween:
        return WrapAlignment.spaceBetween;
      case MainAxisAlignment.spaceAround:
        return WrapAlignment.spaceAround;
      case MainAxisAlignment.spaceEvenly:
        return WrapAlignment.spaceEvenly;
    }
  }

  WrapCrossAlignment _mapWrapCrossAlignment(CrossAxisAlignment align) {
    switch (align) {
      case CrossAxisAlignment.start:
        return WrapCrossAlignment.start;
      case CrossAxisAlignment.end:
        return WrapCrossAlignment.end;
      case CrossAxisAlignment.center:
        return WrapCrossAlignment.center;
      default:
        return WrapCrossAlignment.start;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (wrap) {
      return Wrap(
        direction: direction,
        spacing: gap,
        runSpacing: gap,
        alignment: _mapWrapAlignment(mainAxisAlignment),
        crossAxisAlignment: _mapWrapCrossAlignment(crossAxisAlignment),
        children: children,
      );
    }

    final spacedChildren = <Widget>[];
    for (int i = 0; i < children.length; i++) {
      spacedChildren.add(children[i]);
      if (gap > 0 && i < children.length - 1) {
        spacedChildren.add(
          direction == Axis.horizontal
              ? SizedBox(width: gap)
              : SizedBox(height: gap),
        );
      }
    }

    return Flex(
      direction: direction,
      mainAxisAlignment: mainAxisAlignment,
      crossAxisAlignment: crossAxisAlignment,
      mainAxisSize: mainAxisSize,
      children: spacedChildren,
    );
  }
}
