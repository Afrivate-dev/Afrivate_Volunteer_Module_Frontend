# Afrivate Volunteer Module – Master Index (Website + API Docs + Code)

**Purpose:** Single reference for the entire website, every line of API documentation, and every API call in code. Use this when fixing API calls.

**Generated for:** API call fixes and alignment with backend.

---

## 1. API documentation sources

| Source | Location | Content |
|--------|----------|--------|
| **API_AUDIT.md** | Root | Call sites vs expected usage; status (✅/fixes applied). |
| **API_DOCS_LINE_INDEX.md** | Root | Line-by-line index of DOCUMENTATION.md §5 and WEBSITE_INDEX_AND_API_DOCS.md API sections. |
| **WEBSITE_INDEX_AND_API_DOCS.md** | Root | Full API docs: auth, opportunities, bookmarks, profile, notifications, applications, waitlist; request/response shapes; data flow. |
| **DOCUMENTATION.md** | Root | §5 API reference (auth, profile, bookmark, notifications, waitlist); routes, pages, localStorage. |
| **WEBSITE_INDEX.md** | Root | Routes, pages, components, context, utils. |
| **SECURITY_AUDIT_REPORT.md** | Root | Security findings (401 refresh, role guard, login body, etc.). |
| **API PDFs** | `src/Assets/api/` | `Afrivate API-1.pdf`, `🛠 Afrivate Profile API Documentation.pdf` (binary; verify manually). |

**API base (from api.js):** `BASE_URL` = `process.env.REACT_APP_API_BASE_URL` or `https://afrivate-backend-production.up.railway.app`  
**Prefix:** `REACT_APP_API_PREFIX` or `/api`  
**Auth:** `Authorization: Bearer <access_token>`, tokens in `afrivate_access`, `afrivate_refresh`, role in `afrivate_role`.

---

## 2. api.js – endpoint map (every method and path)

### Auth (`api.auth`)

| Method | HTTP | Path | Body (sent) |
|--------|------|------|-------------|
| login | POST | /auth/login/ | body as JSON |
| register | POST | /auth/register/ | body as JSON |
| logout | POST | /auth/logout/ | — |
| token | POST | /auth/token/ | body as JSON |
| tokenRefresh | POST | /auth/token/refresh/ | { refresh } |
| forgotPassword | POST | /auth/forgot-password/ | body as JSON |
| verifyOtp | POST | /auth/verify-otp/ | body as JSON |
| resetPassword | POST | /auth/reset-password/ | body as JSON |
| changePassword | POST | /auth/change-password/ | body as JSON |
| verifyEmail | POST | /auth/verify-email/ | body as JSON |
| google | POST | /auth/google/ | body as JSON |
| registration | POST | /auth/registration/ | body as JSON |
| registrationResendEmail | POST | /auth/registration/resend-email/ | body as JSON |
| registrationVerifyEmail | POST | /auth/registration/verify-email/ | body as JSON |
| passwordChange | POST | /auth/password/change/ | body as JSON |
| passwordReset | POST | /auth/password/reset/ | body as JSON |
| passwordResetConfirm | POST | /auth/password/reset/confirm/ | body as JSON |
| userGet | GET | /auth/user/ | — |
| userUpdate | PUT | /auth/user/ | body as JSON |
| userPatch | PATCH | /auth/user/ | body as JSON |
| deleteAccount | DELETE | /auth/user/ | — |

### Bookmark (`api.bookmark` / `api.bookmarks`)

| Method | HTTP | Path | Body (sent) |
|--------|------|------|-------------|
| list | GET | /bookmark/bookmarks/ | — |
| create | POST | /bookmark/bookmarks/ | { opportunity, opportunity_id } (pathfinder not sent) |
| delete | DELETE | /bookmark/bookmarks/{id}/delete/ | — |
| opportunitiesList | GET | /bookmark/opportunities/ | — |
| opportunitiesCreate | POST | /bookmark/opportunities/ | title, description, link, is_open |
| opportunitiesSavedList | GET | /bookmark/opportunities/saved/ | — |
| opportunitiesSavedCreate | POST | /bookmark/opportunities/saved/ | { opportunity, opportunity_id } |

### Notifications (`api.notifications`)

