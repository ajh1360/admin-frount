// src/components/Layout.js
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LogoutModal from './LogoutModal';

const Layout = ({ setIsLoggedIn }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header onLogoutClick={() => setIsLogoutModalOpen(true)} />
        <main className="page-content">
          <Outlet /> {/* 여기에 각 페이지 컴포넌트가 렌더링됩니다. */}
        </main>
      </div>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Layout;