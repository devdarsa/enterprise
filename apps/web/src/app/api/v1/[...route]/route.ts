import { NextRequest, NextResponse } from 'next/server';

// Import all API handlers
import * as health from '../health/handler';
import * as seedAccounts from '../auth/seed-default-accounts/handler';
import * as checkNik from '../auth/register-wali/check-nik/handler';
import * as sendOtp from '../auth/register-wali/send-otp/handler';
import * as verifyOtp from '../auth/register-wali/verify-otp/handler';
import * as absensiLogs from '../absensi/logs/handler';
import * as absensiQr from '../absensi/qr-session/handler';
import * as absensiScan from '../absensi/scan/handler';
import * as akademikRapor from '../akademik/rapor/handler';
import * as akun from '../akun/handler';
import * as auditLog from '../audit-log/handler';
import * as dashboardStats from '../dashboard/stats/handler';
import * as guru from '../guru/handler';
import * as jadwal from '../jadwal/handler';
import * as jadwalId from '../jadwal/[id]/handler';
import * as pelanggaran from '../pelanggaran/handler';
import * as pengumuman from '../pengumuman/handler';
import * as pengurus from '../pengurus/handler';
import * as perizinan from '../perizinan/handler';
import * as santri from '../santri/handler';
import * as santriId from '../santri/[id]/handler';
import * as santriPull from '../santri/pull-sync/handler';
import * as surat from '../surat/handler';
import * as tahunAjaran from '../tahun-ajaran/handler';
import * as waliAnak from '../wali/anak/handler';
import * as waliVerifikasiNik from '../wali/verifikasi-nik/handler';
import * as wilayah from '../wilayah/handler';

// Static route dispatch map
const handlers: Record<string, any> = {
  'health': health,
  'auth/seed-default-accounts': seedAccounts,
  'auth/register-wali/check-nik': checkNik,
  'auth/register-wali/send-otp': sendOtp,
  'auth/register-wali/verify-otp': verifyOtp,
  'absensi/logs': absensiLogs,
  'absensi/qr-session': absensiQr,
  'absensi/scan': absensiScan,
  'akademik/rapor': akademikRapor,
  'akun': akun,
  'audit-log': auditLog,
  'dashboard/stats': dashboardStats,
  'guru': guru,
  'jadwal': jadwal,
  'pelanggaran': pelanggaran,
  'pengumuman': pengumuman,
  'pengurus': pengurus,
  'perizinan': perizinan,
  'santri': santri,
  'santri/pull-sync': santriPull,
  'surat': surat,
  'tahun-ajaran': tahunAjaran,
  'wali/anak': waliAnak,
  'wali/verifikasi-nik': waliVerifikasiNik,
  'wilayah': wilayah,
};

async function handleDispatch(
  req: NextRequest,
  context: { params: Promise<{ route: string[] }> },
  method: string
) {
  const paramsResolved = await context.params;
  const routeParts = paramsResolved?.route || [];
  const path = routeParts.join('/');

  let handlerModule = handlers[path];
  let dynamicContext: any = undefined;

  // Handle dynamic parameters like /api/v1/santri/[id] or /api/v1/jadwal/[id]
  if (!handlerModule && routeParts.length >= 2) {
    if (routeParts[0] === 'santri' && routeParts.length === 2) {
      handlerModule = santriId;
      dynamicContext = { params: Promise.resolve({ id: routeParts[1] }) };
    } else if (routeParts[0] === 'jadwal' && routeParts.length === 2) {
      handlerModule = jadwalId;
      dynamicContext = { params: Promise.resolve({ id: routeParts[1] }) };
    }
  }

  if (handlerModule && typeof handlerModule[method] === 'function') {
    return handlerModule[method](req, dynamicContext || context);
  }

  return NextResponse.json(
    { success: false, message: `API Endpoint /api/v1/${path} (${method}) not found` },
    { status: 404 }
  );
}

export async function GET(req: NextRequest, ctx: any) {
  return handleDispatch(req, ctx, 'GET');
}

export async function POST(req: NextRequest, ctx: any) {
  return handleDispatch(req, ctx, 'POST');
}

export async function PUT(req: NextRequest, ctx: any) {
  return handleDispatch(req, ctx, 'PUT');
}

export async function PATCH(req: NextRequest, ctx: any) {
  return handleDispatch(req, ctx, 'PATCH');
}

export async function DELETE(req: NextRequest, ctx: any) {
  return handleDispatch(req, ctx, 'DELETE');
}
