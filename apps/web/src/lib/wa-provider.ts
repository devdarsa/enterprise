/**
 * Darsa Enterprise — WhatsApp Provider Interface & Fonnte Implementation
 * Sesuai Spesifikasi Ketentuan BAB VII, XI, XIV.
 * Token Fonnte wajib menggunakan Environment Variable FONNTE_TOKEN.
 * Provider diisolasi agar dapat diganti di masa depan tanpa merubah logika bisnis utama.
 */

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export interface WaProvider {
  sendOtp(to: string, otp: string, durationMinutes?: number): Promise<SendOtpResult>;
}

export class FonnteWaProvider implements WaProvider {
  private token: string;
  private apiUrl: string;

  constructor(token?: string, apiUrl?: string) {
    this.token = token || process.env.FONNTE_TOKEN || '';
    this.apiUrl = apiUrl || 'https://api.fonnte.com/send';
  }

  async sendOtp(to: string, otp: string, durationMinutes: number = 3): Promise<SendOtpResult> {
    if (!this.token) {
      console.warn('⚠️ [WA Provider Fonnte]: FONNTE_TOKEN tidak terkonfigurasi pada Environment Variable.');
      // Returning simulated success in dev if token is missing so system degrades gracefully
      return {
        success: false,
        error: 'Server error: FONNTE_TOKEN belum dikonfigurasi pada environment variable server.',
      };
    }

    // Format nomor HP ke standar internasional Indonesia (cth: 08123456789 -> 628123456789)
    let formattedPhone = to.trim().replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    // Template Pesan Sesuai BAB VII Spesifikasi
    const message = `Darsa Enterprise\n\nKode Verifikasi Anda:\n\n${otp}\n\nKode berlaku selama ${durationMinutes} menit.\n\nJangan berikan kode ini kepada siapa pun, termasuk petugas Darsa Enterprise.`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: this.token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          target: formattedPhone,
          message: message,
          countryCode: '62',
        }).toString(),
      });

      const json = await response.json();

      if (json.status === true || json.status === 'true' || json.detail === 'success' || json.id) {
        return {
          success: true,
          messageId: json.id || String(Date.now()),
          details: json,
        };
      } else {
        console.error('❌ [Fonnte WA API Error]:', json);
        return {
          success: false,
          error: json.reason || json.message || 'Gagal mengirim pesan WhatsApp via Fonnte API.',
          details: json,
        };
      }
    } catch (err: any) {
      console.error('❌ [WA Provider Exception]:', err);
      return {
        success: false,
        error: err.message || 'Kesalahan koneksi ke server Fonnte WA.',
      };
    }
  }
}

// Export singleton default instance using Fonnte
export const waProvider: WaProvider = new FonnteWaProvider();
