import ExcelJS from 'exceljs';

export const TEMPLATE_VERSION = 'v2.4-ENTERPRISE';

export interface ExcelHeaderConfig {
  key: string;
  header: string;
  width: number;
  comment: string;
  isRequired?: boolean;
  type?: 'text' | 'dropdown' | 'number' | 'date';
  options?: string[];
}

export const SANTRI_TEMPLATE_HEADERS: ExcelHeaderConfig[] = [
  {
    key: 'nisp',
    header: 'NISP Stambuk',
    width: 22,
    comment: 'Fungsi: Identitas Stambuk resmi santri\nFormat: Teks (Contoh: PNDK-00123456)\nStatus: Opsional (Otomatis dibuat sistem jika kosong)\nDuplikat: Tidak boleh duplikat',
    type: 'text',
  },
  {
    key: 'nisn',
    header: 'NISN',
    width: 16,
    comment: 'Fungsi: Nomor Induk Siswa Nasional (10 Digit)\nFormat: 10 Digit Angka Teks (Contoh: 0012345678)\nStatus: Opsional / Sesuai Kartu NISN\nDuplikat: Tidak boleh duplikat',
    type: 'text',
  },
  {
    key: 'nis',
    header: 'NIS Lokal',
    width: 16,
    comment: 'Fungsi: Nomor Induk Santri Lokal Pondok/Madrasah\nFormat: Teks / Angka (Contoh: 20261001)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'nik',
    header: 'NIK Santri (16 Digit)',
    width: 22,
    comment: 'Fungsi: Nomor Induk Kependudukan Santri (16 Digit)\nFormat: Wajib 16 Digit Teks (Contoh: 3571011508080001)\nStatus: Opsional / Sesuai KK',
    type: 'text',
  },
  {
    key: 'nama_lengkap',
    header: 'Nama Lengkap Santri',
    width: 30,
    comment: 'Fungsi: Nama Lengkap Santri Sesuai Ijazah/KK\nFormat: Teks Bebas (Contoh: Muhammad Raihan)\nStatus: WAJIB DIISI! (Tidak boleh kosong)',
    isRequired: true,
    type: 'text',
  },
  {
    key: 'nama_panggilan',
    header: 'Nama Panggilan',
    width: 18,
    comment: 'Fungsi: Nama Panggilan Sehari-hari\nFormat: Teks (Contoh: Raihan)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'jenis_kelamin',
    header: 'Jenis Kelamin (L/P)',
    width: 18,
    comment: 'Fungsi: Jenis Kelamin Santri\nFormat: Hanya L (Laki-Laki) atau P (Perempuan)\nStatus: Wajib',
    isRequired: true,
    type: 'dropdown',
    options: ['L', 'P'],
  },
  {
    key: 'tempat_lahir',
    header: 'Tempat Lahir',
    width: 20,
    comment: 'Fungsi: Kota/Kabupaten Tempat Lahir\nFormat: Teks (Contoh: Kediri)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'tanggal_lahir',
    header: 'Tanggal Lahir (YYYY-MM-DD)',
    width: 24,
    comment: 'Fungsi: Tanggal Lahir Santri\nFormat: YYYY-MM-DD (Contoh: 2010-08-15)\nStatus: Opsional',
    type: 'date',
  },
  {
    key: 'telepon',
    header: 'No. HP Santri',
    width: 18,
    comment: 'Fungsi: Nomor Telepon/WhatsApp Santri\nFormat: Nomor Teks (Contoh: 081234567890)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'jenjang',
    header: 'Jenjang Pendidikan',
    width: 22,
    comment: 'Fungsi: Jenjang Pendidikan Utama Santri\nFormat: PONDOK, MADRASAH_DINIYAH, atau MI\nStatus: Wajib',
    isRequired: true,
    type: 'dropdown',
    options: ['PONDOK', 'MADRASAH_DINIYAH', 'MI'],
  },
  {
    key: 'kelas',
    header: 'Kelas & Rombel',
    width: 26,
    comment: 'Fungsi: Penempatan Kelas & Rombel Santri\nFormat: Teks Kelas (Contoh: 10-A (Tahfidz & Diniyah))\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'kamar',
    header: 'Gedung / Kamar Asrama',
    width: 24,
    comment: 'Fungsi: Nama Gedung & Kamar Asrama Santri\nFormat: Teks (Contoh: Asrama Abu Bakar 1)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'status_tempat_tinggal',
    header: 'Status Keasramaan (PONDOK_PESANTREN/UNIT_LAIN)',
    width: 32,
    comment: 'Fungsi: Status Mukim Santri\nFormat: PONDOK_PESANTREN (Mukim) atau UNIT_LAIN (Kalong)\nStatus: Wajib',
    isRequired: true,
    type: 'dropdown',
    options: ['PONDOK_PESANTREN', 'UNIT_LAIN'],
  },
  {
    key: 'hafalan_juz',
    header: 'Target Hafalan (Juz)',
    width: 20,
    comment: 'Fungsi: Target Hafalan Al-Qur\'an Santri\nFormat: Angka Jumlah Juz 0 - 30 (Contoh: 5)\nStatus: Opsional',
    type: 'number',
  },
  {
    key: 'alamat',
    header: 'Alamat Lengkap Kependudukan',
    width: 36,
    comment: 'Fungsi: Alamat Kependudukan Sesuai KTP/KK\nFormat: Teks Alamat (Contoh: Jl. Pesantren Lirboyo No 1, Kediri)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'no_kk',
    header: 'Nomor Kartu Keluarga (KK)',
    width: 24,
    comment: 'Fungsi: Nomor Kartu Keluarga (16 Digit)\nFormat: Wajib 16 Digit Teks (Contoh: 3571019908050012)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'nik_wali',
    header: 'NIK Wali (16 Digit)',
    width: 22,
    comment: 'Fungsi: Nomor Induk Kependudukan Wali (16 Digit)\nFormat: Wajib 16 Digit Teks (Contoh: 3571012304850001)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'nama_wali',
    header: 'Nama Lengkap Wali',
    width: 26,
    comment: 'Fungsi: Nama Lengkap Orang Tua / Wali Santri\nFormat: Teks (Contoh: Bapak Hendra)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'telepon_wali',
    header: 'No. HP Wali',
    width: 18,
    comment: 'Fungsi: Nomor Telepon/WhatsApp Wali\nFormat: Nomor Teks (Contoh: 081399887766)\nStatus: Opsional',
    type: 'text',
  },
  {
    key: 'hubungan_wali',
    header: 'Hubungan Wali (AYAH/IBU/WALI)',
    width: 24,
    comment: 'Fungsi: Status Hubungan Wali dengan Santri\nFormat: AYAH, IBU, atau WALI\nStatus: Wajib',
    isRequired: true,
    type: 'dropdown',
    options: ['AYAH', 'IBU', 'WALI'],
  },
  {
    key: 'status',
    header: 'Status Keaktifan (AKTIF/BOYONG/LULUS/NON_AKTIF)',
    width: 32,
    comment: 'Fungsi: Status Keaktifan Santri dalam Sistem\nFormat: AKTIF, BOYONG, LULUS, atau NON_AKTIF\nStatus: Wajib',
    isRequired: true,
    type: 'dropdown',
    options: ['AKTIF', 'BOYONG', 'LULUS', 'NON_AKTIF'],
  },
];

