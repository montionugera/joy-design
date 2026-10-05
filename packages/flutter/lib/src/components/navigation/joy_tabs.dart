import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';

/// Predefined size options for [JoyTabs].
enum JoyTabsSize {
  sm,
  md,
  lg,
}

/// Visual type for [JoyTabs].
enum JoyTabsType {
  line,
  card,
}

/// Single tab item definition for [JoyTabs].
@immutable
class JoyTabItem {
  final String key;
  final String? label;
  final Widget? labelWidget;
  final Widget? icon;
  final Widget? content;
  final bool disabled;
  final bool closable;

  const JoyTabItem({
    required this.key,
    this.label,
    this.labelWidget,
    this.icon,
    this.content,
    this.disabled = false,
    this.closable = false,
  });

  const JoyTabItem.text({
    required this.key,
    required String this.label,
    this.icon,
    this.content,
    this.disabled = false,
    this.closable = false,
  }) : labelWidget = null;

  const JoyTabItem.widget({
    required this.key,
    required Widget title,
    this.icon,
    this.content,
    this.disabled = false,
    this.closable = false,
  })  : label = null,
        labelWidget = title;

  Widget buildTitle(TextStyle style) {
    if (labelWidget != null) return labelWidget!;
    return Text(label ?? key, style: style);
  }
}

/// Joymify Tabs navigation component.
///
/// Implements full design-token parity, zero color literals, animated sliding indicator,
/// responsive scrollable tab bar on mobile/narrow viewports, and mandatory 44px coarse hit-target bounds.
class JoyTabs extends StatefulWidget {
  final List<JoyTabItem> items;
  final String activeKey;
  final ValueChanged<String>? onChange;
  final JoyTabsSize size;
  final JoyTabsType type;
  final Widget? tabBarExtraContent;
  final String? semanticLabel;

  const JoyTabs({
    super.key,
    required this.items,
    required this.activeKey,
    this.onChange,
    this.size = JoyTabsSize.md,
    this.type = JoyTabsType.line,
    this.tabBarExtraContent,
    this.semanticLabel,
  });

  @override
  State<JoyTabs> createState() => _JoyTabsState();
}

