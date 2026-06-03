"use client";

import { useEffect } from "react";
import LoginForm from "./LoginForm";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        zIndex: 2000,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="position-relative px-3"
        style={{ width: "100%", maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="btn btn-light btn-sm rounded-circle position-absolute"
          style={{
            top: -12,
            right: 0,
            width: 36,
            height: 36,
            zIndex: 10,
            lineHeight: 1,
          }}
          aria-label="Close sign in"
        >
          ✕
        </button>

        <div
          className="rounded-4 p-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 86, 163, 0.95) 0%, rgba(0, 158, 226, 0.9) 100%)",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.35)",
          }}
        >
          <p id="login-modal-title" className="visually-hidden">
            Sign in to CashTracker
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
