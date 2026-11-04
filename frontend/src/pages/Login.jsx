import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Clapperboard,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CircleCheck,
} from 'lucide-react';

import Login1 from '../assets/Login1.jpg';

import Login2 from '../assets/Login1.jpg';
import { authApi } from '../api/systemAdministrationApi.js';

import '../css/Login.css'

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

      const response = await authApi.login({
        email: email.trim(),
        password
      });

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

      storage.setItem(
        'frameflow-permissions',
        JSON.stringify(response.user.permissions)
      );

      storage.setItem(
        'frameflow-roles',
        JSON.stringify(response.user.roles)
      );

      navigate('/', { replace: true });

    } catch (loginError) {

      setError(
        loginError.message ||
        'Unable to sign in. Please try again.'
      );

    } finally {

      setIsSubmitting(false);

    }

  };


  return (
  <main className="login-screen">

    {/* LEFT SIDE IMAGE */}
    <section
      className="login-visual"
      style={{ backgroundImage: `url(${Login1})` }}
    >
      <div className="login-image-overlay"></div>

      <div className="login-brand">
        <div className="login-brand-icon">
          <Clapperboard size={25} />
        </div>

        <div>
          <strong>LOOPSTREAM</strong>
          <span>PRODUCTION CRM</span>
        </div>
      </div>

      <div className="login-hero-copy">
        <div className="login-kicker">
          <i />
          YOUR PRODUCTION, IN SYNC
        </div>

        <h1>
          LOOPSTREAM
          <br />
          Frame <em>Every Story.</em>
        </h1>

        <p>
          Make every frame count.
          Manage your entire production workflow
          with one powerful workspace.
        </p>

        <div className="login-feature-list">
          <span><CircleCheck size={18} /> Production at a glance</span>
          <span><CircleCheck size={18} /> Teams & resources together</span>
          <span><CircleCheck size={18} /> Budgets under control</span>
        </div>
      </div>

      <div className="login-visual-footer">
        <span>BUILT FOR STORYTELLERS</span>
        <span>PLAN · PRODUCE · DELIVER</span>
      </div>
    </section>


    {/* RIGHT SIDE IMAGE + LOGIN FORM */}
    <section
      className="login-panel"
      style={{ backgroundImage: `url(${Login2})` }}
    >
      <div className="login-panel-overlay"></div>

      <div className="login-form-wrap">

        <div className="login-mobile-brand">
          <div className="login-brand-icon">
            <Clapperboard size={22} />
          </div>
          <strong>LOOPSTREAM</strong>
        </div>

        <div className="login-welcome">
          <span className="login-small-label">WELCOME BACK</span>

          <h2 className="singtext">
            Sign in to your
            <br />
            workspace<span>.</span>
          </h2>

          <p>Enter your details to continue to your dashboard.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>

          <label htmlFor="email">Work email</label>

          <div className="login-input-group">
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="password-label">
            <label htmlFor="password">Password</label>

            <button
              type="button"
              onClick={() =>
                setError(
                  'Contact your workspace administrator to reset your password.'
                )
              }
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
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
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

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in to dashboard'}
            <ArrowRight size={19} />
          </button>

        </form>

        <p className="login-switch">
          New to Loopstream?
          <Link to="/register">Create an account</Link>
        </p>

        <div className="login-secure-note">
          <ShieldCheck size={19} />
          <span>
            Your workspace is protected.
            Sign in to access your production data.
          </span>
        </div>

        <p className="login-copyright">
          &copy; 2026 LOOPSTREAM CRM
          <span>·</span>
          Made for teams that make stories.
        </p>

      </div>
    </section>

  </main>
);

}