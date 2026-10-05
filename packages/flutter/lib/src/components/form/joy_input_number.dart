import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';
import 'joy_input.dart';

/// Joymify numeric input component with stepper controls.
///
/// Supports direct numeric keyboard entry, precision formatting, min/max bounds,
/// step increments, accessible stepper buttons, and complete token theming with zero color literals.
class JoyInputNumber extends StatefulWidget {
  final num? value;
  final num? defaultValue;
  final ValueChanged<num?>? onChanged;
  final num? min;
  final num? max;
  final num step;
  final int? precision;
  final bool disabled;
  final bool readOnly;
  final JoyInputSize size;
  final JoyInputStatus status;
  final String? placeholder;
  final Widget? prefix;
  final Widget? suffix;
  final String? prefixText;
  final String? suffixText;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? semanticLabel;
  final bool? isMobile;

  const JoyInputNumber({
    super.key,
    this.value,
    this.defaultValue,
    this.onChanged,
    this.min,
    this.max,
    this.step = 1,
    this.precision,
    this.disabled = false,
    this.readOnly = false,
    this.size = JoyInputSize.md,
    this.status = JoyInputStatus.defaultStatus,
    this.placeholder,
    this.prefix,
    this.suffix,
    this.prefixText,
    this.suffixText,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.isMobile,
  });

  @override
  State<JoyInputNumber> createState() => _JoyInputNumberState();
}

class _JoyInputNumberState extends State<JoyInputNumber> {
  late TextEditingController _controller;
  FocusNode? _internalFocusNode;
  num? _currentValue;
  bool _isHovered = false;
  bool _isFocused = false;
  bool _isUpHovered = false;
  bool _isDownHovered = false;

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  @override
  void initState() {
    super.initState();
    _currentValue = widget.value ?? widget.defaultValue;
    if (_currentValue != null) {
      _currentValue = _clampAndFormat(_currentValue!);
    }
    _controller = TextEditingController(text: _formatDisplay(_currentValue));
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(JoyInputNumber oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _currentValue = widget.value != null ? _clampAndFormat(widget.value!) : null;
      final newText = _formatDisplay(_currentValue);
      if (_controller.text != newText) {
        _controller.text = newText;
      }
    }
    if (widget.focusNode != oldWidget.focusNode) {
      oldWidget.focusNode?.removeListener(_handleFocusChange);
      widget.focusNode?.addListener(_handleFocusChange);
    }
  }

  @override
  void dispose() {
    _effectiveFocusNode.removeListener(_handleFocusChange);
    _controller.dispose();
    _internalFocusNode?.dispose();
    super.dispose();
  }

  void _handleFocusChange() {
    final hasFocus = _effectiveFocusNode.hasFocus;
    if (_isFocused != hasFocus) {
      setState(() {
        _isFocused = hasFocus;
      });
      if (!hasFocus) {
        _commitText();
      }
    }
  }

  num _clampAndFormat(num val) {
    num res = val;
    if (widget.min != null && res < widget.min!) {
      res = widget.min!;
    }
    if (widget.max != null && res > widget.max!) {
      res = widget.max!;
    }
    if (widget.precision != null) {
      res = num.parse(res.toStringAsFixed(widget.precision!));
    }
    return res;
  }

  String _formatDisplay(num? val) {
    if (val == null) return '';
    if (widget.precision != null) {
      return val.toStringAsFixed(widget.precision!);
    }
    return val.toString();
  }

  void _updateValue(num? next) {
    final clamped = next != null ? _clampAndFormat(next) : null;
    setState(() {
      _currentValue = clamped;
      _controller.text = _formatDisplay(clamped);
    });
    widget.onChanged?.call(clamped);
  }

