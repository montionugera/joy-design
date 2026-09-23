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
  assert.ok(!checkbox.includes('role="checkbox"'), 'Checkbox must not duplicate native role=checkbox');
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
  assert.ok(tbl.includes('joy-table--responsive-stack'), 'Table must support responsive stack card mode for mobile');
  assert.ok(tbl.includes('data-label'), 'Table cells must provide data-label attributes for mobile card rendering');
  assert.ok(tbl.includes('<svg width="12" height="12"'), 'Table sort indicators must use vector SVG icons');

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
  assert.ok(hero.includes('joy-hero__secondary-cta'), 'HeroSection secondary action must use dedicated joy-hero__secondary-cta class');

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

  // Wave 10C Assertions (TreeSelect & Cascader Hierarchical Data Entry)
  const treeSelect = fs.readFileSync(path.resolve('./src/TreeSelect.tsx'), 'utf8');
  assert.ok(treeSelect.includes('joy-treeselect'), 'TreeSelect must render joy-treeselect class');
  assert.ok(treeSelect.includes('role="tree"'), 'TreeSelect must implement role=tree');
  assert.ok(treeSelect.includes('role="treeitem"'), 'TreeSelect must implement role=treeitem');
  assert.ok(treeSelect.includes('React.forwardRef'), 'TreeSelect must implement forwardRef');

  const cascader = fs.readFileSync(path.resolve('./src/Cascader.tsx'), 'utf8');
  assert.ok(cascader.includes('joy-cascader'), 'Cascader must render joy-cascader class');
  assert.ok(cascader.includes('role="listbox"'), 'Cascader must implement role=listbox');
  assert.ok(cascader.includes('React.forwardRef'), 'Cascader must implement forwardRef');

  // Wave 13B: Landing Page Component Suite
  const featureCard = fs.readFileSync(path.resolve('./src/FeatureCard.tsx'), 'utf8');
  assert.ok(featureCard.includes('joy-feature-card'), 'FeatureCard must render joy-feature-card class');
  assert.ok(featureCard.includes('React.forwardRef'), 'FeatureCard must implement forwardRef');

  const featureGrid = fs.readFileSync(path.resolve('./src/FeatureGrid.tsx'), 'utf8');
  assert.ok(featureGrid.includes('joy-feature-grid'), 'FeatureGrid must render joy-feature-grid class');

  const logoCloud = fs.readFileSync(path.resolve('./src/LogoCloud.tsx'), 'utf8');
  assert.ok(logoCloud.includes('joy-logo-cloud'), 'LogoCloud must render joy-logo-cloud class');

  const statsSection = fs.readFileSync(path.resolve('./src/StatsSection.tsx'), 'utf8');
  assert.ok(statsSection.includes('joy-stats-section'), 'StatsSection must render joy-stats-section class');
  assert.ok(statsSection.includes('joy-stat-item__value'), 'StatsSection must render metric values');

  const ctaSection = fs.readFileSync(path.resolve('./src/CTASection.tsx'), 'utf8');
  assert.ok(ctaSection.includes('joy-cta-section'), 'CTASection must render joy-cta-section class');
  assert.ok(ctaSection.includes('joy-button--glass'), 'CTASection must use glass button for contrast safety');

  const faqSection = fs.readFileSync(path.resolve('./src/FAQSection.tsx'), 'utf8');
  assert.ok(faqSection.includes('joy-faq-section'), 'FAQSection must render joy-faq-section class');
  assert.ok(faqSection.includes('aria-expanded'), 'FAQSection must implement accessible aria-expanded state');
  assert.ok(faqSection.includes('role="region"'), 'FAQSection must implement accessible role=region for panel');

  const siteFooter = fs.readFileSync(path.resolve('./src/SiteFooter.tsx'), 'utf8');
  assert.ok(siteFooter.includes('joy-site-footer'), 'SiteFooter must render joy-site-footer class');
  assert.ok(siteFooter.includes('role="contentinfo"'), 'SiteFooter must implement accessible role=contentinfo');

  // Wave 13C: Full Page Combine Component & Theme Palettes
  const landingPage = fs.readFileSync(path.resolve('./src/LandingPage.tsx'), 'utf8');
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


