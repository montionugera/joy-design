// Type-level test, checked by `pnpm check` (no runtime). A line with @ts-expect-error must fail to compile.
import type { ComponentProps } from 'svelte';
import { Mascot, assetUrl, POSES, MASCOTS } from '../../src/index.js';
import type { MascotId, MascotPose } from '../../src/index.js';
import { Mascot as ReactMascot, assetUrl as reactAssetUrl } from '../../src/react.js';
import type { MascotId as ReactMascotId, MascotPose as ReactMascotPose } from '../../src/react.js';

const id: MascotId = 'rex';
const pose: MascotPose = 'try-again';
const reactId: ReactMascotId = id;
const reactPose: ReactMascotPose = pose;

const ok: ComponentProps<typeof Mascot> = { name: 'rex', pose: 'cheer' };
// @ts-expect-error unknown character
const badName: ComponentProps<typeof Mascot> = { name: 'rexx' };
// @ts-expect-error unknown pose
const badPose: ComponentProps<typeof Mascot> = { pose: 'cheerr' };

assetUrl('rex', 'cheer');
// @ts-expect-error unknown character
assetUrl('rexx', 'cheer');
// @ts-expect-error unknown pose
assetUrl('rex', 'cheerr');
reactAssetUrl(reactId, reactPose, 2);
// @ts-expect-error unknown character
reactAssetUrl('rexx', 'cheer');

type ReactProps = Parameters<typeof ReactMascot>[0];
const reactOk: ReactProps = { name: 'luna', pose: 'sleepy' };
// @ts-expect-error unknown character
const reactBadName: ReactProps = { name: 'rexx' };
// @ts-expect-error unknown pose
const reactBadPose: ReactProps = { pose: 'cheerr' };

const poses: readonly MascotPose[] = POSES;
const ids: readonly MascotId[] = MASCOTS.map((m) => m.id);

export { ok, badName, badPose, reactOk, reactBadName, reactBadPose, poses, ids };
