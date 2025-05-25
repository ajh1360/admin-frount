// src/pages/CreateAnnouncement.js
import React, { useState, useCallback } from 'react'; // useCallback 추가
import { useNavigate, Link } from 'react-router-dom';

const CreateAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null); // 오류 상태 추가
  const [submitting, setSubmitting] = useState(false); // 제출 중 상태 추가
  const navigate = useNavigate();

  // 인증 헤더를 가져오는 함수
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("Access token not found.");
      setError("인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const headers = getAuthHeaders();
    if (!headers) {
      setSubmitting(false);
      // 에러 메시지는 getAuthHeaders에서 이미 설정되었을 수 있음
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/admin/notices', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // 성공적으로 생성된 공지사항 객체를 반환받을 수 있습니다. (선택적)
      // const newAnnouncement = await response.json();
      // console.log('새 공지 생성 성공:', newAnnouncement);

      alert('공지사항이 작성되었습니다.');
      navigate('/announcements'); // 공지사항 목록으로 이동
    } catch (err) {
      console.error('Failed to create announcement:', err);
      setError(`공지사항 작성에 실패했습니다: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/announcements">ADMIN {'>'} 공지사항</Link> <span>{'>'}</span> 글쓰기
      </div>
      <h1 className="page-title">공지사항</h1>
      <p className="page-subtitle">Administrator Page</p>
      
      {error && <p style={{ color: 'red' }}>오류: {error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">공지 제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="2025 정규 업데이트"
            required
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">공지 내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="2025 정규 업데이트 안내"
            required
            disabled={submitting}
            rows="10"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-blue" disabled={submitting}>
            {submitting ? '작성 중...' : '작성'}
          </button>
          <button type="button" className="btn-gray" onClick={() => navigate('/announcements')} disabled={submitting}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncement;