import * as React from 'react';
import { Upload as UploadIcon, File as FileIcon, Close as CloseIcon } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface UploadFile {
  id: string;
  name: string;
  size?: number;
  status?: 'uploading' | 'done' | 'error';
  percent?: number;
}

export interface UploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  fileList?: UploadFile[];
  dragger?: boolean;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  title?: string;
  hint?: string;
  onChange?: (files: UploadFile[]) => void;
  onRemove?: (file: UploadFile) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      fileList: externalFileList,
      dragger = true,
      accept = '*',
      multiple = false,
      disabled = false,
      title = 'Click or drag files to upload',
      hint = 'Support for single or bulk upload. Strictly adhere to data privacy standards.',
      className = '',
      style,
      onChange,
      onRemove,
      ...rest
    },
    ref
  ) => {
    const [internalFiles, setInternalFiles] = React.useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
      if (disabled) return;
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const handleRemove = (file: UploadFile) => {
      if (disabled) return;
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
      <div
        ref={ref}
        className={cx('joy-upload', disabled && 'joy-upload--disabled', className)}
        style={style}
        {...rest}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          hidden
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {dragger ? (
          <div
            className={cx('joy-upload-dragger', isDragOver && 'joy-upload-dragger--dragover')}
            onClick={() => !disabled && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) =>
              !disabled && (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()
            }
          >
            <span className="joy-upload-dragger__icon">
              <UploadIcon width={32} height={32} />
            </span>
            <p className="joy-upload-dragger__text">{title}</p>
            <p className="joy-upload-dragger__hint">{hint}</p>
          </div>
        ) : (
          <button
            type="button"
            className="joy-button joy-button--outline joy-button--md"
            onClick={() => !disabled && fileInputRef.current?.click()}
            disabled={disabled}
          >
            <span className="joy-button__icon">
              <UploadIcon width={16} height={16} />
            </span>
            <span className="joy-button__label">Upload File</span>
          </button>
        )}

        {currentFiles.length > 0 && (
          <ul className="joy-upload-list">
            {currentFiles.map((file) => (
              <li key={file.id} className="joy-upload-list__item">
                <span className="joy-upload-list__item-icon">
                  <FileIcon width={16} height={16} />
                </span>
                <span className="joy-upload-list__item-info">
                  <span>{file.name}</span>
                  {file.size ? ` (${formatBytes(file.size)})` : ''}
                </span>
                <button
                  type="button"
                  className="joy-upload-list__item-remove"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => handleRemove(file)}
                >
                  <CloseIcon width={14} height={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

Upload.displayName = 'Upload';
