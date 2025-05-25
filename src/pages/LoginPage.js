// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState(''); // 'id'에서 'email'로 변경하여 명확성 증대
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // 오류 메시지 상태
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // 이전 오류 메시지 초기화

    try {
      // 백엔드 API 엔드포인트 (프록시 설정된 경우 상대 경로, 아니면 전체 URL)
      // 예: const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      // const response = await fetch(`${apiUrl}/api/admin/auth/login`, {
      const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }), // 백엔드가 email 필드를 기대
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken); // 토큰 저장
          setIsLoggedIn(true);
          navigate('/'); // 로그인 성공 시 대시보드로 이동
        } else {
          setError('로그인에 성공했으나 토큰을 받지 못했습니다.');
        }
      } else {
        let errorMessage = '아이디 또는 비밀번호가 잘못되었습니다.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (response.statusText) {
            errorMessage = `${errorMessage} (오류: ${response.statusText})`;
          }
        } catch (jsonError) {
          // 에러 응답이 JSON 형식이 아닐 수 있음
          errorMessage = `${errorMessage} (상태 코드: ${response.status})`;
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('로그인 API 호출 오류:', err);
      setError('로그인 중 오류가 발생했습니다. 서버 상태 또는 네트워크 연결을 확인해주세요.');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">관리자 로그인 페이지</h1>
        {error && <p style={{ color: 'red', marginBottom: '10px', fontSize: '0.9em' }}>{error}</p>}
        <div>
          <label htmlFor="email">아이디 (이메일)</label> {/* 레이블 변경 */}
          <input
            type="text" // email 타입으로 변경해도 좋음: type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com" // 플레이스홀더 예시 변경
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">로그인</button>
      </form>
    </div>
  );
};

export default LoginPage;