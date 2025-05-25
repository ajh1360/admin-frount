// src/pages/UserDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// 임시 데이터 (실제로는 API 호출)
const mockUsers = {
  'Star4U@abc.com': { name: 'Star4U', permissions: '저장소, 알림, 위치', notification: true },
  'BlueZin@abc.com': { name: 'BlueZin', permissions: '저장소, 알림', notification: false },
  'Echo99@abc.com': { name: 'Echo99', permissions: '알림, 위치', notification: true },
  'JellyQ@abc.com': { name: 'JellyQ', permissions: '저장소', notification: true },
};


const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    // 실제로는 API로 사용자 정보를 가져옵니다.
    const userData = mockUsers[decodeURIComponent(userId)];
    if (userData) {
      setUser(userData);
      setNotificationEnabled(userData.notification);
    } else {
      // 사용자를 찾을 수 없는 경우 처리
      navigate('/members'); // 예: 회원 목록으로 리디렉션
    }
  }, [userId, navigate]);

  const handleToggleNotification = () => {
    setNotificationEnabled(!notificationEnabled);
    // 실제로는 여기서 API로 상태를 업데이트합니다.
    console.log(`User ${userId} notification set to ${!notificationEnabled}`);
  };

  if (!user) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/members">ADMIN > 회원관리</Link> <span>></span> 사용자 정보
      </div>
      <h1 className="page-title">사용자 정보</h1>
      
      <div className="form-group">
        <label>사용자 이름 (아이디)</label>
        <input type="text" value={decodeURIComponent(userId)} readOnly />
      </div>
      <div className="form-group">
        <label>권한</label>
        <input type="text" value={user.permissions} readOnly />
      </div>
      <div className="form-group">
        <label>알림 설정</label>
        <div>
          <button 
            onClick={handleToggleNotification}
            className={`status-button ${notificationEnabled ? 'btn-blue' : 'btn-red'}`}
          >
            {notificationEnabled ? '활성화' : '비활성'}
          </button>
        </div>
      </div>
       <div className="form-actions">
        <button type="button" className="btn-gray" onClick={() => navigate('/members')}>목록으로</button>
      </div>
    </div>
  );
};

export default UserDetails;