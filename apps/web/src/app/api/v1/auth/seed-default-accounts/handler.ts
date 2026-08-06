import { NextResponse } from 'next/server';
import { prisma } from '@darsa/database';
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
    role: 'SEKRETARIAT',
    portal: '/loginpondok',
  },
  {
    email: 'sekretariat.madrasah@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Madrasah Diniyah',
    role: 'ADMIN_INSTANSI',
    portal: '/loginmadrasah',
  },
  {
    email: 'sekretariat.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Formal MI',
    role: 'ADMIN_INSTANSI',
    portal: '/loginmi',
  },
  {
    email: 'keamanan@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Tim Keamanan & Perizinan',
    role: 'KEAMANAN',
    portal: '/loginkeamanan',
  },
  {
    email: 'guru.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadzah Guru MI',
    role: 'GURU_MI',
    portal: '/logingurumi',
  },
  {
    email: 'mustahiq@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Mustahiq Diniyah',
    role: 'MUSTAHIQ',
    portal: '/login',
  },
  {
    email: 'munawwib@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Munawwib Diniyah',
    role: 'MUNAWWIB',
    portal: '/login',
  },
  {
    email: 'wali@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Wali Santri Lirboyo',
    role: 'WALI_SANTRI',
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

      // 2. Insert or Update Account using Direct SQL (avoids Prisma client model mapping issues)
      const hashedPassword = hashPassword(acc.password);
      const existingAccounts: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM accounts WHERE user_id = $1 AND provider = 'credential'`,
        user.id
      );

      if (existingAccounts.length === 0) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO accounts (id, user_id, provider, provider_account_id, password) VALUES (gen_random_uuid()::text, $1, 'credential', $1, $2)`,
          user.id,
          hashedPassword
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE accounts SET password = $1 WHERE user_id = $2 AND provider = 'credential'`,
          hashedPassword,
          user.id
        );
      }

      // 3. Upsert Role in roles table using Direct SQL
      const targetRole = acc.role;
      let roleObj = await prisma.role.findFirst({
        where: { name: targetRole as any },
      });

      if (!roleObj) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO roles (id, name, description) VALUES (gen_random_uuid()::text, $1, $2) ON CONFLICT DO NOTHING`,
          targetRole,
          `Role default ${acc.nama_lengkap}`
        );
        roleObj = await prisma.role.findFirst({
          where: { name: targetRole as any },
        });
      }

      // 4. Link User and Role in user_roles junction table
      if (roleObj) {
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
