# Documentation

**Afrivate Volunteer Module — Plain English Guide**

This document explains the **website** (the React app in this project) in everyday language: who it is for, what each area does, how a typical visit flows, and how it talks to the **backend server** (API). You do not need to be a programmer to read the overview sections; the API section is a reference for anyone checking endpoints.

---

## 1. What is this website?

**Afrivate** helps match **organizations** that post volunteering roles (**Enablers**) with **people who want to volunteer** (**Pathfinders**).

- **Enabler** — Posts opportunities, reads applications, contacts or bookmarks pathfinders, manages an organization-style profile.
- **Pathfinder** — Browses and saves opportunities, applies with a cover letter (and optional CV), bookmarks organizations, maintains a volunteer profile.

The app stores **login tokens** in the browser (`localStorage`) so you stay signed in. If the session expires, the app tries to **refresh** the token automatically; if that fails, you sign in again.

---

## 2. Big picture: the two sides

*(Diagram: Pathfinder and Enabler both connect to the same Backend API.)*

- **Pathfinder:** Browse opportunities → Apply / save → Profile & bookmarks  
- **Enabler:** Post opportunities → Review applicants → Org profile & settings  
- **Server:** One Afrivate backend API for both roles  

---

## 3. How you get in (authentication)

| Step | What you see | What happens behind the scenes |
|------|----------------|--------------------------------|
| Sign up | `/signup` | Account is created; you may get tokens and a **role** (enabler or pathfinder). |
| Log in | `/login` | Email/password sent to the server; **access** and **refresh** tokens saved; **role** saved. |
| Google | Button on login/signup | Google token sent to server; same idea as login. |
| Forgot password | `/forgot-password` → `/verify-otp` → `/reset-password` | Email/OTP/password reset flow. |
| Log out | From menus / context | Logout request; local tokens cleared. |

**Protected pages** use a wrapper that checks: “Is there a token? Is the role correct (enabler vs pathfinder)?” If not, you are sent to login.

---

## 4. Map of every page (URL → purpose)

Routes come from `src/App.js`. **“Auth”** means you must be logged in; **role** means enabler or pathfinder only.

### Public (anyone)

| URL | Page | What it’s for |
|-----|------|----------------|
| `/` | Landing | Main marketing / entry. |
| `/landingpathfinder` | Landing (pathfinder) | Pathfinder-focused landing. |
| `/landingenabler` | Landing (enabler) | Enabler-focused landing. |
| `/opportunity` | Opportunities list | Browse open opportunities (pathfinder-oriented). |
| `/volunteer-details` | Volunteer details | One opportunity’s detail (often opened with state from list). |
| `/organization/:id` | Organization profile | **Public** view of an enabler/organization by **user id** (from API). Bookmark if logged in as pathfinder. |
| `/about` | About | About the product/company. |
| `/contact` | Contact | Contact form/info. |
| `/privacy` | Privacy policy | Legal text. |
| `/road` | Roadmap | Roadmap content. |
| `/deep-pay-info` | Deep pay info | Information page. |
| `/login`, `/signup` | Auth | Sign in / register. |
| `/forgot-password`, `/verify-otp`, `/reset-password` | Auth | Password recovery. |

### Pathfinder (logged in, role = pathfinder)

| URL | Purpose |
|-----|---------|
| `/dashf`, `/pathf` | Pathfinder dashboard. |
| `/my-applications` | List of your applications. |
| `/apply/:opportunityId` | Apply or edit application for one opportunity. |
| `/bookmarks` | Saved **opportunities** (not org bookmark list). |
| `/available-opportunities` | Discover opportunities (filters/search). |
| `/enabler-profile/:id` | View an enabler profile (alternate route; auth required). |
| `/edit-new-profile`, `/pathfinder/profile-setup` | Edit pathfinder profile (same editor). |

### Enabler (logged in, role = enabler)

| URL | Purpose |
|-----|---------|
| `/enabler/dashboard` | Enabler home: summary, shortcuts. |
| `/create-opportunity` | Create a new volunteering opportunity. |
| `/enabler/recommendations` | Suggested pathfinders (from applications data). |
| `/enabler/profile` | View organization profile. |
| `/enabler/edit-profile` | Edit organization profile. |
| `/enabler/opportunity/:id` | View one of **your** opportunities (enabler). |
| `/enabler/edit-opportunity/:id` | Edit that opportunity. |
| `/enabler/opportunities-posted` | All opportunities you posted. |
| `/enabler/settings` | Settings (profile, password, picture, etc.). |
| `/enabler/pathfinder/:id` | View a pathfinder’s profile (often from applicants). |
| `/enabler/contact/:id` | Contact a pathfinder (sends notification). |
| `/enabler/bookmarked-pathfinders` | Pathfinders you bookmarked (applicants saved). |
| `/enabler/applicants/:id` | **`:id` = opportunity id** — list of applicants. |
| `/enabler/profile-setup` | First-time enabler profile setup wizard. |

### Other logged-in (any role, or generic)

| URL | Purpose |
|-----|---------|
| `/emppro` | Profile-related page (`emppro.js`). |
| `/dash-employer`, `/dash-freelance` | Dashboard-style pages for employer/freelance flows. |
| `/dashboard`, `/profile`, `/kyc` | Generic dashboard, profile settings UI, KYC form (wrapped with layout `Navbar`). |

---

## 5. Main user flows

### Pathfinder: from browsing to applying

1. Open opportunities list → API fetches open roles.  
2. Open details → API fetches one opportunity.  
3. Optional: **Save** opportunity → POST saved opportunities.  
4. **Apply** → POST application + cover letter.  
5. Optional: upload CV → POST profile credentials (file).  

**Typical buttons:** Save / Saved; Apply / View application; View organization profile.

