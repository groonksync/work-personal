import React from 'react';
import { 
  Zap, Check, Star, Calendar, Building2, 
  MoreVertical, ArrowUpRight, ShieldCheck, ChevronRight,
  Clock, DollarSign, User, Plus
} from 'lucide-react';

export default function MobileStreamView({
  prestamos = [],
  currency = 'BOB',
  onSelectLoan,
  onOpenNewLoan,
  onPayCuota,
}) {
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  const findLoan = (term) => prestamos.find(p => p.nombre?.toUpperCase().includes(term.toUpperCase())) || prestamos[0];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col bg-white dark:bg-[#212121] text-zinc-900 dark:text-[#ececec] rounded-2xl border border-zinc-200 dark:border-[#2e2e2e] shadow-xl overflow-hidden min-h-[700px] select-none transition-colors duration-150">
      
      {/* HEADER MÓVIL ESTILO CHATGPT */}
      <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between bg-zinc-50 dark:bg-[#1e1e1e] transition-colors duration-150">
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#8e8e8e] uppercase tracking-wider block">
            Cronograma de Cobros
          </span>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Flujo Diario</h3>
        </div>
        <button 
          onClick={onOpenNewLoan}
          className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-[#f3f3f3] dark:hover:bg-white dark:text-black font-bold flex items-center justify-center text-sm shadow-xs active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* STREAM VERTICAL CON LÍNEA CONTINUA Y NODOS GRISES MINIMALISTAS */}
      <div className="flex-1 p-5 overflow-y-auto custom-scroll space-y-4 relative bg-[#f7f7f8] dark:bg-[#212121] transition-colors duration-150">
        
        {/* LÍNEA VERTICAL GUÍA CENTRAL (NEUTRAL GREY) */}
        <div className="absolute left-[65px] top-6 bottom-6 w-[1.5px] bg-zinc-300 dark:bg-[#333333]"></div>

        {/* HITO 1: 17 OCT (ROBERTO VILLAZÓN) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-11 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">17 Oct</span>
            <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Mañana</span>
          </div>

          {/* NODO GRIS MINIMALISTA (SIN GLOBOS DE COLORES) */}
          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2a2a2a] border border-zinc-200 dark:border-[#3d3d3d] text-zinc-800 dark:text-[#ececec] flex items-center justify-center shrink-0 text-xs shadow-xs">
            <Zap className="w-3.5 h-3.5 text-zinc-800 dark:text-white" />
          </div>

          {/* TARJETA DEL HITO */}
          <div 
            onClick={() => onSelectLoan && onSelectLoan(findLoan('ROBERTO'))}
            className="flex-1 p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#303030] border border-zinc-200 dark:border-[#333333] hover:border-zinc-300 dark:hover:border-[#404040] transition-all space-y-1.5 cursor-pointer active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Roberto Villazón Inosente</h4>
                <span className="text-xs text-zinc-500 dark:text-[#a3a3a3]">Cobro Diario • Tel: 76653981</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-[#737373]" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-white">Bs. 300.00</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">12 pagos al día</span>
            </div>
          </div>
        </div>

        {/* HITO 2: 20 OCT (ROLY CUELLAR) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-11 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">20 Oct</span>
            <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">En 4d</span>
          </div>

          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2a2a2a] border border-zinc-200 dark:border-[#3d3d3d] text-zinc-800 dark:text-[#ececec] flex items-center justify-center shrink-0 text-xs shadow-xs">
            <Check className="w-3.5 h-3.5 text-zinc-800 dark:text-white stroke-[2.5]" />
          </div>

          <div 
            onClick={() => onSelectLoan && onSelectLoan(findLoan('ROLY'))}
            className="flex-1 p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#303030] border border-zinc-200 dark:border-[#333333] hover:border-zinc-300 dark:hover:border-[#404040] transition-all space-y-1.5 cursor-pointer active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Roly Cuellar Balcazar</h4>
                <span className="text-xs text-zinc-500 dark:text-[#a3a3a3]">Debe de la Macbook</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-[#737373]" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-white">Bs. 400.00</span>
              <span className="text-xs text-zinc-500 dark:text-[#a3a3a3]">Cuota 8 de 10</span>
            </div>
          </div>
        </div>

        {/* HITO 3: 25 OCT (MAGALI MOLINA & TÍO RODO - FONDEO) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-11 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">25 Oct</span>
            <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Fondeo</span>
          </div>

          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2a2a2a] border border-zinc-200 dark:border-[#3d3d3d] text-zinc-800 dark:text-[#ececec] flex items-center justify-center shrink-0 text-xs shadow-xs">
            <Star className="w-3.5 h-3.5 text-zinc-800 dark:text-white" />
          </div>

          <div 
            onClick={() => onSelectLoan && onSelectLoan(findLoan('MAGALI'))}
            className="flex-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-[#2f2f2f] hover:bg-zinc-100 dark:hover:bg-[#383838] border border-zinc-200 dark:border-[#3d3d3d] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all space-y-2 cursor-pointer active:scale-[0.99] shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Magali Molina (Fondeo Rodo)</h4>
                <span className="text-xs text-zinc-500 dark:text-[#b4b4b4]">Capital: Bs. 15,000</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-[#737373]" />
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#212121] border border-zinc-200 dark:border-[#333333] text-xs text-zinc-600 dark:text-[#a3a3a3] flex justify-between">
              <span>Cobras: <strong className="text-zinc-900 dark:text-white">Bs. 1,500</strong></span>
              <span>Pagas a Rodo: <strong className="text-zinc-900 dark:text-white">Bs. 300</strong></span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-right">
              Ganancia neta: +Bs. 700.00
            </div>
          </div>
        </div>

        {/* HITO 4: 28 OCT (VICTORIA & JIMENA EN LA MISMA FECHA) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-11 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">28 Oct</span>
            <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">2 cobros</span>
          </div>

          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2a2a2a] border border-zinc-200 dark:border-[#3d3d3d] text-zinc-800 dark:text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
            2
          </div>

          <div className="flex-1 space-y-2">
            <div 
              onClick={() => onSelectLoan && onSelectLoan(findLoan('VICTORIA'))}
              className="p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#303030] border border-zinc-200 dark:border-[#333333] hover:border-zinc-300 dark:hover:border-[#404040] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">Victoria Coronado Duran</span>
                <span className="text-base font-mono font-bold text-zinc-900 dark:text-white">Bs. 500</span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-[#a3a3a3] block mt-0.5">CI: 5488548 • Cuota mensual</span>
            </div>

            <div 
              onClick={() => onSelectLoan && onSelectLoan(findLoan('JIMENA'))}
              className="p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#303030] border border-zinc-200 dark:border-[#333333] hover:border-zinc-300 dark:hover:border-[#404040] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">Jimena Cordova Parada</span>
                <span className="text-base font-mono font-bold text-zinc-900 dark:text-white">Bs. 220</span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-[#a3a3a3] block mt-0.5">Tel: 73610261 • Doc. Privado</span>
            </div>
          </div>
        </div>

        {/* HITO 5: CRÉDITO BANCO FIE */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-11 text-right pt-1.5 shrink-0">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">30 Oct</span>
            <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Pagar</span>
          </div>

          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2a2a2a] border border-zinc-200 dark:border-[#3d3d3d] text-zinc-800 dark:text-[#ececec] flex items-center justify-center shrink-0 text-xs shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-zinc-800 dark:text-white" />
          </div>

          <div 
            onClick={() => onSelectLoan && onSelectLoan(findLoan('FIE'))}
            className="flex-1 p-3.5 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#303030] border border-zinc-200 dark:border-[#333333] hover:border-zinc-300 dark:hover:border-[#404040] transition-all shadow-xs space-y-1.5 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Banco FIE (Crédito Recibido)</h4>
                <span className="text-xs text-zinc-500 dark:text-[#a3a3a3]">Cuota mensual fija</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-[#737373]" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-white">Pagar Bs. 650.00</span>
              <span className="text-xs text-zinc-500 dark:text-[#a3a3a3]">Cuota 8 de 20</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
