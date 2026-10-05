import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Single item within a [JoyBreadcrumb] hierarchy.
@immutable
class JoyBreadcrumbItem {
  final Widget title;
  final String? href;
  final VoidCallback? onClick;
  final Widget? icon;

  const JoyBreadcrumbItem({
    required this.title,
    this.href,
    this.onClick,
    this.icon,
  });

  JoyBreadcrumbItem.text(
    String text, {
    this.href,
    this.onClick,
    this.icon,
  }) : title = Text(text);
}

/// Joymify Breadcrumb navigation primitive.
///
/// Implements full design-token parity, zero color literals, accessible semantics,
/// and responsive hierarchy display with active leaf highlighting.
class JoyBreadcrumb extends StatefulWidget {
  final List<JoyBreadcrumbItem> items;
  final Widget? separator;
  final String? semanticLabel;

  const JoyBreadcrumb({
    super.key,
    required this.items,
    this.separator,
    this.semanticLabel,
  });

  @override
  State<JoyBreadcrumb> createState() => _JoyBreadcrumbState();
}

class _JoyBreadcrumbState extends State<JoyBreadcrumb> {
  int? _hoveredIndex;

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final count = widget.items.length;

    final defaultSeparator = Text(
      '/',
      style: TextStyle(
        color: tokens.text.muted,
        fontSize: 13.0,
        fontWeight: FontWeight.w400,
      ),
    );

    final effectiveSeparator = widget.separator ?? defaultSeparator;

    return Semantics(
      label: widget.semanticLabel ?? 'Breadcrumb navigation',
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: JoySpacing.s8,
        runSpacing: JoySpacing.s4,
        children: [
          for (var i = 0; i < count; i++) ...[
            _buildItem(
              context: context,
              item: widget.items[i],
              index: i,
              isLeaf: i == count - 1,
              tokens: tokens,
            ),
            if (i < count - 1) effectiveSeparator,
          ],
        ],
      ),
    );
  }

  Widget _buildItem({
    required BuildContext context,
    required JoyBreadcrumbItem item,
    required int index,
    required bool isLeaf,
    required JoyThemeTokens tokens,
  }) {
    final isInteractive = !isLeaf && (item.onClick != null || item.href != null);
    final isHovered = _hoveredIndex == index;

    final Color textColor;
    if (isLeaf) {
      textColor = tokens.text.primary;
    } else if (isHovered) {
      textColor = tokens.accent.hover;
    } else {
      textColor = tokens.text.secondary;
    }

    final textStyle = TextStyle(
      color: textColor,
      fontSize: 14.0,
      fontWeight: isLeaf ? FontWeight.w600 : FontWeight.w400,
      decoration: (isInteractive && isHovered) ? TextDecoration.underline : TextDecoration.none,
      decorationColor: textColor,
    );

    Widget content = DefaultTextStyle.merge(
      style: textStyle,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (item.icon != null) ...[
            IconTheme.merge(
              data: IconThemeData(
                size: 16.0,
                color: textColor,
              ),
              child: item.icon!,
            ),
            const SizedBox(width: JoySpacing.s4),
          ],
          item.title,
        ],
      ),
    );

    if (!isInteractive) {
      return content;
    }

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hoveredIndex = index),
      onExit: (_) => setState(() => _hoveredIndex = null),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: item.onClick,
        child: content,
      ),
    );
  }
}
