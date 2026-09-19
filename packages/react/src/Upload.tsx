import React, { useState, useRef } from 'react';

export interface UploadFile {
  id: string;
  name: string;
  size?: number;
  status?: 'uploading' | 'done' | 'error';
  percent?: number;
}

export interface UploadProps {
  fileList?: UploadFile[];
  dragger?: boolean;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  title?: string;
  hint?: string;
  className?: string;
  onChange?: (files: UploadFile[]) => void;
  onRemove?: (file: UploadFile) => void;
}

export const Upload: React.FC<UploadProps> = ({
  fileList: externalFileList,
  dragger = true,
  accept = '*',
  multiple = false,
  disabled = false,
  title = 'Click or drag files to upload',
  hint = 'Support for single or bulk upload. Strictly adhere to data privacy standards.',
  className = '',
  onChange,
  onRemove
}) => {
  const [internalFiles, setInternalFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentFiles = externalFileList !== undefined ? externalFileList : internalFiles;

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return;
    const newFiles: UploadFile[] = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      size: f.size,
      status: 'done',
      percent: 100
    }));
    const updated = [...currentFiles, ...newFiles];
    if (externalFileList === undefined) {
      setInternalFiles(updated);
    }
    onChange?.(updated);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (file: UploadFile) => {
    const updated = currentFiles.filter((f) => f.id !== file.id);
    if (externalFileList === undefined) {
      setInternalFiles(updated);
    }
    onRemove?.(file);
    onChange?.(updated);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={`joy-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {dragger ? (
        <div
          className={`joy-upload-dragger ${isDragOver ? 'joy-upload-dragger--dragover' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
        >
          <div className="joy-upload-dragger__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="joy-upload-dragger__text">{title}</div>
          <div className="joy-upload-dragger__hint">{hint}</div>
        </div>
      ) : (
        <button
          type="button"
          className="joy-button joy-button--outline joy-button--md"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload File
        </button>
      )}

      {currentFiles.length > 0 && (
        <div className="joy-upload-list">
          {currentFiles.map((file) => (
            <div key={file.id} className="joy-upload-list__item">
              <div className="joy-upload-list__item-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--joy-color-brand-primary, #7c3aed)', flexShrink: 0 }}>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                <span style={{ fontWeight: 500 }}>{file.name}</span>
                {file.size && (
                  <span style={{ color: 'var(--joy-color-text-muted, #64748b)', fontSize: '0.75rem' }}>
                    ({formatBytes(file.size)})
                  </span>
                )}
              </div>
              <button
                type="button"
                className="joy-upload-list__item-remove"
                aria-label="Remove file"
                onClick={() => handleRemove(file)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Upload.displayName = 'Upload';
