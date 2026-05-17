# Afrivate Volunteer Module – Comprehensive Master Index

**Purpose:** Complete reference documentation for the entire Afrivate Volunteer Module frontend application, including all dependencies, frameworks, APIs, components, pages, routes, and utilities.

**Last Updated:** May 2026  
**Project Type:** React Single-Page Application (SPA)  
**Deployment:** Vercel

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & Security](#4-authentication--security)
5. [API Endpoints (Complete Reference)](#5-api-endpoints-complete-reference)
6. [Frontend Routes](#6-frontend-routes)
7. [Components](#7-components)
8. [Pages](#8-pages)
9. [Context & State Management](#9-context--state-management)
10. [Utilities](#10-utilities)
11. [Styling & Theme](#11-styling--theme)
12. [Environment Configuration](#12-environment-configuration)
13. [Key Features & Data Flows](#13-key-features--data-flows)
14. [Build & Deployment](#14-build--deployment)

---

## 1. Project Overview

**Application:** Afrivate Volunteer Module  
**Purpose:** A volunteer-matching platform connecting African volunteers (Pathfinders) with organizations posting opportunities (Enablers)

**Core Features:**
- User authentication (email/password, Google OAuth, OTP verification)
- Role-based access (Pathfinders & Enablers)
- Opportunity posting, browsing, and application submission
- User profile management and setup
- Bookmark/favorites system
- Real-time notifications
- Application status tracking and management
- KYC (Know Your Customer) verification
- Social links integration

**Key User Roles:**
- **Pathfinder:** Volunteers seeking opportunities
- **Enabler:** Organizations posting opportunities

---

## 2. Technology Stack

### Core Framework & Runtime
- **React:** v18.2.0 — UI library with hooks, context API
- **React Router:** v6.22.1 — Client-side routing (HashRouter)
- **Node.js:** 18+ (development)
- **npm:** 9+ (package manager)

### Styling & UI
- **Tailwind CSS:** v3 — Utility-first CSS framework
  - **Brand Color:** `#6A00B1` (purple)
  - **Extended Colors:** Full purple palette (50-900)
  - **Custom Fonts:** Inter, Montserrat, Poppins
  - **Custom Animations:** Wave, float
- **PostCSS:** Autoprefixer for CSS compatibility

### Authentication & OAuth
- **@react-oauth/google:** v0.13.4 — Google Sign-In integration
- **JWT (Bearer Tokens):** For API authentication

### Build & Development Tools
- **React Scripts:** v5.0.1 — CRA build tooling
- **Testing Library:** @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- **Web Vitals:** v2.1.4 — Performance monitoring
- **Hero Icons:** @heroicons/react v2.1.1 — SVG icon library

### Analytics
- **Google Analytics 4** (gtag.js) — Conditional on user consent

---

## 3. Project Structure

```
src/
├── App.js                          # Main app component with routing
├── App.css                         # App-level styles
├── index.js                        # React entry point (HashRouter, GoogleOAuthProvider)
├── index.css                       # Global styles
├── setupTests.js                   # Testing configuration
├── reportWebVitals.js             # Performance monitoring
│
├── Assets/                         # Static assets
│   ├── api/                       # API documentation (PDFs)
│   ├── img/                       # Images and icons
│   └── Logos/                     # Brand logos
│
├── components/                     # Reusable UI components
│   ├── CookieConsent.js          # GDPR/Privacy cookie banner
│   ├── auth/                      # Authentication components
│   │   ├── Navbar.js             # Navigation bar
│   │   ├── GoogleAuthButton.js   # Google Sign-In button
│   │   ├── OTPInput.js           # OTP input field
│   │   ├── RequireAuth.js        # Route protection HOC
│   │   └── EnablerNavbar.js      # Enabler-specific navbar
│   ├── common/                    # Shared UI components
│   │   ├── Button.js             # Generic button
│   │   ├── Input.js              # Form input
│   │   ├── PasswordInput.js      # Secure password input
│   │   ├── Modal.js              # Modal dialog
│   │   ├── Toast.js              # Notification toast
│   │   ├── Pagination.js         # Pagination controls
│   │   ├── FormattedText.js      # Text formatting utility
│   │   └── SocialButton.js       # Social media links
│   └── forms/                     # Form components
│       └── KYCForm.js            # Government credentials/KYC
│
├── context/                        # React Context for state management
│   └── UserContext.js             # User authentication & profile state
│
├── pages/                          # Page components (route endpoints)
│   ├── Landing.js                 # Home page
│   ├── LandingPathfinder.js       # Pathfinder landing variant
│   ├── Landingenabler.js          # Enabler landing variant
│   ├── AboutUs.js                 # About page
│   ├── ContactUs.js               # Contact page
│   ├── DeepPayInfo.js             # Payment info page
│   ├── Roadmap.js                 # Feature roadmap
│   ├── Notifications.js           # Notifications center
│   ├── PrivacyPolicy.js           # Privacy policy
│   ├── NotFound.js                # 404 error page
│   │
│   ├── auth/                       # Authentication pages
│   │   ├── Login.js               # Email/password login
│   │   ├── SignUp.js              # User registration
│   │   ├── ForgotPassword.js      # Password recovery init
│   │   ├── VerifyOTP.js           # OTP verification
│   │   ├── ResetPassword.js       # Password reset
│   │   └── SetPassword.js         # Initial password setup
│   │
│   ├── pathfinder/                 # Pathfinder (volunteer) pages
│   │   ├── PathfinderDashboard.js # Volunteer dashboard
│   │   ├── AvailableOpportunities.js # Browse opportunities
│   │   ├── Opportunity.js         # Single opportunity view
│   │   ├── ApplyApplication.js    # Application submission
│   │   ├── MyApplications.js      # Application status tracking
│   │   ├── Bookmarks.js           # Saved opportunities
│   │   ├── EditNewProfile.js      # Profile setup/editing
│   │   ├── EnablerProfileView.js  # View organization profiles
│   │   ├── OrganizationProfile.js # Organization details
│   │   ├── VolunteerDetails.js    # Volunteer profile view
│   │   └── PathfinderSettings.js  # Volunteer settings
│   │
│   └── enabler/                    # Enabler (organization) pages
│       ├── EnablerDashboard.js    # Organization dashboard
│       ├── CreateOpportunity.js   # Post new opportunity
│       ├── OpportunitiesPosted.js # View posted opportunities
│       ├── OpportunityDetails.js  # View opportunity applicants
│       ├── EditOpportunity.js     # Edit posted opportunity
│       ├── Applicants.js          # List applicants for opportunity
│       ├── PathfinderProfile.js   # View applicant profile
│       ├── ContactPathfinder.js   # Contact volunteer
│       ├── EnablerProfile.js      # Organization profile view
│       ├── EditProfile.js         # Edit organization profile
│       ├── EnablerProfileSetup.js # Profile setup wizard
│       ├── EnablerPathfinderBookmarks.js # Bookmarked volunteers
│       ├── Recommendations.js     # AI/matching recommendations
│       └── Settings.js            # Organization settings
│
├── services/                       # API & backend integration
│   └── api.js                     # Centralized API client (fetch-based)
│
└── utils/                          # Helper functions
    ├── api.js                     # [Duplicate path - should be in services/]
    ├── bookmarkHelpers.js         # Bookmark management utilities
    ├── cookieConsent.js           # Cookie consent logic
    ├── descriptionUtils.js        # Text/description formatting
    ├── gtag.js                    # Google Analytics helpers
    ├── opportunityUtils.js        # Opportunity filtering/formatting
    ├── pathfinderData.js          # Pathfinder data helpers
    ├── pathfinderProfilePayload.js # Profile payload construction
    ├── syncSocialLinks.js         # Social media links sync
    └── websiteUrl.js              # URL/navigation utilities

public/
├── index.html                      # HTML entry point
├── manifest.json                  # PWA manifest
├── robots.txt                     # SEO robots file
└── sitemap.xml                    # SEO sitemap

package.json                       # Dependencies & scripts
tailwind.config.js                # Tailwind CSS configuration
postcss.config.js                 # PostCSS configuration
```

---

## 4. Authentication & Security

### Token Management
- **Access Token:** `afrivate_access` — Short-lived JWT
- **Refresh Token:** `afrivate_refresh` — Long-lived token for token refresh
- **Role:** `afrivate_role` — Stored as "pathfinder" or "enabler"
- **Storage:** localStorage (all tokens and role)

### Authentication Methods
1. **Email/Password Login**
   - `POST /auth/login/` — Credentials-based authentication
   - Response includes `access`, `refresh`, and `user` data

2. **Google OAuth**
   - `POST /auth/google/pathfinder/` — Google login for volunteers
   - `POST /auth/google/enabler/` — Google login for organizations
   - `googleAuthWithRole()` helper tries pathfinder first, then enabler

3. **OTP Verification**
   - `POST /auth/verify-otp/` — Email OTP verification
   - `POST /auth/resend-otp/` — Resend OTP
   - Used for registration and password reset

4. **Password Management**
   - `POST /auth/forgot-password/` — Initiate password reset
   - `POST /auth/verify-password-reset-otp/` — Verify OTP for reset
   - `POST /auth/reset-password/` — Complete password reset
   - `POST /auth/change-password/` — Change password (authenticated)
   - `POST /auth/set-password/` — Initial password setup

### Authorization
- **Role-Based Access Control:** RequireAuth component enforces role checks
- **401 Handling:** Automatic token refresh on 401 (retry once mechanism)
- **Protected Routes:** Pathfinder and Enabler routes guarded by RequireAuth

### API Request Configuration
```javascript
// Default headers for all requests:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>" // If authenticated
}

// FormData requests: Content-Type automatically set to multipart/form-data
```

### Error Handling
- **Validation Errors:** Flattened and user-friendly messages
- **Network Errors:** Generic "Please check your connection" message
- **API Errors:** Uses `detail`, `message`, `error`, `non_field_errors` fields

---

## 5. API Endpoints (Complete Reference)

### Base Configuration
- **Base URL:** `https://afrivate-backend-production.up.railway.app` (configurable via `REACT_APP_API_BASE_URL`)
- **API Prefix:** `/api` (configurable via `REACT_APP_API_PREFIX`)
- **Full Endpoint Format:** `{BASE_URL}{API_PREFIX}{path}`
- **Example:** `https://afrivate-backend-production.up.railway.app/api/auth/login/`

### Auth Endpoints

| Module | Method | Path | Auth | Body | Purpose |
|--------|--------|------|------|------|---------|
| `auth.register()` | POST | `/auth/register/` | None | `{email, password, password2, first_name?, last_name?}` | User registration |
| `auth.verifyOtp()` | POST | `/auth/verify-otp/` | None | `{email, otp}` | Verify OTP (email confirmation) |
| `auth.resendOtp()` | POST | `/auth/resend-otp/` | None | `{email}` | Resend OTP |
| `auth.login()` | POST | `/auth/login/` | None | `{email, password}` | Email/password login → `{access, refresh, user}` |
| `auth.forgotPassword()` | POST | `/auth/forgot-password/` | None | `{email}` | Initiate password reset |
| `auth.verifyPasswordResetOtp()` | POST | `/auth/verify-password-reset-otp/` | None | `{email, otp}` | Verify password reset OTP |
| `auth.resetPassword()` | POST | `/auth/reset-password/` | None | `{email, otp, password, password2}` | Complete password reset |
| `auth.changePassword()` | POST | `/auth/change-password/` | Bearer | `{old_password, new_password, new_password2}` | Change password (authenticated) |
| `auth.logout()` | POST | `/auth/logout/` | Bearer | `{refresh?}` | Logout & invalidate tokens |
| `auth.tokenRefresh()` | POST | `/auth/token/refresh/` | None | `{refresh}` | Refresh access token |
| `auth.googlePathfinder()` | POST | `/auth/google/pathfinder/` | None | `{token}` | Google login for pathfinders |
| `auth.googleEnabler()` | POST | `/auth/google/enabler/` | None | `{token}` | Google login for enablers |
| `auth.setPassword()` | POST | `/auth/set-password/` | Bearer | `{password, password2}` | Set initial password |
| `auth.deleteAccount()` | DELETE | `/auth/delete-account/` | Bearer | — | Delete user account |

### Profile Endpoints

| Module | Method | Path | Auth | Body | Purpose |
|--------|--------|------|------|------|---------|
| `profile.enablerGet()` | GET | `/profile/enablerprofile/` | Bearer | — | Get current enabler profile |
| `profile.enablerGetById()` | GET | `/profile/enablerprofile/user/{user_id}/` | Public | — | Get enabler profile by user ID |
| `profile.enablerCreate()` | PATCH | `/profile/enablerprofile/` | Bearer | `{...enabler fields}` | Create/update enabler profile |
| `profile.enablerUpdate()` | PUT | `/profile/enablerprofile/` | Bearer | `{...enabler fields}` | Full enabler profile update |
| `profile.enablerPatch()` | PATCH | `/profile/enablerprofile/` | Bearer | `{...partial fields}` | Partial enabler profile update |
| `profile.pathfinderGet()` | GET | `/profile/pathfinderprofile/` | Bearer | — | Get current pathfinder profile |
| `profile.pathfinderGetById()` | GET | `/profile/pathfinderprofile/user/{user_id}/` | Public | — | Get pathfinder profile by user ID |
| `profile.pathfinderCreate()` | PATCH | `/profile/pathfinderprofile/` | Bearer | `{...pathfinder fields}` | Create/update pathfinder profile |
| `profile.pathfinderUpdate()` | PUT | `/profile/pathfinderprofile/` | Bearer | `{...pathfinder fields}` | Full pathfinder profile update |
| `profile.pathfinderPatch()` | PATCH | `/profile/pathfinderprofile/` | Bearer | `{...partial fields}` | Partial pathfinder profile update |
| `profile.pictureGet()` | GET | `/profile/profile/picture/` | Bearer | — | Get current profile picture |
| `profile.picturePatch()` | PATCH | `/profile/profile/picture/` | Bearer | FormData: `{picture}` | Upload profile picture |
| `profile.credentialsList()` | GET | `/profile/credentials/` | Bearer | — | List government credentials/documents |
| `profile.credentialsCreate()` | POST | `/profile/credentials/` | Bearer | FormData: `{document_name, document}` | Upload credential/document |
| `profile.credentialsGet()` | GET | `/profile/credentials/{id}/` | Bearer | — | Get single credential |
| `profile.credentialsPut()` | PUT | `/profile/credentials/{id}/` | Bearer | `{...credential fields}` | Update credential |
| `profile.credentialsPatch()` | PATCH | `/profile/credentials/{id}/` | Bearer | FormData or JSON | Update credential (partial) |
| `profile.credentialsDelete()` | DELETE | `/profile/credentials/{id}/` | Bearer | — | Delete credential |
| `profile.socialLinksList()` | GET | `/profile/social-links/` | Bearer | — | List social media links |
| `profile.socialLinksCreate()` | POST | `/profile/social-links/` | Bearer | `{platform, url}` | Add social link |
| `profile.socialLinksGet()` | GET | `/profile/social-links/{id}/` | Bearer | — | Get single social link |
| `profile.socialLinksPut()` | PUT | `/profile/social-links/{id}/` | Bearer | `{platform, url}` | Update social link |
| `profile.socialLinksPatch()` | PATCH | `/profile/social-links/{id}/` | Bearer | `{...partial fields}` | Partial social link update |
| `profile.socialLinksDelete()` | DELETE | `/profile/social-links/{id}/` | Bearer | — | Delete social link |

### Opportunities Endpoints

| Module | Method | Path | Auth | Query/Body | Purpose |
|--------|--------|------|------|-----------|---------|
| `opportunities.list()` | GET | `/opportunities/` | Public | `?opportunity_type=...&is_open=...&search=...&page=...&page_size=...` | Browse all opportunities (paginated) |
| `opportunities.create()` | POST | `/opportunities/` | Bearer | `{title, opportunity_type, description, link, ...}` | Post new opportunity (enabler only) |
| `opportunities.mine()` | GET | `/opportunities/mine/` | Bearer | — | Get user's posted opportunities (enabler only) |
| `opportunities.get()` | GET | `/opportunities/{id}/` | Public | — | Get single opportunity details |
| `opportunities.update()` | PUT | `/opportunities/{id}/` | Bearer | `{...all fields}` | Full update (enabler only, within 12 hours) |
| `opportunities.patch()` | PATCH | `/opportunities/{id}/` | Bearer | `{...partial fields}` | Partial update (enabler only, within 12 hours) |
| `opportunities.delete()` | DELETE | `/opportunities/{id}/` | Bearer | — | Delete opportunity (enabler only) |
| `opportunities.applicantsList()` | GET | `/opportunities/{id}/applicants/` | Bearer | — | List applicants for opportunity (enabler only) |
| `opportunities.getApplicant()` | GET | `/opportunities/{id}/applicants/{applicant_id}/` | Bearer | — | Get applicant's full profile (enabler only) |

### Applications Endpoints

| Module | Method | Path | Auth | Body | Purpose |
|--------|--------|------|------|------|---------|
| `applications.list()` | GET | `/applications/` | Bearer | — | List applications (pathfinder: own; enabler: received) |
| `applications.create()` | POST | `/applications/` | Bearer | **Option A:** `{opportunity, cover_letter, profile_resume}` (JSON) | Submit application |
| | | | | **Option B:** FormData: `{opportunity, cover_letter, resume}` | Submit with file upload |
| `applications.get()` | GET | `/applications/{id}/` | Bearer | — | Get application details |
| `applications.update()` | PUT | `/applications/{id}/` | Bearer | `{...fields}` | Full application update |
| `applications.patch()` | PATCH | `/applications/{id}/` | Bearer | `{...partial fields}` | Partial application update |
| `applications.withdraw()` | DELETE | `/applications/{id}/` | Bearer | — | Withdraw application (pathfinder, pending only) |
| `applications.updateStatus()` | PATCH | `/applications/{id}/change_status/` | Bearer | `{status: "accepted" \| "rejected"}` | Accept/reject application (enabler only) |

### Bookmarks Endpoints

| Module | Method | Path | Auth | Body | Purpose |
|--------|--------|------|------|------|---------|
| `bookmark.opportunitiesSavedList()` | GET | `/bookmark/opportunities/saved/` | Bearer | — | List saved opportunities (pathfinder) |
| `bookmark.opportunitiesSavedCreate()` | POST | `/bookmark/opportunities/saved/` | Bearer | `{opportunity_id}` or `{opportunity}` | Save opportunity |
| `bookmark.opportunitiesSavedDelete()` | DELETE | `/bookmark/opportunities/saved/{opportunity_id}/` | Bearer | — | Remove saved opportunity |
| `bookmark.applicantsSavedList()` | GET | `/bookmark/applicants/saved/` | Bearer | — | List bookmarked applicants (enabler) |
| `bookmark.applicantsSavedCreate()` | POST | `/bookmark/applicants/saved/` | Bearer | `{pathfinder_id, opportunity_id?}` | Bookmark applicant/pathfinder |
| `bookmark.applicantsSavedDelete()` | DELETE | `/bookmark/applicants/saved/{pathfinder_id}/` | Bearer | — | Remove bookmarked applicant |
| `bookmark.enablersSavedList()` | GET | `/bookmark/enablers/saved/` | Bearer | — | List bookmarked enablers (pathfinder) |
| `bookmark.enablersSavedCreate()` | POST | `/bookmark/enablers/saved/` | Bearer | `{enabler_id}` or `{enabler}` | Bookmark enabler |
| `bookmark.enablersSavedDelete()` | DELETE | `/bookmark/enablers/saved/{enabler_id}/` | Bearer | — | Remove bookmarked enabler |

### Notifications Endpoints

| Module | Method | Path | Auth | Body | Purpose |
|--------|--------|------|------|------|---------|
| `notifications.list()` | GET | `/notify/notifications/` | Bearer | — | Get all notifications |
| `notifications.create()` | POST | `/notify/notifications/` | Bearer | `{...notification data}` | Create notification |
| `notifications.markRead()` | POST | `/notify/notifications/{id}/mark-read/` | Bearer | — | Mark single notification as read |
| `notifications.markAllRead()` | POST | `/notify/notifications/mark-all-read/` | Bearer | — | Mark all notifications as read |

### Waitlist Endpoints

| Module | Method | Path | Auth | Body | Purpose |
|--------|--------|------|------|------|---------|
| `waitlist.create()` | POST | `/waitlist/` | None | `{email, name?}` | Join waitlist |
| `waitlist.stats()` | GET | `/waitlist/stats/` | Public | — | Get waitlist statistics |

---

## 6. Frontend Routes

All routes use **HashRouter** (e.g., `/#/pathfinder/profile`)

### Public Routes (No Auth Required)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Landing` | Home page with role selection |
| `/landingpathfinder` | `LandingPathfinder` | Pathfinder-specific landing |
| `/landingenabler` | `Landingenabler` | Enabler-specific landing |
| `/road` | `Roadmap` | Feature roadmap page |
| `/about` | `AboutUs` | About the platform |
| `/contact` | `ContactUs` | Contact page |
| `/privacy` | `PrivacyPolicy` | Privacy policy |
| `/deep-pay-info` | `DeepPayInfo` | Payment information |
| `/volunteer-details` | `VolunteerDetails` | Volunteer profile view |

### Authentication Routes (Public, No Auth)

| Path | Component | Purpose |
|------|-----------|---------|
| `/login` | `Login` | Email/password + Google login |
| `/signup` | `SignUp` | Registration (role selection) |
| `/forgot-password` | `ForgotPassword` | Password recovery init |
| `/verify-otp` | `VerifyOTP` | OTP verification |
| `/reset-password` | `ResetPassword` | Password reset completion |

### Protected Routes (Auth Required, General)

| Path | Component | Auth | Purpose |
|------|-----------|------|---------|
| `/set-password` | `SetPassword` | Bearer | Initial password setup |
| `/notifications` | `Notifications` | Bearer | Notifications center |
| `/kyc` | `KYCForm` | Bearer | KYC verification form |

### Pathfinder Routes (Auth Required, Role: Pathfinder)

| Path | Component | Purpose |
|------|-----------|---------|
| `/pathf` | `PathfinderDashboard` | Main pathfinder dashboard |
| `/dashf` | `PathfinderDashboard` | Alternative dashboard route |
| `/available-opportunities` | `AvailableOpportunities` | Browse opportunities |
| `/opportunity/{id}` | `Opportunity` | Single opportunity view |
| `/apply/{opportunityId}` | `ApplyApplication` | Application submission |
| `/my-applications` | `MyApplications` | Track submitted applications |
| `/bookmarks` | `Bookmarks` | Saved opportunities |
| `/pathfinder/profile-setup` | `EditNewProfile` | Profile creation/editing |
| `/pathfinder/settings` | `PathfinderSettings` | Volunteer settings |
| `/enabler-profile/{id}` | `EnablerProfileView` | View organization profile |
| `/organization/{id}` | `OrganizationProfile` | Organization details |

### Enabler Routes (Auth Required, Role: Enabler)

| Path | Component | Purpose |
|------|-----------|---------|
| `/enabler/dashboard` | `EnablerDashboard` | Main enabler dashboard |
| `/dash-employer` | (redirects) | Legacy redirect to dashboard |
| `/create-opportunity` | `CreateOpportunity` | Post new opportunity |
| `/enabler/opportunities-posted` | `OpportunitiesPosted` | View posted opportunities |
| `/enabler/opportunity/{id}` | `OpportunityDetails` | View opportunity applicants |
| `/enabler/edit-opportunity/{id}` | `EditOpportunity` | Edit posted opportunity |
| `/enabler/applicants/{id}` | `Applicants` | List opportunity applicants |
| `/enabler/pathfinder/{id}` | `PathfinderProfile` | View volunteer profile |
| `/enabler/contact/{id}` | `ContactPathfinder` | Contact volunteer |
| `/enabler/bookmarked-pathfinders` | `EnablerPathfinderBookmarks` | Saved volunteers |
| `/enabler/profile` | `EnablerProfile` | Organization profile view |
| `/enabler/edit-profile` | `EditProfile` | Edit organization profile |
| `/enabler/profile-setup` | `EnablerProfileSetup` | Profile setup wizard |
| `/enabler/recommendations` | `Recommendations` | AI/matching recommendations |
| `/enabler/settings` | `Settings` | Organization settings |

### Legacy Routes & Redirects

| Path | Destination | Note |
|------|-------------|------|
| `/dashboard` | Role-based redirect | Routes to pathfinder or enabler dashboard |
| `/profile` | Role-based redirect | Routes to profile setup or profile view |
| `/emppro` | `/enabler/dashboard` | Legacy enabler dashboard |
| `/dash-employer` | `/enabler/dashboard` | Legacy enabler dashboard |
| `/dash-freelance` | `/pathf` | Legacy pathfinder dashboard |
| `/opportunity` | `/available-opportunities` | Legacy opportunities list |

### Error Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `*` (catch-all) | `NotFound` | 404 error page |

---

## 7. Components

### Authentication Components (`src/components/auth/`)

1. **Navbar.js** — Main navigation bar (authenticated users)
   - Role-aware menu items
   - User profile dropdown
   - Logout functionality

2. **EnablerNavbar.js** — Enabler-specific navigation variant

3. **GoogleAuthButton.js** — Google Sign-In integration
   - Mode: "signup" or "login"
   - Role selection for signup

4. **OTPInput.js** — OTP verification input component
   - 6-digit code input
   - Auto-focus on mount
   - Auto-submit on complete

5. **RequireAuth.js** — Route protection HOC
   - Enforces authentication
   - Role-based access control (optional)
   - Redirects to login if not authenticated
   - Shows loading spinner during auth check

### Common/Shared Components (`src/components/common/`)

1. **Button.js** — Reusable button component
   - Variants: primary, secondary, ghost
   - Loading/disabled states
   - Custom colors

2. **Input.js** — Text input component
   - Validation styling
   - Error messages
   - Label support

3. **PasswordInput.js** — Secure password input
   - Show/hide password toggle
   - Password strength indicator

4. **Modal.js** — Modal dialog component
   - Backdrop overlay
   - Customizable title/content/actions
   - Close handlers

5. **Toast.js** — Toast notification component
   - Types: info, success, warning, error
   - Auto-dismiss
   - Dismissible

6. **Pagination.js** — Pagination controls
   - Page navigation
   - Per-page item selection
   - Total count display

7. **FormattedText.js** — Text formatting utility
   - Markdown rendering
   - URL detection and linking
   - Line break handling

8. **SocialButton.js** — Social media links
   - LinkedIn, Twitter, Facebook, Instagram, etc.
   - Icon + label variants

### Form Components (`src/components/forms/`)

1. **KYCForm.js** — Know Your Customer form
   - Government ID upload
   - Verification field collection
   - Document management

### Other Components

1. **CookieConsent.js** — GDPR/Privacy cookie banner
   - Analytics consent toggle
   - Acceptance tracking
   - localStorage persistence

---

## 8. Pages

### Public Pages

1. **Landing.js** — Home page
   - Hero section
   - Role selection (Pathfinder / Enabler)
   - Feature highlights

2. **LandingPathfinder.js** — Pathfinder-specific landing
   - Pathfinder benefits
   - CTA: Sign up as Pathfinder

3. **Landingenabler.js** — Enabler-specific landing
   - Enabler benefits
   - CTA: Sign up as Enabler

4. **Roadmap.js** — Feature roadmap
   - Upcoming features
   - Timeline view

5. **AboutUs.js** — About the platform
   - Mission statement
   - Team info
   - Company values

6. **ContactUs.js** — Contact page
   - Contact form
   - Email/phone contact info
   - Support request submission

7. **PrivacyPolicy.js** — Privacy policy
   - Legal compliance
   - Data handling disclosure

8. **DeepPayInfo.js** — Payment/payout information
   - Payment methods
   - Fee structure

9. **NotFound.js** — 404 error page
   - Error message
   - Navigation options

### Authentication Pages (`src/pages/auth/`)

1. **Login.js** — Email/password login
   - Email + password fields
   - Google OAuth option
   - "Forgot password?" link
   - Role selection

2. **SignUp.js** — User registration
   - Email, password, confirmation
   - Name fields
   - Role selection (Pathfinder / Enabler)
   - Terms acceptance
   - Google OAuth option

3. **VerifyOTP.js** — OTP verification
   - Email OTP input
   - Resend OTP option
   - Timer

4. **ForgotPassword.js** — Password recovery
   - Email input
   - OTP request trigger
   - Redirect to verify-otp

5. **ResetPassword.js** — Password reset completion
   - OTP verification
   - New password entry
   - Confirmation

6. **SetPassword.js** — Initial password setup
   - For OAuth users setting password later
   - Password + confirmation

### Pathfinder Pages (`src/pages/pathfinder/`)

1. **PathfinderDashboard.js** — Main volunteer dashboard
   - Quick stats (applications, bookmarks, messages)
   - Recent opportunities
   - Profile completion indicator
   - Shortcuts to common actions

2. **AvailableOpportunities.js** — Browse opportunities
   - Filtered/searchable list
   - Opportunity type filter
   - Pagination
   - Sort options

3. **Opportunity.js** — Single opportunity view
   - Full opportunity details
   - Organization info
   - Application button
   - Share/bookmark options

4. **ApplyApplication.js** — Application submission form
   - Cover letter text area
   - Resume selection (upload or existing credential)
   - Preview before submission
   - Success/error feedback

5. **MyApplications.js** — Application tracking
   - List of submitted applications
   - Status indicators (pending, accepted, rejected)
   - Filter by status
   - Withdrawal option (pending only)

6. **Bookmarks.js** — Saved opportunities
   - List of bookmarked opportunities
   - Sort/filter options
   - Remove bookmark
   - Quick apply

7. **EditNewProfile.js** — Profile setup/editing
   - Personal info (name, email)
   - Bio/professional summary
   - Skills selection/input
   - Education history
   - Work experience
   - Profile picture upload
   - Social links

8. **EnablerProfileView.js** — View organization profile
   - Organization details
   - Contact info
   - Posted opportunities
   - Bookmark option

9. **OrganizationProfile.js** — Organization profile details
   - Full organization info
   - Mission/vision
   - Contact details
   - Website/social links

10. **VolunteerDetails.js** — Volunteer profile view
    - Volunteer bio
    - Skills/experience
    - Portfolio links
    - Contact options

11. **PathfinderSettings.js** — Volunteer settings
    - Account security
    - Email/password change
    - Privacy settings
    - Notification preferences
    - Account deletion option

### Enabler Pages (`src/pages/enabler/`)

1. **EnablerDashboard.js** — Main organization dashboard
    - Quick stats (posted opportunities, applicants, messages)
    - Recent applicants
    - Upcoming deadlines
    - Shortcuts

2. **CreateOpportunity.js** — Post new opportunity form
    - Title, description, type (job/internship/volunteering)
    - Required fields
    - Location/remote options
    - Deadline
    - Link to opportunity

3. **OpportunitiesPosted.js** — View posted opportunities
    - List of organization's opportunities
    - Status (open/closed)
    - Applicant count
    - Edit/delete options
    - Filter by status

4. **OpportunityDetails.js** — View opportunity applicants
    - Opportunity summary
    - List of applicants
    - Status indicators
    - Applicant details (name, experience)
    - Accept/reject action buttons

5. **EditOpportunity.js** — Edit posted opportunity
    - Form pre-populated with current data
    - Edit all fields (within 12 hour window)
    - Save/cancel
    - Note on edit limitations

6. **Applicants.js** — List applicants for opportunity
    - Applicant table/cards
    - Filter by status
    - Bookmark/unbookmark
    - Contact applicant
    - View full profile

7. **PathfinderProfile.js** — View volunteer's full profile
    - Profile details (education, experience, skills)
    - Cover letter from application
    - Resume/credentials
    - Contact button
    - Bookmark toggle
    - Message/contact options

8. **ContactPathfinder.js** — Contact volunteer
    - Message compose form
    - Email/contact methods
    - Send message
    - Message history

9. **EnablerProfile.js** — Organization profile view
    - Organization details (name, bio, logo)
    - Contact info
    - Social links
    - Website
    - Edit button

10. **EditProfile.js** — Edit organization profile
    - Form with all organization fields
    - Logo/picture upload
    - Contact email
    - Phone number
    - Website URL
    - Social links
    - Description/bio

11. **EnablerProfileSetup.js** — Profile setup wizard
    - Multi-step form
    - Organization basic info
    - Contact details
    - Document/credential upload
    - KYC verification
    - Completion indicator

12. **EnablerPathfinderBookmarks.js** — Saved volunteers
    - List of bookmarked volunteers
    - Filter/sort options
    - Remove bookmark
    - Quick contact
    - View profile

13. **Recommendations.js** — AI/matching recommendations
    - Recommended volunteers for posted opportunities
    - Match score indicator
    - Quick action (contact, bookmark, view profile)
    - Filter by opportunity

14. **Settings.js** — Organization settings
    - Account security (email, password)
    - Privacy settings
    - Notification preferences
    - Billing/payment settings
    - Account deletion option

---

## 9. Context & State Management

### UserContext.js

**Provider:** `UserProvider` component wraps entire app in `src/index.js`

**Context Value:**
```javascript
{
  user: {
    id,                 // User ID
    email,              // User email
    role,               // "pathfinder" or "enabler"
    first_name,         // First name
    last_name,          // Last name
    name,               // Normalized display name
    hasProfile,         // Boolean: profile setup complete
    profileCompletion,  // 0-100 percentage
    // Plus raw profile data...
  },
  loading,            // Boolean: async profile fetch in progress
  error,              // Error message if profile fetch failed
  logout(),           // Function to logout
  refreshUser(),      // Function to refresh user data
}
```

**Hook Usage:**
```javascript
const { user, loading, error, logout, refreshUser } = useUser();
```

**Profile Normalization:**
- `normalizePathfinderProfile()` — Converts API response to app data model
- `normalizeEnablerProfile()` — Converts API response to app data model

**Usage:**
- RequireAuth component checks user state
- Navigation based on role
- Protected component rendering
- User display (profile pictures, names)

---

## 10. Utilities

### `api.js` (Services)
Central API client with all endpoints. See [Section 5: API Endpoints](#5-api-endpoints-complete-reference).

### `bookmarkHelpers.js`
Bookmark management and status checking utilities.

**Functions:**
- Check if opportunity/enabler is bookmarked
- Add/remove bookmarks
- Batch bookmark operations

### `cookieConsent.js`
GDPR/privacy cookie consent management.

**Functions:**
- `getConsent()` — Get stored consent status
- `setConsent()` — Store consent preferences
- Show/hide cookie banner based on consent

**localStorage Key:** `afrivate_cookie_consent`

### `descriptionUtils.js`
Text and description formatting utilities.

**Functions:**
- Text truncation
- Markdown rendering
- HTML sanitization
- Line break conversion

### `gtag.js`
Google Analytics 4 integration.

**Functions:**
- `loadGtagScript()` — Load GA4 script conditionally
- Page view tracking
- Event tracking
- Conditional based on cookie consent

**Tracking ID:** `G-XDX60DZTG4`

### `opportunityUtils.js`
Opportunity filtering and formatting utilities.

**Functions:**
- Filter by type (job, internship, volunteering)
- Filter by status (open, closed)
- Sort options (newest, oldest, deadline)
- Format opportunity data for display

### `pathfinderData.js`
Pathfinder-specific data and formatting utilities.

**Functions:**
- Profile data validation
- Skill/experience formatting
- Education history processing

### `pathfinderProfilePayload.js`
Constructs payload objects for pathfinder profile API requests.

**Functions:**
- Build profile update payload
- Validate required fields
- Format nested data structures

### `syncSocialLinks.js`
Social media links synchronization and management.

**Functions:**
- Sync social links with API
- Format social link data
- Validate platform URLs

### `websiteUrl.js`
URL and navigation utilities.

**Functions:**
- Construct application URLs
- Navigate between pages
- Build dynamic route paths
- Handle URL encoding

---

## 11. Styling & Theme

### Tailwind CSS Configuration

**File:** `tailwind.config.js`

**Key Configuration:**

| Category | Details |
|----------|---------|
| **Content** | `src/**/*.{js,jsx,ts,tsx}`, `public/index.html` |
| **Brand Purple** | Primary color `#6A00B1`, extended palette (50-900) |
| **Fonts** | Inter (default), Montserrat, Poppins |
| **Spacing** | Default + custom: 18 (4.5rem), 72, 84, 96 |
| **Animations** | Wave (floating motion), float (vertical bounce) |
| **Box Shadows** | Standard + custom inner-lg |
| **Gradients** | Radial, linear purple (135° angle) |

### PostCSS Configuration

**File:** `postcss.config.js`

**Plugins:**
- Tailwind CSS — CSS utility generation
- Autoprefixer — Vendor prefix addition

### Color System

**Primary Purple:**
- `#6A00B1` — Main brand color (used throughout)
- Purple palette 50-900 for variations and contrast

**Extended Colors:**
- White, black, gray scales
- Purple gradient backgrounds

### Typography

**Font Families:**
- **Sans (default):** Inter, system fonts
- **Montserrat:** Headings, bold text
- **Poppins:** Alternative display font

**Font Sizes:** Tailwind defaults (text-xs to text-9xl)

**Line Heights:** Tailwind defaults with custom leading values

### CSS Files

1. **index.css** — Global styles
   - Font imports
   - CSS variables
   - Base element styling

2. **App.css** — App-level component styles
   - Container/layout utilities
   - App-specific customizations

---

## 12. Environment Configuration

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `REACT_APP_API_BASE_URL` | `https://afrivate-backend-production.up.railway.app` | Backend API base URL |
| `REACT_APP_API_PREFIX` | `/api` | API endpoint prefix |
| `REACT_APP_GOOGLE_CLIENT_ID` | (required) | Google OAuth Client ID |
| `REACT_APP_GA_ID` | (optional) | Google Analytics tracking ID |
| `CI` | `false` | Set to `true` on Vercel (treats warnings as errors) |

### Environment File

Create `.env` or `.env.local` in project root:

```
REACT_APP_API_BASE_URL=https://afrivate-backend-production.up.railway.app
REACT_APP_API_PREFIX=/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_GA_ID=G-XDX60DZTG4
```

### localStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `afrivate_access` | JWT token | Access token for API requests |
| `afrivate_refresh` | JWT token | Refresh token for token renewal |
| `afrivate_role` | "pathfinder" or "enabler" | User role cache |
| `afrivate_cookie_consent` | JSON object | GDPR cookie preferences |

---

## 13. Key Features & Data Flows

### Authentication Flow

```
1. User visits `/login` or `/signup`
2. Select authentication method:
   - Email/Password → POST /auth/login or /auth/register
   - Google OAuth → googleAuthWithRole() → POST /auth/google/{pathfinder|enabler}
3. Receive JWT tokens → Store in localStorage (afrivate_access, afrivate_refresh)
4. UserContext fetches profile → Normalize and set user state
5. RequireAuth redirects to role-appropriate dashboard
6. All subsequent requests include Bearer token
```

### Profile Setup Flow

```
1. New user → OAuth/email signup → API sets hasProfile: false
2. RequireAuth redirects to /pathfinder/profile-setup or /enabler/profile-setup
3. User completes multi-step form
4. Profile PATCH/PUT to /profile/{pathfinderprofile|enablerprofile}/
5. API validates and stores
6. Redirect to dashboard after completion
7. UserContext updates hasProfile: true
```

### Opportunity Posting Flow (Enabler)

```
1. Enabler on /enabler/opportunities-posted
2. Click "Create Opportunity" → /create-opportunity
3. Form: title, type, description, link (must be https://)
4. POST /opportunities/ with form data
5. Success → Redirect to /enabler/opportunities-posted
6. Opportunity appears in list and is searchable
7. Enabler can edit within 12 hours: PATCH /opportunities/{id}/
8. Enabler can delete: DELETE /opportunities/{id}/
```

### Application Submission Flow (Pathfinder)

```
1. Pathfinder browses /available-opportunities
2. Select opportunity → View details
3. Click "Apply" → /apply/{opportunityId}
4. Form: cover letter + resume (upload or existing credential)
5. POST /applications/ with:
   - Option A: opportunity ID + existing credential ID
   - Option B: FormData with file upload
6. Success → Redirect to /my-applications
7. Application shows "pending" status
8. Enabler reviews and accepts/rejects: PATCH /applications/{id}/change_status/
9. Status updates in real-time
10. Pathfinder notified of status change
```

### Bookmark Flow

**Pathfinder Bookmarking Opportunities:**
```
1. Browse /available-opportunities
2. Click heart/bookmark icon
3. POST /bookmark/opportunities/saved/ with opportunity_id
4. Icon fills/highlights
5. Access saved: GET /bookmark/opportunities/saved/
6. View at /bookmarks
7. Remove: DELETE /bookmark/opportunities/saved/{id}/
```

**Enabler Bookmarking Pathfinders:**
```
1. View applicant profile
2. Click bookmark icon
3. POST /bookmark/applicants/saved/ with pathfinder_id
4. Access saved: GET /bookmark/applicants/saved/
5. View at /enabler/bookmarked-pathfinders
6. Remove: DELETE /bookmark/applicants/saved/{id}/
```

### Notification Flow

```
1. Backend triggers event (new applicant, status change, message, etc.)
2. Backend POSTs to /notify/notifications/ or WebSocket push
3. Frontend polls GET /notify/notifications/
4. Toast/banner shows in-app notification
5. Notifications center: /notifications
6. Mark read: POST /notify/notifications/{id}/mark-read/
7. Mark all read: POST /notify/notifications/mark-all-read/
```

### 401 Token Refresh Flow

```
1. API request gets 401 Unauthorized response
2. `request()` function checks isRetryingAfter401 flag
3. If false and refresh token exists:
   - Set flag to true
   - POST /auth/token/refresh/ with refresh token
   - Update localStorage with new tokens
   - Retry original request
4. If refresh fails or flag already true:
   - Clear tokens
   - Redirect to /login
   - Show "Session expired" message
```

---

## 14. Build & Deployment

### Local Development

**Prerequisites:**
- Node.js 18+
- npm 9+

**Setup:**
```bash
git clone <repository>
cd Afrivate_Volunteer_Module_Frontend
npm install
```

**Start Development Server:**
```bash
npm start
```
- Runs on `http://localhost:3000`
- Hot module reloading
- Opens in browser automatically

**Build:**
```bash
npm run build
```
- Optimized production bundle
- Outputs to `build/` directory
- Minified and code-split

**Testing:**
```bash
npm test
```
- Jest + React Testing Library
- Watch mode by default
- ESLint validation

### Vercel Deployment

**Configuration:**
- `CI=true` environment variable set
- ESLint warnings treated as errors
- Build fails if warnings present (strict mode)

**Deploy Command:**
```bash
CI=true npm run build
```

**Environment Variables on Vercel:**
Set in Vercel project settings:
- `REACT_APP_API_BASE_URL`
- `REACT_APP_GOOGLE_CLIENT_ID`
- `CI=true`

**Deployment Steps:**
1. Push to main branch
2. Vercel auto-detects React app
3. Runs build with CI=true
4. Deploys to production on success

**Domain:**
- Production: Custom domain (Vercel)
- Preview: PR preview URLs

### Build Scripts

| Command | Action |
|---------|--------|
| `npm start` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run tests in watch mode |
| `npm run eject` | Eject from Create React App (⚠️ irreversible) |
| `npm run predeploy` | Pre-deployment hook (runs build) |

### Performance Optimization

- **Code Splitting:** React Router lazy loading for pages
- **Tree Shaking:** Unused code removed in build
- **Minification:** CSS and JS minified
- **Image Optimization:** Consider lazy loading for images
- **Web Vitals Monitoring:** Tracks LCP, FID, CLS

---

## Dependencies Summary

### Production Dependencies (18 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | Core UI library |
| react-dom | ^18.2.0 | React DOM rendering |
| react-router-dom | ^6.22.1 | Client-side routing |
| react-scripts | 5.0.1 | Create React App build tools |
| @react-oauth/google | ^0.13.4 | Google OAuth integration |
| @heroicons/react | ^2.1.1 | SVG icon library |
| web-vitals | ^2.1.4 | Performance metrics |

### Development Dependencies (Testing & Linting)

| Package | Version | Purpose |
|---------|---------|---------|
| @testing-library/react | ^13.4.0 | React component testing |
| @testing-library/jest-dom | ^5.17.0 | DOM matchers for testing |
| @testing-library/user-event | ^13.5.0 | User interaction simulation |
| tailwindcss | (dev) | CSS utility framework |
| postcss | (dev) | CSS transformation |

---

## Additional Documentation

For more detailed information, refer to:

- **DOCUMENTATION.md** — API reference and routes documentation
- **WEBSITE_INDEX.md** — Components and utilities index
- **WEBSITE_INDEX_AND_API_DOCS.md** — Comprehensive API with examples
- **FRONTEND_CHANGES.md** — Recent frontend updates
- **SECURITY_AUDIT_REPORT.md** — Security findings and fixes
- **API_AUDIT.md** — API call audit and compliance
- **API_DOCS_LINE_INDEX.md** — Line-by-line API reference index

---

## Quick Reference: File Locations

```
Core Application
├── src/App.js — Main router and app component
├── src/index.js — React entry point
├── src/context/UserContext.js — User authentication state
└── src/services/api.js — API client with all endpoints

Key Pages (src/pages/)
├── Landing.js — Home page
├── auth/Login.js, SignUp.js — Authentication
├── pathfinder/ — Volunteer-specific pages
└── enabler/ — Organization-specific pages

Components (src/components/)
├── auth/ — Authentication UI
├── common/ — Reusable components
└── forms/ — Form components

Configuration
├── tailwind.config.js — Tailwind CSS theme
├── postcss.config.js — PostCSS plugins
├── package.json — Dependencies and scripts
└── .env — Environment variables (create locally)
```

---

**This is a living document. Update as the application evolves.** |
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
