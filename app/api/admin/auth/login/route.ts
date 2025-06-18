import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // TODO: 这里需要替换为实际的用户验证逻辑
    if (username === 'admin' && password === 'admin') {
      // 创建session
      const sessionToken = Math.random().toString(36).substring(2);

      // 设置cookie
      cookies().set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // 24小时过期
        maxAge: 60 * 60 * 24
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