| Method | HTTP | Path | Body |
|--------|------|------|------|
| list | GET | /notifynotifications/ | — |
| create | POST | /notifynotifications/ | body as JSON |
| get | GET | /notifynotifications/{id}/ | — |
| update | PUT | /notifynotifications/{id}/ | body as JSON |
| delete | DELETE | /notifynotifications/{id}/ | — |

### Profile (`api.profile`)

| Method | HTTP | Path | Body |
|--------|------|------|------|
| enablerGet | GET | /profile/enablerprofile/ | — |
| enablerCreate | POST | /profile/enablerprofile/ | body as JSON |
| enablerUpdate | PUT | /profile/enablerprofile/ | body as JSON |
| enablerPatch | PATCH | /profile/enablerprofile/ | body as JSON |
| pathfinderGet | GET | /profile/pathfinderprofile/ | — |
| pathfinderCreate | POST | /profile/pathfinderprofile/ | body as JSON |
| pathfinderUpdate | PUT | /profile/pathfinderprofile/ | body as JSON |
| pathfinderPatch | PATCH | /profile/pathfinderprofile/ | body as JSON |
| pictureGet | GET | /profile/profile/picture/ | — |
| picturePatch | PATCH | /profile/profile/picture/ | FormData (no JSON) |
| credentialsList | GET | /profile/credentials/ | — |
| credentialsCreate | POST | /profile/credentials/ | FormData |
| credentialsDelete | DELETE | /profile/credentials/{id}/ | — |

### Waitlist (`api.waitlist`)

| Method | HTTP | Path | Body |
|--------|------|------|------|
| create | POST | /waitlist/ | { email, name } |
| stats | GET | /waitlist/stats/ | — |

### Applications (`api.applications`)

| Method | HTTP | Path | Body |
|--------|------|------|------|
| list | GET | /applications/ | — |
| create | POST | /applications/ | { opportunity, cover_letter } |
| get | GET | /applications/{id}/ | — |
| update | PUT | /applications/{id}/ | { opportunity, cover_letter } |
| patch | PATCH | /applications/{id}/ | { opportunity, cover_letter } |
| delete | DELETE | /applications/{id}/ | — |
| updateStatus | PATCH | /applications/{id}/change_status/ | body as JSON |

### Opportunities (`api.opportunities`)

| Method | HTTP | Path | Body |
|--------|------|------|------|
| list | GET | /opportunities/opportunities/?query | — |
| create | POST | /opportunities/opportunities/ | body as JSON |
| mine | GET | /opportunities/opportunities/mine/ | — |
| mineCreate | POST | /opportunities/opportunities/mine/ | body as JSON |
| get | GET | /opportunities/opportunities/{id}/ | — |
| update | PUT | /opportunities/opportunities/{id}/ | body as JSON |
| patch | PATCH | /opportunities/opportunities/{id}/ | body as JSON |
| delete | DELETE | /opportunities/opportunities/{id}/ | — |

---

## 3. Every API call in the codebase (file → line → call)

### Auth

| File | Line(s) | Call | Notes |
|------|---------|------|--------|
| src/pages/auth/Login.js | 54–57 | api.auth.token({ email, password }) | ✅ Doc: email + password |
| src/pages/auth/SignUp.js | 100–105 | api.auth.register({ username, email, password, password2, role }) | ✅ |
| src/pages/auth/SignUp.js | 109–113 | api.auth.token({ email, password }) | ✅ |
| src/pages/auth/ForgotPassword.js | 26 | api.auth.forgotPassword({ email }) | ✅ |
| src/pages/auth/VerifyOTP.js | 22, 36 | api.auth.verifyOtp({ email, otp }), api.auth.forgotPassword({ email }) | ✅ |
| src/pages/auth/ResetPassword.js | 60 | api.auth.resetPassword({ email, new_password, confirm_password }) | ✅ |
| src/components/auth/GoogleAuthButton.js | 33 | api.auth.google(body) | id_token, optional role |
| src/context/UserContext.js | 117 | api.auth.logout() | ✅ |
| src/services/api.js | 127 | auth.tokenRefresh(refresh) | Internal 401 retry |

### Profile

