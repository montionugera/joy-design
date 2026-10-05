import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';

/// Joymify Slider component.
///
/// Implements full design-token parity, zero color literals, continuous & stepped value tracking,
/// accessible semantics, keyboard controls, and mandatory 44x44px minimum hit bounds on coarse pointers.
class JoySlider extends StatefulWidget {
  final double value;
  final ValueChanged<double>? onChanged;
  final double min;
  final double max;
  final double? step;
  final bool disabled;
  final String? label;
  final String? semanticLabel;
  final bool showTooltip;
  final bool autofocus;
  final FocusNode? focusNode;

  const JoySlider({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0.0,
    this.max = 100.0,
    this.step,
    this.disabled = false,
    this.label,
    this.semanticLabel,
    this.showTooltip = false,
    this.autofocus = false,
    this.focusNode,
  }) : assert(max > min, 'max must be strictly greater than min');

  @override
  State<JoySlider> createState() => _JoySliderState();
}

class _JoySliderState extends State<JoySlider> {
  FocusNode? _internalFocusNode;
  bool _isHovered = false;
  bool _isFocused = false;
  bool _isDragging = false;

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  bool get _isInteractive => !widget.disabled && widget.onChanged != null;

  @override
  void initState() {
    super.initState();
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(JoySlider oldWidget) {
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

  double _clampAndStep(double raw) {
    var clamped = raw.clamp(widget.min, widget.max);
    if (widget.step != null && widget.step! > 0) {
      final steps = ((clamped - widget.min) / widget.step!).round();
      clamped = widget.min + (steps * widget.step!);
      clamped = clamped.clamp(widget.min, widget.max);
    }
    return clamped;
  }

  void _updateValueFromPosition(double localX, double totalWidth) {
    if (!_isInteractive || totalWidth <= 0) return;
    final ratio = (localX / totalWidth).clamp(0.0, 1.0);
    final raw = widget.min + (ratio * (widget.max - widget.min));
    final next = _clampAndStep(raw);
    widget.onChanged?.call(next);
  }

  double get _effectiveStep =>
      widget.step ?? ((widget.max - widget.min) / 100.0).clamp(0.1, 1.0);

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (!_isInteractive) return KeyEventResult.ignored;

    if (event is KeyDownEvent || event is KeyRepeatEvent) {
      final largeStep = _effectiveStep * 10.0;
      double? nextVal;

      if (event.logicalKey == LogicalKeyboardKey.arrowRight ||
          event.logicalKey == LogicalKeyboardKey.arrowUp) {
        nextVal = (widget.value + _effectiveStep).clamp(widget.min, widget.max);
      } else if (event.logicalKey == LogicalKeyboardKey.arrowLeft ||
          event.logicalKey == LogicalKeyboardKey.arrowDown) {
        nextVal = (widget.value - _effectiveStep).clamp(widget.min, widget.max);
      } else if (event.logicalKey == LogicalKeyboardKey.pageUp) {
        nextVal = (widget.value + largeStep).clamp(widget.min, widget.max);
      } else if (event.logicalKey == LogicalKeyboardKey.pageDown) {
        nextVal = (widget.value - largeStep).clamp(widget.min, widget.max);
      } else if (event.logicalKey == LogicalKeyboardKey.home) {
        nextVal = widget.min;
      } else if (event.logicalKey == LogicalKeyboardKey.end) {
        nextVal = widget.max;
      }

      if (nextVal != null) {
        widget.onChanged?.call(_clampAndStep(nextVal));
        return KeyEventResult.handled;
      }
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final clampedValue = widget.value.clamp(widget.min, widget.max);
    final ratio = (clampedValue - widget.min) / (widget.max - widget.min);

    // Token colors
    final Color activeTrackColor;
    final Color inactiveTrackColor;
    final Color thumbFillColor;
    final Color thumbBorderColor;

    if (widget.disabled) {
      activeTrackColor = tokens.surface.disabled;
      inactiveTrackColor = tokens.border.subtle;
      thumbFillColor = tokens.surface.card;
      thumbBorderColor = tokens.border.disabled;
    } else {
      activeTrackColor = _isDragging ? tokens.accent.active : tokens.accent.base;
      inactiveTrackColor = tokens.border.subtle;
      thumbFillColor = tokens.surface.card;
      thumbBorderColor = _isFocused ? tokens.focusRing.color : tokens.accent.base;
    }

    const thumbDiameter = 20.0;
    const trackHeight = 4.0;

    return Semantics(
      label: widget.semanticLabel ?? widget.label,
      value: widget.value.toStringAsFixed(widget.step != null && widget.step! < 1 ? 2 : 0),
      enabled: _isInteractive,
      slider: true,
      child: MouseRegion(
        cursor: _isInteractive
            ? SystemMouseCursors.click
            : SystemMouseCursors.forbidden,
        onEnter: (_) {
          if (_isInteractive && !_isHovered) {
            setState(() => _isHovered = true);
          }
        },
        onExit: (_) {
          if (_isHovered) {
            setState(() => _isHovered = false);
          }
        },
        child: Focus(
          focusNode: _effectiveFocusNode,
          autofocus: widget.autofocus,
          onKeyEvent: _handleKeyEvent,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final width = constraints.maxWidth;
              final effectiveTrackWidth = (width - thumbDiameter).clamp(0.0, double.infinity);
              final thumbLeft = (effectiveTrackWidth * ratio);

              return GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTapDown: (details) {
                  if (!_isInteractive) return;
                  _effectiveFocusNode.requestFocus();
                  final localX = details.localPosition.dx - (thumbDiameter / 2);
                  _updateValueFromPosition(localX, effectiveTrackWidth);
                },
                onPanStart: (details) {
                  if (!_isInteractive) return;
                  _effectiveFocusNode.requestFocus();
                  setState(() => _isDragging = true);
                  final localX = details.localPosition.dx - (thumbDiameter / 2);
                  _updateValueFromPosition(localX, effectiveTrackWidth);
                },
                onPanUpdate: (details) {
                  if (!_isInteractive) return;
                  final localX = details.localPosition.dx - (thumbDiameter / 2);
                  _updateValueFromPosition(localX, effectiveTrackWidth);
                },
                onPanEnd: (_) {
                  if (_isDragging) {
                    setState(() => _isDragging = false);
                  }
                },
                onPanCancel: () {
                  if (_isDragging) {
                    setState(() => _isDragging = false);
                  }
                },
                child: ConstrainedBox(
                  // Mandatory 44px hit bounds on coarse pointers
                  constraints: const BoxConstraints(
                    minHeight: 44.0,
                    minWidth: 44.0,
                  ),
                  child: Stack(
                    alignment: Alignment.centerLeft,
                    clipBehavior: Clip.none,
                    children: [
                      // Rail & Track
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: thumbDiameter / 2,
                        ),
                        child: Container(
                          height: trackHeight,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: inactiveTrackColor,
                            borderRadius: BorderRadius.circular(JoyRadius.pill),
                          ),
                          alignment: Alignment.centerLeft,
                          child: FractionallySizedBox(
                            widthFactor: ratio.clamp(0.0, 1.0),
                            child: Container(
                              height: trackHeight,
                              decoration: BoxDecoration(
                                color: activeTrackColor,
                                borderRadius: BorderRadius.circular(JoyRadius.pill),
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Thumb with elevation and focus ring
                      Positioned(
                        left: thumbLeft,
                        child: Container(
                          width: thumbDiameter,
                          height: thumbDiameter,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: thumbFillColor,
                            border: Border.all(
                              color: thumbBorderColor,
                              width: _isFocused ? 2.5 : 2.0,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: tokens.border.subtle,
                                blurRadius: 4.0,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
