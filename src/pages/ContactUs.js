import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../Assets/Vector (1).png';
import vector from '../Assets/Vector (8).png';

const CONTACT_EMAIL = 'contact@afrivate.org';

const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/afrivate_tech?igsh=MzJtMTg3anhoeXZ5',
  linkedin: 'https://www.linkedin.com/company/afrivate/',
  x: 'https://x.com/Afrivate_tech?t=qyFrRGry9MgLvriCOLlaCw&s=09',
};

export default function ContactUs() {
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
            <Link to="/about" className="hover:underline whitespace-nowrap">About Us</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#6A00B1] mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-700">
            Afrivate is elevating life in Africa — Watch out!!
          </p>
          <p className="mt-4 text-gray-600">
            Have questions about volunteering, partnerships, or how we can help you grow? We&apos;d love to hear from you.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8 border border-[#E9E9E9] shadow-sm mb-8">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">Email Us</h2>
          <p className="text-gray-600 mb-4">
            For direct inquiries, partnerships, or support, reach out via email.
          </p>
          <p className="text-[#6A00B1] font-semibold mb-4 break-all">{CONTACT_EMAIL}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 bg-[#6A00B1] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#5A0091] transition"
          >
            <i className="fa-solid fa-envelope"></i>
            Send Email
          </a>
        </section>

        <section className="bg-white rounded-2xl p-8 border border-[#E9E9E9] shadow-sm mb-12">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-6">Connect With Us</h2>
          <p className="text-gray-600 mb-6">
            Follow us on social media for the latest opportunities, success stories, and updates from the Afrivate community.
          </p>
          <div className="flex gap-6 justify-center">
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-12 h-12 rounded-full bg-[#6A00B11A] flex items-center justify-center text-[#6A00B1] hover:bg-[#6A00B1] hover:text-white transition"
            >
              <i className="fa-brands fa-x-twitter text-xl"></i>
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-12 h-12 rounded-full bg-[#6A00B11A] flex items-center justify-center text-[#6A00B1] hover:bg-[#6A00B1] hover:text-white transition"
            >
              <i className="fa-brands fa-linkedin-in text-xl"></i>
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-12 h-12 rounded-full bg-[#6A00B11A] flex items-center justify-center text-[#6A00B1] hover:bg-[#6A00B1] hover:text-white transition"
            >
              <i className="fa-brands fa-instagram text-xl"></i>
            </a>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6A00B1]/10 via-[#8500DE]/10 to-[#6A00B1]/10 border border-[#6A00B1]/20 p-6 mb-12">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6A00B1]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#8500DE]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <p className="text-center text-[#6A00B1] font-semibold relative z-10">
            We typically respond within 24–48 hours. For urgent matters, reach out on our social channels.
          </p>
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
