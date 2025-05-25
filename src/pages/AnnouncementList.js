// src/pages/AnnouncementList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => { // useCallback으로 감싸서 getAuthHeaders가 재생성되지 않도록 함
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("Access token not found. User might not be logged in.");

      setError("인증 토큰이 없습니다. 다시 로그인해주세요.");
      return null; 
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []); 

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) { // 헤더 생성 실패 시 (토큰 없음 등)
      setLoading(false);
      // setError는 getAuthHeaders 내부에서 이미 설정되었을 수 있음
      return; 
    }

    try {
      // 서버 주소와 엔드포인트를 사용합니다.
      // 페이지네이션이 필요하다면 ?page=0&size=10 와 같은 파라미터를 추가할 수 있습니다.
      const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/admin/notices', {
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('공지사항을 불러올 권한이 없습니다. 다시 로그인해주세요.');
          // App.js의 ProtectedRoute 등에서 중앙화된 리디렉션 처리가 없다면 여기서 직접 처리
          // navigate('/login'); 
        } else {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return; // 오류 발생 시 함수 종료
      }
      const data = await response.json();
      const fetchedAnnouncements = (data.notices || data || []).map(ann => ({
        ...ann, // 서버에서 오는 필드들 (id, title, writer, createdDate, modifiedDate 등)
        status: ann.status || '활성화' 
      }));
      setAnnouncements(fetchedAnnouncements);
    } catch (e) {
      console.error("Failed to fetch announcements:", e);
      setError(`공지사항을 불러오는데 실패했습니다: ${e.message}`);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, navigate]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const toggleStatus = async (announcementId) => {
    const announcement = announcements.find(ann => ann.id === announcementId);
    if (!announcement) return;

    const headers = getAuthHeaders();
    if (!headers) {
        alert("인증 토큰이 없어 상태를 변경할 수 없습니다.");
        return;
    }
    
    // 낙관적 업데이트: UI를 먼저 변경
    const originalStatus = announcement.status;
    const newStatus = originalStatus === '활성화' ? '비활성화' : '활성화';

    setAnnouncements(currentAnnouncements =>
        currentAnnouncements.map(ann =>
        ann.id === announcementId
            ? { ...ann, status: newStatus }
            : ann
        )
    );

    try {
      // 서버 컨트롤러는 PUT /{noticeId} 를 통해 공지사항 전체를 수정합니다.
      // NoticeCreateRequestDto에는 title, content만 있으므로, status 변경은 서버에서 DTO 및 서비스 로직 수정이 필요합니다.
      // 현재는 title, content와 함께 가상의 status를 보냅니다. 서버는 title, content만 업데이트할 것입니다.
      // writer는 서버에서 로그인한 관리자의 이름으로 자동 설정됩니다.
      const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/admin/notices/${announcementId}`, {
        method: 'PUT',
        headers: headers,
        // 서버의 NoticeCreateRequestDto에 title, content만 있으므로, 이 요청은 title, content만 수정합니다.
        // status를 변경하려면 서버의 DTO와 서비스 로직 수정이 필요합니다.
        // 여기서는 title, content는 기존 값을 유지하고, 가상으로 status를 보냅니다.
        body: JSON.stringify({ 
            title: announcement.title, 
            content: announcement.content || "내용 없음", // content가 없을 경우 대비
            // status: newStatus // 서버 DTO에 status가 없으므로, 이 필드는 무시될 가능성이 높습니다.
                                 // 서버가 status를 처리하도록 수정해야 이 기능이 올바르게 동작합니다.
        }),
      });

      if (!response.ok) {
        // API 호출 실패 시 롤백
        setAnnouncements(currentAnnouncements =>
            currentAnnouncements.map(ann =>
            ann.id === announcementId
                ? { ...ann, status: originalStatus } // 원래 상태로 복원
                : ann
            )
        );
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || response.statusText || '알 수 없는 오류';
        setError(`상태 변경 실패 (ID: ${announcementId}): ${errorMessage}`);
        alert(`공지사항 상태 변경에 실패했습니다. (ID: ${announcementId}). 서버 DTO에 status 필드가 필요할 수 있습니다.`);
        return;
      }
      
      // 성공 시: 서버로부터 받은 최신 데이터로 상태 업데이트 (선택적)
      // PUT 요청 후 반환되는 객체에 status가 포함되어 있고, 최신 상태라면 아래 로직 사용 가능
      // const updatedAnnouncementFromServer = await response.json();
      // setAnnouncements(prevAnnouncements => prevAnnouncements.map(ann =>
      //   ann.id === announcementId ? { ...ann, ...updatedAnnouncementFromServer, status: newStatus } : ann 
      //   // newStatus를 강제하는 이유는 서버가 status를 반환하지 않을 수 있기 때문입니다.
      // ));
      console.log(`Announcement ${announcementId} status change attempted with PUT. Server may not support 'status' field update directly.`);
      // fetchAnnouncements(); // 상태 변경 후 목록을 다시 불러와서 동기화 (더 확실한 방법)

    } catch (e) {
      console.error("Failed to toggle status:", e);
      // API 호출 실패 시 롤백
      setAnnouncements(currentAnnouncements =>
        currentAnnouncements.map(ann =>
          ann.id === announcementId
            ? { ...ann, status: originalStatus }
            : ann
        )
      );
      setError('상태 변경 중 오류가 발생했습니다.');
      alert(`공지사항 상태 변경 중 오류가 발생했습니다. (ID: ${announcementId})`);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="breadcrumb">ADMIN {'>'} 공지사항</div>
        <h1 className="page-title">공지사항</h1>
        <p className="page-subtitle">Administrator Page</p>
        <p>공지사항을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="breadcrumb">ADMIN {'>'} 공지사항</div>
        <h1 className="page-title">공지사항</h1>
        <p className="page-subtitle">Administrator Page</p>
        <p style={{ color: 'red' }}>오류: {error}</p>
        <button onClick={fetchAnnouncements} className="btn-blue">다시 시도</button>
      </div>
    );
  }

  return (
    <div>
       <div className="breadcrumb">ADMIN {'>'} 공지사항</div>
      <h1 className="page-title">공지사항</h1>
      <p className="page-subtitle">Administrator Page</p>
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <button className="btn-blue" onClick={() => navigate('/announcements/create')}>글쓰기</button>
      </div>
      {announcements.length === 0 && !loading ? (
        <p>등록된 공지사항이 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>게시글 ID</th>
              <th>제목</th>
              <th>작성자</th>
              <th>공지 상태</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((ann) => (
              <tr key={ann.id}>
                <td>{ann.id}</td>
                <td>{ann.title}</td>
                <td>{ann.writer}</td> 
                <td>
                  <button
                    className={`status-button ${ann.status === '활성화' ? 'btn-blue' : 'btn-red'}`}
                    onClick={() => toggleStatus(ann.id)}
                    title="서버에서 status 필드 직접 변경을 지원하지 않을 수 있습니다."
                  >
                    {ann.status}
                  </button>
                </td>
                <td>
                  {/* 수정 페이지 라우트는 EditAnnouncement.js 파일이 필요합니다. */}
                  <Link to={`/announcements/edit/${ann.id}`} className="edit-icon">✏️</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnnouncementList;