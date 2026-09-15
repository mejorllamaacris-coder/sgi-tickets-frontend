// src/shared/ui/ThemeToggle/ThemeToggle.tsx
import { useLayoutStore } from '@/shared/stores/layout.store';

export function ThemeToggle() {
  const darkTheme  = useLayoutStore(s => s.darkTheme);
  const toggleDark = useLayoutStore(s => s.toggleDark);

  return (
    <button
      onClick={toggleDark}
      type="button"
      className="inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-300/60 dark:border-slate-700/60 backdrop-blur-md cursor-pointer focus:outline-none"
      title={darkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Alternar tema"
    >
      {darkTheme ? (
        <svg className="w-5 h-5 fill-current text-amber-400" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 fill-current text-indigo-600" viewBox="0 0 24 24">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}