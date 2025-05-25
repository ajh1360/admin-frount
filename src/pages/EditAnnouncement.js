// src/pages/EditAnnouncement.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// 임시 데이터
const mockAnnouncements = {
  '1': { title: '2025.03.07', content: '학교 끝나고 집 가는데 날씨가 진짜 미쳤더라. 바람 완전 세게 불어서 머리 다 청소아지고 난리남. 진짜 내 머리 상태 개판이었음.\n\n집 가는 길에 빵집 들러서 소세지 빵 샀는데, 먹으면서 걸어가다가 비둘기랑 눈 마주쳤어. 괜히 무서워서 빵 감췄음.\n\n집 와서 씻고 침대에 누웠는데, 그냥 기분이 되게 편안하더라. 아무 일도 없었지만 나름 괜찮은 하루였던 듯.\n\n내일은 더 재밌는 일 있었으면 좋겠네.', isActive: true },
  '2': { title: '2025 서버 점검 안내', content: '서버 점검 내용입니다.', isActive: false },
};


const EditAnnouncement = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true); // 게시글 활성 상태

  useEffect(() => {
    // 실제로는 API로 게시글 데이터를 가져옵니다.
    const post = mockAnnouncements[postId];
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setIsActive(post.isActive);
    } else {
      navigate('/announcements'); // 게시글 없으면 목록으로
    }
  }, [postId, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제로는 여기서 API로 수정 요청
    console.log('수정된 공지:', { postId, title, content, isActive });
    alert('공지사항이 수정되었습니다.');
    navigate('/announcements');
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      // 실제로는 여기서 API로 삭제 요청
      console.log('삭제된 공지 ID:', postId);
      alert('공지사항이 삭제되었습니다.');
      navigate('/announcements');
    }
  };

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/announcements">ADMIN &gt; 공지사항</Link> <span>&gt;</span> 공지사항 수정
      </div>
      <h1 className="page-title">공지사항 수정</h1> {/* 이미지에서는 "사용자 수정"이지만 문맥상 "공지사항 수정" */}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">게시글 제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">게시글 내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>상태</label>
          <button 
            type="button"
            onClick={() => setIsActive(true)}
            className={`status-button ${isActive ? 'btn-blue' : 'btn-gray'}`}
            style={{marginRight: '10px'}}
          >
            활성화
          </button>
          <button 
            type="button"
            onClick={() => setIsActive(false)}
            className={`status-button ${!isActive ? 'btn-red' : 'btn-gray'}`}
          >
            비활성화
          </button>
        </div>
        <div className="form-actions">
          <button type="button" onClick={handleDelete} className="btn-red">삭제</button>
          <button type="submit" className="btn-blue">저장</button>
          <button type="button" className="btn-gray" onClick={() => navigate('/announcements')}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default EditAnnouncement;