import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Alignment mode for [JoyTimeline].
enum JoyTimelineMode {
  left,
  right,
  alternate,
}

/// Semantic status variant for [JoyTimelineItem] node dots.
enum JoyTimelineStatus {
  accent,
  success,
  warning,
  danger,
  info,
  muted,
}

/// Single event entry for [JoyTimeline].
@immutable
class JoyTimelineItem {
  final Widget? title;
  final Widget content;
  final Widget? timestamp;
  final Widget? dot;
  final Color? color;
  final JoyTimelineStatus status;

  const JoyTimelineItem({
    this.title,
    required this.content,
    this.timestamp,
    this.dot,
    this.color,
    this.status = JoyTimelineStatus.accent,
  });

  JoyTimelineItem.text({
    String? title,
    required String content,
    String? timestamp,
    this.dot,
    this.color,
    this.status = JoyTimelineStatus.accent,
  })  : title = title != null ? Text(title) : null,
        content = Text(content),
        timestamp = timestamp != null ? Text(timestamp) : null;
}

/// Joymify Timeline workflow primitive.
///
/// Implements full design-token parity, zero color literals, customizable node dots,
/// connecting stem lines, and left / right / alternate layout modes.
class JoyTimeline extends StatelessWidget {
  final List<JoyTimelineItem> items;
  final JoyTimelineMode mode;
  final Widget? pending;
  final bool reverse;
  final String? semanticLabel;

  const JoyTimeline({
    super.key,
    required this.items,
    this.mode = JoyTimelineMode.left,
    this.pending,
    this.reverse = false,
    this.semanticLabel,
  });

  Color _resolveDotColor(JoyTimelineItem item, JoyThemeTokens tokens) {
    if (item.color != null) return item.color!;

    switch (item.status) {
      case JoyTimelineStatus.accent:
        return tokens.accent.base;
      case JoyTimelineStatus.success:
        return tokens.status.success.fg;
      case JoyTimelineStatus.warning:
        return tokens.status.warning.fg;
      case JoyTimelineStatus.danger:
        return tokens.status.danger.fg;
      case JoyTimelineStatus.info:
        return tokens.status.info.fg;
      case JoyTimelineStatus.muted:
        return tokens.text.muted;
    }
  }

  Widget _buildDot(JoyTimelineItem item, JoyThemeTokens tokens) {
    if (item.dot != null) return item.dot!;

    final dotColor = _resolveDotColor(item, tokens);

    return Container(
      width: 10.0,
      height: 10.0,
      decoration: BoxDecoration(
        color: tokens.surface.card,
        shape: BoxShape.circle,
        border: Border.all(
          color: dotColor,
          width: 2.0,
        ),
      ),
    );
  }

  Widget _buildContentBlock({
    required JoyTimelineItem item,
    required JoyThemeTokens tokens,
    CrossAxisAlignment alignment = CrossAxisAlignment.start,
  }) {
    return Column(
      crossAxisAlignment: alignment,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (item.title != null) ...[
          DefaultTextStyle.merge(
            style: TextStyle(
              color: tokens.text.primary,
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
            ),
            child: item.title!,
          ),
          const SizedBox(height: JoySpacing.s2),
        ],
        DefaultTextStyle.merge(
          style: TextStyle(
            color: tokens.text.secondary,
            fontSize: 13.0,
            fontWeight: FontWeight.w400,
          ),
          child: item.content,
        ),
        if (item.timestamp != null) ...[
          const SizedBox(height: JoySpacing.s4),
          DefaultTextStyle.merge(
            style: TextStyle(
              color: tokens.text.muted,
              fontSize: 12.0,
              fontWeight: FontWeight.w400,
            ),
            child: item.timestamp!,
          ),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final displayItems = reverse ? items.reversed.toList() : items;
    final count = displayItems.length;

    return Semantics(
      label: semanticLabel ?? 'Timeline events',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < count; i++)
            _buildTimelineRow(
              context: context,
              item: displayItems[i],
              index: i,
              isLast: i == count - 1 && pending == null,
              tokens: tokens,
            ),
          if (pending != null)
            _buildPendingRow(context: context, tokens: tokens),
        ],
      ),
    );
  }

  Widget _buildTimelineRow({
    required BuildContext context,
    required JoyTimelineItem item,
    required int index,
    required bool isLast,
    required JoyThemeTokens tokens,
  }) {
    final dotWidget = _buildDot(item, tokens);

    switch (mode) {
      case JoyTimelineMode.left:
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 24.0,
                child: Column(
                  children: [
                    const SizedBox(height: 4.0),
                    dotWidget,
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2.0,
                          color: tokens.border.subtle,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: JoySpacing.s12),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0.0 : JoySpacing.s16),
                  child: _buildContentBlock(item: item, tokens: tokens),
                ),
              ),
            ],
          ),
        );

      case JoyTimelineMode.right:
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0.0 : JoySpacing.s16),
                  child: _buildContentBlock(
                    item: item,
                    tokens: tokens,
                    alignment: CrossAxisAlignment.end,
                  ),
                ),
              ),
              const SizedBox(width: JoySpacing.s12),
              SizedBox(
                width: 24.0,
                child: Column(
                  children: [
                    const SizedBox(height: 4.0),
                    dotWidget,
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2.0,
                          color: tokens.border.subtle,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );

      case JoyTimelineMode.alternate:
        final isEven = index.isEven;
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left side
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0.0 : JoySpacing.s16),
                  child: isEven
                      ? (item.timestamp != null
                          ? Align(
                              alignment: Alignment.topRight,
                              child: DefaultTextStyle.merge(
                                style: TextStyle(
                                  color: tokens.text.muted,
                                  fontSize: 12.0,
                                ),
                                child: item.timestamp!,
                              ),
                            )
                          : const SizedBox.shrink())
                      : _buildContentBlock(
                          item: item,
                          tokens: tokens,
                          alignment: CrossAxisAlignment.end,
                        ),
                ),
              ),
              const SizedBox(width: JoySpacing.s8),

              // Center stem & dot
              SizedBox(
                width: 24.0,
                child: Column(
                  children: [
                    const SizedBox(height: 4.0),
                    dotWidget,
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2.0,
                          color: tokens.border.subtle,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: JoySpacing.s8),

              // Right side
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: isLast ? 0.0 : JoySpacing.s16),
                  child: isEven
                      ? _buildContentBlock(
                          item: item,
                          tokens: tokens,
                          alignment: CrossAxisAlignment.start,
                        )
                      : (item.timestamp != null
                          ? Align(
                              alignment: Alignment.topLeft,
                              child: DefaultTextStyle.merge(
                                style: TextStyle(
                                  color: tokens.text.muted,
                                  fontSize: 12.0,
                                ),
                                child: item.timestamp!,
                              ),
                            )
                          : const SizedBox.shrink()),
                ),
              ),
            ],
          ),
        );
    }
  }

  Widget _buildPendingRow({
    required BuildContext context,
    required JoyThemeTokens tokens,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 24.0,
          child: Column(
            children: [
              const SizedBox(height: 4.0),
              Container(
                width: 8.0,
                height: 8.0,
                decoration: BoxDecoration(
                  color: tokens.border.subtle,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: JoySpacing.s12),
        Expanded(
          child: DefaultTextStyle.merge(
            style: TextStyle(
              color: tokens.text.muted,
              fontSize: 13.0,
            ),
            child: pending!,
          ),
        ),
      ],
    );
  }
}
