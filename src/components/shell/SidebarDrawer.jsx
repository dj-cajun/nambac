import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useDrawer } from './DrawerContext';
import { fetchQuizzes } from '../../lib/quizApi';
import { QUIZ_CATEGORIES } from '../../constants/categories';
import { pickDailyQuiz, pickDailyBalanceQuestion } from '../../../shared/dailyPicks.js';
import { FORTUNE_BRAND } from '../../../shared/fortuneMeta.js';
import { scrollToTop } from '../../lib/scrollToTop';
import './SidebarDrawer.css';

function buildTodayCategoryGroup(todayQuiz) {
  if (!todayQuiz) return null;

  return {
    id: 'today',
    label: 'Quiz hôm nay ☕',
    variant: 'today',
    links: [{ to: `/quiz/${todayQuiz.id}`, label: '🎯 Quiz' }],
  };
}

function buildFortuneGroup() {
  return {
    id: 'fortune',
    label: `${FORTUNE_BRAND.emoji} ${FORTUNE_BRAND.label}`,
    variant: 'fortune',
    links: [
      { to: '/fortune', label: 'Hôm nay', exact: true },
      { to: '/fortune/tomorrow', label: 'Ngày mai', exact: true },
    ],
  };
}

function buildMiniAppsGroup(todayBalance) {
  return {
    id: 'miniapps',
    label: '🎮 Chơi nhanh',
    variant: 'miniapps',
    links: [
      { to: `/balance/${todayBalance.id}`, label: `${todayBalance.emoji || '⚖️'} 1 trong 2` },
      { to: '/roast-card', label: '💳 Bóc phốt' },
      { to: '/brain', label: '🧠 Não bạn' },
    ],
  };
}

function isDrawerLinkActive(pathname, link) {
  if (link.exact) return pathname === link.to;
  if (link.to === '/') return pathname === '/';
  return pathname === link.to || pathname.startsWith(`${link.to}/`);
}

function isMiniAppRoute(pathname) {
  return pathname.startsWith('/balance')
    || pathname.startsWith('/roast-card')
    || pathname === '/brain';
}

function DrawerLink({ link, closeDrawer, nested = false, lined = false }) {
  const location = useLocation();
  const active = isDrawerLinkActive(location.pathname, link);

  return (
    <Link
      to={link.to}
      onClick={() => {
        scrollToTop();
        closeDrawer();
      }}
      className={`drawer-link${nested ? ' drawer-link--nested' : ''}${lined ? ' drawer-link--lined' : ''}${active ? ' active' : ''}`}
    >
      {link.label}
    </Link>
  );
}

function DrawerCategoryGroup({ group, closeDrawer }) {
  const location = useLocation();
  const routeActive = group.links?.some((link) => isDrawerLinkActive(location.pathname, link))
    || (group.id === 'miniapps' && isMiniAppRoute(location.pathname));
  const defaultOpen = group.id === 'today' || group.id === 'fortune' || group.id === 'miniapps';
  const [isOpen, setIsOpen] = useState(defaultOpen || routeActive);

  const variantClass = group.variant ? ` drawer-category--${group.variant}` : '';

  return (
    <div className={`drawer-category${variantClass}`}>
      <button
        type="button"
        className="drawer-category-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="drawer-category-label">{group.label}</span>
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
                <DrawerLink key={link.to} link={link} closeDrawer={closeDrawer} nested lined />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DrawerQuizCategoriesBox({ closeDrawer }) {
  const location = useLocation();

  return (
    <div className="drawer-quiz-list-box">
      <div className="drawer-quiz-list-heading">Trắc nghiệm</div>
      <div className="drawer-quiz-list-lines">
        {QUIZ_CATEGORIES.map((category) => {
          const to = `/category/${category.id}`;
          const active = location.pathname === to;

          return (
            <Link
              key={category.id}
              to={to}
              onClick={() => {
                scrollToTop();
                closeDrawer();
              }}
              className={`drawer-quiz-list-line${active ? ' active' : ''}`}
            >
              {category.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SidebarDrawer() {
  const { open, closeDrawer } = useDrawer();
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoaded, setQuizzesLoaded] = useState(false);

  const todayQuiz = useMemo(() => pickDailyQuiz(quizzes), [quizzes]);
  const todayBalance = useMemo(() => pickDailyBalanceQuestion(), []);
  const todayGroup = useMemo(() => buildTodayCategoryGroup(todayQuiz), [todayQuiz]);
  const fortuneGroup = useMemo(() => buildFortuneGroup(), []);
  const miniAppsGroup = useMemo(
    () => buildMiniAppsGroup(todayBalance),
    [todayBalance],
  );

  useEffect(() => {
    if (!open || quizzesLoaded) return;
    fetchQuizzes()
      .then((list) => {
        setQuizzes(list);
        setQuizzesLoaded(true);
      })
      .catch(console.error);
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

            <div className="drawer-scroll drawer-scroll--hidden">
              <div className="drawer-quiz-groups">
                {todayGroup && (
                  <DrawerCategoryGroup group={todayGroup} closeDrawer={closeDrawer} />
                )}
                <DrawerCategoryGroup group={fortuneGroup} closeDrawer={closeDrawer} />
                <DrawerCategoryGroup group={miniAppsGroup} closeDrawer={closeDrawer} />
                <DrawerQuizCategoriesBox closeDrawer={closeDrawer} />
              </div>
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
