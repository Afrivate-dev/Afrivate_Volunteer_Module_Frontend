# API Audit – Call Sites & Correct Usage

**Reference:** `DOCUMENTATION.md` §5, `WEBSITE_INDEX_AND_API_DOCS.md`, `src/services/api.js`  
**Note:** The API PDFs in `src/Assets/api/` (Afrivate API.pdf, Afrivate Profile API Documentation.pdf) are binary; this audit uses the markdown docs above as the source of truth. Verify against the PDFs manually if needed.

---

## 1. Auth API (`api.auth`)

| Call | File | Context | Expected (doc) | Status |
|------|------|---------|----------------|--------|
| `api.auth.token({ email, password })` | Login.js | Login form submit | POST /auth/token/ with email, password | ✅ Fixed: body now email + password only |
| `api.auth.token({ email, password })` | SignUp.js | After register, to get tokens | Same | ✅ Fixed |
| `api.auth.register({ username, email, password, password2, role })` | SignUp.js | Sign-up form | POST /auth/register/ | ✅ Correct |
| `api.auth.logout()` | UserContext.js | Logout handler | POST /auth/logout/ Bearer | ✅ Correct |
| `api.auth.forgotPassword({ email })` | ForgotPassword.js | Request reset | POST /auth/forgot-password/ | ✅ Correct |
| `api.auth.verifyOtp({ email, otp })` | VerifyOTP.js | OTP verification | POST /auth/verify-otp/ | ✅ Correct |
| `api.auth.resetPassword({ email, new_password, confirm_password })` | ResetPassword.js | Set new password | POST /auth/reset-password/ | ✅ Correct |
| `api.auth.google({ id_token, role })` | GoogleAuthButton.js | Google sign-in | POST /auth/google/ | ✅ Correct |
| `auth.tokenRefresh(refresh)` | api.js (internal) | 401 retry | POST /auth/token/refresh/ | ✅ Internal only |
| `api.auth.changePassword(body)` | Settings.js | Change password (if used) | old_password, new_password, confirm_password | ✅ Method exists; ensure body shape where called |

**Not used in app:** `login()` (username_or_email), `verifyEmail()` — doc lists them; no call sites.

---

## 2. Profile API (`api.profile`)

| Call | File | Context | Expected | Status |
|------|------|---------|----------|--------|
| `profile.enablerGet()` | UserContext, Login, GoogleAuthButton, EnablerNavbar, EnablerProfile, EditProfile, Settings, EnablerProfileSetup, emppro | Get enabler profile | GET /profile/enablerprofile/ | ✅ Correct |
| `profile.enablerCreate(body)` | EnablerProfileSetup | First-time enabler create | POST /profile/enablerprofile/ | ✅ Correct |
| `profile.enablerUpdate(body)` | EditProfile, EnablerProfileSetup, Settings | Full enabler update | PUT /profile/enablerprofile/ | ✅ Correct |
| `profile.enablerPatch(body)` | Profile.js | Partial enabler update | PATCH /profile/enablerprofile/ | ✅ Correct |
| `profile.pathfinderGet()` | UserContext, Login, GoogleAuthButton, Navbar, EditNewProfile, ApplyApplication, Profile | Get pathfinder profile | GET /profile/pathfinderprofile/ | ✅ Correct |
| `profile.pathfinderCreate(body)` | EditNewProfile | First-time pathfinder create | POST /profile/pathfinderprofile/ | ✅ Correct |
| `profile.pathfinderUpdate(body)` | EditNewProfile | Full pathfinder update | PUT /profile/pathfinderprofile/ | ✅ Correct |
| `profile.pathfinderPatch(body)` | Profile.js | Partial pathfinder update | PATCH /profile/pathfinderprofile/ | ✅ Correct |
| `profile.pictureGet()` | EnablerNavbar, Settings, EditNewProfile | Get profile picture | GET /profile/profile/picture/ | ✅ Correct |
| `profile.picturePatch(formData)` | Settings, EditNewProfile | Upload picture | PATCH /profile/profile/picture/ FormData | ✅ Correct |

---

## 3. Bookmark API (`api.bookmark` / `bookmarks`)

| Call | File | Context | Expected | Status |
|------|------|---------|----------|--------|
| `bookmarks.list()` | EnablerPathfinderBookmarks, PathfinderProfile, VolunteerDetails, Opportunity (loadSavedIds) | List bookmarks | GET /bookmark/bookmarks/ | ✅ Correct |
| `bookmarks.create(body)` | PathfinderProfile | Enabler bookmarks pathfinder | POST /bookmark/bookmarks/ (e.g. pathfinder id) | ✅ Correct (backend may accept pathfinder) |
| `bookmarks.delete(id)` | EnablerPathfinderBookmarks, PathfinderProfile, Bookmarks, VolunteerDetails | Remove bookmark | DELETE /bookmark/bookmarks/{id}/delete/ | ✅ Correct |
| `bookmarks.opportunitiesSavedList()` | Bookmarks | Saved opportunities for pathfinder | GET /bookmark/opportunities/saved/ | ✅ Correct |
| `bookmarks.opportunitiesSavedCreate({ opportunity_id })` | VolunteerDetails, Opportunity | Pathfinder saves opportunity | POST /bookmark/opportunities/saved/ | ✅ Correct |

