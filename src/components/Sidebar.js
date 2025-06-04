// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [managementOpen, setManagementOpen] = useState(true);
  const [noticesOpen, setNoticesOpen] = useState(true);

  return (
    <nav className="sidebar">
      <div className="sidebar-header">Administrator</div>
      <div className="sidebar-menu-title">ADMIN</div>
      <ul>
        <li>
          <NavLink to="/dashboard">관리자 페이지</NavLink>
        </li>
        <li>
          <a href="#!" onClick={() => setManagementOpen(!managementOpen)} aria-expanded={managementOpen}>
            관리 {managementOpen ? '▼' : '▶'}
          </a>
          {managementOpen && (
            <ul className="submenu">
              <li><NavLink to="/members">회원조회</NavLink></li>
            </ul>
          )}
        </li>
        <li>
          <a href="#!" onClick={() => setNoticesOpen(!noticesOpen)} aria-expanded={noticesOpen}>
            공지사항 {noticesOpen ? '▼' : '▶'}
          </a>
          {noticesOpen && (
            <ul className="submenu">
              <li><NavLink to="/announcements">게시글 목록</NavLink></li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;