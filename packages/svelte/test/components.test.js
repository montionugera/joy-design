import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Svelte 5 standard library components implement Runes and enterprise contracts', () => {
  const badge = fs.readFileSync(path.resolve('./src/lib/Badge.svelte'), 'utf8');
  assert.ok(badge.includes('$props()'), 'Badge must use Svelte 5 $props()');
  assert.ok(badge.includes('joy-badge--{variant}'), 'Badge must support variants');

  const input = fs.readFileSync(path.resolve('./src/lib/Input.svelte'), 'utf8');
  assert.ok(input.includes('$bindable'), 'Input must support two-way binding');
  assert.ok(input.includes('joy-input-wrapper--error'), 'Input must support error states');

  const sw = fs.readFileSync(path.resolve('./src/lib/Switch.svelte'), 'utf8');
  assert.ok(sw.includes('role="switch"'), 'Switch must have accessible ARIA switch role');

  const tbl = fs.readFileSync(path.resolve('./src/lib/Table.svelte'), 'utf8');
  assert.ok(tbl.includes('joy-table--{density}'), 'Table must support high-density trading layouts');

  const alert = fs.readFileSync(path.resolve('./src/lib/Alert.svelte'), 'utf8');
  assert.ok(alert.includes('role="alert"'), 'Alert must have accessible role');

  const modal = fs.readFileSync(path.resolve('./src/lib/Modal.svelte'), 'utf8');
  assert.ok(modal.includes('role="dialog"'), 'Modal must implement dialog role');
  assert.ok(modal.includes('$props()'), 'Modal must use Svelte 5 runes');

  const dropdown = fs.readFileSync(path.resolve('./src/lib/Dropdown.svelte'), 'utf8');
  assert.ok(dropdown.includes('role="menu"'), 'Dropdown must implement menu role');

  const tabs = fs.readFileSync(path.resolve('./src/lib/Tabs.svelte'), 'utf8');
  assert.ok(tabs.includes('role="tablist"'), 'Tabs must implement tablist role');

  const tooltip = fs.readFileSync(path.resolve('./src/lib/Tooltip.svelte'), 'utf8');
  assert.ok(tooltip.includes('role="tooltip"'), 'Tooltip must implement tooltip role');

  // Wave 1 Enterprise Suite assertions
  const select = fs.readFileSync(path.resolve('./src/lib/Select.svelte'), 'utf8');
  assert.ok(select.includes('joy-select'), 'Select must have joy-select class');
  assert.ok(select.includes('$bindable'), 'Select must support bindable value');

  const checkbox = fs.readFileSync(path.resolve('./src/lib/Checkbox.svelte'), 'utf8');
  assert.ok(!checkbox.includes('role="checkbox"'), 'Checkbox must not duplicate the native role');
  assert.ok(checkbox.includes('joy-checkbox'), 'Checkbox must have joy-checkbox class');

  const radio = fs.readFileSync(path.resolve('./src/lib/RadioGroup.svelte'), 'utf8');
  assert.ok(radio.includes('role="radiogroup"'), 'RadioGroup must implement role=radiogroup');

  const drawer = fs.readFileSync(path.resolve('./src/lib/Drawer.svelte'), 'utf8');
  assert.ok(drawer.includes('joy-drawer'), 'Drawer must have joy-drawer class');
  assert.ok(drawer.includes('role="dialog"'), 'Drawer must implement role=dialog');

  const toast = fs.readFileSync(path.resolve('./src/lib/Toast.svelte'), 'utf8');
  assert.ok(toast.includes('joy-toast'), 'Toast must have joy-toast class');
  assert.ok(toast.includes('role="status"'), 'Toast must implement role=status');

  // Wave 2 Assertions (Financial Table, Pagination, Skeleton)
  assert.ok(tbl.includes('joy-table-th--sortable'), 'Table must support sortable columns');
  assert.ok(tbl.includes('joy-table-cell--flash-up'), 'Table must support ticker flash up');
  assert.ok(tbl.includes('joy-table-cell--flash-down'), 'Table must support ticker flash down');
  assert.ok(tbl.includes('joy-table--responsive-stack'), 'Table must support responsive stack card mode for mobile');
  assert.ok(tbl.includes('data-label'), 'Table cells must provide data-label attributes for mobile card rendering');
  assert.ok(tbl.includes('<svg width="12" height="12"'), 'Table sort indicators must use vector SVG icons');

  const pagination = fs.readFileSync(path.resolve('./src/lib/Pagination.svelte'), 'utf8');
  assert.ok(pagination.includes('role="navigation"'), 'Pagination must implement role=navigation');
  assert.ok(pagination.includes('joy-pagination'), 'Pagination must have joy-pagination class');
  assert.ok(pagination.includes('$derived'), 'Pagination must use Svelte 5 $derived()');

  const skeleton = fs.readFileSync(path.resolve('./src/lib/Skeleton.svelte'), 'utf8');
  assert.ok(skeleton.includes('role="progressbar"'), 'Skeleton must implement role=progressbar');
  assert.ok(skeleton.includes('joy-skeleton'), 'Skeleton must have joy-skeleton class');

  // Wave 3 / Enterprise Parity Assertions (DatePicker, Breadcrumb, StatCard, Progress, EmptyState)
  const datePicker = fs.readFileSync(path.resolve('./src/lib/DatePicker.svelte'), 'utf8');
  assert.ok(datePicker.includes('joy-date-picker'), 'DatePicker must have joy-date-picker class');
  assert.ok(datePicker.includes('$props()'), 'DatePicker must use Svelte 5 runes');

  const breadcrumb = fs.readFileSync(path.resolve('./src/lib/Breadcrumb.svelte'), 'utf8');
  assert.ok(breadcrumb.includes('joy-breadcrumb'), 'Breadcrumb must have joy-breadcrumb class');
  assert.ok(breadcrumb.includes('aria-label="Breadcrumb"'), 'Breadcrumb must have accessible aria-label');

  const statCard = fs.readFileSync(path.resolve('./src/lib/StatCard.svelte'), 'utf8');
  assert.ok(statCard.includes('joy-stat-card'), 'StatCard must have joy-stat-card class');

  const progress = fs.readFileSync(path.resolve('./src/lib/Progress.svelte'), 'utf8');
  assert.ok(progress.includes('joy-progress'), 'Progress must have joy-progress class');

  const emptyState = fs.readFileSync(path.resolve('./src/lib/EmptyState.svelte'), 'utf8');
  assert.ok(emptyState.includes('joy-empty-state'), 'EmptyState must have joy-empty-state class');

  // Wave 4 Assertions (Ant Design Parity: Upload, Avatar, Slider, MarkdownViewer)
  const upload = fs.readFileSync(path.resolve('./src/lib/Upload.svelte'), 'utf8');
  assert.ok(upload.includes('joy-upload'), 'Upload must have joy-upload class');
  assert.ok(upload.includes('$props()'), 'Upload must use Svelte 5 runes');

  const avatar = fs.readFileSync(path.resolve('./src/lib/Avatar.svelte'), 'utf8');
  assert.ok(avatar.includes('joy-avatar'), 'Avatar must have joy-avatar class');
  assert.ok(avatar.includes('$props()'), 'Avatar must use Svelte 5 runes');

  const slider = fs.readFileSync(path.resolve('./src/lib/Slider.svelte'), 'utf8');
  assert.ok(slider.includes('joy-slider'), 'Slider must have joy-slider class');
  assert.ok(slider.includes('role="slider"'), 'Slider must implement role=slider');

  const md = fs.readFileSync(path.resolve('./src/lib/MarkdownViewer.svelte'), 'utf8');
  assert.ok(md.includes('joy-markdown'), 'MarkdownViewer must have joy-markdown class');
  assert.ok(md.includes('joy-markdown__copy-btn'), 'MarkdownViewer must include copy button');

  // Wave 5 Assertions (Landing Page Architecture & Enterprise Workflow Suite)
  const bento = fs.readFileSync(path.resolve('./src/lib/BentoCard.svelte'), 'utf8');
  assert.ok(bento.includes('joy-bento-card'), 'BentoCard must have joy-bento-card class');
  assert.ok(bento.includes('$props()'), 'BentoCard must use Svelte 5 runes');

  const hero = fs.readFileSync(path.resolve('./src/lib/HeroSection.svelte'), 'utf8');
  assert.ok(hero.includes('joy-hero'), 'HeroSection must have joy-hero class');
  assert.ok(hero.includes('joy-hero__secondary-cta'), 'HeroSection secondary action must use dedicated joy-hero__secondary-cta class');

  const pricing = fs.readFileSync(path.resolve('./src/lib/PricingCard.svelte'), 'utf8');
  assert.ok(pricing.includes('joy-pricing-card'), 'PricingCard must have joy-pricing-card class');

  const steps = fs.readFileSync(path.resolve('./src/lib/Steps.svelte'), 'utf8');
  assert.ok(steps.includes('joy-steps'), 'Steps must have joy-steps class');
  assert.ok(steps.includes('role="navigation"'), 'Steps must implement role=navigation');

  const timeline = fs.readFileSync(path.resolve('./src/lib/Timeline.svelte'), 'utf8');
  assert.ok(timeline.includes('joy-timeline'), 'Timeline must have joy-timeline class');

  const result = fs.readFileSync(path.resolve('./src/lib/Result.svelte'), 'utf8');
  assert.ok(result.includes('joy-result'), 'Result must have joy-result class');
  assert.ok(result.includes('role="alert"'), 'Result must implement role=alert');

  // Wave 6 Assertions (High-Performance Financial Charts & Layout Primitives)
  const lineChart = fs.readFileSync(path.resolve('./src/lib/LineChart.svelte'), 'utf8');
  assert.ok(lineChart.includes('joy-chart'), 'LineChart must have joy-chart class');
  assert.ok(lineChart.includes('JoyChartCore'), 'LineChart must initialize JoyChartCore');

  const candleChart = fs.readFileSync(path.resolve('./src/lib/CandlestickChart.svelte'), 'utf8');
  assert.ok(candleChart.includes('joy-chart'), 'CandlestickChart must have joy-chart class');
  assert.ok(candleChart.includes('joy-chart__hud'), 'CandlestickChart must render OHLC HUD');

  const divider = fs.readFileSync(path.resolve('./src/lib/Divider.svelte'), 'utf8');
  assert.ok(divider.includes('joy-divider'), 'Divider must have joy-divider class');
  assert.ok(divider.includes('role="separator"'), 'Divider must implement role=separator');

  const flex = fs.readFileSync(path.resolve('./src/lib/Flex.svelte'), 'utf8');
  assert.ok(flex.includes('joy-flex'), 'Flex must have joy-flex class');

  const space = fs.readFileSync(path.resolve('./src/lib/Space.svelte'), 'utf8');
  assert.ok(space.includes('joy-space'), 'Space must have joy-space class');

  const splitter = fs.readFileSync(path.resolve('./src/lib/Splitter.svelte'), 'utf8');
  assert.ok(splitter.includes('joy-splitter'), 'Splitter must have joy-splitter class');
  assert.ok(splitter.includes('role="separator"'), 'Splitter bar must implement role=separator');

  const statistic = fs.readFileSync(path.resolve('./src/lib/Statistic.svelte'), 'utf8');
  assert.ok(statistic.includes('joy-statistic'), 'Statistic must have joy-statistic class');

  const tag = fs.readFileSync(path.resolve('./src/lib/Tag.svelte'), 'utf8');
  assert.ok(tag.includes('joy-tag'), 'Tag must have joy-tag class');

  const segmented = fs.readFileSync(path.resolve('./src/lib/Segmented.svelte'), 'utf8');
  assert.ok(segmented.includes('joy-segmented'), 'Segmented must have joy-segmented class');
  assert.ok(segmented.includes('role="radiogroup"'), 'Segmented must implement role=radiogroup');

  // Wave 7 Assertions (Form Suite & Advanced Data Entry)
  const form = fs.readFileSync(path.resolve('./src/lib/Form.svelte'), 'utf8');
  assert.ok(form.includes('joy-form'), 'Form must have joy-form class');
  assert.ok(form.includes('$props()'), 'Form must use Svelte 5 runes');

  const formItem = fs.readFileSync(path.resolve('./src/lib/FormItem.svelte'), 'utf8');
  assert.ok(formItem.includes('joy-form-item'), 'FormItem must have joy-form-item class');
  assert.ok(formItem.includes('role="alert"'), 'FormItem error explain must implement alert role');

  const inputNumber = fs.readFileSync(path.resolve('./src/lib/InputNumber.svelte'), 'utf8');
  assert.ok(inputNumber.includes('joy-input-number'), 'InputNumber must have joy-input-number class');
  assert.ok(inputNumber.includes('role="spinbutton"'), 'InputNumber must implement role=spinbutton');

  const rate = fs.readFileSync(path.resolve('./src/lib/Rate.svelte'), 'utf8');
  assert.ok(rate.includes('joy-rate'), 'Rate must have joy-rate class');
  assert.ok(rate.includes('role="radiogroup"'), 'Rate must implement role=radiogroup');

  const mentions = fs.readFileSync(path.resolve('./src/lib/Mentions.svelte'), 'utf8');
  assert.ok(mentions.includes('joy-mentions'), 'Mentions must have joy-mentions class');
  assert.ok(mentions.includes('role="listbox"'), 'Mentions dropdown must implement role=listbox');

  const timePicker = fs.readFileSync(path.resolve('./src/lib/TimePicker.svelte'), 'utf8');
  assert.ok(timePicker.includes('joy-time-picker'), 'TimePicker must have joy-time-picker class');

  const transfer = fs.readFileSync(path.resolve('./src/lib/Transfer.svelte'), 'utf8');
  assert.ok(transfer.includes('joy-transfer'), 'Transfer must have joy-transfer class');

  // Wave 8 Assertions (Navigation & Feedback Suite)
  const menu = fs.readFileSync(path.resolve('./src/lib/Menu.svelte'), 'utf8');
  assert.ok(menu.includes('joy-menu'), 'Menu must have joy-menu class');
  assert.ok(menu.includes('role="menu"'), 'Menu must implement role=menu');

  const anchor = fs.readFileSync(path.resolve('./src/lib/Anchor.svelte'), 'utf8');
  assert.ok(anchor.includes('joy-anchor'), 'Anchor must have joy-anchor class');
  assert.ok(anchor.includes('role="navigation"'), 'Anchor must implement role=navigation');

  const message = fs.readFileSync(path.resolve('./src/lib/Message.svelte'), 'utf8');
  assert.ok(message.includes('joy-message'), 'Message must have joy-message class');
  assert.ok(message.includes('role="alert"'), 'Message must implement role=alert');

  const notification = fs.readFileSync(path.resolve('./src/lib/Notification.svelte'), 'utf8');
  assert.ok(notification.includes('joy-notification'), 'Notification must have joy-notification class');
  assert.ok(notification.includes('role="alert"'), 'Notification must implement role=alert');

  const popconfirm = fs.readFileSync(path.resolve('./src/lib/Popconfirm.svelte'), 'utf8');
  assert.ok(popconfirm.includes('joy-popconfirm'), 'Popconfirm must have joy-popconfirm class');
  assert.ok(popconfirm.includes('role="dialog"'), 'Popconfirm panel must implement role=dialog');

  const spin = fs.readFileSync(path.resolve('./src/lib/Spin.svelte'), 'utf8');
  assert.ok(spin.includes('joy-spin'), 'Spin must have joy-spin class');
  assert.ok(spin.includes('role="status"'), 'Spin must implement role=status');

  // Wave 10 Assertions (Image Preview & Accessible Overlay Suite)
  const imagePreview = fs.readFileSync(path.resolve('./src/lib/ImagePreview.svelte'), 'utf8');
  assert.ok(imagePreview.includes('joy-image-preview-mask'), 'ImagePreview must render preview mask');
  assert.ok(imagePreview.includes('role="dialog"'), 'ImagePreview must implement role=dialog');
  assert.ok(imagePreview.includes('aria-modal="true"'), 'ImagePreview must set aria-modal=true');
  assert.ok(imagePreview.includes('lockBodyScroll'), 'ImagePreview must invoke lockBodyScroll');
  assert.ok(imagePreview.includes('trapFocus'), 'ImagePreview must invoke trapFocus');

  const overlayUtils = fs.readFileSync(path.resolve('./src/lib/overlay-utils.ts'), 'utf8');
  assert.ok(overlayUtils.includes('lockBodyScroll'), 'overlay-utils must export lockBodyScroll');
  assert.ok(overlayUtils.includes('trapFocus'), 'overlay-utils must export trapFocus');

  // Wave 10B Assertions (Live Markdown Editor & Sanitized Preview)
  const mdEditor = fs.readFileSync(path.resolve('./src/lib/MarkdownEditor.svelte'), 'utf8');
  assert.ok(mdEditor.includes('joy-markdown-editor'), 'MarkdownEditor must render joy-markdown-editor container');
  assert.ok(mdEditor.includes('joy-markdown-editor__toolbar'), 'MarkdownEditor must render toolbar');
  assert.ok(mdEditor.includes('joy-markdown-editor__preview'), 'MarkdownEditor must render live preview');
  assert.ok(mdEditor.includes('handleEditorScroll'), 'MarkdownEditor must implement synchronized editor scroll');
  assert.ok(mdEditor.includes('handlePreviewScroll'), 'MarkdownEditor must implement synchronized preview scroll');

  // Wave 10C Assertions (TreeSelect & Cascader Hierarchical Data Entry)
  const treeSelect = fs.readFileSync(path.resolve('./src/lib/TreeSelect.svelte'), 'utf8');
  assert.ok(treeSelect.includes('joy-treeselect'), 'TreeSelect must have joy-treeselect class');
  assert.ok(treeSelect.includes('role="tree"'), 'TreeSelect must implement role=tree');
  assert.ok(treeSelect.includes('role="treeitem"'), 'TreeSelect must implement role=treeitem');

  const cascader = fs.readFileSync(path.resolve('./src/lib/Cascader.svelte'), 'utf8');
  assert.ok(cascader.includes('joy-cascader'), 'Cascader must have joy-cascader class');
  assert.ok(cascader.includes('role="listbox"'), 'Cascader must implement role=listbox');

  // Wave 13B: Landing Page Component Suite
  const featureCard = fs.readFileSync(path.resolve('./src/lib/FeatureCard.svelte'), 'utf8');
  assert.ok(featureCard.includes('joy-feature-card'), 'FeatureCard must render joy-feature-card class');
  assert.ok(featureCard.includes('$props()'), 'FeatureCard must use Svelte 5 runes');

  const featureGrid = fs.readFileSync(path.resolve('./src/lib/FeatureGrid.svelte'), 'utf8');
  assert.ok(featureGrid.includes('joy-feature-grid'), 'FeatureGrid must render joy-feature-grid class');

  const logoCloud = fs.readFileSync(path.resolve('./src/lib/LogoCloud.svelte'), 'utf8');
  assert.ok(logoCloud.includes('joy-logo-cloud'), 'LogoCloud must render joy-logo-cloud class');

  const statsSection = fs.readFileSync(path.resolve('./src/lib/StatsSection.svelte'), 'utf8');
  assert.ok(statsSection.includes('joy-stats-section'), 'StatsSection must render joy-stats-section class');
  assert.ok(statsSection.includes('joy-stat-item__value'), 'StatsSection must render metric values');

  const ctaSection = fs.readFileSync(path.resolve('./src/lib/CTASection.svelte'), 'utf8');
  assert.ok(ctaSection.includes('joy-cta-section'), 'CTASection must render joy-cta-section class');
  assert.ok(ctaSection.includes('joy-button--glass'), 'CTASection must use glass button for contrast safety');

  const faqSection = fs.readFileSync(path.resolve('./src/lib/FAQSection.svelte'), 'utf8');
  assert.ok(faqSection.includes('joy-faq-section'), 'FAQSection must render joy-faq-section class');
  assert.ok(faqSection.includes('aria-expanded'), 'FAQSection must implement accessible aria-expanded state');
  assert.ok(faqSection.includes('role="region"'), 'FAQSection must implement accessible role=region for panel');

  const siteFooter = fs.readFileSync(path.resolve('./src/lib/SiteFooter.svelte'), 'utf8');
  assert.ok(siteFooter.includes('joy-site-footer'), 'SiteFooter must render joy-site-footer class');
  assert.ok(siteFooter.includes('role="contentinfo"'), 'SiteFooter must implement accessible role=contentinfo');

  // Wave 13C: Full Page Combine Component & Theme Palettes
  const landingPage = fs.readFileSync(path.resolve('./src/lib/LandingPage.svelte'), 'utf8');
  assert.ok(landingPage.includes('joy-landing-page'), 'LandingPage must render joy-landing-page class');
  assert.ok(landingPage.includes('data-palette'), 'LandingPage must support data-palette attribute');
  assert.ok(landingPage.includes('HeroSection'), 'LandingPage must embed HeroSection');
  assert.ok(landingPage.includes('LogoCloud'), 'LandingPage must embed LogoCloud');
  assert.ok(landingPage.includes('FeatureGrid'), 'LandingPage must embed FeatureGrid');
  assert.ok(landingPage.includes('StatsSection'), 'LandingPage must embed StatsSection');
  assert.ok(landingPage.includes('FAQSection'), 'LandingPage must embed FAQSection');
  assert.ok(landingPage.includes('CTASection'), 'LandingPage must embed CTASection');
  assert.ok(landingPage.includes('SiteFooter'), 'LandingPage must embed SiteFooter');
});


