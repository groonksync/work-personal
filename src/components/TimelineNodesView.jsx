import React, { useState } from 'react';
import { 
  Calendar, Clock, Filter, Share2, Plus, Search, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, 
  MoreVertical, ArrowRight, Sparkles, Building2, User, Phone,
  Layers, ExternalLink
} from 'lucide-react';

export default function TimelineNodesView({
  prestamos = [],
  currency = 'BOB',
  onSelectLoan,
  onOpenNewLoan,
}) {
  const [periodMode, setPeriodMode] = useState('Semana');
  const [showOnlyWithNodes, setShowOnlyWithNodes] = useState(false);
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Buscar préstamos clave para enlazar
  const rodoLoan = prestamos.find(p => p.id === 'acreedor-tio-rodo') || {
    id: 'acreedor-tio-rodo',
    nombre: 'Tío Rodo (Acreedor)',
    capital: 10000,
    interes: 3,
    tipo_prestamo: 'recibido',
    notas: 'Fondeo de 10,000 Bs para el préstamo de Magali Molina. Se le paga un interés del 3% (300 Bs/mes). Mi ganancia neta: 700 Bs/mes.'
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
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0d] overflow-hidden select-none">
      
      {/* SUB-HEADER CON CONTROLES DEL TIMELINE (PANTALLA COMPLETA) */}
      <div className="px-6 py-3.5 border-b border-[#1c1d24] flex flex-wrap items-center justify-between gap-4 bg-[#0e0f13]/80 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight">Cronograma de Vencimientos</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold border border-purple-500/20">
              Visualización con Nodos
            </span>
          </div>
          <p className="text-xs text-[#717382] mt-0.5">
            Haz clic en cualquier tarjeta o nodo para abrir su expediente, registrar abonos o enviar WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented control Día / Semana / Mes */}
          <div className="p-0.5 rounded-lg bg-[#16171d] border border-white/[0.04] flex gap-0.5 text-xs">
            {['Día', 'Semana', 'Mes'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPeriodMode(mode)}
                className={`px-3 py-1 rounded-md transition-all ${
                  periodMode === mode 
                    ? 'bg-[#23242e] text-white font-medium shadow-xs' 
                    : 'text-[#717382] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navegador de período */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16171d] border border-white/[0.04] text-xs text-white">
            <button className="text-[#717382] hover:text-white px-1">‹</button>
            <span className="font-mono px-2 text-[11px] text-[#c2c4d4]">16 Oct - 15 Nov 2026</span>
            <button className="text-[#717382] hover:text-white px-1">›</button>
          </div>

          <div className="h-4 w-[1px] bg-white/[0.06] hidden sm:block"></div>

          <button 
            onClick={() => setShowOnlyWithNodes(!showOnlyWithNodes)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
              showOnlyWithNodes 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                : 'bg-[#16171d] text-[#717382] hover:text-white border-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showOnlyWithNodes ? 'Ver Todos' : 'Filtrar Nodos'}</span>
          </button>
        </div>
      </div>

      {/* LIENZO PRINCIPAL DEL TIMELINE: OCUPA EL 100% DEL ESPACIO DISPONIBLE */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scroll relative timeline-grid-bg p-6">
        <div className="min-w-[1240px] relative pb-16">

          {/* ENCABEZADO DE DÍAS Y SEMANAS */}
          <div className="flex border-b border-[#1c1d25] pb-3 text-xs mb-6 select-none">
            <div className="w-60 shrink-0 text-[#606270] font-semibold uppercase tracking-wider text-[10px]">
              Persona / Contrato
            </div>

            <div className="flex-1 grid grid-cols-12 gap-2 text-center text-[#717382]">
              <div><span className="block text-[10px] text-[#4d4f5b]">LUN</span><strong className="text-white">12</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">MAR</span><strong className="text-white">13</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">MIÉ</span><strong className="text-white">14</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">JUE</span><strong className="text-white">15</strong></div>
              
              {/* DÍA DE HOY DESTACADO CON LÍNEA VIOLETA EXACTO A IMAGEN 1 */}
              <div className="relative bg-purple-500/10 rounded-md py-0.5 border border-purple-500/30">
                <span className="block text-[10px] text-purple-400 font-bold">HOY</span>
                <strong className="text-white">16</strong>
              </div>

              <div><span className="block text-[10px] text-[#4d4f5b]">SÁB</span><strong>17</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">DOM</span><strong>18</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">LUN</span><strong className="text-white">19</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">MAR</span><strong className="text-white">20</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">MIÉ</span><strong className="text-white">21</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">MAR</span><strong className="text-white">28</strong></div>
              <div><span className="block text-[10px] text-[#4d4f5b]">VIE</span><strong className="text-white">30</strong></div>
            </div>
          </div>

          {/* LÍNEA GUÍA VERTICAL INDICADORA DE FECHA DE HOY (T26 EN IMAGEN 1) */}
          <div className="absolute top-14 bottom-0 left-[660px] w-[2px] bg-purple-500/80 pointer-events-none z-10 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <div className="w-3 h-3 rounded-full bg-purple-500 -ml-[5px] -top-1.5 relative border-2 border-[#0a0a0d]"></div>
          </div>

          {/* SVG OVERLAY PARA LAS CURVAS Y NODOS DE CONEXIÓN ENTRE HITOS */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
            {/* Curva Bézier entre Tío Rodo y Magali Molina */}
            <path d="M 450 110 C 510 110, 510 178, 570 178" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,4" />
            <circle cx="510" cy="144" r="4" fill="#a855f7" stroke="#0a0a0d" strokeWidth="2" />
            
            {/* Curva entre Victoria Coronado y Jimena Cordova (Misma fecha: 28 Oct) */}
            <path d="M 1080 305 C 1100 305, 1100 375, 1080 375" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <circle cx="1100" cy="340" r="3.5" fill="#3b82f6" stroke="#0a0a0d" strokeWidth="1.5" />
          </svg>

          {/* CARRILES Y FICHAS DE PRÉSTAMOS REALES (TOTALMENTE CLICKEABLES) */}
          <div className="space-y-4 relative z-20">

            {/* Fila 1: TÍO RODO (PRESTAMISTA / FONDEADOR) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-purple-300 block">Tío Rodo (Acreedor)</span>
                <span className="text-[10px] text-[#6b6d7a]">Fondeo Capital • 3% tasa</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(rodoLoan)}
                  className="absolute left-[190px] w-64 p-3 rounded-xl bg-[#171820] border border-purple-500/40 hover:border-purple-300 transition-all shadow-md group cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <h4 className="text-xs font-bold text-white">Fondeo Bs. 10,000</h4>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 font-bold">Pagar Bs. 300</span>
                  </div>
                  <div className="text-[10px] text-[#8e909f] mt-1 flex items-center justify-between">
                    <span>Destino: Magali Molina</span>
                    <span className="text-emerald-400 font-bold">Margen: +700 Bs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 2: MAGALI MOLINA (DESTACADA CON GRADIENTE SUTIL IGUAL A IMAGEN 1) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-white block">MAGALI MOLINA</span>
                <span className="text-[10px] text-[#6b6d7a]">CI: 6259284-SC • 10% Mensual</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(magaliLoan)}
                  className="absolute left-[360px] w-80 p-3 rounded-xl bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-amber-900/40 border border-purple-400/50 hover:border-purple-300 transition-all shadow-lg cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      <h4 className="text-xs font-bold text-white">Capital: Bs. 15,000</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">Cuota: Bs. 1,500</span>
                  </div>
                  <div className="text-[10px] text-purple-200 mt-1 flex items-center justify-between">
                    <span>Vence: 25 Oct (Quedan 9d)</span>
                    <span className="font-semibold bg-black/40 px-1.5 py-0.2 rounded text-[9px]">Fondeado por Rodo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 3: ROBERTO VILLAZON INOSENTE (COBRO DIARIO) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-white block">ROBERTO VILLAZON</span>
                <span className="text-[10px] text-[#6b6d7a]">Tel: 76653981 • Cobro Diario</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(robertoLoan)}
                  className="absolute left-[240px] w-72 p-2.5 rounded-xl bg-[#171820] border border-[#23242e] hover:border-[#383a48] transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <h4 className="text-xs font-medium text-white">Capital: Bs. 18,000</h4>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-400">Hoy: Bs. 300</span>
                  </div>
                  <div className="text-[10px] text-[#717382] mt-0.5 flex justify-between">
                    <span>12 pagos registrados</span>
                    <span className="text-amber-400 font-medium">Cobro Diario</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 4: SANDRA CARRION CHAHUAYO (EMPRESARIA) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-white block">SANDRA CARRION</span>
                <span className="text-[10px] text-[#6b6d7a]">Empresaria • Bs. 125,000</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(sandraLoan)}
                  className="absolute left-[120px] w-96 p-2.5 rounded-xl bg-[#171820] border border-[#23242e] hover:border-[#383a48] transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <h4 className="text-xs font-medium text-white">Préstamo Mayor: Bs. 125,000</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">Rend: Bs. 7,500/mes</span>
                  </div>
                  <div className="text-[10px] text-[#717382] mt-0.5 flex justify-between">
                    <span>12 pagos continuos registrados</span>
                    <span>Tasa: 6% mensual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 5: VICTORIA CORONADO DURAN */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-white block">VICTORIA CORONADO</span>
                <span className="text-[10px] text-[#6b6d7a]">CI: 5488548 • Bs. 5,000</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(victoriaLoan)}
                  className="absolute left-[600px] w-64 p-2.5 rounded-xl bg-[#171820] border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <h4 className="text-xs font-medium text-white">Cuota: Bs. 500</h4>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">Vence: 28 Oct</span>
                  </div>
                  <div className="text-[10px] text-[#717382] mt-0.5">Saldo capital restante: Bs. 5,000</div>
                </div>
              </div>
            </div>

            {/* Fila 6: JIMENA CORDOVA PARADA (CONECTADA CON NODO A VICTORIA) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-white block">JIMENA CORDOVA</span>
                <span className="text-[10px] text-[#6b6d7a]">Tel: 73610261 • Doc. Privado</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(jimenaLoan)}
                  className="absolute left-[600px] w-64 p-2.5 rounded-xl bg-[#171820] border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <h4 className="text-xs font-medium text-white">Cuota: Bs. 220</h4>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">Vence: 28 Oct</span>
                  </div>
                  <div className="text-[10px] text-[#717382] mt-0.5">Capital: Bs. 2,200 • 10% tasa</div>
                </div>
              </div>
            </div>

            {/* Fila 7: SANTOS VICENTE VILLEGAS (CAMIÓN EN GARANTÍA) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-white block">Santos Vicente Villegas</span>
                <span className="text-[10px] text-amber-400">Garantía: Camión Pesado</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(santosLoan)}
                  className="absolute left-[430px] w-80 p-2.5 rounded-xl bg-[#171820] border border-[#23242e] hover:border-[#383a48] transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <h4 className="text-xs font-bold text-white">Capital: Bs. 196,000</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">Cuota: Bs. 9,800</span>
                  </div>
                  <div className="text-[10px] text-[#717382] mt-0.5 flex justify-between">
                    <span>5 cuotas pagadas (de 8)</span>
                    <span className="text-emerald-400 font-medium">Al Día</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 8: ROLY CUELLAR (MACBOOK) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-white block">ROLY CUELLAR</span>
                <span className="text-[10px] text-[#6b6d7a]">Nota: Debe de la Macbook</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(rolyLoan)}
                  className="absolute left-[510px] w-64 p-2.5 rounded-xl bg-[#171820] border border-[#23242e] hover:border-[#383a48] transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <h4 className="text-xs font-medium text-white">Cuota: Bs. 400</h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">7 meses saldados</span>
                  </div>
                  <div className="text-[10px] text-[#717382] mt-0.5">Saldo restante: Bs. 4,000</div>
                </div>
              </div>
            </div>

            {/* Fila 9: BANCO FIE (CRÉDITO RECIBIDO) */}
            <div className="flex items-center">
              <div className="w-60 shrink-0 pr-4">
                <span className="text-xs font-semibold text-rose-400 block">Banco FIE (Crédito)</span>
                <span className="text-[10px] text-[#6b6d7a]">Cuota Fija Mensual</span>
              </div>
              <div className="flex-1 relative h-14 flex items-center">
                <div 
                  onClick={() => onSelectLoan(fieLoan)}
                  className="absolute left-[640px] w-64 p-2.5 rounded-xl bg-[#171820] border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <h4 className="text-xs font-medium text-white">Cuota: Bs. 650</h4>
                    </div>
                    <span className="text-[10px] font-mono text-rose-300 font-bold">Vence: 30 Oct</span>
                  </div>
                  <div className="text-[10px] text-[#717382] mt-0.5">Crédito recibido • 20 cuotas</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
