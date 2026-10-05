import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Responsive multi-column grid layout primitive.
///
/// Lays out [children] across [columns] separated by [gutter] and [runGutter].
/// Automatically computes item widths according to available container width.
class JoyGrid extends StatelessWidget {
  final int columns;
  final double gutter;
  final double? runGutter;
  final List<Widget> children;
  final int Function(double maxWidth)? responsiveColumns;

  const JoyGrid({
    super.key,
    this.columns = 2,
    this.gutter = JoySpacing.s16,
    this.runGutter,
    this.children = const <Widget>[],
    this.responsiveColumns,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final effectiveColumns = responsiveColumns != null
            ? responsiveColumns!(constraints.maxWidth)
            : columns;
        final safeColumns = effectiveColumns < 1 ? 1 : effectiveColumns;
        final effectiveRunGutter = runGutter ?? gutter;

        if (constraints.maxWidth.isFinite && safeColumns > 0) {
          final totalGutter = (safeColumns - 1) * gutter;
          final availableWidth = constraints.maxWidth - totalGutter;
          final itemWidth =
              (availableWidth / safeColumns).clamp(0.0, double.infinity);

          return Wrap(
            spacing: gutter,
            runSpacing: effectiveRunGutter,
            children: children.map((child) {
              return SizedBox(
                width: itemWidth,
                child: child,
              );
            }).toList(),
          );
        }

        return Wrap(
          spacing: gutter,
          runSpacing: effectiveRunGutter,
          children: children,
        );
      },
    );
  }
}
