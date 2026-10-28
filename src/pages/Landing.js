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
  Globe,
  Trophy,
  MapPin,
  Menu,
  X,
  ShieldCheck,
  Phone,
  Info,
  ListChecks,
  LogIn,
  Sparkles,
  Lock,
  Plane,
} from 'lucide-react';

// Local asset paths

import logoImg from '../Assets/newLogo.svg';
import vectorBg from '../Assets/Vector2.png';
import afrivateWatermark from '../Assets/AFRIVATE.png';
import phone from '../Assets/phone.png';
import work from '../Assets/work1.jpg';
import work2 from '../Assets/work2.jpg';
import work3 from '../Assets/work3.jpg';
import work4 from '../Assets/work4.jpg';
import africaMap from '../Assets/africa-network.png';
import how from '../Assets/How It Works.png';

// --- CUSTOM INLINE SVG BRAND ICONS ---
const XTwitterIcon = ({ size = 16, className = '' }) => (
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

const LinkedinIcon = ({ size = 16, className = '' }) => (
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

const InstagramIcon = ({ size = 16, className = '' }) => (
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

// Updated categories with descriptions
const categories = [
  {
    label: 'Volunteering',
    description: 'Give your time to impactful projects and causes across the continent.',
    icon: HeartHandshake,
  },
  {
    label: 'Internships',
    description: 'Gain practical, hands-on experience to kickstart your professional career.',
    icon: Briefcase,
  },
  {
    label: 'Micro-Tasks',
    description: 'Complete short, flexible tasks that fit perfectly into your busy schedule.',
    icon: ListChecks,
  },
  {
    label: 'Mentorship',
    description: 'Learn directly from experienced professionals and industry leaders.',
    icon: Lightbulb,
  },
  {
    label: 'Remote Work',
    description: 'Find location-independent roles with organizations across Africa.',
    icon: Globe,
  },
  {
    label: 'Leadership',
    description: 'Take charge of initiatives and develop your executive management skills.',
    icon: Trophy,
  },
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

  // Added a 4th job to satisfy the lg:grid-cols-4 layout from the mockup
  const jobs = [
    {
      id: 'landing-1',
      title: 'Product Designer',
      company: 'Paystack',
      location: 'Lagos, Nigeria',
      type: 'Volunteering',
      image: work,
    },
    {
      id: 'landing-2',
      title: 'AI/ML Engineer',
      company: 'Google',
      location: 'Enugu, Nigeria',
      type: 'Internship',
      image: work2,
    },
    {
      id: 'landing-3',
      title: 'Frontend Developer',
      company: 'Oracle',
      location: 'Kano, Nigeria',
      type: 'Full-time',
      image: work3,
    },
    {
      id: 'landing-4',
      title: 'Backend Developer',
      company: 'Oracle',
      location: 'Abuja, Nigeria',
      type: 'Full-time',
      image: work4,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FB] text-[#333333] font-sans antialiased relative">
      {/* HEADER */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[min(1100px,94%)] font-montserrat">
        <div className="flex items-center justify-between rounded-full bg-white/95 backdrop-blur-md px-5 py-3 md:py-4 shadow-[0_4px_24px_rgba(132,58,127,0.06)] border border-white/40">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="AfriVate Logo"
              className="h-8 md:h-9 lg:h-10 w-auto object-contain"
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#843A7F]">
            <Link to="/opportunity" className="hover:opacity-75 transition-all">
              Volunteering
            </Link>
            <Link to="/contact" className="hover:opacity-75 transition-all">
              Contact us
            </Link>
            <Link to="/about" className="hover:opacity-75 transition-all">
              About us
            </Link>
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#843A7F] hover:opacity-75 transition"
            >
              Login
            </Link>
            <Link to="/signup">
              <button className="bg-[#843A7F] text-white py-2.5 px-6 rounded-full text-sm font-semibold hover:bg-[#6f3069] transition shadow-[0_4px_14px_rgba(132,58,127,0.15)]">
                Sign up
              </button>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-[#843A7F] hover:bg-[#843A7F]/10 rounded-full transition"
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
              className="group flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-[#843A7F] hover:to-[#A2529C] hover:text-white hover:shadow-[0_6px_16px_rgba(132,58,127,0.25)] active:scale-[0.98] transition-all duration-200"
            >
              <HeartHandshake
                size={18}
                className="text-[#843A7F]/80 group-hover:text-white transition-colors duration-200"
              />
              Volunteering
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-[#843A7F] hover:to-[#A2529C] hover:text-white hover:shadow-[0_6px_16px_rgba(132,58,127,0.25)] active:scale-[0.98] transition-all duration-200"
            >
              <Phone
                size={18}
                className="text-[#843A7F]/80 group-hover:text-white transition-colors duration-200"
              />
              Contact us
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-[#843A7F] hover:to-[#A2529C] hover:text-white hover:shadow-[0_6px_16px_rgba(132,58,127,0.25)] active:scale-[0.98] transition-all duration-200"
            >
              <Info
                size={18}
                className="text-[#843A7F]/80 group-hover:text-white transition-colors duration-200"
              />
              About us
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-[#843A7F] hover:to-[#A2529C] hover:text-white hover:shadow-[0_6px_16px_rgba(132,58,127,0.25)] active:scale-[0.98] transition-all duration-200"
            >
              <ShieldCheck
                size={18}
                className="text-[#843A7F]/80 group-hover:text-white transition-colors duration-200"
              />
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
              <a
                href="https://x.com/Afrivate"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition"
              >
                <XTwitterIcon size={14} />
              </a>
              <a
                href="https://www.linkedin.com/company/afrivate/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition"
              >
                <LinkedinIcon size={14} />
              </a>
              <a
                href="https://www.instagram.com/afrivate_/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition"
              >
                <InstagramIcon size={14} />
              </a>
            </div>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              Elevating Life in Africa
            </span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="relative w-full h-dvh pt-18 z-10 overflow-hidden">
        {/* Soft layout purple/pink glow blobs behind the grid */}
        <div className="pointer-events-none absolute -left-10 top-20 h-72 w-72 rounded-full bg-[#C58BC0]/20 blur-3xl z-0" />
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-[#E2B6DD]/30 blur-3xl z-0" />
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-[#D9A8D3]/20 blur-3xl z-0" />

        {/* Background Grid - Now contained by the relative w-full parent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4] -z-10"
          style={{
            backgroundImage:
              'linear-gradient(#EADFE9 1px, transparent 1px), linear-gradient(90deg, #EADFE9 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        {/* Background Map Simulation */}
        <div className="absolute -right-[70px] top-20 opacity-30 pointer-events-none -z-10 hidden md:block">
          <img
            src={africaMap}
            loading="lazy"
            alt=""
            className="max-h-[589px] max-w-[1033px] object-contain drop-shadow-[12px_8px_2.5px_rgba(113,39,109,0.2)]"
          />
        </div>

        {/* Centered Content Container */}
        <div className="relative mx-auto w-[min(1100px,94%)] text-center pt-36 z-10 font-montserrat">
          {/* Tightly bound relative wrapper with added padding for safe zones */}
          <div className="relative inline-block mx-auto px-20 lg:px-36">
            {/* Left Innovation Floating Chip - Now anchored inside the padding */}
            <div className="hidden md:flex absolute left-0 lg:left-4 top-2 lg:top-4 items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-[0_4px_20px_rgba(132,58,127,0.08)] border border-gray-100">
              <span className="text-[#843A7F]">
                <Rocket size={16} />
              </span>
              <span className="text-xs font-bold text-[#843A7F] font-montserrat">Innovation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#843A7F] leading-[1.15] tracking-tight  sm:px-10">
              Volunteer Your Skills,
              <br />
              Build Your Future.
            </h1>

            {/* Right Skills Floating Chip - Now anchored inside the padding */}
            <div className="hidden md:flex absolute right-0 lg:right-20 bottom-2 lg:bottom-4 items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-[0_4px_20px_rgba(132,58,127,0.08)] border border-gray-100">
              <span className="text-[#843A7F]">
                <GraduationCap size={16} />
              </span>
              <span className="text-xs font-bold text-[#843A7F] font-montserrat">Skills</span>
            </div>
          </div>

          <p className="mt-8 max-w-2xl mx-auto text-sm md:text-base text-gray-500 font-semibold leading-relaxed">
            Volunteering on AfriVate helps Africans gain real experience, grow professionally, and
            connect with organizations that value impact over borders.
          </p>

          <div className="mt-8 mx-auto max-w-xl flex items-center gap-3 rounded-full bg-white border border-gray-200 px-5 py-3 shadow-[0_8px_30px_rgba(132,58,127,0.06)] focus-within:border-[#843A7F] transition-colors">
            <Search size={20} className="text-[#8D4087] shrink-0" />
            <input
              type="text"
              placeholder="Search for an Opportunity"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 font-medium text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              type="button"
              onClick={handleSearch}
              className="text-[#843A7F] shrink-0 hover:translate-x-0.5 transition-transform"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0">
            {/* Solid "Get started" Button */}
            <Link to="/signup" className="w-full sm:w-auto">
              <button className="flex items-center justify-center w-full sm:w-[200px] h-[50px] rounded-[10px] bg-[#843A7F] text-white font-['Inria_Serif'] font-normal text-lg sm:text-[20px] leading-none shadow-lg hover:bg-[#6f3069] transition duration-200">
                Get started <span className="ml-2 font-sans text-base">↗</span>
              </button>
            </Link>

            {/* Outline "Explore Opportunities" Button */}
            <Link to="/opportunity" className="w-full sm:w-auto">
              <button className="flex items-center justify-center w-full sm:w-[226px] h-[50px] rounded-[10px] border border-[#8D408733] bg-[#FFFFFF1A] text-[#843A7F] sm:text-[#8D4087] font-['Inria_Serif'] font-normal text-base sm:text-[20px] leading-none hover:bg-[#8D4087]/5 transition-colors duration-200 px-4">
                Explore Opportunities
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* WHAT WE OFFER SECTION */}
      <section className="py-20 bg-[#FAF8FB] border-b border-gray-100">
        <div className="mx-auto w-[min(1100px,94%)] text-center font-montserrat">
          <span className="inline-block px-4 py-1.5 rounded-[10px] bg-[#EADFE9] text-[#000000] text-[15px] font-medium mb-4">
            Categories
          </span>
          <h2 className="text-3xl pt-10 md:text-4xl font-extrabold text-[#333333]">
            What We Offer
          </h2>
          <p className="mt-3 text-sm text-gray-500 max-w-xl mx-auto">
            Find the perfect opportunity that matches your current skills and long-term career
            aspirations.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {categories.map(({ label, description, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#E2B6DD] transition duration-300 group cursor-pointer"
              >
                <span className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#F4E0F1] text-[#843A7F] mb-5">
                  <Icon size={22} />
                </span>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED OPPORTUNITIES SECTION */}
      <section className="py-20 bg-[#FAF8FB]  font-montserrat">
        <div className="mx-auto w-[min(1100px,94%)] text-center">
          <span className="inline-block px-4 py-1.5 rounded-[10px] bg-[#EADFE9] text-[#000000] text-[15px] font-medium mb-4">
            Opportunities
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#333333]">
            Featured Opportunities
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-10">
            Explore handpicked opportunities designed to help you gain experience, develop new
            skills, and <br></br> take the next step in your professional journey.
          </p>

          {/* Updated to lg:grid-cols-4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl bg-[#fff] shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image Container - Flush to the edges */}
                  <div className="relative aspect-[4/3] w-full">
                    <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                    {/* Floating Badge */}
                    <span className="absolute top-3 right-3 rounded-full bg-white/45 backdrop-blur-sm px-3.5 py-1 text-[10px] font-bold text-[#843A7F]">
                      {job.type}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="p-4 md:p-5">
                    <p className="text-xs font-bold text-gray-800">{job.company}</p>
                    <p className="text-[15px] font-bold text-[#843A7F] mt-1 leading-snug">
                      {job.title}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mt-2.5">
                      <MapPin size={14} className="text-gray-600" strokeWidth={2.5} />
                      {job.location}
                    </p>
                  </div>
                </div>

                {/* Button Container */}
                <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0 mt-auto">
                  <button
                    onClick={() => navigate('/volunteer-details', { state: { job } })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 text-[#843A7F] text-xs font-bold py-3 hover:bg-gray-100 transition duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/opportunity"
              className="text-sm font-bold text-[#843A7F] flex items-center gap-1 hover:underline"
            >
              See All Opportunities <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative w-full  overflow-hidden px-4 md:px-0 py-16 lg:py-2 bg-[#FAF8FB] font-montserrat">
        {/* Large Background Text */}
        <div className="absolute top-6 sm:top-10 md:top-16 left-1/2 -translate-x-1/2 w-full px-4 z-0 flex justify-center pointer-events-none">
          <img
            className="w-[90%] sm:w-[500px] md:w-[700px] lg:w-full max-w-[1300px] h-auto object-contain select-none opacity-90"
            alt="how it works text"
            src={how}
          />
        </div>

        {/* Main Content Area - Pushed down so the phone overlaps the text */}
        <div className="relative z-10 -top-8 w-full flex flex-col md:block items-center mt-24 md:mt-32 md:min-h-[750px] lg:min-h-[850px] max-w-[1100px] mx-auto">
          {/* Centered Phone */}
          <img
            src={phone}
            alt="Phone showing how it works"
            className="relative md:absolute md:left-1/2 md:-translate-x-1/2 md:top-0 w-[260px] md:w-[320px] lg:w-[360px] object-contain drop-shadow-2xl z-10"
          />

          {/* Step 1 (Left) - Uses right anchor to guarantee overlap on left side of phone */}
          <div className="relative md:absolute md:right-[calc(50%-80px)] lg:right-[55%] md:top-[12%] lg:top-[10%] w-full max-w-[320px] rounded-[2rem] p-5 md:p-6 bg-[#843A7F]/15 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(132,58,127,0.12)] z-20 mt-6 md:mt-0 transition-transform hover:scale-105 duration-300">
            <h4 className="font-extrabold text-[#843A7F] text-lg md:text-xl leading-tight">
              1. Create Profile
            </h4>
            <p className="font-medium text-gray-700 text-xs md:text-sm mt-1.5 leading-relaxed">
              Highlight your skills and aspirations.
            </p>
          </div>

          {/* Step 2 (Right) - Uses left anchor to guarantee overlap on right side of phone */}
          <div className="relative md:absolute md:left-[calc(50%-80px)] lg:left-[60%] md:top-[42%] lg:top-[30%] w-full max-w-[320px] rounded-[2rem] p-5 md:p-6 bg-[#843A7F]/15 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(132,58,127,0.12)] z-20 mt-4 md:mt-0 transition-transform hover:scale-105 duration-300">
            <h4 className="font-extrabold text-[#843A7F] text-lg md:text-xl leading-tight">
              2. Explore Volunteering Opportunities
            </h4>
            <p className="font-medium text-gray-700 text-xs md:text-sm mt-1.5 leading-relaxed">
              Check out volunteering opportunities curated for you.
            </p>
          </div>

          {/* Step 3 (Left) - Uses right anchor to guarantee overlap on left side of phone */}
          <div className="relative md:absolute md:right-[calc(50%-50px)] lg:right-[55%] md:top-[72%] lg:top-[56%] w-full max-w-[320px] rounded-[2rem] p-5 md:p-6 bg-[#843A7F]/15 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(132,58,127,0.12)] z-20 mt-4 md:mt-0 transition-transform hover:scale-105 duration-300">
            <h4 className="font-extrabold text-[#843A7F] text-lg md:text-xl leading-tight">
              3. Apply & Grow
            </h4>
            <p className="font-medium text-gray-700 text-xs md:text-sm mt-1.5 leading-relaxed">
              Take the next step in your career.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT SETS US APART */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-[#FAF8FB] font-montserrat">
        <div className="relative mx-auto max-w-[1280px] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] bg-[#843A7F] text-white overflow-hidden py-12 px-6 sm:px-10 md:py-20 md:px-16 shadow-2xl">
          {/* Subtle Geometric Background Pattern */}
          <img
            src={vectorBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.3] md:opacity-[0.5] pointer-events-none z-0"
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              What Sets Us Apart
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/90 mt-3 md:mt-4 leading-relaxed">
              Discover the key advantages that set us apart, delivering unparalleled expertise,
              innovative solutions, and dedicated support to help your business thrive.
            </p>
          </div>

          {/* Grid Area with embedded Watermark */}
          <div className="relative mt-12 sm:mt-16 md:mt-20 flex justify-center">
            {/* Centered Image Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <img
                src={afrivateWatermark}
                alt="Afrivate Watermark"
                className="w-full max-w-[140%] sm:max-w-[110%] md:max-w-[85%] object-contain opacity-[0.4] md:opacity-[0.7]"
              />
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-6 text-left w-full">
              {/* Item 1 */}
              <div className="flex flex-col items-start">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[12px] sm:rounded-[14px] bg-white flex items-center justify-center text-[#843A7F] mb-4 sm:mb-6 shadow-sm">
                  <LogIn size={20} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                  Proven
                  <br />
                  Expertise
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-2 sm:mt-3 leading-relaxed">
                  With years of experience, we deliver solutions that work.
                </p>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-start">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[12px] sm:rounded-[14px] bg-white flex items-center justify-center text-[#843A7F] mb-4 sm:mb-6 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                  Customer-Centric
                  <br />
                  Approach
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-2 sm:mt-3 leading-relaxed">
                  We prioritize your needs to create custom solutions.
                </p>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col items-start">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[12px] sm:rounded-[14px] bg-white flex items-center justify-center text-[#843A7F] mb-4 sm:mb-6 shadow-sm">
                  <Lock size={20} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                  Innovative
                  <br />
                  Solutions
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-2 sm:mt-3 leading-relaxed">
                  We stay ahead of the curve with the latest tech trends.
                </p>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col items-start">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[12px] sm:rounded-[14px] bg-white flex items-center justify-center text-[#843A7F] mb-4 sm:mb-6 shadow-sm">
                  <Plane size={20} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                  Quality &<br />
                  Reliability
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-2 sm:mt-3 leading-relaxed">
                  Our team is here for you every step of the way.
                </p>
              </div>
            </div>
          </div>

          {/* Faint Horizontal Separator Line */}
          <div className="relative z-10 mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 w-[95%] mx-auto" />
        </div>
      </section>

      {/* COMMUNITY SECTION */}
      {/* Add overflow-hidden to the parent section to prevent horizontal scrolling */}
      <section id="about" className="py-16 md:py-24 bg-white font-montserrat overflow-hidden">
        <div className="mx-auto w-[min(1100px,94%)] grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <span className="inline-block px-4 py-1.5 rounded-[14px] bg-[#EADFE9] text-[#000] text-[15px] font-medium mb-6">
              Our Community
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#333333] leading-tight">
              A Community Built for Africa's Future
            </h2>
            <p className="mt-6 text-gray-500 leading-relaxed text-sm md:text-base max-w-md mx-auto md:mx-0">
              Pathfinders and Enablers from 30+ African countries work together on AfriVate every
              day — building careers, building organisations, and building the continent.
            </p>
            <button
              onClick={() =>
                window.open('https://chat.whatsapp.com/FMHF97ul4k18alJNwieFxB', '_blank')
              }
              className="mt-8 rounded-[15px] bg-[#843A7F] text-white font-bold px-8 py-3.5 hover:bg-[#6f3069] transition shadow-md text-sm"
            >
              Join Us
            </button>
          </div>

          {/* Responsive Map Container */}
          <div className="relative flex justify-center md:justify-end w-full min-h-[300px] sm:min-h-[360px] md:min-h-[500px]">
            <img
              src={africaMap}
              alt="Map of Africa community network"
              loading="lazy"
              className="w-[300px] sm:w-[380px] md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-10 lg:md:-right-32 md:w-[700px] lg:w-[900px] max-w-none object-contain pointer-events-none drop-shadow-[12px_8px_2.5px_rgba(113,39,109,0.2)]"
            />
          </div>
        </div>
      </section>

      {/* GET IN TOUCH SECTION */}
      <section className="py-24 bg-[#FAF8FB] font-montserrat border-t border-gray-100">
        <div className="mx-auto w-[min(1100px,94%)] grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-[14px] bg-[#EADFE9] text-[#000] text-[15px] font-medium mb-6">
              Contact Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#333333]">Get in Touch</h2>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-sm">
              Have a question about volunteering or partnering with us? We'd love to hear from you.
              Send us a message and our team will respond shortly.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#843A7F] shrink-0">
                  <Phone size={18} />
                </div>
                <span className="text-sm font-semibold">+2348066446777</span>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#843A7F] shrink-0">
                  <MapPin size={18} />
                </div>
                <span className="text-sm font-semibold">
                  {' '}
                  413 The Fusion Olusegun Obasanjo way, Wuye, Abuja
                </span>
              </div>
            </div>

            <div className="mt-10 flex gap-4 text-[#843A7F]">
              <a
                href="https://x.com/Afrivate"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-[#843A7F] hover:text-white transition"
              >
                <XTwitterIcon size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/afrivate/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-[#843A7F] hover:text-white transition"
              >
                <LinkedinIcon size={16} />
              </a>
              <a
                href="https://www.instagram.com/afrivate_/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-[#843A7F] hover:text-white transition"
              >
                <InstagramIcon size={16} />
              </a>
            </div>
          </div>

          <div>
            <form className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="p-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#843A7F] text-sm bg-[#FAF8FB]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+234 (0) 800 000 0000"
                  className="p-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#843A7F] text-sm bg-[#FAF8FB]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="p-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#843A7F] text-sm bg-[#FAF8FB]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Message</label>
                <textarea
                  rows="4"
                  placeholder="How can we help you?"
                  className="p-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#843A7F] text-sm bg-[#FAF8FB] resize-none"
                ></textarea>
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-[#843A7F] text-white font-bold py-4 hover:bg-[#6f3069] transition text-sm"
              >
                Submit Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 font-montserrat w-full">
        <div className="mx-auto w-[min(1100px,94%)] py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center">
            <img src={logoImg} alt="AfriVate Logo" className="h-8 md:h-9 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-6 sm:gap-8 text-sm font-semibold text-gray-500 flex-wrap justify-center">
            <Link to="/" className="hover:text-[#843A7F] transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-[#843A7F] transition">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-[#843A7F] transition">
              Contact Us
            </Link>
            <Link to="/privacy" className="hover:text-[#843A7F] transition">
              Privacy Policy
            </Link>
          </nav>
        </div>
        <div className="mx-auto w-[min(1100px,94%)] border-t border-gray-50 py-8 flex items-center justify-center text-xs text-gray-400">
          <span>© 2026 AfriVate. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
