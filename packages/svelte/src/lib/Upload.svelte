<script lang="ts">
	import { Upload, File, Close } from '@joymify/icons';

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
		class?: string;
		style?: string;
		ref?: HTMLDivElement | null;
		onchange?: (files: UploadFile[]) => void;
		onremove?: (file: UploadFile) => void;
		[key: string]: any;
	}

	let {
		fileList = $bindable([]),
		dragger = true,
		accept = '*',
		multiple = false,
		disabled = false,
		title = 'Click or drag files to upload',
		hint = 'Support for single or bulk upload. Strictly adhere to data privacy standards.',
		class: className = '',
		style = '',
		ref = $bindable(null),
		onchange,
		onremove,
		...rest
	}: Props = $props();

	let isDragOver = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);

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

<div
	bind:this={ref}
	class="joy-upload {disabled ? 'joy-upload--disabled' : ''} {className}"
	{style}
	{...rest}
>
	<input
		bind:this={fileInputRef}
		type="file"
		{accept}
		{multiple}
		{disabled}
		hidden
		onchange={(e) => handleFiles(e.currentTarget.files)}
	/>

	{#if dragger}
		<div
			class="joy-upload-dragger {isDragOver ? 'joy-upload-dragger--dragover' : ''}"
			onclick={() => !disabled && fileInputRef?.click()}
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			role="button"
			tabindex={disabled ? -1 : 0}
			onkeydown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && fileInputRef?.click()}
		>
			<span class="joy-upload-dragger__icon">
				<Upload />
			</span>
			<p class="joy-upload-dragger__text">{title}</p>
			<p class="joy-upload-dragger__hint">{hint}</p>
		</div>
	{:else}
		<button
			type="button"
			class="joy-button joy-button--outline joy-button--md"
			onclick={() => !disabled && fileInputRef?.click()}
			{disabled}
		>
			<span class="joy-button__icon">
				<Upload />
			</span>
			<span class="joy-button__label">Upload File</span>
		</button>
	{/if}

	{#if fileList.length > 0}
		<ul class="joy-upload-list">
			{#each fileList as file (file.id)}
				<li class="joy-upload-list__item">
					<span class="joy-upload-list__item-icon">
						<File />
					</span>
					<span class="joy-upload-list__item-info">
						{file.name}{#if file.size} ({formatBytes(file.size)}){/if}
					</span>
					<button
						type="button"
						class="joy-upload-list__item-remove"
						aria-label="Remove {file.name}"
						onclick={() => removeFile(file)}
					>
						<Close />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

