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
  assert.ok(popconfirm.includes('role="alertdialog"'), 'Popconfirm must implement role=alertdialog');
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
  // Scroll lock + focus trap live in the shared useDialog hook (asserted on dialog-hooks.ts below).
  assert.ok(imagePreview.includes('useDialog('), 'ImagePreview must run the shared dialog lifecycle (lockBodyScroll + trapFocus)');

  const dialogHooks = fs.readFileSync(path.resolve('./src/dialog-hooks.ts'), 'utf8');
  assert.ok(dialogHooks.includes('lockBodyScroll()') && dialogHooks.includes('trapFocus('), 'useDialog must invoke lockBodyScroll and trapFocus');

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
  assert.ok(!ctaSection.includes('joy-button--glass') && ctaSection.includes('variant="outline"'), 'CTASection must not use the removed glass button; its secondary action is the outline variant');

  const faqSection = fs.readFileSync(path.resolve('./src/FAQSection.tsx'), 'utf8');
  assert.ok(faqSection.includes('joy-faq-section'), 'FAQSection must render joy-faq-section class');
  assert.ok(faqSection.includes('aria-expanded'), 'FAQSection must implement accessible aria-expanded state');
  assert.ok(faqSection.includes('role="region"'), 'FAQSection must implement accessible role=region for panel');

  const siteFooter = fs.readFileSync(path.resolve('./src/SiteFooter.tsx'), 'utf8');
  assert.ok(siteFooter.includes('joy-site-footer'), 'SiteFooter must render joy-site-footer class');
  assert.ok(/<footer\b/.test(siteFooter) && !siteFooter.includes('role="contentinfo"'), 'SiteFooter is a native <footer> (implicit contentinfo); the explicit role was redundant, see landing-footer.test.js');

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
import { fileURLToPath } from 'node:url';
import { loadFile, loadComponent, requireFromHere } from './helpers/load-tsx.js';

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

// F-038 Wave 3 lane C-L5: Anchor, Breadcrumb, Menu, Pagination, Steps, Tabs (DOM identical to the Svelte twins)
test('F-038 C-L5: roving-utils and pagination-utils are byte-identical to the Svelte copies (a missing copy fails)', () => {
  for (const f of ['roving-utils.ts', 'pagination-utils.ts']) {
    const react = fileURLToPath(new URL(`../src/${f}`, import.meta.url));
    const svelte = fileURLToPath(new URL(`../../svelte/src/lib/${f}`, import.meta.url));
    assert.ok(fs.existsSync(react), `${f} must exist in the React package`);
    assert.strictEqual(fs.readFileSync(react, 'utf8'), fs.readFileSync(svelte, 'utf8'), `${f} matches the Svelte copy`);
  }
});

