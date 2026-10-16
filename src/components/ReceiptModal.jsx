import React from 'react';
import { X, Printer, Share2, Check, Receipt, Download } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, data, currency = 'BOB' }) {
  if (!isOpen || !data) return null;

  const { folder, contrato, cuota } = data;
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `*COMPROBANTE DE PAGO DE CUOTA*\n` +
      `--------------------------------\n` +
      `Cliente: ${folder?.nombre || 'Cliente'}\n` +
      `CI: ${folder?.ci || 'Registrado'}\n` +
      `Cuota: ${cuota?.label || 'Cuota'}\n` +
      `Monto: ${symbol} ${cuota?.total?.toLocaleString() || 0}\n` +
      `Fecha: ${fechaHoy}\n` +
      `Estado: PAGADO ✓\n` +
      `--------------------------------\n` +
      `Gestión: Work Personal`;

    if (navigator.share) {
      navigator.share({ title: 'Comprobante de Pago', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Comprobante copiado al portapapeles listo para enviar por WhatsApp');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2e2e2e] rounded-2xl shadow-2xl p-5 space-y-4 text-zinc-900 dark:text-[#ececec] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#2e2e2e]">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Recibo Digital de Pago
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ticket Digital */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#333333] bg-zinc-50 dark:bg-[#242424] space-y-3 font-mono text-xs">
          <div className="text-center pb-2.5 border-b border-dashed border-zinc-300 dark:border-[#3d3d3d]">
            <h3 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white font-sans">
              WORK PERSONAL
            </h3>
            <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e]">Comprobante Oficial de Cobro</span>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-[#8e8e8e]">Cliente:</span>
              <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[170px]">{folder?.nombre}</span>
            </div>
            {folder?.ci && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-[#8e8e8e]">CI:</span>
                <span className="text-zinc-700 dark:text-[#ccc]">{folder.ci}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-[#8e8e8e]">Concepto:</span>
              <span className="text-zinc-700 dark:text-[#ccc]">{cuota?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-[#8e8e8e]">Fecha Emisión:</span>
              <span className="text-zinc-700 dark:text-[#ccc]">{fechaHoy}</span>
            </div>
          </div>

          {/* Monto Destacado */}
          <div className="py-2.5 px-3 rounded-lg bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200 dark:border-[#333] text-center space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block">
              Total Abonado
            </span>
            <div className="text-lg font-bold text-zinc-900 dark:text-white">
              {symbol} {cuota?.total?.toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>TRANSACCIÓN CONCILIADA</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleShare}
            className="py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-xs font-semibold text-zinc-800 dark:text-white flex items-center justify-center gap-1.5 transition-all border border-zinc-200 dark:border-[#383838]"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Compartir</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-xs font-semibold text-white dark:text-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>

      </div>
    </div>
  );
}