test('Wave 2 B-L1: Button, Input, InputNumber, Select, DatePicker, DateRangePicker', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
  const assertWave2 = (name) => {
    const src = read(name);
    assert.ok(!src.includes('<style'), `${name} must not carry a scoped style block`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2605\u2606\u2192]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
    assert.ok(src.includes('...rest') && src.includes('bind:this={ref}'), `${name} must spread rest props and expose bind:ref`);
  };

  ['Button', 'Input', 'InputNumber', 'Select', 'DatePicker', 'DateRangePicker'].forEach(assertWave2);

  const button = read('Button');
  assert.ok(button.includes("'link'"), "Button must include 'link' variant");
  assert.ok(button.includes('joy-button__label'), 'Button must include joy-button__label');
  assert.ok(button.includes('joy-button--block'), 'Button must include joy-button--block');
  assert.ok(button.includes('joy-button--icon-only'), 'Button must include joy-button--icon-only');
  assert.ok(button.includes('aria-busy'), 'Button must include aria-busy');
  assert.ok(button.includes('iconStart'), 'Button must include iconStart');
  assert.ok(button.includes('iconEnd'), 'Button must include iconEnd');

  const input = read('Input');
  assert.ok(input.includes('joy-input-wrapper__message'), 'Input must include joy-input-wrapper__message');
  assert.ok(input.includes('readonly'), 'Input must include readonly');

  const inputNumber = read('InputNumber');
  assert.ok(inputNumber.includes('inputmode="decimal"'), 'InputNumber must include inputmode="decimal"');
  assert.ok(
    inputNumber.split('\n').some((line) => line.includes('<input') && line.includes('role="spinbutton"')),
    'InputNumber must include role="spinbutton" on the input line'
  );

  const select = read('Select');
  assert.ok(select.includes('role="combobox"'), 'Select must include role="combobox"');
  assert.ok(select.includes('joy-select__listbox'), 'Select must include joy-select__listbox');
  assert.ok(select.includes('openOverlay'), 'Select must include openOverlay');
  assert.ok(select.includes('type="hidden"'), 'Select must include type="hidden"');

  const datePicker = read('DatePicker');
  assert.ok(datePicker.includes('@joymify/icons'), 'DatePicker must include @joymify/icons');

  const dateRangePicker = read('DateRangePicker');
  assert.ok(!dateRangePicker.includes('\u2192'), 'DateRangePicker must not include \u2192');
});