test('F-038 C-L5: navigation twins forward refs, spread rest props, merge className and match the Svelte class/aria contract', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const html = (el) => renderToStaticMarkup(el);
  const norm = (s) => s.replace(/\s+/g, ' ');
  const { Anchor } = loadComponent('Anchor');
  const { Breadcrumb } = loadComponent('Breadcrumb');
  const { Menu } = loadComponent('Menu');
  const { Pagination } = loadComponent('Pagination');
  const { Steps } = loadComponent('Steps');
  const { Tabs } = loadComponent('Tabs');

  const fixtures = {
    Anchor: [Anchor, { items: [{ key: 'a', href: '#a', title: 'A' }], activeKey: 'a' }, 'nav'],
    Breadcrumb: [Breadcrumb, { items: [{ label: 'Home', href: '/' }, { label: 'Now' }] }, 'nav'],
    Menu: [Menu, { items: [{ key: 'a', label: 'A' }] }, 'ul'],
    Pagination: [Pagination, { total: 30 }, 'nav'],
    Steps: [Steps, { items: [{ title: 'One' }] }, 'div'],
    Tabs: [Tabs, { items: [{ key: 'a', label: 'A', content: 'x' }] }, 'div'],
  };
  for (const [name, [C, props, tag]] of Object.entries(fixtures)) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${name} must be a forwardRef component`);
    assert.match(html(React.createElement(C, { ...props, 'data-k': '1', className: 'extra' })), new RegExp(`^<${tag} [^>]*data-k="1"`), `${name} spreads rest onto the root`);
    assert.match(html(React.createElement(C, { ...props, className: 'extra' })), /class="[^"]*\bextra\b/, `${name} merges className`);
    assert.ok(!/class="[^"]* "/.test(html(React.createElement(C, props))), `${name} has no trailing space in class`);
    const src = fs.readFileSync(fileURLToPath(new URL(`../src/${name}.tsx`, import.meta.url)), 'utf8');
    assert.ok(!/style=\{\{[^}]*(#|rgb|hsl|color|background)/i.test(src) && !/&[lr]arr;/.test(src) && !/#[0-9a-f]{3,8}\b/i.test(src), `${name}: no inline colours, entities or hex`);
  }

  // Anchor: aria-current="location" on the active link only
  const anchor = norm(html(React.createElement(Anchor, { items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }], activeKey: 'b' })));
  assert.ok(anchor.includes('<nav class="joy-anchor" role="navigation" aria-label="Anchor Navigation"'), anchor);
  assert.ok(anchor.includes('<div class="joy-anchor__ink"></div>'), anchor);
  assert.ok(anchor.includes('<a href="#b" class="joy-anchor__link joy-anchor__link--active" aria-current="location">B</a>'), anchor);
  assert.ok(anchor.includes('<a href="#a" class="joy-anchor__link">A</a>'), anchor);

  // Breadcrumb: nav aria-label, aria-current="page" on the last crumb only, separator hidden
  const crumb = norm(html(React.createElement(Breadcrumb, { items: [{ label: 'Home', href: '/' }, { label: 'Docs', href: '/d' }, { label: 'Now', href: '/n' }] })));
  assert.ok(crumb.startsWith('<nav class="joy-breadcrumb" aria-label="Breadcrumb"><ol>'), crumb);
  assert.strictEqual((crumb.match(/aria-current="page"/g) || []).length, 1);
  assert.ok(crumb.includes('<span class="joy-breadcrumb__current" aria-current="page">Now</span>'), crumb);
  assert.ok(crumb.includes('<a class="joy-breadcrumb__link" href="/">Home</a><span class="joy-breadcrumb__sep" aria-hidden="true">/</span>'), crumb);

  // Steps: aria-current="step" follows index === current, not status === 'process'
  const steps = html(React.createElement(Steps, { current: 1, items: [{ title: 'a' }, { title: 'b', status: 'error' }, { title: 'c', status: 'process' }] }));
  assert.ok(steps.startsWith('<div class="joy-steps joy-steps--horizontal" role="navigation" aria-label="Steps progress"'), steps);
  assert.strictEqual((steps.match(/aria-current="step"/g) || []).length, 1);
  assert.match(steps, /joy-steps__item--error"[^>]*aria-current="step"/, 'the current index is marked even with an explicit error status');
  assert.doesNotMatch(steps, /joy-steps__item--process"[^>]*aria-current/, 'an explicit process status elsewhere is not marked');
  assert.match(steps, /joy-steps__item--finish" role="button" tabindex="0"/);
  assert.match(steps, /<svg aria-hidden="true"/);
});

test('F-038 C-L5: Tabs is a WAI-ARIA tablist with useId ids, roving tabindex and a labelled panel', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Tabs } = loadComponent('Tabs');
  const items = [{ key: 'a', label: 'A', content: 'panel-a' }, { key: 'b', label: 'B', content: 'panel-b' }, { key: 'c', label: 'C', content: 'panel-c' }];
  const h = renderToStaticMarkup(React.createElement(Tabs, { items, activeKey: 'b' }));
  const uid = h.match(/id="([^"]+)-tab-0"/)[1];
  assert.ok(uid.length > 0);
  assert.ok(h.includes('<div class="joy-tabs" role="tablist" aria-orientation="horizontal">'), h);
  assert.ok(h.includes(`<button type="button" role="tab" id="${uid}-tab-1" aria-selected="true" aria-controls="${uid}-panel" tabindex="0" class="joy-tab-btn joy-tab-btn--active">B</button>`), h);
  assert.ok(h.includes(`id="${uid}-tab-0" aria-selected="false" tabindex="-1" class="joy-tab-btn"`), h);
  assert.strictEqual((h.match(/tabindex="0"/g) || []).length, 1, 'exactly one tab in the tab order');
  assert.strictEqual((h.match(/aria-controls=/g) || []).length, 1, 'aria-controls only on the active tab');
  assert.ok(h.includes(`<div class="joy-tab-content" role="tabpanel" id="${uid}-panel" aria-labelledby="${uid}-tab-1">panel-b</div>`), h);
  // an unknown activeKey leaves no aria-labelledby and no panel content, and the first tab stays reachable
  const none = renderToStaticMarkup(React.createElement(Tabs, { items, activeKey: 'zzz' }));
  assert.ok(!none.includes('aria-labelledby') && !none.includes('panel-'), none);
  assert.ok(none.includes('tabindex="0"'), 'a tab is still tabbable when nothing is selected');
});

// Run a component's render function outside React with hook shims so its handlers can be exercised without a DOM.
function renderWithHooks(name, props, { state = [] } = {}) {
  const React = requireFromHere('react');
  const saved = { useState: React.useState, useId: React.useId, useEffect: React.useEffect };
  const setters = [];
  let i = 0;
  React.useState = (init) => { const idx = i++; const v = idx in state ? state[idx] : init; const set = (nv) => setters.push([idx, nv]); return [v, set]; };
  React.useId = () => 'uid';
  React.useEffect = () => {};
  try {
    const C = loadComponent(name, new Map())[name];
    return { tree: C.render(props, null), setters };
  } finally {
    Object.assign(React, saved);
  }
}
const walk = (node, fn) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  if (node.props) { fn(node); walk(node.props.children, fn); }
};
const findAll = (tree, pred) => { const out = []; walk(tree, (n) => pred(n) && out.push(n)); return out; };
const keyEvent = (key, siblings, index) => {
  const calls = { prevented: 0, focused: [] };
  const els = siblings.map((_, j) => ({ focus: () => calls.focused.push(j) }));
  return { calls, e: { key, preventDefault: () => calls.prevented++, currentTarget: { parentElement: { querySelectorAll: () => els } } } };
};

test('F-038 C-L5: Tabs keyboard - arrows/Home/End select then focus the target tab (wrapping), other keys are ignored', () => {
  const items = [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }, { key: 'c', label: 'C' }];
  const changed = [];
  const { tree, setters } = renderWithHooks('Tabs', { items, activeKey: 'a', onChange: (k) => changed.push(k) });
  const tabs = findAll(tree, (n) => n.props.role === 'tab');
  assert.strictEqual(tabs.length, 3);
  const press = (idx, key) => { const { e, calls } = keyEvent(key, tabs, idx); tabs[idx].props.onKeyDown(e); return calls; };
  let c = press(0, 'ArrowRight');
  assert.deepStrictEqual([c.prevented, c.focused, changed.at(-1)], [1, [1], 'b']);
  c = press(0, 'ArrowLeft');
  assert.deepStrictEqual([c.prevented, c.focused, changed.at(-1)], [1, [2], 'c'], 'ArrowLeft wraps to the last tab');
  c = press(1, 'End');
  assert.deepStrictEqual([c.focused, changed.at(-1)], [[2], 'c']);
  c = press(2, 'Home');
  assert.deepStrictEqual([c.focused, changed.at(-1)], [[0], 'a']);
  const before = changed.length;
  c = press(0, 'ArrowDown');
  c = press(0, 'a');
  assert.deepStrictEqual([c.prevented, c.focused, changed.length], [0, [], before], 'non-navigation keys are not handled');
  assert.ok(setters.some(([, v]) => v === 'b'), 'uncontrolled state follows the selection');
});

test('F-038 C-L5: Menu keyboard - roving tabindex, arrows move focus only, disabled items skipped, Enter/Space select', () => {
  const items = [{ key: 'a', label: 'A', disabled: true }, { key: 'b', label: 'B' }, { key: 'c', label: 'C' }, { key: 'd', label: 'D', disabled: true }];
  const selected = [];
  const build = (mode, extra = {}) => renderWithHooks('Menu', { items, mode, selectedKey: 'c', onSelect: (k) => selected.push(k), ...extra }, extra.state ? { state: extra.state } : {});
  const lis = (tree) => findAll(tree, (n) => n.props.role === 'menuitem');

  // selected item is the single tabbable one; nothing focused yet
  let { tree } = build('vertical');
  assert.deepStrictEqual(lis(tree).map((n) => n.props.tabIndex), [-1, -1, 0, -1]);
  assert.deepStrictEqual(lis(tree).map((n) => n.props['aria-current']), [undefined, undefined, 'page', undefined]);
  assert.strictEqual(tree.props.role, 'menu');
  assert.strictEqual(tree.props['aria-orientation'], 'vertical');

  // focus moves the tab stop (focusIndex state slot 0)
  ({ tree } = build('vertical', { state: [1] }));
  assert.deepStrictEqual(lis(tree).map((n) => n.props.tabIndex), [-1, 0, -1, -1]);

  // vertical: Up/Down only, focus only (no select), disabled skipped and wrapping
  const items2 = lis(tree);
  const press = (li, idx, key) => { const { e, calls } = keyEvent(key, items2, idx); li.props.onKeyDown(e); return calls; };
  let c = press(items2[1], 1, 'ArrowDown');
  assert.deepStrictEqual([c.prevented, c.focused, selected.length], [1, [2], 0]);
  c = press(items2[2], 2, 'ArrowDown');
  assert.deepStrictEqual(c.focused, [1], 'wraps past the disabled last item');
  c = press(items2[1], 1, 'ArrowRight');
  assert.deepStrictEqual([c.prevented, c.focused], [0, []], 'Left/Right ignored when vertical');

  // horizontal: Left/Right also move
  const h = build('horizontal').tree;
  assert.strictEqual(h.props['aria-orientation'], 'horizontal');
  const hi = lis(h);
  c = (() => { const { e, calls } = keyEvent('ArrowRight', hi, 1); hi[1].props.onKeyDown(e); return calls; })();
  assert.deepStrictEqual(c.focused, [2]);

  // Enter/Space select (not disabled), disabled ignored, click likewise
  const enter = keyEvent('Enter', hi, 1); hi[1].props.onKeyDown(enter.e);
  const space = keyEvent(' ', hi, 2); hi[2].props.onKeyDown(space.e);
  const dis = keyEvent('Enter', hi, 0); hi[0].props.onKeyDown(dis.e);
  hi[0].props.onClick();
  hi[3].props.onClick();
  hi[1].props.onClick();
  assert.deepStrictEqual(selected, ['b', 'c', 'b']);
});

test('F-038 C-L5: Pagination windows large totals, clamps stale current, uses chevron icons and the Svelte labels', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Pagination } = loadComponent('Pagination');
  const page = (props) => renderToStaticMarkup(React.createElement(Pagination, props));
  const labels = (h) => [...h.matchAll(/aria-label="(Page \d+)"/g)].map((m) => m[1]);

  const big = page({ current: 50, total: 1000, pageSize: 10 });
  assert.deepStrictEqual(labels(big), ['Page 1', 'Page 49', 'Page 50', 'Page 51', 'Page 100']);
  assert.strictEqual((big.match(/joy-pagination__ellipsis" aria-hidden="true">…</g) || []).length, 2);
  assert.ok(big.startsWith('<nav class="joy-pagination" role="navigation" aria-label="Pagination">'), big);
  assert.ok(big.includes('aria-label="Previous page"') && big.includes('aria-label="Next page"'), big);
  assert.ok(big.includes('<button type="button" class="joy-pagination__btn joy-pagination__btn--active" aria-label="Page 50" aria-current="page">50</button>'), big);
  assert.strictEqual((big.match(/aria-current="page"/g) || []).length, 1);
  assert.ok(!/&[lr]arr;|←|→/.test(big) && (big.match(/<svg/g) || []).length === 2 && big.includes('aria-hidden="true"'), 'chevron icons, not arrows');
  assert.ok(big.includes('<span class="joy-pagination__info">Total: 1000 items</span>'));
  assert.strictEqual((big.match(/joy-pagination__btn/g) || []).length, 5 + 2 + 1, 'never one button per page');

  // small totals render in full without ellipsis
  assert.deepStrictEqual(labels(page({ current: 2, total: 50, pageSize: 10 })), ['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5']);
  // stale/out-of-range current is clamped: last page active, Next disabled
  const stale = page({ current: 50, total: 30, pageSize: 10 });
  assert.ok(stale.includes('joy-pagination__btn--active" aria-label="Page 3" aria-current="page"'), stale);
  assert.match(stale, /<button type="button" class="joy-pagination__btn" disabled="" aria-label="Next page"/);
  for (const bad of [0, -3, NaN]) {
    const h = page({ current: bad, total: 30, pageSize: 10 });
    assert.match(h, /joy-pagination__btn--active" aria-label="Page 1" aria-current="page"/, `current=${bad}`);
    assert.match(h, /disabled="" aria-label="Previous page"/);
  }
  // empty total and zero page size stay finite
  assert.ok(!/NaN|Infinity/.test(page({ total: 0, pageSize: 0 })));
  // size changer keeps the Svelte markup
  const sc = page({ total: 100, showSizeChanger: true });
  assert.ok(sc.includes('aria-label="Items per page"') && sc.includes('<option value="20">20 / page</option>'), sc);
});

test('F-038 C-L5: Pagination collapses under 480px via matchMedia state set in useEffect with cleanup (SSR default false)', () => {
  const React = requireFromHere('react');
  const src = fs.readFileSync(fileURLToPath(new URL('../src/Pagination.tsx', import.meta.url)), 'utf8');
  assert.ok(src.includes("matchMedia('(max-width: 480px)')") && src.includes('React.useState(false)') && src.includes('removeEventListener'), 'matchMedia effect with cleanup');
  assert.ok(src.includes("typeof window === 'undefined'") && src.includes("typeof window.matchMedia !== 'function'"), 'SSR-safe guard');
  assert.ok(src.includes('pageItems(page, totalPages, compact)') && src.includes('{!compact &&'), 'shared compact rule, Total hidden when compact');

  // compact state (slot 0): only Previous, the current page and Next; Total hidden; size changer kept
  const { tree } = renderWithHooks('Pagination', { current: 50, total: 1000, pageSize: 10, showSizeChanger: true }, { state: [true] });
  const btns = findAll(tree, (n) => n.type === 'button');
  assert.deepStrictEqual(btns.map((b) => b.props['aria-label']), ['Previous page', 'Page 50', 'Next page']);
  assert.strictEqual(findAll(tree, (n) => n.props.className === 'joy-pagination__info').length, 0);
  assert.strictEqual(findAll(tree, (n) => n.type === 'select').length, 1);
  assert.strictEqual(findAll(tree, (n) => n.props.className === 'joy-pagination__ellipsis').length, 0);

  // handlers: out-of-range and same-page navigation are ignored; prev/next/page call onChange(page, size)
  const calls = [];
  const r = renderWithHooks('Pagination', { current: 1, total: 100, pageSize: 10, onChange: (p, s) => calls.push([p, s]) }).tree;
  const b = findAll(r, (n) => n.type === 'button');
  b[0].props.onClick(); // Previous on page 1
  b.find((x) => x.props['aria-label'] === 'Page 1').props.onClick(); // same page
  b.find((x) => x.props['aria-label'] === 'Next page').props.onClick();
  b.find((x) => x.props['aria-label'] === 'Page 10').props.onClick();
  assert.deepStrictEqual(calls, [[2, 10], [10, 10]]);
  assert.ok(React); // React shim restored: a plain render still works
});

// ---------------------------------------------------------------------------------------------------------------------
// F-038 Wave 3 lane C-L6: Drawer, Modal, Popconfirm, Dropdown, Tooltip, ImagePreview, Image (rendered markup + lifecycle)
// ---------------------------------------------------------------------------------------------------------------------

/** Run `fn` with a fake window/document so effects that touch the DOM (scroll lock, focus, overlay listeners) can execute. */
function withDom(fn) {
  const saved = { window: globalThis.window, document: globalThis.document };
  const counted = (target, label) => {
    const add = target.addEventListener.bind(target);
    const remove = target.removeEventListener.bind(target);
    target.listeners = 0;
    target.addEventListener = (t, f, o) => { target.listeners++; add(t, f, o); };
    target.removeEventListener = (t, f, o) => { target.listeners--; remove(t, f, o); };
    target.label = label;
    return target;
  };
  const doc = counted(Object.assign(new EventTarget(), { body: { style: { overflow: '', paddingRight: '' } }, documentElement: { clientWidth: 1024 }, activeElement: null }), 'document');
  const win = counted(Object.assign(new EventTarget(), { innerWidth: 1024, innerHeight: 768, matchMedia: () => ({ matches: false }) }), 'window');
  const mk = (extra = {}) => {
    const n = counted(new EventTarget(), 'node');
    const classes = new Set();
    return Object.assign(n, {
      isConnected: true, focused: 0, style: {}, attrs: {}, classes, id: '', firstElementChild: null,
      classList: { add: (...c) => c.forEach((x) => classes.add(x)), remove: (...c) => c.forEach((x) => classes.delete(x)) },
      getBoundingClientRect: () => ({ top: 100, left: 40, width: 200, height: 40, bottom: 140, right: 240 }),
      focus() { n.focused++; doc.activeElement = n; },
      contains(x) { return x === n; },
      getAttribute(k) { return k in n.attrs ? n.attrs[k] : null; },
      setAttribute(k, v) { n.attrs[k] = String(v); },
      removeAttribute(k) { delete n.attrs[k]; },
      querySelector: () => null,
      querySelectorAll: () => [],
    }, extra);
  };
  globalThis.window = win;
  globalThis.document = doc;
  try {
    return fn({ doc, win, mk });
  } finally {
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete globalThis[k]; else globalThis[k] = v; }
  }
}

/**
 * Minimal hook runtime for calling a forwardRef component's render function outside a DOM: persistent useState/useRef/useMemo
 * slots, useEffect with dependency comparison and cleanups, and object refs bound to `refNode(element)` fakes after each render.
 * `flush()` runs the effects the way React does after commit; `unmount()` runs every cleanup.
 */
function mount(name, initialProps, { refNode = () => null, forwardedRef = null } = {}) {
  const React = requireFromHere('react');
  const C = loadComponent(name)[name];
  const slots = [];
  const nodes = new Map();
  let props = initialProps;
  let pending = [];
  const h = { tree: null };
  h.rerender = (next) => {
    if (next) props = next;
    const saved = { useState: React.useState, useRef: React.useRef, useMemo: React.useMemo, useCallback: React.useCallback, useId: React.useId, useEffect: React.useEffect, useImperativeHandle: React.useImperativeHandle };
    let i = 0;
    pending = [];
    React.useState = (init) => { const s = (slots[i] ??= { v: typeof init === 'function' ? init() : init }); i++; return [s.v, (nv) => { s.v = typeof nv === 'function' ? nv(s.v) : nv; }]; };
    React.useRef = (init) => { const s = (slots[i] ??= { v: { current: init } }); i++; return s.v; };
    React.useMemo = (fn, deps) => { const s = (slots[i] ??= {}); i++; if (!s.deps || deps.some((d, k) => !Object.is(d, s.deps[k]))) { s.deps = deps; s.val = fn(); } return s.val; };
    React.useCallback = (fn, deps) => { const s = (slots[i] ??= {}); i++; if (!s.deps || deps.some((d, k) => !Object.is(d, s.deps[k]))) { s.deps = deps; s.val = fn; } return s.val; };
    React.useId = () => 'uid';
    React.useImperativeHandle = () => { i++; };
    React.useEffect = (fn, deps) => { pending.push({ slot: (slots[i] ??= {}), fn, deps }); i++; };
    try {
      h.tree = C.render(props, forwardedRef);
    } finally {
      Object.assign(React, saved);
    }
    // bind object refs the way commit does: refs of elements still in the tree get a node, the others are cleared
    const seen = new Set();
    walk(h.tree, (el) => {
      const r = el.props.ref;
      if (r && (typeof r === 'function' || (typeof r === 'object' && 'current' in r))) {
        seen.add(r);
        if (!nodes.has(r)) {
          nodes.set(r, refNode(el));
          if (typeof r === 'function') r(nodes.get(r));
        }
        if (typeof r !== 'function') r.current = nodes.get(r);
      }
    });
    for (const [r] of nodes) if (!seen.has(r)) { if (typeof r === 'function') r(null); else r.current = null; nodes.delete(r); }
    return h;
  };
  h.flush = () => {
    for (const eff of pending) {
      const s = eff.slot;
      const changed = !s.deps || !eff.deps || eff.deps.some((d, k) => !Object.is(d, s.deps[k]));
      if (!changed) continue;
      s.cleanup?.();
      s.deps = eff.deps;
      s.cleanup = eff.fn();
    }
    return h;
  };
  h.update = (next) => h.rerender(next).flush();
  h.unmount = () => { for (const s of slots) { s?.cleanup?.(); if (s) s.cleanup = undefined; } };
  h.find = (pred) => findAll(h.tree, pred);
  h.byClass = (c) => findAll(h.tree, (n) => typeof n.props.className === 'string' && n.props.className.split(/\s+/).includes(c));
  return h.rerender();
}
const keydown = (key, extra = {}) => { const e = new Event('keydown', { cancelable: true }); Object.defineProperty(e, 'key', { value: key }); Object.assign(e, extra); return e; };
const evtWith = (type, props) => { const e = new Event(type, { cancelable: true }); for (const [k, v] of Object.entries(props)) Object.defineProperty(e, k, { value: v }); return e; };
const reactKey = (key, extra = {}) => { const calls = { prevented: 0 }; return Object.assign({ key, preventDefault: () => calls.prevented++, stopPropagation: () => {}, calls }, extra); };
const idOf = (html, re) => (html.match(re) || [])[1];
// React 19 hoists <link rel=preload> for <img> into the SSR output, and the icon SVGs carry their own inline style: strip both
// when asserting on the component's own markup.
const bare = (html) => html.replace(/^(<link [^>]*\/>)+/, '');
const noSvg = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>');

test('F-038 C-L6: Modal renders the Svelte contract (unique label id, aria-label fallback, Close icon, no &times;, rest ordering)', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Modal } = loadComponent('Modal');
  const html = (props, ...kids) => renderToStaticMarkup(React.createElement(Modal, props, ...kids));

  assert.strictEqual(Modal.$$typeof, Symbol.for('react.forward_ref'));
  assert.strictEqual(html({ open: false, title: 'x' }), '', 'renders nothing when closed');

  const titled = html({ open: true, title: 'Delete?', footer: React.createElement('button', null, 'ok'), className: 'mine', 'data-x': '1' }, 'body');
  assert.match(titled, /^<div class="joy-modal-backdrop" role="presentation"><div [^>]*class="joy-modal mine"/);
  assert.ok(titled.includes('role="dialog"') && titled.includes('aria-modal="true"'));
  const labelledby = idOf(titled, /aria-labelledby="([^"]+)"/);
  assert.ok(labelledby && titled.includes(`<h3 id="${labelledby}" class="joy-modal__title">Delete?</h3>`), 'aria-labelledby resolves to the title');
  assert.ok(labelledby.endsWith('-title') && labelledby !== 'modal-title', 'unique per instance, not the hard-coded id');
  assert.ok(!titled.includes('aria-label="Dialog"'));
  assert.ok(titled.includes('data-x="1"'), 'rest lands on the dialog element');
  assert.match(titled, /<button type="button" class="joy-modal__close" aria-label="Close dialog"><svg /);
  assert.ok(!titled.includes('&times;') && !titled.includes('×'));
  assert.ok(titled.includes('<div class="joy-modal__body">body</div>') && titled.includes('<div class="joy-modal__footer"><button>ok</button></div>'));

  const bare = html({ open: true });
  assert.ok(bare.includes('aria-label="Dialog"') && !bare.includes('aria-labelledby') && !bare.includes('<h3') && !bare.includes('joy-modal__footer'));
  // rest cannot clobber component-owned attributes
  const clobber = html({ open: true, role: 'alert', 'aria-modal': 'false' });
  assert.ok(clobber.includes('role="dialog"') && clobber.includes('aria-modal="true"') && clobber.includes('aria-label="Dialog"'));
  // two instances never share a label id
  const two = renderToStaticMarkup(React.createElement('div', null, React.createElement(Modal, { open: true, title: 'a' }), React.createElement(Modal, { open: true, title: 'b' })));
  const ids = [...two.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
  assert.strictEqual(new Set(ids).size, 2);
});

test('F-038 C-L6: Drawer renders the Svelte contract (placement is a backdrop class, no inline style, label fallback, Close icon)', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Drawer } = loadComponent('Drawer');
  const html = (props, ...kids) => renderToStaticMarkup(React.createElement(Drawer, props, ...kids));
  assert.strictEqual(Drawer.$$typeof, Symbol.for('react.forward_ref'));
  assert.strictEqual(html({ open: false }), '');

  const right = html({ open: true, title: 'Filters', 'data-x': '1' });
  const rightNoSvg = noSvg(right);
  assert.match(right, /^<div class="joy-drawer-backdrop" role="presentation"><div [^>]*class="joy-drawer"/);
  assert.ok(!rightNoSvg.includes('style=') && !right.includes('joy-drawer--left') && !right.includes('joy-drawer-backdrop--left'));
  const id = idOf(right, /aria-labelledby="([^"]+)"/);
  assert.ok(id && right.includes(`id="${id}" class="joy-drawer__title"`) && id !== 'drawer-title');
  assert.ok(right.includes('data-x="1"') && right.includes('aria-label="Close drawer"') && !right.includes('&times;'));

  const left = html({ open: true, placement: 'left', className: 'mine' });
  assert.ok(left.includes('class="joy-drawer-backdrop joy-drawer-backdrop--left"'), left);
  assert.ok(left.includes('class="joy-drawer mine joy-drawer--left"'), left);
  assert.ok(left.includes('aria-label="Drawer"') && !left.includes('aria-labelledby') && !left.includes('<h3'));
  assert.ok(!noSvg(left).includes('style='));
});

test('F-038 C-L6: Popconfirm renders role=alertdialog with a labelled title, AlertCircle icon in a tone span, no inline colour', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Popconfirm } = loadComponent('Popconfirm');
  const html = (props, kid = 'Delete') => renderToStaticMarkup(React.createElement(Popconfirm, props, React.createElement('button', null, kid)));
  assert.strictEqual(Popconfirm.$$typeof, Symbol.for('react.forward_ref'));

  const closed = html({ 'data-x': '1', className: 'mine' });
  assert.match(closed, /^<div [^>]*class="joy-popconfirm mine"/);
  assert.ok(closed.includes('data-x="1"') && closed.includes('<div class="joy-popconfirm__trigger"><button>Delete</button></div>'));
  assert.ok(!closed.includes('joy-popconfirm__panel'));

  const open = html({ open: true, title: 'Sure?', okText: 'Yes', cancelText: 'No' });
  assert.match(open, /<div class="joy-popconfirm__panel" role="alertdialog" aria-labelledby="([^"]+)">/);
  const id = idOf(open, /aria-labelledby="([^"]+)"/);
  assert.ok(open.includes(`<span id="${id}">Sure?</span>`) && !open.includes('aria-modal'));
  assert.match(open, /<span class="joy-popconfirm__icon"><svg [^>]*width="1rem"/);
  assert.ok(!open.includes('#f59e0b') && !open.includes('stroke="var('), 'no inline warning colour');
  assert.match(open, /joy-button--ghost joy-button--sm">No<\/button><button type="button" class="joy-button joy-button--solid joy-button--sm">Yes</);
  const clobber = html({ open: true, role: 'presentation', className: 'x' });
  assert.ok(clobber.includes('role="alertdialog"'));
});

test('F-038 C-L6: Dropdown and Tooltip render the Svelte contract (aria wiring, classes, refs, rest)', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Dropdown } = loadComponent('Dropdown');
  const { Tooltip } = loadComponent('Tooltip');
  for (const C of [Dropdown, Tooltip]) assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${C.displayName} forwards refs`);

  const dd = renderToStaticMarkup(React.createElement(Dropdown, { items: [{ key: 'a', label: 'A' }], className: 'mine', 'data-x': '1' }, 'Menu'));
  assert.match(dd, /^<div [^>]*class="joy-dropdown-wrapper mine"/);
  assert.ok(dd.includes('data-x="1"'));
  assert.match(dd, /<div class="joy-dropdown-trigger" role="button" tabindex="0" aria-haspopup="menu" aria-expanded="false">Menu<\/div>/);
  assert.ok(!dd.includes('aria-controls') && !dd.includes('role="menu"'));

  const tip = renderToStaticMarkup(React.createElement(Tooltip, { title: 'Hint', className: 'mine', 'data-x': '1' }, React.createElement('button', null, 'b')));
  assert.strictEqual(tip, '<div data-x="1" class="joy-tooltip-wrapper mine"><button>b</button></div>');
});

