import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Placement edge for [JoyDrawer].
enum JoyDrawerPlacement {
  left,
  right,
  bottom;
}

/// Drawer off-canvas panel for secondary navigations, filters, and forms.
///
/// Features directional sliding (right, left, bottom), automatic mobile bottom-sheet adaptation
/// for viewports <= 480px, theme-invariant 60% navy900 scrim, and >=44x44 touch targets.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyDrawer extends StatelessWidget {
  final Widget? title;
  final Widget? content;
  final Widget? footer;
  final JoyDrawerPlacement placement;
  final double? size;
  final bool closable;
  final bool barrierDismissible;
  final VoidCallback? onClose;

  const JoyDrawer({
    super.key,
    this.title,
    this.content,
    this.footer,
    this.placement = JoyDrawerPlacement.right,
    this.size,
    this.closable = true,
    this.barrierDismissible = true,
    this.onClose,
  });

  /// Backdrop scrim color using [JoyColorRamps.navy900] at 60% opacity.
  static Color get scrimColor => Color.fromARGB(
        153, // 60% opacity
        (JoyColorRamps.navy900.r * 255.0).round() & 0xff,
        (JoyColorRamps.navy900.g * 255.0).round() & 0xff,
        (JoyColorRamps.navy900.b * 255.0).round() & 0xff,
      );

  /// Shows a [JoyDrawer] overlay sliding in from the specified edge.
  static Future<T?> show<T>({
    required BuildContext context,
    Widget? title,
    Widget? content,
    Widget? footer,
    JoyDrawerPlacement placement = JoyDrawerPlacement.right,
    double? size,
    bool closable = true,
    bool barrierDismissible = true,
    VoidCallback? onClose,
    WidgetBuilder? builder,
  }) {
    final isMobile = MediaQuery.of(context).size.width <= 480.0;
    final effectivePlacement =
        isMobile ? JoyDrawerPlacement.bottom : placement;

    Offset beginOffset;
    switch (effectivePlacement) {
      case JoyDrawerPlacement.left:
        beginOffset = const Offset(-1.0, 0.0);
      case JoyDrawerPlacement.right:
        beginOffset = const Offset(1.0, 0.0);
      case JoyDrawerPlacement.bottom:
        beginOffset = const Offset(0.0, 1.0);
    }

    return showGeneralDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierLabel: 'Dismiss drawer',
      barrierColor: scrimColor,
      transitionDuration: const Duration(milliseconds: 250),
      pageBuilder: (buildContext, animation, secondaryAnimation) {
        final contentWidget = builder != null ? builder(buildContext) : content;
        return JoyDrawer(
          title: title,
          content: contentWidget,
          footer: footer,
          placement: effectivePlacement,
          size: size,
          closable: closable,
          barrierDismissible: barrierDismissible,
          onClose: () {
            onClose?.call();
            Navigator.of(buildContext, rootNavigator: true).pop();
          },
        );
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final curved = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
        );
        return SlideTransition(
          position: Tween<Offset>(begin: beginOffset, end: Offset.zero)
              .animate(curved),
          child: child,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final media = MediaQuery.of(context);
    final isMobile = media.size.width <= 480.0;
    final effectivePlacement =
        isMobile ? JoyDrawerPlacement.bottom : placement;

    final header = Container(
      padding: const EdgeInsets.symmetric(
        horizontal: JoySpacing.s20,
        vertical: JoySpacing.s16,
      ),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: tokens.border.subtle,
            width: 1.0,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: title != null
                ? DefaultTextStyle(
                    style: TextStyle(
                      color: tokens.text.primary,
                      fontSize: 16.0,
                      fontWeight: FontWeight.w600,
                      height: 1.4,
                    ),
                    child: title!,
                  )
                : const SizedBox.shrink(),
          ),
          if (closable)
            Semantics(
              button: true,
              label: 'Close drawer',
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  minWidth: 44.0,
                  minHeight: 44.0,
                ),
                child: InkWell(
                  key: const Key('joy-drawer-close-button'),
                  onTap: () {
                    if (onClose != null) {
                      onClose!();
                    } else {
                      Navigator.of(context, rootNavigator: true).maybePop();
                    }
                  },
                  borderRadius: BorderRadius.circular(JoyRadius.sm),
                  child: Center(
                    child: JoyIcon.data(
                      JoyIcons.close,
                      size: JoyIconSize.md,
                      color: tokens.text.muted,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );

    final body = Expanded(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(JoySpacing.s20),
        child: content ?? const SizedBox.shrink(),
      ),
    );

    final footerWidget = footer != null
        ? Container(
            padding: const EdgeInsets.symmetric(
              horizontal: JoySpacing.s20,
              vertical: JoySpacing.s16,
            ),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: tokens.border.subtle,
                  width: 1.0,
                ),
              ),
            ),
            child: footer!,
          )
        : null;

    BorderRadius panelRadius;
    BoxBorder? panelBorder;
    Alignment panelAlignment;
    double? panelWidth;
    double? panelHeight;

    switch (effectivePlacement) {
      case JoyDrawerPlacement.left:
        panelRadius = BorderRadius.zero;
        panelBorder = Border(
          right: BorderSide(color: tokens.border.subtle, width: 1.0),
        );
        panelAlignment = Alignment.centerLeft;
        panelWidth = size ?? 380.0;
        panelHeight = double.infinity;
      case JoyDrawerPlacement.right:
        panelRadius = BorderRadius.zero;
        panelBorder = Border(
          left: BorderSide(color: tokens.border.subtle, width: 1.0),
        );
        panelAlignment = Alignment.centerRight;
        panelWidth = size ?? 380.0;
        panelHeight = double.infinity;
      case JoyDrawerPlacement.bottom:
        panelRadius = const BorderRadius.only(
          topLeft: Radius.circular(JoyRadius.card),
          topRight: Radius.circular(JoyRadius.card),
        );
        panelBorder = Border(
          top: BorderSide(color: tokens.border.subtle, width: 1.0),
        );
        panelAlignment = Alignment.bottomCenter;
        panelWidth = double.infinity;
        panelHeight = size ?? media.size.height * 0.65;
    }

    final panel = Container(
      width: panelWidth,
      height: panelHeight,
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: panelRadius,
        border: panelBorder,
        boxShadow: tokens.elevation.level3,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          header,
          body,
          if (footerWidget != null) footerWidget,
        ],
      ),
    );

    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.escape): () {
          if (barrierDismissible) {
            if (onClose != null) {
              onClose!();
            } else {
              Navigator.of(context, rootNavigator: true).maybePop();
            }
          }
        },
      },
      child: Focus(
        autofocus: true,
        child: Align(
          alignment: panelAlignment,
          child: Material(
            color: tokens.surface.canvas,
            type: MaterialType.transparency,
            child: panel,
          ),
        ),
      ),
    );
  }
}
