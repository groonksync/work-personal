import React, { useState, useMemo } from 'react';
import { 
  Zap, Check, Star, Calendar, Building2, 
  MoreVertical, ArrowUpRight, ShieldCheck, ChevronRight,
  Clock, DollarSign, User, Plus, HardDrive, MessageCircle,
  ExternalLink, ChevronLeft, AlertCircle
} from 'lucide-react';
import { obtenerCobrosPorDias, formatDate } from '../lib/amortizacion';

const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MobileStreamView({
  prestamos = [],
  currency = 'BOB',
  onSelectLoan,
  onOpenNewLoan,
  onPayCuota,
  onSendWhatsApp,
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  const hoy = new Date();
  const [selectedYear, setSelectedYear] = useState(hoy.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(hoy.getMonth());

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    setSelectedYear(hoy.getFullYear());
    setSelectedMonth(hoy.getMonth());
  };

  // Extraer cobros agrupados por día de forma matemática y cronológica
  const { dayColumns, totalMontoMes, totalCobrosCount, totalPendientes, totalPagados } = useMemo(() => {
    return obtenerCobrosPorDias(prestamos, {
      year: selectedYear,
      month: selectedMonth,
      filtroUrgencia: 'todos',
    });
  }, [prestamos, selectedYear, selectedMonth]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col bg-white dark:bg-[#212121] text-zinc-900 dark:text-[#ececec] rounded-2xl border border-zinc-200 dark:border-[#2e2e2e] shadow-xl overflow-hidden min-h-[700px] select-none transition-colors duration-150">
      
      {/* HEADER DE CONTROL Y NAVEGACIÓN */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-[#2e2e2e] bg-zinc-50 dark:bg-[#1a1a1a] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-[#8e8e8e] uppercase tracking-wider block">
              Flujo Cronológico Continuo
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              Flujo Diario de Cobros
            </h3>
          </div>

          <button 
            onClick={onOpenNewLoan}
            className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-[#f3f3f3] dark:hover:bg-white dark:text-black font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nuevo</span>
          </button>
        </div>

        {/* NAVEGADOR DE MES */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-200/70 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#2a2a2a] transition-all"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono px-1">
              {MESES_NOMBRES[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#2a2a2a] transition-all"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-[#2a2a2a] transition-all"
          >
            Hoy
          </button>
        </div>

        {/* RESUMEN RÁPIDO DE CAJA */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-lg bg-white dark:bg-[#262626] border border-zinc-200/60 dark:border-[#333]">
            <span className="text-[10px] text-zinc-400 dark:text-[#737373] block uppercase">Total Mes</span>
            <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
              {symbol} {totalMontoMes.toLocaleString()}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white dark:bg-[#262626] border border-zinc-200/60 dark:border-[#333]">
            <span className="text-[10px] text-zinc-400 dark:text-[#737373] block uppercase">Pendiente</span>
            <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
              {symbol} {totalPendientes.toLocaleString()}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white dark:bg-[#262626] border border-zinc-200/60 dark:border-[#333]">
            <span className="text-[10px] text-zinc-400 dark:text-[#737373] block uppercase">Cobrado</span>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {symbol} {totalPagados.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* STREAM VERTICAL DINÁMICO */}
      <div className="flex-1 p-5 overflow-y-auto custom-scroll space-y-6 relative bg-[#f7f7f8] dark:bg-[#212121] transition-colors duration-150">
        
        {/* LÍNEA GUÍA VERTICAL CONTINUA */}
        <div className="absolute left-[64px] top-6 bottom-6 w-[1.5px] bg-zinc-300 dark:bg-[#333333]" />

        {dayColumns.length === 0 ? (
          <div className="p-12 text-center space-y-3 relative z-10">
            <Calendar className="w-10 h-10 mx-auto text-zinc-400 dark:text-[#737373]" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Sin cobros programados para este mes
            </h4>
            <p className="text-xs text-zinc-500 dark:text-[#8e8e8e] max-w-xs mx-auto">
              Navega a otro mes o crea un nuevo préstamo para ver su flujo cronológico continuo.
            </p>
          </div>
        ) : (
          dayColumns.map((col) => {
            const isMultiple = col.items.length > 1;
            const todosCobrados = col.todosPagados;
            const tieneVencido = col.items.some(it => it.estado === 'vencido');

            return (
              <div key={col.fecha} className="flex items-start gap-3.5 relative z-10">
                {/* ETIQUETA LATERAL DE FECHA */}
                <div className="w-12 text-right pt-1 shrink-0">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block font-mono">
                    {col.diaNumero} {col.mesNombre.slice(0, 3)}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-[#737373] block">
                    {col.diaSemana}
                  </span>
                  {col.esHoy && (
                    <span className="inline-block mt-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                      HOY
                    </span>
                  )}
                </div>

                {/* NODO DE CRONOGRAMA */}
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-xs transition-colors border ${
                    todosCobrados
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : tieneVencido
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                        : col.esHoy
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent'
                          : 'bg-white dark:bg-[#2a2a2a] text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-[#3d3d3d]'
                  }`}
                >
                  {isMultiple ? col.items.length : todosCobrados ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Zap className="w-3.5 h-3.5" />}
                </div>

                {/* TARJETAS DE PERSONAS QUE PAGAN EN ESTE DÍA */}
                <div className="flex-1 space-y-2">
                  {col.items.map((item) => {
                    const { prestamo, cuota, pagado, mora, estado } = item;
                    const driveUrl = item.driveUrl || prestamo.drive_url || prestamo.drive_contrato;
                    const esDiario = prestamo.tipo_pago === 'diario';
                    const esAcreedor = item.tipo_prestamo === 'recibido';

                    return (
                      <div 
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2 shadow-xs group ${
                          pagado
                            ? 'bg-zinc-50/80 dark:bg-[#1f1f1f] border-zinc-200 dark:border-[#2a2a2a] opacity-85'
                            : estado === 'vencido'
                              ? 'bg-white dark:bg-[#262626] border-rose-300/80 dark:border-rose-900/60'
                              : 'bg-white dark:bg-[#262626] border-zinc-200 dark:border-[#333333] hover:border-zinc-300 dark:hover:border-[#444]'
                        }`}
                      >
                        {/* Cabecera de la tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div 
                            onClick={() => onSelectLoan && onSelectLoan(prestamo)}
                            className="cursor-pointer overflow-hidden flex-1"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate hover:underline">
                                {item.nombre}
                              </h4>
                              {esAcreedor && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                  Acreedor
                                </span>
                              )}
                              {esDiario && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  Diario
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-zinc-500 dark:text-[#a3a3a3] block mt-0.5">
                              {cuota.label} {item.telefono ? `• Tel: ${item.telefono}` : ''}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white block">
                              {symbol} {item.monto.toLocaleString()}
                            </span>
                            {pagado ? (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Pagado ✓
                              </span>
                            ) : mora > 0 ? (
                              <span className="text-[10px] font-mono text-rose-500 block">
                                +{symbol}{mora} mora
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-400 dark:text-[#737373]">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de acción rápida en la tarjeta */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#2e2e2e]">
                          <div className="flex items-center gap-1.5">
                            {onPayCuota && !pagado && (
                              <button
                                onClick={() => onPayCuota(prestamo, cuota)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-black font-semibold text-xs flex items-center gap-1 transition-all active:scale-[0.98]"
                              >
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Cobrar</span>
                              </button>
                            )}

                            {onSendWhatsApp && (
                              <button
                                onClick={() => onSendWhatsApp(prestamo, cuota)}
                                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a1a] dark:hover:bg-[#2c2c2c] text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-[#333] transition-all"
                                title="Enviar recordatorio por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {driveUrl && (
                              <a
                                href={driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a1a] dark:hover:bg-[#2c2c2c] text-sky-600 dark:text-sky-400 border border-zinc-200 dark:border-[#333] transition-all flex items-center gap-1"
                                title="Abrir expediente en Google Drive"
                              >
                                <HardDrive className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => onSelectLoan && onSelectLoan(prestamo)}
                            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center gap-0.5"
                          >
                            <span>Detalle</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

      </div>

    </div>
  );
}
