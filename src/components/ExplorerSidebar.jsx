import React, { useState } from 'react';
import { 
  Folder, Plus, Search, ChevronRight, ChevronDown, 
  Tag, X, SidebarClose, FileText, CheckCircle2, AlertCircle,
  ArrowUpRight, Users, ShieldCheck, HardDrive
} from 'lucide-react';

export default function ExplorerSidebar({
  title = "Knowledge Base",
  carpetas = [],
  counts = {},
  selectedFolderKey,
  onSelectFolder,
  onOpenNewLoan,
  searchQuery,
  setSearchQuery,
  carteraFiltro,
  setCarteraFiltro,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [activeTab, setActiveTab] = useState('folders'); // 'folders' | 'tags'
  const [expandedFolders, setExpandedFolders] = useState({
    general: true,
    onboarding: true,
  });

  const toggleFolder = (key) => {
    setExpandedFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Separar carpetas en categorías
  const carpetasOtorgadas = carpetas.filter(c => c.tipo_prestamo !== 'recibido');
  const carpetasRecibidas = carpetas.filter(c => c.tipo_prestamo === 'recibido');

  if (isCollapsed) return null;

  return (
    <aside className="w-64 bg-[#131416] border-r border-[#1f2025] flex flex-col justify-between shrink-0 h-full select-none text-zinc-300 text-xs transition-all duration-150">
      
      <div className="p-3.5 space-y-3.5 overflow-y-auto custom-scroll flex-1">
        
        {/* 1. CABECERA: TÍTULO Y BOTONES DE ACCIÓN (+ Y TOGGLE) */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[13px] font-bold text-white tracking-tight">
            {title}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenNewLoan}
              className="w-6 h-6 rounded-md hover:bg-[#202126] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              title="Crear nuevo registro / préstamo"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-6 h-6 rounded-md hover:bg-[#202126] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title="Colapsar panel"
              >
                <div className="w-3.5 h-3.5 border border-zinc-500 rounded-[2px]" />
              </button>
            )}
          </div>
        </div>

        {/* 2. BUSCADOR REDONDEADO ESTILO KNOWLEDGE BASE */}
        <div className="flex items-center gap-2 bg-[#1a1b1e] px-2.5 py-1.5 rounded-lg border border-[#24252a] text-xs focus-within:border-zinc-500 transition-colors">
          <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-white placeholder-zinc-500 text-[12px]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 3. SWITCHER SEGMENTADO DE PASTILLAS [ Folders ] [ Tags ] */}
        <div className="p-0.5 rounded-lg bg-[#101113] border border-[#1e1f24] flex items-center text-[11px] font-medium">
          <button
            onClick={() => setActiveTab('folders')}
            className={`flex-1 py-1 rounded-md transition-all text-center ${
              activeTab === 'folders'
                ? 'bg-[#26272c] text-white font-semibold shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Folders
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-1 rounded-md transition-all text-center ${
              activeTab === 'tags'
                ? 'bg-[#26272c] text-white font-semibold shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Tags
          </button>
        </div>

        {/* 4. ESTRUCTURA DE ÁRBOL JERÁRQUICO CON LÍNEAS DE GUÍA (EXACTO A LA IMAGEN) */}
        {activeTab === 'folders' ? (
          <div className="space-y-1 pt-1">
            
            {/* NODO RAÍZ: GENERAL KNOWLEDGE (TODOS LOS EXPEDIENTES) */}
            <div>
              <div 
                onClick={() => {
                  toggleFolder('general');
                  setCarteraFiltro('todos');
                }}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1c1d21] cursor-pointer transition-colors group ${
                  carteraFiltro === 'todos' && !selectedFolderKey ? 'bg-[#1c1d21] text-white' : 'text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Folder className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0" />
                  <span className="font-semibold text-[12px] truncate">General Knowledge</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#23252a] text-zinc-400">
                  {carpetas.length}
                </span>
              </div>

              {/* RAMAS HIJAS CON LÍNEA VERTICAL CONECTORA */}
              {expandedFolders.general && (
                <div className="ml-3 pl-2.5 border-l border-[#24262b] space-y-0.5 mt-1">
                  
                  {/* SUBCARPETAS (EXPEDIENTES ACTIVOS) */}
                  {carpetas.slice(0, 7).map((folder) => {
                    const isSelected = selectedFolderKey === folder.key;

                    return (
                      <div
                        key={folder.key}
                        onClick={() => onSelectFolder(folder.key)}
                        className={`flex items-center justify-between px-2 py-1 rounded-md hover:bg-[#1a1b1f] cursor-pointer transition-colors text-[11px] group ${
                          isSelected ? 'bg-[#222429] text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Folder className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                          <span className="truncate">{folder.nombre}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">
                          {folder.contratos?.length || 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEGUNDO NODO RAÍZ: ACREEDORES / FONDEO */}
            <div 
              onClick={() => setCarteraFiltro('recibidos')}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1c1d21] cursor-pointer transition-colors group mt-1 ${
                carteraFiltro === 'recibidos' ? 'bg-[#1c1d21] text-white' : 'text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Folder className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-semibold text-[12px] truncate">Integrations (Fondeo)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#23252a] text-purple-400">
                {carpetasRecibidas.length}
              </span>
            </div>

            {/* TERCER NODO RAÍZ: DOCUMENTOS & GARANTÍAS */}
            <div 
              onClick={() => setCarteraFiltro('otorgados')}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1c1d21] cursor-pointer transition-colors group ${
                carteraFiltro === 'otorgados' ? 'bg-[#1c1d21] text-white' : 'text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Folder className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-[12px] truncate">Onboarding Design</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#23252a] text-emerald-400">
                {carpetasOtorgadas.length}
              </span>
            </div>

            {/* CUARTO NODO RAÍZ: AUDITORÍA LEGAL */}
            <div 
              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1c1d21] cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Folder className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="font-semibold text-[12px] truncate">Team Interviews</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#23252a] text-zinc-500">
                5
              </span>
            </div>

          </div>
        ) : (
          /* PESTAÑA TAGS / ESTADOS */
          <div className="space-y-1 pt-1">
            <button
              onClick={() => setCarteraFiltro('todos')}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1c1d21] text-zinc-300 text-left"
            >
              <span># todos</span>
              <span className="text-[10px] font-mono text-zinc-500">{carpetas.length}</span>
            </button>
            <button
              onClick={() => setCarteraFiltro('otorgados')}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1c1d21] text-emerald-400 text-left"
            >
              <span># cobros-activos</span>
              <span className="text-[10px] font-mono text-emerald-500">{counts.otorgados || 9}</span>
            </button>
            <button
              onClick={() => setCarteraFiltro('recibidos')}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1c1d21] text-purple-400 text-left"
            >
              <span># prestamistas</span>
              <span className="text-[10px] font-mono text-purple-500">{counts.recibidos || 2}</span>
            </button>
          </div>
        )}

      </div>

      {/* FOOTER DISCRETO DEL EXPLORER */}
      <div className="p-3 border-t border-[#1f2025] text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Work Personal</span>
        <span className="font-mono text-[10px]">v2.4 Obsidian</span>
      </div>

    </aside>
  );
}
