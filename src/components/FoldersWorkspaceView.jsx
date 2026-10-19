import React, { useState } from 'react';
import { 
  ChevronDown, Folder, FileText, Check, MessageCircle, 
  HardDrive, ExternalLink, ArrowRight, User, Plus, Search,
  RefreshCw, Shield, Sparkles
} from 'lucide-react';
import FolderCard from './FolderCard';

export default function FoldersWorkspaceView({
  carpetas = [],
  prestamos = [],
  currency = 'BOB',
  activeCategory = 'General Knowledge',
  onSelectFolder,
  onQuickPay,
  onPayCuota,
  onSendWhatsApp,
  onOpenReceipt,
  onOpenNewLoan,
  onSelectLoan,
  loading = false,
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derivar lista de "Files" (Contratos, pagarés notariados y cuotas vigentes)
  const filesList = prestamos.map((p, idx) => {
    const isDocx = idx % 2 === 1;
    const fileName = `${p.nombre.replace(/\s+/g, '_')}_Contrato_Notariado.${isDocx ? 'docx' : 'pdf'}`;
    const addedByInfo = p.telefono ? `+591 ${p.telefono}` : 'Expediente Registrado';
    const avatarInitial = p.nombre ? p.nombre.charAt(0) : 'U';

    return {
      id: p.id,
      prestamo: p,
      fileName,
      clientName: p.nombre,
      addedBy: addedByInfo,
      avatarInitial,
      capital: p.capital,
      interes: p.interes,
      driveUrl: p.drive_url || p.drive_contrato,
      isDocx,
      tipo: p.tipo_prestamo,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 space-y-8 bg-[#0c0d10] text-white select-none">
      
      {/* 1. TOP BREADCRUMB DROPDOWN */}
      <div className="relative inline-block">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-base lg:text-lg font-bold text-white hover:text-zinc-200 transition-colors py-1 focus:outline-none group"
        >
          <span>{activeCategory}</span>
          <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white transition-transform duration-150" />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#151619] border border-[#222327] shadow-2xl p-1 z-30 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => { setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-white hover:bg-[#1b1c20] flex items-center justify-between"
            >
              <span>Todos los Expedientes</span>
              <span className="text-[10px] text-zinc-400 font-mono">{carpetas.length}</span>
            </button>
            <button
              onClick={() => { setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#1b1c20] flex items-center justify-between"
            >
              <span>Por Cobrar (Cartera)</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {carpetas.filter(c => c.tipo_prestamo !== 'recibido').length}
              </span>
            </button>
            <button
              onClick={() => { setDropdownOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#1b1c20] flex items-center justify-between"
            >
              <span>Por Pagar (Fondeo)</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {carpetas.filter(c => c.tipo_prestamo === 'recibido').length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 2. SECCIÓN "Folders" (EXACTO A LA IMAGEN) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Folders
          </h2>
          <span className="text-xs text-zinc-400 font-mono">
            {carpetas.length} carpetas activas
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#3b82f6]" />
            <span>Cargando carpetas de expedientes...</span>
          </div>
        ) : carpetas.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-2xl bg-[#151619] border border-[#222327]">
            <Folder className="w-10 h-10 mx-auto text-[#3b82f6]" />
            <h3 className="text-sm font-semibold text-white">No hay carpetas creadas</h3>
            <p className="text-xs text-zinc-400">Crea un primer préstamo para generar el expediente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {carpetas.map((folder) => (
              <FolderCard
                key={folder.key}
                folder={folder}
                currency={currency}
                onSelect={() => onSelectFolder(folder.key)}
                onQuickPay={onQuickPay}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. SECCIÓN "Files" (TABLA DE ARCHIVOS Y CONTRATOS EXACTA A LA IMAGEN) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Files
          </h2>
          <span className="text-xs text-zinc-400 font-mono">
            {filesList.length} documentos indexados
          </span>
        </div>

        {/* CONTENEDOR DE LA TABLA ESTILO OBSIDIAN (IDÉNTICO A LA FOTO) */}
        <div className="rounded-2xl bg-[#151619] border border-[#222327] overflow-hidden shadow-sm">
          
          {/* Encabezado de la tabla */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-[#222327] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-5">Name</div>
            <div className="col-span-6 sm:col-span-4">Added By</div>
            <div className="hidden sm:block sm:col-span-3 text-right">Capital / Acción</div>
          </div>

          {/* Filas de la tabla */}
          <div className="divide-y divide-[#222327]">
            {filesList.map((file) => {
              return (
                <div
                  key={file.id}
                  onClick={() => onSelectLoan && onSelectLoan(file.prestamo)}
                  className="grid grid-cols-12 px-5 py-3.5 hover:bg-[#1b1c20] transition-colors items-center cursor-pointer group"
                >
                  {/* Columna 1: Name con ícono de documento (PDF / DOCX) */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 overflow-hidden pr-2">
                    <div className="w-8 h-8 rounded-lg bg-[#111215] border border-[#222327] flex items-center justify-center shrink-0 text-[#3b82f6] group-hover:border-[#353842] transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-medium text-white group-hover:text-zinc-100 block truncate">
                        {file.fileName}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {file.clientName}
                      </span>
                    </div>
                  </div>

                  {/* Columna 2: Added By con avatar circular y email */}
                  <div className="col-span-6 sm:col-span-4 flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {file.avatarInitial}
                    </div>
                    <span className="text-xs text-zinc-400 font-mono truncate">
                      {file.addedBy}
                    </span>
                  </div>

                  {/* Columna 3: Monto de capital y acción rápida */}
                  <div className="hidden sm:flex sm:col-span-3 items-center justify-end gap-3 text-right">
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">
                        {symbol} {Number(file.capital).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Tasa {file.interes}%
                      </span>
                    </div>

                    {file.driveUrl ? (
                      <a
                        href={file.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-[#111215] hover:bg-[#1b1c20] text-[#3b82f6] border border-[#222327] transition-colors"
                        title="Ver en Google Drive"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-zinc-300">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
