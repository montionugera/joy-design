import 'dart:async';
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Semantic type for [JoyNotification].
enum JoyNotificationType {
  info,
  success,
  warning,
  danger;
}

/// Controller handle for a floating [JoyNotification] shown in an overlay.
class JoyNotificationEntry {
  final OverlayEntry _overlayEntry;
  final GlobalKey<_JoyNotificationOverlayItemState> _itemKey;
  bool _dismissed = false;

  JoyNotificationEntry._(this._overlayEntry, this._itemKey);

  /// The underlying [OverlayEntry] managing this notification on screen.
  OverlayEntry get overlayEntry => _overlayEntry;

  /// Whether this notification has already been dismissed.
  bool get isDismissed => _dismissed;

  /// Programmatically dismisses this notification.
  void close() {
    if (_dismissed) return;
    _dismissed = true;
    _itemKey.currentState?.dismiss();
  }

  /// Alias for [close].
  void dismiss() => close();
}

/// Floating notification card for asynchronous system feedback, alerts, and notifications.
///
/// Strictly enforces the Zero Color Literals and Zero Emoji policies,
/// maintains accessible dismiss action with >=44x44px touch target bounds,
/// and supports responsive top-right (desktop) and top-center (mobile) layouts.
class JoyNotification extends StatelessWidget {
  final Widget title;
  final Widget? description;
  final JoyNotificationType type;
  final VoidCallback? onClose;
  final bool closable;
  final double? width;

  const JoyNotification({
    super.key,
    required this.title,
    this.description,
    this.type = JoyNotificationType.info,
    this.onClose,
    this.closable = true,
    this.width,
  });

  /// Displays a floating [JoyNotification] in the current overlay.
  ///
  /// Automatically positions the card at the top-right on wide viewports (>480px)
  /// or top-center on mobile viewports (<=480px).
  /// Dismisses automatically after [duration] (defaults to 4500ms).
  static JoyNotificationEntry show(
    BuildContext context, {
    required Widget title,
    Widget? description,
    JoyNotificationType type = JoyNotificationType.info,
    Duration? duration = const Duration(milliseconds: 4500),
    VoidCallback? onClose,
    bool closable = true,
  }) {
    final overlay =
        Overlay.maybeOf(context, rootOverlay: true) ?? Overlay.of(context);
    final itemKey = GlobalKey<_JoyNotificationOverlayItemState>();
    late final OverlayEntry entry;

    entry = OverlayEntry(
      builder: (overlayContext) {
        return _JoyNotificationOverlayItem(
          key: itemKey,
          title: title,
          description: description,
          type: type,
          duration: duration,
          closable: closable,
          onClose: onClose,
          onDismissComplete: () {
            if (entry.mounted) {
              entry.remove();
            }
          },
        );
      },
    );

    overlay.insert(entry);
    return JoyNotificationEntry._(entry, itemKey);
  }

  static JoyIconData _iconFor(JoyNotificationType type) {
    switch (type) {
      case JoyNotificationType.info:
        return JoyIcons.info;
      case JoyNotificationType.success:
        return JoyIcons.checkCircle;
      case JoyNotificationType.warning:
        return JoyIcons.alertTriangle;
      case JoyNotificationType.danger:
        return JoyIcons.alertCircle;
    }
  }

  static Color _iconColor(JoyThemeTokens tokens, JoyNotificationType type) {
    switch (type) {
      case JoyNotificationType.info:
        return tokens.status.info.fg;
      case JoyNotificationType.success:
        return tokens.status.success.fg;
      case JoyNotificationType.warning:
        return tokens.status.warning.fg;
      case JoyNotificationType.danger:
        return tokens.status.danger.fg;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final media = MediaQuery.maybeOf(context);
    final isMobile = (media?.size.width ?? 800.0) <= 480.0;
    final effectiveWidth = width ?? (isMobile ? null : 340.0);

    return Container(
      width: effectiveWidth,
      constraints: BoxConstraints(
        maxWidth: isMobile ? double.infinity : 340.0,
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: JoySpacing.s20,
        vertical: JoySpacing.s16,
      ),
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        border: Border.all(
          color: tokens.border.subtle,
          width: 1.0,
        ),
        boxShadow: tokens.elevation.level3,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 2.0),
            child: JoyIcon.data(
              _iconFor(type),
              size: JoyIconSize.md,
              color: _iconColor(tokens, type),
            ),
          ),
          const SizedBox(width: 10.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                DefaultTextStyle(
                  style: TextStyle(
                    color: tokens.text.primary,
                    fontSize: 15.0,
                    fontWeight: FontWeight.w600,
                    height: 1.33,
                  ),
                  child: title,
                ),
                if (description != null) ...[
                  const SizedBox(height: 4.0),
                  DefaultTextStyle(
                    style: TextStyle(
                      color: tokens.text.muted,
                      fontSize: 13.0,
                      fontWeight: FontWeight.normal,
                      height: 1.5,
                    ),
                    child: description!,
                  ),
                ],
              ],
            ),
          ),
          if (closable) ...[
            const SizedBox(width: JoySpacing.s12),
            Semantics(
              button: true,
              label: 'Dismiss notification',
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  minWidth: 44.0,
                  minHeight: 44.0,
                ),
                child: InkWell(
                  key: const Key('joy-notification-close-button'),
                  borderRadius: BorderRadius.circular(JoyRadius.control),
                  onTap: onClose,
                  child: Center(
                    child: JoyIcon.data(
                      JoyIcons.close,
                      size: JoyIconSize.sm,
                      color: tokens.text.muted,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _JoyNotificationOverlayItem extends StatefulWidget {
  final Widget title;
  final Widget? description;
  final JoyNotificationType type;
  final Duration? duration;
  final bool closable;
  final VoidCallback? onClose;
  final VoidCallback onDismissComplete;

  const _JoyNotificationOverlayItem({
    super.key,
    required this.title,
    this.description,
    required this.type,
    this.duration,
    required this.closable,
    this.onClose,
    required this.onDismissComplete,
  });

  @override
  State<_JoyNotificationOverlayItem> createState() =>
      _JoyNotificationOverlayItemState();
}

class _JoyNotificationOverlayItemState
    extends State<_JoyNotificationOverlayItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _slideAnimation;
  late final Animation<double> _fadeAnimation;
  Timer? _dismissTimer;
  bool _isDismissing = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.2, 0.0),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeInCubic,
      ),
    );

    _controller.forward();

    if (widget.duration != null && widget.duration! > Duration.zero) {
      _dismissTimer = Timer(widget.duration!, dismiss);
    }
  }

  void dismiss() {
    if (_isDismissing || !mounted) return;
    _isDismissing = true;
    _dismissTimer?.cancel();
    _controller.reverse().then((_) {
      if (mounted) {
        widget.onClose?.call();
        widget.onDismissComplete();
      }
    });
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final isMobile = media.size.width <= 480.0;

    return Positioned(
      top: 24.0,
      right: isMobile ? 16.0 : 24.0,
      left: isMobile ? 16.0 : null,
      child: SafeArea(
        child: Material(
          type: MaterialType.transparency,
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: JoyNotification(
                title: widget.title,
                description: widget.description,
                type: widget.type,
                closable: widget.closable,
                onClose: dismiss,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
