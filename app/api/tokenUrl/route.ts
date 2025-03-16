// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';

import { getSignedUrl, OSSConfig } from '../../../lib/cloud';

const ossConfig: OSSConfig = {
  region: process.env.OSS_REGION!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET_NAME!
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return NextResponse.json({ message: '缺少key参数' }, { status: 400 });
  }

  try {
    const signedUrl = await getSignedUrl(key, ossConfig, 3600);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('生成签名URL失败:', error);
    return NextResponse.json({ message: '生成签名URL失败' }, { status: 500 });
  }
}
