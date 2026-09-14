# Afrivate Volunteer Module — Frontend Documentation

> **This is the canonical reference for the `light` branch.** For a summary of what changed vs `master`, see [LIGHT_BRANCH_CHANGES.md](LIGHT_BRANCH_CHANGES.md).

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [All Routes](#all-routes)
6. [API Client (api.js)](#api-client-apijs)
7. [UserContext](#usercontext)
8. [Profile Page (EditNewProfile.js)](#profile-page-editnewprofilejs)
9. [Page-by-Page Reference](#page-by-page-reference)
10. [Components Reference](#components-reference)
11. [Custom Questions Pattern](#custom-questions-pattern)
12. [Pagination](#pagination)
13. [Notifications](#notifications)
14. [Bookmarks](#bookmarks)
15. [Styling Conventions](#styling-conventions)
16. [ESLint & Build](#eslint--build)
17. [Environment Variables](#environment-variables)
18. [Local Development Setup](#local-development-setup)
19. [Deployment (Vercel)](#deployment-vercel)
20. [Testing](#testing)
21. [Known Issues & Limitations](#known-issues--limitations)
22. [Merge Instructions](#merge-instructions)
23. [Changelog](#changelog)

---

## Overview

Afrivate is a volunteer-matching platform connecting African volunteers (Pathfinders) with organisations that post opportunities (Enablers). This React SPA handles authentication, profile management, opportunity browsing, application submission, bookmarks, and notifications.

**Two roles:**
- **Pathfinder** — volunteer: browses opportunities, applies, manages profile/bookmarks
- **Enabler** — organisation: posts opportunities, views applicants, manages org profile

The app communicates with a Django REST Framework backend hosted on Railway. No GraphQL, no Redux — state is local React state + `UserContext` + `localStorage` tokens.

---

## Tech Stack

| Dependency | Version | Purpose |
|---|---|---|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | DOM rendering |
| react-router-dom | 6.22.1 | Client-side routing (BrowserRouter) |
| tailwindcss | 3.4.1 | Utility-first CSS |
| @heroicons/react | 2.1.1 | SVG icon set |
| @react-oauth/google | 0.13.4 | Google OAuth token flow |
| gh-pages | 6.3.0 | GitHub Pages deploy script (not used for production) |

**No axios** — the app uses the native `fetch` API wrapped in `src/services/api.js`.

**No Redux / Zustand** — auth state lives in `UserContext`; page-level state is `useState`.

---

## Project Structure

```
src/
├── App.js                        # Route tree, ErrorBoundary, RoleRedirect
├── index.js                      # ReactDOM.createRoot, BrowserRouter wrapper
├── context/
│   └── UserContext.js            # Auth state (user, loading, error), refetchUser
├── services/
│   └── api.js                    # Centralized fetch client, all endpoint modules
├── components/
│   ├── auth/
│   │   ├── Navbar.js             # Fixed top navbar with unread notification badge
│   │   └── RequireAuth.js        # Route guard (synchronous localStorage check)
│   ├── common/
│   │   └── Pagination.js         # Prev/Next pagination UI
│   ├── forms/
│   │   └── KYCForm.js            # KYC document upload form
│   └── CookieConsent.js          # GDPR cookie banner
├── pages/
│   ├── auth/
│   │   ├── Login.js
│   │   ├── SignUp.js
│   │   ├── ForgotPassword.js
│   │   ├── VerifyOTP.js
│   │   └── ResetPassword.js
│   ├── pathfinder/
│   │   ├── EditNewProfile.js     # Profile create/edit/preview (most complex page)
│   │   ├── PathfinderDashboard.js
│   │   ├── AvailableOpportunities.js
│   │   ├── VolunteerDetails.js   # Opportunity detail view
│   │   ├── ApplyApplication.js   # Application form (reads custom questions)
│   │   ├── MyApplications.js
│   │   ├── Bookmarks.js          # Saved opportunities + saved organisations
│   │   ├── OrganizationProfile.js
│   │   ├── EnablerProfileView.js
│   │   └── PathfinderSettings.js
│   ├── enabler/
│   │   ├── EnablerDashboard.js
│   │   ├── CreateOpportunity.js  # Writes combined description with markers
│   │   ├── EditOpportunity.js
│   │   ├── OpportunitiesPosted.js
│   │   ├── OpportunityDetails.js
│   │   ├── Applicants.js         # Lists applicants, bookmark by applicant_id
│   │   ├── EnablerProfile.js
│   │   ├── EditProfile.js
│   │   ├── EnablerProfileSetup.js
│   │   ├── EnablerPathfinderBookmarks.js
│   │   ├── PathfinderProfile.js
│   │   ├── ContactPathfinder.js
│   │   ├── Recommendations.js
│   │   └── Settings.js
│   ├── Notifications.js
│   ├── Landing.js
│   ├── LandingPathfinder.js
│   ├── Landingenabler.js
│   ├── AboutUs.js
│   ├── ContactUs.js
│   ├── DeepPayInfo.js
│   ├── PrivacyPolicy.js
│   ├── Roadmap.js
│   └── NotFound.js
└── utils/
    ├── descriptionUtils.js       # combineDescription / parseDescription with markers
    ├── opportunityUtils.js       # getOrgName, navigateToVolunteerDetails
    ├── pathfinderProfilePayload.js # Profile request body builders
    ├── syncSocialLinks.js        # REST social link diff/sync
    ├── websiteUrl.js             # normalizeWebsiteForStorage
    ├── cookieConsent.js          # GDPR consent helpers
    └── gtag.js                   # Google Analytics loader
```

---

## Architecture Overview

### Request Flow

```
Component
  └─> api.js request()
        ├─ Attaches Bearer token from localStorage
        ├─ Strips Content-Type for FormData (browser sets boundary)
        ├─ On 401: refresh token once via isRetryingAfter401 guard, retry
        └─ Throws structured error { status, body, message }
```

### Auth Flow

```
localStorage: afrivate_access, afrivate_refresh, afrivate_role
                     │
              UserContext.fetchUser()
                     │
              ┌──────┴──────┐
           enabler        pathfinder
        profile API      profile API
              │
         setUser(normalizedProfile)
```

### Role-Based Routing

`RequireAuth` reads `afrivate_access` and `afrivate_role` synchronously from `localStorage`. If the token is absent → redirect to `/login`. If the role doesn't match the required role → redirect to the user's own dashboard. No async involved in the guard.

`RoleRedirect` is used on legacy routes (`/dashboard`, `/profile` without role context) to send users to their role-specific destination based on the live `UserContext`.

### Description Sections

The backend has a single `description` field on opportunities. Multiple sections (responsibilities, requirements, custom questions, etc.) are encoded into that field using named markers (e.g. `[DESCRIPTION]`, `[CUSTOM_QUESTIONS]`) by `combineDescription()` when posting/editing, and decoded by `parseDescription()` when displaying.

---

## All Routes

### Public / Landing

| Path | Component | Notes |
|---|---|---|
| `/` | `Landing` | Public landing page |
| `/landingpathfinder` | `LandingPathfinder` | Pathfinder marketing page |
| `/landingenabler` | `Landingenabler` | Enabler marketing page |
| `/road` | `Roadmap` | Product roadmap |
| `/about` | `AboutUs` | About page |
| `/contact` | `ContactUs` | Contact page |
| `/privacy` | `PrivacyPolicy` | Privacy policy |
| `/deep-pay-info` | `DeepPayInfo` | Payment info |

### Auth

| Path | Component |
|---|---|
| `/login` | `Login` |
| `/signup` | `SignUp` |
| `/forgot-password` | `ForgotPassword` |
| `/verify-otp` | `VerifyOTP` |
| `/reset-password` | `ResetPassword` |

### Pathfinder (role="pathfinder")

| Path | Component | Notes |
|---|---|---|
| `/pathf` | `PathfinderDashboard` | Main pathfinder dashboard |
| `/dashf` | `PathfinderDashboard` | Alternate dashboard alias |
| `/available-opportunities` | `AvailableOpportunities` | Opportunity browser |
| `/volunteer-details` | `VolunteerDetails` | Opportunity detail (via router state) |
| `/apply/:opportunityId` | `ApplyApplication` | Application form |
| `/my-applications` | `MyApplications` | Submitted applications |
| `/bookmarks` | `Bookmarks` | Saved opps + saved orgs |
| `/profile` | `EditNewProfile` | Profile create/edit/preview |
| `/pathfinder/profile-setup` | `EditNewProfile` | Alias (same component) |
| `/pathfinder/settings` | `PathfinderSettings` | Account settings |
| `/organization/:id` | `OrganizationProfile` | Public org profile |
| `/enabler-profile/:id` | `EnablerProfileView` | Enabler profile (pathfinder view) |

### Enabler (role="enabler")

| Path | Component |
|---|---|
| `/enabler/dashboard` | `EnablerDashboard` |
| `/create-opportunity` | `CreateOpportunity` |
| `/enabler/opportunities-posted` | `OpportunitiesPosted` |
| `/enabler/opportunity/:id` | `OpportunityDetails` |
| `/enabler/edit-opportunity/:id` | `EditOpportunity` |
| `/enabler/profile` | `EnablerProfile` |
| `/enabler/edit-profile` | `EditProfile` |
| `/enabler/profile-setup` | `EnablerProfileSetup` |
| `/enabler/recommendations` | `Recommendations` |
| `/enabler/applicants/:id` | `Applicants` |
| `/enabler/pathfinder/:id` | `PathfinderProfile` |
| `/enabler/contact/:id` | `ContactPathfinder` |
| `/enabler/bookmarked-pathfinders` | `EnablerPathfinderBookmarks` |
| `/enabler/settings` | `Settings` |

### Shared / Legacy

| Path | Notes |
|---|---|
| `/notifications` | Any authenticated user |
| `/kyc` | Any authenticated user |
| `/dashboard` | Redirects to role dashboard via `RoleRedirect` |
| `/opportunity` | Redirects to `/available-opportunities` |
| `/emppro` | Redirects to `/enabler/dashboard` |
| `/dash-employer` | Redirects to `/enabler/dashboard` |
| `/dash-freelance` | Redirects to `/pathf` |
| `*` | `NotFound` (404 page) |

---

## API Client (api.js)

**File:** `src/services/api.js`

### Configuration

```js
BASE_URL = process.env.REACT_APP_API_BASE_URL
        || "https://afrivate-backend-production.up.railway.app"

API_PREFIX = process.env.REACT_APP_API_PREFIX ?? "/api"
```

All requests go to `BASE_URL + API_PREFIX + path` unless `path` already starts with `http`.

### `request(method, path, options)`

Central HTTP helper. Notable behavior:

- Sets `Authorization: Bearer <token>` from localStorage unless `options.public = true`
- Accepts `options.body` or `options.data` (either is JSON-serialized; FormData is passed raw)
- Deletes `Content-Type` when body is FormData (browser must set the multipart boundary)
- On HTTP 401: attempts one token refresh via `/auth/token/refresh/`; module-level `isRetryingAfter401` flag prevents infinite loops
- After a failed refresh: calls `clearTokens()` and throws with status 401
- Throws `{ status, body, message }` on any non-2xx response

### Token Storage (localStorage keys)

| Key | Purpose |
|---|---|
| `afrivate_access` | JWT access token |
| `afrivate_refresh` | JWT refresh token |
| `afrivate_role` | `"pathfinder"` or `"enabler"` |

Helper exports: `getAccessToken()`, `getRefreshToken()`, `setTokens()`, `clearTokens()`, `setRole()`, `getRole()`

### Error Handling

`getApiErrorMessage(err)` flattens nested Django validation errors into a single user-facing string. It checks `err.body.detail`, `err.body.message`, `err.body.non_field_errors`, then recursively flattens nested field errors.

### Endpoint Modules

**`auth`** — register, login, logout, OTP verify/resend, forgot/reset password, change password, Google OAuth (pathfinder + enabler routes), token refresh, delete account

**`bookmark` / `bookmarks`** (aliased) — opportunity bookmarks (pathfinder saves opps), applicant bookmarks (enabler saves pathfinders), enabler bookmarks (pathfinder saves orgs). Payload builders in `opportunitiesSavedCreate` and `applicantsSavedCreate` silently drop unknown fields.

**`notifications`** — list, create, markRead, markAllRead

**`profile`** — pathfinder CRUD, enabler CRUD, picture upload (multipart), credentials CRUD (multipart for upload), social links CRUD

**`waitlist`** — create (join waitlist), stats

**`applications`** — list, create (JSON or multipart), get, update, patch, withdraw (DELETE), updateStatus (enabler accept/reject)

**`opportunities`** — list (with query params), create, get (public), update, patch, delete, applicantsList, getApplicant

### Google Auth

`googleAuthWithRole({ idToken, mode, role })`:
- Signup: routes to role-specific endpoint (`/auth/google/pathfinder/` or `/auth/google/enabler/`)
- Login: tries pathfinder first, falls back to enabler on 400/404

---

## UserContext

**File:** `src/context/UserContext.js`

Single source of truth for the authenticated user. Wraps the entire app inside `UserProvider` (set up in `App.js`).

### Exposed Values

```js
const { user, loading, error, updateUser, logout, refetchUser, clearError } = useUser();
```

| Value | Type | Description |
|---|---|---|
| `user` | object \| null | Normalized profile; null if not logged in |
| `loading` | boolean | True during initial profile fetch |
| `error` | string \| null | Last fetch error |
| `updateUser(patch)` | function | Merge patch into current user object |
| `logout()` | async function | Calls API logout, clears tokens, sets user to null |
| `refetchUser()` | async function | Re-runs the profile fetch (call after saves) |
| `clearError()` | function | Resets error to null |

### `user` Shape

```js
{
  id: number,
  name: string,           // "First Last" for pathfinder, org name for enabler
  role: "Pathfinder" | "Enabler",
  profileCompletion: 75,  // static placeholder
  profileViews: 0,        // static placeholder
  earningsThisMonth: 0,   // static placeholder
  activeProjects: [],     // static placeholder
  recentEarnings: [],     // static placeholder
  raw: { ...apiResponse } // full API response (use for field access)
}
```

### Cross-Tab Sync

A `storage` event listener on `window` re-fires `fetchUser()` whenever `afrivate_access` or `afrivate_role` changes in another tab. This keeps all open tabs in sync on login/logout.

### `fetchUser()` Logic

1. Check `afrivate_access` in localStorage — if absent, set user to null and stop
2. Check `afrivate_role` — if absent, stop (no role means can't determine which profile API to call)
3. Call role-specific profile API (`/profile/enablerprofile/` or `/profile/pathfinderprofile/`)
4. Normalize response with `normalizeEnablerProfile` or `normalizePathfinderProfile`
5. If API response has no `id`, set user to null (incomplete profile)

---

## Profile Page (EditNewProfile.js)

**File:** `src/pages/pathfinder/EditNewProfile.js`

The most complex page in the app. Handles three scenarios:
1. **New user** — no existing profile data, starts in edit mode, shows redirect countdown after first save
2. **Existing user** — has profile data, starts in preview mode, can switch to edit mode
3. **Profile setup route** — `/pathfinder/profile-setup` renders the same component as `/profile`

### Key State & Refs

| Variable | Type | Why |
|---|---|---|
| `isFirstSaveRef` | `useRef(true)` | Ref (not state) — must be stable inside `handleSave()` without causing re-renders. Flips to `false` when non-empty profile data is found on load. |
| `isPreviewMode` | `useState(true)` | Starts true; set to false when no profile data found (new users skip preview). |
| `redirectCountdown` | `useState(null)` | Only activated after the first-ever save (when `wasFirstSave === true`). Counts 5→0 then navigates to `/pathf`. |
| `initialSocialLinksRef` | `useRef([])` | Snapshot of social links as loaded from the server; used as the "previous" state for `syncSocialLinksRestApi`. |

### Save Flow (`handleSave`)

```
1. Build base_details from form state via buildPathfinderBaseDetails()
2. Build full body via buildPathfinderProfileBody()
3. Try PUT /profile/pathfinderprofile/; on 404 → PATCH (first time)
4. If socialLinksHaveRestIds → syncSocialLinksRestApi(initial, current)
5. Upload credentials via Promise.all (each .catch'd individually)
6. Call refetchUser() to sync UserContext
7. If wasFirstSave → start redirectCountdown
```

**Why REST sync for social links:** When the server returns social links with `id` fields, they must be updated/deleted individually via `/profile/social-links/<id>/` rather than embedded in the profile body. The embedded payload approach only works for new links.

### Preview vs Edit Mode

- **Preview:** Shows read-only profile card with "Edit Profile" button
- **Edit:** Full form with all fields, "Save Profile" button
- Mode toggle via `setIsPreviewMode()` — profile data is pre-loaded into form state before switching to edit

### Website Normalization

Website input is passed through `normalizeWebsiteForStorage()` before saving: adds `https://` prefix if the user typed a bare domain. `http://` and `https://` prefixes are left unchanged.

---

## Page-by-Page Reference

### Landing (`/`)

Public marketing page. Waitlist sign-up form uses `waitlist.create()`. CookieConsent component renders on top of all pages.

### AvailableOpportunities (`/available-opportunities`)

- Fetches all open opportunities on mount via `opportunities.list({ is_open: true })`
- Client-side search (title + description)
- Client-side pagination using `Pagination` component
- "View Details" calls `navigateToVolunteerDetails()` — never direct `navigate()`

### VolunteerDetails (`/volunteer-details`)

Receives `job` and `existingApplication` from router state. `job._raw.description` is the full combined description string; `parseDescription()` extracts individual sections.

Share button calls `navigator.share()` (Web Share API) with a link from `createOpportunityLink()`. Falls back to clipboard copy.

### ApplyApplication (`/apply/:opportunityId`)

Reads custom questions from `job._raw?.description || job.description` via `parseDescription()`. Builds a structured cover letter with labeled sections:

```
Contact details: ...
About me: ...
Why I am applying: ...
Additional questions and answers:
Q: ...
A: ...
```

Pre-fills CV from profile credentials list when a credential named "CV" exists.

On edit (existing application), parses the cover letter back into individual fields.

### MyApplications (`/my-applications`)

Lists all submitted applications. Withdrawal only available when status is `"pending"`. Navigation to opportunity details uses `navigateToVolunteerDetails()`.

### Bookmarks (`/bookmarks`) — Pathfinder

Two independent sections:

1. **Saved Opportunities** — `bookmarks.opportunitiesSavedList()`, delete via `bookmarks.opportunitiesSavedDelete(opportunityId)`
2. **Saved Organisations** — `bookmarks.enablersSavedList()`, delete via `bookmarks.enablersSavedDelete(enablerId)`

For org bookmarks, the enabler ID is read from `row.enabler_user_id ?? row.enabler_id ?? row.enabler`. Both sections reload on `window` focus event.

### Notifications (`/notifications`)

Unread detection: `item.current_user_read === false` (explicit false check, not falsy).

"View details" link: renders `<Link>` (React Router) for paths starting with `/`; renders `<a target="_blank">` for external URLs.

Mark-all-read uses `notifications.markAllRead()`.

### Applicants (`/enabler/applicants/:id`) — Enabler

Lists all applicants for a given opportunity. Key field: **`app.applicant_id`** is the Django auth user ID used for both viewing the applicant profile and for bookmark operations. Do not use `app.id` (application row ID), `app.pathfinder`, or `app.user_id`.

Bookmark error messages surface from `err.body.non_field_errors[0]` or `err.body.detail`.

### EnablerPathfinderBookmarks (`/enabler/bookmarked-pathfinders`) — Enabler

Displays bookmarked pathfinders. Key fields:
- `row.pathfinder_details` — name, role, location (read-only, from backend join)
- `row.pathfinder_user_id` — used for navigation to `/enabler/pathfinder/:id` and for delete calls
- Rows where `pathfinder_user_id` is null are filtered out before render

### CreateOpportunity / EditOpportunity — Enabler

Uses `combineDescription()` to pack all form sections into the single `description` field before POST/PATCH. Custom questions array is JSON-stringified inside the `[CUSTOM_QUESTIONS]` marker.

---

## Components Reference

### `RequireAuth` (`src/components/auth/RequireAuth.js`)

```jsx
<RequireAuth role="pathfinder">
  <SomePage />
</RequireAuth>
```

Synchronous check of localStorage. Props:
- `role` — optional. If provided, wrong-role users are redirected to their correct dashboard.
- If no token: redirects to `/login` with `state.from` set (for post-login redirect).

### `Navbar` (`src/components/auth/Navbar.js`)

- **Positioning:** `fixed top-0 z-20` — does not use `sticky`
- Loads unread notification count on mount via `notifications.list()`
- Shows red badge on bell icon with unread count
- All pages use `pt-14` (56px) top padding to clear the ~54px navbar height

### `Pagination` (`src/components/common/Pagination.js`)

```jsx
<Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
```

Returns `null` when `totalPages <= 1`. All list pages do client-side slicing — no server-side pagination is used in list views.

### `ErrorBoundary` (in `src/App.js`)

Class component wrapping the entire app. Catches uncaught render errors, shows a "Something went wrong / Refresh" fallback. Logs to console via `componentDidCatch`.

### `RoleRedirect` (in `src/App.js`)

Used on legacy routes. Reads `user.role` from `useUser()` and redirects to the role-appropriate path. Shows a spinner while `loading` is true.

### `CookieConsent` (`src/components/CookieConsent.js`)

GDPR cookie banner. Renders at the bottom of the page for all routes. Consent state stored in localStorage via `cookieConsent.js` utils.

---

## Custom Questions Pattern

Enablers can add custom application questions when creating/editing an opportunity. Since the backend has a single `description` field, the questions array is embedded using the `[CUSTOM_QUESTIONS]` marker.

### Storage Format

```
[DESCRIPTION]
Main description text...

[KEY_RESPONSIBILITIES]
Responsibilities text...

[CUSTOM_QUESTIONS]
[{"id":"q1","question":"Why do you want to volunteer?"},{"id":"q2","question":"Availability?"}]
```

### Flow

**Enabler (writing):**
1. Builds `customQuestions = [{ id, question }]` array in form state
2. Passes to `combineDescription({ ..., customQuestions })` before API call
3. `combineDescription()` JSON-stringifies the array after the `[CUSTOM_QUESTIONS]` marker

**Pathfinder (reading):**
1. `navigateToVolunteerDetails()` fetches the opportunity, puts full data in `job._raw`
2. `VolunteerDetails` passes `job._raw.description` to `parseDescription()`
3. `ApplyApplication` reads `job._raw?.description || job.description`, parses it
4. `customQuestions` array is rendered as labeled text inputs in the application form
5. Answers are appended to the cover letter under "Additional questions and answers:"

**Critical:** Always use `_raw.description` (not `job.description`) in `ApplyApplication`. The `job.description` field may be an abbreviated preview string that doesn't contain the `[CUSTOM_QUESTIONS]` marker.

---

## Pagination

Client-side only. No server-side pagination is implemented in list views.

Pattern used across all list pages:

```js
const ITEMS_PER_PAGE = 10; // varies by page
const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
const paginated = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
```

`Pagination` component handles prev/next UI and returns null when `totalPages <= 1`.

---

## Notifications

**File:** `src/pages/Notifications.js`

- Fetches all notifications on mount
- Unread check: `item.current_user_read === false` (strict equality — the field is a boolean, not a count)
- "Mark all read" button calls `notifications.markAllRead()`
- Individual mark-read on click via `notifications.markRead(id)`
- Link routing: internal paths (starting with `/`) → React Router `<Link>`; external URLs → `<a target="_blank" rel="noopener noreferrer">`

Navbar bell badge count is fetched independently in `Navbar.js` on mount (not shared via context).

---

## Bookmarks

Three separate bookmark types, each with its own API endpoint group:

### Pathfinder: Saved Opportunities

| Action | API call |
|---|---|
| List | `bookmarks.opportunitiesSavedList()` |
| Save | `bookmarks.opportunitiesSavedCreate({ opportunity_id })` |
| Remove | `bookmarks.opportunitiesSavedDelete(opportunityId)` |

### Pathfinder: Saved Organisations (Enablers)

| Action | API call |
|---|---|
| List | `bookmarks.enablersSavedList()` |
| Save | `bookmarks.enablersSavedCreate({ enabler_id })` |
| Remove | `bookmarks.enablersSavedDelete(enablerId)` |

The enabler ID comes from `row.enabler_user_id ?? row.enabler_id ?? row.enabler` (listed in priority order from the API response shape).

### Enabler: Saved Pathfinders

| Action | API call |
|---|---|
| List | `bookmarks.applicantsSavedList()` |
| Save | `bookmarks.applicantsSavedCreate({ pathfinder_id })` |
| Remove | `bookmarks.applicantsSavedDelete(pathfinderId)` |

For the Applicants page, the pathfinder ID is `app.applicant_id` (the Django auth user ID from the application row). Using `app.id` or `app.user_id` is wrong.

For `EnablerPathfinderBookmarks`, the ID for navigation and delete is `row.pathfinder_user_id` (not `row.pathfinder_details.id`).

---

## Styling Conventions

- **CSS framework:** Tailwind CSS v3 with `tailwind.config.js`
- **Brand color:** `#6A00B1` (used as `text-[#6A00B1]`, `bg-[#6A00B1]`, `border-[#6A00B1]`)
- **Hover:** `hover:bg-[#5A0091]`
- **Navbar height:** ~54px; all pages use `pt-14` (56px) top padding to avoid content hidden behind the fixed navbar
- **Overflow:** `overflow-x-hidden` on the root div in `App.js`
- **Font:** default sans-serif via Tailwind (`font-sans`)
- **Background:** `bg-gray-50` on root; `bg-white` on cards/panels

No CSS Modules, no styled-components, no Sass. All styles are inline Tailwind utility classes.

---

## ESLint & Build

- **Build command:** `npm run build` (Create React App, `react-scripts build`)
- **CI flag:** `CI=true` in Vercel build settings → warnings are treated as errors
- **ESLint:** CRA default config. The `no-unused-vars` rule is enforced. Any unused import must be removed or suppressed with `// eslint-disable-next-line no-unused-vars`
- **Known suppression:** `PrivacyPolicy` import in `App.js` is suppressed because it's used in a `<Route>` element (lint can't detect JSX usage in some configs)

If the build fails due to an ESLint warning, it's almost always an unused variable or missing dependency in a `useEffect` deps array.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `https://afrivate-backend-production.up.railway.app` | Backend base URL |
| `REACT_APP_API_PREFIX` | `/api` | API path prefix |

Set these in `.env.local` for local development or in the Vercel project settings for production.

No other `REACT_APP_` variables are currently used by the app code.

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd <repo-directory>

# 2. Install dependencies
npm install

# 3. (Optional) Create local env file
echo "REACT_APP_API_BASE_URL=https://afrivate-backend-production.up.railway.app" > .env.local

# 4. Start development server
npm start
```

App runs at `http://localhost:3000`. Hot reloading is enabled.

### Notes

- The `main` index file is `src/index.js`, which wraps `<App />` in `<BrowserRouter>`
- `App.js` wraps everything in `<UserProvider>` and `<ErrorBoundary>`
- No mock server is configured — all API calls go to the live Railway backend by default

---

## Deployment (Vercel)

- **Platform:** Vercel
- **Build command:** `npm run build` (or `CI=true npm run build`)
- **Output directory:** `build/`
- **Framework preset:** Create React App
- **CI=true:** Set as a Vercel environment variable — turns ESLint warnings into build errors

### Rewrite Rule

Because this is a SPA with `BrowserRouter` (not hash router), Vercel needs a rewrite rule so that deep links don't 404:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This is configured in `vercel.json` (or via the Vercel dashboard under "Rewrites").

### Environment Variables on Vercel

Set `REACT_APP_API_BASE_URL` and `REACT_APP_API_PREFIX` in the Vercel project's Environment Variables panel (Settings → Environment Variables). These are baked into the build at compile time by Create React App.

---

## Testing

No automated test suite is currently configured. The default `src/App.test.js` from Create React App is present but not expanded.

Manual testing checklist:
- [ ] Login / logout (both roles)
- [ ] Google OAuth login (both roles)
- [ ] Pathfinder: profile create (new user redirect countdown)
- [ ] Pathfinder: profile edit (existing user preview/edit toggle)
- [ ] Enabler: create opportunity with all sections + custom questions
- [ ] Pathfinder: apply to opportunity with custom question answers
- [ ] Pathfinder: bookmark and unbookmark an opportunity
- [ ] Pathfinder: bookmark and unbookmark an organisation
- [ ] Enabler: bookmark a pathfinder applicant
- [ ] Notifications: mark individual and all-read
- [ ] Cross-tab logout sync

---

## Known Issues & Limitations

1. **No real-time updates:** Notifications count is loaded once on Navbar mount; no polling or WebSocket. Users must refresh to see new notifications.

2. **Client-side pagination only:** All list pages fetch the full dataset and paginate in memory. Large datasets may cause slow loads or excessive API payload sizes.

3. **`profileCompletion`, `profileViews`, `earningsThisMonth` are static placeholders** — hardcoded to 75 / 0 / 0 in `UserContext` normalizers. Not computed from real data.

4. **Social links REST sync only when IDs exist:** New social links are sent nested in the profile body. If the backend assigns IDs to the links, subsequent edits must use the individual REST endpoints. This logic is in `syncSocialLinksRestApi`.

5. **Website validation is loose:** Only adds `https://` prefix; does not validate that the URL is reachable.

6. **No optimistic UI:** Bookmark/save operations block the UI until the API responds.

7. **`/volunteer-details` is state-only:** No shareable URL for a specific opportunity. Sharing uses `createOpportunityLink()` to generate a slug-based `afrivate.com` URL, but navigating there shows the Afrivate website, not this app.

8. **No error boundary per page:** The single `ErrorBoundary` in `App.js` catches any uncaught render error and shows a full-screen "Something went wrong" fallback, losing all page context.

---

## Merge Instructions

To merge the `light` branch into `main`:

```bash
# From main branch
git fetch origin
git checkout main
git merge origin/light --no-ff -m "merge: light branch — bug fixes, bookmarks, custom questions, profile"
```

**Pre-merge checklist:**
- [ ] Run `npm run build` locally and confirm no ESLint errors
- [ ] Test profile save flow for both new and existing pathfinder users
- [ ] Test custom questions round-trip: create opportunity with questions → apply → check cover letter
- [ ] Test bookmark operations (add/remove) for all three bookmark types
- [ ] Confirm `/opportunity` redirects to `/available-opportunities`
- [ ] Confirm social links save correctly for both new links (no IDs) and existing links (with IDs)

**No database migrations required** — all changes are frontend-only. The backend API is unchanged.

---

## Changelog

### light branch (current)

- **Fix:** Guard empty location span in `VolunteerDetails` to prevent crash when location is undefined
- **Fix:** Wire up share button (Web Share API with clipboard fallback)
- **Fix:** Reduce navbar offset from `pt-20` to `pt-14` on all pages to match actual navbar height (~54px)
- **Fix:** Remove redundant `sticky` class from pages that used both `sticky` and the global fixed navbar
- **Fix:** Redirect `/opportunity` to `/available-opportunities`; fix legacy route handling
- **Fix:** Load custom questions from router `state._raw.description` in `ApplyApplication` (not the stripped preview string)
- **Fix:** Add bookmarked organisations section to `Bookmarks.js`
- **Refactor:** Replace all direct `navigate("/volunteer-details", { state: { job } })` calls with `navigateToVolunteerDetails()` utility so full description always travels with the job object
- **Fix:** Use `app.applicant_id` (Django auth user ID) in `Applicants.js` for bookmark operations — previous code used `app.pathfinder` which was always `undefined`
- **Fix:** Use `row.pathfinder_user_id` in `EnablerPathfinderBookmarks.js` instead of `row.pathfinder_details.id`
- **Docs:** Add `LIGHT_BRANCH_CHANGES.md` with full change log

### master (prior state)

- Initial SPA with auth, opportunity browsing, application submission, profile management
- Hash Router (now replaced with BrowserRouter)
- No custom questions support
- Partial bookmark implementation
