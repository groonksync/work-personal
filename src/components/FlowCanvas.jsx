import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Plus, HardDrive, MessageCircle, 
  Check, ArrowRight, X, ExternalLink, Calendar, Users, 
  DollarSign, Calculator, Layers, Sliders, RefreshCw, Sparkles,
  Folder, Clock, ArrowUpRight, ArrowDownLeft, Search, Move,
  FileText, CheckCircle2, AlertTriangle, ChevronRight, CornerDownRight,
  Percent, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { generarCronograma } from '../lib/amortizacion';

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

  // Estados del Lienzo Interactivo (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Modo de visualización de nodos: 'detailed' (Pro con barra y cuotas) | 'compact' (Minimalista)
  const [nodeDetailMode, setNodeDetailMode] = useState('detailed');

  // Búsqueda y filtrado dentro del lienzo
  const [searchInternal, setSearchInternal] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [filterState, setFilterState] = useState('todos'); // 'todos' | 'otorgados' | 'recibidos' | 'urgentes'

  // Arrastre interactivo de nodos individuales (Drag & Drop)
  const [nodePositions, setNodePositions] = useState({});
  const [draggedNode, setDraggedNode] = useState(null); // { id, startMouseX, startMouseY, initialX, initialY }

  const containerRef = useRef(null);

  // Filtrado de préstamos a mostrar en el flujo
  const filteredLoans = useMemo(() => {
    return prestamos.filter(p => {
      // Filtro de cartera
      if (filterState === 'otorgados' && p.tipo_prestamo === 'recibido') return false;
      if (filterState === 'recibidos' && p.tipo_prestamo !== 'recibido') return false;
      if (filterState === 'urgentes') {
        const cron = generarCronograma(p);
        const prox = cron.find(c => !c.pagado);
        if (!prox || prox.diasRestantes > 3) return false;
      }

      // Filtro de búsqueda por texto
      if (searchInternal.trim()) {
        const q = searchInternal.toLowerCase();
        const matchName = p.nombre?.toLowerCase().includes(q);
        const matchCI = p.ci?.toLowerCase().includes(q);
        const matchTel = p.telefono?.includes(q);
        return matchName || matchCI || matchTel;
      }

      return true;
    });
  }, [prestamos, filterState, searchInternal]);

  // Cálculo de posiciones iniciales automáticas en cuadrícula escalonada de 3 columnas
  const calculateDefaultPositions = useCallback(() => {
    const positions = {};
    const colSpacing = nodeDetailMode === 'detailed' ? 420 : 360;
    const rowSpacing = nodeDetailMode === 'detailed' ? 240 : 150;

    filteredLoans.forEach((loan, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      positions[loan.id] = {
        x: 480 + (col * colSpacing),
        y: 100 + (row * rowSpacing) + (col % 2 === 1 ? 35 : 0),
      };
    });
    return positions;
  }, [filteredLoans, nodeDetailMode]);

  // Sincronizar posiciones cuando cambian los filtros o se reinicia
  useEffect(() => {
    setNodePositions(prev => {
      const defaults = calculateDefaultPositions();
      // Preservar posiciones que el usuario ya movió manualmente si existen
      const updated = { ...defaults };
      Object.keys(prev).forEach(id => {
        if (prev[id] && updated[id]) {
          updated[id] = prev[id];
        }
      });
      return updated;
    });
  }, [filteredLoans.length, nodeDetailMode]);

  // Auto-organizar nodos a su cuadrícula matemática
  const handleAutoOrganize = () => {
    setNodePositions(calculateDefaultPositions());
  };

  // Manejo de Pan del Lienzo (Arrastrar fondo)
  const handleCanvasMouseDown = (e) => {
    // Si hace clic en un nodo o dock, no iniciar pan del lienzo
    if (e.target.closest('.flow-node') || e.target.closest('.floating-dock') || e.target.closest('button') || e.target.closest('input')) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    // Caso 1: Arrastrar el lienzo completo
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }

    // Caso 2: Arrastrar un nodo individual libremente
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
  const handleZoomIn = () => setZoom(prev => Math.min(1.6, Number((prev + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 60, y: 100 });
  };

  // Centrar vista en un nodo al buscar
  const handleFocusOnFirstResult = () => {
    if (filteredLoans.length > 0) {
      const firstId = filteredLoans[0].id;
      const pos = nodePositions[firstId];
      if (pos) {
        setSelectedNodeId(firstId);
        setPan({
          x: Math.round(300 - pos.x * zoom),
          y: Math.round(200 - pos.y * zoom),
        });
      }
    }
  };

  // Nodo Raíz: Fondo Central / Caja Operativa
  const rootNode = {
    x: 60,
    y: 280,
    title: 'Fondo Central',
    sub: 'Caja Operativa Monocromática',
    amount: `${symbol} ${Number(totalCapital).toLocaleString()}`,
  };

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
      {/* 1. BARRA SUPERIOR FLOTANTE CON CONTROLES ESTRUCTURALES                   */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between gap-3 pointer-events-none">
        
        {/* Título de Cartera Flotante */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-lg text-white">
          <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
          <span className="text-xs font-bold tracking-tight">Lienzo de Flujo de Nodos</span>
          <span className="text-[10px] text-[#858994] font-mono px-1.5 py-0.5 rounded bg-[#1e2025] border border-white/5">
            {filteredLoans.length} nodos activos
          </span>
        </div>

        {/* Buscador Rápido de Nodos en Lienzo */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-lg text-white">
          <Search className="w-3.5 h-3.5 text-[#858994]" />
          <input
            type="text"
            placeholder="Buscar deudor o CI en lienzo..."
            value={searchInternal}
            onChange={(e) => setSearchInternal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFocusOnFirstResult()}
            className="bg-transparent border-none text-xs text-white placeholder-[#6e727e] focus:outline-none w-44 font-mono"
          />
          {searchInternal && (
            <button
              onClick={() => setSearchInternal('')}
              className="text-[#858994] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Controles Centrales de Zoom, Densidad y Reorganización */}
        <div className="pointer-events-auto flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-lg text-[#858994]">
          <button 
            onClick={handleZoomOut} 
            className="p-1.5 rounded-xl hover:bg-[#1e2025] hover:text-white transition-colors"
            title="Reducir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <span className="text-xs font-mono font-semibold px-2 text-white">
            {Math.round(zoom * 100)}%
          </span>

          <button 
            onClick={handleZoomIn} 
            className="p-1.5 rounded-xl hover:bg-[#1e2025] hover:text-white transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-[#282a30] mx-1" />

          {/* Toggle Modo Detallado / Modo Compacto */}
          <button
            onClick={() => setNodeDetailMode(prev => prev === 'detailed' ? 'compact' : 'detailed')}
            className={`px-2 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              nodeDetailMode === 'detailed'
                ? 'bg-[#24252a] text-white border border-white/10'
                : 'text-[#858994] hover:text-white hover:bg-[#1e2025]'
            }`}
            title="Alternar entre vista detallada y compacta de los nodos"
          >
            {nodeDetailMode === 'detailed' ? (
              <>
                <Eye className="w-3 h-3 text-white" />
                <span>Detallado</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 text-[#858994]" />
                <span>Compacto</span>
              </>
            )}
          </button>

          <div className="w-px h-3.5 bg-[#282a30] mx-1" />

          {/* Botón Auto-Organizar Nodos */}
          <button 
            onClick={handleAutoOrganize} 
            className="p-1.5 rounded-xl hover:bg-[#1e2025] hover:text-white transition-colors"
            title="Auto-organizar nodos en cuadrícula limpia"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom */}
          <button 
            onClick={handleResetZoom} 
            className="p-1.5 rounded-xl hover:bg-[#1e2025] hover:text-white transition-colors"
            title="Restablecer Posición y Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Acciones Rápidas (Simulador y Nuevo Crédito) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="h-9 px-3.5 rounded-xl bg-[#141518]/90 backdrop-blur-md hover:bg-[#1c1d22] text-[#d1d5db] hover:text-white border border-[#24252a] text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <Calculator className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Simulador</span>
            </button>
          )}

          <button
            onClick={onOpenNewLoan}
            className="h-9 px-4 rounded-xl bg-white hover:bg-zinc-200 text-[#0d0e11] font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xl"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Préstamo</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. BARRA LATERAL FLOTANTE DE VISTAS Y HERRAMIENTAS (DOCK IZQUIERDO)       */}
      {/* ========================================================================= */}
      <div className="absolute left-6 top-24 bottom-6 z-30 flex flex-col justify-between pointer-events-none">
        
        {/* Barra de Herramientas Flotante */}
        <div className="pointer-events-auto floating-dock p-2 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-2xl flex flex-col gap-2 w-12 items-center">
          
          {/* Vistas Principales */}
          <button
            onClick={() => onChangeViewMode && onChangeViewMode('flow')}
            className="w-8 h-8 rounded-xl bg-white text-[#0d0e11] flex items-center justify-center transition-all shadow-xs"
            title="Vista Lienzo de Nodos (Activo)"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => onChangeViewMode && onChangeViewMode('timeline')}
            className="w-8 h-8 rounded-xl hover:bg-[#1e2025] text-[#858994] hover:text-white flex items-center justify-center transition-all"
            title="Vista Cronograma de Vencimientos"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button
            onClick={() => onChangeViewMode && onChangeViewMode('folders')}
            className="w-8 h-8 rounded-xl hover:bg-[#1e2025] text-[#858994] hover:text-white flex items-center justify-center transition-all"
            title="Vista Expedientes 3D"
          >
            <Folder className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-[#26282e] my-1" />

          {/* Filtros de Cartera */}
          <button
            onClick={() => setFilterState('todos')}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all text-[10px] font-bold ${
              filterState === 'todos' 
                ? 'bg-[#2a2c34] text-white border border-white/10' 
                : 'text-[#858994] hover:bg-[#1e2025] hover:text-white'
            }`}
            title="Todos los Préstamos"
          >
            ALL
          </button>

          <button
            onClick={() => setFilterState('otorgados')}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              filterState === 'otorgados' 
                ? 'bg-[#2a2c34] text-white border border-white/10' 
                : 'text-[#858994] hover:bg-[#1e2025] hover:text-white'
            }`}
            title="Cartera por Cobrar (Otorgados)"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setFilterState('recibidos')}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              filterState === 'recibidos' 
                ? 'bg-[#2a2c34] text-white border border-white/10' 
                : 'text-[#858994] hover:bg-[#1e2025] hover:text-white'
            }`}
            title="Fondeo por Pagar (Recibidos)"
          >
            <ArrowDownLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setFilterState('urgentes')}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              filterState === 'urgentes' 
                ? 'bg-[#2a2c34] text-white border border-white/10' 
                : 'text-[#858994] hover:bg-[#1e2025] hover:text-white'
            }`}
            title="Vencimientos Críticos / Mora"
          >
            <Clock className="w-4 h-4" />
          </button>

        </div>

        {/* Tarjeta Flotante Inferior de Resumen de Capital Monocromático */}
        <div className="pointer-events-auto p-3.5 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-2xl space-y-1.5 w-52">
          <div className="flex items-center justify-between text-[11px] text-[#787c88]">
            <span className="font-semibold uppercase tracking-wider">Capital Activo</span>
            <span className="font-mono text-white font-bold">{filteredLoans.length} reg.</span>
          </div>
          <div className="text-sm font-mono font-bold text-white tracking-tight">
            {symbol} {Number(totalCapital).toLocaleString()}
          </div>
          <div className="w-full bg-[#1e2025] h-1 rounded-full overflow-hidden">
            <div className="h-full bg-white w-3/4 rounded-full" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CAPA PRINCIPAL DEL LIENZO (SVG CABLES + NODOS CON TRANSFORM ZOOM/PAN)  */}
      {/* ========================================================================= */}
      <div 
        className="w-full h-full absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* SVG CON CABLES CURVOS BÉZIER DINÁMICOS */}
        <svg 
          className="absolute inset-0 pointer-events-none overflow-visible w-full h-full"
          style={{ minWidth: '4000px', minHeight: '4000px' }}
        >
          {filteredLoans.map((loan) => {
            const pos = nodePositions[loan.id];
            if (!pos) return null;

            const startX = rootNode.x + 220; // Extremo derecho del nodo raíz
            const startY = rootNode.y + 40;
            const endX = pos.x;              // Extremo izquierdo del nodo del deudor
            const endY = pos.y + 42;

            const isSelected = selectedNodeId === loan.id;
            const isBeingDragged = draggedNode?.id === loan.id;

            // Curva Bézier suave adaptable
            const dx = Math.abs(endX - startX) * 0.5;
            const cX1 = startX + dx;
            const cY1 = startY;
            const cX2 = endX - dx;
            const cY2 = endY;

            return (
              <g key={`cable-${loan.id}`}>
                {/* Cable principal elegante */}
                <path
                  d={`M ${startX} ${startY} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${endX} ${endY}`}
                  fill="none"
                  stroke={isSelected || isBeingDragged ? '#f3f4f6' : '#2b2d35'}
                  strokeWidth={isSelected || isBeingDragged ? '2.5' : '1.75'}
                  className="transition-colors duration-150"
                />

                {/* Punto conector intermedio estético */}
                <circle
                  cx={(startX + endX) / 2}
                  cy={(startY + endY) / 2}
                  r="5"
                  fill="#141518"
                  stroke={isSelected || isBeingDragged ? '#ffffff' : '#383b46'}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {/* NODO RAÍZ (FONDO CENTRAL / CAJA OPERATIVA) */}
        <div
          style={{ left: `${rootNode.x}px`, top: `${rootNode.y}px` }}
          className="flow-node absolute w-56 rounded-2xl bg-[#141518] border border-[#2b2d35] shadow-2xl p-4 text-white z-10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#22242b] border border-white/5 flex items-center justify-center font-bold text-xs text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight">{rootNode.title}</h3>
                <span className="text-[10px] text-[#858994] block">{rootNode.sub}</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
          </div>

          <div className="pt-2.5 border-t border-[#23252c] flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#6e727e]">Capital Total</span>
            <span className="text-xs font-mono font-bold text-white">{rootNode.amount}</span>
          </div>

          {/* Puerto de salida derecho */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#141518] border-2 border-[#383b45] flex items-center justify-center text-[9px] text-[#858994]">
            •
          </div>
        </div>

        {/* NODOS DE CLIENTES / PRESTAMISTAS CON ENRIQUECIMIENTO TOTAL */}
        {filteredLoans.map((loan) => {
          const pos = nodePositions[loan.id];
          if (!pos) return null;

          const isSelected = selectedNodeId === loan.id;
          const isBeingDragged = draggedNode?.id === loan.id;
          const hasDrive = !!(loan.drive_url || loan.drive_contrato);

          // Cálculos financieros precisos del préstamo
          const cronograma = generarCronograma(loan);
          const totalCuotas = cronograma.length;
          const cuotasPagadas = cronograma.filter(c => c.pagado).length;
          const pctAmortizado = totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : 0;
          const proximaCuota = cronograma.find(c => !c.pagado) || cronograma[cronograma.length - 1] || { total: loan.capital * 0.1, fechaVencimiento: 'Inmediato' };
          const saldoPendiente = cronograma.filter(c => !c.pagado).reduce((acc, c) => acc + c.total, 0);

          const diasRestantes = proximaCuota?.diasRestantes ?? 999;
          const esAtrasado = !proximaCuota?.pagado && diasRestantes < 0;
          const esHoy = !proximaCuota?.pagado && diasRestantes === 0;
          const esPronto = !proximaCuota?.pagado && diasRestantes > 0 && diasRestantes <= 3;
          const estaSaldado = totalCuotas > 0 && cuotasPagadas === totalCuotas;

          return (
            <div
              key={loan.id}
              style={{ 
                left: `${pos.x}px`, 
                top: `${pos.y}px`,
                zIndex: isBeingDragged ? 40 : isSelected ? 30 : 20,
              }}
              className="flow-node absolute transition-shadow duration-150"
            >
              {/* TARJETA PRINCIPAL DEL NODO */}
              <div
                className={`rounded-2xl bg-[#17181c] border transition-all cursor-pointer shadow-xl relative group ${
                  nodeDetailMode === 'detailed' ? 'w-80 p-4 space-y-3' : 'w-72 p-3 space-y-2'
                } ${
                  isSelected 
                    ? 'border-white ring-2 ring-white/10 shadow-2xl bg-[#1b1c21]' 
                    : isBeingDragged
                      ? 'border-white shadow-2xl opacity-90'
                      : 'border-[#26282e] hover:border-[#3e414c] hover:bg-[#1b1c21]'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(isSelected ? null : loan.id);
                }}
              >
                {/* Barra de Agarre para Arrastre Libre (Drag Handle) */}
                <div 
                  onMouseDown={(e) => handleNodeStartDrag(e, loan.id)}
                  className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#202127] border border-[#2b2d35] text-[9px] font-mono text-[#858994] flex items-center gap-1 cursor-grab active:cursor-grabbing hover:text-white"
                  title="Arrastra este nodo para recolocarlo libremente en el lienzo"
                >
                  <Move className="w-2.5 h-2.5" />
                  <span>Arrastrar</span>
                </div>

                {/* Puerto de entrada izquierdo */}
                <div className="absolute -left-2 top-8 w-3.5 h-3.5 rounded-full bg-[#17181c] border-2 border-[#383b45] z-10" />

                {/* 1. Encabezado del Deudor */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {hasDrive ? (
                      <div className="w-8 h-8 rounded-xl bg-[#22242b] border border-white/5 flex items-center justify-center shrink-0 text-zinc-300">
                        <HardDrive className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-[#22242b] border border-white/5 flex items-center justify-center font-bold text-xs text-white shrink-0">
                        {loan.nombre?.charAt(0) || 'U'}
                      </div>
                    )}

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-zinc-100 truncate">
                          {loan.nombre}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#858994] block truncate font-mono">
                        {loan.ci ? `CI: ${loan.ci}` : loan.telefono ? `+591 ${loan.telefono}` : 'Sin teléfono'}
                      </span>
                    </div>
                  </div>

                  {/* Badge de Estado del Vencimiento */}
                  <div className="shrink-0 text-right">
                    {estaSaldado ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#141518] border border-white/20 text-white flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Saldado</span>
                      </span>
                    ) : esAtrasado ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1f2026] border border-white/30 text-white font-mono">
                        +{Math.abs(diasRestantes)}d mora
                      </span>
                    ) : esHoy ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-[#0d0e11] font-mono shadow-xs">
                        VENCE HOY
                      </span>
                    ) : esPronto ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#22242b] border border-white/10 text-white font-mono">
                        En {diasRestantes}d
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-[#858994] bg-[#141518] border border-[#24252a]">
                        Al Día
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Información Financiera Detallada (Barra de Progreso y Cuotas) */}
                {nodeDetailMode === 'detailed' && (
                  <div className="space-y-2 pt-1 border-t border-[#23252c]">
                    
                    {/* Fila de Capital y Saldo Insoluto */}
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#6e727e] block">
                          Capital
                        </span>
                        <span className="font-mono font-bold text-white">
                          {symbol} {Number(loan.capital).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-[#6e727e] block">
                          Saldo Restante
                        </span>
                        <span className="font-mono font-bold text-zinc-300">
                          {symbol} {saldoPendiente.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progreso de Amortización */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#858994]">
                        <span>Cuota {cuotasPagadas} de {totalCuotas}</span>
                        <span className="text-white font-semibold">{pctAmortizado}% amortizado</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#101114] rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${pctAmortizado}%` }}
                        />
                      </div>
                    </div>

                    {/* Próximo Cobro Programado */}
                    {!estaSaldado && proximaCuota && (
                      <div className="p-2 rounded-xl bg-[#121316] border border-[#202126] flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-semibold text-[#6e727e] block">
                            Próxima Cuota
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {symbol} {Number(proximaCuota.total || 0).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#858994]">
                          {proximaCuota.fechaVencimiento || 'Inmediato'}
                        </span>
                      </div>
                    )}

                    {/* Botonera de Acciones Rápidas Directas en el Nodo */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {/* Botón WhatsApp */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendWhatsApp && onSendWhatsApp(loan, proximaCuota);
                        }}
                        className="h-7 rounded-lg bg-[#202127] hover:bg-[#282a32] text-zinc-300 hover:text-white border border-white/5 flex items-center justify-center transition-all shadow-xs"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Botón Google Drive */}
                      <a
                        href={loan.drive_url || loan.drive_contrato || defaultDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 rounded-lg bg-[#202127] hover:bg-[#282a32] text-zinc-300 hover:text-white border border-white/5 flex items-center justify-center transition-all shadow-xs"
                        title="Abrir contrato o carpeta en Google Drive"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                      </a>

                      {/* Botón Cobrar / Abonar Rápido */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!estaSaldado && onPayCuota) {
                            onPayCuota(loan, proximaCuota);
                          }
                        }}
                        disabled={estaSaldado}
                        className={`h-7 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          estaSaldado
                            ? 'bg-[#18191d] text-[#555a64] border border-transparent cursor-not-allowed'
                            : 'bg-white hover:bg-zinc-200 text-[#0d0e11] shadow-xs'
                        }`}
                        title="Registrar cobro de la cuota programada"
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>Abonar</span>
                      </button>

                      {/* Botón Ficha / Inspector Completo */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLoan && onSelectLoan(loan);
                        }}
                        className="h-7 rounded-lg bg-[#202127] hover:bg-[#282a32] text-zinc-300 hover:text-white border border-white/5 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all"
                        title="Abrir expediente completo del préstamo"
                      >
                        <span>Ficha</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                )}

                {/* Modo Compacto: Solo números esenciales */}
                {nodeDetailMode === 'compact' && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#23252c] text-xs font-mono">
                    <span className="text-[#858994]">Capital:</span>
                    <span className="font-bold text-white">{symbol} {Number(loan.capital).toLocaleString()}</span>
                  </div>
                )}

                {/* Puerto de salida derecho */}
                <div className="absolute -right-2 top-8 w-3.5 h-3.5 rounded-full bg-[#17181c] border-2 border-[#383b45] z-10" />
              </div>

              {/* ========================================================================= */}
              {/* INSPECTOR ADOSADO EN EL MISMO NODO (IN-PLACE POPOVER EXPANDIDO)           */}
              {/* ========================================================================= */}
              {isSelected && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`mt-2 rounded-2xl bg-[#1b1c21] border border-[#32353f] shadow-2xl p-4 text-[#f3f4f6] animate-in fade-in zoom-in-95 duration-150 space-y-3 z-40 relative ${
                    nodeDetailMode === 'detailed' ? 'w-80' : 'w-72'
                  }`}
                >
                  {/* Conector visual pequeño */}
                  <div className="w-px h-2 bg-[#32353f] absolute -top-2 left-1/2 -translate-x-1/2" />

                  {/* Encabezado del Popover */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#26282e]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[#272930] flex items-center justify-center text-[10px] font-bold text-white">
                        {loan.nombre?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[190px]">
                        {loan.nombre} • Detalle
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="p-1 rounded-lg hover:bg-[#272930] text-[#787c88] hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mini Cronograma de las Próximas 3 Cuotas */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-[#6e727e] block">
                      Próximas Cuotas del Cronograma
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto custom-scroll pr-1">
                      {cronograma.slice(0, 4).map((c, idx) => (
                        <div 
                          key={c.key || idx} 
                          className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                            c.pagado
                              ? 'bg-[#141518] border-[#22242a] opacity-60'
                              : c.estado === 'vencido'
                                ? 'bg-[#202128] border-white/20'
                                : 'bg-[#141518] border-[#26282e]'
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-white block">
                              {c.label}
                            </span>
                            <span className="text-[10px] text-[#858994] font-mono">
                              {c.fechaVencimiento} {c.mora > 0 ? `(+${symbol}${c.mora} mora)` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">
                              {symbol} {c.total}
                            </span>
                            {!c.pagado && onPayCuota ? (
                              <button
                                onClick={() => onPayCuota(loan, c)}
                                className="px-2 py-0.5 rounded-lg bg-white hover:bg-zinc-200 text-[#0d0e11] font-bold text-[10px]"
                              >
                                Cobrar
                              </button>
                            ) : c.pagado ? (
                              <span className="text-[10px] text-zinc-400 font-bold">✓</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones Avanzadas del Inspector */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#26282e]">
                    {/* Botón Prórroga / Extensión */}
                    {onOpenExtension && (
                      <button
                        onClick={() => onOpenExtension(loan)}
                        className="py-1.5 px-2 rounded-xl bg-[#24262d] hover:bg-[#2d3039] text-[#d1d5db] hover:text-white border border-white/5 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                        title="Solicitar prórroga o extensión de plazo"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Prórroga</span>
                      </button>
                    )}

                    {/* Botón Recibo Digital */}
                    {onOpenReceipt && cuotasPagadas > 0 && (
                      <button
                        onClick={() => {
                          const cuotaPagada = cronograma.find(c => c.pagado) || proximaCuota;
                          onOpenReceipt({ nombre: loan.nombre, ci: loan.ci, telefono: loan.telefono }, loan, cuotaPagada);
                        }}
                        className="py-1.5 px-2 rounded-xl bg-[#24262d] hover:bg-[#2d3039] text-[#d1d5db] hover:text-white border border-white/5 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                        title="Imprimir o ver recibo digital oficial"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Recibo</span>
                      </button>
                    )}

                    {/* Botón Carpeta del Cliente */}
                    {onOpenFolder && (
                      <button
                        onClick={() => onOpenFolder(loan.nombre?.trim().toLowerCase())}
                        className="py-1.5 px-2 rounded-xl bg-[#24262d] hover:bg-[#2d3039] text-[#d1d5db] hover:text-white border border-white/5 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all col-span-2"
                        title="Abrir carpeta completa con todos los contratos de esta persona"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Ver Carpeta del Cliente</span>
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}
