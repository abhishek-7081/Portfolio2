import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading') {
    return (
      <main className="admin-login">
        <div className="route-loader">
          <div className="route-loader__panel">
            <span className="section-tag">Secure dashboard</span>
            <h2>Checking existing session...</h2>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form.email, form.password);
      const nextPath = location.state?.from?.pathname ?? '/admin';
      navigate(nextPath, { replace: true });
    } catch (nextError) {
      setError(nextError.message || 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <div className="admin-login__ambient admin-login__ambient--one" />
      <div className="admin-login__ambient admin-login__ambient--two" />

      <motion.section
        className="admin-login__panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-login__intro">
          <span className="section-tag">Secure dashboard</span>
          <h1>Manage portfolio content with a clean authenticated workspace.</h1>
          <p>
            Update projects, upload images, refine copy, and shape the public
            experience without touching source files.
          </p>

          <div className="admin-login__features">
            <article>
              <ShieldCheck size={20} />
              <div>
                <strong>Protected routes</strong>
                <span>Cookie-based admin session with guarded dashboard access.</span>
              </div>
            </article>
            <article>
              <Sparkles size={20} />
              <div>
                <strong>Live content model</strong>
                <span>Edit seeded sections, projects, skills, and socials in place.</span>
              </div>
            </article>
            <article>
              <LockKeyhole size={20} />
              <div>
                <strong>Image uploads</strong>
                <span>Store project and profile imagery directly through the admin UI.</span>
              </div>
            </article>
          </div>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="admin@portfolio.local"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Enter your admin password"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Enter dashboard'}
          </button>
        </form>
      </motion.section>
    </main>
  );
}
