import "./loginFooter.css";

export default function LoginFooter() {
  return (
    <footer className="login-footer-bar">
      <p>© {new Date().getFullYear()} MosIC Solutions Pvt. Ltd. All rights reserved. · Bengaluru, Karnataka, India</p>
    </footer>
  );
}