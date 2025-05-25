// src/App.js
import React, { useState, useEffect } from 'react'; // useEffect 추가
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
  // localStorage에서 토큰을 확인하여 초기 로그인 상태 설정
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

  // ProtectedRoute 컴포넌트
  const ProtectedRoute = ({ children }) => {
    // isLoggedIn 상태가 false이고, localStorage에도 토큰이 없다면 로그인 페이지로 강제 이동
    // (앱 로드 시 localStorage 체크로 isLoggedIn이 이미 true일 수 있음)
    if (!isLoggedIn && !localStorage.getItem('accessToken')) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // 이 useEffect는 선택 사항입니다.
  // 로그인 상태가 외부 요인(예: 다른 탭에서의 로그아웃)으로 변경될 때 동기화하거나,
  // 토큰 유효성 검사 등을 수행할 수 있습니다.
  // 현재 로직에서는 로그인/로그아웃 시 명시적으로 localStorage를 관리하므로,
  // 이 useEffect가 없어도 기본적인 동작은 가능합니다.
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('accessToken'));
    };

    window.addEventListener('storage', handleStorageChange); // 다른 탭/창에서의 localStorage 변경 감지

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          // 이미 로그인 상태(isLoggedIn이 true)면 대시보드로 리디렉션
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