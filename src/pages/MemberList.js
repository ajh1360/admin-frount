// src/pages/MemberList.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const initialMembers = [
  { id: 'Star4U@abc.com', status: '활성화' },
  { id: 'BlueZin@abc.com', status: '활성화' },
  { id: 'Echo99@abc.com', status: '활성화' },
  { id: 'JellyQ@abc.com', status: '활성화' },
];

const MemberList = () => {
  const [members, setMembers] = useState(initialMembers);

  const toggleStatus = (memberId) => {
    setMembers(members.map(member =>
      member.id === memberId
        ? { ...member, status: member.status === '활성화' ? '비활성화' : '활성화' }
        : member
    ));
  };

  return (
    <div>
      <div className="breadcrumb">ADMIN > 회원관리</div>
      <h1 className="page-title">회원조회</h1>
      <p className="page-subtitle">User Admin</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>아이디</th>
            <th>계정 상태</th>
            <th>사용자 수정</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.id}</td>
              <td>
                <button
                  className={`status-button ${member.status === '활성화' ? 'btn-blue' : 'btn-red'}`}
                  onClick={() => toggleStatus(member.id)}
                >
                  {member.status}
                </button>
              </td>
              <td>
                <Link to={`/members/edit/${encodeURIComponent(member.id)}`} className="edit-icon">✏️</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberList;