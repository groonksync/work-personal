import React from 'react';
import { 
  Calendar, Folder, Zap, DollarSign, Bell, 
  Sun, Moon, Users, ShieldAlert, ArrowUpRight 
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
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  return (
    <aside className="w-60 bg-[#121316] border-r border-[#1e1f26] flex flex-col justify-between shrink-0 h-full select-none z-30">
      
      <div className="p-4 space-y-6">
        
        {/* Identidad de la App */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-white text-xs font-black shadow-sm">
              W
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>WORK</span><span className="font-normal italic text-purple-400">PERSONAL</span>
              </div>
              <span className="text-[10px] text-[#6b6d7a] block font-mono">Gestor de Préstamos</span>
            </div>
          </div>
        </div>

        {/* Módulo 1: Modos de Vista */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#52535d] px-2 block mb-1">
            Vistas Principales
          </span>

          <button
            onClick={() => setViewMode('timeline')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'timeline'
                ? 'bg-[#1e1f27] text-white shadow-xs'
                : 'text-[#8c8e9b] hover:bg-[#181920] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-purple-400 font-bold">∿</span>
              <span>Cronograma Nodos</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
              {counts.total || 9}
            </span>
          </button>

          <button
            onClick={() => setViewMode('folders')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'folders'
                ? 'bg-[#1e1f27] text-white shadow-xs'
                : 'text-[#8c8e9b] hover:bg-[#181920] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="w-3.5 h-3.5 text-[#6e707d]" />
              <span>Expedientes / Carpetas</span>
            </div>
          </button>

          <button
            onClick={() => setViewMode('stream')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'stream'
                ? 'bg-[#1e1f27] text-white shadow-xs'
                : 'text-[#8c8e9b] hover:bg-[#181920] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Stream Diario</span>
            </div>
          </button>
        </div>

        {/* Módulo 2: Filtros de Cartera */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#52535d] px-2 block mb-1">
            Cartera de Préstamos
          </span>

          <button
            onClick={() => setCarteraFiltro('todos')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              carteraFiltro === 'todos' ? 'text-white bg-[#181920]' : 'text-[#8c8e9b] hover:bg-[#181920] hover:text-white'
            }`}
          >
            <span>Todos los Contratos</span>
            <span className="text-[11px] font-mono text-[#6e707d]">{counts.total || 11}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('otorgados')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              carteraFiltro === 'otorgados' ? 'text-white bg-[#181920]' : 'text-[#8c8e9b] hover:bg-[#181920] hover:text-white'
            }`}
          >
            <span>Cobros Activos (Prestatarios)</span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">{counts.otorgados || 9}</span>
          </button>

          <button
            onClick={() => setCarteraFiltro('recibidos')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              carteraFiltro === 'recibidos' ? 'text-purple-300 bg-purple-500/10' : 'text-[#8c8e9b] hover:bg-[#181920] hover:text-white'
            }`}
          >
            <span>Acreedores (Fondeo / Bancos)</span>
            <span className="text-[11px] font-mono text-purple-400 font-bold">{counts.recibidos || 2}</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#8c8e9b] hover:bg-[#181920] hover:text-white transition-all"
          >
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Avisos de Cobro</span>
            </div>
            {alertasCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                {alertasCount}
              </span>
            )}
          </button>
        </div>

        {/* Módulo 3: Métricas de Liquidez */}
        <div className="p-3 rounded-xl bg-[#16171e] border border-[#20212a] space-y-1.5">
          <span className="text-[10px] text-[#717382] uppercase font-bold tracking-wider block">
            Capital Colocado
          </span>
          <div className="text-sm font-bold font-mono text-white">
            {symbol} {Number(totalCapital).toLocaleString()}
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#20212a] text-[10px]">
            <span className="text-[#717382]">Rendimiento Est.:</span>
            <span className="font-mono font-bold text-emerald-400">
              +{symbol} {Number(totalRendimiento).toLocaleString()}/mes
            </span>
          </div>
        </div>

      </div>

      {/* Footer de Configuración y Usuario */}
      <div className="p-4 border-t border-[#1e1f26] space-y-3">
        <div className="flex items-center justify-between">
          {/* Selector de Moneda */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-[#181920] border border-white/5 text-[11px] font-mono text-white px-2 py-1 rounded-md outline-none cursor-pointer"
          >
            <option value="BOB">Bs. BOB</option>
            <option value="USD">$ USD</option>
            <option value="PEN">S/ PEN</option>
          </select>

          {/* Toggle de Tema */}
          <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-md bg-[#181920] hover:bg-[#20222b] text-[#7e808e] hover:text-white flex items-center justify-center transition-all"
            title="Alternar Modo Claro / Oscuro"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Perfil */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-7 h-7 rounded-full bg-[#242530] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
            CJ
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-white block truncate leading-none">Carlos Joel</span>
            <span className="text-[10px] text-[#6b6d7a] block truncate font-mono mt-0.5">carlosjoelsb@gmail.com</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
