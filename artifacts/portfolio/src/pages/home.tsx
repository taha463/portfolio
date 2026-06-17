import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Mail, MapPin, Terminal, BrainCircuit, Code2, Database, LayoutTemplate, Layers, GitBranch, ShieldAlert, ArrowUpRight, Github, Linkedin } from "lucide-react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      
      {/* Abstract warm gradient blobs in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent/20 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-primary/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 right-6 z-50 mix-blend-difference">
        <ul className="flex items-center gap-6 text-sm font-mono text-foreground bg-background/50 backdrop-blur-md px-6 py-3 rounded-none border border-foreground/10 shadow-sm">
          <li><a href="#projects" className="hover:text-primary transition-colors" data-testid="nav-projects">Projects</a></li>
          <li><a href="#experience" className="hover:text-primary transition-colors" data-testid="nav-experience">Experience</a></li>
          <li><a href="#skills" className="hover:text-primary transition-colors" data-testid="nav-skills">Skills</a></li>
          <li><a href="#contact" className="hover:text-primary transition-colors" data-testid="nav-contact">Contact</a></li>
        </ul>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="min-h-[100dvh] flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-24 pb-12" id="hero">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl"
          >
            <div className="flex items-center gap-4 mb-6 font-mono text-sm md:text-base text-primary">
              <span className="h-px w-12 bg-primary"></span>
              <span data-testid="hero-role">AI ENGINEER & RESEARCHER</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-foreground leading-[0.9] tracking-tight mb-8" data-testid="hero-name">
              Muhammad <br />
              <span className="italic text-foreground/80">Taha.</span>
            </h1>
            
            <div className="grid md:grid-cols-2 gap-12 mt-12 md:mt-24">
              <div className="space-y-6 text-lg text-foreground/80 font-sans max-w-lg leading-relaxed" data-testid="hero-summary">
                <p>
                  Software Engineering student focused on building robust AI architectures, specifically Multi-Agent Systems and Neural Networks. 
                </p>
                <p>
                  Experienced in developing full-stack applications from Figma prototypes to production environments. Committed to rigorous technical logic, optimizing backend infrastructure, and refusing to settle for average project results.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 font-mono text-sm text-foreground/60 justify-end md:items-end">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span data-testid="hero-location">Gujranwala, Pakistan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span data-testid="hero-email">muhammadtaha0154@gmail.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SKILLS SECTION */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-card border-y border-border" id="skills">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-serif mb-16 text-foreground">The Workshop.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
              
              {/* AI / ML Block */}
              <div className="md:col-span-2 bg-background border border-border p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110 duration-700">
                  <BrainCircuit className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-mono text-sm tracking-widest text-primary mb-6">01 // AI & MACHINE LEARNING</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 font-serif text-2xl md:text-3xl text-foreground/90">
                    <span>Python</span>
                    <span className="text-border">/</span>
                    <span>PyTorch</span>
                    <span className="text-border">/</span>
                    <span>Hugging Face</span>
                    <span className="text-border">/</span>
                    <span>Transformers</span>
                    <span className="text-border">/</span>
                    <span>Unsloth</span>
                    <span className="text-border">/</span>
                    <span className="italic text-primary">RAG Pipelines</span>
                    <span className="text-border">/</span>
                    <span>Groq API</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure Block */}
              <div className="bg-foreground text-background p-8 relative overflow-hidden group">
                <div className="absolute -bottom-12 -right-12 text-background/10 transition-transform group-hover:rotate-12 duration-700">
                  <Database className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-mono text-sm tracking-widest text-secondary mb-6">02 // INFRASTRUCTURE</h3>
                  <ul className="space-y-3 font-mono text-sm text-background/80">
                    <li className="flex items-center gap-3"><Terminal className="w-4 h-4 text-secondary"/> FastAPI</li>
                    <li className="flex items-center gap-3"><Layers className="w-4 h-4 text-secondary"/> Redis & Celery</li>
                    <li className="flex items-center gap-3"><LayoutTemplate className="w-4 h-4 text-secondary"/> Docker</li>
                    <li className="flex items-center gap-3"><Database className="w-4 h-4 text-secondary"/> Firebase & Supabase</li>
                    <li className="flex items-center gap-3"><GitBranch className="w-4 h-4 text-secondary"/> Git & Cypress</li>
                  </ul>
                </div>
              </div>

              {/* Frontend Block */}
              <div className="md:col-span-3 bg-secondary/30 border border-border p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm tracking-widest text-primary mb-4">03 // FRONT-END & DESIGN</h3>
                  <p className="font-serif text-xl md:text-2xl text-foreground max-w-2xl leading-snug">
                    Bridging complex logic with human interfaces using React.js, Tailwind, JavaScript, Figma, UX Research, Wireframing, and Prototyping.
                  </p>
                </div>
                <Code2 className="w-16 h-16 text-primary/40 shrink-0" />
              </div>

            </div>
          </motion.div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="py-32 px-6 md:px-12 lg:px-24" id="projects">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"
            >
              <h2 className="text-4xl md:text-6xl font-serif text-foreground leading-none">Architectures <br/><span className="italic text-foreground/60">& Systems</span></h2>
              <p className="font-mono text-sm text-foreground/60 max-w-sm">Selected works demonstrating adversarial logic, autonomous agents, and real-time inference.</p>
            </motion.div>

            <div className="space-y-24">
              
              {/* Project 1: Mizan */}
              <motion.article 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative grid md:grid-cols-12 gap-8 items-center"
                data-testid="project-mizan"
              >
                <div className="md:col-span-7 bg-foreground text-background p-12 md:p-16 aspect-square md:aspect-auto md:h-[500px] flex flex-col justify-between">
                  <ShieldAlert className="w-12 h-12 text-secondary mb-8" />
                  <div>
                    <h3 className="text-4xl md:text-5xl font-serif mb-6">Mizan</h3>
                    <p className="text-background/80 font-sans text-lg leading-relaxed">
                      Adversarial framework built on a Mistral base to aggressively reduce hallucinations in legal reasoning. Developed a 'courtroom logic' gating module with causal cross-attention to strictly evaluate LLM outputs against source depositions.
                    </p>
                  </div>
                </div>
                <div className="md:col-span-5 flex flex-col justify-center space-y-6 pl-0 md:pl-8">
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-primary uppercase tracking-widest">Domain</span>
                    <p className="font-serif text-xl">Legal Tech / NLP</p>
                  </div>
                  <div className="space-y-2 border-t border-border pt-6">
                    <span className="font-mono text-xs text-primary uppercase tracking-widest">Stack</span>
                    <ul className="font-mono text-sm space-y-1 text-foreground/80">
                      <li>Python</li>
                      <li>LLM Inference</li>
                      <li>Causal Cross-Attention</li>
                    </ul>
                  </div>
                </div>
              </motion.article>

              {/* Project 2: FEHM.AI */}
              <motion.article 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative grid md:grid-cols-12 gap-8 items-center"
                data-testid="project-fehm"
              >
                <div className="md:col-span-5 flex flex-col justify-center space-y-6 pr-0 md:pr-8 order-2 md:order-1 text-right md:text-left">
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-primary uppercase tracking-widest">Domain</span>
                    <p className="font-serif text-xl">Ed-Tech / Multi-Agent</p>
                  </div>
                  <div className="space-y-2 border-t border-border pt-6">
                    <span className="font-mono text-xs text-primary uppercase tracking-widest">Stack</span>
                    <ul className="font-mono text-sm space-y-1 text-foreground/80">
                      <li>Python, Multi-Agent LLM</li>
                      <li>Redis, Celery</li>
                      <li>Affective Computing</li>
                    </ul>
                  </div>
                </div>
                <div className="md:col-span-7 bg-card border border-border p-12 md:p-16 aspect-square md:aspect-auto md:h-[500px] flex flex-col justify-between order-1 md:order-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
                  <BrainCircuit className="w-12 h-12 text-primary mb-8 relative z-10" />
                  <div className="relative z-10">
                    <h3 className="text-4xl md:text-5xl font-serif mb-6 text-foreground">FEHM.AI</h3>
                    <p className="text-foreground/70 font-sans text-lg leading-relaxed">
                      Autonomous tutoring engine utilizing a 4-layer agent swarm (Supervisor, Teacher, Critic, Librarian) to prevent 'code dumps' and force conceptual reasoning. Tracks real-time frustration indices to dynamically adapt teaching prompts.
                    </p>
                  </div>
                </div>
              </motion.article>

              {/* Project 3: Aegis */}
              <motion.article 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative"
                data-testid="project-aegis"
              >
                <div className="bg-secondary/40 border border-secondary p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
                  <div className="md:w-1/2">
                    <div className="flex items-center gap-4 mb-8">
                      <MapPin className="w-8 h-8 text-primary" />
                      <h3 className="text-4xl md:text-5xl font-serif text-foreground">Aegis</h3>
                    </div>
                    <p className="text-foreground/80 font-sans text-lg leading-relaxed mb-8">
                      Engineered a real-time prediction pipeline for the Indus Basin using GEOGloWS V2 and NASA Power data. Designed an automated routing system mapping danger zones and evacuation targets, paired with a real-time bilingual chatbot for rescue operations.
                    </p>
                    <div className="flex flex-wrap gap-3 font-mono text-xs">
                      <span className="px-3 py-1 border border-primary/30 text-primary">React/Vite</span>
                      <span className="px-3 py-1 border border-primary/30 text-primary">FastAPI</span>
                      <span className="px-3 py-1 border border-primary/30 text-primary">Firebase</span>
                      <span className="px-3 py-1 border border-primary/30 text-primary">Groq LLM</span>
                      <span className="px-3 py-1 border border-primary/30 text-primary">Python</span>
                    </div>
                  </div>
                  <div className="md:w-1/2 flex justify-center">
                    <div className="w-full max-w-sm aspect-square border border-foreground/10 bg-background relative flex items-center justify-center p-8">
                       <div className="absolute inset-4 border border-dashed border-foreground/20 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }} />
                       <div className="absolute inset-12 border border-foreground/10 rounded-full animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                       <div className="text-center font-mono text-sm text-foreground/50">
                         8km Danger Zone<br/>
                         25km Evacuation Target
                       </div>
                    </div>
                  </div>
                </div>
              </motion.article>

            </div>
          </div>
        </section>

        {/* EXPERIENCE & EDUCATION SECTION */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-card border-y border-border" id="experience">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-24">
            
            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif text-foreground mb-12 flex items-center gap-4">
                <span className="w-8 h-px bg-primary block"></span>
                Experience
              </h2>
              
              <div className="space-y-16">
                <div className="relative pl-8 border-l border-border" data-testid="exp-nexium">
                  <div className="absolute w-3 h-3 bg-primary -left-[6.5px] top-2 rounded-none transform rotate-45" />
                  <span className="font-mono text-xs text-primary mb-2 block">JUL – AUG 2025</span>
                  <h3 className="text-xl font-serif text-foreground mb-1">AI Web Dev Intern</h3>
                  <p className="font-mono text-sm text-foreground/60 mb-4">Nexium</p>
                  <ul className="text-foreground/80 space-y-3 text-sm font-sans leading-relaxed list-none">
                    <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-px before:bg-foreground/40">
                      Integrated LLM APIs into production web systems, shipping React.js components end-to-end.
                    </li>
                    <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-px before:bg-foreground/40">
                      Translated high-fidelity Figma specifications into responsive UI components within strict agile sprint cycles.
                    </li>
                  </ul>
                </div>

                <div className="relative pl-8 border-l border-border" data-testid="exp-elevvo">
                  <div className="absolute w-3 h-3 bg-border -left-[6.5px] top-2 rounded-none transform rotate-45" />
                  <span className="font-mono text-xs text-foreground/50 mb-2 block">MAY – JUN 2025</span>
                  <h3 className="text-xl font-serif text-foreground mb-1">UX/Web Dev Intern</h3>
                  <p className="font-mono text-sm text-foreground/60 mb-4">Elevvo Pathways</p>
                  <ul className="text-foreground/80 space-y-3 text-sm font-sans leading-relaxed list-none">
                    <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-px before:bg-foreground/40">
                      Owned the full design-to-code pipeline, translating UX research into deployed frontend architecture.
                    </li>
                    <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-px before:bg-foreground/40">
                      Delivered functional front-end components and design artifacts specifically tailored for an ed-tech platform.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Education & Certs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-16"
            >
              <div>
                <h2 className="text-3xl font-serif text-foreground mb-12 flex items-center gap-4">
                  <span className="w-8 h-px bg-primary block"></span>
                  Education
                </h2>
                <div className="bg-background border border-border p-8" data-testid="education-hitec">
                  <h3 className="text-xl font-serif text-foreground mb-2">B.Sc. Software Engineering</h3>
                  <p className="font-mono text-sm text-foreground/60 mb-6">HITEC University, Taxila | Sep 2022 – July 2026</p>
                  <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 text-primary font-mono text-sm px-4 py-2">
                    CGPA: 3.20 / 4.00
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-serif text-foreground mb-12 flex items-center gap-4">
                  <span className="w-8 h-px bg-primary block"></span>
                  Certifications
                </h2>
                <div className="bg-secondary/30 border border-secondary/50 p-8" data-testid="cert-google">
                  <h3 className="text-lg font-serif text-foreground mb-2">Google UX Design Professional Certificate</h3>
                  <p className="font-mono text-sm text-foreground/60">Google / Coursera | Aug 2024</p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="py-32 px-6 md:px-12 lg:px-24 bg-foreground text-background" id="contact">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto text-center"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-12">Let's build something <span className="italic text-primary">rigorous.</span></h2>
            
            <a 
              href="mailto:muhammadtaha0154@gmail.com" 
              className="inline-flex items-center justify-center gap-4 text-xl md:text-3xl font-serif border-b-2 border-primary pb-2 hover:text-primary transition-colors group"
              data-testid="contact-email"
            >
              muhammadtaha0154@gmail.com
              <ArrowUpRight className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>

            <div className="mt-24 pt-12 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="font-mono text-sm text-background/60">
                © {new Date().getFullYear()} MUHAMMAD TAHA. AI ENGINEER.
              </div>
              <div className="flex gap-8">
                <a href="https://github.com/taha463" target="_blank" rel="noreferrer" className="text-background/60 hover:text-primary transition-colors flex items-center gap-2" data-testid="contact-github">
                  <Github className="w-5 h-5" />
                  <span className="font-mono text-sm">GITHUB</span>
                </a>
                <a href="https://linkedin.com/in/muhammadtaha02" target="_blank" rel="noreferrer" className="text-background/60 hover:text-primary transition-colors flex items-center gap-2" data-testid="contact-linkedin">
                  <Linkedin className="w-5 h-5" />
                  <span className="font-mono text-sm">LINKEDIN</span>
                </a>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
