import { useEffect, useState } from 'react';
import { api } from '../api';

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

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

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

  useEffect(() => { load(); }, []);

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

    if (editId) await api.put(`/admin/coupons/${editId}`, payload);
    else await api.post('/admin/coupons', payload);
    setShowModal(false);
    load();
  };

  const toggle = async (id: number) => {
    await api.patch(`/admin/coupons/${id}/toggle`);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Xóa coupon này?')) return;
    await api.delete(`/admin/coupons/${id}`);
    load();
  };

  return (
    <>
      <h2>Coupons ({list.length})</h2>
      <div className="toolbar">
        <button className="primary" onClick={openCreate} style={{ marginLeft: 'auto' }}>
          + Tạo coupon
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Giảm</th>
              <th>Min order</th>
              <th>Max giảm</th>
              <th>Hết hạn</th>
              <th>Usage</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.discount}%</td>
                <td>{fmt(c.minOrder)}</td>
                <td>{c.maxDiscount != null ? fmt(c.maxDiscount) : '-'}</td>
                <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('vi-VN') : '-'}</td>
                <td>{c.usageCount}{c.maxUsage != null ? `/${c.maxUsage}` : ''}</td>
                <td>
                  <span className={`badge ${c.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggle(c.id)}>{c.isActive ? 'Tắt' : 'Bật'}</button>{' '}
                  <button onClick={() => openEdit(c)}>Sửa</button>{' '}
                  <button className="danger" onClick={() => remove(c.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editId ? 'Sửa coupon' : 'Tạo coupon'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Code *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              </div>
              <div className="form-row">
                <label>Giảm (%) *</label>
                <input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Min order (₫)</label>
                <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Max giảm (₫)</label>
                <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Hết hạn</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Max lượt dùng</label>
                <input type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="primary">{editId ? 'Lưu' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