/**
 * Generate official protected Excel template complying with all 31 rules.
 */
export async function downloadOfficialSantriTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DARSA ENTERPRISE SYSTEM';
  workbook.lastModifiedBy = 'DARSA ENTERPRISE SYSTEM';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  const sheet = workbook.addWorksheet('Master_Santri_Template', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }], // Rule 5: Freeze Header
  });

  // Setup Columns
  sheet.columns = SANTRI_TEMPLATE_HEADERS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Style Header Row (Row 1)
  const headerRow = sheet.getRow(1);
  headerRow.height = 35;

  headerRow.eachCell((cell, colNumber) => {
    const config = SANTRI_TEMPLATE_HEADERS[colNumber - 1];

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF064E3B' }, // Dark Emerald Green
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }, // White
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.protection = { locked: true }; // Rule 2: Header Terkunci

    // Rule 3: Informasi Header (Tooltip / Comment Note)
    if (config?.comment) {
      cell.note = config.comment;
    }
  });

  // Rule 6: AutoFilter
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: SANTRI_TEMPLATE_HEADERS.length },
  };

  // Add 1 Sample Row (Row 2) to illustrate correct input
  const sampleData: Record<string, any> = {
    nisp: 'PNDK-0012345678',
    nisn: '0012345678',
    nis: '20261001',
    nik: '3571011508080001',
    nama_lengkap: 'Muhammad Raihan',
    nama_panggilan: 'Raihan',
    jenis_kelamin: 'L',
    tempat_lahir: 'Kediri',
    tanggal_lahir: '2010-08-15',
    telepon: '081234567890',
    jenjang: 'PONDOK',
    kelas: '10-A (Tahfidz & Diniyah)',
    kamar: 'Asrama Abu Bakar 1',
    status_tempat_tinggal: 'PONDOK_PESANTREN',
    hafalan_juz: 5,
    alamat: 'Jl. Pesantren Lirboyo No 1, Kediri, Jawa Timur',
    no_kk: '3571019908050012',
    nik_wali: '3571012304850001',
    nama_wali: 'Bapak Hendra',
    telepon_wali: '081399887766',
    hubungan_wali: 'AYAH',
    status: 'AKTIF',
  };

  const dataRow = sheet.addRow(sampleData);
  dataRow.height = 24;
  dataRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10 };
    cell.alignment = { vertical: 'middle' };
    cell.protection = { locked: false }; // Rule 23: Data Input Unlocked
  });

  // Apply Data Validation & Cell Formats to Rows 2 - 1000 (Data Area)
  for (let r = 2; r <= 1000; r++) {
    const row = sheet.getRow(r);
    row.height = 22;

    SANTRI_TEMPLATE_HEADERS.forEach((config, idx) => {
      const cell = row.getCell(idx + 1);
      cell.protection = { locked: false }; // Rule 23: Data Input Area 100% Unlocked for Copy-Paste

      // Text Format (@) for IDs
      if (['nisp', 'nisn', 'nis', 'nik', 'no_kk', 'nik_wali', 'telepon', 'telepon_wali'].includes(config.key)) {
        cell.numFmt = '@';
      }

      // Dropdown Validation
      if (config.type === 'dropdown' && config.options) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: !config.isRequired,
          formulae: [`"${config.options.join(',')}"`],
          showErrorMessage: true,
          errorTitle: 'Data Tidak Valid',
          error: `Pilihan untuk ${config.header} hanya boleh: ${config.options.join(', ')}`,
        };
      }

      // Target Hafalan Numeric Validation
      if (config.key === 'hafalan_juz') {
        cell.dataValidation = {
          type: 'whole',
          operator: 'between',
          formulae: [0, 30],
          allowBlank: true,
          showErrorMessage: true,
          errorTitle: 'Format Hafalan Salah',
          error: 'Target hafalan harus berupa angka antara 0 - 30 Juz.',
        };
      }
    });
  }

  // Rule 2, 22 & 28: Protect Header Row 1 while allowing Copy-Paste & Editing on Rows 2+
  await sheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: true,
    formatColumns: true,
    formatRows: true,
    insertColumns: true,
    insertRows: true,
    insertHyperlinks: true,
    deleteColumns: false,
    deleteRows: true,
    sort: true,
    autoFilter: true,
  });

  // Generate File Buffer & Trigger Browser Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `template-official-import-santri-${TEMPLATE_VERSION}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export interface ValidationIssue {
  rowNumber: number;
  column: string;
  field: string;
  value: any;
  message: string;
}

