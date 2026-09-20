import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('React standard library components implement accessible traits and forwardRef contracts', () => {
  const badge = fs.readFileSync(path.resolve('./src/Badge.tsx'), 'utf8');
  assert.ok(badge.includes('joy-badge--${variant}'), 'Badge must render variant classes');

  const input = fs.readFileSync(path.resolve('./src/Input.tsx'), 'utf8');
  assert.ok(input.includes('React.forwardRef'), 'Input must forwardRef to native element');
  assert.ok(input.includes('joy-input-wrapper--error'), 'Input must support error states');

  const sw = fs.readFileSync(path.resolve('./src/Switch.tsx'), 'utf8');
  assert.ok(sw.includes('role="switch"'), 'Switch must implement ARIA switch role');

  const tbl = fs.readFileSync(path.resolve('./src/Table.tsx'), 'utf8');
  assert.ok(tbl.includes('joy-table--${density}'), 'Table must support high-density trading layouts');

  const alert = fs.readFileSync(path.resolve('./src/Alert.tsx'), 'utf8');
  assert.ok(alert.includes('role="alert"'), 'Alert must implement accessible alert role');

  const modal = fs.readFileSync(path.resolve('./src/Modal.tsx'), 'utf8');
  assert.ok(modal.includes('role="dialog"'), 'Modal must implement accessible dialog role');

  const dropdown = fs.readFileSync(path.resolve('./src/Dropdown.tsx'), 'utf8');
  assert.ok(dropdown.includes('role="menu"'), 'Dropdown must implement menu role');

  const tabs = fs.readFileSync(path.resolve('./src/Tabs.tsx'), 'utf8');
  assert.ok(tabs.includes('role="tablist"'), 'Tabs must implement tablist role');

  const tooltip = fs.readFileSync(path.resolve('./src/Tooltip.tsx'), 'utf8');
  assert.ok(tooltip.includes('role="tooltip"'), 'Tooltip must implement tooltip role');

  // Wave 1 Enterprise Suite assertions
  const select = fs.readFileSync(path.resolve('./src/Select.tsx'), 'utf8');
  assert.ok(select.includes('React.forwardRef'), 'Select must forwardRef to native element');
  assert.ok(select.includes('joy-select'), 'Select must render joy-select class');

  const checkbox = fs.readFileSync(path.resolve('./src/Checkbox.tsx'), 'utf8');
  assert.ok(checkbox.includes('role="checkbox"'), 'Checkbox must implement accessible role=checkbox');
  assert.ok(checkbox.includes('React.forwardRef'), 'Checkbox must forwardRef to native input');

  const radio = fs.readFileSync(path.resolve('./src/RadioGroup.tsx'), 'utf8');
  assert.ok(radio.includes('role="radiogroup"'), 'RadioGroup must implement accessible role=radiogroup');

  const drawer = fs.readFileSync(path.resolve('./src/Drawer.tsx'), 'utf8');
  assert.ok(drawer.includes('role="dialog"'), 'Drawer must implement accessible role=dialog');
  assert.ok(drawer.includes('joy-drawer'), 'Drawer must render joy-drawer class');

  const toast = fs.readFileSync(path.resolve('./src/Toast.tsx'), 'utf8');
  assert.ok(toast.includes('role="status"'), 'Toast must implement accessible role=status');
  assert.ok(toast.includes('joy-toast'), 'Toast must render joy-toast class');

  // Wave 2 Assertions (Financial Table, Pagination, Skeleton)
  assert.ok(tbl.includes('joy-table-th--sortable'), 'Table must support sortable columns');
  assert.ok(tbl.includes('joy-table-cell--flash-up'), 'Table must support ticker flash up');
  assert.ok(tbl.includes('joy-table-cell--flash-down'), 'Table must support ticker flash down');

  const pagination = fs.readFileSync(path.resolve('./src/Pagination.tsx'), 'utf8');
  assert.ok(pagination.includes('role="navigation"'), 'Pagination must implement accessible role=navigation');
  assert.ok(pagination.includes('joy-pagination'), 'Pagination must render joy-pagination class');

  const skeleton = fs.readFileSync(path.resolve('./src/Skeleton.tsx'), 'utf8');
  assert.ok(skeleton.includes('role="progressbar"'), 'Skeleton must implement accessible role=progressbar');
  assert.ok(skeleton.includes('joy-skeleton'), 'Skeleton must render joy-skeleton class');

  // Wave 3 / Enterprise Parity Assertions
  const datePicker = fs.readFileSync(path.resolve('./src/DatePicker.tsx'), 'utf8');
  assert.ok(datePicker.includes('joy-date-picker'), 'DatePicker must render joy-date-picker class');
  assert.ok(datePicker.includes('React.forwardRef'), 'DatePicker must implement forwardRef');

  const breadcrumb = fs.readFileSync(path.resolve('./src/Breadcrumb.tsx'), 'utf8');
  assert.ok(breadcrumb.includes('joy-breadcrumb'), 'Breadcrumb must render joy-breadcrumb class');
  assert.ok(breadcrumb.includes('aria-label="Breadcrumb"'), 'Breadcrumb must have accessible aria-label');

  const statCard = fs.readFileSync(path.resolve('./src/StatCard.tsx'), 'utf8');
  assert.ok(statCard.includes('joy-stat-card'), 'StatCard must render joy-stat-card class');

  const progress = fs.readFileSync(path.resolve('./src/Progress.tsx'), 'utf8');
  assert.ok(progress.includes('joy-progress'), 'Progress must render joy-progress class');

  const emptyState = fs.readFileSync(path.resolve('./src/EmptyState.tsx'), 'utf8');
  assert.ok(emptyState.includes('joy-empty-state'), 'EmptyState must render joy-empty-state class');

  // Wave 4 Assertions (Ant Design Parity: Upload, Avatar, Slider, MarkdownViewer)
  const upload = fs.readFileSync(path.resolve('./src/Upload.tsx'), 'utf8');
  assert.ok(upload.includes('joy-upload'), 'Upload must render joy-upload class');

  const avatar = fs.readFileSync(path.resolve('./src/Avatar.tsx'), 'utf8');
  assert.ok(avatar.includes('joy-avatar'), 'Avatar must render joy-avatar class');
  assert.ok(avatar.includes('React.forwardRef'), 'Avatar must implement forwardRef');

  const slider = fs.readFileSync(path.resolve('./src/Slider.tsx'), 'utf8');
  assert.ok(slider.includes('joy-slider'), 'Slider must render joy-slider class');
  assert.ok(slider.includes('role="slider"'), 'Slider must implement role=slider');
  assert.ok(slider.includes('React.forwardRef'), 'Slider must implement forwardRef');

  const md = fs.readFileSync(path.resolve('./src/MarkdownViewer.tsx'), 'utf8');
  assert.ok(md.includes('joy-markdown'), 'MarkdownViewer must render joy-markdown class');
  assert.ok(md.includes('joy-markdown__copy-btn'), 'MarkdownViewer must include copy button');

  // Wave 5 Assertions (Landing Page Architecture & Enterprise Workflow Suite)
  const bentoGrid = fs.readFileSync(path.resolve('./src/BentoGrid.tsx'), 'utf8');
  assert.ok(bentoGrid.includes('joy-bento-grid'), 'BentoGrid must render joy-bento-grid class');

  const bentoCard = fs.readFileSync(path.resolve('./src/BentoCard.tsx'), 'utf8');
  assert.ok(bentoCard.includes('joy-bento-card'), 'BentoCard must render joy-bento-card class');

  const hero = fs.readFileSync(path.resolve('./src/HeroSection.tsx'), 'utf8');
  assert.ok(hero.includes('joy-hero'), 'HeroSection must render joy-hero class');

  const pricingCard = fs.readFileSync(path.resolve('./src/PricingCard.tsx'), 'utf8');
  assert.ok(pricingCard.includes('joy-pricing-card'), 'PricingCard must render joy-pricing-card class');

  const pricingMatrix = fs.readFileSync(path.resolve('./src/PricingMatrix.tsx'), 'utf8');
  assert.ok(pricingMatrix.includes('joy-pricing-matrix'), 'PricingMatrix must render joy-pricing-matrix class');

  const testimonialCard = fs.readFileSync(path.resolve('./src/TestimonialCard.tsx'), 'utf8');
  assert.ok(testimonialCard.includes('joy-testimonial-card'), 'TestimonialCard must render joy-testimonial-card class');

  const steps = fs.readFileSync(path.resolve('./src/Steps.tsx'), 'utf8');
  assert.ok(steps.includes('joy-steps'), 'Steps must render joy-steps class');
  assert.ok(steps.includes('role="navigation"'), 'Steps must implement role=navigation');

  const timeline = fs.readFileSync(path.resolve('./src/Timeline.tsx'), 'utf8');
  assert.ok(timeline.includes('joy-timeline'), 'Timeline must render joy-timeline class');
  assert.ok(timeline.includes('role="list"'), 'Timeline must implement role=list');

  const result = fs.readFileSync(path.resolve('./src/Result.tsx'), 'utf8');
  assert.ok(result.includes('joy-result'), 'Result must render joy-result class');
  assert.ok(result.includes('role="alert"'), 'Result must implement role=alert');

  // Wave 6 Assertions (High-Performance Financial Charts & Layout Primitives)
  const lineChart = fs.readFileSync(path.resolve('./src/LineChart.tsx'), 'utf8');
  assert.ok(lineChart.includes('joy-chart'), 'LineChart must render joy-chart class');
  assert.ok(lineChart.includes('JoyChartCore'), 'LineChart must initialize JoyChartCore');
  assert.ok(lineChart.includes('forwardRef'), 'LineChart must implement forwardRef');

  const candleChart = fs.readFileSync(path.resolve('./src/CandlestickChart.tsx'), 'utf8');
  assert.ok(candleChart.includes('joy-chart'), 'CandlestickChart must render joy-chart class');
  assert.ok(candleChart.includes('joy-chart__hud'), 'CandlestickChart must render OHLC HUD');
  assert.ok(candleChart.includes('forwardRef'), 'CandlestickChart must implement forwardRef');

  const divider = fs.readFileSync(path.resolve('./src/Divider.tsx'), 'utf8');
  assert.ok(divider.includes('joy-divider'), 'Divider must render joy-divider class');
  assert.ok(divider.includes('role="separator"'), 'Divider must implement role=separator');

  const flex = fs.readFileSync(path.resolve('./src/Flex.tsx'), 'utf8');
  assert.ok(flex.includes('joy-flex'), 'Flex must render joy-flex class');

  const space = fs.readFileSync(path.resolve('./src/Space.tsx'), 'utf8');
  assert.ok(space.includes('joy-space'), 'Space must render joy-space class');

  const splitter = fs.readFileSync(path.resolve('./src/Splitter.tsx'), 'utf8');
  assert.ok(splitter.includes('joy-splitter'), 'Splitter must render joy-splitter class');
  assert.ok(splitter.includes('role="separator"'), 'Splitter bar must implement role=separator');

  const statistic = fs.readFileSync(path.resolve('./src/Statistic.tsx'), 'utf8');
  assert.ok(statistic.includes('joy-statistic'), 'Statistic must render joy-statistic class');

  const tag = fs.readFileSync(path.resolve('./src/Tag.tsx'), 'utf8');
  assert.ok(tag.includes('joy-tag'), 'Tag must render joy-tag class');

  const segmented = fs.readFileSync(path.resolve('./src/Segmented.tsx'), 'utf8');
  assert.ok(segmented.includes('joy-segmented'), 'Segmented must render joy-segmented class');
  assert.ok(segmented.includes('role="radiogroup"'), 'Segmented must implement role=radiogroup');

  // Wave 7 Assertions (Form Suite & Advanced Data Entry)
  const form = fs.readFileSync(path.resolve('./src/Form.tsx'), 'utf8');
  assert.ok(form.includes('joy-form'), 'Form must render joy-form class');
  assert.ok(form.includes('React.forwardRef'), 'Form must implement forwardRef');

  const formItem = fs.readFileSync(path.resolve('./src/FormItem.tsx'), 'utf8');
  assert.ok(formItem.includes('joy-form-item'), 'FormItem must render joy-form-item class');
  assert.ok(formItem.includes('role="alert"'), 'FormItem error explain must implement alert role');

  const inputNumber = fs.readFileSync(path.resolve('./src/InputNumber.tsx'), 'utf8');
  assert.ok(inputNumber.includes('joy-input-number'), 'InputNumber must render joy-input-number class');
  assert.ok(inputNumber.includes('role="spinbutton"'), 'InputNumber must implement role=spinbutton');
  assert.ok(inputNumber.includes('React.forwardRef'), 'InputNumber must implement forwardRef');

  const rate = fs.readFileSync(path.resolve('./src/Rate.tsx'), 'utf8');
  assert.ok(rate.includes('joy-rate'), 'Rate must render joy-rate class');
  assert.ok(rate.includes('role="radiogroup"'), 'Rate must implement role=radiogroup');
  assert.ok(rate.includes('React.forwardRef'), 'Rate must implement forwardRef');

  const mentions = fs.readFileSync(path.resolve('./src/Mentions.tsx'), 'utf8');
  assert.ok(mentions.includes('joy-mentions'), 'Mentions must render joy-mentions class');
  assert.ok(mentions.includes('role="listbox"'), 'Mentions dropdown must implement role=listbox');
  assert.ok(mentions.includes('React.forwardRef'), 'Mentions must implement forwardRef');

  const timePicker = fs.readFileSync(path.resolve('./src/TimePicker.tsx'), 'utf8');
  assert.ok(timePicker.includes('joy-time-picker'), 'TimePicker must render joy-time-picker class');
  assert.ok(timePicker.includes('React.forwardRef'), 'TimePicker must implement forwardRef');

  const transfer = fs.readFileSync(path.resolve('./src/Transfer.tsx'), 'utf8');
  assert.ok(transfer.includes('joy-transfer'), 'Transfer must render joy-transfer class');
  assert.ok(transfer.includes('React.forwardRef'), 'Transfer must implement forwardRef');

  // Wave 8 Assertions (Navigation & Feedback Suite)
  const menu = fs.readFileSync(path.resolve('./src/Menu.tsx'), 'utf8');
  assert.ok(menu.includes('joy-menu'), 'Menu must render joy-menu class');
  assert.ok(menu.includes('role="menu"'), 'Menu must implement role=menu');
  assert.ok(menu.includes('React.forwardRef'), 'Menu must implement forwardRef');

  const anchor = fs.readFileSync(path.resolve('./src/Anchor.tsx'), 'utf8');
  assert.ok(anchor.includes('joy-anchor'), 'Anchor must render joy-anchor class');
  assert.ok(anchor.includes('role="navigation"'), 'Anchor must implement role=navigation');
  assert.ok(anchor.includes('React.forwardRef'), 'Anchor must implement forwardRef');

  const message = fs.readFileSync(path.resolve('./src/Message.tsx'), 'utf8');
  assert.ok(message.includes('joy-message'), 'Message must render joy-message class');
  assert.ok(message.includes('role="alert"'), 'Message must implement role=alert');
  assert.ok(message.includes('React.forwardRef'), 'Message must implement forwardRef');

  const notification = fs.readFileSync(path.resolve('./src/Notification.tsx'), 'utf8');
  assert.ok(notification.includes('joy-notification'), 'Notification must render joy-notification class');
  assert.ok(notification.includes('role="alert"'), 'Notification must implement role=alert');
  assert.ok(notification.includes('React.forwardRef'), 'Notification must implement forwardRef');

  const popconfirm = fs.readFileSync(path.resolve('./src/Popconfirm.tsx'), 'utf8');
  assert.ok(popconfirm.includes('joy-popconfirm'), 'Popconfirm must render joy-popconfirm class');
  assert.ok(popconfirm.includes('role="dialog"'), 'Popconfirm must implement role=dialog');
  assert.ok(popconfirm.includes('React.forwardRef'), 'Popconfirm must implement forwardRef');

  const spin = fs.readFileSync(path.resolve('./src/Spin.tsx'), 'utf8');
  assert.ok(spin.includes('joy-spin'), 'Spin must render joy-spin class');
  assert.ok(spin.includes('role="status"'), 'Spin must implement role=status');
  assert.ok(spin.includes('React.forwardRef'), 'Spin must implement forwardRef');

  // Wave 10 Assertions (Image Preview & Accessible Overlay Suite)
  const imagePreview = fs.readFileSync(path.resolve('./src/ImagePreview.tsx'), 'utf8');
  assert.ok(imagePreview.includes('joy-image-preview-mask'), 'ImagePreview must render preview mask');
  assert.ok(imagePreview.includes('role="dialog"'), 'ImagePreview must implement role=dialog');
  assert.ok(imagePreview.includes('aria-modal="true"'), 'ImagePreview must set aria-modal=true');
  assert.ok(imagePreview.includes('lockBodyScroll'), 'ImagePreview must invoke lockBodyScroll');
  assert.ok(imagePreview.includes('trapFocus'), 'ImagePreview must invoke trapFocus');

  const overlayUtils = fs.readFileSync(path.resolve('./src/overlay-utils.ts'), 'utf8');
  assert.ok(overlayUtils.includes('lockBodyScroll'), 'overlay-utils must export lockBodyScroll');
  assert.ok(overlayUtils.includes('trapFocus'), 'overlay-utils must export trapFocus');

  // Wave 10B Assertions (Live Markdown Editor & Sanitized Preview)
  const mdEditor = fs.readFileSync(path.resolve('./src/MarkdownEditor.tsx'), 'utf8');
  assert.ok(mdEditor.includes('joy-markdown-editor'), 'MarkdownEditor must render joy-markdown-editor container');
  assert.ok(mdEditor.includes('joy-markdown-editor__toolbar'), 'MarkdownEditor must render toolbar');
  assert.ok(mdEditor.includes('joy-markdown-editor__preview'), 'MarkdownEditor must render live preview');
  assert.ok(mdEditor.includes('handleEditorScroll'), 'MarkdownEditor must implement synchronized editor scroll');
  assert.ok(mdEditor.includes('handlePreviewScroll'), 'MarkdownEditor must implement synchronized preview scroll');
});


