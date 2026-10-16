import React from 'react';
import { ArrowLeft, Check, FileText, MessageCircle, DollarSign, Calendar, Clock } from 'lucide-react';
import { generarCronograma } from '../lib/amortizacion';

export default function FolderView({
  folder,
  currency,
  onBack,
  onPayCuota,
  onOpenReceipt,
  onSendWhatsApp,
}) {
  const symbol = currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ ';
  const totalPagado = Math.max(0, folder.totalCapital - folder.totalAdeudado);

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-base h-9 card-base bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a todas las personas</span>
        </button>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {folder.contratos.length} contrato(s) activos
        </span>
      </div>

      {/* Encabezado del Expediente */}
      <div className="card-base p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-fine)] flex items-center justify-center text-2xl">
              📂
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--text-main)]">{folder.nombre}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-fine)] text-[var(--text-muted)]">
                  {folder.tipo_prestamo === 'recibido' ? 'Prestamista' : 'Deudor'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {folder.telefono ? `Teléfono: ${folder.telefono}` : 'Sin teléfono registrado'}
                {folder.ci ? ` • CI: ${folder.ci}` : ''}
              </p>
            </div>
          </div>

          {/* Botones de acción generales */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendWhatsApp(folder)}
              className="btn-base h-9 card-base bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Resumen Numérico */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--border-fine)]">
          <div className="card-base bg-[var(--bg-subtle)] p-3">
            <span className="text-[11px] text-[var(--text-muted)] block">Total Capital</span>
            <span className="text-base font-mono font-bold text-[var(--text-main)]">
              {symbol}{folder.totalCapital.toLocaleString()}
            </span>
          </div>
          <div className="card-base bg-[var(--bg-subtle)] p-3">
            <span className="text-[11px] text-[var(--text-muted)] block">Monto ya Pagado</span>
            <span className="text-base font-mono font-bold text-[var(--badge-ok)]">
              {symbol}{totalPagado.toLocaleString()}
            </span>
          </div>
          <div className="card-base bg-[var(--bg-subtle)] p-3">
            <span className="text-[11px] text-[var(--text-muted)] block">Saldo Pendiente</span>
            <span className="text-base font-mono font-bold text-[var(--text-main)]">
              {symbol}{folder.totalAdeudado.toLocaleString()}
            </span>
          </div>
          <div className="card-base bg-[var(--bg-subtle)] p-3">
            <span className="text-[11px] text-[var(--text-muted)] block">Próxima Cuota</span>
            <span className="text-base font-mono font-bold text-[var(--badge-warn)]">
              {symbol}{folder.cuotaProxima.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Listado de Contratos y sus Cuotas */}
      {folder.contratos.map((contrato, cIdx) => {
        const cuotas = generarCronograma(contrato);
        const cuotasPagadas = cuotas.filter(c => c.pagado).length;

        return (
          <div key={contrato.id || cIdx} className="card-base p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-fine)]">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-main)]">
                  Contrato #{contrato.id?.slice(0, 6) || cIdx + 1} — {symbol}{parseFloat(contrato.capital || 0).toLocaleString()}
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  Interés: {contrato.interes}% • Plazo: {contrato.plazo_meses || 6} meses • Inicio: {contrato.inicio}
                </span>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-fine)] text-[var(--text-main)]">
                {cuotasPagadas} de {cuotas.length} cuotas saldadas
              </span>
            </div>

            {/* Cronograma de Cuotas */}
            <div className="space-y-2">
              {cuotas.map((cuota) => (
                <div
                  key={cuota.key}
                  className={`flex items-center justify-between p-3 rounded-lg card-base text-xs ${
                    cuota.pagado
                      ? 'bg-[var(--bg-subtle)] opacity-70'
                      : cuota.estado === 'hoy'
                      ? 'border-[var(--border-focus)] bg-[var(--bg-surface)] ring-1 ring-[var(--badge-warn)]/30'
                      : cuota.estado === 'vencido'
                      ? 'border-[var(--badge-danger)]/40 bg-[var(--bg-canvas)]'
                      : 'bg-[var(--bg-canvas)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono font-bold text-[var(--text-muted)]">
                      #{cuota.numero}
                    </span>
                    <div>
                      <span className={`font-medium block ${cuota.pagado ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                        {cuota.label} — Vence: {cuota.fechaVencimiento}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Capital: {symbol}{cuota.capital} + Interés: {symbol}{cuota.interes}
                        {cuota.mora > 0 && ` • Mora: +${symbol}${cuota.mora}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--text-main)]">
                      {symbol}{cuota.total + (cuota.mora || 0)}
                    </span>

                    {cuota.pagado ? (
                      <span className="px-2.5 py-1 rounded-lg border border-[var(--border-fine)] text-[var(--badge-ok)] font-mono font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>PAGADO</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPayCuota(contrato, cuota)}
                          className="btn-base h-8 px-3 bg-[var(--btn-solid)] text-[var(--btn-solid-fg)]"
                        >
                          Abonar
                        </button>
                        <button
                          onClick={() => onOpenReceipt(folder, contrato, cuota)}
                          className="btn-base h-8 px-2.5 card-base bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                          title="Recibo"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
