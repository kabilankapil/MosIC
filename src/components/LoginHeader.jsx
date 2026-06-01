import logo from "../images/mosics.png";
import "./loginHeader.css";

export default function LoginHeader() {
  return (
    <header className="login-header">
      <div className="login-header-inner">
        <img src={logo} alt="MosIC Solutions" className="login-header-logo" />
        <span className="login-header-name">MosIC Solutions</span>
      </div>
    </header>
  );
}