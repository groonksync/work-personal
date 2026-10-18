import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, 
  Clock, ArrowRight, User, Phone, FileText, HardDrive, 
  MessageCircle, DollarSign, Filter, Search, X, Check, 
  AlertTriangle, Calculator, Download, ExternalLink,
  Layers, ArrowUpRight, ShieldCheck, Sparkles, TrendingUp
} from 'lucide-react';
import { obtenerCobrosPorDias, formatDate, toDate } from '../lib/amortizacion';

const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function TimelineNodesView({
  prestamos = [],
  currency = 'BOB',
  onSelectLoan,
  onOpenNewLoan,
  onPayCuota,
  onSendWhatsApp,
  onOpenReceipt,
  onOpenSimulator,
  onOpenExtension,
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Fecha actual y control del período
  const hoy = new Date();
  const [selectedYear, setSelectedYear] = useState(hoy.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(hoy.getMonth()); // 0-indexed
  const [calendarViewMode, setCalendarViewMode] = useState('columns'); // 'columns' | 'grid' | 'list'
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos'); // 'todos' | 'vencidos' | 'hoy' | 'semana' | 'pagados'
  const [searchInternal, setSearchInternal] = useState('');
  const [selectedDayFocus, setSelectedDayFocus] = useState(null);

  const containerRef = useRef(null);

  // Navegación de período
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
    setFiltroUrgencia('todos');
    setSelectedDayFocus(null);
  };

  // Obtener columnas de días agrupadas
  const dayColumns = useMemo(() => {
    return obtenerCobrosPorDias(prestamos, {
      year: selectedYear,
      month: selectedMonth,
      filtroUrgencia,
      searchQuery: searchInternal,
    });
  }, [prestamos, selectedYear, selectedMonth, filtroUrgencia, searchInternal]);

  // Resumen financiero del período visible
  const summaryKPIs = useMemo(() => {
    let totalMes = 0;
    let totalCobrado = 0;
    let totalPendiente = 0;
    let totalMora = 0;
    let cobrosHoy = 0;
    let personasHoy = 0;
    const hoyStr = formatDate(hoy);

    dayColumns.forEach(col => {
      totalMes += col.totalDia;
      totalCobrado += col.totalPagado;
      totalPendiente += col.totalPendiente;
      if (col.fecha === hoyStr) {
        cobrosHoy += col.totalPendiente;
        personasHoy += col.items.filter(it => !it.pagado).length;
      }
      col.items.forEach(it => {
        if (!it.pagado && it.mora > 0) {
          totalMora += it.mora;
        }
      });
    });

    return {
      totalMes,
      totalCobrado,
      totalPendiente,
      totalMora,
      cobrosHoy,
      personasHoy,
      totalDiasConCobros: dayColumns.length,
      porcentajeCobrado: totalMes > 0 ? Math.round((totalCobrado / totalMes) * 100) : 0,
    };
  }, [dayColumns]);

  // Desplazamiento automático al día de hoy si está visible
  useEffect(() => {
    if (containerRef.current && calendarViewMode === 'columns') {
      const todayCol = containerRef.current.querySelector('[data-is-today="true"]');
      if (todayCol) {
        todayCol.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedMonth, selectedYear, calendarViewMode]);

  // Copiar al portapapeles agenda de cobros
  const handleCopyAgenda = () => {
    if (!dayColumns.length) return alert('No hay cobros para exportar en este período.');
    let texto = `*AGENDA DE COBROS — ${MESES_NOMBRES[selectedMonth].toUpperCase()} ${selectedYear}*\n\n`;
    dayColumns.forEach(col => {
      texto += `📅 *${col.diaSemana} ${col.diaNumero} ${col.mesNombre}* (Total: ${symbol} ${col.totalDia.toLocaleString()})\n`;
      col.items.forEach(it => {
        const estadoTag = it.pagado ? '✅ PAGADO' : it.estado === 'vencido' ? `⚠️ VENCIDO (+${it.mora} mora)` : '⏳ PENDIENTE';
        texto += `  • ${it.nombre} — ${symbol} ${it.monto.toLocaleString()} [${estadoTag}]\n`;
      });
      texto += `\n`;
    });

    navigator.clipboard.writeText(texto);
    alert('Agenda de cobros copiada al portapapeles para WhatsApp o notas.');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f7f8] dark:bg-[#212121] overflow-hidden select-none text-[#171717] dark:text-[#ececec] transition-colors duration-150">
      
      {/* 1. BARRA SUPERIOR DE CONTROL DEL CALENDARIO (ESTILO CHATGPT / KODEX) */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-[#2a2a2a] flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#212121] shrink-0 transition-colors duration-150">
        
        {/* Navegador de Mes y Año */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-[#2f2f2f] rounded-xl p-1 text-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-zinc-600 dark:text-[#a3a3a3] hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#282828] transition-all"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold px-2.5 text-zinc-900 dark:text-white font-mono text-xs min-w-[125px] text-center">
              {MESES_NOMBRES[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-zinc-600 dark:text-[#a3a3a3] hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#282828] transition-all"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] border border-zinc-200 dark:border-[#383838] text-zinc-800 dark:text-[#ececec] transition-all active:scale-[0.98]"
          >
            Hoy
          </button>
        </div>

        {/* Selector de Modo de Vista Segmentado */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-zinc-100 dark:bg-[#171717] border border-zinc-200 dark:border-[#2f2f2f] rounded-xl flex gap-1 text-xs">
            <button
              onClick={() => setCalendarViewMode('columns')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                calendarViewMode === 'columns'
                  ? 'bg-white dark:bg-[#2a2a2a] text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-[#8e8e8e] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Columnas por Día
            </button>
            <button
              onClick={() => setCalendarViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                calendarViewMode === 'grid'
                  ? 'bg-white dark:bg-[#2a2a2a] text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-[#8e8e8e] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Matriz Calendario
            </button>
            <button
              onClick={() => setCalendarViewMode('list')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                calendarViewMode === 'list'
                  ? 'bg-white dark:bg-[#2a2a2a] text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-[#8e8e8e] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Lista Cronológica
            </button>
          </div>

          {/* Botón rápido para abrir Simulador */}
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="h-8 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] border border-zinc-200 dark:border-[#383838] text-xs font-semibold text-zinc-800 dark:text-[#ececec] flex items-center gap-1.5 transition-all shadow-xs"
              title="Abrir Simulador Financiero"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Simulador</span>
            </button>
          )}

          {/* Botón de exportar agenda */}
          <button
            onClick={handleCopyAgenda}
            className="h-8 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] border border-zinc-200 dark:border-[#383838] text-xs font-semibold text-zinc-800 dark:text-[#ececec] flex items-center gap-1.5 transition-all shadow-xs"
            title="Copiar Agenda de Cobros"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>

      </div>

      {/* 2. CHIPS DE FILTRO RÁPIDO & RESUMEN DE COBRANZAS */}
      <div className="px-6 py-2.5 border-b border-zinc-200 dark:border-[#2a2a2a] flex flex-wrap items-center justify-between gap-3 bg-zinc-50/70 dark:bg-[#1a1a1a] shrink-0 text-xs">
        
        {/* Chips de Urgencia */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'todos', label: 'Todos los Días' },
            { id: 'hoy', label: 'Vence Hoy' },
            { id: 'semana', label: 'Esta Semana' },
            { id: 'vencidos', label: 'En Mora / Vencidos' },
            { id: 'pagados', label: 'Solo Pagados' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroUrgencia(f.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                filtroUrgencia === f.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#262626] text-zinc-600 dark:text-[#a3a3a3] border-zinc-200 dark:border-[#383838] hover:bg-zinc-100 dark:hover:bg-[#303030]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* KPIs de Liquidez en Cápsulas */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-zinc-600 dark:text-[#a3a3a3]">
            <span>Mes:</span>
            <strong className="text-zinc-900 dark:text-white font-bold">{symbol} {summaryKPIs.totalMes.toLocaleString()}</strong>
          </div>
          <span className="text-zinc-300 dark:text-[#444]">•</span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span>Cobrado:</span>
            <strong className="font-bold">{symbol} {summaryKPIs.totalCobrado.toLocaleString()} ({summaryKPIs.porcentajeCobrado}%)</strong>
          </div>
          <span className="text-zinc-300 dark:text-[#444]">•</span>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <span>Pendiente:</span>
            <strong className="font-bold">{symbol} {summaryKPIs.totalPendiente.toLocaleString()}</strong>
          </div>
          {summaryKPIs.totalMora > 0 && (
            <>
              <span className="text-zinc-300 dark:text-[#444]">•</span>
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span>Mora:</span>
                <strong className="font-bold">+{symbol} {summaryKPIs.totalMora.toLocaleString()}</strong>
              </div>
            </>
          )}
        </div>

      </div>

      {/* 3. LIENZO PRINCIPAL SEGÚN MODO DE VISTA SELECCIONADO */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        
        {/* ========================================================================= */}
        {/* VISTA 1: COLUMNAS POR DÍA (AGENDA KANBAN REQUERIDA POR EL USUARIO)        */}
        {/* ========================================================================= */}
        {calendarViewMode === 'columns' && (
          <div 
            ref={containerRef}
            className="flex-1 overflow-x-auto overflow-y-auto custom-scroll p-6 flex gap-4 items-start bg-[#f7f7f8] dark:bg-[#212121]"
          >
            {dayColumns.length === 0 ? (
              <div className="m-auto text-center p-12 max-w-md space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] flex items-center justify-center mx-auto text-zinc-400">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  No hay cobros registrados para este filtro
                </h4>
                <p className="text-xs text-zinc-500 dark:text-[#8e8e8e] leading-relaxed">
                  Cambia de mes o ajusta los filtros de urgencia para ver los vencimientos programados.
                </p>
                <button
                  onClick={handleGoToday}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs"
                >
                  Ir al mes actual
                </button>
              </div>
            ) : (
              dayColumns.map(col => {
                const pctPagado = col.totalDia > 0 ? Math.round((col.totalPagado / col.totalDia) * 100) : 0;

                return (
                  <div
                    key={col.fecha}
                    data-is-today={col.esHoy ? 'true' : 'false'}
                    className={`w-72 shrink-0 flex flex-col rounded-2xl border transition-all duration-200 max-h-full ${
                      col.esHoy
                        ? 'bg-white dark:bg-[#242424] border-zinc-400 dark:border-zinc-500 ring-2 ring-zinc-400/20 dark:ring-white/10 shadow-md'
                        : col.esPasado && col.totalPendiente > 0
                          ? 'bg-white dark:bg-[#212121] border-rose-300 dark:border-rose-900/50 shadow-xs'
                          : 'bg-white dark:bg-[#212121] border-zinc-200 dark:border-[#2f2f2f] shadow-xs'
                    }`}
                  >
                    {/* Cabecera de la Columna del Día */}
                    <div className="p-3.5 border-b border-zinc-100 dark:border-[#2e2e2e] space-y-2 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold font-mono ${
                            col.esHoy 
                              ? 'text-zinc-900 dark:text-white' 
                              : 'text-zinc-800 dark:text-[#e0e0e0]'
                          }`}>
                            {col.diaNumero}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider block leading-none">
                              {col.diaSemana}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-[#777] block mt-0.5">
                              {col.mesNombre}
                            </span>
                          </div>
                        </div>

                        {/* Badge de Estado del Día */}
                        {col.esHoy ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs">
                            HOY
                          </span>
                        ) : col.esManana ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Mañana
                          </span>
                        ) : col.esPasado && col.totalPendiente > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300">
                            En Mora
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-[#888]">
                            {col.items.length} {col.items.length === 1 ? 'cobro' : 'cobros'}
                          </span>
                        )}
                      </div>

                      {/* Monto Total a Cobrar en este Día */}
                      <div className="flex items-baseline justify-between pt-0.5">
                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                          {symbol} {col.totalDia.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-[#999]">
                          {col.pagadosCount}/{col.cobrosCount} pagados
                        </span>
                      </div>

                      {/* Mini barra de progreso del día */}
                      <div className="w-full h-1 bg-zinc-100 dark:bg-[#191919] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${pctPagado}%` }}
                        />
                      </div>
                    </div>

                    {/* Lista de Tarjetas de Personas que Deben Pagar en este Día */}
                    <div className="p-2.5 space-y-2.5 overflow-y-auto custom-scroll flex-1">
                      {col.items.map(item => {
                        const { prestamo, cuota, pagado, mora, diasAtraso } = item;
                        const esAcreedor = item.tipo_prestamo === 'recibido';
                        const driveUrl = item.driveUrl || 'https://drive.google.com';

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border transition-all duration-150 space-y-2 ${
                              pagado
                                ? 'bg-zinc-50/70 dark:bg-[#1a1a1a] border-zinc-200/60 dark:border-[#2a2a2a] opacity-75'
                                : cuota.estado === 'vencido'
                                  ? 'bg-rose-50/40 dark:bg-[#251818] border-rose-200 dark:border-rose-950/60 hover:border-rose-300'
                                  : 'bg-white dark:bg-[#282828] border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] shadow-2xs'
                            }`}
                          >
                            {/* Nombre del deudor y badge de tipo */}
                            <div className="flex items-start justify-between gap-1.5">
                              <div 
                                onClick={() => onSelectLoan && onSelectLoan(prestamo)}
                                className="cursor-pointer hover:underline overflow-hidden"
                              >
                                <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                  {item.nombre}
                                </h4>
                                <span className="text-[10px] text-zinc-400 dark:text-[#888] block truncate">
                                  {esAcreedor ? 'Acreedor' : item.ci ? `CI: ${item.ci}` : item.label}
                                </span>
                              </div>

                              {pagado ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                  <span>PAGADO</span>
                                </span>
                              ) : cuota.estado === 'vencido' ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
                                  +{diasAtraso}d
                                </span>
                              ) : null}
                            </div>

                            {/* Monto de la cuota y detalles */}
                            <div className="flex items-baseline justify-between pt-0.5">
                              <div>
                                <span className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                                  {symbol} {item.monto.toLocaleString()}
                                </span>
                                {mora > 0 && !pagado && (
                                  <span className="text-[10px] text-rose-500 font-mono block">
                                    + {symbol}{mora} mora
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-500 dark:text-[#999] font-mono">
                                {cuota.label}
                              </span>
                            </div>

                            {/* BOTONERA DE ACCIÓN RÁPIDA (PAGAR / WHATSAPP / DRIVE / RECIBO / INSPECCIONAR) */}
                            <div className="pt-2 border-t border-zinc-100 dark:border-[#333] flex items-center justify-between gap-1 text-xs">
                              
                              <div className="flex items-center gap-1">
                                {/* Botón 1-Clic Pagar / Desmarcar */}
                                {onPayCuota && (
                                  <button
                                    onClick={() => onPayCuota(prestamo, cuota)}
                                    disabled={pagado}
                                    className={`h-7 px-2 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                                      pagado
                                        ? 'text-zinc-400 bg-zinc-100 dark:bg-[#202020] cursor-default'
                                        : 'bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 active:scale-[0.97]'
                                    }`}
                                    title={pagado ? 'Cuota ya cancelada' : 'Abonar cuota en 1 clic'}
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>{pagado ? 'Cobrado' : 'Cobrar'}</span>
                                  </button>
                                )}

                                {/* Botón WhatsApp Inteligente */}
                                {onSendWhatsApp && (
                                  <button
                                    onClick={() => onSendWhatsApp(prestamo, cuota)}
                                    className="h-7 w-7 rounded-lg bg-zinc-100 hover:bg-emerald-50 dark:bg-[#1f1f1f] dark:hover:bg-[#263328] text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-[#383838] flex items-center justify-center transition-all shadow-2xs"
                                    title="Enviar aviso por WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Botón Google Drive Directo */}
                                <a
                                  href={driveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 w-7 rounded-lg bg-zinc-100 hover:bg-sky-50 dark:bg-[#1f1f1f] dark:hover:bg-[#1b2b38] text-sky-600 dark:text-sky-400 border border-zinc-200 dark:border-[#383838] flex items-center justify-center transition-all shadow-2xs"
                                  title="Abrir contrato o carpeta en Google Drive"
                                >
                                  <HardDrive className="w-3.5 h-3.5" />
                                </a>

                                {/* Botón Recibo (si está pagado) */}
                                {pagado && onOpenReceipt && (
                                  <button
                                    onClick={() => onOpenReceipt({ nombre: item.nombre, ci: item.ci }, prestamo, cuota)}
                                    className="h-7 w-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1f1f1f] dark:hover:bg-[#333] text-zinc-700 dark:text-[#ccc] border border-zinc-200 dark:border-[#383838] flex items-center justify-center transition-all shadow-2xs"
                                    title="Ver o imprimir recibo digital"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Abrir expediente / Inspector */}
                              <button
                                onClick={() => onSelectLoan && onSelectLoan(prestamo)}
                                className="h-7 px-2 rounded-lg text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-[#888] dark:hover:text-white flex items-center gap-0.5 hover:bg-zinc-100 dark:hover:bg-[#333] transition-all"
                                title="Ver detalles y expediente completo"
                              >
                                <span>Ver</span>
                                <ChevronRight className="w-3 h-3" />
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
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: MATRIZ DE CALENDARIO MENSUAL (7 COLUMNAS LUNES A DOMINGO)       */}
        {/* ========================================================================= */}
        {calendarViewMode === 'grid' && (
          <div className="flex-1 overflow-y-auto custom-scroll p-6 bg-[#f7f7f8] dark:bg-[#212121]">
            <div className="max-w-6xl mx-auto space-y-4">
              
              {/* Encabezado de Días de la Semana */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 dark:text-[#888] pb-1 uppercase tracking-wider">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Matriz de Días del Mes */}
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const primerDiaMes = new Date(selectedYear, selectedMonth, 1);
                  const ultimoDiaMes = new Date(selectedYear, selectedMonth + 1, 0);
                  const totalDias = ultimoDiaMes.getDate();
                  
                  // Día de la semana del 1er día (ajustar a Lunes = 0)
                  let startDay = primerDiaMes.getDay() - 1;
                  if (startDay === -1) startDay = 6; // Domingo

                  const celdas = [];
                  // Espacios vacíos previos
                  for (let i = 0; i < startDay; i++) {
                    celdas.push(
                      <div key={`empty-${i}`} className="min-h-[105px] rounded-xl bg-zinc-100/40 dark:bg-[#1a1a1a]/40 border border-transparent" />
                    );
                  }

                  // Días del mes
                  const colMap = {};
                  dayColumns.forEach(c => { colMap[c.diaNumero] = c; });

                  for (let d = 1; d <= totalDias; d++) {
                    const col = colMap[d];
                    const fechaActualStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const esHoy = fechaActualStr === formatDate(hoy);

                    celdas.push(
                      <div
                        key={`day-${d}`}
                        onClick={() => col && setSelectedDayFocus(col)}
                        className={`min-h-[105px] p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                          esHoy
                            ? 'bg-white dark:bg-[#282828] border-zinc-900 dark:border-white ring-1 ring-zinc-900 dark:ring-white shadow-sm'
                            : col
                              ? 'bg-white dark:bg-[#242424] border-zinc-200 dark:border-[#333] hover:border-zinc-400 dark:hover:border-[#555] shadow-2xs'
                              : 'bg-zinc-50/70 dark:bg-[#1c1c1c] border-zinc-200/50 dark:border-[#2a2a2a] text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold font-mono ${
                            esHoy ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-[#bbb]'
                          }`}>
                            {d}
                          </span>
                          {esHoy && (
                            <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                          )}
                          {col && !esHoy && (
                            <span className="text-[10px] font-mono text-zinc-400">
                              {col.items.length}
                            </span>
                          )}
                        </div>

                        {col ? (
                          <div className="space-y-1 my-1">
                            <span className="text-[11px] font-mono font-bold text-zinc-900 dark:text-white block">
                              {symbol} {col.totalDia.toLocaleString()}
                            </span>
                            <div className="space-y-0.5">
                              {col.items.slice(0, 2).map(it => (
                                <div 
                                  key={it.id} 
                                  className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium ${
                                    it.pagado 
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : it.estado === 'vencido'
                                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                        : 'bg-zinc-100 dark:bg-[#333] text-zinc-800 dark:text-[#ddd]'
                                  }`}
                                >
                                  {it.nombre.split(' ')[0]} • {symbol}{it.monto}
                                </div>
                              ))}
                              {col.items.length > 2 && (
                                <span className="text-[9px] text-zinc-400 block pl-1">
                                  +{col.items.length - 2} más
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1" />
                        )}

                        <div className="text-[9px] font-mono text-zinc-400 text-right">
                          {col ? `${col.pagadosCount}/${col.cobrosCount}` : ''}
                        </div>
                      </div>
                    );
                  }

                  return celdas;
                })()}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: LISTA CRONOLÓGICA DE COBROS (HIGH DENSITY STREAM)                 */}
        {/* ========================================================================= */}
        {calendarViewMode === 'list' && (
          <div className="flex-1 overflow-y-auto custom-scroll p-6 bg-[#f7f7f8] dark:bg-[#212121]">
            <div className="max-w-4xl mx-auto space-y-4">
              {dayColumns.map(col => (
                <div 
                  key={col.fecha}
                  className="p-4 rounded-2xl bg-white dark:bg-[#242424] border border-zinc-200 dark:border-[#333] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#2f2f2f]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        {col.diaSemana} {col.diaNumero} de {col.mesNombre}
                      </span>
                      {col.esHoy && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                          HOY
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                      Total: {symbol} {col.totalDia.toLocaleString()}
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-[#2e2e2e]">
                    {col.items.map(it => (
                      <div key={it.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <h5 className="font-semibold text-zinc-900 dark:text-white">
                            {it.nombre}
                          </h5>
                          <span className="text-[11px] text-zinc-500 dark:text-[#888]">
                            {it.label} {it.ci ? `• CI: ${it.ci}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">
                            {symbol} {it.monto.toLocaleString()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {onPayCuota && !it.pagado && (
                              <button
                                onClick={() => onPayCuota(it.prestamo, it.cuota)}
                                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold"
                              >
                                Cobrar
                              </button>
                            )}
                            {it.pagado && (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Pagado ✓
                              </span>
                            )}
                            {onSendWhatsApp && (
                              <button
                                onClick={() => onSendWhatsApp(it.prestamo, it.cuota)}
                                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#333] text-emerald-600 dark:text-emerald-400"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={it.driveUrl || 'https://drive.google.com'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#333] text-sky-600 dark:text-sky-400"
                              title="Google Drive"
                            >
                              <HardDrive className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => onSelectLoan && onSelectLoan(it.prestamo)}
                              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#333] text-zinc-700 dark:text-white"
                              title="Inspeccionar"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
