declare const process: { exit: (code?: number) => never };
import { auth } from '../packages/auth/src/index';
import { prisma, RoleType } from '../packages/database/src/index';

const DEFAULT_ACCOUNTS = [
  {
    email: 'sekretariat.pondok@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Pondok Pesantren',
    role: 'SEKRETARIAT' as RoleType,
  },
  {
    email: 'sekretariat.madrasah@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Madrasah Diniyah',
    role: 'ADMIN_INSTANSI' as RoleType,
  },
  {
    email: 'sekretariat.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Sekretariat Formal MI',
    role: 'ADMIN_INSTANSI' as RoleType,
  },
  {
    email: 'keamanan@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Tim Keamanan & Perizinan',
    role: 'KEAMANAN' as RoleType,
  },
  {
    email: 'guru.mi@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadzah Guru MI',
    role: 'GURU_MI' as RoleType,
  },
  {
    email: 'mustahiq@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Mustahiq Diniyah',
    role: 'MUSTAHIQ' as RoleType,
  },
  {
    email: 'munawwib@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Ustadz Munawwib Diniyah',
    role: 'MUNAWWIB' as RoleType,
  },
  {
    email: 'wali@darsa.my.id',
    password: 'darsa25',
    nama_lengkap: 'Wali Santri Lirboyo',
    role: 'WALI_SANTRI' as RoleType,
  },
];

async function seedAuthAccounts() {
  console.log('🔑 Memulai Seeding Akun Better Auth...');

  for (const acc of DEFAULT_ACCOUNTS) {
    try {
      let existingUser = await prisma.user.findUnique({
        where: { email: acc.email },
      });

      if (!existingUser) {
        console.log(`Membuat akun Better Auth: ${acc.email}`);
        await auth.api.signUpEmail({
          body: {
            email: acc.email,
            password: acc.password,
            name: acc.nama_lengkap,
          },
        });
        existingUser = await prisma.user.findUnique({
          where: { email: acc.email },
        });
      } else {
        // Check if Account record with credential exists
        const existingAccount = await prisma.account.findFirst({
          where: { user_id: existingUser.id, provider: 'credential' },
        });

        if (!existingAccount) {
          console.log(`User ${acc.email} ditemukan di User table tapi belum ada Account credential. Menghapus User lama & mendaftar ulang...`);
          await prisma.user.delete({ where: { id: existingUser.id } });
          await auth.api.signUpEmail({
            body: {
              email: acc.email,
              password: acc.password,
              name: acc.nama_lengkap,
            },
          });
          existingUser = await prisma.user.findUnique({
            where: { email: acc.email },
          });
        }
      }

      if (existingUser) {
        let roleObj = await prisma.role.findFirst({ where: { name: acc.role } });
        if (!roleObj) {
          roleObj = await prisma.role.create({
            data: {
              name: acc.role,
              description: `Role default ${acc.nama_lengkap}`,
            },
          });
        }

        const existingUserRole = await prisma.userRole.findFirst({
          where: { user_id: existingUser.id, role_id: roleObj.id },
        });

        if (!existingUserRole) {
          await prisma.userRole.create({
            data: {
              user_id: existingUser.id,
              role_id: roleObj.id,
            },
          });
        }

        console.log(`✅ Akun siap: ${acc.email} (Role: ${acc.role})`);
      }
    } catch (err: any) {
      console.error(`❌ Gagal seed ${acc.email}:`, err?.message || err);
    }
  }

  console.log('🎉 Seeding Akun Better Auth Selesai!');
}

seedAuthAccounts()
  .catch((e) => {
    console.error('Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
