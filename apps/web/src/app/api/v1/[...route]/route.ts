import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
import * as konfigurasiJabatan from '../konfigurasi/jabatan/handler';
import * as pelanggaran from '../pelanggaran/handler';
import * as pengumuman from '../pengumuman/handler';
import * as pengurus from '../pengurus/handler';
import * as perizinan from '../perizinan/handler';
import * as santri from '../santri/handler';
import * as santriId from '../santri/[id]/handler';
import * as santriMutasi from '../santri/[id]/mutasi/handler';
import * as santriPull from '../santri/pull-sync/handler';
import * as surat from '../surat/handler';
import * as tahunAjaran from '../tahun-ajaran/handler';
import * as waliAnak from '../wali/anak/handler';
import * as waliVerifikasiNik from '../wali/verifikasi-nik/handler';
import * as wilayah from '../wilayah/handler';
import * as authLogin from '../auth/login/handler';
import * as authMe from '../auth/me/handler';
import * as asrama from '../asrama/handler';
import * as instansi from '../instansi/handler';
import * as roles from '../roles/handler';
import * as arsip from '../arsip/handler';

type ApiHandlerModule = Record<string, (...args: any[]) => Promise<Response>>;

// Static route dispatch map
const handlers: Record<string, ApiHandlerModule> = {
  'health': health as unknown as ApiHandlerModule,
  'auth/login': authLogin as unknown as ApiHandlerModule,
  'auth/me': authMe as unknown as ApiHandlerModule,
  'auth/seed-default-accounts': seedAccounts as unknown as ApiHandlerModule,
  'auth/register-wali/check-nik': checkNik as unknown as ApiHandlerModule,
  'auth/register-wali/send-otp': sendOtp as unknown as ApiHandlerModule,
  'auth/register-wali/verify-otp': verifyOtp as unknown as ApiHandlerModule,
  'absensi/logs': absensiLogs as unknown as ApiHandlerModule,
  'absensi/qr-session': absensiQr as unknown as ApiHandlerModule,
  'absensi/scan': absensiScan as unknown as ApiHandlerModule,
  'akademik/rapor': akademikRapor as unknown as ApiHandlerModule,
  'akun': akun as unknown as ApiHandlerModule,
  'arsip': arsip as unknown as ApiHandlerModule,
  'asrama': asrama as unknown as ApiHandlerModule,
  'audit-log': auditLog as unknown as ApiHandlerModule,
  'dashboard/stats': dashboardStats as unknown as ApiHandlerModule,
  'guru': guru as unknown as ApiHandlerModule,
  'instansi': instansi as unknown as ApiHandlerModule,
  'jadwal': jadwal as unknown as ApiHandlerModule,
  'konfigurasi/jabatan': konfigurasiJabatan as unknown as ApiHandlerModule,
  'pelanggaran': pelanggaran as unknown as ApiHandlerModule,
  'pengumuman': pengumuman as unknown as ApiHandlerModule,
  'pengurus': pengurus as unknown as ApiHandlerModule,
  'perizinan': perizinan as unknown as ApiHandlerModule,
  'roles': roles as unknown as ApiHandlerModule,
  'santri': santri as unknown as ApiHandlerModule,
  'santri/pull-sync': santriPull as unknown as ApiHandlerModule,
  'surat': surat as unknown as ApiHandlerModule,
  'tahun-ajaran': tahunAjaran as unknown as ApiHandlerModule,
  'wali/anak': waliAnak as unknown as ApiHandlerModule,
  'wali/verifikasi-nik': waliVerifikasiNik as unknown as ApiHandlerModule,
  'wilayah': wilayah as unknown as ApiHandlerModule,
};

type RouteParamsContext = { params: Promise<{ route: string[] }> };

async function handleDispatch(
  req: NextRequest,
  context: RouteParamsContext,
  method: string
) {
  const paramsResolved = await context.params;
  const routeParts = paramsResolved?.route || [];
  const path = routeParts.join('/');

  let handlerModule = handlers[path];
  let dynamicContext: unknown = undefined;

  // Handle dynamic parameters like /api/v1/santri/[id] or /api/v1/santri/[id]/mutasi or /api/v1/jadwal/[id]
  if (!handlerModule && routeParts.length >= 2) {
    if (routeParts[0] === 'santri' && routeParts.length === 2) {
      handlerModule = santriId as ApiHandlerModule;
      dynamicContext = { params: Promise.resolve({ id: routeParts[1] }) };
    } else if (routeParts[0] === 'santri' && routeParts.length === 3 && routeParts[2] === 'mutasi') {
      handlerModule = santriMutasi as ApiHandlerModule;
      dynamicContext = { params: Promise.resolve({ id: routeParts[1] }) };
    } else if (routeParts[0] === 'jadwal' && routeParts.length === 2) {
      handlerModule = jadwalId as ApiHandlerModule;
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

export async function GET(req: NextRequest, ctx: RouteParamsContext) {
  return handleDispatch(req, ctx, 'GET');
}

export async function POST(req: NextRequest, ctx: RouteParamsContext) {
  return handleDispatch(req, ctx, 'POST');
}

export async function PUT(req: NextRequest, ctx: RouteParamsContext) {
  return handleDispatch(req, ctx, 'PUT');
}

export async function PATCH(req: NextRequest, ctx: RouteParamsContext) {
  return handleDispatch(req, ctx, 'PATCH');
}

export async function DELETE(req: NextRequest, ctx: RouteParamsContext) {
  return handleDispatch(req, ctx, 'DELETE');
}
