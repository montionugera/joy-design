import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';

/// Predefined sizes for [JoySegmented].
enum JoySegmentedSize {
  sm,
  md,
  lg,
}

/// Declarative data option for [JoySegmented].
@immutable
class JoySegmentedOption<T> {
  final T value;
  final Widget? label;
  final String? labelText;
  final Widget? icon;
  final bool disabled;

  const JoySegmentedOption({
    required this.value,
    this.label,
    this.labelText,
    this.icon,
    this.disabled = false,
  });

  const JoySegmentedOption.text({
    required this.value,
    required String label,
    this.disabled = false,
  })  : label = null,
        labelText = label,
        icon = null;
}

/// Joymify Segmented control component.
///
/// Implements full design-token parity, zero color literals, animated sliding indicator,
/// full keyboard navigation, accessible semantics, and mandatory 44px coarse hit-target bounds.
class JoySegmented<T> extends StatefulWidget {
  final T value;
  final ValueChanged<T>? onChanged;
  final List<JoySegmentedOption<T>> options;
  final bool disabled;
  final bool block;
  final JoySegmentedSize size;
  final bool autofocus;
  final FocusNode? focusNode;
  final String? semanticLabel;

  const JoySegmented({
    super.key,
    required this.value,
    required this.onChanged,
    required this.options,
    this.disabled = false,
    this.block = false,
    this.size = JoySegmentedSize.md,
    this.autofocus = false,
    this.focusNode,
    this.semanticLabel,
  });

  @override
  State<JoySegmented<T>> createState() => _JoySegmentedState<T>();
}

class _JoySegmentedState<T> extends State<JoySegmented<T>> {
  FocusNode? _internalFocusNode;
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
  void didUpdateWidget(JoySegmented<T> oldWidget) {
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

  int get _selectedIndex {
    final idx = widget.options.indexWhere((opt) => opt.value == widget.value);
    return idx != -1 ? idx : 0;
  }

  List<int> get _enabledIndices {
    final list = <int>[];
    for (var i = 0; i < widget.options.length; i++) {
      if (!widget.disabled && !widget.options[i].disabled) {
        list.add(i);
      }
    }
    return list;
  }

  void _selectIndex(int index) {
    if (!_isInteractive) return;
    if (index < 0 || index >= widget.options.length) return;
    final opt = widget.options[index];
    if (opt.disabled) return;
    widget.onChanged?.call(opt.value);
  }

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (!_isInteractive) return KeyEventResult.ignored;

    final enabled = _enabledIndices;
    if (enabled.isEmpty) return KeyEventResult.ignored;

    if (event is KeyDownEvent) {
      final currentPos = enabled.indexOf(_selectedIndex);
      int? nextPos;

      if (event.logicalKey == LogicalKeyboardKey.arrowRight ||
          event.logicalKey == LogicalKeyboardKey.arrowDown) {
        nextPos = currentPos == -1 ? 0 : (currentPos + 1) % enabled.length;
      } else if (event.logicalKey == LogicalKeyboardKey.arrowLeft ||
          event.logicalKey == LogicalKeyboardKey.arrowUp) {
        nextPos = currentPos == -1
            ? enabled.length - 1
            : (currentPos - 1 + enabled.length) % enabled.length;
      } else if (event.logicalKey == LogicalKeyboardKey.home) {
        nextPos = 0;
      } else if (event.logicalKey == LogicalKeyboardKey.end) {
        nextPos = enabled.length - 1;
      }

      if (nextPos != null) {
        _selectIndex(enabled[nextPos]);
        return KeyEventResult.handled;
      }
    }
    return KeyEventResult.ignored;
  }

