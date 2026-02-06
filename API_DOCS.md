# Afrivate Backend API Reference

**Base URL:** `https://afrivate-backend-production.up.railway.app`

All endpoints that require authentication use **Bearer** token in the `Authorization` header:  
`Authorization: Bearer <access_token>`

---

## Auth

### POST `/auth/change-password/`
Change password. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| old_password | string | ✅ | Non-empty |
| new_password | string | ✅ | Non-empty |
| confirm_password | string | ✅ | Non-empty |

**Response:** 201, same schema as request.

---

### POST `/auth/forgot-password/`
Request password reset. **Bearer optional.**

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| email | string (email) | ✅ |

**Response:** 201, `{ "email": "user@example.com" }`.

---

### POST `/auth/google/` (optional)
Exchange Google id_token for app JWT. **No Bearer.** Backend should verify `id_token` with Google and return app access/refresh tokens (or create user on first sign-in).

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id_token | string | ✅ | Google OAuth2 id_token (credential from Sign In With Google) |
| role | string | ❌ | `"enabler"` \| `"pathfinder"` — for new signups only |

**Response:** 200/201  
`{ "access": "<jwt>", "refresh": "<jwt>" }` (same shape as `/auth/token/`).

---

### POST `/auth/login/`
Login with username or email.

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| username_or_email | string | ✅ |
| password | string | ✅ |

**Response:** 201, schema mirrors request.

---

### POST `/auth/logout/`
Logout. **Bearer required.**

**Response:** 201, no body.

---

### POST `/auth/register/`
Register a new user.

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| username | string | ✅ | 1–150 chars, `^[\w.@+-]+$` |
| email | string (email) | ✅ | 1–254 chars |
| password | string | ✅ | 1–128 chars |
| password2 | string | ✅ | Non-empty |
| role | string | ✅ | Enum: `"enabler"` \| `"pathfinder"` |

**Response:** 201  
`{ "id", "username", "email", "password", "role", "password2" }`

---

### POST `/auth/token/`
Get JWT access + refresh tokens (email + password).

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| email | string | ✅ |
| password | string | ✅ |

**Response:** 201  
Typically returns `{ "access": "<jwt>", "refresh": "<jwt>" }` (exact keys may vary; docs show request schema).

---

### POST `/auth/token/refresh/`
Refresh access token.

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| refresh | string | ✅ | Refresh JWT |

**Response:** 201  
`{ "refresh": "string", "access": "string" }`

---

### GET `/auth/verify-email/`
List verify-email tokens. **Bearer required.**

**Response:** 200, array of `{ "token": "string" }`.

---

### POST `/auth/verify-email/`
Verify email with token. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| token | string | ✅ | 1–64 chars |

**Response:** 201, `{ "token": "string" }`.

---

### POST `/auth/reset-password/` (optional)
Reset password after OTP (no Bearer). If your backend uses a different path or body, update `api.auth.resetPassword` in `src/services/api.js`.

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| email | string (email) | ✅ |
| new_password | string | ✅ |
| confirm_password | string | ✅ |

**Response:** 200/201 on success.

---

### POST `/auth/verify-otp/`
Verify OTP. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| email | string (email) | ✅ | Non-empty |
| otp | string | ✅ | 1–6 chars |

**Response:** 201, `{ "email", "otp" }`.

---

## Bookmark

### GET `/bookmark/bookmarks/`
List current user’s bookmarks. **Bearer required.**

**Response:** 200, array of:
| Field | Type |
|-------|------|
| id | integer |
| opportunity | object (Opportunity) |
| opportunity_id | integer |
| created_at | string (date-time) |

---

### POST `/bookmark/bookmarks/`
Create a bookmark. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| opportunity_id | integer | ✅ |
| opportunity | object | ❌ |

**Response:** 201, same shape with `id`, `opportunity`, `opportunity_id`, `created_at`.

---

### DELETE `/bookmark/bookmarks/{id}/delete/`
Remove a bookmark. **Bearer required.**

**Path:** `id` (string) – bookmark ID.

**Response:** 204.

---

### GET `/bookmark/opportunities/`
List opportunities. **Bearer required.**

**Response:** 200, array of:
| Field | Type |
|-------|------|
| id | integer |
| title | string (1–255) |
| description | string |
| link | string (uri, 1–200) |
| posted_at | string (date-time) |
| is_open | boolean |

---

### POST `/bookmark/opportunities/`
Create an opportunity. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | ✅ | 1–255 chars |
| description | string | ✅ | Non-empty |
| link | string (uri) | ✅ | 1–200 chars |
| is_open | boolean | ❌ |

**Response:** 201, object with `id`, `title`, `description`, `link`, `posted_at`, `is_open`.

---

### GET `/bookmark/opportunities/saved/`
List saved (bookmarked) opportunities. **Bearer required.**

**Response:** 200, array of `{ id, opportunity, opportunity_id, created_at }`.

