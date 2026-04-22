import { useEffect, useState } from 'react';
import { Search, Download, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import PageHeader from '../components/page-header';
import SkeletonTable from '../components/skeleton-table';
import EmptyState from '../components/empty-state';
import Avatar from '../components/avatar';
import { fmtNumber } from '../utils/format';
import { exportCsv } from '../utils/export-csv';

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
      const res = await api.get('/admin/users', { params: { page, limit: 20, search } });
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
    if (!confirm(`Đổi vai trò user #${id} sang ${role}?`)) return;
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      toast.success('Đã đổi vai trò');
      load();
    } catch {
      toast.error('Đổi vai trò thất bại');
    }
  };

  const doExport = () => {
    exportCsv(
      `users-${new Date().toISOString().slice(0, 10)}.csv`,
      list.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone ?? '',
        role: u.role,
        points: u.points,
        orders: u._count?.orders ?? 0,
      })),
    );
    toast.success('Đã xuất CSV');
  };

  return (
    <>
      <PageHeader
        title="Người dùng"
        count={total}
        subtitle="Danh sách khách hàng & quản trị viên"
        actions={
          <button onClick={doExport} disabled={list.length === 0}>
            <Download size={14} /> Xuất CSV
          </button>
        }
      />

      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
          />
        </div>
        <button onClick={() => (setPage(1), load())}>Tìm</button>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={7} />
      ) : list.length === 0 ? (
        <EmptyState icon={UsersIcon} title="Chưa có người dùng" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Vai trò</th>
                  <th>Điểm tích lũy</th>
                  <th>Đơn hàng</th>
                  <th style={{ width: 140 }}>Đổi vai trò</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td className="tag-mono">#{u.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.fullName} size={34} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{u.fullName}</div>
                          <div className="cell-sub">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || <span style={{ color: 'var(--text-soft)' }}>—</span>}</td>
                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>{fmtNumber(u.points)}</td>
                    <td style={{ fontWeight: 600 }}>{fmtNumber(u._count?.orders ?? 0)}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        style={{ width: 130, padding: '6px 8px', fontSize: 13 }}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Trước</button>
            <span>Trang <strong style={{ color: 'var(--text)' }}>{page}</strong> / {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Sau →</button>
          </div>
        </>
      )}
    </>
  );
}