**Note:** DOCUMENTATION §5.3 lists `opportunitiesList()` and `opportunitiesCreate()` under bookmark (for listing/creating opportunities). This app uses the separate `opportunities` module for listing/creating enabler opportunities (see §4 below).

---

## 4. Opportunities API (`api.opportunities`)

| Call | File | Context | Expected (api.js) | Status |
|------|------|---------|-------------------|--------|
| `opportunities.list(params)` | PathfinderDashboard, Opportunity, VolunteerDetails | List opportunities (e.g. is_open: true) | GET /opportunities/opportunities/?... | ✅ Correct |
| `opportunities.mine()` | EnablerDashboard, OpportunitiesPosted | Enabler’s own opportunities | GET /opportunities/opportunities/mine/ | ✅ Fixed: was getMine() |
| `opportunities.get(id)` | EditOpportunity, OpportunityDetails, VolunteerDetails, ApplyApplication, Applicants | Single opportunity | GET /opportunities/opportunities/{id}/ | ✅ Correct |
| `opportunities.create(body)` | CreateOpportunity | Create opportunity | POST /opportunities/opportunities/ | ✅ Correct |
| `opportunities.update(id, body)` | EditOpportunity | Update opportunity | PUT /opportunities/opportunities/{id}/ | ✅ Correct |
| `opportunities.delete(id)` | OpportunitiesPosted | Delete opportunity | DELETE /opportunities/opportunities/{id}/ | ✅ Correct |

---

## 5. Notifications API (`api.notifications`)

| Call | File | Context | Expected | Status |
|------|------|---------|----------|--------|
| `notifications.create({ title, message, priority, type, link })` | ContactPathfinder | Enabler sends message to pathfinder | POST /notifynotifications/ | ✅ Correct (title, message, priority, type, link per doc) |

**Not used in app:** `list()`, `get(id)`, `update()`, `delete()` — doc says Navbar; current Navbar does not call notifications.

---

## 6. Applications API (`api.applications`)

*Updates:* front‑end now attaches cover letters and optionally a CV (file upload or URL) when creating/patching applications. API methods accept FormData or JSON with `cv_url`.

| Call | File | Context | Expected | Status |
|------|------|---------|----------|--------|
| `applications.list()` | EnablerDashboard, Applicants, Recommendations | List applications | GET /applications/api/applications/ | ✅ Correct |
| `applications.create({ opportunity })` | ApplyApplication | Pathfinder applies | POST /applications/api/applications/ | ✅ Correct |

**Not used:** `get(id)`, `update()`, `patch()`, `delete()`, `updateStatus()` — available in api.js for future use.

---

## 7. Waitlist API (`api.waitlist`)

**Not used in app** — doc: create(body), stats(). No call sites.

---

## 8. Token / role helpers (not HTTP)

| Call | File | Purpose | Status |
|------|------|---------|--------|
| `getAccessToken()`, `getRole()` | RequireAuth, UserContext, Login, GoogleAuthButton, Navbar, Profile, Opportunity (dynamic import) | Guard / redirect / role check | ✅ Correct |
| `setTokens()`, `setRole()`, `clearTokens()` | Login, SignUp, GoogleAuthButton, UserContext | After auth | ✅ Correct |
| `getApiErrorMessage(err)` | Login, SignUp, ApplyApplication, GoogleAuthButton | User-facing error text | ✅ Correct |

---

## 9. Fixes applied in this audit

1. **Login.js & SignUp.js** – `api.auth.token()` body set to `{ email, password }` only (doc: POST /auth/token/ expects email and password; removed redundant `username`).
2. **OpportunitiesPosted.js** – Replaced non-existent `opportunities.getMine()` with `opportunities.mine()` and normalized response (array or `data.results`).

---

## 10. Summary

- **Auth:** All auth calls aligned with doc; token endpoint body corrected.
- **Profile:** All profile and picture calls used in appropriate pages (enabler vs pathfinder).
- **Bookmark:** list/create/delete and opportunitiesSaved* used correctly for pathfinder bookmarks and enabler pathfinder bookmarks.
- **Opportunities:** list/mine/get/create/update/delete used in correct contexts; `getMine()` bug fixed.
- **Notifications:** create() used in ContactPathfinder only.
- **Applications:** list() and create() used in EnablerDashboard, Applicants, Recommendations, ApplyApplication.

No remaining known API/context mismatches. For backend-specific payload shapes (e.g. profile PATCH, notification create), confirm against the PDFs in `src/Assets/api/` if needed.
