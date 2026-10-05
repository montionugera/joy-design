import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// A skeleton placeholder preview widget simulating content layout during loading.
///
/// Supports line, avatar, and button shapes, as well as an animated shimmer effect.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoySkeleton extends StatefulWidget {
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  final BoxShape shape;
  final bool active;
  final int lines;

  const JoySkeleton({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
    this.shape = BoxShape.rectangle,
    this.active = true,
  }) : lines = 1;

  /// Line skeleton placeholder variant.
  ///
  /// When [lines] > 1, renders [lines] rows with the final row shortened to 70%.
  const JoySkeleton.line({
    super.key,
    this.width,
    this.height = 16.0,
    this.borderRadius,
    this.active = true,
    this.lines = 1,
  }) : shape = BoxShape.rectangle;

  /// Circular avatar skeleton placeholder variant.
  const JoySkeleton.avatar({
    super.key,
    double size = 40.0,
    this.active = true,
  })  : width = size,
        height = size,
        borderRadius = null,
        shape = BoxShape.circle,
        lines = 1;

  /// Action button skeleton placeholder variant.
  const JoySkeleton.button({
    super.key,
    this.width = 80.0,
    this.height = 36.0,
    double radius = JoyRadius.control,
    this.active = true,
  })  : borderRadius = const BorderRadius.all(Radius.circular(JoyRadius.control)),
        shape = BoxShape.rectangle,
        lines = 1;

  @override
  State<JoySkeleton> createState() => _JoySkeletonState();
}

class _JoySkeletonState extends State<JoySkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _shimmerController;

  @override
  void initState() {
    super.initState();
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    if (widget.active) {
      _shimmerController.repeat();
    }
  }

  @override
  void didUpdateWidget(JoySkeleton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active) {
      if (!_shimmerController.isAnimating) {
        _shimmerController.repeat();
      }
    } else {
      if (_shimmerController.isAnimating) {
        _shimmerController.stop();
      }
    }
  }

  @override
  void dispose() {
    _shimmerController.dispose();
    super.dispose();
  }

  Widget _buildShimmerBlock({
    required double? width,
    required double? height,
    required BorderRadius? borderRadius,
    required BoxShape shape,
    required JoyThemeTokens tokens,
    required bool disableAnim,
  }) {
    final baseColor = tokens.surface.sunken;
    final highlightColor = tokens.surface.card;

    final effectiveRadius = shape == BoxShape.circle
        ? null
        : (borderRadius ?? BorderRadius.circular(JoyRadius.sm));

    if (!widget.active || disableAnim) {
      return Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: baseColor,
          borderRadius: effectiveRadius,
          shape: shape,
        ),
      );
    }

    return AnimatedBuilder(
      animation: _shimmerController,
      builder: (context, child) {
        final progress = _shimmerController.value;
        return Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            borderRadius: effectiveRadius,
            shape: shape,
            gradient: LinearGradient(
              begin: Alignment(-2.0 + progress * 4.0, -0.3),
              end: Alignment(-1.0 + progress * 4.0, 0.3),
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final disableAnim = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    if (widget.lines > 1) {
      return Semantics(
        container: true,
        label: 'Loading placeholder',
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: List.generate(widget.lines, (index) {
            final isLast = index == widget.lines - 1;
            final double? lineWidth = isLast
                ? (widget.width != null ? widget.width! * 0.7 : null)
                : widget.width;

            final item = _buildShimmerBlock(
              width: lineWidth,
              height: widget.height,
              borderRadius: widget.borderRadius,
              shape: widget.shape,
              tokens: tokens,
              disableAnim: disableAnim,
            );

            return Padding(
              padding: EdgeInsets.only(
                bottom: isLast ? 0.0 : JoySpacing.s8,
              ),
              child: isLast && widget.width == null
                  ? FractionallySizedBox(
                      widthFactor: 0.7,
                      alignment: Alignment.centerLeft,
                      child: item,
                    )
                  : item,
            );
          }),
        ),
      );
    }

    return Semantics(
      container: true,
      label: 'Loading placeholder',
      child: _buildShimmerBlock(
        width: widget.width,
        height: widget.height,
        borderRadius: widget.borderRadius,
        shape: widget.shape,
        tokens: tokens,
        disableAnim: disableAnim,
      ),
    );
  }
}
