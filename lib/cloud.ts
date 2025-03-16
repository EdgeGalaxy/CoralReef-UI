import OSS from 'ali-oss';
import crypto from 'crypto';

export interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  stsToken?: string;
}

// Initialize OSS client
export const createOSSClient = (config: OSSConfig): OSS => {
  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket
  });
};

// 添加计算文件哈希值的函数
function calculateFileHash(buffer: Buffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(new Uint8Array(buffer));
  // 只取哈希值的前12位
  return hash.digest('hex').slice(0, 12);
}

// 使用 STS 获取带签名的 URL
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

// 使用 STS 上传文件到 OSS
export async function uploadToOSS(
  buffer: Buffer,
  config: OSSConfig,
  fileExt: string,
  directory: string = 'tmp'
): Promise<{ url: string; key: string }> {
  try {
    const client = createOSSClient(config);
    // 使用文件哈希值作为文件名
    const fileHash = calculateFileHash(buffer);
    const key = `${directory}/${fileHash}.${fileExt}`;

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

// 使用 STS 从 OSS 下载文件
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

// 使用 STS 从 OSS 删除文件
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
