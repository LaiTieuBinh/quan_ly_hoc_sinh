import { useState, type ChangeEvent, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';
import type { Student } from '../../types';

type StudentModalProps = { student: Student | null; onClose: () => void; onSaved: () => void };

export function StudentModal({ student, onClose, onSaved }: StudentModalProps) {
  const [form, setForm] = useState({ ma_hoc_sinh: student?.ma_hoc_sinh ?? '', ho_ten: student?.ho_ten ?? '', cap_do_hien_tai: student?.cap_do_hien_tai ?? 'N5', email: student?.email ?? '', so_dien_thoai: student?.so_dien_thoai ?? '', trang_thai: student?.trang_thai ?? 'DANG_HOC' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value }) });

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (student) { const { ho_ten, email, so_dien_thoai, trang_thai } = form; await api.updateStudent(student.id, { ho_ten, email: email || undefined, so_dien_thoai: so_dien_thoai || undefined, trang_thai }); }
      else await api.createStudent({ ...form, email: form.email || undefined, so_dien_thoai: form.so_dien_thoai || undefined });
      onSaved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu'); }
    finally { setBusy(false); }
  }

  return <div className="modal-backdrop"><form className="modal" onSubmit={save}><div className="modal-head"><div><span className="eyebrow ink">HỒ SƠ HỌC SINH</span><h2>{student ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div><div className="form-grid"><label>Mã học sinh<input {...field('ma_hoc_sinh')} disabled={Boolean(student)} required /></label><label>Cấp độ<select {...field('cap_do_hien_tai')} disabled={Boolean(student)}>{['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => <option key={level}>{level}</option>)}</select></label><label className="full">Họ và tên<input {...field('ho_ten')} required /></label><label>Email<input type="email" {...field('email')} /></label><label>Số điện thoại<input {...field('so_dien_thoai')} /></label>{student && <label className="full">Trạng thái<select {...field('trang_thai')}><option value="DANG_HOC">Đang học</option><option value="BAO_LUU">Bảo lưu</option><option value="NGHI_HOC">Nghỉ học</option></select></label>}</div>{error && <div className="error">{error}</div>}<div className="modal-actions"><button type="button" className="outline" onClick={onClose}>Hủy</button><button className="primary small" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu hồ sơ'}</button></div></form></div>;
}
