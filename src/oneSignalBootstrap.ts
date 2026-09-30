const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;
const DISABLE_BROWSER_NOTIFICATIONS =
  String(import.meta.env.VITE_DISABLE_BROWSER_NOTIFICATIONS || '').toLowerCase() === 'true';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: OneSignalInstance) => void | Promise<void>>;
  }
}

type OneSignalInstance = {
  init: (opts: Record<string, unknown>) => Promise<void>;
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
};

if (APP_ID && !DISABLE_BROWSER_NOTIFICATIONS) {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  const script = document.createElement('script');
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  script.defer = true;
  document.head.appendChild(script);

  window.OneSignalDeferred.push(async function (OneSignal: OneSignalInstance) {
    await OneSignal.init({
      appId: APP_ID,
      allowLocalhostAsSecureOrigin: import.meta.env.DEV,
    });
  });
}

export function syncOneSignalUser(userId: string | null): void {
  if (!APP_ID || DISABLE_BROWSER_NOTIFICATIONS) {
    return;
  }
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal: OneSignalInstance) {
    if (userId) {
      await OneSignal.login(userId);
    } else {
      await OneSignal.logout();
    }
  });
}
