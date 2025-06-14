// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '1050883308908-mqvj2bu729dhbvar1tdgjnp543gme7sk.apps.googleusercontent.com';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// App Configuration
export const APP_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME || 'recipebook';
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8081';
export const GOOGLE_REDIRECT_URI = `${BASE_URL}/api/auth/callback`;

// Redirect URIs
export const REDIRECT_URIS = {
    web: process.env.EXPO_PUBLIC_WEB_REDIRECT_URI || 'http://localhost:8081',
    mobile: process.env.EXPO_PUBLIC_MOBILE_REDIRECT_URI || 'exp://localhost:8081',
    native: process.env.EXPO_PUBLIC_NATIVE_REDIRECT_URI || 'com.googleusercontent.apps.1050883308908-mqvj2bu729dhbvar1tdgjnp543gme7sk'
};

// Auth Configuration
export const COOKIE_NAME = 'auth_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';
export const COOKIE_MAX_AGE = 3600; // 1 hour
export const JWT_EXPIRATION_TIME = '1h';
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const REFRESH_TOKEN_EXPIRY = '7d';

// Cookie Options
export const COOKIE_OPTIONS = {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const
};

export const REFRESH_COOKIE_OPTIONS = {
    maxAge: 7 * 24 * 3600, // 7 days
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const
};
