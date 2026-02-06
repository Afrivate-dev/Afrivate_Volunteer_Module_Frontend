import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import CookieConsent from './components/CookieConsent';
import { getConsent } from './utils/cookieConsent';
import { loadGtagScript } from './utils/gtag';
import { UserProvider } from './context/UserContext';
import Navbar from './components/layout/Navbar';
import RequireAuth from './components/auth/RequireAuth';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import CreateOpportunity from './pages/enabler/CreateOpportunity';
import Recommendations from './pages/enabler/Recommendations';
import EnablerProfile from './pages/enabler/EnablerProfile';
import OpportunityDetails from './pages/enabler/OpportunityDetails';
import EditOpportunity from './pages/enabler/EditOpportunity';
import EditProfile from './pages/enabler/EditProfile';
import OpportunitiesPosted from './pages/enabler/OpportunitiesPosted';
import Settings from './pages/enabler/Settings';
import PathfinderProfile from './pages/enabler/PathfinderProfile';
import ContactPathfinder from './pages/enabler/ContactPathfinder';
import Applicants from './pages/enabler/Applicants';
import EnablerProfileSetup from './pages/enabler/EnablerProfileSetup';
import EnablerPathfinderBookmarks from './pages/enabler/EnablerPathfinderBookmarks';
import Landing from './pages/Landing';
import LandingPathfinder from './pages/LandingPathfinder';
import Landingenabler from './pages/Landingenabler';
import EnablerDashboard from './pages/enabler/EnablerDashboard';
import Emppro from './pages/emppro';
import DashEmployer from './pages/Dash-employer';
import DashFreelance from './pages/Dash-freelance';
import Opportunity from './pages/pathfinder/Opportunity';
import Pathf from './pages/pathfinder/PathfinderDashboard';
import VolunteerDetails from './pages/pathfinder/VolunteerDetails';
import ApplyApplication from './pages/pathfinder/ApplyApplication';
import Bookmarks from './pages/pathfinder/Bookmarks';
import EditNewProfile from './pages/pathfinder/EditNewProfile';
import Road from './pages/Roadmap';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import KYCForm from './components/forms/KYCForm';
import DeepPayInfo from './pages/DeepPayInfo';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
// eslint-disable-next-line no-unused-vars -- used in Route element
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  const location = useLocation();

  useEffect(() => {
    const consent = getConsent();
    if (consent && consent.analytics && typeof window.gtag !== 'function') {
      loadGtagScript();
    }
  }, []);

  useEffect(() => {
    const consent = getConsent();
    if (consent && consent.analytics && typeof window.gtag === 'function') {
      window.gtag('config', 'G-XDX60DZTG4', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location.pathname, location.search]);

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landingpathfinder" element={<LandingPathfinder />} />
          <Route path="/landingenabler" element={<Landingenabler />} />
          <Route path="/dashf" element={<RequireAuth><Pathf /></RequireAuth>} />
          <Route path="/enabler/dashboard" element={<RequireAuth><EnablerDashboard /></RequireAuth>} />
          <Route path="/emppro" element={<RequireAuth><Emppro /></RequireAuth>} />
          <Route path="/dash-employer" element={<RequireAuth><DashEmployer /></RequireAuth>} />
          <Route path="/dash-freelance" element={<RequireAuth><DashFreelance /></RequireAuth>} />
          <Route path="/opportunity" element={<Opportunity />} />
          <Route path="/volunteer-details" element={<VolunteerDetails />} />
          <Route path="/apply/:opportunityId" element={<RequireAuth><ApplyApplication /></RequireAuth>} />
          <Route path="/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
          <Route path="/edit-new-profile" element={<RequireAuth><EditNewProfile /></RequireAuth>} />
          <Route path="/pathf" element={<RequireAuth><Pathf /></RequireAuth>} />
          <Route path="/road" element={<Road />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/deep-pay-info" element={<DeepPayInfo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/create-opportunity" element={<RequireAuth><CreateOpportunity /></RequireAuth>} />
          <Route path="/enabler/recommendations" element={<RequireAuth><Recommendations /></RequireAuth>} />
          <Route path="/enabler/profile" element={<RequireAuth><EnablerProfile /></RequireAuth>} />
          <Route path="/enabler/edit-profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/enabler/opportunity/:id" element={<RequireAuth><OpportunityDetails /></RequireAuth>} />
          <Route path="/enabler/edit-opportunity/:id" element={<RequireAuth><EditOpportunity /></RequireAuth>} />
          <Route path="/enabler/opportunities-posted" element={<RequireAuth><OpportunitiesPosted /></RequireAuth>} />
          <Route path="/enabler/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/enabler/pathfinder/:id" element={<RequireAuth><PathfinderProfile /></RequireAuth>} />
          <Route path="/enabler/contact/:id" element={<RequireAuth><ContactPathfinder /></RequireAuth>} />
          <Route path="/enabler/bookmarked-pathfinders" element={<RequireAuth><EnablerPathfinderBookmarks /></RequireAuth>} />
          <Route path="/enabler/applicants/:id" element={<RequireAuth><Applicants /></RequireAuth>} />
          <Route path="/enabler/profile-setup" element={<RequireAuth><EnablerProfileSetup /></RequireAuth>} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Navbar />
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Navbar />
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/kyc"
            element={
              <RequireAuth>
                <Navbar />
                <KYCForm />
              </RequireAuth>
            }
          />
        </Routes>
        <CookieConsent />
      </div>
    </UserProvider>
  );
}

export default App;
