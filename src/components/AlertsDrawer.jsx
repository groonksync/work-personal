import React from 'react';
import { X, Bell, MessageCircle, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export default function AlertsDrawer({
  isOpen,
  onClose,
  alertas,
  currency,
  onPayAlert,
  onSendWhatsAppAlert,
}) {
  if (!isOpen) return null;

  const symbol = currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ ';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro con fade */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-full sm:w-96 bg-[var(--bg-surface)] border-l border-[var(--border-fine)] p-6 flex flex-col justify-between shadow-2xl">
          <div className="space-y-5">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-fine)]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--badge-warn)]" />
                <h3 className="text-sm font-semibold text-[var(--text-main)]">
                  Centro de Alertas con Fecha
                </h3>
              </div>
              <button
                onClick={onClose}
                className="btn-base h-8 w-8 p-0 card-base bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              El sistema te avisa días antes para que puedas contactar a las personas con tiempo y evitar que caigan en mora.
            </p>

            {/* Listado de Alertas */}
            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto custom-scroll pr-1">
              {alertas.length === 0 ? (
                <div className="card-base p-6 text-center text-xs text-[var(--text-muted)]">
                  No hay cobros pendientes urgentes por ahora. ¡Todo al día!
                </div>
              ) : (
                alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`card-base p-3.5 space-y-2 bg-[var(--bg-canvas)] ${
                      alerta.urgencia === 'atrasado'
                        ? 'border-[var(--badge-danger)]/40'
                        : alerta.urgencia === 'hoy'
                        ? 'border-[var(--badge-warn)]/50'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-main)] block">
                          {alerta.nombre}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Cuota #{alerta.cuotaNumero} • {symbol}{alerta.montoCuota}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-fine)] ${
                          alerta.urgencia === 'atrasado'
                            ? 'text-[var(--badge-danger)] font-bold'
                            : alerta.urgencia === 'hoy'
                            ? 'text-[var(--badge-warn)] font-bold'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {alerta.labelTiempo}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Fecha límite: {alerta.fechaVencimiento}</span>
                    </div>

                    {/* Botones de acción uniforme h-8 */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onSendWhatsAppAlert(alerta)}
                        className="btn-base h-8 px-2.5 bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] text-xs flex-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Avisar por WhatsApp</span>
                      </button>
                      <button
                        onClick={() => onPayAlert(alerta)}
                        className="btn-base h-8 px-2.5 card-base bg-[var(--bg-subtle)] text-[var(--text-main)] text-xs"
                      >
                        Abonar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-fine)]">
            <button
              onClick={onClose}
              className="btn-base w-full bg-[var(--btn-solid)] text-[var(--btn-solid-fg)]"
            >
              Cerrar Centro de Alertas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
