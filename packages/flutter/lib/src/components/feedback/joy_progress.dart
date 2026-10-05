import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Progress shape type.
enum JoyProgressType {
  line,
  circle;
}

/// Progress status state.
enum JoyProgressStatus {
  normal,
  active,
  success,
  error;
}

/// A progress indicator widget displaying completion percentage or status.
///
/// Supports linear and circular representations, status variants (normal, active,
/// success, error), and accessible progressbar semantics.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyProgress extends StatefulWidget {
  final double percent;
  final JoyProgressType type;
  final JoyProgressStatus status;
  final bool showInfo;
  final double strokeWidth;
  final double? size;
  final Color? strokeColor;
  final Color? trailColor;
  final String Function(double percent)? format;

  const JoyProgress({
    super.key,
    required this.percent,
    this.type = JoyProgressType.line,
    this.status = JoyProgressStatus.normal,
    this.showInfo = true,
    this.strokeWidth = 8.0,
    this.size,
    this.strokeColor,
    this.trailColor,
    this.format,
  });

  const JoyProgress.line({
    super.key,
    required this.percent,
    this.status = JoyProgressStatus.normal,
    this.showInfo = true,
    this.strokeWidth = 8.0,
    this.strokeColor,
    this.trailColor,
    this.format,
  })  : type = JoyProgressType.line,
        size = null;

  const JoyProgress.circle({
    super.key,
    required this.percent,
    this.status = JoyProgressStatus.normal,
    this.showInfo = true,
    this.strokeWidth = 6.0,
    this.size = 120.0,
    this.strokeColor,
    this.trailColor,
    this.format,
  }) : type = JoyProgressType.circle;

  @override
  State<JoyProgress> createState() => _JoyProgressState();
}

