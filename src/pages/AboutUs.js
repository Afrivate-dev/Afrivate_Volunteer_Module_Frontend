import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../Assets/Vector (1).png';
import vector from '../Assets/Vector (8).png';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F0122] font-montserrat">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logoImg} alt="Afrivate" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-[#6A00B1] font-bold text-lg sm:text-xl">AFRIVATE</span>
          </Link>
          <nav className="flex flex-wrap gap-3 sm:gap-6 text-[#6A00B1] font-semibold text-xs sm:text-sm">
            <Link to="/" className="hover:underline whitespace-nowrap">Home</Link>
            <Link to="/opportunity" className="hover:underline whitespace-nowrap">Volunteering</Link>
            <Link to="/contact" className="hover:underline whitespace-nowrap">Contact Us</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#6A00B1] mb-4">
            About Afrivate
          </h1>
          <p className="text-xl text-[#6A00B1] font-semibold mb-4">
            Elevating life in Africa — Watch out!!
          </p>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Afrivate is a technology organization building the future of skills-based volunteering across Africa. We connect talented Africans with meaningful opportunities to grow, contribute, and thrive.
          </p>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-2xl font-extrabold text-[#6A00B1] mb-6">What We Do</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E9E9E9] shadow-sm">
              <h3 className="font-bold text-lg text-[#6A00B1] mb-2">Connect Talent with Opportunity</h3>
              <p className="text-gray-600">We operate a platform that bridges African volunteers (pathfinders) with organizations (enablers) seeking skills and impact. We curate volunteering opportunities from verified partners across tech, non-profits, and enterprises.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E9E9E9] shadow-sm">
              <h3 className="font-bold text-lg text-[#6A00B1] mb-2">Enable Career Growth</h3>
              <p className="text-gray-600">We help Africans gain real-world experience, build portfolios, and access opportunities that value impact over borders. Our focus is on outcomes: professional growth, network expansion, and measurable impact.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E9E9E9] shadow-sm">
              <h3 className="font-bold text-lg text-[#6A00B1] mb-2">Power Organizations with Impact</h3>
              <p className="text-gray-600">We enable enablers to discover, vet, and onboard skilled volunteers. Organizations can post opportunities, receive applications, and build teams that drive real change across the continent.</p>
            </div>
          </div>
        </section>

        {/* How We Do It */}
        <section className="mb-16">
          <h2 className="text-2xl font-extrabold text-[#6A00B1] mb-6">How We Do It</h2>
          <div className="space-y-6">
            <div className="bg-[#6A00B11A] rounded-2xl p-6 border border-[#6A00B1]/20">
              <h3 className="font-bold text-lg text-[#6A00B1] mb-2">Verification & Trust</h3>
              <p className="text-gray-700">We verify every partner organization to ensure opportunities are legitimate and valuable. Volunteers can trust that they&apos;re engaging with real projects and reputable enablers.</p>
            </div>
            <div className="bg-[#6A00B11A] rounded-2xl p-6 border border-[#6A00B1]/20">
              <h3 className="font-bold text-lg text-[#6A00B1] mb-2">Curation & Matching</h3>
              <p className="text-gray-700">We curate opportunities from TechCabal, MSME Africa, and other trusted sources. Our platform helps pathfinders discover roles aligned with their skills and goals.</p>
            </div>
            <div className="bg-[#6A00B11A] rounded-2xl p-6 border border-[#6A00B1]/20">
              <h3 className="font-bold text-lg text-[#6A00B1] mb-2">Community & Support</h3>
              <p className="text-gray-700">We foster a community of change-makers and innovators. From profile creation to application and beyond, we provide the tools and support needed for both pathfinders and enablers to succeed.</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="flex justify-center gap-12 md:gap-24 mb-16">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-[#6A00B1]">10,000+</h3>
            <p className="text-gray-600 text-sm">Happy Clients</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-[#6A00B1]">1200+</h3>
            <p className="text-gray-600 text-sm">Reviews</p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-[#8500DE] via-[#6A00B1] to-[#1F0133] rounded-2xl p-10 text-white">
          <p className="text-xl md:text-2xl font-extrabold mb-4">Ready to Start Your Journey?</p>
          <p className="mb-6">Join a growing community of change-makers and innovators across Africa. Your next opportunity is just a click away.</p>
          <Link to="/signup">
            <button className="bg-white text-[#6A00B1] font-bold py-3 px-8 rounded-xl hover:bg-purple-50 transition">
              Create Account
            </button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f3f3f3] px-4 md:px-10 lg:px-[100px] py-6 mt-16">
        <div className="flex items-center justify-between max-w-6xl mx-auto flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <img src={vector} alt="Afrivate Logo" className="w-5 md:w-7 object-contain" />
            <span className="text-[#6A00B1] font-extrabold font-poppins text-sm md:text-xl">AFRIVATE</span>
          </div>
          <nav className="flex gap-4 text-[#6A00B1] text-xs font-extrabold">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          </nav>
          <p className="text-[10px] md:text-xs text-[#6A00B1] font-montserrat">© Afrivate 2026 — Elevating Life in Africa</p>
        </div>
      </footer>
    </div>
  );
}
