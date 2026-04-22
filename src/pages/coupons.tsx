import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Power, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import PageHeader from '../components/page-header';
import SkeletonTable from '../components/skeleton-table';
import EmptyState from '../components/empty-state';
import { fmtUSD, fmtDate, fmtNumber } from '../utils/format';

type Coupon = {
  id: number;
  code: string;
  discount: number;
  minOrder: number;
  maxDiscount: number | null;
  isActive: boolean;
  expiresAt: string | null;
  usageCount: number;
  maxUsage: number | null;
  createdAt: string;
};

type FormData = {
  code: string;
  discount: string;
  minOrder: string;
  maxDiscount: string;
  expiresAt: string;
  maxUsage: string;
};

const emptyForm: FormData = { code: '', discount: '', minOrder: '0', maxDiscount: '', expiresAt: '', maxUsage: '' };

export default function Coupons() {
  const [list, setList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setList(res.data.coupons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      discount: String(c.discount),
      minOrder: String(c.minOrder),
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      maxUsage: c.maxUsage != null ? String(c.maxUsage) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      code: form.code,
      discount: parseFloat(form.discount),
      minOrder: parseFloat(form.minOrder) || 0,
    };
    if (form.maxDiscount) payload.maxDiscount = parseFloat(form.maxDiscount);
    if (form.expiresAt) payload.expiresAt = form.expiresAt;
    if (form.maxUsage) payload.maxUsage = parseInt(form.maxUsage);

    try {
      if (editId) {
        await api.put(`/admin/coupons/${editId}`, payload);
        toast.success('Đã cập nhật mã giảm giá');
      } else {
        await api.post('/admin/coupons', payload);
        toast.success('Đã tạo mã giảm giá');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Lưu thất bại');
    }
  };

  const toggle = async (id: number) => {
    try {
      await api.patch(`/admin/coupons/${id}/toggle`);
      load();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const remove = async (id: number, code: string) => {
    if (!confirm(`Xóa mã giảm giá "${code}"?`)) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Đã xóa');
      load();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const activeCount = list.filter((c) => c.isActive).length;

  return (
    <>
      <PageHeader
        title="Mã giảm giá"
        count={list.length}
        subtitle={`${activeCount} đang hoạt động · ${list.length - activeCount} đã tắt`}
        actions={
          <button className="primary" onClick={openCreate}>
            <Plus size={14} /> Tạo mã mới
          </button>
        }
      />

      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : list.length === 0 ? (
        <EmptyState icon={Tag} title="Chưa có mã giảm giá" description="Tạo mã đầu tiên để thu hút khách hàng" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Giảm tối đa</th>
                <th>Hết hạn</th>
                <th>Lượt dùng</th>
                <th>Trạng thái</th>
                <th style={{ width: 140 }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'SF Mono, Menlo, monospace',
                        fontWeight: 700,
                        padding: '3px 10px',
                        background: 'var(--brand-50)',
                        color: 'var(--brand-700)',
                        borderRadius: 6,
                        fontSize: 12.5,
                      }}
                    >
                      {c.code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>-{c.discount}%</td>
                  <td>{fmtUSD(c.minOrder)}</td>
                  <td>{c.maxDiscount != null ? fmtUSD(c.maxDiscount) : <span style={{ color: 'var(--text-soft)' }}>—</span>}</td>
                  <td>{c.expiresAt ? fmtDate(c.expiresAt) : <span style={{ color: 'var(--text-soft)' }}>Không giới hạn</span>}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{fmtNumber(c.usageCount)}</span>
                    {c.maxUsage != null && <span style={{ color: 'var(--text-muted)' }}> / {fmtNumber(c.maxUsage)}</span>}
                  </td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      <span className="dot" style={{ background: c.isActive ? 'var(--success)' : '#94a3b8' }} />
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="icon" onClick={() => toggle(c.id)} title={c.isActive ? 'Tắt' : 'Bật'}>
                        <Power size={14} />
                      </button>
                      <button className="icon" onClick={() => openEdit(c)} title="Sửa">
                        <Pencil size={14} />
                      </button>
                      <button className="icon danger" onClick={() => remove(c.id, c.code)} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Mã code *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  autoFocus
                  style={{ fontFamily: 'SF Mono, Menlo, monospace', fontWeight: 600 }}
                />
              </div>
              <div className="form-grid">
                <div className="form-row">
                  <label>Giảm giá (%) *</label>
                  <input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} required />
                </div>
                <div className="form-row">
                  <label>Đơn tối thiểu ($)</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Giảm tối đa ($)</label>
                  <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Ngày hết hạn</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Tối đa lượt dùng</label>
                  <input type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="primary">{editId ? 'Lưu thay đổi' : 'Tạo mã'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
