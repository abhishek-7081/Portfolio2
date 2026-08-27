import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
  MoveRight,
  Phone
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Reveal from '../components/Reveal';
import SectionTag from '../components/SectionTag';
import { portfolioApi } from '../lib/api';

const sectionLinks = [
  { label: 'About', href: '#about' },
  { label: 'Expertise', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' }
];

export default function HomePage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booted, setBooted] = useState(false);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const primaryImageY = useTransform(heroProgress, [0, 1], [0, 130]);
  const secondaryImageY = useTransform(heroProgress, [0, 1], [0, 70]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBooted(true);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadPortfolio = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await portfolioApi.getPortfolio();

        if (!active) {
          return;
        }

        setPortfolio(response.data);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError.message || 'Unable to load the portfolio content.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPortfolio();

    return () => {
      active = false;
    };
  }, []);

  const showLoader = loading || !booted;

  if (!portfolio && !showLoader && error) {
    return (
      <main className="portfolio-page">
        <Loader visible={false} />
        <div className="error-state">
          <div className="error-state__card">
            <SectionTag>Connection issue</SectionTag>
            <h1>Portfolio content could not be loaded.</h1>
            <p>{error}</p>
            <button className="button" onClick={() => window.location.reload()}>
              Reload portfolio
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!portfolio) {
    return <Loader visible />;
  }

  const featuredProject =
    portfolio.projects.find((project) => project.featured) ?? portfolio.projects[0];
  const supportingProjects = portfolio.projects.filter(
    (project) => project.id !== featuredProject?.id
  );
  const heroImages = [
    featuredProject?.image,
    supportingProjects[0]?.image,
    portfolio.about.portrait
  ].filter(Boolean);
  const marqueeWords = [...portfolio.meta.marquee, ...portfolio.meta.marquee];

  return (
    <main className="portfolio-page">
      <Loader visible={showLoader} />

      <motion.div className="progress-rail" style={{ scaleX: progressScale }} />

      <header className="site-nav">
        <Link to="/" className="nav__brand">
          <span>{portfolio.meta.siteName}</span>
          <small>{portfolio.meta.role}</small>
        </Link>

        <nav className="nav__links" aria-label="Primary navigation">
          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <Link to="/admin/login" className="nav__pill">
          Admin
        </Link>
      </header>

      <section className="hero" id="home" ref={heroRef}>
        <div className="hero__glow hero__glow--left" />
        <div className="hero__glow hero__glow--right" />

        <div className="hero__topline">
          <SectionTag>{portfolio.meta.introTag}</SectionTag>
          <span>{portfolio.meta.availability}</span>
        </div>

        <div className="hero__grid">
          <Reveal className="hero__copy">
            <p className="hero__eyebrow">{portfolio.meta.heroTitleEyebrow}</p>
            <h1 className="hero__title">
              <span>{portfolio.meta.heroTitlePrimary}</span>
              <span>{portfolio.meta.heroTitleSecondary}</span>
            </h1>
            <p className="hero__description">{portfolio.meta.heroDescription}</p>

            <div className="hero__cta-row">
              <a className="button" href="#work">
                View selected work
                <ArrowRight size={18} />
              </a>
              <a className="button button--ghost" href={portfolio.contact.ctaUrl}>
                Start a conversation
              </a>
            </div>

            <div className="hero__stat-grid">
              {portfolio.meta.heroStats.map((stat) => (
                <motion.article
                  key={stat.id}
                  className="stat-card"
                  whileHover={{ y: prefersReducedMotion ? 0 : -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </motion.article>
              ))}
            </div>
          </Reveal>

          <div className="hero__visual-stage">
            <motion.div
              className="hero__visual hero__visual--primary"
              style={{ y: prefersReducedMotion ? 0 : primaryImageY }}
            >
              <img src={heroImages[0]} alt={featuredProject.title} />
            </motion.div>

            <motion.div
              className="hero__visual hero__visual--secondary"
              style={{ y: prefersReducedMotion ? 0 : secondaryImageY }}
            >
              <img src={heroImages[1]} alt={supportingProjects[0]?.title ?? 'Project detail'} />
            </motion.div>

            <Reveal className="hero__note" delay={0.15}>
              <p>{portfolio.meta.signatureQuote}</p>
              <span>{portfolio.meta.location}</span>
            </Reveal>
          </div>
        </div>

        <div className="hero__lower">
          <div className="hero__contact-list">
            <a href={`mailto:${portfolio.meta.email}`}>
              <Mail size={16} />
              {portfolio.meta.email}
            </a>
            <a href={`tel:${portfolio.meta.phone.replace(/\s+/g, '')}`}>
              <Phone size={16} />
              {portfolio.meta.phone}
            </a>
            <span>
              <MapPin size={16} />
              {portfolio.meta.location}
            </span>
          </div>
          <span className="hero__scroll-indicator">Scroll to explore</span>
        </div>

        <div className="marquee">
          <div className="marquee__track">
            {marqueeWords.map((word, index) => (
              <span key={`${word}-${index}`}>{word}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--about" id="about">
        <div className="section__header">
          <Reveal>
            <SectionTag>{portfolio.about.eyebrow}</SectionTag>
          </Reveal>
          <Reveal className="section__headline" delay={0.05}>
            <h2>{portfolio.about.title}</h2>
          </Reveal>
        </div>

        <div className="about-grid">
          <Reveal className="about-grid__image">
            <img src={portfolio.about.portrait} alt={portfolio.meta.siteName} />
          </Reveal>

          <Reveal className="about-grid__body" delay={0.12}>
            <p>{portfolio.about.narrative}</p>
            <p className="about-grid__highlight">{portfolio.about.highlight}</p>

            <div className="metric-row">
              {portfolio.about.metrics.map((metric) => (
                <article key={metric.id} className="metric-card">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </article>
              ))}
            </div>

            <blockquote className="quote-card">
              <p>{portfolio.about.quote}</p>
              <footer>{portfolio.about.quoteAuthor}</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="section section--skills" id="skills">
        <div className="section__header section__header--split">
          <Reveal>
            <SectionTag>Expertise</SectionTag>
          </Reveal>
          <Reveal className="section__headline section__headline--stack" delay={0.05}>
            <h2>
              Precision in the system.
              <br />
              Energy in the details.
            </h2>
          </Reveal>
        </div>

        <div className="skill-grid">
          {portfolio.skills.map((skill, index) => (
            <Reveal key={skill.id} delay={index * 0.06}>
              <motion.article
                className="skill-card"
                whileHover={{ y: prefersReducedMotion ? 0 : -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="skill-card__top">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{skill.level}</p>
                </div>
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
                <div className="pill-row">
                  {skill.tools.map((tool) => (
                    <span key={tool} className="pill">
                      {tool}
                    </span>
                  ))}
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--projects" id="work">
        <div className="projects-layout">
          <div className="projects-layout__intro">
            <Reveal>
              <SectionTag>Selected work</SectionTag>
            </Reveal>
            <Reveal delay={0.08}>
              <h2>Immersive projects that balance story, speed, and conversion.</h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p>
                The visual language is bold, but every decision is tied back to
                clarity, motion pacing, and what the audience needs to feel next.
              </p>
            </Reveal>
          </div>

          <div className="projects-layout__stack">
            {portfolio.projects.map((project, index) => (
              <Reveal key={project.id} delay={index * 0.08}>
                <motion.article
                  className="project-card"
                  whileHover={{ y: prefersReducedMotion ? 0 : -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="project-card__media">
                    <img src={project.image} alt={project.title} />
                    <span className="project-card__flag">
                      {project.featured ? 'Featured case' : project.category}
                    </span>
                  </div>

                  <div className="project-card__content">
                    <div className="project-card__header">
                      <div>
                        <span>{project.year}</span>
                        <h3>{project.title}</h3>
                      </div>
                      <a href={project.link} target="_blank" rel="noreferrer">
                        Visit concept
                        <ArrowUpRight size={18} />
                      </a>
                    </div>

                    <p>{project.summary}</p>
                    <p className="project-card__impact">{project.impact}</p>

                    <div className="project-card__meta">
                      <div>
                        <h4>Services</h4>
                        <div className="pill-row">
                          {project.services.map((service) => (
                            <span key={service} className="pill pill--muted">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4>Tech & approach</h4>
                        <div className="pill-row">
                          {project.tech.map((item) => (
                            <span key={item} className="pill pill--muted">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="project-card__metrics">
                      {project.metrics.map((metric) => (
                        <div key={metric.label}>
                          <strong>{metric.value}</strong>
                          <span>{metric.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--experience" id="experience">
        <div className="section__header section__header--split">
          <Reveal>
            <SectionTag>Experience</SectionTag>
          </Reveal>
          <Reveal className="section__headline" delay={0.05}>
            <h2>Every role sharpened the way I build narrative into digital products.</h2>
          </Reveal>
        </div>

        <div className="timeline">
          {portfolio.experience.map((entry, index) => (
            <Reveal key={entry.id} delay={index * 0.08}>
              <article className="timeline__card">
                <div className="timeline__meta">
                  <span>{entry.period}</span>
                  <p>{entry.location}</p>
                </div>

                <div className="timeline__body">
                  <h3>{entry.role}</h3>
                  <h4>{entry.company}</h4>
                  <p>{entry.summary}</p>
                  <ul>
                    {entry.achievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--achievements">
        <div className="section__header">
          <Reveal>
            <SectionTag>Highlights</SectionTag>
          </Reveal>
          <Reveal className="section__headline" delay={0.05}>
            <h2>Milestones that reflect craft, consistency, and trust.</h2>
          </Reveal>
        </div>

        <div className="achievement-grid">
          {portfolio.achievements.map((achievement, index) => (
            <Reveal key={achievement.id} delay={index * 0.07}>
              <article className="achievement-card">
                <span>{achievement.year}</span>
                <h3>{achievement.title}</h3>
                <p>{achievement.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--services" id="services">
        <div className="section__header section__header--split">
          <Reveal>
            <SectionTag>Services</SectionTag>
          </Reveal>
          <Reveal className="section__headline" delay={0.05}>
            <h2>Flexible support for launches, redesigns, and premium product storytelling.</h2>
          </Reveal>
        </div>

        <div className="service-grid">
          {portfolio.services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.08}>
              <motion.article
                className="service-card"
                whileHover={{ y: prefersReducedMotion ? 0 : -8 }}
                transition={{ duration: 0.25 }}
              >
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section--contact" id="contact">
        <Reveal className="contact-panel">
          <div className="contact-panel__copy">
            <SectionTag>Contact</SectionTag>
            <h2>{portfolio.contact.title}</h2>
            <p>{portfolio.contact.body}</p>

            <div className="contact-panel__actions">
              <a className="button" href={portfolio.contact.ctaUrl}>
                {portfolio.contact.ctaLabel}
                <MoveRight size={18} />
              </a>
              <a className="button button--ghost" href={`mailto:${portfolio.contact.email}`}>
                Email directly
              </a>
            </div>
          </div>

          <div className="contact-panel__meta">
            <div>
              <span>Email</span>
              <a href={`mailto:${portfolio.contact.email}`}>{portfolio.contact.email}</a>
            </div>
            <div>
              <span>Phone</span>
              <a href={`tel:${portfolio.contact.phone.replace(/\s+/g, '')}`}>
                {portfolio.contact.phone}
              </a>
            </div>
            <div>
              <span>Location</span>
              <p>{portfolio.contact.location}</p>
            </div>
            <div>
              <span>Availability</span>
              <p>{portfolio.contact.availability}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="site-footer">
        <div>
          <strong>{portfolio.meta.siteName}</strong>
          <p>{portfolio.meta.socialTagline}</p>
        </div>

        <div className="site-footer__socials">
          {portfolio.socials.map((social) => (
            <a key={social.id} href={social.url} target="_blank" rel="noreferrer">
              {social.label}
              <span>{social.handle}</span>
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
