import React from 'react';
import { 
  Calendar, Folder, Clock, Users, ArrowUpRight, 
  ArrowDownLeft, Bell, Sun, Moon, Plus, DollarSign, Sliders 
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

  return (
    <aside className="w-64 bg-[#171717] border-r border-[#262626] flex flex-col justify-between shrink-0 h-full select-none z-30 text-[#ececec]">
      
      <div className="p-3.5 space-y-4">
        
        {/* BOTÓN SUPERIOR ESTILO CHATGPT (+ NUEVO) */}
        <button
          onClick={onOpenNewLoan}
          className="w-full py-2.5 px-3 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-white text-xs font-medium flex items-center justify-between transition-all border border-[#2f2f2f] hover:border-[#3d3d3d] shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-semibold text-[13px]">Nuevo Registro</span>
          </div>
          <span className="text-[11px] text-[#8e8e8e] font-mono">⌘N</span>
        </button>

        {/* NAVEGACIÓN PRINCIPAL CON ÍCONOS LIMPIOS (ESTILO CHATGPT) */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium tracking-wider uppercase text-[#737373] px-2 block mb-1">
            Vistas
          </span>

          <button
            onClick={() => setViewMode('timeline')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'timeline'
                ? 'bg-[#2a2a2a] text-white'
                : 'text-[#a3a3a3] hover:bg-[#212121] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#d4d4d4]" />
              <span className="text-[13px]">Cronograma</span>
            </div>
            <span className="text-[11px] font-mono text-[#a3a3a3] bg-[#212121] px-2 py-0.5 rounded">
              {counts.total || 9}
            </span>
          </button>

          <button
            onClick={() => setViewMode('folders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'folders'
                ? 'bg-[#2a2a2a] text-white'
                : 'text-[#a3a3a3] hover:bg-[#212121] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-[#d4d4d4]" />
              <span className="text-[13px]">Expedientes</span>
            </div>
          </button>

          <button
            onClick={() => setViewMode('stream')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'stream'
                ? 'bg-[#2a2a2a] text-white'
                : 'text-[#a3a3a3] hover:bg-[#212121] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#d4d4d4]" />
              <span className="text-[13px]">Flujo Diario</span>
            </div>
          </button>
        </div>

        {/* FILTROS DE CARTERA (ÍCONOS Y NÚMEROS LEGIBLES) */}
        <div className="space-y-1 pt-2 border-t border-[#262626]">
          <span className="text-[10px] font-medium tracking-wider uppercase text-[#737373] px-2 block mb-1">
            Filtros
          </span>

          <button
            onClick={() => setCarteraFiltro('todos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
              carteraFiltro === 'todos' 
                ? 'bg-[#2a2a2a] text-white font-medium' 
                : 'text-[#a3a3a3] hover:bg-[#212121] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#a3a3a3]" />
              <span className="text-[13px]">Todos</span>
            </div>
            <span className="text-[11px] font-mono text-[#737373]">{counts.total || 11}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('otorgados')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
              carteraFiltro === 'otorgados' 
                ? 'bg-[#2a2a2a] text-white font-medium' 
                : 'text-[#a3a3a3] hover:bg-[#212121] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span className="text-[13px]">Cobros Activos</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">{counts.otorgados || 9}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('recibidos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
              carteraFiltro === 'recibidos' 
                ? 'bg-[#2a2a2a] text-white font-medium' 
                : 'text-[#a3a3a3] hover:bg-[#212121] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowDownLeft className="w-4 h-4 text-purple-400" />
              <span className="text-[13px]">Acreedores</span>
            </div>
            <span className="text-[11px] font-mono text-purple-400 font-semibold">{counts.recibidos || 2}</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#a3a3a3] hover:bg-[#212121] hover:text-white transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-[13px]">Vencimientos</span>
            </div>
            {alertasCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold">
                {alertasCount}
              </span>
            )}
          </button>
        </div>

        {/* PANEL DE CAPITAL (NÚMEROS GRANDES Y CLAROS) */}
        <div className="p-3.5 rounded-xl bg-[#212121] border border-[#2d2d2d] space-y-2">
          <div>
            <span className="text-[10px] text-[#737373] uppercase font-semibold tracking-wider block">
              Capital Colocado
            </span>
            <div className="text-base font-bold font-mono text-white mt-0.5 tracking-tight">
              {symbol} {Number(totalCapital).toLocaleString()}
            </div>
          </div>
          
          <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-xs">
            <span className="text-[#8e8e8e]">Rendimiento:</span>
            <span className="font-mono font-bold text-emerald-400">
              +{symbol} {Number(totalRendimiento).toLocaleString()}/m
            </span>
          </div>
        </div>

      </div>

      {/* FOOTER DE USUARIO Y CONFIGURACIÓN */}
      <div className="p-3.5 border-t border-[#262626] space-y-3">
        <div className="flex items-center justify-between">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-[#212121] hover:bg-[#2a2a2a] border border-[#2f2f2f] text-xs font-mono text-white px-2.5 py-1.5 rounded-lg outline-none cursor-pointer transition-all"
          >
            <option value="BOB">Bs. BOB</option>
            <option value="USD">$ USD</option>
            <option value="PEN">S/ PEN</option>
          </select>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-[#8e8e8e] hover:text-white flex items-center justify-center border border-[#2f2f2f] transition-all"
              title="Ajustes y Auditoría"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-[#8e8e8e] hover:text-white flex items-center justify-center border border-[#2f2f2f] transition-all"
              title="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div 
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-[#212121] transition-all cursor-pointer"
          title="Abrir perfil y ajustes"
        >
          <div className="w-7 h-7 rounded-full bg-[#2f2f2f] border border-[#3d3d3d] flex items-center justify-center font-bold text-xs text-white">
            CJ
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-medium text-[#ececec] block truncate leading-none">Carlos Joel</span>
            <span className="text-[11px] text-[#737373] block truncate font-mono mt-0.5">carlosjoelsb@gmail.com</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
