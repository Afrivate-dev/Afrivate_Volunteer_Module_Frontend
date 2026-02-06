# Routes That Use localStorage (with Real Placeholder Data)

The app seeds **localStorage** with realistic placeholder data on first load so you can test every feature. Each route below uses at least one localStorage key.

**Backend API:** For production API calls, see **`API_DOCS.md`** (full endpoint reference) and **`src/services/api.js`** (auth, bookmark, profile, notifications, waitlist). **`ROUTES_API_REQUIREMENTS.md`** maps routes to API vs localStorage.

---

## How to access this data on the website

1. **Start the app** (e.g. `npm start`) and open the site (e.g. `http://localhost:3000`). The seed runs automatically on first load.
2. **Pathfinder (volunteer) data:**
   - Open **Bookmarks**: go to **`/bookmarks`** (or use the sidebar: Volunteering → Bookmarks, or pathfinder nav). You’ll see 2 seeded bookmarks.
   - Open **Pathfinder profile**: go to **`/edit-new-profile`** to see/edit the seeded profile (Amina Okonkwo).
   - Open **Opportunity details**: go to **`/opportunity`** → click **Apply** on any row, or go to **`/bookmarks`** → **View Details** on a bookmark, or from the **Landing** page click **View Details** on a Featured Opportunity.
3. **Enabler data:**
   - Open **Enabler dashboard**: go to **`/enabler/dashboard`**. The “Your Opportunities” section shows the seeded opportunities.
   - Open **Opportunities posted**: go to **`/enabler/opportunities-posted`** to see all 5 seeded opportunities (view, delete, clear).
   - Open **Single opportunity**: go to **`/enabler/opportunity/opp-1`** (or `opp-2`, `opp-3`, `opp-4`, `opp-5`).
   - Open **Enabler profile**: go to **`/enabler/profile-setup`** to see/edit the seeded enabler profile.
   - Open **Pathfinder profile (enabler view)**: go to **`/enabler/pathfinder/1`** (or 2–5) to see bookmark toggle (pathfinders 1 and 2 are pre-bookmarked).
4. **Using the UI:** Use the **sidebar** (hamburger) and **nav links** on Landing, Pathfinder landing, and Enabler landing to reach these pages; all relevant buttons and links point to the routes below.

**To re-seed:** In DevTools → Application → Local Storage → clear all for your origin, then refresh the page.

---

## Pathfinder (Volunteer) Routes

| Route | What to test | localStorage keys |
|-------|----------------|-------------------|
| **`/edit-new-profile`** | Pathfinder profile form: view/edit and save. Seeded profile: Amina Okonkwo, Lagos, skills, education, certifications. | `userProfile`, `hasCompletedProfile` |
| **`/bookmarks`** | List of bookmarked opportunities. Seeded: 2 bookmarks (Community Health Volunteer, Digital Literacy Trainer). Remove bookmark, open View Details. | `bookmarkedJobsData`, `bookmarkedJobs` |
| **`/volunteer-details`** | Single opportunity detail + bookmark toggle. Open from Opportunity, Bookmarks, or Landing (View Details). Bookmark/unbookmark and see it reflect on `/bookmarks`. | `bookmarkedJobs`, `bookmarkedJobsData` |
| **`/opportunity`** | Browse opportunities list. Click Apply to open volunteer-details with that job; bookmark from there and check `/bookmarks`. | (writes to bookmarks when you bookmark) |
| **`/pathf`** | Pathfinder dashboard. Works best after completing profile (or with seeded `hasCompletedProfile`). | (reads `userProfile` / `hasCompletedProfile` if used) |

**Direct URLs (Pathfinder):**
- Pathfinder profile setup: `#/edit-new-profile`
- Bookmarks: `#/bookmarks`
- Volunteer (opportunity) details: `#/volunteer-details` (or navigate from Opportunity/Bookmarks/Landing with a job in state)
- Opportunities list: `#/opportunity`
- Pathfinder dashboard: `#/pathf`

---

## Enabler Routes

