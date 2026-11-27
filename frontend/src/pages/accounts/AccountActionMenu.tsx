import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function AccountActionMenu({ anchorId, children, onClose }: { anchorId: string; children: ReactNode; onClose: () => void }) {
  const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0, ready: false });

  useLayoutEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor || !menu.current) return;
    const rect = anchor.getBoundingClientRect();
    const size = menu.current.getBoundingClientRect();
    const gap = 6, margin = 8;
    const below = rect.bottom + gap;
    const top = below + size.height <= window.innerHeight - margin ? below : rect.top - size.height - gap;
    setPosition({ left: Math.max(margin, Math.min(rect.right - size.width, window.innerWidth - size.width - margin)), top: Math.max(margin, top), ready: true });
    menu.current.querySelector('button')?.focus();
    const closeOnScroll = (event: Event) => {
      if (!menu.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('scroll', closeOnScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchorId, onClose]);

  return createPortal(<div ref={menu} className="acc-action-menu acc-floating-menu" style={{ left: position.left, top: position.top, visibility: position.ready ? 'visible' : 'hidden' }}>{children}</div>, document.body);
}
