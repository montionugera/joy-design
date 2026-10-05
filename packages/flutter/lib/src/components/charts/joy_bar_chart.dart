import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import 'chart_common.dart';

/// Financial and categorical bar chart with rounded bar tops,
/// grid lines, category labels, and hover highlight tooltips.
///
/// Strictly adheres to Zero Color Literals and Zero Emoji rules.
class JoyBarChart extends StatefulWidget {
  final List<JoyBarData> data;
  final double height;
  final bool showGrid;
  final void Function(JoyBarData? bar)? onHover;

  const JoyBarChart({
    super.key,
    required this.data,
    this.height = 320.0,
    this.showGrid = true,
    this.onHover,
  });

  @override
  State<JoyBarChart> createState() => _JoyBarChartState();
}

class _JoyBarChartState extends State<JoyBarChart> {
  Offset? _hoverPosition;
  int? _hoveredIndex;

  void _handleHover(Offset localPosition, double plotWidth, double plotLeft) {
    if (widget.data.isEmpty) return;

    final relativeX = localPosition.dx - plotLeft;
    final slotWidth = plotWidth / widget.data.length;
    final index = (relativeX / slotWidth).floor().clamp(0, widget.data.length - 1);

    setState(() {
      _hoverPosition = localPosition;
      _hoveredIndex = index;
    });

    widget.onHover?.call(widget.data[index]);
  }

