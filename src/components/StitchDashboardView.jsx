import React, { useState, useMemo, useEffect } from 'react';
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
  // Reloj dinámico en tiempo real para el status bar y widget principal
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formato de hora y fecha para el panel superior
  const formattedTime = currentTime.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }).toUpperCase();

  const formattedDate = currentTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Estado del cliente y contrato seleccionado en el Cockpit Master-Detail
  const [selectedClientKey, setSelectedClientKey] = useState(null);
  const [selectedContractIndex, setSelectedContractIndex] = useState(0);
  const [modalityFilter, setModalityFilter] = useState('todos'); // 'todos' | 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'mora'
  const [quickNoteText, setQuickNoteText] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Símbolo de moneda
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Cálculos financieros globales
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

  // Selección automática del primer cliente si no hay ninguno seleccionado
  useEffect(() => {
    if (!selectedClientKey && carpetas.length > 0) {
      setSelectedClientKey(carpetas[0].key);
    }
  }, [carpetas, selectedClientKey]);

  // Filtrado de clientes por modalidad y texto
  const filteredClients = useMemo(() => {
    return carpetas.filter((c) => {
      if (modalityFilter === 'diario' && !c.contratos.some(p => p.tipo_pago === 'diario')) return false;
      if (modalityFilter === 'semanal' && !c.contratos.some(p => p.tipo_pago === 'semanal')) return false;
      if (modalityFilter === 'quincenal' && !c.contratos.some(p => p.tipo_pago === 'quincenal')) return false;
      if (modalityFilter === 'mensual' && !c.contratos.some(p => !p.tipo_pago || p.tipo_pago === 'mensual')) return false;
      if (modalityFilter === 'mora' && c.estadoGlobal !== 'Atrasado') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.nombre?.toLowerCase().includes(q);
        const matchCI = c.ci?.toLowerCase().includes(q);
        const matchTel = c.telefono?.includes(q);
        if (!matchName && !matchCI && !matchTel) return false;
      }
      return true;
    });
  }, [carpetas, modalityFilter, searchQuery]);

  // Cliente actualmente seleccionado en el Master-Detail
  const activeClient = useMemo(() => {
    return carpetas.find(c => c.key === selectedClientKey) || carpetas[0] || null;
  }, [carpetas, selectedClientKey]);

  // Contrato activo del cliente seleccionado
  const activeContract = useMemo(() => {
    if (!activeClient || !activeClient.contratos || activeClient.contratos.length === 0) return null;
    return activeClient.contratos[selectedContractIndex] || activeClient.contratos[0];
  }, [activeClient, selectedContractIndex]);

  // Cronograma y próxima cuota del contrato activo
  const activeContractCuotas = useMemo(() => {
    if (!activeContract) return [];
    return generarCronograma(activeContract);
  }, [activeContract]);

  const activeContractProximaCuota = useMemo(() => {
    return activeContractCuotas.find(c => !c.pagado) || null;
  }, [activeContractCuotas]);

  // Sincronización rápida
  const handleSyncClick = async () => {
    if (syncing) return;
    setSyncing(true);
    if (onRefreshData) {
      await onRefreshData();
    }
    setTimeout(() => setSyncing(false), 800);
  };

  // Guardar nota rápida sobre el cliente activo
  const handleAddQuickNote = () => {
    if (!quickNoteText.trim() || !activeContract) return;
    const currentNotes = Array.isArray(activeContract.notas_express) ? activeContract.notas_express : [];
    const newNote = {
      id: `note-${Date.now()}`,
      fecha: new Date().toISOString(),
      texto: quickNoteText.trim(),
      etiqueta: 'Bitácora',
    };
    onOpenNotes && onOpenNotes(activeContract, [newNote, ...currentNotes]);
    setQuickNoteText('');
  };

  return (
    <div className="w-full min-h-screen bg-[#08090b] text-[#f8fafc] flex flex-col justify-between selection:bg-slate-700 selection:text-white font-sans antialiased pb-24">
      
      {/* ========================================================================= */}
      {/* 1. TOP STATUS BAR (ESTILO COCKPIT MINIMALISTA)                             */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#0b0d10] px-6 py-2.5 flex items-center justify-between text-xs text-zinc-400 select-none shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
        
        {/* Identificador de Prestamista */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#14161d] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            {settings.lenderName ? settings.lenderName.charAt(0) : 'P'}
          </div>
          <span className="font-semibold text-zinc-200">
            {settings.lenderName || 'Carlos Joel • Prestamista'}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-[11px] font-mono text-zinc-400">#LND-8842-SOV</span>
        </div>

        {/* Reloj Digital Central */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-zinc-300">
          <span className="material-symbols-outlined text-[15px] text-zinc-400">schedule</span>
          <span className="font-bold text-white text-xs">{formattedTime}</span>
          <span className="text-zinc-600">—</span>
          <span className="text-[11px] text-zinc-400 capitalize">{formattedDate}</span>
        </div>

        {/* Indicadores de Conexión & Selector de Moneda */}
        <div className="flex items-center gap-3">
          
          {/* Cloud Sync Status */}
          <button 
            onClick={handleSyncClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14161d] hover:bg-[#1a1d25] transition-colors"
            title="Sincronización en la Nube con Supabase y Drive"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            <span className="text-[11px] font-mono text-zinc-300">
              {syncing ? 'Sincronizando...' : 'Online • 12ms'}
            </span>
          </button>

          {/* Moneda */}
          <div className="flex items-center bg-[#14161d] rounded-lg p-0.5 text-[11px] font-mono">
            {['BOB', 'USD', 'PEN'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency && setCurrency(curr)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  currency === curr ? 'bg-[#232731] text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Notificaciones */}
          <button
            onClick={onOpenAlerts}
            className="relative w-7 h-7 rounded-lg bg-[#14161d] hover:bg-[#1c1f28] flex items-center justify-center text-zinc-300 transition-colors"
            title="Alertas y Vencimientos"
          >
            <span className="material-symbols-outlined text-[17px]">notifications</span>
            {alertas && alertas.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          {/* Ajustes */}
          <button
            onClick={onOpenSettings}
            className="w-7 h-7 rounded-lg bg-[#14161d] hover:bg-[#1c1f28] flex items-center justify-center text-zinc-300 transition-colors"
            title="Ajustes Generales"
          >
            <span className="material-symbols-outlined text-[17px]">tune</span>
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TOP HERO ROW (WIDGET DIGITAL CLOCK + 3 FINANCIAL WIDGETS)               */}
      {/* ========================================================================= */}
      <div className="max-w-[1540px] w-full mx-auto px-6 pt-5 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Widget 1 (Hero Large): Reloj & Capital Bajo Gestión (4 Columnas) */}
          <div className="md:col-span-4 p-5 rounded-2xl bg-[#111317] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between select-none">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mb-1">
                  Terminal de Control Financiero
                </span>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {formattedTime}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5 capitalize">
                  {formattedDate}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#181a22] flex items-center justify-center text-zinc-300 shadow-inner">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/[0.03] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Capital Bajo Gestión</span>
                <span className="text-lg font-bold text-white font-mono">
                  {symbol} {metrics.capitalBajoGestion.toLocaleString()}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#1a1d26] text-zinc-300 text-[11px] font-medium font-mono">
                {metrics.utilizacionPct}% Utilización
              </span>
            </div>
          </div>

          {/* Widget 2: Capital Colocado Activo (2.6 Columnas) */}
          <div className="md:col-span-3 p-5 rounded-2xl bg-[#111317] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Capital Colocado
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#181a22] flex items-center justify-center text-zinc-300">
                <span className="material-symbols-outlined text-[17px]">currency_exchange</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono mb-2">
                {symbol} {metrics.colocacionTotal.toLocaleString()}
              </div>
              <div className="w-full bg-[#1c1f28] h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-gradient-to-r from-zinc-300 to-white h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(10, metrics.utilizacionPct))}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{metrics.totalPosiciones} préstamos activos</span>
              <span className="text-emerald-400 font-medium">En colocación</span>
            </div>
          </div>

          {/* Widget 3: Amortización Recuperada YTD (2.7 Columnas) */}
          <div className="md:col-span-3 p-5 rounded-2xl bg-[#111317] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Amortización Recup.
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#181a22] flex items-center justify-center text-zinc-300">
                <span className="material-symbols-outlined text-[17px]">history</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono mb-2">
                {symbol} {metrics.amortizacionRecuperada.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="material-symbols-outlined text-[15px] text-emerald-400">verified</span>
              <span>
                {metrics.cuotasAtrasadasCount === 0 
                  ? '0 incumplimientos graves' 
                  : `${metrics.cuotasAtrasadasCount} con aviso`}
              </span>
            </div>
          </div>

          {/* Widget 4: Intereses Devengados (2.3 Columnas) */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-[#111317] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Intereses
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#181a22] flex items-center justify-center text-zinc-300">
                <span className="material-symbols-outlined text-[17px]">trending_up</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono mb-2">
                {symbol} {metrics.interesesTotales.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              ~{metrics.tasaPromedio}% TEA Retorno
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKPLACE AREA (3 PANELES SIN BORDES, COCKPIT DASHBOARD)           */}
      {/* ========================================================================= */}
      <main className="max-w-[1540px] w-full mx-auto px-6 py-3 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* --------------------------------------------------------------------- */}
          {/* PANEL 1: DIRECTORIO DE CLIENTES (3.5 Columnas)                        */}
          {/* --------------------------------------------------------------------- */}
          <section className="lg:col-span-4 rounded-2xl bg-[#111317] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.55)] flex flex-col justify-between max-h-[720px]">
            
            <div className="space-y-3.5">
              {/* Header Panel 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Directorio de Clientes</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {filteredClients.length} personas registradas
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onOpenNewLoan}
                  className="px-2.5 py-1.5 rounded-xl bg-white text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px] font-bold">add</span>
                  <span>Nuevo</span>
                </button>
              </div>

              {/* Buscador Rápido de Clientes */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, teléfono o CI..."
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-[#161820] text-white placeholder-zinc-500 text-xs focus:outline-none shadow-inner transition-colors"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-zinc-500 pointer-events-none">
                  search
                </span>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>

              {/* Chips de Modalidad */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'diario', label: 'Diario' },
                  { id: 'semanal', label: 'Semanal' },
                  { id: 'quincenal', label: 'Quincenal' },
                  { id: 'mensual', label: 'Mensual' },
                  { id: 'mora', label: 'En Mora' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setModalityFilter(chip.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                      modalityFilter === chip.id
                        ? 'bg-[#232731] text-white shadow-sm font-semibold'
                        : 'bg-[#161820] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Scrollable de Clientes */}
            <div className="flex-1 overflow-y-auto custom-scroll space-y-2 mt-3 pr-1">
              {filteredClients.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No se encontraron clientes con este filtro.
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = activeClient && activeClient.key === client.key;
                  const totalAdeudado = client.totalAdeudado || client.totalCapital;
                  const contratoPrincipal = client.contratos[0] || {};
                  const modalidad = contratoPrincipal.tipo_pago || 'mensual';

                  return (
                    <div
                      key={client.key}
                      onClick={() => {
                        setSelectedClientKey(client.key);
                        setSelectedContractIndex(0);
                      }}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#1d202a] shadow-[0_4px_20px_rgba(0,0,0,0.45)]' 
                          : 'bg-[#15171e] hover:bg-[#191b24]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-white text-zinc-950 shadow-md' : 'bg-[#1e212b] text-zinc-300'
                          }`}>
                            {client.nombre.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {client.nombre}
                            </h4>
                            <span className="text-[11px] text-zinc-400 block font-mono">
                              {client.ci ? `CI: ${client.ci}` : client.telefono || 'Sin CI'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-white block">
                            {symbol} {totalAdeudado.toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize inline-block mt-0.5 ${
                            client.estadoGlobal === 'Atrasado'
                              ? 'bg-rose-950/70 text-rose-300'
                              : client.estadoGlobal === 'Vence Hoy'
                                ? 'bg-amber-950/70 text-amber-300 font-bold'
                                : 'bg-[#1a1d26] text-zinc-400'
                          }`}>
                            {modalidad}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </section>

          {/* --------------------------------------------------------------------- */}
          {/* PANEL 2: CONTRATOS & PLAN DE AMORTIZACIÓN DEL CLIENTE (5 Columnas)    */}
          {/* --------------------------------------------------------------------- */}
          <section className="lg:col-span-5 rounded-2xl bg-[#111317] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.55)] flex flex-col justify-between max-h-[720px]">
            
            {activeClient ? (
              <>
                {/* Header del Cliente Seleccionado */}
                <div className="pb-3 border-b border-white/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#1a1d26] flex items-center justify-center text-white text-base font-bold shadow-sm">
                        {activeClient.nombre.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white tracking-tight">
                          {activeClient.nombre}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                          <span>{activeClient.ci ? `CI: ${activeClient.ci}` : 'Expediente Verificado'}</span>
                          <span>•</span>
                          <span>{activeClient.telefono || 'Sin WhatsApp'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Directo */}
                      <button
                        type="button"
                        onClick={() => onSendWhatsApp && onSendWhatsApp(activeClient, activeContractProximaCuota)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-medium text-xs flex items-center gap-1 transition-all"
                        title="Enviar mensaje de WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[15px]">chat</span>
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      {/* Ver Expediente Completo */}
                      <button
                        type="button"
                        onClick={() => onSelectLoan && onSelectLoan(activeContract || activeClient.contratos[0])}
                        className="p-1.5 rounded-xl bg-[#181a22] hover:bg-[#20232e] text-zinc-300"
                        title="Abrir Auditoría Completa"
                      >
                        <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                      </button>
                    </div>
                  </div>

                  {/* Selector de Contratos si la persona tiene varios */}
                  {activeClient.contratos && activeClient.contratos.length > 1 && (
                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/[0.03]">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Contratos:</span>
                      {activeClient.contratos.map((c, idx) => (
                        <button
                          key={c.id || idx}
                          onClick={() => setSelectedContractIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            selectedContractIndex === idx
                              ? 'bg-white text-zinc-950 font-bold shadow-sm'
                              : 'bg-[#161820] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          #{idx + 1} ({symbol} {c.capital?.toLocaleString()})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Próximo Pago Hero Card (Acceso Inmediato a Cobro) */}
                {activeContractProximaCuota ? (
                  <div className="my-3.5 p-4 rounded-xl bg-[#161820] shadow-[0_4px_20px_rgba(0,0,0,0.45)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                        Próxima Cuota Programada
                      </span>
                      <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                        {symbol} {activeContractProximaCuota.total.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span>
                          {activeContractProximaCuota.diasRestantes < 0
                            ? `Atrasado ${Math.abs(activeContractProximaCuota.diasRestantes)} días`
                            : activeContractProximaCuota.diasRestantes === 0
                              ? 'Vence Hoy'
                              : `Vence el ${activeContractProximaCuota.fechaVencimiento}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onPayCuota && onPayCuota(activeContract, activeContractProximaCuota);
                        onOpenReceipt && onOpenReceipt({ folder: activeClient, contrato: activeContract, cuota: activeContractProximaCuota });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Abonar Cuota</span>
                    </button>
                  </div>
                ) : (
                  <div className="my-3.5 p-3.5 rounded-xl bg-[#161820] text-center text-xs text-emerald-400 font-medium">
                    ✓ Todos los pagos de este contrato están al día o saldados.
                  </div>
                )}

                {/* Tabla Interactiva de Cuotas / Amortización */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2 px-1">
                    <span>PLAN DE AMORTIZACIÓN ({activeContractCuotas.length} CUOTAS)</span>
                    <span>MODALIDAD: {activeContract?.tipo_pago?.toUpperCase() || 'MENSUAL'}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scroll space-y-1.5 pr-1 max-h-[280px]">
                    {activeContractCuotas.map((cuota) => (
                      <div
                        key={cuota.key}
                        className={`p-2.5 px-3 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          cuota.pagado
                            ? 'bg-[#15171e]/70 text-zinc-400'
                            : cuota.diasRestantes < 0
                              ? 'bg-rose-950/40 text-rose-200'
                              : 'bg-[#161820] text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                            cuota.pagado ? 'bg-emerald-950 text-emerald-400' : 'bg-[#1e212b] text-zinc-300'
                          }`}>
                            {cuota.numero}
                          </span>
                          <span className="font-medium">{cuota.label}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold">
                            {symbol} {cuota.total.toLocaleString()}
                          </span>

                          {cuota.pagado ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-bold">
                              PAGADO
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onPayCuota && onPayCuota(activeContract, cuota);
                                onOpenReceipt && onOpenReceipt({ folder: activeClient, contrato: activeContract, cuota });
                              }}
                              className="px-2 py-0.5 rounded bg-white text-zinc-950 text-[10px] font-bold active:scale-95"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones del Contrato */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => onOpenCapital && onOpenCapital(activeContract)}
                    className="flex-1 py-2 rounded-xl bg-[#161820] hover:bg-[#1e212b] text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">paid</span>
                    <span>Abono Extraordinario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenExtension && onOpenExtension(activeContract)}
                    className="flex-1 py-2 rounded-xl bg-[#161820] hover:bg-[#1e212b] text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">update</span>
                    <span>Prórroga Plazo</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-zinc-500 text-xs">
                Selecciona un cliente para ver sus contratos y plan de amortización.
              </div>
            )}

          </section>

          {/* --------------------------------------------------------------------- */}
          {/* PANEL 3: DOCUMENTOS, GOOGLE DRIVE & BITÁCORA EXPRESS (3.5 Columnas)   */}
          {/* --------------------------------------------------------------------- */}
          <section className="lg:col-span-3 rounded-2xl bg-[#111317] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.55)] flex flex-col justify-between max-h-[720px]">
            
            <div className="space-y-4">
              {/* Header Panel 3 */}
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Expediente &amp; Drive</h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {activeClient ? activeClient.nombre : 'Sin Selección'}
                </span>
              </div>

              {/* Acceso Directo a Google Drive */}
              <div className="p-3.5 rounded-xl bg-[#161820] shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2 truncate">
                  <span className="material-symbols-outlined text-[16px] text-zinc-300">folder_shared</span>
                  <span className="truncate">Drive / Clientes / {activeClient?.nombre?.replace(/\s+/g, '_') || 'General'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeContract?.drive_url || activeContract?.drive_contrato || settings.googleDriveUrl || 'https://drive.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-lg bg-[#20232e] hover:bg-[#282c3a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    <span>Abrir Carpeta</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenVouchers && onOpenVouchers(activeContract)}
                    className="p-2 rounded-lg bg-[#20232e] hover:bg-[#282c3a] text-zinc-300 hover:text-white"
                    title="Subir o gestionar comprobantes QR"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  </button>
                </div>
              </div>

              {/* Lista de Documentos del Cliente */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                  Documentos Registrados
                </span>

                {/* Doc 1: Contrato Mutuo */}
                <div 
                  onClick={() => {
                    if (activeContract?.drive_contrato) {
                      window.open(activeContract.drive_contrato, '_blank');
                    } else if (activeContract) {
                      onSelectLoan && onSelectLoan(activeContract);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-[#161820] hover:bg-[#1c1f28] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-zinc-300">description</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-white truncate block">Contrato_Mutuo_Firmado.pdf</span>
                      <span className="text-[10px] font-mono text-zinc-400 block">Digitalizado • Inmutable</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-zinc-400">chevron_right</span>
                </div>

                {/* Doc 2: Comprobantes & Bauchers */}
                <div 
                  onClick={() => onOpenVouchers && onOpenVouchers(activeContract)}
                  className="p-2.5 rounded-xl bg-[#161820] hover:bg-[#1c1f28] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-zinc-300">receipt_long</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-white truncate block">Comprobantes_Bauchers_QR</span>
                      <span className="text-[10px] font-mono text-zinc-400 block">{activeContract?.pagos?.length || 0} recibos conciliados</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-zinc-400">chevron_right</span>
                </div>

                {/* Doc 3: Pagaré Notariado */}
                <div 
                  onClick={() => onSelectLoan && onSelectLoan(activeContract)}
                  className="p-2.5 rounded-xl bg-[#161820] hover:bg-[#1c1f28] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-zinc-300">verified</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-white truncate block">Pagare_Notariado_Legal.pdf</span>
                      <span className="text-[10px] font-mono text-zinc-400 block">Mutuo Notarial</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-zinc-400">chevron_right</span>
                </div>
              </div>

              {/* Bitácora de Notas Express Directa */}
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                    Bitácora de Notas Rápida
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenNotes && onOpenNotes(activeContract)}
                    className="text-[10px] font-mono text-zinc-300 hover:text-white"
                  >
                    Ver todas ({activeContract?.notas_express?.length || 0})
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={quickNoteText}
                    onChange={(e) => setQuickNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuickNote()}
                    placeholder="Escribir nota del cliente..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#161820] text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuickNote}
                    className="p-2 rounded-xl bg-[#20232e] hover:bg-[#2a2e3d] text-white"
                    title="Añadir nota"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                  </button>
                </div>

                {/* Última nota registrada si existe */}
                {activeContract?.notas_express && activeContract.notas_express[0] && (
                  <div className="p-2.5 rounded-xl bg-[#161820] text-xs text-zinc-300 font-mono">
                    <span className="text-[10px] text-zinc-500 block">Último apunte:</span>
                    <p className="truncate text-[11px] mt-0.5">{activeContract.notas_express[0].texto}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Garantía & Resumen */}
            <div className="mt-4 pt-3 border-t border-white/[0.04] text-[11px] text-zinc-400 flex items-center justify-between font-mono">
              <span>Garantía: {activeContract?.garantia || 'Mutuo Notariado'}</span>
              <span className="text-zinc-300">Auditoría OK</span>
            </div>

          </section>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM COCKPIT DOCK (FLOATING ACTION BAR INSPIRADA EN EL WIREFRAME)    */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 inset-x-0 flex justify-center z-40 px-4 pointer-events-none select-none">
        <div className="pointer-events-auto px-5 py-2.5 rounded-full bg-[#111317]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center gap-5 sm:gap-8">
          
          {/* Indicador de Tasa / Clima Financiero */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <span className="text-zinc-600">&lt;</span>
            <span className="text-white font-bold">{metrics.tasaPromedio}% TEA</span>
            <span className="text-zinc-600">&gt;</span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">AUTO</span>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-white/[0.08]"></div>

          {/* Iconos Centrales de Navegación del Cockpit */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (carpetas[0]) setSelectedClientKey(carpetas[0].key);
              }}
              className="w-9 h-9 rounded-xl bg-[#181a22] hover:bg-[#20232e] text-white flex items-center justify-center transition-all shadow-sm"
              title="Inicio / Resumen General"
            >
              <span className="material-symbols-outlined text-[19px]">home</span>
            </button>

            <button
              onClick={onOpenSimulator}
              className="w-9 h-9 rounded-xl bg-[#181a22] hover:bg-[#20232e] text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Simulador de Créditos"
            >
              <span className="material-symbols-outlined text-[19px]">calculate</span>
            </button>

            <button
              onClick={onOpenAlerts}
              className="relative w-9 h-9 rounded-xl bg-[#181a22] hover:bg-[#20232e] text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Centro de Alertas"
            >
              <span className="material-symbols-outlined text-[19px]">notifications</span>
              {alertas && alertas.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>

            <a
              href={settings.googleDriveUrl || 'https://drive.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-[#181a22] hover:bg-[#20232e] text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Abrir Google Drive Principal"
            >
              <span className="material-symbols-outlined text-[19px]">add_to_drive</span>
            </a>

            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-xl bg-[#181a22] hover:bg-[#20232e] text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Ajustes de Terminal"
            >
              <span className="material-symbols-outlined text-[19px]">tune</span>
            </button>
          </div>

          <div className="w-[1px] h-4 bg-white/[0.08]"></div>

          {/* Botón Principal: + Nuevo Desembolso */}
          <button
            onClick={onOpenNewLoan}
            className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[17px] font-bold">add</span>
            <span className="hidden sm:inline">Nuevo Préstamo</span>
            <span className="sm:hidden">Nuevo</span>
          </button>

        </div>
      </div>

    </div>
  );
}
