import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgimg1 from '../Assets/Beck logo black 1.png';
import police from '../Assets/mdi_police-badge.png';
import NavBar from '../components/auth/Navbar';

const defaultCompanyData = {
  name: "TECH INNOVATORS INC",
  logo: "",
  description: "Driving innovation in the tech sector, empowering youth through education and employment opportunities.",
  details: { industry: "Technology", size: "50–200 employees", founded: "2015", location: "New York, USA" },
  about: { mission: "To bridge the gap between talent and opportunity.", values: "Integrity, Innovation, Collaboration, Impact", sector: "Technology & Education" },
  employerBrand: "We believe in nurturing talent and providing a platform for growth.",
  badges: [{ name: "Afrivate-certified", color: "bg-purple-300 text-purple-800" }, { name: "CSR-verified", color: "bg-purple-300 text-purple-800" }],
  impactMetrics: { volunteersHosted: 150, jobsOffered: 75 },
};

function buildFromEnablerProfile(profile) {
  if (!profile || !profile.name) return defaultCompanyData;
  return {
    name: (profile.name || defaultCompanyData.name).toUpperCase(),
    logo: profile.profilePictureDataUrl || "",
    description: profile.bio || defaultCompanyData.description,
    details: {
      industry: profile.role || defaultCompanyData.details.industry,
      size: profile.employees ? `${profile.employees} employees` : defaultCompanyData.details.size,
      founded: profile.createdAt ? new Date(profile.createdAt).getFullYear().toString() : defaultCompanyData.details.founded,
      location: [profile.address, profile.state, profile.country].filter(Boolean).join(", ") || defaultCompanyData.details.location,
    },
    about: {
      mission: profile.bio || defaultCompanyData.about.mission,
      values: defaultCompanyData.about.values,
      sector: profile.role || defaultCompanyData.about.sector,
    },
    employerBrand: profile.bio || defaultCompanyData.employerBrand,
    badges: defaultCompanyData.badges,
    impactMetrics: defaultCompanyData.impactMetrics,
  };
}

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(defaultCompanyData);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("enablerProfile");
      if (saved) setCompanyData(buildFromEnablerProfile(JSON.parse(saved)));
    } catch (_) {}
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 ">
    <NavBar />
      <div className="bg-white shadow-md rounded-2xl p-8 ml-[0%] md:ml-[13%] mt-7 w-full max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4">
            {companyData.logo ? (
              <img src={companyData.logo} alt="logo" className="w-20 h-20 rounded-xl border object-cover" />
            ) : (
              <img src={bgimg1} alt="logo" className="w-20 h-20 rounded-xl border p-4 w-[15%]" />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {companyData.name}
              </h1>
              <p className="text-gray-500 text-sm">{companyData.description}</p>
              <p className="text-gray-400 text-sm mt-1">
                {companyData.details.industry} | {companyData.details.size} |{" "}
                Founded {companyData.details.founded}
                <br />
                Location: {companyData.details.location}
              </p>
            </div>
          </div>
          <button onClick={() => navigate("/enabler/edit-profile")} className="mt-4 md:mt-0 p-3 py-2 text-sm rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 bg-[#B678FF66] font-semibold transition">
            ✎ Edit Profile
          </button>
        </div>

        {/* Divider */}
        <hr className="mb-6 border-gray-200" />

        {/* About Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left side */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">About Us</h2>

            <div className="space-y-3">
              <div className="flex bg-gray-50 border rounded-lg p-3">
                <h3 className="p-2 font-semibold text-base mb-1">
                  Mission
                </h3>
                <p className="text-gray-600 text-xs p-2 pl-10">
                  {companyData.about.mission}
                </p>
              </div>

              <div className="flex bg-gray-50 border rounded-lg p-3">
                <h3 className="p-2 font-semibold text-base mb-1">
                  Values
                </h3>
                <p className="text-gray-600 text-xs p-3 pl-11">
                  {companyData.about.values}
                </p>
              </div>

              <div className="flex bg-gray-50 border rounded-lg p-3">
                <h3 className="p-2 font-semibold text-base mb-1">
                  Sector
                </h3>
                <p className="text-gray-600 text-xs p-3 pl-11">
                  {companyData.about.sector}
                </p>
              </div>

              <div className="pt-3">
                <h3 className="pl-5 font-bold text-gray-800 text-base mb-1">
                  Employer Brand
                </h3>
                <p className="pl-5 text-gray-600 text-xs whitespace-pre-line">
                  {companyData.employerBrand}
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-6">
            {/* Verification Badges */}
            <div>
              <h3 className="text-base font-semibold mb-2 text-gray-800 text-center">
                Verification Badges
              </h3>
              <div className="flex gap-2 ml-6">
                {companyData.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`flex  px-3 py-2 text-xs  rounded-md ${badge.color}`}
                  >
                    <img
              src={police}
              alt="logo"
              className="flex w-[15px] h-[15px]"
            />
                    {badge.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="">
            <h3 className="text-sm text-center font-semibold mb-3 text-gray-800">
                Impact Metrics
              </h3>
            <div className="">
              
              <div className="">

              <div className="bg-gray-50 border rounded-2xl p-4">
                <p className=" text-[10px] font-bold">
                  Volunteers Hosted
                </p>              
                <p className="font-bold text-gray-800 text-2xl sm:text-3xl pt-1">
                  {companyData.impactMetrics.volunteersHosted}
                </p>
              </div>

              <div className="bg-gray-50 border rounded-2xl p-4 mt-2">
                <p className=" text-[10px] font-bold">Jobs Offered</p>
                <p className="font-bold text-gray-800 text-2xl sm:text-3xl pt-1">
                  {companyData.impactMetrics.jobsOffered}
                </p>
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
