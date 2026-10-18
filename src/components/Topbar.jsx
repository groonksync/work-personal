import React from 'react';
import { Search, Plus, Bell, X, Calendar, Folder, Clock, Sliders, Calculator } from 'lucide-react';

export default function Topbar({
  viewMode = 'timeline',
  breadcrumb = 'Cronograma',
  searchQuery,
  setSearchQuery,
  onOpenNewLoan,
  onOpenAlerts,
  alertasCount = 0,
  onOpenSettings,
  onOpenSimulator,
}) {
  const getIcon = () => {
    if (viewMode === 'timeline') return <Calendar className="w-4 h-4 text-zinc-300" />;
    if (viewMode === 'folders') return <Folder className="w-4 h-4 text-zinc-300" />;
    return <Clock className="w-4 h-4 text-zinc-300" />;
  };

  return (
    <header className="h-14 px-6 border-b border-[#1f2025] flex items-center justify-between gap-4 bg-[#111214] select-none shrink-0 z-20 text-[#f3f4f6] transition-colors duration-150">
      
      {/* Título de la vista actual con ícono */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#1a1b1e] border border-[#26282e] flex items-center justify-center">
          {getIcon()}
        </div>
        <span className="text-xs font-bold text-white tracking-tight uppercase">
          {breadcrumb}
        </span>
      </div>

      {/* Buscador y Acciones */}
      <div className="flex items-center gap-2">
        
        {/* Buscador suave redondeado tipo Knowledge Base */}
        <div className="flex items-center gap-2 bg-[#1a1b1e] hover:bg-[#202126] px-3 py-1.5 rounded-lg text-xs border border-[#26282e] focus-within:border-zinc-500 focus-within:bg-[#1f2025] transition-all w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por persona, CI o fecha..."
            className="bg-transparent outline-none w-full text-white placeholder-zinc-500 text-[12px]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Botón de Simulador de Créditos */}
        <button
          onClick={onOpenSimulator}
          className="h-8 px-2.5 rounded-lg bg-[#1a1b1e] hover:bg-[#25272d] text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs transition-all border border-[#26282e]"
          title="Simulador de Préstamos y Rendimiento"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline font-medium">Simulador</span>
        </button>

        {/* Campana de Vencimientos */}
        <button
          onClick={onOpenAlerts}
          className="h-8 px-2.5 rounded-lg bg-[#1a1b1e] hover:bg-[#25272d] text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs transition-all border border-[#26282e]"
          title="Ver alertas y vencimientos"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          {alertasCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              {alertasCount}
            </span>
          )}
        </button>

        {/* Botón de Ajustes y Auditoría */}
        <button
          onClick={onOpenSettings}
          className="h-8 w-8 rounded-lg bg-[#1a1b1e] hover:bg-[#25272d] text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-all border border-[#26282e]"
          title="Ajustes y Auditoría"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Botón Nuevo Préstamo */}
        <button
          onClick={onOpenNewLoan}
          className="h-8 px-3 rounded-lg bg-white hover:bg-zinc-200 text-[#111214] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Nuevo Préstamo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

      </div>

    </header>
  );
}