test('Wave 2 B-L2: TimePicker, Mentions, MarkdownEditor', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
  const assertWave2 = (name) => {
    const src = read(name);
    assert.ok(!src.includes('<style'), `${name} must not carry a scoped style block`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2605\u2606\u2192]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
    assert.ok(src.includes('...rest') && src.includes('bind:this={ref}'), `${name} must spread rest props and expose bind:ref`);
  };

  for (const comp of ['TimePicker', 'Mentions', 'MarkdownEditor']) {
    assertWave2(comp);
  }

  const timePicker = read('TimePicker');
  assert.ok(timePicker.includes('openOverlay'), 'TimePicker must include openOverlay');

  const mentions = read('Mentions');
  assert.ok(mentions.includes('openOverlay'), 'Mentions must include openOverlay');
  assert.ok(!mentions.includes('setTimeout'), 'Mentions must not include setTimeout');

  const md = read('MarkdownEditor');
  assert.ok(md.includes('joy-markdown-editor__tool'), 'MarkdownEditor must include joy-markdown-editor__tool');
  assert.ok(md.includes('@joymify/icons'), 'MarkdownEditor must include @joymify/icons');
});


test('Wave 2 B-L3: choice controls with keyboard operation, indeterminate checkbox, form context', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
  const assertWave2 = (name) => {
    const src = read(name);
    assert.ok(!src.includes('<style'), `${name} must not carry a scoped style block`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2605}\u{2606}→]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
    assert.ok(src.includes('...rest') && src.includes('bind:this={ref}'), `${name} must spread rest props and expose bind:ref`);
  };

  const bL3Components = [
    'Checkbox',
    'Switch',
    'RadioGroup',
    'Slider',
    'Rate',
    'Segmented',
    'Form',
    'FormItem'
  ];

  for (const comp of bL3Components) {
    assertWave2(comp);
  }

  const checkbox = read('Checkbox');
  assert.ok(!checkbox.includes('role="checkbox"'), 'Checkbox must not duplicate the native role');
  assert.ok(checkbox.includes('indeterminate'), 'Checkbox must support indeterminate state');

  const radio = read('RadioGroup');
  assert.ok(radio.includes('ArrowRight'), 'RadioGroup must support arrow key navigation');

  const segmented = read('Segmented');
  assert.ok(segmented.includes('ArrowRight'), 'Segmented must support arrow key navigation');

  const rate = read('Rate');
  assert.ok(rate.includes('ArrowRight'), 'Rate must support arrow key navigation');
  assert.ok(rate.includes('role="radio"'), 'Rate stars must implement role=radio');

  const form = read('Form');
  assert.ok(form.includes("setContext('joy-form'"), 'Form must cascade context via joy-form');

  const formItem = read('FormItem');
  assert.ok(formItem.includes('joy-form-item__explain'), 'FormItem must render joy-form-item__explain');
});


