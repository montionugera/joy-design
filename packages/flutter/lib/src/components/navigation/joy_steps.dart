import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Status of an individual step or overall progress in [JoySteps].
enum JoyStepStatus {
  wait,
  process,
  finish,
  error,
}

/// Predefined size options for [JoySteps].
enum JoyStepsSize {
  sm,
  md,
}

/// Single step configuration in [JoySteps].
@immutable
class JoyStepItem {
  final Widget title;
  final Widget? subTitle;
  final Widget? description;
  final Widget? icon;
  final JoyStepStatus? status;
  final bool disabled;

  const JoyStepItem({
    required this.title,
    this.subTitle,
    this.description,
    this.icon,
    this.status,
    this.disabled = false,
  });

  JoyStepItem.text({
    required String title,
    String? subTitle,
    String? description,
    this.icon,
    this.status,
    this.disabled = false,
  })  : title = Text(title),
        subTitle = subTitle != null ? Text(subTitle) : null,
        description = description != null ? Text(description) : null;
}

/// Joymify Steps workflow primitive.
///
/// Implements full design-token parity, zero color literals, vector status icons,
/// token status lines, and flexible horizontal / vertical orientations.
class JoySteps extends StatelessWidget {
  final int current;
  final List<JoyStepItem> items;
  final Axis direction;
  final JoyStepStatus? status;
  final JoyStepsSize size;
  final ValueChanged<int>? onChange;
  final String? semanticLabel;

  const JoySteps({
    super.key,
    required this.current,
    required this.items,
    this.direction = Axis.horizontal,
    this.status,
    this.size = JoyStepsSize.md,
    this.onChange,
    this.semanticLabel,
  });

  JoyStepStatus _resolveStatus(int index, JoyStepItem item) {
    if (item.status != null) return item.status!;
    if (index < current) return JoyStepStatus.finish;
    if (index == current) return status ?? JoyStepStatus.process;
    return JoyStepStatus.wait;
  }

  Widget _buildStepNode({
    required BuildContext context,
    required int index,
    required JoyStepItem item,
    required JoyStepStatus stepStatus,
    required JoyThemeTokens tokens,
  }) {
    final double nodeSize = size == JoyStepsSize.sm ? 24.0 : 32.0;
    final double iconSize = size == JoyStepsSize.sm ? 14.0 : 16.0;
    final double fontSize = size == JoyStepsSize.sm ? 12.0 : 14.0;

    final Color nodeBorder;
    final Color nodeBg;
    final Color fgColor;

    switch (stepStatus) {
      case JoyStepStatus.finish:
        nodeBorder = tokens.accent.base;
        nodeBg = tokens.surface.card;
        fgColor = tokens.accent.base;
      case JoyStepStatus.process:
        nodeBorder = tokens.accent.base;
        nodeBg = tokens.accent.base;
        fgColor = tokens.text.onAccent;
      case JoyStepStatus.wait:
        nodeBorder = tokens.border.subtle;
        nodeBg = tokens.surface.card;
        fgColor = tokens.text.muted;
      case JoyStepStatus.error:
        nodeBorder = tokens.status.danger.fg;
        nodeBg = tokens.status.danger.bg;
        fgColor = tokens.status.danger.fg;
    }

    Widget content;
    if (item.icon != null) {
      content = IconTheme.merge(
        data: IconThemeData(size: iconSize, color: fgColor),
        child: item.icon!,
      );
    } else {
      switch (stepStatus) {
        case JoyStepStatus.finish:
          content = JoyIcon(
            JoyIcons.check,
            customSize: iconSize,
            color: fgColor,
          );
        case JoyStepStatus.error:
          content = JoyIcon(
            JoyIcons.close,
            customSize: iconSize,
            color: fgColor,
          );
        case JoyStepStatus.process:
        case JoyStepStatus.wait:
          content = Text(
            '${index + 1}',
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: fgColor,
            ),
          );
      }
    }

