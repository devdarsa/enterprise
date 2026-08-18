'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import Modal from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Lock, KeyRound, Users } from 'lucide-react';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface RoleItem {
  id: string;
  kodeRole: string;
  namaRole: string;
  deskripsi: string;
  isBuiltIn: boolean; // Role bawaan sistem vs kustom
  icon: string;
  warnaHex: string;
  status: 'AKTIF' | 'NON_AKTIF';
  jumlahPengguna: number;
  permissions: Record<string, string[]>; // { santri: ['view', 'create'], ... }
}

const MODUL_LIST = [
  { key: 'santri', name: 'Master Data Santri & Wali' },
  { key: 'asrama', name: 'Data Asrama & Pembina' },
  { key: 'guru', name: 'Data Pengajar & Mustahiq' },
  { key: 'pelanggaran', name: 'Kedisiplinan & Pelanggaran' },
  { key: 'surat', name: 'Perizinan & Persuratan' },
  { key: 'rapor', name: 'Akademik & Rapor Diniyah/MI' },
  { key: 'konfigurasi', name: 'Konfigurasi Sistem & Parameter' },
];

const PERMISSION_TYPES = [
  { key: 'view', label: 'Lihat (View)' },
  { key: 'create', label: 'Tambah (Create)' },
  { key: 'update', label: 'Ubah (Update)' },
  { key: 'delete', label: 'Hapus (Delete)' },
  { key: 'print', label: 'Cetak' },
  { key: 'export', label: 'Ekspor' },
  { key: 'import', label: 'Impor' },
  { key: 'approval', label: 'Persetujuan (Approval)' },
];

const INITIAL_ROLES: RoleItem[] = [
  {
    id: 'role-1',
    kodeRole: 'SEKRETARIAT',
    namaRole: 'Sekretariat Utama Pondok',
    deskripsi: 'Administrator Super Pondok Pesantren — Akses Penuh Master Database',
    isBuiltIn: true,
    icon: '🏛️',
    warnaHex: '#157340',
    status: 'AKTIF',
    jumlahPengguna: 4,
    permissions: MODUL_LIST.reduce((acc, m) => ({ ...acc, [m.key]: PERMISSION_TYPES.map(p => p.key) }), {}),
  },
  {
    id: 'role-2',
    kodeRole: 'ADMIN_INSTANSI',
    namaRole: 'Administrator Instansi Diniyah / MI',
    deskripsi: 'Sekretariat Pengelola Unit Pendidikan Madrasah & MI Formal',
    isBuiltIn: true,
    icon: '📖',
    warnaHex: '#0f4928',
    status: 'AKTIF',
    jumlahPengguna: 6,
    permissions: MODUL_LIST.reduce((acc, m) => ({ ...acc, [m.key]: ['view', 'create', 'update', 'print', 'export', 'import', 'approval'] }), {}),
  },
  {
    id: 'role-3',
    kodeRole: 'KEAMANAN',
    namaRole: 'Tim Keamanan & Perizinan',
    deskripsi: 'Petugas Pos Keamanan — Verifikasi Perizinan Pulang & Catat Takzir',
    isBuiltIn: true,
    icon: '🛡️',
    warnaHex: '#b91c1c',
    status: 'AKTIF',
    jumlahPengguna: 8,
    permissions: {
      santri: ['view'],
      pelanggaran: ['view', 'create', 'update', 'delete'],
      surat: ['view', 'create', 'update', 'approval', 'print'],
    },
  },
  {
    id: 'role-4',
    kodeRole: 'GURU_MADRASAH',
    namaRole: 'Ustadz Mustahiq / Munawwib Diniyah',
    deskripsi: 'Dewan Guru Pengajar & Wali Kelas Madrasah Diniyah',
    isBuiltIn: true,
    icon: '👨‍🏫',
    warnaHex: '#d97706',
    status: 'AKTIF',
    jumlahPengguna: 24,
    permissions: {
      santri: ['view'],
      guru: ['view'],
      rapor: ['view', 'create', 'update', 'print'],
    },
  },
  {
    id: 'role-5',
    kodeRole: 'ROLE_MUROQOBAH',
    namaRole: 'Lajnah Muroqobah Ibadah (Kustom)',
    deskripsi: 'Role Kustom Instansi — Pengawas Kedisiplinan Sholat & Kegiatan Santri',
    isBuiltIn: false,
    icon: '🕌',
    warnaHex: '#0284c7',
    status: 'AKTIF',
    jumlahPengguna: 0,
    permissions: {
      santri: ['view'],
      pelanggaran: ['view', 'create'],
    },
  },
];