class _JoyTabsState extends State<JoyTabs> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _barKey = GlobalKey();
  final Map<String, GlobalKey> _itemKeys = {};
  String? _hoveredKey;

  double _indicatorLeft = 0.0;
  double _indicatorWidth = 0.0;
  bool _hasMeasured = false;

  @override
  void initState() {
    super.initState();
    _syncItemKeys();
    WidgetsBinding.instance.addPostFrameCallback((_) => _updateIndicator(animateScroll: false));
  }

  @override
  void didUpdateWidget(JoyTabs oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.items != oldWidget.items) {
      _syncItemKeys();
    }
    if (widget.activeKey != oldWidget.activeKey ||
        widget.items != oldWidget.items ||
        widget.size != oldWidget.size ||
        widget.type != oldWidget.type) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _updateIndicator(animateScroll: true));
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _syncItemKeys() {
    final existingKeys = Set<String>.from(_itemKeys.keys);
    final currentKeys = widget.items.map((i) => i.key).toSet();

    for (final key in currentKeys) {
      if (!_itemKeys.containsKey(key)) {
        _itemKeys[key] = GlobalKey();
      }
    }
    for (final oldKey in existingKeys.difference(currentKeys)) {
      _itemKeys.remove(oldKey);
    }
  }

  void _updateIndicator({bool animateScroll = false}) {
    if (!mounted) return;

    final barContext = _barKey.currentContext;
    final itemContext = _itemKeys[widget.activeKey]?.currentContext;

    if (barContext != null && itemContext != null) {
      final barRender = barContext.findRenderObject() as RenderBox?;
      final itemRender = itemContext.findRenderObject() as RenderBox?;

      if (barRender != null && itemRender != null) {
        final offset = itemRender.localToGlobal(Offset.zero, ancestor: barRender);
        final width = itemRender.size.width;

        setState(() {
          _indicatorLeft = offset.dx;
          _indicatorWidth = width;
          _hasMeasured = true;
        });

        if (animateScroll && _scrollController.hasClients) {
          final scrollOffset = _scrollController.offset;
          final viewWidth = _scrollController.position.viewportDimension;
          final itemGlobalLeft = offset.dx + scrollOffset;
          final itemGlobalRight = itemGlobalLeft + width;

          if (itemGlobalLeft < scrollOffset) {
            _scrollController.animateTo(
              math.max(0.0, itemGlobalLeft - JoySpacing.s16),
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeInOut,
            );
          } else if (itemGlobalRight > scrollOffset + viewWidth) {
            _scrollController.animateTo(
              math.min(
                _scrollController.position.maxScrollExtent,
                itemGlobalRight - viewWidth + JoySpacing.s16,
              ),
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeInOut,
            );
          }
        }
      }
    }
  }

  double _getTabHeight() {
    switch (widget.size) {
      case JoyTabsSize.sm:
        return 34.0;
      case JoyTabsSize.md:
        return 42.0;
      case JoyTabsSize.lg:
        return 50.0;
    }
  }

  double _getFontSize() {
    switch (widget.size) {
      case JoyTabsSize.sm:
        return 13.0;
      case JoyTabsSize.md:
        return 14.0;
      case JoyTabsSize.lg:
        return 16.0;
    }
  }

  double _getIconSize() {
    switch (widget.size) {
      case JoyTabsSize.sm:
        return 14.0;
      case JoyTabsSize.md:
        return 16.0;
      case JoyTabsSize.lg:
        return 18.0;
    }
  }

  void _handleTabTap(JoyTabItem item) {
    if (item.disabled) return;
    if (item.key != widget.activeKey) {
      widget.onChange?.call(item.key);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final tabHeight = _getTabHeight();
    final fontSize = _getFontSize();
    final iconSize = _getIconSize();

    final activeIndex = widget.items.indexWhere((i) => i.key == widget.activeKey);
    final activeItem = activeIndex != -1 ? widget.items[activeIndex] : null;

    final isCard = widget.type == JoyTabsType.card;

    return Semantics(
      label: widget.semanticLabel ?? 'Tabs navigation',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Tab bar header container
          Container(
            decoration: BoxDecoration(
              border: isCard
                  ? null
                  : Border(
                      bottom: BorderSide(
                        color: tokens.border.subtle,
                        width: 1.0,
                      ),
                    ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    controller: _scrollController,
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    child: Stack(
                      key: _barKey,
                      alignment: Alignment.centerLeft,
                      children: [
                        // Sliding indicator layer
                        if (_hasMeasured && _indicatorWidth > 0)
                          AnimatedPositioned(
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.easeInOut,
                            left: _indicatorLeft,
                            bottom: isCard ? null : 0.0,
                            top: isCard ? 0.0 : null,
                            width: _indicatorWidth,
                            height: isCard ? tabHeight : 2.5,
                            child: isCard
                                ? Container(
                                    decoration: BoxDecoration(
                                      color: tokens.surface.card,
                                      borderRadius: BorderRadius.circular(JoyRadius.control),
                                      border: Border.all(
                                        color: tokens.border.subtle,
                                        width: 1.0,
                                      ),
                                    ),
                                  )
                                : Container(
                                    decoration: BoxDecoration(
                                      color: tokens.accent.base,
                                      borderRadius: BorderRadius.circular(JoyRadius.pill),
                                    ),
                                  ),
                          ),

                        // Tab buttons row
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: widget.items.map((item) {
                            final isActive = item.key == widget.activeKey;
                            final isHovered = _hoveredKey == item.key && !item.disabled;

                            final Color textColor;
                            if (item.disabled) {
                              textColor = tokens.text.disabled;
                            } else if (isActive) {
                              textColor = tokens.accent.base;
                            } else if (isHovered) {
                              textColor = tokens.accent.hover;
                            } else {
                              textColor = tokens.text.secondary;
                            }

                            final textStyle = TextStyle(
                              fontSize: fontSize,
                              fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                              color: textColor,
                              height: 1.2,
                            );

                            Widget tabContent = Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (item.icon != null) ...[
                                  IconTheme.merge(
                                    data: IconThemeData(
                                      size: iconSize,
                                      color: textColor,
                                    ),
                                    child: item.icon!,
                                  ),
                                  const SizedBox(width: JoySpacing.s8),
                                ],
                                item.buildTitle(textStyle),
                              ],
                            );

                            return MouseRegion(
                              key: _itemKeys[item.key],
                              cursor: item.disabled
                                  ? SystemMouseCursors.forbidden
                                  : SystemMouseCursors.click,
                              onEnter: (_) {
                                if (!item.disabled) {
                                  setState(() => _hoveredKey = item.key);
                                }
                              },
                              onExit: (_) {
                                if (_hoveredKey == item.key) {
                                  setState(() => _hoveredKey = null);
                                }
                              },
                              child: GestureDetector(
                                behavior: HitTestBehavior.opaque,
                                onTap: () => _handleTabTap(item),
                                child: ConstrainedBox(
                                  // Enforce >= 44x44px touch target bounds
                                  constraints: BoxConstraints(
                                    minHeight: math.max(44.0, tabHeight),
                                    minWidth: 44.0,
                                  ),
                                  child: Container(
                                    height: tabHeight,
                                    padding: EdgeInsets.symmetric(
                                      horizontal: isCard ? JoySpacing.s16 : JoySpacing.s12,
                                    ),
                                    alignment: Alignment.center,
                                    decoration: isCard && !isActive
                                        ? BoxDecoration(
                                            color: tokens.surface.sunken,
                                            borderRadius: const BorderRadius.vertical(
                                              top: Radius.circular(JoyRadius.control),
                                            ),
                                            border: Border.all(
                                              color: tokens.border.subtle,
                                              width: 0.5,
                                            ),
                                          )
                                        : null,
                                    child: tabContent,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
                if (widget.tabBarExtraContent != null) ...[
                  const SizedBox(width: JoySpacing.s12),
                  widget.tabBarExtraContent!,
                ],
              ],
            ),
          ),

          // Active tab content panel
          if (activeItem?.content != null) ...[
            const SizedBox(height: JoySpacing.s16),
            activeItem!.content!,
          ],
        ],
      ),
    );
  }
}
