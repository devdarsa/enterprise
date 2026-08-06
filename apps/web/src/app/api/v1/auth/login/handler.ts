import { NextResponse } from 'next/server';
import { auth } from '@darsa/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    // Call Better Auth native signInEmail API with asResponse: true
    const signInRes = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      asResponse: true,
    });

    return signInRes;
  } catch (err: any) {
    console.error('Custom Auth Login Error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Email atau kata sandi tidak valid.' },
      { status: 401 }
    );
  }
}
