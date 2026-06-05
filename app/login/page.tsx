import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="login-page d-flex align-items-center justify-content-center py-5">
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
