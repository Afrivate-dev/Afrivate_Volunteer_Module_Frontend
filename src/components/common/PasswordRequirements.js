import React from 'react';

/**
 * Single source of truth for password rules across signup / reset / set-password.
 */
export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'One lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'special', label: 'One special character (e.g. !@#$%)', test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

export const isPasswordValid = (pw) => PASSWORD_RULES.every((rule) => rule.test(pw || ''));

/**
 * Live checklist of all password requirements, shown upfront so users
 * see every rule at once instead of discovering them one failed submit at a time.
 */
const PasswordRequirements = ({ password = '', className = '' }) => (
  <ul className={`mt-2 space-y-1 pl-1 ${className}`} aria-label="Password requirements">
    {PASSWORD_RULES.map((rule) => {
      const met = rule.test(password);
      return (
        <li key={rule.key} className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
          {met ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
          {rule.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordRequirements;
