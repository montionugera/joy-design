import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../primitives/joy_icon.dart';

/// Joymify Pagination component.
///
/// Implements full design-token parity, zero color literals, windowed page numbers,
/// vector chevrons, auto-compact responsive layout under 480px, and mandatory 44px coarse hit-target bounds.
class JoyPagination extends StatelessWidget {
  final int current;
  final int total;
  final int pageSize;
  final ValueChanged<int>? onChange;
  final bool showSizeChanger;
  final ValueChanged<int>? onPageSizeChange;
  final List<int> pageSizeOptions;
  final bool simple;
  final bool disabled;
  final String? semanticLabel;

  static const int _ellipsisPrev = -1;
  static const int _ellipsisNext = -2;

  const JoyPagination({
    super.key,
    required this.current,
    required this.total,
    this.pageSize = 10,
    this.onChange,
    this.showSizeChanger = false,
    this.onPageSizeChange,
    this.pageSizeOptions = const [10, 20, 50, 100],
    this.simple = false,
    this.disabled = false,
    this.semanticLabel,
  });

  int get totalPages => math.max(1, (total / pageSize).ceil());
  int get currentPage => current.clamp(1, totalPages);

  List<int> _generatePages() {
    final pages = <int>[];
    final count = totalPages;
    final curr = currentPage;

    if (count <= 7) {
      for (var i = 1; i <= count; i++) {
        pages.add(i);
      }
    } else {
      if (curr <= 4) {
        for (var i = 1; i <= 5; i++) {
          pages.add(i);
        }
        pages.add(_ellipsisNext);
        pages.add(count);
      } else if (curr >= count - 3) {
        pages.add(1);
        pages.add(_ellipsisPrev);
        for (var i = count - 4; i <= count; i++) {
          pages.add(i);
        }
      } else {
        pages.add(1);
        pages.add(_ellipsisPrev);
        pages.add(curr - 1);
        pages.add(curr);
        pages.add(curr + 1);
        pages.add(_ellipsisNext);
        pages.add(count);
      }
    }

    return pages;
  }

