import React, { useState } from 'react';
import { 
  Calendar, Clock, Filter, Share2, Plus, Search, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, 
  MoreVertical, ArrowRight, Sparkles, Building2, User, Phone
} from 'lucide-react';

export default function TimelineNodesView({
  prestamos = [],
  currency = 'BOB',
  onSelectFolder,
  onOpenNewLoan,
  onOpenReceipt,
  onPayCuota,
}) {
  const [periodMode, setPeriodMode] = useState('Semana'); // 'Día', 'Semana', 'Mes'
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'fondeo', 'mora'
  const [hoveredNode, setHoveredNode] = useState(null);

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0d0e11] text-[#f5f5f7] rounded-xl border border-[#22232a] select-none">
      
      {/* SIDEBAR LATERAL IZQUIERDO (DISEÑO FIEL A IMAGEN 1: RELATEL WISE) */}
      <aside className="w-56 bg-[#121316] border-r border-[#22232a] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          
          {/* Logo & Workspace */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-white text-xs font-black shadow-sm">
                W
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Work</span><span className="font-normal italic text-purple-400">wise</span>
                </div>
                <span className="text-[10px] text-[#6e707b] block font-mono">carlos.cartera.bo</span>
              </div>
            </div>
            <button className="text-[#6e707b] hover:text-white text-xs">«</button>
          </div>

          {/* Grupo 1: Overview */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#5a5b65] px-2 block mb-1">
              General
            </span>
            <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#9a9ba4] hover:bg-[#1a1b20] hover:text-white transition-all">
              <div className="flex items-center gap-2.5">
                <span className="text-[#6e707b]">⊞</span>
                <span>Dashboard</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#9a9ba4] hover:bg-[#1a1b20] hover:text-white transition-all">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-[#6e707b]" />
                <span>Calendario</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs bg-[#1f2027] text-white font-medium border border-[#2b2c36] shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-purple-400">∿</span>
                <span>Timeline Nodos</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded font-bold">9</span>
            </button>
          </div>

          {/* Grupo 2: Cartera */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#5a5b65] px-2 block mb-1">
              Cartera de Clientes
            </span>
            <button 
              onClick={() => setFilterType('todos')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                filterType === 'todos' ? 'text-white bg-[#1a1b20]' : 'text-[#9a9ba4] hover:bg-[#1a1b20] hover:text-white'
              }`}
            >
              <span>Cobros Activos</span>
              <span className="text-[11px] font-mono text-[#6e707b]">9</span>
            </button>
            <button 
              onClick={() => setFilterType('fondeo')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                filterType === 'fondeo' ? 'text-purple-300 bg-purple-500/10' : 'text-[#9a9ba4] hover:bg-[#1a1b20] hover:text-white'
              }`}
            >
              <span>Fondeo / Acreedores</span>
              <span className="text-[11px] font-mono text-purple-400">2</span>
            </button>
            <button 
              onClick={() => setFilterType('mora')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                filterType === 'mora' ? 'text-rose-300 bg-rose-500/10' : 'text-[#9a9ba4] hover:bg-[#1a1b20] hover:text-white'
              }`}
            >
              <span>En Seguimiento</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">1</span>
            </button>
          </div>

          {/* Grupo 3: Métricas Rápidas */}
          <div className="space-y-2 pt-2 border-t border-[#22232a]">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#5a5b65] px-2 block">
              Métricas Clave
            </span>
            <div className="p-2.5 rounded-lg bg-[#181920] border border-[#23242c] space-y-1">
              <span className="text-[10px] text-[#7e808c] block">Capital en Calle:</span>
              <span className="text-xs font-mono font-bold text-white">Bs. 380,200</span>
              <div className="flex justify-between items-center pt-1 text-[10px] border-t border-[#23242c]">
                <span className="text-[#7e808c]">Rendimiento:</span>
                <span className="font-mono font-bold text-emerald-400">+23,220/m</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer de Usuario */}
        <div className="pt-4 border-t border-[#22232a] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#272833] border border-[#353645] flex items-center justify-center font-bold text-xs text-white">
            CJ
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-white block truncate">Carlos Joel</span>
            <span className="text-[10px] text-[#6e707b] block truncate font-mono">carlosjoelsb@gmail.com</span>
          </div>
        </div>
      </aside>

      {/* ÁREA CENTRAL PRINCIPAL: TIMELINE CON NODOS (CANVAS) */}
      <main className="flex-1 flex flex-col bg-[#0e0f12] overflow-hidden">
        
        {/* HEADER SUPERIOR CON BREADCRUMBS Y ACCIONES */}
        <div className="px-5 py-3 border-b border-[#1f2027] flex items-center justify-between gap-4 bg-[#121316]/60">
          <div className="flex items-center gap-2 text-xs text-[#7e808c]">
            <button className="hover:text-white">←</button>
            <span>Préstamos</span>
            <span>›</span>
            <span className="text-white font-medium">Timeline de Vencimientos & Nodos</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#1a1b20] border border-[#262730] px-3 py-1.5 rounded-lg text-xs text-[#7e808c]">
              <Search className="w-3.5 h-3.5 text-[#7e808c]" />
              <input 
                type="text" 
                placeholder="Buscar deudor o fecha..." 
                className="bg-transparent outline-none w-36 lg:w-48 text-white placeholder-[#5a5b65]" 
              />
              <span className="text-[10px] bg-[#262732] px-1 py-0.2 rounded text-[#8e909c] font-mono">⌘K</span>
            </div>

            <button className="px-3 py-1.5 rounded-lg border border-[#262730] bg-[#1a1b20] text-xs font-medium text-white hover:bg-[#22232a] flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#7e808c]" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* Botón Blanco Puro según Imagen 1 */}
            <button 
              onClick={onOpenNewLoan}
              className="px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-slate-200 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Préstamo</span>
            </button>
          </div>
        </div>

        {/* SUB-HEADER CON CONTROLES DE FECHAS */}
        <div className="px-6 py-4 border-b border-[#1f2027] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Cronograma de Vencimientos</h2>
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0e0f12] bg-purple-500/80 text-[10px] text-center font-bold text-white leading-5">MM</span>
                <span className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0e0f12] bg-blue-500/80 text-[10px] text-center font-bold text-white leading-5">VC</span>
                <span className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0e0f12] bg-emerald-500/80 text-[10px] text-center font-bold text-white leading-5">RV</span>
              </div>
            </div>
            <p className="text-xs text-[#7e808c] mt-0.5">
              Visualización con nodos de las 9 personas activas y la relación con los prestamistas fondeadores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Segmented control Día / Semana / Mes */}
            <div className="p-1 rounded-lg bg-[#181920] border border-[#262730] flex gap-1 text-xs">
              {['Día', 'Semana', 'Mes'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPeriodMode(mode)}
                  className={`px-2.5 py-1 rounded transition-all ${
                    periodMode === mode 
                      ? 'bg-[#272835] text-white font-medium shadow-xs' 
                      : 'text-[#7e808c] hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Navegador de período */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181920] border border-[#262730] text-xs text-white">
              <button className="text-[#7e808c] hover:text-white">‹</button>
              <span className="font-medium px-2">16 Oct - 15 Nov 2026</span>
              <button className="text-[#7e808c] hover:text-white">›</button>
            </div>

            <div className="h-4 w-[1px] bg-[#262730] hidden sm:block"></div>

            <button className="text-xs text-[#7e808c] hover:text-white flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* LIENZO TIMELINE CON COLUMNAS DE DÍAS Y NODOS DE CONEXIÓN */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scroll relative timeline-grid-bg">
          <div className="min-w-[1200px] p-6 relative">

            {/* ENCABEZADO DE DÍAS Y SEMANAS */}
            <div className="flex border-b border-[#24252f] pb-3 text-xs mb-6 select-none">
              <div className="w-52 shrink-0 text-[#686972] font-semibold uppercase tracking-wider text-[10px]">
                Persona / Contrato
              </div>

              <div className="flex-1 grid grid-cols-12 gap-2 text-center text-[#7e808c]">
                <div><span className="block text-[10px] text-[#555660]">LUN</span><strong class="text-white">12</strong></div>
                <div><span className="block text-[10px] text-[#555660]">MAR</span><strong class="text-white">13</strong></div>
                <div><span className="block text-[10px] text-[#555660]">MIÉ</span><strong class="text-white">14</strong></div>
                <div><span className="block text-[10px] text-[#555660]">JUE</span><strong class="text-white">15</strong></div>
                
                {/* DÍA DE HOY DESTACADO CON LÍNEA VIOLETA EXACTO A IMAGEN 1 */}
                <div className="relative bg-purple-500/10 rounded-md py-0.5 border border-purple-500/30">
                  <span className="block text-[10px] text-purple-400 font-bold">HOY</span>
                  <strong className="text-white">16</strong>
                </div>

                <div><span className="block text-[10px] text-[#555660]">SÁB</span><strong>17</strong></div>
                <div><span className="block text-[10px] text-[#555660]">DOM</span><strong>18</strong></div>
                <div><span className="block text-[10px] text-[#555660]">LUN</span><strong class="text-white">19</strong></div>
                <div><span className="block text-[10px] text-[#555660]">MAR</span><strong class="text-white">20</strong></div>
                <div><span className="block text-[10px] text-[#555660]">MIÉ</span><strong class="text-white">21</strong></div>
                <div><span className="block text-[10px] text-[#555660]">MAR</span><strong class="text-white">28</strong></div>
                <div><span className="block text-[10px] text-[#555660]">VIE</span><strong class="text-white">30</strong></div>
              </div>
            </div>

            {/* LÍNEA GUÍA VERTICAL INDICADORA DE FECHA DE HOY (T26 EN IMAGEN 1) */}
            <div className="absolute top-16 bottom-0 left-[625px] w-[2px] bg-purple-500/80 pointer-events-none z-10 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <div className="w-3 h-3 rounded-full bg-purple-500 -ml-[5px] -top-1.5 relative border-2 border-[#0e0f12]"></div>
            </div>

            {/* SVG OVERLAY PARA LAS CURVAS Y NODOS DE CONEXIÓN ENTRE HITOS */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
              {/* Conexión con curva y nodo entre Tío Rodo (Prestamista) y Magali Molina (Deudora) */}
              <path d="M 430 110 C 490 110, 490 178, 550 178" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,4" />
              <circle cx="490" cy="144" r="4" fill="#a855f7" stroke="#121316" strokeWidth="2" />
              
              {/* Conexión entre cuotas simultáneas de la misma fecha (28 Oct: Victoria y Jimena) */}
              <path d="M 1040 310 C 1060 310, 1060 380, 1040 380" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx="1060" cy="345" r="3.5" fill="#3b82f6" stroke="#121316" strokeWidth="1.5" />
            </svg>

            {/* CARRILES Y FICHAS DE PRÉSTAMOS REALES (DISEÑO HORIZONTAL ELEGANTE) */}
            <div className="space-y-4 relative z-20">

              {/* Fila 1: TÍO RODO (PRESTAMISTA / FONDEADOR) */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-purple-300 block">Tío Rodo (Acreedor)</span>
                  <span className="text-[10px] text-[#6e707b]">Fondeo Capital • 3% tasa</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onMouseEnter={() => setHoveredNode('rodo')}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="absolute left-[180px] w-64 p-3 rounded-xl bg-[#1c1d24] border border-purple-500/40 hover:border-purple-400 transition-all shadow-md group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <h4 className="text-xs font-bold text-white">Fondeo Bs. 10,000</h4>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300">Pagar Bs. 300</span>
                    </div>
                    <div className="text-[10px] text-[#8e909e] mt-1 flex items-center justify-between">
                      <span>Destino: Magali Molina</span>
                      <span className="text-emerald-400 font-bold">Margen: +700 Bs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila 2: MAGALI MOLINA (DESTACADA CON GRADIENTE SUTIL IGUAL A IMAGEN 1) */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-white block">MAGALI MOLINA</span>
                  <span className="text-[10px] text-[#6e707b]">CI: 6259284-SC • 10% Mensual</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onClick={() => onSelectFolder && onSelectFolder('MAGALI MOLINA')}
                    className="absolute left-[340px] w-80 p-3 rounded-xl bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-amber-900/40 border border-purple-400/50 hover:border-purple-300 transition-all shadow-lg cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        <h4 className="text-xs font-bold text-white">Capital: Bs. 15,000</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">Cuota: Bs. 1,500</span>
                    </div>
                    <div className="text-[10px] text-purple-200 mt-1 flex items-center justify-between">
                      <span>Vence: 25 Oct (Quedan 9d)</span>
                      <span className="font-medium bg-black/30 px-1.5 py-0.2 rounded">Fondeado por Rodo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila 3: ROBERTO VILLAZON INOSENTE (COBRO DIARIO) */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-white block">ROBERTO VILLAZON</span>
                  <span className="text-[10px] text-[#6e707b]">Tel: 76653981 • Cobro Diario</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onClick={() => onSelectFolder && onSelectFolder('ROBERTO VILLAZON INOSENTE')}
                    className="absolute left-[220px] w-72 p-2.5 rounded-xl bg-[#1c1d24] border border-[#2b2c37] hover:border-[#3d3f4f] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <h4 className="text-xs font-medium text-white">Capital: Bs. 18,000</h4>
                      </div>
                      <span className="text-xs font-mono font-semibold text-emerald-400">Hoy: Bs. 300</span>
                    </div>
                    <div className="text-[10px] text-[#7e808c] mt-0.5 flex justify-between">
                      <span>12 pagos registrados</span>
                      <span className="text-amber-400 font-medium">Cobro Diario</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila 4: SANDRA CARRION CHAHUAYO (EMPRESARIA) */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-white block">SANDRA CARRION</span>
                  <span className="text-[10px] text-[#6e707b]">Empresaria • Bs. 125,000</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onClick={() => onSelectFolder && onSelectFolder('SANDRA CARRION CHAHUAYO')}
                    className="absolute left-[110px] w-96 p-2.5 rounded-xl bg-[#1c1d24] border border-[#2b2c37] hover:border-[#3d3f4f] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <h4 className="text-xs font-medium text-white">Préstamo Mayor: Bs. 125,000</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">Rend: Bs. 7,500/mes</span>
                    </div>
                    <div className="text-[10px] text-[#7e808c] mt-0.5 flex justify-between">
                      <span>12 pagos registrados continuos</span>
                      <span>Tasa: 6% mensual</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila 5: VICTORIA CORONADO DURAN */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-white block">VICTORIA CORONADO</span>
                  <span className="text-[10px] text-[#6e707b]">CI: 5488548 • Bs. 5,000</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onClick={() => onSelectFolder && onSelectFolder('VICTORIA CORONADO DURAN')}
                    className="absolute left-[580px] w-64 p-2.5 rounded-xl bg-[#1c1d24] border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <h4 className="text-xs font-medium text-white">Cuota: Bs. 500</h4>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">Vence: 28 Oct</span>
                    </div>
                    <div className="text-[10px] text-[#7e808c] mt-0.5">Saldo capital restante: Bs. 5,000</div>
                  </div>
                </div>
              </div>

              {/* Fila 6: JIMENA CORDOVA PARADA (CONECTADA CON NODO A VICTORIA) */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-white block">JIMENA CORDOVA</span>
                  <span className="text-[10px] text-[#6e707b]">Tel: 73610261 • Doc. Privado</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onClick={() => onSelectFolder && onSelectFolder('JIMENA CORDOVA PARADA')}
                    className="absolute left-[580px] w-64 p-2.5 rounded-xl bg-[#1c1d24] border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <h4 className="text-xs font-medium text-white">Cuota: Bs. 220</h4>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">Vence: 28 Oct</span>
                    </div>
                    <div className="text-[10px] text-[#7e808c] mt-0.5">Capital: Bs. 2,200 • 10% tasa</div>
                  </div>
                </div>
              </div>

              {/* Fila 7: SANTOS VICENTE VILLEGAS (CAMIÓN EN GARANTÍA) */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-white block">Santos Vicente Villegas</span>
                  <span className="text-[10px] text-amber-400">Garantía: Camión Pesado</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onClick={() => onSelectFolder && onSelectFolder('SANTOS VICENTE VILLEGAS RAMOS')}
                    className="absolute left-[410px] w-80 p-2.5 rounded-xl bg-[#1c1d24] border border-[#2b2c37] hover:border-[#3d3f4f] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <h4 className="text-xs font-bold text-white">Capital: Bs. 196,000</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">Cuota: Bs. 9,800</span>
                    </div>
                    <div className="text-[10px] text-[#7e808c] mt-0.5 flex justify-between">
                      <span>5 cuotas pagadas (de 8)</span>
                      <span className="text-emerald-400">Al Día</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila 8: ROLY CUELLAR (MACBOOK) */}
              <div className="flex items-center">
                <div className="w-52 shrink-0 pr-4">
                  <span className="text-xs font-semibold text-white block">ROLY CUELLAR</span>
                  <span className="text-[10px] text-[#6e707b]">Nota: Debe de la Macbook</span>
                </div>
                <div className="flex-1 relative h-14 flex items-center">
                  <div 
                    onClick={() => onSelectFolder && onSelectFolder('ROLY CUELLAR BALCAZAR')}
                    className="absolute left-[490px] w-64 p-2.5 rounded-xl bg-[#1c1d24] border border-[#2b2c37] hover:border-[#3d3f4f] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <h4 className="text-xs font-medium text-white">Cuota: Bs. 400</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">7 meses saldados</span>
                    </div>
                    <div className="text-[10px] text-[#7e808c] mt-0.5">Saldo restante: Bs. 4,000</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
