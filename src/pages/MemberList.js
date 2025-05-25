// src/pages/MemberList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
  try {
    const response = await axiosInstance.get('/members?page=0&size=20');
    console.log('API 응답 데이터:', response.data); // <--- API 전체 응답 확인
    if (response.data && response.data.members) {
      console.log('수신된 members 배열:', response.data.members); // <--- members 배열 확인
      // 각 member 객체의 active 속성을 확인하기 위한 로그
      response.data.members.forEach(member => {
        console.log(`Member ID: ${member.memberId}, Active: ${member.active}, Type of Active: ${typeof member.active}`);
      });
    }
    setMembers(response.data.members || []);
  } catch (error) {
    console.error('회원 목록 불러오기 실패:', error);
    setMembers([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateStatus = async (memberId, newStatus) => {
    const memberToUpdate = members.find(m => m.memberId === memberId);
    if (!memberToUpdate) {
      console.error("업데이트할 회원을 찾을 수 없습니다.");
      alert("회원 정보를 찾을 수 없어 상태를 변경할 수 없습니다.");
      return;
    }

    // API가 요구하는 전체 필드를 보내야 할 수 있습니다.
    // 여기서는 name, role, birthDate, phone과 함께 active 상태를 전송합니다.
    // 백엔드 API 명세에 따라 payload를 조정해야 합니다.
    // 만약 비밀번호 필드가 필수라면, 해당 로직도 추가 고려가 필요합니다 (보통 상태 변경 시 비밀번호는 제외).
    const payload = {
      name: memberToUpdate.name,
      email: memberToUpdate.email, // API에 따라 email은 변경 불가일 수 있음
      role: memberToUpdate.role,
      birthDate: memberToUpdate.birthDate,
      phone: memberToUpdate.phone,
      active: newStatus, // 변경된 활성화 상태
    };

    try {
      // 관리자 API 경로를 사용합니다 (axiosInstance의 baseURL이 /api/admin으로 설정됨).
      // API 명세에는 POST /api/admin/members/{memberId}로 되어있으나, PUT이 더 적합합니다.
      // 실제 엔드포인트 및 HTTP 메소드는 백엔드와 협의하여 결정해야 합니다.
      await axiosInstance.put(`/members/${memberId}`, payload);
      
      // 성공 시 로컬 상태 업데이트 (또는 목록을 다시 불러올 수 있음 fetchMembers())
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.memberId === memberId ? { ...member, active: newStatus } : member
        )
      );
      alert(`회원(ID: ${memberId})의 상태가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('회원 상태 변경 실패:', error.response ? error.response.data : error.message);
      alert('회원 상태 변경에 실패했습니다. 서버 로그 및 API 응답을 확인해주세요.');
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="breadcrumb">ADMIN {'>'} 회원관리</div>
      <h1 className="page-title">회원조회</h1>
      <p className="page-subtitle">User Admin</p>
      <table className="admin-table">
        <thead> 
          <tr>  
            <th>아이디 (이메일)</th>
            <th>이름</th>
            <th>계정 상태</th>
            <th>사용자 수정</th>
          </tr>
        </thead>
        <tbody>
          {members && members.length > 0 ? (
            members.map((member) => (
            <tr key={member.memberId}>
              <td>{member.email}</td>
              <td>{member.name}</td>
              <td>
                {/* 
                  member.active 필드가 API 응답에 반드시 포함되어야 합니다.
                  이 필드가 undefined이면 버튼 로직이 제대로 동작하지 않습니다.
                */}
                {typeof member.active === 'boolean' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(member.memberId, true)} 
                      disabled={member.active === true}
                      style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', backgroundColor: member.active === true ? '#ccc' : 'royalblue', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      활성화
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(member.memberId, false)} 
                      disabled={member.active === false}
                      style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: member.active === false ? '#ccc' : 'tomato', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      비활성화
                    </button>
                  </>
                ) : (
                  <span>상태 정보 없음</span> // member.active가 없는 경우
                )}
              </td>
              <td>
                <Link to={`/members/edit/${member.memberId}`}>✏️</Link>
              </td>
            </tr>
            ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>회원 정보가 없습니다.</td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default MemberList;