import { useEffect, useState } from 'react';
import { api } from '../api';

type User = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  points: number;
  createdAt: string;
  _count?: { orders: number };
};

const ROLES = ['CUSTOMER', 'MANAGER', 'ADMIN'] as const;

export default function Users() {
  const [list, setList] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, limit: 20, search },
      });
      setList(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const changeRole = async (id: number, role: string) => {
    if (!confirm(`Đổi role user #${id} sang ${role}?`)) return;
    await api.put(`/admin/users/${id}/role`, { role });
    load();
  };

  return (
    <>
      <h2>Người dùng ({total})</h2>
      <div className="toolbar">
        <input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
        />
        <button onClick={() => (setPage(1), load())}>Tìm</button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Role</th>
                <th>Điểm</th>
                <th>Đơn</th>
                <th>Đổi role</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td>{u.points}</td>
                  <td>{u._count?.orders ?? 0}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      style={{ width: 130 }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Trước</button>
            <span>Trang {page} / {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Sau →</button>
          </div>
        </>
      )}
    </>
  );
}
