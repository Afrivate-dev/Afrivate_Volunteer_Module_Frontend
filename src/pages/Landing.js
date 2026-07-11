import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  Rocket,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Lightbulb,
  Zap,
  Globe,
  Trophy,
  MapPin,
  Menu,
  X,
  ShieldCheck,
  Phone,
  Info
} from 'lucide-react';

// Local asset paths
import logoImg from '../Assets/afrivate-logo.svg';
import phone from '../Assets/phone.png';
import work from '../Assets/grok-video-c21e1147-f3e2-4f09-8f81-a2f331dfa3e0 1.png';
import work2 from '../Assets/grok-video-8e5d6500-b97c-46c4-b804-b4a643565470 2.png';
import work3 from '../Assets/grok-video-90f255da-353b-4aad-a543-dbad3a8ca126 1.png';
import africaMap from '../Assets/africa-network.png';
import how from '../Assets/How It Works.png';


// --- CUSTOM INLINE SVG BRAND ICONS TO PREVENT COMPILER CONFLICTS ---
const XTwitterIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const categories = [
  { label: "Volunteering", icon: HeartHandshake },
  { label: "Internships", icon: Briefcase },
  { label: "Mentorship", icon: Lightbulb },
  { label: "Micro-tasks", icon: Zap },
  { label: "Remote Work", icon: Globe },
  { label: "Leadership", icon: Trophy },
];

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      sessionStorage.setItem('discoverQuery', searchQuery.trim());
    }
    navigate('/opportunity');
  };

  const jobs = [
    { id: 'landing-1', title: "CORPSAFRICA Volunteer Program", company: "MSME Africa", location: "Multiple African Countries", type: "Volunteering", button: "View Details", image: work },
    { id: 'landing-2', title: "Nest Africa AI Innovation Lab", company: "MSME Africa", location: "Remote / Hybrid", type: "Volunteering", button: "View Details", image: work2 },
    { id: 'landing-3', title: "Content Writer – African Tech", company: "TechCabal", location: "Remote", type: "Volunteering", button: "View Details", image: work3 },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FB] text-[#333333] font-sans antialiased relative">
      
      {/* FIXED NAVIGATION BAR (Always floating at the top of the viewport) */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[min(1100px,94%)] font-montserrat">
        <div className="flex items-center justify-between rounded-full bg-white/95 backdrop-blur-md px-5 py-3 md:py-4 shadow-[0_4px_24px_rgba(132,58,127,0.06)] border border-white/40">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="AfriVate Logo" className="h-8 md:h-9 lg:h-10 w-auto object-contain" />
          </Link>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#843A7F]">
            <Link to="/opportunity" className="hover:opacity-75 transition-all">Volunteering</Link>
            <Link to="/contact" className="hover:opacity-75 transition-all">Contact us</Link>
            <Link to="/about" className="hover:opacity-75 transition-all">About us</Link>
          </nav>

          {/* Sign Up Button Only */}
          <div className="hidden lg:flex items-center">
            <Link to="/signup">
              <button className="bg-[#843A7F] text-white py-2.5 px-6 rounded-full text-sm font-semibold hover:bg-[#6f3069] transition shadow-[0_4px_14px_rgba(132,58,127,0.15)]">
                Sign up
              </button>
            </Link>
          </div>

          {/* Responsive Menu Icon */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-[#843A7F] hover:bg-[#843A7F]/10 rounded-full transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* RE-DESIGNED INTERACTIVE MOBILE NAV OVERLAY DRAWER */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-[310px] max-w-[85vw] bg-white/95 backdrop-blur-xl border-l border-gray-100 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col justify-between p-6 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-100/80 pb-6 pt-4">
            <div className="flex items-center">
              <img src={logoImg} alt="AfriVate Logo" className="h-8 w-auto object-contain" />
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 rounded-full bg-[#F4E0F1] text-[#843A7F] hover:bg-[#843A7F] hover:text-white transition duration-200"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Premium Interactive Link Navigation Grid */}
          <div className="flex flex-col gap-2 mt-8">
            <Link
              to="/opportunity"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold border-l-4 border-transparent hover:border-[#843A7F] hover:bg-[#F4E0F1]/50 hover:text-[#843A7F] transition duration-200"
            >
              <HeartHandshake size={18} className="text-[#843A7F]/80" />
              Volunteering
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold border-l-4 border-transparent hover:border-[#843A7F] hover:bg-[#F4E0F1]/50 hover:text-[#843A7F] transition duration-200"
            >
              <Phone size={18} className="text-[#843A7F]/80" />
              Contact us
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold border-l-4 border-transparent hover:border-[#843A7F] hover:bg-[#F4E0F1]/50 hover:text-[#843A7F] transition duration-200"
            >
              <Info size={18} className="text-[#843A7F]/80" />
              About us
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold border-l-4 border-transparent hover:border-[#843A7F] hover:bg-[#F4E0F1]/50 hover:text-[#843A7F] transition duration-200"
            >
              <ShieldCheck size={18} className="text-[#843A7F]/80" />
              Login
            </Link>
          </div>
        </div>

        {/* Mobile Drawer Footer Actions */}
        <div className="flex flex-col gap-6 border-t border-gray-100 pt-6 mb-4">
          <Link
            to="/signup"
            onClick={() => setIsMenuOpen(false)}
            className="w-full text-center py-3.5 rounded-full bg-[#843A7F] text-white font-bold shadow-[0_6px_18px_rgba(132,58,127,0.2)] hover:bg-[#6f3069] transition"
          >
            Sign Up
          </Link>
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4 text-[#843A7F]">
              <a href="https://x.com/Afrivate_tech" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition"><XTwitterIcon size={14} /></a>
              <a href="https://www.linkedin.com/company/afrivate/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition"><LinkedinIcon size={14} /></a>
              <a href="https://www.instagram.com/afrivate_tech" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition"><InstagramIcon size={14} /></a>
            </div>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Elevating Life in Africa</span>
          </div>
        </div>
      </div>

      {/* HERO GRID SECTION WITH BACKGROUND PATTERN */}
      <div className="relative w-full border-b border-gray-100 pb-16 md:pb-24 overflow-hidden pt-[124px]">
        
        {/* Soft layout purple/pink glow blobs behind the grid */}
        <div className="pointer-events-none absolute -left-10 top-20 h-72 w-72 rounded-full bg-[#C58BC0]/20 blur-3xl z-0" />
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-[#E2B6DD]/30 blur-3xl z-0" />
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-[#D9A8D3]/20 blur-3xl z-0" />

        {/* Localized Grid Lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(#EADFE9 1px, transparent 1px), linear-gradient(90deg, #EADFE9 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* HERO CONTENT AREA */}
        <div className="relative mx-auto w-[min(1100px,94%)] text-center pt-16 z-10">
          
          <div className="relative inline-block max-w-4xl mx-auto">
            {/* Left Innovation Floating Chip */}
            <div className="hidden md:flex absolute -left-28 top-8 items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-[0_4px_20px_rgba(132,58,127,0.06)] border border-gray-100">
              <span className="text-[#843A7F]"><Rocket size={15} /></span>
              <span className="text-xs font-bold text-[#843A7F] font-montserrat">Innovation</span>
            </div>

            {/* Headline Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#843A7F] leading-tight font-montserrat tracking-tight px-10">
              Volunteer Your Skills,
              <br />
              Build Your Future.
            </h1>

            {/* Right Skills Floating Chip */}
            <div className="hidden md:flex absolute -right-20 bottom-3 items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-[0_4px_20px_rgba(132,58,127,0.06)] border border-gray-100">
              <span className="text-[#843A7F]"><GraduationCap size={15} /></span>
              <span className="text-xs font-bold text-[#843A7F] font-montserrat">Skills</span>
            </div>
          </div>

          <p className="mt-6 max-w-2xl mx-auto text-sm md:text-base text-gray-500 font-semibold font-montserrat leading-relaxed">
            Volunteering on AfriVate helps Africans gain real experience, grow
            professionally, and connect with organizations that value impact over
            borders.
          </p>

          {/* Minimalist Search Input Pill */}
          <div className="mt-8 mx-auto max-w-xl flex items-center gap-3 rounded-full bg-white/95 border border-gray-200 px-5 py-3.5 shadow-[0_8px_30px_rgba(132,58,127,0.06)]">
            <Search size={20} className="text-[#843A7F] shrink-0" />
            <input
              type="text"
              placeholder="Search for an Opportunity"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 font-medium font-montserrat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button type="button" onClick={handleSearch} className="text-[#843A7F] shrink-0 hover:translate-x-0.5 transition-transform duration-200">
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* Primary Action Button Below Search */}
          <div className="mt-6 font-montserrat">
            <Link to="/signup">
              <button className="rounded-full bg-[#843A7F] text-white font-bold px-12 py-3.5 shadow-[0_6px_20px_rgba(132,58,127,0.2)] hover:bg-[#6f3069] transition duration-200 text-sm md:text-base">
                Get Started
              </button>
            </Link>
          </div>

        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <section id="volunteering" className="py-16 bg-white/40 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto w-[min(1100px,94%)] text-center font-montserrat">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#843A7F]">
            Browse Category
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Find the opportunity that matches where you are in your journey
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-white p-5 flex flex-col items-center gap-3 shadow-[0_6px_20px_rgba(132,58,127,0.04)] border border-gray-100 hover:shadow-[0_10px_28px_rgba(132,58,127,0.12)] hover:border-[#E2B6DD] transition duration-300 group cursor-pointer"
              >
                <span className="grid place-items-center h-12 w-12 rounded-xl bg-[#F4E0F1] text-[#843A7F] group-hover:bg-[#843A7F] group-hover:text-white transition duration-300">
                  <Icon size={22} />
                </span>
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative w-full overflow-hidden px-4 md:px-0 md:py-16 py-4 mt-20 md:mt-[120px] font-montserrat md:pb-24 md:min-h-[950px] md:max-w-[1280px] md:mx-auto">
        
        {/* Raised the text vector background */}
        <img className='w-full max-w-[400px] md:max-w-[70%] mx-auto select-none pointer-events-none relative -mt-6 md:-mt-16 block' alt='how it works' src={how}/>

        {/* Outer step-card and mockup container wrapper (responsive flex on mobile, boundary height on desktop) */}
        <div className="relative w-full mt-8 md:mt-12 flex flex-col md:block items-center md:min-h-[700px] lg:min-h-[820px]">
          
          {/* Centered phone mockup */}
          <img 
            className="relative md:absolute md:left-1/2 md:-translate-x-1/2 md:top-[60px] w-[260px] sm:w-[300px] md:w-[320px] lg:w-[350px] object-contain drop-shadow-[0_25px_50px_rgba(132,58,127,0.18)] z-10" 
            alt="Phone showing how it works" 
            src={phone}
          />

          {/* Responsive Step Cards */}
          
          {/* Step 1 */}
          <div className="relative md:absolute md:left-[2%] lg:left-[8%] md:top-[20%] lg:top-[25%] w-full max-w-[340px] md:w-[280px] lg:w-[340px] rounded-[24px] md:rounded-[30px] p-6 bg-white/75 backdrop-blur-md border border-[#E2B6DD]/50 shadow-[0_10px_30px_rgba(132,58,127,0.08)] mt-6 md:mt-0 z-20 transition-all duration-300">
            <div>
              <h4 className="font-montserrat font-extrabold text-[#843A7F] text-base md:text-xl lg:text-2xl leading-snug">1. Create Profile</h4>
              <p className="font-montserrat font-medium text-gray-600 text-xs md:text-sm mt-1 leading-relaxed">Highlight your skills and aspirations.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative md:absolute md:right-[2%] lg:right-[8%] md:top-[38%] lg:top-[42%] w-full max-w-[340px] md:w-[290px] lg:w-[350px] rounded-[24px] md:rounded-[30px] p-6 bg-white/75 backdrop-blur-md border border-[#E2B6DD]/50 shadow-[0_10px_30px_rgba(132,58,127,0.08)] mt-4 md:mt-0 z-20 transition-all duration-300">
            <div>
              <h4 className="font-montserrat font-extrabold text-[#843A7F] text-base md:text-xl lg:text-2xl leading-snug">2. Explore Volunteering Opportunities</h4>
              <p className="font-montserrat font-medium text-gray-600 text-xs md:text-sm mt-1 leading-relaxed">Check out volunteering opportunities curated for you.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative md:absolute md:left-[10%] lg:left-[18%] md:top-[68%] lg:top-[72%] w-full max-w-[340px] md:w-[280px] lg:w-[340px] rounded-[24px] md:rounded-[30px] p-6 bg-white/75 backdrop-blur-md border border-[#E2B6DD]/50 shadow-[0_10px_30px_rgba(132,58,127,0.08)] mt-4 md:mt-0 z-20 transition-all duration-300">
            <div>
              <h4 className="font-montserrat font-extrabold text-[#843A7F] text-base md:text-xl lg:text-2xl leading-snug">3. Apply & Grow</h4>
              <p className="font-montserrat font-medium text-gray-600 text-xs md:text-sm mt-1 leading-relaxed">Take the next step in your career.</p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED OPPORTUNITIES SECTION */}
      <section className="py-16 bg-[#FAF8FB] font-montserrat mt-24">
        <div className="mx-auto w-[min(1100px,94%)]">
          
          <div className="flex items-end justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#843A7F]">
                Featured Opportunities
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Explore top-rated volunteering roles available this week
              </p>
            </div>
            <Link
              to="/opportunity"
              className="text-sm font-bold text-[#843A7F] flex items-center gap-1 hover:underline group"
            >
              See More 
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl bg-white p-3.5 shadow-[0_6px_20px_rgba(132,58,127,0.05)] border border-gray-100/60 hover:shadow-[0_12px_28px_rgba(132,58,127,0.12)] hover:border-[#E2B6DD] transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                    <img
                      src={job.image}
                      alt={job.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-white/95 backdrop-blur-sm px-3.5 py-1 text-[10px] font-bold text-[#843A7F] border border-[#F4E0F1]">
                      {job.type}
                    </span>
                  </div>
                  <div className="p-2 mt-3">
                    <p className="text-xs font-semibold text-gray-500">{job.company}</p>
                    <p className="text-base font-extrabold text-[#843A7F] mt-1 leading-snug">{job.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-2">
                      <MapPin size={13} className="text-[#843A7F]" /> {job.location}
                    </p>
                  </div>
                </div>

                <div className="p-2 pt-0 mt-4">
                  <button 
                    onClick={() => navigate('/volunteer-details', { state: { job } })}
                    className="w-full rounded-full border border-[#E2B6DD] text-[#843A7F] text-sm font-bold py-2.5 hover:bg-[#F4E0F1] transition duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY VOLUNTEER SECTION */}
      <section className="py-20 bg-white/50 backdrop-blur-sm border-t border-gray-100 font-montserrat">
        <div className="mx-auto w-[min(1100px,94%)]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#843A7F]">Why Volunteer?</h2>
            <p className="text-sm text-gray-500 mt-2">It's more than just helping. It's about personal and professional growth.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-[0_8px_20px_rgba(132,58,127,0.03)] hover:shadow-[0_12px_28px_rgba(132,58,127,0.08)] transition">
              <div className="h-10 w-10 rounded-xl bg-[#F4E0F1] flex items-center justify-center text-[#843A7F] mb-4">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Gain Experience</h3>
              <ul className="text-xs text-gray-600 mt-3 space-y-2">
                <li className="flex items-center gap-2">✔ Build your Resume</li>
                <li className="flex items-center gap-2">✔ Learn real-world skills</li>
                <li className="flex items-center gap-2">✔ Explore career paths</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-[0_8px_20px_rgba(132,58,127,0.03)] hover:shadow-[0_12px_28px_rgba(132,58,127,0.08)] transition">
              <div className="h-10 w-10 rounded-xl bg-[#F4E0F1] flex items-center justify-center text-[#843A7F] mb-4">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Meet Friends</h3>
              <ul className="text-xs text-gray-600 mt-3 space-y-2">
                <li className="flex items-center gap-2">✔ Connect with like minds</li>
                <li className="flex items-center gap-2">✔ Expand your network</li>
                <li className="flex items-center gap-2">✔ Join a supportive community</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-[0_8px_20px_rgba(132,58,127,0.03)] hover:shadow-[0_12px_28px_rgba(132,58,127,0.08)] transition">
              <div className="h-10 w-10 rounded-xl bg-[#F4E0F1] flex items-center justify-center text-[#843A7F] mb-4">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Build Skills</h3>
              <ul className="text-xs text-gray-600 mt-3 space-y-2">
                <li className="flex items-center gap-2">✔ Leadership progression</li>
                <li className="flex items-center gap-2">✔ Project planning</li>
                <li className="flex items-center gap-2">✔ Strong communications</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-[0_8px_20px_rgba(132,58,127,0.03)] hover:shadow-[0_12px_28px_rgba(132,58,127,0.08)] transition">
              <div className="h-10 w-10 rounded-xl bg-[#F4E0F1] flex items-center justify-center text-[#843A7F] mb-4">
                <HeartHandshake size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Help Locals</h3>
              <ul className="text-xs text-gray-600 mt-3 space-y-2">
                <li className="flex items-center gap-2">✔ Support native initiatives</li>
                <li className="flex items-center gap-2">✔ Improve urban districts</li>
                <li className="flex items-center gap-2">✔ Witness immediate impact</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* COMMUNITY SECTION */}
      <section id="about" className="py-20 bg-white font-montserrat">
        <div className="mx-auto w-[min(1100px,94%)] grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#843A7F] leading-tight">
              A community
              <br />
              built for
              <br />
              Africa's future
            </h2>
            <p className="mt-6 text-gray-600 max-w-md mx-auto md:mx-0 leading-relaxed">
              Pathfinders and Enablers from 30+ African countries work together on
              AfriVate every day — building careers, building organisations, and
              building the continent.
            </p>
            <button className="mt-8 rounded-full bg-[#843A7F] text-white font-bold px-8 py-3.5 hover:bg-[#6f3069] transition shadow-md">
              Join Community
            </button>
          </div>
          <div className="flex justify-center">
            <img
              src={africaMap}
              alt="Map of Africa community network"
              loading="lazy"
              className="w-full max-w-md object-contain"
            />
          </div>
        </div>
      </section>

      {/* CTA INTERACTIVE SIGN UP BANNER */}
      <section className="relative overflow-hidden bg-[#843A7F] text-white py-20 w-full font-montserrat shadow-[0_15px_40px_rgba(132,58,127,0.15)] flex flex-col justify-center items-center">
        
        {/* Transparent outline background text "AFRIVATE" */}
        <h2
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-black select-none pointer-events-none tracking-[0.05em] uppercase opacity-[0.14] leading-none"
          style={{
            fontSize: "clamp(54px, 12vw, 140px)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.7)",
            fontFamily: "Poppins, Montserrat, sans-serif"
          }}
        >
          AFRIVATE
        </h2>

        {/* Foreground Content Panel */}
        <div className="relative mx-auto max-w-xl text-center px-4 z-10 flex flex-col items-center justify-center">
          <p className="text-xl md:text-2xl font-bold tracking-tight">Ready to take your next step?</p>
          <p className="mt-2 text-xs md:text-sm text-white/90 leading-relaxed font-normal">
            Join a growing community of change-makers and innovators across Africa.
          </p>
          
          <Link to="/signup" className="inline-block mt-6">
            <button className="rounded-full bg-white text-[#843A7F] font-bold px-10 py-3.5 hover:bg-gray-50 transition duration-200 shadow-md text-sm md:text-base">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-white border-t border-gray-100 font-montserrat w-full">
        <div className="mx-auto w-[min(1100px,94%)] py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center">
            <img src={logoImg} alt="AfriVate Logo" className="h-8 md:h-9 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-6 sm:gap-8 text-sm font-semibold text-[#843A7F] flex-wrap justify-center">
            <Link to="/" className="hover:opacity-75 transition">Home</Link>
            <Link to="/about" className="hover:opacity-75 transition">About Us</Link>
            <Link to="/contact" className="hover:opacity-75 transition">Contact Us</Link>
            <Link to="/privacy" className="hover:opacity-75 transition">Privacy Policy</Link>
          </nav>
        </div>

        <div className="mx-auto w-[min(1100px,94%)] border-t border-gray-50 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© 2026 AfriVate. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[#843A7F]">
            <a 
              href="https://x.com/Afrivate_tech?t=qyFrRGry9MgLvriCOLlaCw&s=09" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="X"
              className="hover:scale-110 transition duration-150"
            >
              <XTwitterIcon size={16} />
            </a>
            <a 
              href="https://www.linkedin.com/company/afrivate/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn"
              className="hover:scale-110 transition duration-150"
            >
              <LinkedinIcon size={16} />
            </a>
            <a 
              href="https://www.instagram.com/afrivate_tech?igsh=MzJtMTg3anhoeXZ5" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram"
              className="hover:scale-110 transition duration-150"
            >
              <InstagramIcon size={16} />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;