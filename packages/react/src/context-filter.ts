/**
 * Context-aware filter resolution shared by the Svelte and React packages (identical in both).
 * A filter the user requested is never overwritten: the effective filter is derived per context on
 * every render, so leaving a context (e.g. a dungeon floor) restores the user's choice for free.
 * Backs the `.joy-context-filter-bar` CSS contract (F-086).
 */
export interface ContextFilterOption<C extends string = string> {
  id: string;
  label: string;
  /** Contexts in which this filter can match anything. */
  contexts: readonly C[];
}

export interface FilterResolution {
  effective: string;
  healed: boolean;
  /** `incompatible`: known filter, not valid here. `unknown`: id not in the options (e.g. a stale deep link). */
  reason?: "incompatible" | "unknown";
}

export function isFilterAvailable<C extends string>(
  id: string,
  context: C,
  options: readonly ContextFilterOption<C>[],
): boolean {
  const option = options.find((o) => o.id === id);
  return option !== undefined && option.contexts.includes(context);
}

export function resolveFilter<C extends string>(
  requested: string,
  context: C,
  options: readonly ContextFilterOption<C>[],
  fallback = "All",
): FilterResolution {
  if (isFilterAvailable(requested, context, options)) {
    return { effective: requested, healed: false };
  }
  if (!isFilterAvailable(fallback, context, options)) {
    throw new Error(
      `resolveFilter: fallback "${fallback}" is not available in context "${context}"`,
    );
  }
  const known = options.some((o) => o.id === requested);
  return {
    effective: fallback,
    healed: true,
    reason: known ? "incompatible" : "unknown",
  };
}
