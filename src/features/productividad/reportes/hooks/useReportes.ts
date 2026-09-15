// src/features/productividad/reportes/hooks/useReportes.ts

import { useState, useEffect, useCallback } from 'react';
import { reportesService, type ReporteSLAFila, type ReporteEstimacionFila } from '../services/reportes.service';
import { notify } from '@/shared/lib/notify';

export interface UseReportesReturn {
  sla: ReporteSLAFila[];
  estimacion: ReporteEstimacionFila[];
  cargando: boolean;
  recargar: () => void;
}

export function useReportes(): UseReportesReturn {
  const [sla, setSla] = useState<ReporteSLAFila[]>([]);
  const [estimacion, setEstimacion] = useState<ReporteEstimacionFila[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [slaData, estimacionData] = await Promise.all([
        reportesService.sla(),
        reportesService.estimacion(),
      ]);
      setSla(slaData);
      setEstimacion(estimacionData);
    } catch {
      notify.error('No se pudieron cargar los reportes');
      setSla([]);
      setEstimacion([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { sla, estimacion, cargando, recargar: cargar };
}
