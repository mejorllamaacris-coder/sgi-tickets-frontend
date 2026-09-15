// src/shared/ui/Pagination/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface Props {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (p: number) => void;
}

export function Pagination({ page, totalPages, onNext, onPrev, onGoTo }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button className="pagination__btn" onClick={onPrev} disabled={page === 1}>
        <ChevronLeft size={15} />
      </button>

      {pages.map(p => (
        <button
          key={p}
          className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
          onClick={() => onGoTo(p)}
        >
          {p}
        </button>
      ))}

      <button className="pagination__btn" onClick={onNext} disabled={page === totalPages}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}