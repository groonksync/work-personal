import React from 'react';
import { Search, Plus, Bell, X, Calendar, Folder, Clock, Sliders, Calculator, Layers } from 'lucide-react';

export default function Topbar({
  viewMode = 'flow',
  breadcrumb = 'Lienzo de Nodos',
  searchQuery,
  setSearchQuery,
  onOpenNewLoan,
  onOpenAlerts,
  alertasCount = 0,
  onOpenSettings,
  onOpenSimulator,
}) {
  const getIcon = () => {
    if (viewMode === 'flow') return <Layers className="w-4 h-4 text-zinc-200" />;
    if (viewMode === 'timeline') return <Calendar className="w-4 h-4 text-zinc-200" />;
    if (viewMode === 'folders') return <Folder className="w-4 h-4 text-zinc-200" />;
    return <Clock className="w-4 h-4 text-zinc-200" />;
  };

  return (
    <header className="h-14 px-6 border-b border-[#202126] flex items-center justify-between gap-4 bg-[#0d0e11] select-none shrink-0 z-20 text-[#f3f4f6] transition-colors duration-150">
      
      {/* Título de la vista actual con ícono */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#141518] border border-[#24252a] flex items-center justify-center">
          {getIcon()}
        </div>
        <span className="text-xs font-bold text-white tracking-tight uppercase">
          {breadcrumb}
        </span>
      </div>

      {/* Buscador y Acciones */}
      <div className="flex items-center gap-2">
        
        {/* Buscador suave redondeado tipo Knowledge Base */}
        <div className="flex items-center gap-2 bg-[#141518] hover:bg-[#18191e] px-3 py-1.5 rounded-xl text-xs border border-[#24252a] focus-within:border-zinc-500 focus-within:bg-[#18191e] transition-all w-48 sm:w-64">
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
          className="h-8 px-2.5 rounded-xl bg-[#141518] hover:bg-[#1a1b20] text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs transition-all border border-[#24252a]"
          title="Simulador de Préstamos y Rendimiento"
        >
          <Calculator className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden xl:inline font-medium">Simulador</span>
        </button>

        {/* Campana de Vencimientos */}
        <button
          onClick={onOpenAlerts}
          className="h-8 px-2.5 rounded-xl bg-[#141518] hover:bg-[#1a1b20] text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs transition-all border border-[#24252a]"
          title="Ver alertas y vencimientos"
        >
          <Bell className="w-3.5 h-3.5 text-zinc-400" />
          {alertasCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white font-bold">
              {alertasCount}
            </span>
          )}
        </button>

        {/* Botón de Ajustes y Auditoría */}
        <button
          onClick={onOpenSettings}
          className="h-8 w-8 rounded-xl bg-[#141518] hover:bg-[#1a1b20] text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-all border border-[#24252a]"
          title="Ajustes y Auditoría"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Botón Nuevo Préstamo */}
        <button
          onClick={onOpenNewLoan}
          className="h-8 px-3 rounded-xl bg-[#f3f4f6] hover:bg-white text-[#0d0e11] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Nuevo Préstamo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

      </div>

    </header>
  );
}
