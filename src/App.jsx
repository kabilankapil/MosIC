import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import ServiceDetail from "./pages/ServiceDetail";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CircuitBackground from "./components/CircuitBackground";
import { useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";
  const isHomePage = location.pathname === "/";

  return (
    <>
      {!isHomePage && <CircuitBackground />}
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products/:productSlug" element={<ProductDetail />} />
        <Route path="/services/:serviceSlug" element={<ServiceDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
      {!isAdminPage && <Footer />}
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