---

### POST `/bookmark/opportunities/saved/`
Save (bookmark) an opportunity. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| opportunity_id | integer | ✅ |
| opportunity | object | ❌ |

**Response:** 201, `{ id, opportunity, opportunity_id, created_at }`.

---

## Notifications

### GET `/notifynotifications/`
List notifications. **Bearer required.**

**Response:** 200, array of:
| Field | Type | Notes |
|-------|------|-------|
| id | integer | |
| title | string | 1–200 chars |
| message | string \| null | |
| priority | string | Enum: `"info"` \| `"warning"` \| `"critical"` |
| type | string | Enum: `"system"` \| `"server"` \| `"personal"` |
| is_read | boolean | |
| link | string \| null (uri) | ≤200 chars |
| created_at | string (date-time) | |

---

### POST `/notifynotifications/`
Create notification. **Bearer required.**

**Request body (application/json):**  
Same fields as above (title required; others optional).

**Response:** 201, full notification object.

---

### GET `/notifynotifications/{id}/`
Get one notification. **Bearer required.**

**Path:** `id` (integer).

**Response:** 200, notification object.

---

### PUT `/notifynotifications/{id}/`
Full update. **Bearer required.**

**Path:** `id` (integer).  
**Body:** Same as create.

**Response:** 200, updated object.

---

### DELETE `/notifynotifications/{id}/`
Delete notification. **Bearer required.**

**Path:** `id` (integer).

**Response:** 204.

---

## Profile

### Enabler profile

**Base_details (Profile):**  
`profile_pic`, `address`, `city`, `state`, `country`, `contact_email`, `phone_number`, `website`, `bio`, `created_at`

**SocialLink:** nested objects in `social_links` array.

#### GET `/profile/enablerprofile/`
Get enabler profile. **Bearer required.**

**Response:** 200  
`{ "id", "base_details", "social_links", "name" }`

#### POST `/profile/enablerprofile/`
Create enabler profile. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required |
|-------|------|----------|
| base_details | object (Profile) | ✅ |
| social_links | array (SocialLink) | ❌ |
| name | string | ✅ | 1–100 chars |

**Response:** 201, full enabler profile.

#### PUT `/profile/enablerprofile/`
Full update. **Bearer required.**  
**Body:** Same as create. **Response:** 200.

#### PATCH `/profile/enablerprofile/`
Partial update. **Bearer required.**  
**Body:** Same shape, all fields optional. **Response:** 200.

---

### Pathfinder profile

#### GET `/profile/pathfinderprofile/`
Get pathfinder profile. **Bearer required.**

**Response:** 200  
`{ "id", "base_details", "social_links", "first_name", "last_name", "other_name" }`

#### POST `/profile/pathfinderprofile/`
Create pathfinder profile. **Bearer required.**

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| base_details | object (Profile) | ✅ | |
| social_links | array | ❌ | |
| first_name | string | ✅ | 1–50 chars |
| last_name | string | ✅ | 1–50 chars |
| other_name | string \| null | ❌ | ≤50 chars |

**Response:** 201, full pathfinder profile.

#### PUT `/profile/pathfinderprofile/`
Full update. **Bearer required.** **Response:** 200.

#### PATCH `/profile/pathfinderprofile/`
Partial update. **Bearer required.** **Response:** 200.

---

### Profile picture

#### GET `/profile/profile/picture/`
Get current user’s profile picture. **Bearer required.**

**Response:** 200 `{ "id", "profile_pic" }`.

#### PATCH `/profile/profile/picture/`
Update profile picture. **Bearer required.**

**Request:** `multipart/form-data`, field `profile_pic` (binary).

**Response:** 200 `{ "id", "profile_pic" }`.

---

## Waitlist

### POST `/waitlist/`
Submit waitlist email. **Bearer optional.**

**Request body (application/json):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| email | string (email) | ✅ | 1–254 chars |
| name | string \| null | ❌ | ≤255 chars |

**Response:** 201, `{ "email", "name" }`.

---

### GET `/waitlist/stats/`
Waitlist statistics. **Admin only.** **Bearer required.**

**Response:** 200, array of:  
`total_signups`, `verified_signups`, `signups_today`, `signups_this_week`, `signups_this_month`.

---

## Token usage in the app

1. **Login / token:** Call `POST /auth/token/` with `{ email, password }`; store `access` and `refresh` (e.g. in localStorage or memory).
2. **Authenticated requests:** Set header `Authorization: Bearer <access>`.
3. **Refresh:** On 401, call `POST /auth/token/refresh/` with `{ refresh }`, get new `access`, retry the request.
4. **Register:** Use `POST /auth/register/` with `username`, `email`, `password`, `password2`, `role` (`"enabler"` or `"pathfinder"`).

For full interactive docs, open: **https://afrivate-backend-production.up.railway.app/docs/**
