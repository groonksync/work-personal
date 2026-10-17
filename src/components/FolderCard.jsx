import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function FolderCard({ folder, currency = 'BOB', onSelect, onQuickPay }) {
  const symbols = { BOB: 'Bs.', USD: '$', PEN: 'S/' };
  const count = folder.cuotasPagadasCount + folder.cuotasPendientesCount;
  const porcentajePagado = count ? Math.round(folder.cuotasPagadasCount / count * 100) : 0;
  const formatAmounts = (totals = {}) => Object.entries(totals).map(([code, amount]) => `${symbols[code] || code} ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(amount)}`);
  const balances = formatAmounts(folder.totalAdeudadoPorMoneda);

  // Configuración de badge de estado con colores nítidos
  const getBadgeInfo = () => {
    switch (folder.estadoGlobal) {
      case 'Atrasado':
        return {
          label: `Atrasado (${Math.abs(folder.diasParaVencer)}d)`,
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
        };
      case 'Vence Hoy':
        return {
          label: 'Vence Hoy',
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'Vence Pronto':
        return {
          label: `Vence en ${folder.diasParaVencer}d`,
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      case 'Saldado':
        return {
          label: 'Saldado 100%',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          label: 'Al Día',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
    }
  };

  const badge = getBadgeInfo();

  return (
    <div
      onClick={onSelect}
      className="p-4 rounded-2xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer group flex flex-col justify-between shadow-xs select-none"
    >
      <div className="space-y-3">
        {/* Cabecera de la Carpeta */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#1f1f1f] border border-zinc-200 dark:border-[#383838] flex items-center justify-center font-bold text-xs text-zinc-800 dark:text-white shrink-0">
              {folder.nombre?.charAt(0) || 'C'}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-black dark:group-hover:text-white">
                {folder.nombre}
              </h3>
              <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] block truncate mt-0.5">
                {folder.contratos?.length || 1} contrato(s) • {folder.telefono || 'Sin tel'}
              </span>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border shrink-0 flex items-center gap-1.5 ${badge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Barra de progreso visual de amortización */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-[#8e8e8e]">
            <span>Cuotas pagadas</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">{folder.cuotasPagadasCount}/{count} · {porcentajePagado}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-[#1a1a1a] overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${porcentajePagado}%` }}
            />
          </div>
        </div>

        {/* Resumen numérico en grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-[#333333] text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-[#737373] block">
              Próxima Cuota
            </span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">
              {(folder.monedaProxima || currency) in symbols ? symbols[folder.monedaProxima || currency] : folder.monedaProxima || currency} {new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(folder.cuotaProxima || 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-[#737373] block">
              Saldo Restante
            </span>
            <span className="text-sm font-mono font-medium text-zinc-600 dark:text-[#a3a3a3]">
              {balances.length ? balances.join(' · ') : 'Saldado'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción uniforme */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-[#333333]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickPay(folder);
          }}
          disabled={folder.cuotasPendientesCount === 0}
          className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-xs transition-all active:scale-95 shadow-xs disabled:opacity-40 disabled:pointer-events-none"
        >
          Abonar
        </button>
        <button
          onClick={onSelect}
          className="h-8 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1e1e1e] dark:hover:bg-[#303030] text-zinc-800 dark:text-white font-medium text-xs border border-zinc-200 dark:border-[#383838] transition-all flex items-center justify-center gap-1"
        >
          <span>Expediente</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
