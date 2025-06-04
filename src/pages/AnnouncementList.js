// src/pages/AnnouncementList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10; // 페이지 당 공지사항 수

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (API는 0부터 시작)
  const [totalPages, setTotalPages] = useState(0);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("Access token not found. User might not be logged in.");
      setError("인증 토큰이 없습니다. 다시 로그인해주세요.");
      // navigate('/login'); // 필요시 로그인 페이지로 리다이렉트
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const fetchAnnouncements = useCallback(async (page) => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      // API URL에 page와 size 파라미터 추가
      // 서버 API가 페이지네이션을 지원하고, page(0부터 시작), size 파라미터를 받는다고 가정합니다.
      const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/admin/notices?page=${page}&size=${ITEMS_PER_PAGE}`, {
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('공지사항을 불러올 권한이 없습니다. 다시 로그인해주세요.');
        } else {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        setAnnouncements([]);
        setTotalPages(0);
        return;
      }

      const data = await response.json();
      // 서버 응답 DTO에 따라 공지사항 목록과 전체 페이지 수를 가져옵니다.
      // 예시: Spring Pageable의 경우 data.content, data.totalPages
      // 여기서는 data.notices (목록)와 data.totalPages (전체 페이지 수)로 가정합니다.
      // 실제 API 응답 구조에 맞게 수정해주세요.
      const noticeList = data.notices || data.content; // 서버 응답에 따라 'notices' 또는 'content' 사용
      const totalPagesCount = data.totalPages;

      if (noticeList) {
        const fetchedAnnouncements = noticeList.map(ann => ({
          ...ann,
          id: ann.noticeId,
          status: ann.status || '활성화'
        }));
        
        setAnnouncements(fetchedAnnouncements);
        setTotalPages(totalPagesCount || 0);
      } else {
        console.error("Failed to parse announcements from response, expected 'notices' or 'content' field missing:", data);
        setError('공지사항 목록을 가져오는 데 실패했습니다 (데이터 형식 오류).');
        setAnnouncements([]);
        setTotalPages(0);
      }
    } catch (e) {
      console.error("Failed to fetch announcements:", e);
      setError(`공지사항을 불러오는데 실패했습니다: ${e.message}`);
      setAnnouncements([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]); // ITEMS_PER_PAGE는 상수이므로 의존성 배열에 추가 불필요

  useEffect(() => {
    fetchAnnouncements(currentPage);
  }, [fetchAnnouncements, currentPage]); // currentPage 변경 시 데이터 다시 로드

  const toggleStatus = async (announcementId) => {
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

    setAnnouncements(currentAnnouncements =>
      currentAnnouncements.map(ann =>
        ann.id === announcementId
          ? { ...ann, status: newStatus }
          : ann
      )
    );

    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60021/api/admin/notices/${announcementId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          title: announcement.title,
          content: announcement.content || "내용 없음",
          // writer: announcement.writer, // 서버에서 자동 설정
          // status: newStatus // 서버 DTO에 status 필드가 있다면 보내야 함
        }),
      });

      if (!response.ok) {
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
        alert(`공지사항 상태 변경에 실패했습니다 (ID: ${announcementId}).`);
        return;
      }
      // 상태 변경 성공 후, 현재 페이지를 다시 로드하여 최신 상태를 반영할 수 있습니다.
      // 또는 서버 응답에 업데이트된 공지사항이 있다면 그것으로 대체할 수도 있습니다.
      // 여기서는 낙관적 업데이트를 유지하고, 필요시 아래 주석 해제
      // fetchAnnouncements(currentPage); 
    } catch (e) {
      console.error("Failed to toggle status:", e);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      // fetchAnnouncements는 useEffect에 의해 currentPage 변경 시 자동으로 호출됨
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage < 2) {
        endPage = Math.min(totalPages - 1, 4);
    }
    if (currentPage > totalPages - 3) {
        startPage = Math.max(0, totalPages - 5);
    }
    if (totalPages <=5) {
        startPage = 0;
        endPage = totalPages - 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          disabled={loading}
        >
          {i + 1} 
        </button>
      );
    }

    return (
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0 || loading}
          className="pagination-button"
        >
          처음
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || loading}
          className="pagination-button"
        >
          이전
        </button>
        {pageNumbers}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="pagination-button"
        >
          다음
        </button>
        <button
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || loading || totalPages === 0}
          className="pagination-button"
        >
          마지막
        </button>
        <span style={{ marginLeft: '10px' }}>
          페이지: {currentPage + 1} / {totalPages > 0 ? totalPages : 1}
        </span>
      </div>
    );
  };


  if (loading && announcements.length === 0) { // 초기 로딩 중일 때
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
        <button onClick={() => fetchAnnouncements(currentPage)} className="btn-blue">다시 시도</button>
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
      {loading && announcements.length > 0 && <div style={{ textAlign: 'center', margin: '10px 0', color: 'gray' }}>목록을 업데이트 중...</div>}
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
                    title="클릭하여 상태 변경 (서버 DTO에서 status 필드 수정 지원 필요)"
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
      {totalPages > 0 && renderPagination()} {/* 공지사항이 있을 때만 페이지네이션 표시 */}

      {/* 페이지네이션 CSS (MemberList.js와 동일) */}
      <style jsx>{`
      .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
        }
        .pagination-button {
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          padding: 8px 12px;
          margin: 0 4px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .pagination-button:hover:not(:disabled) {
          background-color: #e0e0e0;
        }
        .pagination-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .pagination-button.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementList;