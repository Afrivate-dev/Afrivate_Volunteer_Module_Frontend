import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Listing from '../Assets/Frame 392.png';
import reach from '../Assets/Frame 393 (1).png';
import rate from '../Assets/Frame 394.png';
import NavBar from '../components/auth/Navbar';
import { opportunities, applications } from '../services/api';

const DashE = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load opportunities and applications from API
        const [oppsData, appsData] = await Promise.all([
          opportunities.mine(),
          applications.list()
        ]);
        
        const opps = Array.isArray(oppsData) ? oppsData : [];
        const apps = Array.isArray(appsData) ? appsData : [];
        
        const countByOpp = {};
        apps.forEach((a) => {
          const oid = String(a.opportunity || '');
          if (oid) countByOpp[oid] = (countByOpp[oid] || 0) + 1;
        });
        
        setJobs(
          opps.map((o) => ({
            id: o.id,
            title: o.title || 'Opportunity',
            applications: countByOpp[String(o.id)] || 0,
            status: (countByOpp[String(o.id)] || 0) > 0 ? 'Active' : 'In Review',
            date: o.posted_at ? new Date(o.posted_at).toLocaleDateString() : '—',
          }))
        );
      } catch (err) {
        console.error('Error loading data:', err);
        // Fallback to localStorage
        try {
          const opps = JSON.parse(localStorage.getItem('enablerOpportunities') || '[]');
          const apps = JSON.parse(localStorage.getItem('pathfinderApplications') || '[]');
          const countByOpp = {};
          apps.forEach((a) => {
            const oid = String(a.opportunityId || '');
            if (oid) countByOpp[oid] = (countByOpp[oid] || 0) + 1;
          });
          setJobs(
            opps.map((o) => ({
              id: o.id,
              title: o.title || 'Opportunity',
              applications: countByOpp[String(o.id)] || 0,
              status: (countByOpp[String(o.id)] || 0) > 0 ? 'Active' : 'In Review',
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—',
            }))
          );
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700";
      case "In Review": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] hero-bg">
      <NavBar />

      <div className={`fixed top-0 left-0 h-full w-[270px] rounded-tr-3xl rounded-br-3xl bg-[#FAFAFA] shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="px-3 py-5 text-center">
            <div className="w-[50px] h-[50px] bg-gray-300 mx-auto rounded-full"></div>
            <p className="font-sans text-xl text-black mt-3 font-bold">Joshua</p>
            <p className="font-sans text-sm text-[#797979]">Product Designer</p>
          </div>

          <ul className="p-4 space-y-5 text-sm text-black font-medium font-sans">
            <Link to="/"><li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2"><i className="fas fa-house"></i> Home</li></Link>
            <Link to="/road"><li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2"><i className="fas fa-school"></i> Learning</li></Link>
            <Link to="/enabler/settings"><li className="bg-white py-2 px-3 rounded-xl hover:bg-gray-300 flex items-center gap-3 m-2"><i className="fas fa-wrench"></i> Settings</li></Link>
          </ul>

          <Link to="/login"><button className="w-[80%] bg-purple-900 mt-10 mb-3 text-white text-sm font-extrabold py-3 rounded-xl mx-auto block">Log in</button></Link>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 mx-5 md:mx-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
          <p className="text-gray-600 mt-4 text-sm">Loading dashboard...</p>
        </div>
      ) : (
      <>
      <div className="flex flex-col md:flex-row items-start justify-between mt-10 md:mt-10 mx-5 md:mx-20 my-7 gap-4 md:gap-0">
        <div>
          <p className="text-[#6A00B1] text-2xl sm:text-3xl font-sans font-bold">Welcome, Soma !</p>
          <p className="text-black text-base md:text-lg font-sans font-semibold">Analytics Summary</p>
        </div>
        <div className="flex gap-3 md:ml-auto">
          <Link to="/create-opportunity"><button className="bg-[#6A00B1] p-3 rounded-2xl text-white font-sans text-sm"><i className="fa-solid fa-plus font-bold"></i> New Posting</button></Link>
          <Link to="/enabler/profile"><button className="p-3 border border-[#6A00B1] rounded-2xl text-[#6A00B1] font-sans text-sm">View Profile</button></Link>
        </div>
      </div>

      <div className="m-5 md:m-10 md:ml-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <img src={Listing} alt="Analytics listing chart" className="w-full" />
          <img src={reach} alt="Reach analytics" className="w-full" />
          <img src={rate} alt="Rate analytics" className="w-full" />
        </div>
      </div>

      <div className="px-5 md:px-20">
        <p className="font-sans font-semibold text-lg mb-3">Active Posting</p>
        <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm font-montserrat min-w-[600px]">
            <thead>
              <tr className="text-gray-500 border-b text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Posted</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500 text-sm">No opportunities posted yet.</td></tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50 transition-all">
                  <td className="py-4 px-4 font-semibold text-gray-800">{job.title}</td>
                  <td className="py-4 px-4">{job.applications}</td>
                  <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>● {job.status}</span></td>
                  <td className="py-4 px-4 text-gray-600">{job.date}</td>
                  <td className="py-4 px-4">
                    <Link to={`/enabler/applicants/${job.id}`}>
                      <button className="bg-purple-700 hover:bg-purple-800 text-white text-xs px-4 py-1 rounded-lg font-semibold transition-all">View</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default DashE;
