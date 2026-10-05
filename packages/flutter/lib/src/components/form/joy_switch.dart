import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';

/// Predefined sizes for [JoySwitch].
enum JoySwitchSize {
  sm,
  md,
}

/// Joymify Switch / Toggle component.
///
/// Implements full design-token parity, zero color literals, animated sliding pill thumb,
/// optional loading state, accessible semantics, and mandatory 44x44px coarse hit-target bounds.
class JoySwitch extends StatefulWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;
  final bool disabled;
  final bool loading;
  final JoySwitchSize size;
  final Widget? label;
  final String? labelText;
  final bool autofocus;
  final FocusNode? focusNode;
  final String? semanticLabel;

  const JoySwitch({
    super.key,
    required this.value,
    required this.onChanged,
    this.disabled = false,
    this.loading = false,
    this.size = JoySwitchSize.md,
    this.label,
    this.labelText,
    this.autofocus = false,
    this.focusNode,
    this.semanticLabel,
  });

  @override
  State<JoySwitch> createState() => _JoySwitchState();
}

class _JoySwitchState extends State<JoySwitch> {
  FocusNode? _internalFocusNode;
  bool _isHovered = false;
  bool _isFocused = false;

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  bool get _isInteractive =>
      !widget.disabled && !widget.loading && widget.onChanged != null;

  @override
  void initState() {
    super.initState();
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(JoySwitch oldWidget) {
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
    widget.onChanged?.call(!widget.value);
  }

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (!_isInteractive) return KeyEventResult.ignored;
    if (event is KeyDownEvent) {
      if (event.logicalKey == LogicalKeyboardKey.space ||
          event.logicalKey == LogicalKeyboardKey.enter) {
        _handleTap();
        return KeyEventResult.handled;
      }
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final isSm = widget.size == JoySwitchSize.sm;

    // Track dimensions
    final trackWidth = isSm ? 36.0 : 44.0;
    final trackHeight = isSm ? 20.0 : 24.0;
    final thumbSize = isSm ? 16.0 : 20.0;
    const padding = 2.0;
    final maxThumbOffset = trackWidth - thumbSize - (padding * 2);

    // Token colors
    final Color trackColor;
    final Color borderColor;
    final Color thumbColor;

    if (widget.disabled) {
      trackColor = widget.value ? tokens.accent.subtle : tokens.surface.disabled;
      borderColor = tokens.border.disabled;
      thumbColor = tokens.surface.card;
    } else if (widget.value) {
      trackColor = _isHovered ? tokens.accent.hover : tokens.accent.base;
      borderColor = _isFocused ? tokens.focusRing.color : trackColor;
      thumbColor = tokens.surface.card;
    } else {
      trackColor = _isHovered ? tokens.surface.sunken : tokens.surface.sunken;
      borderColor = _isFocused
          ? tokens.focusRing.color
          : (_isHovered ? tokens.border.strong : tokens.border.base);
      thumbColor = tokens.surface.card;
    }

    final spinnerColor = widget.value ? tokens.accent.base : tokens.text.secondary;

    return Semantics(
      label: widget.semanticLabel ?? widget.labelText,
      enabled: _isInteractive,
      toggled: widget.value,
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
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _handleTap,
          child: Focus(
            focusNode: _effectiveFocusNode,
            autofocus: widget.autofocus,
            onKeyEvent: _handleKeyEvent,
            child: ConstrainedBox(
              // Enforces mandatory 44x44px minimum hit bounds on coarse pointers
              constraints: const BoxConstraints(
                minWidth: 44.0,
                minHeight: 44.0,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeInOut,
                    width: trackWidth,
                    height: trackHeight,
                    padding: const EdgeInsets.all(padding),
                    decoration: BoxDecoration(
                      color: trackColor,
                      borderRadius: BorderRadius.circular(JoyRadius.pill),
                      border: Border.all(
                        color: borderColor,
                        width: _isFocused ? 1.5 : 1.0,
                      ),
                    ),
                    child: Stack(
                      children: [
                        AnimatedPositioned(
                          duration: const Duration(milliseconds: 200),
                          curve: Curves.easeInOut,
                          left: widget.value ? maxThumbOffset : 0.0,
                          top: 0.0,
                          child: Container(
                            width: thumbSize,
                            height: thumbSize,
                            decoration: BoxDecoration(
                              color: thumbColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: tokens.border.subtle,
                                  blurRadius: 2.0,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                            child: widget.loading
                                ? Center(
                                    child: SizedBox(
                                      width: thumbSize - 6.0,
                                      height: thumbSize - 6.0,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 1.5,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          spinnerColor,
                                        ),
                                      ),
                                    ),
                                  )
                                : null,
                          ),
                        ),
                      ],
                    ),
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
                            fontSize: isSm ? 12.0 : 14.0,
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
