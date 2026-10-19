import React from 'react';
import { X, Bell, Send, Check, Clock, AlertTriangle } from 'lucide-react';

export default function AlertsDrawer({
  isOpen,
  onClose,
  alertas = [],
  currency = 'BOB',
  onPayAlert,
  onSendWhatsAppAlert,
}) {
  if (!isOpen) return null;

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro con fade */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-full sm:w-[420px] bg-[#151619] border-l border-[#222327] p-5 flex flex-col justify-between shadow-2xl text-white animate-in slide-in-from-right duration-200">
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222327]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white leading-none">
                    Centro de Vencimientos
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    {alertas.length} cobro(s) con atención requerida
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#1b1c20] hover:bg-[#222329] border border-[#26282e] text-zinc-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Listado de Alertas */}
            <div className="flex-1 overflow-y-auto custom-scroll space-y-2.5 pr-1">
              {alertas.length === 0 ? (
                <div className="p-12 text-center border border-[#222327] rounded-xl bg-[#1b1c20] space-y-2">
                  <Bell className="w-7 h-7 text-zinc-500 mx-auto" />
                  <h4 className="text-xs font-semibold text-white">Sin vencimientos urgentes</h4>
                  <p className="text-[11px] text-zinc-400">
                    Todas las cuotas de tu cartera se encuentran al día y bajo control.
                  </p>
                </div>
              ) : (
                alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      alerta.urgencia === 'atrasado'
                        ? 'bg-[#271b20] border-rose-900/40'
                        : alerta.urgencia === 'hoy'
                        ? 'bg-[#262118] border-amber-900/40'
                        : 'bg-[#1b1c20] border-[#26282e]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider block ${
                            alerta.urgencia === 'atrasado'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {alerta.labelTiempo}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {alerta.nombre}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-white">
                          {symbol} {alerta.montoCuota?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          Cuota #{alerta.cuotaNumero}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#222327] text-[11px]">
                      <span className="text-zinc-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {alerta.fechaVencimiento}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSendWhatsAppAlert(alerta)}
                          className="px-2.5 py-1 rounded-lg bg-[#16271c] hover:bg-[#1f3827] text-emerald-400 font-medium border border-emerald-900/40 flex items-center gap-1 text-[11px]"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => onPayAlert(alerta)}
                          className="px-3 py-1 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Abonar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#222327] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1b1c20] hover:bg-[#222329] border border-[#26282e] text-xs font-medium text-zinc-300 hover:text-white transition-all"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
