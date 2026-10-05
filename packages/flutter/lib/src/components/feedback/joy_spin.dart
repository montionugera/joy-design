import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Predefined sizes for [JoySpin].
enum JoySpinSize {
  sm(16.0, 2.0),
  md(24.0, 2.5),
  lg(32.0, 3.0);

  final double pixels;
  final double strokeWidth;
  const JoySpinSize(this.pixels, this.strokeWidth);
}

/// A spinning loading indicator widget for asynchronous operations.
///
/// Can render standalone or wrap a [child] widget to show a loading overlay mask.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoySpin extends StatefulWidget {
  final bool spinning;
  final JoySpinSize size;
  final String? tip;
  final Widget? child;
  final Color? color;

  const JoySpin({
    super.key,
    this.spinning = true,
    this.size = JoySpinSize.md,
    this.tip,
    this.child,
    this.color,
  });

  @override
  State<JoySpin> createState() => _JoySpinState();
}

class _JoySpinState extends State<JoySpin> with SingleTickerProviderStateMixin {
  late final AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    if (widget.spinning) {
      _rotationController.repeat();
    }
  }

  @override
  void didUpdateWidget(JoySpin oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.spinning) {
      if (!_rotationController.isAnimating) {
        _rotationController.repeat();
      }
    } else {
      if (_rotationController.isAnimating) {
        _rotationController.stop();
      }
    }
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  Widget _buildIndicator(Color color, bool disableAnim) {
    final size = widget.size.pixels;
    final strokeWidth = widget.size.strokeWidth;

    final Widget arc = CustomPaint(
      size: Size(size, size),
      painter: _SpinArcPainter(
        color: color,
        strokeWidth: strokeWidth,
      ),
    );

    final Widget spinner = disableAnim
        ? arc
        : AnimatedBuilder(
            animation: _rotationController,
            builder: (context, child) {
              return Transform.rotate(
                angle: _rotationController.value * 2.0 * math.pi,
                child: arc,
              );
            },
          );

    if (widget.tip == null) {
      return spinner;
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        spinner,
        const SizedBox(height: JoySpacing.s8),
        Text(
          widget.tip!,
          style: TextStyle(
            color: color,
            fontSize: widget.size == JoySpinSize.sm ? 12.0 : 14.0,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final effectiveColor = widget.color ?? tokens.accent.base;
    final disableAnim = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    if (widget.child == null) {
      if (!widget.spinning) return const SizedBox.shrink();

      return Semantics(
        container: true,
        liveRegion: true,
        label: widget.tip ?? 'Loading',
        child: Center(
          child: _buildIndicator(effectiveColor, disableAnim),
        ),
      );
    }

    // Overlay mask variant wrapping child
    return Stack(
      children: [
        widget.child!,
        if (widget.spinning)
          Positioned.fill(
            child: Semantics(
              container: true,
              liveRegion: true,
              label: widget.tip ?? 'Loading',
              child: Container(
                decoration: BoxDecoration(
                  color: Color.fromARGB(
                    178, // ~70% mask
                    (tokens.surface.card.r * 255.0).round() & 0xff,
                    (tokens.surface.card.g * 255.0).round() & 0xff,
                    (tokens.surface.card.b * 255.0).round() & 0xff,
                  ),
                ),
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Padding(
                      padding: const EdgeInsets.all(JoySpacing.s4),
                      child: _buildIndicator(effectiveColor, disableAnim),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _SpinArcPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;

  const _SpinArcPainter({
    required this.color,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2.0, size.height / 2.0);
    final radius = (size.width - strokeWidth) / 2.0;

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    // Draw ~270 degree arc leaving an opening
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      0.0,
      1.5 * math.pi,
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(_SpinArcPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.strokeWidth != strokeWidth;
  }
}
