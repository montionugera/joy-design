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
  assert.ok(popconfirm.includes('role="alertdialog"'), 'Popconfirm panel must implement role=alertdialog');

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
  assert.ok(form.includes('setFormContext('), 'Form must cascade context via the shared form-context helper');
  const formContextHelper = fs.readFileSync(path.resolve('./src/lib/form-context.ts'), 'utf8');
  assert.ok(formContextHelper.includes("'joy-form'"), 'form-context helper must key the context as joy-form');

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

test('F-037 lane review: Mentions per-instance id, Rate readonly semantics, Select activedescendant', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');

  const mentions = read('Mentions');
  assert.ok(
    !mentions.includes('id="mentions-dropdown"') && !mentions.includes("id='mentions-dropdown'"),
    'Mentions dropdown id must not be a hardcoded literal'
  );
  assert.ok(mentions.includes('$props.id()'), 'Mentions must derive a per-instance id via $props.id()');
  assert.ok(
    mentions.includes('aria-controls={isOpen && filteredOptions.length > 0 ? dropdownId : undefined}'),
    'Mentions textarea must wire aria-controls to the per-instance dropdown id'
  );
  assert.ok(mentions.includes('id={dropdownId}'), 'Mentions dropdown must render the per-instance id');
  assert.ok(
    mentions.includes('class="joy-textarea joy-mentions__textarea"'),
    'Mentions textarea must carry both joy-textarea and joy-mentions__textarea classes'
  );

  const rate = read('Rate');
  assert.ok(
    !rate.includes('disabled={effectiveDisabled || readonly}'),
    'Rate stars must not set native disabled from readonly'
  );
  assert.ok(rate.includes('disabled={effectiveDisabled}'), 'Rate stars disabled must reflect only real disabled');
  assert.ok(
    !rate.includes('effectiveDisabled || readonly ? -1'),
    'Rate readonly must not remove stars from the tab order'
  );
  assert.ok(
    rate.includes(`aria-readonly={readonly ? 'true' : undefined}`),
    'Rate radiogroup must expose aria-readonly when readonly'
  );

  const select = read('Select');
  assert.ok(
    select.includes('aria-activedescendant={activeDescendantId}'),
    'Select combobox must wire aria-activedescendant to the active option'
  );
  assert.ok(
    select.includes('id="{listboxId}-opt-{i}"'),
    'Select options must expose stable ids derived from the listbox id'
  );
});

test('F-038 B-L1: Avatar/AvatarGroup/Badge/Tag/Divider use brand tokens, overflow avatar, no foreign literals', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
  const banned = ['#7c3aed', '#e2e8f0', '#334155', '#f1f5f9', '#64748b', '#ffffff'];
  for (const name of ['Avatar', 'AvatarGroup', 'Badge', 'Tag', 'Divider']) {
    const src = read(name);
    for (const lit of banned) {
      assert.ok(!src.includes(lit), `${name}.svelte must not contain the raw literal '${lit}'`);
    }
  }
  const group = read('AvatarGroup');
  assert.ok(!group.includes('MutationObserver'), 'AvatarGroup must not mutate the DOM to honour max');
  assert.ok(!group.includes('$effect'), 'AvatarGroup max must be pure derived state (SSR-safe)');
  assert.ok(group.includes('items?.slice(0, limit)'), 'AvatarGroup must slice items to max');
  assert.ok(group.includes('+{overflow}'), 'AvatarGroup must render a +N overflow avatar');
  assert.ok(group.includes('joy-avatar-group__overflow'), 'AvatarGroup overflow avatar must carry its class');
  assert.ok(read('Avatar').includes('onerror'), 'Avatar must fall back when the image fails to load');
  assert.ok(!read('Tag').includes('style="border: none'), 'Tag close button styling must live in CSS, not inline');
});

test('F-038 B-L2: MetricTile/StatCard/Statistic/Image/Flex/Space use tokens, icon trends, no tracked caps', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
  const banned = ['#ffffff', '#f8fafc', '#64748b', '#cbd5e1', '#10b981', '#ef4444', '#3b82f6', '#1e293b', '#334155', 'rgba('];
  for (const name of ['Flex', 'Space', 'Image', 'MetricTile', 'StatCard', 'Statistic']) {
    const src = read(name);
    for (const lit of banned) {
      assert.ok(!src.includes(lit), `${name}.svelte must not contain the raw literal '${lit}'`);
    }
    assert.ok(src.includes('bind:this={ref}') && src.includes('{...rest}'), `${name} must bind ref and spread rest props`);
  }
  for (const name of ['MetricTile', 'StatCard']) {
    const src = read(name);
    assert.ok(!/text-transform:\s*uppercase/.test(src), `${name} must not use uppercase labels`);
    assert.ok(!/letter-spacing/.test(src), `${name} must not track its labels`);
    assert.ok(!src.includes('▲') && !src.includes('▼'), `${name} must not use unicode trend glyphs`);
    assert.ok(src.includes('TrendingUp') && src.includes('TrendingDown'), `${name} must use TrendingUp/TrendingDown icons`);
    assert.ok(!src.includes('<style'), `${name}.svelte must have no scoped <style>; packages/tokens/build.js is the single stylesheet shared with React`);
  }
  const css = fs.readFileSync(path.resolve('../tokens/dist/theme.css'), 'utf8');
  const ruleBody = (sel) => {
    const m = css.match(new RegExp(`(^|\\n)${sel.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`));
    assert.ok(m, `theme.css must contain ${sel}`);
    return m[2];
  };
  for (const sel of ['.joy-metric-tile', '.joy-stat-card']) {
    const body = ruleBody(sel);
    assert.ok(body.includes('var(--joy-surface-card)') && body.includes('var(--joy-border-default)'), `${sel} must use card surface + default border tokens`);
  }
  assert.ok(ruleBody('.joy-stat-card__delta--info').includes('var(--joy-status-info-fg)'), 'info delta uses status-info-fg');
  assert.ok(ruleBody('.joy-stat-card__delta--positive').includes('var(--joy-status-success-fg)'), 'positive delta uses status-success-fg');
  assert.ok(ruleBody('.joy-stat-card__delta--critical').includes('var(--joy-status-danger-fg)'), 'critical delta uses status-danger-fg');
});

