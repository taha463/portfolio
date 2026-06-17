import { useRef } from "react";
import { type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Mail, MapPin, ArrowUpRight, Github, Linkedin, ExternalLink } from "lucide-react";
import aegisImg from "@assets/Screenshot_2026-05-30_194555_1781704594325.png";
import mizanImg from "@assets/HeroSection_1781704792199.png";
import fehmImg from "@assets/Screenshot_2026-02-27_190801_1781704904460.png";
import interviewImg from "@assets/Frame_1_1781704919363.png";
import firstaidImg from "@assets/Screenshot_2025-09-26_165355_1781705039799.png";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Clip-path slide-up text reveal ──────────────────────────────────────────
function RevealLine({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "108%" }}
        animate={isInView ? { y: "0%" } : {}}
        transition={{ duration: 0.85, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Fade + slide up reveal ───────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Infinite marquee ticker ──────────────────────────────────────────────────
const SKILLS = [
  "Python", "PyTorch", "React.js", "FastAPI", "Multi-Agent LLM", "Figma",
  "RAG Pipelines", "Redis", "Tailwind CSS", "Docker", "Hugging Face",
  "UX Research", "Firebase", "Groq API", "Transformers", "Celery", "TypeScript",
];

function Marquee() {
  return (
    <div className="relative overflow-hidden py-5 border-y border-border bg-card">
      <motion.div
        className="flex gap-12 whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...SKILLS, ...SKILLS].map((s, i) => (
          <span
            key={i}
            className="font-mono text-xs text-foreground/50 uppercase tracking-[0.18em] flex items-center gap-4"
          >
            {s}
            <span className="w-1 h-1 rounded-full bg-primary/60 inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Parallax image ───────────────────────────────────────────────────────────
function ParallaxImg({ src, alt }: { src: string; alt: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className="w-full h-full overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="w-full h-full object-cover object-top scale-[1.18]"
      />
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const engineeringProjects = [
  {
    index: "01",
    title: "Aegis",
    subtitle: "AI Flood Detection & Disaster Assistance",
    category: "AI / Full-Stack",
    year: "2025",
    description:
      "Real-time flood prediction pipeline for the Indus Basin using GEOGloWS V2 and NASA Power data. Automated routing maps 8 km danger zones and 25 km evacuation targets, paired with a bilingual chatbot for live rescue coordination.",
    stack: ["React / Vite", "FastAPI", "Firebase", "Groq LLM", "Python"],
    image: aegisImg,
    link: "https://aegis-frontend-8jn6.onrender.com/",
    linkLabel: "View Live Site",
  },
  {
    index: "02",
    title: "FEHM.AI",
    subtitle: "Autonomous Socratic Tutoring Engine",
    category: "AI / Multi-Agent",
    year: "2026",
    description:
      "A 4-layer agent swarm — Supervisor, Teacher, Critic, Librarian — designed to prevent code-dumps and force conceptual reasoning. Redis & Celery backend tracks real-time frustration indices and dynamically adapts teaching prompts.",
    stack: ["Python", "Redis", "Celery", "Multi-Agent LLM", "Affective Computing"],
    image: fehmImg,
    link: "https://github.com/taha463/fehm-ai-engine",
    linkLabel: "View on GitHub",
  },
  {
    index: "03",
    title: "Mizan",
    subtitle: "Adversarial Legal Reasoning System",
    category: "NLP / Legal Tech",
    year: "2025",
    description:
      "Adversarial framework on a Mistral base that aggressively reduces hallucinations in legal reasoning. A courtroom-logic gating module with causal cross-attention strictly evaluates LLM outputs against source depositions.",
    stack: ["Python", "LLM Inference", "Causal Cross-Attention", "Mistral"],
    image: mizanImg,
    link: "https://github.com/taha463/Mizan-A",
    linkLabel: "View on GitHub",
  },
];

const designProjects = [
  {
    index: "04",
    title: "AI Interview Prep",
    subtitle: "UX & UI Case Study",
    category: "UX / Product Design",
    year: "2025",
    description:
      "Many candidates struggle with interview preparation due to financial limitations, social anxiety, and lack of practice partners. This platform gives everyone an AI coach — available anytime, infinitely patient, brutally honest.",
    tools: ["Figma", "UX Research", "Wireframing", "Prototyping"],
    image: interviewImg,
    link: "https://www.behance.net/muhammad_taha55",
    linkLabel: "View Case Study on Behance",
  },
  {
    index: "05",
    title: "First Aid Learning",
    subtitle: "UX & UI Case Study",
    category: "UX / Product Design",
    year: "2025",
    description:
      "A modern, minimal platform where users can access step-by-step first aid guides, engage with a community, and personalise their learning. Designed around the principle that in an emergency, every second counts.",
    tools: ["Figma", "UX Research", "User Testing", "Interaction Design"],
    image: firstaidImg,
    link: "https://www.behance.net/muhammad_taha55",
    linkLabel: "View Case Study on Behance",
  },
];

// ── Engineering project row ──────────────────────────────────────────────────
function ProjectRow({ project, index }: { project: (typeof engineeringProjects)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  const imgLeft = index % 2 === 0;

  return (
    <motion.article
      ref={ref}
      className="group border-b border-border last:border-b-0 py-20 grid md:grid-cols-[1fr_1fr] gap-10 md:gap-20 items-center"
      data-testid={`project-${project.title.toLowerCase()}`}
    >
      {/* Screenshot */}
      <div
        className={`relative overflow-hidden rounded-none shadow-xl ${imgLeft ? "order-1" : "order-1 md:order-2"}`}
        style={{ aspectRatio: "16/10" }}
      >
        <motion.div
          initial={{ scale: 1.06, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 1, ease: EASE }}
          className="w-full h-full"
        >
          <div className="w-full h-full overflow-hidden">
            <motion.img
              src={project.image}
              alt={`${project.title} screenshot`}
              style={{ y: imgY }}
              className="w-full h-full object-cover object-top scale-[1.16]"
            />
          </div>
        </motion.div>

        {/* Corner accent */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/60" />
      </div>

      {/* Text content */}
      <div className={`flex flex-col ${imgLeft ? "order-2" : "order-2 md:order-1"}`}>
        <div className="overflow-hidden mb-2">
          <motion.div
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : {}}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="flex items-center gap-3"
          >
            <span className="font-mono text-xs text-primary tracking-[0.2em] uppercase">{project.index}</span>
            <span className="h-px w-4 bg-border" />
            <span className="font-mono text-xs text-foreground/40 tracking-widest uppercase">{project.category}</span>
            <span className="font-mono text-xs text-foreground/30 ml-auto">{project.year}</span>
          </motion.div>
        </div>

        <div className="overflow-hidden mb-1">
          <motion.h3
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : {}}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
            className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] text-foreground leading-none"
          >
            {project.title}
          </motion.h3>
        </div>

        <div className="overflow-hidden mb-6">
          <motion.p
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : {}}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            className="font-serif text-base italic text-foreground/55"
          >
            {project.subtitle}
          </motion.p>
        </div>

        <FadeUp delay={0.3} className="text-sm text-foreground/65 leading-[1.8] mb-6">
          {project.description}
        </FadeUp>

        <FadeUp delay={0.38} className="flex flex-wrap gap-2 mb-8">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[0.68rem] text-foreground/50 border border-border px-2.5 py-1 tracking-wide"
            >
              {tech}
            </span>
          ))}
        </FadeUp>

        <FadeUp delay={0.44}>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground group/link"
            data-testid={`project-link-${project.title.toLowerCase()}`}
          >
            <motion.span
              className="h-px bg-foreground inline-block"
              initial={{ width: 24 }}
              whileHover={{ width: 48 }}
              transition={{ duration: 0.3 }}
            />
            <span className="group-hover/link:text-primary transition-colors duration-200">
              {project.linkLabel}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:text-primary group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-200" />
          </a>
        </FadeUp>
      </div>
    </motion.article>
  );
}

// ── Design case study card ───────────────────────────────────────────────────
function DesignCard({ project, index }: { project: (typeof designProjects)[0]; index: number }) {
  return (
    <FadeUp delay={index * 0.15}>
      <a
        href={project.link}
        target="_blank"
        rel="noreferrer"
        className="group block"
        data-testid={`design-card-${index}`}
      >
        {/* Image */}
        <div className="relative overflow-hidden mb-5" style={{ aspectRatio: "16/10" }}>
          <img
            src={project.image}
            alt={`${project.title} design`}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Hover reveal */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-400 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="bg-background text-foreground font-mono text-xs tracking-widest px-4 py-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              View on Behance <ExternalLink className="w-3 h-3" />
            </motion.div>
          </div>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
        </div>

        {/* Meta */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[0.65rem] text-primary tracking-[0.2em] uppercase block mb-1">
              {project.index} — {project.category} · {project.year}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors duration-200 leading-tight">
              {project.title}
            </h3>
            <p className="font-serif text-sm italic text-foreground/50 mt-0.5">{project.subtitle}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-foreground/25 group-hover:text-primary shrink-0 mt-1 transition-colors duration-200" />
        </div>

        <p className="text-sm text-foreground/60 mt-3 leading-[1.75]">{project.description}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {project.tools.map((t) => (
            <span key={t} className="font-mono text-[0.65rem] text-foreground/40 border border-border/70 px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>
      </a>
    </FadeUp>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground">

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-5 flex items-center justify-between">
        <motion.a
          href="#"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-[0.65rem] tracking-[0.22em] text-foreground/50 uppercase hover:text-primary transition-colors"
          data-testid="nav-home"
        >
          Muhammad Taha
        </motion.a>

        <motion.ul
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="hidden md:flex items-center gap-8 font-mono text-[0.65rem] tracking-[0.18em] text-foreground/50 uppercase"
        >
          <li><a href="#work" className="hover:text-primary transition-colors duration-200" data-testid="nav-work">Work</a></li>
          <li><a href="#design" className="hover:text-primary transition-colors duration-200" data-testid="nav-design">Design</a></li>
          <li><a href="#about" className="hover:text-primary transition-colors duration-200" data-testid="nav-about">About</a></li>
          <li>
            <a
              href="#contact"
              className="border border-foreground/20 px-4 py-2 hover:border-primary hover:text-primary transition-colors duration-200"
              data-testid="nav-contact"
            >
              Contact
            </a>
          </li>
        </motion.ul>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-end pb-16 px-6 md:px-12 lg:px-16 pt-28 overflow-hidden">

        {/* Ghost monogram */}
        <div
          className="pointer-events-none select-none absolute top-[12%] right-[-4%] font-serif leading-none text-foreground/[0.04] tracking-tighter hidden lg:block"
          style={{ fontSize: "24vw" }}
          aria-hidden="true"
        >
          MT
        </div>

        {/* Warm gradient blob */}
        <div className="pointer-events-none absolute top-[15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/8 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-secondary/40 blur-[120px]" />

        <div className="relative z-10 max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-mono text-[0.65rem] text-primary tracking-[0.22em] uppercase mb-8 flex items-center gap-3"
            data-testid="hero-label"
          >
            <span className="h-px w-8 bg-primary" />
            AI Engineer &amp; Product Designer — Gujranwala, Pakistan
          </motion.div>

          {/* Big name */}
          <h1
            className="font-serif leading-[0.88] tracking-tight text-foreground mb-12"
            style={{ fontSize: "clamp(4rem, 13vw, 12rem)" }}
            data-testid="hero-name"
          >
            <RevealLine delay={0.1}>Muhammad</RevealLine>
            <RevealLine delay={0.22}>
              <span className="italic">Taha.</span>
            </RevealLine>
          </h1>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-5xl">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              className="text-lg md:text-xl text-foreground/65 max-w-md leading-[1.7]"
              data-testid="hero-description"
            >
              Building AI systems that reason, adapt, and make decisions — from adversarial legal engines to multi-agent tutors. Then designing the interfaces people use to interact with them.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
              className="flex gap-3 shrink-0"
            >
              <a
                href="#work"
                className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground/60 border border-border px-4 py-3 hover:border-primary hover:text-primary transition-colors duration-200"
                data-testid="hero-cta-work"
              >
                View Work <ArrowUpRight className="w-3 h-3" />
              </a>
              <a
                href="mailto:muhammadtaha0154@gmail.com"
                className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] bg-foreground text-background px-4 py-3 hover:bg-primary transition-colors duration-200"
                data-testid="hero-cta-email"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-6 right-6 md:right-12 lg:right-16 font-mono text-[0.6rem] text-foreground/30 tracking-[0.22em] uppercase flex items-center gap-2"
          >
            Scroll
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="block"
            >
              ↓
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* ── SKILLS TICKER ────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── ENGINEERING PROJECTS ─────────────────────────────────────────── */}
      <section id="work" className="py-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="flex items-end justify-between mb-12 pb-8 border-b border-border">
            <div>
              <RevealLine>
                <span className="font-mono text-[0.65rem] text-primary tracking-[0.22em] uppercase">Selected Work</span>
              </RevealLine>
              <RevealLine delay={0.06}>
                <h2 className="font-serif text-5xl md:text-7xl text-foreground mt-1">Engineering</h2>
              </RevealLine>
            </div>
            <span className="font-mono text-[0.65rem] text-foreground/30 tracking-widest hidden md:block">
              03 PROJECTS
            </span>
          </div>

          {engineeringProjects.map((p, i) => (
            <ProjectRow key={p.index} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* ── DESIGN CASE STUDIES ──────────────────────────────────────────── */}
      <section id="design" className="py-20 px-6 md:px-12 lg:px-16 bg-card">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-12 pb-8 border-b border-border">
            <div>
              <RevealLine>
                <span className="font-mono text-[0.65rem] text-primary tracking-[0.22em] uppercase">UX Case Studies</span>
              </RevealLine>
              <RevealLine delay={0.06}>
                <h2 className="font-serif text-5xl md:text-7xl text-foreground mt-1">Design</h2>
              </RevealLine>
            </div>
            <a
              href="https://www.behance.net/muhammad_taha55"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[0.65rem] text-foreground/40 tracking-widest hover:text-primary transition-colors hidden md:flex items-center gap-2"
              data-testid="behance-profile"
            >
              Full profile on Behance <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {designProjects.map((p, i) => (
              <DesignCard key={p.index} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT + EXPERIENCE ───────────────────────────────────────────── */}
      <section id="about" className="py-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* About */}
          <div>
            <RevealLine>
              <span className="font-mono text-[0.65rem] text-primary tracking-[0.22em] uppercase">About</span>
            </RevealLine>
            <RevealLine delay={0.06}>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mt-1 mb-8">The Builder</h2>
            </RevealLine>

            <FadeUp delay={0.1} className="space-y-4 text-sm text-foreground/65 leading-[1.85] mb-8">
              <p>
                Software Engineering student at HITEC University, Taxila (CGPA 3.20 / 4.00, graduating July 2026). Working at the intersection of AI architecture and product design — building systems that are both technically rigorous and humanly usable.
              </p>
              <p>
                Holder of the Google UX Design Professional Certificate. I bring a designer's sensibility to engineering work and an engineer's precision to design work.
              </p>
            </FadeUp>

            <FadeUp delay={0.2} className="flex flex-wrap gap-2">
              {["Python", "PyTorch", "React.js", "FastAPI", "Figma", "Docker", "Firebase", "RAG"].map((s) => (
                <span key={s} className="font-mono text-[0.65rem] tracking-wider border border-border px-3 py-1.5 text-foreground/50">
                  {s}
                </span>
              ))}
            </FadeUp>
          </div>

          {/* Experience */}
          <div>
            <RevealLine>
              <span className="font-mono text-[0.65rem] text-primary tracking-[0.22em] uppercase">Experience</span>
            </RevealLine>
            <RevealLine delay={0.06}>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mt-1 mb-8">Timeline</h2>
            </RevealLine>

            <div className="border-l border-border ml-2 space-y-0">
              {[
                {
                  date: "Jul – Aug 2025",
                  role: "AI Web Dev Intern",
                  company: "Nexium",
                  items: [
                    "Integrated LLM APIs into production web systems, shipping React.js components end-to-end.",
                    "Translated high-fidelity Figma specs into responsive UI within strict agile sprint cycles.",
                  ],
                },
                {
                  date: "May – Jun 2025",
                  role: "UX / Web Dev Intern",
                  company: "Elevvo Pathways",
                  items: [
                    "Owned the full design-to-code pipeline, translating UX research into deployed frontend architecture.",
                    "Delivered frontend components and design artifacts for an ed-tech platform.",
                  ],
                },
              ].map((exp, i) => (
                <FadeUp
                  key={i}
                  delay={i * 0.15}
                  className="relative pl-8 pb-10 last:pb-0"
                >
                  <div className="absolute w-2.5 h-2.5 bg-primary rotate-45 -left-[5.5px] top-0.5" />
                  <span className="font-mono text-[0.65rem] text-primary tracking-[0.18em] block mb-2 uppercase">
                    {exp.date}
                  </span>
                  <h3 className="font-serif text-xl text-foreground">{exp.role}</h3>
                  <p className="font-mono text-[0.65rem] text-foreground/40 mb-4 tracking-widest uppercase">{exp.company}</p>
                  <ul className="space-y-2">
                    {exp.items.map((item, j) => (
                      <li key={j} className="text-sm text-foreground/60 pl-3 border-l border-border/50 leading-[1.75]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-32 px-6 md:px-12 lg:px-16 bg-foreground text-background overflow-hidden relative">

        {/* Ghost monogram */}
        <div
          className="pointer-events-none select-none absolute bottom-[-5%] right-[-2%] font-serif leading-none text-background/[0.04] tracking-tighter hidden lg:block"
          style={{ fontSize: "22vw" }}
          aria-hidden="true"
        >
          MT
        </div>

        {/* Warm tint blobs */}
        <div className="pointer-events-none absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[160px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[0.65rem] text-primary tracking-[0.22em] uppercase mb-8 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-primary" />
            Let's Build Together
          </motion.div>

          <div className="overflow-hidden mb-10">
            <motion.h2
              initial={{ y: "108%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-background leading-[1.05]"
            >
              Have something<br />
              <span className="italic text-primary">rigorous</span> in mind?
            </motion.h2>
          </div>

          <FadeUp delay={0.35}>
            <a
              href="mailto:muhammadtaha0154@gmail.com"
              className="group inline-flex items-center gap-3 font-serif text-xl md:text-2xl text-background border-b border-background/25 pb-2 hover:text-primary hover:border-primary transition-colors duration-300"
              data-testid="contact-email"
            >
              muhammadtaha0154@gmail.com
              <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </a>
          </FadeUp>

          <FadeUp delay={0.5}>
            <div className="mt-20 pt-8 border-t border-background/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <span className="font-mono text-[0.65rem] text-background/30 tracking-[0.22em] uppercase">
                © {new Date().getFullYear()} Muhammad Taha
              </span>
              <div className="flex items-center gap-8">
                <a
                  href="https://github.com/taha463"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-[0.65rem] text-background/40 hover:text-primary tracking-[0.18em] uppercase transition-colors"
                  data-testid="contact-github"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
                <a
                  href="https://linkedin.com/in/muhammadtaha02"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-[0.65rem] text-background/40 hover:text-primary tracking-[0.18em] uppercase transition-colors"
                  data-testid="contact-linkedin"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a
                  href="https://www.behance.net/muhammad_taha55"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-[0.65rem] text-background/40 hover:text-primary tracking-[0.18em] uppercase transition-colors"
                  data-testid="contact-behance"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Behance
                </a>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
