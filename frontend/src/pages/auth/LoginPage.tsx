import { useState, type FormEvent } from 'react';
import { ChevronRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import luffyBrandIcon from '../../assets/images/luffy-brand-icon.png';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const errors = {
      ...(!username.trim() ? { username: 'Vui lòng nhập tên đăng nhập.' } : {}),
      ...(!password ? { password: 'Vui lòng nhập mật khẩu.' } : {}),
    };
    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length) return;

    setBusy(true);
    try {
      await login({ username: username.trim(), password, rememberMe });
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from && from !== '/login' ? from : '/', { replace: true });
    } catch (loginError) {
      setPassword('');
      setShowPassword(false);
      setError(loginError instanceof Error ? loginError.message : 'Không thể kết nối đến hệ thống. Vui lòng thử lại sau.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-page">
    <section className="login-panel">
      <form className="login-card" onSubmit={submit} noValidate>
        <div className="login-brand brand"><span className="brand-mark luffy-brand-mark"><img src={luffyBrandIcon} alt="Luffy" /></span><span>Tokuda Academy</span></div>
        <h2>Đăng nhập</h2>
        <label htmlFor="username">Tên đăng nhập
          <div className={`login-input ${fieldErrors.username ? 'invalid' : ''}`}><UserRound size={19} /><input id="username" autoComplete="username" placeholder="Nhập tên đăng nhập" value={username} onChange={(event) => { setUsername(event.target.value); setFieldErrors((value) => ({ ...value, username: undefined })); }} autoFocus aria-invalid={Boolean(fieldErrors.username)} /></div>
          {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
        </label>
        <label htmlFor="password">Mật khẩu
          <div className={`login-input ${fieldErrors.password ? 'invalid' : ''}`}><LockKeyhole size={19} /><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Nhập mật khẩu" value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors((value) => ({ ...value, password: undefined })); }} aria-invalid={Boolean(fieldErrors.password)} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </label>
        <label className="remember-me"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Ghi nhớ đăng nhập trong 30 ngày</span></label>
        {error && <div className="error login-error" role="alert">{error}</div>}
        <button className="primary login-submit" disabled={busy}>{busy ? <><span className="spinner" />Đang xác thực…</> : <>Đăng nhập <ChevronRight size={18} /></>}</button>
      </form>
    </section>
  </main>;
}
