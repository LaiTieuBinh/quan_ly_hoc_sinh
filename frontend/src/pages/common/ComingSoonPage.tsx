import { NavLink } from 'react-router-dom';

export function ComingSoonPage() {
  return <section className="coming"><span className="brand-mark">空</span><h2>Phân hệ đang sẵn sàng để phát triển</h2><p>Nền dữ liệu đã có trong Prisma schema. Kết nối API tương ứng theo tài liệu thiết kế chi tiết.</p><NavLink to="/" className="primary small">Về tổng quan</NavLink></section>;
}