export default function ManajemenRolePage() {
  const [roleList, setRoleList] = useState<RoleItem[]>(INITIAL_ROLES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchRolesLive() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/roles');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setRoleList(json.data);
          }
        }
      } catch (e) {
        console.error('Gagal memuat roles:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchRolesLive();
  }, []);

  // Modal State (Form Dynamic Role & Permission Matrix)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  // Form State
  const [namaRole, setNamaRole] = useState('');
  const [kodeRole, setKodeRole] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [icon, setIcon] = useState('📜');
  const [warnaHex, setWarnaHex] = useState('#157340');
  const [status, setStatus] = useState<'AKTIF' | 'NON_AKTIF'>('AKTIF');
  const [formPermissions, setFormPermissions] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });
  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const openCreateModal = () => {
    setEditingRole(null);
    setNamaRole('');
    setKodeRole('');
    setDeskripsi('');
    setIcon('📜');
    setWarnaHex('#157340');
    setStatus('AKTIF');
    setFormPermissions({ santri: ['view'] });
    setIsModalOpen(true);
  };

  const openEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setNamaRole(role.namaRole);
    setKodeRole(role.kodeRole);
    setDeskripsi(role.deskripsi);
    setIcon(role.icon);
    setWarnaHex(role.warnaHex);
    setStatus(role.status);
    setFormPermissions(role.permissions || {});
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (modulKey: string, permKey: string) => {
    setFormPermissions((prev) => {
      const currentModul = prev[modulKey] || [];
      const hasPerm = currentModul.includes(permKey);
      const nextModul = hasPerm ? currentModul.filter((p) => p !== permKey) : [...currentModul, permKey];
      return { ...prev, [modulKey]: nextModul };
    });
  };

  const handleSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRole.trim() || !kodeRole.trim()) {
      showToast('error', 'Validasi Gagal', 'Nama role dan Kode role unik wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kodeRole: editingRole ? editingRole.kodeRole : kodeRole.trim().toUpperCase().replace(/\s+/g, '_'),
          permissions: formPermissions,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        if (editingRole) {
          setRoleList((prev) =>
            prev.map((r) =>
              r.id === editingRole.id
                ? {
                    ...r,
                    namaRole: namaRole.trim(),
                    deskripsi: deskripsi.trim(),
                    icon,
                    warnaHex,
                    status,
                    permissions: formPermissions,
                  }
                : r
            )
          );
          showToast('success', 'Role Berhasil Diperbarui', `Hak akses role ${namaRole} tersimpan ke database.`);
        }
      } else {
        showToast('error', 'Gagal Menyimpan Role', json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan Role', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = (role: RoleItem) => {
    if (role.isBuiltIn) {
      showToast('error', 'Penghapusan Ditolak', `Role "${role.namaRole}" adalah Role Bawaan Sistem yang dilindungi dan tidak boleh dihapus.`);
      return;
    }

    if (role.jumlahPengguna > 0) {
      showToast('warning', 'Penghapusan Ditolak (Rule 8)', `Role "${role.namaRole}" masih digunakan oleh ${role.jumlahPengguna} pengguna aktif. Pindahkan pengguna terlebih dahulu.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Role Kustom "${role.namaRole}"?`)) {
      setRoleList((prev) => prev.filter((r) => r.id !== role.id));
      showToast('success', 'Role Dihapus', `Role "${role.namaRole}" telah dihapus dari sistem & dicatat pada Audit Log.`);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Kode Role', 'Nama Role', 'Kategori', 'Status', 'Jumlah Anggota', 'Deskripsi'],
      ...filtered.map((r) => [
        r.kodeRole,
        r.namaRole,
        r.isBuiltIn ? 'Bawaan Sistem' : 'Kustom Instansi',
        r.status,
        String(r.jumlahPengguna),
        r.deskripsi,
      ]),
    ]
      .map((row) => row.map((c) => `"${c}"`).join(','))
      .join('\n');

    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `master-roles-rbac-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    showToast('success', 'Export Berhasil', `${filtered.length} data role ter-export.`);
  };

  const filtered = roleList.filter(
    (r) =>
      r.namaRole.toLowerCase().includes(search.toLowerCase()) ||
      r.kodeRole.toLowerCase().includes(search.toLowerCase()) ||
      r.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🔑"
        title="Manajemen Role & Hak Akses (RBAC)"
        subtitle="Konfigurasi Role Bawaan & Role Kustom Instansi, Matriks Permission Granular, & Keamanan Akses (Aturan RBAC Standard)"
        badge="SISTEM & UTILITAS"
        primaryAction={{ label: '+ Tambah Role Kustom Baru', onClick: openCreateModal }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama role, kode role, atau deskripsi..."
        count={loading ? undefined : filtered.length}
        countLabel="role"
        onExportExcel={handleExport}
        onRefresh={() => setSearch('')}
      />

      {/* Grid Quick Stats RBAC */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Role Bawaan Sistem</span>
            <span className="text-base font-black text-emerald-950">
              {roleList.filter((r) => r.isBuiltIn).length} Role Terlindungi
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Role Kustom Instansi</span>
            <span className="text-base font-black text-blue-950">
              {roleList.filter((r) => !r.isBuiltIn).length} Role Aktif
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Pengguna Terikat</span>
            <span className="text-base font-black text-amber-950">
              {roleList.reduce((sum, r) => sum + r.jumlahPengguna, 0)} Akun Pengguna
            </span>
          </div>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="table-container">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔑"
            title="Role Tidak Ditemukan"
            description="Tidak ada role yang cocok dengan pencarian."
            action={{ label: '+ Tambah Role Kustom Baru', onClick: openCreateModal }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Role & Kode</th>
                  <th>Kategori Role</th>
                  <th>Deskripsi & Ikon</th>
                  <th>Anggota</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 shadow-xs"
                          style={{ background: `${r.warnaHex}15`, border: `1.5px solid ${r.warnaHex}40` }}
                        >
                          {r.icon}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{r.namaRole}</div>
                          <div className="text-[10px] font-mono font-bold" style={{ color: r.warnaHex }}>
                            {r.kodeRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {r.isBuiltIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          🔒 Bawaan Sistem
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                          📜 Kustom Instansi
                        </span>
                      )}
                    </td>

                    <td>
                      <p className="text-xs text-slate-600 max-w-sm line-clamp-1">{r.deskripsi}</p>
                    </td>

                    <td>
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        👥 {r.jumlahPengguna} Pengguna
                      </span>
                    </td>

                    <td>
                      <span className={r.status === 'AKTIF' ? 'badge-aktif' : 'badge-nonaktif'}>
                        {r.status}
                      </span>
                    </td>

                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(r)}
                          className="btn-action-edit"
                        >
                          ✏️ Matriks Permission
                        </button>
                        {!r.isBuiltIn && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(r)}
                            className="btn-action-danger"
                          >
                            🗑️ Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL PENDAFTARAN & EDIT ROLE + PERMISSION MATRIX ───────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? `⚙️ Pengaturan Permission: ${editingRole.namaRole}` : '➕ Pendaftaran Role Kustom Baru'}
      >
        <form onSubmit={handleSubmitRole} className="space-y-4 text-xs">
          {editingRole?.isBuiltIn && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              ⚠️ <strong>Role Bawaan Sistem:</strong> Kode role bawaan dilindungi, namun Anda berhak menyesuaikan hak akses (Permission) untuk setiap menu di bawah ini.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Nama Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaRole}
                onChange={(e) => setNamaRole(e.target.value)}
                placeholder="Contoh: Lajnah Muroqobah Diniyah"
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Kode Role (Unik) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!!editingRole?.isBuiltIn}
                value={kodeRole}
                onChange={(e) => setKodeRole(e.target.value)}
                placeholder="Contoh: ROLE_MUROQOBAH"
                className="input-premium font-mono disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Deskripsi Role</label>
            <input
              type="text"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsi singkat fungsi dan wewenang role ini..."
              className="input-premium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Ikon Emoji</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="input-premium"
              >
                <option value="📜">📜 Gulungan</option>
                <option value="🕌">🕌 Masjid/Lajnah</option>
                <option value="🛡️">🛡️ Keamanan</option>
                <option value="👨‍🏫">👨‍🏫 Pengajar</option>
                <option value="🏛️">🏛️ Instansi</option>
                <option value="⚖️">⚖️ Dewan/Syariah</option>
                <option value="🔑">🔑 Utilitas</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Warna Identitas</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={warnaHex}
                  onChange={(e) => setWarnaHex(e.target.value)}
                  className="w-10 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={warnaHex}
                  onChange={(e) => setWarnaHex(e.target.value)}
                  className="input-premium font-mono text-center uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
                className="input-premium"
              >
                <option value="AKTIF">⚡ AKTIF</option>
                <option value="NON_AKTIF">⏸ NON_AKTIF</option>
              </select>
            </div>
          </div>

          {/* ── MATRIKS HAK AKSES (PERMISSION MATRIX) ────────────────────────── */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                🔐 MATRIKS PERMISSION HAK AKSES PER MENU
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                RBAC Permision Standard
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {MODUL_LIST.map((modul) => {
                const currentPerms = formPermissions[modul.key] || [];
                return (
                  <div key={modul.key} className="p-3 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{modul.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">key: {modul.key}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {PERMISSION_TYPES.map((perm) => {
                        const checked = currentPerms.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition-all ${
                              checked
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handlePermissionToggle(modul.key, perm.key)}
                              className="accent-emerald-600 rounded"
                            />
                            <span>{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              ❌ Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs"
            >
              {submitting ? '💾 Menyimpan...' : '💾 Simpan Role & Hak Akses'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
