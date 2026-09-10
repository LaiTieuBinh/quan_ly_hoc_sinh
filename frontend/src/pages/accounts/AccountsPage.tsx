import { useEffect, useRef, useState } from 'react';
import { ArrowDownUp, ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, KeyRound, LockKeyhole, MoreHorizontal, Pencil, Plus, Search, ShieldCheck, SlidersHorizontal, UnlockKeyhole, UserCog, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../services/http';
import { AccountDialog, type DialogAction } from './AccountDialog';
import { accountApi, createSampleAccounts, roles, sampleProfiles, type Account, type AccountInput, type AccountList, type Filters, type Role } from './accounts.data';
import './accounts.css';

const initialFilters: Filters = { q: '', vai_tro: '', trang_thai: '', page: 1, sort: '-updated_at' };
const roleDetails = [
  { role: 'QUAN_TRI_VIEN', icon: ShieldCheck },
  { role: 'NHAN_VIEN', icon: UserCog },
  { role: 'GIAO_VIEN', icon: Users },
  { role: 'HOC_SINH', icon: GraduationCap },
] as const;
const formatDate = (date: string) => {
  const value = new Date(date);
  const day = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value);
  const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(value);
  return `${day} ${time}`;
};

export function AccountsPage() {
  const { user } = useAuth();
  return user?.vai_tro === 'QUAN_TRI_VIEN' ? <AccountWorkspace /> : <section className="acc-denied"><LockKeyhole size={40} /><h1>Bạn không có quyền truy cập</h1><p>Chỉ quản trị viên được quản lý tài khoản và phân quyền.</p><Link to="/">Về Tổng quan</Link></section>;
}

