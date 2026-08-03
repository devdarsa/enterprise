import type { ApiResponse, AbsensiValidationRequest, AbsensiValidationResult } from '@darsa/types';

export class DarsaSDK {
  private baseURL: string;

  constructor(baseURL = 'https://api.darsa.id/v1') {
    this.baseURL = baseURL;
  }

  async getHealthStatus(): Promise<ApiResponse> {
    const res = await fetch(`${this.baseURL}/health`);
    return res.json();
  }

  async scanAbsensi(req: AbsensiValidationRequest): Promise<ApiResponse<AbsensiValidationResult>> {
    const res = await fetch(`${this.baseURL}/absensi/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return res.json();
  }
}

export * from '@darsa/types';
export * from '@darsa/utils';
