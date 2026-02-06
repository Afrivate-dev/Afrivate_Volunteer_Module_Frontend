/**
 * Cookie consent storage and helpers.
 * Consent is saved in localStorage for persistence.
 */
const CONSENT_KEY = 'afrivate_cookie_consent';

const DEFAULT_CONSENT = {
  analytics: true,   // Google Analytics - compulsory, always true
  necessary: true,   // Essential for site (localStorage for auth, profile, etc.)
  preferences: true, // Optional preferences
  timestamp: null,
};

export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONSENT, ...parsed, analytics: true };
  } catch {
    return null;
  }
}

export function saveConsent(choices) {
  const data = {
    ...DEFAULT_CONSENT,
    ...choices,
    analytics: true, // Always true - compulsory
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
  return data;
}

export function hasConsent() {
  return getConsent() !== null;
}
