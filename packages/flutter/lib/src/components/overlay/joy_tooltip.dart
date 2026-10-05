import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';

/// Tooltip positioning placement.
enum JoyTooltipPlacement {
  top,
  bottom,
}

/// A high-contrast informative bubble triggered on hover or tap.
///
/// Features high-contrast inverted surface tokens (`tokens.surface.inverse`),
/// pointer arrow indicator, and multi-device interaction (hover for desktop mouse,
/// pin-on-tap for touch devices).
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyTooltip extends StatefulWidget {
  final Widget child;
  final Widget title;
  final JoyTooltipPlacement placement;

  const JoyTooltip({
    super.key,
    required this.child,
    required this.title,
    this.placement = JoyTooltipPlacement.top,
  });

  /// Convenience constructor accepting a [String] title.
  JoyTooltip.text({
    super.key,
    required this.child,
    required String title,
    this.placement = JoyTooltipPlacement.top,
  }) : title = Text(title);

  @override
  State<JoyTooltip> createState() => _JoyTooltipState();
}

class _JoyTooltipState extends State<JoyTooltip> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isHovered = false;
  bool _isPinned = false;

  bool get _isVisible => _isHovered || _isPinned;

  @override
  void dispose() {
    _removeOverlay();
    super.dispose();
  }

  void _syncOverlay() {
    if (_isVisible && _overlayEntry == null) {
      _showOverlay();
    } else if (!_isVisible && _overlayEntry != null) {
      _removeOverlay();
    }
  }

  void _showOverlay() {
    if (!mounted) return;
    final overlay = Overlay.of(context, rootOverlay: true);
    _overlayEntry = _createOverlayEntry();
    overlay.insert(_overlayEntry!);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry?.dispose();
    _overlayEntry = null;
  }

  void _handlePointerEnter(PointerEnterEvent event) {
    if (event.kind == PointerDeviceKind.mouse) {
      setState(() {
        _isHovered = true;
      });
      _syncOverlay();
    }
  }

  void _handlePointerExit(PointerExitEvent event) {
    if (event.kind == PointerDeviceKind.mouse) {
      setState(() {
        _isHovered = false;
      });
      _syncOverlay();
    }
  }

  void _handleTap() {
    setState(() {
      _isPinned = !_isPinned;
    });
    _syncOverlay();
  }

  void _dismissPinned() {
    if (_isPinned) {
      setState(() {
        _isPinned = false;
      });
      _syncOverlay();
    }
  }

  OverlayEntry _createOverlayEntry() {
    final tokens = context.joyTheme;
    final isTop = widget.placement == JoyTooltipPlacement.top;

    return OverlayEntry(
      builder: (overlayContext) {
        return Stack(
          children: [
            if (_isPinned)
              Positioned.fill(
                child: GestureDetector(
                  behavior: HitTestBehavior.translucent,
                  onTap: _dismissPinned,
                  child: const SizedBox.expand(),
                ),
              ),
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              targetAnchor:
                  isTop ? Alignment.topCenter : Alignment.bottomCenter,
              followerAnchor:
                  isTop ? Alignment.bottomCenter : Alignment.topCenter,
              offset: Offset(0.0, isTop ? -JoySpacing.s8 : JoySpacing.s8),
              child: CallbackShortcuts(
                bindings: {
                  const SingleActivator(LogicalKeyboardKey.escape): _dismissPinned,
                },
                child: Focus(
                  autofocus: _isPinned,
                  child: Material(
                    type: MaterialType.transparency,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (!isTop)
                          CustomPaint(
                            size: const Size(10.0, 5.0),
                            painter: _ArrowPainter(
                              color: tokens.surface.inverse,
                              pointUp: true,
                            ),
                          ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: JoySpacing.s8,
                            vertical: JoySpacing.s4,
                          ),
                          decoration: BoxDecoration(
                            color: tokens.surface.inverse,
                            borderRadius: BorderRadius.circular(JoyRadius.sm),
                            boxShadow: tokens.elevation.level1,
                          ),
                          child: DefaultTextStyle(
                            style: TextStyle(
                              color: tokens.text.inverse,
                              fontSize: 12.0,
                              fontWeight: FontWeight.w400,
                              height: 1.3,
                            ),
                            child: widget.title,
                          ),
                        ),
                        if (isTop)
                          CustomPaint(
                            size: const Size(10.0, 5.0),
                            painter: _ArrowPainter(
                              color: tokens.surface.inverse,
                              pointUp: false,
                            ),
                          ),
                      ],
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
      child: MouseRegion(
        onEnter: _handlePointerEnter,
        onExit: _handlePointerExit,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _handleTap,
          child: widget.child,
        ),
      ),
    );
  }
}

class _ArrowPainter extends CustomPainter {
  final Color color;
  final bool pointUp;

  const _ArrowPainter({
    required this.color,
    required this.pointUp,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();
    if (pointUp) {
      path.moveTo(size.width / 2.0, 0.0);
      path.lineTo(size.width, size.height);
      path.lineTo(0.0, size.height);
    } else {
      path.moveTo(0.0, 0.0);
      path.lineTo(size.width, 0.0);
      path.lineTo(size.width / 2.0, size.height);
    }
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_ArrowPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.pointUp != pointUp;
  }
}
