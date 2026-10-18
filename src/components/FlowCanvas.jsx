import React, { useState, useRef, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Plus, HardDrive, MessageCircle, 
  Check, ArrowRight, X, ExternalLink, Calendar, Users, 
  DollarSign, Calculator, Layers, Sliders, RefreshCw, Sparkles,
  Folder, Clock, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

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
  onChangeViewMode,
  defaultDriveUrl = 'https://drive.google.com'
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Estados del Lienzo Interactivo (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 120 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [filterState, setFilterState] = useState('todos'); // 'todos' | 'otorgados' | 'recibidos' | 'urgentes'

  const containerRef = useRef(null);

  // Filtrado de préstamos a mostrar en el flujo
  const filteredLoans = useMemo(() => {
    return prestamos.filter(p => {
      if (filterState === 'otorgados') return p.tipo_prestamo !== 'recibido';
      if (filterState === 'recibidos') return p.tipo_prestamo === 'recibido';
      if (filterState === 'urgentes') {
        const fecha = p.fecha_vencimiento || p.cuotas?.[0]?.fechaVencimiento;
        return p.estado === 'Atrasado' || p.estado === 'Vence Hoy';
      }
      return true;
    });
  }, [prestamos, filterState]);

  // Manejo de Pan (arrastrar lienzo)
  const handleMouseDown = (e) => {
    // Si hace clic en un nodo o control, no arrastrar lienzo
    if (e.target.closest('.flow-node') || e.target.closest('.floating-dock') || e.target.closest('button')) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(1.5, Number((prev + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, Number((prev - 0.1).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 60, y: 120 });
  };

  // Posicionamiento de Nodos en el Grafo
  // Nodo Raíz: Fondo Central / Caja
  const rootNode = {
    x: 80,
    y: 300,
    title: 'Fondo Central',
    sub: 'Caja Operativa',
    amount: `${symbol} ${Number(totalCapital).toLocaleString()}`,
  };

  // Posicionar nodos de préstamos en columnas dinámicas
  const nodePositions = useMemo(() => {
    const positions = {};
    const colSpacing = 380;
    const rowSpacing = 160;

    filteredLoans.forEach((loan, idx) => {
      const col = idx % 3; // 3 columnas de distribución
      const row = Math.floor(idx / 3);

      positions[loan.id] = {
        x: 480 + (col * colSpacing),
        y: 120 + (row * rowSpacing) + (col % 2 === 1 ? 40 : 0), // ligero escalonamiento estético
      };
    });
    return positions;
  }, [filteredLoans]);

  // Datos del nodo seleccionado para el Inspector In-Place
  const selectedLoan = useMemo(() => {
    return prestamos.find(p => p.id === selectedNodeId) || null;
  }, [prestamos, selectedNodeId]);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`w-full h-full relative overflow-hidden select-none bg-[#08090a] dots-grid ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR FLOTANTE CON CONTROLES (ESTILO EXACTO A LA IMAGEN)      */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Título de Cartera Flotante */}
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-lg text-white">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-tight">Cartera de Préstamos</span>
          <span className="text-[10px] text-[#787c88] font-mono px-1.5 py-0.5 rounded bg-[#1e2025] border border-white/5">
            Grafo Activo
          </span>
        </div>

        {/* Controles Centrales de Zoom y Fit */}
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-lg text-[#858994]">
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

          <button 
            onClick={handleResetZoom} 
            className="p-1.5 rounded-xl hover:bg-[#1e2025] hover:text-white transition-colors"
            title="Restablecer Vista"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Acciones Rápidas (Simulador y Nuevo Crédito) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="h-9 px-3.5 rounded-xl bg-[#141518]/90 backdrop-blur-md hover:bg-[#1c1d22] text-[#d1d5db] hover:text-white border border-[#24252a] text-xs font-medium flex items-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <Calculator className="w-3.5 h-3.5 text-zinc-400" />
              <span>Simulador</span>
            </button>
          )}

          <button
            onClick={onOpenNewLoan}
            className="h-9 px-4 rounded-xl bg-[#f3f4f6] hover:bg-white text-[#0d0e11] font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xl"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Préstamo</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. BARRA LATERAL FLOTANTE DE SECCIÓN Y HERRAMIENTAS (DOCK IZQUIERDO)      */}
      {/* ========================================================================= */}
      <div className="absolute left-6 top-24 bottom-6 z-30 flex flex-col justify-between pointer-events-none">
        
        {/* Barra de Herramientas Flotante */}
        <div className="pointer-events-auto floating-dock p-2 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-2xl flex flex-col gap-2 w-12 items-center">
          
          {/* Grupo 1: Vistas Rápidas */}
          <button
            onClick={() => onChangeViewMode && onChangeViewMode('flow')}
            className="w-8 h-8 rounded-xl bg-[#22242a] text-white flex items-center justify-center transition-all border border-white/10"
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

          {/* Grupo 2: Filtros de Cartera */}
          <button
            onClick={() => setFilterState('todos')}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all text-xs font-bold ${
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
            title="Cartera por Cobrar"
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
            title="Fondeo por Pagar"
          >
            <ArrowDownLeft className="w-4 h-4" />
          </button>

        </div>

        {/* Tarjeta Flotante Inferior de Resumen de Capital (Idéntica a la Imagen) */}
        <div className="pointer-events-auto p-3.5 rounded-2xl bg-[#141518]/90 backdrop-blur-md border border-[#24252a] shadow-2xl space-y-1.5 w-52">
          <div className="flex items-center justify-between text-[11px] text-[#787c88]">
            <span className="font-semibold uppercase tracking-wider">Capital Activo</span>
            <span className="font-mono text-white font-bold">{filteredLoans.length} reg.</span>
          </div>
          <div className="text-sm font-mono font-bold text-white tracking-tight">
            {symbol} {Number(totalCapital).toLocaleString()}
          </div>
          <div className="w-full bg-[#1e2025] h-1 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-300 w-3/4 rounded-full" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CAPA DEL LIENZO (SVG CABLES + NODOS CON TRANSFORM ZOOM/PAN)             */}
      {/* ========================================================================= */}
      <div 
        className="w-full h-full absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* SVG CON CABLES CURVOS BÉZIER CONECTORES */}
        <svg 
          className="absolute inset-0 pointer-events-none overflow-visible w-full h-full"
          style={{ minWidth: '3000px', minHeight: '3000px' }}
        >
          {filteredLoans.map((loan) => {
            const pos = nodePositions[loan.id];
            if (!pos) return null;

            const startX = rootNode.x + 220; // extremo derecho del nodo raíz
            const startY = rootNode.y + 40;
            const endX = pos.x;              // extremo izquierdo del nodo deudor
            const endY = pos.y + 36;

            const isSelected = selectedNodeId === loan.id;

            // Curva Bézier suave
            const cX1 = startX + (endX - startX) * 0.5;
            const cY1 = startY;
            const cX2 = startX + (endX - startX) * 0.5;
            const cY2 = endY;

            return (
              <g key={`cable-${loan.id}`}>
                {/* Cable principal tenue */}
                <path
                  d={`M ${startX} ${startY} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${endX} ${endY}`}
                  fill="none"
                  stroke={isSelected ? '#858994' : '#2b2d36'}
                  strokeWidth={isSelected ? '2.5' : '1.75'}
                  className="transition-colors duration-200"
                />

                {/* Punto conector intermedio con botón + sutil (como en la foto) */}
                <circle
                  cx={(startX + endX) / 2}
                  cy={(startY + endY) / 2}
                  r="6"
                  fill="#141518"
                  stroke={isSelected ? '#a1a5b0' : '#333640'}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {/* NODO RAÍZ (FONDO CENTRAL / CAJA) */}
        <div
          style={{ left: `${rootNode.x}px`, top: `${rootNode.y}px` }}
          className="flow-node absolute w-56 rounded-2xl bg-[#141518] border border-[#2b2d35] shadow-xl p-4 text-white z-10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#22242b] border border-white/5 flex items-center justify-center font-bold text-xs text-white">
                💰
              </div>
              <div>
                <h3 className="text-xs font-bold">{rootNode.title}</h3>
                <span className="text-[10px] text-[#787c88] block">{rootNode.sub}</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-white/60" />
          </div>

          <div className="pt-2 border-t border-[#23252c] flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#6e727e]">Balance</span>
            <span className="text-xs font-mono font-bold text-white">{rootNode.amount}</span>
          </div>

          {/* Puerto de salida */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#141518] border-2 border-[#383b45] flex items-center justify-center text-[9px] text-[#858994]">
            •
          </div>
        </div>

        {/* NODOS DE CLIENTES / PRESTAMISTAS */}
        {filteredLoans.map((loan) => {
          const pos = nodePositions[loan.id];
          if (!pos) return null;

          const isSelected = selectedNodeId === loan.id;
          const hasDrive = !!(loan.drive_url || loan.drive_contrato);
          const cuotaProxima = loan.cuotas?.[0] || { total: loan.capital * 0.1, fechaVencimiento: '25/10/2026' };
          const esAtrasado = loan.estado === 'Atrasado';

          return (
            <div
              key={loan.id}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(isSelected ? null : loan.id);
              }}
              className="flow-node absolute z-20 transition-all duration-150"
            >
              {/* TARJETA DEL NODO (RECTÁNGULO EN GRIS OBSIDIAN) */}
              <div
                className={`w-72 p-3.5 rounded-2xl bg-[#17181c] hover:bg-[#1b1c21] border transition-all cursor-pointer shadow-lg relative group ${
                  isSelected 
                    ? 'border-[#858994] ring-2 ring-white/10 shadow-2xl bg-[#1b1c21]' 
                    : 'border-[#26282e] hover:border-[#3a3c46]'
                }`}
              >
                {/* Puerto de entrada izquierdo */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#17181c] border-2 border-[#383b45] z-10" />

                <div className="flex items-center justify-between">
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
                        {esAtrasado && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#717580] block truncate">
                        {loan.telefono ? `+591 ${loan.telefono}` : 'Sin teléfono'}
                      </span>
                    </div>
                  </div>

                  {/* Monto de capital */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white block">
                      {symbol} {Number(loan.capital).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#717580] font-mono block">
                      Tasa {loan.interes}%
                    </span>
                  </div>
                </div>

                {/* Puerto de salida derecho */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#17181c] border-2 border-[#383b45] z-10" />
              </div>

              {/* ========================================================================= */}
              {/* INSPECTOR ADOSADO EN EL MISMO NODO (IN-PLACE POPOVER PANEL)               */}
              {/* ========================================================================= */}
              {isSelected && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-72 rounded-2xl bg-[#1b1c21] border border-[#32353f] shadow-2xl p-4 text-[#f3f4f6] animate-in fade-in zoom-in-95 duration-150 space-y-3 z-30 relative"
                >
                  {/* Conector visual pequeño */}
                  <div className="w-px h-2 bg-[#32353f] absolute -top-2 left-1/2 -translate-x-1/2" />

                  {/* Encabezado del Popover */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#26282e]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[#272930] flex items-center justify-center text-[10px] font-bold text-white">
                        {loan.nombre?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[170px]">
                        {loan.nombre}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="p-1 rounded-lg hover:bg-[#272930] text-[#787c88] hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Detalle de la Próxima Cuota */}
                  <div className="p-2.5 rounded-xl bg-[#141518] border border-[#26282e] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#6e727e] block">
                        Próxima Cuota
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {symbol} {Number(cuotaProxima.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#787c88] font-mono block">
                        Vence: {cuotaProxima.fechaVencimiento || 'Inmediato'}
                      </span>
                    </div>
                  </div>

                  {/* Botón de Abono Rápido en Gris Claro */}
                  <button
                    onClick={() => {
                      if (onPayCuota) {
                        onPayCuota(loan, cuotaProxima);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#f3f4f6] hover:bg-white text-[#0d0e11] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Abonar Cuota Ahora</span>
                  </button>

                  {/* Botones de Acción Monocromáticos (WhatsApp, Drive, Expediente) */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => onSendWhatsApp && onSendWhatsApp(loan, cuotaProxima)}
                      className="py-1.5 px-2 rounded-xl bg-[#24262d] hover:bg-[#2d3039] text-[#d1d5db] hover:text-white border border-white/5 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    <a
                      href={loan.drive_url || loan.drive_contrato || defaultDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 rounded-xl bg-[#24262d] hover:bg-[#2d3039] text-[#d1d5db] hover:text-white border border-white/5 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                      title="Abrir contrato en Google Drive"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Drive</span>
                    </a>

                    <button
                      onClick={() => onSelectLoan && onSelectLoan(loan)}
                      className="py-1.5 px-2 rounded-xl bg-[#24262d] hover:bg-[#2d3039] text-[#d1d5db] hover:text-white border border-white/5 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                      title="Ver expediente completo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>
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
