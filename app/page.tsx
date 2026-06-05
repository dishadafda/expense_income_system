"use client";

import { useState } from "react";
import Image from "next/image";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);

  const openLogin = () => setLoginOpen(true);
  const closeLogin = () => setLoginOpen(false);

  return (
    <div
      className="landing-page bg-white"
      style={{
        margin: "-3rem",
        minHeight: "calc(100vh + 3rem)",
      }}
    >
      {/* Header */}
      <header className="border-bottom bg-white sticky-top">
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  width: 48,
                  height: 48,
                  overflow: "hidden",
                  padding: 6,
                  background: "#fff",
                  border: "1px solid rgba(0, 86, 163, 0.15)",
                }}
              >
                <Image
                  src="/logo.jpg"
                  alt="CashTracker logo"
                  width={40}
                  height={40}
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <span
                className="fw-bold fs-4 mb-0"
                style={{ color: "var(--dark-blue)" }}
              >
                CashTracker
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={openLogin}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 158, 226, 0.08) 0%, rgba(255,255,255,1) 60%)",
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-7 text-center text-lg-start">
              <h1
                className="display-4 fw-bold mb-4"
                style={{ color: "var(--dark-blue)" }}
              >
                Take Control of Your Finances
              </h1>
              <p className="lead text-muted mb-4 pe-lg-5">
                CashTracker helps you track incomes and expenses, manage projects
                and categories, and export reports — all in one place.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-lg px-5"
                onClick={openLogin}
              >
                Get Started Now
              </button>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0 text-center">
              <div
                className="card shadow-lg border-0 rounded-4 p-4 mx-auto"
                style={{ maxWidth: 360 }}
              >
                <div className="d-flex justify-content-center mb-3">
                  <Image
                    src="/logo.jpg"
                    alt="CrashTracker"
                    width={80}
                    height={80}
                    className="rounded-3"
                  />
                </div>
                <h5 className="fw-bold" style={{ color: "var(--dark-blue)" }}>
                  CrashTracker Expense Manager
                </h5>
                <p className="text-muted small mb-0">
                  Simple, secure, and built for teams and individuals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <h2
            className="text-center fw-bold mb-5"
            style={{ color: "var(--dark-blue)" }}
          >
            Everything you need to stay on top of money
          </h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 p-4">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(0, 158, 226, 0.15)",
                    color: "var(--primary-blue)",
                    fontSize: "1.5rem",
                  }}
                >
                  ₹
                </div>
                <h5 className="fw-bold" style={{ color: "var(--dark-blue)" }}>
                  Track Incomes &amp; Expenses
                </h5>
                <p className="text-muted mb-0">
                  Record every transaction with categories, projects, and clear
                  summaries on your dashboard.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 p-4">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(0, 86, 163, 0.12)",
                    color: "var(--dark-blue)",
                    fontSize: "1.5rem",
                  }}
                >
                  📁
                </div>
                <h5 className="fw-bold" style={{ color: "var(--dark-blue)" }}>
                  Project &amp; Category Management
                </h5>
                <p className="text-muted mb-0">
                  Organize spending by project and custom categories so reports
                  stay meaningful.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 p-4">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(0, 158, 226, 0.15)",
                    color: "var(--primary-blue)",
                    fontSize: "1.5rem",
                  }}
                >
                  📄
                </div>
                <h5 className="fw-bold" style={{ color: "var(--dark-blue)" }}>
                  Export to Excel &amp; PDF
                </h5>
                <p className="text-muted mb-0">
                  Share insights with stakeholders using export-ready reports
                  when you need them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top text-center text-muted small">
        <div className="container">
          © {new Date().getFullYear()} CashTracker · WealthWise Expense Manager
        </div>
      </footer>

      <LoginModal isOpen={loginOpen} onClose={closeLogin} />
    </div>
  );
}
