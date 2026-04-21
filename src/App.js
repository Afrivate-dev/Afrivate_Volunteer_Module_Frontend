import React, { useEffect, Component } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CookieConsent from './components/CookieConsent';
import { getConsent } from './utils/cookieConsent';
import { loadGtagScript } from './utils/gtag';
import { UserProvider, useUser } from './context/UserContext';
import Navbar from './components/auth/Navbar';
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
import Pathf from './pages/pathfinder/PathfinderDashboard';
import VolunteerDetails from './pages/pathfinder/VolunteerDetails';
import MyApplications from './pages/pathfinder/MyApplications';
import OrganizationProfile from './pages/pathfinder/OrganizationProfile';
import ApplyApplication from './pages/pathfinder/ApplyApplication';
import Bookmarks from './pages/pathfinder/Bookmarks';
import EditNewProfile from './pages/pathfinder/EditNewProfile';
import AvailableOpportunities from './pages/pathfinder/AvailableOpportunities';
import EnablerProfileView from './pages/pathfinder/EnablerProfileView';
import Road from './pages/Roadmap';
import KYCForm from './components/forms/KYCForm';
import DeepPayInfo from './pages/DeepPayInfo';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Notifications from './pages/Notifications';
// eslint-disable-next-line no-unused-vars -- used in Route element
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import PathfinderSettings from './pages/pathfinder/PathfinderSettings';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-sans">
          <h1 className="text-4xl font-bold text-[#6A00B1] mb-4">Something went wrong</h1>
          <p className="text-gray-500 mb-8 text-center">An unexpected error occurred. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RoleRedirect({ pathfinder, enabler }) {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }
  const role = (user?.role || '').toLowerCase();
  if (role === 'pathfinder') return <Navigate to={pathfinder} replace />;
  if (role === 'enabler') return <Navigate to={enabler} replace />;
  return <Navigate to="/" replace />;
}

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
    <ErrorBoundary>
    <UserProvider>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landingpathfinder" element={<LandingPathfinder />} />
          <Route path="/landingenabler" element={<Landingenabler />} />
          <Route path="/dashf" element={<RequireAuth role="pathfinder"><Pathf /></RequireAuth>} />
          <Route path="/enabler/dashboard" element={<RequireAuth role="enabler"><EnablerDashboard /></RequireAuth>} />
          <Route path="/emppro" element={<Navigate to="/enabler/dashboard" replace />} />
          <Route path="/dash-employer" element={<Navigate to="/enabler/dashboard" replace />} />
          <Route path="/dash-freelance" element={<Navigate to="/pathf" replace />} />
          <Route path="/opportunity" element={<Navigate to="/available-opportunities" replace />} />
          <Route path="/volunteer-details" element={<VolunteerDetails />} />
          <Route path="/my-applications" element={<RequireAuth role="pathfinder"><MyApplications /></RequireAuth>} />
          <Route path="/organization/:id" element={<OrganizationProfile />} />
          <Route path="/apply/:opportunityId" element={<RequireAuth role="pathfinder"><ApplyApplication /></RequireAuth>} />
          <Route path="/bookmarks" element={<RequireAuth role="pathfinder"><Bookmarks /></RequireAuth>} />
          <Route path="/available-opportunities" element={<RequireAuth role="pathfinder"><AvailableOpportunities /></RequireAuth>} />
          <Route path="/enabler-profile/:id" element={<RequireAuth role="pathfinder"><EnablerProfileView /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth role="pathfinder"><EditNewProfile /></RequireAuth>} />
          <Route path="/pathfinder/profile-setup" element={<RequireAuth role="pathfinder"><EditNewProfile /></RequireAuth>} />
          <Route path="/pathf" element={<RequireAuth role="pathfinder"><Pathf /></RequireAuth>} />
          <Route path="/road" element={<Road />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/deep-pay-info" element={<DeepPayInfo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/create-opportunity" element={<RequireAuth role="enabler"><CreateOpportunity /></RequireAuth>} />
          <Route path="/enabler/recommendations" element={<RequireAuth role="enabler"><Recommendations /></RequireAuth>} />
          <Route path="/enabler/profile" element={<RequireAuth role="enabler"><EnablerProfile /></RequireAuth>} />
          <Route path="/enabler/edit-profile" element={<RequireAuth role="enabler"><EditProfile /></RequireAuth>} />
          <Route path="/enabler/opportunity/:id" element={<RequireAuth role="enabler"><OpportunityDetails /></RequireAuth>} />
          <Route path="/enabler/edit-opportunity/:id" element={<RequireAuth role="enabler"><EditOpportunity /></RequireAuth>} />
          <Route path="/enabler/opportunities-posted" element={<RequireAuth role="enabler"><OpportunitiesPosted /></RequireAuth>} />
          <Route path="/enabler/settings" element={<RequireAuth role="enabler"><Settings /></RequireAuth>} />
          <Route path="/pathfinder/settings" element={<RequireAuth role="pathfinder"><PathfinderSettings /></RequireAuth>} />
          <Route path="/enabler/pathfinder/:id" element={<RequireAuth role="enabler"><PathfinderProfile /></RequireAuth>} />
          <Route path="/enabler/contact/:id" element={<RequireAuth role="enabler"><ContactPathfinder /></RequireAuth>} />
          <Route path="/enabler/bookmarked-pathfinders" element={<RequireAuth role="enabler"><EnablerPathfinderBookmarks /></RequireAuth>} />
          <Route path="/enabler/applicants/:id" element={<RequireAuth role="enabler"><Applicants /></RequireAuth>} />
          <Route path="/enabler/profile-setup" element={<RequireAuth role="enabler"><EnablerProfileSetup /></RequireAuth>} />

          {/* Legacy redirects */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <RoleRedirect pathfinder="/pathf" enabler="/enabler/dashboard" />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <RoleRedirect pathfinder="/profile" enabler="/enabler/profile" />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </div>
    </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
