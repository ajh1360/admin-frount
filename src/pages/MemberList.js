// src/pages/MemberList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // axiosInstance의 baseURL 설정이 중요합니다.

const ITEMS_PER_PAGE = 10; // 페이지 당 회원 수

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (API 응답의 currentPage가 0부터 시작)
  const [totalPages, setTotalPages] = useState(0);

  const fetchMembers = useCallback(async (page) => {
    setLoading(true);
    try {
      // API 요청 시 page와 size 파라미터 사용, API 엔드포인트 확인
      const response = await axiosInstance.get(`/members?page=${page}&size=${ITEMS_PER_PAGE}`);
      console.log('API 응답 데이터:', response.data);

      if (response.data && response.data.members) {
        setMembers(response.data.members || []);
        setTotalPages(response.data.totalPages || 0);
        // API 응답의 currentPage를 사용하여 동기화 할 수도 있으나,
        // UI에서 관리하는 currentPage를 기준으로 데이터를 요청하므로 필수적이진 않음.
        // setCurrentPage(response.data.currentPage);
      } else {
        setMembers([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('회원 목록 불러오기 실패:', error.response ? error.response.data : error.message);
      setMembers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []); // ITEMS_PER_PAGE는 상수이므로 의존성 배열에 추가하지 않아도 됩니다.

  useEffect(() => {
    fetchMembers(currentPage);
  }, [currentPage, fetchMembers]);

  // handleUpdateStatus 함수는 현재 API 명세에 '회원 상태(active/inactive)' 변경 기능이 없으므로 제거합니다.
  // 회원 정보 수정은 '/members/edit/:memberId' 경로의 페이지에서 PUT 요청을 통해 처리될 것입니다.

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  if (loading && members.length === 0) return <div>로딩 중...</div>;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    // 페이지네이션 버튼 표시 로직 (예: 최대 5개 버튼)
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage < 2) { // 현재 페이지가 0 또는 1일 때
        endPage = Math.min(totalPages - 1, 4); // 최대 0, 1, 2, 3, 4 페이지 버튼 표시
    }
    if (currentPage > totalPages - 3) { // 현재 페이지가 마지막에서 2번째 또는 1번째일 때
        startPage = Math.max(0, totalPages - 5); // 마지막 5개 페이지 버튼 표시
    }
    if (totalPages <=5) { // 전체 페이지 수가 5 이하일 경우 모든 페이지 버튼 표시
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
          {i + 1} {/* 사용자에게는 1부터 시작하는 페이지 번호로 표시 */}
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
          disabled={currentPage >= totalPages - 1 || loading}
          className="pagination-button"
        >
          마지막
        </button>
        <span style={{ marginLeft: '10px' }}>
          페이지: {currentPage + 1} / {totalPages}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className="breadcrumb">ADMIN {'>'} 회원관리</div>
      <h1 className="page-title">회원조회</h1>
      <p className="page-subtitle">User Admin</p>
      {loading && members.length > 0 && <div style={{ textAlign: 'center', margin: '10px 0', color: 'gray' }}>목록을 업데이트 중...</div>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>아이디 (이메일)</th>
            <th>이름</th>
            <th>사용자 수정</th> {/* API 명세에 따라 '상태 변경' 대신 '사용자 수정'만 남깁니다. */}
          </tr>
        </thead>
        <tbody>
          {members && members.length > 0 ? (
            members.map((member) => (
            <tr key={member.memberId}>
              <td>{member.email}</td>
              <td>{member.name}</td>
              <td>
                <Link to={`/members/edit/${member.memberId}`}>✏️</Link>
              </td>
            </tr>
            ))
            ) : (
              <tr>
                {/* 초기 로딩 시에는 "로딩 중..." 메시지가 표시되므로, 여기는 데이터가 없는 경우만 해당 */}
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  {loading ? "데이터를 불러오는 중입니다..." : "회원 정보가 없습니다."}
                </td>
              </tr>
            )}
        </tbody>
      </table>
      {renderPagination()}

      {/* 페이지네이션 버튼 스타일 (기존 코드와 동일하게 유지 또는 프로젝트 CSS에 맞게 수정) */}
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

export default MemberList;