    return Container(
      width: nodeSize,
      height: nodeSize,
      decoration: BoxDecoration(
        color: nodeBg,
        shape: BoxShape.circle,
        border: Border.all(
          color: nodeBorder,
          width: 1.5,
        ),
      ),
      child: Center(child: content),
    );
  }

  Widget _buildStepTitle({
    required BuildContext context,
    required JoyStepItem item,
    required JoyStepStatus stepStatus,
    required JoyThemeTokens tokens,
  }) {
    final double titleFontSize = size == JoyStepsSize.sm ? 13.0 : 14.0;
    final double descFontSize = size == JoyStepsSize.sm ? 12.0 : 13.0;

    final Color titleColor;
    switch (stepStatus) {
      case JoyStepStatus.finish:
      case JoyStepStatus.process:
        titleColor = tokens.text.primary;
      case JoyStepStatus.wait:
        titleColor = tokens.text.muted;
      case JoyStepStatus.error:
        titleColor = tokens.status.danger.fg;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            DefaultTextStyle.merge(
              style: TextStyle(
                color: titleColor,
                fontSize: titleFontSize,
                fontWeight: stepStatus == JoyStepStatus.process ? FontWeight.w600 : FontWeight.w500,
              ),
              child: item.title,
            ),
            if (item.subTitle != null) ...[
              const SizedBox(width: JoySpacing.s4),
              DefaultTextStyle.merge(
                style: TextStyle(
                  color: tokens.text.muted,
                  fontSize: descFontSize,
                  fontWeight: FontWeight.w400,
                ),
                child: item.subTitle!,
              ),
            ],
          ],
        ),
        if (item.description != null) ...[
          const SizedBox(height: JoySpacing.s2),
          DefaultTextStyle.merge(
            style: TextStyle(
              color: tokens.text.secondary,
              fontSize: descFontSize,
              fontWeight: FontWeight.w400,
            ),
            child: item.description!,
          ),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;
    final count = items.length;

    if (direction == Axis.vertical) {
      return Semantics(
        label: semanticLabel ?? 'Steps navigation',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < count; i++)
              _buildVerticalStep(
                context: context,
                index: i,
                isLast: i == count - 1,
                tokens: tokens,
              ),
          ],
        ),
      );
    }

    return Semantics(
      label: semanticLabel ?? 'Steps navigation',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < count; i++)
            Expanded(
              flex: i == count - 1 ? 0 : 1,
              child: _buildHorizontalStep(
                context: context,
                index: i,
                isLast: i == count - 1,
                tokens: tokens,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHorizontalStep({
    required BuildContext context,
    required int index,
    required bool isLast,
    required JoyThemeTokens tokens,
  }) {
    final item = items[index];
    final stepStatus = _resolveStatus(index, item);
    final isInteractive = onChange != null && !item.disabled;

    Widget stepWidget = Row(
      mainAxisSize: isLast ? MainAxisSize.min : MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _buildStepNode(
          context: context,
          index: index,
          item: item,
          stepStatus: stepStatus,
          tokens: tokens,
        ),
        const SizedBox(width: JoySpacing.s8),
        _buildStepTitle(
          context: context,
          item: item,
          stepStatus: stepStatus,
          tokens: tokens,
        ),
        if (!isLast) ...[
          const SizedBox(width: JoySpacing.s8),
          Expanded(
            child: Container(
              height: 1.5,
              color: index < current ? tokens.accent.base : tokens.border.subtle,
            ),
          ),
          const SizedBox(width: JoySpacing.s8),
        ],
      ],
    );

    if (isInteractive) {
      stepWidget = MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => onChange?.call(index),
          child: stepWidget,
        ),
      );
    }

    return stepWidget;
  }

  Widget _buildVerticalStep({
    required BuildContext context,
    required int index,
    required bool isLast,
    required JoyThemeTokens tokens,
  }) {
    final item = items[index];
    final stepStatus = _resolveStatus(index, item);
    final isInteractive = onChange != null && !item.disabled;

    Widget stepWidget = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            _buildStepNode(
              context: context,
              index: index,
              item: item,
              stepStatus: stepStatus,
              tokens: tokens,
            ),
            if (!isLast)
              Container(
                width: 1.5,
                height: 36.0,
                color: index < current ? tokens.accent.base : tokens.border.subtle,
              ),
          ],
        ),
        const SizedBox(width: JoySpacing.s12),
        Padding(
          padding: EdgeInsets.only(top: size == JoyStepsSize.sm ? 2.0 : 5.0),
          child: _buildStepTitle(
            context: context,
            item: item,
            stepStatus: stepStatus,
            tokens: tokens,
          ),
        ),
      ],
    );

    if (isInteractive) {
      stepWidget = MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => onChange?.call(index),
          child: stepWidget,
        ),
      );
    }

    return stepWidget;
  }
}
