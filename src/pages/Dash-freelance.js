import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Volunteer from '../Assets/volunteer.png';
import Job from '../Assets/job.png';
import Learning from '../Assets/learning.png';
import Aiassist from '../Assets/Group 267.png';
import NavBar from '../components/auth/Navbar';


const DashF = () => {
  const jobs = [
    { id: 1, title: "UI/UX Designer", type: "Remote", location: "New York, USA" },
    { id: 2, title: "Product Designer", type: "Remote", location: "California, USA" },
    { id: 3, title: "Frontend Developer", type: "Hybrid", location: "Lagos, Nigeria" },
    { id: 4, title: "Backend Engineer", type: "Remote", location: "Berlin, Germany" },
    { id: 5, title: "Project Manager", type: "On-site", location: "London, UK" },
  ];


  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] hero-bg">
      
     
      <NavBar />


      <div
        className={`fixed top-0 left-0 h-full w-[270px] rounded-tr-3xl rounded-br-3xl bg-[#FAFAFA] shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="">
          <div className=" px-3 py-5">
          <div className="w-[50px] h-[50px] bg-gray-300 ml-[40%] rounded-full">

          </div >
          <p className="font-sans text-xl text-black text-center mt-[13px] font-bold ">
            Joshua
          </p>
          <p className="font-sans text-sm text-[#797979] text-center">Product Designer</p>
          </div>

          <div className="   mr-[5%]">
          <ul className="p-4 space-y-5 text-sm  text-black font-medium font-sans">

          <Link to="/" > <li className="bg-white  w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 m-3"><i className="fas fa-house pr-4 pl-2 m-2"></i>
          Home</li></Link>
          <Link to="/road" > <li className="bg-white  w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 m-3"><i className="fas fa-school pr-4 pl-2 m-2"></i>
         Learning</li></Link>
          <Link to="/pathf" > <li className="bg-white  w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 m-3"><i className="fas fa-dollar-sign pr-4 pl-2 m-2"></i>
          Wallet</li></Link>
          <Link to="/pathf" > <li className="bg-white  w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 m-3"><i className="fas fa-wrench pr-4 pl-2 m-2"></i>
          Settings</li></Link>

          </ul>
          </div>
        </div>
        <Link to="/login">
        <button className=" w-[80%] bg-purple-900 mt-[50px] mb-3 text-white text-sm font-extrabold py-3  rounded-xl px-3 mx-3 ml-[10%]">
            Log in        
        </button>
        </Link>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}










      
      <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20">
        <div className="text-center mt-8 sm:mt-10 mb-6">
        <p className="text-[#6A00B1] font-sans text-2xl sm:text-3xl font-bold">Welcome, Joshua!</p>
        <p className="text-[#7E7E7E] mt-1 text-base font-medium">Let’s Find your next opportunity</p>
      </div>

      
      <div className="relative w-full max-w-xl mx-auto mt-4">
        <i className="fa fa-search text-sm absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder="Search opportunities..."
          className="w-full pl-9 pr-3 py-2.5 font-montserrat border border-[#E9E9E9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-sm"
        />
      </div>

        <div className="mx-auto rounded-2xl p-4 sm:p-5 font-montserrat mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Active Applications", value: "10", note: "You have 10 Active Applications" },
              { label: "Learning Progress", value: "2", note: "You have completed 2 courses" },
              { label: "Wallet Balance", value: "$20,000", note: "Tap to view balance" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-[#E9E9E9]">
                <p className="text-[#6A00B1] font-semibold text-sm">{item.label}</p>
                <div className="flex items-center mt-2">
                  <p className="text-[#6A00B1] font-black text-xl sm:text-2xl">{item.value}</p>
                  <button className="text-white bg-[#6A00B1] text-sm px-4 rounded-lg ml-auto py-2">View</button>
                </div>
                <p className="text-xs text-[#BDBDBD] mt-1">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

     
        <p className="font-montserrat font-black text-[#6A00B1] text-center text-lg mt-4 mb-3">Discover your Path</p>

        <div className="mx-auto rounded-2xl p-4 font-sans mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[ 
              { img: Volunteer, title: "Volunteering", desc: "Explore volunteering opportunities" },
              { img: Job, title: "Job", desc: "Find your dream Job" },
              { img: Learning, title: "Learning", desc: "Continue your learning Journey" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-[#E9E9E9]">
                <img src={item.img} alt={item.title} className="w-[80%] md:w-[90%] mx-auto" />
                <p className="font-black text-[#6A00B1] ml-3 mt-2 text-base">{item.title}</p>
                <p className="text-[#BCBCBC] ml-3 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="font-montserrat font-black text-[#6A00B1] text-center text-lg mt-4 mb-3">Recommendations</p>

        <div className="flex flex-col gap-3 pb-8">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col sm:flex-row w-full mx-auto justify-between items-start sm:items-center bg-white border border-[#E7E7E7] rounded-xl px-4 py-4 shadow-sm hover:shadow-md transition-shadow font-montserrat"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900">{job.title}</h3>
                  <div className="flex gap-2 text-xs sm:text-sm">
                    <span className="text-red-500 font-medium">{job.type}</span>
                    <span className="text-gray-500">{job.location}</span>
                  </div>
                </div>
              </div>
              <button className="bg-[#6A00B1] hover:bg-[#5A0091] text-white text-sm px-4 py-2 rounded-lg font-medium mt-3 sm:mt-0 self-end sm:self-auto">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      <img src={Aiassist} alt="ai assistant" className="fixed top-[80%] left-[76%] lg:left-[83%] z-50 w-[20%] lg:w-[7%]" />

      
    </div>
  );
};

export default DashF;
