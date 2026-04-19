import iconGroup from '../Assets/img/icons/Group.png'
import icon1 from '../Assets/img/icons/Vector (1).png'
import icon2 from '../Assets/img/icons/Vector (2).png'
import icon3 from '../Assets/img/icons/Vector (3).png'
import NavBar from '../components/auth/Navbar';

export default function Roadmap() {
  const phases = [
    {
      title: 'Phase 1: Learn',
      icon: (<img src={icon1} alt="Learn" className="w-6 h-6 object-contain" />),
      items: [
        { h: 'Introduction to Digital Marketing', p: 'Complete this course to build foundational skills.' },
        { h: 'The Future of Work: Trends in 2024', p: 'Read this article to understand industry trends.' },
      ],
    },
    {
      title: 'Phase 2: Engage',
      icon: (<img src={icon2} alt="Engage" className="w-6 h-6 object-contain" />),
      items: [
        { h: 'Volunteer at a local non-profit', p: 'Volunteer to gain practical experience.' },
        { h: 'Design Thinking Workshop', p: 'Participate in this workshop to enhance your skills.' },
      ],
    },
    {
      title: 'Phase 3: Apply',
      icon: (<img src={icon3} alt="Apply" className="w-5 h-5" />),
      items: [
        { h: 'Marketing Intern at a tech company', p: 'Apply for this internship to gain industry experience.' },
        { h: 'Junior Analyst Role', p: 'Apply for this entry-level position.' },
      ],
    },
    {
      title: 'Phase 4: Connect',
      icon: (<img src={iconGroup} alt="Connect" className="w-5 h-5" />),
      items: [
        { h: 'Join the Digital Marketing Community', p: 'Join this community to network with professionals.' },
        { h: 'Attend the Annual Tech Conference', p: 'Attend this event to meet industry leaders.' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#F7F7FA] text-[#0F0122]">
      {/* Top bar */}
      <NavBar />

      <main className="max-w-5xl mx-auto px-4">
        <section className="text-center pt-10 sm:pt-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">Your Personalized RoadMap</h1>
          <p className="mt-2 text-sm sm:text-base text-black/60">Crafted by your AI Growth Companion, this roadmap is your guide to achieving your career goals.</p>
        </section>

        <section className="relative mt-10 sm:mt-12 pb-16">
          {/* vertical timeline */}
          <div className="absolute left-8 top-0 bottom-0 hidden sm:block">
            <div className="h-full w-[2px] bg-gradient-to-b from-[color:rgba(0,103,255,0.35)] via-[color:rgba(106,0,177,0.35)] to-[color:rgba(0,0,0,0.1)] dashed-line" />
          </div>

          <div className="space-y-10">
            {phases.map((phase, pIdx) => (
              <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-[64px_1fr] gap-4">
                {/* phase icon dot */}
                <div className="hidden sm:flex items-start justify-center relative">
                  {/* Mask to break the timeline behind the icon */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-0 w-[6px] h-12 bg-[#F7F7FA]" />
                  <div className="relative z-10 w-10 h-10 rounded-full bg-[color:rgba(106,0,177,0.12)] grid place-items-center text-[color:var(--af-purple)] ring-1 ring-black/10">
                    {phase.icon}
                  </div>
                </div>

                {/* phase content */}
                <div>
                  <h2 className="font-bold text-lg sm:text-xl mb-3">{phase.title}</h2>
                  <div className="space-y-4">
                    {phase.items.map((it, iIdx) => (
                      <article key={iIdx} className="group rounded-2xl border border-black/10 bg-white p-3 sm:p-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.04)] card-raise">
                        <div className="pr-3">
                          <h3 className="text-sm font-extrabold">{it.h}</h3>
                          <p className="mt-0.5 text-xs text-black/60">{it.p}</p>
                        </div>
                        <button className="rounded-full bg-[#6A00B1] text-white w-8 h-8 grid place-items-center hover:bg-[color:rgba(106,0,177,0.08)] text-[color:var(--af-purple)] transition af-icon-btn">
                          <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}


