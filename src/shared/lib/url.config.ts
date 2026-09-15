// src/shared/lib/url.config.ts

const HOST = window.location.hostname;

const ENV_MAP: Record<string, string> = {
  localhost: '',
  '127.0.0.1': '',
  '192.168.12.30': 'http://localhost:9000',
  'sgidev.krika.co': 'https://qagateway.krika.co',
};

// Hosts de desarrollo que pasan por el proxy de Vite (URL relativa):
// túneles de Cloudflare (*.trycloudflare.com) e IPs de red local.
const isDevProxyHost =
  HOST.endsWith('.trycloudflare.com') || /^\d{1,3}(\.\d{1,3}){3}$/.test(HOST);

export const BASE_URL =
  ENV_MAP[HOST] ?? (isDevProxyHost ? '' : 'https://gateway.krika.co');
