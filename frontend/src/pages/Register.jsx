import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clapperboard, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Login1 from '../assets/Login1.jpg';
import { authApi } from '../api/systemAdministrationApi.js';

const storeSession = (response) => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.setItem('token', response.accessToken);
  localStorage.setItem('frameflow-auth', 'true');
  localStorage.setItem('frameflow-user', response.user.email);
  localStorage.setItem('frameflow-permissions', JSON.stringify(response.user.permissions));
  localStorage.setItem('frameflow-roles', JSON.stringify(response.user.roles));
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Please complete all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authApi.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      storeSession(response);
      navigate('/', { replace: true });
    } catch (registrationError) {
      setError(registrationError.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-visual">
        <img src={Login1} alt="Production workspace" className="login-visual-grid" />
        <div className="login-brand">
          <div className="login-brand-icon"><Clapperboard size={24} /></div>
          <div><strong>LOOPSTREAM</strong><span>PRODUCTION CRM</span></div>
        </div>
        <div className="login-hero-copy">
          <div className="login-kicker"><i /> YOUR PRODUCTION, IN SYNC</div>
          <h1>MAKE EVERY<br />FRAME <em>COUNT . . .</em></h1>
          <p>Create your workspace account and keep every production in one clear picture.</p>
        </div>
        <div className="login-visual-footer"><span>BUILT FOR STORYTELLERS</span><span>PLAN &middot; PRODUCE &middot; DELIVER</span></div>
      </section>

      <section
        className="login-panel register-panel"
        style={{ backgroundImage: `url(${Login1})` }}
      >
        <div className="login-panel-overlay" />
        <div className="login-form-wrap register-form-wrap">
          <div className="login-mobile-brand"><div className="login-brand-icon"><Clapperboard size={22} /></div><strong>LOOPSTREAM</strong></div>
          <div className="login-welcome">
            <span className="login-small-label">CREATE ACCOUNT</span>
            <h2>Start your workspace<span>.</span></h2>
            <p>Enter your details to create a secure production account.</p>
          </div>

          <form className="login-form register-form" onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input id="username" value={form.username} onChange={update('username')} placeholder="Your name" autoComplete="name" maxLength="120" />
            <label htmlFor="register-email">Email</label>
            <input id="register-email" type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" autoComplete="email" />
            <div className="register-password-row">
              <div className="register-password-control">
                <label htmlFor="register-password">Password</label>
                <div className="password-field">
                  <input id="register-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min. 6 characters" autoComplete="new-password" />
                  <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
              <div className="register-password-control">
                <label htmlFor="confirm-password">Confirm password</label>
                <div className="password-field">
                  <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Confirm password" autoComplete="new-password" />
                  <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'} <ArrowRight size={17} /></button>
          </form>
          <p className="login-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <div className="login-secure-note"><ShieldCheck size={17} /><span>Your new account has read-only access until an administrator assigns additional permissions.</span></div>
          <p className="login-copyright">&copy; 2026 FrameFlow CRM <span>&middot;</span> Made for teams that make stories.</p>
        </div>
      </section>
    </main>
  );
}
