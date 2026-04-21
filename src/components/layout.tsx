import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../auth';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Sản phẩm' },
  { to: '/orders', label: 'Đơn hàng' },
  { to: '/users', label: 'Người dùng' },
  { to: '/coupons', label: 'Coupons' },
];

export default function Layout() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>🛒 Admin Panel</h1>
        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-info">
          <div><strong>{user?.fullName}</strong></div>
          <div>{user?.email}</div>
          <div>Role: <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span></div>
          <button style={{ marginTop: 10, width: '100%' }} onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
