// src/pages/AnnouncementList.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const initialAnnouncements = [
  { id: '2', title: '2025 서버 점검 안내', status: '활성화' },
  { id: '3', title: '2025 정기 업데이트 안내', status: '활성화' },
  { id: '4', title: '2025 ㅁㅁㅁㅁ', status: '비활성화' },
  { id: '5', title: '2025 ㅁㄴㅇㄹ', status: '활성화' },
  { id: '1', title: '2025.03.07 (예시긴글)', status: '활성화' },
];

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const navigate = useNavigate();

  const toggleStatus = (announcementId) => {
    setAnnouncements(announcements.map(ann =>
      ann.id === announcementId
        ? { ...ann, status: ann.status === '활성화' ? '비활성화' : '활성화' }
        : ann
    ));
  };

  return (
    <div>
       <div className="breadcrumb">ADMIN > 공지사항</div>
      <h1 className="page-title">공지사항</h1>
      <p className="page-subtitle">Administrator Page</p>
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <button className="btn-blue" onClick={() => navigate('/announcements/create')}>글쓰기</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>게시글</th>
            <th>공지 상태</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((ann) => (
            <tr key={ann.id}>
              <td>{ann.title}</td>
              <td>
                <button
                  className={`status-button ${ann.status === '활성화' ? 'btn-blue' : 'btn-red'}`}
                  onClick={() => toggleStatus(ann.id)}
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
    </div>
  );
};

export default AnnouncementList;