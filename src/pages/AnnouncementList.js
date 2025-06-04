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
      const noticeList = data.notices || data.content;
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
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchAnnouncements(currentPage);
  }, [fetchAnnouncements, currentPage]);

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


  if (loading && announcements.length === 0) {
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
              <th>공지 상태</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((ann) => (
              <tr key={ann.id}>
                <td>{ann.id}</td>
                <td>{ann.title}</td>
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
      {totalPages > 0 && renderPagination()}

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