test('Wave 2 B-L4: TreeSelect, Cascader, Transfer, Upload', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
  const assertWave2 = (name) => {
    const src = read(name);
    assert.ok(!src.includes('<style'), `${name} must not carry a scoped style block`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2605}\u{2606}→]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
    assert.ok(src.includes('...rest') && src.includes('bind:this={ref}'), `${name} must spread rest props and expose bind:ref`);
  };

  const files = ['TreeSelect', 'Cascader', 'Transfer', 'Upload'];
  files.forEach(assertWave2);

  const treeSelect = read('TreeSelect');
  assert.ok(treeSelect.includes('openOverlay'), 'TreeSelect must include openOverlay');
  const treeSelectStyles = treeSelect.match(/style="[^"]*"/g) || [];
  assert.strictEqual(treeSelectStyles.filter((s) => !s.includes('{style}')).length, 0, 'TreeSelect must not include style="..." other than root passthrough');

  const cascader = read('Cascader');
  assert.ok(cascader.includes('openOverlay'), 'Cascader must include openOverlay');
  const cascaderStyles = cascader.match(/style="[^"]*"/g) || [];
  assert.strictEqual(cascaderStyles.filter((s) => !s.includes('{style}')).length, 0, 'Cascader must not include style="..." other than root passthrough');

  const transfer = read('Transfer');
  assert.ok(transfer.includes('joy-button--icon-only'), 'Transfer must include joy-button--icon-only');
  assert.ok(!transfer.includes('joy-button--primary'), 'Transfer must not include joy-button--primary');

  const upload = read('Upload');
  assert.ok(upload.includes('@joymify/icons'), 'Upload must import from @joymify/icons');
});