test('F-038 B-L2 fix: deltaDirection follows the sign, never the tone', async () => {
  const { deltaDirection } = await import('../src/lib/delta-utils.ts');
  assert.strictEqual(deltaDirection('-5%'), 'down');
  assert.strictEqual(deltaDirection('−5%'), 'down');
  assert.strictEqual(deltaDirection('  -0.4 pts'), 'down');
  assert.strictEqual(deltaDirection('+2.1% error rate'), 'up');
  assert.strictEqual(deltaDirection('12%'), 'flat');
  assert.strictEqual(deltaDirection('Stable'), 'flat');
  assert.strictEqual(deltaDirection(''), 'flat');
  assert.strictEqual(deltaDirection(undefined), 'flat');
  const src = fs.readFileSync(path.resolve('./src/lib/StatCard.svelte'), 'utf8');
  assert.ok(/import\s*\{\s*deltaDirection\s*\}\s*from\s*'\.\/delta-utils\.js'/.test(src), 'StatCard must import deltaDirection');
  assert.ok(src.includes('trend ?? deltaDirection(delta)'), 'StatCard direction = explicit trend, else derived from the delta text');
  assert.ok(src.includes("direction === 'up'") && src.includes("direction === 'down'"), 'StatCard icon and sr text must key off direction');
  assert.ok(!src.includes("deltaTone === 'positive'") && !src.includes("deltaTone === 'critical'"), 'tone must not drive the arrow');
  for (const n of ['StatCard', 'MetricTile']) {
    const s = fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
    assert.ok(!/__sr\s*\{/.test(s), `${n} must not redefine the build.js-owned __sr rule`);
    assert.ok(/import\s*\{[^}]*TrendingUp[^}]*TrendingDown[^}]*\}\s*from\s*'@joymify\/icons'/.test(s), `${n} must import the trend icons`);
    assert.ok(!s.includes('▲') && !s.includes('▼'), `${n} must not use unicode trend glyphs`);
  }
});

test('F-038 B-L3: Alert/EmptyState/Result/Skeleton use build.js-owned styles, tokens only, ref+rest, Alert is closable with icons', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
  for (const n of ['Alert', 'EmptyState', 'Result', 'Skeleton']) {
    const s = read(n);
    assert.ok(!/<style[\s>]/.test(s), `${n} must not carry a scoped <style> (build.js owns the joy-* rules)`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(s), `${n} must contain no colour literals`);
    assert.ok(s.includes('bind:this={ref}') && s.includes('$bindable(null)'), `${n} must bind ref`);
    assert.ok(s.includes('{...rest}') && s.includes('...rest'), `${n} must spread rest props`);
    assert.ok(s.includes('class: className'), `${n} must accept class`);
  }
  const alert = read('Alert');
  assert.ok(!alert.includes('border-left'), 'Alert must not use a side stripe');
  assert.ok(/import\s*\{[^}]*CheckCircle[^}]*\}\s*from\s*'@joymify\/icons'/.test(alert), 'Alert imports status icons from @joymify/icons');
  assert.ok(alert.includes('class="joy-alert__icon" aria-hidden="true"'), 'Alert icon is decorative (aria-hidden)');
  assert.ok(alert.includes('closable = false') && alert.includes('onclose'), 'Alert has closable (default false) and onclose');
  assert.ok(alert.includes('aria-label="Dismiss alert"') && alert.includes('joy-alert__close'), 'close button is labelled');
  assert.ok(alert.includes('{#if closable}'), 'close button renders only when closable');
});

