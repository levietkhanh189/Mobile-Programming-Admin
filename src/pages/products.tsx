import { useEffect, useState } from 'react';
import { api } from '../api';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  soldCount: number;
  discountPercentage: number;
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  soldCount: string;
  discountPercentage: string;
};

const emptyForm: FormData = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  soldCount: '0',
  discountPercentage: '0',
};

export default function Products() {
  const [list, setList] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products', {
        params: { page, limit: 20, search },
      });
      setList(res.data.products);
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

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      image: p.image,
      soldCount: String(p.soldCount),
      discountPercentage: String(p.discountPercentage),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      image: form.image,
      soldCount: parseInt(form.soldCount) || 0,
      discountPercentage: parseInt(form.discountPercentage) || 0,
    };
    if (editId) {
      await api.put(`/admin/products/${editId}`, payload);
    } else {
      await api.post('/admin/products', payload);
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await api.delete(`/admin/products/${id}`);
    load();
  };

  return (
    <>
      <h2>Sản phẩm ({total})</h2>
      <div className="toolbar">
        <input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
        />
        <button onClick={() => (setPage(1), load())}>Tìm</button>
        <button className="primary" onClick={openCreate} style={{ marginLeft: 'auto' }}>
          + Tạo sản phẩm
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Category</th>
                <th>Giá</th>
                <th>Giảm</th>
                <th>Đã bán</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{fmt(p.price)}</td>
                  <td>{p.discountPercentage}%</td>
                  <td>{p.soldCount}</td>
                  <td>
                    <button onClick={() => openEdit(p)}>Sửa</button>{' '}
                    <button className="danger" onClick={() => handleDelete(p.id)}>Xóa</button>
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

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editId ? 'Sửa sản phẩm' : 'Tạo sản phẩm'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Tên *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-row">
                <label>Giá *</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Category *</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Ảnh (URL)</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Giảm (%)</label>
                <input type="number" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Đã bán</label>
                <input type="number" value={form.soldCount} onChange={(e) => setForm({ ...form, soldCount: e.target.value })} />
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
