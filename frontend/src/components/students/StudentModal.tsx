import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { api } from '../../services/api';
import type { Student } from '../../types';

type StudentModalProps = { student: Student | null; onClose: () => void; onSaved: () => void };

export function StudentModal({ student, onClose, onSaved }: StudentModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ ma_hoc_sinh: student?.ma_hoc_sinh ?? '', ho_ten: student?.ho_ten ?? '', cap_do_hien_tai: student?.cap_do_hien_tai ?? 'N5', email: student?.email ?? '', so_dien_thoai: student?.so_dien_thoai ?? '', trang_thai: student?.trang_thai ?? 'DANG_HOC', ngay_sinh: student?.ngay_sinh?.slice(0, 10) ?? '', gioi_tinh: student?.gioi_tinh ?? '', dia_chi: student?.dia_chi ?? '' });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: event.target.value }) });

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const normalized = { ...form, ma_hoc_sinh: form.ma_hoc_sinh.trim(), ho_ten: form.ho_ten.trim().replace(/\s+/g, ' '), email: form.email.trim(), so_dien_thoai: form.so_dien_thoai.trim() };
    if (normalized.ho_ten.length < 2 || normalized.ma_hoc_sinh.length < 2) { setError('Mã học sinh và họ tên phải có ít nhất 2 ký tự.'); return; }
    if (!form.ngay_sinh || form.ngay_sinh > today) { setError('Vui lòng nhập ngày sinh hợp lệ, không ở tương lai.'); return; }
    const profile = { ngay_sinh: form.ngay_sinh, gioi_tinh: form.gioi_tinh || null, dia_chi: form.dia_chi.trim() };
    setBusy(true); setError('');
    try {
      if (student) {
        const { ho_ten, email, so_dien_thoai, trang_thai } = normalized;
        if (!email && student.email) { setError('Chưa hỗ trợ xóa email đã lưu. Bạn có thể nhập email thay thế.'); return; }
        await api.updateStudent(student.id, { ho_ten, email: email || undefined, so_dien_thoai, trang_thai, ...profile });
      } else await api.createStudent({ ...normalized, ...profile, email: normalized.email || undefined, so_dien_thoai: normalized.so_dien_thoai || undefined });
      onSaved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu hồ sơ. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  }

  return <dialog ref={dialog} className="stu-profile-dialog" aria-labelledby="stu-modal-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <form className="modal" onSubmit={save} aria-busy={busy}>
      <div className="modal-head"><div><span className="eyebrow ink">HỒ SƠ HỌC SINH</span><h2 id="stu-modal-title">{student ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}</h2></div><button type="button" className="icon-button" aria-label="Đóng biểu mẫu" disabled={busy} onClick={onClose}><X size={21} /></button></div>
      <p className="stu-modal-intro">Thông tin cơ bản để bắt đầu một hành trình học tập.</p>
      <fieldset className="form-grid" disabled={busy}>
        <label>Mã học sinh *<input {...field('ma_hoc_sinh')} disabled={Boolean(student)} required minLength={2} maxLength={30} placeholder="VD: HS001" autoFocus={!student} /></label>
        <label>Cấp độ JLPT *<select {...field('cap_do_hien_tai')} disabled={Boolean(student)} required>{['N5', 'N4', 'N3', 'N2', 'N1'].map(level => <option key={level}>{level}</option>)}</select></label>
        <label className="full">Họ và tên *<input {...field('ho_ten')} required minLength={2} maxLength={150} placeholder="Nhập họ và tên đầy đủ" autoFocus={Boolean(student)} /></label>
        <label>Ngày sinh *<input type="date" {...field('ngay_sinh')} required max={today} /></label>
        <label>Giới tính<select {...field('gioi_tinh')}><option value="">Chưa cung cấp</option><option value="NAM">Nam</option><option value="NU">Nữ</option><option value="KHAC">Khác</option></select></label>
        <label>Email<input type="email" {...field('email')} placeholder="email@example.com" /></label>
        <label>Số điện thoại<input type="tel" {...field('so_dien_thoai')} placeholder="Nhập số điện thoại" /></label>
        <label className="full">Địa chỉ<textarea {...field('dia_chi')} rows={3} maxLength={1000} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" /></label>
        <label className="full">Trạng thái<select {...field('trang_thai')}><option value="DANG_HOC">Đang học</option><option value="BAO_LUU">Bảo lưu</option><option value="NGHI_HOC">Nghỉ học</option></select></label>
      </fieldset>
      <p className="stu-modal-note"><GraduationCap size={16} />{student ? 'Thay đổi trạng thái vẫn giữ lại hồ sơ và lịch sử học tập.' : 'Các trường có dấu * là bắt buộc.'}</p>
      {error && <div className="error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="outline" disabled={busy} onClick={onClose}>Hủy</button><button className="primary small" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu hồ sơ'}</button></div>
    </form>
  </dialog>;
}
