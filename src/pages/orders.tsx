import { useEffect, useState } from 'react';
import { api } from '../api';

type OrderItem = { id: number; name: string; price: number; quantity: number; image: string };
type Order = {
  id: string;
  userId: number;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  user: { id: number; fullName: string; email: string; phone?: string };
  items: OrderItem[];
};

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';
const fmtDate = (d: string) => new Date(d).toLocaleString('vi-VN');

export default function Orders() {
  const [list, setList] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', {
        params: { page, limit: 20, status },
      });
      setList(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const openDetail = async (id: string) => {
    const res = await api.get(`/admin/orders/${id}`);
    setSelected(res.data.order);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await api.put(`/admin/orders/${id}/status`, { status: newStatus });
    await load();
    if (selected?.id === id) {
      const res = await api.get(`/admin/orders/${id}`);
      setSelected(res.data.order);
    }
  };

  return (
    <>
      <h2>Đơn hàng ({total})</h2>
      <div className="toolbar">
        <select value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))}>
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace' }}>{o.id.slice(0, 8)}...</td>
                  <td>
                    <div>{o.user?.fullName}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{o.user?.email}</div>
                  </td>
                  <td>{fmt(o.totalAmount)}</td>
                  <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td><button onClick={() => openDetail(o.id)}>Chi tiết</button></td>
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

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 640 }}>
            <h3>Đơn hàng #{selected.id}</h3>
            <div className="form-row">
              <div><strong>Khách:</strong> {selected.user.fullName} ({selected.user.email}){selected.user.phone && ` - ${selected.user.phone}`}</div>
              <div><strong>Địa chỉ:</strong> {selected.shippingAddress}</div>
              <div><strong>Thanh toán:</strong> {selected.paymentMethod}</div>
              <div><strong>Ngày:</strong> {fmtDate(selected.createdAt)}</div>
            </div>

            <h4>Sản phẩm</h4>
            <table>
              <thead>
                <tr><th>Tên</th><th>SL</th><th>Giá</th><th>Thành tiền</th></tr>
              </thead>
              <tbody>
                {selected.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.name}</td>
                    <td>{it.quantity}</td>
                    <td>{fmt(it.price)}</td>
                    <td>{fmt(it.price * it.quantity)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right' }}><strong>Tổng:</strong></td>
                  <td><strong>{fmt(selected.totalAmount)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Đổi trạng thái</label>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
