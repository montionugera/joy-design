// Prints {"cards": {"2": "<html>", ..., "7": "<html>"}}: the SSR markup of the REAL Svelte PricingMatrix (card grid branch)
// holding 2 to 7 real PricingCard children (the third is featured). Used by tests/landing-pricing-grid.spec.ts in a child
// process (the SSR helpers register their own module hooks). Reads sources only; never builds or writes anything.
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const { renderSvelte } = await import(pathToFileURL(path.join(root, 'packages/svelte/test/helpers/render-svelte.js')).href);

const plans = [
  { title: 'Developer', price: '$0', description: 'Core tokens and icons.', features: ['138 vector icons', 'Community support'], ctaText: 'Start free' },
  { title: 'Starter', price: '$49', description: 'Base components for a small team.', features: ['Base components', 'Email support', 'Two seats'], ctaText: 'Start trial' },
  { title: 'Professional', price: '$149', description: 'The full financial suite.', features: ['Everything in Starter', 'Dense financial tables', 'Priority support'], ctaText: 'Upgrade to Pro', featured: true, badge: 'Most popular' },
  { title: 'Team', price: '$899', description: 'Shared themes and seats.', features: ['Unlimited seats', 'Theme export'], ctaText: 'Contact sales' },
  { title: 'Desk', price: '$1,499', description: 'Seats for a whole desk.', features: ['Named manager', 'Audit log'], ctaText: 'Talk to us' },
  { title: 'Fund', price: '$2,999', description: 'For funds with many desks.', features: ['Single sign-on', 'Custom terms'], ctaText: 'Book a call' },
  { title: 'Enterprise', price: 'Custom', description: 'Volume pricing and support.', features: ['Dedicated support', 'Custom terms'], ctaText: 'Contact us' },
];
const cards = {};
for (let n = 2; n <= 7; n++) {
  const inner = (await Promise.all(plans.slice(0, n).map((p) => renderSvelte('PricingCard', p)))).join('');
  cards[n] = (await renderSvelte('PricingMatrix', { label: 'Pricing plans' }, { children: inner })).replace(/<!--[\s\S]*?-->/g, '');
}
process.stdout.write(JSON.stringify({ cards }));
