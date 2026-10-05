import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import 'chart_common.dart';

/// Interactive financial candlestick chart rendering price action,
/// volume, grid lines, hover crosshair, and telemetry HUD.
///
/// Strictly adheres to Zero Color Literals and Zero Emoji rules.
class JoyCandlestickChart extends StatefulWidget {
  final List<JoyCandleData> data;
  final double height;
  final bool showGrid;
  final bool showCrosshair;
  final void Function(JoyCandleData? candle)? onHover;

  const JoyCandlestickChart({
    super.key,
    required this.data,
    this.height = 360.0,
    this.showGrid = true,
    this.showCrosshair = true,
    this.onHover,
  });

  @override
  State<JoyCandlestickChart> createState() => _JoyCandlestickChartState();
}

class _JoyCandlestickChartState extends State<JoyCandlestickChart> {
  Offset? _hoverPosition;
  int? _hoveredIndex;

  void _handleHover(Offset localPosition, double plotWidth, double plotLeft) {
    if (widget.data.isEmpty) return;

    final relativeX = localPosition.dx - plotLeft;
    final fraction = (relativeX / plotWidth).clamp(0.0, 0.9999);
    final index = (fraction * widget.data.length).floor().clamp(0, widget.data.length - 1);

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
      label: describeCandlestickChart(widget.data),
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
            const leftPadding = 12.0;
            const rightPadding = 64.0;
            const topPadding = 28.0;
            const bottomPadding = 24.0;

            final plotWidth = (constraints.maxWidth - leftPadding - rightPadding).clamp(10.0, double.infinity);

            return MouseRegion(
              onHover: (event) => _handleHover(event.localPosition, plotWidth, leftPadding),
              onExit: (_) => _handleExit(),
              child: Stack(
                children: [
                  CustomPaint(
                    size: Size(constraints.maxWidth, widget.height),
                    painter: _JoyCandlestickPainter(
                      data: widget.data,
                      palette: palette,
                      hoverPosition: _hoverPosition,
                      hoveredIndex: _hoveredIndex,
                      showGrid: widget.showGrid,
                      showCrosshair: widget.showCrosshair,
                      padding: const EdgeInsets.fromLTRB(
                        leftPadding,
                        topPadding,
                        rightPadding,
                        bottomPadding,
                      ),
                    ),
                  ),
                  if (_hoveredIndex != null && _hoveredIndex! < widget.data.length)
                    _buildHud(widget.data[_hoveredIndex!], palette),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildHud(JoyCandleData candle, JoyChartPalette palette) {
    final diff = candle.close - candle.open;
    final pct = candle.open != 0.0 ? (diff / candle.open * 100.0) : 0.0;
    final sign = diff >= 0 ? '+' : '';
    final color = candle.isBull ? palette.bull : palette.bear;

    return Positioned(
      top: 6.0,
      left: 12.0,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            formatCandleTime(candle.time),
            style: TextStyle(
              color: palette.textSecondary,
              fontSize: 11.0,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: JoySpacing.s12),
          Text(
            'O: ${candle.open.toStringAsFixed(2)}  H: ${candle.high.toStringAsFixed(2)}  L: ${candle.low.toStringAsFixed(2)}  C: ${candle.close.toStringAsFixed(2)}',
            style: TextStyle(
              color: palette.textPrimary,
              fontSize: 11.0,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: JoySpacing.s8),
          Text(
            '$sign${pct.toStringAsFixed(2)}%',
            style: TextStyle(
              color: color,
              fontSize: 11.0,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _JoyCandlestickPainter extends CustomPainter {
  final List<JoyCandleData> data;
  final JoyChartPalette palette;
  final Offset? hoverPosition;
  final int? hoveredIndex;
  final bool showGrid;
  final bool showCrosshair;
  final EdgeInsets padding;

  _JoyCandlestickPainter({
    required this.data,
    required this.palette,
    required this.hoverPosition,
    required this.hoveredIndex,
    required this.showGrid,
    required this.showCrosshair,
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
          text: 'No candlestick data',
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

    double minPrice = data.first.low;
    double maxPrice = data.first.high;
    for (final c in data) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    if (minPrice == maxPrice) {
      minPrice -= 1.0;
      maxPrice += 1.0;
    }

    // Add 5% headroom
    final priceRange = maxPrice - minPrice;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    final totalRange = maxPrice - minPrice;

    double priceToY(double price) {
      return plotRect.bottom - ((price - minPrice) / totalRange) * plotRect.height;
    }

    // Grid Lines & Price Labels
    if (showGrid) {
      final gridPaint = Paint()
        ..color = palette.translucent(palette.border, 160)
        ..strokeWidth = 0.5
        ..style = PaintingStyle.stroke;

      const gridSteps = 4;
      for (int i = 0; i <= gridSteps; i++) {
        final fraction = i / gridSteps;
        final y = plotRect.bottom - fraction * plotRect.height;
        final price = minPrice + fraction * totalRange;

        canvas.drawLine(Offset(plotRect.left, y), Offset(plotRect.right, y), gridPaint);

        final labelPainter = TextPainter(
          text: TextSpan(
            text: price.toStringAsFixed(2),
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

    // Candles
    final slotWidth = plotRect.width / data.length;
    final bodyWidth = (slotWidth * 0.7).clamp(1.5, 24.0);

    for (int i = 0; i < data.length; i++) {
      final candle = data[i];
      final color = candle.isBull ? palette.bull : palette.bear;
      final centerX = plotRect.left + (i + 0.5) * slotWidth;

      final wickPaint = Paint()
        ..color = color
        ..strokeWidth = 1.2
        ..style = PaintingStyle.stroke;

      final highY = priceToY(candle.high);
      final lowY = priceToY(candle.low);
      final openY = priceToY(candle.open);
      final closeY = priceToY(candle.close);

      // Draw Wick
      canvas.drawLine(Offset(centerX, highY), Offset(centerX, lowY), wickPaint);

      // Draw Body
      final bodyTop = math.min(openY, closeY);
      final bodyHeight = math.max(1.2, (openY - closeY).abs());

      final bodyRect = Rect.fromLTWH(
        centerX - bodyWidth / 2,
        bodyTop,
        bodyWidth,
        bodyHeight,
      );

      final bodyPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      canvas.drawRect(bodyRect, bodyPaint);
    }

    // Hover Crosshair
    if (showCrosshair && hoverPosition != null && hoveredIndex != null) {
      final activeIndex = hoveredIndex!;
      if (activeIndex >= 0 && activeIndex < data.length) {
        final crosshairX = plotRect.left + (activeIndex + 0.5) * slotWidth;
        final crosshairY = hoverPosition!.dy.clamp(plotRect.top, plotRect.bottom);

        final crosshairPaint = Paint()
          ..color = palette.translucent(palette.accent, 180)
          ..strokeWidth = 1.0
          ..style = PaintingStyle.stroke;

        // Vertical Line
        canvas.drawLine(
          Offset(crosshairX, plotRect.top),
          Offset(crosshairX, plotRect.bottom),
          crosshairPaint,
        );

        // Horizontal Line
        canvas.drawLine(
          Offset(plotRect.left, crosshairY),
          Offset(plotRect.right, crosshairY),
          crosshairPaint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(_JoyCandlestickPainter oldDelegate) {
    return oldDelegate.data != data ||
        oldDelegate.palette != palette ||
        oldDelegate.hoverPosition != hoverPosition ||
        oldDelegate.hoveredIndex != hoveredIndex;
  }
}
