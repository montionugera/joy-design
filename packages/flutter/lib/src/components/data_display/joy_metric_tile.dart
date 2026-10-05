import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';
import '../feedback/joy_skeleton.dart';

/// Trend direction for financial metrics.
enum JoyMetricTrend {
  up,
  down,
  neutral;

  /// Derive trend direction from numeric delta value.
  static JoyMetricTrend fromDelta(double? delta) {
    if (delta == null || delta == 0.0) return JoyMetricTrend.neutral;
    return delta > 0.0 ? JoyMetricTrend.up : JoyMetricTrend.down;
  }
}

/// Joymify financial metric tile displaying headline KPI value,
/// trend pill with directional indicator, delta period, and prefix/suffix slots.
///
/// Strictly enforces Zero Color Literals and Zero Emoji policies.
class JoyMetricTile extends StatelessWidget {
  final String title;
  final String value;
  final Widget? prefix;
  final Widget? suffix;
  final double? delta;
  final String? deltaPeriod;
  final JoyMetricTrend? trend;
  final bool loading;
  final VoidCallback? onTap;

  const JoyMetricTile({
    super.key,
    required this.title,
    required this.value,
    this.prefix,
    this.suffix,
    this.delta,
    this.deltaPeriod,
    this.trend,
    this.loading = false,
    this.onTap,
  });

  JoyMetricTrend get effectiveTrend =>
      trend ?? JoyMetricTrend.fromDelta(delta);

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;

