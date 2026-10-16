import React from 'react';
import { 
  Calendar, Folder, Clock, Users, ArrowUpRight, 
  ArrowDownLeft, Bell, Sun, Moon, Plus, DollarSign, Sliders,
  PieChart, Activity, TrendingUp
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
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Cálculos visuales de cartera para gráficos planos
  const totalRegistros = counts.total || 11;
  const otorgadosCount = counts.otorgados || 9;
  const recibidosCount = counts.recibidos || 2;
  const pctOtorgados = Math.round((otorgadosCount / totalRegistros) * 100);
  const pctRecibidos = 100 - pctOtorgados;

  return (
    <aside className="w-64 bg-zinc-50 dark:bg-[#171717] border-r border-zinc-200 dark:border-[#262626] flex flex-col justify-between shrink-0 h-full select-none z-30 text-zinc-800 dark:text-[#ececec] transition-colors duration-150">
      
      <div className="p-3.5 space-y-4 overflow-y-auto custom-scroll">
        
        {/* BOTÓN SUPERIOR (+ NUEVO) SIN ATAJOS DE TECLADO */}
        <button
          onClick={onOpenNewLoan}
          className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-black dark:bg-[#242424] dark:hover:bg-[#2c2c2c] text-white text-xs font-semibold flex items-center justify-between transition-all border border-zinc-800 dark:border-[#333333] shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[13px]">Nuevo Registro</span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-[#8e8e8e] font-medium">+ Préstamo</span>
        </button>

        {/* NAVEGACIÓN PRINCIPAL CON ÍCONOS LIMPIOS */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-[#737373] px-2 block mb-1">
            Vistas
          </span>

          <button
            onClick={() => setViewMode('timeline')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-[#262626] text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-[#333]'
                : 'text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#212121] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-zinc-500 dark:text-[#d4d4d4]" />
              <span className="text-[13px]">Cronograma</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-[#212121] text-zinc-600 dark:text-[#a3a3a3]">
              {counts.total || 9}
            </span>
          </button>

          <button
            onClick={() => setViewMode('folders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'folders'
                ? 'bg-white dark:bg-[#262626] text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-[#333]'
                : 'text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#212121] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-zinc-500 dark:text-[#d4d4d4]" />
              <span className="text-[13px]">Expedientes</span>
            </div>
          </button>

          <button
            onClick={() => setViewMode('stream')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'stream'
                ? 'bg-white dark:bg-[#262626] text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-[#333]'
                : 'text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#212121] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-zinc-500 dark:text-[#d4d4d4]" />
              <span className="text-[13px]">Flujo Diario</span>
            </div>
          </button>
        </div>

        {/* FILTROS DE CARTERA */}
        <div className="space-y-1 pt-2 border-t border-zinc-200 dark:border-[#262626]">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-[#737373] px-2 block mb-1">
            Filtros de Cartera
          </span>

          <button
            onClick={() => setCarteraFiltro('todos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              carteraFiltro === 'todos' 
                ? 'bg-white dark:bg-[#262626] text-zinc-900 dark:text-white font-semibold shadow-xs border border-zinc-200/80 dark:border-[#333]' 
                : 'text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#212121] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-zinc-400 dark:text-[#a3a3a3]" />
              <span className="text-[13px]">Todos</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-[#737373]">{counts.total || 11}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('otorgados')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              carteraFiltro === 'otorgados' 
                ? 'bg-white dark:bg-[#262626] text-zinc-900 dark:text-white font-semibold shadow-xs border border-zinc-200/80 dark:border-[#333]' 
                : 'text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#212121] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[13px]">Cobros Activos</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{counts.otorgados || 9}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('recibidos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
              carteraFiltro === 'recibidos' 
                ? 'bg-white dark:bg-[#262626] text-zinc-900 dark:text-white font-semibold shadow-xs border border-zinc-200/80 dark:border-[#333]' 
                : 'text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#212121] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowDownLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-[13px]">Acreedores</span>
            </div>
            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">{counts.recibidos || 2}</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#212121] hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-[13px]">Vencimientos</span>
            </div>
            {alertasCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold">
                {alertasCount}
              </span>
            )}
          </button>
        </div>

        {/* GRÁFICOS Y MÉTRICAS VISUALES DE LA CARTERA (SKILL PROFESSIONAL-UI-DESIGN) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#2d2d2d] space-y-3 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 dark:text-[#737373] uppercase font-bold tracking-wider">
                Capital Colocado
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {pctOtorgados}% Activo
              </span>
            </div>
            <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-0.5 tracking-tight">
              {symbol} {Number(totalCapital).toLocaleString()}
            </div>
          </div>

          {/* Gráfico de distribución de cartera (Segmented Bar) */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-[#191919] overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-300" 
                style={{ width: `${pctOtorgados}%` }}
                title={`Cobros Activos: ${pctOtorgados}%`}
              />
              <div 
                className="h-full bg-purple-500 rounded-r-full transition-all duration-300" 
                style={{ width: `${pctRecibidos}%` }}
                title={`Acreedores: ${pctRecibidos}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 dark:text-[#737373] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Cobros ({otorgadosCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Acreedores ({recibidosCount})
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-zinc-100 dark:border-[#2a2a2a] flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-[#8e8e8e] text-[11px]">Rendimiento Est.:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +{symbol} {Number(totalRendimiento).toLocaleString()}/m
            </span>
          </div>
        </div>

      </div>

      {/* FOOTER DE USUARIO, MONEDA Y ALTERNADOR DE MODO CLARO / OSCURO */}
      <div className="p-3.5 border-t border-zinc-200 dark:border-[#262626] space-y-3 bg-zinc-50/50 dark:bg-[#171717]">
        <div className="flex items-center justify-between gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex-1 bg-white dark:bg-[#212121] hover:bg-zinc-100 dark:hover:bg-[#2a2a2a] border border-zinc-200 dark:border-[#2f2f2f] text-xs font-mono text-zinc-900 dark:text-white px-2.5 py-1.5 rounded-lg outline-none cursor-pointer transition-all"
          >
            <option value="BOB">Bs. BOB</option>
            <option value="USD">$ USD</option>
            <option value="PEN">S/ PEN</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-lg bg-white dark:bg-[#212121] hover:bg-zinc-100 dark:hover:bg-[#2a2a2a] text-zinc-600 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white flex items-center justify-center border border-zinc-200 dark:border-[#2f2f2f] transition-all"
              title="Ajustes y Auditoría"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* BOTÓN TOGGLE MODO CLARO / MODO NOCHE */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-white dark:bg-[#212121] hover:bg-zinc-100 dark:hover:bg-[#2a2a2a] text-zinc-600 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white flex items-center justify-center border border-zinc-200 dark:border-[#2f2f2f] transition-all"
              title={theme === 'dark' ? 'Activar Modo Claro' : 'Activar Modo Noche'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-800" />
              )}
            </button>
          </div>
        </div>

        <div 
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-[#212121] transition-all cursor-pointer"
          title="Abrir perfil y ajustes"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-[#2f2f2f] border border-zinc-700 dark:border-[#3d3d3d] flex items-center justify-center font-bold text-xs text-white">
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
