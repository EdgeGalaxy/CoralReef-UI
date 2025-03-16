import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadFileToOSS } from '../lib/upload';

interface ModelFileUploadProps {
  onUploadComplete: (url: string) => void;
  label: string;
  directory: string;
  accept?: string;
  disabled?: boolean;
}

export function FileUpload({
  onUploadComplete,
  label,
  directory,
  accept = '.onnx,.rknn',
  disabled = false
}: ModelFileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const acceptedTypes = accept.split(',');
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`不支持的文件类型。请上传 ${accept} 格式的文件`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const result = await uploadFileToOSS(file, directory, (progress) =>
        setProgress(progress)
      );

      onUploadComplete(result.key);
      setError(null);
    } catch (err) {
      setError('上传过程中发生错误');
      console.error(err);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById(
      `file-${label}`
    ) as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        id={`file-${label}`}
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
        disabled={isUploading || disabled}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isUploading || disabled}
        onClick={triggerFileInput}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? '上传中...' : `上传${label}文件`}
      </Button>
      {isUploading && <Progress value={progress} className="h-2" />}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
