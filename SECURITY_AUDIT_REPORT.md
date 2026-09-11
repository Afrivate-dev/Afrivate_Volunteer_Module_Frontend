# Security Audit Report – Afrivate Volunteer Module

**Audit date:** February 2025  
**Scope:** Full website (frontend): routes, pages, components, API client, context, storage, and env.

---

## Executive summary

| Severity | Count | Summary |
|----------|-------|---------|
| High | 2 | Missing 401 token refresh; no role-based route protection |
| Medium | 3 | Sensitive data in localStorage; applications not via API; login body mismatch |
| Low / Info | 5 | No 404 route; env exposed to client; external links; cookie consent; no XSS sinks found |

**Overall:** The app uses JWT in localStorage, has no inline XSS sinks, and uses RequireAuth for protected routes. Main gaps: no automatic token refresh on 401, no server-backed role enforcement on routes, and applications stored only in localStorage.

---

## 1. Authentication & session

### 1.1 Token storage (Medium)

- **Finding:** Access and refresh JWTs are stored in `localStorage` (`afrivate_access`, `afrivate_refresh`). Role is in `afrivate_role`.
- **Risk:** Any XSS (or malicious script) can read tokens and impersonate the user. localStorage is same-origin but not httpOnly.
- **Location:** `src/services/api.js` (getAccessToken, setTokens, etc.)
- **Recommendation:** Prefer httpOnly, secure, SameSite cookies for tokens if the backend supports it. If staying with localStorage, ensure strict CSP and no XSS (see §4).

### 1.2 No 401 retry / token refresh (High)

- **Finding:** DOCUMENTATION.md states: “On 401, the client tries token refresh and retries once.” The `request()` function in `api.js` does **not** implement this: it does not catch 401, call `auth.tokenRefresh()`, update the access token, or retry.
- **Risk:** Expired access tokens cause immediate failure; users are logged out instead of getting a seamless refresh.
- **Location:** `src/services/api.js` – `request()` (lines ~66–109).
- **Recommendation:** On `res.status === 401`, if a refresh token exists: call `auth.tokenRefresh(refresh)`, store new access (and refresh if returned), then retry the original request once. If refresh fails, clear tokens and redirect to login.

### 1.3 Login request body (Low)

- **Finding:** Login sends `{ username: formData.email, email: formData.email, password }` to `api.auth.token()`. API doc and WEBSITE_INDEX_AND_API_DOCS describe POST `/auth/token/` as expecting `email` and `password` (and `/auth/login/` as `username_or_email` + `password`). Sending both `username` and `email` with the same value is redundant and might not match backend validation.
- **Location:** `src/pages/auth/Login.js` (e.g. lines 54–57).
- **Recommendation:** Send only `{ email: formData.email, password: formData.password }` for `/auth/token/`. Use `username_or_email` only if calling `/auth/login/`.

### 1.4 Logout and token clearing

- **Finding:** `logout()` in UserContext calls `api.auth.logout()` then `api.clearTokens()`. Tokens are cleared even if the API call fails.
- **Location:** `src/context/UserContext.js`.
- **Assessment:** Good practice: local session is cleared regardless of server response.

---

## 2. Authorization & route protection

### 2.1 No role-based route guard (High)

- **Finding:** `RequireAuth` only checks for the presence of an access token (`getAccessToken()`). It does **not** check `getRole()`. So a pathfinder with a valid token can open `/enabler/dashboard` and similar enabler URLs; the page will load. Backend may reject enabler-only API calls, but the UI is still exposed.
- **Location:** `src/components/auth/RequireAuth.js`; all protected routes in `src/App.js` use `<RequireAuth>` without a `role` prop.
- **Recommendation:** Either pass `role="enabler"` or `role="pathfinder"` to `RequireAuth` where appropriate and implement role checks (redirect to correct dashboard or login if role mismatch), or enforce role only on the backend and show a “forbidden” view when API returns 403.

### 2.2 No catch-all / 404 route

- **Finding:** There is no route with `path="*"`. Unknown URLs render a blank view (no 404 page).
- **Location:** `src/App.js`.
- **Risk:** Low (no sensitive data leaked), but poor UX and possible enumeration.
- **Recommendation:** Add a catch-all route to a 404 page and use `Navigate` or a 404 component.

---

## 3. Data storage & API usage

### 3.1 Sensitive data in localStorage (Medium)

- **Finding:** Besides tokens and role, the app stores in localStorage (or sessionStorage): pathfinder applications (`pathfinderApplications`), enabler opportunities (`enablerOpportunities`), custom questions (`opportunityCustomQuestions`), KYC form data (`kycFormData`), profile data (`userProfile`, `enablerProfile`), bookmarks cache (`bookmarkedJobs`, `bookmarkedJobsData`), and similar. See DOCUMENTATION.md §6 and grep results.
- **Risk:** Any XSS or compromised script can read these. PII and application data are exposed.
- **Recommendation:** Prefer server as source of truth; use localStorage only for non-sensitive cache or preferences. Move applications to the backend (Applications API) and avoid storing PII in localStorage where possible.