  void _handleTextChange(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      _currentValue = null;
      widget.onChanged?.call(null);
      setState(() {});
      return;
    }
    final parsed = num.tryParse(trimmed);
    if (parsed != null) {
      _currentValue = parsed;
      widget.onChanged?.call(parsed);
      setState(() {});
    }
  }

  void _commitText() {
    final trimmed = _controller.text.trim();
    if (trimmed.isEmpty) {
      _updateValue(null);
    } else {
      final parsed = num.tryParse(trimmed);
      if (parsed != null) {
        _updateValue(parsed);
      } else {
        _controller.text = _formatDisplay(_currentValue);
      }
    }
  }

  bool get _isUpDisabled {
    if (widget.disabled || widget.readOnly) return true;
    if (widget.max != null && _currentValue != null && _currentValue! >= widget.max!) {
      return true;
    }
    return false;
  }

  bool get _isDownDisabled {
    if (widget.disabled || widget.readOnly) return true;
    if (widget.min != null && _currentValue != null && _currentValue! <= widget.min!) {
      return true;
    }
    return false;
  }

  void _stepUp() {
    if (_isUpDisabled) return;
    final current = _currentValue ?? (widget.min ?? 0);
    final next = current + widget.step;
    _updateValue(next);
  }

  void _stepDown() {
    if (_isDownDisabled) return;
    final current = _currentValue ?? (widget.max ?? 0);
    final next = current - widget.step;
    _updateValue(next);
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

    final backgroundColor = widget.disabled ? tokens.surface.disabled : tokens.surface.card;
    final textColor = widget.disabled ? tokens.text.disabled : tokens.text.primary;
    final placeholderColor = tokens.text.muted;
    final double borderWidth = _isFocused ? 1.5 : 1.0;

    final double stepperWidth;
    final double stepperIconSize;
    switch (widget.size) {
      case JoyInputSize.sm:
        stepperWidth = 22.0;
        stepperIconSize = 10.0;
      case JoyInputSize.md:
        stepperWidth = 26.0;
        stepperIconSize = 12.0;
      case JoyInputSize.lg:
        stepperWidth = 30.0;
        stepperIconSize = 14.0;
    }

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
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (widget.prefix != null) ...[
                Padding(
                  padding: EdgeInsets.only(left: widget.size.horizontalPadding),
                  child: Center(child: widget.prefix!),
                ),
                const SizedBox(width: JoySpacing.s8),
              ],
              if (widget.prefixText != null) ...[
                Padding(
                  padding: EdgeInsets.only(left: widget.prefix == null ? widget.size.horizontalPadding : 0),
                  child: Center(
                    child: Text(
                      widget.prefixText!,
                      style: TextStyle(
                        color: tokens.text.secondary,
                        fontSize: fontSize,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: JoySpacing.s8),
              ],
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(
                    left: (widget.prefix == null && widget.prefixText == null)
                        ? widget.size.horizontalPadding
                        : 0,
                    right: (widget.suffix == null && widget.suffixText == null)
                        ? JoySpacing.s4
                        : 0,
                  ),
                  child: Center(
                    child: TextField(
                      controller: _controller,
                      focusNode: _effectiveFocusNode,
                      enabled: !widget.disabled,
                      readOnly: widget.readOnly,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                        signed: true,
                      ),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'[\d.-]')),
                      ],
                      autofocus: widget.autofocus,
                      onChanged: _handleTextChange,
                      onSubmitted: (_) => _commitText(),
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
                ),
              ),
              if (widget.suffixText != null) ...[
                const SizedBox(width: JoySpacing.s8),
                Center(
                  child: Text(
                    widget.suffixText!,
                    style: TextStyle(
                      color: tokens.text.secondary,
                      fontSize: fontSize,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ],
              if (widget.suffix != null) ...[
                const SizedBox(width: JoySpacing.s8),
                Center(child: widget.suffix!),
              ],
              // Stepper buttons container
              Container(
                width: stepperWidth,
                decoration: BoxDecoration(
                  border: Border(
                    left: BorderSide(
                      color: borderColor,
                      width: 1.0,
                    ),
                  ),
                ),
                child: Column(
                  children: [
                    // Up button
                    Expanded(
                      child: MouseRegion(
                        onEnter: (_) {
                          if (!_isUpDisabled) setState(() => _isUpHovered = true);
                        },
                        onExit: (_) => setState(() => _isUpHovered = false),
                        child: GestureDetector(
                          key: const Key('joy_input_number_up'),
                          behavior: HitTestBehavior.opaque,
                          onTap: _stepUp,
                          child: Semantics(
                            button: true,
                            label: 'Increment',
                            enabled: !_isUpDisabled,
                            child: Container(
                              decoration: BoxDecoration(
                                color: _isUpHovered && !_isUpDisabled
                                    ? tokens.surface.sunken
                                    : null,
                                border: Border(
                                  bottom: BorderSide(
                                    color: borderColor,
                                    width: 1.0,
                                  ),
                                ),
                              ),
                              child: Center(
                                child: JoyIcon(
                                  JoyIcons.chevronUp,
                                  customSize: stepperIconSize,
                                  color: _isUpDisabled
                                      ? tokens.text.disabled
                                      : tokens.text.secondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    // Down button
                    Expanded(
                      child: MouseRegion(
                        onEnter: (_) {
                          if (!_isDownDisabled) setState(() => _isDownHovered = true);
                        },
                        onExit: (_) => setState(() => _isDownHovered = false),
                        child: GestureDetector(
                          key: const Key('joy_input_number_down'),
                          behavior: HitTestBehavior.opaque,
                          onTap: _stepDown,
                          child: Semantics(
                            button: true,
                            label: 'Decrement',
                            enabled: !_isDownDisabled,
                            child: Container(
                              color: _isDownHovered && !_isDownDisabled
                                  ? tokens.surface.sunken
                                  : null,
                              child: Center(
                                child: JoyIcon(
                                  JoyIcons.chevronDown,
                                  customSize: stepperIconSize,
                                  color: _isDownDisabled
                                      ? tokens.text.disabled
                                      : tokens.text.secondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
