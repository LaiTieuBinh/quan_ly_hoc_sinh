import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { KeyRound, ShieldCheck, X } from 'lucide-react';
import { ApiError } from '../../services/http';
import { accountApi, roles, sampleProfiles, type Account, type AccountInput, type Profile, type Role, type Status } from './accounts.data';

export type DialogAction = { kind: 'create' } | { kind: 'edit' | 'status' | 'reset'; account: Account };
export function AccountDialog({ action, demo, accounts, onClose, onSave }: { action: DialogAction; demo: boolean; accounts: Account[]; onClose: () => void; onSave: (input?: AccountInput, password?: string, confirmation?: string) => Promise<void> }) {
  const account = 'account' in action ? action.account : undefined;
  const [username, setUsername] = useState(account?.ten_dang_nhap ?? '');
  const [role, setRole] = useState<Role>(account?.vai_tro ?? 'NHAN_VIEN');
  const [status, setStatus] = useState<Status>(account?.trang_thai ?? 'HOAT_DONG');
  const [profileId, setProfileId] = useState(account?.ho_so_lien_ket?.id ?? 0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileQuery, setProfileQuery] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [retry, setRetry] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [unlinkConfirmed, setUnlinkConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const needsProfile = role === 'GIAO_VIEN' || role === 'HOC_SINH';
  const removesProfile = !!account?.ho_so_lien_ket && account.vai_tro !== role;
  const formMode = action.kind === 'create' || action.kind === 'edit';

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { previous?.focus(); };
  }, []);

  useEffect(() => {
    if (!needsProfile || !formMode) return;
    let active = true;
    setProfileLoading(true); setProfileError('');
    const timer = window.setTimeout(() => {
      const task = demo ? Promise.resolve(sampleProfiles.filter(p => p.loai === role && `${p.ma} ${p.ten}`.toLocaleLowerCase('vi').includes(profileQuery.toLocaleLowerCase('vi')) && !accounts.some(a => a.id !== account?.id && a.ho_so_lien_ket?.id === p.id && a.vai_tro === role))) : accountApi.profiles(role, account?.id, profileQuery);
      task.then(data => { if (active) setProfiles(data); }).catch(() => { if (active) setProfileError('Không thể tải hồ sơ. Vui lòng thử lại.'); }).finally(() => { if (active) setProfileLoading(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [role, profileQuery, demo, account?.id, accounts, needsProfile, formMode, retry]);

  const title = action.kind === 'create' ? 'Tạo tài khoản' : action.kind === 'edit' ? 'Cập nhật tài khoản' : action.kind === 'reset' ? 'Đặt lại mật khẩu' : account?.trang_thai === 'HOAT_DONG' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
  const field = (key: string, label: string, children: ReactNode) => <label className="acc-field">{label}{children}{errors[key] && <span className="acc-field-error" role="alert">{errors[key]}</span>}</label>;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const next: Record<string, string> = {};
    if (formMode) {
      if (!username.trim()) next.ten_dang_nhap = 'Vui lòng nhập tên đăng nhập.';
      if (demo && accounts.some(a => a.id !== account?.id && a.ten_dang_nhap.toLowerCase() === username.trim().toLowerCase())) next.ten_dang_nhap = 'Tên đăng nhập đã tồn tại.';
      if (needsProfile && !profileId) next.profile = 'Vui lòng chọn hồ sơ tương ứng.';
      if (removesProfile && !unlinkConfirmed) next.unlink = 'Vui lòng xác nhận gỡ hồ sơ liên kết cũ.';
    }
    if ((action.kind === 'create' || action.kind === 'reset') && !password.trim()) next.mat_khau = 'Vui lòng nhập mật khẩu.';
    if (action.kind === 'reset' && password !== confirmation) next.xac_nhan_mat_khau = 'Mật khẩu xác nhận không khớp.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await onSave(formMode ? { ten_dang_nhap: username.trim(), vai_tro: role, trang_thai: status, giao_vien_id: role === 'GIAO_VIEN' ? profileId : null, hoc_sinh_id: role === 'HOC_SINH' ? profileId : null, ...(action.kind === 'create' ? { mat_khau: password } : {}) } : undefined, password, confirmation);
      setPassword(''); setConfirmation(''); onClose();
    } catch (error) {
      const fields = error instanceof ApiError ? Object.fromEntries(Object.entries(error.fields).map(([key, value]) => [key === 'giao_vien_id' || key === 'hoc_sinh_id' ? 'profile' : key, Array.isArray(value) ? value.join(' ') : value])) : {};
      setErrors({ ...fields, form: error instanceof Error ? error.message : 'Thao tác thất bại. Vui lòng thử lại.' });
    } finally { setBusy(false); }
  }

  return <dialog ref={dialog} className="acc-dialog" aria-labelledby="acc-dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <form onSubmit={submit} noValidate>
      <div className="acc-dialog-heading"><span className="acc-dialog-icon">{action.kind === 'reset' ? <KeyRound /> : <ShieldCheck />}</span><h2 id="acc-dialog-title">{title}</h2><button type="button" className="acc-icon-button" aria-label="Đóng hộp thoại" disabled={busy} onClick={onClose}><X size={20} /></button></div>
      {account && <p className="acc-dialog-account">Tài khoản: {account.ten_dang_nhap}</p>}
      {errors.form && <div className="acc-error" role="alert">{errors.form}</div>}
      <fieldset disabled={busy}>
      {formMode && <div className="acc-form-grid">
        {field('ten_dang_nhap', 'Tên đăng nhập *', <input autoFocus value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" aria-invalid={!!errors.ten_dang_nhap} />)}
        {action.kind === 'create' && field('mat_khau', 'Mật khẩu *', <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={!!errors.mat_khau} />)}
        {field('vai_tro', 'Vai trò *', <select value={role} onChange={e => { setRole(e.target.value as Role); setProfileId(0); setProfileQuery(''); setUnlinkConfirmed(false); }}>{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>)}
        {field('trang_thai', 'Trạng thái *', <select value={status} onChange={e => setStatus(e.target.value as Status)}><option value="HOAT_DONG">Hoạt động</option><option value="KHOA">Khóa</option></select>)}
        {needsProfile && <div className="acc-full">{field('profile', 'Hồ sơ liên kết *', <><input aria-label="Tìm hồ sơ theo mã hoặc họ tên" placeholder="Tìm mã hoặc họ tên…" value={profileQuery} onChange={e => setProfileQuery(e.target.value)} /><select value={profileId} disabled={profileLoading || !!profileError} onChange={e => setProfileId(Number(e.target.value))}><option value={0}>{profileLoading ? 'Đang tải hồ sơ…' : 'Chọn hồ sơ khả dụng'}</option>{profileId !== 0 && !profiles.some(p => p.id === profileId) && <option value={profileId}>{account?.ho_so_lien_ket?.id === profileId ? `${account.ho_so_lien_ket.ma} · ${account.ho_so_lien_ket.ten}` : `Hồ sơ đã chọn #${profileId}`}</option>}{profiles.map(p => <option value={p.id} key={p.id}>{p.ma} · {p.ten}</option>)}</select></>)}{profileError && <div className="acc-error">{profileError} <button type="button" onClick={() => setRetry(n => n + 1)}>Thử lại</button></div>}<small>Mỗi hồ sơ chỉ liên kết với một tài khoản.</small></div>}
        {removesProfile && <div className="acc-full"><label className="acc-check"><input type="checkbox" checked={unlinkConfirmed} onChange={e => setUnlinkConfirmed(e.target.checked)} />Tôi xác nhận gỡ liên kết hồ sơ {account?.ho_so_lien_ket?.ten}.</label>{errors.unlink && <span className="acc-field-error">{errors.unlink}</span>}</div>}
      </div>}
      {action.kind === 'reset' && <div className="acc-form-grid single">{field('mat_khau', 'Mật khẩu mới *', <input autoFocus type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />)}{field('xac_nhan_mat_khau', 'Xác nhận mật khẩu *', <input type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} />)}<div className="acc-dialog-note">Các phiên đăng nhập hiện tại sẽ bị thu hồi sau khi đặt lại mật khẩu.</div></div>}
      {action.kind === 'status' && <div className="acc-confirm-copy">{account?.trang_thai === 'HOAT_DONG' ? 'Tài khoản sẽ không thể đăng nhập và các phiên hiện tại sẽ bị thu hồi. Bạn có thể mở khóa lại bất cứ lúc nào.' : 'Tài khoản sẽ được phép đăng nhập trở lại bằng thông tin xác thực hợp lệ.'}</div>}
      </fieldset>
      <div className="acc-dialog-actions"><button type="button" className="acc-button" disabled={busy} onClick={onClose}>Hủy</button><button type="submit" className="acc-button accent" disabled={busy || (formMode && needsProfile && (profileLoading || !!profileError))}>{busy ? 'Đang lưu…' : formMode ? 'Lưu tài khoản' : 'Xác nhận'}</button></div>
    </form>
  </dialog>;
}
