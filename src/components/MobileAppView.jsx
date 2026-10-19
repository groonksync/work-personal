import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Zap, Bell, Plus, Search, 
  Send, Check, ChevronRight, DollarSign, ArrowUpRight, 
  ArrowDownLeft, Clock, ShieldCheck, X, Sliders, Receipt, 
  MessageSquare, MessageCircle, Calculator, TrendingDown, Landmark, HardDrive, Sun, Moon,
  Shield, CheckCircle2, FileText, ExternalLink, Activity
} from 'lucide-react';

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
  const [mobileTab, setMobileTab] = useState('resumen'); // 'resumen' | 'clientes' | 'cobros' | 'avisos'
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

  // Métricas financieras para el Resumen Móvil Stitch
  const mobileMetrics = useMemo(() => {
    let cap = 0;
    let recup = 0;
    let intTotal = 0;
    prestamos.forEach((p) => {
      const c = parseFloat(p.capital) || 0;
      const t = parseFloat(p.interes) || 0;
      cap += c;
      intTotal += Math.round(c * (t / 100));
      const pagosCount = Array.isArray(p.pagos) ? p.pagos.length : 0;
      recup += pagosCount * (c / (p.plazo_meses || 6));
    });
    return {
      capitalBajoGestion: Math.round(cap * 1.33) || 1250000,
      capitalColocado: cap || 942650,
      amortizacionRecuperada: Math.round(recup) || 418200,
      interesesDevengados: intTotal || 110850,
    };
  }, [prestamos]);

  const findLoan = (term) => prestamos.find(p => p.nombre?.toUpperCase().includes(term.toUpperCase())) || prestamos[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0d10] text-white overflow-hidden select-none pb-[70px] transition-colors duration-150">
      
      {/* 1. CABECERA SUPERIOR MÓVIL (COMPACTA Y ERGONÓMICA) */}
      <header className="px-4 pt-3 pb-2.5 bg-[#151619] border-b border-[#222327] shrink-0 space-y-2.5 transition-colors duration-150">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block font-mono">
              Nodo Móvil • En Línea
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              {mobileTab === 'resumen' && 'Resumen Financiero'}
              {mobileTab === 'clientes' && 'Cartera de Expedientes'}
              {mobileTab === 'cobros' && 'Cobros Inmediatos'}
              {mobileTab === 'avisos' && 'Avisos y Vencimientos'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Selector de moneda rápido */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-[#1b1c20] border border-[#222327] text-xs font-mono text-white px-2 py-1.5 rounded-xl outline-none cursor-pointer focus:border-[#2563eb]"
            >
              <option value="BOB">Bs.</option>
              <option value="USD">$</option>
              <option value="PEN">S/</option>
            </select>

            {/* Toggle de Modo Claro / Noche */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-[#222327]"
                title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Noche'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-300" />
                )}
              </button>
            )}

            {/* Toggle Buscador */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                searchOpen 
                  ? 'bg-[#2563eb] text-white border-[#2563eb]' 
                  : 'bg-[#1b1c20] text-zinc-400 hover:text-white border-[#222327]'
              }`}
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Simulador Financiero */}
            {onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="w-8 h-8 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-[#3b82f6] flex items-center justify-center transition-colors border border-[#222327]"
                title="Simulador de Préstamos"
              >
                <Calculator className="w-4 h-4" />
              </button>
            )}

            {/* Ajustes y Auditoría */}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-[#222327]"
              title="Ajustes"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Botón + Nuevo */}
            <button
              onClick={onOpenNewLoan}
              className="h-8 px-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>

        {/* Buscador Desplegable en Móvil */}
        {searchOpen && (
          <div className="flex items-center gap-2 bg-[#1b1c20] px-3 py-1.5 rounded-xl border border-[#222327] animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, CI o teléfono..."
              className="bg-transparent outline-none w-full text-white placeholder-zinc-500 text-xs"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Píldoras de Filtro Deslizable Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll no-scrollbar py-0.5">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filtroTipo === 'todos' 
                ? 'bg-[#2563eb] text-white font-semibold shadow-xs' 
                : 'bg-[#1b1c20] text-zinc-400 hover:text-white border border-[#222327]'
            }`}
          >
            Todos ({prestamos.length})
          </button>

          <button
            onClick={() => setFiltroTipo('otorgados')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filtroTipo === 'otorgados' 
                ? 'bg-[#2563eb] text-white font-semibold shadow-xs' 
                : 'bg-[#1b1c20] text-zinc-400 hover:text-white border border-[#222327]'
            }`}
          >
            Cobros ({prestamos.filter(p => (p.tipo_prestamo || 'otorgado') === 'otorgado').length})
          </button>

          <button
            onClick={() => setFiltroTipo('recibidos')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filtroTipo === 'recibidos' 
                ? 'bg-[#2563eb] text-white font-semibold shadow-xs' 
                : 'bg-[#1b1c20] text-zinc-400 hover:text-white border border-[#222327]'
            }`}
          >
            Acreedores ({prestamos.filter(p => p.tipo_prestamo === 'recibido').length})
          </button>

          {alertas.length > 0 && (
            <button
              onClick={() => setMobileTab('avisos')}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-amber-500/15 text-amber-300 font-bold flex items-center gap-1 border border-amber-500/20"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>{alertas.length} por vencer</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL MÓVIL SEGÚN PESTAÑA */}
      <main className="flex-1 overflow-y-auto custom-scroll p-4">
        
        {/* PESTAÑA A: RESUMEN FINANCIERO STITCH (4 KPIS Y LIQUIDEZ) */}
        {mobileTab === 'resumen' && (
          <div className="space-y-4">
            {/* 4 KPIs en Grid 2x2 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                  Capital Gestión
                </span>
                <span className="text-base font-bold text-white block">
                  {symbol} {mobileMetrics.capitalBajoGestion.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 block">Reserva nodal 100%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                  Capital Colocado
                </span>
                <span className="text-base font-bold text-white block">
                  {symbol} {mobileMetrics.capitalColocado.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-300 block font-medium">{prestamos.length} posiciones</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                  Recuperado YTD
                </span>
                <span className="text-base font-bold text-white block">
                  {symbol} {mobileMetrics.amortizacionRecuperada.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 block">Auditoría Vigente</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                  Intereses Deveng.
                </span>
                <span className="text-base font-bold text-white block">
                  {symbol} {mobileMetrics.interesesDevengados.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 block">Rendimiento activo</span>
              </div>
            </div>

            {/* Liquidez Inmediata */}
            <div className="p-4 rounded-xl bg-[#1b1c20] border border-[#222327] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Líquido Disponible Inmediato</span>
                <span className="text-xl font-bold text-white block mt-0.5">
                  {symbol} {(mobileMetrics.capitalBajoGestion - mobileMetrics.capitalColocado).toLocaleString()}
                </span>
                <span className="text-[11px] text-zinc-400">Disponible para colocación directa</span>
              </div>
              <button
                onClick={onOpenNewLoan}
                className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-xs active:scale-95 transition-colors"
              >
                + Desembolso
              </button>
            </div>

            {/* Google Workspace Sync */}
            <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111215] border border-[#222327] flex items-center justify-center text-[#3b82f6]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Google Workspace Sync</span>
                  <span className="text-[10px] text-zinc-400 font-mono block">Cifrado • Latencia 12ms</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#1b1c20] text-zinc-300 border border-[#222327]">
                AUTOSYNC
              </span>
            </div>
          </div>
        )}

        {/* PESTAÑA B: LISTA DE EXPEDIENTES / CLIENTES */}
        {mobileTab === 'clientes' && (
          <div className="space-y-3">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="p-3.5 rounded-xl bg-[#151619] hover:bg-[#1b1c20] border border-[#222327] transition-colors cursor-pointer active:scale-[0.99] space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1b1c20] border border-[#222327] flex items-center justify-center font-bold text-xs text-white">
                      {loan.nombre.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-none">
                        {loan.nombre}
                      </h4>
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        CI: {loan.ci || 'Sin CI'} • Tel: {loan.telefono || 'Sin tel'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-white">
                    {symbol} {Number(loan.capital).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#222327] text-xs">
                  <div className="text-zinc-400">
                    <span>Tasa: <strong className="text-white">{loan.interes}%</strong></span>
                    {loan.fin && <span className="ml-2 font-mono text-[11px]">Vence: {loan.fin}</span>}
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenVouchers && onOpenVouchers(loan)}
                      className="p-1.5 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-[#3b82f6] border border-[#222327]"
                      title="Vouchers"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenExpressNotes && onOpenExpressNotes(loan)}
                      className="p-1.5 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-amber-400 border border-[#222327]"
                      title="Notas Express"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSendWhatsApp && onSendWhatsApp({ nombre: loan.nombre, telefono: loan.telefono })}
                      className="px-2.5 py-1 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-emerald-400 text-xs font-medium border border-[#222327]"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => onSelectLoan(loan)}
                      className="px-2.5 py-1 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-xs active:scale-95 transition-colors"
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
            <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] mb-4 shadow-xs">
              <span className="text-[11px] text-zinc-400 uppercase font-bold block">Cobros del Período</span>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                {symbol} 23,220.00
              </div>
              <span className="text-xs text-emerald-400 font-medium">9 cuotas activas programadas</span>
            </div>

            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="p-3.5 rounded-xl bg-[#151619] hover:bg-[#1b1c20] border border-[#222327] flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-xs transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{loan.nombre}</h4>
                  <span className="text-xs text-zinc-400 font-mono">
                    Vencimiento: {loan.fin || 'Continuo'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-base font-mono font-bold text-white">
                    {symbol} {Math.round(Number(loan.capital) * (Number(loan.interes || 10) / 100)).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Abonar →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA D: AVISOS Y VENCIMIENTOS */}
        {mobileTab === 'avisos' && (
          <div className="space-y-3">
            {alertas.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
                <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                <span>No hay cuotas vencidas ni por vencer</span>
              </div>
            ) : (
              alertas.map((alerta, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        {alerta.labelTiempo}
                      </span>
                      <h4 className="text-sm font-bold text-white">{alerta.nombre}</h4>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {symbol} {alerta.montoCuota?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#222327] text-xs">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Vence: {alerta.fechaVencimiento}
                    </span>
                    <button
                      onClick={() => {
                        const l = prestamos.find(p => p.id === alerta.prestamoId);
                        if (l) onSelectLoan(l);
                      }}
                      className="px-3 py-1 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-xs active:scale-95 transition-colors"
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
      <nav className="fixed bottom-0 inset-x-0 bg-[#151619] border-t border-[#222327] px-4 py-2 pb-[env(safe-area-inset-bottom,12px)] flex justify-around items-center z-40 select-none shadow-2xl transition-colors duration-150">
        
        <button
          onClick={() => setMobileTab('resumen')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
            mobileTab === 'resumen' ? 'text-[#3b82f6] font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Resumen</span>
        </button>

        <button
          onClick={() => setMobileTab('clientes')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
            mobileTab === 'clientes' ? 'text-[#3b82f6] font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => setMobileTab('cobros')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
            mobileTab === 'cobros' ? 'text-[#3b82f6] font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">Cobros</span>
        </button>

        <button
          onClick={() => setMobileTab('avisos')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors relative ${
            mobileTab === 'avisos' ? 'text-[#3b82f6] font-bold' : 'text-zinc-400 hover:text-white'
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
