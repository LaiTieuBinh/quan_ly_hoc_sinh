import { useState } from 'react';
import { BarChart3, Bell, BookOpen, CalendarDays, ClipboardCheck, LayoutDashboard, LogOut, Menu, Settings, Users, WalletCards, X } from 'lucide-react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ComingSoonPage } from '../pages/common/ComingSoonPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { StudentsPage } from '../pages/students/StudentsPage';
import { useAuth } from '../auth/AuthContext';

const menu = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard }, { to: '/hoc-sinh', label: 'Học sinh', icon: Users },
  { to: '/lop-hoc', label: 'Lớp học', icon: BookOpen }, { to: '/lich-hoc', label: 'Lịch học', icon: CalendarDays },
  { to: '/diem-danh', label: 'Điểm danh', icon: ClipboardCheck }, { to: '/hoc-phi', label: 'Học phí', icon: WalletCards },
  { to: '/bao-cao', label: 'Báo cáo', icon: BarChart3 },
];

export function AppShell() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const onLogout = () => void logout();
  if (!user) return null;
  const visibleMenu = menu.filter(item => item.to !== '/bao-cao' || user.vai_tro === 'QUAN_TRI_VIEN' || user.quyen?.includes('REPORT_READ'));
  return <div className={location.pathname === '/' ? 'app overview-shell' : 'app'}><aside className={open ? 'sidebar open' : 'sidebar'}><div className="sidebar-menu-controls"><button aria-label="Đóng menu" className="close-menu" onClick={() => setOpen(false)}><X /></button></div><nav>{visibleMenu.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)}><item.icon size={19} />{item.label}</NavLink>)}</nav><div className="sidebar-foot"><NavLink to="/cai-dat"><Settings size={19} />Cài đặt</NavLink><button onClick={onLogout}><LogOut size={19} />Đăng xuất</button></div></aside><div className="workspace"><header><button aria-label="Mở menu" aria-expanded={open} className="menu-button" onClick={() => setOpen(true)}><Menu /></button><div className="brand header-brand"><span className="brand-mark age-restriction-mark" aria-label="Dành cho người từ 18 tuổi">18+</span><span>Tokuda 学校</span></div><div className="header-user"><button className="icon-button"><Bell size={20} /><i /></button><div className="avatar">{(user.ho_ten || user.ten_dang_nhap).slice(0, 2).toUpperCase()}</div><div><strong>{user.ten_dang_nhap}</strong></div></div></header><main className="content"><Routes><Route index element={<DashboardPage />} /><Route path="hoc-sinh" element={<StudentsPage />} /><Route path="*" element={<ComingSoonPage />} /></Routes></main></div>{open && <div className="overlay" onClick={() => setOpen(false)} />}</div>;
}
