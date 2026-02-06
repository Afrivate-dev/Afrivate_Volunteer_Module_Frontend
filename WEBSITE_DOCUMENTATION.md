# Afrivate Volunteer Module – Website Documentation

This document provides a complete overview of the Afrivate volunteer platform: structure, functionality, assets, API usage, and technical details for indexing and reference.

---

## 1. Overview

**Afrivate** is a volunteer and opportunity-matching platform connecting **Pathfinders** (volunteers) with **Enablers** (organizations/employers). The application is built with React and uses a backend API for authentication, profiles, opportunities, and bookmarks.

- **Tech stack:** React 18, React Router v6, Tailwind CSS
- **Backend:** REST API at `https://afrivate-backend-production.up.railway.app`
- **Analytics:** Google Analytics (G-XDX60DZTG4), with cookie consent

---

## 2. Application Structure

### 2.1 Entry Points

| File | Purpose |
|------|---------|
| `public/index.html` | HTML shell, meta tags, favicon |
| `src/index.js` | React entry, root render |
| `src/App.js` | Routes, UserProvider, CookieConsent |

### 2.2 Routing

The app uses **HashRouter** (e.g. `/#/login`). All routes are defined in `App.js`.

**Route summary:** 33 routes across public, auth, pathfinder, enabler, and protected sections.

---

## 3. Routes & Pages

### 3.1 Public Landing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Landing.js` | Main landing page |
| `/landingpathfinder` | `LandingPathfinder.js` | Pathfinder-specific landing |
| `/landingenabler` | `Landingenabler.js` | Enabler-specific landing |

### 3.2 Authentication

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | `Login.js` | Email/password + Google OAuth |
| `/signup` | `SignUp.js` | User registration (pathfinder/enabler) |
| `/forgot-password` | `ForgotPassword.js` | Request password reset |
| `/verify-otp` | `VerifyOTP.js` | OTP verification |
| `/reset-password` | `ResetPassword.js` | Set new password after OTP |

### 3.3 Pathfinder (Volunteer)

| Path | Component | Description |
|------|-----------|-------------|
| `/pathf` | `PathfinderDashboard.js` | Pathfinder dashboard |
| `/dashf` | `Pathf` (PathfinderDashboard) | Alias for pathfinder dashboard |
| `/opportunity` | `Opportunity.js` | Browse & search opportunities |
| `/volunteer-details` | `VolunteerDetails.js` | Opportunity details (via state) |
| `/bookmarks` | `Bookmarks.js` | Saved opportunities |
| `/edit-new-profile` | `EditNewProfile.js` | Pathfinder profile editor |

### 3.4 Enabler (Employer/Organization)

| Path | Component | Description |
|------|-----------|-------------|
| `/enabler/dashboard` | `EnablerDashboard.js` | Enabler dashboard |
| `/create-opportunity` | `CreateOpportunity.js` | Create new opportunity |
| `/enabler/opportunities-posted` | `OpportunitiesPosted.js` | List of posted opportunities |
| `/enabler/opportunity/:id` | `OpportunityDetails.js` | View opportunity details |
| `/enabler/edit-opportunity/:id` | `EditOpportunity.js` | Edit opportunity |
| `/enabler/profile` | `EnablerProfile.js` | View enabler profile |
| `/enabler/edit-profile` | `EditProfile.js` | Edit enabler profile |
| `/enabler/profile-setup` | `EnablerProfileSetup.js` | Initial profile setup |
| `/enabler/recommendations` | `Recommendations.js` | Recommendations |
| `/enabler/settings` | `Settings.js` | Account settings |
| `/enabler/pathfinder/:id` | `PathfinderProfile.js` | View pathfinder profile |
| `/enabler/contact/:id` | `ContactPathfinder.js` | Contact pathfinder |
| `/enabler/bookmarked-pathfinders` | `EnablerPathfinderBookmarks.js` | Bookmarked pathfinders |
| `/enabler/applicants/:id` | `Applicants.js` | Applicants for opportunity |

### 3.5 Other