| File | Line(s) | Call | Notes |
|------|---------|------|--------|
| src/context/UserContext.js | 73, 84 | api.profile.enablerGet(), api.profile.pathfinderGet() | ✅ |
| src/pages/auth/Login.js | 66, 82 | api.profile.enablerGet(), api.profile.pathfinderGet() | Role detection |
| src/components/auth/GoogleAuthButton.js | 38, 52 | api.profile.enablerGet(), api.profile.pathfinderGet() | Role detection |
| src/components/auth/EnablerNavbar.js | 18, 21 | profile.enablerGet(), profile.pictureGet() | ✅ |
| src/components/auth/Navbar.js | 18, 20, 27 | profile.enablerGet() / pathfinderGet(), profile.pictureGet() | ✅ |
| src/pages/enabler/EnablerProfile.js | 27, 40, 66 | profile.enablerGet(), profile.credentialsList(), profile.credentialsCreate(formData) | ✅ |
| src/pages/enabler/EditProfile.js | 32, 103, 126 | profile.enablerGet(), profile.enablerPatch(), profile.enablerUpdate() | ✅ |
| src/pages/enabler/Settings.js | 37, 57, 114, 127, 147 | profile.enablerGet(), pictureGet(), picturePatch(), enablerGet(), enablerUpdate() | ✅ |
| src/pages/enabler/EnablerProfileSetup.js | 39, 111, 114, 126 | profile.enablerGet(), enablerUpdate(), enablerCreate(), profile.credentialsCreate(fd) | ✅ |
| src/pages/emppro.js | 49 | profile.enablerGet() | ✅ |
| src/pages/Profile.js | 42, 44, 139, 141 | profile.enablerGet()/pathfinderGet(), profile.enablerPatch()/pathfinderPatch() | ✅ |
| src/pages/pathfinder/EditNewProfile.js | 54, 84, 88, 132, 144, 150, 162, 168, 238, 246 | pathfinderGet(), pictureGet(), credentialsList(), picturePatch(), credentialsList(), credentialsDelete(), credentialsCreate(), pathfinderUpdate(), pathfinderCreate() | ✅ |
| src/pages/pathfinder/ApplyApplication.js | 66 | apiClient.profile.pathfinderGet() | Pre-fill form |

### Bookmark

| File | Line(s) | Call | Notes |
|------|---------|------|--------|
| src/pages/enabler/EnablerPathfinderBookmarks.js | 17, 44 | bookmarks.list(), bookmarks.delete(bookmarkId) | Enabler pathfinder bookmarks |
| src/pages/enabler/PathfinderProfile.js | 28, 42, 50 | bookmarks.list(), bookmarks.delete(bookmarkId), bookmarks.create({ pathfinder: pathfinder.id }) | ⚠️ create() sends opportunity/opportunity_id only; pathfinder not in api.js body |
| src/pages/pathfinder/PathfinderDashboard.js | — | (uses applications.list, opportunities.list) | No bookmark list here in grep |
| src/pages/pathfinder/VolunteerDetails.js | 89, 105, 109 | bookmarks.list(), bookmarks.delete(bookmarkId), bookmarks.opportunitiesSavedCreate({ opportunity_id }) | ✅ |
| src/pages/pathfinder/Opportunity.js | 49, 79 | bookmarks.list(), bookmarks.opportunitiesSavedCreate({ opportunity_id }) | ✅ |
| src/pages/pathfinder/Bookmarks.js | 26, 55 | bookmarks.opportunitiesSavedList(), bookmarks.delete(bookmarkId) | ✅ |

### Opportunities

| File | Line(s) | Call | Notes |
|------|---------|------|--------|
| src/pages/enabler/EnablerDashboard.js | 32 | opportunities.mine() | ✅ |
| src/pages/enabler/OpportunitiesPosted.js | 43, 66 | opportunities.mine(), opportunities.delete(id) | ✅ |
| src/pages/enabler/CreateOpportunity.js | 86 | opportunities.mineCreate(opportunityData) | Uses mineCreate, not create (doc may say create) |
| src/pages/enabler/EditOpportunity.js | 30, 101 | opportunities.get(id), opportunities.update(id, updateData) | ✅ |
| src/pages/enabler/OpportunityDetails.js | 43 | opportunities.get(numericId) | ✅ |
| src/pages/enabler/Applicants.js | 22 | opportunities.get(opportunityId) | ✅ |
| src/pages/pathfinder/PathfinderDashboard.js | 52 | opportunities.list({ is_open: true }) | ✅ |
| src/pages/pathfinder/Opportunity.js | 32 | opportunities.list({ is_open: true }) | ✅ |
| src/pages/pathfinder/VolunteerDetails.js | 32, 65 | opportunities.get(jobId), opportunities.list(params) | ✅ |
| src/pages/pathfinder/ApplyApplication.js | 46 | opportunities.get(opportunityId) | ✅ |
| src/pages/Dash-employer.js | 19, 20 | opportunities.mine(), applications.list() | ✅ |

