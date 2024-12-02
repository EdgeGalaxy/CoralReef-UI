import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';

export interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}

// Initialize OSS client
const createOSSClient = (config: OSSConfig): OSS => {
  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket
  });
};

// Upload file to OSS
export async function uploadToOSS(
  buffer: Buffer,
  config: OSSConfig,
  fileExt: string,
  directory: string = 'tmp'
): Promise<{ url: string; key: string }> {
  try {
    const client = createOSSClient(config);
    const key = `${directory}/${uuidv4()}.${fileExt}`;

    const result = await client.put(key, buffer);

    return {
      url: result.url,
      key: result.name
    };
  } catch (error) {
    console.error('Upload to OSS failed:', error);
    throw new Error('Failed to upload file to OSS');
  }
}

// Download file from OSS
export async function downloadFromOSS(
  key: string,
  config: OSSConfig
): Promise<Blob> {
  try {
    const client = createOSSClient(config);
    const result = await client.get(key);
    return new Blob([result.content]);
  } catch (error) {
    console.error('Download from OSS failed:', error);
    throw new Error('Failed to download file from OSS');
  }
}

// Get temporary URL for file
export async function getSignedUrl(
  key: string,
  config: OSSConfig,
  expires: number = 3600
): Promise<string> {
  try {
    const client = createOSSClient(config);
    const url = await client.signatureUrl(key, {
      expires
    });
    return url;
  } catch (error) {
    console.error('Generate signed URL failed:', error);
    throw new Error('Failed to generate signed URL');
  }
}

// Delete file from OSS
export async function deleteFromOSS(
  key: string,
  config: OSSConfig
): Promise<void> {
  try {
    const client = createOSSClient(config);
    await client.delete(key);
  } catch (error) {
    console.error('Delete from OSS failed:', error);
    throw new Error('Failed to delete file from OSS');
  }
}
