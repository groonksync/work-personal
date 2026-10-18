import React, { useState, useMemo } from 'react';
import { 
  Calendar, Users, Zap, Bell, Plus, Search, 
  Send, Check, ChevronRight, DollarSign, ArrowUpRight, 
  ArrowDownLeft, Clock, ShieldCheck, X, Sliders, Receipt, 
  MessageSquare, MessageCircle, Calculator, TrendingDown, Landmark, HardDrive, Sun, Moon
} from 'lucide-react';
import { obtenerCobrosPorDias } from '../lib/amortizacion';

export default function MobileAppView({
  prestamos = [],
  carpetas = [],
  alertas = [],
  currency = 'BOB',
  setCurrency,
  theme = 'dark',
  toggleTheme,
  onSelectLoan,
  onOpenNewLoan,
  onPayCuota,
  onSendWhatsApp,
  onOpenSettings,
  onOpenSimulator,
  onOpenExtension,
  onOpenVouchers,
  onOpenExpressNotes,
  onOpenCapitalPayment,
}) {
  const [mobileTab, setMobileTab] = useState('cronograma'); // 'cronograma' | 'clientes' | 'cobros' | 'avisos'
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'otorgados' | 'recibidos'
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Filtrado
  const filteredLoans = useMemo(() => {
    return prestamos.filter(p => {
      const tipo = p.tipo_prestamo || (p.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado');
      if (filtroTipo === 'otorgados' && tipo !== 'otorgado') return false;
      if (filtroTipo === 'recibidos' && tipo !== 'recibido') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.nombre?.toLowerCase().includes(q);
        const matchCI = p.ci?.toLowerCase().includes(q);
        const matchTel = p.telefono?.includes(q);
        if (!matchName && !matchCI && !matchTel) return false;
      }
      return true;
    });
  }, [prestamos, filtroTipo, searchQuery]);

  // Columnas dinámicas de cobros agrupadas por día para el cronograma móvil
  const dynamicDayColumns = useMemo(() => {
    const res = obtenerCobrosPorDias(filteredLoans, {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      searchQuery: searchQuery,
    });
    return res?.dayColumns || [];
  }, [filteredLoans, searchQuery]);

  const findLoan = (term) => prestamos.find(p => p.nombre?.toUpperCase().includes(term.toUpperCase())) || prestamos[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f7f8] text-[#171717] dark:bg-[#212121] dark:text-[#ececec] overflow-hidden select-none pb-[70px] transition-colors duration-150">
      
      {/* 1. CABECERA SUPERIOR MÓVIL (COMPACTA Y ERGONÓMICA) */}
      <header className="px-4 pt-3 pb-2.5 bg-white dark:bg-[#171717] border-b border-zinc-200 dark:border-[#262626] shrink-0 space-y-2.5 transition-colors duration-150">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-[#8e8e8e] uppercase tracking-wider block">
              Gestor Móvil
            </span>
            <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              {mobileTab === 'cronograma' && 'Cronograma Diario'}
              {mobileTab === 'clientes' && 'Cartera de Clientes'}
              {mobileTab === 'cobros' && 'Cobros Inmediatos'}
              {mobileTab === 'avisos' && 'Avisos y Vencimientos'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Selector de moneda rápido */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#333] text-xs font-mono text-zinc-900 dark:text-white px-2 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="BOB">Bs.</option>
              <option value="USD">$</option>
              <option value="PEN">S/</option>
            </select>

            {/* Toggle de Modo Claro / Noche */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-zinc-600 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all border border-zinc-200 dark:border-transparent"
                title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Noche'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-700" />
                )}
              </button>
            )}

            {/* Toggle Buscador */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-zinc-200 dark:border-transparent ${
                searchOpen 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' 
                  : 'bg-zinc-100 text-zinc-600 dark:bg-[#262626] dark:text-[#a3a3a3]'
              }`}
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Simulador Financiero */}
            {onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all border border-zinc-200 dark:border-transparent"
                title="Simulador de Préstamos"
              >
                <Calculator className="w-4 h-4" />
              </button>
            )}

            {/* Ajustes y Auditoría */}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-zinc-600 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all border border-zinc-200 dark:border-transparent"
              title="Ajustes"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Botón + Nuevo */}
            <button
              onClick={onOpenNewLoan}
              className="h-8 px-2.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>

        {/* Buscador Desplegable en Móvil */}
        {searchOpen && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-[#262626] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#383838] animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-zinc-500 dark:text-[#8e8e8e] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, CI o teléfono..."
              className="bg-transparent outline-none w-full text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#737373] text-xs"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Píldoras de Filtro Deslizable Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll no-scrollbar py-0.5">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filtroTipo === 'todos' 
                ? 'bg-zinc-900 text-white font-semibold dark:bg-[#333333] dark:text-white shadow-xs' 
                : 'bg-zinc-100 text-zinc-600 dark:bg-[#262626] dark:text-[#8e8e8e]'
            }`}
          >
            Todos ({prestamos.length})
          </button>

          <button
            onClick={() => setFiltroTipo('otorgados')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filtroTipo === 'otorgados' 
                ? 'bg-zinc-900 text-white font-semibold dark:bg-[#333333] dark:text-white shadow-xs' 
                : 'bg-zinc-100 text-zinc-600 dark:bg-[#262626] dark:text-[#8e8e8e]'
            }`}
          >
            Cobros ({prestamos.filter(p => (p.tipo_prestamo || 'otorgado') === 'otorgado').length})
          </button>

          <button
            onClick={() => setFiltroTipo('recibidos')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filtroTipo === 'recibidos' 
                ? 'bg-zinc-900 text-white font-semibold dark:bg-[#333333] dark:text-white shadow-xs' 
                : 'bg-zinc-100 text-zinc-600 dark:bg-[#262626] dark:text-[#8e8e8e]'
            }`}
          >
            Acreedores ({prestamos.filter(p => p.tipo_prestamo === 'recibido').length})
          </button>

          {alertas.length > 0 && (
            <button
              onClick={() => setMobileTab('avisos')}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1"
            >
              <Bell className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>{alertas.length} por vencer</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL MÓVIL SEGÚN PESTAÑA */}
      <main className="flex-1 overflow-y-auto custom-scroll p-4">
        
        {/* PESTAÑA A: CRONOGRAMA STREAM DINÁMICO POR DÍAS (100% REAL) */}
        {mobileTab === 'cronograma' && (
          <div className="space-y-4 relative">
            {dynamicDayColumns.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 dark:text-[#8e8e8e] space-y-2">
                <Calendar className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="font-semibold text-zinc-700 dark:text-[#ccc]">No hay cobros programados para este período</p>
                <p className="text-[11px]">Los nuevos préstamos y cuotas aparecerán aquí organizados por día.</p>
              </div>
            ) : (
              dynamicDayColumns.map((col) => (
                <div key={col.fecha} className="space-y-2">
                  {/* Encabezado del Día */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
                        {col.diaNumero} {col.mesNombre.slice(0, 3)}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold">
                        {col.diaSemana}
                      </span>
                      {col.esHoy && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                          HOY
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                      {symbol} {col.totalDia.toLocaleString()}
                    </span>
                  </div>

                  {/* Tarjetas de personas que pagan en este día */}
                  <div className="space-y-2">
                    {col.items.map((item) => {
                      const { prestamo, cuota, pagado, mora } = item;
                      const driveUrl = item.driveUrl || 'https://drive.google.com';

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                            pagado
                              ? 'bg-zinc-50/70 dark:bg-[#1a1a1a] border-zinc-200/60 dark:border-[#2a2a2a] opacity-80'
                              : cuota.estado === 'vencido'
                                ? 'bg-rose-50/30 dark:bg-[#251818] border-rose-200 dark:border-rose-950/60'
                                : 'bg-white dark:bg-[#262626] border-zinc-200 dark:border-[#333333] shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div 
                              onClick={() => onSelectLoan(prestamo)}
                              className="cursor-pointer overflow-hidden flex-1 pr-2"
                            >
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                {item.nombre}
                              </h4>
                              <span className="text-xs text-zinc-500 dark:text-[#a3a3a3] block mt-0.5 truncate">
                                {cuota.label} {item.ci ? `• CI: ${item.ci}` : ''}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white block">
                                {symbol} {item.monto.toLocaleString()}
                              </span>
                              {pagado ? (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  PAGADO ✓
                                </span>
                              ) : mora > 0 ? (
                                <span className="text-[10px] text-rose-500 font-mono">
                                  +{symbol}{mora} mora
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Botonera de acciones rápidas móviles */}
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#333333]">
                            <div className="flex items-center gap-1.5">
                              {onPayCuota && !pagado && (
                                <button
                                  onClick={() => onPayCuota(prestamo, cuota)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-xs flex items-center gap-1 shadow-2xs active:scale-95"
                                >
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>Cobrar</span>
                                </button>
                              )}

                              {onSendWhatsApp && (
                                <button
                                  onClick={() => onSendWhatsApp(prestamo, cuota)}
                                  className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-[#383838]"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <a
                                href={driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] text-sky-600 dark:text-sky-400 border border-zinc-200 dark:border-[#383838]"
                                title="Abrir Google Drive"
                              >
                                <HardDrive className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            <button
                              onClick={() => onSelectLoan(prestamo)}
                              className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center gap-0.5"
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PESTAÑA B: LISTA DE EXPEDIENTES / CLIENTES */}
        {mobileTab === 'clientes' && (
          <div className="space-y-3">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#303030] border border-zinc-200 dark:border-[#333333] transition-all cursor-pointer active:scale-[0.99] space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-[#212121] border border-zinc-200 dark:border-[#383838] flex items-center justify-center font-bold text-xs text-zinc-800 dark:text-white">
                      {loan.nombre.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white leading-none">
                        {loan.nombre}
                      </h4>
                      <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1 block">
                        CI: {loan.ci || 'Sin CI'} • Tel: {loan.telefono || 'Sin tel'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                    {symbol} {Number(loan.capital).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#333333] text-xs">
                  <div className="text-zinc-500 dark:text-[#a3a3a3]">
                    <span>Tasa: <strong className="text-zinc-900 dark:text-white">{loan.interes}%</strong></span>
                    {loan.fin && <span className="ml-2 font-mono text-[11px]">Vence: {loan.fin}</span>}
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenVouchers && onOpenVouchers(loan)}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#212121] hover:bg-zinc-200 dark:hover:bg-[#333] text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-[#383838]"
                      title="Vouchers"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenExpressNotes && onOpenExpressNotes(loan)}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-[#212121] hover:bg-zinc-200 dark:hover:bg-[#333] text-amber-500 dark:text-amber-400 border border-zinc-200 dark:border-[#383838]"
                      title="Notas Express"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSendWhatsApp && onSendWhatsApp({ nombre: loan.nombre, telefono: loan.telefono })}
                      className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-[#212121] hover:bg-zinc-200 dark:hover:bg-[#333] text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-zinc-200 dark:border-emerald-500/20"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => onSelectLoan(loan)}
                      className="px-2.5 py-1 rounded bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs shadow-2xs active:scale-95 transition-all"
                    >
                      Abonar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA C: COBROS INMEDIATOS */}
        {mobileTab === 'cobros' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] mb-4 shadow-xs">
              <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-bold block">Cobros del Período</span>
              <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white mt-0.5">
                {symbol} 23,220.00
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">9 cuotas activas programadas</span>
            </div>

            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] border border-zinc-200 dark:border-[#333333] flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-xs"
              >
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{loan.nombre}</h4>
                  <span className="text-xs text-zinc-500 dark:text-[#a3a3a3] font-mono">
                    Vencimiento: {loan.fin || 'Continuo'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-base font-mono font-bold text-zinc-900 dark:text-white">
                    {symbol} {Math.round(Number(loan.capital) * (Number(loan.interes || 10) / 100)).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Abonar →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA D: AVISOS Y VENCIMIENTOS */}
        {mobileTab === 'avisos' && (
          <div className="space-y-3">
            {alertas.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 dark:text-[#8e8e8e] space-y-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <span>No hay cuotas vencidas ni por vencer</span>
              </div>
            ) : (
              alertas.map((alerta, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] border border-amber-500/30 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        {alerta.labelTiempo}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{alerta.nombre}</h4>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-300">
                      {symbol} {alerta.montoCuota?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#333333] text-xs">
                    <span className="text-[11px] text-zinc-500 dark:text-[#a3a3a3] font-mono">
                      Vence: {alerta.fechaVencimiento}
                    </span>
                    <button
                      onClick={() => {
                        const l = prestamos.find(p => p.id === alerta.prestamoId);
                        if (l) onSelectLoan(l);
                      }}
                      className="px-3 py-1 rounded bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs shadow-2xs active:scale-95 transition-all"
                    >
                      Gestionar Cobro
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* 3. BARRA DE NAVEGACIÓN INFERIOR (BOTTOM DOCK ERGONÓMICO CON SAFE-AREA) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#171717] border-t border-zinc-200 dark:border-[#262626] px-4 py-2 pb-[env(safe-area-inset-bottom,12px)] flex justify-around items-center z-40 select-none shadow-2xl transition-colors duration-150">
        
        <button
          onClick={() => setMobileTab('cronograma')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
            mobileTab === 'cronograma' ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-400 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Cronograma</span>
        </button>

        <button
          onClick={() => setMobileTab('clientes')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
            mobileTab === 'clientes' ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-400 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => setMobileTab('cobros')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
            mobileTab === 'cobros' ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-400 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">Cobros</span>
        </button>

        <button
          onClick={() => setMobileTab('avisos')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all relative ${
            mobileTab === 'avisos' ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-400 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {alertas.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                {alertas.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Avisos</span>
        </button>

      </nav>

    </div>
  );
}