class _JoyProgressState extends State<JoyProgress>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    );
    if (widget.status == JoyProgressStatus.active) {
      _animController.repeat();
    }
  }

  @override
  void didUpdateWidget(JoyProgress oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.status == JoyProgressStatus.active) {
      if (!_animController.isAnimating) {
        _animController.repeat();
      }
    } else {
      if (_animController.isAnimating) {
        _animController.stop();
      }
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  double get _clampedPercent {
    if (widget.percent.isNaN || widget.percent.isInfinite) return 0.0;
    return widget.percent.clamp(0.0, 100.0);
  }

  JoyProgressStatus get _effectiveStatus {
    if (_clampedPercent >= 100.0 && widget.status != JoyProgressStatus.error) {
      return JoyProgressStatus.success;
    }
    return widget.status;
  }

  Color _resolveStrokeColor(JoyThemeTokens tokens) {
    if (widget.strokeColor != null) return widget.strokeColor!;
    switch (_effectiveStatus) {
      case JoyProgressStatus.success:
        return tokens.status.success.fg;
      case JoyProgressStatus.error:
        return tokens.status.danger.fg;
      case JoyProgressStatus.normal:
      case JoyProgressStatus.active:
        return tokens.accent.base;
    }
  }

  Color _resolveTrailColor(JoyThemeTokens tokens) {
    return widget.trailColor ?? tokens.surface.sunken;
  }

  Widget _buildLine(BuildContext context, JoyThemeTokens tokens) {
    final strokeColor = _resolveStrokeColor(tokens);
    final trailColor = _resolveTrailColor(tokens);
    final percent = _clampedPercent;
    final disableAnim = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Container(
            height: widget.strokeWidth,
            decoration: BoxDecoration(
              color: trailColor,
              borderRadius: BorderRadius.circular(JoyRadius.full),
            ),
            clipBehavior: Clip.antiAlias,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final barWidth = constraints.maxWidth * (percent / 100.0);
                return Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    width: barWidth,
                    height: widget.strokeWidth,
                    decoration: BoxDecoration(
                      color: strokeColor,
                      borderRadius: BorderRadius.circular(JoyRadius.full),
                    ),
                    child: (_effectiveStatus == JoyProgressStatus.active &&
                            !disableAnim)
                        ? AnimatedBuilder(
                            animation: _animController,
                            builder: (context, child) {
                              return FractionallySizedBox(
                                widthFactor: 1.0,
                                alignment: Alignment.centerLeft,
                                child: ShaderMask(
                                  shaderCallback: (bounds) {
                                    final shift = _animController.value;
                                    return LinearGradient(
                                      begin: Alignment(-2.0 + shift * 3.0, 0.0),
                                      end: Alignment(-1.0 + shift * 3.0, 0.0),
                                      colors: [
                                        strokeColor,
                                        tokens.accent.highlight,
                                        strokeColor,
                                      ],
                                    ).createShader(bounds);
                                  },
                                  blendMode: BlendMode.srcIn,
                                  child: Container(
                                    color: strokeColor,
                                  ),
                                ),
                              );
                            },
                          )
                        : null,
                  ),
                );
              },
            ),
          ),
        ),
        if (widget.showInfo) ...[
          const SizedBox(width: JoySpacing.s8),
          _buildInfo(tokens),
        ],
      ],
    );
  }

  Widget _buildCircle(BuildContext context, JoyThemeTokens tokens) {
    final strokeColor = _resolveStrokeColor(tokens);
    final trailColor = _resolveTrailColor(tokens);
    final diameter = widget.size ?? 120.0;

    return SizedBox(
      width: diameter,
      height: diameter,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(diameter, diameter),
            painter: _CircleProgressPainter(
              percent: _clampedPercent,
              strokeColor: strokeColor,
              trailColor: trailColor,
              strokeWidth: widget.strokeWidth,
            ),
          ),
          if (widget.showInfo) _buildInfo(tokens, isCircle: true),
        ],
      ),
    );
  }

  Widget _buildInfo(JoyThemeTokens tokens, {bool isCircle = false}) {
    final status = _effectiveStatus;
    final percent = _clampedPercent;

    if (status == JoyProgressStatus.success) {
      return JoyIcon.data(
        JoyIcons.check,
        size: isCircle ? JoyIconSize.lg : JoyIconSize.sm,
        color: tokens.status.success.fg,
      );
    }

    if (status == JoyProgressStatus.error) {
      return JoyIcon.data(
        JoyIcons.close,
        size: isCircle ? JoyIconSize.lg : JoyIconSize.sm,
        color: tokens.status.danger.fg,
      );
    }

    final displayText = widget.format != null
        ? widget.format!(percent)
        : '${percent.toInt()}%';

    return Text(
      displayText,
      style: TextStyle(
        fontSize: isCircle ? 18.0 : 13.0,
        fontWeight: FontWeight.w600,
        color: tokens.text.primary,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final valueNow = _clampedPercent.round();

    return Semantics(
      container: true,
      value: '$valueNow%',
      child: widget.type == JoyProgressType.line
          ? _buildLine(context, tokens)
          : _buildCircle(context, tokens),
    );
  }
}

class _CircleProgressPainter extends CustomPainter {
  final double percent;
  final Color strokeColor;
  final Color trailColor;
  final double strokeWidth;

  const _CircleProgressPainter({
    required this.percent,
    required this.strokeColor,
    required this.trailColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2.0, size.height / 2.0);
    final radius = (size.width - strokeWidth) / 2.0;

    final backgroundPaint = Paint()
      ..color = trailColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, backgroundPaint);

    if (percent > 0.0) {
      final progressPaint = Paint()
        ..color = strokeColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      final sweepAngle = 2.0 * math.pi * (percent / 100.0);
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi / 2.0,
        sweepAngle,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_CircleProgressPainter oldDelegate) {
    return oldDelegate.percent != percent ||
        oldDelegate.strokeColor != strokeColor ||
        oldDelegate.trailColor != trailColor ||
        oldDelegate.strokeWidth != strokeWidth;
  }
}
