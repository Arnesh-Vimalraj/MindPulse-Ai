import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Speak from './pages/Speak';
import ApiKeys from './pages/ApiKeys';
import Counselling from './pages/Counselling';
import FaceScanner from './components/FaceScanner';
import ScanResultsPage from './pages/ScanResultsPage';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

const AppContent = () => {
  const location = useLocation();
  const sidebarRoutes = ['/chat', '/dashboard', '/speak', '/api-keys', '/counselling', '/scan-results'];
  const authRoutes = ['/login', '/signup'];
  const hasSidebar = sidebarRoutes.includes(location.pathname);
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen soft-gradient flex flex-col">
      {!isAuthPage && <Navbar />}
      <main className={`flex-grow ${!isAuthPage ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/scan" element={<FaceScanner />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan-results" element={<ScanResultsPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/speak" element={<Speak />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/counselling" element={<Counselling />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
