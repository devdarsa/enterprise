import { NextRequest } from 'next/server';
import { prisma } from '@darsa/database';
import { withAuth, apiSuccess, apiError, logAudit } from '@/lib/api-auth';

// DELETE /api/v1/jadwal/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return withAuth(
    async (_req: NextRequest, session) => {
      const jadwal = await prisma.jadwalPelajaran.findUnique({ where: { id } });
      if (!jadwal) return apiError('Jadwal tidak ditemukan.', 404);

      await prisma.jadwalPelajaran.delete({ where: { id } });

      await logAudit({
        userId: session.user.id,
        action: 'DELETE_JADWAL',
        entityType: 'JadwalPelajaran',
        entityId: id,
        metadata: { hari: jadwal.hari, jam_mulai: jadwal.jam_mulai },
      });

      return apiSuccess(null, 'Jadwal berhasil dihapus.');
    },
    ['SEKRETARIAT', 'ADMIN_INSTANSI']
  )(req);
}
