// Reusable file upload component
import { useState, useRef } from 'react';
import { Button, Label, Text } from '@medusajs/ui';
import { XMarkMini } from '@medusajs/icons';
import { formatFileSize } from '../../utils/form-helpers';
import { FILE_TYPE_LABELS } from '../../constants';

interface FileUploadProps {
  label: string;
  name: string;
  accept: string;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  hint?: string;
}

export const FileUpload = ({ label, name, accept, onChange, error, disabled, hint }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    onChange(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileTypeLabel = (file: File): string => {
    return FILE_TYPE_LABELS[file.type] || file.type;
  };

  return (
    <div className="registration-field-full">
      <Label htmlFor={name}>{label}</Label>
      {hint && <Text className="registration-hint">{hint}</Text>}
      
      <input
        ref={inputRef}
        type="file"
        id={name}
        name={name}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      
      {!selectedFile ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="mt-2"
        >
          Choose File
        </Button>
      ) : (
        <div className="file-upload-preview">
          <div className="file-upload-info">
            <Text size="small" weight="plus">
              {selectedFile.name}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {getFileTypeLabel(selectedFile)} • {formatFileSize(selectedFile.size)}
            </Text>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="file-upload-remove"
            aria-label="Remove file"
          >
            <XMarkMini />
          </button>
        </div>
      )}
      
      {error && (
        <Text className="registration-error">
          {error}
        </Text>
      )}
    </div>
  );
};
