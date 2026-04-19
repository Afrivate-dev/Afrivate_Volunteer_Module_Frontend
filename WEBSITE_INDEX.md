# Afrivate Volunteer Module – Complete Website Index

**Generated:** February 2025  
**Source:** `src/App.js`, `src/pages/`, `src/components/`, `DOCUMENTATION.md`

This document indexes every route, page, and key component in the Afrivate volunteer platform.

---

## 1. Route index (from App.js)

All routes use **HashRouter** (e.g. `/#/login`). Defined in `src/App.js`.

### 1.1 Public (no auth)

| # | Path | Component | File |
|---|------|-----------|------|
| 1 | `/` | Landing | `src/pages/Landing.js` |
| 2 | `/landingpathfinder` | LandingPathfinder | `src/pages/LandingPathfinder.js` |
| 3 | `/landingenabler` | Landingenabler | `src/pages/Landingenabler.js` |
| 4 | `/opportunity` | Opportunity | `src/pages/pathfinder/Opportunity.js` |
| 5 | `/volunteer-details` | VolunteerDetails | `src/pages/pathfinder/VolunteerDetails.js` |
| 6 | `/road` | Road (Roadmap) | `src/pages/Roadmap.js` |
| 7 | `/about` | AboutUs | `src/pages/AboutUs.js` |
| 8 | `/contact` | ContactUs | `src/pages/ContactUs.js` |
| 9 | `/privacy` | PrivacyPolicy | `src/pages/PrivacyPolicy.js` |
| 10 | `/deep-pay-info` | DeepPayInfo | `src/pages/DeepPayInfo.js` |

### 1.2 Auth (no auth required to view)

| # | Path | Component | File |
|---|------|-----------|------|
| 11 | `/login` | Login | `src/pages/auth/Login.js` |
| 12 | `/signup` | SignUp | `src/pages/auth/SignUp.js` |
| 13 | `/forgot-password` | ForgotPassword | `src/pages/auth/ForgotPassword.js` |
| 14 | `/verify-otp` | VerifyOTP | `src/pages/auth/VerifyOTP.js` |
| 15 | `/reset-password` | ResetPassword | `src/pages/auth/ResetPassword.js` |

### 1.3 Protected – Pathfinder (RequireAuth)

| # | Path | Component | File |
|---|------|-----------|------|
| 16 | `/dashf` | Pathf (PathfinderDashboard) | `src/pages/pathfinder/PathfinderDashboard.js` |
| 17 | `/pathf` | Pathf | same |
| 18 | `/apply/:opportunityId` | ApplyApplication | `src/pages/pathfinder/ApplyApplication.js` |
| 19 | `/bookmarks` | Bookmarks | `src/pages/pathfinder/Bookmarks.js` |
| 20 | `/edit-new-profile` | EditNewProfile | `src/pages/pathfinder/EditNewProfile.js` |

### 1.4 Protected – Enabler (RequireAuth)

| # | Path | Component | File |
|---|------|-----------|------|
| 21 | `/enabler/dashboard` | EnablerDashboard | `src/pages/enabler/EnablerDashboard.js` |
| 22 | `/create-opportunity` | CreateOpportunity | `src/pages/enabler/CreateOpportunity.js` |
| 23 | `/enabler/opportunities-posted` | OpportunitiesPosted | `src/pages/enabler/OpportunitiesPosted.js` |
| 24 | `/enabler/opportunity/:id` | OpportunityDetails | `src/pages/enabler/OpportunityDetails.js` |
| 25 | `/enabler/edit-opportunity/:id` | EditOpportunity | `src/pages/enabler/EditOpportunity.js` |
| 26 | `/enabler/profile` | EnablerProfile | `src/pages/enabler/EnablerProfile.js` |
| 27 | `/enabler/edit-profile` | EditProfile | `src/pages/enabler/EditProfile.js` |
| 28 | `/enabler/profile-setup` | EnablerProfileSetup | `src/pages/enabler/EnablerProfileSetup.js` |
| 29 | `/enabler/recommendations` | Recommendations | `src/pages/enabler/Recommendations.js` |
| 30 | `/enabler/settings` | Settings | `src/pages/enabler/Settings.js` |
| 31 | `/enabler/pathfinder/:id` | PathfinderProfile | `src/pages/enabler/PathfinderProfile.js` |
| 32 | `/enabler/contact/:id` | ContactPathfinder | `src/pages/enabler/ContactPathfinder.js` |
| 33 | `/enabler/bookmarked-pathfinders` | EnablerPathfinderBookmarks | `src/pages/enabler/EnablerPathfinderBookmarks.js` |
| 34 | `/enabler/applicants/:id` | Applicants | `src/pages/enabler/Applicants.js` |

