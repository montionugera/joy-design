import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../layout/joy_flex.dart';

/// Scope passed down by [JoyRadioGroup] to descendant [JoyRadio] widgets.
class _JoyRadioScope<T> extends InheritedWidget {
  final T? groupValue;
  final ValueChanged<T?>? onChanged;
  final bool disabled;

  const _JoyRadioScope({
    required this.groupValue,
    required this.onChanged,
    required this.disabled,
    required super.child,
  });

  static _JoyRadioScope<T>? maybeOf<T>(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_JoyRadioScope<T>>();
  }

  @override
  bool updateShouldNotify(_JoyRadioScope<T> oldWidget) =>
      groupValue != oldWidget.groupValue ||
      onChanged != oldWidget.onChanged ||
      disabled != oldWidget.disabled;
}

/// Declarative data option for [JoyRadioGroup].
@immutable
class JoyRadioOption<T> {
  final T value;
  final String label;
  final bool disabled;

  const JoyRadioOption({
    required this.value,
    required this.label,
    this.disabled = false,
  });
}

/// Joymify Radio button choice control.
///
/// Implements full design-token parity, zero color literals, accessible semantics,
/// mandatory 44x44px coarse hit-target bounds floor, and automatic integration
/// with an ancestor [JoyRadioGroup].
class JoyRadio<T> extends StatefulWidget {
  final T value;
  final T? groupValue;
  final ValueChanged<T?>? onChanged;
  final Widget? label;
  final String? labelText;
  final bool disabled;
  final bool autofocus;
  final FocusNode? focusNode;
  final String? semanticLabel;

  const JoyRadio({
    super.key,
    required this.value,
    this.groupValue,
    this.onChanged,
    this.label,
    this.labelText,
    this.disabled = false,
    this.autofocus = false,
    this.focusNode,
    this.semanticLabel,
  });

  @override
  State<JoyRadio<T>> createState() => _JoyRadioState<T>();
}

class _JoyRadioState<T> extends State<JoyRadio<T>> {
  FocusNode? _internalFocusNode;
  bool _isHovered = false;
  bool _isFocused = false;

  FocusNode get _effectiveFocusNode =>
      widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  @override
  void initState() {
    super.initState();
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(JoyRadio<T> oldWidget) {
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

  void _handleTap({
    required bool isInteractive,
    required ValueChanged<T?>? effectiveOnChanged,
  }) {
    if (!isInteractive || effectiveOnChanged == null) return;
    effectiveOnChanged.call(widget.value);
  }

  @override
  Widget build(BuildContext context) {
    final scope = _JoyRadioScope.maybeOf<T>(context);
    final effectiveGroupValue = widget.groupValue ?? scope?.groupValue;
    final effectiveOnChanged = widget.onChanged ?? scope?.onChanged;
    final effectiveDisabled = widget.disabled || (scope?.disabled ?? false);
    final isSelected = widget.value == effectiveGroupValue;
    final isInteractive = !effectiveDisabled && effectiveOnChanged != null;

    final tokens = context.joyTheme;

    // Resolve token colors
    final Color outerBorderColor;
    final Color innerDotColor;
    final Color backgroundColor;

    if (effectiveDisabled) {
      outerBorderColor = tokens.border.disabled;
      backgroundColor = tokens.surface.disabled;
      innerDotColor = tokens.text.disabled;
    } else if (isSelected) {
      outerBorderColor = _isFocused ? tokens.focusRing.color : tokens.accent.base;
      backgroundColor = tokens.surface.card;
      innerDotColor = tokens.accent.base;
    } else {
      outerBorderColor = _isFocused
          ? tokens.focusRing.color
          : (_isHovered ? tokens.border.strong : tokens.border.base);
      backgroundColor = tokens.surface.card;
      innerDotColor = tokens.accent.base;
    }

    final double borderWidth = _isFocused ? 1.5 : 1.0;

    return Semantics(
      label: widget.semanticLabel ?? widget.labelText,
      inMutuallyExclusiveGroup: true,
      selected: isSelected,
      enabled: isInteractive,
      child: MouseRegion(
        onEnter: (_) {
          if (isInteractive && !_isHovered) {
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
          onTap: () => _handleTap(
            isInteractive: isInteractive,
            effectiveOnChanged: effectiveOnChanged,
          ),
          child: Focus(
            focusNode: _effectiveFocusNode,
            autofocus: widget.autofocus,
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
                      shape: BoxShape.circle,
                      color: backgroundColor,
                      border: Border.all(
                        color: outerBorderColor,
                        width: borderWidth,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: isSelected
                        ? Container(
                            width: 8.0,
                            height: 8.0,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: innerDotColor,
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
                            color: effectiveDisabled
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

/// Joymify Radio Group manager.
///
/// Coordinates group selection value, change handler, disabled cascade,
/// and layout orientation (vertical or horizontal via [JoyFlex]).
class JoyRadioGroup<T> extends StatelessWidget {
  final T? value;
  final ValueChanged<T?>? onChanged;
  final Axis direction;
  final double gap;
  final bool disabled;
  final List<Widget>? children;
  final List<JoyRadioOption<T>>? options;

  const JoyRadioGroup({
    super.key,
    required this.value,
    this.onChanged,
    this.direction = Axis.vertical,
    this.gap = JoySpacing.s8,
    this.disabled = false,
    this.children,
    this.options,
  }) : assert(
          children != null || options != null,
          'JoyRadioGroup requires either children or options',
        );

  /// Convenience constructor for horizontal layout.
  const JoyRadioGroup.horizontal({
    super.key,
    required this.value,
    this.onChanged,
    this.gap = JoySpacing.s12,
    this.disabled = false,
    this.children,
    this.options,
  })  : direction = Axis.horizontal,
        assert(
          children != null || options != null,
          'JoyRadioGroup requires either children or options',
        );

  /// Convenience constructor for vertical layout.
  const JoyRadioGroup.vertical({
    super.key,
    required this.value,
    this.onChanged,
    this.gap = JoySpacing.s8,
    this.disabled = false,
    this.children,
    this.options,
  })  : direction = Axis.vertical,
        assert(
          children != null || options != null,
          'JoyRadioGroup requires either children or options',
        );

  @override
  Widget build(BuildContext context) {
    final List<Widget> resolvedChildren = children ??
        (options?.map(
              (opt) => JoyRadio<T>(
                value: opt.value,
                labelText: opt.label,
                disabled: opt.disabled,
              ),
            ).toList() ??
            const <Widget>[]);

    return _JoyRadioScope<T>(
      groupValue: value,
      onChanged: onChanged,
      disabled: disabled,
      child: JoyFlex(
        direction: direction,
        gap: gap,
        crossAxisAlignment: direction == Axis.vertical
            ? CrossAxisAlignment.start
            : CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: resolvedChildren,
      ),
    );
  }
}
