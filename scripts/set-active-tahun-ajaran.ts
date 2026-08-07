import { prisma } from '../packages/database/src/index';

async function setActiveTahunAjaran() {
  console.log('📅 Pembaruan Tahun Ajaran Aktif ke 2026/2027 (10 Syawal)...');

  // Deactivate or clear existing
  await prisma.tahunAjaran.deleteMany({});

  const ta = await prisma.tahunAjaran.create({
    data: {
      nama: '2026/2027',
      semester: 'GANJIL',
      tanggal_mulai: new Date('2026-03-30'), // Approx 10 Syawal
      tanggal_akhir: new Date('2027-03-19'),
      is_aktif: true,
    },
  });

  console.log('✅ Tahun Ajaran Aktif Berhasil Ditetapkan:', ta.nama, '(', ta.semester, ')');
}

setActiveTahunAjaran()
  .catch((e) => {
    console.error('❌ Gagal memperbarui Tahun Ajaran:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
