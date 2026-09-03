import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, CalendarDays, ChevronRight, ClipboardCheck, GraduationCap, Plus, Users, WalletCards } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { api } from '../../services/api';
import type { Overview } from '../../types';

export function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api.overview().then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : 'Lỗi tải dữ liệu')); }, []);
  const cards = [
    { key: 'hoc_sinh', label: 'Học sinh đang học', icon: Users, color: 'blue' },
    { key: 'lop_hoc', label: 'Lớp đang hoạt động', icon: BookOpen, color: 'orange' },
    { key: 'giao_vien', label: 'Giáo viên', icon: GraduationCap, color: 'green' },
    { key: 'dang_ky', label: 'Đăng ký hiệu lực', icon: ClipboardCheck, color: 'purple' },
  ] as const;

  return <><div className="page-heading"><div><span className="eyebrow ink">THỨ NĂM, 20 THÁNG 8</span><h1>Xin chào, Admin 👋</h1><p>Đây là tình hình học tập hôm nay tại trung tâm.</p></div><button className="outline"><CalendarDays size={18} /> Học kỳ I, 2026</button></div>{error && <div className="error">{error}</div>}<section className="metrics">{cards.map((card) => <article className="metric" key={card.key}><div className={`metric-icon ${card.color}`}><card.icon /></div><div><span>{card.label}</span><strong>{data?.chi_so[card.key] ?? '—'}</strong><small>Đang cập nhật theo thời gian thực</small></div></article>)}</section><section className="dashboard-grid"><article className="panel"><div className="panel-title"><div><h3>Phân bổ theo cấp độ</h3><p>Số học sinh đang học từ N5 đến N1</p></div><BarChart3 /></div><div className="level-chart">{['N5', 'N4', 'N3', 'N2', 'N1'].map((level, index) => { const count = data?.theo_cap_do.find((item) => item.cap_do === level)?.so_luong ?? 0; const max = Math.max(...(data?.theo_cap_do.map((item) => item.so_luong) ?? [1]), 1); return <div className="bar-row" key={level}><strong>{level}</strong><div><i style={{ width: `${Math.max(count / max * 100, count ? 8 : 0)}%`, animationDelay: `${index * 80}ms` }} /></div><span>{count}</span></div>; })}</div></article><article className="panel quick"><div className="panel-title"><div><h3>Truy cập nhanh</h3><p>Các tác vụ thường dùng</p></div></div><NavLink to="/hoc-sinh"><span className="quick-icon blue"><Plus /></span><div><strong>Thêm học sinh mới</strong><small>Tạo hồ sơ và xếp cấp độ</small></div><ChevronRight /></NavLink><NavLink to="/diem-danh"><span className="quick-icon orange"><ClipboardCheck /></span><div><strong>Điểm danh buổi học</strong><small>Ghi nhận chuyên cần hôm nay</small></div><ChevronRight /></NavLink><NavLink to="/hoc-phi"><span className="quick-icon green"><WalletCards /></span><div><strong>Ghi nhận học phí</strong><small>Tạo giao dịch và phiếu thu</small></div><ChevronRight /></NavLink></article></section></>;
}
