import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useDrawer } from './DrawerContext';
import { SIDEBAR_SECTIONS } from './sidebarNav';
import './SidebarDrawer.css';

function DrawerAccordion({ section, closeDrawer }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);

  return (
    <div className="drawer-section">
      <button
        type="button"
        className="drawer-section-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="drawer-section-title">
          <span className="drawer-section-icon" aria-hidden="true">{section.icon}</span>
          {section.title}
        </span>
        <ChevronDown size={16} className={`drawer-chevron${isOpen ? ' open' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="drawer-links-wrap"
          >
            <div className="drawer-links">
              {section.links.map((link) => {
                const active = link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to + link.label}
                    to={link.to}
                    onClick={closeDrawer}
                    className={`drawer-link${active ? ' active' : ''}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SidebarDrawer() {
  const { open, closeDrawer } = useDrawer();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="drawer-backdrop"
            aria-label="Đóng menu"
            onClick={closeDrawer}
          />

          <motion.aside
            key="drawer"
            id="sidebar-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu nambac"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            drag="x"
            dragConstraints={{ left: -360, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(_, info) => {
              if (info.offset.x < -72) closeDrawer();
            }}
            className="drawer-panel"
          >
            <div className="drawer-header">
              <div className="drawer-brand">
                <span className="drawer-brand-mark">N</span>
                <span className="drawer-brand-name">NamBắc</span>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={closeDrawer}
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-scroll">
              {SIDEBAR_SECTIONS.map((section) => (
                <DrawerAccordion key={section.id} section={section} closeDrawer={closeDrawer} />
              ))}
            </div>

            <div className="drawer-footer">
              <p>Gen Z Sài Gòn · Không cần đăng nhập</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
