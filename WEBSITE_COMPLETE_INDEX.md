# Afrivate Volunteer Module - Complete Website Index

**Project:** Afrivate Volunteer Matching Platform  
**Type:** React Single-Page Application (SPA)  
**Deployment:** Vercel  
**Last Updated:** May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project File Structure](#4-project-file-structure)
5. [Authentication System](#5-authentication-system)
6. [User Roles & Personas](#6-user-roles--personas)
7. [Core Features](#7-core-features)
8. [Pages & Routes](#8-pages--routes)
9. [Components](#9-components)
10. [Services & API](#10-services--api)
11. [State Management](#11-state-management)
12. [Database Schema](#12-database-schema)
13. [Key Data Flows](#13-key-data-flows)
14. [Styling & Theme](#14-styling--theme)
15. [Recent Fixes & Enhancements](#15-recent-fixes--enhancements)

---

## 1. Project Overview

### Mission
Connect African volunteers (**Pathfinders**) with organizations posting opportunities (**Enablers**) in a secure, transparent, and user-friendly platform.

### Core Functionality
- **For Pathfinders**: Browse opportunities, apply, track applications, manage profiles
- **For Enablers**: Post opportunities, manage applicants, find matched volunteers
- **For Both**: Authentication, profile management, bookmarks, notifications

### Key Statistics
- **User Types**: 2 (Pathfinder, Enabler)
- **Pages**: 25+ distinct pages
- **Components**: 10+ reusable components
- **API Endpoints**: 40+ backend endpoints
- **Authentication Methods**: Email/Password, Google OAuth, OTP

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (SPA)                 │
│                    (Client-side Routing)                │
└─────────────────────────────────────────────────────────┘
                          │
                          │ (API Requests)
                          ↓
┌─────────────────────────────────────────────────────────┐
│        Backend API (Django/Python/Railway)              │
│  Base URL: https://afrivate-backend-production.up.railway.app
│  API Prefix: /api                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Database (PostgreSQL/etc)                  │
│  • User Accounts & Profiles                             │
│  • Opportunities (Jobs, Internships, Volunteering)      │
│  • Applications & Tracking                              │
│  • Bookmarks & Preferences                              │
└─────────────────────────────────────────────────────────┘

External Services:
  • Google OAuth 2.0 (Authentication)
  • Google Analytics 4 (Tracking)
```

---

## 3. Technology Stack

### Frontend
- **React 18.2.0** - UI library with hooks and context API
- **React Router 6.22.1** - Client-side routing (HashRouter)
- **Tailwind CSS 3** - Utility-first styling
- **PostCSS** - CSS processing and autoprefixer
- **Hero Icons 2.1.1** - SVG icon library
- **Font Awesome** - Icon font (fa-user, fa-search, etc)

### Build & Development
- **Create React App (CRA)** - Zero-configuration development
- **Node.js 18+** - Runtime
- **npm 9+** - Package manager

### Authentication & Security
- **Google OAuth 2.0** - `@react-oauth/google` v0.13.4
- **JWT Tokens** - Bearer token auth for API
- **localStorage** - Token storage (access + refresh)

### Analytics & Monitoring
- **Google Analytics 4** - GA4 with gtag.js
- **Consent Management** - GDPR-compliant cookie consent

### Testing
- **React Testing Library** - Component testing
- **Jest** - Test runner (via CRA)
- **Web Vitals** - Performance monitoring

---

## 4. Project File Structure

```
src/
├── App.js                           # Main routing component
├── index.js                         # Entry point (GoogleOAuthProvider)
├── App.css, index.css              # Global styles
├── setupTests.js                   # Test configuration
├── reportWebVitals.js              # Performance monitoring
│
├── Assets/                         # Static files
│   ├── api/                        # API documentation files
│   ├── img/                        # Images (volunteering, illustrations)
│   │   ├── pathf/                  # Pathfinder-specific images
│   │   └── icons/                  # Icon images
│   └── Logos/                      # Brand logos
│
├── components/                     # Reusable UI components
│   ├── CookieConsent.js           # GDPR cookie banner
│   ├── auth/                       # Authentication components
│   │   ├── Navbar.js              # Pathfinder navigation
│   │   ├── EnablerNavbar.js       # Enabler navigation
│   │   ├── GoogleAuthButton.js    # Google login button
│   │   ├── OTPInput.js            # OTP input component
│   │   └── RequireAuth.js         # Protected route wrapper
│   ├── common/                     # Common UI components
│   │   ├── Button.js              # Reusable button
│   │   ├── Input.js               # Text input component
│   │   ├── PasswordInput.js       # Password input
│   │   ├── Modal.js               # Modal dialog
│   │   ├── Pagination.js          # Pagination controls
│   │   ├── Toast.js               # Toast notifications
│   │   ├── FormattedText.js       # Text formatter
│   │   └── SocialButton.js        # Social platform buttons
│   └── forms/                      # Form components
│       └── KYCForm.js             # Know Your Customer form
│
├── context/                        # React Context (State Management)
│   └── UserContext.js             # Global user state
│
├── pages/                          # Page components
│   ├── Landing.js                 # Public landing page
│   ├── LandingPathfinder.js       # Pathfinder landing page
│   ├── Landingenabler.js          # Enabler landing page
│   ├── AboutUs.js                 # About page
│   ├── ContactUs.js               # Contact page
│   ├── PrivacyPolicy.js           # Privacy policy
│   ├── Roadmap.js                 # Product roadmap
│   ├── Notifications.js           # Notifications page
│   ├── NotFound.js                # 404 page
│   ├── DeepPayInfo.js             # Payment info page
│   │
│   ├── auth/                       # Authentication pages
│   │   ├── Login.js               # Login page
│   │   ├── SignUp.js              # Sign up page
│   │   ├── ForgotPassword.js      # Forgot password
│   │   ├── ResetPassword.js       # Reset password
│   │   ├── VerifyOTP.js           # OTP verification
│   │   └── SetPassword.js         # Set new password
│   │
│   ├── pathfinder/                # Pathfinder pages
│   │   ├── PathfinderDashboard.js # Dashboard with search (FIXED)
│   │   ├── PathfinderSettings.js  # Settings page
│   │   ├── AvailableOpportunities.js # Browse opportunities
│   │   ├── Opportunity.js         # Single opportunity view
│   │   ├── VolunteerDetails.js    # Opportunity details (detailed)
│   │   ├── ApplyApplication.js    # Application form
│   │   ├── MyApplications.js      # Track applications
│   │   ├── EditNewProfile.js      # Edit profile
│   │   ├── Bookmarks.js           # Bookmarked opportunities
│   │   ├── OrganizationProfile.js # View enabler profile
│   │   └── EnablerProfileView.js  # Enabler org details
│   │
│   └── enabler/                    # Enabler pages
│       ├── EnablerDashboard.js     # Enabler dashboard
│       ├── Recommendations.js      # Recommendations (REWRITTEN)
│       ├── PathfinderProfile.js    # View pathfinder profile
│       ├── CreateOpportunity.js    # Post opportunity
│       ├── EditOpportunity.js      # Edit posted opportunity
│       ├── OpportunitiesPosted.js  # List opportunities
│       ├── OpportunityDetails.js   # Opportunity details
│       ├── Applicants.js           # View applicants
│       ├── ContactPathfinder.js    # Contact pathfinder
│       ├── EnablerProfile.js       # View profile
│       ├── EnablerProfileSetup.js  # Setup profile
│       ├── EditProfile.js          # Edit profile
│       ├── EnablerPathfinderBookmarks.js # Bookmarked pathfinders
│       └── Settings.js             # Settings page
│
├── services/                       # API services
│   └── api.js                     # Centralized API client
│
└── utils/                          # Utility functions
    ├── bookmarkHelpers.js         # Bookmark utilities
    ├── cookieConsent.js           # Cookie consent
    ├── descriptionUtils.js        # Text processing
    ├── gtag.js                    # Google Analytics
    ├── opportunityUtils.js        # Opportunity helpers
    ├── pathfinderData.js          # Pathfinder data helpers
    ├── pathfinderProfilePayload.js # Profile payload builder
    ├── syncSocialLinks.js         # Social media sync
    └── websiteUrl.js              # URL utilities
```

---

## 5. Authentication System

### Authentication Methods

#### 1. Email/Password
- **Register**: `POST /api/auth/register/` with email, password, role
- **Login**: `POST /api/auth/login/` with email, password
- **Change Password**: `POST /api/auth/change-password/`

#### 2. Google OAuth 2.0
- **SDK**: `@react-oauth/google` v0.13.4
- **Signup**: `POST /api/auth/google/pathfinder/` or `POST /api/auth/google/enabler/`
- **Configured**: GoogleOAuthProvider wraps entire app in index.js

#### 3. OTP Verification
- **Send OTP**: `POST /api/auth/verify-otp/` (email-based)
- **Resend**: `POST /api/auth/resend-otp/`
- **Verify Password Reset**: `POST /api/auth/verify-password-reset-otp/`

#### 4. Password Reset
- **Forgot Password**: `POST /api/auth/forgot-password/`
- **Reset**: `POST /api/auth/reset-password/` (with OTP)
- **Set New**: `POST /api/auth/set-password/`

### Token Management
```javascript
// localStorage keys
"afrivate_access"   // JWT access token (short-lived)
"afrivate_refresh"  // Refresh token (long-lived)
"afrivate_role"     // User role ("pathfinder" | "enabler")

// Token refresh flow
1. Request with expired access token → 401
2. Use refresh token → POST /api/auth/token/refresh/
3. Receive new access token
4. Retry original request
5. If refresh fails → redirect to login
```

### Session Management
- **Logout**: `POST /api/auth/logout/` (invalidates tokens)
- **Delete Account**: `DELETE /api/auth/delete-account/`

---

## 6. User Roles & Personas

### Pathfinder (Volunteer)

**What they do:**
- Browse available opportunities
- Apply for opportunities
- Manage profile (skills, education, experience)
- Track application status
- Bookmark opportunities
- Contact organizations

**Profile Components:**
- Base details (email, phone, location)
- Skills (array of strings)
- Education (institution, degree, field)
- Certifications
- Work experience
- Social links
- Profile picture
- Government credentials/documents

**Key Pages:**
- PathfinderDashboard (recommended opportunities)
- AvailableOpportunities (browse all)
- MyApplications (track status)
- Bookmarks (saved opportunities)
- EditNewProfile (update profile)

### Enabler (Organization)

**What they do:**
- Post opportunities (jobs, internships, volunteering)
- View and manage applications
- Find and contact qualified pathfinders
- Manage organization profile
- Get recommendations

**Profile Components:**
- Base details (organization name, email, phone)
- Description & about
- Social links
- Office location
- Logo/picture

**Key Pages:**
- EnablerDashboard (overview)
- Recommendations (matched volunteers) - **REWRITTEN**
- CreateOpportunity (post job)
- OpportunitiesPosted (manage postings)
- Applicants (view who applied)
- EnablerProfile (org profile)

---

## 7. Core Features

### Feature #1: Opportunity Management

**Create Opportunity** (Enabler only)
```
POST /api/opportunities/
{
  title: "Software Developer Volunteer",
  opportunity_type: "volunteering|internship|job",
  description: "Join our team...",
  location: "Lagos, Nigeria",
  link: "https://example.com",
  ...additional fields
}
```

**Browse Opportunities** (Everyone)
```
GET /api/opportunities/?is_open=true&search=&opportunity_type=&page=1&page_size=20
Returns: Array of opportunities with details
```

**Apply for Opportunity** (Pathfinder only)
```
POST /api/applications/
{
  opportunity: 1,
  cover_letter: "...",
  profile_resume: 3  // credential ID
}
```

**Track Application** (Enabler reviews)
```
GET /api/opportunities/{id}/applicants/ (view all)
GET /api/opportunities/{id}/applicants/{applicant_id}/ (view one)
PATCH /api/applications/{id}/change_status/ (accept/reject)
```

### Feature #2: Bookmarks/Favorites

**Pathfinder Bookmarks**
```
POST /api/bookmark/opportunities/saved/ (save opportunity)
GET /api/bookmark/opportunities/saved/ (list bookmarks)
DELETE /api/bookmark/opportunities/saved/{opp_id}/ (remove)
```

**Enabler Bookmarks**
```
POST /api/bookmark/applicants/saved/ (bookmark pathfinder)
GET /api/bookmark/applicants/saved/ (list bookmarks)
DELETE /api/bookmark/applicants/saved/{pathfinder_id}/ (remove)
```

**Organization Bookmarks** (Pathfinder)
```
POST /api/bookmark/enablers/saved/ (save enabler)
GET /api/bookmark/enablers/saved/ (list saved orgs)
DELETE /api/bookmark/enablers/saved/{enabler_id}/ (remove)
```

### Feature #3: Profile Management

**Pathfinder Profile**
```
GET /api/profile/pathfinderprofile/ (my profile)
GET /api/profile/pathfinderprofile/user/{user_id}/ (others' profiles)
PATCH /api/profile/pathfinderprofile/ (update)
PUT /api/profile/pathfinderprofile/ (replace)
```

**Enabler Profile**
```
GET /api/profile/enablerprofile/ (my profile)
GET /api/profile/enablerprofile/user/{user_id}/ (others' profiles)
PATCH /api/profile/enablerprofile/ (update)
```

**Profile Picture**
```
PATCH /api/profile/profile/picture/ (multipart/form-data)
GET /api/profile/profile/picture/
```

**Skills, Education, Certifications**
- Embedded in profile or separate endpoints
- Array fields in profile object

### Feature #4: Notifications

```
GET /api/notify/notifications/ (list)
POST /api/notify/notifications/ (create)
POST /api/notify/notifications/{id}/mark-read/ (mark read)
POST /api/notify/notifications/mark-all-read/ (mark all read)
```

### Feature #5: Recommendations (NEW)

**Algorithm-Based Matching** (Enabler)
- Scores pathfinders by skills/education match
- Ranks by relevance
- Allows removal and persistence
- Never shows empty list
- See [Issue #2 Fix](#issue-2-enabler-recommendations-system)

---

## 8. Pages & Routes

### Public Routes (No Auth Required)
```
/                          Landing page
/about                     About us page
/contact                   Contact page
/privacy                   Privacy policy
/roadmap                   Product roadmap
/landing-pathfinder        Pathfinder landing
/landing-enabler           Enabler landing
/auth/login                Login page
/auth/signup               Sign up page
/auth/forgot-password      Forgot password
/auth/verify-otp           OTP verification
/auth/reset-password       Reset password
/auth/set-password         Set new password
```

### Protected - Pathfinder Routes
```
/pathfinder/dashboard                    Main dashboard (FIXED - search works)
/pathfinder/available-opportunities      Browse all opportunities
/opportunity/:id                         View opportunity details
/apply/:id                               Apply for opportunity
/my-applications                         Track applications
/bookmarks                               Saved opportunities
/profile                                 View own profile
/profile/edit                            Edit profile
/pathfinder/settings                     Settings
/organization/:id                        View enabler profile
/enabler/:id                             Enabler organization page
/notifications                           Notifications page
/kyc                                     KYC verification
```

### Protected - Enabler Routes
```
/enabler/dashboard                       Main dashboard
/enabler/recommendations                 Recommended pathfinders (REWRITTEN)
/enabler/create-opportunity              Post new opportunity
/enabler/opportunities                   List my opportunities
/enabler/opportunity/:id                 View opportunity details
/enabler/opportunity/:id/edit            Edit opportunity
/enabler/opportunity/:id/details         Opportunity details
/enabler/applicants/:id                  View applicants
/enabler/pathfinder/:id                  View pathfinder profile
/enabler/contact/:id                     Contact pathfinder
/enabler/bookmarks                       Bookmarked pathfinders
/enabler/profile                         View organization profile
/enabler/profile/setup                   Setup organization
/enabler/profile/edit                    Edit organization
/enabler/settings                        Settings
/notifications                           Notifications
```

### Special Routes
```
/404                       Not found page
/kyc-form                  KYC form (all users)
/deeppay-info              Payment information
```

---

## 9. Components

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **RequireAuth** | auth/ | Protects routes, redirects unauthenticated |
| **Navbar** | auth/ | Pathfinder navigation bar |
| **EnablerNavbar** | auth/ | Enabler navigation bar |
| **GoogleAuthButton** | auth/ | Google login button |
| **OTPInput** | auth/ | OTP code input field |
| **Button** | common/ | Reusable button with variants |
| **Input** | common/ | Text input with validation |
| **PasswordInput** | common/ | Password field with toggle |
| **Modal** | common/ | Dialog/modal component |
| **Pagination** | common/ | Page navigation controls |
| **Toast** | common/ | Notification toast |
| **CookieConsent** | / | GDPR cookie banner |
| **KYCForm** | forms/ | Know Your Customer form |

### Re-used Patterns

**Form Components**
- Input field + Label + Error message
- Password input with show/hide toggle
- Submit button with loading state

**List Components**
- Card-based layouts
- Pagination controls
- Search/filter functionality
- Empty states

**Navigation**
- Navbar at top of each page
- Different navbar for pathfinder vs enabler
- Active route highlighting

---

## 10. Services & API

### API Client Structure

**File:** `src/services/api.js`

**Base Configuration:**
```javascript
BASE_URL = process.env.REACT_APP_API_BASE_URL 
         || "https://afrivate-backend-production.up.railway.app"
API_PREFIX = process.env.REACT_APP_API_PREFIX ?? "/api"
```

**Authentication Headers:**
```javascript
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Error Handling:**
- Validates errors with nested field errors
- Flattens validation errors into readable messages
- Handles 401 with automatic token refresh
- Retries once on 401 if refresh token available

### API Endpoints by Category

#### Authentication
```
POST /auth/register/              Register new account
POST /auth/login/                 Login with email/password
POST /auth/google/pathfinder/     Google signup - pathfinder
POST /auth/google/enabler/        Google signup - enabler
POST /auth/verify-otp/            Verify OTP
POST /auth/resend-otp/            Resend OTP
POST /auth/forgot-password/       Request password reset
POST /auth/verify-password-reset-otp/  Verify reset OTP
POST /auth/reset-password/        Reset password
POST /auth/change-password/       Change password (authenticated)
POST /auth/token/refresh/         Refresh access token
POST /auth/logout/                Logout
DELETE /auth/delete-account/      Delete account
```

#### Bookmarks
```
GET /bookmark/opportunities/saved/         List saved opportunities
POST /bookmark/opportunities/saved/        Save opportunity
DELETE /bookmark/opportunities/saved/{id}/ Unsave opportunity

GET /bookmark/applicants/saved/            List bookmarked pathfinders
POST /bookmark/applicants/saved/           Bookmark pathfinder
DELETE /bookmark/applicants/saved/{id}/    Remove bookmark

GET /bookmark/enablers/saved/              List bookmarked enablers
POST /bookmark/enablers/saved/             Bookmark enabler
DELETE /bookmark/enablers/saved/{id}/      Remove bookmark
```

#### Notifications
```
GET /notify/notifications/                List notifications
POST /notify/notifications/               Create notification
POST /notify/notifications/{id}/mark-read/  Mark as read
POST /notify/notifications/mark-all-read/ Mark all as read
```

#### Profile
```
GET /profile/pathfinderprofile/                Get my pathfinder profile
GET /profile/pathfinderprofile/user/{id}/     Get pathfinder by user ID
PUT /profile/pathfinderprofile/                Update profile (full)
PATCH /profile/pathfinderprofile/             Update profile (partial)

GET /profile/enablerprofile/                  Get my enabler profile
GET /profile/enablerprofile/user/{id}/        Get enabler by user ID
PUT /profile/enablerprofile/                  Update profile (full)
PATCH /profile/enablerprofile/               Update profile (partial)

PATCH /profile/profile/picture/              Upload profile picture
GET /profile/profile/picture/                Get profile picture

GET /profile/credentials/                    List credentials
POST /profile/credentials/                   Upload credential
PATCH /profile/credentials/{id}/            Update credential
DELETE /profile/credentials/{id}/           Delete credential

GET /profile/social-links/                   List social links
POST /profile/social-links/                  Add social link
PUT /profile/social-links/{id}/             Update link
DELETE /profile/social-links/{id}/          Delete link
```

#### Applications
```
GET /applications/                     List my applications
POST /applications/                    Submit application
GET /applications/{id}/               Get application details
PUT /applications/{id}/               Update application
PATCH /applications/{id}/             Partial update
DELETE /applications/{id}/            Withdraw application
PATCH /applications/{id}/change_status/  Accept/reject application
```

#### Opportunities
```
GET /opportunities/                   List all opportunities (public)
POST /opportunities/                  Create opportunity (enabler)
GET /opportunities/mine/              Get my opportunities (enabler)
GET /opportunities/{id}/              Get opportunity details (public)
PUT /opportunities/{id}/              Update opportunity (enabler)
PATCH /opportunities/{id}/           Partial update (enabler)
DELETE /opportunities/{id}/          Delete opportunity (enabler)

GET /opportunities/{id}/applicants/                List applicants
GET /opportunities/{id}/applicants/{app_id}/     Get applicant profile
```

#### Waitlist
```
POST /waitlist/              Join waitlist
GET /waitlist/stats/         Get waitlist statistics
```

---

## 11. State Management

### Context API - UserContext

**Location:** `src/context/UserContext.js`

**Global State:**
```javascript
{
  user: {
    id,
    email,
    first_name,
    last_name,
    name,
    role,           // "pathfinder" | "enabler"
    ...profile_data
  },
  loading: boolean,
  error: string | null,
  
  // Methods
  login(email, password),
  logout(),
  updateUser(data),
  clearError()
}
```

**Usage Pattern:**
```javascript
const { user, loading, error, logout } = useUser();

if (loading) return <Loading />;
if (error) return <Error />;
if (!user) return <Redirect to="/login" />;
```

### Component State (Hooks)

**useState** used for:
- Form input values
- List data (opportunities, applications, etc.)
- UI state (loading, error, selected items)
- Pagination state

**useEffect** used for:
- Loading data on mount
- API calls based on dependencies
- Cleanup (event listeners, timeouts)

**useCallback** used for:
- Bookmark check functions
- Event handlers for modals

---

## 12. Database Schema

### User Model
```
User
├── id (PK)
├── email (unique)
├── password (hashed)
├── first_name
├── last_name
├── role (choice: pathfinder/enabler)
├── is_active
├── date_joined
└── last_login
```

### PathfinderProfile
```
PathfinderProfile
├── id (PK)
├── user (FK → User)
├── title
├── about
├── work_experience
├── skills (JSONField array)
├── educations (JSONField array)
├── certifications (JSONField array)
├── languages
├── profile_pic (ImageField)
├── base_details
│   ├── contact_email
│   ├── phone_number
│   ├── address
│   ├── state
│   ├── country
│   ├── bio
│   ├── website
│   └── profile_pic
└── created_at
```

### EnablerProfile
```
EnablerProfile
├── id (PK)
├── user (FK → User)
├── organization_name
├── description
├── about
├── logo (ImageField)
├── website
├── office_location
├── base_details
│   ├── contact_email
│   ├── phone_number
│   ├── address
│   ├── state
│   ├── country
│   └── bio
└── created_at
```

### Opportunity
```
Opportunity
├── id (PK)
├── created_by (FK → User/Enabler)
├── created_by_name (cached)
├── title
├── opportunity_type (choice: job/internship/volunteering)
├── description
├── location
├── link
├── is_open (boolean)
├── created_at
├── updated_at
└── (editable within 12 hours)
```

### Application
```
Application
├── id (PK)
├── opportunity (FK → Opportunity)
├── user (FK → Pathfinder)
├── status (choice: pending/accepted/rejected)
├── cover_letter
├── profile_resume (FK → Credential)
├── resume (FileField for direct upload)
├── applied_at
└── updated_at
```

### Bookmark
```
OpportunitySaved (Pathfinder bookmarks)
├── id (PK)
├── pathfinder (FK → PathfinderProfile)
├── opportunity (FK → Opportunity)
└── created_at

ApplicantSaved (Enabler bookmarks)
├── id (PK)
├── enabler (FK → EnablerProfile)
├── pathfinder (FK → PathfinderProfile)
├── opportunity (FK → Opportunity)
└── created_at

EnablerSaved (Pathfinder bookmarks enablers)
├── id (PK)
├── pathfinder (FK → PathfinderProfile)
├── enabler (FK → EnablerProfile)
└── created_at
```

### Notification
```
Notification
├── id (PK)
├── user (FK → User)
├── type (choice: application/message/update)
├── title
├── message
├── related_object_id
├── is_read
├── created_at
└── read_at
```

---

## 13. Key Data Flows

### Data Flow 1: Pathfinder Apply for Opportunity

```
[PathfinderDashboard]
      │
      ├─→ GET /api/opportunities/?is_open=true
      └─→ Display with SEARCH FILTER (FIXED)
           │
           └─→ [VolunteerDetails] - Click "Apply"
                    │
                    ├─→ GET /api/profile/pathfinderprofile/ (auto-fill)
                    ├─→ GET /api/profile/credentials/ (resume options)
                    └─→ [ApplyApplication] - Fill form
                         │
                         └─→ POST /api/applications/
                              ├─ opportunity_id
                              ├─ cover_letter
                              └─ resume (file or credential_id)
                                   │
                                   ├─→ Success: Mark as "Applied"
                                   └─→ Error: Show error toast
```

### Data Flow 2: Enabler View Recommendations

```
[EnablerDashboard]
      │
      └─→ Navigate to [Recommendations] (REWRITTEN)
           │
           ├─→ GET /api/opportunities/mine/
           ├─→ GET /api/applications/
           ├─→ GET /api/bookmark/applicants/saved/
           │
           └─→ CALCULATE MATCH SCORES (NEW ALGORITHM)
                ├─ Extract skills from pathfinders
                ├─ Extract education
                ├─ Score each vs enabler's opportunities
                └─ Sort by relevance
                     │
                     ├─→ Display recommendations
                     ├─→ Allow SEARCH within results
                     ├─→ Allow REMOVE (saved to localStorage)
                     └─→ Allow VIEW PROFILE or CONTACT
```

### Data Flow 3: Enabler Manage Applications

```
[EnablerDashboard]
      │
      └─→ Navigate to [OpportunitiesPosted]
           │
           ├─→ GET /api/opportunities/mine/
           └─→ Display opportunities with counts
                │
                └─→ Click opportunity
                     │
                     └─→ GET /api/opportunities/{id}/applicants/
                          │
                          └─→ [Applicants] - List applicants
                               │
                               ├─→ Click applicant name
                               │   │
                               │   └─→ GET /api/opportunities/{id}/applicants/{applicant_id}/
                               │        │
                               │        └─→ [PathfinderProfile] - View full profile
                               │
                               └─→ Click Accept/Reject
                                    │
                                    └─→ PATCH /api/applications/{id}/change_status/
                                         └─ status: "accepted" | "rejected"
```

### Data Flow 4: Search in Pathfinder Dashboard (FIXED)

```
[PathfinderDashboard]
      │
      ├─→ GET /api/opportunities/?is_open=true
      └─→ Store in recommendedOpportunities state
           │
           ├─→ Type in search box
           │   │
           │   └─→ setSearch(value) ─→ State update
           │        │
           │        └─→ filteredOpportunities = 
           │             recommendedOpportunities.filter(
           │               item.title.includes(search) ||
           │               item.location.includes(search) ||
           │               item.type.includes(search) ||
           │               item.company.includes(search)
           │             )
           │
           └─→ Render filtered results
                ├─→ Empty state if no matches
                └─→ Cards if matches
```

---

## 14. Styling & Theme

### Tailwind Configuration

**Primary Brand Color:** `#6A00B1` (Purple)

**Color Palette:**
```css
Primary:     #6A00B1 (purple-600 equivalent)
Secondary:   #E0C6FF (light purple)
Accent Red:  #FF0000
Light Gray:  #E9E9E9, #F0F0F0
Dark Gray:   #7E7E7E, #BDBDBD
Success:     Green shades
Error:       Red shades
```

### Typography

**Font Families:**
- **Headings**: Montserrat (bold, clean)
- **Body**: Inter (readable)
- **Accents**: Poppins

**Font Sizes:**
- Hero text: 2xl - 3xl (32-48px)
- Headings: lg - xl (18-20px)
- Body text: sm - base (14-16px)
- Small text: xs (12px)

### Component Styling Patterns

**Buttons:**
```css
/* Primary CTA */
bg-[#6A00B1] text-white px-5 py-2.5 rounded-lg font-semibold 
hover:bg-[#5A0091]

/* Secondary */
bg-[#E0C6FF] text-[#6A00B1] px-4 py-2 rounded-lg 
hover:bg-[#D0B6FF]

/* Danger */
bg-red-100 text-red-600 px-4 py-2 rounded-lg 
hover:bg-red-200
```

**Cards:**
```css
bg-white border border-[#E9E9E9] rounded-2xl p-4 md:p-6
hover:shadow-md transition-all

/* Or light background */
bg-gray-100 rounded-lg p-4
```

**Input Fields:**
```css
border border-gray-300 rounded-lg px-4 py-3
focus:outline-none focus:ring-2 focus:ring-[#6A00B1]
placeholder-gray-400
```

---

## 15. Recent Fixes & Enhancements

### Fix #1: Search Bar in Pathfinder Dashboard

**Issue:** Search input not interactive due to z-index/overlay issues
**Solution:** Removed background overlay, applied styling directly
**File:** `src/pages/pathfinder/PathfinderDashboard.js`
**Status:** ✅ FIXED

**Before:**
```jsx
<div className="relative w-full max-w-xl mx-auto">
  <div className="absolute inset-0 bg-[rgba(...)]"></div>
  <input className="bg-transparent ..." />
</div>
```

**After:**
```jsx
<div className="relative w-full max-w-xl mx-auto">
  <input className="bg-[rgba(...)] ... z-20" />
</div>
```

### Fix #2: Enabler Recommendations System

**Issue:** Empty recommendations page for new enablers, only showed applicants
**Solution:** Implemented algorithm-based matching with skill/education scoring
**File:** `src/pages/enabler/Recommendations.js`
**Status:** ✅ REWRITTEN

**Features Added:**
1. **Algorithm-based scoring** - Match pathfinders to opportunities
2. **Multi-source loading** - Applicants + bookmarks + scored recommendations
3. **Removal capability** - Hide recommendations with localStorage persistence
4. **Never empty** - Shows restoration UI when all removed
5. **Enhanced data** - Added education display and match scores
6. **Sorting** - By relevance (match score)

**Algorithm Scoring:**
- Skill match: +5 pts
- Education match: +3 pts
- Experience keyword match: +2 pts
- Base score: +1 pt

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
# Opens http://localhost:3000

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

```bash
# .env file
REACT_APP_API_BASE_URL=https://afrivate-backend-production.up.railway.app
REACT_APP_API_PREFIX=/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Deployment

- **Hosted on:** Vercel
- **Branch:** main → auto-deploys
- **Build command:** `npm run build`
- **Start command:** Vercel serves static files

---

## Support & Documentation

### API Documentation
- See `/api/` prefix endpoint docs
- Backend: https://afrivate-backend-production.up.railway.app

### Additional Docs
- `MASTER_INDEX.md` - Original comprehensive index
- `FIXES_IMPLEMENTATION.md` - Details of recent fixes
- `FRONTEND_CHANGES.md` - Change log
- `DOCUMENTATION.md` - General docs

---

## Summary

The Afrivate Volunteer Module is a comprehensive React-based volunteer matching platform with:

✅ **For Pathfinders:**
- Browse, apply, and track opportunities
- Profile management
- Bookmark system
- Application tracking

✅ **For Enablers:**
- Post and manage opportunities
- Review and manage applications
- Find matched volunteers (NEW ALGORITHM)
- Bookmark pathfinders

✅ **Core Infrastructure:**
- Secure authentication (Email + Google OAuth)
- Role-based access control
- RESTful API integration
- Real-time notifications
- Responsive design
- GDPR compliance

✅ **Recent Improvements:**
- Fixed search bar in pathfinder dashboard
- Implemented intelligent recommendations
- Algorithm-based pathfinder matching
- Removal/curation capabilities

