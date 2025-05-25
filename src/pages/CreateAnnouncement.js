// src/pages/CreateAnnouncement.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CreateAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제로는 여기서 API로 생성 요청
    console.log('새 공지:', { title, content });
    alert('공지사항이 작성되었습니다.');
    navigate('/announcements'); // 공지사항 목록으로 이동
  };

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/announcements">ADMIN > 공지사항</Link> <span>></span> 글쓰기
      </div>
      <h1 className="page-title">공지사항</h1>
      <p className="page-subtitle">Administrator Page</p>
      
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
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-blue">작성</button>
          <button type="button" className="btn-gray" onClick={() => navigate('/announcements')}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncement;