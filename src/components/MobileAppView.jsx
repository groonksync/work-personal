import React, { useState } from 'react';
import { 
  Calendar, Users, Zap, Bell, Plus, Search, 
  Send, Check, ChevronRight, DollarSign, ArrowUpRight, 
  ArrowDownLeft, Clock, ShieldCheck, X, Sliders, Receipt, 
  MessageSquare, TrendingDown, Landmark, HardDrive
} from 'lucide-react';

export default function MobileAppView({
  prestamos = [],
  carpetas = [],
  alertas = [],
  currency = 'BOB',
  setCurrency,
  onSelectLoan,
  onOpenNewLoan,
  onPayCuota,
  onSendWhatsApp,
  onOpenSettings,
  onOpenVouchers,
  onOpenExpressNotes,
  onOpenCapitalPayment,
}) {
  const [mobileTab, setMobileTab] = useState('cronograma'); // 'cronograma' | 'clientes' | 'cobros' | 'avisos'
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'otorgados' | 'recibidos'
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  // Filtrado
  const filteredLoans = prestamos.filter(p => {
    const tipo = p.tipo_prestamo || (p.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado');
    if (filtroTipo === 'otorgados' && tipo !== 'otorgado') return false;
    if (filtroTipo === 'recibidos' && tipo !== 'recibido') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.nombre?.toLowerCase().includes(q);
      const matchCI = p.ci?.toLowerCase().includes(q);
      const matchTel = p.telefono?.includes(q);
      if (!matchName && !matchCI && !matchTel) return false;
    }
    return true;
  });

  const findLoan = (term) => prestamos.find(p => p.nombre?.toUpperCase().includes(term.toUpperCase())) || prestamos[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] text-[#ececec] overflow-hidden select-none pb-[70px]">
      
      {/* 1. CABECERA SUPERIOR MÓVIL (COMPACTA Y ERGONÓMICA) */}
      <header className="px-4 pt-3 pb-2.5 bg-[#171717] border-b border-[#262626] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-[#8e8e8e] uppercase tracking-wider block">
              Gestor Móvil
            </span>
            <h1 className="text-base font-bold text-white tracking-tight">
              {mobileTab === 'cronograma' && 'Cronograma Diario'}
              {mobileTab === 'clientes' && 'Cartera de Clientes'}
              {mobileTab === 'cobros' && 'Cobros Inmediatos'}
              {mobileTab === 'avisos' && 'Avisos y Vencimientos'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Selector de moneda rápido */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-[#262626] border border-[#333] text-xs font-mono text-white px-2 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="BOB">Bs.</option>
              <option value="USD">$</option>
              <option value="PEN">S/</option>
            </select>

            {/* Toggle Buscador */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                searchOpen ? 'bg-white text-black' : 'bg-[#262626] text-[#a3a3a3]'
              }`}
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Ajustes y Auditoría */}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-lg bg-[#262626] hover:bg-[#333] text-[#a3a3a3] hover:text-white flex items-center justify-center transition-all"
              title="Ajustes"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Botón + Nuevo */}
            <button
              onClick={onOpenNewLoan}
              className="h-8 px-2.5 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>

        {/* Buscador Desplegable en Móvil */}
        {searchOpen && (
          <div className="flex items-center gap-2 bg-[#262626] px-3 py-1.5 rounded-lg border border-[#383838] animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-[#8e8e8e] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, CI o teléfono..."
              className="bg-transparent outline-none w-full text-white placeholder-[#737373] text-xs"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#8e8e8e] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Píldoras de Filtro Deslizable Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll no-scrollbar py-0.5">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filtroTipo === 'todos' 
                ? 'bg-[#333333] text-white font-semibold shadow-xs' 
                : 'bg-[#262626] text-[#8e8e8e]'
            }`}
          >
            Todos ({prestamos.length})
          </button>

          <button
            onClick={() => setFiltroTipo('otorgados')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filtroTipo === 'otorgados' 
                ? 'bg-[#333333] text-white font-semibold shadow-xs' 
                : 'bg-[#262626] text-[#8e8e8e]'
            }`}
          >
            Cobros ({prestamos.filter(p => (p.tipo_prestamo || 'otorgado') === 'otorgado').length})
          </button>

          <button
            onClick={() => setFiltroTipo('recibidos')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filtroTipo === 'recibidos' 
                ? 'bg-[#333333] text-white font-semibold shadow-xs' 
                : 'bg-[#262626] text-[#8e8e8e]'
            }`}
          >
            Acreedores ({prestamos.filter(p => p.tipo_prestamo === 'recibido').length})
          </button>

          {alertas.length > 0 && (
            <button
              onClick={() => setMobileTab('avisos')}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-amber-500/15 text-amber-300 font-bold flex items-center gap-1"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>{alertas.length} por vencer</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL MÓVIL SEGÚN PESTAÑA */}
      <main className="flex-1 overflow-y-auto custom-scroll p-4">
        
        {/* PESTAÑA A: CRONOGRAMA STREAM CON NODOS GRISES LIMPIOS */}
        {mobileTab === 'cronograma' && (
          <div className="space-y-4 relative">
            <div className="absolute left-[65px] top-6 bottom-6 w-[1.5px] bg-[#333333]"></div>

            {/* 17 Oct - Roberto */}
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 text-right pt-1.5 shrink-0">
                <span className="text-xs font-bold text-white block">17 Oct</span>
                <span className="text-[10px] text-[#8e8e8e]">Mañana</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] border border-[#3d3d3d] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div 
                onClick={() => onSelectLoan(findLoan('ROBERTO'))}
                className="flex-1 p-3.5 rounded-xl bg-[#2a2a2a] hover:bg-[#303030] border border-[#333333] transition-all cursor-pointer active:scale-[0.99] space-y-1.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Roberto Villazón</h4>
                    <span className="text-xs text-[#a3a3a3]">Cobro Diario</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737373]" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-mono font-bold text-white">Bs. 300.00</span>
                  <span className="text-xs text-emerald-400 font-medium">Al Día</span>
                </div>
              </div>
            </div>

            {/* 20 Oct - Roly */}
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 text-right pt-1.5 shrink-0">
                <span className="text-xs font-bold text-white block">20 Oct</span>
                <span className="text-[10px] text-[#8e8e8e]">En 4d</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] border border-[#3d3d3d] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div 
                onClick={() => onSelectLoan(findLoan('ROLY'))}
                className="flex-1 p-3.5 rounded-xl bg-[#2a2a2a] hover:bg-[#303030] border border-[#333333] transition-all cursor-pointer active:scale-[0.99] space-y-1.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Roly Cuellar</h4>
                    <span className="text-xs text-[#a3a3a3]">Debe de la Macbook</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737373]" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-mono font-bold text-white">Bs. 400.00</span>
                  <span className="text-xs text-[#a3a3a3]">Cuota 8 de 10</span>
                </div>
              </div>
            </div>

            {/* 25 Oct - Magali & Fondeo */}
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 text-right pt-1.5 shrink-0">
                <span className="text-xs font-bold text-white block">25 Oct</span>
                <span className="text-[10px] text-[#8e8e8e]">Fondeo</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] border border-[#3d3d3d] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div 
                onClick={() => onSelectLoan(findLoan('MAGALI'))}
                className="flex-1 p-3.5 rounded-xl bg-[#2f2f2f] hover:bg-[#383838] border border-[#3d3d3d] transition-all cursor-pointer active:scale-[0.99] space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Magali Molina (Fondeo)</h4>
                    <span className="text-xs text-[#b4b4b4]">Capital: Bs. 15,000</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737373]" />
                </div>
                <div className="p-2 rounded-lg bg-[#212121] border border-[#333333] text-xs text-[#a3a3a3] flex justify-between">
                  <span>Cobras: <strong className="text-white">Bs. 1,500</strong></span>
                  <span>Pagas a Rodo: <strong className="text-white">Bs. 300</strong></span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 text-right">
                  Ganancia neta: +Bs. 700.00
                </div>
              </div>
            </div>

            {/* 28 Oct - Victoria & Jimena */}
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 text-right pt-1.5 shrink-0">
                <span className="text-xs font-bold text-white block">28 Oct</span>
                <span className="text-[10px] text-[#8e8e8e]">2 cobros</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] border border-[#3d3d3d] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs font-mono">
                2
              </div>
              <div className="flex-1 space-y-2">
                <div 
                  onClick={() => onSelectLoan(findLoan('VICTORIA'))}
                  className="p-3.5 rounded-xl bg-[#2a2a2a] hover:bg-[#303030] border border-[#333333] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-white">Victoria Coronado</span>
                    <span className="text-base font-mono font-bold text-white">Bs. 500</span>
                  </div>
                  <span className="text-xs text-[#a3a3a3] block mt-0.5">CI: 5488548 • Cuota mensual</span>
                </div>

                <div 
                  onClick={() => onSelectLoan(findLoan('JIMENA'))}
                  className="p-3.5 rounded-xl bg-[#2a2a2a] hover:bg-[#303030] border border-[#333333] transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-white">Jimena Cordova</span>
                    <span className="text-base font-mono font-bold text-white">Bs. 220</span>
                  </div>
                  <span className="text-xs text-[#a3a3a3] block mt-0.5">Tel: 73610261 • Doc. Privado</span>
                </div>
              </div>
            </div>

            {/* 30 Oct - Banco FIE */}
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 text-right pt-1.5 shrink-0">
                <span className="text-xs font-bold text-white block">30 Oct</span>
                <span className="text-[10px] text-[#8e8e8e]">Pagar</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#2a2a2a] border border-[#3d3d3d] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <Landmark className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div 
                onClick={() => onSelectLoan(findLoan('FIE'))}
                className="flex-1 p-3.5 rounded-xl bg-[#2a2a2a] hover:bg-[#303030] border border-[#333333] transition-all shadow-xs space-y-1.5 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Banco FIE (Crédito)</h4>
                    <span className="text-xs text-[#a3a3a3]">Cuota fija mensual</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#737373]" />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-mono font-bold text-white">Pagar Bs. 650.00</span>
                  <span className="text-xs text-[#a3a3a3]">Cuota 8 de 20</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA B: LISTA DE EXPEDIENTES / CLIENTES */}
        {mobileTab === 'clientes' && (
          <div className="space-y-3">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="p-3.5 rounded-xl bg-[#2a2a2a] hover:bg-[#303030] border border-[#333333] transition-all cursor-pointer active:scale-[0.99] space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#212121] border border-[#383838] flex items-center justify-center font-bold text-xs text-white">
                      {loan.nombre.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-none">
                        {loan.nombre}
                      </h4>
                      <span className="text-[11px] text-[#8e8e8e] mt-1 block">
                        CI: {loan.ci || 'Sin CI'} • Tel: {loan.telefono || 'Sin tel'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-white">
                    {symbol} {Number(loan.capital).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#333333] text-xs">
                  <div className="text-[#a3a3a3]">
                    <span>Tasa: <strong className="text-white">{loan.interes}%</strong></span>
                    {loan.fin && <span className="ml-2 font-mono text-[11px]">Vence: {loan.fin}</span>}
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenVouchers && onOpenVouchers(loan)}
                      className="p-1.5 rounded-lg bg-[#212121] hover:bg-[#333] text-emerald-400 border border-[#383838]"
                      title="Vouchers"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenExpressNotes && onOpenExpressNotes(loan)}
                      className="p-1.5 rounded-lg bg-[#212121] hover:bg-[#333] text-amber-400 border border-[#383838]"
                      title="Notas Express"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSendWhatsApp && onSendWhatsApp({ nombre: loan.nombre, telefono: loan.telefono })}
                      className="px-2.5 py-1 rounded bg-[#212121] hover:bg-[#333] text-emerald-400 text-xs font-medium border border-emerald-500/20"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => onSelectLoan(loan)}
                      className="px-2.5 py-1 rounded bg-white text-black font-semibold text-xs"
                    >
                      Abonar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA C: COBROS INMEDIATOS */}
        {mobileTab === 'cobros' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333] mb-4">
              <span className="text-[11px] text-[#8e8e8e] uppercase font-bold block">Cobros del Período</span>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                {symbol} 23,220.00
              </div>
              <span className="text-xs text-emerald-400 font-medium">9 cuotas activas programadas</span>
            </div>

            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="p-3.5 rounded-xl bg-[#2a2a2a] border border-[#333333] flex items-center justify-between cursor-pointer active:scale-[0.99]"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{loan.nombre}</h4>
                  <span className="text-xs text-[#a3a3a3] font-mono">
                    Vencimiento: {loan.fin || 'Continuo'}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-base font-mono font-bold text-white">
                    {symbol} {Math.round(Number(loan.capital) * (Number(loan.interes || 10) / 100)).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Abonar →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA D: AVISOS Y VENCIMIENTOS */}
        {mobileTab === 'avisos' && (
          <div className="space-y-3">
            {alertas.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#8e8e8e] space-y-2">
                <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                <span>No hay cuotas vencidas ni por vencer</span>
              </div>
            ) : (
              alertas.map((alerta, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#2a2a2a] border border-amber-500/30 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        {alerta.labelTiempo}
                      </span>
                      <h4 className="text-sm font-bold text-white">{alerta.nombre}</h4>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {symbol} {alerta.montoCuota?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#333333] text-xs">
                    <span className="text-[11px] text-[#a3a3a3] font-mono">
                      Vence: {alerta.fechaVencimiento}
                    </span>
                    <button
                      onClick={() => {
                        const l = prestamos.find(p => p.id === alerta.prestamoId);
                        if (l) onSelectLoan(l);
                      }}
                      className="px-3 py-1 rounded bg-white text-black font-semibold text-xs"
                    >
                      Gestionar Cobro
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* 3. BARRA DE NAVEGACIÓN INFERIOR (BOTTOM DOCK ERGONÓMICO CON SAFE-AREA) */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#171717] border-t border-[#262626] px-4 py-2 pb-[env(safe-area-inset-bottom,12px)] flex justify-around items-center z-40 select-none shadow-2xl">
        
        <button
          onClick={() => setMobileTab('cronograma')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
            mobileTab === 'cronograma' ? 'text-white font-bold' : 'text-[#8e8e8e] hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Cronograma</span>
        </button>

        <button
          onClick={() => setMobileTab('clientes')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
            mobileTab === 'clientes' ? 'text-white font-bold' : 'text-[#8e8e8e] hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => setMobileTab('cobros')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
            mobileTab === 'cobros' ? 'text-white font-bold' : 'text-[#8e8e8e] hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px]">Cobros</span>
        </button>

        <button
          onClick={() => setMobileTab('avisos')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all relative ${
            mobileTab === 'avisos' ? 'text-white font-bold' : 'text-[#8e8e8e] hover:text-white'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {alertas.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                {alertas.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Avisos</span>
        </button>

      </nav>

    </div>
  );
}
