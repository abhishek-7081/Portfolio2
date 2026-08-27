import {
  ArrowUpRight,
  Briefcase,
  ImageUp,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { portfolioApi } from '../lib/api';

const createId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const createStat = () => ({
  id: createId('stat'),
  value: '',
  label: ''
});

const createMetric = () => ({
  id: createId('metric'),
  value: '',
  label: ''
});

const createSkill = () => ({
  id: createId('skill'),
  name: '',
  level: '',
  description: '',
  tools: []
});

const createProject = () => ({
  id: createId('project'),
  title: '',
  category: '',
  year: '',
  summary: '',
  impact: '',
  services: [],
  tech: [],
  metrics: [createMetric(), createMetric()],
  image: '',
  link: '',
  accent: '',
  featured: false
});

const createExperience = () => ({
  id: createId('exp'),
  company: '',
  role: '',
  period: '',
  location: '',
  summary: '',
  achievements: []
});

const createAchievement = () => ({
  id: createId('ach'),
  title: '',
  year: '',
  body: ''
});

const createService = () => ({
  id: createId('service'),
  title: '',
  description: '',
  deliverables: []
});

const createSocial = () => ({
  id: createId('social'),
  label: '',
  handle: '',
  url: ''
});

const parseList = (value) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const formatList = (items) => (Array.isArray(items) ? items.join('\n') : '');

const replaceAtIndex = (items, index, nextValue) =>
  items.map((item, itemIndex) => (itemIndex === index ? nextValue : item));

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState('');
  const [uploadingKey, setUploadingKey] = useState('');
  const [notice, setNotice] = useState('');

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

        setError(nextError.message || 'Unable to load the dashboard content.');
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

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const updateSection = (sectionKey, nextValue) => {
    setPortfolio((current) => ({
      ...current,
      [sectionKey]: nextValue
    }));
  };

  const updateObjectField = (sectionKey, field, value) => {
    setPortfolio((current) => ({
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        [field]: value
      }
    }));
  };

  const updateMetricGroup = (sectionKey, field, index, key, value) => {
    setPortfolio((current) => {
      const nextMetrics = replaceAtIndex(current[sectionKey][field], index, {
        ...current[sectionKey][field][index],
        [key]: value
      });

      return {
        ...current,
        [sectionKey]: {
          ...current[sectionKey],
          [field]: nextMetrics
        }
      };
    });
  };

  const appendMetricGroup = (sectionKey, field, factory) => {
    setPortfolio((current) => ({
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        [field]: [...current[sectionKey][field], factory()]
      }
    }));
  };

  const removeMetricGroup = (sectionKey, field, index) => {
    setPortfolio((current) => ({
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        [field]: current[sectionKey][field].filter((_, itemIndex) => itemIndex !== index)
      }
    }));
  };

  const updateCollectionItem = (sectionKey, index, patch) => {
    setPortfolio((current) => ({
      ...current,
      [sectionKey]: replaceAtIndex(current[sectionKey], index, {
        ...current[sectionKey][index],
        ...patch
      })
    }));
  };

  const addCollectionItem = (sectionKey, factory) => {
    setPortfolio((current) => ({
      ...current,
      [sectionKey]: [...current[sectionKey], factory()]
    }));
  };

  const removeCollectionItem = (sectionKey, index) => {
    setPortfolio((current) => ({
      ...current,
      [sectionKey]: current[sectionKey].filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const saveSection = async (sectionKey) => {
    setSavingKey(sectionKey);
    setError('');

    try {
      await portfolioApi.updateSection(sectionKey, portfolio[sectionKey]);
      setNotice(`${sectionKey[0].toUpperCase()}${sectionKey.slice(1)} saved successfully.`);
    } catch (nextError) {
      setError(nextError.message || 'Unable to save changes.');
    } finally {
      setSavingKey('');
    }
  };

  const saveSections = async (sectionKeys) => {
    setSavingKey(sectionKeys.join(','));
    setError('');

    try {
      await Promise.all(
        sectionKeys.map((sectionKey) =>
          portfolioApi.updateSection(sectionKey, portfolio[sectionKey])
        )
      );
      setNotice('Contact details and socials saved successfully.');
    } catch (nextError) {
      setError(nextError.message || 'Unable to save changes.');
    } finally {
      setSavingKey('');
    }
  };

  const uploadImage = async (file, onComplete, key) => {
    const formData = new FormData();
    formData.append('image', file);
    setUploadingKey(key);
    setError('');

    try {
      const response = await portfolioApi.uploadImage(formData);
      onComplete(response.url);
      setNotice('Image uploaded successfully.');
    } catch (nextError) {
      setError(nextError.message || 'Image upload failed.');
    } finally {
      setUploadingKey('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  if (loading || !portfolio) {
    return (
      <main className="dashboard-shell">
        <div className="route-loader">
          <div className="route-loader__panel">
            <span className="section-tag">Dashboard</span>
            <h2>Loading content workspace...</h2>
          </div>
        </div>
      </main>
    );
  }

  const stats = [
    { label: 'Projects', value: portfolio.projects.length, icon: Briefcase },
    { label: 'Skills', value: portfolio.skills.length, icon: Sparkles },
    { label: 'Achievements', value: portfolio.achievements.length, icon: Trophy },
    { label: 'Services', value: portfolio.services.length, icon: Wrench }
  ];

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div>
          <span className="section-tag">Admin console</span>
          <h1>{portfolio.meta.siteName}</h1>
          <p>{user?.email}</p>
        </div>

        <nav className="dashboard-sidebar__nav">
          <a href="#overview">Overview</a>
          <a href="#hero">Hero</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#achievements">Achievements</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact & Socials</a>
        </nav>

        <button className="button button--ghost" onClick={handleLogout}>
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <div className="dashboard-content">
        <div className="dashboard-toolbar" id="overview">
          <div>
            <span className="section-tag">Content manager</span>
            <h2>Premium portfolio CMS</h2>
          </div>

          <a className="button button--ghost" href="/" target="_blank" rel="noreferrer">
            View public site
            <ArrowUpRight size={18} />
          </a>
        </div>

        {notice ? <div className="toast toast--success">{notice}</div> : null}
        {error ? <div className="toast toast--error">{error}</div> : null}

        <section className="dashboard-panel dashboard-panel--stats">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="dashboard-stat">
                <Icon size={20} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            );
          })}
        </section>

        <section className="dashboard-panel" id="hero">
          <PanelHeader
            title="Hero settings"
            description="Update the landing message, stats, marquee, and hero-facing details."
            onSave={() => saveSection('meta')}
            saving={savingKey === 'meta'}
          />

          <div className="form-grid form-grid--two">
            <TextField
              label="Site name"
              value={portfolio.meta.siteName}
              onChange={(value) => updateObjectField('meta', 'siteName', value)}
            />
            <TextField
              label="Role"
              value={portfolio.meta.role}
              onChange={(value) => updateObjectField('meta', 'role', value)}
            />
            <TextField
              label="Location"
              value={portfolio.meta.location}
              onChange={(value) => updateObjectField('meta', 'location', value)}
            />
            <TextField
              label="Availability"
              value={portfolio.meta.availability}
              onChange={(value) => updateObjectField('meta', 'availability', value)}
            />
            <TextField
              label="Intro tag"
              value={portfolio.meta.introTag}
              onChange={(value) => updateObjectField('meta', 'introTag', value)}
            />
            <TextField
              label="Hero eyebrow"
              value={portfolio.meta.heroTitleEyebrow}
              onChange={(value) => updateObjectField('meta', 'heroTitleEyebrow', value)}
            />
            <TextField
              label="Hero title primary"
              value={portfolio.meta.heroTitlePrimary}
              onChange={(value) => updateObjectField('meta', 'heroTitlePrimary', value)}
            />
            <TextField
              label="Hero title secondary"
              value={portfolio.meta.heroTitleSecondary}
              onChange={(value) => updateObjectField('meta', 'heroTitleSecondary', value)}
            />
          </div>

          <TextAreaField
            label="Hero description"
            value={portfolio.meta.heroDescription}
            onChange={(value) => updateObjectField('meta', 'heroDescription', value)}
          />

          <TextAreaField
            label="Signature quote"
            value={portfolio.meta.signatureQuote}
            onChange={(value) => updateObjectField('meta', 'signatureQuote', value)}
          />

          <div className="form-grid form-grid--two">
            <TextField
              label="Email"
              value={portfolio.meta.email}
              onChange={(value) => updateObjectField('meta', 'email', value)}
            />
            <TextField
              label="Phone"
              value={portfolio.meta.phone}
              onChange={(value) => updateObjectField('meta', 'phone', value)}
            />
          </div>

          <TextAreaField
            label="Marquee phrases"
            helper="One phrase per line."
            value={formatList(portfolio.meta.marquee)}
            onChange={(value) => updateObjectField('meta', 'marquee', parseList(value))}
          />

          <div className="stack">
            <div className="subsection-header">
              <h3>Hero stats</h3>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => appendMetricGroup('meta', 'heroStats', createStat)}
              >
                <Plus size={18} />
                Add stat
              </button>
            </div>

            {portfolio.meta.heroStats.map((stat, index) => (
              <div key={stat.id} className="metric-editor">
                <TextField
                  label="Value"
                  value={stat.value}
                  onChange={(value) => updateMetricGroup('meta', 'heroStats', index, 'value', value)}
                />
                <TextField
                  label="Label"
                  value={stat.label}
                  onChange={(value) => updateMetricGroup('meta', 'heroStats', index, 'label', value)}
                />
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => removeMetricGroup('meta', 'heroStats', index)}
                  aria-label="Remove stat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="preview-card">
            <span className="preview-card__eyebrow">Hero preview</span>
            <strong>{portfolio.meta.siteName}</strong>
            <h3>
              {portfolio.meta.heroTitlePrimary} {portfolio.meta.heroTitleSecondary}
            </h3>
            <p>{portfolio.meta.heroDescription}</p>
          </div>
        </section>

        <section className="dashboard-panel" id="about">
          <PanelHeader
            title="About section"
            description="Shape the studio story, portrait, and supporting metrics."
            onSave={() => saveSection('about')}
            saving={savingKey === 'about'}
          />

          <div className="form-grid form-grid--two">
            <TextField
              label="Eyebrow"
              value={portfolio.about.eyebrow}
              onChange={(value) => updateObjectField('about', 'eyebrow', value)}
            />
            <TextField
              label="Title"
              value={portfolio.about.title}
              onChange={(value) => updateObjectField('about', 'title', value)}
            />
          </div>

          <TextAreaField
            label="Narrative"
            value={portfolio.about.narrative}
            onChange={(value) => updateObjectField('about', 'narrative', value)}
          />

          <TextAreaField
            label="Highlight"
            value={portfolio.about.highlight}
            onChange={(value) => updateObjectField('about', 'highlight', value)}
          />

          <ImageUploadField
            label="Portrait image"
            value={portfolio.about.portrait}
            uploading={uploadingKey === 'about-portrait'}
            onChange={(value) => updateObjectField('about', 'portrait', value)}
            onUpload={(file) =>
              uploadImage(file, (url) => updateObjectField('about', 'portrait', url), 'about-portrait')
            }
          />

          <div className="form-grid form-grid--two">
            <TextAreaField
              label="Quote"
              value={portfolio.about.quote}
              onChange={(value) => updateObjectField('about', 'quote', value)}
            />
            <TextField
              label="Quote author"
              value={portfolio.about.quoteAuthor}
              onChange={(value) => updateObjectField('about', 'quoteAuthor', value)}
            />
          </div>

          <div className="stack">
            <div className="subsection-header">
              <h3>About metrics</h3>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => appendMetricGroup('about', 'metrics', createMetric)}
              >
                <Plus size={18} />
                Add metric
              </button>
            </div>

            {portfolio.about.metrics.map((metric, index) => (
              <div key={metric.id} className="metric-editor">
                <TextField
                  label="Value"
                  value={metric.value}
                  onChange={(value) => updateMetricGroup('about', 'metrics', index, 'value', value)}
                />
                <TextField
                  label="Label"
                  value={metric.label}
                  onChange={(value) => updateMetricGroup('about', 'metrics', index, 'label', value)}
                />
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => removeMetricGroup('about', 'metrics', index)}
                  aria-label="Remove metric"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel" id="skills">
          <PanelHeader
            title="Skills"
            description="Add, refine, and remove expertise cards."
            onSave={() => saveSection('skills')}
            saving={savingKey === 'skills'}
          />

          <CollectionToolbar
            label="Skills"
            onAdd={() => addCollectionItem('skills', createSkill)}
          />

          {portfolio.skills.length ? (
            portfolio.skills.map((skill, index) => (
              <CollectionCard
                key={skill.id}
                title={skill.name || `Skill ${index + 1}`}
                onRemove={() => removeCollectionItem('skills', index)}
              >
                <div className="form-grid form-grid--two">
                  <TextField
                    label="Name"
                    value={skill.name}
                    onChange={(value) => updateCollectionItem('skills', index, { name: value })}
                  />
                  <TextField
                    label="Level / angle"
                    value={skill.level}
                    onChange={(value) => updateCollectionItem('skills', index, { level: value })}
                  />
                </div>
                <TextAreaField
                  label="Description"
                  value={skill.description}
                  onChange={(value) => updateCollectionItem('skills', index, { description: value })}
                />
                <TextAreaField
                  label="Tools"
                  helper="One item per line."
                  value={formatList(skill.tools)}
                  onChange={(value) => updateCollectionItem('skills', index, { tools: parseList(value) })}
                />
              </CollectionCard>
            ))
          ) : (
            <EmptyState label="No skills yet. Add one to populate the expertise section." />
          )}
        </section>

        <section className="dashboard-panel" id="projects">
          <PanelHeader
            title="Projects"
            description="Manage featured work, messaging, links, metrics, and imagery."
            onSave={() => saveSection('projects')}
            saving={savingKey === 'projects'}
          />

          <CollectionToolbar
            label="Projects"
            onAdd={() => addCollectionItem('projects', createProject)}
          />

          {portfolio.projects.length ? (
            portfolio.projects.map((project, index) => (
              <CollectionCard
                key={project.id}
                title={project.title || `Project ${index + 1}`}
                onRemove={() => removeCollectionItem('projects', index)}
              >
                <div className="form-grid form-grid--two">
                  <TextField
                    label="Title"
                    value={project.title}
                    onChange={(value) => updateCollectionItem('projects', index, { title: value })}
                  />
                  <TextField
                    label="Category"
                    value={project.category}
                    onChange={(value) => updateCollectionItem('projects', index, { category: value })}
                  />
                  <TextField
                    label="Year"
                    value={project.year}
                    onChange={(value) => updateCollectionItem('projects', index, { year: value })}
                  />
                  <TextField
                    label="Accent"
                    value={project.accent}
                    onChange={(value) => updateCollectionItem('projects', index, { accent: value })}
                  />
                </div>

                <TextAreaField
                  label="Summary"
                  value={project.summary}
                  onChange={(value) => updateCollectionItem('projects', index, { summary: value })}
                />
                <TextAreaField
                  label="Impact statement"
                  value={project.impact}
                  onChange={(value) => updateCollectionItem('projects', index, { impact: value })}
                />

                <ImageUploadField
                  label="Project image"
                  value={project.image}
                  uploading={uploadingKey === `project-${project.id}`}
                  onChange={(value) => updateCollectionItem('projects', index, { image: value })}
                  onUpload={(file) =>
                    uploadImage(
                      file,
                      (url) => updateCollectionItem('projects', index, { image: url }),
                      `project-${project.id}`
                    )
                  }
                />

                <div className="form-grid form-grid--two">
                  <TextField
                    label="External link"
                    value={project.link}
                    onChange={(value) => updateCollectionItem('projects', index, { link: value })}
                  />
                  <ToggleField
                    label="Featured project"
                    checked={Boolean(project.featured)}
                    onChange={(value) => {
                      updateSection(
                        'projects',
                        portfolio.projects.map((item, itemIndex) => ({
                          ...item,
                          featured: itemIndex === index ? value : value ? false : item.featured
                        }))
                      );
                    }}
                  />
                </div>

                <div className="form-grid form-grid--two">
                  <TextAreaField
                    label="Services"
                    helper="One item per line."
                    value={formatList(project.services)}
                    onChange={(value) =>
                      updateCollectionItem('projects', index, { services: parseList(value) })
                    }
                  />
                  <TextAreaField
                    label="Tech & approach"
                    helper="One item per line."
                    value={formatList(project.tech)}
                    onChange={(value) =>
                      updateCollectionItem('projects', index, { tech: parseList(value) })
                    }
                  />
                </div>

                <div className="stack">
                  <div className="subsection-header">
                    <h3>Project metrics</h3>
                    <button
                      className="button button--ghost"
                      type="button"
                      onClick={() =>
                        updateCollectionItem('projects', index, {
                          metrics: [...project.metrics, createMetric()]
                        })
                      }
                    >
                      <Plus size={18} />
                      Add metric
                    </button>
                  </div>

                  {project.metrics.map((metric, metricIndex) => (
                    <div key={metric.id ?? `${project.id}-${metricIndex}`} className="metric-editor">
                      <TextField
                        label="Value"
                        value={metric.value}
                        onChange={(value) =>
                          updateCollectionItem('projects', index, {
                            metrics: replaceAtIndex(project.metrics, metricIndex, {
                              ...metric,
                              value
                            })
                          })
                        }
                      />
                      <TextField
                        label="Label"
                        value={metric.label}
                        onChange={(value) =>
                          updateCollectionItem('projects', index, {
                            metrics: replaceAtIndex(project.metrics, metricIndex, {
                              ...metric,
                              label: value
                            })
                          })
                        }
                      />
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() =>
                          updateCollectionItem('projects', index, {
                            metrics: project.metrics.filter(
                              (_, itemIndex) => itemIndex !== metricIndex
                            )
                          })
                        }
                        aria-label="Remove metric"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="preview-card preview-card--media">
                  {project.image ? <img src={project.image} alt={project.title || 'Project preview'} /> : null}
                  <div>
                    <span className="preview-card__eyebrow">Project preview</span>
                    <strong>{project.title || 'Untitled project'}</strong>
                    <p>{project.summary || 'Add a summary to preview this card.'}</p>
                  </div>
                </div>
              </CollectionCard>
            ))
          ) : (
            <EmptyState label="No projects yet. Add one to power the work section." />
          )}
        </section>

        <section className="dashboard-panel" id="experience">
          <PanelHeader
            title="Experience"
            description="Edit roles, timelines, summaries, and outcomes."
            onSave={() => saveSection('experience')}
            saving={savingKey === 'experience'}
          />

          <CollectionToolbar
            label="Experience entries"
            onAdd={() => addCollectionItem('experience', createExperience)}
          />

          {portfolio.experience.length ? (
            portfolio.experience.map((entry, index) => (
              <CollectionCard
                key={entry.id}
                title={entry.role || `Role ${index + 1}`}
                onRemove={() => removeCollectionItem('experience', index)}
              >
                <div className="form-grid form-grid--two">
                  <TextField
                    label="Company"
                    value={entry.company}
                    onChange={(value) =>
                      updateCollectionItem('experience', index, { company: value })
                    }
                  />
                  <TextField
                    label="Role"
                    value={entry.role}
                    onChange={(value) =>
                      updateCollectionItem('experience', index, { role: value })
                    }
                  />
                  <TextField
                    label="Period"
                    value={entry.period}
                    onChange={(value) =>
                      updateCollectionItem('experience', index, { period: value })
                    }
                  />
                  <TextField
                    label="Location"
                    value={entry.location}
                    onChange={(value) =>
                      updateCollectionItem('experience', index, { location: value })
                    }
                  />
                </div>
                <TextAreaField
                  label="Summary"
                  value={entry.summary}
                  onChange={(value) =>
                    updateCollectionItem('experience', index, { summary: value })
                  }
                />
                <TextAreaField
                  label="Achievements"
                  helper="One item per line."
                  value={formatList(entry.achievements)}
                  onChange={(value) =>
                    updateCollectionItem('experience', index, {
                      achievements: parseList(value)
                    })
                  }
                />
              </CollectionCard>
            ))
          ) : (
            <EmptyState label="No experience entries yet." />
          )}
        </section>

        <section className="dashboard-panel" id="achievements">
          <PanelHeader
            title="Achievements"
            description="Maintain highlights, recognitions, and milestone callouts."
            onSave={() => saveSection('achievements')}
            saving={savingKey === 'achievements'}
          />

          <CollectionToolbar
            label="Achievements"
            onAdd={() => addCollectionItem('achievements', createAchievement)}
          />

          {portfolio.achievements.length ? (
            portfolio.achievements.map((achievement, index) => (
              <CollectionCard
                key={achievement.id}
                title={achievement.title || `Achievement ${index + 1}`}
                onRemove={() => removeCollectionItem('achievements', index)}
              >
                <div className="form-grid form-grid--two">
                  <TextField
                    label="Title"
                    value={achievement.title}
                    onChange={(value) =>
                      updateCollectionItem('achievements', index, { title: value })
                    }
                  />
                  <TextField
                    label="Year"
                    value={achievement.year}
                    onChange={(value) =>
                      updateCollectionItem('achievements', index, { year: value })
                    }
                  />
                </div>
                <TextAreaField
                  label="Body"
                  value={achievement.body}
                  onChange={(value) =>
                    updateCollectionItem('achievements', index, { body: value })
                  }
                />
              </CollectionCard>
            ))
          ) : (
            <EmptyState label="No achievements yet." />
          )}
        </section>

        <section className="dashboard-panel" id="services">
          <PanelHeader
            title="Services"
            description="Update the offerings and deliverables shown on the site."
            onSave={() => saveSection('services')}
            saving={savingKey === 'services'}
          />

          <CollectionToolbar
            label="Services"
            onAdd={() => addCollectionItem('services', createService)}
          />

          {portfolio.services.length ? (
            portfolio.services.map((service, index) => (
              <CollectionCard
                key={service.id}
                title={service.title || `Service ${index + 1}`}
                onRemove={() => removeCollectionItem('services', index)}
              >
                <TextField
                  label="Title"
                  value={service.title}
                  onChange={(value) =>
                    updateCollectionItem('services', index, { title: value })
                  }
                />
                <TextAreaField
                  label="Description"
                  value={service.description}
                  onChange={(value) =>
                    updateCollectionItem('services', index, { description: value })
                  }
                />
                <TextAreaField
                  label="Deliverables"
                  helper="One item per line."
                  value={formatList(service.deliverables)}
                  onChange={(value) =>
                    updateCollectionItem('services', index, {
                      deliverables: parseList(value)
                    })
                  }
                />
              </CollectionCard>
            ))
          ) : (
            <EmptyState label="No services yet." />
          )}
        </section>

        <section className="dashboard-panel" id="contact">
          <PanelHeader
            title="Contact and socials"
            description="Control the closing call to action, contact methods, and social links."
            onSave={() => saveSections(['contact', 'socials'])}
            saving={savingKey === 'contact,socials'}
          />

          <div className="form-grid form-grid--two">
            <TextField
              label="CTA title"
              value={portfolio.contact.title}
              onChange={(value) => updateObjectField('contact', 'title', value)}
            />
            <TextField
              label="CTA label"
              value={portfolio.contact.ctaLabel}
              onChange={(value) => updateObjectField('contact', 'ctaLabel', value)}
            />
            <TextField
              label="CTA URL"
              value={portfolio.contact.ctaUrl}
              onChange={(value) => updateObjectField('contact', 'ctaUrl', value)}
            />
            <TextField
              label="Location"
              value={portfolio.contact.location}
              onChange={(value) => updateObjectField('contact', 'location', value)}
            />
            <TextField
              label="Email"
              value={portfolio.contact.email}
              onChange={(value) => updateObjectField('contact', 'email', value)}
            />
            <TextField
              label="Phone"
              value={portfolio.contact.phone}
              onChange={(value) => updateObjectField('contact', 'phone', value)}
            />
            <TextField
              label="Availability"
              value={portfolio.contact.availability}
              onChange={(value) => updateObjectField('contact', 'availability', value)}
            />
          </div>

          <TextAreaField
            label="Contact body"
            value={portfolio.contact.body}
            onChange={(value) => updateObjectField('contact', 'body', value)}
          />

          <CollectionToolbar
            label="Social links"
            onAdd={() => addCollectionItem('socials', createSocial)}
          />

          {portfolio.socials.length ? (
            portfolio.socials.map((social, index) => (
              <CollectionCard
                key={social.id}
                title={social.label || `Social ${index + 1}`}
                onRemove={() => removeCollectionItem('socials', index)}
              >
                <div className="form-grid form-grid--three">
                  <TextField
                    label="Label"
                    value={social.label}
                    onChange={(value) =>
                      updateCollectionItem('socials', index, { label: value })
                    }
                  />
                  <TextField
                    label="Handle"
                    value={social.handle}
                    onChange={(value) =>
                      updateCollectionItem('socials', index, { handle: value })
                    }
                  />
                  <TextField
                    label="URL"
                    value={social.url}
                    onChange={(value) =>
                      updateCollectionItem('socials', index, { url: value })
                    }
                  />
                </div>
              </CollectionCard>
            ))
          ) : (
            <EmptyState label="No social links yet." />
          )}
        </section>

        <div className="dashboard-footer">
          <button className="button button--ghost" type="button" onClick={() => window.location.reload()}>
            <RefreshCw size={18} />
            Reload dashboard
          </button>
          <a className="button" href={`mailto:${portfolio.contact.email}`}>
            <Mail size={18} />
            Email contact CTA
          </a>
        </div>
      </div>
    </main>
  );
}

function PanelHeader({ title, description, onSave, saving }) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="button" type="button" onClick={onSave} disabled={saving}>
        <Save size={18} />
        {saving ? 'Saving...' : 'Save section'}
      </button>
    </div>
  );
}

function CollectionToolbar({ label, onAdd }) {
  return (
    <div className="subsection-header">
      <h3>{label}</h3>
      <button className="button button--ghost" type="button" onClick={onAdd}>
        <Plus size={18} />
        Add new
      </button>
    </div>
  );
}

function CollectionCard({ title, children, onRemove }) {
  return (
    <motion.article
      className="collection-card"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
    >
      <div className="collection-card__header">
        <strong>{title}</strong>
        <button className="icon-button" type="button" onClick={onRemove} aria-label="Remove item">
          <Trash2 size={16} />
        </button>
      </div>
      {children}
    </motion.article>
  );
}

function EmptyState({ label }) {
  return <div className="empty-state">{label}</div>;
}

function TextField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, helper = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="toggle-field">
      <span>{label}</span>
      <button
        type="button"
        className={`toggle ${checked ? 'toggle--checked' : ''}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span />
      </button>
    </label>
  );
}

function ImageUploadField({ label, value, onChange, onUpload, uploading }) {
  return (
    <div className="image-upload-field">
      <TextField label={label} value={value} onChange={onChange} placeholder="Paste an image URL" />
      <label className="upload-button">
        <ImageUp size={18} />
        {uploading ? 'Uploading...' : 'Upload image'}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onUpload(file);
            }

            event.target.value = '';
          }}
        />
      </label>
      {value ? (
        <div className="preview-card preview-card--media preview-card--compact">
          <img src={value} alt={label} />
        </div>
      ) : null}
    </div>
  );
}
