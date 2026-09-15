import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ELECTRIC_BLUE_PALETTE = {
  id: 'electric-blue',
  name: 'Azul Eléctrico',
  accent: '#0044FF',
  accentBg: '#E8EEFF',
  accentHover: '#0033CC',
};

interface Palette {
  id: string;
  name: string;
  accent: string;
  accentBg: string;
  accentHover: string;
}

interface LayoutState {
  paletteId: string;
  palette: Palette;
  setPalette: (id: string) => void;
  getPalette: () => Palette;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      paletteId: 'electric-blue',
      palette: ELECTRIC_BLUE_PALETTE,
      setPalette: (id: string) => {
        set({ paletteId: id });
      },
      getPalette: () => get().palette,
    }),
    {
      name: 'sgi-layout-storage',
    }
  )
);

export const PALETTES = [ELECTRIC_BLUE_PALETTE];
