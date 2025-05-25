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
      // userId가 없거나, 문자열 "undefined"일 경우 API 호출 방지
      if (!userId || userId === "undefined") {
        console.warn('유효하지 않은 userId:', userId);
        // 선택적으로 사용자를 목록으로 리디렉션하거나 오류 메시지 표시
        navigate('/members'); // 목록으로 이동 또는 오류 페이지
        return;
      }
      try {
        const response = await axiosInstance.get(`/members/${userId}`); // API: /api/admin/members/{memberId}
        setUser(response.data);
        setName(response.data.name);
        // Ensure birthDate is in 'YYYY-MM-DD' format for <input type="date">
        setBirthDate(response.data.birthDate ? response.data.birthDate.split('T')[0] : '');
        setPhone(response.data.phone || '');
        setPassword(''); // 보안을 위해 빈 값
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
        navigate('/members'); // 오류 발생 시 목록으로 이동
      }
    };
    fetchUser();
  }, [userId, navigate]);

  const handleUpdate = async () => {
    try {
      // 비밀번호가 비어있으면 payload에서 제외하거나, 서버에서 비어있는 경우 무시하도록 처리 필요
      // 여기서는 비밀번호가 비어있으면 null 또는 undefined로 보내지 않도록 조건부 추가
      const payload = {
        name,
        birthDate,
        phone,
      };
      if (password) { // 비밀번호가 입력된 경우에만 payload에 포함
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

      {/* 사용자 일기 보기 버튼 추가 */}
      <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <label>사용자 활동</label>
        <button 
            className="btn-green" // Use an appropriate class or style
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
    </div>
  );
};

export default UserDetails;