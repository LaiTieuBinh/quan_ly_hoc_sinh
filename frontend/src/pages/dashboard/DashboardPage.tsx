import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, CalendarDays, ClipboardCheck, FileText, GraduationCap, RefreshCw, SlidersHorizontal, Users, WalletCards, AlertTriangle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../services/api';
import type { Overview } from '../../types';
import './dashboard.css';
import { DashboardStatistics } from './DashboardStatistics';

const administrative = [
  { label: 'Học sinh đang học', icon: Users, to: '/hoc-sinh', key: 'hoc_sinh' },
  { label: 'Lớp đang hoạt động', icon: BookOpen, to: '/lop-hoc', key: 'lop_hoc' },
  { label: 'Còn phải thu', icon: WalletCards, to: '/hoc-phi', key: null },
  { label: 'Doanh thu', icon: BarChart3, to: '/bao-cao', key: null },
] as const;
const teaching = [
  { label: 'Buổi học sắp tới', icon: CalendarDays, to: '/lich-hoc', key: null },
  { label: 'Lớp / môn được phân công', icon: BookOpen, to: '/giao-vien', key: null },
  { label: 'Điểm danh cần xử lý', icon: ClipboardCheck, to: '/diem-danh', key: null },
  { label: 'Bài tập cần xử lý', icon: FileText, to: '/bai-tap', key: null },
] as const;
const learning = [
  { label: 'Lịch học gần nhất', icon: CalendarDays, to: '/lich-hoc', key: null },
  { label: 'Tỷ lệ chuyên cần', icon: ClipboardCheck, to: '/diem-danh', key: null },
  { label: 'Bài tập cần nộp', icon: FileText, to: '/bai-tap', key: null },
  { label: 'Điểm gần nhất', icon: GraduationCap, to: '/diem', key: null },
] as const;

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const [updated, setUpdated] = useState<Date | null>(null);
  const admin = user?.vai_tro === 'QUAN_TRI_VIEN';
  const student = user?.vai_tro === 'HOC_SINH';
  const teacher = user?.vai_tro === 'GIAO_VIEN';
  // Existing endpoint returns global statistics; never request it for scoped roles.
  useEffect(() => {
    let active = true;
    setData(null);
    setUpdated(null);
    if (!admin) return;
    setLoading(true);
    setError('');
    api.overview().then(result => { if (active) { setData(result); setUpdated(new Date()); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải dữ liệu.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [admin, revision]);
  const cards = student ? learning : teacher ? teaching : administrative.filter(card => admin || card.to !== '/bao-cao' || user?.quyen?.includes('REPORT_READ'));
  const date = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const retry = () => setRevision(value => value + 1);
  return <div className="dashboard">
    <div className="dash-heading"><h1>Tổng quan</h1><div className="dash-date"><CalendarDays size={17} /><span>{date}</span></div></div>
    <section className="dash-filters" aria-labelledby="filter-title"><div className="dash-section-label" id="filter-title"><SlidersHorizontal size={17} /> Phạm vi thống kê</div><div className="dash-filter-fields">{!student && <><label>Niên khóa<select disabled><option>Tất cả niên khóa</option></select></label><label>Kỳ học<select disabled><option>Tất cả kỳ học</option></select></label><label>Lớp học<select disabled><option>{teacher ? 'Lớp được phân công' : 'Tất cả lớp học'}</option></select></label></>}<label>Khoảng thời gian<select disabled><option>Toàn bộ thời gian</option></select></label><button className="dash-button" disabled>Áp dụng</button></div></section>
    <div className="dash-section-heading"><h2>{student ? 'Việc học của bạn' : teacher ? 'Hoạt động giảng dạy' : 'Các chỉ số chính'}</h2>{admin && <button className="dash-refresh" onClick={retry} disabled={loading}><RefreshCw size={14} className={loading ? 'dash-spin' : ''} />{loading ? 'Đang tải' : 'Làm mới'}</button>}</div>
    <section className="dash-metrics" aria-label="Chỉ số tổng quan">{cards.map((card, index) => <article className={'dash-metric tone-' + index} key={card.label}><div className="dash-metric-top"><span className="dash-icon"><card.icon size={20} /></span><Link to={card.to} aria-label={'Xem ' + card.label.toLowerCase()}><ArrowUpRight size={19} /></Link></div><h3>{card.label}</h3>{loading && card.key ? <div className="dash-skeleton" aria-label="Đang tải chỉ số" /> : <strong>{card.key && data ? data.chi_so[card.key].toLocaleString('vi-VN') : '—'}</strong>}{error && card.key ? <button className="dash-retry" onClick={retry}>Tải thất bại · Thử lại</button> : <small>{card.key && data ? 'Theo dữ liệu hiện tại' : 'Chưa có dữ liệu tổng hợp'}</small>}</article>)}</section>
    {error && <p className="dash-error" role="alert">{error}</p>}
    <DashboardStatistics data={data} admin={admin} student={student} teacher={teacher} loading={loading} error={error} onRetry={retry} />
    <section className="dash-panel dash-priority"><div className="dash-panel-title"><div><span className="dash-kicker">CẦN QUAN TÂM</span><h2>{student ? 'Bài tập & tài liệu mới' : teacher ? 'Công việc ưu tiên' : 'Học sinh cần hỗ trợ'}</h2></div><span className="dash-icon"><AlertTriangle size={20} /></span></div><div className="dash-priority-content"><div><h3>{student ? 'Theo dõi nhiệm vụ học tập' : teacher ? 'Điểm danh, chấm bài và trả bài' : 'Đồng hành cùng từng học sinh'}</h3><p>{student ? 'Bài tập cần nộp và tài liệu mới sẽ xuất hiện tại đây.' : teacher ? 'Các công việc cần xử lý sẽ được tổng hợp theo phân công của bạn.' : 'Theo dõi chuyên cần, kết quả học tập và tiến độ nộp bài.'}</p></div><span className="dash-pending">Chưa có dữ liệu tổng hợp</span></div></section>
    <footer className="dash-footer"><span>Tokuda 学校 / Tổng quan</span><span role="status">{updated ? 'Cập nhật lúc ' + updated.toLocaleTimeString('vi-VN') : 'Dữ liệu được hiển thị khi khả dụng'}</span></footer>
  </div>;
}
