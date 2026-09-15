// src/shared/hooks/useTableFilters.ts
import { useState, useMemo } from 'react';

interface FilterConfig<T> {
  data: T[];
  searchKeys: (keyof T)[];        // qué campos buscar, ej: ['nombre', 'cedula']
  filters?: {
    key: keyof T;
    value: string;
  }[];
}

export function useTableFilters<T>({ data, searchKeys, filters = [] }: FilterConfig<T>) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = data;

    // Búsqueda por texto
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        searchKeys.some(key => String(item[key] ?? '').toLowerCase().includes(q))
      );
    }

    // Filtros adicionales (sede, estado, etc.)
    for (const f of filters) {
      if (f.value && f.value !== 'all') {
        result = result.filter(item => String(item[f.key]) === f.value);
      }
    }

    return result;
  }, [data, search, filters]);

  return { filtered, search, setSearch };
}