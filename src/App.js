// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MemberList from './pages/MemberList';
import UserDetails from './pages/UserDetails';
import AnnouncementList from './pages/AnnouncementList';
import CreateAnnouncement from './pages/CreateAnnouncement';
import EditAnnouncement from './pages/EditAnnouncement';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 초기값 false

  // ProtectedRoute 컴포넌트
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isLoggedIn ? <Navigate to="/" replace /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />
        } />
        
        {/* 로그인 해야 접근 가능한 라우트들 */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} /> {/* 기본 경로 / 에 DashboardPage */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="members" element={<MemberList />} />
          <Route path="members/edit/:userId" element={<UserDetails />} /> {/* 사용자 정보/수정 */}
          <Route path="users/manage" element={<MemberList />} /> {/* 사이드바 '사용자 수정' 클릭 시 */}
          
          <Route path="announcements" element={<AnnouncementList />} />
          <Route path="announcements/create" element={<CreateAnnouncement />} />
          <Route path="announcements/edit/:postId" element={<EditAnnouncement />} />
          <Route path="announcements/manage" element={<AnnouncementList />} /> {/* 사이드바 '공지사항 수정' 클릭 시 */}
        </Route>
        
        {/* 일치하는 라우트가 없을 경우 */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;