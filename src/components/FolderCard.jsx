import React from 'react';
import { Folder, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function FolderCard({ folder, currency, onSelect, onQuickPay }) {
  // Configuración de badge de estado
  const getBadgeInfo = () => {
    switch (folder.estadoGlobal) {
      case 'Atrasado':
        return {
          label: `Atrasado (${Math.abs(folder.diasParaVencer)}d)`,
          color: 'text-[var(--badge-danger)] border-[var(--badge-danger)]/30',
          dot: 'bg-[var(--badge-danger)]',
        };
      case 'Vence Hoy':
        return {
          label: 'Vence Hoy',
          color: 'text-[var(--badge-warn)] border-[var(--badge-warn)]/30',
          dot: 'bg-[var(--badge-warn)]',
        };
      case 'Vence Pronto':
        return {
          label: `Vence en ${folder.diasParaVencer}d`,
          color: 'text-[var(--badge-warn)] border-[var(--badge-warn)]/30',
          dot: 'bg-[var(--badge-warn)]',
        };
      case 'Saldado':
        return {
          label: 'Saldado',
          color: 'text-[var(--badge-ok)] border-[var(--badge-ok)]/30',
          dot: 'bg-[var(--badge-ok)]',
        };
      default:
        return {
          label: 'Al Día',
          color: 'text-[var(--badge-ok)] border-[var(--badge-ok)]/30',
          dot: 'bg-[var(--badge-ok)]',
        };
    }
  };

  const badge = getBadgeInfo();

  return (
    <div
      onClick={onSelect}
      className="card-base p-4 hover:border-[var(--border-focus)] transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Cabecera de la Carpeta */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-fine)] flex items-center justify-center text-[var(--text-main)]">
              <Folder className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-main)] group-hover:underline">
                {folder.nombre}
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                {folder.contratos.length} contrato(s) • {folder.telefono || 'Sin teléfono'}
              </span>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 text-[11px] font-medium rounded-lg bg-[var(--bg-subtle)] border ${badge.color} flex items-center gap-1.5`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Resumen numérico */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-fine)] text-xs">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] block">Cuota a cobrar:</span>
            <span className="text-sm font-mono font-bold text-[var(--text-main)]">
              {currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ '}
              {folder.cuotaProxima.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-muted)] block">Saldo restante:</span>
            <span className="text-sm font-mono font-medium text-[var(--text-main)]">
              {currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ '}
              {folder.totalAdeudado.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción uniforme h-9 */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--border-fine)]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickPay(folder);
          }}
          className="btn-base h-9 bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] hover:opacity-90"
        >
          Abonar Cuota
        </button>
        <button
          onClick={onSelect}
          className="btn-base h-9 card-base bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
        >
          <span>Abrir Carpeta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