test('F-038 B-L3: Alert close control is an accessible 44px button and the dismiss model is documented', () => {
  const alert = fs.readFileSync(path.resolve('./src/lib/Alert.svelte'), 'utf8');
  assert.ok(/<button type="button" class="joy-alert__close" aria-label="Dismiss alert" onclick=\{dismiss\}>/.test(alert), 'close is a type=button with aria-label wired to dismiss');
  const fn = alert.match(/function dismiss\(\)\s*\{([^}]*)\}/);
  assert.ok(fn && fn[1].includes('dismissed = true') && fn[1].includes('onclose?.()'), 'dismiss hides then notifies');
  assert.ok(alert.includes('{#if !dismissed}'), 'markup is gated on dismissed');
  assert.ok(/stays hidden until\s+\*?\s*remounted/.test(alert), 'uncontrolled dismiss model is documented on the props');
  const css = fs.readFileSync(path.resolve('../tokens/dist/theme.css'), 'utf8');
  assert.match(css, /\.joy-alert__close::before\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/s, 'theme.css ships the 44px close hit area');
});

test('F-038 B-L3 fix: Skeleton renders one progressbar root, merges consumer style and accepts numeric sizes', () => {
  const src = fs.readFileSync(path.resolve('./src/lib/Skeleton.svelte'), 'utf8');
  assert.strictEqual((src.match(/role="progressbar"/g) || []).length, 2, 'one role per branch (lines wrapper, single element), never per line');
  assert.strictEqual((src.match(/\{\.\.\.rest\}/g) || []).length, 2, 'rest spread once per branch, not on lines');
  const lineEl = src.match(/\{#each[\s\S]*?\{\/each\}/)[0];
  assert.ok(!lineEl.includes('rest') && !lineEl.includes('role='), 'line elements carry no rest/role');
  assert.ok(lineEl.includes("decl('height'"), 'height applies to each line like React');
  assert.ok(src.includes('width?: string | number') && src.includes("typeof d === 'number' ? `${d}px`"), 'numeric width/height map to px');
  assert.ok(/style="[^"]*\{consumerStyle\}"/.test(src), 'consumer style is appended after the computed declarations');
  assert.ok(!/style=\{width/.test(src), 'no wholesale style replacement');
});

const readLib = (f) => fs.readFileSync(path.resolve(`./src/lib/${f}`), 'utf8');

test('F-038 B-L4: Message/Notification/Toast/Progress/Spin use build.js-owned styles, tokens only, icons from @joymify/icons, ref+rest+class', () => {
  for (const n of ['Message', 'Notification', 'Toast', 'Progress', 'Spin']) {
    const s = readLib(`${n}.svelte`);
    assert.ok(!/<style[\s>]/.test(s), `${n} must not carry a scoped <style> (build.js owns the joy-* rules)`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|--joy-color-/.test(s), `${n} must contain no colour literals or legacy --joy-color-* fallbacks`);
    // Progress legitimately forwards the consumer's strokeColor prop as an inline background-color.
    const inline = s.replace("background-color: {strokeColor || ''}", '');
    assert.ok(!/style="[^"]*(color|background|z-index)/.test(inline), `${n} must not carry inline colour styling`);
    assert.ok(s.includes('bind:this={ref}') && s.includes('$bindable(null)'), `${n} must bind ref`);
    assert.ok(s.includes('{...rest}') && s.includes('...rest'), `${n} must spread rest props`);
    assert.ok(s.includes('class: className'), `${n} must accept class`);
  }
  for (const n of ['Message', 'Notification']) {
    const s = readLib(`${n}.svelte`);
    assert.ok(/import\s*\{[^}]*Info[^}]*\}\s*from\s*'@joymify\/icons'/.test(s), `${n} imports status icons from @joymify/icons`);
    assert.ok(!/<svg/.test(s), `${n} must not inline raw svg markup`);
    assert.ok(s.includes(`joy-${n.toLowerCase()}__icon--{type}`) && s.includes('aria-hidden="true"'), `${n} icon is decorative and tone-classed`);
  }
});

test('F-038 B-L4: Toast and Notification close buttons are labelled icon buttons, Toast renders it only with onclose', () => {
  const toast = readLib('Toast.svelte');
  assert.ok(/import\s*\{[^}]*Close[^}]*\}\s*from\s*'@joymify\/icons'/.test(toast), 'Toast imports Close');
  assert.ok(!toast.includes('&times;'), 'Toast must not use a raw entity as an icon');
  assert.ok(/<button type="button" class="joy-toast__close" aria-label="Dismiss notification" onclick=\{onclose\}>/.test(toast), 'Toast close is a labelled type=button');
  assert.ok(toast.includes('{#if onclose}'), 'Toast close renders only when onclose is provided');
  const note = readLib('Notification.svelte');
  assert.ok(/<button type="button" class="joy-notification__close" aria-label="Dismiss notification" onclick=\{close\}>/.test(note), 'Notification close is a labelled type=button');
  assert.ok(/import\s*\{[^}]*Close[^}]*\}\s*from\s*'@joymify\/icons'/.test(note), 'Notification imports Close');
  const css = fs.readFileSync(path.resolve('../tokens/dist/theme.css'), 'utf8');
  for (const c of ['joy-toast__close', 'joy-notification__close']) {
    assert.match(css, new RegExp(`\\.${c}::before\\s*\\{[^}]*width:\\s*44px[^}]*height:\\s*44px`, 's'), `${c} ships a 44px hit area`);
  }
});

