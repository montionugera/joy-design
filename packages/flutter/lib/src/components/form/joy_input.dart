import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Available size variants for [JoyInput].
enum JoyInputSize {
  sm(height: 32.0, baseFontSize: 13.0, horizontalPadding: JoySpacing.s8, iconSize: 14.0),
  md(height: 40.0, baseFontSize: 14.0, horizontalPadding: JoySpacing.s12, iconSize: 16.0),
  lg(height: 48.0, baseFontSize: 16.0, horizontalPadding: JoySpacing.s16, iconSize: 18.0);

  final double height;
  final double baseFontSize;
  final double horizontalPadding;
  final double iconSize;

  const JoyInputSize({
    required this.height,
    required this.baseFontSize,
    required this.horizontalPadding,
    required this.iconSize,
  });
}

/// Validation status variants for [JoyInput].
enum JoyInputStatus {
  defaultStatus,
  error,
  warning,
  success;

  bool get isError => this == JoyInputStatus.error;
  bool get isWarning => this == JoyInputStatus.warning;
  bool get isSuccess => this == JoyInputStatus.success;
}

/// Joymify single-line text input field.
///
/// Implements full design-token parity, zero color literals, mobile zoom prevention
/// (enforcing a minimum 16px font size on mobile viewports), status borders,
/// optional prefix/suffix widgets or text, and optional clearable button.
class JoyInput extends StatefulWidget {
  final TextEditingController? controller;
  final String? initialValue;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final String? placeholder;
  final bool disabled;
  final bool readOnly;
  final bool obscureText;
  final bool clearable;
  final JoyInputSize size;
  final JoyInputStatus status;
  final Widget? prefix;
  final Widget? suffix;
  final String? prefixText;
  final String? suffixText;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;
  final bool autofocus;
  final int? maxLines;
  final String? semanticLabel;
  final bool? isMobile;

  const JoyInput({
    super.key,
    this.controller,
    this.initialValue,
    this.onChanged,
    this.onSubmitted,
    this.placeholder,
    this.disabled = false,
    this.readOnly = false,
    this.obscureText = false,
    this.clearable = false,
    this.size = JoyInputSize.md,
    this.status = JoyInputStatus.defaultStatus,
    this.prefix,
    this.suffix,
    this.prefixText,
    this.suffixText,
    this.keyboardType,
    this.textInputAction,
    this.focusNode,
    this.autofocus = false,
    this.maxLines = 1,
    this.semanticLabel,
    this.isMobile,
  });

  @override
  State<JoyInput> createState() => _JoyInputState();
}

class _JoyInputState extends State<JoyInput> {
  TextEditingController? _internalController;
  FocusNode? _internalFocusNode;
  bool _isHovered = false;
  bool _isFocused = false;

  TextEditingController get _effectiveController =>
      widget.controller ?? (_internalController ??= TextEditingController(text: widget.initialValue ?? ''));

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  @override
  void initState() {
    super.initState();
    if (widget.controller == null && widget.initialValue != null) {
      _effectiveController.text = widget.initialValue!;
    }
    _effectiveFocusNode.addListener(_handleFocusChange);
    _effectiveController.addListener(_handleTextChange);
  }

