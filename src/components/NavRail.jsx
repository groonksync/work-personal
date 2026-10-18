import React from 'react';
import { 
  Folder, Calendar, Clock, BarChart2, 
  ArrowLeftRight, Calculator, Bell, SlidersHorizontal, 
  Sun, Moon, Plus
} from 'lucide-react';

export default function NavRail({
  viewMode = 'folders',
  setViewMode,
  onOpenNewLoan,
  onOpenSimulator,
  onOpenAlerts,
  alertasCount = 0,
  onOpenSettings,
  theme = 'dark',
  toggleTheme,
}) {
  return (
    <aside className="w-14 bg-[#0d0e10] border-r border-[#1a1b1f] flex flex-col items-center justify-between py-4 select-none shrink-0 z-40 text-zinc-400">
      
      {/* 1. LOGO SUPERIOR GEOMÉTRICO (IDÉNTICO AL DEL DISEÑO) */}
      <div className="flex flex-col items-center gap-6">
        
        {/* Logo minimalista abstracto */}
        <div 
          onClick={() => setViewMode('folders')}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 group"
          title="Work Personal — Gestor de Créditos"
        >
          {/* Geometría moderna tipo interlocking nodes */}
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="bg-white rounded-[2px]" />
            <div className="bg-white/60 rounded-[2px]" />
            <div className="bg-white/40 rounded-[2px]" />
            <div className="bg-white rounded-[2px]" />
          </div>
        </div>

        {/* 2. BARRA VERTICAL DE ÍCONOS PRINCIPALES DE NAVEGACIÓN */}
        <nav className="flex flex-col items-center gap-2">
          
          {/* VISTA A: EXPEDIENTES / FOLDERS (ACTIVA EN EL DISEÑO) */}
          <button
            onClick={() => setViewMode('folders')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              viewMode === 'folders'
                ? 'bg-[#212328] text-white shadow-xs'
                : 'hover:bg-[#1a1b1f] hover:text-white'
            }`}
            title="Expedientes de Deudores (Folders)"
          >
            <Folder className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* VISTA B: CRONOGRAMA / CALENDARIO */}
          <button
            onClick={() => setViewMode('timeline')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              viewMode === 'timeline'
                ? 'bg-[#212328] text-white shadow-xs'
                : 'hover:bg-[#1a1b1f] hover:text-white'
            }`}
            title="Cronograma de Vencimientos por Día"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* VISTA C: FLUJO DIARIO / STREAM CONTINUO */}
          <button
            onClick={() => setViewMode('stream')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              viewMode === 'stream'
                ? 'bg-[#212328] text-white shadow-xs'
                : 'hover:bg-[#1a1b1f] hover:text-white'
            }`}
            title="Flujo Diario de Cobros"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* SIMULADOR FINANCIERO PRO */}
          <button
            onClick={onOpenSimulator}
            className="w-9 h-9 rounded-xl hover:bg-[#1a1b1f] hover:text-emerald-400 text-zinc-400 flex items-center justify-center transition-all"
            title="Simulador Financiero Pro"
          >
            <Calculator className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* 3. PARTE INFERIOR: ALERTAS, AJUSTES Y PERFIL DE USUARIO */}
      <div className="flex flex-col items-center gap-3">
        
        {/* Campana de Alertas */}
        <button
          onClick={onOpenAlerts}
          className="relative w-9 h-9 rounded-xl hover:bg-[#1a1b1f] hover:text-amber-400 text-zinc-400 flex items-center justify-center transition-all"
          title="Vencimientos pendientes"
        >
          <Bell className="w-4 h-4" />
          {alertasCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Ajustes */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl hover:bg-[#1a1b1f] hover:text-white text-zinc-400 flex items-center justify-center transition-all"
          title="Ajustes y Auditoría"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Avatar del Usuario */}
        <div 
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-[#202126] border border-[#2d2f36] flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:border-zinc-500 transition-colors"
          title="Carlos Joel — Administrador"
        >
          CJ
        </div>

      </div>

    </aside>
  );
}
