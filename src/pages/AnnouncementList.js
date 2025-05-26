// src/pages/AnnouncementList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => {
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
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://ceprj.gachon.ac.kr:60021/api/admin/notices', {
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('공지사항을 불러올 권한이 없습니다. 다시 로그인해주세요.');
        } else {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        setAnnouncements([]); // 오류 시 빈 배열로 설정
        return;
      }

      const data = await response.json();
      if (data && data.notices) {
        const fetchedAnnouncements = data.notices.map(ann => ({
          ...ann, // 서버에서 온 noticeId, title, writer (DTO에 있다면) 등이 포함됨
          id: ann.noticeId, // ann.noticeId 값을 id 라는 새로운 속성으로 복사 (매우 중요!)
          status: ann.status || '활성화' // 서버 DTO에 status가 있다면 ann.status 사용, 없다면 기본값 '활성화'
        }));

        console.log('Processed announcements:', fetchedAnnouncements); // id 필드가 있는지 확인
        setAnnouncements(fetchedAnnouncements);
      } else {
        console.error("Failed to parse announcements from response, 'data.notices' is missing:", data);
        setError('공지사항 목록을 가져오는 데 실패했습니다 (데이터 형식 오류).');
        setAnnouncements([]);
      }
    } catch (e) {
      console.error("Failed to fetch announcements:", e);
      setError(`공지사항을 불러오는데 실패했습니다: ${e.message}`);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, navigate]); // navigate 제거 가능성 있음 (현재 직접 사용 X)

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const toggleStatus = async (announcementId) => { // 이 announcementId는 이제 noticeId와 동일한 값
    const announcement = announcements.find(ann => ann.id === announcementId);
    if (!announcement) {
        console.warn(`Announcement with id ${announcementId} not found for toggling status.`);
        return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      alert("인증 토큰이 없어 상태를 변경할 수 없습니다.");
      return;
    }

    const originalStatus = announcement.status;
    const newStatus = originalStatus === '활성화' ? '비활성화' : '활성화';

    // 낙관적 업데이트
    setAnnouncements(currentAnnouncements =>
      currentAnnouncements.map(ann =>
        ann.id === announcementId
          ? { ...ann, status: newStatus }
          : ann
      )
    );

    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/admin/notices/${announcementId}`, { // URL의 ID도 동일
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          title: announcement.title,
          content: announcement.content || "내용 없음",
          // writer: announcement.writer, // 서버에서 로그인한 관리자로 자동 설정되므로 보낼 필요 없음
                                         // 만약 DTO에 writer가 있고 수정 가능해야 한다면 포함
          // status: newStatus // 서버 DTO에 status 수정 기능이 있다면 이 값을 보내야 함
        }),
      });

      if (!response.ok) {
        // 롤백
        setAnnouncements(currentAnnouncements =>
          currentAnnouncements.map(ann =>
            ann.id === announcementId
              ? { ...ann, status: originalStatus }
              : ann
          )
        );
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || response.statusText || `HTTP error ${response.status}`;
        setError(`상태 변경 실패 (ID: ${announcementId}): ${errorMessage}`);
        alert(`공지사항 상태 변경에 실패했습니다 (ID: ${announcementId}). 서버 DTO에 status 필드가 필요할 수 있습니다.`);
        return;
      }

      console.log(`Announcement ${announcementId} status change attempted with PUT. Server may not support 'status' field update directly.`);
      // 성공 시 UI는 이미 낙관적으로 업데이트됨.
      // 서버 응답에 따라 추가 업데이트가 필요하거나, 목록을 다시 불러올 수 있음
      // 예: fetchAnnouncements(); // 확실하게 동기화하려면
    } catch (e) {
      console.error("Failed to toggle status:", e);
      // 롤백
      setAnnouncements(currentAnnouncements =>
        currentAnnouncements.map(ann =>
          ann.id === announcementId
            ? { ...ann, status: originalStatus }
            : ann
        )
      );
      setError(`상태 변경 중 오류가 발생했습니다: ${e.message}`);
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
              // 이제 ann.id는 서버의 noticeId 값을 가짐
              <tr key={ann.id}>
                <td>{ann.id}</td>
                <td>{ann.title}</td>
                <td>{ann.writer}</td> {/* DTO에 writer가 있어야 정상 표시됨 */}
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