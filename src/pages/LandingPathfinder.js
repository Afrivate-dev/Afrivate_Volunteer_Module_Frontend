import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgVideo from '../Assets/bg-video.mp4';
import bgImg from '../Assets/Subtract (5).png';
import logoImg from '../Assets/Vector (1).png';
import pic1 from '../Assets/Picture 1.png';
import blob1 from '../Assets/Blob 1.png';
import blob2 from '../Assets/blob 2.png';
import vector from '../Assets/Vector (8).png';
import pic2 from '../Assets/Picture 2.png';
import pic3 from '../Assets/Picture 3.png';
import pic4 from '../Assets/Picture 4.png';

const LandingPathfinder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) sessionStorage.setItem('discoverQuery', searchQuery.trim());
    navigate('/opportunity');
  };

  const sections = [
    { title: "Hands-on Experience", text: `Gain experience that opens doors. Use volunteering to build practical skills, strengthen your CV, and get noticed by organizations looking for proven, committed talent across Africa and beyond.`, img: pic1 },
    { title: "Purpose-Driven Work", text: `Join impactful volunteer programs that build your skills, expand your network, and help you make a difference in your community.`, img: pic2 },
    { title: "Gain Leadership Experience", text: `The Afrivate Volunteer Module helps Africans gain real, hands-on experience without being exploited, while preparing them for internships, jobs, and leadership opportunities. You don't just volunteer, you build skills, grow professionally, and create real impact that moves Africa forward.`, img: pic3 },
    { title: "Building trust that follows you", text: `Earn verified experience, references, and a public contribution record that strengthens your profile and makes it easier to access future opportunities on Afrivate and beyond.`, img: pic4 },
  ];

  const volunteerRoles = ["Graphic Design", "Video Editing", "UI/UX Design", "Web Development", "Content Writing", "Product Design"];

  const sliderRef = useRef(null);
  const animationRef = useRef(null);
  const isUserInteracting = useRef(false);
  const SPEED = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.3 : 0.8;

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const animate = () => {
      if (!isUserInteracting.current) {
        slider.scrollLeft += SPEED;
        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) slider.scrollLeft = 0;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [SPEED]);

  const handleUserStart = () => { isUserInteracting.current = true; };
  const handleUserEnd = () => { setTimeout(() => { isUserInteracting.current = false; }, 800); };

  return (
    <div className="bg-[#FAFAFA]  relative min-h-screen text-white hero-bg overflow-x-hidden">
      <div className="absolute inset-0 w-[100%] md:h-[600px] h-[600px]">
        <img src={bgImg} alt="Background placeholder" className="absolute inset-0 w-full md:h-[700px] h-[625px] object-cover" />
        <video className="absolute inset-0 w-full md:h-[700px] h-[625px]  object-cover" src={bgVideo} autoPlay loop muted playsInline />
      </div>

      <div className="fixed top-0 left-[4%] z-30 w-[92%] bg-[#6A00B1] text-white text-center py-2 text-xs font-montserrat rounded-t-full">
        Afrivate is elevating Life in Africa - Watch out!
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
              <Link to="/signup">
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





      <main className="relative z-10 flex-1 md:flex items-center justify-center mt-[180px] md:mt-[180px]  px-6 sm:p-6 md:p-8">
        <div className=" mx-auto md:text-center mt-20  md:mt-20 sm:mt-[-150px] lg:mt-0  ">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-montserrat text-center font-bold mb-0 sm:mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300 text-glow-white filter drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)] p-1 ">
            Volunteer with<br className='block md:hidden'/>purpose, gain real experience,<br className='hidden md:block'/>and make meaningful impact.<br className='hidden md:block'/>
          </h1>
          <p className="md:text-lg text-[10px] text-center font-montserrat mb-8 sm:mb-10 text-gray-100/90 mx-auto px-1  tracking-wide mt-4 md:mt-0 ">
            Afrivate empowers young talents across Africa to discover meaningful volunteering opportunities that<br className='hidden md:block'/>build real skills, create impact, and open pathways to future jobs, internships, and leadership growth.<br className='hidden md:block'/>
          </p>
          <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 md:py-3 py-1 flex items-center shadow-lg mb-10">
            <i className="fa-solid fa-magnifying-glass text-lg md:ml-[3%]"></i>
            <input type="text" className="ml-2 bg-transparent md:text-xl text-sm outline-none text-white placeholder-white w-full font-montserrat h-[30px] md:ml-[2%]" placeholder='Search for an Opportunity' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <button type="button" onClick={handleSearch} className='md:w-[8%] w-[20%] h-[45px] md:h-[50px] rounded-full border border-white/30 bg-white/10 backdrop-blur-base shadow-[inset_0_0_6px_rgba(255,255,255,0.35) hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300'><i className="fa-solid fa-arrow-right text-white text-3xl"></i></button>
          </div>
          <Link to="/opportunity"><button className="md:w-[33%] ml-[2.5%] w-[95%] md:py-6 py-4 font-montserrat text-base md:rounded-3xl rounded-2xl bg-[radial-gradient(circle_at_center,#56008F,#A839F2,#D390FF)] md:text-lg text-white  shadow-md  hover:bg-purple-700 transition font-extrabold">Find Opportunities</button></Link>
        </div>
      </main>

      <div className='mt-[150px]'><p className='font-extrabold md:text-3xl text-xl font-montserrat text-[#6A00B1] ml-[4%] md:ml-[8%]'>Volunteer for: </p></div>

      <div className="w-full max-w-full overflow-x-scroll mt-[10px] no-scrollbar">
        <div ref={sliderRef} onMouseDown={handleUserStart} onMouseUp={handleUserEnd} onTouchStart={handleUserStart} onTouchEnd={handleUserEnd} className="flex md:gap-4 gap-3 overflow-x-scroll whitespace-nowrap scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing">
          {[...volunteerRoles, ...volunteerRoles].map((role, index) => (
            <div key={index} className="flex items-center justify-center font-montserrat md:px-6 px-5 md:py-7 py-4 rounded-xl border border-[#E0C6FF] text-[#6A00B1] font-medium bg-white flex-shrink-0 md:text-base text-xs">{role}</div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 font-montserrat mt-10">
        <h2 className="text-[#6A00B1] font-extrabold text-2xl md:text-3xl mb-12 text-start md:text-left md:ml-[4%]">What Africans Stand to Benefit From Volunteering on Afrivate</h2>
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-purple-800 font-bold text-xl md:text-2xl">{section.title}</h2>
                <p className="text-gray-700 text-xs md:text-base">{section.text}</p>
              </div>
              <div className="md:w-1/2 h-64 md:h-80 bg-gray-200 rounded-3xl flex-shrink-0">
                <img src={section.img} alt={section.title} className="w-full h-full object-cover rounded-3xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='relative  md:h-[550px] h-[400px] w-[100%] md:mt-10 mt-[60px] font-montserrat p-6 no-scrollbar overflow-hidden'>
        <img alt='blob1' src={blob2} className='absolute right-0 top-0 md:w-auto w-[100%] max-w-none'/>
        <img alt='blob1' src={blob1}  className='absolute left-0 bottom-0 md:w-auto w-[100%] max-w-none'/>
        <div className=" relative h-100 bg-[#6A00B11A] backdrop-blur-md border border-white/20 rounded-[40PX] md:w-[64%] w-[95%] ml-[2.5%]  md:ml-[18%] mt-10   font-montserrat md:p-14 p-5 text-center">
          <p className='text-2xl sm:text-3xl font-extrabold  bg-gradient-to-b from-[#200035] via-[#620C9B] to-[#200035] bg-clip-text text-transparent'>Ready to Start Your Journey?</p>
          <p className='md:text-2xl text-xs font-base text-black md:mt-4 mt-5'>Join a Growing community of change-makers<br className='hidden md:block'/>and innovators across Africa. Your next<br className='hidden md:block'/>opportunity is just a click away. </p>
          <button className="md:px-[90px] px-10 md:mt-10 mt-5 py-3 font-montserrat rounded-full border-[2px] border-white text-[#6A00B1] text-2xl font-bold  bg-white/50 backdrop-blur-xl border border-white/40  transition">Get Started</button>
        </div>
      </div>




      <div className='relative font-sans '>
          <p className='md:text-[55px] text-[40px] text-[#6A00B1] font-medium italic font-sans p-3 md:p-3 md:ml-[25%] md:mt-[250px] mt-[150px]'>
          
          What Our People Have<br className='hidden md:block'/>To Say…
          
          </p>

                <div className=" absolute md:top-[-100px] top-[-95px] max-w-xl py-7 p-6 md:py-10 rounded-3xl text-[#6A00B1] font-semibold
              bg-white/20 backdrop-blur-sm
              shadow-[0_8px_30px_rgb(0,0,0,0.12)]
              bg-gradient-to-br from-purple-100/70 via-purple-200/40 to-purple-100/80 md:ml-[53%] ml-[3%] m-5 md:m-0
            "
            >
              <p className=" text-xs md:text-base leading-relaxed">
                “Afrivate helped me land a remote marketing<br className='hidden md:block'/>job with a Canadian
                company. Life-changing<br className='hidden md:block'/>platform!” 
                <span className="text-purple-600 font-semibold"> – Komolafe O</span>
              </p>
            </div>

            <div className=" absolute md:top-[140px] top-[90px] max-w-xl p-6 py-10 rounded-3xl text-[#6A00B1] font-semibold
              bg-white/20 backdrop-blur-sm
              shadow-[0_8px_30px_rgb(0,0,0,0.12)]
              bg-gradient-to-br from-purple-100/70 via-purple-200/40 to-purple-100/80 md:ml-[20%] ml-[3%] m-5 md:m-0 
            "
            >
              <p className="text-xs leading-relaxed">
              "Afrivate connected me to a U.S. startup as a<br/>Product designer. My career has grown<br/>globally." 
                <span className="text-purple-600 font-semibold"> – Don K</span>
              </p>
            </div>
          
        </div>









      <div className="w-full flex justify-center md:justify-end md:px-[300px] gap-8 md:gap-16 md:mt-[170px] mt-[150px] font-sans">
        <div className="text-center"><h2 className="text-base sm:text-xl md:text-2xl font-bold text-[#6A00B1]">10,000+</h2><p className="text-[#191919] md:text-base text-[10px]">Happy Clients</p></div>
        <div className="text-center"><h2 className="text-base sm:text-xl md:text-2xl font-bold text-[#6A00B1]">1200+</h2><p className="text-[#191919] md:text-base text-[10px]">Reviews</p></div>
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

export default LandingPathfinder;
