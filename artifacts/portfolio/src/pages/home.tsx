import { useRef } from "react";
import { type ReactNode } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, Linkedin, ExternalLink } from "lucide-react";
import aegisImg from "@assets/Screenshot_2026-05-30_194555_1781704594325.png";
import mizanImg from "@assets/HeroSection_1781704792199.png";
import fehmImg from "@assets/Screenshot_2026-04-04_205731_1781706021351.png";
import interviewImg from "@assets/Frame_1_1781704919363.png";
import firstaidImg from "@assets/Screenshot_2025-09-26_165355_1781705039799.png";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Char-by-char blur + slide reveal ────────────────────────────────────────
function SplitWord({
  word,
  startDelay = 0,
  className,
}: {
  word: string;
  startDelay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <span ref={ref} className={`inline-flex ${className ?? ""}`} aria-label={word}>
      {word.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 48, filter: "blur(6px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{
            duration: 0.55,
            delay: startDelay + i * 0.038,
            ease: EASE,
          }}
          style={{ display: "inline-block" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// ── Slide-up line reveal ─────────────────────────────────────────────────────
function RevealLine({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "106%" }}
        animate={isInView ? { y: "0%" } : {}}
        transition={{ duration: 0.8, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Fade + slide up ──────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Infinite marquee ─────────────────────────────────────────────────────────
const SKILLS = [
  "Python", "PyTorch", "React.js", "FastAPI", "Multi-Agent LLM", "Figma",
  "RAG Pipelines", "Redis", "Tailwind CSS", "Docker", "Hugging Face",
  "UX Research", "Firebase", "Groq API", "Transformers", "Celery", "TypeScript",
];

function Marquee() {
  return (
    <div className="relative overflow-hidden py-4 border-y border-border bg-card">
      <motion.div
        className="flex gap-10 whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...SKILLS, ...SKILLS].map((s, i) => (
          <span key={i} className="font-mono text-[0.6rem] text-foreground/40 uppercase tracking-[0.22em] flex items-center gap-4">
            {s}
            <span className="w-1 h-1 rounded-full bg-primary/50 inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Rotating circular text badge ─────────────────────────────────────────────
function RotatingBadge() {
  const text = "AI ENGINEER · PRODUCT DESIGNER · PAKISTAN · ";
  const chars = text.split("");
  const r = 52;
  const cx = 58;
  const cy = 58;
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      className="w-[116px] h-[116px] relative shrink-0 opacity-60"
      aria-hidden="true"
    >
      {chars.map((char, i) => {
        const angle = (i / chars.length) * 2 * Math.PI - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const rotate = (i / chars.length) * 360;
        return (
          <span
            key={i}
            className="absolute font-mono text-[0.5rem] text-foreground/60 tracking-wide"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
            }}
          >
            {char}
          </span>
        );
      })}
      {/* Center dot */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/50" />
    </motion.div>
  );
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col border-l border-border pl-4">
      <span className="font-serif text-2xl text-foreground">{number}</span>
      <span className="font-mono text-[0.58rem] text-foreground/40 uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}

// ── Engineering data ─────────────────────────────────────────────────────────
const engineeringProjects = [
  {
    index: "01",
    title: "Aegis",
    subtitle: "AI Flood Detection & Disaster Assistance",
    category: "AI / Full-Stack",
    year: "2025",
    description:
      "Real-time flood prediction pipeline for the Indus Basin using GEOGloWS V2 and NASA Power data. Automated routing maps 8 km danger zones and 25 km evacuation targets, with a live bilingual chatbot for rescue coordination.",
    stack: ["React / Vite", "FastAPI", "Firebase", "Groq LLM", "Python"],
    image: aegisImg,
    imgPosition: "object-top",
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
      "A 4-layer agent swarm — Supervisor, Teacher, Critic, Librarian — engineered to prevent code-dumps and force conceptual reasoning. Redis & Celery backend tracks real-time frustration indices and adapts teaching prompts dynamically.",
    stack: ["Python", "Redis", "Celery", "Multi-Agent LLM", "Affective Computing"],
    image: fehmImg,
    imgPosition: "object-top",
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
    imgPosition: "object-top",
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
      "Many candidates struggle due to financial limitations, social anxiety, and lack of practice partners. This platform gives everyone an AI coach — available anytime, infinitely patient.",
    tools: ["Figma", "UX Research", "Wireframing", "Prototyping"],
    image: interviewImg,
    imgPosition: "object-center",
    link: "https://www.behance.net/muhammad_taha55",
    linkLabel: "View on Behance",
  },
  {
    index: "05",
    title: "First Aid Learning",
    subtitle: "UX & UI Case Study",
    category: "UX / Product Design",
    year: "2025",
    description:
      "A modern, minimal platform to access step-by-step first aid guides, engage with community, and personalise learning. Designed around one truth: every second counts.",
    tools: ["Figma", "UX Research", "User Testing", "Interaction Design"],
    image: firstaidImg,
    imgPosition: "object-top",
    link: "https://www.behance.net/muhammad_taha55",
    linkLabel: "View on Behance",
  },
];

// ── Browser-frame project image ───────────────────────────────────────────────
function ProjectImage({
  src,
  alt,
  imgPosition = "object-top",
}: {
  src: string;
  alt: string;
  imgPosition?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div ref={ref} className="w-full rounded-sm overflow-hidden border border-border shadow-lg">
      {/* Browser chrome */}
      <div className="bg-muted border-b border-border px-3 py-2 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent/40" />
        <span className="w-2.5 h-2.5 rounded-full bg-primary/30" />
        <div className="ml-2 flex-1 bg-background/60 rounded-sm h-4 max-w-[200px]" />
      </div>
      {/* Screenshot */}
      <div className="h-[260px] md:h-[320px] overflow-hidden bg-muted relative">
        <motion.img
          src={src}
          alt={alt}
          style={{ y }}
          className={`absolute inset-0 w-full h-full object-cover ${imgPosition}`}
        />
      </div>
    </div>
  );
}

// ── Engineering project row ───────────────────────────────────────────────────
function ProjectRow({
  project,
  index,
}: {
  project: (typeof engineeringProjects)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const imgLeft = index % 2 === 0;

  return (
    <motion.article
      ref={ref}
      className="border-b border-border last:border-b-0 py-16 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center"
      data-testid={`project-${project.title.toLowerCase()}`}
    >
      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: imgLeft ? -30 : 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        className={imgLeft ? "order-1" : "order-1 md:order-2"}
      >
        <ProjectImage src={project.image} alt={project.title} imgPosition={project.imgPosition} />
      </motion.div>

      {/* Content */}
      <div className={`flex flex-col justify-center ${imgLeft ? "order-2" : "order-2 md:order-1"}`}>
        <div className="overflow-hidden mb-2">
          <motion.div
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
            className="flex items-center gap-3"
          >
            <span className="font-mono text-[0.6rem] text-primary tracking-[0.22em] uppercase">{project.index}</span>
            <span className="h-px w-4 bg-border" />
            <span className="font-mono text-[0.6rem] text-foreground/40 tracking-widest uppercase">{project.category}</span>
            <span className="font-mono text-[0.6rem] text-foreground/25 ml-auto">{project.year}</span>
          </motion.div>
        </div>

        <div className="overflow-hidden mb-1">
          <motion.h3
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : {}}
            transition={{ duration: 0.7, delay: 0.13, ease: EASE }}
            className="font-serif text-4xl md:text-5xl text-foreground leading-none"
          >
            {project.title}
          </motion.h3>
        </div>

        <div className="overflow-hidden mb-6">
          <motion.p
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : {}}
            transition={{ duration: 0.65, delay: 0.19, ease: EASE }}
            className="font-serif text-sm italic text-foreground/50"
          >
            {project.subtitle}
          </motion.p>
        </div>

        <FadeUp delay={0.28} className="text-sm text-foreground/65 leading-[1.85] mb-5">
          {project.description}
        </FadeUp>

        <FadeUp delay={0.34} className="flex flex-wrap gap-2 mb-8">
          {project.stack.map((tech) => (
            <span key={tech} className="font-mono text-[0.6rem] text-foreground/50 border border-border/80 px-2.5 py-1">
              {tech}
            </span>
          ))}
        </FadeUp>

        <FadeUp delay={0.4}>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="group/lnk inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors duration-200"
            data-testid={`project-link-${project.title.toLowerCase()}`}
          >
            <motion.span
              className="h-px bg-current inline-block"
              style={{ width: 24 }}
              whileHover={{ width: 44 }}
              transition={{ duration: 0.25 }}
            />
            {project.linkLabel}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5 transition-transform" />
          </a>
        </FadeUp>
      </div>
    </motion.article>
  );
}

// ── Design card ───────────────────────────────────────────────────────────────
function DesignCard({ project, index }: { project: (typeof designProjects)[0]; index: number }) {
  return (
    <FadeUp delay={index * 0.14}>
      <a
        href={project.link}
        target="_blank"
        rel="noreferrer"
        className="group block"
        data-testid={`design-card-${index}`}
      >
        {/* Image with browser frame */}
        <div className="mb-5 rounded-sm overflow-hidden border border-border shadow-md">
          <div className="bg-muted border-b border-border px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive/35" />
            <span className="w-2 h-2 rounded-full bg-accent/35" />
            <span className="w-2 h-2 rounded-full bg-primary/25" />
            <div className="ml-2 flex-1 bg-background/60 rounded-sm h-3.5 max-w-[160px]" />
            <ExternalLink className="w-3 h-3 text-foreground/20 ml-auto" />
          </div>
          <div className="h-[200px] md:h-[240px] overflow-hidden bg-muted relative">
            <img
              src={project.image}
              alt={`${project.title} design`}
              className={`absolute inset-0 w-full h-full object-cover ${project.imgPosition} transition-transform duration-700 group-hover:scale-[1.03]`}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/25 transition-colors duration-400 flex items-center justify-center">
              <span className="bg-background text-foreground font-mono text-[0.6rem] tracking-widest px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                View Case Study <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[0.58rem] text-primary tracking-[0.2em] uppercase block mb-1">
              {project.index} — {project.category}
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors duration-200">
              {project.title}
            </h3>
            <p className="font-serif text-sm italic text-foreground/45 mt-0.5">{project.subtitle}</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-foreground/25 group-hover:text-primary shrink-0 mt-1.5 transition-colors duration-200" />
        </div>

        <p className="text-sm text-foreground/60 mt-3 leading-[1.8]">{project.description}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {project.tools.map((t) => (
            <span key={t} className="font-mono text-[0.58rem] text-foreground/35 border border-border/60 px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>
      </a>
    </FadeUp>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="bg-background text-foreground font-sans selection:bg-primary/20">

      {/* Top progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-5 flex items-center justify-between">
        <motion.a
          href="#"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-[0.6rem] tracking-[0.22em] text-foreground/45 uppercase hover:text-primary transition-colors"
          data-testid="nav-home"
        >
          Muhammad Taha
        </motion.a>
        <motion.ul
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="hidden md:flex items-center gap-8 font-mono text-[0.6rem] tracking-[0.18em] text-foreground/45 uppercase"
        >
          <li><a href="#work" className="hover:text-primary transition-colors" data-testid="nav-work">Work</a></li>
          <li><a href="#design" className="hover:text-primary transition-colors" data-testid="nav-design">Design</a></li>
          <li><a href="#about" className="hover:text-primary transition-colors" data-testid="nav-about">About</a></li>
          <li>
            <a
              href="#contact"
              className="border border-foreground/20 px-4 py-2 hover:border-primary hover:text-primary transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </a>
          </li>
        </motion.ul>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-between px-6 md:px-12 lg:px-16 pt-24 pb-10 overflow-hidden">

        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-primary/4 blur-[240px]"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-15%] right-[-8%] w-[45vw] h-[45vw] rounded-full bg-border/60 blur-[200px]"
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        {/* Top row — year / role tag */}
        <div className="relative z-10 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-mono text-[0.6rem] tracking-[0.22em] text-foreground/35 uppercase flex items-center gap-3"
          >
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: 28 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-px bg-primary/60 inline-block"
            />
            Portfolio — 2026
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RotatingBadge />
          </motion.div>
        </div>

        {/* Middle — big name + info */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-6 md:py-0">
          
          {/* Split layout: Name (left/wide) + Info column (right) */}
          <div className="grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_380px] gap-8 md:gap-12 items-end">

            {/* Name */}
            <div>
              <div
                className="font-serif leading-[0.85] tracking-tight text-foreground select-none"
                style={{ fontSize: "clamp(3.8rem, 11vw, 10.5rem)" }}
                data-testid="hero-name"
              >
                <div>
                  <SplitWord word="Muhammad" startDelay={0.3} />
                </div>
                <div className="italic text-primary/90 mt-1">
                  <SplitWord word="Taha." startDelay={0.62} />
                </div>
              </div>

              {/* Animated rule */}
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, delay: 1.1, ease: EASE }}
                className="h-px bg-border mt-8"
              />
            </div>

            {/* Info column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0, ease: EASE }}
              className="flex flex-col gap-5 pb-1"
            >
              <div>
                <p className="font-mono text-[0.6rem] text-primary tracking-[0.22em] uppercase mb-2">Role</p>
                <p className="font-serif text-lg text-foreground leading-snug">
                  AI Engineer &amp; Product Designer
                </p>
              </div>

              <p className="text-sm text-foreground/60 leading-[1.85]" data-testid="hero-description">
                Building AI systems that reason and adapt — from adversarial legal engines to multi-agent tutors. Then designing the interfaces people use to interact with them.
              </p>

              {/* Stats */}
              <div className="flex gap-6 pt-1">
                <StatPill number="03" label="Engineering" />
                <StatPill number="02" label="Case Studies" />
                <StatPill number="02" label="Internships" />
              </div>

              {/* CTAs */}
              <div className="flex gap-3 pt-1">
                <a
                  href="#work"
                  className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] border border-foreground/20 px-4 py-2.5 hover:border-primary hover:text-primary transition-colors duration-200"
                  data-testid="hero-cta-work"
                >
                  View Work <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href="mailto:muhammadtaha0154@gmail.com"
                  className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] bg-foreground text-background px-4 py-2.5 hover:bg-primary transition-colors duration-200"
                  data-testid="hero-cta-email"
                >
                  Get in Touch
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom row — location + scroll hint */}
        <div className="relative z-10 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="font-mono text-[0.58rem] text-foreground/30 tracking-[0.18em] uppercase"
          >
            Gujranwala, Pakistan
          </motion.div>
          <motion.a
            href="#work"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="font-mono text-[0.58rem] text-foreground/30 tracking-[0.18em] uppercase flex items-center gap-2 hover:text-primary transition-colors"
            data-testid="hero-scroll"
          >
            Scroll
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="block"
            >
              ↓
            </motion.span>
          </motion.a>
        </div>
      </section>

      {/* ── SKILLS MARQUEE ──────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── ENGINEERING PROJECTS ────────────────────────────────────────────── */}
      <section id="work" className="py-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-12 pb-8 border-b border-border">
            <div>
              <RevealLine>
                <span className="font-mono text-[0.6rem] text-primary tracking-[0.22em] uppercase">Selected Work</span>
              </RevealLine>
              <RevealLine delay={0.07}>
                <h2 className="font-serif text-5xl md:text-7xl text-foreground mt-1">Engineering</h2>
              </RevealLine>
            </div>
            <span className="font-mono text-[0.58rem] text-foreground/25 tracking-widest hidden md:block">03 PROJECTS</span>
          </div>

          {engineeringProjects.map((p, i) => (
            <ProjectRow key={p.index} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* ── DESIGN CASE STUDIES ─────────────────────────────────────────────── */}
      <section id="design" className="py-20 px-6 md:px-12 lg:px-16 bg-card">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-12 pb-8 border-b border-border">
            <div>
              <RevealLine>
                <span className="font-mono text-[0.6rem] text-primary tracking-[0.22em] uppercase">UX Case Studies</span>
              </RevealLine>
              <RevealLine delay={0.07}>
                <h2 className="font-serif text-5xl md:text-7xl text-foreground mt-1">Design</h2>
              </RevealLine>
            </div>
            <a
              href="https://www.behance.net/muhammad_taha55"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[0.58rem] text-foreground/35 tracking-widest hover:text-primary transition-colors hidden md:flex items-center gap-2"
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

      {/* ── ABOUT + EXPERIENCE ──────────────────────────────────────────────── */}
      <section id="about" className="py-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* About */}
          <div>
            <RevealLine>
              <span className="font-mono text-[0.6rem] text-primary tracking-[0.22em] uppercase">About</span>
            </RevealLine>
            <RevealLine delay={0.07}>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mt-1 mb-8">The Builder</h2>
            </RevealLine>

            <FadeUp delay={0.12} className="space-y-4 text-sm text-foreground/65 leading-[1.85] mb-8">
              <p>
                Software Engineering student at HITEC University, Taxila — CGPA 3.20 / 4.00, graduating July 2026. Working at the intersection of AI architecture and product design.
              </p>
              <p>
                Holder of the Google UX Design Professional Certificate. I bring a designer's sensibility to engineering work and an engineer's precision to design work.
              </p>
            </FadeUp>

            <FadeUp delay={0.2} className="flex flex-wrap gap-2">
              {["Python", "PyTorch", "React.js", "FastAPI", "Figma", "Docker", "Firebase", "RAG"].map((s) => (
                <span key={s} className="font-mono text-[0.6rem] tracking-wider border border-border px-3 py-1.5 text-foreground/45">
                  {s}
                </span>
              ))}
            </FadeUp>
          </div>

          {/* Experience */}
          <div>
            <RevealLine>
              <span className="font-mono text-[0.6rem] text-primary tracking-[0.22em] uppercase">Experience</span>
            </RevealLine>
            <RevealLine delay={0.07}>
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
                    "Owned the full design-to-code pipeline, translating UX research into deployed architecture.",
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
                  <span className="font-mono text-[0.6rem] text-primary tracking-[0.18em] block mb-2 uppercase">
                    {exp.date}
                  </span>
                  <h3 className="font-serif text-xl text-foreground">{exp.role}</h3>
                  <p className="font-mono text-[0.58rem] text-foreground/35 mb-4 tracking-widest uppercase">{exp.company}</p>
                  <ul className="space-y-2">
                    {exp.items.map((item, j) => (
                      <li key={j} className="text-sm text-foreground/55 pl-3 border-l border-border/40 leading-[1.8]">
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

      {/* ── CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-32 px-6 md:px-12 lg:px-16 bg-foreground text-background overflow-hidden relative">

        {/* Ghost watermark */}
        <div
          className="pointer-events-none select-none absolute bottom-[-8%] right-[-4%] font-serif leading-none text-background/[0.035] tracking-tighter hidden lg:block"
          style={{ fontSize: "22vw" }}
          aria-hidden="true"
        >
          MT
        </div>

        <div className="pointer-events-none absolute top-[-20%] left-[-8%] w-[50vw] h-[50vw] rounded-full bg-primary/4 blur-[240px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[0.6rem] text-primary tracking-[0.22em] uppercase mb-8 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-primary" />
            Let's Build Together
          </motion.div>

          <div className="overflow-hidden mb-10">
            <motion.h2
              initial={{ y: "106%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: EASE }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-background leading-[1.05]"
            >
              Have something<br />
              <span className="italic text-primary">rigorous</span> in mind?
            </motion.h2>
          </div>

          <FadeUp delay={0.3}>
            <a
              href="mailto:muhammadtaha0154@gmail.com"
              className="group inline-flex items-center gap-3 font-serif text-xl md:text-2xl text-background border-b border-background/20 pb-2 hover:text-primary hover:border-primary transition-colors duration-300"
              data-testid="contact-email"
            >
              muhammadtaha0154@gmail.com
              <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </a>
          </FadeUp>

          <FadeUp delay={0.48}>
            <div className="mt-20 pt-8 border-t border-background/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <span className="font-mono text-[0.58rem] text-background/25 tracking-[0.22em] uppercase">
                © {new Date().getFullYear()} Muhammad Taha
              </span>
              <div className="flex items-center gap-8">
                <a
                  href="https://github.com/taha463"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-[0.6rem] text-background/35 hover:text-primary tracking-[0.18em] uppercase transition-colors"
                  data-testid="contact-github"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
                <a
                  href="https://linkedin.com/in/muhammadtaha02"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-[0.6rem] text-background/35 hover:text-primary tracking-[0.18em] uppercase transition-colors"
                  data-testid="contact-linkedin"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a
                  href="https://www.behance.net/muhammad_taha55"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-mono text-[0.6rem] text-background/35 hover:text-primary tracking-[0.18em] uppercase transition-colors"
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
