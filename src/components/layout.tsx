import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  LogOut,
  Store,
} from 'lucide-react';
import { clearAuth, getUser } from '../auth';
import { initials } from '../utils/format';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Sản phẩm', icon: Package },
  { to: '/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/users', label: 'Người dùng', icon: Users },
  { to: '/coupons', label: 'Mã giảm giá', icon: Tag },
];

export default function Layout() {
  const user = getUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const current = NAV.find((n) => pathname.startsWith(n.to));

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo"><Store size={18} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">Dropship Hub</div>
            <div className="brand-sub">Admin Console</div>
          </div>
        </div>

        <div className="nav-label">Quản lý</div>
        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <item.icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials(user?.fullName)}</div>
            <div className="user-info-text">
              <div className="name">{user?.fullName ?? 'Admin'}</div>
              <div className="email">{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="crumb">
            <span>Admin</span>
            <span>/</span>
            <span className="current">{current?.label ?? 'Dashboard'}</span>
          </div>
          <div className="topbar-actions">
            <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
