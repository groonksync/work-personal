import React from 'react';
import { Search, Plus, Bell, Share2 } from 'lucide-react';

export default function Topbar({
  breadcrumb = 'Timeline de Vencimientos & Nodos',
  searchQuery,
  setSearchQuery,
  onOpenNewLoan,
  onOpenAlerts,
  alertasCount = 0,
}) {
  return (
    <header className="h-14 px-6 border-b border-[#1c1d24] flex items-center justify-between gap-4 bg-[#111216] select-none shrink-0 z-20">
      
      {/* Breadcrumb / Título de la vista */}
      <div className="flex items-center gap-2 text-xs text-[#717382]">
        <span className="text-[#a0a2b2] font-semibold">Préstamos</span>
        <span>›</span>
        <span className="text-white font-medium">{breadcrumb}</span>
      </div>

      {/* Buscador y Acciones */}
      <div className="flex items-center gap-3">
        
        {/* Buscador Rápido Funcional */}
        <div className="flex items-center gap-2 bg-[#181920] px-3 py-1.5 rounded-lg text-xs text-[#717382] border border-white/[0.04] focus-within:border-purple-500/40 transition-all">
          <Search className="w-3.5 h-3.5 text-[#717382]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, CI o teléfono..."
            className="bg-transparent outline-none w-48 sm:w-64 text-white placeholder-[#52535d]"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="text-[#717382] hover:text-white">✕</button>
          ) : (
            <span className="text-[10px] bg-[#22232c] px-1.5 py-0.2 rounded text-[#818391] font-mono">⌘K</span>
          )}
        </div>

        {/* Campana de Avisos */}
        <button
          onClick={onOpenAlerts}
          className="h-8 px-3 rounded-lg bg-[#181920] hover:bg-[#20222a] text-[#8c8e9b] hover:text-white flex items-center gap-1.5 text-xs transition-all border border-white/[0.04]"
          title="Ver alertas de cobro"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Avisos</span>
          {alertasCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              {alertasCount}
            </span>
          )}
        </button>

        {/* Botón Principal Blanco Puro (Sin trazos gruesos) */}
        <button
          onClick={onOpenNewLoan}
          className="h-8 px-3.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo Préstamo</span>
        </button>

      </div>

    </header>
  );
}
