import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';
import '../button/joy_button.dart';
import '../button/joy_button_style.dart';
import '../primitives/joy_icon.dart';

/// Popconfirm popover component asking for user confirmation before executing an action.
///
/// Anchors a floating panel with elevation, status warning icon, and confirm/cancel
/// actions to the trigger [child]. Dismisses on outside tap or Escape.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyPopconfirm extends StatefulWidget {
  final Widget child;
  final Widget title;
  final String confirmText;
  final String cancelText;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;
  final bool disabled;

  const JoyPopconfirm({
    super.key,
    required this.child,
    required this.title,
    this.confirmText = 'Confirm',
    this.cancelText = 'Cancel',
    this.onConfirm,
    this.onCancel,
    this.disabled = false,
  });

  /// Convenience constructor accepting a [String] title.
  JoyPopconfirm.text({
    super.key,
    required this.child,
    required String title,
    this.confirmText = 'Confirm',
    this.cancelText = 'Cancel',
    this.onConfirm,
    this.onCancel,
    this.disabled = false,
  }) : title = Text(title);

  @override
  State<JoyPopconfirm> createState() => _JoyPopconfirmState();
}

class _JoyPopconfirmState extends State<JoyPopconfirm> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;

  @override
  void dispose() {
    _removeOverlay();
    super.dispose();
  }

  void _toggle() {
    if (widget.disabled) return;
    if (_isOpen) {
      _close();
    } else {
      _open();
    }
  }

  void _open() {
    if (_isOpen || !mounted) return;
    final overlay = Overlay.of(context, rootOverlay: true);
    _overlayEntry = _createOverlayEntry();
    overlay.insert(_overlayEntry!);
    setState(() {
      _isOpen = true;
    });
  }

  void _close() {
    _removeOverlay();
    if (mounted && _isOpen) {
      setState(() {
        _isOpen = false;
      });
    }
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry?.dispose();
    _overlayEntry = null;
    _isOpen = false;
  }

  void _handleConfirm() {
    _close();
    widget.onConfirm?.call();
  }

  void _handleCancel() {
    _close();
    widget.onCancel?.call();
  }

  OverlayEntry _createOverlayEntry() {
    final tokens = context.joyTheme;

    return OverlayEntry(
      builder: (overlayContext) {
        return Stack(
          children: [
            // Fullscreen backdrop to catch outside taps and dismiss
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: _close,
                child: const SizedBox.expand(),
              ),
            ),
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              targetAnchor: Alignment.topCenter,
              followerAnchor: Alignment.bottomCenter,
              offset: const Offset(0.0, -JoySpacing.s8),
              child: CallbackShortcuts(
                bindings: {
                  const SingleActivator(LogicalKeyboardKey.escape): _close,
                },
                child: Focus(
                  autofocus: true,
                  child: Material(
                    type: MaterialType.transparency,
                    child: Container(
                      constraints: const BoxConstraints(
                        minWidth: 180.0,
                        maxWidth: 280.0,
                      ),
                      padding: const EdgeInsets.all(JoySpacing.s12),
                      decoration: BoxDecoration(
                        color: tokens.surface.card,
                        borderRadius: BorderRadius.circular(JoyRadius.md),
                        border: Border.all(
                          color: tokens.border.subtle,
                          width: 1.0,
                        ),
                        boxShadow: tokens.elevation.level2,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(
                                  top: JoySpacing.s2,
                                  right: JoySpacing.s8,
                                ),
                                child: JoyIcon.data(
                                  JoyIcons.alertCircle,
                                  size: JoyIconSize.sm,
                                  color: tokens.status.warning.fg,
                                ),
                              ),
                              Expanded(
                                child: DefaultTextStyle(
                                  style: TextStyle(
                                    fontSize: 13.0,
                                    fontWeight: FontWeight.w500,
                                    color: tokens.text.primary,
                                    height: 1.4,
                                  ),
                                  child: widget.title,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: JoySpacing.s12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              JoyButton(
                                key: const Key('joy-popconfirm-cancel-button'),
                                variant: JoyButtonVariant.outline,
                                size: JoyButtonSize.sm,
                                onPressed: _handleCancel,
                                child: Text(widget.cancelText),
                              ),
                              const SizedBox(width: JoySpacing.s8),
                              JoyButton(
                                key: const Key('joy-popconfirm-confirm-button'),
                                variant: JoyButtonVariant.solid,
                                size: JoyButtonSize.sm,
                                onPressed: _handleConfirm,
                                child: Text(widget.confirmText),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _toggle,
        child: widget.child,
      ),
    );
  }
}
