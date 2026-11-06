import { ArrowDown, ArrowUpRight } from "lucide-react";

const projects = [
  { n: "01", type: "RESIDENTIAL · BEDROOM", title: "A quieter kind of luxury.", copy: "A personal retreat shaped by warm timber, tactile finishes and soft, considered light.", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85", tag: "DESIGN DIRECTION" },
  { n: "02", type: "HOSPITALITY · BAR", title: "Made for the moment.", copy: "An exploration of atmosphere, material and light, designed around the experience of being there.", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1800&q=85", tag: "CONCEPT EXPLORATION" },
  { n: "03", type: "RESIDENTIAL · LIVING", title: "Room to feel at home.", copy: "Natural textures, balanced proportions and a warm neutral palette for everyday life.", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85", tag: "VISUAL INSPIRATION" }
];

const services = ["Interior design and space planning", "Residential interiors", "Hospitality, bars and lounges", "Renovation and interior finishing", "Design development and 3D visualisation"];

export default function Home() {
  return <main>
    <header className="topbar">
      <a className="logo" href="#top">MEETOO<span>®</span></a>
      <p className="top-label">INTERIOR DESIGN STUDIO <i /> UYO, NIGERIA</p>
      <nav><a href="#work">Selected work</a><a href="#approach">Our approach</a><a className="nav-cta" href="#contact">Start a conversation <ArrowUpRight size={14}/></a></nav>
    </header>
    <section className="hero" id="top">
      <div className="hero-photo"/><div className="hero-overlay"/>
      <div className="hero-copy"><p className="eyebrow pale">SPACES WITH PRESENCE</p><h1>More than<br/><em>a beautiful</em><br/>space.</h1>
        <div className="hero-bottom"><p>We shape thoughtful interiors around the way people live, gather and feel.</p><a className="circle-link" href="#work" aria-label="Explore selected work"><ArrowDown size={18}/></a></div>
      </div><span className="hero-caption">A CONSIDERED APPROACH TO INTERIORS</span>
    </section>
    <section className="intro section-pad" id="approach"><p className="eyebrow">THE MEETOO POINT OF VIEW</p><div className="intro-grid">
      <h2>Good design is<br/>felt <em>before</em><br/>it is explained.</h2>
      <div className="intro-copy"><p className="lead">A room can do more than look good. It can bring calm, create connection and give ordinary moments a sense of occasion.</p><p>MEETOO is an interior design studio exploring warm contemporary spaces through proportion, texture, light and purposeful detail. The best spaces are considered, personal and memorable.</p><a className="under-link" href="#contact">Tell us what you have in mind <ArrowUpRight size={15}/></a></div>
    </div></section>
    <section className="work section-pad" id="work"><div className="section-heading"><div><p className="eyebrow">A SELECTION OF SPACES</p><h2>Designed to <em>stay with you.</em></h2></div><p className="heading-note">A growing collection of interiors,<br/>ideas and design explorations.</p></div>
      <div className="project-list">{projects.map((p, i) => <article className={i === 1 ? "project reverse" : "project"} key={p.n}>
        <div className="project-visual"><img src={p.image} alt="Interior visual reference"/><span>{p.n}</span></div>
        <div className="project-copy"><p className="eyebrow">{p.type}</p><h3>{p.title}</h3><p>{p.copy}</p></div>
      </article>)}</div>
    </section>
    <section className="manifesto"><p className="eyebrow pale">OUR DESIGN PHILOSOPHY</p><h2>Everything<br/>starts from<br/><em>a line.</em></h2><p className="manifesto-note">From the first sketch to the final detail, every decision has a reason.</p></section>
    <section className="services section-pad"><p className="eyebrow">WHAT WE BRING TO THE TABLE</p><div className="services-grid"><h2>Spaces made<br/>with <em>intention.</em></h2><div>{services.map((s,i)=><div className="service-row" key={s}><span>0{i+1}</span><p>{s}</p><ArrowUpRight size={15}/></div>)}</div></div></section>
    <section className="contact" id="contact"><div className="contact-photo"/><div className="contact-overlay"/><div className="contact-copy"><p className="eyebrow pale">HAVE A SPACE IN MIND?</p><h2>Let's make<br/><em>something</em><br/>meaningful.</h2><p>Tell us what you are imagining. We would love to hear about the space you want to bring to life.</p><a className="contact-button" href="https://wa.me/2348141834638" target="_blank" rel="noreferrer">Talk to MEETOO on WhatsApp <ArrowUpRight size={16}/></a><a className="email" href="mailto:essienmfoniso65@gmail.com">essienmfoniso65@gmail.com</a></div></section>
    <footer className="footer"><a className="logo" href="#top">MEETOO<span>®</span></a><p>INTERIOR DESIGN STUDIO · UYO, NIGERIA</p><p>© 2026 MEETOO. SPACES WITH PRESENCE.</p></footer>
  </main>;
}