  @override
  void didUpdateWidget(JoyInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      oldWidget.controller?.removeListener(_handleTextChange);
      widget.controller?.addListener(_handleTextChange);
    }
    if (widget.focusNode != oldWidget.focusNode) {
      oldWidget.focusNode?.removeListener(_handleFocusChange);
      widget.focusNode?.addListener(_handleFocusChange);
    }
    if (widget.controller == null &&
        oldWidget.initialValue != widget.initialValue &&
        widget.initialValue != null) {
      _effectiveController.text = widget.initialValue!;
    }
  }

  @override
  void dispose() {
    _effectiveFocusNode.removeListener(_handleFocusChange);
    _effectiveController.removeListener(_handleTextChange);
    _internalController?.dispose();
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

  void _handleTextChange() {
    if (mounted) {
      setState(() {});
    }
  }

  void _handleClear() {
    _effectiveController.clear();
    widget.onChanged?.call('');
    setState(() {});
  }

  bool _isMobileViewport(BuildContext context) {
    if (widget.isMobile != null) {
      return widget.isMobile!;
    }
    final mediaQuery = MediaQuery.maybeOf(context);
    if (mediaQuery != null) {
      return mediaQuery.size.width < 768.0;
    }
    return defaultTargetPlatform == TargetPlatform.iOS ||
        defaultTargetPlatform == TargetPlatform.android;
  }

  double _resolveFontSize(BuildContext context) {
    final base = widget.size.baseFontSize;
    final isMobile = _isMobileViewport(context);
    return isMobile ? math.max(16.0, base) : base;
  }

  Color _resolveBorderColor(JoyThemeTokens tokens) {
    if (widget.disabled) {
      return tokens.border.disabled;
    }
    switch (widget.status) {
      case JoyInputStatus.error:
        return _isFocused ? tokens.status.danger.fg : tokens.status.danger.border;
      case JoyInputStatus.warning:
        return _isFocused ? tokens.status.warning.fg : tokens.status.warning.border;
      case JoyInputStatus.success:
        return _isFocused ? tokens.status.success.fg : tokens.status.success.border;
      case JoyInputStatus.defaultStatus:
        if (_isFocused) {
          return tokens.focusRing.color;
        }
        if (_isHovered) {
          return tokens.border.strong;
        }
        return tokens.border.base;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final fontSize = _resolveFontSize(context);
    final borderColor = _resolveBorderColor(tokens);
    final hasText = _effectiveController.text.isNotEmpty;
    final showClear = widget.clearable && !widget.disabled && !widget.readOnly && hasText;

    final backgroundColor = widget.disabled ? tokens.surface.disabled : tokens.surface.card;
    final textColor = widget.disabled ? tokens.text.disabled : tokens.text.primary;
    final placeholderColor = tokens.text.muted;
    final double borderWidth = _isFocused ? 1.5 : 1.0;

    return Semantics(
      label: widget.semanticLabel,
      enabled: !widget.disabled,
      readOnly: widget.readOnly,
      textField: true,
      child: MouseRegion(
        onEnter: (_) {
          if (!widget.disabled && !_isHovered) {
            setState(() => _isHovered = true);
          }
        },
        onExit: (_) {
          if (_isHovered) {
            setState(() => _isHovered = false);
          }
        },
        child: Container(
          height: widget.size.height,
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: const BorderRadius.all(Radius.circular(JoyRadius.control)),
            border: Border.all(
              color: borderColor,
              width: borderWidth,
            ),
          ),
          padding: EdgeInsets.symmetric(horizontal: widget.size.horizontalPadding),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (widget.prefix != null) ...[
                widget.prefix!,
                const SizedBox(width: JoySpacing.s8),
              ],
              if (widget.prefixText != null) ...[
                Text(
                  widget.prefixText!,
                  style: TextStyle(
                    color: tokens.text.secondary,
                    fontSize: fontSize,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(width: JoySpacing.s8),
              ],
              Expanded(
                child: TextField(
                  controller: _effectiveController,
                  focusNode: _effectiveFocusNode,
                  enabled: !widget.disabled,
                  readOnly: widget.readOnly,
                  obscureText: widget.obscureText,
                  keyboardType: widget.keyboardType,
                  textInputAction: widget.textInputAction,
                  maxLines: widget.obscureText ? 1 : widget.maxLines,
                  autofocus: widget.autofocus,
                  onChanged: (val) {
                    widget.onChanged?.call(val);
                    setState(() {});
                  },
                  onSubmitted: widget.onSubmitted,
                  style: TextStyle(
                    color: textColor,
                    fontSize: fontSize,
                    fontWeight: FontWeight.w400,
                  ),
                  cursorColor: tokens.accent.base,
                  decoration: InputDecoration(
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                    border: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    errorBorder: InputBorder.none,
                    disabledBorder: InputBorder.none,
                    hintText: widget.placeholder,
                    hintStyle: TextStyle(
                      color: placeholderColor,
                      fontSize: fontSize,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ),
              if (showClear) ...[
                const SizedBox(width: JoySpacing.s4),
                GestureDetector(
                  key: const Key('joy_input_clear_button'),
                  behavior: HitTestBehavior.opaque,
                  onTap: _handleClear,
                  child: Semantics(
                    button: true,
                    label: 'Clear text',
                    child: Padding(
                      padding: const EdgeInsets.all(JoySpacing.s2),
                      child: JoyIcon(
                        JoyIcons.close,
                        customSize: widget.size.iconSize,
                        color: tokens.text.muted,
                      ),
                    ),
                  ),
                ),
              ],
              if (widget.suffixText != null) ...[
                const SizedBox(width: JoySpacing.s8),
                Text(
                  widget.suffixText!,
                  style: TextStyle(
                    color: tokens.text.secondary,
                    fontSize: fontSize,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
              if (widget.suffix != null) ...[
                const SizedBox(width: JoySpacing.s8),
                widget.suffix!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
