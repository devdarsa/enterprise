import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.darsa.app',
  appName: 'Darsa Enterprise',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'app.darsa.id',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      permissions: ['camera'],
    },
    Geolocation: {
      permissions: ['location'],
    },
  },
};

export default config;
