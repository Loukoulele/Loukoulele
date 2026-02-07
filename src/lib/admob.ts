import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Mettre à false pour utiliser les vrais IDs en production
const USE_TEST_ADS = false;

const AD_IDS_PROD = {
  android: {
    rewarded: 'ca-app-pub-4998116480584953/6121679770',
    interstitial: 'ca-app-pub-4998116480584953/2102543716',
  },
  ios: {
    rewarded: 'ca-app-pub-4998116480584953/6121679770',
    interstitial: 'ca-app-pub-4998116480584953/2102543716',
  },
};

// IDs de test officiels Google (marchent toujours)
const AD_IDS_TEST = {
  android: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
};

let initialized = false;

function getAdIds() {
  const ids = USE_TEST_ADS ? AD_IDS_TEST : AD_IDS_PROD;
  return Capacitor.getPlatform() === 'ios' ? ids.ios : ids.android;
}

export async function initAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform() || initialized) return;
  await AdMob.initialize({
    testingDevices: [],
    initializeForTesting: false,
  });
  initialized = true;
}

export async function showRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const adId = getAdIds().rewarded;
    await AdMob.prepareRewardVideoAd({ adId });
    await AdMob.showRewardVideoAd();
    return true;
  } catch (e) {
    console.error('Rewarded ad error:', e);
    return false;
  }
}

export async function showInterstitialAd(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const adId = getAdIds().interstitial;
    await AdMob.prepareInterstitial({ adId });
    await AdMob.showInterstitial();
  } catch (e) {
    console.error('Interstitial ad error:', e);
  }
}