### 1.5 Other protected (RequireAuth, no role check)

| # | Path | Component | File |
|---|------|-----------|------|
| 35 | `/emppro` | Emppro | `src/pages/emppro.js` |
| 36 | `/dash-employer` | DashEmployer | `src/pages/Dash-employer.js` |
| 37 | `/dash-freelance` | DashFreelance | `src/pages/Dash-freelance.js` |
| 38 | `/dashboard` | Dashboard | `src/pages/Dashboard.js` |
| 39 | `/profile` | Profile | `src/pages/Profile.js` |
| 40 | `/kyc` | KYCForm | `src/components/forms/KYCForm.js` |

**Total routes:** 40  
**Note:** No catch-all (`*`) route; unknown URLs render nothing.

---

## 2. Page index (by folder)

### 2.1 `src/pages/auth/`

| File | Route | Purpose |
|------|--------|---------|
| Login.js | `/login` | Email/password + Google; role detection; redirect to dashboard |
| SignUp.js | `/signup` | Register pathfinder/enabler; redirect to profile-setup or edit-new-profile |
| ForgotPassword.js | `/forgot-password` | Request reset email; stores email in sessionStorage |
| VerifyOTP.js | `/verify-otp` | Verify OTP; redirect to reset-password |
| ResetPassword.js | `/reset-password` | Set new password after OTP |

### 2.2 `src/pages/enabler/`

| File | Route | Purpose |
|------|--------|---------|
| EnablerDashboard.js | `/enabler/dashboard` | Welcome, opportunities, applicants |
| CreateOpportunity.js | `/create-opportunity` | Multi-step create opportunity |
| OpportunitiesPosted.js | `/enabler/opportunities-posted` | List, view, delete opportunities |
| OpportunityDetails.js | `/enabler/opportunity/:id` | View one opportunity |
| EditOpportunity.js | `/enabler/edit-opportunity/:id` | Edit opportunity |
| EnablerProfile.js | `/enabler/profile` | View enabler profile |
| EditProfile.js | `/enabler/edit-profile` | Edit enabler profile |
| EnablerProfileSetup.js | `/enabler/profile-setup` | First-time enabler setup |
| Recommendations.js | `/enabler/recommendations` | Recommended pathfinders |
| Settings.js | `/enabler/settings` | Profile, password, document |
| PathfinderProfile.js | `/enabler/pathfinder/:id` | View pathfinder, bookmark |
| ContactPathfinder.js | `/enabler/contact/:id` | Send message to pathfinder |
| EnablerPathfinderBookmarks.js | `/enabler/bookmarked-pathfinders` | List bookmarked pathfinders |
| Applicants.js | `/enabler/applicants/:id` | Applicants for opportunity |

### 2.3 `src/pages/pathfinder/`

| File | Route | Purpose |
|------|--------|---------|
| PathfinderDashboard.js | `/pathf`, `/dashf` | Pathfinder home, opportunities, applications |
| Opportunity.js | `/opportunity` | List/search opportunities |
| VolunteerDetails.js | `/volunteer-details` | One opportunity; apply, bookmark |
| ApplyApplication.js | `/apply/:opportunityId` | Application form |
| Bookmarks.js | `/bookmarks` | Saved opportunities |
| EditNewProfile.js | `/edit-new-profile` | Pathfinder profile form |

