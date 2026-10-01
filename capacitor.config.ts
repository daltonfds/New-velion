import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.newvelion.app',
  appName: 'Newvelion',
  webDir: 'out',
  server: {
    url: 'https://www.veliongroup.online',
    cleartext: false
  }
};

export default config;
