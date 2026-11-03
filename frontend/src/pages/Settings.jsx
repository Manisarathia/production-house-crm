import { useEffect, useState } from 'react';
import {
  Save,
  UserRound,
  Bell,
  ShieldCheck,
  Palette,
  Globe,
  LockKeyhole,
} from 'lucide-react';
import { settingsApi } from '../api/systemAdministrationApi.js';

const TABS = [
  ['General', Globe],
  ['Profile', UserRound],
  ['Notifications', Bell],
  ['Security', ShieldCheck],
  ['Appearance', Palette],
];

const DEFAULT_SETTINGS = {
  'workspace.name': 'Studio North',
  'workspace.url': 'studio-north',
  'workspace.timezone': 'Asia/Kolkata',
  'workspace.currency': 'INR',
  allowProjectCreation: 'true',
  requireExpenseApproval: 'true',
  weeklyProductionSummary: 'false',
  emailNotifications: 'true',
  deadlineReminders: 'true',
  invoicePaymentUpdates: 'true',
  twoFactorAuthentication: 'true',
  sessionTimeout: 'true',
  compactInterface: 'false',
  showDashboardTips: 'true',
  blueAccentColor: 'true',
};

const canWriteSettings = () => {
  try {
    const raw = sessionStorage.getItem('frameflow-permissions')
      || localStorage.getItem('frameflow-permissions')
      || '[]';
    return JSON.parse(raw).includes('SETTINGS_WRITE');
  } catch {
    return false;
  }
};

function Toggle({ title, desc, value, onChange, disabled }) {
  const isOn = value === 'true';
  return (
    <div className="toggle-row">
      <div><strong>{title}</strong><p>{desc}</p></div>
      <button
        type="button"
        aria-label={`Toggle ${title}`}
        aria-pressed={isOn}
        className={`toggle ${isOn ? 'on' : ''}`}
        onClick={() => onChange(isOn ? 'false' : 'true')}
        disabled={disabled}
      >
        <i />
      </button>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('General');
  const [values, setValues] = useState(DEFAULT_SETTINGS);
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const writable = canWriteSettings();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const records = await settingsApi.list();
        const loaded = { ...DEFAULT_SETTINGS };
        records.forEach((setting) => {
          if (!setting.sensitive && setting.value !== null) loaded[setting.key] = setting.value;
        });
        setValues(loaded);
        setOriginal(loaded);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load workspace settings.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const setValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const changed = Object.entries(values).filter(([key, value]) => value !== original[key]);
      const responses = await Promise.all(changed.map(([key, value]) =>
        Object.hasOwn(original, key)
          ? settingsApi.update(key, value)
          : settingsApi.create({ key, value, sensitive: false })
      ));
      setOriginal((current) => ({
        ...current,
        ...Object.fromEntries(responses.map((setting) => [setting.key, setting.value])),
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (requestError) {
      setError(requestError.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key, title, description) => (
    <Toggle
      title={title}
      desc={description}
      value={values[key] || 'false'}
      onChange={(value) => setValue(key, value)}
      disabled={!writable || loading}
    />
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE / PREFERENCES</div>
          <h1>Settings</h1>
          <p>Manage your workspace preferences and account security.</p>
        </div>
        {writable && <button className="btn btn-primary" onClick={handleSave} disabled={loading || saving}>
          <Save size={17} /> {saving ? 'Saving…' : saved ? 'Saved successfully' : 'Save changes'}
        </button>}
      </div>

      {error && <div className="empty-state" role="alert">{error}</div>}
      {loading && <div className="empty-state">Loading workspace settings…</div>}

      <div className="settings-layout">
        <div className="panel settings-nav">
          {TABS.map(([label, Icon]) => (
            <button key={label} className={`settings-tab ${tab === label ? 'selected' : ''}`} onClick={() => setTab(label)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        <div className="panel settings-content">
          <div className="settings-title">
            <h2>{tab} settings</h2>
            <p>{tab === 'General' ? 'Configure the basic details of your production workspace.' : `Manage your ${tab.toLowerCase()} preferences.`}</p>
          </div>

          {tab === 'General' ? (
            <>
              <div className="settings-section">
                <h3>Workspace information</h3>
                <div className="form-grid">
                  <label>Workspace name<input value={values['workspace.name']} onChange={(event) => setValue('workspace.name', event.target.value)} disabled={!writable} /></label>
                  <label>Workspace URL
                    <div className="input-prefix"><span>frameflow.app/</span><input value={values['workspace.url']} onChange={(event) => setValue('workspace.url', event.target.value)} disabled={!writable} /></div>
                  </label>
                  <label>Timezone<select value={values['workspace.timezone']} onChange={(event) => setValue('workspace.timezone', event.target.value)} disabled={!writable}>
                    <option value="Asia/Kolkata">India Standard Time (UTC+05:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">Europe/London</option>
                  </select></label>
                  <label>Default currency<select value={values['workspace.currency']} onChange={(event) => setValue('workspace.currency', event.target.value)} disabled={!writable}>
                    <option value="INR">INR — Indian Rupee (₹)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select></label>
                </div>
              </div>
              <div className="settings-section">
                <h3>Workspace preferences</h3>
                {toggle('allowProjectCreation', 'Allow project creation', 'Let authorized team members create new productions.')}
                {toggle('requireExpenseApproval', 'Require approval for expenses', 'Expenses must be approved by a finance manager.')}
                {toggle('weeklyProductionSummary', 'Weekly production summary', 'Send a summary of progress every Monday.')}
              </div>
            </>
          ) : tab === 'Notifications' ? (
            <div className="settings-section">
              <h3>Notification preferences</h3>
              {toggle('emailNotifications', 'Email notifications', 'Receive important updates by email.')}
              {toggle('deadlineReminders', 'Deadline reminders', 'Get notified before a production deadline.')}
              {toggle('invoicePaymentUpdates', 'Invoice and payment updates', 'Get notified when invoice statuses change.')}
            </div>
          ) : tab === 'Security' ? (
            <div className="settings-section">
              <h3>Security &amp; access</h3>
              {toggle('twoFactorAuthentication', 'Two-factor authentication', 'Require a second verification step for administrators.')}
              {toggle('sessionTimeout', 'Session timeout', 'Automatically sign out after inactivity.')}
              <div className="security-note">
                <LockKeyhole size={19} />
                <div><strong>Role-based access control</strong><p>Users should only access modules permitted by their assigned role.</p></div>
              </div>
            </div>
          ) : tab === 'Appearance' ? (
            <div className="settings-section">
              <h3>Appearance preferences</h3>
              {toggle('compactInterface', 'Use compact interface', 'Show more information with reduced spacing.')}
              {toggle('showDashboardTips', 'Show dashboard tips', 'Display helpful tips on your dashboard.')}
              {toggle('blueAccentColor', 'Use theme colors', 'Keep the workspace using production theme styling.')}
            </div>
          ) : (
            <div className="settings-section">
              <h3>Signed-in account</h3>
              <p>{sessionStorage.getItem('frameflow-user') || localStorage.getItem('frameflow-user') || 'No account information available.'}</p>
              <p>Account profile details are managed by your administrator.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
