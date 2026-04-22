import { useEffect, useState } from 'react';
import { Download, Eye, Clock, CheckCircle2, Truck, Package, PackageCheck, XCircle, ShoppingBag, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import PageHeader from '../components/page-header';
import SkeletonTable from '../components/skeleton-table';
import EmptyState from '../components/empty-state';
import StatusBadge from '../components/status-badge';
import Avatar from '../components/avatar';
import SourcingButtons from '../components/sourcing-buttons';
import { fmtVND, fmtDateTime, fmtNumber } from '../utils/format';
import { exportCsv } from '../utils/export-csv';
import { SOURCING_PLATFORMS, openSourcing } from '../utils/sourcing';

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
const STATUS_ICON: Record<string, typeof Clock> = {
  Pending: Clock,
  Confirmed: CheckCircle2,
  Processing: Package,
  Shipping: Truck,
  Delivered: PackageCheck,
  Cancelled: XCircle,
};

export default function Orders() {
  const [list, setList] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', { params: { page, limit: 20, status } });
      setList(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await api.get('/admin/revenue/summary');
      const map: Record<string, number> = {};
      res.data.byStatus.forEach((s: { status: string; _count: { _all: number } }) => {
        map[s.status] = s._count._all;
      });
      setCounts(map);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    loadSummary();
  }, []);

  const openDetail = async (id: string) => {
    const res = await api.get(`/admin/orders/${id}`);
    setSelected(res.data.order);
  };

  const lookupOrderOnAllPlatforms = async (id: string) => {
    try {
      const res = await api.get(`/admin/orders/${id}`);
      const items: OrderItem[] = res.data.order?.items ?? [];
      if (items.length === 0) {
        toast.error('Đơn không có sản phẩm');
        return;
      }
      items.forEach((it) => SOURCING_PLATFORMS.forEach((p) => openSourcing(p, it.name)));
      toast.success(`Mở ${items.length * SOURCING_PLATFORMS.length} tab tra nguồn`);
    } catch {
      toast.error('Không tải được đơn hàng');
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      toast.success(`Đã cập nhật: ${newStatus}`);
      await load();
      loadSummary();
      if (selected?.id === id) {
        const res = await api.get(`/admin/orders/${id}`);
        setSelected(res.data.order);
      }
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const doExport = () => {
    exportCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      list.map((o) => ({
        id: o.id,
        customer: o.user?.fullName ?? '',
        email: o.user?.email ?? '',
        amount: o.totalAmount,
        status: o.status,
        payment: o.paymentMethod,
        createdAt: o.createdAt,
      })),
    );
    toast.success('Đã xuất CSV');
  };

  return (
    <>
      <PageHeader
        title="Đơn hàng"
        count={total}
        subtitle="Theo dõi & quản lý đơn từ khách"
        actions={
          <button onClick={doExport} disabled={list.length === 0}>
            <Download size={14} /> Xuất CSV
          </button>
        }
      />

      <div className="pipeline">
        <div
          className={`pipeline-item ${status === '' ? 'active' : ''}`}
          onClick={() => (setStatus(''), setPage(1))}
        >
          <div className="p-label"><ShoppingBag size={13} /> Tất cả</div>
          <div className="p-value">{fmtNumber(Object.values(counts).reduce((a, b) => a + b, 0))}</div>
          <div className="p-sub">Tổng đơn</div>
        </div>
        {STATUSES.map((s) => {
          const Icon = STATUS_ICON[s];
          return (
            <div
              key={s}
              className={`pipeline-item ${status === s ? 'active' : ''}`}
              onClick={() => (setStatus(s), setPage(1))}
            >
              <div className="p-label"><Icon size={13} /> {s}</div>
              <div className="p-value">{fmtNumber(counts[s] ?? 0)}</div>
              <div className="p-sub">đơn</div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : list.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Chưa có đơn hàng" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th style={{ width: 120 }}></th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id}>
                    <td className="tag-mono">#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={o.user?.fullName} size={32} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{o.user?.fullName ?? '—'}</div>
                          <div className="cell-sub">{o.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{fmtVND(o.totalAmount)}</td>
                    <td><span className="badge badge-customer">{o.paymentMethod}</span></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{fmtDateTime(o.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon"
                          onClick={() => lookupOrderOnAllPlatforms(o.id)}
                          title="Tra tất cả sản phẩm trên AliExpress, Taobao, 1688"
                          style={{ color: '#ff4747' }}
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button className="icon ghost" onClick={() => openDetail(o.id)} title="Chi tiết">
                          <Eye size={15} />
                        </button>
                      </div>
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

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 680 }}>
            <div className="modal-header">
              <div>
                <h3>Đơn hàng #{selected.id.slice(0, 8).toUpperCase()}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{fmtDateTime(selected.createdAt)}</div>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="card" style={{ padding: 14, marginBottom: 14, background: 'var(--bg)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <Avatar name={selected.user.fullName} size={42} />
                <div>
                  <div style={{ fontWeight: 600 }}>{selected.user.fullName}</div>
                  <div className="cell-sub">{selected.user.email}{selected.user.phone && ` · ${selected.user.phone}`}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <div><strong style={{ color: 'var(--text)' }}>Địa chỉ:</strong> {selected.shippingAddress}</div>
                <div><strong style={{ color: 'var(--text)' }}>Thanh toán:</strong> {selected.paymentMethod}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Sản phẩm đặt ({selected.items.length})
              </div>
              <button
                onClick={() =>
                  selected.items.forEach((it) =>
                    SOURCING_PLATFORMS.forEach((p) => openSourcing(p, it.name)),
                  )
                }
                title="Mở tất cả sản phẩm trên 3 nền tảng"
                style={{ color: '#ff4747', borderColor: '#ffd1d1' }}
              >
                <ExternalLink size={13} /> Tra tất cả (AE · Taobao · 1688)
              </button>
            </div>
            <div className="table-wrap" style={{ marginBottom: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th style={{ width: 130 }}>Tra nguồn</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((it) => (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 500 }}>{it.name}</td>
                      <td>{it.quantity}</td>
                      <td>{fmtVND(it.price)}</td>
                      <td style={{ fontWeight: 600 }}>{fmtVND(it.price * it.quantity)}</td>
                      <td>
                        <SourcingButtons query={it.name} size={20} />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Tổng cộng</td>
                    <td style={{ fontWeight: 700, fontSize: 15, color: 'var(--brand-600)' }}>{fmtVND(selected.totalAmount)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="form-row">
              <label>Đổi trạng thái</label>
              <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
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
