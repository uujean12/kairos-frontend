import React, { useState, useEffect } from 'react';
import api from '../../api';
import './AdminLayout.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/api/admin/users')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : res.data?.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`권한을 ${newRole}로 변경하시겠습니까?`)) return;
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch {
      alert('권한 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>회원 관리</h1>
        <span style={{ fontSize: 13, color: '#999' }}>총 {users.length}명</span>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 28, color: '#bbb', fontSize: 13 }}>불러오는 중...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>이메일</th>
                <th>가입 방법</th>
                <th>권한</th>
                <th>가입일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#bbb', padding: 40 }}>회원이 없습니다.</td></tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td style={{ color: '#bbb', fontSize: 12 }}>{user.id}</td>
                  <td style={{ fontWeight: 500, color: '#111' }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      fontSize: 11, padding: '2px 8px',
                      background: user.provider === 'GOOGLE' ? '#e8f4ff' : user.provider === 'KAKAO' ? '#fffbe6' : '#f5f5f5',
                      color: user.provider === 'GOOGLE' ? '#0066cc' : user.provider === 'KAKAO' ? '#996600' : '#666',
                    }}>
                      {user.provider || 'LOCAL'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, padding: '2px 8px',
                      background: user.role === 'ADMIN' ? '#111' : '#f5f5f5',
                      color: user.role === 'ADMIN' ? '#fff' : '#666',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: '#bbb', fontSize: 12 }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td>
                    <button
                      className="admin-btn admin-btn-sm"
                      style={{ background: '#f5f5f5', color: '#444', border: 'none' }}
                      onClick={() => handleRoleToggle(user.id, user.role)}
                    >
                      {user.role === 'ADMIN' ? '권한 해제' : '관리자 지정'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
