import 'package:flutter/material.dart';
import '../../tokens/joy_tokens.g.dart';
import '../form/joy_checkbox.dart';
import '../primitives/joy_icon.dart';
import '../feedback/joy_spin.dart';

/// Sort direction for [JoyTable].
enum JoySortDirection {
  none,
  asc,
  desc;

  JoySortDirection next() {
    switch (this) {
      case JoySortDirection.none:
        return JoySortDirection.asc;
      case JoySortDirection.asc:
        return JoySortDirection.desc;
      case JoySortDirection.desc:
        return JoySortDirection.none;
    }
  }
}

/// Display variant for [JoyTable].
enum JoyTableVariant {
  auto,
  table,
  stack,
}

/// Column definition for [JoyTable].
@immutable
class JoyTableColumn<T> {
  final String key;
  final String title;
  final double? width;
  final bool sortable;
  final TextAlign align;
  final Widget Function(BuildContext context, T record, int index)? render;

  const JoyTableColumn({
    required this.key,
    required this.title,
    this.width,
    this.sortable = false,
    this.align = TextAlign.left,
    this.render,
  });
}

/// High-density financial data table with sorting, row selection,
/// striped rows, borders, and auto-adapting mobile card stack.
///
/// Strictly adheres to zero color literals and zero OS emoji rules.
class JoyTable<T> extends StatefulWidget {
  final List<JoyTableColumn<T>> columns;
  final List<T> dataSource;
  final Object Function(T record)? rowKey;
  final bool striped;
  final bool bordered;
  final bool loading;
  final JoyTableVariant variant;
  final String? sortColumnKey;
  final JoySortDirection? sortDirection;
  final void Function(String columnKey, JoySortDirection direction)? onSort;
  final Set<Object>? selectedRowKeys;
  final ValueChanged<Set<Object>>? onSelectionChanged;
  final Widget? empty;

  const JoyTable({
    super.key,
    required this.columns,
    required this.dataSource,
    this.rowKey,
    this.striped = false,
    this.bordered = false,
    this.loading = false,
    this.variant = JoyTableVariant.auto,
    this.sortColumnKey,
    this.sortDirection,
    this.onSort,
    this.selectedRowKeys,
    this.onSelectionChanged,
    this.empty,
  });

  @override
  State<JoyTable<T>> createState() => _JoyTableState<T>();
}

class _JoyTableState<T> extends State<JoyTable<T>> {
  String? _internalSortKey;
  JoySortDirection _internalSortDir = JoySortDirection.none;
  int? _hoveredRowIndex;

  String? get _activeSortKey => widget.sortColumnKey ?? _internalSortKey;
  JoySortDirection get _activeSortDir => widget.sortDirection ?? _internalSortDir;

  Object _getRowKey(T record, int index) {
    if (widget.rowKey != null) {
      return widget.rowKey!(record);
    }
    return index;
  }

  void _handleSort(JoyTableColumn<T> column) {
    if (!column.sortable) return;

    final currentKey = _activeSortKey;
    final currentDir = _activeSortDir;
    final JoySortDirection nextDir;

    if (currentKey == column.key) {
      nextDir = currentDir.next();
    } else {
      nextDir = JoySortDirection.asc;
    }

    if (widget.sortColumnKey == null) {
      setState(() {
        _internalSortKey = nextDir == JoySortDirection.none ? null : column.key;
        _internalSortDir = nextDir;
      });
    }

    widget.onSort?.call(column.key, nextDir);
  }

  void _handleSelectAll(bool? checked) {
    if (widget.onSelectionChanged == null) return;

    final currentKeys = Set<Object>.from(widget.selectedRowKeys ?? const <Object>{});
    final pageKeys = <Object>{};
    for (int i = 0; i < widget.dataSource.length; i++) {
      pageKeys.add(_getRowKey(widget.dataSource[i], i));
    }

    if (checked == true) {
      currentKeys.addAll(pageKeys);
    } else {
      currentKeys.removeAll(pageKeys);
    }

    widget.onSelectionChanged!(currentKeys);
  }

