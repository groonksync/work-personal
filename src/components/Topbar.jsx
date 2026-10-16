import React from 'react';
import { Search, Plus, Bell, X, Calendar, Folder, Clock, Sliders } from 'lucide-react';

export default function Topbar({
  viewMode = 'timeline',
  breadcrumb = 'Cronograma',
  searchQuery,
  setSearchQuery,
  onOpenNewLoan,
  onOpenAlerts,
  alertasCount = 0,
  onOpenSettings,
}) {
  const getIcon = () => {
    if (viewMode === 'timeline') return <Calendar className="w-4 h-4 text-[#d4d4d4]" />;
    if (viewMode === 'folders') return <Folder className="w-4 h-4 text-[#d4d4d4]" />;
    return <Clock className="w-4 h-4 text-[#d4d4d4]" />;
  };

  return (
    <header className="h-14 px-6 border-b border-[#2a2a2a] flex items-center justify-between gap-4 bg-[#212121] select-none shrink-0 z-20 text-[#ececec]">
      
      {/* Título de la vista actual con ícono */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] flex items-center justify-center">
          {getIcon()}
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">
          {breadcrumb}
        </span>
      </div>

      {/* Buscador y Acciones (Estilo ChatGPT) */}
      <div className="flex items-center gap-3">
        
        {/* Buscador suave redondeado tipo ChatGPT */}
        <div className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#303030] px-3.5 py-1.5 rounded-full text-xs text-[#b4b4b4] border border-[#383838] focus-within:border-[#4d4d4d] focus-within:bg-[#2f2f2f] transition-all w-52 sm:w-72">
          <Search className="w-4 h-4 text-[#8e8e8e] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar persona o fecha..."
            className="bg-transparent outline-none w-full text-white placeholder-[#737373] text-[13px]"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="text-[#8e8e8e] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] bg-[#212121] px-1.5 py-0.5 rounded text-[#737373] font-mono shrink-0">⌘K</span>
          )}
        </div>

        {/* Campana de Vencimientos */}
        <button
          onClick={onOpenAlerts}
          className="h-8 px-3 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#b4b4b4] hover:text-white flex items-center gap-1.5 text-xs transition-all border border-[#333333]"
          title="Ver alertas y vencimientos"
        >
          <Bell className="w-4 h-4 text-amber-400" />
          {alertasCount > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold">
              {alertasCount}
            </span>
          )}
        </button>

        {/* Botón de Ajustes y Auditoría */}
        <button
          onClick={onOpenSettings}
          className="h-8 w-8 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#b4b4b4] hover:text-white flex items-center justify-center text-xs transition-all border border-[#333333]"
          title="Ajustes y Auditoría"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Botón Nuevo Préstamo (Liso, suave y limpio) */}
        <button
          onClick={onOpenNewLoan}
          className="h-8 px-3.5 rounded-lg bg-[#f3f3f3] hover:bg-white text-[#171717] font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Nuevo Préstamo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

      </div>

    </header>
  );
}
