import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  searchLienquan,
  LQ_SEARCH_TYPE_LABELS,
} from '../../../lib/lienquan/searchHeroes.js';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';

export default function SearchBar() {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setResults(searchLienquan(query));
    setOpen(Boolean(query.trim()));
  }, [query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = (result) => {
    setQuery('');
    setOpen(false);
    navigate(result.to);
  };

  return (
    <div className="lq-search" ref={wrapRef}>
      <label className="lq-search-label" htmlFor="lq-hero-search">
        {LQ_UI.searchLabel}
      </label>
      <input
        id="lq-hero-search"
        type="search"
        className="lq-search-input"
        placeholder={LQ_UI.searchPlaceholder}
        value={query}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && results.length > 0}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) {
            e.preventDefault();
            go(results[0]);
          }
        }}
      />
      {open && results.length > 0 && (
        <ul id={listId} className="lq-search-results" role="listbox">
          {results.map((result) => (
            <li key={`${result.type}-${result.to}-${result.title}`}>
              <button type="button" className="lq-search-item" onClick={() => go(result)}>
                <span className="lq-search-item-main">
                  <span className="lq-search-item-name">{result.title}</span>
                  <span className="lq-search-item-meta">{result.subtitle}</span>
                </span>
                <span className="lq-search-item-type">
                  {LQ_SEARCH_TYPE_LABELS[result.type] || result.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && (
        <p className="lq-search-empty">Không tìm thấy — thử tên tướng, SGP, item hoặc thuật ngữ.</p>
      )}
    </div>
  );
}
