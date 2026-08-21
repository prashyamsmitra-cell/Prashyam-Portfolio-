"use client"

import { useEffect, useRef, useState } from "react"
import { motion, MotionConfig, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import Image from "next/image"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ─────────────────────────────────────────────
   Reusable scroll-reveal wrapper
   Uses useInView so Framer handles visibility
   properly without CSS opacity: 0 fighting it.
───────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "left" | "right" | "none"
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" })

  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: 48 },
    left: { x: -48 },
    right: { x: 48 },
    none: {},
  }

  const initial = { opacity: 0, ...offsets[direction] }
  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : initial

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Staggered container for grids
───────────────────────────────────────────── */
function StaggerGrid({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Individual stagger child
───────────────────────────────────────────── */
const staggerItem = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/* ─────────────────────────────────────────────
   Animated number counter
───────────────────────────────────────────── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const duration = 1200
    const step = end / (duration / 16)

    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Horizontal scroll progress line at top
───────────────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 })

  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX, transformOrigin: "0%" }}
    />
  )
}

/* ─────────────────────────────────────────────
   Magnetic cursor dot
───────────────────────────────────────────── */
function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return

    let mouseX = 0
    let mouseY = 0
    let dotX = 0
    let dotY = 0
    let raf: number

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      dotX += (mouseX - dotX) * 0.15
      dotY += (mouseY - dotY) * 0.15
      dot.style.transform = `translate(${dotX - 6}px, ${dotY - 6}px)`
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener("mousemove", handleMove, { passive: true })
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={dotRef} className="cursor-dot" aria-hidden />
}

/* ─────────────────────────────────────────────
   Section header — index number, label and a
   scroll-driven rule that fills as you pass.
───────────────────────────────────────────── */
function SectionHeader({
  index,
  label,
  subtitle,
}: {
  index: string
  label: string
  subtitle?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 45%"],
  })
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.6,
  })

  return (
    <motion.div
      ref={ref}
      className="section-header"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px 0px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="section-header-row">
        <span className="section-index" aria-hidden>
          {index}
        </span>
        <div className="section-label">{label}</div>
        <motion.div className="section-rule" style={{ scaleX }} aria-hidden />
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Project card with image placeholder
───────────────────────────────────────────── */
function ProjectCard({ project, index }: { project: ProjectType; index: number }) {
  const cardRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <motion.div
      ref={cardRef}
      variants={staggerItem}
      className="project-detail-card"
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
    >
      <div className="project-header">
        <div>
          <h3 className="project-detail-title">{project.title}</h3>
          <p className="project-tagline">{project.tagline}</p>
        </div>
        <div className="project-meta-right">
          <span className="project-badge">{project.status}</span>
          <span className="project-year">{project.year}</span>
        </div>
      </div>

      {/* Project preview image */}
      <motion.div className="project-image-detail" style={{ y }}>
        <Image
          src={project.image}
          alt={`${project.title} — ${project.tagline}`}
          fill
          sizes="(max-width: 768px) 100vw, 1000px"
          className="project-image"
          priority={index === 0}
        />
      </motion.div>

      <div className="project-content">
        <p className="project-description">{project.description}</p>

        <div className="project-features">
          <h4 className="meta-label">Features</h4>
          <div className="features-grid">
            {project.features.map((feature) => (
              <span key={feature} className="feature-tag">
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="tech-stack">
          <h4 className="meta-label">Stack</h4>
          <div className="tech-badges">
            {project.techStack.map((tech) => (
              <span key={tech} className="tech-badge">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="project-links">
          {project.liveLink && (
            <a
              href={project.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="link-btn live-btn"
            >
              → Live Demo
            </a>
          )}
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="link-btn github-btn"
          >
            → Source Code
          </a>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type ProjectType = {
  id: string
  title: string
  tagline: string
  category: string
  status: string
  year: string
  description: string
  features: string[]
  techStack: string[]
  liveLink: string
  githubLink: string
  image: string
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function Page() {
  const [formData, setFormData] = useState({ email: "", message: "" })
  const [formStatus, setFormStatus] = useState("")
  const [activeId, setActiveId] = useState("hero")

  const navLinks = [
    { id: "hero", label: "Top" },
    { id: "exploits", label: "Work" },
    { id: "journey", label: "Journey" },
    { id: "summon", label: "Contact" },
  ]

  /* Smooth scroll on nav click */
  useEffect(() => {
    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (anchor?.getAttribute("href")?.startsWith("#")) {
        e.preventDefault()
        const id = anchor.getAttribute("href")!.slice(1)
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
    document.addEventListener("click", handleNavClick)
    return () => document.removeEventListener("click", handleNavClick)
  }, [])

  /* Highlight the nav link of the section currently in view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    for (const link of navLinks) {
      const el = document.getElementById(link.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.message) {
      setFormStatus("Please fill all fields")
      return
    }
    try {
      setFormStatus("Sending…")
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setFormStatus("Message sent! I'll get back to you soon.")
        setFormData({ email: "", message: "" })
      } else {
        setFormStatus("Error sending. Please try again.")
      }
    } catch {
      setFormStatus("Error sending. Please try again.")
    }
  }

  const projects: ProjectType[] = [
    {
      id: "caresync",
      title: "CARESYNC",
      tagline: "AI-Powered Healthcare Management Platform",
      category: "Healthcare · AI · Full Stack",
      status: "Live",
      year: "2025",
      description:
        "An AI-powered healthcare management platform that centralizes patient records, appointment scheduling, and intelligent healthcare assistance. Built with microservice architecture for scalability.",
      features: ["AI Medical Assistant", "Patient Authentication", "Appointment Scheduling", "Medical Records", "Cloud Deployment"],
      techStack: ["React", "Vite", "Express.js", "FastAPI", "Google Gemini", "PostgreSQL", "Supabase"],
      liveLink: "https://care-sync-taupe.vercel.app/",
      githubLink: "https://github.com/prashyamsmitra-cell/CareSync",
      image: "/caresync-screenshot.png",
    },
    {
      id: "cvanalyzer",
      title: "CV ANALYZER",
      tagline: "AI Resume Evaluation & Career Assistant",
      category: "AI · NLP · Career Tech",
      status: "Live",
      year: "2026",
      description:
        "An AI-powered resume analysis platform that evaluates resumes against ATS standards and provides actionable improvement suggestions. Supports WhatsApp-based interactions.",
      features: ["Resume Upload", "PDF Processing", "AI Analysis", "ATS Feedback", "WhatsApp Integration"],
      techStack: ["FastAPI", "Python", "LangChain", "Google Gemini", "PostgreSQL", "Supabase Storage"],
      liveLink: "https://cv-analyzer-frontend-mu.vercel.app/",
      githubLink: "https://github.com/prashyamsmitra-cell/CVAnalyzerFrontend",
      image: "/cv-analyzer-screenshot.png",
    },
    {
      id: "smartlink",
      title: "SMARTLINK",
      tagline: "Modern URL Shortener & Link Analytics Platform",
      category: "Developer Tools · SaaS",
      status: "Live",
      year: "2026",
      description:
        "A secure URL shortening platform with analytics, custom short links, and a scalable REST API. Features user authentication and comprehensive link management.",
      features: ["URL Shortening", "Custom Links", "User Auth", "Click Analytics", "REST APIs"],
      techStack: ["React", "Node.js", "Express.js", "PostgreSQL", "Tailwind CSS", "Vercel"],
      liveLink: "https://smartlink-gules.vercel.app/",
      githubLink: "https://github.com/prashyamsmitra-cell/smartlink",
      image: "/smartlink-screenshot.png",
    },
    {
      id: "visitor",
      title: "VISITOR MGMT",
      tagline: "Enterprise Visitor Management System",
      category: "Enterprise · Full Stack",
      status: "Archived",
      year: "2023",
      description:
        "QR-based enterprise visitor management system with email notifications, secure authentication, and comprehensive visitor tracking workflows.",
      features: ["QR Entry", "Email Notifications", "User Auth", "Visitor Tracking", "Enterprise Deploy"],
      techStack: ["Express.js", "PostgreSQL", "React", "JWT", "Twilio"],
      liveLink: "",
      githubLink: "https://github.com/prashyamsmitra-cell/VMS-prototype-",
      image: "/kinetic-industrial-sculpture-metal-geometric-form-.jpg",
    },
  ]

  const journey = [
    {
      year: "2023",
      title: "Started Learning Web Development",
      company: "Self-Taught",
      description: "Began building projects with React and Node.js",
    },
    {
      year: "2023–24",
      title: "Software Development Intern",
      company: "Exide Industries",
      description: "Built backend services, AI applications, and visitor management systems",
    },
    {
      year: "2024",
      title: "Full Stack Development Focus",
      company: "Personal Projects",
      description: "Developed CareSync and other production-ready applications",
    },
    {
      year: "2025",
      title: "AI Integration Specialist",
      company: "Current Focus",
      description: "Building AI-powered applications with LLMs and modern tech stack",
    },
  ]

  const achievements = [
    { icon: "⟳", title: "4+ Production Apps", description: "Deployed scalable applications handling real-world use cases" },
    { icon: "◆", title: "AI Integration Expert", description: "Integrated Google Gemini, LangChain, and LLM technologies" },
    { icon: "▢", title: "Microservices Architecture", description: "Designed and built modular, scalable backend systems" },
    { icon: "◈", title: "Full Stack Mastery", description: "Expertise across frontend, backend, database, and deployment" },
    { icon: "▬", title: "Authentication Expert", description: "Implemented JWT, session-based, and OTP authentication systems" },
    { icon: "▲", title: "Cloud Deployment", description: "Deployed on Vercel, Railway, Render, and cloud platforms" },
  ]

  const stats = [
    { value: 4, suffix: "+", label: "Production Apps" },
    { value: 3, suffix: "+", label: "AI Integrations" },
    { value: 2, suffix: "+", label: "Years Building" },
    { value: 6, suffix: "+", label: "Tech Stacks" },
  ]

  return (
    <MotionConfig reducedMotion="user">
    <>
      <ScrollProgress />
      <CursorDot />
      <div className="grid-overlay" aria-hidden />

      {/* ── VERTICAL NAV ── */}
      <nav>
        <div className="nav-logo">PRASHYAM</div>
        <div className="nav-links">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={activeId === link.id ? "nav-active" : undefined}
              aria-current={activeId === link.id ? "true" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="nav-copyright">©26</div>
      </nav>

      <div className="container">

        {/* ── HERO ── */}
        <header id="hero" className="hero-enhanced">
          <div className="geometric-accent-1" aria-hidden />

          <div className="hero-name-section">
            <motion.h1
              className="hero-name"
              initial={{ opacity: 0, y: 60, skewX: -3 }}
              animate={{ opacity: 1, y: 0, skewX: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              PRASHYAM
            </motion.h1>
            <motion.h2
              className="hero-role"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            >
              Aspiring Full Stack AI Engineer
            </motion.h2>
          </div>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
          >
            Final-year CS student from Techno India University building
            production-ready software that combines artificial intelligence
            with modern web technologies. Specialized in full-stack development,
            REST API architecture, LLM integration, and scalable backend systems.
          </motion.p>

          <motion.div
            className="hero-details"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
          >
            <div>
              <p className="meta-label-sm">Location</p>
              <p className="meta-value">Kolkata, West Bengal, India</p>
            </div>
            <div>
              <p className="meta-label-sm">Status</p>
              <p className="meta-value">Final Year · Available for Internships</p>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {stats.map((s) => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">
                  <Counter value={s.value} suffix={s.suffix} />
                </span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="hero-line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.9, ease: EASE }}
            style={{ transformOrigin: "0%" }}
            aria-hidden
          />
        </header>

        {/* ── EXPLOITS – PROJECTS ── */}
        <section id="exploits" className="exploits-section">
          <SectionHeader index="01" label="Exploits" subtitle="Production-ready applications built with modern technologies" />

          <StaggerGrid className="projects-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </StaggerGrid>
        </section>

        {/* ── JOURNEY – TIMELINE ── */}
        <section id="journey" className="journey-section">
          <SectionHeader index="02" label="Journey" subtitle="Experience and milestones along the path" />

          <div className="timeline-container">
            {journey.map((item, index) => (
              <Reveal key={index} delay={index * 0.12} direction="left">
                <div className="timeline-item">
                  <div className="timeline-marker">
                    <div className="marker-dot" />
                    {index < journey.length - 1 && <div className="marker-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-year">{item.year}</div>
                    <h3 className="timeline-title">{item.title}</h3>
                    <p className="timeline-company">{item.company}</p>
                    <p className="timeline-description">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── SPOILS – ACHIEVEMENTS ── */}
        <section id="spoils" className="spoils-section">
          <SectionHeader index="03" label="Spoils" subtitle="Achievements and accomplishments" />

          <StaggerGrid className="achievements-grid">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="achievement-card"
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
              </motion.div>
            ))}
          </StaggerGrid>

          <Reveal delay={0.2}>
            <div className="skills-showcase">
              <h3 className="skills-title">Core Competencies</h3>
              <div className="competencies-grid">
                {[
                  { label: "Frontend", skills: "React · Next.js · Vite · Tailwind CSS · HTML5 · CSS3" },
                  { label: "Backend", skills: "Node.js · Express.js · FastAPI · Python · REST APIs" },
                  { label: "Databases", skills: "PostgreSQL · Supabase · Redis · Vector Databases" },
                  { label: "AI & ML", skills: "Google Gemini · LangChain · Prompt Engineering · LLMs" },
                  { label: "Cloud & DevOps", skills: "Vercel · Railway · Render · Docker · Git · CI/CD" },
                  { label: "Auth & Security", skills: "JWT · OAuth · Twilio · Postman · VS Code" },
                ].map((c) => (
                  <div key={c.label} className="competency-box">
                    <h4>{c.label}</h4>
                    <p>{c.skills}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── SUMMON – CONTACT ── */}
        <section id="summon" className="summon-section">
          <SectionHeader index="04" label="Summon Me" subtitle="Let&apos;s collaborate on something amazing" />

          <div className="summon-content">
            {/* Social Links */}
            <Reveal direction="left" delay={0.1}>
              <div className="social-channels">
                <h3 className="connect-title">Connect</h3>
                <div className="social-links-grid">
                  <a href="https://github.com/prashyamsmitra-cell" target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    <span className="social-name">GitHub</span>
                  </a>
                  <a href="https://www.linkedin.com/in/prashyam-s-mitra-2b55ba2b5/" target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    <span className="social-name">LinkedIn</span>
                  </a>
                  <a href="mailto:prashyamsmitra@gmail.com" className="social-link">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 6l10 7 10-7" />
                    </svg>
                    <span className="social-name">Email</span>
                  </a>
                  <a href="https://www.instagram.com/prash_yam05?igsh=NHh5dzE3bmpwcTR0" target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg className="social-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                    </svg>
                    <span className="social-name">Instagram</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Contact Form */}
            <Reveal direction="right" delay={0.2}>
              <div className="contact-form-container">
                <h3 className="connect-title">Send a Message</h3>
                <form onSubmit={handleFormSubmit} className="contact-form">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Your Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      id="message"
                      placeholder="Tell me about your project or idea…"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-textarea"
                    />
                  </div>

                  <button type="submit" className="submit-btn">
                    Send Message →
                  </button>

                  {formStatus && (
                    <p className="form-status">{formStatus}</p>
                  )}
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="about-section">
          <SectionHeader index="05" label="About" subtitle="Background, interests, and what I'm learning next" />
          <Reveal delay={0.1}>
            <div className="about-content">
              <h2 className="about-title">Full Stack Software Engineer</h2>
              <p className="about-body">
                I&apos;m passionate about building production-ready software that solves
                real-world problems. My focus is on creating scalable applications
                that combine modern web technologies with artificial intelligence.
              </p>
              <div className="about-lists">
                <div>
                  <h3 className="meta-label">Interests</h3>
                  <ul className="about-list">
                    {["Software Engineering", "AI & LLM Applications", "Backend Architecture", "System Design", "Cloud Computing"].map(i => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="meta-label">Currently Learning</h3>
                  <ul className="about-list">
                    {["Kubernetes & Docker", "Distributed Systems", "LLM Fine-tuning", "CI/CD Pipelines", "MLOps"].map(i => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ── */}
        <footer>
          <div className="footer-grid">
            <div>
              <p className="meta-label-sm">Contact</p>
              <a href="mailto:prashyamsmitra@gmail.com" className="footer-link">
                prashyamsmitra@gmail.com
              </a>
            </div>
            <div>
              <p className="meta-label-sm">Location</p>
              <p className="footer-text">Kolkata, India</p>
            </div>
            <div className="footer-right">
              <p className="meta-label-sm">Year</p>
              <p className="footer-text">2026</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              Designed &amp; built by Prashyam Mitra{" · "}
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="footer-link-inline">
               
              </a>
            </p>
          </div>
        </footer>
      </div>

      {/* Background structural lines */}
      <div className="bg-accents" aria-hidden>
        <div className="bg-line-v" />
        <div className="bg-line-h" />
      </div>
    </>
    </MotionConfig>
  )
}
