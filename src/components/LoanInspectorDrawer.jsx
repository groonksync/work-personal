import React, { useState } from 'react';
import { 
  X, Check, Send, Receipt, Phone, User, Calendar, 
  DollarSign, TrendingUp, AlertCircle, Shield, FileText, 
  ExternalLink, ChevronRight, Zap
} from 'lucide-react';
import { generarCronograma } from '../lib/amortizacion';

export default function LoanInspectorDrawer({
  loan,
  onClose,
  currency = 'BOB',
  onPayCuota,
  onOpenReceipt,
  onSendWhatsApp,
}) {
  if (!loan) return null;

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  const cronograma = generarCronograma(loan);
  const cuotasPagadas = cronograma.filter(c => c.pagado).length;
  const cuotaProxima = cronograma.find(c => !c.pagado) || cronograma[cronograma.length - 1];

  // Identificar si es préstamo fondeado
  const esFondeoRodo = loan.id === 'acreedor-tio-rodo' || loan.notas?.includes('TIO RODO');
  const esAcreedor = loan.tipo_prestamo === 'recibido';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#121317] border-l border-[#202129] shadow-2xl flex flex-col text-[#f4f4f7] animate-in slide-in-from-right duration-200">
      
      {/* HEADER DEL INSPECTOR */}
      <div className="p-4 border-b border-[#1f2027] flex items-center justify-between bg-[#16171d]">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
            esAcreedor ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {esAcreedor ? '🏦' : '👤'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">
              {loan.nombre}
            </h3>
            <span className="text-[11px] text-[#7d7f8c] font-medium block mt-0.5">
              {esAcreedor ? 'Acreedor / Prestamista' : `Prestatario • CI: ${loan.ci || 'Sin registro'}`}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-[#20212a] hover:bg-[#282935] text-[#8e909e] hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CUERPO DEL EXPEDIENTE DETALLADO */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
        
        {/* BANNER ESPECIAL DE FONDEO (SI APLICA) */}
        {esFondeoRodo && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#181922] to-amber-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <span>⚡</span> Estructura de Fondeo Activa
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                Tasa 3% pasiva
              </span>
            </div>
            <p className="text-xs text-[#a0a2af] leading-relaxed">
              Capital fondeado por <strong>Tío Rodo</strong> (Bs. 10,000) colocado a <strong>Magali Molina</strong> (Bs. 15,000 @ 10%).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-[#7d7f8c] block">Cobras a Magali:</span>
                <strong className="text-white font-mono">Bs. 1,500/m</strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-[#7d7f8c] block">Pagas a Rodo:</span>
                <strong className="text-rose-400 font-mono">Bs. 300/m</strong>
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between pt-0.5">
              <span>Tu Ganancia Neta Limpia:</span>
              <span className="font-mono text-sm">+Bs. 700.00 / mes</span>
            </div>
          </div>
        )}

        {/* TARJETAS RESUMEN FINANCIERO */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-[#17181f] border border-[#21222b]">
            <span className="text-[10px] text-[#7e808e] uppercase font-bold tracking-wider block">Capital</span>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {symbol} {Number(loan.capital || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">
              Tasa: {loan.interes}% {loan.tipo_pago || 'mensual'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#17181f] border border-[#21222b]">
            <span className="text-[10px] text-[#7e808e] uppercase font-bold tracking-wider block">Cuota Promedio</span>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {symbol} {cuotaProxima?.total ? Number(cuotaProxima.total).toLocaleString() : '0'}
            </div>
            <span className="text-[10px] text-[#7e808e]">
              {cuotasPagadas} de {cronograma.length} pagadas
            </span>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS PRINCIPALES (BOTONES SIN MUCHO TRAZO) */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-[#686976] uppercase tracking-wider block px-1">
            Acciones Inmediatas
          </span>
          
          {cuotaProxima && !cuotaProxima.pagado && (
            <button
              onClick={() => {
                onPayCuota(loan, cuotaProxima);
              }}
              className="w-full py-2.5 px-3.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Marcar Cuota Actual Pagada ({symbol} {cuotaProxima.total})</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSendWhatsApp && onSendWhatsApp(loan, cuotaProxima)}
              className="py-2 px-3 rounded-lg bg-[#1a1b22] hover:bg-[#22242d] text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5 transition-all border border-emerald-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => onOpenReceipt && onOpenReceipt(loan, cuotaProxima)}
              className="py-2 px-3 rounded-lg bg-[#1a1b22] hover:bg-[#22242d] text-xs font-medium text-purple-300 flex items-center justify-center gap-1.5 transition-all border border-purple-500/20"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Ver Recibo</span>
            </button>
          </div>
        </div>

        {/* DETALLES DEL CONTRATO */}
        <div className="p-3.5 rounded-xl bg-[#17181f] border border-[#21222b] space-y-2.5 text-xs">
          <span className="text-[10px] font-bold text-[#7e808e] uppercase tracking-wider block">
            Datos del Préstamo
          </span>
          
          <div className="flex justify-between items-center py-1 border-b border-[#21222b]">
            <span className="text-[#8e909e]">Fecha Inicio:</span>
            <span className="font-mono text-white">{loan.inicio || 'No registrada'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#21222b]">
            <span className="text-[#8e909e]">Fecha Vencimiento:</span>
            <span className="font-mono text-amber-300 font-bold">{loan.fin || 'Sin límite'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#21222b]">
            <span className="text-[#8e909e]">Teléfono / Contacto:</span>
            <span className="font-mono text-white">{loan.telefono || 'Sin teléfono'}</span>
          </div>

          {loan.garantia && (
            <div className="flex justify-between items-center py-1 border-b border-[#21222b]">
              <span className="text-[#8e909e]">Garantía:</span>
              <span className="text-amber-400 font-medium">{loan.garantia}</span>
            </div>
          )}

          {loan.notas && (
            <div className="pt-1">
              <span className="text-[11px] text-[#7e808e] block mb-1">Notas y Cláusulas:</span>
              <div className="p-2.5 rounded-lg bg-black/40 text-[11px] text-[#c2c4d1] leading-relaxed whitespace-pre-wrap font-mono">
                {loan.notas}
              </div>
            </div>
          )}
        </div>

        {/* CRONOGRAMA DE CUOTAS */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#686976] uppercase tracking-wider block px-1">
            Desglose de Cuotas ({cronograma.length})
          </span>

          <div className="space-y-1.5">
            {cronograma.map((c) => (
              <div 
                key={c.key}
                className={`p-2.5 rounded-lg flex items-center justify-between text-xs transition-all ${
                  c.pagado 
                    ? 'bg-[#151b17] border border-emerald-900/30 text-[#8ec89e]' 
                    : 'bg-[#17181f] border border-[#21222b] text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.pagado ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <div>
                    <span className="font-medium block">{c.label}</span>
                    <span className="text-[10px] text-[#7e808e] font-mono">{c.fechaVencimiento}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold">
                    {symbol} {c.total.toLocaleString()}
                  </span>
                  {c.pagado ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                      Pagado
                    </span>
                  ) : (
                    <button
                      onClick={() => onPayCuota(loan, c)}
                      className="px-2.5 py-1 rounded bg-[#252632] hover:bg-[#323344] text-[11px] text-white font-medium transition-all"
                    >
                      Abonar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
