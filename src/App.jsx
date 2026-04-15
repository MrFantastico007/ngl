import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SendMessagePage from './pages/SendMessagePage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminRegister from './pages/AdminRegister.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* ─── Public Routes ─────────────────────────── */}
        {/* Send anonymous message to a specific user */}
        <Route path="/message/:username" element={<SendMessagePage />} />

        {/* Default — show generic send page */}
        <Route path="/" element={<SendMessagePage />} />

        {/* After sending a message */}
        <Route path="/success" element={<SuccessPage />} />

        {/* ─── Hidden Admin Routes ────────────────────── */}
        {/* These paths are NOT linked anywhere on the public site */}
        <Route path="/x7admin" element={<AdminLogin />} />
        <Route path="/x7admin/register" element={<AdminRegister />} />
        <Route path="/x7admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<SendMessagePage />} />
      </Routes>
    </Router>
  );
}

export default App;