| Path | Component | Description |
|------|-----------|-------------|
| `/emppro` | `Emppro.js` | Employer profile |
| `/road` | `Roadmap.js` | Roadmap page |
| `/deep-pay-info` | `DeepPayInfo.js` | Deep Pay info |
| `/about` | `AboutUs.js` | About the platform |
| `/contact` | `ContactUs.js` | Contact form |
| `/privacy` | `PrivacyPolicy.js` | Privacy policy |

### 3.6 Protected (Navbar Included)

| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | `Dashboard.js` | Main dashboard |
| `/profile` | `Profile.js` | User profile |
| `/kyc` | `KYCForm.js` | KYC form |

### 3.7 Orphan Pages (No Route)

These files exist but have no route in `App.js`:

- `Dash-employer.js`
- `Dash-freelance.js`
- `Community.js`
- `subm.js`
- `Register.js` (use `/signup` instead)

---

## 4. Components

### 4.1 Auth

| Component | Purpose |
|-----------|---------|
| `RequireAuth` | Redirects unauthenticated users to `/login` |
| `GoogleAuthButton` | Google OAuth2 sign-in/sign-up |
| `OTPInput` | OTP input for verify-otp flow |
| `Navbar` (auth/) | Auth/navigation bar |

### 4.2 Layout & Common

| Component | Purpose |
|-----------|---------|
| `Navbar` (layout/) | Main app navbar |
| `Button` | Reusable button |
| `Input` | Reusable form input |
| `Modal` | Modal dialog |
| `SocialButton` | Social login button |
| `Toast` | Toast notifications |

### 4.3 Other

| Component | Purpose |
|-----------|---------|
| `CookieConsent` | Cookie consent banner |
| `KYCForm` | KYC form component |
| `Wavy` | Wavy divider/background |

---

## 5. API Layer

### 5.1 Configuration

- **Base URL:** `https://afrivate-backend-production.up.railway.app`
- **API prefix:** `/api`
- **Override:** `REACT_APP_API_BASE_URL`, `REACT_APP_API_PREFIX` in `.env`

### 5.2 Client (`src/services/api.js`)

Exports: `auth`, `bookmark`, `notifications`, `profile`, `waitlist`, plus token helpers.

### 5.3 Auth Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login/` | Login (username_or_email, password) |
| POST | `/auth/register/` | Register (username, email, password, password2, role) |
| POST | `/auth/logout/` | Logout (Bearer) |
| POST | `/auth/token/` | Get JWT (email, password) |
| POST | `/auth/token/refresh/` | Refresh access token |
| POST | `/auth/forgot-password/` | Request reset (email) |
| POST | `/auth/verify-otp/` | Verify OTP (email, otp) |
| POST | `/auth/reset-password/` | Reset password after OTP |
| POST | `/auth/google/` | Exchange Google id_token for JWT |

### 5.4 Bookmark Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/bookmark/bookmarks/` | List bookmarks |
| POST | `/bookmark/bookmarks/` | Create bookmark (opportunity_id) |
| DELETE | `/bookmark/bookmarks/{id}/delete/` | Delete bookmark |
| GET | `/bookmark/opportunities/` | List opportunities |
| POST | `/bookmark/opportunities/` | Create opportunity |
| GET | `/bookmark/opportunities/saved/` | List saved opportunities |
| POST | `/bookmark/opportunities/saved/` | Save opportunity (opportunity_id) |

### 5.5 Profile Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST/PUT/PATCH | `/profile/enablerprofile/` | Enabler profile |
| GET/POST/PUT/PATCH | `/profile/pathfinderprofile/` | Pathfinder profile |
| GET/PATCH | `/profile/profile/picture/` | Profile picture |