test('Wave 2 C-L1: Button, Input, InputNumber, Select, DatePicker, DateRangePicker match contract', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/${n}.tsx`), 'utf8');
  const assertWave2 = (name) => {
    const src = read(name);
    assert.ok(src.includes('React.forwardRef') && src.includes('...rest'), `${name} must forwardRef and spread rest`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
    assert.ok(!new RegExp('[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u2605\\u2606\\u2192]', 'u').test(src), `${name} must not contain emoji or arrow glyphs`);
    assert.ok(!/--\$\{[^}]*\}\s*[`"']/.test(src) || src.includes('cx('), `${name} must not emit empty modifiers`);
  };

  const files = ['Button', 'Input', 'InputNumber', 'Select', 'DatePicker', 'DateRangePicker'];
  for (const f of files) {
    assertWave2(f);
  }

  const btn = read('Button');
  assert.ok(btn.includes("'link'"), "Button must include 'link' variant");
  assert.ok(btn.includes('joy-button__label'), 'Button must include joy-button__label');
  assert.ok(btn.includes('aria-busy'), 'Button must include aria-busy');
  assert.ok(btn.includes('iconStart'), 'Button must include iconStart');
  assert.ok(btn.includes('iconEnd'), 'Button must include iconEnd');
  assert.ok(btn.includes('cx('), 'Button must use cx(');

  const select = read('Select');
  assert.ok(select.includes('role="combobox"'), 'Select must include role="combobox"');
  assert.ok(select.includes('useOverlay('), 'Select must include useOverlay(');
  assert.ok(select.includes('type="hidden"'), 'Select must include type="hidden"');

  const inputNumber = read('InputNumber');
  assert.ok(inputNumber.includes('inputMode="decimal"'), 'InputNumber must include inputMode="decimal"');

  const datePicker = read('DatePicker');
  assert.ok(datePicker.includes('@joymify/icons/react'), 'DatePicker must import from @joymify/icons/react');

  const dateRangePicker = read('DateRangePicker');
  assert.ok(!dateRangePicker.includes('\u2192'), 'DateRangePicker must not include \u2192');
});


test('Wave 2 C-L2: TimePicker, Mentions, MarkdownEditor', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/${n}.tsx`), 'utf8');
  const assertWave2 = (name) => {
    const src = read(name);
    assert.ok(src.includes('React.forwardRef') && src.includes('...rest'), `${name} must forwardRef and spread rest`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2605\u2606\u2192]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
    assert.ok(!/--\$\{[^}]*\}\s*[`"']/.test(src) || src.includes('cx('), `${name} must not emit empty modifiers`);
  };

  assertWave2('TimePicker');
  assertWave2('Mentions');
  assertWave2('MarkdownEditor');

  const timePicker = read('TimePicker');
  assert.ok(timePicker.includes('useOverlay('), 'TimePicker must include useOverlay(');

  const mentions = read('Mentions');
  assert.ok(mentions.includes('useOverlay('), 'Mentions must include useOverlay(');

  const mdEditor = read('MarkdownEditor');
  assert.ok(mdEditor.includes('@joymify/icons/react'), 'MarkdownEditor must import @joymify/icons/react');
  assert.ok(mdEditor.includes('joy-markdown-editor__tool'), 'MarkdownEditor must include joy-markdown-editor__tool');
});


