import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/login";
import Admin from "./pages/Admin";
import LoginHeader from "./components/LoginHeader";
import LoginFooter from "./components/LoginFooter";
import { useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <>
      {!isAdmin && <LoginHeader />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {!isAdmin && <LoginFooter />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;