  void _handleSelectRow(Object key, bool? checked) {
    if (widget.onSelectionChanged == null) return;

    final updated = Set<Object>.from(widget.selectedRowKeys ?? const <Object>{});
    if (checked == true) {
      updated.add(key);
    } else {
      updated.remove(key);
    }

    widget.onSelectionChanged!(updated);
  }

  bool? _computeSelectAllState() {
    if (widget.dataSource.isEmpty) return false;
    final selected = widget.selectedRowKeys;
    if (selected == null || selected.isEmpty) return false;

    int matchCount = 0;
    for (int i = 0; i < widget.dataSource.length; i++) {
      final key = _getRowKey(widget.dataSource[i], i);
      if (selected.contains(key)) {
        matchCount++;
      }
    }

    if (matchCount == 0) return false;
    if (matchCount == widget.dataSource.length) return true;
    return null; // indeterminate
  }

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isStack = widget.variant == JoyTableVariant.stack ||
            (widget.variant == JoyTableVariant.auto && constraints.maxWidth <= 480.0);

        Widget content = isStack
            ? _buildMobileStack(context, tokens)
            : _buildDataTable(context, tokens);

        if (widget.loading) {
          content = Stack(
            children: [
              content,
              Positioned.fill(
                child: Container(
                  color: Color.fromARGB(
                    140,
                    (tokens.surface.card.r * 255.0).round() & 0xff,
                    (tokens.surface.card.g * 255.0).round() & 0xff,
                    (tokens.surface.card.b * 255.0).round() & 0xff,
                  ),
                  child: Center(
                    child: JoySpin(
                      tip: 'Loading data...',
                      color: tokens.accent.base,
                    ),
                  ),
                ),
              ),
            ],
          );
        }

