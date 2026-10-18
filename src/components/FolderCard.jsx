import React from 'react';
import { HardDrive, MessageCircle, Check, ArrowRight, ExternalLink } from 'lucide-react';
import Folder3DGraphic from './Folder3DGraphic';

export default function FolderCard({ folder, currency = 'BOB', onSelect, onQuickPay }) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  const totalCapital = folder.totalCapital || 1;
  const totalAdeudado = folder.totalAdeudado || 0;
  const totalPagado = Math.max(0, totalCapital - totalAdeudado);
  const porcentajePagado = Math.min(100, Math.round((totalPagado / totalCapital) * 100));

  const contratosCount = folder.contratos?.length || 1;
  const hasDrive = !!(folder.driveUrl || folder.contratos?.[0]?.drive_url || folder.contratos?.[0]?.drive_contrato);

  const esAtrasado = folder.estadoGlobal === 'Atrasado';
  const esVenceHoy = folder.estadoGlobal === 'Vence Hoy';
  const esSaldado = folder.estadoGlobal === 'Saldado';

  return (
    <div
      onClick={onSelect}
      className="p-4 rounded-2xl bg-[#1a1b1e] hover:bg-[#202126] border border-[#26282e] hover:border-[#383a42] transition-all cursor-pointer group flex flex-col justify-between select-none shadow-sm relative overflow-hidden"
    >
      {/* 1. GRÁFICO 3D DEL FOLDER CON HOJAS BLANCAS Y MICRO-ÍCONOS (IDÉNTICO A LA FOTO) */}
      <div className="pt-1 pb-2">
        <Folder3DGraphic
          hasDrive={hasDrive}
          docType={folder.tipo_prestamo === 'recibido' ? 'CRED' : contratosCount > 1 ? 'DOCS' : 'PDF'}
          fileCount={contratosCount}
        />
      </div>

      {/* 2. TEXTOS Y CONTENIDO PRINCIPAL (EXACTO A LA IMAGEN) */}
      <div className="text-center space-y-1 mt-1">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-sm font-bold text-white group-hover:text-zinc-100 truncate tracking-tight">
            {folder.nombre}
          </h3>
          {esAtrasado && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Cobro Atrasado" />
          )}
          {esVenceHoy && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" title="Vence Hoy" />
          )}
        </div>

        {/* Subtítulo tipo "15 Files" / "1 Contrato • Bs. 15,000" */}
        <p className="text-xs text-[#8b8f98] font-medium truncate">
          {contratosCount} {contratosCount === 1 ? 'Contrato' : 'Contratos'} • {symbol} {Number(totalCapital).toLocaleString()}
        </p>
      </div>

      {/* 3. MINI BARRA DE PROGRESO DE AMORTIZACIÓN */}
      <div className="w-full bg-[#111214] h-1 rounded-full overflow-hidden mt-3 mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            esSaldado ? 'bg-emerald-500' : 'bg-[#3b82f6]'
          }`}
          style={{ width: `${porcentajePagado}%` }}
        />
      </div>

      {/* 4. FOOTER DE ACCIONES RÁPIDAS EN HOVER / NORMAL */}
      <div className="flex items-center justify-between pt-2 border-t border-[#24252a] text-xs">
        <div className="text-left">
          <span className="text-[10px] text-[#5e636e] uppercase block font-semibold leading-tight">
            Próx. Cuota
          </span>
          <span className="text-xs font-mono font-bold text-white">
            {symbol} {Number(folder.cuotaProxima || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onQuickPay && !esSaldado && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickPay(folder);
              }}
              className="px-2 py-1 rounded-lg bg-[#27282d] hover:bg-[#32343a] text-white text-[11px] font-semibold border border-white/5 active:scale-95 transition-all flex items-center gap-1"
              title="Abonar cuota inmediata"
            >
              <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
              <span>Abonar</span>
            </button>
          )}

          <div 
            className="w-6 h-6 rounded-lg bg-[#222328] group-hover:bg-[#2b2d33] flex items-center justify-center text-[#8b8f98] group-hover:text-white transition-colors"
            title="Abrir expediente completo"
          >
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

    </div>
  );
}
