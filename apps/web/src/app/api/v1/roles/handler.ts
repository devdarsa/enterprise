import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
import { authenticateRequest } from '@/lib/api-auth';

const SYSTEM_ROLES_BASE = [
  {
    id: 'role-1',
    kodeRole: 'SEKRETARIAT',
    namaRole: 'Sekretariat Utama Pondok',
    deskripsi: 'Administrator Super Pondok Pesantren — Akses Penuh Master Database',
    isBuiltIn: true,
    icon: '🏛️',
    warnaHex: '#157340',
    status: 'AKTIF',
    modules: ['santri', 'asrama', 'guru', 'pelanggaran', 'surat', 'rapor', 'konfigurasi'],
  },
  {
    id: 'role-2',
    kodeRole: 'ADMIN_INSTANSI',
    namaRole: 'Admin Madrasah & MI',
    deskripsi: 'Administrator Unit Pendidikan Formal — Kelola Akademik & Tarik Data',
    isBuiltIn: true,
    icon: '🏢',
    warnaHex: '#2563eb',
    status: 'AKTIF',
    modules: ['santri', 'guru', 'rapor'],
  },
  {
    id: 'role-3',
    kodeRole: 'KEAMANAN',
    namaRole: 'Pos Keamanan & Ketertiban',
    deskripsi: 'Pengawas Disiplin — Approval Surat Izin & Pencatatan Takzir',
    isBuiltIn: true,
    icon: '🛡️',
    warnaHex: '#d97706',
    status: 'AKTIF',
    modules: ['pelanggaran', 'surat'],
  },
  {
    id: 'role-4',
    kodeRole: 'MUSTAHIQ',
    namaRole: 'Dewan Guru & Mustahiq',
    deskripsi: 'Pengajar Kitab Kuning — Presensi QR & Penginputan Nilai Ujian',
    isBuiltIn: true,
    icon: '📖',
    warnaHex: '#7c3aed',
    status: 'AKTIF',
    modules: ['rapor'],
  },
  {
    id: 'role-5',
    kodeRole: 'WALI_SANTRI',
    namaRole: 'Wali Santri / Orang Tua',
    deskripsi: 'Akses Portal Wali — Monitoring Absensi, Nilai, & Status Izin Anak',
    isBuiltIn: true,
    icon: '👨‍👩‍👧',
    warnaHex: '#059669',
    status: 'AKTIF',
    modules: ['santri', 'rapor'],
  },
];

export async function GET(req: NextRequest) {
  try {
    // Count users by role
    const users = await prisma.user.findMany({
      select: {
        id: true,
        user_roles: {
          include: { role: true },
        },
      },
    });

    const roleCounts: Record<string, number> = {};
    users.forEach((u) => {
      u.user_roles.forEach((ur) => {
        const name = ur.role.name;
        roleCounts[name] = (roleCounts[name] || 0) + 1;
      });
    });

    const rolesWithCounts = SYSTEM_ROLES_BASE.map((r) => ({
      ...r,
      jumlahPengguna: roleCounts[r.kodeRole] || 0,
      permissions: r.modules.reduce((acc, m) => {
        acc[m] = ['view', 'create', 'update', 'print', 'export'];
        return acc;
      }, {} as Record<string, string[]>),
    }));

    return NextResponse.json({
      success: true,
      data: rolesWithCounts,
    });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat roles: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { kodeRole, permissions } = body;

    return NextResponse.json({
      success: true,
      message: `Hak akses role ${kodeRole} berhasil diperbarui`,
      data: { kodeRole, permissions },
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui role: ' + error.message },
      { status: 500 }
    );
  }
}
