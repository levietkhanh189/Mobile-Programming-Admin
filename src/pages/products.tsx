import { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Download, ImageOff, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import PageHeader from '../components/page-header';
import SkeletonTable from '../components/skeleton-table';
import EmptyState from '../components/empty-state';
import SourcingButtons from '../components/sourcing-buttons';
import { fmtVND, fmtNumber } from '../utils/format';
import { exportCsv } from '../utils/export-csv';

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
      const res = await api.get('/admin/products', { params: { page, limit: 20, search } });
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
    try {
      if (editId) {
        await api.put(`/admin/products/${editId}`, payload);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Đã tạo sản phẩm mới');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Lưu thất bại');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Đã xóa sản phẩm');
      load();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const doExport = () => {
    exportCsv(
      `products-${new Date().toISOString().slice(0, 10)}.csv`,
      list.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        discount: p.discountPercentage,
        sold: p.soldCount,
      })),
    );
    toast.success('Đã xuất CSV');
  };

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        count={total}
        subtitle="Quản lý danh mục sản phẩm dropshipping"
        actions={
          <>
            <button onClick={doExport} disabled={list.length === 0}>
              <Download size={14} /> Xuất CSV
            </button>
            <button className="primary" onClick={openCreate}>
              <Plus size={14} /> Thêm sản phẩm
            </button>
          </>
        }
      />

      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <input
            placeholder="Tìm theo tên sản phẩm..."
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
        <EmptyState icon={Package} title="Chưa có sản phẩm" description="Bắt đầu bằng cách thêm sản phẩm đầu tiên" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th style={{ width: 60 }}></th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Giảm</th>
                  <th>Đã bán</th>
                  <th style={{ width: 130 }}>Tra nguồn</th>
                  <th style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td className="tag-mono">#{p.id}</td>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt="" className="img-thumb" />
                      ) : (
                        <div className="img-thumb" style={{ display: 'grid', placeItems: 'center', color: 'var(--text-soft)' }}>
                          <ImageOff size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      {p.description && (
                        <div className="cell-sub" style={{ maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td><span className="badge badge-customer">{p.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{fmtVND(p.price)}</td>
                    <td>
                      {p.discountPercentage > 0 ? (
                        <span className="badge badge-delivered">-{p.discountPercentage}%</span>
                      ) : (
                        <span style={{ color: 'var(--text-soft)' }}>—</span>
                      )}
                    </td>
                    <td>{fmtNumber(p.soldCount)}</td>
                    <td>
                      <SourcingButtons query={p.name} />
                    </td>
                    <td>
                      <div className="actions">
                        <button className="icon" onClick={() => openEdit(p)} title="Sửa">
                          <Pencil size={14} />
                        </button>
                        <button className="icon danger" onClick={() => handleDelete(p.id, p.name)} title="Xóa">
                          <Trash2 size={14} />
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

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Tên sản phẩm *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
              </div>
              <div className="form-row">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-grid">
                <div className="form-row">
                  <label>Giá (₫) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-row">
                  <label>Danh mục *</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                </div>
                <div className="form-row">
                  <label>Giảm giá (%)</label>
                  <input type="number" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />
                </div>
                <div className="form-row">
                  <label>Đã bán</label>
                  <input type="number" value={form.soldCount} onChange={(e) => setForm({ ...form, soldCount: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <label>Ảnh (URL)</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="primary">{editId ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
