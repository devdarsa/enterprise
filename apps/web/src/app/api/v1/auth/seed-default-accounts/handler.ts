import { NextResponse } from 'next/server';
import { prisma, RoleType } from '@darsa/database';
import { scryptSync, randomBytes } from 'crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

const DEFAULT_ACCOUNTS = [
  {
    email: 'sekretariat.pondok@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Pondok Pesantren',
    role: RoleType.SEKRETARIAT,
    portal: '/loginpondok',
  },
  {
    email: 'sekretariat.madrasah@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Madrasah Diniyah',
    role: RoleType.ADMIN_INSTANSI,
    portal: '/loginmadrasah',
  },
  {
    email: 'sekretariat.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Formal MI',
    role: RoleType.ADMIN_INSTANSI,
    portal: '/loginmi',
  },
  {
    email: 'keamanan@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Tim Keamanan & Perizinan',
    role: RoleType.KEAMANAN,
    portal: '/loginkeamanan',
  },
  {
    email: 'guru.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadzah Guru MI',
    role: RoleType.GURU_MI,
    portal: '/logingurumi',
  },
  {
    email: 'mustahiq@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Mustahiq Diniyah',
    role: RoleType.MUSTAHIQ,
    portal: '/login',
  },
  {
    email: 'munawwib@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Munawwib Diniyah',
    role: RoleType.MUNAWWIB,
    portal: '/login',
  },
  {
    email: 'wali@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Wali Santri Lirboyo',
    role: RoleType.WALI_SANTRI,
    portal: '/loginwali',
  },
];

export async function POST() {
  const results = [];

  for (const acc of DEFAULT_ACCOUNTS) {
    try {
      // 1. Check or create User in PostgreSQL
      let user = await prisma.user.findUnique({
        where: { email: acc.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: acc.email,
            nama_lengkap: acc.nama_lengkap,
            email_verified: true,
          },
        });
      }

      // 2. Check or create Account with Better Auth scrypt hashed password
      let account = await prisma.account.findFirst({
        where: { user_id: user.id, provider: 'credential' },
      });

      if (!account) {
        account = await prisma.account.create({
          data: {
            user_id: user.id,
            provider: 'credential',
            provider_account_id: user.id,
            password: hashPassword(acc.password),
          },
        });
      } else if (!account.password) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashPassword(acc.password) },
        });
      }

      // 3. Upsert Role in roles table
      let roleObj = await prisma.role.findFirst({
        where: { name: acc.role },
      });

      if (!roleObj) {
        roleObj = await prisma.role.create({
          data: {
            name: acc.role,
            description: `Role default ${acc.nama_lengkap}`,
          },
        });
      }

      // 4. Link User and Role in user_roles junction table
      const existingUserRole = await prisma.userRole.findFirst({
        where: { user_id: user.id, role_id: roleObj.id },
      });

      if (!existingUserRole) {
        await prisma.userRole.create({
          data: {
            user_id: user.id,
            role_id: roleObj.id,
          },
        });
      }

      results.push({ email: acc.email, status: 'VERIFIED_AND_ACTIVE', role: acc.role, portal: acc.portal });
    } catch (err: any) {
      console.error(`Error seeding account ${acc.email}:`, err);
      results.push({ email: acc.email, status: 'ERROR', message: err?.message || 'Gagal' });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Berhasil memverifikasi & mengaktifkan 8 akun default Darsa Enterprise di Database PostgreSQL (Neon.tech).`,
    accounts: results,
  });
}

export async function GET() {
  return POST();
}
