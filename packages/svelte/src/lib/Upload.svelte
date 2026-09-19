<script lang="ts">
	export interface UploadFile {
		id: string;
		name: string;
		size?: number;
		status?: 'uploading' | 'done' | 'error';
		percent?: number;
	}

	interface Props {
		fileList?: UploadFile[];
		dragger?: boolean;
		accept?: string;
		multiple?: boolean;
		disabled?: boolean;
		title?: string;
		hint?: string;
		onchange?: (files: UploadFile[]) => void;
		onremove?: (file: UploadFile) => void;
	}

	let {
		fileList = $bindable([]),
		dragger = true,
		accept = '*',
		multiple = false,
		disabled = false,
		title = 'Click or drag files to upload',
		hint = 'Support for single or bulk upload. Strictly adhere to data privacy standards.',
		onchange,
		onremove
	}: Props = $props();

	let isDragOver = $state(false);
	let fileInputRef: HTMLInputElement | null = $state(null);

	function handleFiles(files: FileList | null) {
		if (!files || disabled) return;
		const newFiles: UploadFile[] = Array.from(files).map((f, i) => ({
			id: `${Date.now()}-${i}-${f.name}`,
			name: f.name,
			size: f.size,
			status: 'done',
			percent: 100
		}));
		fileList = [...fileList, ...newFiles];
		onchange?.(fileList);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		if (e.dataTransfer && e.dataTransfer.files) {
			handleFiles(e.dataTransfer.files);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled) isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function removeFile(file: UploadFile) {
		fileList = fileList.filter((f) => f.id !== file.id);
		onremove?.(file);
		onchange?.(fileList);
	}

	function formatBytes(bytes?: number) {
		if (!bytes) return '';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
	}
</script>

<div class="joy-upload">
	<input
		bind:this={fileInputRef}
		type="file"
		{accept}
		{multiple}
		{disabled}
		style="display: none;"
		onchange={(e) => handleFiles(e.currentTarget.files)}
	/>

	{#if dragger}
		<div
			class="joy-upload-dragger"
			class:joy-upload-dragger--dragover={isDragOver}
			onclick={() => fileInputRef?.click()}
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			role="button"
			tabindex="0"
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef?.click()}
		>
			<div class="joy-upload-dragger__icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="17 8 12 3 7 8"></polyline>
					<line x1="12" y1="3" x2="12" y2="15"></line>
				</svg>
			</div>
			<div class="joy-upload-dragger__text">{title}</div>
			<div class="joy-upload-dragger__hint">{hint}</div>
		</div>
	{:else}
		<button
			type="button"
			class="joy-button joy-button--outline joy-button--md"
			onclick={() => fileInputRef?.click()}
			{disabled}
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
				<polyline points="17 8 12 3 7 8"></polyline>
				<line x1="12" y1="3" x2="12" y2="15"></line>
			</svg>
			Upload File
		</button>
	{/if}

	{#if fileList.length > 0}
		<div class="joy-upload-list">
			{#each fileList as file (file.id)}
				<div class="joy-upload-list__item">
					<div class="joy-upload-list__item-info">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-brand-primary, #7c3aed); flex-shrink: 0;">
							<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
							<polyline points="13 2 13 9 20 9"></polyline>
						</svg>
						<span style="font-weight: 500;">{file.name}</span>
						{#if file.size}
							<span style="color: var(--joy-color-text-muted, #64748b); font-size: 0.75rem;">({formatBytes(file.size)})</span>
						{/if}
					</div>
					<button
						type="button"
						class="joy-upload-list__item-remove"
						aria-label="Remove file"
						onclick={() => removeFile(file)}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