const read = (n) => fs.readFileSync(path.resolve(`./src/${n}.tsx`), 'utf8');
const assertWave2 = (name) => {
  const src = read(name);
  assert.ok(src.includes('React.forwardRef') && src.includes('...rest'), `${name} must forwardRef and spread rest`);
  assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2605}\u{2606}→]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
  assert.ok(!/--\$\{[^}]*\}\s*[`"']/.test(src) || src.includes('cx('), `${name} must not emit empty modifiers`);
};

test('Wave 2 C-L3: Checkbox, Switch, RadioGroup, Slider, Rate, Segmented, Form, FormItem', () => {
  const c3Files = ['Checkbox', 'Switch', 'RadioGroup', 'Slider', 'Rate', 'Segmented', 'Form', 'FormItem'];
  c3Files.forEach(assertWave2);

  const checkbox = read('Checkbox');
  assert.ok(checkbox.includes('indeterminate'), 'Checkbox must support indeterminate state');

  const rate = read('Rate');
  assert.ok(!rate.includes('\u{2605}'), 'Rate must not include \u{2605} glyph');

  const radio = read('RadioGroup');
  assert.ok(radio.includes('ArrowRight'), 'RadioGroup must support ArrowRight');

  const segmented = read('Segmented');
  assert.ok(segmented.includes('ArrowRight'), 'Segmented must support ArrowRight');

  assert.ok(rate.includes('ArrowRight'), 'Rate must support ArrowRight');

  const form = read('Form');
  assert.ok(form.includes('createContext'), 'Form must export createContext FormContext');
  assert.ok(form.includes('cx('), 'Form must use cx helper');
});


test('Wave 2 C-L4: TreeSelect, Cascader, Transfer, Upload match contract', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/${n}.tsx`), 'utf8');
  const assertWave2 = (name) => {
    const src = read(name);
    assert.ok(src.includes('React.forwardRef') && src.includes('...rest'), `${name} must forwardRef and spread rest`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2605\u2606\u2192]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
    assert.ok(!/--\$\{[^}]*\}\s*[`"']/.test(src) || src.includes('cx('), `${name} must not emit empty modifiers`);
  };

  for (const comp of ['TreeSelect', 'Cascader', 'Transfer', 'Upload']) {
    assertWave2(comp);
  }

  const treeSelect = read('TreeSelect');
  const cascader = read('Cascader');
  const transfer = read('Transfer');
  const upload = read('Upload');

  assert.ok(treeSelect.includes('useOverlay('), 'TreeSelect must include useOverlay(');
  assert.ok(cascader.includes('useOverlay('), 'Cascader must include useOverlay(');
  assert.ok(transfer.includes('joy-button--icon-only'), 'Transfer must include joy-button--icon-only');
  assert.ok(!transfer.includes('joy-button--primary'), 'Transfer must not include joy-button--primary');
  assert.ok(upload.includes('@joymify/icons/react'), 'Upload must import @joymify/icons/react');
  assert.ok(!upload.includes('\u{1F4C1}'), 'Upload must not include emoji');
});

test('F-037 lane review: Mentions/Rate/Select twin parity, Input type, Segmented uncontrolled default', () => {
  const read = (n) => fs.readFileSync(path.resolve(`./src/${n}.tsx`), 'utf8');

  const mentions = read('Mentions');
  assert.ok(mentions.includes('React.useId()'), 'Mentions must derive a per-instance id via React.useId()');
  assert.ok(
    mentions.includes("className=\"joy-textarea joy-mentions__textarea\""),
    'Mentions textarea must carry both joy-textarea and joy-mentions__textarea classes'
  );

  const rate = read('Rate');
  assert.ok(
    !rate.includes('tabIndex={!isInteractive ? -1'),
    'Rate readonly must not remove stars from the tab order'
  );
  assert.ok(rate.includes('tabIndex={disabled ? -1'), 'Rate tab order must depend only on real disabled');
  assert.ok(rate.includes('disabled={disabled}'), 'Rate stars disabled must reflect only real disabled');
  assert.ok(
    rate.includes('aria-readonly={isReadOnly ? true : undefined}'),
    'Rate radiogroup must expose aria-readonly when readonly'
  );

  const select = read('Select');
  assert.ok(
    select.includes('aria-activedescendant={activeDescendantId}'),
    'Select combobox must wire aria-activedescendant to the active option'
  );
  assert.ok(
    select.includes('id={`${listboxId}-opt-${i}`}'),
    'Select options must expose stable ids derived from the listbox id'
  );

  const input = read('Input');
  assert.ok(!input.includes('type?: string'), 'Input must not widen type to string');
  assert.ok(!input.includes('type: string'), 'Input must not widen type to string');

  const segmented = read('Segmented');
  assert.ok(
    !segmented.includes("normalizedOptions[0]?.value ?? ''"),
    'Segmented must not auto-select the first option when uncontrolled'
  );
  assert.ok(
    segmented.includes('React.useState<string | undefined>(defaultValue)'),
    'Segmented uncontrolled state must start from defaultValue only'
  );
});

// F-038 Wave 3 lane C-L1: Avatar, AvatarGroup, Badge, Tag, Divider (rendered behavior, not just source strings)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const requireFromHere = createRequire(import.meta.url);

/** Transpile a component .tsx to CJS on the fly and load it (relative ./X.js imports resolve to sibling .tsx). */
function loadComponent(name, cache = new Map()) {
  if (cache.has(name)) return cache.get(name);
  const ts = requireFromHere('typescript');
  const file = fileURLToPath(new URL(`../src/${name}.tsx`, import.meta.url));
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  const localRequire = (id) => {
    const m = id.match(/^\.\/(\w+)\.js$/);
    return m ? loadComponent(m[1], cache) : requireFromHere(id);
  };
  new Function('require', 'module', 'exports', out)(localRequire, mod, mod.exports);
  cache.set(name, mod.exports);
  return mod.exports;
}

test('F-038 C-L1: display twins forward refs, spread rest props, and match Svelte markup', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const html = (el) => renderToStaticMarkup(el);
  const { Avatar } = loadComponent('Avatar');
  const { AvatarGroup } = loadComponent('AvatarGroup');
  const { Badge } = loadComponent('Badge');
  const { Tag } = loadComponent('Tag');
  const { Divider } = loadComponent('Divider');

  // forwardRef objects for every lane component
  for (const C of [Avatar, AvatarGroup, Badge, Tag, Divider]) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${C.displayName} must be a forwardRef component`);
  }

  // rest props land on the root element
  assert.match(html(React.createElement(Badge, { 'data-x': '1', id: 'b' }, 'n')), /^<span [^>]*data-x="1"/);
  assert.match(html(React.createElement(AvatarGroup, { 'data-x': '1' })), /^<div [^>]*data-x="1"/);

  // Badge variant/size/dot classes
  const badge = html(React.createElement(Badge, { variant: 'brand', size: 'sm', dot: true }, 'New'));
  assert.ok(badge.includes('class="joy-badge joy-badge--brand joy-badge--sm"'), badge);
  assert.ok(badge.includes('joy-badge__dot'), badge);

  // Avatar: no inline style unless color is provided; no trailing class whitespace
  const plain = html(React.createElement(Avatar, { name: 'Ada Lovelace' }));
  assert.ok(!plain.includes('style='), plain);
  assert.ok(plain.includes('class="joy-avatar joy-avatar--circle joy-avatar--md"'), plain);
  assert.ok(html(React.createElement(Avatar, { name: 'A', color: 'tomato' })).includes('background-color:tomato'));

  // Divider: vertical exposes aria-orientation (RXD-101); horizontal does not
  assert.ok(html(React.createElement(Divider, { type: 'vertical' })).includes('aria-orientation="vertical"'));
  assert.ok(!html(React.createElement(Divider, {})).includes('aria-orientation'));

  // Tag: close button carries no inline style (44px hit area lives in theme.css)
  const tag = html(React.createElement(Tag, { closable: true }, 'x'));
  assert.ok(tag.includes('joy-tag__close') && !/joy-tag__close[^>]*style=/.test(tag), tag);
});

