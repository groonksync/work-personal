import React from 'react';
import { Search, Plus, Bell, X, Calendar, Folder, Clock, Sliders, LogOut } from 'lucide-react';

export default function Topbar({
  viewMode = 'timeline',
  breadcrumb = 'Cronograma',
  searchQuery,
  setSearchQuery,
  onOpenNewLoan,
  onOpenAlerts,
  alertasCount = 0,
  onOpenSettings,
  onSignOut,
}) {
  const getIcon = () => {
    if (viewMode === 'timeline') return <Calendar className="w-4 h-4 text-zinc-600 dark:text-[#d4d4d4]" />;
    if (viewMode === 'folders') return <Folder className="w-4 h-4 text-zinc-600 dark:text-[#d4d4d4]" />;
    return <Clock className="w-4 h-4 text-zinc-600 dark:text-[#d4d4d4]" />;
  };

  return (
    <header className="h-14 px-6 border-b border-zinc-200 dark:border-[#2a2a2a] flex items-center justify-between gap-4 bg-white dark:bg-[#212121] select-none shrink-0 z-20 text-zinc-800 dark:text-[#ececec] transition-colors duration-150">
      
      {/* Título de la vista actual con ícono */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-[#2a2a2a] flex items-center justify-center">
          {getIcon()}
        </div>
        <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
          {breadcrumb}
        </span>
      </div>

      {/* Buscador y Acciones (Sin atajos de teclado) */}
      <div className="flex items-center gap-2.5">
        
        {/* Buscador suave redondeado tipo ChatGPT */}
        <div className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200/70 dark:bg-[#2a2a2a] dark:hover:bg-[#303030] px-3.5 py-1.5 rounded-full text-xs border border-zinc-200 dark:border-[#383838] focus-within:border-zinc-400 dark:focus-within:border-[#4d4d4d] focus-within:bg-white dark:focus-within:bg-[#2f2f2f] transition-all w-52 sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 dark:text-[#8e8e8e] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por persona, CI o teléfono..."
            className="bg-transparent outline-none w-full text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#737373] text-[13px]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-700 dark:text-[#8e8e8e] dark:hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Campana de Vencimientos */}
        <button
          onClick={onOpenAlerts}
          className="h-8 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#2a2a2a] dark:hover:bg-[#333333] text-zinc-700 hover:text-zinc-900 dark:text-[#b4b4b4] dark:hover:text-white flex items-center gap-1.5 text-xs transition-all border border-zinc-200 dark:border-[#333333]"
          title="Ver alertas y vencimientos"
        >
          <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          {alertasCount > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold">
              {alertasCount}
            </span>
          )}
        </button>

        {/* Botón de Ajustes y Auditoría */}
        <button
          onClick={onOpenSettings}
          className="h-8 w-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#2a2a2a] dark:hover:bg-[#333333] text-zinc-700 hover:text-zinc-900 dark:text-[#b4b4b4] dark:hover:text-white flex items-center justify-center text-xs transition-all border border-zinc-200 dark:border-[#333333]"
          title="Ajustes y Auditoría"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {onSignOut && <button onClick={onSignOut} aria-label="Cerrar sesión" title="Cerrar sesión" className="h-8 w-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#2a2a2a] dark:hover:bg-[#333333] text-zinc-700 dark:text-[#b4b4b4] flex items-center justify-center border border-zinc-200 dark:border-[#333333] transition-all"><LogOut className="w-4 h-4" /></button>}

        {/* Botón Nuevo Préstamo */}
        <button
          onClick={onOpenNewLoan}
          className="h-8 px-3.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-[#f3f3f3] dark:hover:bg-white text-white dark:text-[#171717] font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Nuevo Préstamo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

      </div>

    </header>
  );
}
