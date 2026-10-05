import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';

/// Pure vector painter for star glyphs in [JoyRate].
/// Strictly enforces Zero Emoji Policy with 100% scalable vector geometry.
class _JoyStarPainter extends CustomPainter {
  final double fillPercent; // 0.0, 0.5, or 1.0
  final Color activeColor;
  final Color inactiveColor;

  const _JoyStarPainter({
    required this.fillPercent,
    required this.activeColor,
    required this.inactiveColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Standard 5-pointed star normalized coordinates
    final points = [
      Offset(w * 0.50, h * 0.05),
      Offset(w * 0.63, h * 0.35),
      Offset(w * 0.95, h * 0.39),
      Offset(w * 0.72, h * 0.61),
      Offset(w * 0.78, h * 0.93),
      Offset(w * 0.50, h * 0.77),
      Offset(w * 0.22, h * 0.93),
      Offset(w * 0.28, h * 0.61),
      Offset(w * 0.05, h * 0.39),
      Offset(w * 0.37, h * 0.35),
    ];

    final starPath = Path()..addPolygon(points, true);

    // 1. Draw inactive background star
    final inactivePaint = Paint()
      ..color = inactiveColor
      ..style = PaintingStyle.fill;
    canvas.drawPath(starPath, inactivePaint);

    // 2. Draw active portion (full or half)
    if (fillPercent > 0.0) {
      canvas.save();
      final clipWidth = w * fillPercent;
      canvas.clipRect(Rect.fromLTWH(0, 0, clipWidth, h));
      final activePaint = Paint()
        ..color = activeColor
        ..style = PaintingStyle.fill;
      canvas.drawPath(starPath, activePaint);
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_JoyStarPainter oldDelegate) =>
      oldDelegate.fillPercent != fillPercent ||
      oldDelegate.activeColor != activeColor ||
      oldDelegate.inactiveColor != inactiveColor;
}

/// Joymify Rate / Star Rating component.
///
/// Implements full design-token parity, zero color literals, Zero Emoji Policy
/// (crisp vector SVG star paths), half-star rating support, accessible semantics,
/// and mandatory 44x44px minimum hit bounds per star.
class JoyRate extends StatefulWidget {
  final double value;
  final ValueChanged<double>? onChanged;
  final int count;
  final bool allowHalf;
  final bool disabled;
  final bool readOnly;
  final double size;
  final bool autofocus;
  final FocusNode? focusNode;
  final String? semanticLabel;

  const JoyRate({
    super.key,
    required this.value,
    this.onChanged,
    this.count = 5,
    this.allowHalf = false,
    this.disabled = false,
    this.readOnly = false,
    this.size = 24.0,
    this.autofocus = false,
    this.focusNode,
    this.semanticLabel,
  }) : assert(count > 0, 'count must be positive');

  @override
  State<JoyRate> createState() => _JoyRateState();
}

class _JoyRateState extends State<JoyRate> {
  FocusNode? _internalFocusNode;
  double? _hoverValue;
  bool _isFocused = false;

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  bool get _isInteractive =>
      !widget.disabled && !widget.readOnly && widget.onChanged != null;

  @override
  void initState() {
    super.initState();
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(JoyRate oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.focusNode != oldWidget.focusNode) {
      oldWidget.focusNode?.removeListener(_handleFocusChange);
      widget.focusNode?.addListener(_handleFocusChange);
    }
  }

  @override
  void dispose() {
    _effectiveFocusNode.removeListener(_handleFocusChange);
    _internalFocusNode?.dispose();
    super.dispose();
  }

  void _handleFocusChange() {
    if (_isFocused != _effectiveFocusNode.hasFocus) {
      setState(() {
        _isFocused = _effectiveFocusNode.hasFocus;
      });
    }
  }

  void _handleStarTap(int starIndex, double localX, double starBoxWidth) {
    if (!_isInteractive) return;
    _effectiveFocusNode.requestFocus();

    final double nextVal;
    if (widget.allowHalf) {
      final isHalf = localX < (starBoxWidth / 2.0);
      nextVal = isHalf ? (starIndex - 0.5) : starIndex.toDouble();
    } else {
      nextVal = starIndex.toDouble();
    }

    widget.onChanged?.call(nextVal);
  }

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (!_isInteractive) return KeyEventResult.ignored;

    if (event is KeyDownEvent || event is KeyRepeatEvent) {
      final step = widget.allowHalf ? 0.5 : 1.0;
      double? nextVal;

      if (event.logicalKey == LogicalKeyboardKey.arrowRight ||
          event.logicalKey == LogicalKeyboardKey.arrowUp) {
        nextVal = (widget.value + step).clamp(0.0, widget.count.toDouble());
      } else if (event.logicalKey == LogicalKeyboardKey.arrowLeft ||
          event.logicalKey == LogicalKeyboardKey.arrowDown) {
        nextVal = (widget.value - step).clamp(0.0, widget.count.toDouble());
      } else if (event.logicalKey == LogicalKeyboardKey.home) {
        nextVal = 0.0;
      } else if (event.logicalKey == LogicalKeyboardKey.end) {
        nextVal = widget.count.toDouble();
      }

      if (nextVal != null) {
        widget.onChanged?.call(nextVal);
        return KeyEventResult.handled;
      }
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final activeValue = _hoverValue ?? widget.value;

    // Token colors
    final Color activeColor;
    final Color inactiveColor;

    if (widget.disabled) {
      activeColor = tokens.text.disabled;
      inactiveColor = tokens.surface.disabled;
    } else {
      activeColor = tokens.accent.base;
      inactiveColor = tokens.border.strong;
    }

    return Semantics(
      label: widget.semanticLabel ?? 'Rating: ${widget.value} of ${widget.count}',
      value: widget.value.toString(),
      enabled: _isInteractive,
      child: Focus(
        focusNode: _effectiveFocusNode,
        autofocus: widget.autofocus,
        onKeyEvent: _handleKeyEvent,
        child: Container(
          decoration: _isFocused
              ? BoxDecoration(
                  borderRadius: BorderRadius.circular(JoyRadius.control),
                  border: Border.all(
                    color: tokens.focusRing.color,
                    width: 1.5,
                  ),
                )
              : null,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(widget.count, (index) {
              final starIndex = index + 1;
              final double fillPercent;

              if (activeValue >= starIndex) {
                fillPercent = 1.0;
              } else if (widget.allowHalf && activeValue >= starIndex - 0.5) {
                fillPercent = 0.5;
              } else {
                fillPercent = 0.0;
              }

              return MouseRegion(
                cursor: _isInteractive
                    ? SystemMouseCursors.click
                    : SystemMouseCursors.basic,
                onEnter: (_) {
                  if (_isInteractive) {
                    setState(() => _hoverValue = starIndex.toDouble());
                  }
                },
                onExit: (_) {
                  if (_isInteractive) {
                    setState(() => _hoverValue = null);
                  }
                },
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTapDown: (details) {
                    _handleStarTap(
                      starIndex,
                      details.localPosition.dx,
                      44.0,
                    );
                  },
                  child: ConstrainedBox(
                    // Mandatory 44x44px minimum hit bounds per star
                    constraints: const BoxConstraints(
                      minWidth: 44.0,
                      minHeight: 44.0,
                    ),
                    child: Center(
                      child: SizedBox(
                        width: widget.size,
                        height: widget.size,
                        child: CustomPaint(
                          painter: _JoyStarPainter(
                            fillPercent: fillPercent,
                            activeColor: activeColor,
                            inactiveColor: inactiveColor,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
