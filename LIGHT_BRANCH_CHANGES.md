# Afrivate Volunteer Module — `light` Branch Change Log

**Prepared for:** Afrivate Technologies Development Team  
**Branch:** `light` (frontend) / corresponding backend branch  
**Date:** 2026-04-22  
**Author:** Engineering session log  

---

## 1. Overview

The `light` branch is a feature and fix branch built on top of `main` for the **Afrivate Volunteer Module**. It was developed to move the volunteer module from a partially-wired proof-of-concept to a production-ready state.

### What it fixes
- Broken API connections (wrong endpoint paths, missing fields, silent failures)
- Multi-tab session crash caused by shared `localStorage` writes racing across tabs
- Incorrect bookmark IDs being sent to the backend (profile model PK sent instead of Django auth user ID)
- Custom questions in the application form never loading when navigating via `location.state`
- Navbar height offset mismatch (80 px offset for a ~54 px navbar, causing visible gaps)
- All `navigate('/opportunity')` calls pointing to a removed route
- `sticky` and `fixed` positioning conflict on both navbars

### What it adds
- Full pathfinder profile page (`/profile`) with preview-first UX, social links, documents, and inline credential name editing via the main Save button
- Enabler-facing read-only pathfinder profile page with bookmark and contact buttons
- Saved Organisations section in the pathfinder Bookmarks page
- Pagination on all list views (applicants, opportunities, bookmarks)
- PathfinderSettings page at `/pathfinder/settings` (password change, delete account)
- Web Share API on the Volunteer Details share button with clipboard fallback
- Real backend error messages surfaced in toast notifications

---

## 2. How to Run Locally

### Frontend

```bash
git clone https://github.com/Afrivate-dev/Afrivate_Volunteer_Module_Frontend.git
cd Afrivate_Volunteer_Module_Frontend
git checkout light
npm install
cp .env.example .env          # edit .env with correct values
npm start                     # runs on http://localhost:3000
```

**Node version:** 18+ recommended  
**Package manager:** npm (no yarn/pnpm lockfile present)

### Backend

```bash
git clone <backend-repo-url>
cd <backend-repo>
git checkout <light-equivalent-branch>
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # edit .env with correct values
python manage.py migrate
python manage.py runserver    # runs on http://localhost:8000
```

**Python version:** 3.10+  
**Framework:** Django + Django REST Framework

---

## 3. Environment Variables

### Frontend (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `REACT_APP_API_BASE_URL` | No | `https://afrivate-backend-production.up.railway.app` | Backend base URL, no trailing slash. Override to point at local backend during development. |
| `REACT_APP_API_PREFIX` | No | `/api` | Path prefix for all API calls. Set to empty string if backend has no prefix. |
| `REACT_APP_GOOGLE_CLIENT_ID` | No | — | Google OAuth 2.0 client ID for Sign in with Google. Required if Google auth is enabled. |

> **Note:** All three variables are optional with sensible defaults. The frontend will use the Railway production backend unless `REACT_APP_API_BASE_URL` is overridden.

