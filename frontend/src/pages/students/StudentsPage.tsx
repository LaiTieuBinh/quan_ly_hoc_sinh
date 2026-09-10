import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, CirclePause, GraduationCap, Pencil, Plus, RefreshCw, Search, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudentModal } from '../../components/students/StudentModal';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import type { Student } from '../../types';
import './students.css';

const statuses = [{ value: '', label: 'Tất cả học sinh', icon: Users }, { value: 'DANG_HOC', label: 'Đang học', icon: UserCheck }, { value: 'BAO_LUU', label: 'Bảo lưu', icon: CirclePause }, { value: 'NGHI_HOC', label: 'Nghỉ học', icon: UserX }];

export function StudentsPage() {
  const { user } = useAuth();
  const canManage = ['QUAN_TRI_VIEN', 'NHAN_VIEN'].includes(user?.vai_tro ?? '');
  const [students, setStudents] = useState<Student[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchName, setSearchName] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [notice, setNotice] = useState('');
  const addButton = useRef<HTMLButtonElement>(null);
  const pages = Math.max(1, Math.ceil(total / 20));

  useEffect(() => {
    if (!canManage) return;
    let active = true;
    setLoading(true); setError(''); setStudents([]);
    api.students('', page, statusFilter).then(result => {
      if (!active) return;
      setStudents(result.data); setTotal(result.meta.total);
      const lastPage = Math.max(1, Math.ceil(result.meta.total / 20));
      if (page > lastPage) setPage(lastPage);
    }).catch(reason => { if (active) { setTotal(0); setError(reason instanceof Error ? reason.message : 'Không thể tải danh sách học sinh.'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canManage, statusFilter, page, revision]);

  useEffect(() => {
    if (!canManage) return;
    let active = true;
    setCounts(null);
    Promise.all(statuses.map(status => api.students('', 1, status.value))).then(results => {
      if (active) setCounts(results.map(result => result.meta.total));
    }).catch(() => { if (active) setCounts(null); });
    return () => { active = false; };
  }, [canManage, revision]);

  const reset = () => { setStatusFilter(''); setPage(1); };
  const selectStatus = (status: string) => { setStatusFilter(status); setPage(1); };
  const open = (student: Student | null) => { setEditing(student); setModal(true); setNotice(''); };

  if (!canManage) return <section className="students-page stu-access"><GraduationCap size={40} /><h1>{user?.vai_tro === 'HOC_SINH' ? 'Hồ sơ của tôi' : 'Học sinh của lớp'}</h1><p>{user?.vai_tro === 'HOC_SINH' ? 'Hồ sơ cá nhân đang được chuẩn bị. Vui lòng liên hệ nhân viên học vụ để được hỗ trợ.' : 'Danh sách học sinh theo lớp được phân công đang được chuẩn bị.'}</p><Link to="/">Về Tổng quan <ArrowRight size={16} /></Link></section>;

  return <div className="students-page">
    <div className="stu-breadcrumb"><Link to="/">Tổng quan</Link><ChevronRight size={13} /><span>Quản lý học sinh</span></div>
    <div className="stu-heading"><div><span className="stu-eyebrow">HỌC VỤ / HỒ SƠ HỌC SINH</span><h1>Quản lý <em>học sinh</em></h1><p>Mỗi hồ sơ, một hành trình. Đồng hành trên lộ trình tiếng Nhật.</p></div><button ref={addButton} className="stu-primary" onClick={() => open(null)}><Plus size={18} />Thêm học sinh</button></div>
    <section className="stu-metrics" aria-label="Thống kê toàn bộ học sinh">
      {statuses.map((status, index) => <button key={status.value} className={`stu-metric tone-${index} ${statusFilter === status.value ? 'selected' : ''}`} aria-pressed={statusFilter === status.value} onClick={() => selectStatus(status.value)}><div className="stu-metric-top"><span>{status.label}</span><status.icon size={19} /></div><strong>{counts ? counts[index].toLocaleString('vi-VN') : '—'}<small>học sinh</small></strong><div className="stu-metric-bottom"><span>{['Tổng số hồ sơ trong hệ thống', 'Đang tiếp tục hành trình học tập', 'Tạm dừng, lưu giữ kết quả', 'Lưu trữ hồ sơ và lịch sử'][index]}</span><ArrowRight size={14} /></div></button>)}
    </section>
    {notice && <div className="stu-notice" role="status"><UserCheck size={17} />{notice}</div>}
    <section className="stu-list" aria-labelledby="stu-list-title" aria-busy={loading}>
      <div className="stu-list-heading">
        <h2 id="stu-list-title">Danh sách học sinh</h2>
        <label className="stu-name-search">
          <span className="stu-sr-only">Tìm theo tên học sinh</span>
          <Search size={17} aria-hidden="true" />
          <input type="search" name="studentName" placeholder="Tìm theo tên học sinh…" value={searchName} onChange={event => setSearchName(event.target.value)} />
        </label>
      </div>
      <div className="stu-status-tabs" aria-label="Lọc theo trạng thái">{statuses.map(status => <button key={status.value} onClick={() => selectStatus(status.value)} aria-pressed={statusFilter === status.value} className={statusFilter === status.value ? 'active' : ''}>{status.label}</button>)}</div>
      {error ? <div className="stu-empty" role="alert"><UserX size={30} /><h3>Không thể tải danh sách</h3><p>{error}</p><button className="stu-secondary" onClick={() => setRevision(value => value + 1)}><RefreshCw size={15} />Thử lại</button></div> : <div className="stu-table-responsive"><table><thead><tr><th scope="col">Học sinh</th><th scope="col">Trạng thái</th><th scope="col">Cấp độ</th><th scope="col">Lớp đang học</th><th scope="col">Ngày sinh</th><th scope="col">Giới tính</th><th scope="col">Số điện thoại</th><th scope="col">Email</th><th scope="col">Địa chỉ</th><th scope="col"><span className="stu-sr-only">Thao tác</span></th></tr></thead><tbody>
        {loading ? Array.from({ length: 5 }, (_, index) => <tr key={index} aria-hidden="true">{Array.from({ length: 10 }, (_, column) => <td key={column}><div className="stu-skeleton" /></td>)}</tr>) : students.map(student => <tr key={student.id}><td data-label="Học sinh"><div className="stu-person"><span className={`stu-avatar level-${student.cap_do_hien_tai ?? 'none'}`}>{student.ho_ten.trim().split(/\s+/).slice(-2).map(part => part[0]).join('')}</span><div><button className="stu-name" onClick={() => open(student)}>{student.ho_ten}</button><small>{student.ma_hoc_sinh}</small></div></div></td><td data-label="Trạng thái"><span className={`stu-badge status-${student.trang_thai}`}><i />{statuses.find(status => status.value === student.trang_thai)?.label ?? 'Chưa xác định'}</span></td><td data-label="Cấp độ"><span className={`stu-level level-${student.cap_do_hien_tai ?? 'none'}`}>{student.cap_do_hien_tai || '—'}</span></td><td className="stu-muted" data-label="Lớp đang học">—</td><td className="stu-muted" data-label="Ngày sinh">{student.ngay_sinh ? student.ngay_sinh.slice(0, 10).split('-').reverse().join('/') : '—'}</td><td data-label="Giới tính">{({ NAM: 'Nam', NU: 'Nữ', KHAC: 'Khác' } as Record<string, string>)[student.gioi_tinh ?? ''] ?? (student.gioi_tinh || '—')}</td><td className="stu-phone" data-label="Số điện thoại">{student.so_dien_thoai || '—'}</td><td data-label="Email">{student.email || '—'}</td><td className="stu-address" data-label="Địa chỉ">{student.dia_chi || '—'}</td><td data-label="Thao tác"><div className="stu-row-actions"><button className="stu-row-action" aria-label={`Chỉnh sửa hồ sơ ${student.ho_ten}`} onClick={() => open(student)}><Pencil size={17} /></button><button type="button" className="stu-row-action stu-delete-action" aria-label={`Xóa học sinh ${student.ho_ten}`} title="Chức năng xóa học sinh chưa khả dụng" disabled><Trash2 size={16} /></button></div></td></tr>)}
      </tbody></table>{!loading && students.length === 0 && <div className="stu-empty"><Search size={32} /><h3>Không tìm thấy học sinh phù hợp.</h3><p>Thử thay đổi từ khóa hoặc đặt lại bộ lọc để xem danh sách.</p><button className="stu-secondary" onClick={reset}>Đặt lại bộ lọc</button></div>}</div>}
      <div className="stu-pagination"><span aria-live="polite">{loading ? 'Đang tải danh sách…' : error ? 'Dữ liệu chưa khả dụng' : total ? `Hiển thị ${(page - 1) * 20 + 1}–${Math.min(page * 20, total)} trong ${total} học sinh` : '0 học sinh'}<small>20 học sinh / trang</small></span><div><button aria-label="Trang trước" disabled={loading || !!error || page <= 1} onClick={() => setPage(value => value - 1)}><ChevronLeft size={17} /></button><span>Trang {page} / {pages}</span><button aria-label="Trang sau" disabled={loading || !!error || page >= pages} onClick={() => setPage(value => value + 1)}><ChevronRight size={17} /></button></div></div>
    </section>
    {modal && <StudentModal student={editing} onClose={() => setModal(false)} onSaved={() => { setModal(false); setNotice(editing ? 'Đã cập nhật hồ sơ học sinh.' : 'Đã thêm học sinh mới.'); setRevision(value => value + 1); addButton.current?.focus(); }} />}
  </div>;
}