### 3.2 Applications not using backend API (Medium)

- **Finding:** Applications are stored only in `pathfinderApplications` (localStorage). The backend exposes `/applications/api/applications/` and `api.applications` is implemented in `api.js`, but pages (e.g. ApplyApplication, Applicants) do not use it.
- **Risk:** Data loss on clear storage; no backup; no server-side validation or audit trail.
- **Recommendation:** Integrate with Applications API: POST on apply, GET for applicants, PUT for status updates, as in WEBSITE_INDEX_AND_API_DOCS “Next Steps.”

### 3.3 Session storage for password reset

- **Finding:** Forgot-password flow stores email in `sessionStorage` (`forgotPasswordEmail`, `resetPasswordEmail`). Used in VerifyOTP and ResetPassword.
- **Location:** `src/pages/auth/ForgotPassword.js`, `VerifyOTP.js`, `ResetPassword.js`.
- **Assessment:** Acceptable for short-lived reset flow; sessionStorage is cleared when the tab closes. Ensure reset links/OTP expire on the backend.

---

## 4. XSS & injection

### 4.1 No dangerous DOM sinks (Positive)

- **Finding:** Grep for `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `document.write` found **no matches** in `src/`.
- **Assessment:** No obvious client-side HTML/script injection sinks in the audited code.

### 4.2 External links

- **Finding:** External links (e.g. X, LinkedIn, Instagram) use `target="_blank"` with `rel="noopener noreferrer"`.
- **Location:** e.g. `Landing.js`, `LandingPathfinder.js`, `Landingenabler.js`.
- **Assessment:** Good; reduces tab-napping and referrer leakage.

---

## 5. Environment & configuration

### 5.1 Environment variables (Info)

- **Finding:** `REACT_APP_API_BASE_URL`, `REACT_APP_API_PREFIX`, `REACT_APP_GOOGLE_CLIENT_ID` are read via `process.env` and are bundled into the client. This is normal for Create React App; all `REACT_APP_*` vars are exposed to the browser.
- **Location:** `src/services/api.js`, `src/index.js`, `src/components/auth/GoogleAuthButton.js`.
- **Recommendation:** Do not put secrets (e.g. API keys, refresh token signing keys) in `REACT_APP_*`. Use them only for non-secret config (base URL, public client ID). `.env.example` does not contain secrets; keep it that way.

### 5.2 Backend base URL

- **Finding:** Default base URL is `https://afrivate-backend-production.up.railway.app` (HTTPS).
- **Assessment:** TLS in use for API calls.

---

## 6. Other

### 6.1 Cookie consent & analytics

- **Finding:** Google Analytics (gtag) is loaded only after cookie consent; consent is stored in localStorage (`afrivate_cookie_consent`). Script loading is gated in App.js and gtag.js.
- **Location:** `src/App.js`, `src/utils/gtag.js`, `src/utils/cookieConsent.js`, `src/components/CookieConsent.js`.
- **Assessment:** Compliant with common consent expectations; no analytics before consent.

### 6.2 Error and message handling

- **Finding:** `getApiErrorMessage(err)` in api.js normalizes API error bodies to a single string; used to avoid exposing raw stack or internal messages.
- **Assessment:** Reduces risk of leaking sensitive error details to the UI.

### 6.3 Profile picture upload

- **Finding:** `api.profile.picturePatch(formData)` sends `FormData` with `headers: {}`, so Content-Type is set by the browser (multipart/form-data). No JSON body.
- **Assessment:** Correct for file upload; no issue identified.

---

## 7. Checklist summary

| Item | Status |
|------|--------|
| JWT in httpOnly cookie | ❌ Uses localStorage |
| 401 → refresh token → retry | ❌ Not implemented |
| Role-based route guard | ❌ RequireAuth does not check role |
| 404 / catch-all route | ❌ Missing |
| XSS sinks (dangerouslySetInnerHTML, etc.) | ✅ None found |
| External links (noopener noreferrer) | ✅ Used |
| Applications via backend API | ❌ localStorage only |
| Sensitive data minimized in localStorage | ⚠️ PII/cache in localStorage |
| Env vars (no secrets in REACT_APP_*) | ✅ Appropriate |
| HTTPS for API | ✅ Default base URL is HTTPS |
| Cookie consent before analytics | ✅ Gated |

---

## 8. Recommended actions (priority order)

1. **High:** Implement 401 handling in `api.js`: on 401, try refresh, update tokens, retry once; else clear tokens and redirect to login.
2. **High:** Add role-aware route protection (e.g. RequireAuth with `role` and redirect pathfinder away from enabler routes and vice versa).
3. **Medium:** Integrate applications with `/applications/api/applications/` and reduce reliance on localStorage for applications.
4. **Medium:** Review what must stay in localStorage; move PII and critical data to server where possible.
5. **Low:** Add a catch-all route and 404 page.
6. **Low:** Align login request body with backend (email + password for `/auth/token/`).

---

*This report is based on static review of the frontend codebase and documented API behavior. Backend security (rate limiting, CORS, token validation, etc.) was not audited.*
