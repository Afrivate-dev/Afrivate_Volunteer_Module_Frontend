# Afrivate Volunteer Module - Complete Website Index & API Documentation

## 📋 Table of Contents
1. [Website Overview](#website-overview)
2. [Application Architecture](#application-architecture)
3. [User Roles & Flows](#user-roles--flows)
4. [Complete API Documentation](#complete-api-documentation)
5. [Key Components & Pages](#key-components--pages)
6. [Data Flow & State Management](#data-flow--state-management)
7. [API Integration Guide](#api-integration-guide)

---

## 🌐 Website Overview

**Afrivate** is a volunteer opportunity platform connecting African talent (Pathfinders) with organizations (Enablers) offering volunteering opportunities. The platform facilitates:
- Opportunity discovery and application
- Profile management for both user types
- Application management and tracking
- Bookmarking and saving opportunities

### Tech Stack
- **Frontend**: React 18.2.0 with React Router DOM 6.22.1
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Context API
- **Authentication**: JWT Bearer tokens
- **Backend API**: Django REST Framework (hosted on Railway)

### Base Configuration
- **API Base URL**: `https://afrivate-backend-production.up.railway.app`
- **API Prefix**: `/api` (configurable via `REACT_APP_API_PREFIX`)
- **Authentication**: Bearer token stored in localStorage (`afrivate_access`, `afrivate_refresh`)

---

## 🏗️ Application Architecture

### Directory Structure
```
src/
├── components/
│   ├── auth/          # Authentication components (Navbar, RequireAuth, GoogleAuthButton)
│   ├── common/        # Reusable UI components (Button, Input, Toast, Modal)
│   ├── forms/         # Form components (KYCForm)
│   └── layout/         # Layout components
├── context/           # React Context providers (UserContext)
├── pages/
│   ├── auth/          # Authentication pages (Login, SignUp, ForgotPassword, etc.)
│   ├── enabler/       # Enabler-specific pages (Dashboard, CreateOpportunity, etc.)
│   ├── pathfinder/    # Pathfinder-specific pages (Dashboard, Opportunity, ApplyApplication)
│   └── [public pages]  # Landing, AboutUs, ContactUs, PrivacyPolicy
├── services/
│   └── api.js         # API client with all endpoint definitions
└── utils/             # Utility functions
```

### Key Routes (from App.js)
- **Public**: `/`, `/landingpathfinder`, `/landingenabler`, `/opportunity`, `/volunteer-details`
- **Auth**: `/login`, `/signup`, `/forgot-password`, `/verify-otp`, `/reset-password`
- **Pathfinder**: `/pathf`, `/dashf`, `/apply/:opportunityId`, `/bookmarks`, `/edit-new-profile`
- **Enabler**: `/enabler/dashboard`, `/create-opportunity`, `/enabler/opportunities-posted`, `/enabler/applicants/:id`

---

## 👥 User Roles & Flows

### 1. Pathfinder (Volunteer)
**Purpose**: Find and apply for volunteering opportunities

**Key Features**:
- Browse and search opportunities
- Bookmark/save opportunities
- Apply to opportunities with CV/resume
- View application status
- Manage profile

**User Flow**:
1. Sign up/Login → Select "pathfinder" role
2. View dashboard → See recommended opportunities
3. Browse opportunities → Search/filter
4. View opportunity details → Click "Apply"
5. Fill application form → Upload CV, answer custom questions
6. Submit application → Stored in localStorage + API (when implemented)

### 2. Enabler (Organization)
**Purpose**: Post opportunities and manage applications

**Key Features**:
- Create and post opportunities
- View posted opportunities
- Manage applicants
- View applicant profiles
- Contact pathfinders
- Analytics dashboard

**User Flow**:
1. Sign up/Login → Select "enabler" role
2. Complete profile setup
3. Create opportunity → Multi-step form (title, description, requirements, location, etc.)
4. Post opportunity → Saved to localStorage + API
5. View applicants → Filter by opportunity
6. Review applications → Download CVs, contact applicants

---

## 📚 Complete API Documentation

### Authentication & Authorization

#### Base Configuration
- **Base URL**: `https://afrivate-backend-production.up.railway.app`
- **API Prefix**: `/api`
- **Auth Method**: Bearer Token (JWT)
- **Token Storage**: 
  - Access: `localStorage.getItem('afrivate_access')`
  - Refresh: `localStorage.getItem('afrivate_refresh')`
  - Role: `localStorage.getItem('afrivate_role')` ("enabler" | "pathfinder")

#### Token Management Functions (from api.js)
```javascript
getAccessToken()      // Returns access token from localStorage
getRefreshToken()     // Returns refresh token from localStorage
setTokens(access, refresh)  // Stores tokens
clearTokens()         // Removes all tokens and role
setRole(role)         // Stores user role
getRole()             // Returns user role
```

---

### 🔐 Authentication API (`/auth/`)

#### 1. **POST** `/auth/register/`
Register a new user.

**Request Body**:
```json
{
  "username": "string",           // Required, 1-150 chars, pattern: ^[\w.@+-]+$
  "email": "user@example.com",    // Required, 1-254 chars
  "password": "string",           // Required, 1-128 chars
  "password2": "string",          // Required, non-empty
  "role": "enabler" | "pathfinder" // Required
}
```

**Response**: 201 Created

**Usage in Code**: `api.auth.register({ username, email, password, password2, role })`

---

#### 2. **POST** `/auth/token/`
Get JWT access and refresh tokens.

**Request Body**:
```json
{
  "email": "string",     // Required, non-empty
  "password": "string"   // Required, non-empty
}
```

**Response**: 201 Created
```json
{
  "access": "string",    // JWT access token
  "refresh": "string"    // JWT refresh token
}
```

**Usage in Code**: `api.auth.token({ email, password })`

**Auto-refresh**: If 401 received, automatically refreshes token using refresh token.

---

#### 3. **POST** `/auth/token/refresh/`
Refresh access token using refresh token.

**Request Body**:
```json
{
  "refresh": "string"  // Required, non-empty
}
```

**Response**: 201 Created
```json
{
  "refresh": "string",
  "access": "string"
}
```

**Usage in Code**: `api.auth.tokenRefresh(refresh)`

---

#### 4. **POST** `/auth/login/`
Login endpoint (alternative to token endpoint).

**Request Body**:
```json
{
  "username_or_email": "string",  // Required, non-empty
  "password": "string"            // Required, non-empty
}
```

**Response**: 201 Created

**Usage in Code**: `api.auth.login({ username_or_email, password })`

---

#### 5. **POST** `/auth/logout/`
Logout user (invalidates tokens).

**Auth**: Bearer Token Required

**Response**: 201 Created

**Usage in Code**: `api.auth.logout()` (also clears local tokens)

---

#### 6. **POST** `/auth/forgot-password/`
Request password reset OTP.

**Request Body**:
```json
{
  "email": "user@example.com"  // Required, non-empty, email format
}
```

**Response**: 201 Created

**Usage in Code**: `api.auth.forgotPassword({ email })`

---

#### 7. **POST** `/auth/verify-otp/`
Verify OTP for password reset.

**Request Body**:
```json
{
  "email": "user@example.com",  // Required, non-empty, email format
  "otp": "string"               // Required, 1-6 characters
}
```

**Response**: 201 Created

**Usage in Code**: `api.auth.verifyOtp({ email, otp })`

---

#### 8. **POST** `/auth/reset-password/`
Reset password after OTP verification.

**Request Body**:
```json
{
  "email": "user@example.com",        // Required
  "new_password": "string",          // Required
  "confirm_password": "string"       // Required
}
```

**Response**: 201 Created

**Usage in Code**: `api.auth.resetPassword({ email, new_password, confirm_password })`

---

#### 9. **POST** `/auth/change-password/`
Change password (authenticated user).

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "old_password": "string",      // Required, non-empty
  "new_password": "string",      // Required, non-empty
  "confirm_password": "string"   // Required, non-empty
}
```

**Response**: 201 Created

**Usage in Code**: `api.auth.changePassword({ old_password, new_password, confirm_password })`

---

#### 10. **POST** `/auth/google/`
Exchange Google id_token for app JWT tokens.

**Request Body**:
```json
{
  "id_token": "string",                    // Required, Google id_token
  "role": "enabler" | "pathfinder"         // Optional, for new signups
}
```

**Response**: 201 Created
```json
{
  "access": "string",
  "refresh": "string"
}
```

**Usage in Code**: `api.auth.google({ id_token, role })`

---

#### 11. **POST** `/auth/verify-email/`
Verify email with token.

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "token": "string"  // Required, 1-64 characters
}
```

**Response**: 201 Created

**Usage in Code**: `api.auth.verifyEmail({ token })`

---

### 📑 Opportunities API (`/bookmark/opportunities/`)

#### 1. **GET** `/bookmark/opportunities/`
List all opportunities (with optional filtering).

**Auth**: Bearer Token Required

**Query Parameters** (optional):
- `opportunity_type`: string (volunteering, internship, scholarship, job, grant)
- `is_open`: string (boolean as string)
- `search`: string (search term)
- `page`: integer (page number)
- `page_size`: integer (results per page)

**Response**: 200 OK
```json
{
  "count": 0,
  "next": "http://example.com/api/bookmark/opportunities/?page=2" | null,
  "previous": "http://example.com/api/bookmark/opportunities/?page=1" | null,
  "results": [
    {
      "id": 0,
      "title": "string",
      "opportunity_type": "volunteering" | "internship" | "scholarship" | "job" | "grant",
      "description": "string",
      "link": "http://example.com",
      "posted_at": "2019-08-24T14:15:22Z",
      "is_open": true,
      "created_by_name": "string",
      "created_by": 0 | null
    }
  ]
}
```

**Usage in Code**: `api.bookmark.opportunitiesList()`

**Current Implementation**: 
- Fetches from API
- Falls back to localStorage if API fails
- Caches results in `localStorage.getItem('opportunityListCache')`

---

#### 2. **POST** `/bookmark/opportunities/`
Create a new opportunity.

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "title": "string",                              // Required, 1-255 characters
  "description": "string",                        // Required, non-empty
  "link": "http://example.com",                  // Required, 1-200 characters, URI
  "is_open": true,                                // Boolean
  "opportunity_type": "volunteering"              // Optional
}
```

**Response**: 201 Created
```json
{
  "id": 0,
  "title": "string",
  "opportunity_type": "volunteering",
  "description": "string",
  "link": "http://example.com",
  "posted_at": "2019-08-24T14:15:22Z",
  "is_open": true,
  "created_by_name": "string",
  "created_by": 0 | null
}
```

**Usage in Code**: `api.bookmark.opportunitiesCreate({ title, description, link, is_open })`

**Current Implementation** (CreateOpportunity.js):
- Creates opportunity via API
- Also saves to `localStorage.getItem('enablerOpportunities')`
- Stores custom questions in `localStorage.getItem('opportunityCustomQuestions')`

---

### 🔖 Bookmarks API (`/bookmark/bookmarks/`)

#### 1. **GET** `/bookmark/bookmarks/`
List all bookmarked opportunities for authenticated user.

**Auth**: Bearer Token Required

**Response**: 200 OK
```json
[
  {
    "id": 0,
    "opportunity": { /* Opportunity object */ },
    "opportunity_id": 0,
    "created_at": "2019-08-24T14:15:22Z"
  }
]
```

**Usage in Code**: `api.bookmark.list()`

---

#### 2. **POST** `/bookmark/bookmarks/`
Bookmark an opportunity.

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "opportunity": {
    "title": "string",
    "opportunity_type": "volunteering",
    "description": "string",
    "link": "http://example.com",
    "is_open": true
  },
  "opportunity_id": 0
}
```

**Response**: 201 Created

**Usage in Code**: `api.bookmark.create({ opportunity, opportunity_id })`

---

#### 3. **DELETE** `/bookmark/bookmarks/{id}/delete/`
Remove a bookmark.

**Auth**: Bearer Token Required

**Path Parameters**: `id` (string, required)

**Response**: 204 No Content

**Usage in Code**: `api.bookmark.delete(id)`

---

#### 4. **GET** `/bookmark/opportunities/saved/`
List all saved/bookmarked opportunities (alias for bookmarks).

**Auth**: Bearer Token Required

**Response**: 200 OK (same as GET `/bookmark/bookmarks/`)

**Usage in Code**: `api.bookmark.opportunitiesSavedList()`

---

#### 5. **POST** `/bookmark/opportunities/saved/`
Save/bookmark an opportunity (alternative endpoint).

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "opportunity_id": 0  // Required
}
```

**Response**: 201 Created

**Usage in Code**: `api.bookmark.opportunitiesSavedCreate({ opportunity_id })`

**Current Implementation** (Opportunity.js):
- Used when user clicks "Save" button
- Updates local state to show "Saved" status

---

### 👤 Profile API (`/profile/`)

#### Enabler Profile

##### 1. **GET** `/profile/enablerprofile/`
Get enabler profile for authenticated user.

**Auth**: Bearer Token Required

> ⚠️ This endpoint only returns the current user's profile.  There is no
> documented public “get by ID” route for enabler profiles.  The frontend
> instead calls `/profile/view-profile/{id}/` when it needs to display another
> organization's data (see `profile.enablerGetById()` in `services/api.js`).

**Response**: 200 OK
```json
{
  "id": 0,
  "base_details": {
    "id": 0,
    "profile_pic": "http://example.com",
    "bio": "string",                    // <= 150 characters
    "contact_email": "user@example.com", // Required, 1-256 characters
    "phone_number": "string",          // <= 20 characters
    "address": "string",                // Required, 1-256 characters
    "state": "string",                  // Required, 1-50 characters
    "country": "string",                // Required, 1-50 characters
    "website": "http://example.com",    // <= 256 characters
    "created_at": "2019-08-24T14:15:22Z"
  },
  "social_links": [ /* Array of SocialLink objects */ ],
  "name": "string",                     // Required, 1-100 characters
  "employees": -2147483648,            // integer or null
  "role": "string"                      // <= 50 characters
}
```

**Usage in Code**: `api.profile.enablerGet()`

**Current Implementation** (UserContext.js):
- Fetches profile on login
- Normalizes data for UI consumption
- Sets role to "enabler" if profile exists

---

##### 2. **POST** `/profile/enablerprofile/`
Create enabler profile.

**Auth**: Bearer Token Required

**Request Body**: Same structure as GET response

**Response**: 201 Created

**Usage in Code**: `api.profile.enablerCreate(body)`

---

##### 3. **PUT** `/profile/enablerprofile/`
Update entire enabler profile.

**Auth**: Bearer Token Required

**Request Body**: Same structure as GET response

**Response**: 200 OK

**Usage in Code**: `api.profile.enablerUpdate(body)`

---

##### 4. **PATCH** `/profile/enablerprofile/`
Partially update enabler profile.

**Auth**: Bearer Token Required

**Request Body**: Partial profile data

**Response**: 200 OK

**Usage in Code**: `api.profile.enablerPatch(body)`

---

#### Pathfinder Profile

##### 1. **GET** `/profile/pathfinderprofile/`
Get pathfinder profile for authenticated user.

**Auth**: Bearer Token Required

**Response**: 200 OK
```json
{
  "id": 0,
  "base_details": { /* Same as Enabler Profile */ },
  "social_links": [ /* Array of SocialLink objects */ ],
  "skills": [ /* Array of Skill objects */ ],
  "educations": [ /* Array of Education objects */ ],
  "certifications": [ /* Array of Certification objects */ ],
  "first_name": "string",              // Required, 1-50 characters
  "last_name": "string",               // Required, 1-50 characters
  "other_name": "string",              // <= 50 characters
  "title": "string",                   // <= 100 characters (e.g., Software Engineer)
  "about": "string",                   // <= 1000 characters
  "work_experience": "string",
  "languages": "string",               // <= 200 characters (e.g., English, French)
  "gmail": "user@example.com"         // <= 256 characters
}
```

**Usage in Code**: `api.profile.pathfinderGet()`

**Current Implementation** (UserContext.js):
- Fetches profile on login
- Normalizes data for UI consumption
- Sets role to "pathfinder" if profile exists

---

##### 2. **POST** `/profile/pathfinderprofile/`
Create pathfinder profile.

**Auth**: Bearer Token Required

**Request Body**: Same structure as GET response

**Response**: 201 Created

**Usage in Code**: `api.profile.pathfinderCreate(body)`

---

##### 3. **PUT** `/profile/pathfinderprofile/`
Update entire pathfinder profile.

**Auth**: Bearer Token Required

**Request Body**: Same structure as GET response

**Response**: 200 OK

**Usage in Code**: `api.profile.pathfinderUpdate(body)`

---

##### 4. **PATCH** `/profile/pathfinderprofile/`
Partially update pathfinder profile.

**Auth**: Bearer Token Required

**Request Body**: Partial profile data

**Response**: 200 OK

**Usage in Code**: `api.profile.pathfinderPatch(body)`

---

#### Profile Picture

##### 1. **GET** `/profile/profile/picture/`
Get profile picture URL.

**Auth**: Bearer Token Required

**Response**: 200 OK
```json
{
  "id": 0,
  "profile_pic": "http://example.com"
}
```

**Usage in Code**: `api.profile.pictureGet()`

---

##### 2. **PATCH** `/profile/profile/picture/`
Upload/update profile picture.

**Auth**: Bearer Token Required

**Request Body**: `multipart/form-data`
- `profile_pic`: binary (required)

**Response**: 200 OK

**Usage in Code**: `api.profile.picturePatch(formData)`

**Example**:
```javascript
const formData = new FormData();
formData.append('profile_pic', file);
await api.profile.picturePatch(formData);
```

---

### 📬 Notifications API (`/notifynotifications/`)

#### 1. **GET** `/notifynotifications/`
List all notifications for authenticated user.

**Auth**: Bearer Token Required

**Response**: 200 OK
```json
[
  {
    "id": 0,
    "title": "string",                    // Required, 1-200 characters
    "message": "string" | null,           // non-empty
    "priority": "info" | "warning" | "critical",
    "type": "system" | "server" | "personal",
    "link": "http://example.com" | null,  // <= 200 characters
    "created_at": "2019-08-24T14:15:22Z"
  }
]
```

**Usage in Code**: `api.notifications.list()`

---

#### 2. **POST** `/notifynotifications/`
Create a notification.

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "title": "string",                    // Required, 1-200 characters
  "message": "string" | null,          // non-empty
  "priority": "info" | "warning" | "critical",
  "type": "system" | "server" | "personal",
  "link": "http://example.com" | null  // <= 200 characters
}
```

**Response**: 201 Created

**Usage in Code**: `api.notifications.create(body)`

---

#### 3. **GET** `/notifynotifications/{id}/`
Get a specific notification.

**Auth**: Bearer Token Required

**Path Parameters**: `id` (integer, required)

**Response**: 200 OK

**Usage in Code**: `api.notifications.get(id)`

---

#### 4. **PUT** `/notifynotifications/{id}/`
Update a notification.

**Auth**: Bearer Token Required

**Path Parameters**: `id` (integer, required)

**Request Body**: Same as POST

**Response**: 200 OK

**Usage in Code**: `api.notifications.update(id, body)`

---

#### 5. **DELETE** `/notifynotifications/{id}/`
Delete a notification.

**Auth**: Bearer Token Required

**Path Parameters**: `id` (integer, required)

**Response**: 204 No Content

**Usage in Code**: `api.notifications.delete(id)`

---

### 📋 Applications API (`/applications/api/applications/`)

**Note**: This API exists in the backend but is NOT currently used in the frontend. Applications are stored in localStorage. This should be integrated.

#### 1. **GET** `/applications/api/applications/`
List all applications for authenticated user.

**Auth**: Bearer Token Required

**Response**: 200 OK
```json
[
  {
    "user": 0,
    "user_name": "string",
    "opportunity": 0,
    "opportunity_title": "string",
    "status": "pending" | "accepted" | "rejected",
    "applied_at": "2019-08-24T14:15:22Z",
    "reviewed_at": "2019-08-24T14:15:22Z" | null
  }
]
```

**Status Values**: `"pending"`, `"accepted"`, `"rejected"`

---

#### 2. **POST** `/applications/api/applications/`
Create a new application.

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "opportunity": 0  // Required, opportunity ID
}
```

**Response**: 201 Created

---

#### 3. **GET** `/applications/api/applications/{id}/`
Get a specific application.

**Auth**: Bearer Token Required

**Path Parameters**: `id` (integer, required)

**Response**: 200 OK

---

#### 4. **PUT** `/applications/api/applications/{id}/status/`
Update application status.

**Auth**: Bearer Token Required

**Path Parameters**: `id` (integer, required)

**Request Body**:
```json
{
  "opportunity": 0  // Required
}
```

**Response**: 200 OK

---

### 📝 Waitlist API (`/waitlist/`)

#### 1. **POST** `/waitlist/`
Add email to waitlist.

**Auth**: Bearer Token Required

**Request Body**:
```json
{
  "email": "user@example.com",  // Required, 1-254 characters
  "name": "string"              // Optional, <= 255 characters
}
```

**Response**: 201 Created

**Usage in Code**: `api.waitlist.create({ email, name })`

---

#### 2. **GET** `/waitlist/stats/`
Get waitlist statistics (Admin only).

**Auth**: Bearer Token Required

**Response**: 200 OK
```json
[
  {
    "total_signups": 0,
    "verified_signups": 0,
    "signups_today": 0,
    "signups_this_week": 0,
    "signups_this_month": 0
  }
]
```

**Usage in Code**: `api.waitlist.stats()`

---

## 🎨 Key Components & Pages

### Authentication Components

#### `RequireAuth` (`components/auth/RequireAuth.js`)
- **Purpose**: Route guard for protected routes
- **Logic**: Checks for access token, redirects to `/login` if missing
- **Usage**: Wraps protected routes in `App.js`

#### `GoogleAuthButton` (`components/auth/GoogleAuthButton.js`)
- **Purpose**: Google OAuth integration
- **Features**: Handles Google sign-in, exchanges id_token for JWT
- **Props**: `mode` ("login" | "signup"), `role`, `buttonText`, `onError`

### Core Pages

#### Pathfinder Pages

1. **PathfinderDashboard** (`pages/pathfinder/PathfinderDashboard.js`)
   - Shows welcome message
   - Displays recommended opportunities
   - Search functionality
   - Active applications count
   - Links to opportunity browsing

2. **Opportunity** (`pages/pathfinder/Opportunity.js`)
   - Lists all opportunities from API
   - Search/filter functionality
   - Save/bookmark functionality
   - Navigate to details or apply

3. **ApplyApplication** (`pages/pathfinder/ApplyApplication.js`)
   - Application form for opportunities
   - Fields: name, email, aboutMe, motivation
   - CV/resume upload
   - Custom questions support
   - **Current**: Saves to localStorage (`pathfinderApplications`)
   - **TODO**: Integrate with `/applications/api/applications/` API

4. **Bookmarks** (`pages/pathfinder/Bookmarks.js`)
   - Lists bookmarked opportunities
   - Remove bookmark functionality

#### Enabler Pages

1. **EnablerDashboard** (`pages/enabler/EnablerDashboard.js`)
   - Shows posted opportunities
   - Analytics summary (placeholder)
   - Applicants overview
   - Quick actions (Post, View Profile)

2. **CreateOpportunity** (`pages/pathfinder/CreateOpportunity.js`)
   - Multi-step form (3 steps)
   - Step 1: Title and description
   - Step 2: Requirements and benefits
   - Step 3: Work model, location, time commitment, custom questions
   - **Current**: Saves to API + localStorage
   - **API Call**: `api.bookmark.opportunitiesCreate()`

3. **Applicants** (`pages/enabler/Applicants.js`)
   - Lists applicants for a specific opportunity
   - Expandable cards with full application details
   - Download CV functionality
   - Contact pathfinder button
   - **Current**: Reads from localStorage (`pathfinderApplications`)
   - **TODO**: Integrate with `/applications/api/applications/` API

4. **OpportunitiesPosted** (`pages/enabler/OpportunitiesPosted.js`)
   - Lists all opportunities created by enabler
   - Edit/delete functionality
   - View applicants link

### Context & State Management

#### `UserContext` (`context/UserContext.js`)
- **Purpose**: Global user state management
- **Features**:
  - Fetches user profile on mount
  - Determines role (enabler/pathfinder)
  - Provides `user`, `loading`, `error` state
  - `refetchUser()` function
  - `logout()` function
- **Usage**: Wraps entire app in `App.js`

---

## 🔄 Data Flow & State Management

### Authentication Flow

1. **Login** (`pages/auth/Login.js`):
   ```
   User enters email/password
   → api.auth.token({ email, password })
   → Receive { access, refresh }
   → Store in localStorage
   → Try api.profile.enablerGet()
   → If exists: setRole('enabler')
   → Else: try api.profile.pathfinderGet()
   → If exists: setRole('pathfinder')
   → Navigate to appropriate dashboard
   ```

2. **Token Refresh** (automatic in `api.js`):
   ```
   API call returns 401
   → Check for refresh token
   → Call /auth/token/refresh/
   → Update access token
   → Retry original request
   ```

### Opportunity Flow

1. **Create Opportunity** (`CreateOpportunity.js`):
   ```
   User fills form
   → api.bookmark.opportunitiesCreate({ title, description, link, is_open })
   → Receive opportunity ID
   → Save to localStorage ('enablerOpportunities')
   → Save custom questions to localStorage
   → Navigate to dashboard
   ```

2. **Browse Opportunities** (`Opportunity.js`):
   ```
   Component mounts
   → api.bookmark.opportunitiesList()
   → Map to UI format
   → Cache in localStorage ('opportunityListCache')
   → Display list
   → User can search/filter
   ```

3. **Bookmark Opportunity** (`Opportunity.js`):
   ```
   User clicks "Save"
   → api.bookmark.opportunitiesSavedCreate({ opportunity_id })
   → Update local state (show "Saved")
   ```

### Application Flow

**Current Implementation** (localStorage only):
```
User clicks "Apply"
→ Navigate to /apply/:opportunityId
→ Fill application form
→ Upload CV (converted to base64)
→ Save to localStorage ('pathfinderApplications')
→ Show success toast
→ Navigate back
```

**TODO** (API Integration):
```
User clicks "Apply"
→ Navigate to /apply/:opportunityId
→ Fill application form
→ Upload CV (FormData)
→ POST /applications/api/applications/ { opportunity: id }
→ Show success toast
→ Navigate back
```

### Profile Management

1. **Fetch Profile** (`UserContext.js`):
   ```
   Component mounts
   → Check localStorage for role
   → If 'enabler': api.profile.enablerGet()
   → If 'pathfinder': api.profile.pathfinderGet()
   → Normalize data
   → Set user state
   ```

2. **Update Profile**:
   ```
   User edits profile
   → api.profile.enablerPatch() or api.profile.pathfinderPatch()
   → Update local state
   → Show success message
   ```

---

## 🔌 API Integration Guide

### Making API Calls

All API calls are centralized in `src/services/api.js`. Use the exported functions:

```javascript
import * as api from '../services/api';

// Authentication
const tokens = await api.auth.token({ email, password });
api.setTokens(tokens.access, tokens.refresh);

// Get opportunities
const opportunities = await api.bookmark.opportunitiesList();

// Create opportunity
const newOpp = await api.bookmark.opportunitiesCreate({
  title: "Volunteer Position",
  description: "Description here",
  link: "https://example.com",
  is_open: true
});

// Get profile
const profile = await api.profile.pathfinderGet();
```

### Error Handling

The API client automatically handles:
- Network errors
- 401 errors (token refresh)
- Error message extraction

Use `getApiErrorMessage()` for user-friendly error messages:

```javascript
import { getApiErrorMessage } from '../services/api';

try {
  await api.bookmark.opportunitiesCreate(data);
} catch (err) {
  const message = getApiErrorMessage(err);
  // Display message to user
}
```

### Request Format

- **Headers**: Automatically includes `Authorization: Bearer <token>` if token exists
- **Content-Type**: `application/json` (except for file uploads)
- **File Uploads**: Use `FormData` (Content-Type is automatically set)

### Response Format

- **Success**: Returns parsed JSON or Response object
- **Error**: Throws error with `status`, `body`, and `message` properties

---

## 📝 Important Notes

### Current State vs. API

1. **Applications**: Currently stored in localStorage only. Need to integrate with `/applications/api/applications/` API.

2. **Opportunities**: 
   - Created via API (`api.bookmark.opportunitiesCreate()`)
   - Also saved to localStorage for offline access
   - Fetched from API (`api.bookmark.opportunitiesList()`)

3. **Bookmarks**: 
   - Saved via API (`api.bookmark.opportunitiesSavedCreate()`)
   - Fetched via API (`api.bookmark.list()`)

### localStorage Keys Used

- `afrivate_access`: Access token
- `afrivate_refresh`: Refresh token
- `afrivate_role`: User role ("enabler" | "pathfinder")
- `enablerOpportunities`: Array of opportunities created by enabler
- `opportunityListCache`: Cached list of opportunities from API
- `opportunityCustomQuestions`: Map of opportunity ID to custom questions
- `pathfinderApplications`: Array of applications submitted by pathfinder
- `bookmarkedJobs`: Array of bookmarked opportunity IDs
- `bookmarkedJobsData`: Array of full bookmarked opportunity objects
- `userProfile`: User profile data (legacy)
- `enablerProfile`: Enabler profile data (legacy)

### Environment Variables

- `REACT_APP_API_BASE_URL`: Override base URL (default: Railway production URL)
- `REACT_APP_API_PREFIX`: Override API prefix (default: "/api")
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID

---

## 🚀 Next Steps for API Integration

1. **Applications API Integration**:
   - Replace localStorage application storage with API calls
   - Implement `POST /applications/api/applications/` in `ApplyApplication.js`
   - Implement `GET /applications/api/applications/` in `Applicants.js`
   - Add status update functionality (`PUT /applications/api/applications/{id}/status/`)

2. **Opportunities API Enhancement**:
   - Add update/delete endpoints (`PUT`, `PATCH`, `DELETE /bookmark/opportunities/{id}/`)
   - Implement `GET /bookmark/opportunities/mine/` for enabler's own opportunities

3. **Notifications Integration**:
   - Display notifications in UI
   - Mark as read functionality
   - Real-time updates (WebSocket or polling)

4. **Error Handling Improvements**:
   - Better error messages for specific error codes
   - Retry logic for network failures
   - Offline mode support

---

## 📞 Support & Resources

- **API Base URL**: `https://afrivate-backend-production.up.railway.app`
- **API Documentation**: Available at `/docs/` endpoint
- **Frontend Codebase**: React application in `src/` directory
- **API Client**: `src/services/api.js`

---

**Last Updated**: February 20, 2026
**Documentation Version**: 1.0