### Notifications

| File | Line(s) | Call | Notes |
|------|---------|------|--------|
| src/pages/enabler/ContactPathfinder.js | 30 | notifications.create({ title, message, priority, type, link }) | ✅ |

### Applications

| File | Line(s) | Call | Notes |
|------|---------|------|--------|
| src/pages/pathfinder/ApplyApplication.js | 114 | applications.create({ opportunity, cover_letter }) | opportunity = parseInt(opportunityId) |
| src/pages/enabler/Applicants.js | 31 | applications.list() | ✅ |
| src/pages/enabler/EnablerDashboard.js | 49 | applications.list() | ✅ |
| src/pages/enabler/Recommendations.js | 20 | applications.list() | ✅ |

### Token/helpers (non-HTTP)

| File | Line(s) | Usage |
|------|---------|--------|
| src/components/auth/RequireAuth.js | — | getAccessToken(), getRole() |
| src/context/UserContext.js | 56, 63, 121 | getAccessToken(), getRole(), clearTokens() |
| src/pages/auth/Login.js | 60, 69, 85, 98 | setTokens(), setRole() |
| src/components/auth/GoogleAuthButton.js | 35, 40, 55, 75 | setTokens(), setRole(), getRole() |
| src/pages/auth/SignUp.js | 115, 129 | setTokens(), setRole() |
| getApiErrorMessage | Login, SignUp, ApplyApplication, GoogleAuthButton | User-facing error text |

---

## 4. Discrepancies and fix list (for API calls)

1. **Applications base path**  
   - **Doc (WEBSITE_INDEX_AND_API_DOCS):** `/applications/api/applications/`  
   - **api.js:** `/applications/` (no `api/applications`).  
   - **Action:** Confirm backend; if backend uses `/applications/api/applications/`, update api.js paths for list/create/get/update/patch/delete/updateStatus.

2. **CreateOpportunity – create vs mineCreate**  
   - **API_AUDIT:** Says CreateOpportunity uses `opportunities.create(body)` → POST /opportunities/opportunities/.  
   - **Code:** CreateOpportunity.js uses `opportunities.mineCreate(opportunityData)` → POST /opportunities/opportunities/mine/.  
   - **Action:** Confirm backend: use `create` or `mineCreate` and align doc/code.

3. **Enabler bookmark pathfinder**  
   - **PathfinderProfile.js:** Calls `bookmarks.create({ pathfinder: pathfinder.id })`.  
   - **api.js bookmark.create:** Sends only `{ opportunity, opportunity_id }`; does not send `pathfinder`.  
   - **Action:** If backend has “bookmark pathfinder” endpoint/body (e.g. pathfinder_id), add it in api.js and call it from PathfinderProfile; otherwise backend may use same bookmark resource with pathfinder in body.

4. **SignUp redirect pathfinder**  
   - SignUp.js navigates to `/pathfinder/profile-setup`.  
   - App.js: `/pathfinder/profile-setup` → EditNewProfile (same as `/edit-new-profile`).  
   - No API fix; route is correct.

5. **401 token refresh**  
   - Implemented in api.js (request() catches 401, calls tokenRefresh, retries once). SECURITY_AUDIT and API_DOCS_LINE_INDEX previously said “not implemented”; code now has it. No change needed if behavior is correct.

6. **Login body**  
   - Login.js sends only `{ email, password }` to auth.token(); API_AUDIT marks this fixed. No change needed.

7. **applications.list() response shape**  
   - Applicants.js, EnablerDashboard.js, Recommendations.js use the result as an array (e.g. `appsData.filter`). If the backend returns paginated `{ results: [] }`, normalize to an array (e.g. `Array.isArray(data) ? data : data?.results ?? []`) in each call site or in api.js.

---

## 5. Quick lookup – by endpoint (doc → code)

