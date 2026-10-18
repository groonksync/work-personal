import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Plus, HardDrive, MessageCircle, 
  Check, ArrowRight, X, ExternalLink, Calendar, Users, 
  DollarSign, Calculator, Layers, Sliders, RefreshCw, Sparkles,
  Folder, Clock, ArrowUpRight, ArrowDownLeft, Search, Move,
  FileText, CheckCircle2, AlertTriangle, ChevronRight, CornerDownRight,
  Percent, ShieldCheck, TrendingUp
} from 'lucide-react';
import { generarCronograma, formatDate, toDate } from '../lib/amortizacion';

export default function FlowCanvas({
  prestamos = [],
  currency = 'BOB',
  counts = {},
  totalCapital = 380200,
  onSelectLoan,
  onOpenNewLoan,
  onPayCuota,
  onSendWhatsApp,
  onOpenSimulator,
  onOpenReceipt,
  onOpenFolder,
  onOpenExtension,
  onChangeViewMode,
  defaultDriveUrl = 'https://drive.google.com'
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Estados de navegación del Lienzo (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Selección de nodo para expandir la ramificación satelital
  // Por defecto, si hay préstamos, seleccionamos el primero para que se vea la ramificación de inmediato
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Filtros de cartera y búsqueda predictiva
  const [filterState, setFilterState] = useState('todos'); // 'todos' | 'otorgados' | 'urgentes'
  const [searchQuery, setSearchQuery] = useState('');

  // Arrastre libre de nodos (Drag & Drop)
  const [nodePositions, setNodePositions] = useState({});
  const [draggedNode, setDraggedNode] = useState(null);

  const containerRef = useRef(null);

  // Filtrado de préstamos
  const filteredLoans = useMemo(() => {
    return prestamos.filter(p => {
      if (filterState === 'otorgados' && p.tipo_prestamo === 'recibido') return false;
      if (filterState === 'urgentes') {
        const cron = generarCronograma(p);
        const prox = cron.find(c => !c.pagado);
        if (!prox || prox.diasRestantes > 3) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.nombre?.toLowerCase().includes(q);
        const matchCI = p.ci?.toLowerCase().includes(q);
        const matchTel = p.telefono?.includes(q);
        return matchName || matchCI || matchTel;
      }
      return true;
    });
  }, [prestamos, filterState, searchQuery]);

  // Si no hay seleccionado o el seleccionado fue filtrado, seleccionar el primero
  useEffect(() => {
    if (filteredLoans.length > 0 && (!selectedNodeId || !filteredLoans.some(p => p.id === selectedNodeId))) {
      setSelectedNodeId(filteredLoans[0].id);
    }
  }, [filteredLoans, selectedNodeId]);

  // Cálculo de posiciones de los deudores en columna vertical elegante
  const calculateDefaultPositions = useCallback(() => {
    const positions = {};
    const startY = 120;
    const rowSpacing = 135;

    filteredLoans.forEach((loan, idx) => {
      positions[loan.id] = {
        x: 480,
        y: startY + (idx * rowSpacing),
      };
    });
    return positions;
  }, [filteredLoans]);

  useEffect(() => {
    setNodePositions(prev => {
      const defaults = calculateDefaultPositions();
      const updated = { ...defaults };
      Object.keys(prev).forEach(id => {
        if (prev[id] && updated[id]) {
          updated[id] = prev[id];
        }
      });
      return updated;
    });
  }, [calculateDefaultPositions]);

  // Nodo Maestro (Fondo Central) a la izquierda
  const rootNode = useMemo(() => {
    const totalCalc = prestamos.reduce((acc, p) => acc + (parseFloat(p.capital) || 0), 0);
    const displayedCapital = totalCalc > 0 ? totalCalc : totalCapital;
    return {
      x: 100,
      y: 300,
      title: 'Fondo Central',
      amount: `${symbol} ${Number(displayedCapital).toLocaleString()}`,
    };
  }, [prestamos, totalCapital, symbol]);

  // Manejo de Pan del lienzo
  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.flow-node') || e.target.closest('.interactive-dock') || e.target.closest('button') || e.target.closest('input')) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }
    if (draggedNode) {
      const deltaX = (e.clientX - draggedNode.startMouseX) / zoom;
      const deltaY = (e.clientY - draggedNode.startMouseY) / zoom;
      setNodePositions(prev => ({
        ...prev,
        [draggedNode.id]: {
          x: Math.round(draggedNode.initialX + deltaX),
          y: Math.round(draggedNode.initialY + deltaY),
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  // Iniciar arrastre de un nodo
  const handleNodeStartDrag = (e, loanId) => {
    e.stopPropagation();
    const currentPos = nodePositions[loanId] || { x: 480, y: 120 };
    setDraggedNode({
      id: loanId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y,
    });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(1.5, Number((prev + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 40, y: 80 });
  };

  // Datos del deudor seleccionado para la ramificación satelital
  const selectedLoan = useMemo(() => {
    return prestamos.find(p => p.id === selectedNodeId) || filteredLoans[0] || null;
  }, [prestamos, selectedNodeId, filteredLoans]);

  // Cálculos financieros del deudor seleccionado
  const selectedLoanMetrics = useMemo(() => {
    if (!selectedLoan) return null;
    const cronograma = generarCronograma(selectedLoan);
    const totalCuotas = cronograma.length;
    const cuotasPagadas = cronograma.filter(c => c.pagado).length;
    const pctAmortizado = totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : 0;
    const proximaCuota = cronograma.find(c => !c.pagado) || cronograma[cronograma.length - 1] || {
      numero: 1,
      total: Math.round((parseFloat(selectedLoan.capital) || 10000) * 0.1),
      fechaVencimiento: '24 Oct 2026',
      diasRestantes: 2
    };

    return {
      cronograma,
      totalCuotas,
      cuotasPagadas,
      pctAmortizado,
      proximaCuota,
      driveUrl: selectedLoan.drive_url || selectedLoan.drive_contrato || defaultDriveUrl,
    };
  }, [selectedLoan, defaultDriveUrl]);

  // Métricas para el Dock Inferior Flotante
  const dockMetrics = useMemo(() => {
    let totalCobradoMes = 0;
    let metaMes = 0;
    const cobrosDelDia = [];
    const hoyStr = formatDate(new Date());

    prestamos.forEach(p => {
      const cron = generarCronograma(p);
      cron.forEach(c => {
        metaMes += c.total;
        if (c.pagado) {
          totalCobradoMes += c.total;
        } else if (c.diasRestantes <= 0 || c.fechaVencimiento === hoyStr) {
          if (cobrosDelDia.length < 3) {
            cobrosDelDia.push({
              prestamo: p,
              cuota: c,
              nombre: p.nombre,
              monto: c.total,
              fecha: c.fechaVencimiento,
            });
          }
        }
      });
    });

    const metaFijada = metaMes > 0 ? metaMes : 55000;
    const pctMeta = Math.min(100, Math.round((totalCobradoMes / metaFijada) * 100));

    return {
      totalCobradoMes: totalCobradoMes > 0 ? totalCobradoMes : 45200,
      pctMeta: pctMeta > 0 ? pctMeta : 85,
      cobrosDelDia,
    };
  }, [prestamos]);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`w-full h-full relative overflow-hidden select-none bg-[#08090a] dots-grid ${
        isPanning ? 'cursor-grabbing' : draggedNode ? 'cursor-move' : 'cursor-default'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR MINIMALISTA (PROPUESTA 2)                               */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between gap-3 pointer-events-none">
        
        {/* Título de la Aplicación y del Árbol */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-xl text-white">
          <span className="font-bold text-xs tracking-tight text-white">Work Personal</span>
          <span className="text-[#3a3d46]">•</span>
          <span className="text-xs text-[#858994]">Árbol de Préstamos</span>
        </div>

        {/* Filtros Segmentados de Cartera */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-xl text-xs">
          {[
            { id: 'todos', label: '[Todos]' },
            { id: 'otorgados', label: '[Por Cobrar]' },
            { id: 'urgentes', label: '[En Mora]' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterState(f.id)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                filterState === f.id
                  ? 'bg-white text-[#0d0e11] shadow-xs'
                  : 'text-[#858994] hover:text-white hover:bg-[#1a1b20]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Buscador Predictivo */}
        <div className="pointer-events-auto hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-xl text-white w-52">
          <Search className="w-3.5 h-3.5 text-[#858994]" />
          <input
            type="text"
            placeholder="Buscar deudor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-[#686c77] focus:outline-none w-full font-mono"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#858994] hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Período y Controles de Zoom */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-xl text-xs text-[#858994]">
            <span className="text-white font-semibold">Octubre 2026</span>
            <span className="text-[#3a3d46]">•</span>
            <span className="font-mono text-white font-bold">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomOut} className="hover:text-white p-0.5" title="Reducir">
              <ZoomOut className="w-3 h-3" />
            </button>
            <button onClick={handleZoomIn} className="hover:text-white p-0.5" title="Aumentar">
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onOpenNewLoan}
            className="h-9 px-4 rounded-xl bg-white hover:bg-zinc-200 text-[#0d0e11] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xl"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nuevo</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. LIENZO CENTRAL CON ÁRBOL Y RAMIFICACIÓN SATELITAL                     */}
      {/* ========================================================================= */}
      <div 
        className="w-full h-full absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* SVG CON CABLES BÉZIER: MAESTRO -> DEUDORES & DEUDOR -> SATÉLITES */}
        <svg 
          className="absolute inset-0 pointer-events-none overflow-visible w-full h-full"
          style={{ minWidth: '4000px', minHeight: '4000px' }}
        >
          {/* Cables Bézier desde el Fondo Central a cada Deudor */}
          {filteredLoans.map((loan) => {
            const pos = nodePositions[loan.id];
            if (!pos) return null;

            const startX = rootNode.x + 190;
            const startY = rootNode.y + 30;
            const endX = pos.x;
            const endY = pos.y + 24;

            const isSelected = selectedNodeId === loan.id;
            const dx = Math.abs(endX - startX) * 0.5;

            return (
              <path
                key={`cable-root-${loan.id}`}
                d={`M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={isSelected ? '#ffffff' : '#2b2d35'}
                strokeWidth={isSelected ? '2.25' : '1.5'}
                className="transition-colors duration-200"
              />
            );
          })}

          {/* Cables Bézier desde el Deudor Seleccionado hacia sus 3 Nodos Satélites */}
          {selectedLoan && nodePositions[selectedLoan.id] && (
            (() => {
              const deudorPos = nodePositions[selectedLoan.id];
              const deudorStartX = deudorPos.x + 230;
              const deudorStartY = deudorPos.y + 24;

              // Coordenadas de los 3 satélites
              const sat1X = deudorPos.x + 360;
              const sat1Y = deudorPos.y - 70;

              const sat2X = deudorPos.x + 360;
              const sat2Y = deudorPos.y + 25;

              const sat3X = deudorPos.x + 360;
              const sat3Y = deudorPos.y + 140;

              const dxSat = 65;

              return (
                <g key={`satellites-cables-${selectedLoan.id}`}>
                  {/* Cable a Satélite 1 (Contrato Activo) */}
                  <path
                    d={`M ${deudorStartX} ${deudorStartY} C ${deudorStartX + dxSat} ${deudorStartY}, ${sat1X - dxSat} ${sat1Y + 30}, ${sat1X} ${sat1Y + 30}`}
                    fill="none"
                    stroke="#858994"
                    strokeWidth="1.75"
                  />
                  {/* Cable a Satélite 2 (Próxima Cuota) */}
                  <path
                    d={`M ${deudorStartX} ${deudorStartY} C ${deudorStartX + dxSat} ${deudorStartY}, ${sat2X - dxSat} ${sat2Y + 35}, ${sat2X} ${sat2Y + 35}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Cable a Satélite 3 (Garantía & Drive) */}
                  <path
                    d={`M ${deudorStartX} ${deudorStartY} C ${deudorStartX + dxSat} ${deudorStartY}, ${sat3X - dxSat} ${sat3Y + 25}, ${sat3X} ${sat3Y + 25}`}
                    fill="none"
                    stroke="#858994"
                    strokeWidth="1.75"
                  />
                </g>
              );
            })()
          )}
        </svg>

        {/* NODO MAESTRO: FONDO CENTRAL (CON AURA CIRCULAR MONOCROMÁTICA TENUE) */}
        <div
          style={{ left: `${rootNode.x}px`, top: `${rootNode.y}px` }}
          className="flow-node absolute z-20 flex items-center"
        >
          {/* Esfera con aura luminosa monocromática */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#141518] border-2 border-white/40 ring-4 ring-white/10 shadow-[0_0_40px_rgba(255,255,255,0.08)] flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
            </div>

            {/* Píldora horizontal adosada */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 pl-8 pr-5 py-2.5 rounded-2xl bg-[#141518] border border-[#2b2d35] shadow-2xl flex flex-col justify-center min-w-[155px]">
              <span className="text-xs font-bold text-white tracking-tight leading-tight">
                {rootNode.title}
              </span>
              <span className="text-[11px] font-mono text-[#858994] font-medium mt-0.5">
                {rootNode.amount}
              </span>
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL DE DEUDORES */}
        {filteredLoans.map((loan) => {
          const pos = nodePositions[loan.id];
          if (!pos) return null;

          const isSelected = selectedNodeId === loan.id;
          const isBeingDragged = draggedNode?.id === loan.id;
          const cap = parseFloat(loan.capital) || 10000;

          return (
            <div
              key={loan.id}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(loan.id);
              }}
              className="flow-node absolute z-20 transition-all duration-150"
            >
              {/* Tarjeta Cápsula del Deudor */}
              <div
                className={`w-56 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 relative group ${
                  isSelected
                    ? 'bg-[#18191d] border-white ring-2 ring-white/10 shadow-2xl scale-[1.03]'
                    : isBeingDragged
                      ? 'bg-[#18191d] border-white/60 shadow-xl opacity-90'
                      : 'bg-[#141518]/90 hover:bg-[#18191d] border-[#24252a] hover:border-[#383b46] shadow-md'
                }`}
              >
                {/* Agarre Drag & Drop */}
                <div 
                  onMouseDown={(e) => handleNodeStartDrag(e, loan.id)}
                  className="absolute -top-2 right-3 w-4 h-4 rounded-full bg-[#1e2026] text-[#717580] hover:text-white flex items-center justify-center cursor-grab active:cursor-grabbing text-[8px]"
                  title="Arrastrar posición"
                >
                  <Move className="w-2.5 h-2.5" />
                </div>

                {/* Avatar e Información Principal */}
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#24262d] border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    {loan.nombre?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-zinc-100">
                      {loan.nombre}
                    </h4>
                    <span className="text-[10px] text-[#858994] font-mono block">
                      {symbol} {cap.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Badge de Estado */}
                <div className="shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border ${
                    isSelected
                      ? 'bg-white text-[#0d0e11] border-white'
                      : 'bg-[#1a1b20] text-[#858994] border-[#26282e]'
                  }`}>
                    Al Día
                  </span>
                </div>

                {/* Conector de entrada izquierdo */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#141518] border-2 border-[#383b46]" />

                {/* Conector de salida derecho */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#141518] border-2 border-[#383b46]" />
              </div>
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* 3 SUB-NODOS SATÉLITES FLOTANTES QUE BROTAN DEL DEUDOR SELECCIONADO       */}
        {/* ========================================================================= */}
        {selectedLoan && selectedLoanMetrics && nodePositions[selectedLoan.id] && (
          (() => {
            const deudorPos = nodePositions[selectedLoan.id];
            const satX = deudorPos.x + 360;

            const sat1Y = deudorPos.y - 70;
            const sat2Y = deudorPos.y + 25;
            const sat3Y = deudorPos.y + 140;

            const { pctAmortizado, proximaCuota, driveUrl } = selectedLoanMetrics;

            return (
              <>
                {/* SATÉLITE 1: CONTRATO ACTIVO #01 CON DONUT GAUGE DE AMORTIZACIÓN */}
                <div
                  style={{ left: `${satX}px`, top: `${sat1Y}px` }}
                  className="flow-node absolute z-30 w-64 p-3 rounded-2xl bg-[#141518] border border-[#2b2d35] shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-left-4 duration-150"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[11px] font-bold text-white block">
                      Contrato Activo #01
                    </span>
                    <span className="text-[10px] text-[#858994] font-mono block">
                      {symbol} {Number(selectedLoan.capital || 15000).toLocaleString()} (10% mensual)
                    </span>
                  </div>

                  {/* Donut Gauge Circular de Amortización */}
                  <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#24252a]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-white"
                        strokeDasharray={`${pctAmortizado}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[9px] font-mono font-bold text-white">
                      {pctAmortizado}%
                    </span>
                  </div>
                </div>

                {/* SATÉLITE 2: PRÓXIMA CUOTA #04 CON BOTÓN BLANCO DESTACADO [ABONAR] */}
                <div
                  style={{ left: `${satX}px`, top: `${sat2Y}px` }}
                  className="flow-node absolute z-30 w-64 p-3.5 rounded-2xl bg-[#18191d] border border-white/20 shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-left-4 duration-150"
                >
                  <div>
                    <span className="text-[11px] font-bold text-white block">
                      Próxima Cuota #04
                    </span>
                    <span className="text-[10px] text-[#858994] font-mono block">
                      {symbol} {Number(proximaCuota.total || 1500).toLocaleString()} (Vence {proximaCuota.fechaVencimiento || '24 Oct'})
                    </span>
                  </div>

                  {/* Botón Blanco de Abono Rápido */}
                  <button
                    onClick={() => onPayCuota && onPayCuota(selectedLoan, proximaCuota)}
                    className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-[#0d0e11] font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>[Abonar]</span>
                  </button>
                </div>

                {/* SATÉLITE 3: GARANTÍA NOTARIADA & ENLACE GOOGLE DRIVE */}
                <div
                  style={{ left: `${satX}px`, top: `${sat3Y}px` }}
                  className="flow-node absolute z-30 w-64 p-3 rounded-2xl bg-[#141518] border border-[#2b2d35] shadow-2xl flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-left-4 duration-150"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-xl bg-[#22242b] border border-white/5 flex items-center justify-center text-zinc-300 shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-bold text-white block truncate">
                        Garantía Notariada
                      </span>
                      <span className="text-[10px] text-[#858994] block truncate">
                        Google Drive
                      </span>
                    </div>
                  </div>

                  <a
                    href={driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#1f2026] hover:bg-[#282a32] text-zinc-300 hover:text-white border border-white/5 transition-all"
                    title="Abrir contrato o carpeta en Google Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            );
          })()
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. MINI-MAP (RADAR NAVIGATION) EN LA ESQUINA INFERIOR IZQUIERDA           */}
      {/* ========================================================================= */}
      <div className="absolute left-6 bottom-6 z-30 pointer-events-none">
        <div className="pointer-events-auto p-3 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-2xl w-48 space-y-2">
          
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#858994]">
            <span>Mini-Map (Radar Navigation)</span>
          </div>

          {/* Radar Preview en Miniatura SVG */}
          <div className="w-full h-20 rounded-xl bg-[#0d0e11] border border-[#202126] p-1.5 flex items-center justify-between relative overflow-hidden">
            {/* Nodo Maestro Mini */}
            <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Línea conectora mini */}
            <div className="h-px bg-[#2b2d35] flex-1 mx-2" />

            {/* Deudores Mini */}
            <div className="space-y-1">
              <div className="w-9 h-2 rounded-full bg-[#202126]" />
              <div className="w-11 h-2 rounded-full bg-white/80" />
              <div className="w-8 h-2 rounded-full bg-[#202126]" />
            </div>

            {/* Satélites Mini */}
            <div className="space-y-0.5 pl-1.5 border-l border-[#24252a]">
              <div className="w-4 h-1.5 rounded bg-[#2b2d35]" />
              <div className="w-4 h-1.5 rounded bg-white/70" />
              <div className="w-4 h-1.5 rounded bg-[#2b2d35]" />
            </div>

            {/* Botones de Control de Zoom Integrados */}
            <div className="absolute right-1.5 bottom-1.5 flex flex-col gap-0.5">
              <button
                onClick={handleZoomIn}
                className="w-4 h-4 rounded bg-[#1f2026] hover:bg-[#282a32] text-white flex items-center justify-center text-[10px]"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="w-4 h-4 rounded bg-[#1f2026] hover:bg-[#282a32] text-white flex items-center justify-center text-[10px]"
              >
                -
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DOCK INFERIOR FLOTANTE DESACOPLADO (PROPUESTA 2)                       */}
      {/* ========================================================================= */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="pointer-events-auto interactive-dock px-5 py-3 rounded-2xl bg-[#141518]/95 backdrop-blur-md border border-[#24252a] shadow-2xl flex items-center gap-6 text-white max-w-4xl">
          
          {/* MÓDULO 1: FLUJO SEMANAL (WEEKLY CASHFLOW SPARKLINE) */}
          <div className="flex items-center gap-3 pr-5 border-r border-[#24252a]">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#858994] font-semibold uppercase tracking-wider">
                <span>Weakly Cashflow</span>
                <TrendingUp className="w-3 h-3 text-zinc-400" />
              </div>

              {/* Sparkline de barras miniatura de Lun a Dom */}
              <div className="flex items-end gap-1.5 mt-2 h-7">
                {[
                  { dia: 'Lun', h: 10 },
                  { dia: 'Mar', h: 16 },
                  { dia: 'Mié', h: 12 },
                  { dia: 'Jue', h: 22 },
                  { dia: 'Vie', h: 18 },
                  { dia: 'Sáb', h: 26 },
                  { dia: 'Dom', h: 14 },
                ].map((b, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-1.5 rounded-full ${idx === 5 ? 'bg-white' : 'bg-[#2b2d35]'}`}
                      style={{ height: `${b.h}px` }}
                    />
                    <span className="text-[8px] font-mono text-[#686c77]">{b.dia.charAt(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MÓDULO 2: COBRANZA MENSUAL (MONTHLY COLLECTION & PROGRESS) */}
          <div className="pr-5 border-r border-[#24252a] min-w-[170px] space-y-1">
            <span className="text-[10px] text-[#858994] uppercase font-semibold tracking-wider block">
              Monthly Collection
            </span>
            <div className="text-base font-mono font-bold text-white tracking-tight">
              {symbol} {dockMetrics.totalCobradoMes.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#858994]">
              <span>Cobrados</span>
              <span className="text-white font-bold">{dockMetrics.pctMeta}% Meta</span>
            </div>
            {/* Barra de progreso horizontal */}
            <div className="w-full h-1 bg-[#202126] rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${dockMetrics.pctMeta}%` }}
              />
            </div>
          </div>

          {/* MÓDULO 3: ACCIONES RÁPIDAS DE COBRO (QUICK ACTION COLLECTIONS) */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#858994] uppercase font-semibold tracking-wider block">
              Quick Action Collections
            </span>
            
            <div className="flex items-center gap-2">
              {dockMetrics.cobrosDelDia.length > 0 ? (
                dockMetrics.cobrosDelDia.map((it, idx) => (
                  <div 
                    key={idx}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1c1d22] border border-[#282a32] flex items-center gap-2 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-white block truncate max-w-[85px]">
                        {it.nombre}
                      </span>
                      <span className="text-[9px] font-mono text-[#858994]">
                        {symbol}{it.monto}
                      </span>
                    </div>
                    <button
                      onClick={() => onPayCuota && onPayCuota(it.prestamo, it.cuota)}
                      className="px-2 py-0.5 rounded-lg bg-white hover:bg-zinc-200 text-[#0d0e11] font-bold text-[10px] transition-all"
                    >
                      Cobrar
                    </button>
                  </div>
                ))
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-[#1c1d22] border border-[#282a32] flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-white block">
                      Today's due
                    </span>
                    <span className="text-[9px] font-mono text-[#858994]">
                      Al Día • Sin Mora
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedLoan && selectedLoanMetrics) {
                        onPayCuota && onPayCuota(selectedLoan, selectedLoanMetrics.proximaCuota);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-[#0d0e11] font-bold text-[10px] transition-all"
                  >
                    Cobrar
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
