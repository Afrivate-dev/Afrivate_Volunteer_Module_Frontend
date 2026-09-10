# Backend mapping index (Afrivate)

This file **indexes** the backend team’s canonical spec: **[Backend_Project_Flow.md](./Backend_Project_Flow.md)** (copied from `Project_Flow.md`). Use it for navigation, API lookup, and **frontend parity** checks against `src/services/api.js`.

**Base URL:** configurable via `REACT_APP_API_BASE_URL` (default in `api.js` matches the doc’s Railway host).  
**Path prefix:** `REACT_APP_API_PREFIX` defaults to `/api`, so a doc path like `POST /api/auth/login/` is implemented as `POST` + `/auth/login/` in code.

---

## 1. Document map (sections)

| § | Topic | What it contains |
|---|--------|------------------|
| 1 | What Is Afrivate? | Product definition |
| 2 | Two User Types | Pathfinder vs Enabler feature matrix |
| 3 | High-Level System Overview | Architecture (Django, PostgreSQL, Cloudinary, SMTP) |
| 4 | Screen Connection Map | ASCII screen flow |
| 5 | Step-by-Step User Flows | Waitlist → auth → profiles → opportunities → applications → bookmarks → notifications → logout → refresh |
| 6 | Complete API Reference | All endpoints with request/response notes |
| 7 | Business Rules | PM-facing rules (roles, OTP, 12h edit, tokens, uploads) |
| 8 | Frontend Developer Notes | Tokens, pagination, uploads, errors, Swagger/ReDoc URLs |

**Live API docs (from §8):**

- Swagger: `https://afrivate-backend-production.up.railway.app/api/v1/docs/`
- ReDoc: `https://afrivate-backend-production.up.railway.app/docs/`

---

## 2. Flat endpoint index (`/api` prefix)

Paths below are as in **Backend_Project_Flow.md** (full URL = `BASE + /api` + path after `/api`).

### Authentication

| Method | Path |
|--------|------|
| POST | `/auth/register/` |
| POST | `/auth/verify-otp/` |
| POST | `/auth/login/` |
| POST | `/auth/google/pathfinder/` |
| POST | `/auth/google/enabler/` |
| POST | `/auth/token/refresh/` |
| POST | `/auth/logout/` |
| POST | `/auth/forgot-password/` |
| POST | `/auth/verify-password-reset-otp/` |
| POST | `/auth/change-password/` |
| POST | `/auth/set-password/` |

### Profiles

| Method | Path |
|--------|------|
| GET, PATCH | `/profile/pathfinderprofile/` |
| GET, PATCH | `/profile/enablerprofile/` |
| GET | `/profile/pathfinderprofile/user/<user_id>/` |
| GET | `/profile/enablerprofile/user/<user_id>/` |
| GET, POST | `/profile/credentials/` |
| DELETE | `/profile/credentials/<id>/` |
| PATCH | `/profile/profile/picture/` |
| GET, POST, DELETE | `/profile/social-links/` (list/add/remove by id) |

### Opportunities

| Method | Path |
|--------|------|
| GET, POST | `/opportunities/` |
| GET, PUT, DELETE | `/opportunities/<id>/` |
| GET | `/opportunities/mine/` |
| GET | `/opportunities/<id>/applicants/` |
| GET | `/opportunities/<id>/applicants/<applicant_id>/` |

### Applications

| Method | Path |
|--------|------|
| GET, POST | `/applications/` |
| DELETE | `/applications/<id>/` |
| PATCH | `/applications/<id>/change_status/` |

### Bookmarks

| Method | Path |
|--------|------|
| GET, POST | `/bookmark/opportunities/saved/` |
| DELETE | `/bookmark/opportunities/saved/<opportunity_id>/` |
| GET, POST | `/bookmark/applicants/saved/` |
| DELETE | `/bookmark/applicants/saved/<pathfinder_id>/` |

### Notifications

| Method | Path |
|--------|------|
| GET | `/notify/notifications/` |

### Waitlist

| Method | Path |
|--------|------|
| POST | `/waitlist/` |
| GET | `/waitlist/stats/` |

---

