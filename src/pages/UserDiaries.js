// src/pages/UserDiaries.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

// 간단한 모달 스타일 (실제 프로젝트에서는 CSS 파일로 분리하는 것이 좋습니다)
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative', // For close button positioning
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  diaryTitle: {
    fontSize: '1.5em',
    marginBottom: '10px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  diaryContent: {
    marginTop: '10px',
    whiteSpace: 'pre-wrap', // 줄바꿈 및 공백 유지
    lineHeight: '1.6',
  }
};


const UserDiaries = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiaryDetail, setSelectedDiaryDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/members/${userId}`);
      setUserInfo(response.data);
    } catch (err) {
      console.error('Failed to fetch user data for diary page:', err);
    }
  }, [userId]);

  const fetchDiaries = useCallback(async () => {
    if (!userId || !selectedYear || !selectedMonth) return;
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/diaries`, {
        params: {
          memberId: userId,
          year: selectedYear,
          month: selectedMonth,
        },
      });
      setDiaries(response.data.diaries || []);
    } catch (err) {
      console.error('사용자 일기 조회 실패:', err);
      setError(`일기 조회에 실패했습니다: ${err.response?.data?.message || err.message}`);
      setDiaries([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchUserData();
    fetchDiaries();
  }, [fetchUserData, fetchDiaries]);

  const handleDeleteDiary = async (diaryId) => {
    if (window.confirm(`정말로 이 일기(ID: ${diaryId})를 삭제하시겠습니까?`)) {
      try {
        await axiosInstance.delete(`/diaries/${diaryId}`);
        alert('일기가 삭제되었습니다.');
        fetchDiaries();
      } catch (err) {
        console.error('일기 삭제 실패:', err);
        alert(`일기 삭제 실패: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleViewDiary = async (diaryId) => {
  setIsModalOpen(true);
  setModalLoading(true); // API 호출이 없으므로 로딩은 짧게
  setModalError('');
  setSelectedDiaryDetail(null);

  // 현재 diaries 목록에서 해당 diaryId의 정보를 찾습니다.
  const diaryFromList = diaries.find(d => d.diaryId === diaryId);

  if (diaryFromList) {
    // API 호출 없이, 목록에서 가져온 기본 정보만으로 모달을 채웁니다.
    // title과 content는 없으므로, 해당 필드는 비어있거나 기본값으로 표시됩니다.
    setSelectedDiaryDetail({
      diaryId: diaryFromList.diaryId,
      writtenDate: diaryFromList.writtenDate,
      emotionType: diaryFromList.emotionType,
      title: `일기 (ID: ${diaryFromList.diaryId})`, // 임시 제목
      content: "상세 내용을 보려면 백엔드 API 구현이 필요합니다." // 임시 내용
    });
    setModalLoading(false);
  } else {
    setModalError(`일기 (ID: ${diaryId}) 정보를 목록에서 찾을 수 없습니다.`);
    setModalLoading(false);
  }
};

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDiaryDetail(null);
    setModalError('');
  };

  const handleFetchDiaries = () => {
    fetchDiaries();
  };

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/members">ADMIN {'>'} 회원관리</Link>
        <span> {'>'} </span>
        <Link to={`/users/${userId}`}>사용자 (ID: {userId})</Link>
        <span> {'>'} </span>
        <span>일기 관리</span>
      </div>
      <h1 className="page-title">
        {userInfo ? `${userInfo.name || userInfo.email}'s ` : `사용자 (ID: ${userId}) `}일기 목록
      </h1>

      <div className="filter-controls" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="year-select">연도:</label>
        <select 
          id="year-select"
          value={selectedYear} 
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <label htmlFor="month-select">월:</label>
        <select 
          id="month-select"
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {months.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
        <button className="btn-blue" onClick={handleFetchDiaries}>조회</button>
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && diaries.length === 0 && (
        <p>해당 기간에 작성된 일기가 없습니다.</p>
      )}

      {!loading && diaries.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>일기 ID</th>
              <th>작성 날짜</th>
              <th>감정 타입</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {diaries.map((diary) => (
              <tr key={diary.diaryId}>
                <td>{diary.diaryId}</td>
                <td>{diary.writtenDate}</td>
                <td>{diary.emotionType}</td>
                <td style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    className="btn-green" // '일기 확인' 버튼 스타일 (필요시 CSS 정의)
                    onClick={() => handleViewDiary(diary.diaryId)}
                    style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    일기 확인
                  </button>
                  <button 
                    className="btn-red" 
                    onClick={() => handleDeleteDiary(diary.diaryId)}
                    style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div style={modalStyles.overlay} onClick={closeModal}> {/* 오버레이 클릭 시 닫기 */}
          <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}> {/* 모달 컨텐츠 클릭은 전파 방지 */}
            <button style={modalStyles.closeButton} onClick={closeModal}>×</button>
            {modalLoading && <p>일기 내용을 불러오는 중...</p>}
            {modalError && <p style={{ color: 'red' }}>{modalError}</p>}
            {selectedDiaryDetail && !modalLoading && !modalError && (
              <>
                <h2 style={modalStyles.diaryTitle}>
                  {selectedDiaryDetail.title || `일기 (ID: ${selectedDiaryDetail.diaryId})`}
                </h2>
                <p><strong>작성일:</strong> {selectedDiaryDetail.writtenDate}</p>
                <p><strong>감정:</strong> {selectedDiaryDetail.emotionType}</p>
                <div style={modalStyles.diaryContent}>
                  <strong>내용:</strong>
                  <p>{selectedDiaryDetail.content || "내용이 없습니다."}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

       <div className="form-actions" style={{ marginTop: '20px' }}>
        <button className="btn-gray" onClick={() => navigate(`/members/edit/${userId}`)}>
          사용자 정보로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default UserDiaries;