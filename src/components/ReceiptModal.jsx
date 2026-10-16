import React from 'react';
import { X, Printer, Share2, CheckCircle } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, data, currency }) {
  if (!isOpen || !data) return null;

  const { folder, contrato, cuota } = data;
  const symbol = currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ ';
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
      `Cliente/Prestamista: ${folder?.nombre || 'Cliente'}\n` +
      `Cuota: ${cuota?.label || 'Cuota'}\n` +
      `Monto: ${symbol}${cuota?.total || 0}\n` +
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm card-base p-6 space-y-5 bg-[var(--bg-surface)] shadow-2xl">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-fine)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Recibo Digital
          </span>
          <button
            onClick={onClose}
            className="btn-base h-8 w-8 p-0 card-base bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Recibo estilo Ticket Minimalista */}
        <div className="p-4 rounded-lg border border-[var(--border-fine)] bg-[var(--bg-canvas)] space-y-4 font-mono text-xs">
          <div className="text-center pb-3 border-b border-[var(--border-fine)]">
            <h3 className="font-bold text-sm tracking-tight text-[var(--text-main)] font-sans">
              WORK PERSONAL
            </h3>
            <span className="text-[10px] text-[var(--text-muted)]">Comprobante de Liquidación</span>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">{fechaHoy}</div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Nombre:</span>
              <span className="font-bold text-[var(--text-main)]">{folder?.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Concepto:</span>
              <span>{cuota?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Vencimiento:</span>
              <span>{cuota?.fechaVencimiento}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Capital Cuota:</span>
              <span>{symbol}{cuota?.capital}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Interés:</span>
              <span>{symbol}{cuota?.interes}</span>
            </div>
            {cuota?.mora > 0 && (
              <div className="flex justify-between text-[var(--badge-danger)]">
                <span>Mora:</span>
                <span>+{symbol}{cuota?.mora}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-dashed border-[var(--border-fine)] flex justify-between items-center text-sm font-bold text-[var(--text-main)]">
            <span>TOTAL ABONADO:</span>
            <span>{symbol}{cuota?.total + (cuota?.mora || 0)}</span>
          </div>

          <div className="text-center pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--badge-ok)] font-sans font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Transacción Verificada</span>
            </span>
          </div>
        </div>

        {/* Botones de acción uniforme h-9 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleShare}
            className="btn-base h-9 bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-base h-9 card-base bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