test('F-038 C-L6: ImagePreview renders the Svelte class/aria contract with no inline colours and icons from @joymify/icons', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { ImagePreview } = loadComponent('ImagePreview');
  assert.strictEqual(ImagePreview.$$typeof, Symbol.for('react.forward_ref'));
  const html = (props) => bare(renderToStaticMarkup(React.createElement(ImagePreview, { onClose() {}, ...props })));
  assert.strictEqual(html({ open: false, src: 'a.png' }), '');

  const one = html({ open: true, src: 'a.png', className: 'mine', 'data-x': '1' });
  assert.match(one, /^<div [^>]*class="joy-image-preview-mask mine"/);
  const oneNoSvg = noSvg(one);
  assert.ok(one.includes('role="dialog"') && one.includes('aria-modal="true"') && one.includes('aria-label="Image preview"') && one.includes('data-x="1"'));
  assert.ok(one.includes('<div class="joy-image-preview-toolbar" role="toolbar" aria-label="Preview tools">'));
  const labels = [...one.matchAll(/<button [^>]*class="joy-image-preview-btn[ "]/g)];
  assert.strictEqual(labels.length, 6);
  for (const l of ['Zoom in', 'Zoom out', 'Rotate left', 'Rotate right', 'Reset zoom and rotation', 'Close preview']) assert.ok(one.includes(`aria-label="${l}"`), l);
  assert.ok(one.includes('class="joy-image-preview-btn joy-image-preview-btn--close"') && one.includes('<span class="joy-image-preview-btn__icon--flip"><svg'));
  assert.ok(!one.includes('joy-image-preview-counter') && !one.includes('joy-image-preview-nav'), 'single image has no gallery controls');
  assert.match(one, /<div class="joy-image-preview-stage"><img class="joy-image-preview-img" src="a.png" alt="Preview image" draggable="false" style="transform:translate\(0px, 0px\) scale\(1\) rotate\(0deg\)"\/>/);
  // style attributes: the image transform only; nothing coloured, blurred or sized inline
  assert.strictEqual([...oneNoSvg.matchAll(/style="/g)].length, 1);
  assert.ok(!/rgba?\(|#[0-9a-f]{3,8}\b|blur|z-index/i.test(oneNoSvg), 'no hard-coded colours');
  assert.ok(!one.includes('Zoom In') && !one.includes('Rotate Counterclockwise'), 'old label spellings are gone');

  const gallery = html({ open: true, items: ['a.png', { src: 'b.png', alt: 'Second' }] });
  assert.ok(gallery.includes('<div class="joy-image-preview-counter">1 / 2</div>'), gallery);
  assert.ok(gallery.includes('class="joy-image-preview-nav joy-image-preview-nav--prev"') && gallery.includes('aria-label="Previous image"'));
  assert.ok(gallery.includes('class="joy-image-preview-nav joy-image-preview-nav--next"') && gallery.includes('aria-label="Next image"'));
  assert.ok(html({ open: true, items: ['a.png', { src: 'b.png', alt: 'Second' }], current: 1 }).includes('alt="Second"'));
  const clobber = html({ open: true, src: 'a.png', role: 'presentation', 'aria-modal': 'false' });
  assert.ok(clobber.includes('role="dialog"') && clobber.includes('aria-modal="true"'));
});

test('F-038 C-L6: Image is its own module (ref on the wrapper, rest on the img), and index.ts exports it from Image.js', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { Image } = loadComponent('Image');
  assert.strictEqual(Image.$$typeof, Symbol.for('react.forward_ref'));
  assert.strictEqual(Image.displayName, 'Image');
  assert.ok(!('Image' in loadComponent('ImagePreview')), 'ImagePreview.tsx no longer bundles Image');
  const index = readSrc('../src/index.ts');
  assert.ok(index.includes("export { Image, type ImageProps } from './Image.js';"));
  assert.ok(index.includes("export { ImagePreview, type ImagePreviewProps, type ImageItem } from './ImagePreview.js';"));
  assert.ok(readSrc('../src/Image.tsx').includes("from './ImagePreview.js'"), 'Image imports ImagePreview');

  const html = (props) => bare(renderToStaticMarkup(React.createElement(Image, props)));
  const on = html({ src: 'a.png', alt: 'A', className: 'mine', style: { width: 40 }, 'data-x': '1' });
  assert.ok(on.startsWith('<div class="joy-image-wrapper mine joy-image-wrapper--previewable" style="width:40px" role="button" tabindex="0">'), on);
  assert.ok(on.includes('<img data-x="1" src="a.png" alt="A" class="joy-image__img"/>'), 'rest goes to the img, class stays joy-image__img');
  const off = html({ src: 'a.png', preview: false });
  assert.ok(off.startsWith('<div class="joy-image-wrapper">') && !off.includes('role=') && !off.includes('tabindex') && !off.includes('previewable'), off);
});

test('F-038 C-L6: Modal and Drawer effects lock scroll, trap focus, register in the dialog stack and tear everything down', () => {
  const overlay = loadFile(fileURLToPath(new URL('../src/overlay-utils.ts', import.meta.url)));
  for (const name of ['Modal', 'Drawer']) {
    withDom(({ doc, win, mk }) => {
      const opener = mk(); doc.activeElement = opener;
      const firstFocusable = mk();
      const dialogNode = mk({ querySelector: () => firstFocusable });
      const closed = [];
      const h = mount(name, { open: true, title: 'T', onClose: () => closed.push(1) }, { refNode: (el) => (el.props.role === 'dialog' ? dialogNode : mk()) });
      // before flush nothing has happened: effects run after commit
      assert.strictEqual(doc.body.style.overflow, '');
      h.flush();
      assert.strictEqual(doc.body.style.overflow, 'hidden', `${name}: scroll locked`);
      assert.strictEqual(firstFocusable.focused, 1, `${name}: trapFocus moved focus into the dialog`);
      assert.strictEqual(dialogNode.listeners, 1, `${name}: Tab trap attached to the dialog`);
      assert.strictEqual(win.listeners, 1, `${name}: one window keydown listener`);

      // Escape closes; a popover that already claimed the key (preventDefault) keeps the dialog open
      win.dispatchEvent(keydown('Escape'));
      assert.strictEqual(closed.length, 1, `${name}: Escape closes`);
      const claimed = keydown('Escape'); claimed.preventDefault();
      win.dispatchEvent(claimed);
      assert.strictEqual(closed.length, 1, `${name}: an Escape already claimed by a popover/menu/tooltip does not close the dialog`);
      win.dispatchEvent(keydown('a'));
      win.dispatchEvent(keydown('Enter'));
      assert.strictEqual(closed.length, 1, `${name}: other keys ignored`);

      // registerDialog wiring: a dialog opened later is the topmost, so this one ignores Escape until it unregisters
      const inner = overlay.registerDialog();
      win.dispatchEvent(keydown('Escape'));
      assert.strictEqual(closed.length, 1, `${name}: not topmost -> Escape ignored`);
      inner.unregister();
      win.dispatchEvent(keydown('Escape'));
      assert.strictEqual(closed.length, 2, `${name}: topmost again -> Escape closes`);

      // a re-render with a new onClose must not re-run the effect (no relock, no listener churn) and Escape uses the latest callback
      const later = [];
      h.update({ open: true, title: 'T', onClose: () => later.push(1) });
      assert.strictEqual(win.listeners, 1);
      win.dispatchEvent(keydown('Escape'));
      assert.deepStrictEqual([closed.length, later.length], [2, 1]);

      // closing releases everything: scroll, listeners, dialog stack, and focus goes back to the opener
      h.update({ open: false, onClose: () => later.push(1) });
      assert.strictEqual(h.tree, null, `${name}: renders nothing when closed`);
      assert.strictEqual(doc.body.style.overflow, '', `${name}: scroll released`);
      assert.strictEqual(win.listeners, 0);
      assert.strictEqual(dialogNode.listeners, 0);
      assert.strictEqual(opener.focused, 1, `${name}: focus returned to the opener`);
      const probe = overlay.registerDialog();
      assert.ok(probe.isTopmost(), `${name}: unregistered from the dialog stack`);
      probe.unregister();
      win.dispatchEvent(keydown('Escape'));
      assert.strictEqual(later.length, 1, `${name}: no Escape handling after close`);

      // unmounting while open runs the same teardown
      const h2 = mount(name, { open: true, onClose() {} }, { refNode: (el) => (el.props.role === 'dialog' ? mk({ querySelector: () => mk() }) : mk()) });
      h2.flush();
      assert.strictEqual(doc.body.style.overflow, 'hidden');
      h2.unmount();
      assert.strictEqual(doc.body.style.overflow, '');
      assert.strictEqual(win.listeners, 0);
    });
  }
});

test('F-038 C-L6: Modal/Drawer/ImagePreview run the shared useDialog lifecycle, which registers in the dialog stack, gates keys on topmost and defaultPrevented, and locks scroll + traps focus', () => {
  const hooks = readSrc('../src/dialog-hooks.ts');
  assert.ok(/registerDialog\(\)/.test(hooks) && /\.unregister\(\)/.test(hooks), 'useDialog: registerDialog + unregister');
  assert.ok(/isTopmost\(\)/.test(hooks) && /defaultPrevented/.test(hooks), 'useDialog: keys act only when topmost and not defaultPrevented');
  assert.ok(/lockBodyScroll\(\)/.test(hooks) && /trapFocus\(/.test(hooks), 'useDialog: scroll lock + focus trap');
  for (const name of ['Modal', 'Drawer', 'ImagePreview']) {
    const src = readSrc(`../src/${name}.tsx`);
    assert.ok(/useDialog\(/.test(src), `${name}: runs the shared dialog lifecycle`);
    assert.ok(!/style=\{\{/.test(src.replace(/style=\{\{ transform:/, '')), `${name}: no inline style objects`);
    assert.ok(!/modal-title|drawer-title|&times;/.test(src), `${name}: no hard-coded label id or glyph close`);
  }
  for (const name of ['Popconfirm', 'Dropdown']) assert.ok(readSrc(`../src/${name}.tsx`).includes('useOverlay('), `${name} uses useOverlay`);
  for (const name of ['Modal', 'Drawer', 'Popconfirm', 'Dropdown', 'Tooltip', 'ImagePreview', 'Image']) {
    const src = readSrc(`../src/${name}.tsx`);
    assert.ok(src.includes('React.forwardRef') && /\{\.\.\.rest\}/.test(src) && src.includes('.displayName'), `${name}: forwardRef + rest + displayName`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(src), `${name}: no colour literals`);
  }
});

test('F-038 C-L6: Popconfirm opens/closes through useOverlay, focuses the first button, returns focus, and reports every change via onOpenChange', () => {
  withDom(({ doc, win, mk }) => {
    const triggerBtn = mk(); const cancelBtn = mk(); const panelNode = mk({ querySelector: () => cancelBtn });
    const triggerNode = mk({ querySelector: () => triggerBtn });
    const refNode = (el) => (el.props.className === 'joy-popconfirm__trigger' ? triggerNode : el.props.className === 'joy-popconfirm__panel' ? panelNode : mk());
    const changes = []; const confirmed = []; const cancelled = [];
    const props = (extra) => ({ children: 'x', onOpenChange: (o) => changes.push(o), onConfirm: () => confirmed.push(1), onCancel: () => cancelled.push(1), ...extra });

    // controlled + open: overlay wiring and first-button focus happen after commit
    const h = mount('Popconfirm', props({ open: true }), { refNode });
    h.flush();
    assert.ok(panelNode.classes.has('joy-overlay') && panelNode.style.position === 'fixed', 'openOverlay positioned the panel');
    assert.strictEqual(cancelBtn.focused, 1, 'first button focused on open');
    assert.strictEqual(doc.listeners, 2, 'Escape + outside-click listeners');

    // outside pointerdown closes (reports false, focus back to the control inside the trigger); inside does not
    doc.dispatchEvent(evtWith('pointerdown', { target: panelNode }));
    assert.deepStrictEqual(changes, []);
    doc.dispatchEvent(evtWith('pointerdown', { target: {} }));
    assert.deepStrictEqual(changes, [false]);
    assert.strictEqual(triggerBtn.focused, 1, 'focus returned to the trigger control');
    assert.strictEqual(doc.listeners, 0, 'overlay disposed');

    // Escape
    const h2 = mount('Popconfirm', props({ open: true }), { refNode });
    h2.flush();
    doc.dispatchEvent(keydown('Escape'));
    assert.deepStrictEqual(changes, [false, false]);
    assert.strictEqual(triggerBtn.focused, 2);

    // trigger click asks to toggle; confirm/cancel call their handler then close
    changes.length = 0;
    const h3 = mount('Popconfirm', props({ open: true }), { refNode });
    h3.byClass('joy-popconfirm__trigger')[0].props.onClick();
    assert.deepStrictEqual(changes, [false]);
    const [cancel, ok] = h3.find((n) => n.type === 'button');
    let stopped = 0;
    ok.props.onClick({ stopPropagation: () => stopped++ });
    cancel.props.onClick({ stopPropagation: () => stopped++ });
    assert.deepStrictEqual([confirmed.length, cancelled.length, changes, stopped], [1, 1, [false, false, false], 2]);
    h.unmount(); h2.unmount(); h3.unmount();

    // uncontrolled: trigger click opens, the panel appears, cancel closes
    const u = mount('Popconfirm', { children: 'x', onCancel: () => cancelled.push(1) }, { refNode });
    assert.strictEqual(u.byClass('joy-popconfirm__panel').length, 0);
    u.byClass('joy-popconfirm__trigger')[0].props.onClick();
    u.update();
    assert.strictEqual(u.byClass('joy-popconfirm__panel').length, 1);
    u.find((n) => n.type === 'button')[0].props.onClick({ stopPropagation() {} });
    u.update();
    assert.strictEqual(u.byClass('joy-popconfirm__panel').length, 0);
    assert.strictEqual(win.listeners, 0);
  });
});

test('F-038 C-L6: Dropdown - aria state, roving keyboard nav skipping disabled items, Tab/Escape/select close and return focus, items changing while open does not refocus', () => {
  withDom(({ doc, mk }) => {
    const items = [{ key: 'a', label: 'A', disabled: true }, { key: 'b', label: 'B' }, { key: 'c', label: 'C' }, { key: 'd', label: 'D', danger: true }];
    const itemNodes = items.map(() => mk());
    const triggerNode = mk(); const panelNode = mk({ querySelectorAll: () => itemNodes });
    const refNode = (el) => (el.props.className === 'joy-dropdown-trigger' ? triggerNode : el.props.className === 'joy-dropdown' ? panelNode : mk());
    const selected = [];
    const h = mount('Dropdown', { items, onSelect: (k) => selected.push(k), children: 'Menu' }, { refNode });
    const trigger = () => h.byClass('joy-dropdown-trigger')[0];
    const menu = () => h.byClass('joy-dropdown')[0];
    const key = (target, k, extra) => { const e = reactKey(k, extra); target.props.onKeyDown(e); h.update(); return e; };

    assert.deepStrictEqual([trigger().props['aria-expanded'], trigger().props['aria-haspopup'], trigger().props['aria-controls'], trigger().props.role, trigger().props.tabIndex], [false, 'menu', undefined, 'button', 0]);

    // ArrowUp opens on the last enabled item, through useOverlay (fixed panel in the overlay layer)
    const up = key(trigger(), 'ArrowUp');
    assert.strictEqual(up.calls.prevented, 1);
    assert.ok(menu(), 'menu rendered');
    assert.deepStrictEqual([menu().props.role, menu().props.tabIndex, menu().props['aria-orientation']], ['menu', -1, 'vertical']);
    assert.strictEqual(trigger().props['aria-expanded'], true);
    assert.strictEqual(trigger().props['aria-controls'], menu().props.id);
    assert.ok(menu().props.id.endsWith('-menu'));
    assert.ok(panelNode.classes.has('joy-overlay') && panelNode.style.position === 'fixed');
    assert.strictEqual(itemNodes[3].focused, 1, 'ArrowUp -> last item focused');
    const rendered = h.find((n) => n.props.role === 'menuitem');
    assert.deepStrictEqual(rendered.map((n) => n.props.className), ['joy-dropdown__item', 'joy-dropdown__item', 'joy-dropdown__item', 'joy-dropdown__item joy-dropdown__item--danger']);
    assert.deepStrictEqual(rendered.map((n) => n.props.disabled), [true, undefined, undefined, undefined]);

    // items changing while open must not refocus or reopen
    const focusedBefore = itemNodes.map((n) => n.focused);
    h.update({ items: [...items, { key: 'e', label: 'E' }], onSelect: (k) => selected.push(k), children: 'Menu' });
    assert.deepStrictEqual(itemNodes.map((n) => n.focused), focusedBefore);
    h.update({ items, onSelect: (k) => selected.push(k), children: 'Menu' });

    // roving: Home/End/Arrows skip the disabled item and wrap
    key(menu(), 'Home'); assert.strictEqual(itemNodes[1].focused, 1);
    key(menu(), 'ArrowDown'); assert.strictEqual(itemNodes[2].focused, 1);
    key(menu(), 'End'); assert.strictEqual(itemNodes[3].focused, 2);
    key(menu(), 'ArrowDown'); assert.strictEqual(itemNodes[1].focused, 2, 'wraps past the disabled first item');
    key(menu(), 'ArrowUp'); assert.strictEqual(itemNodes[3].focused, 3, 'wraps back to the last');
    const other = key(menu(), 'a'); assert.strictEqual(other.calls.prevented, 0, 'other keys are not consumed');

    // Tab closes and puts focus on the trigger
    const before = triggerNode.focused;
    key(menu(), 'Tab');
    assert.strictEqual(menu(), undefined);
    assert.strictEqual(triggerNode.focused, before + 1);
    assert.strictEqual(doc.listeners, 0, 'overlay disposed on close');

    // Enter/Space toggle only when the wrapper itself is the target
    key(trigger(), 'Enter', { target: {}, currentTarget: { x: 1 } });
    assert.strictEqual(menu(), undefined, 'Enter bubbling from a child button is ignored (its click opens)');
    const self = {};
    key(trigger(), ' ', { target: self, currentTarget: self });
    assert.ok(menu(), 'Space on the wrapper opens');
    assert.strictEqual(itemNodes[1].focused, 3, 'keyboard open focuses the first enabled item');
    key(trigger(), 'Enter', { target: self, currentTarget: self });
    assert.strictEqual(menu(), undefined, 'Enter on the wrapper closes');

    // click toggles; selecting closes, focuses the trigger, then reports the key; disabled items do nothing
    trigger().props.onClick(); h.update();
    assert.ok(menu());
    const btns = h.find((n) => n.props.role === 'menuitem');
    btns[0].props.onClick(); h.update();
    assert.deepStrictEqual(selected, []);
    assert.ok(menu(), 'disabled item leaves the menu open');
    const f = triggerNode.focused;
    btns[2].props.onClick(); h.update();
    assert.deepStrictEqual(selected, ['c']);
    assert.strictEqual(menu(), undefined);
    assert.strictEqual(triggerNode.focused, f + 1);

    // Escape (through the shared overlay primitive) closes and returns focus to the trigger
    trigger().props.onClick(); h.update();
    const f2 = triggerNode.focused;
    doc.dispatchEvent(keydown('Escape')); h.update();
    assert.strictEqual(menu(), undefined);
    assert.strictEqual(triggerNode.focused, f2 + 1);
    // outside pointerdown closes
    trigger().props.onClick(); h.update();
    doc.dispatchEvent(evtWith('pointerdown', { target: {} })); h.update();
    assert.strictEqual(menu(), undefined);
    assert.strictEqual(doc.listeners, 0);
    h.unmount();
  });
});

test('F-038 C-L6: Tooltip - hover ignores touch, tap pins/unpins, focus shows, aria-describedby is added and removed, Escape and outside taps dismiss', () => {
  withDom(({ doc, mk }) => {
    const trigger = mk();
    const wrapper = mk({ firstElementChild: trigger, contains: (n) => n === wrapper || n === trigger });
    const h = mount('Tooltip', { title: 'Hint', children: 'x', className: 'mine' }, { refNode: (el) => (el.props.className.includes('joy-tooltip-wrapper') ? wrapper : mk()) });
    const root = () => h.tree;
    const tip = () => h.byClass('joy-tooltip')[0];
    const step = (fn) => { fn(); h.update(); };

    assert.strictEqual(root().props.className, 'joy-tooltip-wrapper mine');
    assert.strictEqual(tip(), undefined);

    // mouse hover shows, leaving hides; a click with a mouse never pins
    step(() => root().props.onPointerEnter({ pointerType: 'mouse' }));
    assert.ok(tip());
    assert.deepStrictEqual([tip().props.role, tip().props.id.endsWith('-tip')], ['tooltip', true]);
    assert.strictEqual(trigger.attrs['aria-describedby'], tip().props.id, 'trigger described by the tooltip');
    assert.strictEqual(doc.listeners, 2, 'Escape + outside pointerdown only while visible');
    step(() => root().props.onPointerLeave({ pointerType: 'mouse' }));
    assert.strictEqual(tip(), undefined);
    assert.strictEqual(trigger.attrs['aria-describedby'], undefined, 'aria-describedby removed on hide');
    assert.strictEqual(doc.listeners, 0);
    step(() => { root().props.onPointerDown({ pointerType: 'mouse' }); root().props.onClick({}); });
    assert.strictEqual(tip(), undefined, 'mouse click does not pin');

    // touch: pointerenter does not hover; tap pins; second tap unpins
    step(() => root().props.onPointerEnter({ pointerType: 'touch' }));
    assert.strictEqual(tip(), undefined, 'touch does not hover');
    step(() => { root().props.onPointerDown({ pointerType: 'touch' }); root().props.onClick({}); });
    assert.ok(tip(), 'tap pins');
    step(() => root().props.onPointerLeave({ pointerType: 'touch' }));
    assert.ok(tip(), 'a touch pointerleave does not unpin');
    step(() => { root().props.onPointerDown({ pointerType: 'touch' }); root().props.onClick({}); });
    assert.strictEqual(tip(), undefined, 'second tap dismisses');

    // outside tap and Escape dismiss (Escape is claimed so a surrounding dialog stays open); taps inside do not
    step(() => { root().props.onPointerDown({ pointerType: 'touch' }); root().props.onClick({}); });
    assert.ok(tip());
    doc.dispatchEvent(evtWith('pointerdown', { target: trigger })); h.update();
    assert.ok(tip(), 'a tap inside the wrapper keeps it');
    doc.dispatchEvent(evtWith('pointerdown', { target: {} })); h.update();
    assert.strictEqual(tip(), undefined, 'outside tap dismisses');
    step(() => root().props.onFocus({}));
    assert.ok(tip(), 'keyboard focus shows');
    const esc = keydown('Escape'); doc.dispatchEvent(esc); h.update();
    assert.strictEqual(esc.defaultPrevented, true, 'Escape claimed for the tooltip');
    assert.strictEqual(tip(), undefined);
    step(() => root().props.onFocus({}));
    step(() => root().props.onBlur({}));
    assert.strictEqual(tip(), undefined, 'blur hides');

    // existing tokens are preserved and restored; consumer handlers still run
    trigger.attrs['aria-describedby'] = 'other';
    const seen = [];
    h.update({ title: 'Hint', children: 'x', onFocus: () => seen.push('f'), onClick: () => seen.push('c') });
    step(() => root().props.onFocus({}));
    assert.strictEqual(trigger.attrs['aria-describedby'], `other ${tip().props.id}`);
    root().props.onPointerDown({ pointerType: 'mouse' });
    root().props.onClick({});
    assert.deepStrictEqual(seen, ['f', 'c']);
    step(() => root().props.onBlur({}));
    assert.strictEqual(trigger.attrs['aria-describedby'], 'other');
    h.unmount();
    assert.strictEqual(doc.listeners, 0);
  });
});

test('F-038 C-L6: ImagePreview keys act only on the topmost dialog; arrows/zoom/rotate/reset update the transform; teardown releases scroll and focus', () => {
  const overlay = loadFile(fileURLToPath(new URL('../src/overlay-utils.ts', import.meta.url)));
  withDom(({ doc, win, mk }) => {
    const opener = mk(); doc.activeElement = opener;
    const maskNode = mk({ querySelector: () => mk() });
    const closed = []; const changed = [];
    const base = { open: true, items: ['a.png', 'b.png', 'c.png'], onClose: () => closed.push(1), onChange: (i) => changed.push(i) };
    const h = mount('ImagePreview', base, { refNode: (el) => (el.props.role === 'dialog' ? maskNode : mk()) });
    h.flush();
    assert.strictEqual(doc.body.style.overflow, 'hidden');
    assert.strictEqual(win.listeners, 1);
    const img = () => h.byClass('joy-image-preview-img')[0];
    const transform = () => img().props.style.transform;
    assert.strictEqual(transform(), 'translate(0px, 0px) scale(1) rotate(0deg)');

    const press = (k) => { win.dispatchEvent(keydown(k)); h.update(); };
    press('+'); assert.strictEqual(transform(), 'translate(0px, 0px) scale(1.25) rotate(0deg)');
    assert.ok(h.byClass('joy-image-preview-stage')[0].props.className.includes('joy-image-preview-stage--zoomed'));
    press('-'); press('-'); assert.ok(transform().includes('scale(0.75)'));
    press('r'); assert.ok(transform().includes('rotate(90deg)'));
    const btn = (label) => h.find((n) => n.props['aria-label'] === label)[0];
    btn('Rotate left').props.onClick(); h.update(); assert.ok(transform().includes('rotate(0deg)'));
    btn('Zoom in').props.onClick(); h.update(); btn('Reset zoom and rotation').props.onClick(); h.update();
    assert.strictEqual(transform(), 'translate(0px, 0px) scale(1) rotate(0deg)');
    press('ArrowRight'); assert.deepStrictEqual(changed, [1]);
    assert.ok(h.byClass('joy-image-preview-counter')[0].props.children.includes('2 / 3'));
    btn('Previous image').props.onClick(); h.update(); btn('Previous image').props.onClick(); h.update();
    assert.deepStrictEqual(changed, [1, 0, 2], 'previous wraps');
    btn('Close preview').props.onClick(); assert.strictEqual(closed.length, 1);

    // a topmost dialog opened later (e.g. a Modal from the preview) owns the keys
    const top = overlay.registerDialog();
    press('Escape'); press('+');
    assert.strictEqual(closed.length, 1);
    assert.ok(!transform().includes('scale(1.25)'));
    top.unregister();
    press('Escape');
    assert.strictEqual(closed.length, 2);

    // drag pans only when zoomed; window mousemove/mouseup are attached just while dragging
    const stage = () => h.byClass('joy-image-preview-stage')[0];
    const md = { clientX: 10, clientY: 10, preventDefault() {} };
    stage().props.onMouseDown(md); h.update();
    assert.strictEqual(win.listeners, 1, 'not zoomed: no drag');
    press('+');
    stage().props.onMouseDown(md); h.update();
    assert.strictEqual(win.listeners, 3);
    assert.ok(stage().props.className.includes('joy-image-preview-stage--dragging'));
    win.dispatchEvent(evtWith('mousemove', { clientX: 30, clientY: 25 })); h.update();
    assert.ok(transform().startsWith('translate(20px, 15px)'), transform());
    win.dispatchEvent(new Event('mouseup')); h.update();
    assert.strictEqual(win.listeners, 1);
    assert.ok(!stage().props.className.includes('--dragging'));

    // mask backdrop click closes, clicks that bubble from children do not; rest onClick still runs
    const seen = [];
    h.update({ ...base, onClick: () => seen.push(1) });
    const mask = h.tree;
    const n = closed.length;
    mask.props.onClick({ target: {}, currentTarget: maskNode });
    assert.strictEqual(closed.length, n);
    mask.props.onClick({ target: maskNode, currentTarget: maskNode });
    assert.deepStrictEqual([closed.length, seen.length], [n + 1, 2]);

    h.update({ ...base, open: false });
    assert.strictEqual(doc.body.style.overflow, '');
    assert.strictEqual(win.listeners, 0);
    assert.strictEqual(opener.focused, 1, 'focus returned');
  });
});

test('F-038 C-L6: Image opens the preview on click and Enter/Space, falls back on error, shows the hover overlay only when previewable', () => {
  withDom(() => {
    const h = mount('Image', { src: 'a.png', alt: 'A', fallback: 'fb.png' });
    const wrapper = () => h.byClass('joy-image-wrapper')[0];
    const previewEl = () => h.tree.props.children[1];
    assert.strictEqual(previewEl().props.open, false);
    assert.strictEqual(previewEl().props.src, 'a.png');
    assert.strictEqual(h.byClass('joy-image__overlay').length, 0);
    wrapper().props.onMouseEnter(); h.update();
    assert.strictEqual(h.byClass('joy-image__overlay').length, 1);
    wrapper().props.onMouseLeave(); h.update();
    assert.strictEqual(h.byClass('joy-image__overlay').length, 0);

    const other = reactKey('a');
    wrapper().props.onKeyDown(other); h.update();
    assert.deepStrictEqual([previewEl().props.open, other.calls.prevented], [false, 0]);
    const enter = reactKey('Enter');
    wrapper().props.onKeyDown(enter); h.update();
    assert.deepStrictEqual([previewEl().props.open, enter.calls.prevented], [true, 1]);
    previewEl().props.onClose(); h.update();
    assert.strictEqual(previewEl().props.open, false);
    wrapper().props.onKeyDown(reactKey(' ')); h.update();
    assert.strictEqual(previewEl().props.open, true);
    previewEl().props.onClose(); h.update();
    wrapper().props.onClick(); h.update();
    assert.strictEqual(previewEl().props.open, true);

    // fallback swaps the src (also used as the preview src); a preview={{src}} override wins
    const seen = [];
    const g = mount('Image', { src: 'a.png', fallback: 'fb.png', onError: () => seen.push(1), preview: { src: 'big.png' } });
    g.byClass('joy-image__img')[0].props.onError({}); g.update();
    assert.deepStrictEqual([g.byClass('joy-image__img')[0].props.src, g.tree.props.children[1].props.src, seen.length], ['fb.png', 'big.png', 1]);

    // preview=false: inert wrapper, no hover overlay, no ImagePreview
    const off = mount('Image', { src: 'a.png', preview: false });
    const w = off.byClass('joy-image-wrapper')[0];
    assert.deepStrictEqual([w.props.role, w.props.tabIndex, off.tree.props.children[1]], [undefined, undefined, false]);
    w.props.onMouseEnter(); off.update();
    assert.strictEqual(off.byClass('joy-image__overlay').length, 0);
  });
});

test('F-038 C-L6 fix: a consumer aria-label / aria-labelledby wins over the default fallback exactly like the Svelte twins, role and aria-modal stay owned', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const render = (name, props) => bare(renderToStaticMarkup(React.createElement(loadComponent(name)[name], { onClose() {}, ...props }, 'x')));
  for (const [name, fallback] of [['Modal', 'Dialog'], ['Drawer', 'Drawer']]) {
    const untitled = render(name, { open: true, 'aria-label': 'Einstellungen' });
    assert.ok(untitled.includes('aria-label="Einstellungen"') && !untitled.includes(`aria-label="${fallback}"`), `${name}: consumer aria-label replaces the fallback`);
    assert.ok(!untitled.includes('aria-labelledby'));
    const titled = render(name, { open: true, title: 'T', 'aria-label': 'Custom' });
    assert.match(titled, /aria-labelledby="[^"]+-title"/, `${name}: title-derived labelledby stays`);
    assert.ok(titled.includes('aria-label="Custom"'), `${name}: consumer aria-label is kept alongside (same as Svelte)`);
    const labelled = render(name, { open: true, 'aria-labelledby': 'mine' });
    assert.ok(labelled.includes('aria-labelledby="mine"') && labelled.includes(`aria-label="${fallback}"`), `${name}: consumer aria-labelledby wins, fallback label kept as in Svelte`);
    const owned = render(name, { open: true, role: 'alert', 'aria-modal': 'false' });
    assert.ok(owned.includes('role="dialog"') && owned.includes('aria-modal="true"'), `${name}: role/aria-modal cannot be clobbered`);
  }
  const preview = render('ImagePreview', { open: true, src: 'a.png', 'aria-label': 'Bildvorschau' });
  assert.ok(preview.includes('aria-label="Bildvorschau"') && !preview.includes('aria-label="Image preview"'));
  assert.ok(render('ImagePreview', { open: true, src: 'a.png' }).includes('aria-label="Image preview"'));
});

test('F-038 C-L6 fix: focus returns to the opener even when the dialog content autoFocuses (opener captured in the render that opens)', () => {
  const dialogProps = { Modal: { title: 'T' }, Drawer: { title: 'T' }, ImagePreview: { src: 'a.png' } };
  for (const name of ['Modal', 'Drawer', 'ImagePreview']) {
    withDom(({ doc, mk }) => {
      const opener = mk(); doc.activeElement = opener;
      const autoInput = mk();
      const base = { onClose() {}, ...dialogProps[name] };
      const h = mount(name, { ...base, open: false }, { refNode: (el) => (el.props.role === 'dialog' ? mk({ querySelector: () => autoInput }) : mk()) });
      h.flush();
      // render with open=true (twice, as StrictMode does), THEN the child's autoFocus moves focus during commit, THEN effects run
      h.rerender({ ...base, open: true });
      h.rerender();
      autoInput.focus();
      assert.strictEqual(doc.activeElement, autoInput);
      h.flush();
      // a later re-render while open must not re-capture the (now inner) focused element
      h.update({ ...base, open: true, onClose() {} });
      h.update({ ...base, open: false });
      assert.strictEqual(opener.focused, 1, `${name}: focus returned to the opener, not dropped to <body>`);
      assert.strictEqual(doc.activeElement, opener);
      // re-opening captures the current opener again
      const opener2 = mk(); doc.activeElement = opener2;
      h.rerender({ ...base, open: true }); autoInput.focus(); h.flush();
      h.update({ ...base, open: false });
      assert.strictEqual(opener2.focused, 1, `${name}: second open returns to its own opener`);
      h.unmount();
    });
  }
});

test('F-038 C-L6 fix: forwarded refs attach once per mount and are null while closed (no per-render churn, no cast)', () => {
  for (const name of ['Modal', 'Drawer', 'ImagePreview']) {
    withDom(({ mk }) => {
      const calls = [];
      const spy = (n) => calls.push(n === null ? null : 'node');
      const node = mk({ querySelector: () => mk() });
      const base = { onClose() {}, src: 'a.png', title: 'T' };
      const h = mount(name, { ...base, open: true }, { forwardedRef: spy, refNode: (el) => (el.props.role === 'dialog' ? node : mk()) });
      h.flush(); h.update(); h.update({ ...base, open: true, onClose() {} });
      assert.deepStrictEqual(calls, ['node'], `${name}: callback ref called once across re-renders`);
      h.update({ ...base, open: false });
      assert.deepStrictEqual(calls, ['node', null], `${name}: ref cleared when the dialog closes`);
      const objRef = { current: 'unset' };
      const g = mount(name, { ...base, open: false }, { forwardedRef: objRef, refNode: (el) => (el.props.role === 'dialog' ? mk({ querySelector: () => mk() }) : mk()) });
      assert.strictEqual(objRef.current, 'unset', 'closed dialogs never touch an object ref');
      g.rerender({ ...base, open: true });
      assert.ok(objRef.current, `${name}: object ref points at the dialog element while open`);
      g.update({ ...base, open: false });
      assert.strictEqual(objRef.current, null);
      h.unmount(); g.unmount();
    });
  }
  // Tooltip: wrapper is always rendered, ref stays attached
  withDom(({ mk }) => {
    const calls = []; const wrapper = mk();
    const h = mount('Tooltip', { title: 't', children: 'x' }, { forwardedRef: (n) => calls.push(n === null ? null : 'node'), refNode: () => wrapper });
    h.update(); h.update();
    assert.deepStrictEqual(calls, ['node']);
  });
});

test('F-038 C-L6 fix: ImagePreview clamps the index into range and closing mid-drag releases the window drag listeners', () => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const { ImagePreview } = loadComponent('ImagePreview');
  const html = bare(renderToStaticMarkup(React.createElement(ImagePreview, { open: true, items: ['a.png', 'b.png'], current: 5, onClose() {} })));
  assert.ok(html.includes('<div class="joy-image-preview-counter">2 / 2</div>') && html.includes('src="b.png"'), html);
  assert.ok(bare(renderToStaticMarkup(React.createElement(ImagePreview, { open: true, items: ['a.png', 'b.png'], current: -3, onClose() {} }))).includes('1 / 2'));

  withDom(({ win, mk }) => {
    const mask = mk({ querySelector: () => mk() });
    const base = { items: ['a.png'], onClose() {} };
    const h = mount('ImagePreview', { ...base, open: true }, { refNode: (el) => (el.props.role === 'dialog' ? mask : mk()) });
    h.flush();
    win.dispatchEvent(keydown('+')); h.update();
    h.byClass('joy-image-preview-stage')[0].props.onMouseDown({ clientX: 1, clientY: 1, preventDefault() {} }); h.update();
    assert.strictEqual(win.listeners, 3, 'keydown + mousemove + mouseup while dragging');
    h.update({ ...base, open: false });
    h.update();
    assert.strictEqual(win.listeners, 0, 'closing mid-drag detaches the drag listeners');
  });
});

test('F-038 C-L6 fix: neither Popconfirm twin uses the dead joy-button--primary class and every joy-button modifier they use exists in theme.css', () => {
  const css = readSrc('../../tokens/dist/theme.css');
  const twins = { react: readSrc('../src/Popconfirm.tsx'), svelte: readSrc('../../svelte/src/lib/Popconfirm.svelte') };
  for (const [side, src] of Object.entries(twins)) {
    assert.ok(!src.includes('joy-button--primary'), `${side} Popconfirm must not use joy-button--primary (no CSS)`);
    const used = [...new Set([...src.matchAll(/joy-button--[a-z]+/g)].map((m) => m[0]))];
    assert.ok(used.includes('joy-button--solid') && used.includes('joy-button--ghost'), `${side}: confirm is solid, cancel is ghost`);
    for (const cls of used) assert.ok(css.includes(`.${cls}`), `${side}: ${cls} is styled in theme.css`);
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// F-038 Wave 3 lane C-L7: MarkdownViewer, Splitter, Table, Timeline (rendered markup + handlers vs the Svelte contract)
// ---------------------------------------------------------------------------------------------------------------------

/** Static markup of `<name {...props} />` from the compiled React source; also asserts the component forwards refs. */
const ssr = (name, props) => {
  const React = requireFromHere('react');
  const { renderToStaticMarkup } = requireFromHere('react-dom/server');
  const Comp = loadComponent(name)[name];
  assert.strictEqual(Comp.$$typeof, Symbol.for('react.forward_ref'), `${name} must be a forwardRef component`);
  return renderToStaticMarkup(React.createElement(Comp, props));
};

test('F-038 C-L7: splitter-utils.ts and table-utils.ts are byte-identical to the Svelte helpers', () => {
  for (const f of ['splitter-utils.ts', 'table-utils.ts']) {
    assert.ok(readSrc(`../src/${f}`) === readSrc(`../../svelte/src/lib/${f}`), `${f} must not diverge from the Svelte copy`);
  }
});

test('F-038 C-L7: Table renders the Svelte class/aria contract (variants, aria-sort, hidden icons, region attributes, rest override)', () => {
  const columns = [{ key: 'a', title: 'A', sortable: true }, { key: 'b', title: 'B' }];
  const data = [{ a: 1, b: 2 }];
  const html = (props) => ssr('Table', { columns, data, ...props });

  const stack = html({});
  assert.ok(stack.startsWith('<div class="joy-table-container joy-table-container--responsive-stack"'), stack);
  assert.ok(stack.includes('<table class="joy-table joy-table--compact joy-table--responsive-stack">'), stack);
  assert.ok(!/tabindex="0"[^>]*class="joy-table-container|role="region"|joy-table--scroll/.test(stack), 'stack: no scroll region attributes');
  // sortable th: tabindex + aria-sort=none; non-sortable th: neither, and no role attribute anywhere on th
  assert.match(stack, /<th class="joy-table-th--sortable" style="text-align:left" tabindex="0" aria-sort="none">/);
  assert.match(stack, /<th style="text-align:left"><span>B<\/span><\/th>/);
  assert.ok(!/<th[^>]*role=/.test(stack));
  // sort icons are decorative: aria-hidden, never aria-label
  assert.ok(stack.includes('aria-hidden="true"') && !/<svg[^>]*aria-label/.test(stack), 'sort icons aria-hidden, no aria-label');

  const scroll = html({ variant: 'scroll' });
  assert.match(scroll, /^<div tabindex="0" role="region" aria-label="Scrollable table" class="joy-table-container joy-table-container--scroll">/);
  assert.ok(scroll.includes('<table class="joy-table joy-table--compact joy-table--scroll">'), scroll);
  assert.ok(!scroll.includes('responsive-stack'), 'variant=scroll forces off stack');

  assert.ok(html({ variant: 'stack', responsive: false }).includes('joy-table-container--responsive-stack'), 'variant=stack forces stack');
  assert.ok(!html({ responsive: 'scroll' }).includes('responsive-stack') && !html({ responsive: 'scroll' }).includes('role="region"'), 'responsive=scroll is the plain table, not the pinned variant');
  assert.ok(html({ density: 'normal' }).includes('joy-table--normal'));

  // rest wins over the scroll defaults (attributes are placed before {...rest}), className is merged, ids pass through
  const custom = html({ variant: 'scroll', 'aria-label': 'Prices', className: 'mine', id: 'tbl', 'data-x': '1' });
  assert.ok(custom.includes('aria-label="Prices"') && !custom.includes('Scrollable table'), custom);
  assert.ok(custom.includes('joy-table-container--scroll mine"') && custom.includes('id="tbl"') && custom.includes('data-x="1"'), custom);

  // controlled sort state shows through aria-sort and the sorted class
  const sorted = html({ sortKey: 'a', sortDirection: 'desc' });
  assert.ok(sorted.includes('class="joy-table-th--sortable joy-table-th--sorted-desc"') && sorted.includes('aria-sort="descending"'), sorted);
});

test('F-038 C-L7: Table header keyboard - Enter/Space sort like a click, other keys and icon-bubbled events are ignored, aria-sort follows', () => {
  const columns = [{ key: 'a', title: 'A', sortable: true }, { key: 'b', title: 'B', sortable: true }, { key: 'c', title: 'C' }];
  const sorts = [];
  const h = mount('Table', { columns, data: [], onSort: (k, d) => sorts.push([k, d]) });
  const ths = () => h.find((n) => n.type === 'th');
  const th = (i) => ths()[i];
  const el = {};
  const ev = (key, extra = {}) => reactKey(key, { target: el, currentTarget: el, ...extra });

  assert.strictEqual(th(2).props.tabIndex, undefined);
  assert.strictEqual(th(2).props['aria-sort'], undefined);
  assert.strictEqual(th(0).props.tabIndex, 0);
  assert.strictEqual(th(0).props['aria-sort'], 'none');

  const enter = ev('Enter');
  th(0).props.onKeyDown(enter);
  assert.strictEqual(enter.calls.prevented, 1);
  assert.deepStrictEqual(sorts, [['a', 'asc']]);
  h.rerender();
  assert.strictEqual(th(0).props['aria-sort'], 'ascending');
  assert.strictEqual(th(1).props['aria-sort'], 'none');

  const space = ev(' ');
  th(0).props.onKeyDown(space);
  assert.strictEqual(space.calls.prevented, 1, 'Space must not scroll the page');
  assert.deepStrictEqual(sorts.at(-1), ['a', 'desc']);
  h.rerender();
  assert.strictEqual(th(0).props['aria-sort'], 'descending');

  th(1).props.onKeyDown(ev('Enter'));
  assert.deepStrictEqual(sorts.at(-1), ['b', 'asc'], 'a new column starts ascending');

  const before = sorts.length;
  const tab = ev('Tab');
  th(0).props.onKeyDown(tab);
  th(0).props.onKeyDown(ev('Enter', { target: {} })); // bubbled from a child: the th onClick already handles pointer activation
  th(2).props.onKeyDown(ev('Enter')); // not sortable
  assert.strictEqual(tab.calls.prevented, 0, 'unhandled keys keep their default');
  assert.strictEqual(sorts.length, before);

  th(0).props.onClick();
  assert.deepStrictEqual(sorts.at(-1), ['a', 'asc'], 'click and key share the same cycle');
});

test('F-038 C-L7: Splitter renders the Svelte contract (separator aria, --joy-splitter-size panes, no inline width/height, repaired bounds)', () => {
  const html = (props) => ssr('Splitter', { firstPane: 'L', secondPane: 'R', ...props });

  const out = html({ defaultSplit: 30, className: 'mine', 'data-x': '1' });
  assert.match(out, /^<div class="joy-splitter joy-splitter--horizontal mine" role="group" aria-label="Resizable Splitter Panel" data-x="1">/);
  assert.ok(out.includes('<div class="joy-splitter__pane" style="--joy-splitter-size:30">L</div>'), out);
  assert.ok(out.includes('<div class="joy-splitter__pane" style="--joy-splitter-size:70">R</div>'), out);
  assert.match(out, /<div class="joy-splitter__bar " role="separator" aria-label="Resize panes" aria-orientation="vertical" aria-valuenow="30" aria-valuemin="10" aria-valuemax="90" tabindex="0"><\/div>/);
  assert.ok(!/style="[^"]*(width|height)/.test(out), 'panes are sized only through the custom property');
  assert.ok(html({ layout: 'vertical' }).includes('joy-splitter--vertical') && html({ layout: 'vertical' }).includes('aria-orientation="horizontal"'));
  // bounds actually enforced are what ARIA reports; NaN start falls back to the middle
  const repaired = html({ min: 90, max: 10, defaultSplit: 30 });
  assert.ok(repaired.includes('aria-valuemin="10"') && repaired.includes('aria-valuemax="90"') && repaired.includes('aria-valuenow="30"'), repaired);
  const wide = html({ min: -5, max: 300, defaultSplit: NaN });
  assert.ok(wide.includes('aria-valuemin="0"') && wide.includes('aria-valuemax="100"') && wide.includes('aria-valuenow="50"'), wide);
});

test('F-038 C-L7: Splitter keyboard, pointer capture drag and the stacked matchMedia flip', () => {
  withDom(({ win }) => {
    const sourceRoot = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 400, height: 200 }) };
    const calls = [];
    const media = { matches: false, listeners: new Set(), addEventListener(t, f) { this.listeners.add(f); }, removeEventListener(t, f) { this.listeners.delete(f); } };
    const queries = [];
    win.matchMedia = (q) => { queries.push(q); return media; };

    const h = mount('Splitter', { defaultSplit: 40, firstPane: 'a', secondPane: 'b' });
    h.flush();
    assert.deepStrictEqual(queries, ['(max-width: 640px)']);
    const bar = () => h.find((n) => n.props.role === 'separator')[0].props;
    const sizes = () => h.find((n) => n.props.className === 'joy-splitter__pane').map((n) => n.props.style['--joy-splitter-size']);
    assert.deepStrictEqual(sizes(), [40, 60]);
    assert.strictEqual(bar()['aria-orientation'], 'vertical');

    // keyboard: handled keys preventDefault, others do not
    const press = (key, extra = {}) => { const e = reactKey(key, extra); bar().onKeyDown(e); h.rerender(); return e; };
    assert.strictEqual(press('ArrowRight').calls.prevented, 1);
    assert.deepStrictEqual(sizes(), [45, 55]);
    press('ArrowLeft', { shiftKey: true });
    assert.deepStrictEqual(sizes(), [35, 65], 'Shift takes the large step');
    assert.strictEqual(press('ArrowDown').calls.prevented, 0, 'off-axis arrow is not handled');
    assert.strictEqual(press('Tab').calls.prevented, 0);
    assert.deepStrictEqual(sizes(), [35, 65]);
    press('End');
    assert.strictEqual(bar()['aria-valuenow'], 90);
    press('Home');
    assert.strictEqual(bar()['aria-valuenow'], 10);
    assert.strictEqual(press('ArrowLeft').calls.prevented, 1);
    assert.strictEqual(bar()['aria-valuenow'], 10, 'clamped at min');

    // pointer drag with capture: a secondary mouse button is ignored, move before down is ignored
    const captured = new Set();
    const target = (extra = {}) => ({ parentElement: sourceRoot, setPointerCapture: (id) => captured.add(id), hasPointerCapture: (id) => captured.has(id), releasePointerCapture: (id) => captured.delete(id), focus: () => calls.push('focus'), ...extra });
    const ptr = (over = {}) => { const e = reactKey('', { pointerType: 'mouse', button: 0, pointerId: 7, clientX: 300, clientY: 150, currentTarget: target(), ...over }); return e; };
    bar().onPointerMove(ptr());
    h.rerender();
    assert.strictEqual(bar()['aria-valuenow'], 10, 'no drag until pointerdown');
    bar().onPointerDown(ptr({ button: 2 })); h.rerender();
    assert.ok(!bar().className.includes('--active'));
    const down = ptr(); bar().onPointerDown(down); h.rerender();
    assert.strictEqual(down.calls.prevented, 1);
    assert.ok(bar().className.includes('joy-splitter__bar--active') && captured.has(7), 'active state set and the pointer captured on the bar');
    assert.deepStrictEqual(calls, ['focus']);
    bar().onPointerMove(ptr({ clientX: 300 })); h.rerender(); // (300-100)/400 = 50%
    assert.strictEqual(bar()['aria-valuenow'], 50);
    bar().onPointerMove(ptr({ clientX: 10 })); h.rerender(); // far left, clamped to min
    assert.strictEqual(bar()['aria-valuenow'], 10);
    bar().onPointerUp(ptr()); h.rerender();
    assert.ok(!bar().className.includes('--active') && !captured.has(7), 'pointerup ends the drag and releases capture');
    // lost capture / cancel also end a drag (no stuck resize state)
    for (const end of ['onLostPointerCapture', 'onPointerCancel']) {
      bar().onPointerDown(ptr()); h.rerender();
      assert.ok(bar().className.includes('--active'));
      bar()[end](ptr()); h.rerender();
      assert.ok(!bar().className.includes('--active'), `${end} ends the drag`);
    }
    const noWindowListeners = win.listeners;
    assert.strictEqual(noWindowListeners, 0, 'drag never touches window listeners');

    h.unmount();
    assert.strictEqual(media.listeners.size, 0, 'matchMedia listener removed on unmount');

    // stacked: on a narrow viewport the axis flips for both drag and keys, while the layout class stays the prop
    media.matches = true;
    const s = mount('Splitter', { defaultSplit: 40, firstPane: 'a', secondPane: 'b' });
    s.flush(); s.rerender();
    const sbar = () => s.find((n) => n.props.role === 'separator')[0].props;
    const spress = (key, extra = {}) => { const e = reactKey(key, extra); sbar().onKeyDown(e); s.rerender(); return e; };
    assert.strictEqual(sbar()['aria-orientation'], 'horizontal');
    assert.ok(s.byClass('joy-splitter--horizontal').length === 1, 'class follows the prop, not the stacked state');
    spress('Home'); spress('ArrowDown');
    assert.strictEqual(sbar()['aria-valuenow'], 15, 'ArrowDown is the forward key when stacked');
    assert.strictEqual(spress('ArrowRight').calls.prevented, 0);
    sbar().onPointerDown(ptr()); s.rerender();
    sbar().onPointerMove(ptr({ clientY: 150 })); s.rerender(); // (150-50)/200 = 50% via clientY
    assert.strictEqual(sbar()['aria-valuenow'], 50);
    // a live viewport change flips it back
    for (const f of media.listeners) f({ matches: false });
    s.rerender();
    assert.strictEqual(sbar()['aria-orientation'], 'vertical');
    s.unmount();
    assert.strictEqual(media.listeners.size, 0, 'matchMedia listener removed on unmount');
  });
});

test('F-038 C-L7: Timeline renders title/description/time classes with no inline style', () => {
  const items = [{ title: 'Shipped', description: 'Live', time: '9:00', status: 'success' }, { title: 'Draft' }];
  const out = ssr('Timeline', { items, className: 'mine', 'data-x': '1' });
  assert.ok(out.startsWith('<ul class="joy-timeline mine" role="list" data-x="1">'), out);
  assert.ok(out.includes('<div class="joy-timeline__dot joy-timeline__dot--success"></div>') && out.includes('joy-timeline__dot--primary'), out);
  assert.ok(out.includes('<div class="joy-timeline__title">Shipped</div><div class="joy-timeline__description">Live</div><div class="joy-timeline__time">9:00</div>'), out);
  assert.ok(out.includes('<div class="joy-timeline__title">Draft</div></div>'), 'no description/time nodes when absent');
  assert.ok(!out.includes('style='), 'no inline style');
  assert.ok(!/#64748b|fontWeight/.test(readSrc('../src/Timeline.tsx')), 'source keeps neither the foreign fallback nor inline weight');
});

test('F-038 C-L7: MarkdownViewer renders the Svelte contract and escapes raw HTML (no dangerouslySetInnerHTML)', () => {
  const md = '# T <b>x</b>\n\n> quote **bold**\n\n---\n\n```js\nconst a = "<i>";\n```\n\n| H1 | H2 |\n|---|---|\n| a | b |\n\n<script>alert(1)</script>';
  const out = ssr('MarkdownViewer', { content: md, className: 'mine', 'data-x': '1' });
  assert.ok(out.startsWith('<div class="joy-markdown mine" role="region" aria-label="Markdown content" data-x="1">'), out);
  assert.ok(out.includes('<blockquote>quote <strong>bold</strong></blockquote>'), out);
  assert.ok(out.includes('<hr/>') && !/<hr[^>]*style/.test(out), 'hr has no inline style');
  assert.ok(out.includes('<div class="joy-markdown__table-wrap"><table class="joy-markdown__table">') && !out.includes('overflow'), 'table wrapper is a class');
  // untrusted markup is text, never elements
  assert.ok(out.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && out.includes('&lt;b&gt;x&lt;/b&gt;') && !/<script|<b>|<i>/.test(out), out);
  // copy button + status region exactly as Svelte, Copy icon (aria-hidden, size 14)
  const pre = out.match(/<pre class="joy-markdown__pre">[\s\S]*?<\/pre>/)[0];
  assert.ok(pre.includes('<button type="button" class="joy-markdown__copy-btn" aria-label="Copy code to clipboard">'), pre);
  assert.ok(/<svg width="14" height="14"[^>]*aria-hidden="true"[\s\S]*<\/svg>Copy<\/button><span class="joy-markdown__status" role="status"><\/span><\/pre>$/.test(pre), pre);
  assert.ok(!ssr('MarkdownViewer', { content: '```\nx\n```', allowCopy: false }).includes('joy-markdown__copy-btn'));
  const src = readSrc('../src/MarkdownViewer.tsx');
  assert.ok(!src.includes('dangerouslySetInnerHTML') && !/#e2e8f0|style=\{\{/.test(src), 'no raw-HTML sink, no inline styles');
});

test('F-038 C-L7: MarkdownViewer copy - Check/Copied and live status only after a successful write, failure is silent, timer cleared on unmount', async () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const writes = [];
  let fail = false;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async (t) => { if (fail) throw new Error('denied'); writes.push(t); } } } });
  try {
    const h = mount('MarkdownViewer', { content: '```\nrun me\n```' });
    h.flush();
    const btn = () => h.find((n) => n.type === 'button')[0];
    const status = () => h.find((n) => n.props.role === 'status')[0];
    assert.strictEqual(status().props.children, '');
    fail = true;
    await btn().props.onClick(); h.rerender();
    assert.ok(!JSON.stringify(btn().props.children).includes('Copied'), 'a denied write does not claim success');
    fail = false;
    await btn().props.onClick(); h.rerender();
    assert.deepStrictEqual(writes, ['run me']);
    assert.ok(btn().props.children.includes('Copied'), 'button label flips');
    assert.strictEqual(status().props.children, 'Copied to clipboard');
    h.unmount(); // clears the 2s reset timer (otherwise this test would hold the process open)
    const late = mount('MarkdownViewer', { content: '```\nz\n```' });
    late.flush();
    const p = late.find((n) => n.type === 'button')[0].props.onClick();
    late.unmount();
    await p; // resolves after unmount: must not schedule a timer or set state
  } finally {
    if (saved) Object.defineProperty(globalThis, 'navigator', saved); else delete globalThis.navigator;
  }
});

test('F-038 C-L8: BarChart/LineChart/CandlestickChart render the token-class HUD, role=img summary and capped data table (rest + ref forwarded)', () => {
  const bar = ssr('BarChart', { series: [{ id: 'rev', name: 'Revenue', data: [{ x: 1, y: 5 }, { x: 2, y: 8.5 }] }], className: 'mine', 'data-x': '1' });
  assert.ok(bar.startsWith('<div tabindex="0" class="joy-chart mine" style="height:360px" role="region"'), bar);
  assert.ok(bar.includes('data-x="1"'), 'rest spread on the root');
  assert.ok(bar.includes('<span class="joy-chart__hud-value">Bar Series</span>'), 'default HUD value has no inline colour');
  assert.ok(bar.includes('<div class="joy-chart__canvas-container" role="img" aria-label="Bar chart, 1 series, 2 points">'), bar);
  assert.ok(bar.includes('<div class="joy-chart__sr"><table><caption>Revenue: 2 points</caption><thead><tr><th scope="col">Category</th><th scope="col">Value</th></tr></thead><tbody><tr><th scope="row">1</th><td>5.00</td></tr><tr><th scope="row">2</th><td>8.50</td></tr></tbody></table></div>'), bar);

  const override = ssr('LineChart', { series: [], 'aria-label': 'Custom label', style: { width: '50%' } });
  assert.ok(override.includes('aria-label="Custom label"') && override.includes('height:360px;width:50%'), override);
  assert.ok(override.includes('aria-label="Line chart, 0 series, 0 points"') && !override.includes('<table'), override);

  const big = Array.from({ length: 30 }, (_, i) => ({ x: i, y: i }));
  const line = ssr('LineChart', { series: [{ id: 's1', data: big }] });
  assert.ok(line.includes('<caption>s1: last 20 of 30 points</caption>') && line.includes('<th scope="col">Index</th>'), 'series id is the caption fallback; capped to 20');
  assert.strictEqual((line.match(/<tr><th scope="row">/g) || []).length, 20, 'exactly 20 data rows');
  assert.ok(line.includes('<th scope="row">29</th>') && !line.includes('<th scope="row">9</th>'), 'keeps the most recent rows');

  const t0 = Date.UTC(2026, 0, 2, 3, 4);
  const candle = ssr('CandlestickChart', { data: [{ time: t0, open: 10, high: 12, low: 9, close: 11, volume: 500 }] });
  assert.ok(candle.includes('<div class="joy-chart__canvas-container" role="img" aria-label="Candlestick chart, 1 candle">'), candle);
  assert.ok(candle.includes('<caption>Candlestick data: 1 candle</caption>'), candle);
  assert.ok(candle.includes('<th scope="col">Volume</th>') && candle.includes('<th scope="row">2026-01-02 03:04 UTC</th><td>10.00</td><td>12.00</td><td>9.00</td><td>11.00</td><td>500</td>'), candle);
  const noVol = ssr('CandlestickChart', { data: [{ time: t0, open: 10, high: 12, low: 9, close: 11 }] });
  assert.ok(!noVol.includes('Volume'), 'no Volume column without volume data');
  assert.ok(candle.includes('<span class="joy-chart__hud-value">Candlestick Feed</span>'));
});

test('F-038 C-L8: chart components carry no inline colour: HUD colours come from the shared build.js classes (bull/bear/accent)', () => {
  for (const f of ['BarChart', 'LineChart', 'CandlestickChart']) {
    const src = readSrc(`../src/${f}.tsx`);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|var\(--|color:/.test(src), `${f}.tsx has no colour literal / var() / inline color`);
  }
  const candle = readSrc('../src/CandlestickChart.tsx');
  assert.ok(candle.includes("'joy-chart__hud-value--bull' : 'joy-chart__hud-value--bear'"), 'close and change use bull/bear classes');
  assert.ok(!candle.includes('joy-color-'), 'no foreign --joy-color-* tokens');
  for (const f of ['BarChart', 'LineChart']) assert.ok(readSrc(`../src/${f}.tsx`).includes('joy-chart__hud-value--accent'), `${f} hover value uses the accent class`);
});
