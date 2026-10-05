import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Modal dialog component for confirmations, detail views, and flows.
///
/// Features a theme-invariant 60% navy900 backdrop scrim, responsive full-bleed
/// layout on mobile (<=480px), accessible Escape and scrim dismissal, and sticky headers/footers.
/// Strictly enforces the Zero Color Literals and Zero Emoji policies.
class JoyModal extends StatelessWidget {
  final Widget? title;
  final Widget? content;
  final Widget? footer;
  final bool closable;
  final bool barrierDismissible;
  final double? width;
  final VoidCallback? onClose;

  const JoyModal({
    super.key,
    this.title,
    this.content,
    this.footer,
    this.closable = true,
    this.barrierDismissible = true,
    this.width,
    this.onClose,
  });

  /// Backdrop scrim color using [JoyColorRamps.navy900] at 60% opacity.
  static Color get scrimColor => Color.fromARGB(
        153, // 60% opacity
        (JoyColorRamps.navy900.r * 255.0).round() & 0xff,
        (JoyColorRamps.navy900.g * 255.0).round() & 0xff,
        (JoyColorRamps.navy900.b * 255.0).round() & 0xff,
      );

  /// Shows a [JoyModal] dialog using the standard navigator overlay.
  static Future<T?> show<T>({
    required BuildContext context,
    Widget? title,
    Widget? content,
    Widget? footer,
    bool closable = true,
    bool barrierDismissible = true,
    double? width,
    VoidCallback? onClose,
    WidgetBuilder? builder,
  }) {
    return showGeneralDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierLabel: 'Dismiss modal',
      barrierColor: scrimColor,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (buildContext, animation, secondaryAnimation) {
        final contentWidget = builder != null ? builder(buildContext) : content;
        return JoyModal(
          title: title,
          content: contentWidget,
          footer: footer,
          closable: closable,
          barrierDismissible: barrierDismissible,
          width: width,
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
        return FadeTransition(
          opacity: curved,
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.95, end: 1.0).animate(curved),
            child: child,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final media = MediaQuery.of(context);
    final isMobile = media.size.width <= 480.0;

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
              label: 'Close dialog',
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  minWidth: 44.0,
                  minHeight: 44.0,
                ),
                child: InkWell(
                  key: const Key('joy-modal-close-button'),
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

    final contentBox = Container(
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: isMobile
            ? BorderRadius.zero
            : BorderRadius.circular(JoyRadius.card),
        border: isMobile
            ? null
            : Border.all(
                color: tokens.border.subtle,
                width: 1.0,
              ),
        boxShadow: isMobile ? null : tokens.elevation.level3,
      ),
      child: Column(
        mainAxisSize: isMobile ? MainAxisSize.max : MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          header,
          if (isMobile)
            body
          else
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(JoySpacing.s20),
                child: content ?? const SizedBox.shrink(),
              ),
            ),
          if (footerWidget != null) footerWidget,
        ],
      ),
    );

    final Widget responsiveModal = isMobile
        ? SafeArea(
            child: Material(
              color: tokens.surface.card,
              child: SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: contentBox,
              ),
            ),
          )
        : Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: width ?? 520.0,
                maxHeight: media.size.height * 0.85,
              ),
              child: Material(
                color: tokens.surface.card,
                borderRadius: BorderRadius.circular(JoyRadius.card),
                elevation: 0,
                child: contentBox,
              ),
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
        child: responsiveModal,
      ),
    );
  }
}
