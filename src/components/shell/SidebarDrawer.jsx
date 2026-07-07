import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useDrawer } from './DrawerContext';
import { SIDEBAR_SECTIONS } from './sidebarNav';
import { fetchQuizzes } from '../../lib/quizApi';
import { scrollToTop } from '../../lib/scrollToTop';
import './SidebarDrawer.css';

function DrawerAccordion({ section, closeDrawer, isLoading }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);

  const links = section.links || [];
  const scrollable = section.dynamic === 'quizzes';

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
          {scrollable && links.length > 0 && (
            <span className="drawer-section-count">{links.length}</span>
          )}
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
            <div className={`drawer-links${scrollable ? ' drawer-links--scroll' : ''}`}>
              {scrollable && isLoading && links.length === 0 && (
                <span className="drawer-link drawer-link--muted">Đang tải quiz…</span>
              )}
              {scrollable && !isLoading && links.length === 0 && (
                <span className="drawer-link drawer-link--muted">Chưa có quiz nào</span>
              )}
              {links.map((link) => {
                const active = link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to + link.label}
                    to={link.to}
                    onClick={() => {
                      if (link.to === '/') scrollToTop();
                      closeDrawer();
                    }}
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
  const [quizLinks, setQuizLinks] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizzesLoaded, setQuizzesLoaded] = useState(false);

  useEffect(() => {
    if (!open || quizzesLoaded) return;
    setQuizzesLoading(true);
    fetchQuizzes()
      .then((quizzes) => {
        const links = (quizzes || [])
          .filter((q) => q && q.id && q.title)
          .map((q) => ({ to: `/quiz/${q.id}`, label: q.title }));
        setQuizLinks(links);
        setQuizzesLoaded(true);
      })
      .catch(console.error)
      .finally(() => setQuizzesLoading(false));
  }, [open, quizzesLoaded]);

  const sections = SIDEBAR_SECTIONS.map((section) =>
    section.dynamic === 'quizzes' ? { ...section, links: quizLinks } : section,
  );

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
              {sections.map((section) => (
                <DrawerAccordion
                  key={section.id}
                  section={section}
                  closeDrawer={closeDrawer}
                  isLoading={section.dynamic === 'quizzes' ? quizzesLoading : false}
                />
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
