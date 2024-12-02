import { NextRequest, NextResponse } from 'next/server';
import { uploadToOSS, OSSConfig } from '../../../lib/cloud';

const ossConfig = {
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET
} as OSSConfig;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_FILE_SIZE) || 300; // 300MB
    if (file.size > MAX_FILE_SIZE * 1024 * 1024) {
      return NextResponse.json(
        { error: `文件大小不能超过${MAX_FILE_SIZE}MB` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToOSS(
      buffer,
      ossConfig,
      file.name.split('.').pop() || ''
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json({ error: '上传文件失败' }, { status: 500 });
  }
}
