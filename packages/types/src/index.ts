/**
 * Darsa Enterprise Shared Type Definitions
 */

// Common API Response Types (RFC 7807 inspired)
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: ApiMeta;
  errors?: ApiFieldError[] | null;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

// User & Role Types
export type UserRole =
  | 'SEKRETARIAT'
  | 'ADMIN_INSTANSI'
  | 'GURU_MADRASAH'
  | 'GURU_MI'
  | 'GURU'
  | 'PEGAWAI'
  | 'SANTRI'
  | 'WALI_SANTRI';

export type SystemPermission =
  | 'users:read'
  | 'users:write'
  | 'santri:read'
  | 'santri:write'
  | 'guru:read'
  | 'guru:write'
  | 'absensi:scan'
  | 'absensi:manage'
  | 'nilai:read'
  | 'nilai:write'
  | 'audit:read';

export interface UserSession {
  user_id: string;
  email: string;
  nama_lengkap: string;
  role: UserRole;
  pondok_id?: string;
  madrasah_id?: string;
  permissions: SystemPermission[];
}

// Absensi & Geofencing Types
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface AbsensiValidationRequest {
  qr_token: string;
  user_id: string;
  coordinates: GPSCoordinates;
  device_id: string;
}

export interface AbsensiValidationResult {
  valid: boolean;
  distance_meters: number;
  status: 'HADIR' | 'TERLAMBAT' | 'DILUAR_RADIUS' | 'TOKEN_EXPIRED';
  absensi_id?: string;
  timestamp: string;
}

// Institution Module Types
export interface Pondok {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  logo_url?: string;
  created_at: string;
}

export interface Santri {
  id: string;
  nisp: string; // Nomor Induk Santri Pondok (Stambuk)
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  kelas_id: string;
  pondok_id: string;
  nik_wali?: string;
  nama_wali?: string;
  foto_url?: string;
  created_at: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  target: 'SEMUA' | 'WALI_SANTRI' | 'GURU';
  instansi: 'PONDOK' | 'MADRASAH' | 'MI' | 'SEMUA';
  tanggal: string;
  penulis: string;
  penting: boolean;
}