### 2.4 `src/pages/` (root)

| File | Route | Purpose |
|------|--------|---------|
| Landing.js | `/` | Main landing |
| LandingPathfinder.js | `/landingpathfinder` | Pathfinder landing |
| Landingenabler.js | `/landingenabler` | Enabler landing |
| Dashboard.js | `/dashboard` | Generic dashboard (with Navbar) |
| Profile.js | `/profile` | Generic profile (with Navbar) |
| Roadmap.js | `/road` | Roadmap |
| AboutUs.js | `/about` | About |
| ContactUs.js | `/contact` | Contact |
| PrivacyPolicy.js | `/privacy` | Privacy |
| DeepPayInfo.js | `/deep-pay-info` | Deep Pay |
| emppro.js | `/emppro` | Employer profile |
| Dash-employer.js | `/dash-employer` | Employer dashboard |
| Dash-freelance.js | `/dash-freelance` | Freelance dashboard |

---

## 3. Component index

### 3.1 Auth

| Component | Path | Purpose |
|-----------|------|---------|
| RequireAuth | `src/components/auth/RequireAuth.js` | Redirect to `/login` if no token; no role check |
| GoogleAuthButton | `src/components/auth/GoogleAuthButton.js` | Google sign-in/sign-up |
| Navbar (auth) | `src/components/auth/Navbar.js` | Pathfinder/enabler nav (notifications, profile) |
| EnablerNavbar | `src/components/auth/EnablerNavbar.js` | Enabler nav links |
| OTPInput | `src/components/auth/OTPInput.js` | OTP input field |

### 3.2 Layout

| Component | Path | Purpose |
|-----------|------|---------|
| Navbar (layout) | `src/components/layout/Navbar.js` | Dashboard/profile/kyc nav |

### 3.3 Common

| Component | Path | Purpose |
|-----------|------|---------|
| Input | `src/components/common/Input.js` | Text input |
| PasswordInput | `src/components/common/PasswordInput.js` | Password with show/hide toggle |
| Button | `src/components/common/Button.js` | Button |
| Modal | `src/components/common/Modal.js` | Modal dialog |
| Toast | `src/components/common/Toast.js` | Toast notifications |
| SocialButton | `src/components/common/SocialButton.js` | Social login button |

### 3.4 Forms

| Component | Path | Purpose |
|-----------|------|---------|
| KYCForm | `src/components/forms/KYCForm.js` | KYC form (also used as page at `/kyc`) |

### 3.5 Other

| Component | Path | Purpose |
|-----------|------|---------|
| CookieConsent | `src/components/CookieConsent.js` | Cookie consent banner |
| Wavy | `src/components/wavy/Wavy.js` | Wavy decoration |

---

## 4. Context & services

| Item | Path | Purpose |
|------|------|---------|
| UserContext | `src/context/UserContext.js` | user, loading, error, updateUser, logout, refetchUser |
| api | `src/services/api.js` | All backend API calls (auth, profile, bookmark, notifications, waitlist, applications, opportunities) |

---

## 5. Utilities

| File | Purpose |
|------|---------|
| `src/utils/cookieConsent.js` | Cookie consent load/save |
| `src/utils/gtag.js` | Load Google Analytics after consent |
| `src/utils/pathfinderData.js` | Pathfinder seed/sample data helpers |
| `src/utils/seedLocalStorage.js` | Seeds localStorage (disabled) |

---

## 6. Orphan / unreachable

These components exist but have **no route** in `App.js`:

- `Community.js` (if present)
- `subm.js` (if present)
- `Register.js` (use `/signup` instead)

---

*Index built from App.js and DOCUMENTATION.md. For API details see DOCUMENTATION.md §5 and WEBSITE_INDEX_AND_API_DOCS.md.*
