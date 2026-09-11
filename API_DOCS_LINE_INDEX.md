# API Documentation – Line-by-Line Index

**Sources:**  
1. `DOCUMENTATION.md` – Section 5 (API reference)  
2. `WEBSITE_INDEX_AND_API_DOCS.md` – Complete API Documentation

This index catalogs every line/section of both API docs for quick reference.

---

## Part A: DOCUMENTATION.md – Section 5 (API reference)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 193 | Section header | ## 5. API reference |
| 195-197 | Config | Client: api.js; Base URL env; Prefix /api |
| 198 | Auth | Authorization: Bearer \<access_token\>; localStorage keys: afrivate_access, afrivate_refresh, afrivate_role |
| 200 | Error handling | getApiErrorMessage(err); 401 → token refresh and retry once (doc only; see security audit) |
| 202 | Subsection | ### 5.1 Auth (api.auth) |
| 204-214 | Table | login, token, register, logout, tokenRefresh, forgotPassword, verifyOtp, resetPassword, changePassword, verifyEmail, google – path and body/use |
| 216 | Subsection | ### 5.2 Profile (api.profile) |
| 218-227 | Table | enablerGet/Create/Update/Patch, pathfinderGet/Create/Update/Patch, pictureGet/Patch – path and Used in |
| 229 | Subsection | ### 5.3 Bookmark (api.bookmark) |
| 231-237 | Table | list, create, delete, opportunitiesList, opportunitiesCreate, opportunitiesSavedList, opportunitiesSavedCreate |
| 239 | Subsection | ### 5.4 Notifications (api.notifications) |
| 241-245 | Table | list, create, get, update, delete – paths and Used in |
| 247 | Subsection | ### 5.5 Waitlist (api.waitlist) |
| 249-252 | Table | create, stats – path and Used in |
| 254 | Link | Live API docs: https://afrivate-backend-production.up.railway.app/docs/ |

---

## Part B: WEBSITE_INDEX_AND_API_DOCS.md – API sections

### B.1 Base configuration (lines 93–117)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 93 | Section | ## 📚 Complete API Documentation |
| 95-99 | Subsection | ### Authentication & Authorization – Base Configuration |
| 101-106 | Config | Base URL, API Prefix /api, Auth Method Bearer JWT |
| 104-107 | Token storage | Access: localStorage afrivate_access; Refresh: afrivate_refresh; Role: afrivate_role (enabler \| pathfinder) |
| 109-117 | Code block | Token management: getAccessToken, getRefreshToken, setTokens, clearTokens, setRole, getRole |

### B.2 Authentication API (lines 120–262)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 120 | Section | ### 🔐 Authentication API (/auth/) |
| 122-138 | Endpoint | POST /auth/register/ – username, email, password, password2, role; 201; api.auth.register() |
| 140-158 | Endpoint | POST /auth/token/ – email, password; response access, refresh; api.auth.token(); auto-refresh on 401 |
| 160-176 | Endpoint | POST /auth/token/refresh/ – body refresh; response refresh, access; api.auth.tokenRefresh() |
| 178-190 | Endpoint | POST /auth/login/ – username_or_email, password; 201; api.auth.login() |
| 192-200 | Endpoint | POST /auth/logout/ – Bearer required; 201; api.auth.logout() |
| 202-214 | Endpoint | POST /auth/forgot-password/ – email; 201; api.auth.forgotPassword() |
| 216-228 | Endpoint | POST /auth/verify-otp/ – email, otp; 201; api.auth.verifyOtp() |
| 230-242 | Endpoint | POST /auth/reset-password/ – email, new_password, confirm_password; 201; api.auth.resetPassword() |
| 244-260 | Endpoint | POST /auth/change-password/ – old_password, new_password, confirm_password; Bearer; 201; api.auth.changePassword() |
| 262-278 | Endpoint | POST /auth/google/ – id_token, role optional; 201 access, refresh; api.auth.google() |
| 280-294 | Endpoint | POST /auth/verify-email/ – token; Bearer; 201; api.auth.verifyEmail() |

### B.3 Opportunities API (lines 296–323)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 296 | Section | ### 📑 Opportunities API (/bookmark/opportunities/) |
| 298-323 | Endpoint | GET /bookmark/opportunities/ – optional query params; 200 paginated results; api.bookmark.opportunitiesList(); fallback localStorage, cache opportunityListCache |
| 325-358 | Endpoint | POST /bookmark/opportunities/ – title, description, link, is_open, opportunity_type; 201; api.bookmark.opportunitiesCreate(); also enablerOpportunities, opportunityCustomQuestions |

### B.4 Bookmarks API (lines 360–378)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 360 | Section | ### 🔖 Bookmarks API (/bookmark/bookmarks/) |
| 362-378 | Endpoint | GET /bookmark/bookmarks/ – list bookmarks; 200 array; api.bookmark.list() |
| 380-399 | Endpoint | POST /bookmark/bookmarks/ – opportunity, opportunity_id; 201; api.bookmark.create() |
| 401-410 | Endpoint | DELETE /bookmark/bookmarks/{id}/delete/ – 204; api.bookmark.delete(id) |
| 412-420 | Endpoint | GET /bookmark/opportunities/saved/ – same as list; api.bookmark.opportunitiesSavedList() |
| 422-436 | Endpoint | POST /bookmark/opportunities/saved/ – opportunity_id; 201; api.bookmark.opportunitiesSavedCreate(); used on Save in Opportunity.js |

