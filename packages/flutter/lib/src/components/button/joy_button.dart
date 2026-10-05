import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';
import 'joy_button_style.dart';

/// Primary action button for Joymify Design System.
///
/// Implements 100% API parity with React JoyButton and Svelte Button,
/// enforcing a 44px coarse hit-target floor, pure state-driven token resolution,
/// and accessible button semantics.
class JoyButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final JoyButtonVariant variant;
  final JoyButtonSize size;
  final bool loading;
  final bool disabled;
  final bool block;
  final Widget? child;
  final Widget? iconStart;
  final Widget? iconEnd;
  final String? semanticLabel;

  const JoyButton({
    super.key,
    this.onPressed,
    this.variant = JoyButtonVariant.solid,
    this.size = JoyButtonSize.md,
    this.loading = false,
    this.disabled = false,
    this.block = false,
    this.child,
    this.iconStart,
    this.iconEnd,
    this.semanticLabel,
  });

  @override
  State<JoyButton> createState() => _JoyButtonState();
}

class _JoyButtonState extends State<JoyButton> {
  bool _isHovered = false;
  bool _isFocused = false;
  bool _isPressed = false;

  bool get _isInteractive =>
      !widget.disabled && !widget.loading && widget.onPressed != null;

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final resolved = resolveJoyButtonStyle(
      tokens: tokens,
      variant: widget.variant,
      size: widget.size,
      isHovered: _isHovered,
      isFocused: _isFocused,
      isPressed: _isPressed,
      isDisabled: widget.disabled,
      isLoading: widget.loading,
    );

    final double spinnerSize;
    switch (widget.size) {
      case JoyButtonSize.sm:
        spinnerSize = 14.0;
      case JoyButtonSize.md:
        spinnerSize = 16.0;
      case JoyButtonSize.lg:
        spinnerSize = 18.0;
    }

    final Widget? startIcon;
    if (widget.loading) {
      startIcon = SizedBox(
        width: spinnerSize,
        height: spinnerSize,
        child: CircularProgressIndicator(
          strokeWidth: 2.0,
          valueColor: AlwaysStoppedAnimation<Color>(resolved.loaderColor),
        ),
      );
    } else {
      startIcon = widget.iconStart;
    }

    final children = <Widget>[];
    if (startIcon != null) {
      children.add(startIcon);
    }
    if (widget.child != null) {
      if (children.isNotEmpty) {
        children.add(const SizedBox(width: JoySpacing.s8));
      }
      children.add(widget.child!);
    }
    if (widget.iconEnd != null && !widget.loading) {
      if (children.isNotEmpty) {
        children.add(const SizedBox(width: JoySpacing.s8));
      }
      children.add(widget.iconEnd!);
    }

    final row = Row(
      mainAxisSize: widget.block ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: children,
    );

    final content = DefaultTextStyle(
      style: resolved.textStyle,
      child: IconTheme(
        data: IconThemeData(
          color: resolved.foregroundColor,
          size: resolved.textStyle.fontSize != null
              ? resolved.textStyle.fontSize! * 1.2
              : 16.0,
        ),
        child: row,
      ),
    );

    final decoration = BoxDecoration(
      color: resolved.backgroundColor,
      border: resolved.border != null
          ? Border.fromBorderSide(resolved.border!)
          : null,
      borderRadius: resolved.borderRadius,
      boxShadow: resolved.boxShadow,
    );

    // Visual button container
    final visualContainer = Container(
      constraints: BoxConstraints(
        minHeight: resolved.minHeight,
      ),
      padding: resolved.padding,
      alignment: Alignment.center,
      decoration: decoration,
      child: content,
    );

    final String? effectiveLabel = widget.semanticLabel ??
        (widget.child is Text ? (widget.child as Text).data : null);

    Widget result = ConstrainedBox(
      constraints: BoxConstraints(
        minHeight: 44.0,
        minWidth: widget.block ? double.infinity : 44.0,
      ),
      child: visualContainer,
    );

    if (_isInteractive) {
      result = FocusableActionDetector(
        enabled: _isInteractive,
        onShowHoverHighlight: (v) => setState(() => _isHovered = v),
        onShowFocusHighlight: (v) => setState(() => _isFocused = v),
        actions: <Type, Action<Intent>>{
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) => widget.onPressed?.call(),
          ),
        },
        shortcuts: const <ShortcutActivator, Intent>{
          SingleActivator(LogicalKeyboardKey.enter): ActivateIntent(),
          SingleActivator(LogicalKeyboardKey.space): ActivateIntent(),
        },
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: (_) => setState(() => _isPressed = true),
          onTapUp: (_) => setState(() => _isPressed = false),
          onTapCancel: () => setState(() => _isPressed = false),
          onTap: widget.onPressed,
          child: result,
        ),
      );
    }

    return Semantics(
      container: true,
      button: true,
      enabled: _isInteractive,
      focusable: _isInteractive,
      focused: _isFocused,
      label: effectiveLabel,
      excludeSemantics: widget.child != null,
      child: result,
    );
  }
}
