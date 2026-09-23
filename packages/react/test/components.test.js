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

/** Transpile a source file (.tsx/.ts) to CJS on the fly and load it. Relative ./X.js imports resolve to sibling .tsx/.ts; `@joymify/icons/react` resolves to the icons package source. */
const moduleCache = new Map();
function loadFile(file, cache = moduleCache) {
  if (cache.has(file)) return cache.get(file);
  const ts = requireFromHere('typescript');
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  const localRequire = (id) => {
    if (id === '@joymify/icons/react') return loadFile(fileURLToPath(new URL('../../icons/src/react.ts', import.meta.url)), cache);
    const m = id.match(/^\.\/([\w/-]+)\.js$/);
    if (!m) return requireFromHere(id);
    const base = path.join(path.dirname(file), m[1]);
    return loadFile(fs.existsSync(`${base}.tsx`) ? `${base}.tsx` : `${base}.ts`, cache);
  };
  new Function('require', 'module', 'exports', out)(localRequire, mod, mod.exports);
  cache.set(file, mod.exports);
  return mod.exports;
}

function loadComponent(name, cache = moduleCache) {
  return loadFile(fileURLToPath(new URL(`../src/${name}.tsx`, import.meta.url)), cache);
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

test('F-038 C-L2: metric twins render SVG trend icons + sr text, forward refs, and follow delta sign not tone', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const html = (el) => renderToStaticMarkup(el);
  const { MetricTile } = loadComponent('MetricTile');
  const { StatCard } = loadComponent('StatCard');
  const { Statistic } = loadComponent('Statistic');
  const { Flex } = loadComponent('Flex');
  const { Space } = loadComponent('Space');
  const { deltaDirection } = loadFile(fileURLToPath(new URL('../src/delta-utils.ts', import.meta.url)));

  for (const C of [MetricTile, StatCard, Statistic, Flex, Space]) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${C.displayName} must be a forwardRef component`);
  }

  // rest props + className land on the root
  assert.match(html(React.createElement(MetricTile, { title: 'T', value: 1, 'data-x': '1', className: 'z' })), /^<div class="joy-metric-tile joy-metric-tile--neutral z"[^>]*data-x="1"/);
  assert.match(html(React.createElement(StatCard, { label: 'L', value: '1', 'data-x': '1' })), /^<div class="joy-stat-card"[^>]*data-x="1"/);

  // MetricTile: SVG icon + sr text, no unicode triangles, change wrapped in a span
  const up = html(React.createElement(MetricTile, { title: 'T', value: 1, change: '+2%', trend: 'up' }));
  assert.ok(up.includes('<svg') && /<svg[^>]*aria-hidden="true"/.test(up) && up.includes('<span class="joy-metric-tile__sr">Increase: </span><span>+2%</span>'), up);
  const down = html(React.createElement(MetricTile, { title: 'T', value: 1, change: '-2%', trend: 'down' }));
  assert.ok(down.includes('Decrease: ') && down.includes('<svg'), down);
  const flatTile = html(React.createElement(MetricTile, { title: 'T', value: 1, change: '0%' }));
  assert.ok(!flatTile.includes('<svg') && !flatTile.includes('__sr') && flatTile.includes('<span>0%</span>'), flatTile);
  assert.ok(!/[▲▼]/.test(up + down));
  assert.ok(!html(React.createElement(MetricTile, { title: 'T', value: 1 })).includes('joy-metric-tile__change'));

  // StatCard: direction from sign, never tone; trend prop overrides; flat has no icon
  const neg = html(React.createElement(StatCard, { label: 'L', value: '1', delta: '-3%', deltaTone: 'positive' }));
  assert.ok(neg.includes('joy-stat-card__delta--positive') && neg.includes('Decrease: ') && !neg.includes('Increase'), neg);
  const pos = html(React.createElement(StatCard, { label: 'L', value: '1', delta: '+3%', deltaTone: 'critical' }));
  assert.ok(pos.includes('joy-stat-card__delta--critical') && pos.includes('Increase: ') && pos.includes('<svg'), pos);
  const bare = html(React.createElement(StatCard, { label: 'L', value: '1', delta: 'New', deltaTone: 'info' }));
  assert.ok(!bare.includes('<svg') && !bare.includes('joy-stat-card__sr') && bare.includes('<span>New</span>'), bare);
  const forced = html(React.createElement(StatCard, { label: 'L', value: '1', delta: 'New', trend: 'up' }));
  assert.ok(forced.includes('Increase: '), forced);
  const forcedFlat = html(React.createElement(StatCard, { label: 'L', value: '1', delta: '+3%', trend: 'flat' }));
  assert.ok(!forcedFlat.includes('<svg'), forcedFlat);
  assert.ok(!html(React.createElement(StatCard, { label: 'L', value: '1' })).includes('joy-stat-card__delta'));

  // deltaDirection contract (same file as Svelte)
  assert.strictEqual(deltaDirection('-1'), 'down');
  assert.strictEqual(deltaDirection('\u22121'), 'down');
  assert.strictEqual(deltaDirection(' +1'), 'up');
  assert.strictEqual(deltaDirection('1'), 'flat');
  assert.strictEqual(deltaDirection(undefined), 'flat');

  // Space mirrors the Svelte --joy-space-gap approach; Statistic keeps markup
  const space = html(React.createElement(Space, { size: 'large' }));
  assert.ok(space.includes('--joy-space-gap:24px;gap:var(--joy-space-gap)'), space);
  assert.ok(html(React.createElement(Statistic, { value: 3.14159, precision: 2, title: 'T' })).includes('joy-statistic__value">3.14<'));

  // source: no colour/size literals or inline design styles in the lane files
  for (const f of ['Flex', 'Space', 'MetricTile', 'StatCard', 'Statistic']) {
    const src = fs.readFileSync(fileURLToPath(new URL(`../src/${f}.tsx`, import.meta.url)), 'utf8');
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(src), `${f} has a colour literal`);
  }
});

test('F-038 C-L3: Alert/EmptyState/Result/Skeleton render the Svelte DOM contract, forward refs and spread rest', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const html = (el) => renderToStaticMarkup(el);
  const { Alert } = loadComponent('Alert');
  const { EmptyState } = loadComponent('EmptyState');
  const { Result } = loadComponent('Result');
  const { Skeleton } = loadComponent('Skeleton');
  const count = (s, sub) => s.split(sub).length - 1;

  // Alert: root, icon wrapper aria-hidden, body wrapper, no close by default
  const a = html(React.createElement(Alert, { title: 'T', description: 'D', 'data-testid': 'a', className: 'x' }, 'kid'));
  assert.ok(a.startsWith('<div class="joy-alert joy-alert--info x" role="alert"'), a);
  assert.ok(a.includes('data-testid="a"'), a);
  assert.ok(/<span class="joy-alert__icon" aria-hidden="true"><svg/.test(a), a);
  assert.ok(a.includes('<div class="joy-alert__body"><div class="joy-alert__title">T</div><div class="joy-alert__desc">D</div>kid</div>'), a);
  assert.ok(!a.includes('joy-alert__close') && !a.replace(/<svg.*?<\/svg>/g, '').includes('style='), a);
  // per-variant icons are distinct; info is the default icon
  const icon = (v) => html(React.createElement(Alert, { variant: v })).match(/joy-alert__icon" aria-hidden="true">(<svg.*?<\/svg>)/)[1];
  const icons = ['info', 'success', 'warning', 'danger'].map(icon);
  assert.strictEqual(new Set(icons).size, 4, 'four distinct variant icons');
  assert.strictEqual(html(React.createElement(Alert, {})).includes('joy-alert--info'), true);
  for (const v of ['success', 'warning', 'danger']) assert.ok(html(React.createElement(Alert, { variant: v })).includes(`joy-alert--${v}`));
  // closable: accessible close button, type=button, no emoji/entity glyphs
  const c = html(React.createElement(Alert, { closable: true }));
  assert.ok(/<button type="button" class="joy-alert__close" aria-label="Dismiss alert"><svg/.test(c), c);
  assert.ok(!/&times;|[\u2715\u00d7]/.test(c), c);
  // forwardRef + displayName + dismiss model documented in source
  for (const [C, n] of [[Alert, 'Alert'], [EmptyState, 'EmptyState'], [Skeleton, 'Skeleton'], [Result, 'Result']]) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${n} must be forwardRef`);
    assert.strictEqual(C.displayName, n);
  }
  // dismiss: the close button's real onClick fires onClose exactly once. Called inside the render
  // (hooks need a context), so the state update re-renders Probe hidden; only click on the first pass.
  let closed = 0;
  let clicked = false;
  html(React.createElement(function Probe() {
    const root = Alert.render({ closable: true, onClose: () => closed++ }, null);
    if (clicked) return root; // re-render after dismiss: alert is hidden
    clicked = true;
    React.Children.toArray(root.props.children).find((n) => n.props?.className === 'joy-alert__close').props.onClick();
    return null;
  }));
  assert.strictEqual(closed, 1, 'close button onClick calls onClose exactly once');
  const alertSrc = fs.readFileSync(fileURLToPath(new URL('../src/Alert.tsx', import.meta.url)), 'utf8');

  // EmptyState: markup matches Svelte, rest + className on root
  const e = html(React.createElement(EmptyState, { title: 'None', description: 'd', icon: 'i', action: 'go', id: 'e1', className: 'k' }));
  assert.ok(e.startsWith('<div class="joy-empty-state k" id="e1">'), e);
  assert.ok(e.includes('<div class="joy-empty-state__icon">i</div><h3 class="joy-empty-state__title">None</h3><p class="joy-empty-state__desc">d</p><div class="joy-empty-state__action">go</div>'), e);
  assert.strictEqual(html(React.createElement(EmptyState, { title: 'x' })), '<div class="joy-empty-state"><h3 class="joy-empty-state__title">x</h3></div>');

  // Result: verify-only (already forwardRef + rest + role=alert)
  const r = html(React.createElement(Result, { status: 'success', title: 'Ok', 'data-x': '1' }));
  assert.ok(r.startsWith('<div class="joy-result joy-result--success " role="alert"') && r.includes('data-x="1"') && r.includes('joy-result__title'), r);

  // Skeleton: single element merges consumer style (consumer wins per property), numeric => px
  const s = html(React.createElement(Skeleton, { variant: 'rect', width: 200, height: '2rem', style: { margin: '4px', height: '9px' }, id: 's' }));
  assert.ok(s.includes('class="joy-skeleton joy-skeleton--rect"'), s);
  assert.ok(s.includes('style="width:200px;height:9px;margin:4px"'), s);
  assert.ok(s.includes('role="progressbar"') && s.includes('aria-busy="true"') && s.includes('id="s"'), s);
  // lines > 1: exactly one wrapper/progressbar/rest; lines are plain, last is 70%
  const m = html(React.createElement(Skeleton, { lines: 3, width: '100px', height: 8, className: 'w', id: 'm', style: { margin: '2px' } }));
  assert.strictEqual(count(m, 'role="progressbar"'), 1, m);
  assert.strictEqual(count(m, 'id="m"'), 1, m);
  assert.ok(m.startsWith('<div class="w" style="margin:2px" role="progressbar" aria-busy="true" id="m">'), m);
  assert.strictEqual(count(m, 'joy-skeleton joy-skeleton--text'), 3, m);
  assert.ok(m.includes('style="width:70%;height:8px"') && count(m, 'width:100px;height:8px') === 2, m);

  // ref forwarding reaches the root element (invoked via the forwardRef render fn)
  for (const [C, props] of [[Alert, {}], [EmptyState, { title: 't' }], [Skeleton, {}], [Skeleton, { lines: 2 }]]) {
    let el;
    html(React.createElement(function Probe() { el = C.render(props, 'REFSENTINEL'); return null; })); // hooks need a render context
    assert.strictEqual(el.ref, 'REFSENTINEL', 'ref is attached to the root element');
  }

  // source: no colour literals / inline design styles in the lane files
  for (const f of ['Alert', 'EmptyState', 'Result', 'Skeleton']) {
    const src = fs.readFileSync(fileURLToPath(new URL(`../src/${f}.tsx`, import.meta.url)), 'utf8');
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(src), `${f} has a colour literal`);
  }
  assert.ok(!/style=\{\{[^}]*(color|background|border)/i.test(alertSrc), 'Alert carries no inline colour styles');
});

