"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className = "btn btn-outline-danger" }: { className?: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className={className}
      >
        Logout
      </button>

      {showConfirm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1055 }}>
          <div className="card shadow-lg rounded-4 p-4" style={{ maxWidth: 420, width: "90%" }}>
            <h5 className="mb-2">Confirm Logout</h5>
            <p className="mb-4 text-muted">
              Are you sure you want to log out of your account?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}