| Route | What to test | localStorage keys |
|-------|----------------|-------------------|
| **`/enabler/profile-setup`** | Enabler onboarding form. Seeded profile: Somadina Nwosu, Nigeria, website, employees, role. Complete steps and save. | `enablerProfile`, `hasCompletedEnablerProfile` |
| **`/enabler/dashboard`** | Enabler dashboard. “Your Opportunities” shows up to 4 from localStorage; View details / View all. | `enablerOpportunities` |
| **`/enabler/opportunities-posted`** | List of posted opportunities. Seeded: 5 real-life opportunities (Community Health, Youth Mentorship, Digital Literacy, Environmental Education, Grant Writing). View, delete, clear all. | `enablerOpportunities` |
| **`/enabler/opportunity/:id`** | Single opportunity view/edit. Open from dashboard or opportunities-posted. Seeded IDs: `opp-1` … `opp-5`. | `enablerOpportunities` |
| **`/create-opportunity`** | Create a new opportunity. Fill steps 1–3 and Post; it appears on dashboard and opportunities-posted. | `enablerOpportunities` |
| **`/enabler/pathfinder/:id`** | View pathfinder profile (enabler view). Bookmark toggle. Seeded bookmarks for pathfinders 1 and 2. | `bookmarkedPathfinders` |
| **`/enabler/contact/:id`** | Contact a pathfinder. Shows pathfinder details and a form (subject, message). Messages saved to localStorage. | `enablerContactMessages` |
| **`/enabler/profile`** | View enabler (company) profile. Data loaded from `enablerProfile` (name, bio, location, website, etc.). Edit Profile goes to edit-profile. | `enablerProfile` |
| **`/enabler/edit-opportunity/:id`** | Edit an opportunity. Loads by id from `enablerOpportunities`, edit title/description/requirements/work model/location/time commitment, save back. | `enablerOpportunities` |
| **`/enabler/bookmarked-pathfinders`** | List of bookmarked pathfinders. View Profile, Contact, Remove bookmark. In enabler sidebar as “Bookmarked Pathfinders”. | `bookmarkedPathfinders` |
| **`/enabler/settings`** | Enabler settings. Loads from `enablerProfile`. Edit Photo (upload → data URL stored), personal info, Save Changes persists to localStorage. | `enablerProfile` |

**Direct URLs (Enabler):**
- Enabler profile setup: `#/enabler/profile-setup`
- Enabler profile (view): `#/enabler/profile`
- Enabler dashboard: `#/enabler/dashboard`
- Opportunities posted: `#/enabler/opportunities-posted`
- Single opportunity: `#/enabler/opportunity/opp-1` (or `opp-2`, `opp-3`, `opp-4`, `opp-5`)
- Edit opportunity: `#/enabler/edit-opportunity/opp-1` (or any opp id)
- Create opportunity: `#/create-opportunity`
- Pathfinder profile (enabler): `#/enabler/pathfinder/1` (or `2`, `3`, `4`, `5`)
- Contact pathfinder: `#/enabler/contact/1` (or any pathfinder id)
- Bookmarked pathfinders: `#/enabler/bookmarked-pathfinders`
- Enabler settings: `#/enabler/settings`

---

## Seeded Placeholder Data Summary

| Key | Content |
|-----|---------|
| **enablerOpportunities** | 5 opportunities: Community Health Volunteer (Lagos), Youth Mentorship Coordinator (Nairobi), Digital Literacy Trainer (Accra), Environmental Education (Cape Town), Grant Writing Support (Tanzania, remote). |
| **bookmarkedJobsData** / **bookmarkedJobs** | 2 bookmarked opportunities: Community Health Volunteer, Digital Literacy Trainer. |
| **userProfile** / **hasCompletedProfile** | Pathfinder profile: Amina Okonkwo, Community Development Volunteer, Lagos, skills, education, certifications. |
| **enablerProfile** / **hasCompletedEnablerProfile** | Enabler profile: Somadina Nwosu, Programme Manager, Nigeria, website, employees, role. |
| **bookmarkedPathfinders** | Pathfinder IDs `1` and `2` bookmarked (for enabler pathfinder view). |
| **enablerContactMessages** | Created when you use Contact Pathfinder; array of `{ pathfinderId, pathfinderName, subject, message, createdAt }`. |

---

## Quick Test Order

1. **Pathfinder flow:** `#/bookmarks` → see 2 bookmarks → View Details → toggle bookmark → back to `#/bookmarks`. Then `#/opportunity` → Apply → volunteer-details → bookmark. Then `#/edit-new-profile` → see/edit seeded profile → Save.
2. **Enabler flow:** `#/enabler/dashboard` → Your Opportunities (up to 4) → View details. Then `#/enabler/opportunities-posted` → view/delete/clear. Then `#/create-opportunity` → post new → check dashboard and opportunities-posted. Then `#/enabler/pathfinder/1` → toggle bookmark.

All routes above use **localStorage only** (no backend). For login/signup and API-backed routes, see `ROUTES_API_REQUIREMENTS.md`.

---

## All routes & link reference (buttons and links go to the right place)

Every button and link has been checked to point to a valid route or action.