  void _handleExit() {
    setState(() {
      _hoverPosition = null;
      _hoveredIndex = null;
    });
    widget.onHover?.call(null);
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final palette = readChartPalette(tokens);

    return Semantics(
      image: true,
      label: describeBarChart(widget.data),
      child: Container(
        height: widget.height,
        decoration: BoxDecoration(
          color: palette.surfaceCard,
          borderRadius: BorderRadius.circular(JoyRadius.card),
          border: Border.all(color: palette.border, width: 1.0),
        ),
        clipBehavior: Clip.antiAlias,
        child: LayoutBuilder(
          builder: (context, constraints) {
            const leftPadding = 16.0;
            const rightPadding = 48.0;
            const topPadding = 24.0;
            const bottomPadding = 32.0;

            final plotWidth = (constraints.maxWidth - leftPadding - rightPadding).clamp(10.0, double.infinity);

            return MouseRegion(
              onHover: (event) => _handleHover(event.localPosition, plotWidth, leftPadding),
              onExit: (_) => _handleExit(),
              child: Stack(
                children: [
                  CustomPaint(
                    size: Size(constraints.maxWidth, widget.height),
                    painter: _JoyBarChartPainter(
                      data: widget.data,
                      palette: palette,
                      hoverPosition: _hoverPosition,
                      hoveredIndex: _hoveredIndex,
                      showGrid: widget.showGrid,
                      padding: const EdgeInsets.fromLTRB(
                        leftPadding,
                        topPadding,
                        rightPadding,
                        bottomPadding,
                      ),
                    ),
                  ),
                  if (_hoveredIndex != null && _hoveredIndex! < widget.data.length)
                    _buildTooltip(widget.data[_hoveredIndex!], palette),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildTooltip(JoyBarData bar, JoyChartPalette palette) {
    return Positioned(
      top: 8.0,
      left: 16.0,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: JoySpacing.s8,
          vertical: JoySpacing.s4,
        ),
        decoration: BoxDecoration(
          color: palette.surfaceSunken,
          borderRadius: BorderRadius.circular(JoyRadius.sm),
          border: Border.all(color: palette.border, width: 1.0),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${bar.category}: ',
              style: TextStyle(
                color: palette.textSecondary,
                fontSize: 12.0,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              bar.value.toStringAsFixed(2),
              style: TextStyle(
                color: palette.textPrimary,
                fontSize: 12.0,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _JoyBarChartPainter extends CustomPainter {
  final List<JoyBarData> data;
  final JoyChartPalette palette;
  final Offset? hoverPosition;
  final int? hoveredIndex;
  final bool showGrid;
  final EdgeInsets padding;

  _JoyBarChartPainter({
    required this.data,
    required this.palette,
    required this.hoverPosition,
    required this.hoveredIndex,
    required this.showGrid,
    required this.padding,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final plotRect = Rect.fromLTRB(
      padding.left,
      padding.top,
      size.width - padding.right,
      size.height - padding.bottom,
    );

    if (data.isEmpty) {
      final textPainter = TextPainter(
        text: TextSpan(
          text: 'No bar data available',
          style: TextStyle(color: palette.textSecondary, fontSize: 13.0),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(
        canvas,
        Offset(
          (size.width - textPainter.width) / 2,
          (size.height - textPainter.height) / 2,
        ),
      );
      return;
    }

    double maxVal = data.first.value;
    for (final d in data) {
      if (d.value > maxVal) maxVal = d.value;
    }
    if (maxVal <= 0.0) maxVal = 1.0;

    // 10% headroom
    maxVal *= 1.1;

    // Grid lines & Y labels
    if (showGrid) {
      final gridPaint = Paint()
        ..color = palette.translucent(palette.border, 160)
        ..strokeWidth = 0.5
        ..style = PaintingStyle.stroke;

      const gridSteps = 4;
      for (int i = 0; i <= gridSteps; i++) {
        final fraction = i / gridSteps;
        final y = plotRect.bottom - fraction * plotRect.height;
        final val = fraction * maxVal;

        canvas.drawLine(Offset(plotRect.left, y), Offset(plotRect.right, y), gridPaint);

        final labelPainter = TextPainter(
          text: TextSpan(
            text: val.toStringAsFixed(0),
            style: TextStyle(
              color: palette.textSecondary,
              fontSize: 10.0,
              fontFamily: 'monospace',
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();

        labelPainter.paint(canvas, Offset(plotRect.right + 6.0, y - labelPainter.height / 2));
      }
    }

    // Bars
    final slotWidth = plotRect.width / data.length;
    final barWidth = (slotWidth * 0.6).clamp(4.0, 48.0);

    for (int i = 0; i < data.length; i++) {
      final item = data[i];
      final isHovered = hoveredIndex == i;
      final barHeight = ((item.value / maxVal) * plotRect.height).clamp(1.0, plotRect.height);
      final left = plotRect.left + (i + 0.5) * slotWidth - barWidth / 2;
      final top = plotRect.bottom - barHeight;

      final barRect = Rect.fromLTWH(left, top, barWidth, barHeight);
      final rrect = RRect.fromRectAndCorners(
        barRect,
        topLeft: const Radius.circular(JoyRadius.sm),
        topRight: const Radius.circular(JoyRadius.sm),
      );

      final barColor = isHovered
          ? palette.accent
          : palette.translucent(palette.accent, 200);

      canvas.drawRRect(
        rrect,
        Paint()
          ..color = barColor
          ..style = PaintingStyle.fill,
      );

      // Category text on X axis
      final textPainter = TextPainter(
        text: TextSpan(
          text: item.category,
          style: TextStyle(
            color: isHovered ? palette.textPrimary : palette.textSecondary,
            fontSize: 11.0,
            fontWeight: isHovered ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
        textDirection: TextDirection.ltr,
        maxLines: 1,
        ellipsis: '...',
      )..layout(maxWidth: slotWidth);

      textPainter.paint(
        canvas,
        Offset(
          plotRect.left + (i + 0.5) * slotWidth - textPainter.width / 2,
          plotRect.bottom + 6.0,
        ),
      );
    }
  }

  @override
  bool shouldRepaint(_JoyBarChartPainter oldDelegate) {
    return oldDelegate.data != data ||
        oldDelegate.palette != palette ||
        oldDelegate.hoverPosition != hoverPosition ||
        oldDelegate.hoveredIndex != hoveredIndex;
  }
}