### Enabler: post a role → review people

1. Create opportunity → POST to API.  
2. Opportunity appears in “mine” list.  
3. Pathfinders apply.  
4. Open **Applicants** for that opportunity.  
5. View pathfinder profile, bookmark, approve or reject.  

### Pathfinder: bookmark an organization

On **organization profile** (`/organization/:id`), **Save organization** uses the **generic bookmark** API (pathfinder ↔ enabler), not the “saved applicants” API.

---

## 6. Where the API is used (plain English)

All calls go through **`src/services/api.js`**. Full URLs: `{REACT_APP_API_BASE_URL}` + `/api` + path (default base is Railway unless `.env` overrides).

### Login & account (`auth`)

| Plain English | HTTP | Path (after `/api`) |
|---------------|------|----------------------|
| Log in (legacy) | POST | `/auth/login/` |
| Register | POST | `/auth/register/` |
| Log out | POST | `/auth/logout/` |
| Get tokens | POST | `/auth/token/` |
| Refresh token | POST | `/auth/token/refresh/` |
| Forgot / verify OTP / reset password | POST | `/auth/forgot-password/`, etc. |
| Google sign-in | POST | `/auth/google/` |
| User CRUD | various | `/auth/user/` etc. (see `api.js`) |

### Profiles (`profile`)

| Plain English | HTTP | Path |
|---------------|------|------|
| Get my enabler profile | GET | `/profile/enablerprofile/` |
| Get enabler by user id (public org) | GET | `/profile/enablerprofile/user/{userId}/` |
| Enabler create/update/patch | POST/PUT/PATCH | `/profile/enablerprofile/` |
| Get my pathfinder profile | GET | `/profile/pathfinderprofile/` |
| Get pathfinder by id (enabler view) | GET | `/profile/view-profile/{id}/` |
| Pathfinder create/update/patch | POST/PUT/PATCH | `/profile/pathfinderprofile/` |
| Profile picture | GET/PATCH | `/profile/profile/picture/` |
| Credentials (CV, etc.) | GET/POST/DELETE | `/profile/credentials/` … |

### Bookmarks

| Plain English | HTTP | Path |
|---------------|------|------|
| List generic bookmarks | GET | `/bookmark/` |
| Create / delete bookmark | POST / DELETE | `/bookmark/`, `/bookmark/{id}/delete/` |
| Pathfinder: saved opportunities | GET/POST/DELETE | `/bookmark/opportunities/saved/` … |
| Enabler: saved applicants | GET/POST/DELETE | `/bookmark/applicants/saved/` … |

### Opportunities

| Plain English | HTTP | Path |
|---------------|------|------|
| List / create | GET / POST | `/opportunities/` |
| My opportunities | GET | `/opportunities/mine/` |
| One opportunity CRUD | GET/PUT/PATCH/DELETE | `/opportunities/{id}/` |
| Applicants list / one applicant | GET | `/opportunities/{id}/applicants/`, `.../applicants/{applicantId}/` |

### Applications

| Plain English | HTTP | Path |
|---------------|------|------|
| List / submit / update | GET / POST / PUT / PATCH | `/applications/` … |
| Change status | PATCH | `/applications/{id}/change_status/` |

### Notifications & waitlist

- **Notifications:** e.g. enabler contacting pathfinder — `notifynotifications` paths in `api.js`.  
- **Waitlist:** `/waitlist/` — lightly used in UI.

---

## 7. Important code files (technical)

| File | Role |
|------|------|
| `src/services/api.js` | All HTTP calls to backend; auth header; token refresh. |
| `src/context/UserContext.js` | Current user from profile after login. |
| `src/components/auth/RequireAuth.js` | Route protection by role. |
| `src/utils/pathfinderProfilePayload.js` | Pathfinder profile JSON shape. |
| `src/utils/websiteUrl.js` | Normalize website URLs (`https://`). |
| `src/utils/bookmarkHelpers.js` | Bookmark list normalization. |
| `src/utils/opportunityUtils.js` | Opportunity navigation helpers. |

---

## 8. Cookies & analytics

Cookie consent; Google Analytics only if user consents.

---

## 9. Appendix — Primary buttons by area

- **Auth:** Submit, links between login/signup/recovery, Google.  
- **Pathfinder opportunities:** Search, Save/Saved, Apply, View organization profile, bookmark on details.  
- **Apply:** Form fields, CV upload, Submit.  
- **Bookmarks / My applications:** Open items, remove saves.  
- **Edit profile:** Fields, photo, CV, Save.  
- **Organization profile:** Save organization, contact links.  
- **Enabler dashboard:** Post, View Profile, opportunity cards.  
- **Create/edit opportunity:** Save, delete, applicants link.  
- **Applicants:** Approve/Reject, View Profile, Bookmark, Contact.  
- **Pathfinder profile (enabler view):** Bookmark, contact.  
- **Enabler profile/settings:** Edit, Save, uploads.  
- **Bookmarked pathfinders:** View profile, Contact, Remove.  
- **Nav:** Home, Recommendations, Posted, Bookmarked pathfinders, Settings, Logout, Post opportunity.

---

## 10. Document history

- Matches `src/services/api.js` and `src/App.js` at time of writing.

### PDF copy

The file **`Documentation.pdf`** in the project root is the printable copy of this guide. To regenerate it after you edit **`Documentation.md`**:

1. Run: `python scripts/md_to_html.py` (requires Python and the `markdown` package: `pip install markdown`).
2. Run Chrome in headless mode to print the HTML to PDF, for example:
   - `chrome.exe --headless --disable-gpu --print-to-pdf=Documentation.pdf file:///FULL/PATH/TO/Documentation.html`

---

*End of Documentation.*
