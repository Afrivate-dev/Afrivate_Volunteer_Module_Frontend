# Afrivate Application Routes

## Public Landing Pages
- `/` - Main Landing Page (`Landing.js`)
- `/landingpathfinder` - Pathfinder Landing Page (`LandingPathfinder.js`)
- `/landingenabler` - Enabler Landing Page (`Landingenabler.js`)

## Authentication Routes
- `/login` - Login Page (`Login.js`)
- `/signup` - Sign Up Page (`SignUp.js`)
- `/forgot-password` - Forgot Password Page (`ForgotPassword.js`)
- `/verify-otp` - Verify OTP Page (`VerifyOTP.js`)
- `/reset-password` - Reset Password Page (`ResetPassword.js`)

## Pathfinder Routes
- `/pathf` - Pathfinder Dashboard (`PathfinderDashboard.js`)
- `/opportunity` - Opportunity Page (`Opportunity.js`)
- `/volunteer-details` - Volunteer Details Page (`VolunteerDetails.js`)
- `/bookmarks` - Bookmarks Page (`Bookmarks.js`)
- `/edit-new-profile` - Edit New Profile Page (`EditNewProfile.js`)

## Enabler Routes
- `/enabler/dashboard` - Enabler Dashboard (`EnablerDashboard.js`)
- `/create-opportunity` - Create Opportunity Page (`CreateOpportunity.js`)
- `/enabler/recommendations` - Recommendations Page (`Recommendations.js`)
- `/enabler/profile` - Enabler Profile Page (`EnablerProfile.js`)
- `/enabler/edit-profile` - Edit Profile Page (`EditProfile.js`)
- `/enabler/opportunity/:id` - Opportunity Details Page (`OpportunityDetails.js`)
- `/enabler/edit-opportunity/:id` - Edit Opportunity Page (`EditOpportunity.js`)
- `/enabler/opportunities-posted` - Opportunities Posted Page (`OpportunitiesPosted.js`)
- `/enabler/settings` - Settings Page (`Settings.js`)
- `/enabler/pathfinder/:id` - Pathfinder Profile View (`PathfinderProfile.js`)
- `/enabler/contact/:id` - Contact Pathfinder Page (`ContactPathfinder.js`)
- `/enabler/applicants/:id` - Applicants Page (`Applicants.js`)
- `/enabler/profile-setup` - Enabler Profile Setup Page (`EnablerProfileSetup.js`)

## Other Routes
- `/emppro` - Employer Profile Page (`emppro.js`)
- `/road` - Roadmap Page (`Roadmap.js`)
- `/deep-pay-info` - Deep Pay Info (`DeepPayInfo.js`)
- `/about` - About Us (`AboutUs.js`)
- `/contact` - Contact Us (`ContactUs.js`)
- `/privacy` - Privacy Policy (`PrivacyPolicy.js`)

## Orphan Pages (No Routes – Unreachable)
These files exist but have no route in App.js:
- `Dash-employer.js` - Alternate employer dashboard
- `Dash-freelance.js` - Alternate freelance dashboard (note: `/dashf` maps to PathfinderDashboard)
- `Community.js` - Community page
- `subm.js` - Submission page
- `Register.js` - Duplicate of SignUp; use `/signup` instead

## Protected Routes (with Navbar)
- `/dashboard` - Main Dashboard (`Dashboard.js`) - Includes Navbar
- `/profile` - Profile Page (`Profile.js`) - Includes Navbar
- `/kyc` - KYC Form (`KYCForm.js`) - Includes Navbar

---

## Route Summary by Category

### Total Routes: 33

**Landing Pages:** 3 routes
**Authentication:** 5 routes
**Pathfinder:** 5 routes
**Enabler:** 12 routes
**Other:** 6 routes (emppro, road, deep-pay-info, about, contact, privacy)
**Protected:** 3 routes

---

## Notes
- All routes use React Router v6 (HashRouter)
- Protected routes (`/dashboard`, `/profile`, `/kyc`) include the Navbar component
- Dynamic routes use `:id` parameter (e.g., `/enabler/opportunity/:id`)
- The main landing page is at `/` (root route)
