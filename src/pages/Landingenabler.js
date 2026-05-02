import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../Assets/Vector (1).png';
import semic from '../Assets/Group 372.png';
import blob1 from '../Assets/Blob 1.png';
import blob2 from '../Assets/blob 2.png';
import how from '../Assets/How It Works.png';
import ppl2 from '../Assets/lets-icons_group-fill.png';
import health from '../Assets/healthicons_justice-outline-24px.png';
import shield from '../Assets/zondicons_shield.png';
import vector from '../Assets/Vector (8).png';

const Landingenabler = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) sessionStorage.setItem('discoverQuery', searchQuery.trim());
    navigate('/opportunity');
  };

  return (
    <div className="bg-[#FAFAFA] relative min-h-screen text-white hero-bg overflow-x-hidden">
      <div className="absolute top-0 inset-0 w-full  h-[580px] md:h-[600px] ">
        <div className="relative overflow-hidden h-[50%]  bg-[linear-gradient(180deg,#5E009B_0.0003%,#200035_100%)]  inset-0 w-full  object-cover"></div>
        <div className="relative overflow-hidden  bg-[#200035]  inset-0 w-full  object-cover h-[80%]">
          <img className='absolute md:bottom-[-150px] bottom-0 w-[100%]' src={semic} alt=''/>
        </div>
      </div>

      <nav
  className={`bg-black/5 backdrop-blur-xl border border-white/20 font-sans fixed top-[15px] left-[4%] z-20 px-4 md:px-8 h-[75px] md:h-[80px] py-2 md:py-5 flex flex-col md:flex-row gap-6 md:gap-0 w-[92%] transition-all duration-500 rounded-full `}
>
        <div className="flex items-center">
        <i
            className="flex fa-solid fa-bars  text-xl pl-4 text-purple-100 hidden  lg:block"
            onClick={() => setIsOpen(true)}
          ></i>
          <img
            src={logoImg}
            alt="Afrivate"
            className="sm:h-8 h-8 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] sm:pl-10"
          />
          <span className="ml-3 sm:text-4xl lg:text-2xl font-poppins font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300 text-glow-white">
            AFRIVATE
          </span>
          <Link to="/">
          <button className="flex bg-[#9900FF4D] py-3 px-3 rounded-xl text-xs font-base font-montserrat   lg:hidden block ml-10">
           Log out
          </button>
        </Link>
          <i
            className="flex fa-solid fa-bars ml-auto text-xl p-4 text-purple-100  lg:hidden"
            onClick={() => setIsOpen(true)}
          ></i>
        </div>

        <div className="hidden sm:hidden md:hidden lg:block w-[65%]">
          <div className="flex flex-wrap justify-center lg:text-base font-semibold items-center gap-4 sm:gap-6 md:gap-10 lg:gap-20 mx-[15%] pt-2">
            <Link to="/signup" className="transition-all">
            Volunteering 
            </Link>
            <Link to="/contact" className="nav-link transition-all">
              Contact us
            </Link>
            <Link to="/about" className="nav-link transition-all">
              About us
            </Link>
            
            
          </div>
        </div>

        <Link to="/">
          <button className="!hidden lg:!block bg-[#9900FF4D] py-3 px-8 rounded-2xl lg:text-sm font-base font-montserrat  mt-[-5px]">
            Log Out
          </button>
        </Link>
      </nav>





      <div
        className={`fixed top-0 left-0 h-full w-[270px] rounded-tr-3xl rounded-br-3xl bg-[#6A00B11A] backdrop-blur-xl border border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="">
          

          <div className="mr-[5%]">
            <ul className="p-4 space-y-5 text-sm text-white font-medium font-montserrat">
              <Link to="/signup">
                <li className="bg-white/10 backdrop-blur-lg border border-white/20 w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 mt-5 block lg:hidden">
                  <i className="fas fa-grip-horizontal pr-4 pl-2 m-2"></i>
                  Volunteering
                </li>
              </Link>
              <Link to="/dashboard">
                <li className="bg-white/10 backdrop-blur-lg border border-white/20 w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 mt-5">
                  <i className="fa-solid fa-house pr-4 pl-2 m-2"></i>
                  Dashboard
                </li>
              </Link>
              <Link to="/contact">
                <li className="bg-[#6A00B11A] backdrop-blur-xl border border-white/20 w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 mt-5 block lg:hidden">
                  <i className="fa-solid fa-phone pr-4 pl-2 m-2"></i>
                  Contact Us
                </li>
              </Link>
              <Link to="/about">
                <li className="bg-[#6A00B11A] backdrop-blur-xl border border-white/20 w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 mt-5 block lg:hidden">
                  <i className="fas fa-users pr-4 pl-2 m-2"></i>
                  About Us
                </li>
              </Link>
              <Link to="/signup">
                <li className="bg-white/10 backdrop-blur-lg border border-white/20 w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 mt-5">
                  <i className="fa-solid fa-bookmark pr-4 pl-2 m-2"></i>
                  Bookmarks
                </li>
              </Link>
              <Link to="/signup">
                <li className="bg-white/10 backdrop-blur-lg border border-white/20 w-[100%] py-2 pr-4 pl-1 rounded-xl hover:bg-gray-300 mt-5">
                  <i className="fa-solid fa-gear pr-4 pl-2 m-2"></i>
                  Settings
                </li>
              </Link>
              
            </ul>
          </div>
        </div>
        <Link to="/login">
          <button className="w-[80%] bg-[transparent] mt-[30px] mb-3 text-white text-lg  py-4 rounded-xl px-4 mx-3 ml-[5%] border border-white">
            Sign up
          </button>
        </Link>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <main className="relative z-10 flex-1 md:flex items-center justify-center mt-[130px] md:mt-[130px]  px-6 sm:p-6 md:p-8 overflow-hidden ">
        <div className=" mx-auto md:text-center mt-0  md:mt-20 sm:mt-[-150px] lg:mt-0 ">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-montserrat text-start md:text-center font-bold mb-6 sm:mb-8  bg-clip-text  text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300 text-glow-white filter drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)] p-1 ">
            Create meaningful volunteering opportunities <br className='hidden md:block'/> and connect with committed young Africans.
          </h1>
          <p className="md:text-lg text-xs text-start md:text-center font-montserrat mb-8 sm:mb-10 text-gray-100/90 mx-auto px-1  tracking-wide   ">
            Afrivate helps organizations across Africa connect with skilled youth volunteers, create and manage<br className='hidden md:block'/> meaningful volunteering opportunities, and track impact — all in one simple, trusted platform.
          </p>
          <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 md:py-3 py-1 flex items-center shadow-lg mb-10">
            <i className="fa-solid fa-magnifying-glass text-lg md:ml-[3%]"></i>
            <input type="text" className="ml-2 bg-transparent md:text-xl text-sm outline-none text-white placeholder-white w-full font-montserrat h-[30px] md:ml-[2%]" placeholder='Search for an Opportunity' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <button type="button" onClick={handleSearch} className='md:w-[8%] w-[20%] h-[45px] md:h-[50px] rounded-full border border-white/30 bg-white/10 backdrop-blur-base shadow-[inset_0_0_6px_rgba(255,255,255,0.35) hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300'><i className="fa-solid fa-arrow-right text-white text-3xl"></i></button>
          </div>
          <Link to="/create-opportunity"><button className="md:w-[33%] ml-[2.5%] w-[95%] md:py-6 py-4 font-montserrat text-base md:rounded-2xl rounded-full bg-[radial-gradient(circle_at_center,#56008F,#A839F2,#D390FF)] md:text-lg text-white  shadow-md  hover:bg-purple-700 transition font-extrabold">Post an Opportunity</button></Link>
        </div>
      </main>

      <div className='relative  md:h-[550px] h-[1150px] w-[100%] md:mt-[170px] mt-[130px] font-montserrat p-6 no-scrollbar overflow-hidden '>
        <img alt='blob1' src={blob2} className='absolute right-0 top-0 md:w-auto w-[150%] max-w-none'/>
        <img alt='blob1' src={blob1}  className='absolute left-0 bottom-0 md:w-auto w-[170%] max-w-none'/>
        <h2 className="md:relative relative text-[#6A00B1] font-montserrat font-extrabold md:text-3xl text-2xl top-0 md:mt-[0px] md:top-0 ml-[2%]">Who is this for?</h2>
        <h2 className="relative md:relative text-[#6A00B1] font-montserrat md:text-md text-sm  ml-[2%] top-0 md:mt-[0px] hidden md:block  ">Designed especially for organizations making a real different in their communities.</h2>
        <div className='md:flex gap-14 md:mt-[100px] mt-[30px] ml-[3%]'>
          <div className='md:w-[21%] w-[90%] md:ml-0 ml-[5%] md:h-[230px] h-[230px] rounded-2xl bg-[#6A00B11A] backdrop-blur-md border border-white/20 flex justify-center items-center'><div className=' px-2'><p className='text-black font-sans font-bold md:text-lg sm:text-xl text-center'>NGOs</p><p className='text-black md:text-sm text-sm font-montserrat'>Registered non-profits looking for consistent volunteer support.</p></div></div>
          <div className='md:w-[21%] w-[90%] md:ml-0 ml-[5%] md:h-[230px] h-[230px] rounded-2xl bg-[#6A00B11A] backdrop-blur-md border border-white/20 md:mt-0 mt-[30px] flex justify-center items-center'><div className=' px-2'><p className='text-black font-sans font-bold md:text-lg sm:text-xl text-center'>Community  Orgs</p><p className='text-black md:text-sm text-sm font-montserrat'>Local grassroots groups driving neighborhood change.</p></div></div>
          <div className='md:w-[21%] w-[90%] md:ml-0 ml-[5%] md:h-[230px] h-[230px] rounded-2xl bg-[#6A00B11A] backdrop-blur-md border border-white/20 md:mt-0 mt-[30px] flex justify-center items-center'><div className=' px-2'><p className='text-black font-sans font-bold md:text-lg sm:text-xl text-center'>Social Enterprise</p><p className='text-black md:text-sm text-sm font-montserrat'>Businesses with the core missions to improve society.</p></div></div>
          <div className='md:w-[21%] w-[90%] md:ml-0 ml-[5%] md:h-[230px] h-[230px] rounded-2xl bg-[#6A00B11A] backdrop-blur-md border border-white/20 md:mt-0 mt-[30px] flex justify-center items-center'><div className=' px-2'><p className='text-black font-sans font-bold md:text-lg sm:text-xl text-center'>Youth Programs</p><p className='text-black md:text-sm text-sm font-montserrat'>Development programs offerings mentorships and growth.</p></div></div>
        </div>
      </div>

      <img className='w-[90%] md:w-[70%] md:ml-[15%] ml-[5%] md:mt-10 mt-[50px]' alt='how it works' src={how}/>
      <p className='font-montserrat md:text-xl text-xs text-black text-center mt-4'>Three simple steps to connect with your next <br className='block md:hidden'/>best volunteer </p>

      <section className="w-full px-6 py-16 flex flex-col items-center font-montserrat ">
        <div className="flex flex-col md:flex-row gap-8 mb-20">
          {[{ step: "1", title: "Create Profile", text: "Verify your organization identity to build trust with applicants immediately." }, { step: "2", title: "Publish Listings", text: "Post opportunities with clear roles, skills required and time commitments." }, { step: "3", title: "Review & Select", text: "Manage applications, view detailed profiles and onboard your volunteer." }].map((item, i) => (
            <div key={i} className="p-[2px] rounded-2xl bg-gradient-to-b from-purple-300 via-purple-200 to-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.35)]">
              <div className="w-[260px] rounded-2xl bg-white px-8 py-7 text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-purple-700 text-white flex items-center justify-center font-semibold text-xl">{item.step}</div>
                <h3 className="font-bold text-black mb-2 text-xl">{item.title}</h3>
                <p className="text-sm text-black leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#6A00B1] mb-8 text-center">Why Partners choose Afrivate</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 max-w-6xl">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#6A00B1] flex items-center justify-center text-white"><img className='p-2' src={ppl2} alt=' '/></div>
              <div className="w-[10px] rounded-full flex-1 bg-gradient-to-br from-[#2D004B] via-[#6A00B1] via-[#8500DE] to-[#2D004B]  mt-4" />
            </div>
            <div><h4 className="font-semibold text-[#6A00B1] mb-2">Access to Youth</h4><p className="text-sm text-gray-600 leading-relaxed">Connect directly with a motivated demographic eager to gain experience and contribute to social causes.</p></div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#6A00B1] flex items-center justify-center text-white"><img className='p-2' src={health} alt=' '/></div>
              <div className="w-[10px] rounded-full flex-1 bg-gradient-to-br from-[#2D004B] via-[#6A00B1] via-[#8500DE] to-[#2D004B]  mt-4" />
            </div>
            <div><h4 className="font-semibold text-[#6A00B1] mb-2">Clear Structure</h4><p className="text-sm text-gray-600 leading-relaxed">Our standard format ensures clear experience expectations, reducing drop-off rates and improving volunteer quality.</p></div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#6A00B1] flex items-center justify-center text-white"><img className='p-2' src={shield} alt=' '/></div>
              <div className="w-[10px] rounded-full flex-1 bg-gradient-to-br from-[#2D004B] via-[#6A00B1] via-[#8500DE] to-[#2D004B]  mt-4" />
            </div>
            <div><h4 className="font-semibold text-[#6A00B1] mb-2">Reliable Platform</h4><p className="text-sm text-gray-600 leading-relaxed">A verified ecosystem that prioritizes safety, Data Privacy, and ethical volunteering standards.</p></div>
          </div>
        </div>
      </section>

      <div className=" relative h-100 bg-gradient-to-br from-[#8500DE] via-[#1F0133] via-[#6A00B1] to-[#000000] rounded-[40PX] md:w-[54%] w-[95%] ml-[2.5%]  md:ml-[23%] mt-20   font-montserrat md:p-14 p-5 text-center">
        <p className='text-2xl sm:text-3xl font-extrabold text-white'>Ready to Make an Impact?</p>
        <p className='md:text-xl text-xs font-base text-white md:mt-4 mt-5'>Join Hundreds of Organizations in<br className='hidden md:block'/> finding their next generation of<br className='hidden md:block'/> leaders on Afrivate </p>
        <Link to="/create-opportunity"><button className="md:px-[100px] px-4 md:mt-10 mt-5 py-3 font-montserrat rounded-2xl border-[2px] border-white text-[#6A00B1] text-lg sm:text-xl font-extrabold bg-white   font-bold  transition">Post an Opportunity</button></Link>
      </div>

      <footer className="w-full bg-[#f3f3f3] px-4 md:px-10 lg:px-[100px] py-4 md:py-6 mt-[200px] md:mt-16">
        <div className="flex items-center justify-between lg:flex-row flex-col gap-3 md:gap-6">
          <div className="flex items-center justify-start gap-2">
            <img src={vector} alt="Afrivate Logo" className="w-5 md:w-7 object-contain" />
            <span className="text-[#6A00B1] font-extrabold font-poppins text-sm md:text-xl">AFRIVATE</span>
          </div>
          <nav className="flex md:gap-8 gap-4 text-[#6A00B1] text-xs md:text-sm font-extrabold">
            <Link to="/" className="hover:underline whitespace-nowrap text-ellipsis"> <p>Home</p></Link>
            <Link to="/about" className="hover:underline whitespace-nowrap text-ellipsis"> <p>About Us</p></Link>
            <Link to="/contact" className="hover:underline whitespace-nowrap text-ellipsis"> <p>Contact Us</p></Link>
            <Link to="/privacy" className="hover:underline whitespace-nowrap text-ellipsis"> <p>Privacy Policy</p></Link>
          </nav>
        </div>
        <div className="flex items-center justify-between md:mt-20 mt-4 lg:flex-row flex-col gap-3 md:gap-6 text-center">
          <p className="text-[10px] md:text-xs text-[#6A00B1] font-montserrat whitespace-nowrap text-ellipsis">© Afrivate 2026 — Elevating Life in Africa</p>
          <div className="flex items-center gap-4 md:gap-7 text-[#6A00B1] text-base md:text-2xl">
            <a href="https://x.com/Afrivate_tech?t=qyFrRGry9MgLvriCOLlaCw&s=09" target="_blank" rel="noopener noreferrer" aria-label="X"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="https://www.linkedin.com/company/afrivate/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
            <a href="https://www.instagram.com/afrivate_tech?igsh=MzJtMTg3anhoeXZ5" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landingenabler;
