// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MemberList from './pages/MemberList';
import UserDetails from './pages/UserDetails';
import UserDiaries from './pages/UserDiaries'; // UserDiaries 컴포넌트 임포트
import AnnouncementList from './pages/AnnouncementList';
import CreateAnnouncement from './pages/CreateAnnouncement';
import EditAnnouncement from './pages/EditAnnouncement';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn && !localStorage.getItem('accessToken')) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isLoggedIn ? <Navigate to="/" replace /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />
        } />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="members" element={<MemberList />} />
          {/* 기존 사용자 정보 수정 페이지 라우트 */}
          <Route path="members/edit/:userId" element={<UserDetails />} /> 
          
          {/* === 새로운 사용자 일기 관리 페이지 라우트 추가 === */}
          {/* UserDetails 페이지에서 '/users/:userId/diaries'로 이동하므로, 이 경로를 사용합니다. */}
          {/* 일관성을 위해 members 하위로 두거나 users 하위로 둘 수 있습니다. 여기서는 users로 설정합니다. */}
          <Route path="users/:userId/diaries" element={<UserDiaries />} />
          {/* ============================================== */}

          <Route path="users/manage" element={<MemberList />} /> 
          
          <Route path="announcements" element={<AnnouncementList />} />
          <Route path="announcements/create" element={<CreateAnnouncement />} />
          <Route path="announcements/edit/:postId" element={<EditAnnouncement />} />
          <Route path="announcements/manage" element={<AnnouncementList />} />
        </Route>
        
        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;