test('F-038 C-L1: AvatarGroup max collapses items and children into one +N overflow avatar (RXD-102)', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Avatar } = loadComponent('Avatar');
  const { AvatarGroup } = loadComponent('AvatarGroup');
  const count = (h, needle) => h.split(needle).length - 1;
  const items = [{ name: 'A B' }, { name: 'C D', size: 'lg' }, { name: 'E F' }, { name: 'G H' }, { name: 'I J' }];

  // items: first `max` avatars + overflow (size follows items[0], default md)
  const byItems = renderToStaticMarkup(React.createElement(AvatarGroup, { items, max: 2 }));
  assert.strictEqual(count(byItems, 'joy-avatar__fallback'), 2, byItems);
  assert.ok(
    byItems.includes(
      '<div class="joy-avatar joy-avatar--circle joy-avatar--md joy-avatar-group__overflow" role="img" aria-label="3 more">+3</div>'
    ),
    byItems
  );

  // children: same truncation, overflow size follows first child's size
  const kids = items.map((it, i) => React.createElement(Avatar, { key: i, name: it.name, size: 'sm' }));
  const byChildren = renderToStaticMarkup(React.createElement(AvatarGroup, { max: 3 }, ...kids));
  assert.strictEqual(count(byChildren, 'joy-avatar__fallback'), 3, byChildren);
  assert.ok(byChildren.includes('joy-avatar--sm joy-avatar-group__overflow'), byChildren);
  assert.ok(byChildren.includes('aria-label="2 more">+2<'), byChildren);

  // no overflow when max is undefined or >= length; max 0 hides all and reports the total; fractional floors
  assert.ok(!renderToStaticMarkup(React.createElement(AvatarGroup, { items })).includes('overflow'));
  assert.ok(!renderToStaticMarkup(React.createElement(AvatarGroup, { items, max: 5 })).includes('overflow'));
  const zero = renderToStaticMarkup(React.createElement(AvatarGroup, { items, max: 0 }));
  assert.ok(zero.includes('+5') && !zero.includes('joy-avatar__fallback'), zero);
  assert.strictEqual(count(renderToStaticMarkup(React.createElement(AvatarGroup, { items, max: 2.9 })), 'joy-avatar__fallback'), 2);
});
