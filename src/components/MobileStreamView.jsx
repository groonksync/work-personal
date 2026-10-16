import React from 'react';
import { 
  Zap, Check, Star, Calendar, Building2, 
  MoreVertical, ArrowUpRight, ShieldCheck, ChevronRight 
} from 'lucide-react';

export default function MobileStreamView({
  currency = 'BOB',
  onSelectFolder,
  onOpenNewLoan,
  onPayCuota,
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  return (
    <div className="w-full max-w-md mx-auto flex flex-col bg-[#0d0e11] text-[#f5f5f7] rounded-3xl border border-[#22232a] shadow-2xl overflow-hidden min-h-[750px]">
      
      {/* HEADER MÓVIL ESTILO IMAGEN 2 */}
      <div className="px-5 pt-4 pb-3 border-b border-[#1f2027] flex items-center justify-between bg-[#121316]">
        <div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Flujo de Cobros</span>
          <h3 className="text-base font-bold text-white tracking-tight">Cronograma Diario</h3>
        </div>
        <button 
          onClick={onOpenNewLoan}
          className="w-8 h-8 rounded-lg bg-white text-black font-bold flex items-center justify-center text-sm shadow-xs active:scale-95 transition-all"
        >
          +
        </button>
      </div>

      {/* STREAM VERTICAL CON LÍNEA CONTINUA Y NODOS CIRCULARES (FIEL A IMAGEN 2) */}
      <div className="flex-1 p-5 overflow-y-auto custom-scroll space-y-4 relative">
        
        {/* LÍNEA VERTICAL GUÍA CENTRAL (COMO EN IMAGEN 2) */}
        <div className="absolute left-[70px] top-6 bottom-6 w-[2px] bg-[#22232c]"></div>

        {/* HITO 1: MAÑANA 17 OCT (ROBERTO VILLAZÓN) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-12 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-white block">17 Oct</span>
            <span className="text-[10px] text-[#6e707b]">Mañana</span>
          </div>

          {/* NODO CIRCULAR DE COLOR CON ÍCONO */}
          <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-md font-bold text-xs ring-4 ring-[#0d0e11]">
            <Zap className="w-4 h-4 fill-black" />
          </div>

          {/* TARJETA DEL HITO */}
          <div 
            onClick={() => onSelectFolder && onSelectFolder('ROBERTO VILLAZON INOSENTE')}
            className="flex-1 p-3.5 rounded-xl bg-[#1c1d22] border border-[#282933] hover:border-[#383a48] transition-all shadow-sm space-y-1.5 cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Roberto Villazón Inosente</h4>
                <span className="text-[11px] text-[#7e808c]">Cobro Diario • Tel: 76653981</span>
              </div>
              <button className="text-[#6e707b] hover:text-white text-xs p-1">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-mono font-bold text-amber-400">Bs. 300.00</span>
              <span className="text-[10px] text-emerald-400 font-medium">12 pagos al día</span>
            </div>
          </div>
        </div>

        {/* HITO 2: 20 OCT (ROLY CUELLAR) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-12 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-white block">20 Oct</span>
            <span className="text-[10px] text-[#6e707b]">En 4d</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md text-xs font-bold ring-4 ring-[#0d0e11]">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>

          <div 
            onClick={() => onSelectFolder && onSelectFolder('ROLY CUELLAR BALCAZAR')}
            className="flex-1 p-3.5 rounded-xl bg-[#1c1d22] border border-[#282933] hover:border-[#383a48] transition-all shadow-sm space-y-1.5 cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Roly Cuellar Balcazar</h4>
                <span className="text-[11px] text-[#7e808c]">Debe de la Macbook</span>
              </div>
              <button className="text-[#6e707b] hover:text-white text-xs p-1">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-mono font-bold text-white">Bs. 400.00</span>
              <span className="text-[10px] text-[#7e808c]">Cuota 8 de 10</span>
            </div>
          </div>
        </div>

        {/* HITO 3: 25 OCT (MAGALI MOLINA & TÍO RODO - FONDEO) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-12 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-purple-400 block">25 Oct</span>
            <span className="text-[10px] text-[#6e707b]">Fondeo</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md text-xs font-bold ring-4 ring-[#0d0e11]">
            <Star className="w-4 h-4 fill-white" />
          </div>

          <div 
            onClick={() => onSelectFolder && onSelectFolder('MAGALI MOLINA')}
            className="flex-1 p-3.5 rounded-xl bg-gradient-to-br from-purple-950/40 via-[#1c1d22] to-[#1c1d22] border border-purple-500/40 hover:border-purple-400 transition-all shadow-sm space-y-2 cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Magali Molina (Fondeo Tío Rodo)</h4>
                <span className="text-[11px] text-purple-300">Capital: Bs. 15,000</span>
              </div>
              <button className="text-[#6e707b] hover:text-white text-xs p-1">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 text-[11px] text-[#9e9fad] flex justify-between">
              <span>Cobras a Magali: <strong className="text-white">Bs. 1,500</strong></span>
              <span>Pagas a Rodo: <strong className="text-white">Bs. 300</strong></span>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold text-right">
              Ganancia líquida: +Bs. 700.00
            </div>
          </div>
        </div>

        {/* HITO 4: 28 OCT (VICTORIA & JIMENA EN LA MISMA FECHA) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-12 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-blue-400 block">28 Oct</span>
            <span className="text-[10px] text-[#6e707b]">2 cuotas</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md text-xs font-bold ring-4 ring-[#0d0e11]">
            2
          </div>

          <div className="flex-1 space-y-2">
            {/* Sub-tarjeta 1 */}
            <div 
              onClick={() => onSelectFolder && onSelectFolder('VICTORIA CORONADO DURAN')}
              className="p-3 rounded-xl bg-[#1c1d22] border border-[#282933] hover:border-[#383a48] transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Victoria Coronado Duran</span>
                <span className="text-xs font-mono font-bold text-blue-400">Bs. 500</span>
              </div>
              <span className="text-[10px] text-[#7e808c] block mt-0.5">CI: 5488548 • Cuota mensual</span>
            </div>

            {/* Sub-tarjeta 2 */}
            <div 
              onClick={() => onSelectFolder && onSelectFolder('JIMENA CORDOVA PARADA')}
              className="p-3 rounded-xl bg-[#1c1d22] border border-[#282933] hover:border-[#383a48] transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Jimena Cordova Parada</span>
                <span className="text-xs font-mono font-bold text-blue-400">Bs. 220</span>
              </div>
              <span className="text-[10px] text-[#7e808c] block mt-0.5">Tel: 73610261 • Doc. Privado</span>
            </div>
          </div>
        </div>

        {/* HITO 5: CRÉDITO BANCO FIE (DEUDA MENSUAL) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-12 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-rose-400 block">30 Oct</span>
            <span className="text-[10px] text-[#6e707b]">Pagar</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md text-xs font-bold ring-4 ring-[#0d0e11]">
            <Building2 className="w-4 h-4" />
          </div>

          <div 
            onClick={() => onSelectFolder && onSelectFolder('Banco FIE')}
            className="flex-1 p-3.5 rounded-xl bg-[#1c1d22] border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-sm space-y-1.5 cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Banco FIE (Crédito Recibido)</h4>
                <span className="text-[11px] text-[#7e808c]">Cuota mensual fija</span>
              </div>
              <button className="text-[#6e707b] hover:text-white text-xs p-1">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-mono font-bold text-rose-400">Pagar Bs. 650.00</span>
              <span className="text-[10px] text-[#7e808c]">Cuota 8 de 20</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
