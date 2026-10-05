import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Semantic variants for [JoyAlert].
enum JoyAlertVariant {
  info,
  success,
  warning,
  danger;
}

/// A feedback alert banner conveying status, warnings, and messages.
///
/// Features a full 1px border matching the status token (strictly zero side stripes),
/// accessible dismiss action with >=44x44px touch bounds, and full token alignment.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyAlert extends StatefulWidget {
  final JoyAlertVariant variant;
  final Widget? title;
  final Widget? description;
  final Widget? icon;
  final Widget? child;
  final bool closable;
  final VoidCallback? onClose;

  const JoyAlert({
    super.key,
    this.variant = JoyAlertVariant.info,
    this.title,
    this.description,
    this.icon,
    this.child,
    this.closable = false,
    this.onClose,
  });

  const JoyAlert.info({
    super.key,
    this.title,
    this.description,
    this.icon,
    this.child,
    this.closable = false,
    this.onClose,
  }) : variant = JoyAlertVariant.info;

  const JoyAlert.success({
    super.key,
    this.title,
    this.description,
    this.icon,
    this.child,
    this.closable = false,
    this.onClose,
  }) : variant = JoyAlertVariant.success;

  const JoyAlert.warning({
    super.key,
    this.title,
    this.description,
    this.icon,
    this.child,
    this.closable = false,
    this.onClose,
  }) : variant = JoyAlertVariant.warning;

  const JoyAlert.danger({
    super.key,
    this.title,
    this.description,
    this.icon,
    this.child,
    this.closable = false,
    this.onClose,
  }) : variant = JoyAlertVariant.danger;

  @override
  State<JoyAlert> createState() => _JoyAlertState();
}

class _JoyAlertState extends State<JoyAlert> {
  bool _dismissed = false;

  void _handleDismiss() {
    setState(() {
      _dismissed = true;
    });
    widget.onClose?.call();
  }

  JoyIconData _defaultIconData() {
    switch (widget.variant) {
      case JoyAlertVariant.info:
        return JoyIcons.info;
      case JoyAlertVariant.success:
        return JoyIcons.checkCircle;
      case JoyAlertVariant.warning:
        return JoyIcons.alertTriangle;
      case JoyAlertVariant.danger:
        return JoyIcons.alertCircle;
    }
  }

  Color _resolveBg(JoyThemeTokens tokens) {
    switch (widget.variant) {
      case JoyAlertVariant.info:
        return tokens.status.info.bg;
      case JoyAlertVariant.success:
        return tokens.status.success.bg;
      case JoyAlertVariant.warning:
        return tokens.status.warning.bg;
      case JoyAlertVariant.danger:
        return tokens.status.danger.bg;
    }
  }

  Color _resolveFg(JoyThemeTokens tokens) {
    switch (widget.variant) {
      case JoyAlertVariant.info:
        return tokens.status.info.fg;
      case JoyAlertVariant.success:
        return tokens.status.success.fg;
      case JoyAlertVariant.warning:
        return tokens.status.warning.fg;
      case JoyAlertVariant.danger:
        return tokens.status.danger.fg;
    }
  }

  Color _resolveBorder(JoyThemeTokens tokens) {
    switch (widget.variant) {
      case JoyAlertVariant.info:
        return tokens.status.info.border;
      case JoyAlertVariant.success:
        return tokens.status.success.border;
      case JoyAlertVariant.warning:
        return tokens.status.warning.border;
      case JoyAlertVariant.danger:
        return tokens.status.danger.border;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_dismissed) {
      return const SizedBox.shrink();
    }

    final tokens = context.joyTheme;
    final bg = _resolveBg(tokens);
    final fg = _resolveFg(tokens);
    final border = _resolveBorder(tokens);

    final hasDescription = widget.description != null || widget.child != null;

    final Widget effectiveIcon = widget.icon ??
        JoyIcon.data(
          _defaultIconData(),
          size: JoyIconSize.md,
          color: fg,
        );

    final Widget? closeButton = widget.closable
        ? Semantics(
            button: true,
            label: 'Dismiss alert',
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                minWidth: 44.0,
                minHeight: 44.0,
              ),
              child: InkWell(
                key: const Key('joy-alert-close-button'),
                onTap: _handleDismiss,
                borderRadius: BorderRadius.circular(JoyRadius.sm),
                child: Center(
                  child: JoyIcon.data(
                    JoyIcons.close,
                    size: JoyIconSize.sm,
                    color: fg,
                  ),
                ),
              ),
            ),
          )
        : null;

    return Semantics(
      container: true,
      liveRegion: true,
      child: Container(
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(JoyRadius.md),
          border: Border.all(
            color: border,
            width: 1.0,
          ),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: JoySpacing.s16,
          vertical: JoySpacing.s12,
        ),
        child: Row(
          crossAxisAlignment: hasDescription
              ? CrossAxisAlignment.start
              : CrossAxisAlignment.center,
          children: [
            Padding(
              padding: EdgeInsets.only(
                top: hasDescription ? JoySpacing.s2 : JoySpacing.s0,
                right: JoySpacing.s12,
              ),
              child: effectiveIcon,
            ),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.title != null)
                    DefaultTextStyle(
                      style: TextStyle(
                        color: fg,
                        fontSize: 14.0,
                        fontWeight: FontWeight.w600,
                        height: 1.4,
                      ),
                      child: widget.title!,
                    ),
                  if (widget.description != null) ...[
                    if (widget.title != null)
                      const SizedBox(height: JoySpacing.s4),
                    DefaultTextStyle(
                      style: TextStyle(
                        color: fg,
                        fontSize: 13.0,
                        fontWeight: FontWeight.w400,
                        height: 1.4,
                      ),
                      child: widget.description!,
                    ),
                  ],
                  if (widget.child != null) ...[
                    if (widget.title != null || widget.description != null)
                      const SizedBox(height: JoySpacing.s8),
                    widget.child!,
                  ],
                ],
              ),
            ),
            if (closeButton != null) ...[
              const SizedBox(width: JoySpacing.s8),
              closeButton,
            ],
          ],
        ),
      ),
    );
  }
}
