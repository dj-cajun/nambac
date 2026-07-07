import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useDrawer } from './DrawerContext';
import { SIDEBAR_SECTIONS } from './sidebarNav';
import { fetchQuizzes } from '../../lib/quizApi';
import { QUIZ_CATEGORIES, normalizeCategory } from '../../constants/categories';
import { scrollToTop } from '../../lib/scrollToTop';
import './SidebarDrawer.css';

function groupQuizzesByCategory(quizzes) {
  const buckets = new Map();
  for (const cat of QUIZ_CATEGORIES) {
    buckets.set(cat.id, []);
  }

  for (const q of quizzes || []) {
    if (!q?.id || !q?.title) continue;
    const catId = normalizeCategory(q.category);
    if (!buckets.has(catId)) buckets.set(catId, []);
    buckets.get(catId).push({ to: `/quiz/${q.id}`, label: q.title });
  }

  return QUIZ_CATEGORIES
    .map((cat) => ({
      id: cat.id,
      label: cat.label,
      emoji: cat.emoji,
      links: buckets.get(cat.id) || [],
    }))
    .filter((group) => group.links.length > 0);
}

function DrawerLink({ link, closeDrawer, nested = false }) {
  const location = useLocation();
  const active = link.to === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(link.to);

  return (
    <Link
      to={link.to}
      onClick={() => {
        if (link.to === '/') scrollToTop();
        closeDrawer();
      }}
      className={`drawer-link${nested ? ' drawer-link--nested' : ''}${active ? ' active' : ''}`}
    >
      {link.label}
    </Link>
  );
}

function DrawerCategoryGroup({ group, closeDrawer }) {
  const location = useLocation();
  const hasActive = group.links.some((l) => location.pathname.startsWith(l.to));
  const [isOpen, setIsOpen] = useState(hasActive);

  return (
    <div className="drawer-category">
      <button
        type="button"
        className="drawer-category-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="drawer-category-label">
          {group.label}
          <span className="drawer-category-count">{group.links.length}</span>
        </span>
        <ChevronDown size={14} className={`drawer-chevron drawer-chevron--sm${isOpen ? ' open' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="drawer-category-links-wrap"
          >
            <div className="drawer-category-links">
              {group.links.map((link) => (
                <DrawerLink key={link.to} link={link} closeDrawer={closeDrawer} nested />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DrawerAccordion({ section, closeDrawer, quizGroups, isLoading }) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);
  const isQuizSection = section.dynamic === 'quizzes';
  const links = section.links || [];
  const totalQuizzes = useMemo(
    () => (isQuizSection ? quizGroups.reduce((n, g) => n + g.links.length, 0) : 0),
    [isQuizSection, quizGroups],
  );

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
          {isQuizSection && totalQuizzes > 0 && (
            <span className="drawer-section-count">{totalQuizzes}</span>
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
            {isQuizSection ? (
              <div className="drawer-quiz-groups">
                {isLoading && quizGroups.length === 0 && (
                  <span className="drawer-link drawer-link--muted">Đang tải quiz…</span>
                )}
                {!isLoading && quizGroups.length === 0 && (
                  <span className="drawer-link drawer-link--muted">Chưa có quiz nào</span>
                )}
                {quizGroups.map((group) => (
                  <DrawerCategoryGroup key={group.id} group={group} closeDrawer={closeDrawer} />
                ))}
              </div>
            ) : (
              <div className="drawer-links">
                {links.map((link) => (
                  <DrawerLink key={link.to + link.label} link={link} closeDrawer={closeDrawer} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SidebarDrawer() {
  const { open, closeDrawer } = useDrawer();
  const [quizGroups, setQuizGroups] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizzesLoaded, setQuizzesLoaded] = useState(false);

  useEffect(() => {
    if (!open || quizzesLoaded) return;
    setQuizzesLoading(true);
    fetchQuizzes()
      .then((quizzes) => {
        setQuizGroups(groupQuizzesByCategory(quizzes));
        setQuizzesLoaded(true);
      })
      .catch(console.error)
      .finally(() => setQuizzesLoading(false));
  }, [open, quizzesLoaded]);

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
                <DrawerAccordion
                  key={section.id}
                  section={section}
                  closeDrawer={closeDrawer}
                  quizGroups={quizGroups}
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
