<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export type CourtSurface = 'clay' | 'grass' | 'hard' | 'indoor';

	export interface ShotPoint {
		id?: string | number;
		x: number;
		y: number;
		outcome: 'in' | 'out' | 'net';
	}

	export interface Trajectory {
		from: { x: number; y: number };
		to: { x: number; y: number };
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		surface?: CourtSurface;
		interactive?: boolean;
		title?: string;
		badge?: string;
		shots?: ShotPoint[];
		trajectories?: Trajectory[];
		oncourtclick?: (coords: { x: number; y: number }) => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		surface = 'hard',
		interactive = false,
		title = 'Court Radar',
		badge,
		shots = [],
		trajectories = [],
		oncourtclick,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let svgRef = $state<SVGSVGElement | null>(null);

	function handleClick(e: MouseEvent) {
		if (!interactive || !oncourtclick || !svgRef) return;
		const rect = svgRef.getBoundingClientRect();
		const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
		const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
		oncourtclick({ x, y });
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!interactive || !oncourtclick) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			oncourtclick({ x: 50, y: 50 });
		}
	}
</script>

<div
	bind:this={ref}
	class="joy-court-radar joy-court-radar--surface-{surface} {interactive ? 'joy-court-radar--interactive' : ''} {className}"
	{...rest}
>
	<div class="joy-court-radar__header">
		<h4 class="joy-court-radar__title">{title}</h4>
		{#if badge}
			<span class="joy-court-radar__badge">{badge}</span>
		{/if}
	</div>

	<div class="joy-court-radar__court-wrap">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<svg
			bind:this={svgRef}
			class="joy-court-radar__svg"
			viewBox="0 0 360 480"
			role={interactive ? 'button' : 'img'}
			aria-label={title}
			tabindex={interactive ? 0 : undefined}
			onclick={handleClick}
			onkeydown={handleKeyDown}
		>
			<!-- Court background -->
			<rect x="0" y="0" width="360" height="480" rx="8" class="joy-court-radar__court-bg" />

			<!-- Outer doubles boundary -->
			<rect x="40" y="40" width="280" height="400" class="joy-court-radar__line" />

			<!-- Singles sidelines -->
			<line x1="75" y1="40" x2="75" y2="440" class="joy-court-radar__line" />
			<line x1="285" y1="40" x2="285" y2="440" class="joy-court-radar__line" />

			<!-- Service lines -->
			<line x1="75" y1="130" x2="285" y2="130" class="joy-court-radar__line" />
			<line x1="75" y1="350" x2="285" y2="350" class="joy-court-radar__line" />

			<!-- Center service line -->
			<line x1="180" y1="130" x2="180" y2="350" class="joy-court-radar__line" />

			<!-- Center marks -->
			<line x1="180" y1="40" x2="180" y2="50" class="joy-court-radar__line" />
			<line x1="180" y1="430" x2="180" y2="440" class="joy-court-radar__line" />

			<!-- Net -->
			<line x1="30" y1="240" x2="330" y2="240" class="joy-court-radar__net" />

			<!-- Trajectories -->
			{#each trajectories as traj}
				<line
					x1={(traj.from.x / 100) * 360}
					y1={(traj.from.y / 100) * 480}
					x2={(traj.to.x / 100) * 360}
					y2={(traj.to.y / 100) * 480}
					class="joy-court-radar__trajectory"
				/>
			{/each}

			<!-- Shot points -->
			{#each shots as shot, i (shot.id ?? i)}
				<circle
					cx={(shot.x / 100) * 360}
					cy={(shot.y / 100) * 480}
					r="5"
					class="joy-court-radar__shot-point joy-court-radar__shot-point--{shot.outcome}"
				/>
			{/each}
		</svg>
	</div>
</div>