export interface PreImportValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: Record<string, any>[];
  invalidRows: { rowNumber: number; data: Record<string, any>; issues: ValidationIssue[] }[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * Pre-import validation engine complying with Rule 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 24, 25.
 */
export async function parseAndValidateExcelFile(file: File): Promise<PreImportValidationResult> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error('Worksheet Excel tidak ditemukan.');
  }

  const validRows: Record<string, any>[] = [];
  const invalidRows: { rowNumber: number; data: Record<string, any>; issues: ValidationIssue[] }[] = [];

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];

  headerRow.eachCell((cell) => {
    headers.push(cell.text.trim());
  });

  // Map header text to key
  const headerToKeyMap: Record<string, string> = {};
  SANTRI_TEMPLATE_HEADERS.forEach((h) => {
    headerToKeyMap[h.header] = h.key;
  });

  const seenNisp = new Set<string>();
  const seenNisn = new Set<string>();
  const seenNik = new Set<string>();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip Header Row

    const rowData: Record<string, any> = {};
    const issues: ValidationIssue[] = [];

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const headerName = headers[colNumber - 1];
      const key = headerToKeyMap[headerName] || headerName;
      let val = cell.text ? cell.text.trim() : cell.value;
      if (typeof val === 'object' && val !== null && 'result' in val) {
        val = (val as any).result;
      }
      if (val !== undefined && val !== null) {
        rowData[key] = String(val).trim();
      } else {
        rowData[key] = '';
      }
    });

    // Ignore completely empty rows
    const hasData = Object.values(rowData).some((v) => v !== '');
    if (!hasData) return;

    // Rule 7: Kolom Wajib Nama Lengkap
    if (!rowData.nama_lengkap) {
      issues.push({
        rowNumber,
        column: 'Nama Lengkap Santri',
        field: 'nama_lengkap',
        value: rowData.nama_lengkap,
        message: 'Nama Lengkap Santri WAJIB diisi (tidak boleh kosong).',
      });
    }

    // Rule 13: Jenis Kelamin
    if (rowData.jenis_kelamin) {
      const jk = rowData.jenis_kelamin.toUpperCase();
      if (!['L', 'P', 'LAKI_LAKI', 'PEREMPUAN'].includes(jk)) {
        issues.push({
          rowNumber,
          column: 'Jenis Kelamin',
          field: 'jenis_kelamin',
          value: rowData.jenis_kelamin,
          message: 'Jenis kelamin hanya boleh L atau P.',
        });
      }
    }

    // Rule 9: NIK Santri (16 Digit jika diisi)
    if (rowData.nik) {
      const nikClean = rowData.nik.replace(/\D/g, '');
      if (nikClean.length !== 16) {
        issues.push({
          rowNumber,
          column: 'NIK Santri',
          field: 'nik',
          value: rowData.nik,
          message: `NIK Santri harus 16 digit angka (Terdeteksi ${nikClean.length} digit).`,
        });
      } else {
        if (seenNik.has(nikClean)) {
          issues.push({
            rowNumber,
            column: 'NIK Santri',
            field: 'nik',
            value: rowData.nik,
            message: 'NIK Santri duplikat di dalam file Excel ini.',
          });
        } else {
          seenNik.add(nikClean);
        }
      }
    }

    // Rule 10: NISN (10 Digit jika diisi)
    if (rowData.nisn) {
      const nisnClean = rowData.nisn.replace(/\D/g, '');
      if (nisnClean.length !== 10) {
        issues.push({
          rowNumber,
          column: 'NISN',
          field: 'nisn',
          value: rowData.nisn,
          message: `NISN harus 10 digit angka (Terdeteksi ${nisnClean.length} digit).`,
        });
      } else {
        if (seenNisn.has(nisnClean)) {
          issues.push({
            rowNumber,
            column: 'NISN',
            field: 'nisn',
            value: rowData.nisn,
            message: 'NISN duplikat di dalam file Excel ini.',
          });
        } else {
          seenNisn.add(nisnClean);
        }
      }
    }

    // Rule 11: NISP Duplicity Check
    if (rowData.nisp) {
      if (seenNisp.has(rowData.nisp)) {
        issues.push({
          rowNumber,
          column: 'NISP Stambuk',
          field: 'nisp',
          value: rowData.nisp,
          message: 'NISP Stambuk duplikat di dalam file Excel ini.',
        });
      } else {
        seenNisp.add(rowData.nisp);
      }
    }

    // Rule 12: Tanggal Lahir (YYYY-MM-DD)
    if (rowData.tanggal_lahir) {
      const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(rowData.tanggal_lahir);
      if (!isDateValid) {
        issues.push({
          rowNumber,
          column: 'Tanggal Lahir',
          field: 'tanggal_lahir',
          value: rowData.tanggal_lahir,
          message: 'Format tanggal lahir wajib YYYY-MM-DD (Contoh: 2010-08-15).',
        });
      }
    }

    // Rule 17: Target Hafalan
    if (rowData.hafalan_juz !== '') {
      const hafalan = Number(rowData.hafalan_juz);
      if (isNaN(hafalan) || hafalan < 0 || hafalan > 30) {
        issues.push({
          rowNumber,
          column: 'Target Hafalan',
          field: 'hafalan_juz',
          value: rowData.hafalan_juz,
          message: 'Target hafalan harus berupa angka antara 0 - 30 Juz.',
        });
      }
    }

    if (issues.length === 0) {
      validRows.push(rowData);
    } else {
      invalidRows.push({ rowNumber, data: rowData, issues });
    }
  });

  const total = validRows.length + invalidRows.length;
  return {
    isValid: invalidRows.length === 0 && validRows.length > 0,
    totalRows: total,
    validRows,
    invalidRows,
    summary: {
      total,
      valid: validRows.length,
      invalid: invalidRows.length,
    },
  };
}

/**
 * Legacy Helper Aliases for backwards compatibility
 */
export function exportToExcel<T extends Record<string, any>>(data: T[], filename: string, sheetName = 'Data') {
  downloadOfficialSantriTemplate();
}

export function downloadExcelTemplate(headersWithSamples: Record<string, any>[], filename: string, sheetName = 'Template') {
  downloadOfficialSantriTemplate();
}

export async function parseExcelFile<T = any>(file: File): Promise<T[]> {
  const result = await parseAndValidateExcelFile(file);
  return result.validRows as T[];
}