        return content;
      },
    );
  }

  Widget _buildDataTable(BuildContext context, JoyThemeTokens tokens) {
    final hasSelection = widget.selectedRowKeys != null || widget.onSelectionChanged != null;
    final selectAllState = _computeSelectAllState();

    final borderSide = BorderSide(
      color: tokens.border.subtle,
      width: 1.0,
    );

    return Container(
      decoration: BoxDecoration(
        color: tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        border: widget.bordered
            ? Border.all(color: tokens.border.subtle, width: 1.0)
            : null,
      ),
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minWidth: 480.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header Row
              Container(
                decoration: BoxDecoration(
                  color: tokens.surface.sunken,
                  border: Border(bottom: borderSide),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (hasSelection)
                      Container(
                        width: 48.0,
                        height: 44.0,
                        alignment: Alignment.center,
                        decoration: widget.bordered
                            ? BoxDecoration(border: Border(right: borderSide))
                            : null,
                        child: JoyCheckbox(
                          value: selectAllState,
                          onChanged: _handleSelectAll,
                        ),
                      ),
                    for (int i = 0; i < widget.columns.length; i++)
                      _buildHeaderCell(widget.columns[i], tokens, borderSide, i == widget.columns.length - 1),
                  ],
                ),
              ),
              // Body Rows
              if (widget.dataSource.isEmpty)
                Container(
                  width: 480.0,
                  padding: const EdgeInsets.symmetric(
                    vertical: JoySpacing.s32,
                    horizontal: JoySpacing.s16,
                  ),
                  alignment: Alignment.center,
                  child: widget.empty ??
                      Text(
                        'No data available',
                        style: TextStyle(
                          color: tokens.text.muted,
                          fontSize: 14.0,
                        ),
                      ),
                )
              else
                for (int r = 0; r < widget.dataSource.length; r++)
                  _buildDataRow(r, tokens, hasSelection, borderSide),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCell(
    JoyTableColumn<T> col,
    JoyThemeTokens tokens,
    BorderSide borderSide,
    bool isLast,
  ) {
    final isSorted = _activeSortKey == col.key && _activeSortDir != JoySortDirection.none;

    final cellContent = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: _resolveMainAxisAlignment(col.align),
      children: [
        Flexible(
          child: Text(
            col.title,
            style: TextStyle(
              color: isSorted ? tokens.text.primary : tokens.text.secondary,
              fontSize: 13.0,
              fontWeight: FontWeight.w600,
            ),
            textAlign: col.align,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (col.sortable) ...[
          const SizedBox(width: JoySpacing.s4),
          _buildSortIcon(col.key, tokens),
        ],
      ],
    );

    return MouseRegion(
      cursor: col.sortable ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: col.sortable ? () => _handleSort(col) : null,
        child: Container(
          width: col.width ?? 120.0,
          height: 44.0,
          padding: const EdgeInsets.symmetric(horizontal: JoySpacing.s12),
          decoration: widget.bordered && !isLast
              ? BoxDecoration(border: Border(right: borderSide))
              : null,
          alignment: _resolveAlignment(col.align),
          child: cellContent,
        ),
      ),
    );
  }

  Widget _buildSortIcon(String colKey, JoyThemeTokens tokens) {
    final isSorted = _activeSortKey == colKey;
    final dir = isSorted ? _activeSortDir : JoySortDirection.none;

    if (dir == JoySortDirection.asc) {
      return JoyIcon.data(
        JoyIcons.chevronUp,
        size: JoyIconSize.sm,
        color: tokens.accent.base,
      );
    } else if (dir == JoySortDirection.desc) {
      return JoyIcon.data(
        JoyIcons.chevronDown,
        size: JoyIconSize.sm,
        color: tokens.accent.base,
      );
    }

    return JoyIcon.data(
      JoyIcons.chevronDown,
      size: JoyIconSize.sm,
      color: tokens.text.muted,
    );
  }

  Widget _buildDataRow(
    int rowIndex,
    JoyThemeTokens tokens,
    bool hasSelection,
    BorderSide borderSide,
  ) {
    final record = widget.dataSource[rowIndex];
    final key = _getRowKey(record, rowIndex);
    final isSelected = widget.selectedRowKeys?.contains(key) ?? false;
    final isHovered = _hoveredRowIndex == rowIndex;

    // Tokens: striped row `tokens.surface.canvas`, hover row `tokens.surface.sunken`
    Color rowBg = tokens.surface.card;
    if (widget.striped && rowIndex.isOdd) {
      rowBg = tokens.surface.canvas;
    }
    if (isHovered) {
      rowBg = tokens.surface.sunken;
    }
    if (isSelected) {
      rowBg = tokens.accent.subtle;
    }

    final isLastRow = rowIndex == widget.dataSource.length - 1;

    return MouseRegion(
      onEnter: (_) => setState(() => _hoveredRowIndex = rowIndex),
      onExit: (_) => setState(() => _hoveredRowIndex = null),
      child: Container(
        decoration: BoxDecoration(
          color: rowBg,
          border: isLastRow ? null : Border(bottom: borderSide),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (hasSelection)
              Container(
                width: 48.0,
                height: 44.0,
                alignment: Alignment.center,
                decoration: widget.bordered
                    ? BoxDecoration(border: Border(right: borderSide))
                    : null,
                child: JoyCheckbox(
                  value: isSelected,
                  onChanged: (checked) => _handleSelectRow(key, checked),
                ),
              ),
            for (int i = 0; i < widget.columns.length; i++)
              _buildDataCell(
                widget.columns[i],
                record,
                rowIndex,
                tokens,
                borderSide,
                i == widget.columns.length - 1,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataCell(
    JoyTableColumn<T> col,
    T record,
    int rowIndex,
    JoyThemeTokens tokens,
    BorderSide borderSide,
    bool isLast,
  ) {
    final Widget cellWidget = col.render != null
        ? col.render!(context, record, rowIndex)
        : Text(
            _getFieldValue(record, col.key),
            style: TextStyle(
              color: tokens.text.primary,
              fontSize: 13.0,
            ),
            textAlign: col.align,
            overflow: TextOverflow.ellipsis,
          );

    return Container(
      width: col.width ?? 120.0,
      height: 44.0,
      padding: const EdgeInsets.symmetric(horizontal: JoySpacing.s12),
      decoration: widget.bordered && !isLast
          ? BoxDecoration(border: Border(right: borderSide))
          : null,
      alignment: _resolveAlignment(col.align),
      child: cellWidget,
    );
  }

  Widget _buildMobileStack(BuildContext context, JoyThemeTokens tokens) {
    final hasSelection = widget.selectedRowKeys != null || widget.onSelectionChanged != null;

    if (widget.dataSource.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(JoySpacing.s24),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: tokens.surface.card,
          borderRadius: BorderRadius.circular(JoyRadius.card),
          border: Border.all(color: tokens.border.subtle, width: 1.0),
        ),
        child: widget.empty ??
            Text(
              'No data available',
              style: TextStyle(
                color: tokens.text.muted,
                fontSize: 14.0,
              ),
            ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (int r = 0; r < widget.dataSource.length; r++) ...[
          _buildMobileCard(r, tokens, hasSelection),
          if (r < widget.dataSource.length - 1)
            const SizedBox(height: JoySpacing.s12),
        ],
      ],
    );
  }

  Widget _buildMobileCard(int rowIndex, JoyThemeTokens tokens, bool hasSelection) {
    final record = widget.dataSource[rowIndex];
    final key = _getRowKey(record, rowIndex);
    final isSelected = widget.selectedRowKeys?.contains(key) ?? false;

    return Container(
      decoration: BoxDecoration(
        color: isSelected ? tokens.accent.subtle : tokens.surface.card,
        borderRadius: BorderRadius.circular(JoyRadius.card),
        border: Border.all(
          color: isSelected ? tokens.accent.base : tokens.border.subtle,
          width: 1.0,
        ),
      ),
      padding: const EdgeInsets.all(JoySpacing.s16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (hasSelection)
            Padding(
              padding: const EdgeInsets.only(bottom: JoySpacing.s8),
              child: Row(
                children: [
                  JoyCheckbox(
                    value: isSelected,
                    onChanged: (checked) => _handleSelectRow(key, checked),
                  ),
                  const SizedBox(width: JoySpacing.s8),
                  Text(
                    'Select row ${rowIndex + 1}',
                    style: TextStyle(
                      color: tokens.text.secondary,
                      fontSize: 12.0,
                    ),
                  ),
                ],
              ),
            ),
          for (int c = 0; c < widget.columns.length; c++) ...[
            _buildMobileField(widget.columns[c], record, rowIndex, tokens),
            if (c < widget.columns.length - 1)
              Divider(
                color: tokens.border.subtle,
                height: JoySpacing.s16,
                thickness: 0.5,
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildMobileField(
    JoyTableColumn<T> col,
    T record,
    int rowIndex,
    JoyThemeTokens tokens,
  ) {
    final Widget cellWidget = col.render != null
        ? col.render!(context, record, rowIndex)
        : Text(
            _getFieldValue(record, col.key),
            style: TextStyle(
              color: tokens.text.primary,
              fontSize: 13.0,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.right,
          );

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          col.title,
          style: TextStyle(
            color: tokens.text.secondary,
            fontSize: 13.0,
          ),
        ),
        const SizedBox(width: JoySpacing.s12),
        Expanded(
          child: Align(
            alignment: Alignment.centerRight,
            child: cellWidget,
          ),
        ),
      ],
    );
  }

  String _getFieldValue(T record, String key) {
    if (record is Map) {
      final val = record[key];
      return val != null ? val.toString() : '';
    }
    return record.toString();
  }

  Alignment _resolveAlignment(TextAlign align) {
    switch (align) {
      case TextAlign.left:
      case TextAlign.start:
        return Alignment.centerLeft;
      case TextAlign.right:
      case TextAlign.end:
        return Alignment.centerRight;
      case TextAlign.center:
        return Alignment.center;
      default:
        return Alignment.centerLeft;
    }
  }

  MainAxisAlignment _resolveMainAxisAlignment(TextAlign align) {
    switch (align) {
      case TextAlign.left:
      case TextAlign.start:
        return MainAxisAlignment.start;
      case TextAlign.right:
      case TextAlign.end:
        return MainAxisAlignment.end;
      case TextAlign.center:
        return MainAxisAlignment.center;
      default:
        return MainAxisAlignment.start;
    }
  }
}
