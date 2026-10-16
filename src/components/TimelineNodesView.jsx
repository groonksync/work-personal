import React, { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, CheckCircle2, 
  Clock, ArrowRight, User, Phone, FileText, Layers 
} from 'lucide-react';

export default function TimelineNodesView({
  prestamos = [],
  currency = 'BOB',
  onSelectLoan,
  onOpenNewLoan,
}) {
  const [periodMode, setPeriodMode] = useState('Semana');
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Buscar préstamos clave para mostrar en el cronograma
  const rodoLoan = prestamos.find(p => p.id === 'acreedor-tio-rodo') || {
    id: 'acreedor-tio-rodo',
    nombre: 'Tío Rodo (Acreedor)',
    capital: 10000,
    interes: 3,
    tipo_prestamo: 'recibido',
    notas: 'Fondeo de 10,000 Bs para Magali Molina. Pago: 300 Bs/mes. Ganancia neta: 700 Bs/mes.'
  };

  const magaliLoan = prestamos.find(p => p.nombre.toUpperCase().includes('MAGALI')) || prestamos[0];
  const robertoLoan = prestamos.find(p => p.nombre.toUpperCase().includes('ROBERTO')) || prestamos[1];
  const sandraLoan = prestamos.find(p => p.nombre.toUpperCase().includes('SANDRA')) || prestamos[2];
  const victoriaLoan = prestamos.find(p => p.nombre.toUpperCase().includes('VICTORIA')) || prestamos[3];
  const jimenaLoan = prestamos.find(p => p.nombre.toUpperCase().includes('JIMENA')) || prestamos[4];
  const santosLoan = prestamos.find(p => p.nombre.toUpperCase().includes('SANTOS')) || prestamos[5];
  const rolyLoan = prestamos.find(p => p.nombre.toUpperCase().includes('ROLY')) || prestamos[6];
  const fieLoan = prestamos.find(p => p.id === 'acreedor-banco-fie') || prestamos[7];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f7f7f8] dark:bg-[#212121] overflow-hidden select-none text-[#171717] dark:text-[#ececec] transition-colors duration-150">
      
      {/* SUB-HEADER CON CONTROLES SUAVES Y LIMPIOS (ESTILO CHATGPT) */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-[#2a2a2a] flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#212121] shrink-0 transition-colors duration-150">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
            Cronograma de Cobros y Vencimientos
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#a3a3a3] mt-0.5">
            Selecciona cualquier tarjeta para gestionar abonos, ver cuotas o enviar avisos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Selector de escala de tiempo */}
          <div className="p-1 rounded-lg bg-zinc-100 dark:bg-[#171717] border border-zinc-200 dark:border-[#2d2d2d] flex gap-1 text-xs">
            {['Día', 'Semana', 'Mes'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPeriodMode(mode)}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  periodMode === mode 
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-[#2a2a2a] dark:text-white' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navegador de período */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#2a2a2a] border border-zinc-200 dark:border-[#333333] text-xs text-zinc-800 dark:text-white">
            <button className="text-zinc-500 dark:text-[#a3a3a3] hover:text-zinc-900 dark:hover:text-white px-1">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono px-2 text-xs text-zinc-800 dark:text-[#ececec]">16 Oct - 15 Nov 2026</span>
            <button className="text-zinc-500 dark:text-[#a3a3a3] hover:text-zinc-900 dark:hover:text-white px-1">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LIENZO DE PANTALLA COMPLETA DEL CRONOGRAMA */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scroll relative p-6 bg-[#f7f7f8] dark:bg-[#212121] transition-colors duration-150">
        <div className="min-w-[1200px] relative pb-16">

          {/* ENCABEZADO DE DÍAS (MUY LEGIBLE Y LIMPIO) */}
          <div className="flex border-b border-zinc-200 dark:border-[#2d2d2d] pb-3 text-xs mb-6 select-none">
            <div className="w-64 shrink-0 text-zinc-500 dark:text-[#8e8e8e] font-semibold uppercase tracking-wider text-[11px]">
              Persona / Registro
            </div>

            <div className="flex-1 grid grid-cols-12 gap-2 text-center text-zinc-500 dark:text-[#8e8e8e]">
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">LUN</span><strong className="text-zinc-800 dark:text-white text-xs">12</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">MAR</span><strong className="text-zinc-800 dark:text-white text-xs">13</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">MIÉ</span><strong className="text-zinc-800 dark:text-white text-xs">14</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">JUE</span><strong className="text-zinc-800 dark:text-white text-xs">15</strong></div>
              
              {/* DÍA DE HOY (DESTACADO SUTILMENTE EN GRIS CLARO) */}
              <div className="bg-zinc-200 dark:bg-[#2f2f2f] rounded-lg py-1 border border-zinc-300 dark:border-[#404040]">
                <span className="block text-[10px] text-zinc-900 dark:text-white font-bold">HOY</span>
                <strong className="text-zinc-900 dark:text-white text-xs">16</strong>
              </div>

              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">SÁB</span><strong className="text-zinc-500 dark:text-[#a3a3a3] text-xs">17</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">DOM</span><strong className="text-zinc-500 dark:text-[#a3a3a3] text-xs">18</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">LUN</span><strong className="text-zinc-800 dark:text-white text-xs">19</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">MAR</span><strong className="text-zinc-800 dark:text-white text-xs">20</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">MIÉ</span><strong className="text-zinc-800 dark:text-white text-xs">21</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">MAR</span><strong className="text-zinc-800 dark:text-white text-xs">28</strong></div>
              <div><span className="block text-[10px] text-zinc-400 dark:text-[#737373]">VIE</span><strong className="text-zinc-800 dark:text-white text-xs">30</strong></div>
            </div>
          </div>

          {/* LÍNEA GUÍA VERTICAL DE HOY (GRIS CLARO SUTIL, SIN GLOBOS NI COLORES CHILLONES) */}
          <div className="absolute top-14 bottom-0 left-[670px] w-[1px] bg-zinc-300 dark:bg-neutral-500/50 pointer-events-none z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 dark:bg-white -ml-[4px] -top-1 relative shadow-xs"></div>
          </div>

          {/* SVG OVERLAY PARA CONECTORES DE NODOS */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
            {/* Conector entre Tío Rodo y Magali Molina */}
            <path d="M 450 110 C 510 110, 510 180, 570 180" fill="none" stroke="currentColor" className="text-zinc-400 dark:text-[#525252]" strokeWidth="1.5" strokeDasharray="4,4" />
            <circle cx="510" cy="145" r="3.5" fill="currentColor" className="text-zinc-500 dark:text-[#a3a3a3]" />
            
            {/* Conector entre Victoria Coronado y Jimena Cordova (Misma fecha: 28 Oct) */}
            <path d="M 1080 305 C 1100 305, 1100 375, 1080 375" fill="none" stroke="currentColor" className="text-zinc-400 dark:text-[#666666]" strokeWidth="1.5" />
            <circle cx="1100" cy="340" r="3" fill="currentColor" className="text-zinc-500 dark:text-[#a3a3a3]" />
          </svg>

          {/* CARRILES Y FICHAS DE PRÉSTAMOS (DISEÑO GRIS LISO, SUAVE Y LIMPIO) */}
          <div className="space-y-3.5 relative z-20">

            {/* 1. TÍO RODO (ACREEDOR / FONDEO) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Tío Rodo (Acreedor)</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Fondeo • Tasa 3% pasiva</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(rodoLoan)}
                  className="absolute left-[190px] w-64 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Fondeo Bs. 10,000</span>
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-[#ececec]">Pagar Bs. 300</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#a3a3a3] mt-1 flex items-center justify-between">
                    <span>Destino: Magali Molina</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Margen: +700 Bs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MAGALI MOLINA */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Magali Molina</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">CI: 6259284-SC • 10% Mensual</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(magaliLoan)}
                  className="absolute left-[360px] w-80 p-3 rounded-xl bg-zinc-50 dark:bg-[#2f2f2f] hover:bg-zinc-100 dark:hover:bg-[#383838] border border-zinc-300 dark:border-[#444444] hover:border-zinc-400 dark:hover:border-[#555555] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Capital: Bs. 15,000</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">Cuota: Bs. 1,500</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#b4b4b4] mt-1 flex items-center justify-between">
                    <span>Vence: 25 Oct (Quedan 9d)</span>
                    <span className="bg-zinc-200 dark:bg-[#212121] px-1.5 py-0.5 rounded text-[10px] text-zinc-700 dark:text-[#a3a3a3]">Fondeado por Rodo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ROBERTO VILLAZON (COBRO DIARIO) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Roberto Villazón</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Tel: 76653981 • Cobro Diario</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(robertoLoan)}
                  className="absolute left-[240px] w-72 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Capital: Bs. 18,000</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">Hoy: Bs. 300</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#a3a3a3] mt-1 flex justify-between">
                    <span>12 pagos registrados</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Al Día</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. SANDRA CARRION (EMPRESARIA) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Sandra Carrión</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Empresaria • Tasa 6%</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(sandraLoan)}
                  className="absolute left-[120px] w-96 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Préstamo Mayor: Bs. 125,000</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">Rend: Bs. 7,500/m</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#a3a3a3] mt-1 flex justify-between">
                    <span>12 pagos continuos registrados</span>
                    <span>Tasa: 6% mensual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. VICTORIA CORONADO (28 OCT) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Victoria Coronado</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">CI: 5488548 • Bs. 5,000</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(victoriaLoan)}
                  className="absolute left-[600px] w-64 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Cuota: Bs. 500</span>
                    <span className="text-xs font-mono text-zinc-600 dark:text-[#d4d4d4]">28 Oct</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1">Saldo restante: Bs. 5,000</div>
                </div>
              </div>
            </div>

            {/* 6. JIMENA CORDOVA (28 OCT CONECTADA CON NODO) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Jimena Cordova</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Tel: 73610261 • Doc. Privado</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(jimenaLoan)}
                  className="absolute left-[600px] w-64 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Cuota: Bs. 220</span>
                    <span className="text-xs font-mono text-zinc-600 dark:text-[#d4d4d4]">28 Oct</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1">Capital: Bs. 2,200 • 10% tasa</div>
                </div>
              </div>
            </div>

            {/* 7. SANTOS VICENTE VILLEGAS (CAMIÓN EN GARANTÍA) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Santos Vicente Villegas</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Garantía: Camión Pesado</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(santosLoan)}
                  className="absolute left-[430px] w-80 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Capital: Bs. 196,000</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">Cuota: Bs. 9,800</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#a3a3a3] mt-1 flex justify-between">
                    <span>5 cuotas pagadas (de 8)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Al Día</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. ROLY CUELLAR (MACBOOK) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Roly Cuellar</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Debe de la Macbook</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(rolyLoan)}
                  className="absolute left-[510px] w-64 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Cuota: Bs. 400</span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">Al Día</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1">Saldo restante: Bs. 4,000</div>
                </div>
              </div>
            </div>

            {/* 9. BANCO FIE (CRÉDITO RECIBIDO) */}
            <div className="flex items-center">
              <div className="w-64 shrink-0 pr-4">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">Banco FIE (Crédito)</span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">Cuota fija mensual</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(fieLoan)}
                  className="absolute left-[640px] w-64 p-3 rounded-xl bg-white dark:bg-[#2a2a2a] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-[#383838] hover:border-zinc-300 dark:hover:border-[#4d4d4d] transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Pagar Cuota: Bs. 650</span>
                    <span className="text-xs font-mono text-zinc-600 dark:text-[#d4d4d4]">30 Oct</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1">Cuota 8 de 20 • Fija</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