## 3. Frontend parity (`api.js` ↔ backend doc)

`api.js` builds URLs as `BASE_URL + API_PREFIX + path` with default prefix `/api`.

| Area | Backend spec (§6 / flows) | Current `api.js` | Notes |
|------|---------------------------|------------------|--------|
| Google sign-in | `POST /auth/google/pathfinder/` or `.../enabler/` | `POST /auth/google/` | **Mismatch:** single route vs role-specific routes; confirm payload and which endpoint production uses. |
| Logout | `POST /auth/logout/` with **refresh** in body (§5.14) | `POST /auth/logout/` **no body** | **Verify:** backend may require `{ refresh }` to blacklist token. |
| Password reset OTP | `POST /auth/verify-password-reset-otp/` | `resetPassword` → `/auth/reset-password/`; also `passwordReset` → `/auth/password/reset/` | **Align** with Swagger; doc naming differs from some dj-rest-auth style paths. |
| Set password (Google) | `POST /auth/set-password/` | Not exposed as a dedicated helper in the snippet; may exist under another name | Add if UI needs it. |
| View pathfinder (other user) | `GET /profile/pathfinderprofile/user/<user_id>/` | `GET /profile/view-profile/<id>/` | **Mismatch:** path and possibly id semantics (`user_id` vs profile id); confirm with backend. |
| Social links | Dedicated `/profile/social-links/` CRUD | **Not** in `profile` export | May be embedded in PATCH profile only; add client methods if API is separate. |
| Notifications list | `GET /notify/notifications/` | `GET /notifynotifications/` | **Mismatch:** path segment; confirm typo vs legacy. |
| Bookmarks (saved) | `/bookmark/opportunities/saved/`, `/bookmark/applicants/saved/` | Same (plus extras) | **Aligned** for saved lists. |
| Generic bookmark | Not in §6 main table | `GET/POST /bookmark/`, `DELETE /bookmark/<id>/delete/` | **Extra** client surface; confirm if still supported or deprecated. |
| Opportunities `mine` create | Doc emphasizes `POST /opportunities/` for create | `mineCreate` → `POST /opportunities/mine/` | **Verify** whether create should use `/opportunities/` only. |
| Auth extensions | — | `/auth/user/`, `/auth/registration/`, `/auth/password/*`, `DELETE /auth/user/` | **Extra** vs short doc; likely allauth/dj-rest-auth; cross-check Swagger. |

---

## 4. Business rules checklist (§7)

Use this as a quick QA/product checklist (details in **Backend_Project_Flow.md**).

**Accounts**

- One role per account; no role change after signup.
- Email verification required before login.
- OTP expires in **10 minutes**; disposable emails blocked.

**Opportunities**

- Only Enablers post; edit window **12 hours** after post.
- Delete with applicants may **close** rather than hard-delete.
- External links must be **HTTPS**.
- Types: `job`, `internship`, `volunteering`, `scholarship`, `grant`.

**Applications**

- One application per opportunity per user.
- Only Pathfinders apply; withdraw only while **pending**.
- Only owning Enabler changes status via `change_status`.

**Bookmarks**

- Pathfinders: opportunities. Enablers: pathfinders. No duplicates.

**Tokens**

- Access **~1 hour**, refresh **~1 day**; logout invalidates refresh.
- Google users may use **`set-password`** later.

**Files**

- Profile images max **5 MB**; JPEG/JPG/PNG/WEBP; files on **Cloudinary**.

---

## 5. §8 implementation notes (summary)

- Send `Authorization: Bearer <access>` on protected routes; refresh on `401` via `POST /auth/token/refresh/`.
- Opportunities: paginated (`count`, `next`, `previous`, `results`).
- File uploads: `multipart/form-data`, not JSON.
- Errors: field arrays + `non_field_errors` (map to UI).
- OTP emails can be slow; show “resend” after a delay.

**Token table caveat:** §8 lists `GET /notify/notifications/` under “no token” in one table—treat as **verify in Swagger** for your deployment.

---

*Index maintained for the volunteer module frontend; authoritative narrative and payloads remain in [Backend_Project_Flow.md](./Backend_Project_Flow.md).*