    if (loading) {
      return Container(
        padding: const EdgeInsets.all(JoySpacing.s16),
        decoration: BoxDecoration(
          color: tokens.surface.card,
          borderRadius: BorderRadius.circular(JoyRadius.card),
          border: Border.all(color: tokens.border.subtle, width: 1.0),
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            JoySkeleton(width: 80.0, height: 16.0),
            SizedBox(height: JoySpacing.s12),
            JoySkeleton(width: 140.0, height: 28.0),
            SizedBox(height: JoySpacing.s8),
            JoySkeleton(width: 100.0, height: 20.0),
          ],
        ),
      );
    }

    final trendFg = _resolveTrendFg(tokens);
    final trendBg = _resolveTrendBg(tokens);

    Widget card = Container(
      padding: const EdgeInsets.all(JoySpacing.s16),
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        border: Border.all(color: tokens.border.subtle, width: 1.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Title
          Text(
            title,
            style: TextStyle(
              color: tokens.text.secondary,
              fontSize: 14.0,
              fontWeight: FontWeight.w500,
            ),
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: JoySpacing.s8),
          // Value Row (Prefix, Value, Suffix)
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              if (prefix != null) ...[
                prefix!,
                const SizedBox(width: JoySpacing.s4),
              ],
              Flexible(
                child: Text(
                  value,
                  style: TextStyle(
                    color: tokens.text.primary,
                    fontSize: 26.0,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (suffix != null) ...[
                const SizedBox(width: JoySpacing.s4),
                suffix!,
              ],
            ],
          ),
          // Delta and Trend Row
          if (delta != null || deltaPeriod != null) ...[
            const SizedBox(height: JoySpacing.s8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (delta != null)
                  _buildDeltaPill(tokens, trendFg, trendBg),
                if (delta != null && deltaPeriod != null)
                  const SizedBox(width: JoySpacing.s8),
                if (deltaPeriod != null)
                  Text(
                    deltaPeriod!,
                    style: TextStyle(
                      color: tokens.text.secondary,
                      fontSize: 12.0,
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );

    if (onTap != null) {
      card = InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        child: card,
      );
    }

    return card;
  }

  Widget _buildDeltaPill(
    JoyThemeTokens tokens,
    Color trendFg,
    Color trendBg,
  ) {
    final JoyIconData? iconData;
    switch (effectiveTrend) {
      case JoyMetricTrend.up:
        iconData = JoyIcons.trendingUp;
        break;
      case JoyMetricTrend.down:
        iconData = JoyIcons.trendingDown;
        break;
      case JoyMetricTrend.neutral:
        iconData = null;
        break;
    }

    final deltaValue = delta!;
    final sign = deltaValue > 0.0 ? '+' : '';
    final deltaText = '$sign${deltaValue.toStringAsFixed(1)}%';

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: JoySpacing.s8,
        vertical: JoySpacing.s2,
      ),
      decoration: BoxDecoration(
        color: trendBg,
        borderRadius: BorderRadius.circular(JoyRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (iconData != null) ...[
            JoyIcon.data(
              iconData,
              size: JoyIconSize.sm,
              color: trendFg,
            ),
            const SizedBox(width: JoySpacing.s4),
          ],
          Text(
            deltaText,
            style: TextStyle(
              color: trendFg,
              fontSize: 12.0,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Color _resolveTrendFg(JoyThemeTokens tokens) {
    switch (effectiveTrend) {
      case JoyMetricTrend.up:
        return tokens.status.successFg;
      case JoyMetricTrend.down:
        return tokens.status.dangerFg;
      case JoyMetricTrend.neutral:
        return tokens.text.secondary;
    }
  }

  Color _resolveTrendBg(JoyThemeTokens tokens) {
    switch (effectiveTrend) {
      case JoyMetricTrend.up:
        return tokens.status.successBg;
      case JoyMetricTrend.down:
        return tokens.status.dangerBg;
      case JoyMetricTrend.neutral:
        return tokens.surface.sunken;
    }
  }
}

/// Joymify StatCard widget extending metric display with eyebrow, chart slot,
/// secondary footer, and custom metadata.
///
/// Strictly enforces Zero Color Literals and Zero Emoji policies.
class JoyStatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? eyebrow;
  final Widget? prefix;
  final Widget? suffix;
  final double? delta;
  final String? deltaPeriod;
  final JoyMetricTrend? trend;
  final Widget? chart;
  final Widget? footer;
  final bool loading;
  final VoidCallback? onTap;

  const JoyStatCard({
    super.key,
    required this.title,
    required this.value,
    this.eyebrow,
    this.prefix,
    this.suffix,
    this.delta,
    this.deltaPeriod,
    this.trend,
    this.chart,
    this.footer,
    this.loading = false,
    this.onTap,
  });

  JoyMetricTrend get effectiveTrend =>
      trend ?? JoyMetricTrend.fromDelta(delta);

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;

    if (loading) {
      return Container(
        padding: const EdgeInsets.all(JoySpacing.s16),
        decoration: BoxDecoration(
          color: tokens.surface.card,
          borderRadius: BorderRadius.circular(JoyRadius.card),
          border: Border.all(color: tokens.border.subtle, width: 1.0),
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            JoySkeleton(width: 80.0, height: 16.0),
            SizedBox(height: JoySpacing.s12),
            JoySkeleton(width: 140.0, height: 28.0),
            SizedBox(height: JoySpacing.s8),
            JoySkeleton(width: 100.0, height: 20.0),
          ],
        ),
      );
    }

    final trendFg = _resolveTrendFg(tokens);
    final trendBg = _resolveTrendBg(tokens);

    Widget card = Container(
      padding: const EdgeInsets.all(JoySpacing.s16),
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        border: Border.all(color: tokens.border.subtle, width: 1.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (eyebrow != null) ...[
            Text(
              eyebrow!,
              style: TextStyle(
                color: tokens.text.muted,
                fontSize: 12.0,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: JoySpacing.s4),
          ],
          Text(
            title,
            style: TextStyle(
              color: tokens.text.secondary,
              fontSize: 14.0,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: JoySpacing.s8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              if (prefix != null) ...[
                prefix!,
                const SizedBox(width: JoySpacing.s4),
              ],
              Flexible(
                child: Text(
                  value,
                  style: TextStyle(
                    color: tokens.text.primary,
                    fontSize: 28.0,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (suffix != null) ...[
                const SizedBox(width: JoySpacing.s4),
                suffix!,
              ],
            ],
          ),
          if (delta != null || deltaPeriod != null) ...[
            const SizedBox(height: JoySpacing.s8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (delta != null)
                  _buildDeltaPill(tokens, trendFg, trendBg),
                if (delta != null && deltaPeriod != null)
                  const SizedBox(width: JoySpacing.s8),
                if (deltaPeriod != null)
                  Text(
                    deltaPeriod!,
                    style: TextStyle(
                      color: tokens.text.secondary,
                      fontSize: 12.0,
                    ),
                  ),
              ],
            ),
          ],
          if (chart != null) ...[
            const SizedBox(height: JoySpacing.s12),
            chart!,
          ],
          if (footer != null) ...[
            const SizedBox(height: JoySpacing.s12),
            Divider(color: tokens.border.subtle, height: 1.0),
            const SizedBox(height: JoySpacing.s8),
            footer!,
          ],
        ],
      ),
    );

    if (onTap != null) {
      card = InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        child: card,
      );
    }

    return card;
  }

  Widget _buildDeltaPill(
    JoyThemeTokens tokens,
    Color trendFg,
    Color trendBg,
  ) {
    final JoyIconData? iconData;
    switch (effectiveTrend) {
      case JoyMetricTrend.up:
        iconData = JoyIcons.trendingUp;
        break;
      case JoyMetricTrend.down:
        iconData = JoyIcons.trendingDown;
        break;
      case JoyMetricTrend.neutral:
        iconData = null;
        break;
    }

    final deltaValue = delta!;
    final sign = deltaValue > 0.0 ? '+' : '';
    final deltaText = '$sign${deltaValue.toStringAsFixed(1)}%';

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: JoySpacing.s8,
        vertical: JoySpacing.s2,
      ),
      decoration: BoxDecoration(
        color: trendBg,
        borderRadius: BorderRadius.circular(JoyRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (iconData != null) ...[
            JoyIcon.data(
              iconData,
              size: JoyIconSize.sm,
              color: trendFg,
            ),
            const SizedBox(width: JoySpacing.s4),
          ],
          Text(
            deltaText,
            style: TextStyle(
              color: trendFg,
              fontSize: 12.0,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Color _resolveTrendFg(JoyThemeTokens tokens) {
    switch (effectiveTrend) {
      case JoyMetricTrend.up:
        return tokens.status.successFg;
      case JoyMetricTrend.down:
        return tokens.status.dangerFg;
      case JoyMetricTrend.neutral:
        return tokens.text.secondary;
    }
  }

  Color _resolveTrendBg(JoyThemeTokens tokens) {
    switch (effectiveTrend) {
      case JoyMetricTrend.up:
        return tokens.status.successBg;
      case JoyMetricTrend.down:
        return tokens.status.dangerBg;
      case JoyMetricTrend.neutral:
        return tokens.surface.sunken;
    }
  }
}