### Backend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | Yes | Django secret key |
| `DEBUG` | Yes | `True` for local development, `False` in production |
| `DATABASE_URL` | Yes | PostgreSQL connection string (Railway injects this automatically on Railway) |
| `ALLOWED_HOSTS` | Yes | Comma-separated list of allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Yes | Frontend origins permitted to call the API (e.g. `https://afrivate.vercel.app`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID for server-side token verification |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | No | SMTP credentials for password reset and OTP emails |

---

## 4. Deployment

### Frontend — Vercel

- **Repository:** `Afrivate-dev/Afrivate_Volunteer_Module_Frontend`
- **Branch deployed:** `light`
- **Build command:** `npm run build`
- **Output directory:** `build`
- **Framework preset:** Create React App
- **Environment variables:** Set in the Vercel project dashboard under Settings → Environment Variables. Mirror the values from the `.env` table above.
- **Routing:** The project uses React Router client-side routing. Vercel must be configured with a rewrite rule so all paths resolve to `index.html`:
  - Add a `vercel.json` at the project root if not already present:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

### Backend — Railway

- **Service:** Django REST Framework API
- **Branch deployed:** The backend branch corresponding to `light`
- **Start command:** `gunicorn <project>.wsgi --log-file -`
- **Environment variables:** Set in the Railway project dashboard. Railway automatically injects `DATABASE_URL` and `PORT`.
- **Database:** PostgreSQL (Railway managed)
- **CORS:** `CORS_ALLOWED_ORIGINS` must include the Vercel frontend URL for the `light` deployment.
- **Migrations:** Run `python manage.py migrate` as a release command or manually via Railway shell after each deploy.

### Linking frontend ↔ backend

Set `REACT_APP_API_BASE_URL` in the Vercel project to the Railway backend URL for the `light` deployment, e.g.:

```
REACT_APP_API_BASE_URL=https://afrivate-backend-light.up.railway.app
```

---

## 5. What Changed — Summary Table

### Auth

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Auth | `src/services/api.js` | Replaced smart/curly quotes with ASCII quotes in all string literals | Caused silent syntax errors in some environments |
| Auth | `src/services/api.js` | Hardened `request()` — throws `Error` with `.status`, `.body` (parsed JSON), `.message` (`data.detail` fallback) | Downstream catch blocks needed structured error objects to show backend messages |
| Auth | `src/services/api.js` | Fixed API endpoint URLs (removed double-slash prefixes, corrected path segments) | Requests were hitting 404s silently |
| Auth | `src/context/UserContext.js` | Fixed multi-tab session crash — `localStorage` writes from multiple tabs racing caused state corruption | Users were being logged out unexpectedly when two tabs were open |
| Auth | `src/context/UserContext.js` | UserContext synced after profile save | Navbar and greeting showed stale name after editing profile |
| Auth | `src/pages/auth/SetPassword.js` | Existing page; Set Password link removed from pathfinder sidebar nav (was redundant with Settings page) | Sidebar clutter |
| Auth | `src/components/auth/Navbar.js` | Removed `sticky` class (conflicts with `fixed`); removed Set Password sidebar link | `fixed` and `sticky` on the same element — `fixed` wins but `sticky` polluted the class list |
| Auth | `src/components/auth/EnablerNavbar.js` | Removed `sticky` class | Same conflict as above |

---

### Profiles — Pathfinder

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Profile | `src/pages/pathfinder/EditNewProfile.js` | Route renamed from `/edit-new-profile` → `/profile` | Cleaner URL; old route still redirects |
| Profile | `src/pages/pathfinder/EditNewProfile.js` | Default `isPreviewMode` changed to `true` (preview-first). Overridden to `false` on load if profile data is empty (new user) | Existing users should land on their profile preview, not in edit mode |
| Profile | `src/pages/pathfinder/EditNewProfile.js` | First-time save detection changed from `!loadedProfileId` to `isFirstSaveRef` (ref that flips only when non-empty profile data is found on load) | Some backends create a skeleton profile on signup with an ID but no data — the old check caused false-negatives |
| Profile | `src/pages/pathfinder/EditNewProfile.js` | First-time save: show preview for 5 s then redirect to `/pathf`. Subsequent saves: preview only, no redirect | New users need onboarding flow; returning users just want to see their saved changes |
| Profile | `src/pages/pathfinder/EditNewProfile.js` | Social links section added with REST sync (`PUT` per link); Refresh and PUT buttons removed from rows — changes saved by main Save button | Reduced UI complexity; one save button for everything |
| Profile | `src/pages/pathfinder/EditNewProfile.js` | Credential Rename button removed; name is now an editable inline input saved by the main Save button via `Promise.all` + `credentialsPatch` per credential | Fewer buttons per row; unified save |
| Profile | `src/pages/pathfinder/EditNewProfile.js` | Removed `handlePatchCredentialName`, `refreshSocialLinkFromServer`, `handleSocialLinkPut`, unused `Link` import | Functions became orphaned after UI simplification; ESLint errors before build |
| Profile | `src/pages/pathfinder/EditNewProfile.js` | Full preview render expanded to show all fields: contact info, location, about, work experience, skills (pills), education, certifications, social links (chips), documents (file links) | Preview was incomplete — only showed basic fields |
| Profile | `src/pages/pathfinder/PathfinderSettings.js` | Removed: Cancel buttons (desktop + mobile), Edit Photo button and photo section, Documents section (moved to profile page), Social Links section (moved to profile page), Change Password section (stays in Settings, but layout cleaned) | Settings page was duplicating profile editing functionality |
| Profile | `src/pages/pathfinder/PathfinderSettings.js` | Edit Profile link confirmed pointing to `/profile` | Was pointing to `/pathfinder/edit-profile` (wrong path) |

---

### Profiles — Enabler / Organisation

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Enabler profile | `src/pages/enabler/PathfinderProfile.js` | Complete rewrite — now shows full read-only pathfinder profile matching the EditNewProfile preview layout | Old page was a skeleton with no actual profile data |
| Enabler profile | `src/pages/enabler/PathfinderProfile.js` | Bookmark logic: applicant flow (with `opportunityId`) uses `applicantsSavedCreate/Delete`; generic flow uses `bookmarks.create/delete` | Two separate bookmark systems for applicants vs. general recommendations |
| Enabler profile | `src/pages/enabler/PathfinderProfile.js` | Contact button navigates to `/enabler/contact/${id}` | Was missing |
| Org profile | `src/pages/pathfinder/OrganizationProfile.js` | All icon+data rows guarded with conditionals; empty state messages added | Bare icons rendered when fields were null |

---

### Opportunities

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Routing | `src/App.js` | `/opportunity` route replaced with `<Navigate to="/available-opportunities" replace />`; unused `Opportunity` component import removed | The old Opportunity page was superseded by AvailableOpportunities |
| Routing | `src/pages/pathfinder/PathfinderDashboard.js`, `Bookmarks.js`, `MyApplications.js`, `VolunteerDetails.js` | All `navigate('/opportunity')` calls updated to `navigate('/available-opportunities')` | Consistency; these were pointing at the now-redirected route |
| Opportunity details | `src/pages/pathfinder/VolunteerDetails.js` | Description displayed using `parseDescription()` — splits `[DESCRIPTION]`, `[KEY_RESPONSIBILITIES]`, `[REQUIREMENTS_BENEFITS]`, `[ABOUT_COMPANY]`, `[APPLICATION_INSTRUCTIONS]` into separate sections | Backend stores all sections in one `description` field with section markers |
| Opportunity details | `src/pages/pathfinder/VolunteerDetails.js` | Location, Work Model, Time Commitment extracted from parsed description sections and shown in the Job Summary sidebar card | These fields were embedded in the description, not separate API fields |
| Opportunity details | `src/pages/pathfinder/VolunteerDetails.js` | Similar opportunity cards now use `navigateToVolunteerDetails()` instead of inline `navigate()` with `?id=` query param | Inline navigate passed a job object without `description`; `navigateToVolunteerDetails` always fetches fresh API data first |
| Opportunity details | `src/pages/pathfinder/VolunteerDetails.js` | Share button wired: uses `navigator.share()` (Web Share API) with `navigator.clipboard.writeText()` as fallback; shows toast on clipboard copy | Button had no `onClick` handler |
| Dashboard | `src/pages/pathfinder/PathfinderDashboard.js` | Recommended opportunity cards Apply button uses `navigateToVolunteerDetails()` | Was using inline `navigate()` which passed a job object missing `description` |
| Dashboard | `src/pages/pathfinder/PathfinderDashboard.js` | `{item.location}` wrapped in `{item.location && (...)}` guard | Empty string was producing a rendered but invisible `<span>` |
| Create | `src/pages/enabler/CreateOpportunity.js` | "Edit Details" button removed from preview step (beside "Confirm & Post") | Redundant — top-right Edit button already handles going back |
| Create | `src/pages/enabler/CreateOpportunity.js` | `handleEditFromPreview` function removed | Became orphaned after Edit Details button was removed |
| List | `src/utils/opportunityUtils.js` | `navigateToVolunteerDetails()` helper created and exported — fetches fresh opportunity data before navigating, builds consistent `safeJob` object with `description`, falls back to passed `fallbackJob` | Centralises navigation logic; ensures description is always present |
| List | `src/utils/descriptionUtils.js` | `parseDescription()`, `combineDescription()`, `formatTextContent()`, `createOpportunityLink()` utilities created | Parsing multi-section descriptions stored as a single backend field |

---

### Applications

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Apply | `src/pages/pathfinder/ApplyApplication.js` | Custom questions now loaded from `location.state` path by calling `parseDescription(job._raw?.description \|\| job.description)` | `parseDescription` was only called in the API fallback path; navigating from the UI passed the job via state which skipped the API call |
| Apply | `src/pages/pathfinder/ApplyApplication.js` | `_raw.description` preferred over `job.description` | `job.description` from `AvailableOpportunities` is a stripped preview (markers removed); `_raw.description` is the full combined string including `[CUSTOM_QUESTIONS]` |
| Apply | `src/pages/pathfinder/ApplyApplication.js` | Cover letter built as structured text with headings (`Contact details:`, `About me:`, `Why I am applying:`, `Additional questions and answers:`) | Enables the enabler's applicant view to parse and display individual sections |
| Apply | `src/pages/pathfinder/ApplyApplication.js` | Profile CV pre-filled from credentials if a credential named "CV" exists | Avoid requiring re-upload on every application |
| Applicants | `src/pages/enabler/Applicants.js` | `applicant_id` (Django auth user ID) used for `bookmarkPathfinderId` and `userId` instead of fallback chain `app.pathfinder ?? app.pathfinder_id ?? ... ?? app.user_id` | Old chain resolved to `undefined` for all fields; `applicant_id` is the correct auth user ID returned by the `applicantsList` endpoint |
| Applicants | `src/pages/enabler/Applicants.js` | View Profile navigates to `/enabler/pathfinder/${app.userId}` (no fallback to `app.id`) | Ensures the correct Django user ID is passed, not the application row ID |
| Applicants | `src/pages/enabler/Applicants.js` | Bookmark error toast now reads `err.body.non_field_errors[0]` or `err.body.detail` from the API error before falling back to a generic message | Shows actionable backend errors (e.g. "Bookmark already exists") instead of a generic fallback |
| My Applications | `src/pages/pathfinder/MyApplications.js` | "Browse Opportunities" empty-state button navigates to `/available-opportunities` | Was pointing at the removed `/opportunity` route |

---

### Bookmarks

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Opportunity bookmarks | `src/pages/pathfinder/Bookmarks.js` | "Saved Organisations" section added — calls `bookmarks.enablersSavedList()`, maps `enabler_details` (name, location), navigates to `/organization/${enabler_user_id}`, removes via `enablersSavedDelete` | Pathfinders could bookmark organisations but had no place to view them |
| Opportunity bookmarks | `src/pages/pathfinder/Bookmarks.js` | Both sections reload on `window focus` event | Keeps list fresh if user navigates away and back |
| Applicant bookmarks | `src/pages/enabler/EnablerPathfinderBookmarks.js` | Mapping rewritten to use `row.pathfinder_details` (name/role/location) and `row.pathfinder_user_id` for all navigation and delete calls | Old fallback chain resolved to wrong IDs; response shape was confirmed with backend |
| Applicant bookmarks | `src/pages/enabler/EnablerPathfinderBookmarks.js` | Filter drops rows where `pathfinder_user_id` is null | Prevents broken cards rendering if the backend hasn't deployed `pathfinder_user_id` yet |

---

### Notifications

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Notifications | `src/pages/Notifications.js` | Full notifications page — lists all notifications, mark-as-read per item, mark-all-read button, unread count badge | Was not connected to the API |
| Notifications | `src/pages/Notifications.js` | "View details" link is a React Router `<Link>` for internal paths (starts with `/`) or a plain `<a target="_blank">` for external URLs | Notification `link` field can point to internal routes or external resources |
| Notifications | `src/components/auth/Navbar.js`, `EnablerNavbar.js` | Unread notification count badge on the bell icon, polled on mount | Users had no visual indication of unread notifications |

---

### Settings

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Settings | `src/pages/pathfinder/PathfinderSettings.js` | New page at `/pathfinder/settings` — profile summary card (read-only), Change Password, Set Password (Google sign-in users), Delete Account | There was no dedicated settings page for pathfinders |
| Settings | `src/pages/pathfinder/PathfinderSettings.js` | All credential/document functions removed (moved to profile page); all social link functions removed (moved to profile page) | Deduplication — these now only live in EditNewProfile |

---

### Routing

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Routing | `src/App.js` | `/opportunity` → `<Navigate to="/available-opportunities" replace />` | Route removed; all consumers updated to point directly at new route |
| Routing | `src/App.js` | `/profile` added as the canonical pathfinder profile/edit route | Was `/edit-new-profile` which was confusing |
| Routing | `src/App.js` | 5 legacy pages removed and replaced with role-aware `<Navigate>` redirects (`/dash-employer`, `/dash-freelance`, etc.) | Dead pages were accessible and confusing |
| Routing | `src/App.js` | `RequireAuth` wrapper applied consistently on protected routes with correct `role` prop | Some protected routes were accessible without authentication |

---

### Navbar / Layout

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Navbar | `src/components/auth/Navbar.js`, `EnablerNavbar.js` | `sticky` removed from `<nav>` — `fixed top-0 z-20` retained | `fixed` overrides `sticky`; having both was misleading and potentially problematic in future CSS cascade changes |
| Spacing | All 27 files in `src/pages/` | `pt-20` (80 px) → `pt-14` (56 px) on all page content wrappers | Navbar renders at ~54 px; 80 px offset created a ~24 px visible gap, especially on mobile |

---

### Dead Code Removal

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| Dead code | `src/index.js` | Removed `seedLocalStorage` import and call | Development seed data was running in production |
| Dead code | `src/App.js` | Removed unused `Opportunity` import after route redirect | ESLint warning; unused import after page was de-routed |
| Dead code | `src/pages/pathfinder/EditNewProfile.js` | Removed `handlePatchCredentialName`, `refreshSocialLinkFromServer`, `handleSocialLinkPut`, `Link` import | Functions lost their callers after UI simplification; `Link` was unused after refactor |
| Dead code | `src/pages/enabler/CreateOpportunity.js` | Removed `handleEditFromPreview` | Lost its only caller when Edit Details button was removed |
| Dead code | Multiple | Removed unused variables to clear ESLint errors before build | Build was emitting ESLint warnings that could mask real errors |
| Dead code | Multiple | Removed `console.log` production calls replaced with `console.error`/`console.warn` where appropriate | Production logs were exposing internal state |

---

### New Pages / Features

| Area | File(s) | What Changed | Why |
|---|---|---|---|
| New page | `src/pages/pathfinder/PathfinderSettings.js` | New settings page at `/pathfinder/settings` | Pathfinders had no dedicated settings |
| New feature | `src/pages/pathfinder/EditNewProfile.js` | Social links section with platform URL inputs, REST sync via `PUT` | Pathfinders couldn't manage social links from their profile page |
| New feature | `src/pages/pathfinder/EditNewProfile.js` | Documents / credentials section with file upload, name editing, delete | Documents were only accessible via settings |
| New feature | `src/pages/pathfinder/Bookmarks.js` | Saved Organisations section | Existed in the API but had no UI |
| New feature | `src/pages/pathfinder/VolunteerDetails.js` | Web Share API on share button with clipboard fallback | Share button was non-functional |
| New component | `src/components/common/Pagination.js` | Pagination component added to all list views | Lists had no pagination — loading all records at once |
| New utility | `src/utils/opportunityUtils.js` | `navigateToVolunteerDetails()` and `getOrgName()` extracted as shared utilities | Logic was duplicated across 4+ pages |
| New utility | `src/utils/descriptionUtils.js` | `parseDescription()`, `combineDescription()`, `formatTextContent()`, `createOpportunityLink()` | Description parsing was reimplemented per page |

---

## 6. Known Limitations

### Multi-tab session conflict
`localStorage` is used to persist auth tokens and role. If the same user opens two tabs and performs conflicting actions (e.g. logout in one tab while making an authenticated request in another), the second tab may enter a broken state. This has been partially mitigated but a full fix requires either a `BroadcastChannel` listener or moving token storage to `sessionStorage`.

### UI/UX pass not yet done
- The pathfinder profile page (`/profile`) has functional correctness but has not been reviewed against the full design spec. Font choices on the profile preview (especially the hero header) may not match the intended design system.
- The enabler-facing PathfinderProfile page uses the same layout structure but some spacing/typography may differ from designs.

### Fonts on pathfinder profile
The profile preview section currently inherits `font-sans` from the root layout. If a custom font (e.g. a branded display font for the hero name) is required, it has not been applied.

### `enablersSavedList` response shape dependency
The Saved Organisations section in `Bookmarks.js` reads `row.enabler_details` and `row.enabler_user_id`. If the backend has not yet deployed these fields, the section will render empty (rows are filtered out when `enablerUserId` is null). The section is safe to display before backend deployment — it shows the empty state without errors.

### `pathfinder_user_id` in bookmark list
The `EnablerPathfinderBookmarks` page similarly depends on `row.pathfinder_user_id` from the `/bookmark/applicants/saved/` endpoint. Same filter-to-empty behaviour applies until backend deploys this field.

### Share button on non-HTTPS
`navigator.share()` requires HTTPS. On `localhost` (HTTP), the share button will fall through to the clipboard fallback. On Vercel (HTTPS), it will trigger the native share sheet on supported devices.

---

## 7. Testing

### Manually tested and confirmed working

| Feature | Tested |
|---|---|
| Pathfinder login (email + password) | ✅ |
| Pathfinder login (Google OAuth) | ✅ |
| Enabler login (email + password) | ✅ |
| Pathfinder profile — create new profile (first-time save → preview → redirect) | ✅ |
| Pathfinder profile — edit existing profile (save → preview, no redirect) | ✅ |
| Pathfinder profile — social links add/edit/delete + save | ✅ |
| Pathfinder profile — documents upload, name edit, delete | ✅ |
| Available opportunities list with pagination | ✅ |
| Opportunity details — description sections parsed and displayed | ✅ |
| Opportunity details — bookmark toggle | ✅ |
| Opportunity details — similar opportunities navigate correctly with description | ✅ |
| Apply for opportunity — custom questions rendered | ✅ |
| Apply for opportunity — profile CV pre-filled | ✅ |
| Apply for opportunity — cover letter structured correctly | ✅ |
| Enabler applicants list — bookmark applicant | ✅ |
| Enabler applicants list — view profile navigates to correct user | ✅ |
| Enabler applicants list — approve/reject application | ✅ |
| Bookmarks page — opportunities list | ✅ |
| Pathfinder settings — change password | ✅ |
| Pathfinder settings — delete account | ✅ |
| Notifications — list, mark read, mark all read | ✅ |
| Navbar unread notification badge | ✅ |
| `/opportunity` redirect to `/available-opportunities` | ✅ |

### Not yet tested / needs verification

| Feature | Status |
|---|---|
| Bookmarks — Saved Organisations section (depends on `enabler_user_id` backend field) | ⚠️ Needs backend deployment |
| EnablerPathfinderBookmarks — correct name/location display (depends on `pathfinder_details` backend field) | ⚠️ Needs backend deployment |
| Custom questions on `AvailableOpportunities → Apply` path (end-to-end with real data) | ⚠️ Untested with live data |
| Share button — native share sheet on mobile | ⚠️ Untested on device |
| Share button — clipboard fallback on desktop | ✅ Logic correct; not smoke-tested in production |
| Google OAuth → Set Password flow for new enablers | ⚠️ Untested |
| Multi-tab session stability under rapid concurrent writes | ⚠️ Partially mitigated, not fully stress-tested |
| EditOpportunity — full edit and re-publish flow | ⚠️ Page exists; not reviewed in this session |
| EnablerProfileSetup — first-time enabler onboarding flow | ⚠️ Page exists; not reviewed in this session |
| Password reset email (forgot password flow) | ⚠️ Depends on backend SMTP config |

---

## 8. Merge Instructions

> **Before merging, ensure:** the `light` branch has been deployed to staging (Vercel preview + Railway staging) and smoke-tested against real backend data. Do not merge until the backend `pathfinder_user_id` and `enabler_user_id` fields are deployed — see Known Limitations.

### Frontend — merging `light` into `main`

```bash
# 1. Make sure local main is up to date
git fetch origin
git checkout main
git pull origin main

# 2. Merge light into main (no fast-forward so the merge commit is visible)
git merge origin/light --no-ff -m "merge: light branch into main — volunteer module production readiness"

# 3. Resolve conflicts if any (none expected — light was built on top of main)
# If conflicts occur, resolve manually, then:
git add .
git commit

# 4. Run the build locally to confirm no compilation errors
npm run build

# 5. Push
git push origin main
```

**After push:**  
- Vercel will automatically trigger a production deploy from `main`.
- Verify the deployment succeeds in the Vercel dashboard.
- Confirm the production URL loads and the login flow works end-to-end.

### Backend — merging the corresponding branch into main

```bash
# 1. Update local main
git fetch origin
git checkout main
git pull origin main

# 2. Merge
git merge origin/<light-equivalent-branch> --no-ff -m "merge: volunteer module backend changes into main"

# 3. Run migrations locally to verify they apply cleanly
python manage.py migrate --check   # should report "No migrations to apply" if up to date

# 4. Push
git push origin main
```

**After push:**  
- Railway will auto-deploy from `main`.
- Run `python manage.py migrate` in the Railway shell if any new migrations exist.
- Verify Railway deploy logs show no errors.
- Test at least one API endpoint (e.g. `GET /api/opportunities/`) from the production frontend to confirm CORS headers are correct.

### Post-merge checklist

- [ ] Vercel production build passes
- [ ] Railway deploy logs clean
- [ ] `GET /api/opportunities/` returns data on production frontend
- [ ] Pathfinder can log in and view their profile
- [ ] Enabler can log in and view applicants
- [ ] Bookmark add/remove works in both directions
- [ ] Notifications load and mark-read works
- [ ] No `console.error` calls appearing unexpectedly in browser dev tools on normal user flows
- [ ] `CORS_ALLOWED_ORIGINS` on Railway updated to include the production Vercel domain if it changed

---

*This document was generated from the engineering session log for the `light` branch. For questions, contact the developer who worked on this branch or refer to the Git commit history (`git log --oneline light`) for a chronological list of all changes.*
