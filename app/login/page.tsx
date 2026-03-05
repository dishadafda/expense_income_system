"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [loginType, setLoginType] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm border-0" style={{ minWidth: "400px", borderRadius: "12px" }}>
        <div className="card-body p-4">
          <h1 className="h4 mb-4 text-center fw-bold">Welcome Back</h1>
          
          <ul className="nav nav-pills nav-justified mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${loginType === "user" ? "active bg-primary text-white" : "text-muted"}`}
                onClick={() => setLoginType("user")}
                type="button"
              >
                User Login
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold ${loginType === "admin" ? "active bg-dark text-white" : "text-muted"}`}
                onClick={() => setLoginType("admin")}
                type="button"
              >
                Admin Login
              </button>
            </li>
          </ul>

          {error && (
            <div className="alert alert-danger py-2 text-center" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <div>
              <label htmlFor="email" className="form-label text-muted small fw-bold">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control form-control-lg bg-light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginType === "admin" ? "admin@company.com" : "user@example.com"}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label text-muted small fw-bold">Password</label>
              <input
                id="password"
                type="password"
                className="form-control form-control-lg bg-light"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={`btn btn-lg w-100 mt-3 fw-bold ${loginType === "admin" ? "btn-dark" : "btn-primary"}`}
              disabled={loading}
            >
              {loading ? "Signing in..." : `Sign in as ${loginType === "admin" ? "Admin" : "User"}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}