import React from 'react';
import { 
  Calendar, Folder, Clock, Users, ArrowUpRight, 
  ArrowDownLeft, Bell, Sun, Moon, Plus, DollarSign, Sliders,
  PieChart, Activity, TrendingUp, Calculator, Layers
} from 'lucide-react';

export default function Sidebar({
  viewMode,
  setViewMode,
  carteraFiltro,
  setCarteraFiltro,
  counts = {},
  totalCapital = 380200,
  totalRendimiento = 23220,
  currency = 'BOB',
  setCurrency,
  theme,
  toggleTheme,
  onOpenAlerts,
  alertasCount = 0,
  onOpenNewLoan,
  onOpenSettings,
  onOpenSimulator,
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Cálculos visuales de cartera para gráficos planos
  const totalRegistros = counts.total || 11;
  const otorgadosCount = counts.otorgados || 9;
  const recibidosCount = counts.recibidos || 2;
  const pctOtorgados = Math.round((otorgadosCount / totalRegistros) * 100);
  const pctRecibidos = 100 - pctOtorgados;

  return (
    <aside className="w-64 bg-[#0d0e11] border-r border-[#202126] flex flex-col justify-between shrink-0 h-full select-none z-30 text-[#f3f4f6] transition-colors duration-150">
      
      <div className="p-3.5 space-y-4 overflow-y-auto custom-scroll">
        
        {/* BOTÓN SUPERIOR (+ NUEVO) */}
        <button
          onClick={onOpenNewLoan}
          className="w-full py-2.5 px-3 rounded-xl bg-[#141518] hover:bg-[#1a1b20] text-white text-xs font-semibold flex items-center justify-between transition-all border border-[#24252a] shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#f3f4f6] text-[#0d0e11] flex items-center justify-center font-bold text-xs">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[13px]">Nuevo Registro</span>
          </div>
          <span className="text-[10px] text-[#8b8f98] font-medium">+ Préstamo</span>
        </button>

        {/* NAVEGACIÓN PRINCIPAL CON ÍCONOS LIMPIOS */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#6e737e] px-2 block mb-1">
            Vistas
          </span>

          {/* VISTA 1: LIENZO DE NODOS (INSPIRADO EN EL WORKFLOW CANVAS) */}
          <button
            onClick={() => setViewMode('flow')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'flow'
                ? 'bg-[#18191e] text-white shadow-xs border border-[#2e3037]'
                : 'text-[#8b8f98] hover:bg-[#141518] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-zinc-300" />
              <span className="text-[13px] font-semibold">Lienzo de Nodos</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
              Grafo
            </span>
          </button>

          {/* VISTA 2: CRONOGRAMA */}
          <button
            onClick={() => setViewMode('timeline')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'timeline'
                ? 'bg-[#18191e] text-white shadow-xs border border-[#2e3037]'
                : 'text-[#8b8f98] hover:bg-[#141518] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span className="text-[13px]">Cronograma</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#141518] text-[#8b8f98]">
              {counts.total || 9}
            </span>
          </button>

          {/* VISTA 3: EXPEDIENTES */}
          <button
            onClick={() => setViewMode('folders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'folders'
                ? 'bg-[#18191e] text-white shadow-xs border border-[#2e3037]'
                : 'text-[#8b8f98] hover:bg-[#141518] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-zinc-400" />
              <span className="text-[13px]">Expedientes</span>
            </div>
          </button>

          {/* VISTA 4: FLUJO DIARIO */}
          <button
            onClick={() => setViewMode('stream')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'stream'
                ? 'bg-[#18191e] text-white shadow-xs border border-[#2e3037]'
                : 'text-[#8b8f98] hover:bg-[#141518] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-[13px]">Flujo Diario</span>
            </div>
          </button>
        </div>

        {/* FILTROS DE CARTERA */}
        <div className="space-y-1 pt-2 border-t border-[#202126]">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#6e737e] px-2 block mb-1">
            Filtros de Cartera
          </span>

          <button
            onClick={() => setCarteraFiltro('todos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              carteraFiltro === 'todos' 
                ? 'bg-[#18191e] text-white font-semibold shadow-xs border border-[#2e3037]' 
                : 'text-[#8b8f98] hover:bg-[#141518] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#8b8f98]" />
              <span className="text-[13px]">Todos</span>
            </div>
            <span className="text-[11px] font-mono text-[#8b8f98]">{counts.total || 11}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('otorgados')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              carteraFiltro === 'otorgados' 
                ? 'bg-[#18191e] text-white font-semibold shadow-xs border border-[#2e3037]' 
                : 'text-[#8b8f98] hover:bg-[#141518] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowUpRight className="w-4 h-4 text-zinc-300" />
              <span className="text-[13px]">Cobros Activos</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-200 font-bold">{counts.otorgados || 9}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('recibidos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              carteraFiltro === 'recibidos' 
                ? 'bg-[#18191e] text-white font-semibold shadow-xs border border-[#2e3037]' 
                : 'text-[#8b8f98] hover:bg-[#141518] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowDownLeft className="w-4 h-4 text-zinc-400" />
              <span className="text-[13px]">Acreedores</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-300 font-bold">{counts.recibidos || 2}</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#8b8f98] hover:bg-[#141518] hover:text-white transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-zinc-400" />
              <span className="text-[13px]">Vencimientos</span>
            </div>
            {alertasCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                {alertasCount}
              </span>
            )}
          </button>

          {/* SIMULADOR FINANCIERO */}
          <button
            onClick={onOpenSimulator}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#8b8f98] hover:bg-[#141518] hover:text-white transition-all"
            title="Simulador de préstamos y retorno de inversión"
          >
            <div className="flex items-center gap-2.5">
              <Calculator className="w-4 h-4 text-zinc-400" />
              <span className="text-[13px]">Simulador</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
              PRO
            </span>
          </button>
        </div>

        {/* GRÁFICOS Y MÉTRICAS VISUALES DE LA CARTERA */}
        <div className="p-3.5 rounded-2xl bg-[#141518] border border-[#24252a] space-y-3 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#6e737e] uppercase font-bold tracking-wider">
                Capital Colocado
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-300">
                {pctOtorgados}% Activo
              </span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-0.5 tracking-tight">
              {symbol} {Number(totalCapital).toLocaleString()}
            </div>
          </div>

          {/* Gráfico de distribución de cartera (Segmented Bar Monocromático) */}
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full bg-[#0a0b0d] overflow-hidden flex">
              <div 
                className="h-full bg-zinc-300 rounded-l-full transition-all duration-300" 
                style={{ width: `${pctOtorgados}%` }}
                title={`Cobros Activos: ${pctOtorgados}%`}
              />
              <div 
                className="h-full bg-zinc-600 rounded-r-full transition-all duration-300" 
                style={{ width: `${pctRecibidos}%` }}
                title={`Acreedores: ${pctRecibidos}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#6e737e] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                Cobros ({otorgadosCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                Acreedores ({recibidosCount})
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-[#202126] flex items-center justify-between text-xs">
            <span className="text-[#8b8f98] text-[11px]">Rendimiento Est.:</span>
            <span className="font-mono font-bold text-white">
              +{symbol} {Number(totalRendimiento).toLocaleString()}/m
            </span>
          </div>
        </div>

      </div>

      {/* FOOTER DE USUARIO, MONEDA Y AJUSTES */}
      <div className="p-3.5 border-t border-[#202126] space-y-3 bg-[#0d0e11]">
        <div className="flex items-center justify-between gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex-1 bg-[#141518] hover:bg-[#1a1b20] border border-[#24252a] text-xs font-mono text-white px-2.5 py-1.5 rounded-xl outline-none cursor-pointer transition-all"
          >
            <option value="BOB">Bs. BOB</option>
            <option value="USD">$ USD</option>
            <option value="PEN">S/ PEN</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-xl bg-[#141518] hover:bg-[#1a1b20] text-[#8b8f98] hover:text-white flex items-center justify-center border border-[#24252a] transition-all"
              title="Ajustes y Auditoría"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* BOTÓN TOGGLE MODO CLARO / OSCURO */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-[#141518] hover:bg-[#1a1b20] text-[#8b8f98] hover:text-white flex items-center justify-center border border-[#24252a] transition-all"
              title={theme === 'dark' ? 'Activar Modo Claro' : 'Activar Modo Noche'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-zinc-300" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        <div 
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-[#1a1b1f] transition-all cursor-pointer"
          title="Abrir perfil y ajustes"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-[#202126] border border-zinc-700 dark:border-[#2d2f36] flex items-center justify-center font-bold text-xs text-white">
            CJ
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-zinc-900 dark:text-[#ececec] block truncate leading-none">Carlos Joel</span>
            <span className="text-[11px] text-zinc-500 dark:text-[#737373] block truncate font-mono mt-0.5">carlosjoelsb@gmail.com</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
