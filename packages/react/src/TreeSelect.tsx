import * as React from 'react';
import { useOverlay } from './useOverlay.js';
import { ChevronDown, ChevronRight, Close, Check } from '@joymify/icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TreeNode {
  key: string;
  title: string;
  value: string;
  disabled?: boolean;
  children?: TreeNode[];
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface TreeSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  treeData: TreeNode[];
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  treeDefaultExpandAll?: boolean;
  searchable?: boolean | 'auto';
  searchPlaceholder?: string;
  onChange?: (value: any, node?: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface FlatNode {
  node: TreeNode;
  level: number;
  parentKey?: string;
}

const getVisibleNodes = (
  nodes: TreeNode[],
  expanded: Set<string>,
  level = 0,
  parentKey?: string
): FlatNode[] => {
  let list: FlatNode[] = [];
  for (const node of nodes) {
    list.push({ node, level, parentKey });
    if (node.children && node.children.length > 0 && expanded.has(node.key)) {
      list = list.concat(getVisibleNodes(node.children, expanded, level + 1, node.key));
    }
  }
  return list;
};

export const TreeSelect = React.forwardRef<HTMLDivElement, TreeSelectProps>(
  (
    {
      treeData = [],
      value: controlledValue,
      defaultValue,
      multiple = false,
      placeholder = 'Select option...',
      allowClear = true,
      disabled = false,
      treeDefaultExpandAll = true,
      searchable = 'auto',
      searchPlaceholder = 'Search tree...',
      onChange,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [internalValue, setInternalValue] = React.useState<string | string[]>(() => {
      if (defaultValue !== undefined) return defaultValue;
      return multiple ? [] : '';
    });
    const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(() => {
      const all = new Set<string>();
      if (treeDefaultExpandAll) {
        const collect = (nodes: TreeNode[]) => {
          for (const n of nodes) {
            if (n.children && n.children.length > 0) {
              all.add(n.key);
              collect(n.children);
            }
          }
        };
        collect(treeData);
      }
      return all;
    });

    const [focusedKey, setFocusedKey] = React.useState<string | null>(null);

    const controlRef = React.useRef<HTMLDivElement | null>(null);
    const panelRef = React.useRef<HTMLDivElement | null>(null);

    useOverlay(open, controlRef, panelRef, () => {
      setOpen(false);
      setSearchQuery('');
    });

    const isSearchable = searchable === true || (searchable === 'auto' && treeData.length >= 6);

    const filterTree = (nodes: TreeNode[], q: string): TreeNode[] => {
      if (!q.trim()) return nodes;
      const term = q.trim().toLowerCase();
      const res: TreeNode[] = [];
      for (const n of nodes) {
        const titleMatches = (n.title || '').toLowerCase().includes(term);
        const filteredKids = n.children ? filterTree(n.children, q) : [];
        if (titleMatches || filteredKids.length > 0) {
          res.push({
            ...n,
            children: filteredKids.length > 0 ? filteredKids : n.children
          });
        }
      }
      return res;
    };

    const displayTreeData = React.useMemo(() => {
      return filterTree(treeData, searchQuery);
    }, [treeData, searchQuery]);

    React.useEffect(() => {
      if (searchQuery.trim()) {
        const matchingKeys = new Set<string>();
        const collect = (nodes: TreeNode[]) => {
          for (const n of nodes) {
            if (n.children && n.children.length > 0) {
              const term = searchQuery.trim().toLowerCase();
              const hasMatch = n.children.some((c) => (c.title || '').toLowerCase().includes(term));
              if (hasMatch) matchingKeys.add(n.key);
              collect(n.children);
            }
          }
        };
        collect(treeData);
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          matchingKeys.forEach((k) => next.add(k));
          return next;
        });
      }
    }, [searchQuery, treeData]);

    const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;

    const isSelected = React.useCallback(
      (val: string) => {
        if (multiple && Array.isArray(selectedValue)) {
          return selectedValue.includes(val);
        }
        return selectedValue === val;
      },
      [multiple, selectedValue]
    );

    const visibleNodes = React.useMemo(
      () => getVisibleNodes(displayTreeData, expandedKeys),
      [displayTreeData, expandedKeys]
    );

    React.useEffect(() => {
      if (open) {
        if (!focusedKey || !visibleNodes.some((n) => n.node.key === focusedKey)) {
          const firstSelected = visibleNodes.find((n) => isSelected(n.node.value));
          setFocusedKey(firstSelected ? firstSelected.node.key : visibleNodes[0]?.node.key || null);
        }
      }
    }, [open, visibleNodes, focusedKey, isSelected]);

    const findTitleByValue = (val: string, nodes: TreeNode[]): string | null => {
      for (const n of nodes) {
        if (n.value === val) return n.title;
        if (n.children) {
          const res = findTitleByValue(val, n.children);
          if (res) return res;
        }
      }
      return null;
    };

    const toggleExpand = (e: React.MouseEvent, key: string) => {
      e.stopPropagation();
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    };

    const handleSelectNode = (node: TreeNode) => {
      if (node.disabled || disabled) return;

      if (multiple) {
        const arr = Array.isArray(selectedValue) ? [...selectedValue] : [];
        const idx = arr.indexOf(node.value);
        let next: string[];
        if (idx >= 0) {
          next = arr.filter((v) => v !== node.value);
        } else {
          next = [...arr, node.value];
        }
        if (controlledValue === undefined) {
          setInternalValue(next);
        }
        onChange?.(next, node);
      } else {
        if (controlledValue === undefined) {
          setInternalValue(node.value);
        }
        onChange?.(node.value, node);
        setOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      const empty = multiple ? [] : '';
      if (controlledValue === undefined) {
        setInternalValue(empty);
      }
      onChange?.(empty, null);
    };

    const handleRemoveTag = (e: React.MouseEvent, val: string) => {
      e.stopPropagation();
      if (disabled) return;
      const arr = Array.isArray(selectedValue) ? [...selectedValue] : [];
      const next = arr.filter((v) => v !== val);
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
      onChange?.(next, null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      const currentIndex = visibleNodes.findIndex((n) => n.node.key === focusedKey);
      const currentItem = currentIndex >= 0 ? visibleNodes[currentIndex] : null;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < visibleNodes.length - 1) {
          setFocusedKey(visibleNodes[currentIndex + 1].node.key);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          setFocusedKey(visibleNodes[currentIndex - 1].node.key);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentItem && currentItem.node.children && currentItem.node.children.length > 0) {
          if (!expandedKeys.has(currentItem.node.key)) {
            setExpandedKeys((prev) => new Set(prev).add(currentItem.node.key));
          } else if (currentIndex < visibleNodes.length - 1) {
            setFocusedKey(visibleNodes[currentIndex + 1].node.key);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentItem) {
          if (
            currentItem.node.children &&
            currentItem.node.children.length > 0 &&
            expandedKeys.has(currentItem.node.key)
          ) {
            setExpandedKeys((prev) => {
              const next = new Set(prev);
              next.delete(currentItem.node.key);
              return next;
            });
          } else if (currentItem.parentKey) {
            setFocusedKey(currentItem.parentKey);
          }
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (currentItem && !currentItem.node.disabled) {
          handleSelectNode(currentItem.node);
        }
      }
    };

    const hasValue = multiple
      ? Array.isArray(selectedValue) && selectedValue.length > 0
      : Boolean(selectedValue);

    const renderTreeNodes = (nodes: TreeNode[], level = 0) => {
      return nodes.map((node) => {
        const hasChildren = Boolean(node.children && node.children.length > 0);
        const isExpanded = expandedKeys.has(node.key);
        const selected = isSelected(node.value);

        return (
          <React.Fragment key={node.key}>
            <div
              role="treeitem"
              aria-selected={selected}
              aria-expanded={hasChildren ? isExpanded : undefined}
              className={cx(
                'joy-treeselect__node',
                selected && 'joy-treeselect__node--selected',
                node.disabled && 'joy-treeselect__node--disabled'
              )}
              onClick={() => handleSelectNode(node)}
            >
              {Array.from({ length: level }).map((_, li) => (
                <span key={li} className="joy-treeselect__indent-spacer" aria-hidden="true" />
              ))}
              {hasChildren ? (
                <button
                  type="button"
                  className={cx(
                    'joy-treeselect__node-toggle',
                    isExpanded && 'joy-treeselect__node-toggle--expanded'
                  )}
                  aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
                  onClick={(e) => toggleExpand(e, node.key)}
                >
                  <ChevronRight width={12} height={12} />
                </button>
              ) : (
                <span className="joy-treeselect__node-toggle" aria-hidden="true" />
              )}

              {node.loading && (
                <span className="joy-treeselect__node-loading" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </span>
              )}

              {multiple && (
                <span className="joy-treeselect__node-checkbox" aria-hidden="true">
                  {selected && <Check width={12} height={12} />}
                </span>
              )}

              <span>{node.title}</span>
            </div>

            {hasChildren && isExpanded && renderTreeNodes(node.children!, level + 1)}
          </React.Fragment>
        );
      });
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-treeselect',
          disabled && 'joy-treeselect--disabled',
          open && 'joy-treeselect--open',
          className
        )}
        style={style}
        {...rest}
      >
        {/* Selector Input Trigger */}
        <div
          ref={controlRef}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="tree"
          tabIndex={disabled ? -1 : 0}
          className="joy-treeselect__control"
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={handleKeyDown}
        >
          {multiple && Array.isArray(selectedValue) && selectedValue.length > 0 ? (
            <span className="joy-treeselect__tags">
              {selectedValue.map((val) => (
                <span key={val} className="joy-treeselect__tag">
                  <span>{findTitleByValue(val, treeData) || val}</span>
                  {!disabled && (
                    <button
                      type="button"
                      className="joy-treeselect__tag-remove"
                      aria-label={`Remove ${findTitleByValue(val, treeData) || val}`}
                      onClick={(e) => handleRemoveTag(e, val)}
                    >
                      <Close width={12} height={12} />
                    </button>
                  )}
                </span>
              ))}
            </span>
          ) : !multiple && selectedValue ? (
            <span>{findTitleByValue(selectedValue as string, treeData) || selectedValue}</span>
          ) : (
            <span className="joy-treeselect__placeholder">{placeholder}</span>
          )}

          {allowClear && hasValue && !disabled && (
            <button
              type="button"
              className="joy-treeselect__clear"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <Close width={14} height={14} />
            </button>
          )}

          <span className="joy-treeselect__arrow" aria-hidden="true">
            <ChevronDown width={14} height={14} />
          </span>
        </div>

        {/* Tree Dropdown Panel */}
        {open && (
          <div
            ref={panelRef}
            role="tree"
            aria-label="Tree selector options"
            className="joy-treeselect__panel joy-overlay"
            tabIndex={-1}
          >
            {isSearchable && (
              <div className="joy-treeselect__search-wrapper" role="presentation">
                <input
                  type="search"
                  className="joy-treeselect__search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={searchPlaceholder}
                />
              </div>
            )}
            {displayTreeData.length > 0 ? (
              renderTreeNodes(displayTreeData)
            ) : (
              <div className="joy-treeselect__empty" role="presentation">
                {searchQuery.trim() ? 'No options found' : 'No options available'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TreeSelect.displayName = 'TreeSelect';
