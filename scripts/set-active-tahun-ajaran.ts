import { prisma } from '../packages/database/src/index';

async function setActiveTahunAjaran() {
  console.log('📅 Memperbarui Tahun Ajaran 2026/2027 (GANJIL & GENAP - 10 Syawal)...');

  // Deactivate or clear existing
  await prisma.tahunAjaran.deleteMany({});

  // 1. Semester Ganjil (Aktif)
  const taGanjil = await prisma.tahunAjaran.create({
    data: {
      nama: '2026/2027',
      semester: 'GANJIL',
      tanggal_mulai: new Date('2026-03-30'), // 10 Syawal 1447 H
      tanggal_akhir: new Date('2026-09-30'),
      is_aktif: true,
    },
  });

  // 2. Semester Genap (Siap diganti)
  const taGenap = await prisma.tahunAjaran.create({
    data: {
      nama: '2026/2027',
      semester: 'GENAP',
      tanggal_mulai: new Date('2026-10-01'),
      tanggal_akhir: new Date('2027-03-19'),
      is_aktif: false,
    },
  });

  console.log('✅ Berhasil membuat 2 Semester untuk Tahun Ajaran 2026/2027:');
  console.log('   - 1.', taGanjil.nama, '(', taGanjil.semester, ') → [AKTIF]');
  console.log('   - 2.', taGenap.nama, '(', taGenap.semester, ') → [NON-AKTIF]');
}

setActiveTahunAjaran()
  .catch((e) => {
    console.error('❌ Gagal memperbarui Tahun Ajaran:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
