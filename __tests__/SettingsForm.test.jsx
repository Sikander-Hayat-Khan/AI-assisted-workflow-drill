import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsForm from "@/components/SettingsForm";

describe("SettingsForm", () => {
  // ── Valid submit ──────────────────────────────────────
  it("calls onSubmit with correct data when form is valid", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<SettingsForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /save settings/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    // Button should now be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        notifications: true,
        theme: "system",
      });
    });
  });

  // ── Invalid email rejection ───────────────────────────
  it("shows 'Enter a valid email' for invalid email without clearing other fields", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "not-an-email");
    // Blur away from email to trigger validation
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    });

    // Name field should still have its value
    expect(nameInput).toHaveValue("John Doe");
  });

  // ── Required field rejection ──────────────────────────
  it("shows error when name is too short", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const nameInput = screen.getByLabelText(/name/i);

    // Type a single character (below min 2)
    await user.type(nameInput, "A");
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters")
      ).toBeInTheDocument();
    });
  });

  // ── Toggle default state ──────────────────────────────
  it("has notifications toggle defaulting to on", () => {
    render(<SettingsForm />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeChecked();
  });

  // ── Select default state ──────────────────────────────
  it("has theme select defaulting to 'system'", () => {
    render(<SettingsForm />);

    const themeSelect = screen.getByLabelText(/theme/i);
    expect(themeSelect).toHaveValue("system");
  });

  // ── Submit button disabled while invalid ──────────────
  it("disables the submit button when the form is invalid", () => {
    render(<SettingsForm />);

    const submitButton = screen.getByRole("button", { name: /save settings/i });
    expect(submitButton).toBeDisabled();
  });
});
