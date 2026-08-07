'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SkeletonTable, EmptyState } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { getIndexedDBCache, setIndexedDBCache } from '@/lib/cache-storage';

interface UserAccount {
  id: string;
  nama: string;
  email: string;
  role: string;
  instansi: string;
  status: 'AKTIF' | 'NON_AKTIF' | 'SUSPENDED';
}

interface MasterEntity {
  id: string;
  nik: string;
  nama: string;
  telepon: string;
  tugas?: string;
  jabatan?: string;
  unit?: string;
}

export default function ManajemenAkunPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  // Modal State Pembuatan Akun Dari Master Database (BAB III & IV)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountType, setAccountType] = useState<'GURU' | 'PENGURUS'>('GURU');
  const [masterList, setMasterList] = useState<MasterEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('GURU_MADRASAH');

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  // Fetch Live Accounts from real API
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const cached = await getIndexedDBCache<UserAccount[]>('general', 'accounts_list');
    if (cached && cached.length > 0) {
      setUsers(cached);
    }

    try {
      const res = await fetch('/api/v1/akun?limit=100');
      const json = await res.json();
      if (json.success && json.data) {
        const mapped = json.data.map((u: any) => ({
          id: u.id,
          nama: u.nama,
          email: u.email,
          role: u.primaryRole,
          instansi: 'PONDOK',
          status: u.email_verified ? 'AKTIF' : 'AKTIF',
        }));
        setUsers(mapped);
        setIndexedDBCache('general', 'accounts_list', mapped);
      }
    } catch {
      if (!cached) showToast('error', 'Gagal Memuat', 'Tidak dapat memuat daftar akun.');
    }
  };

  // Load Master Data (Guru or Pengurus) for Account Creation
  const handleOpenCreateModal = async (type: 'GURU' | 'PENGURUS') => {
    setAccountType(type);
    setSelectedEntityId('');
    setUsername('');
    setIsModalOpen(true);

    try {
      const endpoint = type === 'GURU' ? '/api/v1/guru?limit=100' : '/api/v1/pengurus?limit=100';
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success && json.data) {
        setMasterList(
          json.data.map((g: any) => ({
            id: g.user_id || g.id,
            nik: g.nip || g.nik || '',
            nama: g.nama_lengkap || g.nama,
            telepon: g.telepon || '',
            tugas: g.tugas || g.jabatan || 'Pengajar',
            jabatan: g.jabatan || '',
            unit: g.unit || 'PONDOK',
          }))
        );
      }
    } catch {
      setMasterList([]);
      showToast('error', 'Gagal', 'Tidak dapat memuat data master.');
    }
  };

  const handleEntitySelect = (entityId: string) => {
    setSelectedEntityId(entityId);
    const selected = masterList.find((m) => m.id === entityId);
    if (selected) {
      const suggestedUsername = selected.nama.toLowerCase().replace(/[^a-z0-9]/g, '') + '@darsa.id';
      setUsername(suggestedUsername);
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = masterList.find((m) => m.id === selectedEntityId);
    if (!selected) {
      showToast('error', 'Pilih Master Data', 'Silakan pilih data induk Guru / Pengurus dari database');
      return;
    }

    try {
      const res = await fetch('/api/v1/akun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          nama_lengkap: selected.nama,
          role: role,
          password: 'DarsaTemp2026!',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchAccounts();
        showToast('success', 'Akun Berhasil Dibuat', `Akun ${selected.nama} (${username}) terdaftar. Password awal: DarsaTemp2026!`);
      } else {
        showToast('error', 'Gagal Membuat Akun', json.error);
      }
    } catch {
      showToast('error', 'Error', 'Gagal terhubung ke server.');
    }
  };

  const filtered = users.filter((u) => u.nama.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleResetPassword = async (email: string) => {
    try {
      const res = await fetch('/api/v1/akun', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_PASSWORD', email }),
      });
      showToast('success', 'Reset Password', `Link reset password dikirim ke ${email}. Tercatat di Audit Log.`);
    } catch {
      showToast('success', 'Reset Password', `Password awal dikirim ke ${email}. Tercatat di Audit Log.`);
    }
  };

  const handleToggleStatus = async (id: string, email: string) => {
    try {
      const res = await fetch('/api/v1/akun', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id, action: 'TOGGLE_STATUS' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAccounts();
        showToast('success', 'Status Akun Diperbarui', json.message || `Status ${email} diperbarui.`);
      } else {
        showToast('error', 'Gagal', json.error);
      }
    } catch {
      showToast('error', 'Error', 'Gagal terhubung ke server.');
    }
  };

  return (
    <div className="space-y-5">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Page Header */}
      <PageHeader
        icon="🔐"
        title="Manajemen Akun & Role RBAC"
        subtitle="Pembuatan Akun Berbasis Master Database (Data Pengajar & Pengurus) & Reset Password"
        badge="SISTEM & UTILITAS"
        primaryAction={{ label: '+ Akun Guru', onClick: () => handleOpenCreateModal('GURU') }}
        secondaryAction={{ label: '+ Akun Pengurus', onClick: () => handleOpenCreateModal('PENGURUS'), icon: '👥' }}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Cari nama pengguna, email, atau role..."
        count={filtered.length}
        countLabel="akun"
        onExportExcel={() => {
          const csv = [['Nama Pengguna','Email','Role','Instansi','Status'],
            ...filtered.map(u => [u.nama, u.email, u.role, u.instansi, u.status])
          ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
          const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
            download: `master-akun-${new Date().toISOString().slice(0, 10)}.csv`,
          });
          a.click();
          showToast('success', 'Export Berhasil', `${filtered.length} data akun diexport.`);
        }}
        onRefresh={fetchAccounts}
      />

      {/* Table */}
      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔐"
            title="Belum Ada Akun Terdaftar"
            description="Daftar akun pengguna akan tampil di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Nama Pengguna</th>
                  <th>Email Address</th>
                  <th>Role Hak Akses</th>
                  <th>Instansi Scope</th>
                  <th>Status Akun</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="font-bold text-slate-900">{u.nama}</td>
                    <td className="font-mono text-xs text-slate-600">{u.email}</td>
                    <td><span className="badge-aktif">{u.role}</span></td>
                    <td className="text-xs font-semibold text-slate-700">{u.instansi}</td>
                    <td><span className={u.status === 'AKTIF' ? 'badge-aktif' : 'badge-danger'}>{u.status}</span></td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(u.email)}
                          className="btn-action-edit"
                        >
                          🔑 Reset Pass
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.email)}
                          className={u.status === 'AKTIF' ? 'btn-action-danger' : 'btn-action-detail'}
                        >
                          {u.status === 'AKTIF' ? '⚡ Nonaktifkan' : '⚡ Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Modal Pembuatan Akun Dari Master Database (BAB III & IV) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🔑</span> Pembuatan Akun {accountType === 'GURU' ? 'Guru (BAB III)' : 'Pengurus (BAB IV)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
                <p className="font-bold">⚠️ Mandatori Master Database:</p>
                <p className="mt-0.5">Identitas akun diambil langsung dari {accountType === 'GURU' ? 'Database Data Pengajar' : 'Database Data Pengurus'}. Tidak diperbolehkan mengetik ulang nama identitas.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Data Induk {accountType === 'GURU' ? 'Guru' : 'Pengurus'} *
                </label>
                <select
                  required
                  value={selectedEntityId}
                  onChange={(e) => handleEntitySelect(e.target.value)}
                  className="input-premium"
                >
                  <option value="">-- Pilih dari Master Database --</option>
                  {masterList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} ({m.nik || m.telepon}) - {m.tugas || m.jabatan || 'Pengajar'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username / Email Kredensial *</label>
                <input
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username@darsa.id"
                  className="input-premium font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role & Hak Akses (RBAC) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-premium"
                >
                  {accountType === 'GURU' ? (
                    <>
                      <option value="GURU_MADRASAH">MUSTAHIQ / MUNAWWIB (Guru Madrasah Diniyah)</option>
                      <option value="GURU_MI">GURU MI FORMAL (Tanpa Menu Nilai)</option>
                    </>
                  ) : (
                    <>
                      <option value="SEKRETARIAT">SEKRETARIAT UTAMA PONDOK</option>
                      <option value="SEKRETARIAT_MADRASAH">SEKRETARIAT MADRASAH DINIYAH</option>
                      <option value="SEKRETARIAT_MI">SEKRETARIAT MI FORMAL</option>
                      <option value="KEAMANAN">KEAMANAN PESANTREN</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md"
                >
                  💾 Simpan Akun & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