const readSrc = (rel) => fs.readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

test('F-038 C-L4: Message/Notification/Toast/Progress/Spin render the Svelte DOM contract, forward refs and spread rest', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const html = (el) => renderToStaticMarkup(el);
  const count = (s, sub) => s.split(sub).length - 1;
  const noSvg = (s) => s.replace(/<svg[\s\S]*?<\/svg>/g, ''); // icons package owns its own svg attrs
  const { Message } = loadComponent('Message');
  const { Notification } = loadComponent('Notification');
  const { Toast } = loadComponent('Toast');
  const { Progress } = loadComponent('Progress');
  const { Spin } = loadComponent('Spin');

  // Message: root + notice + tone-classed aria-hidden icon (no inline styles / hex), content, rest on root
  const m = html(React.createElement(Message, { content: 'Hi', type: 'error', className: 'x', 'data-testid': 'm' }));
  assert.ok(m.startsWith('<div class="joy-message x" role="alert" aria-live="polite" data-testid="m">'), m);
  assert.ok(m.includes('<div class="joy-message__notice"><span class="joy-message__icon joy-message__icon--error" aria-hidden="true"><svg'), m);
  assert.ok(m.includes('<span class="joy-message__content">Hi</span>'), m);
  assert.ok(!noSvg(m).includes('style=') && !/#[0-9a-fA-F]{3,8}\b/.test(m), m);
  assert.ok(html(React.createElement(Message, { content: 'i' })).includes('joy-message__icon--info'));

  // Notification: row/main/icon/close contract, new close label, no inline styles
  const n = html(React.createElement(Notification, { title: 'T', description: 'D', type: 'warning', 'data-testid': 'n' }));
  assert.ok(n.startsWith('<div class="joy-notification" role="alert" aria-live="polite" data-testid="n">'), n);
  for (const c of ['joy-notification__notice', 'joy-notification__row', 'joy-notification__main', 'joy-notification__icon joy-notification__icon--warning', 'joy-notification__title', 'joy-notification__desc']) {
    assert.ok(n.includes(`class="${c}"`), `${c} in ${n}`);
  }
  assert.ok(n.includes('<button type="button" class="joy-notification__close" aria-label="Dismiss notification">'), n);
  assert.ok(!noSvg(n).includes('style=') && !n.includes('Close notification'), n);
  const nBare = html(React.createElement(Notification, {}));
  assert.ok(!nBare.includes('__title') && !nBare.includes('__desc'), nBare);

  // Toast: body + Dismiss close button only with onClose; children win over message; no trailing class space
  const t = html(React.createElement(Toast, { variant: 'danger', message: 'msg', onClose: () => {}, id: 't' }));
  assert.ok(t.startsWith('<div class="joy-toast joy-toast--danger" role="status" aria-live="polite" id="t">'), t);
  assert.ok(t.includes('<div class="joy-toast__body">msg</div>'), t);
  assert.ok(t.includes('<button type="button" class="joy-toast__close" aria-label="Dismiss notification"><svg'), t);
  assert.ok(!noSvg(t).includes('style=') && !t.includes('&times;') && !t.includes('×'), t);
  const tKids = html(React.createElement(Toast, { message: 'msg' }, 'kid'));
  assert.ok(tKids.includes('<div class="joy-toast__body">kid</div>') && !tKids.includes('joy-toast__close'), tKids);
  assert.strictEqual(html(React.createElement(Toast, { open: false })), '');

  // Progress: role/aria on the ROOT (once), clamped valuenow, status class, aria-hidden status icons, rest spread
  const p = html(React.createElement(Progress, { percent: 40, 'aria-label': 'Upload', className: 'w' }));
  assert.ok(p.startsWith('<div class="joy-progress joy-progress--status-normal w" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" aria-label="Upload">'), p);
  assert.strictEqual(count(p, 'role="progressbar"'), 1, p);
  assert.ok(p.includes('<div class="joy-progress__inner"><div class="joy-progress__bg" style="width:40%;height:8px"></div>'), p);
  assert.ok(p.includes('<span class="joy-progress__text">40%</span>'), p);
  const pOver = html(React.createElement(Progress, { percent: 150 }));
  assert.ok(pOver.includes('aria-valuenow="100"') && pOver.includes('joy-progress--status-success') && pOver.includes('aria-hidden="true"'), pOver);
  assert.ok(html(React.createElement(Progress, { percent: -5 })).includes('aria-valuenow="0"'));
  const pEx = html(React.createElement(Progress, { percent: 20, status: 'exception', strokeColor: 'tomato' }));
  assert.ok(pEx.includes('joy-progress--status-exception') && pEx.includes('background-color:tomato') && pEx.includes('aria-hidden="true"'), pEx);
  assert.ok(!html(React.createElement(Progress, { showInfo: false })).includes('joy-progress__text'));

  // Spin: standalone => single .joy-spin root (ref/className/rest on it), no inline style, tip via class
  const s = html(React.createElement(Spin, { tip: 'Loading', className: 'c', id: 's' }));
  assert.ok(s.startsWith('<div class="joy-spin c" role="status" aria-busy="true" id="s"><svg class="joy-spin__indicator" width="24" height="24"'), s);
  assert.ok(s.includes('aria-hidden="true"') && s.includes('<span class="joy-spin__tip">Loading</span>'), s);
  assert.ok(!noSvg(s).includes('style=') && count(s, 'role="status"') === 1, s);
  assert.ok(html(React.createElement(Spin, { size: 'lg' })).includes('width="36"'));
  assert.strictEqual(html(React.createElement(Spin, { spinning: false })), '');
  // with children: container + mask(role=status) + inner .joy-spin WITHOUT role
  const sc = html(React.createElement(Spin, { className: 'k', 'data-x': '1' }, React.createElement('p', null, 'body')));
  assert.ok(sc.startsWith('<div class="joy-spin__container k" data-x="1"><p>body</p><div class="joy-spin__mask" role="status" aria-busy="true"><div class="joy-spin"><svg'), sc);
  assert.strictEqual(count(sc, 'role="status"'), 1, sc);
  assert.strictEqual(html(React.createElement(Spin, { spinning: false }, 'x')), '<div class="joy-spin__container">x</div>');

  // forwardRef objects; ref reaches the root element
  for (const [C, props] of [[Message, { content: 'a' }], [Notification, {}], [Toast, {}], [Progress, {}], [Spin, {}], [Spin, { children: 'k' }]]) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${C.displayName} must be forwardRef`);
    let el;
    html(React.createElement(function Probe() { el = C.render(props, 'REFSENTINEL'); return null; }));
    assert.strictEqual(el.ref, 'REFSENTINEL', `${C.displayName} ref is attached to the root element`);
  }

  // class strings/roles match the Svelte twins' markup (Svelte source is the contract)
  const svelte = (f) => readSrc(`../../svelte/src/lib/${f}.svelte`);
  const classSet = (src) => new Set(src.match(/joy-[a-z][\w-]*/g) || []); // static names + dynamic prefixes (e.g. joy-toast--)
  for (const f of ['Message', 'Notification', 'Toast', 'Progress', 'Spin']) {
    const tsx = readSrc(`../src/${f}.tsx`);
    const sv = svelte(f);
    assert.deepStrictEqual([...classSet(tsx)].sort(), [...classSet(sv)].sort(), `${f} class names match the Svelte twin`);
    assert.deepStrictEqual((tsx.match(/role="[a-z]+"/g) || []).sort(), (sv.match(/role="[a-z]+"/g) || []).sort(), `${f} roles match the Svelte twin`);
    assert.deepStrictEqual((tsx.match(/aria-label="[^"]+"/g) || []).sort(), (sv.match(/aria-label="[^"]+"/g) || []).sort(), `${f} aria-labels match the Svelte twin`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|var\(--joy-color-/.test(tsx), `${f} has a colour literal / foreign fallback`);
  }
  // no inline colour/size styles in the five files (Progress keeps its data-driven width/height/strokeColor)
  for (const f of ['Message', 'Notification', 'Toast', 'Spin']) {
    assert.ok(!/style=\{\{/.test(readSrc(`../src/${f}.tsx`)), `${f} has an inline style`);
  }
});

test('F-038 C-L4 fix: auto-dismiss fires onClose once, dismiss clears the timer, latest onClose wins, no re-arm on re-render', async (t) => {
  const { createAutoDismiss } = loadFile(fileURLToPath(new URL('../src/auto-dismiss.ts', import.meta.url)));
  t.mock.timers.enable({ apis: ['setTimeout'] });

  // countdown hides and notifies exactly once
  let hidden = 0; const calls = [];
  let onClose = () => calls.push('a');
  const d = createAutoDismiss(() => { hidden += 1; }, () => onClose);
  d.start(1000);
  t.mock.timers.tick(999);
  assert.deepStrictEqual([hidden, calls.length], [0, 0]);
  t.mock.timers.tick(1);
  assert.deepStrictEqual([hidden, calls], [1, ['a']]);
  t.mock.timers.tick(10000);
  assert.strictEqual(calls.length, 1, 'countdown never fires twice');

  // manual dismiss (close button) before the countdown: onClose once, timer cleared (RXD I-1)
  calls.length = 0;
  d.start(4500);
  t.mock.timers.tick(1000);
  d.dismiss();
  t.mock.timers.tick(10000);
  assert.deepStrictEqual(calls, ['a'], 'dismiss clears the pending timer so onClose is not called again');

  // the callback is read at fire time: a swapped (inline) onClose does not need a re-arm (RXD I-2)
  calls.length = 0;
  d.start(1000);
  t.mock.timers.tick(500);
  onClose = () => calls.push('b');
  t.mock.timers.tick(500);
  assert.deepStrictEqual(calls, ['b']);

  // cancel (unmount) and non-positive duration never fire
  calls.length = 0;
  d.start(1000); d.cancel(); t.mock.timers.tick(5000);
  d.start(0); t.mock.timers.tick(5000);
  d.start(-1); t.mock.timers.tick(5000);
  assert.strictEqual(calls.length, 0);
  // restart replaces the previous timer
  d.start(1000); t.mock.timers.tick(600); d.start(1000); t.mock.timers.tick(600);
  assert.strictEqual(calls.length, 0);
  t.mock.timers.tick(400);
  assert.strictEqual(calls.length, 1);

  // the two packages share one byte-identical helper
  assert.strictEqual(readSrc('../src/auto-dismiss.ts'), readSrc('../../svelte/src/lib/auto-dismiss.ts'));

  // React wiring: onClose lives in a ref and is NOT an effect dependency; Notification's button dismisses via the helper
  for (const f of ['Message', 'Notification']) {
    const src = readSrc(`../src/${f}.tsx`);
    assert.ok(src.includes('onCloseRef.current = onClose') && src.includes('[visible, duration, autoDismiss]') && !/\[[^\]]*\bonClose\b[^\]]*\]/.test(src), `${f}: onClose is not an effect dependency`);
    assert.ok(!/setTimeout/.test(src), `${f} has no raw timer left`);
  }
  assert.ok(readSrc('../src/Notification.tsx').includes('onClick={autoDismiss.dismiss}'));

  // Progress: non-finite percent never reaches aria-valuenow / width / text as NaN
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Progress } = loadComponent('Progress');
  for (const bad of [NaN, Infinity, -Infinity, undefined]) {
    const h = renderToStaticMarkup(React.createElement(Progress, { percent: bad }));
    assert.ok(h.includes('aria-valuenow="0"') && h.includes('width:0%') && !/NaN|Infinity/.test(h), h);
  }
  const over = renderToStaticMarkup(React.createElement(Progress, { percent: 250 }));
  assert.ok(over.includes('aria-valuenow="100"') && over.includes('width:100%'), over);
  assert.ok(renderToStaticMarkup(React.createElement(Progress, { percent: 40 })).includes('40%</span>'));
});