function AccountWorkspace() {
  const demo = import.meta.env.VITE_ACCOUNTS_DEMO !== 'false';
  const [samples, setSamples] = useState(createSampleAccounts);
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState<AccountList>({ data: [], meta: { total: 0, total_pages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [reload, setReload] = useState(0);
  const [action, setAction] = useState<DialogAction | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setBlocked(false); setMenuId(null);
    async function load() {
      try {
        let data: AccountList;
        if (demo) {
          const rows = samples.filter(a => a.ten_dang_nhap.toLowerCase().includes(filters.q.trim().toLowerCase()) && (!filters.vai_tro || a.vai_tro === filters.vai_tro) && (!filters.trang_thai || a.trang_thai === filters.trang_thai));
          const key = filters.sort.replace('-', '') as 'ten_dang_nhap' | 'updated_at' | 'created_at';
          rows.sort((a, b) => a[key].localeCompare(b[key]) * (filters.sort.startsWith('-') ? -1 : 1));
          data = { data: rows.slice((filters.page - 1) * 20, filters.page * 20), meta: { total: rows.length, total_pages: Math.ceil(rows.length / 20) } };
        } else data = await accountApi.list(filters);
        if (active) {
          if (filters.page > Math.max(1, data.meta.total_pages)) setFilters(f => ({ ...f, page: Math.max(1, data.meta.total_pages) }));
          else setResult(data);
        }
      } catch (err) {
        if (active) { setResult({ data: [], meta: { total: 0, total_pages: 0 } }); setBlocked(err instanceof ApiError && (err.status === 401 || err.status === 403)); setError(err instanceof ApiError && err.status === 404 ? 'API quản lý tài khoản chưa được triển khai. Bạn có thể dùng dữ liệu mẫu để xem thử giao diện.' : 'Không thể tải danh sách tài khoản. Vui lòng kiểm tra kết nối và thử lại.'); }
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [demo, samples, filters, reload]);

  useEffect(() => {
    if (menuId === null) return;
    function close(event: MouseEvent) { if (!menuRef.current?.contains(event.target as Node)) setMenuId(null); }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') { document.getElementById(`acc-menu-${menuId}`)?.focus(); setMenuId(null); } }
    document.addEventListener('click', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', escape); };
  }, [menuId]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 6000); return () => window.clearTimeout(timer); }, [notice]);

  async function save(input?: AccountInput, password = '', confirmation = '') {
    if (!action) return;
    const account = 'account' in action ? action.account : undefined;
    if (demo) {
      const disabling = account?.vai_tro === 'QUAN_TRI_VIEN' && account.trang_thai === 'HOAT_DONG' && (action.kind === 'status' || (input && (input.vai_tro !== 'QUAN_TRI_VIEN' || input.trang_thai !== 'HOAT_DONG')));
      if (disabling && samples.filter(a => a.vai_tro === 'QUAN_TRI_VIEN' && a.trang_thai === 'HOAT_DONG').length === 1) throw new Error('Không thể vô hiệu hóa quản trị viên hoạt động cuối cùng.');
      const now = new Date().toISOString();
      if (input) {
        const profile = sampleProfiles.find(p => p.loai === input.vai_tro && p.id === (input.giao_vien_id ?? input.hoc_sinh_id)) ?? null;
        if ((input.vai_tro === 'GIAO_VIEN' || input.vai_tro === 'HOC_SINH') && (!profile || samples.some(a => a.id !== account?.id && a.ho_so_lien_ket?.id === profile.id && a.vai_tro === profile.loai))) throw new Error('Hồ sơ không khả dụng hoặc đã được liên kết.');
        const row: Account = { id: account?.id ?? Math.max(0, ...samples.map(a => a.id)) + 1, ten_dang_nhap: input.ten_dang_nhap, vai_tro: input.vai_tro, trang_thai: input.trang_thai, ho_so_lien_ket: profile, created_at: account?.created_at ?? now, updated_at: now };
        setSamples(rows => account ? rows.map(a => a.id === account.id ? row : a) : [row, ...rows]);
      } else if (account && action.kind === 'status') setSamples(rows => rows.map(a => a.id === account.id ? { ...a, trang_thai: a.trang_thai === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG', updated_at: now } : a));
      // Preview intentionally never retains passwords or changes authentication.
    } else {
      if (input) await accountApi.save(account?.id, input);
      else if (account && action.kind === 'status') await accountApi.status(account);
      else if (account && action.kind === 'reset') await accountApi.reset(account.id, password, confirmation);
      setReload(n => n + 1);
    }
    setNotice(`${demo ? 'Bản xem thử: ' : ''}${action.kind === 'reset' ? demo ? 'đã mô phỏng đặt lại mật khẩu, không thay đổi thông tin đăng nhập.' : 'đã đặt lại mật khẩu.' : 'đã lưu thay đổi tài khoản.'}`);
  }
  const openAction = (value: DialogAction) => { setAction(value); setMenuId(null); };

  return <div className="accounts-page">
    <div className="acc-breadcrumb"><Link to="/">Tổng quan</Link><span>/</span><span>Quản trị hệ thống</span></div>
    <div className="acc-heading"><div><h1>Tài khoản <span>&</span> phân quyền</h1></div></div>
    <section className="acc-role-grid" aria-label="Phạm vi quyền theo vai trò">{roleDetails.map(item => <button key={item.role} aria-pressed={filters.vai_tro === item.role} className={`acc-role-card role-${item.role} ${filters.vai_tro === item.role ? 'selected' : ''}`} onClick={() => { const role = filters.vai_tro === item.role ? '' : item.role; setDraft(f => ({ ...f, vai_tro: role })); setFilters(f => ({ ...f, vai_tro: role, page: 1 })); }}><div className="acc-role-top"><span className="acc-role-icon"><item.icon size={21} /></span><span className="acc-role-number">0{roleDetails.indexOf(item) + 1}</span></div><h2>{roles[item.role]}</h2></button>)}</section>
    <section className="acc-list-panel" aria-labelledby="acc-list-title">
      <div className="acc-list-heading"><div><h2 id="acc-list-title">Danh sách tài khoản <span>{loading || error ? '—' : result.meta.total}</span></h2></div><span className="acc-admin-tag"><ShieldCheck size={15} />Chỉ quản trị viên</span></div>
      <form className="acc-filters" onSubmit={e => { e.preventDefault(); setFilters({ ...draft, page: 1 }); }}><label className="acc-search"><Search size={18} /><input aria-label="Tìm theo tên đăng nhập" placeholder="Tìm theo tên đăng nhập…" value={draft.q} onChange={e => setDraft(f => ({ ...f, q: e.target.value }))} /></label><select aria-label="Lọc vai trò" value={draft.vai_tro} onChange={e => setDraft(f => ({ ...f, vai_tro: e.target.value }))}><option value="">Tất cả vai trò</option>{Object.entries(roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select aria-label="Lọc trạng thái" value={draft.trang_thai} onChange={e => setDraft(f => ({ ...f, trang_thai: e.target.value }))}><option value="">Tất cả trạng thái</option><option value="HOAT_DONG">Hoạt động</option><option value="KHOA">Khóa</option></select><button className="acc-button" type="submit"><SlidersHorizontal size={16} />Tìm kiếm</button><button className="acc-reset" type="button" onClick={() => { setDraft(initialFilters); setFilters(initialFilters); }}>Đặt lại</button></form>
      <div className="acc-table-caption"><div className="acc-table-summary"><span>{!loading && !error && result.meta.total > 0 ? `Hiển thị ${(filters.page - 1) * 20 + 1}–${Math.min(filters.page * 20, result.meta.total)} trong ${result.meta.total} tài khoản` : '20 tài khoản / trang'}</span></div><div className="acc-caption-actions"><label><ArrowDownUp size={14} /><select aria-label="Sắp xếp tài khoản" value={filters.sort} onChange={e => { setFilters(f => ({ ...f, sort: e.target.value, page: 1 })); setDraft(f => ({ ...f, sort: e.target.value })); }}><option value="-updated_at">Cập nhật gần nhất</option><option value="-created_at">Tạo gần nhất</option><option value="ten_dang_nhap">Tên đăng nhập A–Z</option></select></label><button className="acc-button accent" disabled={blocked} onClick={() => openAction({ kind: 'create' })}><Plus size={18} />Tạo tài khoản</button></div></div>
      {loading ? <div className="acc-loading" role="status" aria-label="Đang tải tài khoản">{Array.from({ length: 6 }, (_, i) => <div key={i} />)}<span>Đang tải tài khoản…</span></div> : error ? <div className="acc-empty" role="alert"><LockKeyhole size={32} /><h3>{blocked ? 'Phiên hết hạn hoặc không có quyền truy cập' : 'Chưa thể tải dữ liệu'}</h3><p>{blocked ? 'Vui lòng đăng nhập bằng tài khoản quản trị viên.' : error}</p>{blocked ? <Link className="acc-button" to="/login">Đăng nhập</Link> : <button className="acc-button" onClick={() => setReload(n => n + 1)}>Thử lại</button>}</div> : result.data.length === 0 ? <div className="acc-empty"><Search size={32} /><h3>Không tìm thấy tài khoản phù hợp.</h3><p>Thử thay đổi từ khóa hoặc đặt lại bộ lọc.</p><button className="acc-button" onClick={() => { setDraft(initialFilters); setFilters(initialFilters); }}>Xóa bộ lọc</button></div> : <div className="acc-table-scroll"><table className="acc-table"><thead><tr><th>Tên đăng nhập</th><th>Vai trò</th><th>Trạng thái</th><th>Hồ sơ liên kết</th><th>Thời gian</th><th><span className="acc-sr-only">Thao tác</span></th></tr></thead><tbody>{result.data.map(account => <tr key={account.id}><td><div className="acc-user-cell"><span className={`acc-initials role-${account.vai_tro}`}>{account.ten_dang_nhap.replace(/^(gv|hs|nv)\./, '').slice(0, 2).toUpperCase()}</span><div><button className="acc-username" onClick={() => openAction({ kind: 'edit', account })}>{account.ten_dang_nhap}</button><small>TK-{String(account.id).padStart(4, '0')}</small></div></div></td><td><span className={`acc-role-badge role-${account.vai_tro}`}>{roles[account.vai_tro]}</span></td><td><span className={`acc-status ${account.trang_thai === 'KHOA' ? 'locked' : ''}`}><i />{account.trang_thai === 'HOAT_DONG' ? 'Hoạt động' : 'Khóa'}</span></td><td>{account.ho_so_lien_ket ? <div className="acc-profile">{demo ? <span>{account.ho_so_lien_ket.ten}</span> : <Link to={`/${account.vai_tro === 'GIAO_VIEN' ? 'giao-vien' : 'hoc-sinh'}?id=${account.ho_so_lien_ket.id}`}>{account.ho_so_lien_ket.ten} ↗</Link>}<small>{account.ho_so_lien_ket.ma}</small></div> : <span className="acc-muted">—</span>}</td><td><div className="acc-dates"><time dateTime={account.updated_at}>{formatDate(account.updated_at)}</time><small>Tạo: {formatDate(account.created_at)}</small></div></td><td><div ref={menuId === account.id ? menuRef : undefined} className="acc-row-actions"><button id={`acc-menu-${account.id}`} className="acc-icon-button" aria-label={`Thao tác với ${account.ten_dang_nhap}`} aria-expanded={menuId === account.id} onClick={() => setMenuId(menuId === account.id ? null : account.id)}><MoreHorizontal size={20} /></button>{menuId === account.id && <div className="acc-action-menu"><button onClick={() => openAction({ kind: 'edit', account })}><Pencil size={15} />Chỉnh sửa</button><button onClick={() => openAction({ kind: 'reset', account })}><KeyRound size={15} />Đặt lại mật khẩu</button><button className={account.trang_thai === 'HOAT_DONG' ? 'danger' : ''} onClick={() => openAction({ kind: 'status', account })}>{account.trang_thai === 'HOAT_DONG' ? <LockKeyhole size={15} /> : <UnlockKeyhole size={15} />}{account.trang_thai === 'HOAT_DONG' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</button></div>}</div></td></tr>)}</tbody></table></div>}
      <div className="acc-pagination"><div><button className="acc-icon-button" aria-label="Trang trước" disabled={loading || !!error || filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}><ChevronLeft size={18} /></button><span>Trang {filters.page} / {Math.max(1, result.meta.total_pages)}</span><button className="acc-icon-button" aria-label="Trang sau" disabled={loading || !!error || filters.page >= result.meta.total_pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}><ChevronRight size={18} /></button></div></div>
    </section>
    <footer className="acc-footer"><span><ShieldCheck size={16} />Phân quyền rõ ràng. Bảo vệ dữ liệu học tập.</span><Link to="/"><ArrowLeft size={14} />Về Tổng quan</Link></footer>
    {notice && <div className="acc-toast" role="status"><ShieldCheck size={20} /><span>{notice}</span><button className="acc-icon-button" aria-label="Đóng thông báo" onClick={() => setNotice('')}><X size={16} /></button></div>}
    {action && <AccountDialog action={action} demo={demo} accounts={demo ? samples : result.data} onClose={() => setAction(null)} onSave={save} />}
  </div>;
}
