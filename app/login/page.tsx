import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="login-container"
        style={{
          height: "auto",
          minHeight: "auto",
          background: "transparent",
        }}
      >
        <LoginForm />
      </div>
    </div>
  );
}
