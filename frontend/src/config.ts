/**
 * API Configuration
 * Dynamically selects the correct API URL based on environment
 */

const getAPIUrl = (): string => {
  // Development environment
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }

  // Production with explicit environment variable (Netlify, Vercel, etc.)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }

  // Fallback for production
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5000/api`;
};

export const API_URL = getAPIUrl();
export const APP_NAME = 'ViralClip AI';
export const VERSION = '1.0.0';

console.log(`[Config] API URL: ${API_URL}`);
