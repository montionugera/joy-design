import 'dart:async';
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Semantic types for [JoyMessage].
enum JoyMessageType {
  info,
  success,
  warning,
  danger;
}

/// Controller handle for a floating [JoyMessage] shown in an overlay.
class JoyMessageEntry {
  final OverlayEntry _overlayEntry;
  final GlobalKey<_JoyMessageOverlayItemState> _itemKey;
  bool _dismissed = false;

  JoyMessageEntry._(this._overlayEntry, this._itemKey);

  /// The underlying [OverlayEntry] managing this message on screen.
  OverlayEntry get overlayEntry => _overlayEntry;

  /// Whether this message has already been dismissed.
  bool get isDismissed => _dismissed;

  /// Programmatically dismisses this message toast.
  void close() {
    if (_dismissed) return;
    _dismissed = true;
    _itemKey.currentState?.dismiss();
  }

  /// Alias for [close].
  void dismiss() => close();
}

/// Compact top-center pill toast message providing brief status feedback.
///
/// Strictly enforces the Zero Color Literals and Zero Emoji policies,
/// smooth slide/fade entrance and auto-dismiss animations, and card tokens.
class JoyMessage extends StatelessWidget {
  final String content;
  final JoyMessageType type;

  const JoyMessage({
    super.key,
    required this.content,
    this.type = JoyMessageType.info,
  });

  /// Displays a floating [JoyMessage] pill toast at the top-center of the screen.
  ///
  /// Automatically animates in, stays visible for [duration] (defaults to 3 seconds),
  /// and smoothly animates out before removing the overlay entry.
  static JoyMessageEntry show(
    BuildContext context, {
    required String content,
    JoyMessageType type = JoyMessageType.info,
    Duration duration = const Duration(seconds: 3),
    VoidCallback? onClose,
  }) {
    final overlay =
        Overlay.maybeOf(context, rootOverlay: true) ?? Overlay.of(context);
    final itemKey = GlobalKey<_JoyMessageOverlayItemState>();
    late final OverlayEntry entry;

    entry = OverlayEntry(
      builder: (overlayContext) {
        return _JoyMessageOverlayItem(
          key: itemKey,
          content: content,
          type: type,
          duration: duration,
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
    return JoyMessageEntry._(entry, itemKey);
  }

  static JoyIconData _iconFor(JoyMessageType type) {
    switch (type) {
      case JoyMessageType.info:
        return JoyIcons.info;
      case JoyMessageType.success:
        return JoyIcons.checkCircle;
      case JoyMessageType.warning:
        return JoyIcons.alertTriangle;
      case JoyMessageType.danger:
        return JoyIcons.alertCircle;
    }
  }

  static Color _iconColor(JoyThemeTokens tokens, JoyMessageType type) {
    switch (type) {
      case JoyMessageType.info:
        return tokens.status.info.fg;
      case JoyMessageType.success:
        return tokens.status.success.fg;
      case JoyMessageType.warning:
        return tokens.status.warning.fg;
      case JoyMessageType.danger:
        return tokens.status.danger.fg;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 18.0,
        vertical: 10.0,
      ),
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.control),
        border: Border.all(
          color: tokens.border.subtle,
          width: 1.0,
        ),
        boxShadow: tokens.elevation.level2,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          JoyIcon.data(
            _iconFor(type),
            size: JoyIconSize.sm,
            color: _iconColor(tokens, type),
          ),
          const SizedBox(width: 8.0),
          Text(
            content,
            style: TextStyle(
              color: tokens.text.primary,
              fontSize: 14.0,
              height: 1.4,
              fontWeight: FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}

class _JoyMessageOverlayItem extends StatefulWidget {
  final String content;
  final JoyMessageType type;
  final Duration duration;
  final VoidCallback? onClose;
  final VoidCallback onDismissComplete;

  const _JoyMessageOverlayItem({
    super.key,
    required this.content,
    required this.type,
    required this.duration,
    this.onClose,
    required this.onDismissComplete,
  });

  @override
  State<_JoyMessageOverlayItem> createState() => _JoyMessageOverlayItemState();
}

class _JoyMessageOverlayItemState extends State<_JoyMessageOverlayItem>
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
      begin: const Offset(0.0, -0.4),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeInCubic,
      ),
    );

    _controller.forward();

    if (widget.duration > Duration.zero) {
      _dismissTimer = Timer(widget.duration, dismiss);
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
    return Positioned(
      top: 24.0,
      left: 0.0,
      right: 0.0,
      child: SafeArea(
        child: Center(
          child: Material(
            type: MaterialType.transparency,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: JoyMessage(
                  content: widget.content,
                  type: widget.type,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
