import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { api } from '../api';
import StatCard from '../components/stat-card';
import PageHeader from '../components/page-header';
import SkeletonTable from '../components/skeleton-table';
import StatusBadge from '../components/status-badge';
import { fmtVND, fmtCompact, fmtNumber } from '../utils/format';

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
type DailyPoint = { date: string; revenue: number; orders: number };

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Processing: '#6366f1',
  Shipping: '#14b8a6',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, d] = await Promise.all([
          api.get('/admin/revenue/summary'),
          api.get('/admin/revenue/top-products?limit=5'),
          api.get('/admin/revenue/daily?days=14').catch(() => ({ data: { days: [] } })),
        ]);
        setSummary(s.data);
        setTop(t.data.products);
        const rawDays: Array<{ date: string; revenue?: number; orders?: number }> =
          d.data.days ?? d.data.data ?? [];
        setDaily(
          rawDays.map((x) => ({
            date: new Date(x.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            revenue: x.revenue ?? 0,
            orders: x.orders ?? 0,
          })),
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Tổng quan hoạt động kinh doanh" />
        <SkeletonTable rows={4} cols={4} />
      </>
    );
  }
  if (!summary) return <div className="empty">Không có dữ liệu</div>;

  const aov = summary.total.orders > 0 ? summary.total.revenue / summary.total.orders : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Tổng quan hoạt động kinh doanh · Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
      />

      <div className="stats-grid">
        <StatCard
          label="Doanh thu hôm nay"
          value={fmtVND(summary.today.revenue)}
          sub={`${summary.today.orders} đơn hôm nay`}
          icon={DollarSign}
          accent="brand"
        />
        <StatCard
          label="Tuần này"
          value={fmtVND(summary.thisWeek.revenue)}
          sub={`${summary.thisWeek.orders} đơn · 7 ngày`}
          icon={ShoppingCart}
          accent="info"
        />
        <StatCard
          label="Tháng này"
          value={fmtVND(summary.thisMonth.revenue)}
          sub={`${summary.thisMonth.orders} đơn · 30 ngày`}
          icon={Package}
          accent="warning"
        />
        <StatCard
          label="AOV (Giá trị TB/đơn)"
          value={fmtVND(aov)}
          sub={`${fmtNumber(summary.total.orders)} đơn tổng cộng`}
          icon={Users}
          accent="success"
        />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">
            Xu hướng doanh thu
            <span className="card-sub">14 ngày gần nhất</span>
          </div>
          <div className="chart-wrap">
            {daily.length === 0 ? (
              <div className="empty" style={{ border: 'none', padding: 40 }}>Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => fmtCompact(Number(v))}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontSize: 12 }}
                    formatter={(v) => fmtVND(Number(v))}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            Phân bố trạng thái đơn
            <span className="card-sub">{summary.byStatus.reduce((a, b) => a + b._count._all, 0)} đơn</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.byStatus.map((s) => ({ name: s.status, value: s._count._all }))}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {summary.byStatus.map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">
          Chi tiết theo trạng thái
          <span className="card-sub">Tất cả đơn hàng</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Trạng thái</th>
                <th>Số đơn</th>
                <th>Doanh thu</th>
                <th>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {summary.byStatus.map((s) => {
                const total = summary.byStatus.reduce((a, b) => a + b._count._all, 0) || 1;
                const pct = ((s._count._all / total) * 100).toFixed(1);
                return (
                  <tr key={s.status}>
                    <td><StatusBadge status={s.status} /></td>
                    <td>{fmtNumber(s._count._all)}</td>
                    <td>{fmtVND(s._sum.totalAmount ?? 0)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Top 5 sản phẩm bán chạy
          <span className="card-sub">Theo doanh thu</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{fmtVND(p.price)}</td>
                  <td>{fmtNumber(p.soldCount)}</td>
                  <td style={{ fontWeight: 600 }}>{fmtVND(p.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
