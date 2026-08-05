import { NextResponse } from 'next/server';

/**
 * DEPRECATED — Endpoint Simulasi Darsa Enterprise
 * Seluruh data simulasi telah digantikan oleh Database & API Real Darsa Enterprise.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Endpoint simulasi telah dihapus secara permanen. Seluruh modul Darsa Enterprise telah menggunakan Database PostgreSQL Real.',
    },
    { status: 410 }
  );
}

export async function POST() {
  return GET();
}
