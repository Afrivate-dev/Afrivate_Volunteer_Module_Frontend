import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../Assets/Vector (1).png';
import vector from '../Assets/Vector (8).png';

export default function PrivacyPolicy() {
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
            <Link to="/about" className="hover:underline whitespace-nowrap">About Us</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#6A00B1] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Effective date: February 5, 2026
        </p>

        <section className="mb-10">
          <p className="text-gray-700 leading-relaxed mb-4">
            Afrivate Technologies Limited (&quot;Afrivate,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Afrivate volunteer platform (RC: 9210092). We are committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, who we share it with, and your rights regarding that data. By using our website and services, you agree to this policy.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">1. Types of Information Collected</h2>
          <p className="text-gray-700 mb-2">We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Account and profile data:</strong> Name, email address, and information you provide when creating a pathfinder or enabler profile (e.g., title, location, skills, aspirations).</li>
            <li><strong>Authentication data:</strong> Email, password (stored securely), and information from Google sign-in when you use that option.</li>
            <li><strong>Usage and behavior data:</strong> Pages visited, search queries, bookmarks, applications, and how you interact with the platform. This includes data from Google Analytics (see Cookies section).</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information, and similar technical identifiers.</li>
            <li><strong>Communications:</strong> Messages sent through our contact forms or when contacting pathfinders/enablers through the platform.</li>
            <li><strong>KYC and verification data:</strong> If you submit identity or verification information, we collect what you provide for that purpose.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">2. How Information is Collected</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Direct input:</strong> Forms for signup, profile creation, contact, and opportunity applications.</li>
            <li><strong>Automatic collection:</strong> Cookies, local storage, and similar technologies (see Cookies section below).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">3. How Information is Used</h2>
          <p className="text-gray-700 mb-2">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Provide and operate the Afrivate platform (connecting pathfinders with enablers and volunteering opportunities).</li>
            <li>Manage your account, profile, bookmarks, and applications.</li>
            <li>Improve our services and user experience (including via analytics).</li>
            <li>Communicate with you about opportunities, support, or platform updates.</li>
            <li>Verify organizations and users in line with our operational guidelines and Code of Conduct.</li>
            <li>Comply with legal obligations and enforce our terms and policies.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">4. Data Sharing and Third Parties</h2>
          <p className="text-gray-700 mb-2">We may share your data with:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Google Analytics:</strong> To measure site usage and improve our service. Google may collect and process data according to its own privacy policy.</li>
            <li><strong>Partner organizations (Enablers):</strong> When you apply for opportunities, relevant profile and application information may be shared with the organization posting the opportunity.</li>
            <li><strong>Service providers:</strong> Third-party vendors who help us operate the platform (e.g., hosting, analytics). We require them to protect your data and use it only for the purposes we specify.</li>
            <li><strong>Legal and safety:</strong> When required by law or to protect rights, safety, or property.</li>
          </ul>
          <p className="text-gray-700 mt-4">
            We do not sell your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">5. Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to provide and improve our services. Our cookie consent banner on first visit allows you to manage preferences. The categories are:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Essential cookies:</strong> Required for the site to work (login, profile, bookmarks). These cannot be disabled.</li>
            <li><strong>Google Analytics:</strong> Required to understand how visitors use our site and improve our service. This is mandatory when you accept our cookies.</li>
            <li><strong>Preferences:</strong> Optional cookies that save your search and form preferences. You can opt out of these.</li>
          </ul>
          <p className="text-gray-700 mt-4">
            You can adjust your choices via our cookie banner or by clearing your browser storage. Refusing non-essential cookies may limit some features.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">6. Your Rights</h2>
          <p className="text-gray-700 mb-2">Depending on where you live, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;), subject to legal retention requirements.</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format where applicable.</li>
            <li><strong>Opt-out:</strong> Opt out of certain analytics or marketing (where we offer such options).</li>
          </ul>
          <p className="text-gray-700 mt-4">
            To exercise these rights, contact us at the email below. We will respond within a reasonable time. If you are in the EU/UK, you may also lodge a complaint with your data protection authority.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">7. Security Measures</h2>
          <p className="text-gray-700">
            We implement technical and organizational measures to protect your data, including secure transmission (HTTPS), access controls, and secure storage practices. While we strive to protect your information, no method of transmission or storage over the internet is completely secure. We also uphold confidentiality and NDA obligations as described in our Volunteer Code of Conduct and operational guidelines. If you experience harassment or unsafe conditions, you may report via our Safe-Channel communication channel.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">8. Children&apos;s Privacy</h2>
          <p className="text-gray-700">
            Our services are not directed at children under 13 (or 16 in some jurisdictions). We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us immediately so we can delete it.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">9. International Users</h2>
          <p className="text-gray-700">
            Afrivate operates primarily in Africa and may process data in various jurisdictions. If you access our platform from outside your country, your data may be transferred to and processed in those locations. We take steps to ensure adequate protection in line with applicable laws (e.g., GDPR, CCPA, PIPEDA).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will post the updated version on this page and update the effective date. Continued use of our services after changes constitutes acceptance of the updated policy. We encourage you to review this page periodically.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#6A00B1] mb-4">11. Contact Us</h2>
          <p className="text-gray-700 mb-2">
            For questions about this Privacy Policy or your personal data:
          </p>
          <p className="text-gray-700">
            <strong>Afrivate Technologies Limited</strong><br />
            Email: <a href="mailto:contact@afrivate.org" className="text-[#6A00B1] font-semibold hover:underline">contact@afrivate.org</a>
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