test('F-038 B-L4: Progress exposes role=progressbar with aria-valuenow/min/max on the ROOT (once, before rest) and Spin marks its tip and indicator', () => {
  const p = readLib('Progress.svelte');
  assert.strictEqual((p.match(/role="progressbar"/g) || []).length, 1, 'exactly one progressbar role');
  const root = p.match(/<div\s+bind:this=\{ref\}[\s\S]*?\n>/)[0];
  assert.ok(root.includes('class="joy-progress '), 'the element carrying bind:this/class/rest is the .joy-progress root');
  assert.ok(root.includes('role="progressbar"') && root.includes('aria-valuenow={valueNow}') && root.includes('aria-valuemin="0"') && root.includes('aria-valuemax="100"'), 'role and aria values live on the root');
  assert.ok(root.indexOf('role="progressbar"') < root.indexOf('{...rest}'), 'rest comes after role so consumer aria-label/labelledby name the progressbar');
  assert.ok(!/class="joy-progress__inner"[^>]*role=/.test(p), 'the track carries no role');
  assert.ok(p.includes('Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0'), 'aria-valuenow is clamped to 0..100 and non-finite is 0');
  assert.ok(p.includes('width: {valueNow}%'), 'bar width uses the same clamped value');
  const s = readLib('Spin.svelte');
  assert.ok(s.includes('class="joy-spin__tip"'), 'Spin tip uses the tokenized joy-spin__tip class');
  assert.ok(s.includes('aria-hidden="true"'), 'Spin indicator svg is decorative');
  assert.strictEqual((s.match(/role="status"/g) || []).length, 2, 'one status role per branch, never nested');
});

