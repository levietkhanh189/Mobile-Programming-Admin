import { useEffect, useState } from 'react';
import { api } from '../api';

type Summary = {
  today: { orders: number; revenue: number };
  thisWeek: { orders: number; revenue: number };
  thisMonth: { orders: number; revenue: number };
  total: { orders: number; revenue: number };
  byStatus: Array<{ status: string; _count: { _all: number }; _sum: { totalAmount: number | null } }>;
};
type TopProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  soldCount: number;
  totalRevenue: number;
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([
          api.get('/admin/revenue/summary'),
          api.get('/admin/revenue/top-products?limit=5'),
        ]);
        setSummary(s.data);
        setTop(t.data.products);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!summary) return <div className="empty">Không có dữ liệu</div>;

  const cards = [
    { label: 'Hôm nay', value: fmt(summary.today.revenue), sub: `${summary.today.orders} đơn` },
    { label: 'Tuần này', value: fmt(summary.thisWeek.revenue), sub: `${summary.thisWeek.orders} đơn` },
    { label: 'Tháng này', value: fmt(summary.thisMonth.revenue), sub: `${summary.thisMonth.orders} đơn` },
    { label: 'Tổng cộng', value: fmt(summary.total.revenue), sub: `${summary.total.orders} đơn` },
  ];

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="card stat-card">
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
            <div className="sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Phân loại đơn theo trạng thái</h3>
        <table>
          <thead>
            <tr>
              <th>Trạng thái</th>
              <th>Số đơn</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {summary.byStatus.map((s) => (
              <tr key={s.status}>
                <td><span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span></td>
                <td>{s._count._all}</td>
                <td>{fmt(s._sum.totalAmount ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Top 5 sản phẩm bán chạy</h3>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Category</th>
              <th>Giá</th>
              <th>Đã bán</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {top.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{fmt(p.price)}</td>
                <td>{p.soldCount}</td>
                <td>{fmt(p.totalRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
