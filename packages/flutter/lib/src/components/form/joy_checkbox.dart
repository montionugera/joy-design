import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Custom painter for crisp vector checkmark and indeterminate dash.
/// Strictly enforces zero color literals by drawing with token colors passed from caller.
class _JoyCheckboxPainter extends CustomPainter {
  final bool? value;
  final Color checkmarkColor;

  const _JoyCheckboxPainter({
    required this.value,
    required this.checkmarkColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (value == null) {
      // Indeterminate dash
      final paint = Paint()
        ..color = checkmarkColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0
        ..strokeCap = StrokeCap.round;
      final y = size.height / 2;
      canvas.drawLine(
        Offset(size.width * 0.25, y),
        Offset(size.width * 0.75, y),
        paint,
      );
    } else if (value == true) {
      // Vector checkmark
      final paint = Paint()
        ..color = checkmarkColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;
      final path = Path();
      path.moveTo(size.width * 0.22, size.height * 0.52);
      path.lineTo(size.width * 0.42, size.height * 0.72);
      path.lineTo(size.width * 0.78, size.height * 0.28);
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(_JoyCheckboxPainter oldDelegate) =>
      oldDelegate.value != value || oldDelegate.checkmarkColor != checkmarkColor;
}

/// Joymify Checkbox component.
///
/// Supports tri-state selection (true, false, null/indeterminate), accessible semantics,
/// mandatory 44x44 coarse pointer hit-target floor, and pure token styling.
class JoyCheckbox extends StatefulWidget {
  final bool? value;
  final ValueChanged<bool?>? onChanged;
  final Widget? label;
  final String? labelText;
  final bool disabled;
  final bool autofocus;
  final FocusNode? focusNode;
  final String? semanticLabel;

  const JoyCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
    this.label,
    this.labelText,
    this.disabled = false,
    this.autofocus = false,
    this.focusNode,
    this.semanticLabel,
  });

  @override
  State<JoyCheckbox> createState() => _JoyCheckboxState();
}

class _JoyCheckboxState extends State<JoyCheckbox> {
  FocusNode? _internalFocusNode;
  bool _isHovered = false;
  bool _isFocused = false;

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  bool get _isInteractive => !widget.disabled && widget.onChanged != null;

  @override
  void initState() {
    super.initState();
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(JoyCheckbox oldWidget) {
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

  void _handleTap() {
    if (!_isInteractive) return;

    final bool? nextValue;
    if (widget.value == true) {
      nextValue = false;
    } else if (widget.value == false) {
      nextValue = true;
    } else {
      // Indeterminate toggles to true
      nextValue = true;
    }

    widget.onChanged?.call(nextValue);
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final isCheckedOrIndeterminate = widget.value != false;

    // Resolve token colors
    final Color backgroundColor;
    final Color borderColor;
    final Color checkmarkColor;

    if (widget.disabled) {
      backgroundColor = tokens.surface.disabled;
      borderColor = tokens.border.disabled;
      checkmarkColor = tokens.text.disabled;
    } else if (isCheckedOrIndeterminate) {
      backgroundColor = tokens.accent.base;
      borderColor = _isFocused ? tokens.focusRing.color : tokens.accent.base;
      checkmarkColor = tokens.text.onAccent;
    } else {
      backgroundColor = tokens.surface.card;
      borderColor = _isFocused
          ? tokens.focusRing.color
          : (_isHovered ? tokens.border.strong : tokens.border.base);
      checkmarkColor = tokens.text.disabled;
    }

    final double borderWidth = _isFocused ? 1.5 : 1.0;

    return Semantics(
      label: widget.semanticLabel ?? widget.labelText,
      checked: widget.value == true,
      enabled: _isInteractive,
      child: MouseRegion(
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
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _handleTap,
          child: Focus(
            focusNode: _effectiveFocusNode,
            autofocus: widget.autofocus,
            onKeyEvent: (_, event) {
              return KeyEventResult.ignored;
            },
            child: ConstrainedBox(
              // Enforces mandatory 44x44px coarse hit-target bounds
              constraints: const BoxConstraints(
                minWidth: 44.0,
                minHeight: 44.0,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 18.0,
                    height: 18.0,
                    decoration: BoxDecoration(
                      color: backgroundColor,
                      borderRadius: const BorderRadius.all(Radius.circular(JoyRadius.sm)),
                      border: Border.all(
                        color: borderColor,
                        width: borderWidth,
                      ),
                    ),
                    child: isCheckedOrIndeterminate
                        ? CustomPaint(
                            painter: _JoyCheckboxPainter(
                              value: widget.value,
                              checkmarkColor: checkmarkColor,
                            ),
                          )
                        : null,
                  ),
                  if (widget.label != null || widget.labelText != null) ...[
                    const SizedBox(width: JoySpacing.s8),
                    widget.label ??
                        Text(
                          widget.labelText!,
                          style: TextStyle(
                            color: widget.disabled
                                ? tokens.text.disabled
                                : tokens.text.primary,
                            fontSize: 14.0,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
