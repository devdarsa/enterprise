import { prisma } from '../packages/database/src/index';

const PRESERVED_EMAILS = [
  'sekretariat.pondok@darsa.my.id',
  'sekretariat.madrasah@darsa.my.id',
  'sekretariat.mi@darsa.my.id',
];

async function wipeCleanDatabaseTotal() {
  console.log('🔥 AGENT TOTAL DATABASE WIPE: Memulai penghapusan TOTAL 100%...');

  // 1. Get Preserved User IDs
  const preservedUsers = await prisma.user.findMany({
    where: { email: { in: PRESERVED_EMAILS } },
    select: { id: true, email: true },
  });

  const preservedUserIds = preservedUsers.map((u) => u.id);
  console.log(`📌 User Sekretariat Terjaga (${preservedUserIds.length}):`, preservedUsers.map((u) => u.email));

  // 2. Delete ALL operational & master data tables in dependency order
  console.log('🗑️ Menghapus SELURUH data operasional, master, & konfigurasi...');

  await prisma.absensiLog.deleteMany({});
  await prisma.perizinan.deleteMany({});
  await prisma.pelanggaran.deleteMany({});
  await prisma.nilaiAkademik.deleteMany({});
  await prisma.raporSantri.deleteMany({});
  await prisma.alumniRecord.deleteMany({});
  await prisma.penempatanKamarHistory.deleteMany({});
  await prisma.hubunganWali.deleteMany({});
  await prisma.waliSantri.deleteMany({});
  await prisma.santri.deleteMany({});
  await prisma.jadwalPelajaran.deleteMany({});
  await prisma.mataPelajaran.deleteMany({});
  await prisma.guru.deleteMany({});
  await prisma.pengurus.deleteMany({});
  await prisma.pengumuman.deleteMany({});
  await prisma.surat.deleteMany({});
  await prisma.suratArsip.deleteMany({});
  await prisma.auditLog.deleteMany({});

  // Master Kelembagaan & Infrastruktur
  await prisma.kamar.deleteMany({});
  await prisma.gedungAsrama.deleteMany({});
  await prisma.kelas.deleteMany({});
  await prisma.madrasah.deleteMany({});
  await prisma.lokasiPresensi.deleteMany({});
  await prisma.pondok.deleteMany({});
  await prisma.tahunAjaran.deleteMany({});
  await prisma.otpVerification.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.qrSession.deleteMany({});

  // 3. Delete non-preserved auth tables
  console.log('🗑️ Menghapus seluruh akun non-sekretariat...');
  await prisma.passkeyCredential.deleteMany({
    where: { user_id: { notIn: preservedUserIds } },
  });
  await prisma.session.deleteMany({
    where: { user_id: { notIn: preservedUserIds } },
  });
  await prisma.account.deleteMany({
    where: { user_id: { notIn: preservedUserIds } },
  });
  await prisma.userRole.deleteMany({
    where: { user_id: { notIn: preservedUserIds } },
  });
  await prisma.user.deleteMany({
    where: { email: { notIn: PRESERVED_EMAILS } },
  });

  // 4. Create default Tahun Ajaran 2026/2027 (GANJIL & GENAP)
  console.log('✨ Membuat Tahun Ajaran 2026/2027 (GANJIL & GENAP)...');
  await prisma.tahunAjaran.create({
    data: {
      nama: '2026/2027',
      semester: 'GANJIL',
      tanggal_mulai: new Date('2026-03-30'), // 10 Syawal
      tanggal_akhir: new Date('2026-09-30'),
      is_aktif: true,
    },
  });
  await prisma.tahunAjaran.create({
    data: {
      nama: '2026/2027',
      semester: 'GENAP',
      tanggal_mulai: new Date('2026-10-01'),
      tanggal_akhir: new Date('2027-03-19'),
      is_aktif: false,
    },
  });

  console.log('💥 PENGHAPUSAN TOTAL SELESAI 100%. Hanya 3 Akun Sekretariat & Tahun Ajaran 2026/2027 (GANJIL & GENAP) yang tersisa!');
}

wipeCleanDatabaseTotal()
  .catch((e) => {
    console.error('❌ Gagal penghapusan total:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
