import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const getPages = () => {
    const items = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(pages - 1, page + delta);
    items.push(1);
    if (left > 2) items.push('...');
    for (let i = left; i <= right; i++) items.push(i);
    if (right < pages - 1) items.push('...');
    if (pages > 1) items.push(pages);
    return items;
  };
  const btnClass = (active) =>
    `w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${active ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`;
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className={`${btnClass(false)} disabled:opacity-40`}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400">…</span>
        : <button key={p} onClick={() => onPage(p)} className={btnClass(p === page)}>{p}</button>
      )}
      <button onClick={() => onPage(page + 1)} disabled={page === pages} className={`${btnClass(false)} disabled:opacity-40`}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
