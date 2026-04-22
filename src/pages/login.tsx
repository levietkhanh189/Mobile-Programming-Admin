import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, LogIn } from 'lucide-react';
import { api } from '../api';
import { setAuth } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/auth/login', { email, password });
      setAuth(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-brand">
          <div className="brand-logo"><Store size={20} strokeWidth={2.4} /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Dropship Hub</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Admin Console</div>
          </div>
        </div>
        <h1>Chào mừng trở lại</h1>
        <div className="login-sub">Đăng nhập để quản lý cửa hàng của bạn</div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@example.com"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>
          <div className="form-row">
            <label>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <button
            type="submit"
            className="primary"
            style={{ width: '100%', marginTop: 14, justifyContent: 'center', padding: '10px 16px' }}
            disabled={loading}
          >
            <LogIn size={15} />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-soft)', marginTop: 20 }}>
          © {new Date().getFullYear()} Dropship Hub · Made for commerce
        </div>
      </div>
    </div>
  );
}
