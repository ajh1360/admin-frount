// src/pages/UserDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 입력 폼 상태
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
 
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || userId === "undefined") {
        console.warn('유효하지 않은 userId:', userId);
        navigate('/members');
        return;
      }
      try {
        const response = await axiosInstance.get(`/members/${userId}`);
        setUser(response.data);
        setName(response.data.name);
        setBirthDate(response.data.birthDate ? response.data.birthDate.split('T')[0] : '');
        setPhone(response.data.phone || '');
        setPassword('');
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
        navigate('/members');
      }
    };
    fetchUser();
  }, [userId, navigate]);

  const handleUpdate = async () => {
    try {
      const payload = {
        name,
        birthDate,
        phone,
      };
      if (password) {
        payload.password = password;
      }

      await axiosInstance.put(`/members/${userId}`, payload);
      alert('회원 정보가 수정되었습니다.');
      navigate('/members');
    } catch (error) {
      console.error('회원 정보 수정 실패:', error);
      alert(`수정 실패: ${error.response?.data?.message || '다시 시도하세요.'}`);
    }
  };

  if (!user) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/members">ADMIN {'>'} 회원관리</Link> <span>{'>'}</span> 사용자 정보 수정
      </div>
      <h1 className="page-title">사용자 정보 수정</h1>

      <div className="form-group">
        <label>이메일</label>
        <input type="text" value={user.email} readOnly />
      </div>
      <div className="form-group">
        <label>이름</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>비밀번호</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="변경할 경우 입력" />
      </div>
      <div className="form-group">
        <label>생년월일</label>
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>
      <div className="form-group">
        <label>전화번호</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <label>사용자 활동</label>
        <button 
            className="btn-green"
            onClick={() => navigate(`/users/${userId}/diaries`)}
            style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
            사용자 일기 보기
        </button>
      </div>

      <div className="form-actions" style={{ marginTop: '30px' }}>
        <button className="btn-blue" onClick={handleUpdate}>수정하기</button>
        <button className="btn-gray" onClick={() => navigate('/members')}>목록으로</button>
      </div>

      {/* === CSS 스타일 추가 === */}
      <style jsx>{`
        .form-group {
          margin-bottom: 15px; /* 각 폼 그룹 간의 간격 */
        }
        .form-group label {
          display: block; /* 레이블을 블록 요소로 만들어 줄 바꿈 */
          margin-bottom: 5px; /* 레이블과 입력 필드 사이 간격 */
          font-weight: bold;
        }
        .form-group input[type="text"],
        .form-group input[type="password"],
        .form-group input[type="date"] {
          width: 100%; /* 입력 필드 너비를 100%로 설정 */
          padding: 10px; /* 내부 여백 */
          border: 1px solid #ccc; /* 테두리 */
          border-radius: 4px; /* 테두리 둥글게 */
          box-sizing: border-box; /* padding과 border가 width에 포함되도록 설정 */
          font-size: 1rem; /* 폰트 크기 일관성 */
        }
        .form-group input[readonly] {
          background-color: #e9ecef; /* 읽기 전용 필드 배경색 */
          cursor: not-allowed; /* 읽기 전용 커서 모양 */
        }
        .form-actions button {
          margin-right: 10px; /* 버튼 사이 간격 */
        }
        /* 기존에 App.css 등에 .btn-green, .btn-blue, .btn-gray 스타일이 정의되어 있다고 가정합니다. */
        /* 없다면 여기에 추가적인 버튼 스타일을 정의할 수 있습니다. */
      `}</style>
      {/* ===================== */}
    </div>
  );
};

export default UserDetails;