  double _measureMaxLabelWidth(double fontSize) {
    var maxW = 0.0;
    for (final opt in widget.options) {
      final text = opt.labelText;
      if (text != null && text.isNotEmpty) {
        final tp = TextPainter(
          text: TextSpan(
            text: text,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w500,
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        if (tp.width > maxW) maxW = tp.width;
      }
    }
    return maxW;
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final optionsCount = widget.options.length;

    // Size parameters
    final double itemHeight;
    final double fontSize;
    final double minItemWidth;

    switch (widget.size) {
      case JoySegmentedSize.sm:
        itemHeight = 28.0;
        fontSize = 12.0;
        minItemWidth = 48.0;
      case JoySegmentedSize.md:
        itemHeight = 36.0;
        fontSize = 14.0;
        minItemWidth = 64.0;
      case JoySegmentedSize.lg:
        itemHeight = 44.0;
        fontSize = 16.0;
        minItemWidth = 80.0;
    }

    const padding = 3.0;
    final borderWidth = _isFocused ? 1.5 : 1.0;
    final maxLabelWidth = _measureMaxLabelWidth(fontSize);
    final calculatedItemWidth = math.max(minItemWidth, maxLabelWidth + 24.0);

    return Semantics(
      label: widget.semanticLabel ?? 'Segmented control',
      enabled: _isInteractive,
      child: Focus(
        focusNode: _effectiveFocusNode,
        autofocus: widget.autofocus,
        onKeyEvent: _handleKeyEvent,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final double itemWidth;
            final double totalWidth;

            if (widget.block) {
              totalWidth = constraints.maxWidth;
              final innerWidth = totalWidth - (padding * 2) - (borderWidth * 2);
              itemWidth = optionsCount > 0 ? (innerWidth / optionsCount) : 0.0;
            } else {
              itemWidth = calculatedItemWidth;
              totalWidth = (itemWidth * optionsCount) + (padding * 2) + (borderWidth * 2);
            }

            final selectedIdx = _selectedIndex.clamp(0, math.max(0, optionsCount - 1));
            final indicatorLeft = selectedIdx * itemWidth;

            return ConstrainedBox(
              // Enforces 44px coarse pointer minimum hit-bounds
              constraints: const BoxConstraints(
                minHeight: 44.0,
                minWidth: 44.0,
              ),
              child: Center(
                child: Container(
                  width: totalWidth,
                  height: itemHeight + (padding * 2) + (borderWidth * 2),
                  padding: const EdgeInsets.all(padding),
                  decoration: BoxDecoration(
                    color: tokens.surface.sunken,
                    borderRadius: BorderRadius.circular(JoyRadius.control),
                    border: Border.all(
                      color: _isFocused ? tokens.focusRing.color : tokens.border.subtle,
                      width: borderWidth,
                    ),
                  ),
                  child: Stack(
                    children: [
                      // Sliding pill indicator behind active option
                      if (optionsCount > 0)
                        AnimatedPositioned(
                          duration: const Duration(milliseconds: 200),
                          curve: Curves.easeInOut,
                          left: indicatorLeft,
                          top: 0.0,
                          width: itemWidth,
                          height: itemHeight,
                          child: Container(
                            decoration: BoxDecoration(
                              color: tokens.surface.card,
                              borderRadius: BorderRadius.circular(JoyRadius.sm),
                              boxShadow: [
                                BoxShadow(
                                  color: tokens.border.subtle,
                                  blurRadius: 3.0,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                      // Options Row
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(optionsCount, (i) {
                          final opt = widget.options[i];
                          final isSelected = i == selectedIdx;
                          final isOptionDisabled = widget.disabled || opt.disabled;

                          final Color textColor;
                          if (isOptionDisabled) {
                            textColor = tokens.text.disabled;
                          } else if (isSelected) {
                            textColor = tokens.text.primary;
                          } else {
                            textColor = tokens.text.secondary;
                          }

                          return MouseRegion(
                            cursor: isOptionDisabled
                                ? SystemMouseCursors.forbidden
                                : SystemMouseCursors.click,
                            child: GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: () {
                                if (!isOptionDisabled) {
                                  _effectiveFocusNode.requestFocus();
                                  _selectIndex(i);
                                }
                              },
                              child: SizedBox(
                                width: itemWidth,
                                height: itemHeight,
                                child: Center(
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      if (opt.icon != null) ...[
                                        opt.icon!,
                                        if (opt.label != null || opt.labelText != null)
                                          const SizedBox(width: JoySpacing.s4),
                                      ],
                                      if (opt.label != null)
                                        opt.label!
                                      else if (opt.labelText != null)
                                        Text(
                                          opt.labelText!,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            color: textColor,
                                            fontSize: fontSize,
                                            fontWeight: isSelected
                                                ? FontWeight.w600
                                                : FontWeight.w500,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