test('F-038 C-L4 fix: Message/Notification auto-dismiss goes through the shared createAutoDismiss (clear on dismiss, once)', () => {
  assert.strictEqual(readLib('auto-dismiss.ts'), fs.readFileSync(path.resolve('../react/src/auto-dismiss.ts'), 'utf8'), 'helper is byte-identical to the React copy');
  for (const f of ['Message', 'Notification']) {
    const src = readLib(`${f}.svelte`);
    assert.ok(src.includes("import { createAutoDismiss } from './auto-dismiss.js'") && src.includes('autoDismiss.start(duration)') && src.includes('return autoDismiss.cancel'), `${f} arms/cancels via the helper`);
    assert.ok(!/setTimeout/.test(src), `${f} has no raw timer left`);
  }
  assert.ok(/function close\(\) \{\s*autoDismiss\.dismiss\(\);/.test(readLib('Notification.svelte')), 'close button dismisses via the helper (clears the timer)');
});

test('F-038 B-L5: Anchor/Breadcrumb/Menu/Pagination/Steps/Tabs forward class, ref and rest onto the root, and none keeps a scoped style', () => {
  const roots = {
    Anchor: /<nav bind:this=\{ref\} class="joy-anchor \{className\}"[^>]*\{\.\.\.rest\}>/,
    Breadcrumb: /<nav bind:this=\{ref\} class="joy-breadcrumb \{className\}"[^>]*\{\.\.\.rest\}>/,
    Menu: /<ul\s+bind:this=\{ref\}\s+class="joy-menu joy-menu--\{mode\} \{className\}"[\s\S]*?\{\.\.\.rest\}\s*>/,
    Pagination: /<nav bind:this=\{ref\} class="joy-pagination \{className\}"[^>]*\{\.\.\.rest\}>/,
    Steps: /<div bind:this=\{ref\} class="joy-steps joy-steps--\{direction\} \{className\}"[^>]*\{\.\.\.rest\}>/,
    Tabs: /<div bind:this=\{ref\} class="joy-tabs-container \{className\}" \{\.\.\.rest\}>/
  };
  for (const [name, re] of Object.entries(roots)) {
    const src = readLib(`${name}.svelte`);
    assert.ok(re.test(src), `${name} root carries bind:this, class and {...rest}`);
    assert.ok(src.includes('ref = $bindable(null)') && src.includes('class: className'), `${name} declares ref and class props`);
    assert.ok(!/<style[\s>]/.test(src), `${name} has no scoped style (build.js is the single source)`);
  }
});

test('F-038 B-L5: roving-utils and pagination-utils are byte-identical to the React copies once C-L5 lands', () => {
  for (const f of ['roving-utils.ts', 'pagination-utils.ts']) {
    const react = path.resolve(`../react/src/${f}`);
    if (fs.existsSync(react)) assert.strictEqual(readLib(f), fs.readFileSync(react, 'utf8'), `${f} matches the React copy`);
  }
});

test('F-038 B-L5: Tabs is a WAI-ARIA tablist with roving tabindex, automatic activation and a labelled panel', () => {
  const t = readLib('Tabs.svelte');
  assert.ok(t.includes("import { rovingNextIndex, rovingTabbableIndex } from './roving-utils.js'"), 'uses the shared helper');
  assert.ok(t.includes('role="tablist"') && t.includes('role="tab"') && t.includes('role="tabpanel"'));
  assert.ok(t.includes('aria-selected={activeKey === item.key}'), 'aria-selected tracks the active key');
  assert.ok(t.includes('tabindex={index === tabbable ? 0 : -1}'), 'exactly one tab is tabbable');
  assert.ok(t.includes("rovingNextIndex(e.key, index, noneDisabled, 'horizontal')"), 'Left/Right/Home/End');
  assert.ok(/e\.preventDefault\(\);\s*selectTab\(items\[next\]\.key\);/.test(t), 'arrows activate as well as move focus');
  assert.ok(t.includes('aria-controls={activeKey === item.key ?') && t.includes('aria-labelledby='), 'panel wiring only points at ids that exist');
  assert.ok(t.includes('$props.id()'), 'ids are SSR-stable');
});

test('F-038 B-L5: Menu is a menu/menuitem list with aria-current, roving tabindex and Up/Down (+Left/Right when horizontal)', () => {
  const m = readLib('Menu.svelte');
  assert.ok(m.includes('role="menu"') && m.includes('role="menuitem"'));
  assert.ok(m.includes("aria-current={selectedKey === item.key ? 'page' : undefined}"), 'active item is aria-current=page');
  assert.ok(m.includes('tabindex={index === tabbable ? 0 : -1}') && m.includes('onfocus={() => (focusIndex = index)}'), 'roving tabindex follows focus');
  assert.ok(m.includes("mode === 'horizontal' ? 'both' : 'vertical'"), 'orientation by mode');
  assert.ok(m.includes('rovingNextIndex(e.key, index, disabledFlags, orientation)'), 'skips disabled items');
  assert.ok(m.includes("e.key === 'Enter' || e.key === ' '"), 'Enter and Space still select');
});

test('F-038 B-L5: Pagination windows its pages, collapses under 480px via matchMedia, and uses icons not entities', () => {
  const p = readLib('Pagination.svelte');
  assert.ok(p.includes("import { clampPage, pageCount, pageItems } from './pagination-utils.js'") && p.includes('pageItems(page, totalPages, compact)'));
  assert.ok(p.includes('let page = $derived(clampPage(current, totalPages))'), 'a stale out-of-range current is clamped');
  assert.ok(p.includes('disabled={page <= 1}') && p.includes('disabled={page >= totalPages}') && p.includes("aria-current={p === page ? 'page' : undefined}"), 'active/disabled/prev/next work from the clamped page');
  assert.ok(!p.includes('Array.from({ length: totalPages }'), 'no button per page');
  assert.ok(!/&[lr]arr;/.test(p), 'no arrow entities');
  assert.ok(/import\s*\{\s*ChevronLeft,\s*ChevronRight\s*\}\s*from\s*'@joymify\/icons'/.test(p));
  assert.ok(p.includes('let compact = $state(false)'), 'desktop-first default keeps SSR output full');
  assert.ok(p.includes("window.matchMedia('(max-width: 480px)')") && p.includes("removeEventListener('change', sync)"), 'listener is cleaned up');
  assert.ok(p.includes("typeof window === 'undefined'"), 'SSR-safe');
  assert.ok(p.includes('aria-label="Previous page"') && p.includes('aria-label="Next page"') && p.includes('aria-label="Page {p}"'));
});

test('F-038 B-L5: Steps marks the current step, Breadcrumb marks the last crumb, Anchor marks the active link', () => {
  assert.ok(readLib('Steps.svelte').includes("aria-current={index === current ? 'step' : undefined}"));
  const b = readLib('Breadcrumb.svelte');
  assert.ok(b.includes('aria-label="Breadcrumb"') && b.includes("aria-current={isLast ? 'page' : undefined}"));
  assert.ok(readLib('Anchor.svelte').includes("aria-current={activeKey === item.key ? 'location' : undefined}"));
});

// ---- F-038 B-L6: Modal, Drawer, Popconfirm, Dropdown, Tooltip, ImagePreview, Image ----
test('F-038 B-L6: Modal and Drawer lock scroll, trap focus, restore focus, and label the dialog with a unique id', () => {
  for (const [name, cls] of [['Modal', 'modal'], ['Drawer', 'drawer']]) {
    const s = readLib(`${name}.svelte`);
    assert.ok(/import \{[^}]*lockBodyScroll[^}]*trapFocus[^}]*\} from '\.\/overlay-utils\.js'/.test(s), `${name} imports the overlay primitive`);
    assert.ok(s.includes('if (!open || !ref) return;') && s.includes('lockBodyScroll()') && s.includes('trapFocus(ref)'), `${name} locks + traps while open`);
    assert.ok(s.includes('const previouslyFocused = document.activeElement') && s.includes('previouslyFocused.focus()'), `${name} restores focus`);
    assert.ok(s.includes('role="dialog"') && s.includes('aria-modal="true"'), `${name} is a modal dialog`);
    assert.ok(s.includes('const uid = $props.id()') && s.includes('aria-labelledby={title ? titleId : undefined}') && s.includes('aria-label={title ? undefined :'), `${name} label id is per-instance, with an aria-label fallback`);
    assert.ok(s.includes("e.key === 'Escape' && open && !e.defaultPrevented"), `${name} closes on Escape unless a nested popover or dialog already claimed it`);
    assert.ok(s.includes('e.target === e.currentTarget'), `${name} closes on backdrop click`);
    assert.ok(/import\s*\{\s*Close\s*\}\s*from\s*'@joymify\/icons'/.test(s) && !s.includes('&times;'), `${name} close button uses the Close icon`);
    assert.ok(s.includes(`class="joy-${cls}__close"`) && s.includes('type="button"'), `${name} close button`);
    assert.ok(s.includes('bind:this={ref}') && s.includes('{...rest}') && s.includes('ref = $bindable(null)'), `${name} exposes ref + rest on the dialog element`);
    assert.ok(!s.includes('<style>'), `${name} has no scoped style block`);
  }
  assert.ok(readLib('Modal.svelte').includes('aria-label="Close dialog"'));
  assert.ok(readLib('Drawer.svelte').includes('aria-label="Close drawer"'));
  assert.ok(readLib('Drawer.svelte').includes('class:joy-drawer-backdrop--left={placement === \'left\'}'), 'placement is a class, not an inline style');
});

