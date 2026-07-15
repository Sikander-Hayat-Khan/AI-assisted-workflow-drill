"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── SVG Icons (inline for zero-dependency) ────────────────── */
const Icons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

/* ── Default Settings ──────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  fullName: "",
  email: "",
  username: "",
  bio: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactor: false,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  marketingEmails: false,
  theme: "dark",
  fontSize: 16,
  compactMode: false,
  language: "en",
};

const STORAGE_KEY = "app-settings";

/* ── Navigation Items ──────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "account", label: "Account", icon: "shield" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "appearance", label: "Appearance", icon: "palette" },
];

/* ── Toast Component ───────────────────────────────────────── */
function Toast({ message, visible, hiding }) {
  if (!visible) return null;
  return (
    <div className={`toast${hiding ? " hiding" : ""}`} role="status" aria-live="polite">
      <span className="toast-icon">{Icons.check}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
}

/* ── Toggle Component ──────────────────────────────────────── */
function Toggle({ id, checked, onChange, label, description }) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <h4>{label}</h4>
        {description && <p>{description}</p>}
      </div>
      <label className="toggle-switch" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-track" />
        <span className="toggle-thumb" />
      </label>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
   ══════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toast, setToast] = useState({ visible: false, hiding: false, message: "" });
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  /* Load settings from localStorage on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore parse errors */
    }
    setMounted(true);
  }, []);

  /* Update a single setting */
  const update = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* Show toast */
  const showToast = useCallback((message) => {
    setToast({ visible: true, hiding: false, message });
    setTimeout(() => setToast((t) => ({ ...t, hiding: true })), 2600);
    setTimeout(() => setToast({ visible: false, hiding: false, message: "" }), 3000);
  }, []);

  /* Save settings */
  const handleSave = useCallback(
    (e) => {
      e.preventDefault();
      const toSave = { ...settings };
      delete toSave.currentPassword;
      delete toSave.newPassword;
      delete toSave.confirmPassword;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      showToast("Settings saved successfully");
    },
    [settings, showToast]
  );

  /* Cancel / reset */
  const handleCancel = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  /* Avatar upload handler */
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  /* Prevent flash of unstyled content */
  if (!mounted) return null;

  /* ── Section Renderers ─────────────────────────────────────── */

  const renderProfile = () => (
    <div className="settings-section" key="profile">
      <div className="section-header">
        <h2>Profile</h2>
        <p>Manage your public profile information</p>
      </div>

      <div className="settings-card">
        <div className="avatar-section">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" />
            ) : (
              settings.fullName ? settings.fullName.charAt(0).toUpperCase() : "U"
            )}
          </div>
          <div>
            <button
              type="button"
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
              id="avatar-upload"
            />
            <p className="form-hint" style={{ marginTop: 8 }}>
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={settings.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="johndoe"
              value={settings.username}
              onChange={(e) => update("username", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="john@example.com"
            value={settings.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="form-input"
            placeholder="Tell us about yourself..."
            value={settings.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={4}
          />
          <p className="form-hint">Brief description for your profile. Max 200 characters.</p>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="settings-section" key="account">
      <div className="section-header">
        <h2>Account &amp; Security</h2>
        <p>Manage your password, authentication, and account status</p>
      </div>

      <div className="settings-card">
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
          Change Password
        </h3>
        <div className="form-group">
          <label className="form-label" htmlFor="currentPassword">
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={settings.currentPassword}
            onChange={(e) => update("currentPassword", e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={settings.newPassword}
              onChange={(e) => update("newPassword", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={settings.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="settings-card">
        <Toggle
          id="twoFactor"
          checked={settings.twoFactor}
          onChange={(val) => update("twoFactor", val)}
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
        />
      </div>

      <div className="settings-card danger">
        <div className="danger-zone">
          <div className="danger-zone-info">
            <h4>Delete Account</h4>
            <p>Permanently remove your account and all associated data. This action cannot be undone.</p>
          </div>
          <button type="button" className="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="settings-section" key="notifications">
      <div className="section-header">
        <h2>Notifications</h2>
        <p>Choose how and when you want to be notified</p>
      </div>

      <div className="settings-card">
        <Toggle
          id="emailNotifications"
          checked={settings.emailNotifications}
          onChange={(val) => update("emailNotifications", val)}
          label="Email Notifications"
          description="Receive updates and alerts via email"
        />
        <Toggle
          id="pushNotifications"
          checked={settings.pushNotifications}
          onChange={(val) => update("pushNotifications", val)}
          label="Push Notifications"
          description="Get real-time notifications in your browser"
        />
        <Toggle
          id="smsNotifications"
          checked={settings.smsNotifications}
          onChange={(val) => update("smsNotifications", val)}
          label="SMS Notifications"
          description="Receive text messages for critical alerts"
        />
        <Toggle
          id="marketingEmails"
          checked={settings.marketingEmails}
          onChange={(val) => update("marketingEmails", val)}
          label="Marketing Emails"
          description="Stay up to date with product news and offers"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="settings-section" key="appearance">
      <div className="section-header">
        <h2>Appearance</h2>
        <p>Customize how the application looks and feels</p>
      </div>

      <div className="settings-card">
        <div className="form-group">
          <label className="form-label">Theme</label>
          <div className="theme-selector">
            {[
              { id: "light", label: "Light", icon: Icons.sun },
              { id: "dark", label: "Dark", icon: Icons.moon },
              { id: "system", label: "System", icon: Icons.monitor },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-option${settings.theme === t.id ? " active" : ""}`}
                onClick={() => update("theme", t.id)}
              >
                <span className="theme-icon">{t.icon}</span>
                <span className="theme-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="range-group">
          <div className="range-header">
            <label className="form-label" htmlFor="fontSize" style={{ marginBottom: 0 }}>
              Font Size
            </label>
            <span className="range-value">{settings.fontSize}px</span>
          </div>
          <input
            id="fontSize"
            type="range"
            min={12}
            max={24}
            step={1}
            value={settings.fontSize}
            onChange={(e) => update("fontSize", Number(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span className="form-hint">12px</span>
            <span className="form-hint">24px</span>
          </div>
        </div>

        <Toggle
          id="compactMode"
          checked={settings.compactMode}
          onChange={(val) => update("compactMode", val)}
          label="Compact Mode"
          description="Reduce spacing and padding for denser content"
        />
      </div>

      <div className="settings-card">
        <div className="form-group">
          <label className="form-label" htmlFor="language">
            Language
          </label>
          <select
            id="language"
            className="form-input"
            value={settings.language}
            onChange={(e) => update("language", e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );

  const SECTIONS = {
    profile: renderProfile,
    account: renderAccount,
    notifications: renderNotifications,
    appearance: renderAppearance,
  };

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} hiding={toast.hiding} />
      <form onSubmit={handleSave} className="settings-layout">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <div className="sidebar-header">
            <h1>Settings</h1>
            <p>Manage your preferences</p>
          </div>
          <nav className="sidebar-nav" aria-label="Settings navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item${activeSection === item.id ? " active" : ""}`}
                onClick={() => setActiveSection(item.id)}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                <span className="nav-icon">{Icons[item.icon]}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="settings-content">{SECTIONS[activeSection]()}</div>
      </form>
    </>
  );
}
