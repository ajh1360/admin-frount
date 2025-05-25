// src/components/Header.js
import React from 'react';

const Header = ({ onLogoutClick }) => {
  return (
    <header className="header">
      <div className="header-user-info">관리자 아이디: <span>ADMIN_USER</span></div>
      <button onClick={onLogoutClick} className="logout-button">로그아웃 X</button>
    </header>
  );
};

export default Header;