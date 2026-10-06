# Ant Design 5 elevation for Cascader, TreeSelect, floating overlays, navigation, and form controls Implementation Plan

## Phase 1: Wave 2 Hierarchical Selection Controls
- [x] Implement Cascader column slide-in animation with `--joy-ease-out-quint` and `--joy-duration-fast`
- [x] Implement TreeSelect live search filtering with automatic ancestor node expansion
- [x] Add async node loading spinner for TreeSelect

## Phase 2: Wave 3 Overlays & Feedback
- [x] Implement Tooltip dynamic transform-origin zoom (`joy-tooltip-zoom`)
- [x] Implement Popconfirm panel entrance and directional pointer arrow (`:not(.joy-overlay)::after`)
- [x] Implement Notification slide-in with reduced-motion compliance
- [x] Elevate Modal pop animation to `scale(0.88)`

## Phase 3: Wave 4 Navigation Micro-interactions
- [x] Implement Segmented active thumb smooth opacity entrance preserving 44px coarse pointer touch targets
- [x] Implement Steps active process indicator pulsing ring (`joy-step-pulse`)

## Phase 4: Wave 5 Form Controls Micro-interactions
- [x] Implement InputNumber stepper controls hover/focus-within reveal
- [x] Implement Rate star hover bounce physics
- [x] Implement Slider handle scale and subtle glow halo

## Phase 5: Verification & Gate 1
- [x] Expand Playwright test suite `antd5-advanced-controls.spec.ts` to cover all waves across desktop and mobile
- [x] Verify Gate 1 Precheck (`scripts/precheck.sh`) exits 0 with 0 color literal violations and 0 twin parity errors
