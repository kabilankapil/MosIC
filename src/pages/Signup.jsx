import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";

import { BASE_URL } from "../api/_base";

export default function Signup() {
  const nav = useNavigate();
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleChange(e) {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  }

  // ── Step 1: Request OTP ──────────────────────────────────
  async function handleSignup(e) {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;
    if (!fullName || !email || !password || !confirmPassword) { setError("All fields are required!"); return; }
    if (!email.includes("@") || !email.includes(".")) { setError("Please enter a valid email!"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters!"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match!"); return; }

    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("otp");
      setInfo(`A 6-digit OTP has been sent to ${email}`);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input handling ────────────────────────────────────
  function handleOtpChange(index, value) {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  }

  // ── Step 2: Verify OTP ───────────────────────────────────
  async function handleVerify(e) {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) { setError("Please enter the full 6-digit OTP."); return; }

    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Auto-login after verified
      localStorage.setItem("auth_token", data.token);
      sessionStorage.setItem("is_logged_in", "true");
      setInfo("Account verified! Redirecting...");
      setTimeout(() => nav("/admin", { replace: true }), 1000);
    } catch (err) {
      setError(err.message || "Verification failed.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true); setError(""); setInfo("");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInfo("New OTP sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP Screen ────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="otp-icon">📧</div>
          <h2>Verify Your Email</h2>
          <p className="subtitle">{info || `OTP sent to ${formData.email}`}</p>

          <form onSubmit={handleVerify} className="signup-form">
            <div className="otp-boxes" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="signup-btn" disabled={loading || otp.join("").length < 6}>
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
          </form>

          <div className="otp-footer">
            <p className="signup-link">
              Didn't receive it?{" "}
              {resendCooldown > 0
                ? <span className="resend-cooldown">Resend in {resendCooldown}s</span>
                : <span className="resend-link" onClick={handleResend}>Resend OTP</span>
              }
            </p>
            <p className="signup-link">
              <span onClick={() => { setStep("form"); setError(""); setOtp(["", "", "", "", "", ""]); }}>
                ← Change email
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup Form ───────────────────────────────────────────
  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Your Account</h2>
        <p className="subtitle">Join us and get started!</p>

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input type="text" id="fullName" name="fullName" placeholder="Enter your full name"
              value={formData.fullName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email"
              value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password"
              value={formData.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password"
              value={formData.confirmPassword} onChange={handleChange} />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Send Verification Code"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => nav("/login")}>Login here</span>
        </p>
      </div>
    </div>
  );
}
