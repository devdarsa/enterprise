'use client';

import { useState } from 'react';
import Toast, { ToastProps } from '@/components/Toast';
import { SearchBar } from '@/components/Loading';

interface UserAccount {
  id: string;
  nama: string;
  email: string;
  role: string;
  instansi: string;
  status: 'AKTIF' | 'NON_AKTIF' | 'SUSPENDED';
}

const INITIAL_USERS: UserAccount[] = [
  { id: '1', nama: 'Sekretariat Utama Darsa', email: 'admin@darsa.id', role: 'SEKRETARIAT', instansi: 'PONDOK', status: 'AKTIF' },
  { id: '2', nama: 'Dr. KH. Abdullah Ridwan', email: 'guru.madrasah@darsa.id', role: 'GURU_MADRASAH', instansi: 'MADRASAH', status: 'AKTIF' },
  { id: '3', nama: 'Ustadzah Fatimah, S.Pd', email: 'guru.mi@darsa.id', role: 'GURU_MI', instansi: 'MI', status: 'AKTIF' },
  { id: '4', nama: 'Bapak Hendra (Wali)', email: 'wali.santri@darsa.id', role: 'WALI_SANTRI', instansi: 'SEMUA', status: 'AKTIF' },
];

export default function ManajemenAkunPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'>>({ isOpen: false, type: 'success', title: '' });

  const showToast = (type: ToastProps['type'], title: string, message?: string) =>
    setToast({ isOpen: true, type, title, message });

  const filtered = users.filter((u) => u.nama.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleResetPassword = (email: string) => {
    showToast('success', 'Reset Password Success', `Instruksi reset password dikirim ke ${email}.`);
  };

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, isOpen: false }))} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            SISTEM & UTILITAS
          </span>
          <h1 className="text-xl font-black text-slate-900">Manajemen Akun & Role RBAC</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pengelolaan Akun Pengguna, Hak Akses Role-Based Access Control, Aktivasi, & Reset Password
          </p>
        </div>
        <button
          onClick={() => showToast('info', 'Tambah Akun', 'Pendaftaran akun pengguna baru.')}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <span>🔐</span> + Buat Akun User Baru
        </button>
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
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="font-bold text-slate-900">{u.nama}</td>
                <td className="font-mono text-xs text-slate-600">{u.email}</td>
                <td><span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">{u.role}</span></td>
                <td className="text-xs font-semibold text-slate-700">{u.instansi}</td>
                <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{u.status}</span></td>
                <td className="text-right">
                  <button onClick={() => handleResetPassword(u.email)} className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                    🔑 Reset Pass
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