### 5.6 Notifications & Waitlist

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/notifynotifications/` | Notifications |
| GET/PUT/DELETE | `/notifynotifications/{id}/` | Single notification |
| POST | `/waitlist/` | Add to waitlist (email, name?) |
| GET | `/waitlist/stats/` | Waitlist stats (admin) |

### 5.7 Token Storage

- `localStorage`: `afrivate_access`, `afrivate_refresh`, `afrivate_role` (enabler | pathfinder)
- 401 handling: automatic token refresh and retry

---

## 6. Context & State

### 6.1 UserContext

- **Provider:** `UserProvider` wraps the app
- **Hook:** `useUser()` → `{ user, loading, updateUser, logout, refetchUser }`
- **Behavior:** Fetches enabler or pathfinder profile based on role; clears user on 401

### 6.2 LocalStorage (Fallback / Legacy)

Used when API is unavailable or for certain flows:

| Key | Purpose |
|-----|---------|
| `userProfile` | Pathfinder profile |
| `hasCompletedProfile` | Profile completion flag |
| `enablerProfile` | Enabler profile |
| `hasCompletedEnablerProfile` | Enabler profile completion |
| `bookmarkedJobs`, `bookmarkedJobsData` | Bookmarks fallback |
| `enablerOpportunities` | Posted opportunities |
| `bookmarkedPathfinders` | Bookmarked pathfinders |
| `enablerContactMessages` | Contact messages |

---

## 7. Assets

### 7.1 Location

- **Primary:** `src/Assets/`
- **Public:** `public/` (favicon, logos, manifest, robots.txt)

### 7.2 Asset Inventory (`src/Assets/`)

**Images (PNG/JPG):**

- Logos: `Beck logo black 1.png`, `Logos/Vector.png`
- Illustrations: `AI rob.png`, `AI rob (1).png`, `volunteer.png`, `job.png`, `learning.png`
- UI elements: `Blob 1.png`, `blob 2.png`, `Frame 392.png`, `Frame 393 (1).png`, `Frame 394.png`
- Icons: `healthicons_justice-outline-24px.png`, `lets-icons_group-fill.png`, `mdi_police-badge.png`, `zondicons_shield.png`, etc.
- Content: `How It Works.png`, `topimage.png`, `topimage2.png`, `main.png`
- Nested: `assets/` (screenshots, placeholders), `img/` (icons, pathf, S1–S5), etc.

**Video:**

- `bg-video.mp4` – background video

**Subdirectories:**

- `assets/` – additional screenshots and UI assets
- `img/icons/`, `img/pathf/` – icons and pathfinder images
- `Logos/` – logo assets

### 7.3 Public Assets

- `favicon.ico`, `logo192.png`, `logo512.png`
- `manifest.json`, `robots.txt`
- `topimage.png`, `Vector.png`, `paper-plane.svg`

---

## 8. Utilities

| File | Purpose |
|------|---------|
| `cookieConsent.js` | Cookie consent storage and helpers |
| `gtag.js` | Google Analytics script loading |
| `pathfinderData.js` | Pathfinder seed/sample data |
| `seedLocalStorage.js` | LocalStorage seeding for dev |

---

## 9. Key User Flows

### 9.1 Pathfinder

1. Land on `/` or `/landingpathfinder`
2. Sign up (`/signup`) or log in (`/login`)
3. Complete profile (`/edit-new-profile`)
4. Browse opportunities (`/opportunity`)
5. Save opportunities (bookmark) or view details (`/volunteer-details`)
6. Manage bookmarks (`/bookmarks`)

### 9.2 Enabler

1. Land on `/` or `/landingenabler`
2. Sign up or log in
3. Profile setup (`/enabler/profile-setup`)
4. Create opportunities (`/create-opportunity`)
5. Manage opportunities (`/enabler/opportunities-posted`, `/enabler/opportunity/:id`, `/enabler/edit-opportunity/:id`)
6. View applicants, pathfinders, contact

### 9.3 Auth

- **Login:** Email + password → `api.auth.token` → `api.setTokens` → role detection → redirect
- **Google:** `GoogleAuthButton` → `api.auth.google` → same flow
- **Forgot password:** `/forgot-password` → `api.auth.forgotPassword` → `/verify-otp` → `/reset-password`

---

## 10. External References

- **API docs (live):** https://afrivate-backend-production.up.railway.app/docs/
- **Project docs:** `API_DOCS.md`, `ROUTES_API_REQUIREMENTS.md`, `ROUTES.md`, `LOCALSTORAGE_ROUTES.md`

---

## 11. Indexing Notes

- **Title pattern:** Pages set `document.title` (e.g. "Login - AfriVate", "Opportunities - AfriVate")
- **Sitemap:** Check `robots.txt` and any sitemap configuration
- **Meta:** `index.html` contains meta tags; individual pages may set additional meta via `document.title`

---

*Generated for Afrivate Volunteer Module. Last updated: February 2025.*
