"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Zod validation schema for the settings form.
 */
const settingsSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  notifications: z.boolean().default(true),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

const defaultValues = {
  name: "",
  email: "",
  notifications: true,
  theme: "system",
};

/**
 * SettingsForm — Accessible, validated settings form component.
 *
 * @param {object} props
 * @param {function} [props.onSubmit] — Called with validated form data on successful submit.
 */
export default function SettingsForm({ onSubmit }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submitHandler = (data) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log("Settings saved:", data);
    }
  };

  return (
    <div className="settings-card">
      <h1 className="settings-card__title">Settings</h1>
      <p className="settings-card__subtitle">
        Manage your account preferences
      </p>

      <form onSubmit={handleSubmit(submitHandler)} noValidate>
        {/* ── Name Field ────────────────────────── */}
        <div className="form-group">
          <label htmlFor="settings-name" className="form-label">
            Name
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="settings-name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "settings-name-error" : undefined
                }
              />
            )}
          />
          {errors.name && (
            <p className="form-error" id="settings-name-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* ── Email Field ───────────────────────── */}
        <div className="form-group">
          <label htmlFor="settings-email" className="form-label">
            Email
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="settings-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? "settings-email-error" : undefined
                }
              />
            )}
          />
          {errors.email && (
            <p className="form-error" id="settings-email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <hr className="form-divider" />

        {/* ── Notifications Toggle ──────────────── */}
        <div className="form-group">
          <div className="toggle-wrapper">
            <div>
              <label
                htmlFor="settings-notifications"
                className="toggle-label-text"
              >
                Notifications
              </label>
              <p className="toggle-label-desc">
                Receive email updates and alerts
              </p>
            </div>
            <Controller
              name="notifications"
              control={control}
              render={({ field }) => (
                <div className="toggle-switch">
                  <input
                    id="settings-notifications"
                    type="checkbox"
                    role="switch"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    aria-checked={field.value}
                  />
                  <span className="toggle-slider" aria-hidden="true" />
                </div>
              )}
            />
          </div>
        </div>

        {/* ── Theme Select ──────────────────────── */}
        <div className="form-group">
          <label htmlFor="settings-theme" className="form-label">
            Theme
          </label>
          <Controller
            name="theme"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="settings-theme"
                className="form-select"
                aria-invalid={!!errors.theme}
                aria-describedby={
                  errors.theme ? "settings-theme-error" : undefined
                }
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            )}
          />
          {errors.theme && (
            <p className="form-error" id="settings-theme-error" role="alert">
              {errors.theme.message}
            </p>
          )}
        </div>

        {/* ── Submit Button ─────────────────────── */}
        <button
          type="submit"
          className="form-submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
