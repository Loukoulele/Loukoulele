import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loukoulele.wandidle',
  appName: 'Wizard IDLE',
  webDir: 'out',

  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://www.gstatic.com/*',
      'https://fonts.googleapis.com/*',
      'https://fonts.gstatic.com/*',
      'https://cdn.discordapp.com/*',
      'https://*.firebaseio.com/*',
      'https://*.firebaseapp.com/*',
    ],
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0d0e12',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e2028',
    },
    Keyboard: {
      resize: 'none',
    },
  },

  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: false,
  },

  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
