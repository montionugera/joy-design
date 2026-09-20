import * as React from 'react';

export interface TreeNode {
  key: string;
  title: string;
  value: string;
  disabled?: boolean;
  children?: TreeNode[];
  icon?: React.ReactNode;
}

export interface TreeSelectProps {
  treeData: TreeNode[];
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  treeDefaultExpandAll?: boolean;
  onChange?: (value: any, node?: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

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
      onChange,
      className = '',
      style
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      defaultValue || (multiple ? [] : '')
    );
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

    const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    // Close on outside click
    React.useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      if (open) {
        document.addEventListener('mousedown', handleOutsideClick);
      }
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [open]);

    // Find node title by value
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
      setExpandedKeys(prev => {
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
          next = arr.filter(v => v !== node.value);
        } else {
          next = [...arr, node.value];
        }
        setInternalValue(next);
        onChange?.(next, node);
      } else {
        setInternalValue(node.value);
        onChange?.(node.value, node);
        setOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      const empty = multiple ? [] : '';
      setInternalValue(empty);
      onChange?.(empty, null);
    };

    const isSelected = (val: string) => {
      if (multiple && Array.isArray(selectedValue)) {
        return selectedValue.includes(val);
      }
      return selectedValue === val;
    };

    const renderTreeNodes = (nodes: TreeNode[], level = 0) => {
      return (
        <ul
          role="group"
          style={{
            listStyle: 'none',
            margin: 0,
            paddingLeft: level > 0 ? 18 : 0
          }}
        >
          {nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedKeys.has(node.key);
            const selected = isSelected(node.value);

            return (
              <li key={node.key} role="treeitem" aria-selected={selected} aria-expanded={hasChildren ? isExpanded : undefined}>
                <div
                  className={`joy-treeselect__node ${selected ? 'joy-treeselect__node--selected' : ''}`}
                  onClick={() => handleSelectNode(node)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 8px',
                    borderRadius: 4,
                    cursor: node.disabled ? 'not-allowed' : 'pointer',
                    opacity: node.disabled ? 0.5 : 1,
                    backgroundColor: selected ? 'rgba(196, 154, 58, 0.15)' : 'transparent',
                    color: selected ? 'var(--gold-400, #c49a3a)' : 'var(--joy-text-primary, #f8f3e8)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(e, node.key)}
                      aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ) : (
                    <span style={{ width: 18 }} />
                  )}

                  {multiple && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 14,
                        height: 14,
                        border: '1px solid var(--joy-border, #23354e)',
                        borderRadius: 3,
                        backgroundColor: selected ? 'var(--gold-400, #c49a3a)' : 'transparent',
                        color: '#14253e'
                      }}
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  )}

                  <span style={{ fontSize: 13, flex: 1 }}>{node.title}</span>
                </div>

                {hasChildren && isExpanded && renderTreeNodes(node.children!, level + 1)}
              </li>
            );
          })}
        </ul>
      );
    };

    const hasValue = multiple
      ? Array.isArray(selectedValue) && selectedValue.length > 0
      : Boolean(selectedValue);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`joy-treeselect ${disabled ? 'joy-treeselect--disabled' : ''} ${className}`}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          ...style
        }}
      >
        {/* Selector Input Trigger */}
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="tree"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpen(o => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(o => !o);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 36,
            padding: '4px 10px',
            border: '1px solid var(--joy-border, #23354e)',
            borderRadius: 6,
            backgroundColor: 'var(--joy-surface-card, #14253e)',
            color: 'var(--joy-text-primary, #f8f3e8)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, overflow: 'hidden' }}>
            {multiple && Array.isArray(selectedValue) && selectedValue.length > 0 ? (
              selectedValue.map(val => (
                <span
                  key={val}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 12,
                    backgroundColor: 'rgba(196, 154, 58, 0.2)',
                    color: 'var(--gold-400, #c49a3a)'
                  }}
                >
                  {findTitleByValue(val, treeData) || val}
                </span>
              ))
            ) : !multiple && selectedValue ? (
              <span style={{ fontSize: 13 }}>
                {findTitleByValue(selectedValue as string, treeData) || selectedValue}
              </span>
            ) : (
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{placeholder}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {allowClear && hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear selection"
                aria-label="Clear selection"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                transform: open ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
                color: '#94a3b8'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Tree Dropdown Panel */}
        {open && (
          <div
            role="tree"
            aria-label="Tree selector options"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: 280,
              overflowY: 'auto',
              padding: 8,
              borderRadius: 6,
              backgroundColor: 'var(--joy-surface-card, #14253e)',
              border: '1px solid var(--joy-border, #23354e)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}
          >
            {treeData.length > 0 ? (
              renderTreeNodes(treeData)
            ) : (
              <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TreeSelect.displayName = 'TreeSelect';
