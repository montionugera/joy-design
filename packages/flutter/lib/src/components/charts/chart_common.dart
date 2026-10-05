import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Semantic token palette resolved for financial charts.
/// Strictly token-driven: bull/bear, accent, borders, and text are derived
/// directly from the active theme without color literals.
@immutable
class JoyChartPalette {
  final Color bull;
  final Color bear;
  final Color accent;
  final Color textSecondary;
  final Color border;
  final Color textPrimary;
  final Color surfaceCard;
  final Color surfaceSunken;
  final Color surfaceCanvas;

  const JoyChartPalette({
    required this.bull,
    required this.bear,
    required this.accent,
    required this.textSecondary,
    required this.border,
    required this.textPrimary,
    required this.surfaceCard,
    required this.surfaceSunken,
    required this.surfaceCanvas,
  });

  /// Derives a translucent version of [c] with [alpha] (0-255)
  /// without using .withOpacity or color literals.
  Color translucent(Color c, int alpha) {
    return Color.fromARGB(
      alpha.clamp(0, 255),
      (c.r * 255.0).round() & 0xff,
      (c.g * 255.0).round() & 0xff,
      (c.b * 255.0).round() & 0xff,
    );
  }

  /// Derives a fully transparent version of [c].
  Color transparent(Color c) {
    return translucent(c, 0);
  }
}

/// Helper extracting chart palette colors from active [JoyThemeTokens].
JoyChartPalette readChartPalette(JoyThemeTokens tokens) {
  return JoyChartPalette(
    bull: tokens.status.successFg,
    bear: tokens.status.dangerFg,
    accent: tokens.accent.base,
    textSecondary: tokens.text.secondary,
    border: tokens.border.subtle,
    textPrimary: tokens.text.primary,
    surfaceCard: tokens.surface.card,
    surfaceSunken: tokens.surface.sunken,
    surfaceCanvas: tokens.surface.canvas,
  );
}

/// Financial candlestick data model.
@immutable
class JoyCandleData {
  final DateTime time;
  final double open;
  final double high;
  final double low;
  final double close;
  final double? volume;

  const JoyCandleData({
    required this.time,
    required this.open,
    required this.high,
    required this.low,
    required this.close,
    this.volume,
  });

  factory JoyCandleData.fromMillis({
    required int timestamp,
    required double open,
    required double high,
    required double low,
    required double close,
    double? volume,
  }) {
    return JoyCandleData(
      time: DateTime.fromMillisecondsSinceEpoch(timestamp, isUtc: true),
      open: open,
      high: high,
      low: low,
      close: close,
      volume: volume,
    );
  }

  bool get isBull => close >= open;
  bool get isBear => close < open;
}

/// 2D telemetry and timeseries point data model.
@immutable
class JoyPointData {
  final double x;
  final double y;
  final String? label;

  const JoyPointData({
    required this.x,
    required this.y,
    this.label,
  });
}

/// Category bar chart data model.
@immutable
class JoyBarData {
  final String category;
  final double value;
  final String? label;

  const JoyBarData({
    required this.category,
    required this.value,
    this.label,
  });
}

/// Accessible summary description for a candlestick dataset.
String describeCandlestickChart(List<JoyCandleData> data) {
  if (data.isEmpty) return 'Empty candlestick chart';
  double minLow = data.first.low;
  double maxHigh = data.first.high;
  for (final c in data) {
    if (c.low < minLow) minLow = c.low;
    if (c.high > maxHigh) maxHigh = c.high;
  }
  return 'Candlestick chart with ${data.length} candles. Range: low ${minLow.toStringAsFixed(2)} to high ${maxHigh.toStringAsFixed(2)}.';
}

/// Accessible summary description for a line chart dataset.
String describeLineChart(List<JoyPointData> data) {
  if (data.isEmpty) return 'Empty line chart';
  double minY = data.first.y;
  double maxY = data.first.y;
  for (final p in data) {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return 'Line chart with ${data.length} points. Range: min ${minY.toStringAsFixed(2)} to max ${maxY.toStringAsFixed(2)}.';
}

/// Accessible summary description for a bar chart dataset.
String describeBarChart(List<JoyBarData> data) {
  if (data.isEmpty) return 'Empty bar chart';
  return 'Bar chart with ${data.length} categories.';
}

/// Format candle timestamp to readable UTC date string.
String formatCandleTime(DateTime time) {
  final y = time.year.toString().padLeft(4, '0');
  final m = time.month.toString().padLeft(2, '0');
  final d = time.day.toString().padLeft(2, '0');
  final hh = time.hour.toString().padLeft(2, '0');
  final mm = time.minute.toString().padLeft(2, '0');
  return '$y-$m-$d $hh:$mm UTC';
}
