// src/pages/EditAnnouncement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const EditAnnouncement = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalData, setOriginalData] = useState(null); // 서버에서 받은 원본 데이터 (status 포함)
  // isActive는 UI 표현용. 서버에서 status를 직접 제어하지 않는다면, 이 값은 서버에 전송되지 않음.
  const [isActive, setIsActive] = useState(true); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  // 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/admin/notices/${postId}`, {
          headers: headers,
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('공지사항을 찾을 수 없습니다.');
          }
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        // 서버에서 status 필드가 온다고 가정하고, 이를 기반으로 isActive 설정
        // 만약 서버 응답에 status 필드가 없다면, 기본값을 사용하거나 다른 로직 필요
        setIsActive(data.status ? data.status === '활성화' : true); 
        setOriginalData(data); // 원본 데이터 저장 (status 포함)
      } catch (e) {
        console.error("Failed to fetch announcement:", e);
        setError(`공지사항을 불러오는데 실패했습니다: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    } else {
      navigate('/announcements'); // postId 없으면 목록으로
    }
  }, [postId, navigate, getAuthHeaders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setSubmitting(false);
      return;
    }

    // 서버의 PUT API가 title, content만 받는다고 가정.
    // status (isActive) 변경은 서버 API가 지원해야 함.
    // 만약 서버가 status 필드를 받는다면 body에 추가:
    // status: isActive ? '활성화' : '비활성화'
    const payload = {
      title,
      content,
      // writer는 서버에서 자동 설정
    };

    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/admin/notices/${postId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // const updatedPost = await response.json(); // 서버에서 업데이트된 전체 객체를 반환한다면 사용
      alert('공지사항이 수정되었습니다.');
      navigate('/announcements'); // 목록으로 이동 (목록 페이지에서 새로 fetch함)
    } catch (err) {
      console.error('Failed to update announcement:', err);
      setError(`공지사항 수정에 실패했습니다: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      setSubmitting(true);
      setError(null);
      const headers = getAuthHeaders();
      if (!headers) {
        setSubmitting(false);
        alert("인증 토큰이 없어 삭제할 수 없습니다.");
        return;
      }

      try {
        const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/admin/notices/${postId}`, {
          method: 'DELETE',
          headers: headers,
        });

        if (!response.ok) {
          // DELETE 요청은 보통 성공 시 204 No Content를 반환하며, body가 없을 수 있음
          if (response.status !== 204) { 
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
        }
        alert('공지사항이 삭제되었습니다.');
        navigate('/announcements');
      } catch (err) {
        console.error('Failed to delete announcement:', err);
        setError(`공지사항 삭제에 실패했습니다: ${err.message}`);
        // 실패 시에도 사용자는 현재 페이지에 머무르므로 submitting 상태 해제
        setSubmitting(false); 
      }
      // 성공 시에는 navigate 되므로 submitting 상태를 여기서 해제할 필요 없음
    }
  };
  
  if (loading) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/announcements">ADMIN > 공지사항</Link> <span>></span> 공지사항 수정
        </div>
        <h1 className="page-title">공지사항 수정</h1>
        <p>공지사항 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // getAuthHeaders에서 토큰 없을 때 error가 설정될 수 있으므로, error 먼저 체크
  if (error && !originalData) { // 데이터를 아예 못불러온 경우의 에러
     return (
      <div>
        <div className="breadcrumb">
          <Link to="/announcements">ADMIN > 공지사항</Link> <span>></span> 공지사항 수정
        </div>
        <h1 className="page-title">공지사항 수정</h1>
        <p style={{ color: 'red' }}>오류: {error}</p>
        <button onClick={() => window.location.reload()} className="btn-blue">다시 시도</button>
        <button className="btn-gray" onClick={() => navigate('/announcements')}>목록으로</button>
      </div>
    );
  }
  
  // originalData가 로드되지 않았고 로딩도 끝났는데 에러도 없다면 (예: postId가 잘못된 초기 상태)
  if (!originalData && !loading) {
    return (
      <div>
        <div className="breadcrumb">
          <Link to="/announcements">ADMIN > 공지사항</Link> <span>></span> 공지사항 수정
        </div>
        <h1 className="page-title">공지사항 수정</h1>
        <p>공지사항 정보를 찾을 수 없습니다.</p>
        <button className="btn-gray" onClick={() => navigate('/announcements')}>목록으로</button>
      </div>
    );
  }


  return (
    <div>
      <div className="breadcrumb">
        <Link to="/announcements">ADMIN > 공지사항</Link> <span>></span> 공지사항 수정
      </div>
      <h1 className="page-title">공지사항 수정</h1> 
      
      {/* 수정 중 발생한 에러 메시지 */}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>오류: {error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">게시글 제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">게시글 내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={submitting}
            rows="10"
          />
        </div>
        <div className="form-group">
          <label>상태 (표시용)</label>
          {/* 
            이 버튼들은 UI 상에서만 상태를 변경합니다. 
            실제 서버의 공지 상태(활성화/비활성화)는 
            AnnouncementList 페이지의 토글 버튼이나, 
            서버 API가 status 필드 수정을 지원해야 변경 가능합니다.
            현재 PUT 요청에서는 title과 content만 전송합니다.
          */}
          <button 
            type="button"
            onClick={() => setIsActive(true)}
            className={`status-button ${isActive ? 'btn-blue' : 'btn-gray'}`}
            style={{marginRight: '10px'}}
            disabled={submitting}
            title="이 상태 변경은 UI에만 적용되며, 저장 시 서버의 실제 상태가 변경되지 않을 수 있습니다."
          >
            활성화 (UI)
          </button>
          <button 
            type="button"
            onClick={() => setIsActive(false)}
            className={`status-button ${!isActive ? 'btn-red' : 'btn-gray'}`}
            disabled={submitting}
            title="이 상태 변경은 UI에만 적용되며, 저장 시 서버의 실제 상태가 변경되지 않을 수 있습니다."
          >
            비활성화 (UI)
          </button>
        </div>
        <div className="form-actions">
          <button type="button" onClick={handleDelete} className="btn-red" disabled={submitting}>
            {submitting ? '삭제 중...' : '삭제'}
          </button>
          <button type="submit" className="btn-blue" disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </button>
          <button type="button" className="btn-gray" onClick={() => navigate('/announcements')} disabled={submitting}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAnnouncement;