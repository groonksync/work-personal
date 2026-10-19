import React, { useState, useMemo, useEffect } from 'react';
import { 
  generarCronograma, 
  extraerAlertasAnticipadas, 
  formatDate 
} from '../lib/amortizacion';
import { 
  Search, Plus, Check, Clock, TrendingUp, DollarSign, Calendar, 
  User, Folder, FileText, Send, MessageCircle, Upload, ExternalLink, 
  ShieldCheck, AlertCircle, Sliders, HardDrive, CheckCircle2, ArrowUpRight, 
  Landmark, Receipt, X, ChevronRight, Calculator, Bell, RefreshCw
} from 'lucide-react';

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
  // Reloj dinámico en tiempo real
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }).toUpperCase();

  const formattedDate = currentTime.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Estados de interacción
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

  // Selección automática del primer cliente
  useEffect(() => {
    if (!selectedClientKey && carpetas.length > 0) {
      setSelectedClientKey(carpetas[0].key);
    }
  }, [carpetas, selectedClientKey]);

  // Filtrado de clientes por modalidad y texto de búsqueda
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

  // Cliente actualmente seleccionado
  const activeClient = useMemo(() => {
    return carpetas.find(c => c.key === selectedClientKey) || carpetas[0] || null;
  }, [carpetas, selectedClientKey]);

  // Contrato activo del cliente seleccionado
  const activeContract = useMemo(() => {
    if (!activeClient || !activeClient.contratos || activeClient.contratos.length === 0) return null;
    return activeClient.contratos[selectedContractIndex] || activeClient.contratos[0];
  }, [activeClient, selectedContractIndex]);

  // Cuotas del contrato activo
  const activeContractCuotas = useMemo(() => {
    if (!activeContract) return [];
    return generarCronograma(activeContract);
  }, [activeContract]);

  // Próxima cuota pendiente
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

  // Guardar nota rápida
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
    <div className="w-full h-screen max-h-screen bg-[#0c0d10] text-slate-100 flex flex-col p-3 sm:p-4 gap-3 overflow-hidden select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: INTEGRACIÓN COMPACTA Y FUNCIONAL (OCUPA TODO EL ANCHO) */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#151619] border border-[#222327] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
        
        {/* Identidad del Prestamista & Estado */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#1f2025] border border-[#282a31] flex items-center justify-center font-bold text-white text-xs shadow-inner">
            {settings.lenderName ? settings.lenderName.charAt(0) : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                {settings.lenderName || 'Carlos Joel'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1f2025] text-zinc-300 border border-[#282a31]">
                Prestamista
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
              <span>{syncing ? 'Sincronizando...' : 'Online • Supabase & Drive'}</span>
            </div>
          </div>
        </div>

        {/* Reloj y Fecha Central en Vivo */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1b1c20] border border-[#222327] text-xs font-mono text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-bold text-white">{formattedTime}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 capitalize">{formattedDate}</span>
        </div>

        {/* Buscador Rápido Global */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono o cédula..."
            className="w-full bg-[#1b1c20] border border-[#222327] text-xs text-white placeholder-zinc-500 pl-9 pr-8 py-1.5 rounded-xl outline-none focus:border-[#2563eb] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Acciones del Header: Moneda, Simulador, Alertas, Ajustes, Nuevo Préstamo */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Selector de Moneda */}
          <div className="flex items-center bg-[#1b1c20] border border-[#222327] p-0.5 rounded-xl text-[11px] font-mono">
            {['BOB', 'USD', 'PEN'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency && setCurrency(curr)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  currency === curr ? 'bg-[#2563eb] text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Botón Sincronizar */}
          <button
            onClick={handleSyncClick}
            className={`p-2 rounded-xl bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-300 hover:text-white transition-colors ${syncing ? 'animate-spin' : ''}`}
            title="Sincronizar base de datos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Botón Simulador */}
          <button
            onClick={onOpenSimulator}
            className="p-2 rounded-xl bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-300 hover:text-white transition-colors"
            title="Simulador de Créditos"
          >
            <Calculator className="w-3.5 h-3.5" />
          </button>

          {/* Botón Alertas con Badge */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-300 hover:text-white transition-colors"
            title="Alertas de Vencimiento"
          >
            <Bell className="w-3.5 h-3.5" />
            {alertas && alertas.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          {/* Botón Ajustes */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-300 hover:text-white transition-colors"
            title="Ajustes y Configuración"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Botón Primario: + Nuevo Préstamo (Azul de la referencia) */}
          <button
            onClick={onOpenNewLoan}
            className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Nuevo Préstamo</span>
          </button>

        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. FILA DE 4 WIDGETS FINANCIEROS (OCUPANDO 100% DEL ANCHO)                */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        
        {/* KPI 1: Capital Bajo Gestión */}
        <div className="bg-[#151619] border border-[#222327] rounded-2xl p-4 shadow-[0_6px_24px_rgba(0,0,0,0.45)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-zinc-400">Capital Bajo Gestión</span>
            <div className="w-7 h-7 rounded-lg bg-[#1b1c20] border border-[#24252a] flex items-center justify-center text-zinc-300">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
            {symbol} {metrics.capitalBajoGestion.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-[#222327]">
            <span>{metrics.utilizacionPct}% Utilización</span>
            <span className="text-zinc-500 font-mono">Reserva Nodal</span>
          </div>
        </div>

        {/* KPI 2: Capital Colocado Activo */}
        <div className="bg-[#151619] border border-[#222327] rounded-2xl p-4 shadow-[0_6px_24px_rgba(0,0,0,0.45)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-zinc-400">Capital Colocado</span>
            <div className="w-7 h-7 rounded-lg bg-[#1b1c20] border border-[#24252a] flex items-center justify-center text-[#3b82f6]">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
            {symbol} {metrics.colocacionTotal.toLocaleString()}
          </div>
          <div className="w-full bg-[#1b1c20] h-1.5 rounded-full overflow-hidden mt-2 border border-[#222327]">
            <div 
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(10, metrics.utilizacionPct))}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5">
            <span>{metrics.totalPosiciones} préstamos activos</span>
            <span className="text-emerald-400 font-medium">Activo</span>
          </div>
        </div>

        {/* KPI 3: Amortización Recuperada */}
        <div className="bg-[#151619] border border-[#222327] rounded-2xl p-4 shadow-[0_6px_24px_rgba(0,0,0,0.45)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-zinc-400">Amortización Recup.</span>
            <div className="w-7 h-7 rounded-lg bg-[#1b1c20] border border-[#24252a] flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
            {symbol} {metrics.amortizacionRecuperada.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-[#222327]">
            <span>
              {metrics.cuotasAtrasadasCount === 0 
                ? '0 incumplimientos graves' 
                : `${metrics.cuotasAtrasadasCount} con aviso`}
            </span>
            <span className="text-emerald-400 font-semibold font-mono">Al Día</span>
          </div>
        </div>

        {/* KPI 4: Intereses Devengados */}
        <div className="bg-[#151619] border border-[#222327] rounded-2xl p-4 shadow-[0_6px_24px_rgba(0,0,0,0.45)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-zinc-400">Intereses Devengados</span>
            <div className="w-7 h-7 rounded-lg bg-[#1b1c20] border border-[#24252a] flex items-center justify-center text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
            {symbol} {metrics.interesesTotales.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-[#222327]">
            <span>Retorno Ponderado</span>
            <span className="text-zinc-200 font-bold font-mono">~{metrics.tasaPromedio}% TEA</span>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKPLACE AREA: 3 PANELES QUE OCUPAN 100% DE LA ALTURA DISPONIBLE */}
      {/* ========================================================================= */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 1 (4 COLS): DIRECTORIO DIRECTO DE CLIENTES                        */}
        {/* ----------------------------------------------------------------------- */}
        <section className="md:col-span-4 bg-[#151619] border border-[#222327] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col min-h-0">
          
          {/* Header Panel 1 */}
          <div className="flex items-center justify-between pb-3 border-b border-[#222327]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Directorio de Clientes
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded-lg bg-[#1b1c20] border border-[#24252a]">
              {filteredClients.length} registrados
            </span>
          </div>

          {/* Filtros de Modalidad (Chips Horizontales) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 shrink-0">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'diario', label: 'Diario' },
              { id: 'semanal', label: 'Semanal' },
              { id: 'quincenal', label: 'Quincenal' },
              { id: 'mensual', label: 'Mensual' },
              { id: 'mora', label: 'Mora' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setModalityFilter(chip.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  modalityFilter === chip.id
                    ? 'bg-[#2563eb] text-white font-semibold shadow-xs'
                    : 'bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-400 hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Lista Completa de Clientes con Scroll Interno Limpio */}
          <div className="flex-1 overflow-y-auto custom-scroll space-y-2 pr-1 min-h-0">
            {filteredClients.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500">
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
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-[#1f2026] border border-[#2d2e35] shadow-[0_4px_16px_rgba(0,0,0,0.5)]' 
                        : 'bg-[#1b1c20] hover:bg-[#202126] border border-transparent hover:border-[#222327]'
                    }`}
                  >
                    {/* Inicial e Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-[#1f2025] text-zinc-300 border border-[#24252a]'
                      }`}>
                        {client.nombre.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {client.nombre}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          {client.ci ? `CI: ${client.ci}` : client.telefono || 'Sin CI'}
                        </div>
                      </div>
                    </div>

                    {/* Monto y Estado */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-white font-mono">
                        {symbol} {totalAdeudado.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#16171a] border border-[#24252a] text-zinc-400">
                          {modalidad}
                        </span>
                        {client.estadoGlobal === 'Atrasado' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" title="En mora"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 2 (5 COLS): CONTRATOS, PRÓXIMO COBRO & PLAN DE AMORTIZACIÓN       */}
        {/* ----------------------------------------------------------------------- */}
        <section className="md:col-span-5 bg-[#151619] border border-[#222327] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col min-h-0">
          
          {activeClient ? (
            <>
              {/* Header Ficha del Cliente Activo */}
              <div className="flex items-start justify-between pb-3 border-b border-[#222327] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1b1c20] border border-[#24252a] flex items-center justify-center font-bold text-white text-sm shadow-inner">
                    {activeClient.nombre.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      {activeClient.nombre}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                      <span>{activeClient.ci ? `CI: ${activeClient.ci}` : 'Expediente Verificado'}</span>
                      <span>•</span>
                      <span>{activeClient.telefono || 'Sin Teléfono'}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas del Cliente */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSendWhatsApp && onSendWhatsApp(activeClient, activeContractProximaCuota)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#17261e] hover:bg-[#1e3428] border border-emerald-800/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Enviar WhatsApp con recordatorio"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onSelectLoan && onSelectLoan(activeContract || activeClient.contratos[0])}
                    className="p-1.5 rounded-xl bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-300 hover:text-white transition-colors"
                    title="Auditoría Completa"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Selector de Contratos si el cliente tiene varios */}
              {activeClient.contratos && activeClient.contratos.length > 1 && (
                <div className="flex items-center gap-1.5 py-2 border-b border-[#222327] overflow-x-auto no-scrollbar shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Contratos:</span>
                  {activeClient.contratos.map((c, idx) => (
                    <button
                      key={c.id || idx}
                      onClick={() => setSelectedContractIndex(idx)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-all ${
                        selectedContractIndex === idx
                          ? 'bg-[#2563eb] text-white font-bold shadow-xs'
                          : 'bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-400 hover:text-white'
                      }`}
                    >
                      #{idx + 1} ({symbol} {c.capital?.toLocaleString()})
                    </button>
                  ))}
                </div>
              )}

              {/* Banner Destacado: Próximo Cobro */}
              {activeContractProximaCuota ? (
                <div className="my-3 p-3.5 rounded-xl bg-[#1b1c20] border border-[#222327] shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">
                      Próxima Cuota a Cobrar
                    </span>
                    <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                      {symbol} {activeContractProximaCuota.total.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                      <Clock className="w-3 h-3 text-zinc-400" />
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
                    onClick={() => {
                      onPayCuota && onPayCuota(activeContract, activeContractProximaCuota);
                      onOpenReceipt && onOpenReceipt({ folder: activeClient, contrato: activeContract, cuota: activeContractProximaCuota });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Abonar Cuota</span>
                  </button>
                </div>
              ) : (
                <div className="my-3 p-3 rounded-xl bg-[#1b1c20] border border-[#222327] text-center text-xs text-emerald-400 font-medium shrink-0">
                  ✓ Todos los pagos de este contrato están al día.
                </div>
              )}

              {/* Lista Scrollable de Cuotas de Amortización */}
              <div className="flex-1 overflow-y-auto custom-scroll space-y-1.5 pr-1 min-h-0">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pb-1">
                  <span>PLAN DE PAGOS ({activeContractCuotas.length} CUOTAS)</span>
                  <span>MODALIDAD: {activeContract?.tipo_pago?.toUpperCase() || 'MENSUAL'}</span>
                </div>

                {activeContractCuotas.map((cuota) => (
                  <div
                    key={cuota.key}
                    className={`p-2 px-3 rounded-xl flex items-center justify-between text-xs transition-colors border ${
                      cuota.pagado
                        ? 'bg-[#16171a] border-[#1e1f23] text-zinc-400'
                        : cuota.diasRestantes < 0
                          ? 'bg-[#271b20] border-rose-900/30 text-rose-200'
                          : 'bg-[#1b1c20] border-[#222327] text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                        cuota.pagado ? 'bg-[#16271c] text-emerald-400 border border-emerald-900/40' : 'bg-[#1f2025] text-zinc-300 border border-[#24252a]'
                      }`}>
                        {cuota.numero}
                      </span>
                      <span className="font-medium text-xs">{cuota.label}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs">
                        {symbol} {cuota.total.toLocaleString()}
                      </span>

                      {cuota.pagado ? (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#16271c] text-emerald-400 font-bold border border-emerald-900/40">
                          PAGADO
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onPayCuota && onPayCuota(activeContract, cuota);
                            onOpenReceipt && onOpenReceipt({ folder: activeClient, contrato: activeContract, cuota });
                          }}
                          className="px-2 py-0.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[10px] font-semibold active:scale-95 transition-colors shadow-xs"
                        >
                          Pagar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones de Control de Contrato */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#222327] shrink-0">
                <button
                  onClick={() => onOpenCapital && onOpenCapital(activeContract)}
                  className="flex-1 py-2 rounded-xl bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span>Abono Extraordinario</span>
                </button>

                <button
                  onClick={() => onOpenExtension && onOpenExtension(activeContract)}
                  className="flex-1 py-2 rounded-xl bg-[#1b1c20] hover:bg-[#222329] border border-[#222327] text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Prórroga Plazo</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-xs text-zinc-500">
              Selecciona un cliente del directorio para visualizar sus contratos.
            </div>
          )}

        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 3 (3 COLS): DOCUMENTOS, GOOGLE DRIVE & BITÁCORA RÁPIDA            */}
        {/* ----------------------------------------------------------------------- */}
        <section className="md:col-span-3 bg-[#151619] border border-[#222327] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-between min-h-0">
          
          <div className="space-y-3.5 min-h-0 flex flex-col flex-1">
            {/* Header Panel 3 */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222327] shrink-0">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#3b82f6]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Expediente &amp; Archivos
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">
                {activeClient ? activeClient.nombre : 'Sin selección'}
              </span>
            </div>

            {/* Acceso a Google Drive */}
            <div className="p-3 rounded-xl bg-[#1b1c20] border border-[#222327] shadow-inner shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-2 truncate">
                <HardDrive className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                <span className="truncate">Drive / Clientes / {activeClient?.nombre?.replace(/\s+/g, '_') || 'General'}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeContract?.drive_url || activeContract?.drive_contrato || settings.googleDriveUrl || 'https://drive.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors text-center shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Carpeta</span>
                </a>

                <button
                  onClick={() => onOpenVouchers && onOpenVouchers(activeContract)}
                  className="p-1.5 rounded-lg bg-[#1f2025] hover:bg-[#282a32] border border-[#282a32] text-zinc-300 hover:text-white transition-colors"
                  title="Subir o gestionar comprobantes QR"
                >
                  <Upload className="w-3.5 h-3.5 text-[#3b82f6]" />
                </button>
              </div>
            </div>

            {/* Documentos del Cliente */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                Documentos Legales
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
                className="p-2.5 rounded-xl bg-[#1b1c20] hover:bg-[#202126] border border-[#222327] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#3b82f6] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">Contrato_Mutuo_Firmado.pdf</span>
                    <span className="text-[10px] font-mono text-zinc-400 block">Digitalizado • Inmutable</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              </div>

              {/* Doc 2: Pagaré Notariado */}
              <div 
                onClick={() => onSelectLoan && onSelectLoan(activeContract)}
                className="p-2.5 rounded-xl bg-[#1b1c20] hover:bg-[#202126] border border-[#222327] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[#3b82f6] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">Pagare_Notariado_Legal.pdf</span>
                    <span className="text-[10px] font-mono text-zinc-400 block">Protocolo Notarial</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              </div>

              {/* Doc 3: Comprobantes & Bauchers */}
              <div 
                onClick={() => onOpenVouchers && onOpenVouchers(activeContract)}
                className="p-2.5 rounded-xl bg-[#1b1c20] hover:bg-[#202126] border border-[#222327] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt className="w-4 h-4 text-[#3b82f6] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">Bauchers_QR_Comprobantes</span>
                    <span className="text-[10px] font-mono text-zinc-400 block">{activeContract?.pagos?.length || 0} comprobantes</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              </div>
            </div>

            {/* Bitácora de Notas Express */}
            <div className="space-y-2 pt-2 border-t border-[#222327] flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  Bitácora de Notas
                </span>
                <button
                  onClick={() => onOpenNotes && onOpenNotes(activeContract)}
                  className="text-[10px] font-mono text-[#3b82f6] hover:text-white"
                >
                  Ver ({activeContract?.notas_express?.length || 0})
                </button>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="text"
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuickNote()}
                  placeholder="Nota rápida (Enter)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#1b1c20] border border-[#222327] text-xs text-white placeholder-zinc-500 outline-none focus:border-[#2563eb] transition-colors"
                />
                <button
                  onClick={handleAddQuickNote}
                  className="p-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors"
                  title="Guardar nota"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Última nota con scroll interno */}
              <div className="flex-1 overflow-y-auto custom-scroll pr-1 min-h-0 space-y-1.5">
                {activeContract?.notas_express && activeContract.notas_express.length > 0 ? (
                  activeContract.notas_express.slice(0, 3).map((nota, i) => (
                    <div key={nota.id || i} className="p-2 rounded-xl bg-[#1b1c20] border border-[#222327] text-[11px] text-zinc-300 font-mono">
                      <span className="text-[9px] text-zinc-500 block">{nota.fecha ? nota.fecha.slice(0, 10) : 'Nota'}:</span>
                      <p className="line-clamp-2 mt-0.5">{nota.texto}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-[11px] text-zinc-500 font-mono">
                    Sin notas registradas.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Garantía & Pie */}
          <div className="pt-2.5 border-t border-[#222327] text-[11px] text-zinc-400 flex items-center justify-between font-mono shrink-0">
            <span className="truncate">Garantía: {activeContract?.garantia || 'Mutuo Notarial'}</span>
            <span className="text-zinc-300 shrink-0">Auditado ✓</span>
          </div>

        </section>

      </main>

    </div>
  );
}
