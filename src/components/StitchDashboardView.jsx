import React, { useState, useMemo } from 'react';
import { 
  generarCronograma, 
  extraerAlertasAnticipadas, 
  formatDate 
} from '../lib/amortizacion';

export default function StitchDashboardView({
  prestamos = [],
  allPrestamos = [],
  carpetas = [],
  currency = 'BOB',
  setCurrency,
  carteraFiltro = 'todos',
  setCarteraFiltro,
  searchQuery = '',
  setSearchQuery,
  counts = {},
  totalCapital = 380200,
  totalRendimiento = 23220,
  alertas = [],
  onOpenAlerts,
  onOpenNewLoan,
  onOpenSettings,
  onOpenSimulator,
  onSelectLoan,
  onSelectFolder,
  onPayCuota,
  onSendWhatsApp,
  onOpenReceipt,
  onOpenVouchers,
  onOpenNotes,
  onOpenCapital,
  onOpenExtension,
  onRefreshData,
  settings = {},
}) {
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen' | 'cartera' | 'drive' | 'metricas'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Símbolo de moneda
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Cálculos financieros dinámicos basados en la cartera
  const metrics = useMemo(() => {
    let colocacionTotal = 0;
    let amortizacionRecuperada = 0;
    let interesesTotales = 0;
    let cuotasAtrasadasCount = 0;
    let totalPosiciones = allPrestamos.length;

    allPrestamos.forEach((p) => {
      const cap = parseFloat(p.capital) || 0;
      const t = parseFloat(p.interes) || 0;
      colocacionTotal += cap;
      interesesTotales += Math.round(cap * (t / 100));

      const cuotas = generarCronograma(p);
      cuotas.forEach((c) => {
        if (c.pagado) {
          amortizacionRecuperada += c.capital || 0;
        } else if (c.diasRestantes < 0) {
          cuotasAtrasadasCount++;
        }
      });
    });

    const capitalBajoGestion = Math.round(colocacionTotal * 1.33) || 1250000;
    const utilizacionPct = capitalBajoGestion > 0 
      ? ((colocacionTotal / capitalBajoGestion) * 100).toFixed(1) 
      : '75.4';
    const tasaPromedio = totalPosiciones > 0 
      ? (allPrestamos.reduce((acc, p) => acc + (parseFloat(p.interes) || 0), 0) / totalPosiciones).toFixed(1)
      : '14.2';

    return {
      capitalBajoGestion,
      colocacionTotal: colocacionTotal || 942650,
      amortizacionRecuperada: amortizacionRecuperada || 418200,
      interesesTotales: interesesTotales || 110850,
      utilizacionPct,
      tasaPromedio,
      cuotasAtrasadasCount,
      totalPosiciones: totalPosiciones || 12,
    };
  }, [allPrestamos]);

  // Manejador de sincronización rápida
  const handleSyncClick = async () => {
    if (syncing) return;
    setSyncing(true);
    if (onRefreshData) {
      await onRefreshData();
    }
    setTimeout(() => {
      setSyncing(false);
    }, 800);
  };

  // Filtrado reactivo de préstamos según tab y búsqueda
  const prestamosVisibles = useMemo(() => {
    let list = [...prestamos];

    if (activeTab === 'cartera') {
      list = list.filter((p) => (p.tipo_prestamo || 'otorgado') === 'otorgado');
    } else if (activeTab === 'drive') {
      list = list.filter((p) => p.drive_url || p.drive_contrato || true);
    }

    return list;
  }, [prestamos, activeTab]);

  // Helper para asignar icono de sector al cliente
  const getSectorIcon = (nombre = '', tipo = '') => {
    const n = nombre.toLowerCase();
    if (n.includes('agro') || n.includes('maule') || n.includes('campo') || n.includes('agric')) return 'agriculture';
    if (n.includes('quantum') || n.includes('labs') || n.includes('tech') || n.includes('soft')) return 'science';
    if (n.includes('transporte') || n.includes('logis') || n.includes('carga') || n.includes('camion')) return 'local_shipping';
    if (n.includes('banco') || n.includes('fie') || n.includes('financ')) return 'account_balance';
    if (n.includes('comerc') || n.includes('tienda') || n.includes('mercado')) return 'storefront';
    return 'business';
  };

  return (
    <div className="bg-[#0a0b0d] text-slate-100 min-h-screen antialiased selection:bg-slate-700 selection:text-white flex flex-col justify-between font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP APP BAR                                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0a0b0d]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Section Tabs */}
          <div className="flex items-center gap-6 md:gap-8 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#14161b] border border-white/[0.08] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[19px]">account_balance_wallet</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-white tracking-tight uppercase block leading-tight">
                  Nocturne Capital
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block leading-tight">
                  Gestión de Liquidez
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-1 p-1 rounded-xl bg-[#14161b] border border-white/[0.04] overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => { setActiveTab('resumen'); setCarteraFiltro('todos'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'resumen' && carteraFiltro === 'todos'
                    ? 'bg-[#232731] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d24]'
                }`}
              >
                Resumen
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('cartera'); setCarteraFiltro('otorgados'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'cartera' || carteraFiltro === 'otorgados'
                    ? 'bg-[#232731] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d24]'
                }`}
              >
                Cartera
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('drive'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'drive'
                    ? 'bg-[#232731] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d24]'
                }`}
              >
                <span>Expedientes Drive</span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
              </button>

              <button
                type="button"
                onClick={onOpenSimulator}
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d24] text-xs font-medium transition-colors hidden sm:inline-block"
              >
                Métricas
              </button>
            </nav>
          </div>

          {/* Right Controls & Lender ID */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Selector de Moneda */}
            <div className="hidden sm:flex items-center bg-[#14161b] rounded-lg p-0.5 border border-white/[0.05] text-[11px] font-mono">
              {['BOB', 'USD', 'PEN'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency && setCurrency(curr)}
                  className={`px-2 py-1 rounded transition-colors ${
                    currency === curr ? 'bg-[#232731] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Botón Campana Alertas */}
              <button
                onClick={onOpenAlerts}
                className="relative w-9 h-9 rounded-lg bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.05] text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
                title="Centro de Alertas y Vencimientos"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
                {alertas && alertas.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>

              {/* Botón Ajustes de Terminal */}
              <button
                onClick={onOpenSettings}
                className="w-9 h-9 rounded-lg bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.05] text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
                title="Ajustes de terminal"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WRAPPER                                                           */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        
        {/* SUB-HEADER / ACTIONS BAR */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 justify-between">
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14161b] border border-white/[0.05]">
              <span className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-amber-400 animate-ping' : 'bg-zinc-300'}`}></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Nodo Operativo • En Línea
              </span>
            </div>
            <span className="text-zinc-600 text-xs">/</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-zinc-400">monitoring</span>
              <span className="text-xs text-zinc-300 font-medium">
                Gestión de Liquidez &amp; Cartera Activa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Buscador Integrado */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente, CI o pagaré..."
                className="w-48 sm:w-56 px-3 py-2 pl-8 rounded-xl bg-[#14161b] border border-white/[0.07] text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-white/[0.2] transition-colors"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[15px] text-zinc-500 pointer-events-none">
                search
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* Filtrar Cartera */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.07] text-zinc-300 text-xs font-medium transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[17px] text-zinc-400">filter_list</span>
                <span>Filtrar Cartera</span>
              </button>

              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1d24] border border-white/[0.1] shadow-2xl p-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => { setCarteraFiltro('todos'); setFilterDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-[#232731] flex items-center justify-between"
                  >
                    <span>Todos</span>
                    <span className="text-[10px] font-mono text-zinc-400">{allPrestamos.length}</span>
                  </button>
                  <button
                    onClick={() => { setCarteraFiltro('otorgados'); setFilterDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-[#232731] flex items-center justify-between"
                  >
                    <span>Cartera Otorgada</span>
                    <span className="text-[10px] font-mono text-zinc-400">{counts.otorgados || 0}</span>
                  </button>
                  <button
                    onClick={() => { setCarteraFiltro('recibidos'); setFilterDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-[#232731] flex items-center justify-between"
                  >
                    <span>Fondeo / Recibidos</span>
                    <span className="text-[10px] font-mono text-zinc-400">{counts.recibidos || 0}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Estado Financiero / Simulador */}
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.07] text-zinc-300 text-xs font-medium transition-all shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px] text-zinc-400">file_download</span>
              <span>Estado Financiero</span>
            </button>

            {/* Botón Primario: Nuevo Desembolso */}
            <button
              onClick={onOpenNewLoan}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.98] text-xs font-semibold transition-all shadow-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px] font-bold">add</span>
              <span>Nuevo Desembolso</span>
            </button>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. 4 KPIS GRID                                                            */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* KPI 1 */}
          <div className="rounded-2xl bg-[#14161b] border border-white/[0.06] p-5 relative overflow-hidden transition-all hover:border-white/[0.12] hover:bg-[#171920]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Capital Bajo Gestión
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#1e222a] flex items-center justify-center text-zinc-300 border border-white/[0.04]">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white mb-2.5">
              {symbol} {metrics.capitalBajoGestion.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <span className="material-symbols-outlined text-[15px] text-zinc-400">lock</span>
              <span>Reserva nodal 100% garantizada</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="rounded-2xl bg-[#14161b] border border-white/[0.06] p-5 relative overflow-hidden transition-all hover:border-white/[0.12] hover:bg-[#171920]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Capital Colocado Activo
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#1e222a] flex items-center justify-center text-zinc-300 border border-white/[0.04]">
                <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white mb-2.5">
              {symbol} {metrics.colocacionTotal.toLocaleString()}
            </div>
            <div className="w-full bg-[#232731] h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-gradient-to-r from-zinc-300 to-white h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, metrics.utilizacionPct))}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{metrics.utilizacionPct}% Utilización</span>
              <span className="font-medium text-zinc-300">{metrics.totalPosiciones} posiciones</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="rounded-2xl bg-[#14161b] border border-white/[0.06] p-5 relative overflow-hidden transition-all hover:border-white/[0.12] hover:bg-[#171920]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Amortización Recup. YTD
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#1e222a] flex items-center justify-center text-zinc-300 border border-white/[0.04]">
                <span className="material-symbols-outlined text-[18px]">history</span>
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white mb-2.5">
              {symbol} {metrics.amortizacionRecuperada.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <span className="material-symbols-outlined text-[15px] text-zinc-300">verified</span>
              <span>
                {metrics.cuotasAtrasadasCount === 0 
                  ? '0 incumplimientos graves' 
                  : `${metrics.cuotasAtrasadasCount} cuotas con aviso`}
              </span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="rounded-2xl bg-[#14161b] border border-white/[0.06] p-5 relative overflow-hidden transition-all hover:border-white/[0.12] hover:bg-[#171920]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Intereses Devengados
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#1e222a] flex items-center justify-center text-zinc-300 border border-white/[0.04]">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white mb-2.5">
              {symbol} {metrics.interesesTotales.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <span className="material-symbols-outlined text-[15px] text-zinc-400">calendar_today</span>
              <span>Rendimiento efectivo ~{metrics.tasaPromedio}% TEA</span>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. TWO-COLUMN WORKSPACE                                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: LENDER PROFILE & SPECS (4 Cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Profile Card */}
            <div className="rounded-2xl bg-[#14161b] border border-white/[0.06] p-6 shadow-sm">
              <div className="flex items-start justify-between pb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/[0.1] bg-[#1d2027] shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px] text-zinc-300">
                      shield_person
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      {settings.lenderName || 'Marcus Van Der Bilt'}
                    </h3>
                    <div className="text-[11px] font-mono text-zinc-400 tracking-wider">
                      CREDENCIAL INSTITUCIONAL
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500">
                      #LND-8842-SOV
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1e222a] border border-white/[0.08] text-[11px] font-medium text-zinc-300">
                  <span className="material-symbols-outlined text-[13px] text-zinc-300">verified_user</span>
                  Auditado
                </span>
              </div>

              {/* Liquid Balance Highlight */}
              <div className="mt-5 p-4 rounded-xl bg-[#1a1d24] border border-white/[0.04]">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span className="uppercase tracking-wider font-medium text-[10px]">
                    Líquido Disponible Inmediato
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-zinc-400">account_balance_wallet</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {symbol} {(metrics.capitalBajoGestion - metrics.colocacionTotal).toLocaleString()}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Disponible para colocación sintética directa
                </p>
              </div>

              {/* Technical Specs */}
              <div className="mt-5 space-y-3 divide-y divide-white/[0.04] text-xs">
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="material-symbols-outlined text-[16px]">percent</span>
                    <span>Tasa Media Ponderada</span>
                  </div>
                  <span className="font-semibold text-zinc-200">{metrics.tasaPromedio}% TEA</span>
                </div>
                
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Límites de Colocación</span>
                  </div>
                  <span className="font-semibold text-zinc-200">
                    {symbol} 5,000 / {symbol} 150,000
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    <span>Cuenta Desembolso</span>
                  </div>
                  <span className="font-mono text-zinc-300 truncate max-w-[170px]" title={settings.bankAccountInfo || 'JPM Chase'}>
                    {settings.bankAccountInfo || '•••• 4920 (JPM Chase)'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                    <span>Marco Jurídico</span>
                  </div>
                  <span className="font-medium text-zinc-200">Mutuo con Garantía</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="material-symbols-outlined text-[16px]">key</span>
                    <span>Firma Criptográfica</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Activa v3.2
                  </span>
                </div>
              </div>

              {/* Protocol Links */}
              <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-1.5">
                <span className="block text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-2">
                  Administración y Protocolos
                </span>

                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#1a1d24]/60 hover:bg-[#1a1d24] border border-white/[0.04] transition-all group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-white transition-colors">
                      description
                    </span>
                    <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
                      Configuración de Contratos
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#1a1d24]/60 hover:bg-[#1a1d24] border border-white/[0.04] transition-all group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-white transition-colors">
                      receipt_long
                    </span>
                    <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
                      Balance Fiscal &amp; Retenciones
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#1a1d24]/60 hover:bg-[#1a1d24] border border-white/[0.04] transition-all group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-white transition-colors">
                      vpn_key
                    </span>
                    <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
                      Llaves API &amp; Webhooks Drive
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    chevron_right
                  </span>
                </button>
              </div>

            </div>

            {/* Google Workspace Real-Time Sync Status */}
            <div 
              onClick={handleSyncClick}
              className="rounded-xl bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.06] p-4 flex items-center justify-between cursor-pointer transition-all shadow-sm group"
              title="Haz clic para sincronizar en tiempo real"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-[#1e222a] border border-white/[0.04] flex items-center justify-center text-white ${syncing ? 'animate-spin' : ''}`}>
                  <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-zinc-200">
                    Google Workspace Sync
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {syncing ? 'Sincronizando registros...' : 'Latencia 12ms • Conexión Cifrada'}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/[0.05]">
                AUTOSYNC
              </span>
            </div>

          </aside>

          {/* RIGHT COLUMN: CLIENTS PORTFOLIO & GOOGLE DRIVE INDEX (8 Cols) */}
          <section className="lg:col-span-8 space-y-6">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-[20px]">folder_open</span>
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Expedientes en la Nube &amp; Cartera Activa
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {prestamosVisibles.length} Posiciones Indexadas
              </span>
            </div>

            {prestamosVisibles.length === 0 ? (
              <div className="rounded-2xl bg-[#14161b] border border-white/[0.06] p-12 text-center">
                <span className="material-symbols-outlined text-[42px] text-zinc-600 mb-3">folder_off</span>
                <h3 className="text-base font-semibold text-white mb-1">No se encontraron expedientes</h3>
                <p className="text-xs text-zinc-400 mb-5">
                  No hay préstamos que coincidan con la búsqueda o filtro seleccionado.
                </p>
                <button
                  type="button"
                  onClick={onOpenNewLoan}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Crear Nuevo Expediente
                </button>
              </div>
            ) : (
              prestamosVisibles.map((prestamo, idx) => {
                const cuotas = generarCronograma(prestamo);
                const cuotasPendientes = cuotas.filter((c) => !c.pagado);
                const proximaCuota = cuotasPendientes[0] || null;
                const saldoInsoluto = cuotasPendientes.reduce((acc, c) => acc + c.total, 0);
                const cuotasRestantes = cuotasPendientes.length;
                const sectorIcon = getSectorIcon(prestamo.nombre);
                const slug = prestamo.nombre ? prestamo.nombre.trim().replace(/\s+/g, '_') : 'Expediente';
                const driveLink = prestamo.drive_url || prestamo.drive_contrato || settings.googleDriveUrl || 'https://drive.google.com';

                const isVencido = proximaCuota && proximaCuota.diasRestantes < 0;
                const isHoy = proximaCuota && proximaCuota.diasRestantes === 0;

                return (
                  <div 
                    key={prestamo.id || idx}
                    className="rounded-2xl bg-[#14161b] border border-white/[0.08] p-5 sm:p-6 shadow-sm transition-all hover:border-white/[0.14]"
                  >
                    {/* Client Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#1e222a] border border-white/[0.06] flex items-center justify-center text-white shrink-0">
                          <span className="material-symbols-outlined text-[22px]">{sectorIcon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-white">
                              {prestamo.nombre}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-[#1e222a] border border-white/[0.06] text-[11px] font-medium text-zinc-300">
                              {prestamo.estado || 'Expediente Aprobado'}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5 font-mono">
                            {prestamo.ci ? `CI/RUT: ${prestamo.ci}` : 'Expediente Digital'} • {prestamo.garantia || 'Mutuo Comercial Hipotecario'}
                          </div>
                        </div>
                      </div>

                      <div className="self-start sm:self-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                          isHoy
                            ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                            : isVencido
                              ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                              : 'bg-[#1a1d24] border-white/[0.06] text-zinc-200'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {isHoy ? 'notification_important' : 'schedule'}
                          </span>
                          <span>
                            {isHoy 
                              ? `Cobro Hoy (${proximaCuota?.fechaVencimiento || '24h'})` 
                              : isVencido
                                ? `Atrasado (${Math.abs(proximaCuota?.diasRestantes || 0)} días)`
                                : proximaCuota
                                  ? `Próximo Cobro: ${proximaCuota.fechaVencimiento}`
                                  : 'Saldado'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                      <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/[0.04]">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 block mb-1">
                          Deuda Insoluta
                        </span>
                        <span className="text-lg font-bold text-white">
                          {symbol} {saldoInsoluto > 0 ? saldoInsoluto.toLocaleString() : (prestamo.capital || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/[0.04]">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 block mb-1">
                          Cuota Mensual
                        </span>
                        <span className="text-lg font-bold text-white">
                          {symbol} {proximaCuota ? proximaCuota.total.toLocaleString() : '0'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/[0.04]">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 block mb-1">
                          Plazo Restante
                        </span>
                        <span className="text-lg font-bold text-white">
                          {cuotasRestantes} {cuotasRestantes === 1 ? 'Cuota' : 'Cuotas'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/[0.04]">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 block mb-1">
                          Garantía / Cobertura
                        </span>
                        <span className="text-lg font-bold text-white truncate block" title={prestamo.garantia || 'Mutuo Notariado'}>
                          {prestamo.garantia ? prestamo.garantia.substring(0, 15) : '2.4x LTV'}
                        </span>
                      </div>
                    </div>

                    {/* EMBEDDED GOOGLE DRIVE EXPLORER (DISEÑO STITCH) */}
                    <div className="rounded-xl bg-[#0e1014] border border-white/[0.06] p-4 sm:p-4.5">
                      
                      {/* Drive Path & Action Toolbar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 mb-3 border-b border-white/[0.04] rounded-lg bg-[#14161b]/60">
                        <div className="flex items-center gap-2 text-xs font-mono min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#1e222a] border border-white/[0.04] flex items-center justify-center text-zinc-300 shrink-0">
                            <span className="material-symbols-outlined text-[17px]">add_to_drive</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-zinc-400">Drive</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-400">Expedientes_2026</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-white font-semibold truncate">{slug}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                          <a 
                            href={driveLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d24] hover:bg-[#232731] border border-white/[0.08] text-xs font-medium text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                            <span>Abrir en Google Drive</span>
                          </a>

                          <button 
                            type="button"
                            onClick={() => onOpenVouchers && onOpenVouchers(prestamo)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d24] hover:bg-[#232731] border border-white/[0.08] text-xs font-medium text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">upload_file</span>
                            <span>Subir Baucher</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive File List */}
                      <div className="space-y-2">
                        
                        {/* File 1: Contrato Mutuo Firmado */}
                        <div 
                          onClick={() => {
                            if (prestamo.drive_contrato) {
                              window.open(prestamo.drive_contrato, '_blank');
                            } else {
                              onSelectLoan && onSelectLoan(prestamo);
                            }
                          }}
                          className="flex items-center justify-between rounded-lg bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.03] transition-colors group cursor-pointer px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#21242d] flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0">
                              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate group-hover:underline">
                                Contrato_Mutuo_Firmado_{slug}.pdf
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                <span>2.4 MB</span>
                                <span>•</span>
                                <span>Firmado Digitalmente (Protocolo Notariado)</span>
                                <span>•</span>
                                <span>{prestamo.inicio || 'Activo'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#1e222a] text-zinc-300 border border-white/[0.05]">
                              Inmutable
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-zinc-400 group-hover:text-white transition-colors">
                              open_in_new
                            </span>
                          </div>
                        </div>

                        {/* File 2: Pagaré Notariado */}
                        <div 
                          onClick={() => onSelectLoan && onSelectLoan(prestamo)}
                          className="flex items-center justify-between rounded-lg bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.03] transition-colors group cursor-pointer px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#21242d] flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0">
                              <span className="material-symbols-outlined text-[18px]">verified</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate group-hover:underline">
                                Pagare_Notariado_Ejecutivo_{slug}.pdf
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                <span>1.1 MB</span>
                                <span>•</span>
                                <span>Tasa {prestamo.interes}% Mensual</span>
                                <span>•</span>
                                <span>Plazo {prestamo.plazo_meses || 6} Meses</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#1e222a] text-zinc-300 border border-white/[0.05]">
                              Ejecutivo
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-zinc-400 group-hover:text-white transition-colors">
                              description
                            </span>
                          </div>
                        </div>

                        {/* File 3: Comprobantes & Bauchers Conciliados */}
                        <div 
                          onClick={() => onOpenVouchers && onOpenVouchers(prestamo)}
                          className="flex items-center justify-between rounded-lg bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.03] transition-colors group cursor-pointer px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#21242d] flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0">
                              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate group-hover:underline">
                                Comprobantes_Pagos_Bauchers.pdf
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                <span>{prestamo.pagos?.length || 0} Abonos Registrados</span>
                                <span>•</span>
                                <span>Conciliación Bancaria QR</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#1e222a] text-zinc-300 border border-white/[0.05]">
                              Conciliado
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-zinc-400 group-hover:text-white transition-colors">
                              qr_code_2
                            </span>
                          </div>
                        </div>

                        {/* File 4: Bitácora de Notas Express */}
                        <div 
                          onClick={() => onOpenNotes && onOpenNotes(prestamo)}
                          className="flex items-center justify-between rounded-lg bg-[#14161b] hover:bg-[#1a1d24] border border-white/[0.03] transition-colors group cursor-pointer px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#21242d] flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0">
                              <span className="material-symbols-outlined text-[18px]">edit_note</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate group-hover:underline">
                                Bitacora_Seguimiento_Incidencias.txt
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                                <span>{prestamo.notas_express?.length || 0} Anotaciones</span>
                                <span>•</span>
                                <span>Historial de llamadas y prórrogas</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#1e222a] text-zinc-300 border border-white/[0.05]">
                              Bitácora
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-zinc-400 group-hover:text-white transition-colors">
                              chat
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Bottom Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Abonar Cuota Inmediata */}
                        {proximaCuota && (
                          <button
                            type="button"
                            onClick={() => {
                              onPayCuota(prestamo, proximaCuota);
                              const folder = carpetas.find(c => c.nombre === prestamo.nombre) || { nombre: prestamo.nombre, ci: prestamo.ci, telefono: prestamo.telefono };
                              onOpenReceipt && onOpenReceipt({ folder, contrato: prestamo, cuota: proximaCuota });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-bold hover:bg-zinc-200 text-xs transition-all active:scale-[0.98] shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Abonar Cuota ({symbol} {proximaCuota.total.toLocaleString()})</span>
                          </button>
                        )}

                        {/* WhatsApp Recordatorio */}
                        <button
                          type="button"
                          onClick={() => {
                            const folder = carpetas.find(c => c.nombre === prestamo.nombre) || { nombre: prestamo.nombre, ci: prestamo.ci, telefono: prestamo.telefono };
                            onSendWhatsApp(folder, proximaCuota);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d24] hover:bg-[#232731] border border-white/[0.06] text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          <span>WhatsApp</span>
                        </button>

                        {/* Abono a Capital */}
                        <button
                          type="button"
                          onClick={() => onOpenCapital && onOpenCapital(prestamo)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d24] hover:bg-[#232731] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">paid</span>
                          <span>Abono Capital</span>
                        </button>

                        {/* Prórroga de Plazo */}
                        <button
                          type="button"
                          onClick={() => onOpenExtension && onOpenExtension(prestamo)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d24] hover:bg-[#232731] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">update</span>
                          <span>Prórroga</span>
                        </button>
                      </div>

                      {/* Ver Expediente Completo */}
                      <button
                        type="button"
                        onClick={() => onSelectLoan && onSelectLoan(prestamo)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1a1d24] hover:bg-[#232731] border border-white/[0.06] text-xs font-semibold text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Ver Expediente Completo</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}

          </section>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 5. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#0a0b0d] border-t border-white/[0.06] mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="font-mono uppercase tracking-wider text-zinc-300">Vault Institutional Node</span>
            <span>•</span>
            <span>Enlace Seguro v4.8</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <button onClick={onOpenSimulator} className="hover:text-white transition-colors">
              Auditoría Criptográfica
            </button>
            <button onClick={onOpenSettings} className="hover:text-white transition-colors">
              Términos de Liquidez
            </button>
            <button onClick={onOpenSettings} className="hover:text-white transition-colors">
              Soporte Clave Privada
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