test('F-038 B-L6: Popconfirm and Dropdown go through openOverlay; Popconfirm is an alertdialog, Dropdown a menu button', () => {
  const p = readLib('Popconfirm.svelte');
  assert.ok(p.includes("import { openOverlay } from './overlay-utils.js'") && p.includes('openOverlay({') && p.includes('handle.dispose()'));
  assert.ok(p.includes('role="alertdialog"') && p.includes('aria-labelledby={titleId}') && !p.includes('aria-modal'), 'non-modal alertdialog labelled by its title');
  assert.ok(p.includes("panelEl.querySelector<HTMLElement>('button')?.focus") && p.includes('focusTrigger()'), 'first button focused on open, focus returns to the trigger');
  assert.ok(/import\s*\{\s*AlertCircle\s*\}\s*from\s*'@joymify\/icons'/.test(p) && !p.includes('#f59e0b') && !p.includes('joy-color-status-warning'), 'warning icon is a token-coloured icon');

  const d = readLib('Dropdown.svelte');
  assert.ok(d.includes('openOverlay({') && d.includes('handle.dispose()') && d.includes("import { rovingNextIndex } from './roving-utils.js'"));
  assert.ok(d.includes('aria-haspopup="menu"') && d.includes('aria-expanded={open}') && d.includes('aria-controls='), 'trigger advertises the menu');
  assert.ok(d.includes('role="menu"') && d.includes('role="menuitem"') && d.includes('aria-orientation="vertical"'));
  assert.ok(d.includes("e.key === 'ArrowDown' || e.key === 'ArrowUp'") && d.includes('rovingNextIndex(e.key, current, disabledFlags, \'vertical\')') && d.includes("e.key === 'Tab'"), 'arrow/Home/End roving, Tab closes');
  assert.ok(d.includes('e.target === e.currentTarget'), 'Enter/Space on the wrapper only, so an inner <button> is not toggled twice');
  assert.ok(d.includes('triggerEl?.focus()'), 'selecting an item returns focus to the trigger');
});

test('F-038 B-L6: Tooltip keeps hover/focus, adds tap toggle with outside-tap + Escape dismissal, and describes the trigger by a unique id', () => {
  const t = readLib('Tooltip.svelte');
  assert.ok(t.includes('role="tooltip"') && t.includes('const uid = $props.id()') && t.includes('id={tooltipId}'));
  assert.ok(t.includes('onpointerenter') && t.includes('onpointerleave') && t.includes('onfocusin') && t.includes('onfocusout'), 'hover + focus kept');
  assert.ok(t.includes('onclick={handleClick}') && t.includes("lastPointerType === 'mouse'") && t.includes('pinned'), 'tap toggles a pinned state; mouse clicks do not pin');
  assert.ok(t.includes("document.addEventListener('pointerdown', onPointerdown)") && t.includes("document.removeEventListener('pointerdown', onPointerdown)"), 'outside tap dismisses, listener cleaned up');
  assert.ok(t.includes("e.key !== 'Escape'") && t.includes('e.preventDefault()'), 'Escape dismisses and is claimed');
  assert.ok(t.includes("setAttribute('aria-describedby'") && t.includes("removeAttribute('aria-describedby')"), 'trigger aria-describedby added while visible and removed after');
});

