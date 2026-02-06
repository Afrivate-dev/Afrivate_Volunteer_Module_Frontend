# Routes Requiring API or Connection Functionality

This document lists routes that depend on an external API, backend service, or localStorage.  
**Full API reference:** see **`API_DOCS.md`** (mirrors https://afrivate-backend-production.up.railway.app/docs/).

---

## Backend Base URL and Client

- **Base URL:** `https://afrivate-backend-production.up.railway.app`
- **API docs (live):** https://afrivate-backend-production.up.railway.app/docs/
- **Client:** `src/services/api.js` – exports `auth`, `bookmark`, `notifications`, `profile`, `waitlist`, plus `getAccessToken`, `setTokens`, `clearTokens`, etc.

**Auth tokens:** Stored in localStorage as `afrivate_access` and `afrivate_refresh`. Use `api.auth.token({ email, password })` to get tokens, then `api.setTokens(access, refresh)`.

---

## Auth API Endpoints (from API_DOCS.md)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login/` | POST | username_or_email, password |
| `/auth/register/` | POST | username, email, password, password2, role ("enabler" \| "pathfinder") |
| `/auth/logout/` | POST | Bearer required |
| `/auth/token/` | POST | email, password → access + refresh JWT |
| `/auth/token/refresh/` | POST | refresh → new access |
| `/auth/forgot-password/` | POST | email |
| `/auth/change-password/` | POST | old_password, new_password, confirm_password |
| `/auth/verify-email/` | GET \| POST | list \| verify token |
| `/auth/verify-otp/` | POST | email, otp |

---

## Bookmark API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/bookmark/bookmarks/` | GET \| POST | List \| create bookmark (opportunity_id) |
| `/bookmark/bookmarks/{id}/delete/` | DELETE | Remove bookmark |
| `/bookmark/opportunities/` | GET \| POST | List \| create opportunity |
| `/bookmark/opportunities/saved/` | GET \| POST | List \| save bookmarked opportunity |

---

## Profile API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/profile/enablerprofile/` | GET \| POST \| PUT \| PATCH | Enabler profile (base_details, social_links, name) |
| `/profile/pathfinderprofile/` | GET \| POST \| PUT \| PATCH | Pathfinder profile (base_details, social_links, first_name, last_name, other_name) |
| `/profile/profile/picture/` | GET \| PATCH | Get \| update profile picture (PATCH: multipart/form-data) |

---

## Notifications and Waitlist

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/notifynotifications/` | GET \| POST | List \| create notification |
| `/notifynotifications/{id}/` | GET \| PUT \| DELETE | Get \| update \| delete |
| `/waitlist/` | POST | email, name? |
| `/waitlist/stats/` | GET | Admin only |

---

## Routes in the App

### Using backend API (when wired)

- **Login:** Use `api.auth.token({ email, password })` or `api.auth.login({ username_or_email, password })`; then `api.setTokens(access, refresh)` and redirect.
- **Register:** Use `api.auth.register({ username, email, password, password2, role })`; then optionally get token and set tokens.
- **Logout:** Call `api.auth.logout()` and `api.clearTokens()`.
- **Forgot password:** `api.auth.forgotPassword({ email })`.
- **Change password:** `api.auth.changePassword({ old_password, new_password, confirm_password })`.
- **Verify OTP:** `api.auth.verifyOtp({ email, otp })`.
- **Bookmarks:** `api.bookmark.list()`, `api.bookmark.create({ opportunity_id })`, `api.bookmark.delete(id)`.
- **Enabler profile:** `api.profile.enablerGet()`, `api.profile.enablerCreate(body)`, `api.profile.enablerPatch(body)`.
- **Pathfinder profile:** `api.profile.pathfinderGet()`, `api.profile.pathfinderCreate(body)`, `api.profile.pathfinderPatch(body)`.
- **Profile picture:** `api.profile.pictureGet()`, `api.profile.picturePatch(formData)`.
- **Notifications:** `api.notifications.list()`, etc.
- **Waitlist:** `api.waitlist.create({ email, name })`.

### Using localStorage (current fallback)

- **Pathfinder profile form:** `userProfile`, `hasCompletedProfile`.
- **Enabler profile:** `enablerProfile`, `hasCompletedEnablerProfile`.
- **Bookmarks (pathfinder):** `bookmarkedJobs`, `bookmarkedJobsData`.
- **Enabler opportunities:** `enablerOpportunities`.
- **Bookmarked pathfinders:** `bookmarkedPathfinders`.
- **Contact messages:** `enablerContactMessages`.

See **`LOCALSTORAGE_ROUTES.md`** for full list of localStorage-backed routes and keys.

---

## Summary

| Source | File | Purpose |
|--------|------|---------|
| API reference | `API_DOCS.md` | Full request/response schemas for production backend |
| API client | `src/services/api.js` | `auth`, `bookmark`, `profile`, `notifications`, `waitlist`, token helpers |
| This file | `ROUTES_API_REQUIREMENTS.md` | Routes and which API/localStorage they use |
| Local only | `LOCALSTORAGE_ROUTES.md` | localStorage keys and how to test without backend |
