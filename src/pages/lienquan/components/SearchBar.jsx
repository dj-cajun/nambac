import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchHeroes } from '../../../lib/lienquan/searchHeroes.js';

export default function SearchBar() {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setResults(searchHeroes(query));
    setOpen(Boolean(query.trim()));
  }, [query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = (hero) => {
    setQuery('');
    setOpen(false);
    navigate(`/lienquan/tuong/${hero.id}`);
  };

  return (
    <div className="lq-search" ref={wrapRef}>
      <label className="lq-search-label" htmlFor="lq-hero-search">
        Tìm tướng (30 giây)
      </label>
      <input
        id="lq-hero-search"
        type="search"
        className="lq-search-input"
        placeholder="Gõ tướng… (Florentino, Nakroth, Murad)"
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
          {results.map((hero) => (
            <li key={hero.id}>
              <button type="button" className="lq-search-item" onClick={() => go(hero)}>
                <span className="lq-search-item-name">{hero.name}</span>
                <span className="lq-search-item-meta">{hero.lane} · {hero.tier}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && (
        <p className="lq-search-empty">Không tìm thấy tướng.</p>
      )}
    </div>
  );
}