test('F-038 B-L6: ImagePreview and Image render classes owned by build.js (no scoped style), with labelled icon buttons and focus management', () => {
  const ip = readLib('ImagePreview.svelte');
  const im = readLib('Image.svelte');
  assert.ok(!ip.includes('<style>') && !im.includes('<style>'), 'scoped style blocks are gone');
  assert.ok(!/style="[^"]*(rgba?\(|#[0-9a-f]{3,8}|z-index|backdrop-filter)/i.test(ip), 'no colour/z-index/blur in inline styles');
  assert.ok(/import\s*\{[^}]*ZoomIn[^}]*ZoomOut[^}]*\}\s*from\s*'@joymify\/icons'/.test(ip) && ip.includes('Close') && ip.includes('RefreshCw'), 'toolbar icons come from @joymify/icons');
  for (const label of ['Zoom in', 'Zoom out', 'Rotate left', 'Rotate right', 'Close preview', 'Previous image', 'Next image']) {
    assert.ok(ip.includes(`aria-label="${label}"`), `${label} button is labelled`);
  }
  assert.ok(ip.includes('lockBodyScroll()') && ip.includes('trapFocus(ref)') && ip.includes('previouslyFocused.focus()'), 'scroll lock, focus trap and focus return');
  assert.ok(ip.includes('bind:this={ref}') && ip.includes('{...rest}'), 'ref + rest on the mask');
  for (const cls of ['joy-image-preview-mask', 'joy-image-preview-toolbar', 'joy-image-preview-btn', 'joy-image-preview-nav', 'joy-image-preview-stage', 'joy-image-preview-img']) assert.ok(ip.includes(cls), cls);
  for (const cls of ['joy-image-wrapper', 'joy-image__img', 'joy-image__overlay']) assert.ok(im.includes(cls), cls);
});

test('F-038 B-L6 fix round: Modal, Drawer and ImagePreview register on the dialog stack and act on keys only when topmost; Dropdown focus start is untracked', () => {
  for (const name of ['Modal', 'Drawer', 'ImagePreview']) {
    const s = readLib(`${name}.svelte`);
    assert.ok(/import \{[^}]*registerDialog[^}]*\} from '\.\/overlay-utils\.js'/.test(s), `${name} imports registerDialog`);
    assert.ok(s.includes('const handle = registerDialog()') && s.includes('handle.unregister()'), `${name} registers in the scroll-lock effect and unregisters in its cleanup`);
    assert.ok(s.includes('dialog?.isTopmost()') && /!e\.defaultPrevented|e\.defaultPrevented \|\|/.test(s), `${name} acts only when topmost and unclaimed`);
    assert.ok(s.includes('e.preventDefault()'), `${name} claims the key it handles`);
  }
  const d = readLib('Dropdown.svelte');
  assert.ok(d.includes('untrack(() => {') && d.includes("import { untrack, type Snippet } from 'svelte'"), 'items changing while open must not refocus');
  const u = fs.readFileSync(path.resolve('./src/lib/overlay-utils.ts'), 'utf8');
  assert.ok(u.includes('export function registerDialog()') && !/^(window|document)\b/m.test(u.slice(u.indexOf('const dialogStack'))), 'dialog stack is SSR-safe');
});

test('F-038 C-L6 fix: Popconfirm confirm button uses the styled joy-button--solid class (joy-button--primary has no CSS)', () => {
  const src = readLib('Popconfirm.svelte');
  const css = fs.readFileSync(path.resolve('../tokens/dist/theme.css'), 'utf8');
  assert.ok(!src.includes('joy-button--primary'));
  for (const cls of new Set(src.match(/joy-button--[a-z]+/g))) assert.ok(css.includes(`.${cls}`), `${cls} is styled in theme.css`);
  assert.ok(src.includes('joy-button joy-button--solid joy-button--sm'));
});

// ---- F-038 B-L7: MarkdownViewer, Splitter, Table, Timeline ----
test('F-038 B-L7: Table sortable headers are focusable, expose aria-sort and sort on Enter/Space; variant and ref/rest are wired', () => {
  const t = readLib('Table.svelte');
  assert.ok(!t.includes('<style>'), 'no scoped style block');
  assert.ok(t.includes("import { ariaSort, isSortActivationKey, nextSort } from './table-utils.js'"), 'shared sort helpers');
  assert.ok(t.includes('tabindex={col.sortable ? 0 : undefined}') && t.includes('aria-sort={col.sortable ? ariaSort(sortKey, sortDirection, String(col.key)) : undefined}'), 'sortable th: tabindex 0 + aria-sort, non-sortable th get neither');
  assert.ok(!t.includes('role="columnheader"'), 'th already is a columnheader; no redundant role');
  assert.ok(t.includes('onkeydown={(e) => handleHeaderKeydown(e, col)}') && t.includes('isSortActivationKey(e.key)') && t.includes('e.preventDefault()'), 'Enter/Space run the click handler, default prevented');
  assert.ok(t.includes('nextSort(sortKey, sortDirection, key)') && t.includes('onsort?.(key, nextDir)'), 'one sort path for click and keyboard');
  assert.ok(!t.includes('aria-label="Sort'), 'sort icons are decorative (aria-hidden), the state is on aria-sort');
  assert.ok((t.match(/aria-hidden="true"/g) || []).length === 3, 'three sort icons aria-hidden');
  assert.ok(t.includes("variant?: 'stack' | 'scroll'") && t.includes("let isScroll = $derived(variant === 'scroll')") && t.includes("variant ? variant === 'stack' : responsive === 'stack' || responsive === true"), 'variant prop; omitted variant keeps the responsive-driven default (stack)');
  assert.ok(t.includes('joy-table-container--scroll') && t.includes('joy-table--scroll'), 'scroll variant classes');
  assert.ok(t.includes('bind:this={ref}') && t.includes('{...rest}') && t.includes('ref = $bindable(null)'), 'ref + rest on the container');
  for (const cls of ['joy-table-th--sortable', 'joy-table-cell--flash-up', 'joy-table--responsive-stack']) assert.ok(t.includes(cls), cls);
});

