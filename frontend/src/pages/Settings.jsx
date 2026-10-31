import { useState } from 'react';
import {
  Save,
  UserRound,
  Bell,
  ShieldCheck,
  Palette,
  Globe,
  LockKeyhole,
} from 'lucide-react';

const TABS = [
  ['General', Globe],
  ['Profile', UserRound],
  ['Notifications', Bell],
  ['Security', ShieldCheck],
  ['Appearance', Palette],
];

function Toggle({ title, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="toggle-row">
      <div>
        <strong>{title}</strong>
        <p>{desc}</p>
      </div>
      <button
        type="button"
        aria-label={`Toggle ${title}`}
        aria-pressed={on}
        className={`toggle ${on ? 'on' : ''}`}
        onClick={() => setOn(!on)}
      >
        <i />
      </button>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('General');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE / PREFERENCES</div>
          <h1>Settings</h1>
          <p>Manage your workspace preferences and account security.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={17} />
          {saved ? 'Saved successfully' : 'Save changes'}
        </button>
      </div>

      <div className="settings-layout">
        <div className="panel settings-nav">
          {TABS.map(([label, Icon]) => (
            <button
              key={label}
              className={`settings-tab ${tab === label ? 'selected' : ''}`}
              onClick={() => setTab(label)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="panel settings-content">
          <div className="settings-title">
            <h2>{tab} settings</h2>
            <p>
              {tab === 'General'
                ? 'Configure the basic details of your production workspace.'
                : `Manage your ${tab.toLowerCase()} preferences.`}
            </p>
          </div>

          {tab === 'General' ? (
            <>
              <div className="settings-section">
                <h3>Workspace information</h3>
                <div className="form-grid">
                  <label>
                    Workspace name
                    <input defaultValue="Studio North" />
                  </label>
                  <label>
                    Workspace URL
                    <div className="input-prefix">
                      <span>frameflow.app/</span>
                      <input defaultValue="studio-north" />
                    </div>
                  </label>
                  <label>
                    Timezone
                    <select defaultValue="Asia/Kolkata">
                      <option value="Asia/Kolkata">India Standard Time (UTC+05:30)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </label>
                  <label>
                    Default currency
                    <select defaultValue="INR">
                      <option value="INR">INR — Indian Rupee (₹)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Workspace preferences</h3>
                <Toggle
                  title="Allow project creation"
                  desc="Let authorized team members create new productions."
                  defaultOn
                />
                <Toggle
                  title="Require approval for expenses"
                  desc="Expenses must be approved by a finance manager."
                  defaultOn
                />
                <Toggle
                  title="Weekly production summary"
                  desc="Send a summary of progress every Monday."
                />
              </div>
            </>
          ) : tab === 'Notifications' ? (
            <div className="settings-section">
              <h3>Notification preferences</h3>
              <Toggle
                title="Email notifications"
                desc="Receive important updates by email."
                defaultOn
              />
              <Toggle
                title="Deadline reminders"
                desc="Get notified before a production deadline."
                defaultOn
              />
              <Toggle
                title="Invoice and payment updates"
                desc="Get notified when invoice statuses change."
                defaultOn
              />
            </div>
          ) : tab === 'Security' ? (
            <div className="settings-section">
              <h3>Security &amp; access</h3>
              <Toggle
                title="Two-factor authentication"
                desc="Require a second verification step for administrators."
                defaultOn
              />
              <Toggle
                title="Session timeout"
                desc="Automatically sign out after inactivity."
                defaultOn
              />
              <div className="security-note">
                <LockKeyhole size={19} />
                <div>
                  <strong>Role-based access control</strong>
                  <p>
                    Users should only access modules permitted by their assigned role.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="settings-section">
              <h3>{tab} preferences</h3>
              <Toggle
                title="Use compact interface"
                desc="Show more information with reduced spacing."
              />
              <Toggle
                title="Show dashboard tips"
                desc="Display helpful tips on your dashboard."
                defaultOn
              />
              <Toggle
                title="Use theme colors"
                desc="Keep the workspace using production theme styling."
                defaultOn
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
