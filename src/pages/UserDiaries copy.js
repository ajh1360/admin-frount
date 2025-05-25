// src/pages/UserDiaries.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const UserDiaries = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [diaries, setDiaries] = useState([]);
  const [userInfo, setUserInfo] = useState(null); // To store user's name or email
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const fetchUserData = useCallback(async () => {
    // Fetch minimal user data like name/email for display purposes if needed
    // This is optional, but good for context on the page.
    // You might already have this if you pass it via route state, or fetch it.
    try {
      const response = await axiosInstance.get(`/members/${userId}`);
      setUserInfo(response.data);
    } catch (err) {
      console.error('Failed to fetch user data for diary page:', err);
      // Not critical for diary fetching, so don't block on this error
    }
  }, [userId]);

  const fetchDiaries = useCallback(async () => {
    if (!userId || !selectedYear || !selectedMonth) return;
    setLoading(true);
    setError('');
    try {
      // API: GET /api/admin/diaries?memberId={memberId}&year={year}&month={month}
      const response = await axiosInstance.get(`/diaries`, {
        params: {
          memberId: userId,
          year: selectedYear,
          month: selectedMonth,
        },
      });
      // Assuming the response structure is { diaries: [...] }
      setDiaries(response.data.diaries || []);
    } catch (err) {
      console.error('사용자 일기 조회 실패:', err);
      setError(`일기 조회에 실패했습니다: ${err.response?.data?.message || err.message}`);
      setDiaries([]); // Clear diaries on error
    } finally {
      setLoading(false);
    }
  }, [userId, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchUserData();
    fetchDiaries();
  }, [fetchUserData, fetchDiaries]); // Dependencies will trigger fetch on change

  const handleDeleteDiary = async (diaryId) => {
    if (window.confirm(`정말로 이 일기(ID: ${diaryId})를 삭제하시겠습니까?`)) {
      try {
        // Assumed API: DELETE /api/admin/diaries/{diaryId}
        // Note: The base URL for axiosInstance is /api/admin, so path is just /diaries/{diaryId}
        await axiosInstance.delete(`/diaries/${diaryId}`);
        alert('일기가 삭제되었습니다.');
        // Refetch diaries for the current view
        fetchDiaries();
      } catch (err) {
        console.error('일기 삭제 실패:', err);
        alert(`일기 삭제 실패: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleFetchDiaries = () => {
    // Triggered by button click after changing year/month
    fetchDiaries();
  };

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // Last 5 years to 4 years in future
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
                <td>
                  <button 
                    className="btn-red" // Assuming you have a .btn-red style for delete
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
       <div className="form-actions" style={{ marginTop: '20px' }}>
        <button className="btn-gray" onClick={() => navigate(`/users/${userId}`)}>사용자 정보로 돌아가기</button>
      </div>
    </div>
  );
};

export default UserDiaries;