| From page | Button / link | Goes to |
|-----------|----------------|---------|
| **Landing** | Volunteering (nav) | `/opportunity` |
| **Landing** | Contact us | `/community` |
| **Landing** | About us | `/road` |
| **Landing** | Sign up (nav) | `/login` (sidebar label) |
| **Landing** | Sidebar: Volunteering | `/opportunity` |
| **Landing** | Sidebar: Dashboard | `/pathf` |
| **Landing** | Sidebar: Contact Us, About Us | `/community`, `/road` |
| **Landing** | Sidebar: Bookmarks, Settings | `/bookmarks`, `/pathf` |
| **Landing** | Hero Sign Up | `/signup` |
| **Landing** | Create Account (CTA) | `/signup` |
| **Landing** | Featured Opportunity View Details | `/volunteer-details` (with job state) |
| **Landing** | Footer: Home, About Us, Contact Us | `/`, `/road`, `/community` |
| **LandingPathfinder** | Dashboard, Volunteering, About Us | `/pathf`, `/opportunity`, `/road` |
| **LandingPathfinder** | Sidebar: Volunteering, Dashboard, Bookmarks, Settings | `/opportunity`, `/pathf`, `/bookmarks`, `/pathf` |
| **LandingPathfinder** | Find Opportunities | `/opportunity` |
| **Landingenabler** | Volunteering, Contact us, About us | `/enabler/opportunities-posted`, `/community`, `/road` |
| **Landingenabler** | Sidebar: Dashboard, Bookmarks, Settings | `/enabler/dashboard`, `/enabler/recommendations`, `/enabler/settings` |
| **Landingenabler** | Post an Opportunity (both CTAs) | `/create-opportunity` |
| **Pathfinder Navbar** (sidebar) | Home, Dashboard, Bookmarks, Community, Learning, Wallet, Settings, AI Assistant, Log in | `/`, `/pathf`, `/bookmarks`, `/community`, `/road`, `/pathf`, `/pathf`, `/discover`, `/login` |
| **Dash-freelance** (pathfinder) | Home, Community, Learning, Wallet, Settings, AI Assistant, Log in | `/`, `/community`, `/road`, `/pathf`, `/pathf`, `/discover`, `/login` |
| **Enabler Navbar** | Profile, Dashboard, Recommendations, Opportunities Posted, Bookmarked Pathfinders, Settings, Post | `/enabler/profile`, `/enabler/dashboard`, `/enabler/recommendations`, `/enabler/opportunities-posted`, `/enabler/bookmarked-pathfinders`, `/enabler/settings`, `/create-opportunity` |
| **Bookmarks** | View Details, Remove, Browse Opportunities | `/volunteer-details` (with job), remove bookmark, `/opportunity` |
| **Opportunity** | Apply | `/volunteer-details` (with job state) |
| **VolunteerDetails** | Back, Apply, Bookmark, View Company Profile | `navigate(-1)`, (placeholder), toggle bookmark, `/` |
| **Enabler Dashboard** | Post, View Profile, View details, View all | `/create-opportunity`, `/enabler/profile`, `/enabler/opportunity/:id`, `/enabler/opportunities-posted` |
| **Enabler Opportunities Posted** | Create Your First Opportunity, View, Delete | `/create-opportunity`, `/enabler/opportunity/:id`, delete modal |
| **Enabler Opportunity Details** | Back, Edit | `navigate(-1)`, `/enabler/edit-opportunity/:id` |
| **Enabler Edit Opportunity** | Cancel, Save changes | `/enabler/opportunity/:id`, save to localStorage then redirect |
| **Enabler Contact Pathfinder** | Back, Send message | `navigate(-1)`, save to `enablerContactMessages` |
| **Enabler Bookmarked Pathfinders** | View Profile, Contact, Remove, Browse Recommendations | `/enabler/pathfinder/:id`, `/enabler/contact/:id`, remove from list, `/enabler/recommendations` |
| **Enabler Settings** | Edit Photo, Save Changes, Cancel | file upload → profile picture in localStorage, save form to `enablerProfile`, `navigate(-1)` |
| **Enabler Profile Setup** | Proceed (step 3) | `/enabler/dashboard` |
| **EditNewProfile** | Save | `/pathf` |
| **PathfinderProfile** (enabler) | Contact, Bookmark | `/enabler/contact/:id`, toggle bookmark |
| **Recommendations** | View Profile, Contact | `/enabler/pathfinder/:id`, `/enabler/contact/:id` |
| **Applicants** | Back, View Profile, Contact | `navigate(-1)`, `/enabler/pathfinder/:id`, `/enabler/contact/:id` |

*Wallet and Settings (pathfinder) currently go to `/pathf` until dedicated pages exist. Social footer links use `#` (placeholders).*