### B.5 Profile API (lines 380–477)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 380 | Section | ### 👤 Profile API (/profile/) |
| 382-412 | Enabler GET | GET /profile/enablerprofile/ – 200; base_details, social_links, name, employees, role; api.profile.enablerGet(); UserContext, Login, etc. |
| 414-422 | Enabler POST | POST /profile/enablerprofile/ – create; 201; api.profile.enablerCreate() |
| 424-432 | Enabler PUT | PUT /profile/enablerprofile/ – full update; 200; api.profile.enablerUpdate() |
| 434-442 | Enabler PATCH | PATCH /profile/enablerprofile/ – partial; 200; api.profile.enablerPatch() |
| 444-477 | Pathfinder GET | GET /profile/pathfinderprofile/ – 200; base_details, social_links, skills, educations, certifications, first_name, last_name, title, about, etc.; api.profile.pathfinderGet() |
| 479-487 | Pathfinder POST | POST /profile/pathfinderprofile/ – 201; api.profile.pathfinderCreate() |
| 489-497 | Pathfinder PUT | PUT /profile/pathfinderprofile/ – 200; api.profile.pathfinderUpdate() |
| 499-507 | Pathfinder PATCH | PATCH /profile/pathfinderprofile/ – 200; api.profile.pathfinderPatch() |
| 509-521 | Picture GET | GET /profile/profile/picture/ – 200 id, profile_pic; api.profile.pictureGet() |
| 523-537 | Picture PATCH | PATCH /profile/profile/picture/ – multipart/form-data profile_pic; 200; api.profile.picturePatch(formData); example FormData |

### B.6 Notifications API (lines 479–557)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 479 | Section | ### 📬 Notifications API (/notifynotifications/) |
| 481-498 | List | GET /notifynotifications/ – 200 array; id, title, message, priority, type, link, created_at; api.notifications.list() |
| 500-518 | Create | POST /notifynotifications/ – body same shape; 201; api.notifications.create() |
| 520-528 | Get one | GET /notifynotifications/{id}/ – 200; api.notifications.get(id) |
| 530-538 | Update | PUT /notifynotifications/{id}/ – 200; api.notifications.update(id, body) |
| 540-548 | Delete | DELETE /notifynotifications/{id}/ – 204; api.notifications.delete(id) |

### B.7 Applications API (lines 550–604)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 550 | Section | ### 📋 Applications API (/applications/api/applications/) – NOT used in frontend; apps in localStorage |
| 552-576 | List | GET /applications/api/applications/ – 200 array; user, user_name, opportunity, opportunity_title, status, applied_at, reviewed_at; status: pending, accepted, rejected |
| 578-590 | Create | POST /applications/api/applications/ – opportunity ID; 201 |
| 592-600 | Get one | GET /applications/api/applications/{id}/ – 200 |
| 602-604 | Update status | PUT /applications/api/applications/{id}/status/ – body opportunity; 200 |

### B.8 Waitlist API (lines 606–638)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 606 | Section | ### 📝 Waitlist API (/waitlist/) |
| 608-624 | Create | POST /waitlist/ – email, name optional; 201; api.waitlist.create(); note: doc says Auth Bearer Required (may be optional in practice) |
| 626-638 | Stats | GET /waitlist/stats/ – Admin; 200; total_signups, verified_signups, signups_today/week/month; api.waitlist.stats() |

### B.9 Data flow & integration notes (lines 680–720)

| Line(s) | Content type | Summary |
|---------|--------------|---------|
| 680-720 | Notes | Applications localStorage only; Opportunities API + localStorage; Bookmarks API; localStorage keys listed; env vars REACT_APP_API_BASE_URL, REACT_APP_API_PREFIX, REACT_APP_GOOGLE_CLIENT_ID; next steps: Applications API integration, opportunities update/delete, notifications UI, error handling |

---

## Part C: api.js implementation vs docs

| Doc section | api.js export | Match |
|-------------|----------------|-------|
| Auth login | auth.login → POST /auth/login/ | ✓ (doc says username_or_email; code sends username, email, password) |
| Auth token | auth.token → POST /auth/token/ | ✓ |
| Auth tokenRefresh | auth.tokenRefresh → POST /auth/token/refresh/ | ✓ |
| 401 retry | Doc: "On 401, client tries token refresh and retries once" | ✗ Not implemented in request() |
| Profile picturePatch | body FormData, headers {} | ✓ (no JSON; body formData) |
| Applications | applications.list/create/get/update/patch/delete/updateStatus | ✓ in api.js; not used in pages |
| Opportunities (extra) | opportunities.list/create/mine/mineCreate/get/update/patch/delete | ✓ in api.js; different base path /opportunities/opportunities/ |

---

## Quick lookup: endpoint → doc location

| Endpoint | DOCUMENTATION.md | WEBSITE_INDEX_AND_API_DOCS.md |
|----------|------------------|--------------------------------|
| POST /auth/register/ | §5.1 table | B.2 lines 122-138 |
| POST /auth/token/ | §5.1 table | B.2 lines 140-158 |
| POST /auth/token/refresh/ | §5.1 table | B.2 lines 160-176 |
| POST /auth/logout/ | §5.1 table | B.2 lines 192-200 |
| GET/POST/PATCH enablerprofile | §5.2 table | B.5 enabler block |
| GET/POST/PUT/PATCH pathfinderprofile | §5.2 table | B.5 pathfinder block |
| GET/PATCH profile/picture | §5.2 table | B.5 picture block |
| GET/POST/DELETE bookmarks | §5.3 table | B.4 |
| GET/POST opportunities, saved | §5.3 table | B.3, B.4 |
| Notifications CRUD | §5.4 table | B.6 |
| Waitlist create/stats | §5.5 table | B.8 |
| Applications (backend only) | — | B.7 |

---

*This index covers every line of the API sections in both DOCUMENTATION.md and WEBSITE_INDEX_AND_API_DOCS.md. For full request/response schemas see the source files.*
