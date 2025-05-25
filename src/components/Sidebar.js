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
          <a href="#!" onClick={() => setManagementOpen(!managementOpen)} aria-expanded={managementOpen}>
            관리 {managementOpen ? '▼' : '▶'}
          </a>
          {managementOpen && (
            <ul className="submenu">
              <li><NavLink to="/members">회원조회</NavLink></li>
              {/* "사용자 조회" 링크 추가 - 현재는 회원조회와 동일한 /members 로 연결합니다. 
                  필요에 따라 별도의 사용자 검색/조회 페이지(/user-search 등)로 변경할 수 있습니다. */}
              <li><NavLink to="/members">사용자 조회</NavLink></li>
              {/* <li><NavLink to="/users/manage">사용자 수정</NavLink></li> 편의상 MemberList와 동일하게 연결 */}
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
              {/* <li><NavLink to="/announcements/manage">공지사항 수정</NavLink></li> 편의상 AnnouncementList와 동일하게 연결 */}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;