  Widget _buildNavButton({
    required BuildContext context,
    required bool isPrev,
    required JoyThemeTokens tokens,
  }) {
    final canNavigate = isPrev
        ? (!disabled && currentPage > 1)
        : (!disabled && currentPage < totalPages);

    final targetPage = isPrev ? currentPage - 1 : currentPage + 1;

    return MouseRegion(
      cursor: canNavigate ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: canNavigate ? () => onChange?.call(targetPage) : null,
        child: ConstrainedBox(
          // Enforce >= 44x44px touch target bounds
          constraints: const BoxConstraints(
            minWidth: 44.0,
            minHeight: 44.0,
          ),
          child: Center(
            child: Container(
              width: 32.0,
              height: 32.0,
              decoration: BoxDecoration(
                color: tokens.surface.card,
                borderRadius: BorderRadius.circular(JoyRadius.control),
                border: Border.all(
                  color: tokens.border.subtle,
                  width: 1.0,
                ),
              ),
              child: Center(
                child: JoyIcon(
                  isPrev ? JoyIcons.chevronLeft : JoyIcons.chevronRight,
                  size: JoyIconSize.sm,
                  color: canNavigate ? tokens.text.primary : tokens.text.disabled,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPageButton({
    required BuildContext context,
    required int page,
    required JoyThemeTokens tokens,
  }) {
    final isEllipsis = page == _ellipsisPrev || page == _ellipsisNext;
    final isActive = page == currentPage;

    if (isEllipsis) {
      final jumpPage = page == _ellipsisPrev
          ? math.max(1, currentPage - 5)
          : math.min(totalPages, currentPage + 5);

      return MouseRegion(
        cursor: disabled ? SystemMouseCursors.forbidden : SystemMouseCursors.click,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: disabled ? null : () => onChange?.call(jumpPage),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              minWidth: 44.0,
              minHeight: 44.0,
            ),
            child: Center(
              child: SizedBox(
                width: 32.0,
                height: 32.0,
                child: Center(
                  child: Text(
                    '•••',
                    style: TextStyle(
                      color: tokens.text.muted,
                      fontSize: 12.0,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return MouseRegion(
      cursor: disabled
          ? SystemMouseCursors.forbidden
          : (isActive ? SystemMouseCursors.basic : SystemMouseCursors.click),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: (disabled || isActive) ? null : () => onChange?.call(page),
        child: ConstrainedBox(
          // Enforce >= 44x44px touch target bounds
          constraints: const BoxConstraints(
            minWidth: 44.0,
            minHeight: 44.0,
          ),
          child: Center(
            child: Container(
              width: 32.0,
              height: 32.0,
              decoration: BoxDecoration(
                color: tokens.surface.card,
                borderRadius: BorderRadius.circular(JoyRadius.control),
                border: Border.all(
                  color: isActive ? tokens.accent.base : tokens.border.subtle,
                  width: isActive ? 1.5 : 1.0,
                ),
              ),
              child: Center(
                child: Text(
                  '$page',
                  style: TextStyle(
                    color: disabled
                        ? tokens.text.disabled
                        : (isActive ? tokens.accent.base : tokens.text.primary),
                    fontSize: 14.0,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSizeChanger(BuildContext context, JoyThemeTokens tokens) {
    return PopupMenuButton<int>(
      enabled: !disabled,
      initialValue: pageSize,
      onSelected: (size) => onPageSizeChange?.call(size),
      color: tokens.surface.card,
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(JoyRadius.control),
        side: BorderSide(color: tokens.border.subtle, width: 1.0),
      ),
      itemBuilder: (context) => pageSizeOptions
          .map(
            (size) => PopupMenuItem<int>(
              value: size,
              child: Text(
                '$size / page',
                style: TextStyle(
                  color: size == pageSize ? tokens.accent.base : tokens.text.primary,
                  fontWeight: size == pageSize ? FontWeight.w600 : FontWeight.w400,
                  fontSize: 13.0,
                ),
              ),
            ),
          )
          .toList(),
      child: ConstrainedBox(
        constraints: const BoxConstraints(
          minWidth: 44.0,
          minHeight: 44.0,
        ),
        child: Center(
          child: Container(
            height: 32.0,
            padding: const EdgeInsets.symmetric(horizontal: JoySpacing.s8),
            decoration: BoxDecoration(
              color: tokens.surface.card,
              borderRadius: BorderRadius.circular(JoyRadius.control),
              border: Border.all(
                color: tokens.border.subtle,
                width: 1.0,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '$pageSize / page',
                  style: TextStyle(
                    color: disabled ? tokens.text.disabled : tokens.text.primary,
                    fontSize: 13.0,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(width: JoySpacing.s4),
                JoyIcon(
                  JoyIcons.chevronDown,
                  size: JoyIconSize.sm,
                  color: disabled ? tokens.text.disabled : tokens.text.secondary,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;

    return Semantics(
      label: semanticLabel ?? 'Pagination navigation',
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isCompact = simple || constraints.maxWidth <= 480.0;

          if (isCompact) {
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildNavButton(context: context, isPrev: true, tokens: tokens),
                const SizedBox(width: JoySpacing.s8),
                Text(
                  '$currentPage / $totalPages',
                  style: TextStyle(
                    color: disabled ? tokens.text.disabled : tokens.text.primary,
                    fontSize: 14.0,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(width: JoySpacing.s8),
                _buildNavButton(context: context, isPrev: false, tokens: tokens),
                if (showSizeChanger) ...[
                  const SizedBox(width: JoySpacing.s8),
                  _buildSizeChanger(context, tokens),
                ],
              ],
            );
          }

          final pages = _generatePages();

          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildNavButton(context: context, isPrev: true, tokens: tokens),
              const SizedBox(width: JoySpacing.s4),
              ...pages.map((p) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2.0),
                    child: _buildPageButton(context: context, page: p, tokens: tokens),
                  )),
              const SizedBox(width: JoySpacing.s4),
              _buildNavButton(context: context, isPrev: false, tokens: tokens),
              if (showSizeChanger) ...[
                const SizedBox(width: JoySpacing.s12),
                _buildSizeChanger(context, tokens),
              ],
            ],
          );
        },
      ),
    );
  }
}
