import type { ApiResponse, GPSCoordinates } from '@darsa/types';

/**
 * Calculates Haversine distance in meters between two GPS points
 */
export function calculateHaversineDistance(
  coord1: GPSCoordinates,
  coord2: GPSCoordinates
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Standardized API Response Builders
 */
export function createSuccessResponse<T>(
  data: T,
  message = 'Operasi berhasil',
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
    errors: null,
  };
}

export function createErrorResponse(
  message: string,
  errors?: ApiResponse['errors']
): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    errors: errors || null,
  };
}