test('F-038 B-L7: Splitter bar is a focusable, labelled separator driven by splitter-utils, with pointer events and a stacked mode', () => {
  const s = readLib('Splitter.svelte');
  assert.ok(!s.includes('<style>'), 'no scoped style block');
  assert.ok(s.includes("from './splitter-utils.js'") && s.includes('splitKeyNext(e.key, ratio, arrangement, min, max, e.shiftKey)') && s.includes('splitFromPointer('), 'arithmetic is in the shared helper');
  assert.ok(s.includes('role="separator"') && s.includes('tabindex="0"') && s.includes('aria-orientation={barOrientation(arrangement)}'), 'separator, focusable, orientation follows the arrangement');
  assert.ok(s.includes('aria-valuenow={Math.round(ratio)}') && s.includes('aria-valuemin={min}') && s.includes('aria-valuemax={max}'), 'value/min/max');
  assert.ok(s.includes('aria-label="Resize panes"'), 'bar is labelled');
  assert.ok(s.includes('onkeydown={handleKeydown}') && s.includes('if (next === null) return;\n\t\te.preventDefault();'), 'preventDefault only when the key is handled');
  assert.ok(s.includes('onpointerdown=') && s.includes('setPointerCapture') && !s.includes('mousedown') && !s.includes("window.addEventListener('mousemove'"), 'pointer events with capture (works for touch), no window listeners to leak');
  assert.ok(s.includes('window.matchMedia(SPLIT_STACK_QUERY)') && s.includes("query.removeEventListener('change', sync)") && s.includes("typeof window === 'undefined'"), 'SSR-safe matchMedia flag with cleanup');
  assert.ok(s.includes('style="--joy-splitter-size: {ratio};"') && s.includes('style="--joy-splitter-size: {100 - ratio};"'), 'pane size is the ratio custom property');
  assert.ok(s.includes('bind:this={ref}') && s.includes('{...rest}') && s.includes('ref = $bindable(null)'), 'ref + rest on the root (ref also used to measure)');
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(s), 'no colour literal');
});

test('F-038 B-L7: Timeline text colours and weights come from classes; MarkdownViewer copy button is labelled, iconised and status-announced', () => {
  const tl = readLib('Timeline.svelte');
  assert.ok(!/style="/.test(tl), 'no inline style (colour was #64748b fallback)');
  for (const cls of ['joy-timeline__title', 'joy-timeline__description', 'joy-timeline__time', 'joy-timeline__dot--{item.status']) assert.ok(tl.includes(cls), cls);
  assert.ok(tl.includes('bind:this={ref}') && tl.includes('{...rest}') && tl.includes('ref = $bindable(null)'), 'ref + rest on the list');

  const md = readLib('MarkdownViewer.svelte');
  assert.ok(!/style="/.test(md), 'no inline styles (hr had a #e2e8f0 fallback)');
  assert.ok(md.includes('<hr />'), 'hr is styled by .joy-markdown hr');
  assert.ok(md.includes('aria-label="Copy code to clipboard"') && md.includes('type="button"') && !md.includes('aria-label="Copy code snippet"'), 'copy button label and type');
  assert.ok(/import\s*\{\s*Check,\s*Copy\s*\}\s*from\s*'@joymify\/icons'/.test(md) && md.includes('<Check size="14" />') && md.includes('<Copy size="14" />') && !md.includes('<svg'), 'icons come from @joymify/icons');
  assert.ok(md.includes('class="joy-markdown__status" role="status"') && md.includes("'Copied to clipboard'"), 'copied state is announced');
  assert.ok(md.includes('await navigator.clipboard.writeText(text)') && md.includes('clearTimeout(resetTimer)'), 'copied is only claimed after a successful write; timer cleaned up');
  assert.ok(md.includes('bind:this={ref}') && md.includes('class="joy-markdown {className}"') && md.includes('{...rest}'), 'class + ref + rest on the root');
});

test('F-038 B-L7: Splitter, Table, Timeline and MarkdownViewer compile with svelte/compiler without warnings and server-render the documented contract', async () => {
  const { compile } = await import('svelte/compiler');
  for (const f of ['Table', 'Splitter', 'Timeline', 'MarkdownViewer']) {
    const out = compile(readLib(`${f}.svelte`), { filename: `${f}.svelte`, generate: 'server', runes: true });
    assert.deepStrictEqual(out.warnings.map((w) => w.code), [], `${f} compiles warning-free`);
    const client = compile(readLib(`${f}.svelte`), { filename: `${f}.svelte`, generate: 'client', runes: true });
    assert.deepStrictEqual(client.warnings.map((w) => w.code), [], `${f} (client) compiles warning-free`);
  }
});
