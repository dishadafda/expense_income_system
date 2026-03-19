"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Working Logic States
  const [loginType, setLoginType] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // New state for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Working Login Logic
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      loginType,
      callbackUrl,
    });

    if (res?.error) {
      setError(`Invalid ${loginType} email or password.`);
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="login-container">
      <div className="login-box">

        {/* icon */}
        <div className="login-icon">
          <span className="user-icon">👤</span>
        </div>

        <h2 className="login-title">
          {loginType === "admin" ? "ADMIN LOGIN" : "USER LOGIN"}
        </h2>

        {/* Added minimal toggle to support the working backend logic */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "25px" }}>
          <button 
            type="button" 
            onClick={() => setLoginType("user")}
            style={{
              padding: "6px 16px", 
              borderRadius: "20px", 
              border: loginType === "user" ? "2px solid #fff" : "1px solid rgba(255,255,255,0.4)",
              background: loginType === "user" ? "rgba(255,255,255,0.2)" : "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            User
          </button>
          <button 
            type="button" 
            onClick={() => setLoginType("admin")}
            style={{
              padding: "6px 16px", 
              borderRadius: "20px", 
              border: loginType === "admin" ? "2px solid #fff" : "1px solid rgba(255,255,255,0.4)",
              background: loginType === "admin" ? "rgba(255,255,255,0.2)" : "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            Admin
          </button>
        </div>

        {error && (
          <p className="login-error" style={{ color: "#ffaaaa", textAlign: "center", marginBottom: "15px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <span className="input-icon">✉</span>
            <input
              type="email"
              placeholder={loginType === "admin" ? "admin@company.com" : "Email ID"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ position: "relative" }}>
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: "40px" }} // Added padding to prevent text overlapping with the icon
            />
            {/* Eye Icon Button for toggling password visibility */}
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "rgba(255, 255, 255, 0.7)",
                zIndex: 10,
                fontSize: "18px",
                userSelect: "none"
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "🙈"}
            </span>
          </div>

          <div className="login-options" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "25px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              Remember me
            </label>
            <span style={{ cursor: "pointer" }}>Forgot Password?</span>
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}