import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import 'chart_common.dart';

/// Financial and telemetry timeseries line chart with smooth Bezier curve,
/// gradient area fill, grid lines, and magnetic hover tooltip crosshair.
///
/// Strictly adheres to Zero Color Literals and Zero Emoji rules.
class JoyLineChart extends StatefulWidget {
  final List<JoyPointData> data;
  final double height;
  final bool showGrid;
  final bool showArea;
  final void Function(JoyPointData? point)? onHover;

  const JoyLineChart({
    super.key,
    required this.data,
    this.height = 320.0,
    this.showGrid = true,
    this.showArea = true,
    this.onHover,
  });

  @override
  State<JoyLineChart> createState() => _JoyLineChartState();
}

class _JoyLineChartState extends State<JoyLineChart> {
  Offset? _hoverPosition;
  int? _hoveredIndex;

  void _handleHover(Offset localPosition, double plotWidth, double plotLeft) {
    if (widget.data.isEmpty) return;

    if (widget.data.length == 1) {
      setState(() {
        _hoverPosition = localPosition;
        _hoveredIndex = 0;
      });
      widget.onHover?.call(widget.data[0]);
      return;
    }

    final relativeX = localPosition.dx - plotLeft;
    final fraction = (relativeX / plotWidth).clamp(0.0, 1.0);
    final approxIndex = (fraction * (widget.data.length - 1)).round().clamp(0, widget.data.length - 1);

    setState(() {
      _hoverPosition = localPosition;
      _hoveredIndex = approxIndex;
    });

    widget.onHover?.call(widget.data[approxIndex]);
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
      label: describeLineChart(widget.data),
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
            const rightPadding = 56.0;
            const topPadding = 24.0;
            const bottomPadding = 24.0;

            final plotWidth = (constraints.maxWidth - leftPadding - rightPadding).clamp(10.0, double.infinity);

            return MouseRegion(
              onHover: (event) => _handleHover(event.localPosition, plotWidth, leftPadding),
              onExit: (_) => _handleExit(),
              child: Stack(
                children: [
                  CustomPaint(
                    size: Size(constraints.maxWidth, widget.height),
                    painter: _JoyLineChartPainter(
                      data: widget.data,
                      palette: palette,
                      hoverPosition: _hoverPosition,
                      hoveredIndex: _hoveredIndex,
                      showGrid: widget.showGrid,
                      showArea: widget.showArea,
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

  Widget _buildTooltip(JoyPointData point, JoyChartPalette palette) {
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
            if (point.label != null) ...[
              Text(
                '${point.label!}: ',
                style: TextStyle(
                  color: palette.textSecondary,
                  fontSize: 12.0,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
            Text(
              point.y.toStringAsFixed(2),
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

class _JoyLineChartPainter extends CustomPainter {
  final List<JoyPointData> data;
  final JoyChartPalette palette;
  final Offset? hoverPosition;
  final int? hoveredIndex;
  final bool showGrid;
  final bool showArea;
  final EdgeInsets padding;

  _JoyLineChartPainter({
    required this.data,
    required this.palette,
    required this.hoverPosition,
    required this.hoveredIndex,
    required this.showGrid,
    required this.showArea,
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
          text: 'No timeseries data',
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

    double minY = data.first.y;
    double maxY = data.first.y;
    for (final p in data) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    if (minY == maxY) {
      minY -= 1.0;
      maxY += 1.0;
    }

    // Add 5% headroom
    final yRange = maxY - minY;
    minY -= yRange * 0.05;
    maxY += yRange * 0.05;
    final totalYRange = maxY - minY;

    double yToCanvas(double y) {
      return plotRect.bottom - ((y - minY) / totalYRange) * plotRect.height;
    }

    // Grid lines & labels
    if (showGrid) {
      final gridPaint = Paint()
        ..color = palette.translucent(palette.border, 160)
        ..strokeWidth = 0.5
        ..style = PaintingStyle.stroke;

      const gridSteps = 4;
      for (int i = 0; i <= gridSteps; i++) {
        final fraction = i / gridSteps;
        final y = plotRect.bottom - fraction * plotRect.height;
        final val = minY + fraction * totalYRange;

        canvas.drawLine(Offset(plotRect.left, y), Offset(plotRect.right, y), gridPaint);

        final labelPainter = TextPainter(
          text: TextSpan(
            text: val.toStringAsFixed(1),
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

    // Convert data points to canvas offsets
    final points = <Offset>[];
    final count = data.length;
    for (int i = 0; i < count; i++) {
      final x = count == 1
          ? plotRect.left + plotRect.width / 2
          : plotRect.left + (i / (count - 1)) * plotRect.width;
      final y = yToCanvas(data[i].y);
      points.add(Offset(x, y));
    }

    // Build Smooth Bezier Path
    final linePath = Path();
    linePath.moveTo(points.first.dx, points.first.dy);

    if (points.length == 1) {
      // Single point
      canvas.drawCircle(
        points.first,
        4.0,
        Paint()
          ..color = palette.accent
          ..style = PaintingStyle.fill,
      );
    } else {
      for (int i = 0; i < points.length - 1; i++) {
        final p0 = points[i];
        final p1 = points[i + 1];
        final midX = (p0.dx + p1.dx) / 2;

        linePath.cubicTo(
          midX,
          p0.dy,
          midX,
          p1.dy,
          p1.dx,
          p1.dy,
        );
      }

      // Gradient Area Fill
      if (showArea) {
        final areaPath = Path.from(linePath);
        areaPath.lineTo(points.last.dx, plotRect.bottom);
        areaPath.lineTo(points.first.dx, plotRect.bottom);
        areaPath.close();

        final topColor = palette.translucent(palette.accent, 76);
        final bottomColor = palette.transparent(palette.accent);

        final areaPaint = Paint()
          ..shader = LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [topColor, bottomColor],
          ).createShader(plotRect)
          ..style = PaintingStyle.fill;

        canvas.drawPath(areaPath, areaPaint);
      }

      // Stroke Line
      final linePaint = Paint()
        ..color = palette.accent
        ..strokeWidth = 2.0
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;

      canvas.drawPath(linePath, linePaint);
    }

    // Hover Highlight & Crosshair
    if (hoverPosition != null && hoveredIndex != null) {
      final activeIndex = hoveredIndex!;
      if (activeIndex >= 0 && activeIndex < points.length) {
        final point = points[activeIndex];

        final crosshairPaint = Paint()
          ..color = palette.translucent(palette.accent, 160)
          ..strokeWidth = 1.0
          ..style = PaintingStyle.stroke;

        // Vertical crosshair
        canvas.drawLine(
          Offset(point.dx, plotRect.top),
          Offset(point.dx, plotRect.bottom),
          crosshairPaint,
        );

        // Point Outer Ring
        canvas.drawCircle(
          point,
          6.0,
          Paint()
            ..color = palette.accent
            ..style = PaintingStyle.fill,
        );

        // Point Inner Center
        canvas.drawCircle(
          point,
          3.0,
          Paint()
            ..color = palette.surfaceCard
            ..style = PaintingStyle.fill,
        );
      }
    }
  }

  @override
  bool shouldRepaint(_JoyLineChartPainter oldDelegate) {
    return oldDelegate.data != data ||
        oldDelegate.palette != palette ||
        oldDelegate.hoverPosition != hoverPosition ||
        oldDelegate.hoveredIndex != hoveredIndex;
  }
}
