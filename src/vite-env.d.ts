/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  /** socket | polling | auto — auto uses polling in production (Vercel-safe). */
  readonly VITE_REALTIME_MODE?: string;
  readonly VITE_ONESIGNAL_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
