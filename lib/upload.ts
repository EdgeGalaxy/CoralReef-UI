interface UploadResponse {
  url: string;
  key: string;
}

export async function uploadFileToOSS(
  file: File,
  directory: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);

    xhr.upload.addEventListener('progress', (e) => {
      if (onProgress && e.lengthComputable) {
        const percentCompleted = Math.round((e.loaded * 100) / e.total);
        onProgress(percentCompleted);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}
