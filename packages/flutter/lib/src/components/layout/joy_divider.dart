import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

class _DashedDividerPainter extends CustomPainter {
  final Color color;
  final double thickness;
  final Axis direction;
  final double dashWidth;
  final double dashGap;

  _DashedDividerPainter({
    required this.color,
    required this.thickness,
    required this.direction,
    this.dashWidth = 4.0,
    this.dashGap = 4.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = thickness
      ..style = PaintingStyle.stroke;

    if (direction == Axis.horizontal) {
      double startX = 0;
      final y = size.height / 2;
      while (startX < size.width) {
        final endX = (startX + dashWidth).clamp(0.0, size.width);
        canvas.drawLine(Offset(startX, y), Offset(endX, y), paint);
        startX += dashWidth + dashGap;
      }
    } else {
      double startY = 0;
      final x = size.width / 2;
      while (startY < size.height) {
        final endY = (startY + dashWidth).clamp(0.0, size.height);
        canvas.drawLine(Offset(x, startY), Offset(x, endY), paint);
        startY += dashWidth + dashGap;
      }
    }
  }

  @override
  bool shouldRepaint(_DashedDividerPainter oldDelegate) =>
      color != oldDelegate.color ||
      thickness != oldDelegate.thickness ||
      direction != oldDelegate.direction ||
      dashWidth != oldDelegate.dashWidth ||
      dashGap != oldDelegate.dashGap;
}

/// Hairline divider component supporting horizontal and vertical orientations,
/// optional text/content, and token-based border colors.
class JoyDivider extends StatelessWidget {
  final Axis direction;
  final Color? color;
  final double thickness;
  final double indent;
  final double endIndent;
  final bool dashed;
  final double dashWidth;
  final double dashGap;
  final Widget? child;

  const JoyDivider({
    super.key,
    this.direction = Axis.horizontal,
    this.color,
    this.thickness = 1.0,
    this.indent = 0.0,
    this.endIndent = 0.0,
    this.dashed = false,
    this.dashWidth = 4.0,
    this.dashGap = 4.0,
    this.child,
  });

  /// Horizontal divider line.
  const JoyDivider.horizontal({
    super.key,
    this.color,
    this.thickness = 1.0,
    this.indent = 0.0,
    this.endIndent = 0.0,
    this.dashed = false,
    this.dashWidth = 4.0,
    this.dashGap = 4.0,
    this.child,
  }) : direction = Axis.horizontal;

  /// Vertical divider line.
  const JoyDivider.vertical({
    super.key,
    this.color,
    this.thickness = 1.0,
    this.indent = 0.0,
    this.endIndent = 0.0,
    this.dashed = false,
    this.dashWidth = 4.0,
    this.dashGap = 4.0,
    this.child,
  }) : direction = Axis.vertical;

  Widget _buildLine(Color resolvedColor) {
    if (dashed) {
      return CustomPaint(
        size: direction == Axis.horizontal
            ? Size(double.infinity, thickness)
            : Size(thickness, double.infinity),
        painter: _DashedDividerPainter(
          color: resolvedColor,
          thickness: thickness,
          direction: direction,
          dashWidth: dashWidth,
          dashGap: dashGap,
        ),
      );
    }

    if (direction == Axis.horizontal) {
      return Container(
        height: thickness,
        color: resolvedColor,
      );
    } else {
      return Container(
        width: thickness,
        color: resolvedColor,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final resolvedColor = color ?? tokens.border.subtle;

    if (child != null) {
      if (direction == Axis.horizontal) {
        return Padding(
          padding: EdgeInsets.only(left: indent, right: endIndent),
          child: Row(
            children: [
              Expanded(child: _buildLine(resolvedColor)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: JoySpacing.s8),
                child: child!,
              ),
              Expanded(child: _buildLine(resolvedColor)),
            ],
          ),
        );
      } else {
        return Padding(
          padding: EdgeInsets.only(top: indent, bottom: endIndent),
          child: Column(
            children: [
              Expanded(child: _buildLine(resolvedColor)),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: JoySpacing.s8),
                child: child!,
              ),
              Expanded(child: _buildLine(resolvedColor)),
            ],
          ),
        );
      }
    }

    return Padding(
      padding: direction == Axis.horizontal
          ? EdgeInsets.only(left: indent, right: endIndent)
          : EdgeInsets.only(top: indent, bottom: endIndent),
      child: _buildLine(resolvedColor),
    );
  }
}