| Backend path | api.js method | Used in |
|--------------|---------------|--------|
| POST /auth/token/ | auth.token | Login, SignUp |
| POST /auth/register/ | auth.register | SignUp |
| POST /auth/logout/ | auth.logout | UserContext |
| POST /auth/forgot-password/ | auth.forgotPassword | ForgotPassword |
| POST /auth/verify-otp/ | auth.verifyOtp | VerifyOTP |
| POST /auth/reset-password/ | auth.resetPassword | ResetPassword |
| POST /auth/google/ | auth.google | GoogleAuthButton |
| GET /profile/enablerprofile/ | profile.enablerGet | UserContext, Login, GoogleAuthButton, EnablerNavbar, EnablerProfile, EditProfile, Settings, EnablerProfileSetup, emppro, Profile |
| POST/PUT/PATCH /profile/enablerprofile/ | enablerCreate/Update/Patch | EnablerProfileSetup, EditProfile, Settings, Profile |
| GET /profile/pathfinderprofile/ | profile.pathfinderGet | UserContext, Login, GoogleAuthButton, Navbar, EditNewProfile, ApplyApplication, Profile |
| POST/PUT/PATCH /profile/pathfinderprofile/ | pathfinderCreate/Update/Patch | EditNewProfile, Profile |
| GET/PATCH /profile/profile/picture/ | pictureGet/PicturePatch | EnablerNavbar, Settings, EditNewProfile |
| GET/POST/DELETE /profile/credentials/ | credentialsList/Create/Delete | EnablerProfile, EnablerProfileSetup, EditNewProfile |
| GET /bookmark/bookmarks/ | bookmarks.list | EnablerPathfinderBookmarks, PathfinderProfile, VolunteerDetails, Opportunity (loadSavedIds) |
| POST /bookmark/bookmarks/ | bookmarks.create | PathfinderProfile (pathfinder body not sent in api.js) |
| DELETE /bookmark/bookmarks/{id}/delete/ | bookmarks.delete | EnablerPathfinderBookmarks, PathfinderProfile, Bookmarks, VolunteerDetails |
| GET /bookmark/opportunities/saved/ | bookmarks.opportunitiesSavedList | Bookmarks |
| POST /bookmark/opportunities/saved/ | bookmarks.opportunitiesSavedCreate | VolunteerDetails, Opportunity |
| GET /opportunities/opportunities/ | opportunities.list | PathfinderDashboard, Opportunity, VolunteerDetails |
| GET /opportunities/opportunities/mine/ | opportunities.mine | EnablerDashboard, OpportunitiesPosted |
| POST /opportunities/opportunities/mine/ | opportunities.mineCreate | CreateOpportunity |
| GET /opportunities/opportunities/{id}/ | opportunities.get | EditOpportunity, OpportunityDetails, VolunteerDetails, ApplyApplication, Applicants |
| PUT/DELETE /opportunities/opportunities/{id}/ | opportunities.update/delete | EditOpportunity, OpportunitiesPosted |
| POST /notifynotifications/ | notifications.create | ContactPathfinder |
| GET /applications/ | applications.list | EnablerDashboard, Applicants, Recommendations |
| POST /applications/ | applications.create | ApplyApplication |

---

## 6. Route index (from App.js)

- **Public:** /, /landingpathfinder, /landingenabler, /opportunity, /volunteer-details, /road, /about, /contact, /privacy, /deep-pay-info  
- **Auth:** /login, /signup, /forgot-password, /verify-otp, /reset-password  
- **Pathfinder (RequireAuth role=pathfinder):** /dashf, /pathf, /apply/:opportunityId, /bookmarks, /edit-new-profile, /pathfinder/profile-setup  
- **Enabler (RequireAuth role=enabler):** /enabler/dashboard, /create-opportunity, /enabler/opportunities-posted, /enabler/opportunity/:id, /enabler/edit-opportunity/:id, /enabler/profile, /enabler/edit-profile, /enabler/profile-setup, /enabler/recommendations, /enabler/settings, /enabler/pathfinder/:id, /enabler/contact/:id, /enabler/bookmarked-pathfinders, /enabler/applicants/:id  
- **Other protected:** /emppro, /dash-employer, /dash-freelance, /dashboard, /profile, /kyc  

---

*Use this index to trace any API call from doc → api.js → page and to apply the fixes in §4 when aligning with the backend.*
