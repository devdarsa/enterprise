'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';
import { TableActions, ImportExportToolbar } from '@/components/TableActions';

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

  // Fetch Live Accounts & Master Lists from simulation API
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/v1/simulation/data?type=akun');
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data);
      }
    } catch {
      setUsers([
        { id: '1', nama: 'Sekretariat Utama Darsa', email: 'admin@darsa.id', role: 'SEKRETARIAT', instansi: 'PONDOK', status: 'AKTIF' },
        { id: '2', nama: 'Dr. KH. Abdullah Ridwan', email: 'guru.madrasah@darsa.id', role: 'GURU_MADRASAH', instansi: 'MADRASAH', status: 'AKTIF' },
        { id: '3', nama: 'Ustadzah Fatimah, S.Pd', email: 'guru.mi@darsa.id', role: 'GURU_MI', instansi: 'MI', status: 'AKTIF' },
        { id: '4', nama: 'Bapak Hendra (Wali)', email: 'wali.santri@darsa.id', role: 'WALI_SANTRI', instansi: 'SEMUA', status: 'AKTIF' },
      ]);
    }
  };

  // Load Master Data (Guru or Pengurus) for Account Creation
  const handleOpenCreateModal = async (type: 'GURU' | 'PENGURUS') => {
    setAccountType(type);
    setSelectedEntityId('');
    setUsername('');
    setIsModalOpen(true);

    try {
      const endpoint = type === 'GURU' ? '/api/v1/simulation/data?type=guru' : '/api/v1/simulation/data?type=pengurus';
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success && json.data) {
        setMasterList(json.data);
      }
    } catch {
      setMasterList([]);
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

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = masterList.find((m) => m.id === selectedEntityId);
    if (!selected) {
      showToast('error', 'Pilih Master Data', 'Silakan pilih data induk Guru / Pengurus dari database');
      return;
    }

    const newAccount: UserAccount = {
      id: String(users.length + 1),
      nama: selected.nama,
      email: username,
      role: role,
      instansi: selected.unit || 'PONDOK',
      status: 'AKTIF',
    };

    setUsers([newAccount, ...users]);
    setIsModalOpen(false);
    showToast('success', 'Akun Berhasil Dibuat dari Master Database', `Akun ${newAccount.nama} (${newAccount.email}) terdaftar. Pengguna diwajibkan ganti password saat login pertama.`);
  };

  const filtered = users.filter((u) => u.nama.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleResetPassword = (email: string) => {
    showToast('success', 'Reset Password Berhasil', `Password awal dikirim ke ${email}. Tercatat di Audit Log.`);
  };

  const handleToggleStatus = (id: string, email: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'AKTIF' ? 'NON_AKTIF' : 'AKTIF' } : u))
    );
    showToast('success', 'Status Akun Diperbarui', `Status ${email} diperbarui.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS (BAB III & IV - ACCOUNT MANAGEMENT STANDARD)
          </span>
          <h1 className="text-xl font-black text-slate-900">Manajemen Akun & Role RBAC</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pembuatan Akun Berbasis Master Database (Data Pengajar & Pengurus) & Reset Password
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreateModal('GURU')}
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>👨‍🏫</span> + Akun Guru
          </button>
          <button
            onClick={() => handleOpenCreateModal('PENGURUS')}
            className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>👥</span> + Akun Pengurus
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari nama pengguna, email, atau role..." />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Nama Pengguna</th>
              <th>Email Address</th>
              <th>Role Hak Akses</th>
              <th>Instansi Scope</th>
              <th>Status Akun</th>
              <th className="text-right">Aksi Standards (RBAC)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="font-bold text-slate-900">{u.nama}</td>
                <td className="font-mono text-xs text-slate-600">{u.email}</td>
                <td><span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">{u.role}</span></td>
                <td className="text-xs font-semibold text-slate-700">{u.instansi}</td>
                <td><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{u.status}</span></td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleResetPassword(u.email)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200"
                    >
                      🔑 Reset Pass
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u.id, u.email)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${u.status === 'AKTIF' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}
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
