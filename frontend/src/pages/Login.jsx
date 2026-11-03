import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clapperboard,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Play,
  Film,
  CircleCheck,
} from 'lucide-react';

import Login1 from '../assets/Login1.jpg';
import { authApi } from '../api/systemAdministrationApi.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      localStorage.removeItem('token');
      localStorage.removeItem('frameflow-auth');
      localStorage.removeItem('frameflow-user');
      localStorage.removeItem('frameflow-permissions');
      localStorage.removeItem('frameflow-roles');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('frameflow-auth');
      sessionStorage.removeItem('frameflow-user');
      sessionStorage.removeItem('frameflow-permissions');
      sessionStorage.removeItem('frameflow-roles');
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('token', response.accessToken);
      storage.setItem('frameflow-auth', 'true');
      storage.setItem('frameflow-user', response.user.email);
      storage.setItem('frameflow-permissions', JSON.stringify(response.user.permissions));
      storage.setItem('frameflow-roles', JSON.stringify(response.user.roles));
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-visual">
        <img src={Login1} alt="Login Visual" className="login-visual-grid" />

        <div className="login-brand">
          <div className="login-brand-icon">
            <Clapperboard size={24} />
          </div>
          <div>
            <strong>LOOPSTREAM</strong>
            <span>PRODUCTION CRM</span>
          </div>
        </div>

        <div className="login-hero-copy">
          <div className="login-kicker">
            <i /> YOUR PRODUCTION, IN SYNC
          </div>
          <h1>
            LOOPSTREAM
            <br />
            frame <em>ZENVE . . .</em>
          </h1>
          <p>Make every frame count.</p>
          <div className="login-feature-list">
            <span>
              <CircleCheck size={16} /> Production at a glance
            </span>
            <span>
              <CircleCheck size={16} /> Teams & resources together
            </span>
            <span>
              <CircleCheck size={16} /> Budgets under control
            </span>
          </div>
        </div>
{/* 
        <div className="login-preview-card">
          <div className="preview-screen">
            <div className="preview-screen-top">
              <span />
              <span />
              <span />
              <b>PRODUCTION OVERVIEW</b>
            </div>
            <div className="preview-bars">
              <i /><i /><i /><i /><i /><i /><i />
            </div>
            <div className="preview-line">
              <span /><span /><span />
            </div>
          </div>
          <div className="preview-caption">
            <div className="preview-play">
              <Play size={15} fill="currentColor" />
            </div>
            <div>
              <strong>Every project. One clear picture.</strong>
              <span>Production workspace preview</span>
            </div>
            <Film size={19} />
          </div>
        </div> */}

        <div className="login-visual-footer">
          <span>BUILT FOR STORYTELLERS</span>
          <span>PLAN &middot; PRODUCE &middot; DELIVER</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <div className="login-brand-icon">
              <Clapperboard size={22} />
            </div>
            <strong>LOOPSTREAM</strong>
          </div>

          <div className="login-welcome">
            <span className="login-small-label">WELCOME BACK</span>
            <h2>
              Sign in to your
              <br />
              workspace<span>.</span>
            </h2>
            <p>Enter your details to continue to your dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />

            <div className="password-label">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                  onClick={() => setError('Contact your workspace administrator to reset your password.')}
              >
                Forgot password?
              </button>
            </div>

            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label className="remember-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Keep me signed in on this device</span>
            </label>

            {error && <div className="login-error">{error}</div>}

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in to dashboard'} <ArrowRight size={17} />
            </button>
          </form>

          <p className="login-switch">New to Loopstream? <Link to="/register">Create an account</Link></p>

          <div className="login-secure-note">
            <ShieldCheck size={17} />
            <span>Your workspace is protected. Sign in to access your production data.</span>
          </div>

          <p className="login-copyright">
            &copy; 2026 FrameFlow CRM <span>&middot;</span> Made for teams that make stories.
          </p>
        </div>
      </section>
    </main>
  );
}
