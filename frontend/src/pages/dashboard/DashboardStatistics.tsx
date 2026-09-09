import { ArrowUpRight, BookOpen, CalendarDays, ClipboardCheck, FileText, GraduationCap, Users, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Overview } from '../../types';

type Props = {
  data: Overview | null;
  admin: boolean;
  student: boolean;
  teacher: boolean;
  loading: boolean;
  error: string;
  onRetry: () => void;
};
type Statistic = { label: string; value?: number; unit: string };
type Module = { title: string; icon: typeof Users; to: string; statistics: Statistic[] };

export function DashboardStatistics({ data, admin, student, teacher, loading, error, onRetry }: Props) {
  const summary = admin ? data?.chi_so : undefined;
  const modules: Module[] = student ? [
    { title: 'Lịch học', icon: CalendarDays, to: '/lich-hoc', statistics: [{ label: 'Buổi học sắp tới', unit: 'buổi' }] },
    { title: 'Chuyên cần', icon: ClipboardCheck, to: '/diem-danh', statistics: [{ label: 'Tỷ lệ có mặt', unit: '%' }] },
    { title: 'Bài tập', icon: FileText, to: '/bai-tap', statistics: [{ label: 'Bài tập cần nộp', unit: 'bài' }] },
    { title: 'Kết quả học tập', icon: GraduationCap, to: '/diem', statistics: [{ label: 'Điểm gần nhất', unit: 'điểm' }] },
    { title: 'Tài liệu', icon: BookOpen, to: '/tai-lieu', statistics: [{ label: 'Tài liệu mới', unit: 'tài liệu' }] },
  ] : teacher ? [
    { title: 'Lớp giảng dạy', icon: BookOpen, to: '/lop-hoc', statistics: [{ label: 'Lớp được phân công', unit: 'lớp' }] },
    { title: 'Lịch học', icon: CalendarDays, to: '/lich-hoc', statistics: [{ label: 'Buổi học sắp tới', unit: 'buổi' }] },
    { title: 'Điểm danh', icon: ClipboardCheck, to: '/diem-danh', statistics: [{ label: 'Buổi cần điểm danh', unit: 'buổi' }] },
    { title: 'Bài tập', icon: FileText, to: '/bai-tap', statistics: [{ label: 'Bài cần xử lý', unit: 'bài' }] },
  ] : [
    { title: 'Học sinh', icon: Users, to: '/hoc-sinh', statistics: [{ label: 'Đang học', value: summary?.hoc_sinh, unit: 'học sinh' }] },
    { title: 'Lớp học', icon: BookOpen, to: '/lop-hoc', statistics: [{ label: 'Đang hoạt động', value: summary?.lop_hoc, unit: 'lớp' }, { label: 'Đăng ký hiệu lực', value: summary?.dang_ky, unit: 'đăng ký' }] },
    { title: 'Giáo viên', icon: GraduationCap, to: '/giao-vien', statistics: [{ label: 'Đang hoạt động', value: summary?.giao_vien, unit: 'giáo viên' }] },
    { title: 'Lịch học', icon: CalendarDays, to: '/lich-hoc', statistics: [{ label: 'Buổi học sắp tới', unit: 'buổi' }] },
    { title: 'Điểm danh', icon: ClipboardCheck, to: '/diem-danh', statistics: [{ label: 'Tỷ lệ chuyên cần', unit: '%' }, { label: 'Buổi chưa hoàn tất', unit: 'buổi' }] },
    { title: 'Học phí', icon: WalletCards, to: '/hoc-phi', statistics: [{ label: 'Còn phải thu', unit: '₫' }, { label: 'Nghĩa vụ quá hạn', unit: 'khoản' }] },
  ];

  return <section className="dash-statistics" aria-labelledby="statistics-title">
    <div className="dash-section-heading"><h2 id="statistics-title">Thống kê theo danh mục</h2></div>
    <div className="dash-module-grid">{modules.map((module, index) => {
      const connected = admin && ['/hoc-sinh', '/lop-hoc', '/giao-vien'].includes(module.to);
      return <article className={'dash-panel dash-module tone-' + index % 4} key={module.to} aria-busy={connected && loading}>
        <div className="dash-module-heading"><span className="dash-icon"><module.icon size={20} /></span><h3>{module.title}</h3><Link to={module.to} aria-label={'Xem chi tiết ' + module.title.toLowerCase()}><ArrowUpRight size={18} /></Link></div>
        <div className="dash-module-values">{module.statistics.map(statistic => <div className="dash-module-value" key={statistic.label}>
          <span>{statistic.label}</span>
          {connected && loading ? <div className="dash-skeleton" aria-label="Đang tải thống kê" /> : <div><strong>{statistic.value?.toLocaleString('vi-VN') ?? '—'}</strong><small>{statistic.unit}</small></div>}
        </div>)}</div>
        <div className="dash-module-footer">{connected && error ? <button className="dash-retry" onClick={onRetry}>Tải thất bại · Thử lại</button> : <span>{connected && loading ? 'Đang cập nhật số liệu' : module.statistics.some(item => item.value !== undefined) ? 'Theo dữ liệu hiện tại' : 'Chưa có dữ liệu tổng hợp'}</span>}</div>
      </article>;
    })}</div>
  </section>;
}
