// src/features/auth/ui/HexParticles/HexParticles.tsx
import { useEffect, useRef } from 'react';
import { useLayoutStore } from '@/shared/stores/layout.store';
import './HexParticles.css';

const R = 36;
const W = R * Math.sqrt(3);
const ROW_H = R * 1.5;
const AMP = 5;
const GLOW_RADIUS = 280;
const RIPPLE_SPEED = 180;
const RIPPLE_DECAY = 0.006;

interface Hex {
  cx: number;
  cy: number;
  el: SVGPathElement;
}

interface Ripple {
  x: number;
  y: number;
  born: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexPath(cx: number, cy: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`;
  });
  return `M${pts[0]}L${pts[1]}L${pts[2]}L${pts[3]}L${pts[4]}L${pts[5]}Z`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function getHexStroke(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--sgi-hex-stroke').trim()
    || 'rgba(255,255,255,0.15)';
}

export function HexParticles() {
  const accent = useLayoutStore(s => s.getPalette().accent);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hexesRef = useRef<Hex[]>([]);
  const currentRef = useRef<{ tx: number[]; ty: number[] }>({ tx: [], ty: [] });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const focusRef = useRef({ x: 0, y: 0 });
  const isAuto = useRef(true);
  const lastMove = useRef(0);
  const t0 = useRef(Date.now());
  const ripplesRef = useRef<Ripple[]>([]);
  const accentRef = useRef(accent);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  // Renderizado inicial de la malla de hexágonos
  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const rect = container.getBoundingClientRect();
    sizeRef.current = { w: rect.width, h: rect.height };
    focusRef.current = { x: rect.width / 2, y: rect.height / 2 };

    const cols = Math.ceil(rect.width / W) + 4;
    const rows = Math.ceil(rect.height / ROW_H) + 4;
    const hexes: Hex[] = [];

    for (let row = 0; row < rows; row++) {
      const odd = row % 2 === 1;
      const cy = (row - 2) * ROW_H;
      for (let col = 0; col < cols; col++) {
        const cx = (col - 2) * W + (odd ? W / 2 : 0);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', hexPath(cx, cy));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', getHexStroke());
        path.setAttribute('stroke-width', '0.6');
        svg.appendChild(path);
        hexes.push({ cx, cy, el: path });
      }
    }

    hexesRef.current = hexes;
    currentRef.current = {
      tx: new Array(hexes.length).fill(0),
      ty: new Array(hexes.length).fill(0),
    };

    return () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      hexesRef.current = [];
      currentRef.current = { tx: [], ty: [] };
    };
  }, []);

  // Bucle de animación
  useEffect(() => {
    let raf: number;

    const loop = () => {
      const now = Date.now();
      const t = (now - t0.current) * 0.001;
      const { x: mx, y: my } = mouseRef.current;
      const { w, h } = sizeRef.current;

      if (!isAuto.current && now - lastMove.current > 2000) {
        isAuto.current = true;
      }

      const lx = w * 0.5 + w * 0.28 * Math.sin(t * 0.23 + 0.8);
      const ly = h * 0.5 + h * 0.28 * Math.sin(t * 0.17);

      const targetX = isAuto.current ? lx : mx;
      const targetY = isAuto.current ? ly : my;
      const FOCUS_SMOOTH = isAuto.current ? 0.03 : 0.10;

      focusRef.current.x = lerp(focusRef.current.x, targetX, FOCUS_SMOOTH);
      focusRef.current.y = lerp(focusRef.current.y, targetY, FOCUS_SMOOTH);

      const fx = focusRef.current.x;
      const fy = focusRef.current.y;

      ripplesRef.current = ripplesRef.current.filter(
        r => (now - r.born) * RIPPLE_DECAY < 3
      );

      const [ar, ag, ab] = hexToRgb(accentRef.current);
      const hexes = hexesRef.current;
      const cur = currentRef.current;

      for (let i = 0; i < hexes.length; i++) {
        const h = hexes[i];
        let tx = 0, ty = 0;

        if (isAuto.current) {
          tx = Math.sin(t * 0.35) * AMP + Math.cos(t * 0.18) * 2;
          ty = Math.cos(t * 0.30) * AMP + Math.sin(t * 0.15) * 2;
        } else {
          const dx = h.cx - mx;
          const dy = h.cy - my;
          const d2 = dx * dx + dy * dy;
          const damp = Math.exp(-d2 / 40000);
          const wave = Math.sin(t * 0.12 + h.cx * 0.01 + h.cy * 0.015)
                     * Math.max(0, 1 - d2 / 80000);
          tx = dx * damp * 0.2 + wave * 1.2;
          ty = dy * damp * 0.2 + wave * 1.2;
        }

        const SMOOTH = isAuto.current ? 0.04 : 0.12;
        cur.tx[i] = lerp(cur.tx[i], tx, SMOOTH);
        cur.ty[i] = lerp(cur.ty[i], ty, SMOOTH);

        const ddx = h.cx - fx;
        const ddy = h.cy - fy;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        const proximity = Math.max(0, 1 - dist / GLOW_RADIUS);

        let rippleIntensity = 0;
        for (const rip of ripplesRef.current) {
          const age = (now - rip.born) * 0.001;
          const waveFront = age * RIPPLE_SPEED;
          const rdx = h.cx - rip.x;
          const rdy = h.cy - rip.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const delta = Math.abs(rdist - waveFront);
          const ring = Math.exp(-delta * delta * 0.003) * Math.exp(-age * 1.2);
          rippleIntensity = Math.max(rippleIntensity, ring);
        }

        const totalGlow = Math.min(1, proximity * 0.9 + rippleIntensity * 0.7);

        if (totalGlow > 0.01) {
          const strokeOpacity = lerp(0.2, 1, totalGlow);
          const strokeWidth = lerp(1, 2.5, totalGlow);
          h.el.setAttribute('stroke', `rgba(${ar},${ag},${ab},${strokeOpacity.toFixed(2)})`);
          h.el.setAttribute('stroke-width', strokeWidth.toFixed(2));

          if (totalGlow > 0.5) {
            const fillOpacity = ((totalGlow - 0.5) / 0.5) * 0.12;
            h.el.setAttribute('fill', `rgba(${ar},${ag},${ab},${fillOpacity.toFixed(3)})`);
          } else {
            h.el.setAttribute('fill', 'none');
          }
        } else {
          h.el.setAttribute('stroke', getHexStroke());
          h.el.setAttribute('stroke-width', '0.6');
          h.el.setAttribute('fill', 'none');
        }

        h.el.setAttribute(
          'transform',
          `translate(${cur.tx[i].toFixed(2)},${cur.ty[i].toFixed(2)})`
        );
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Event Listeners con validación espacial
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Solo si el cursor está físicamente DENTRO de la tarjeta oscura:
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouseRef.current = { x, y };
        isAuto.current = false;
        lastMove.current = Date.now();
      } else {
        // Si sale hacia el formulario o fuera del panel, regresa automáticamente
        isAuto.current = true;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        ripplesRef.current.push({ x, y, born: Date.now() });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="hex-particles">
      <svg ref={svgRef} className="hex-particles-svg" />
    </div>
  );
}
