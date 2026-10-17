import React, { useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Check, FileText, LogOut, MessageSquareText, Plus, Search, UserRound, X } from 'lucide-react';
import { agruparPorPersona, formatDate, generarCronograma, toDate } from '../lib/amortizacion';

const symbols = { BOB: 'Bs.', USD: '$', PEN: 'S/' };
const money = (amount, currency = 'BOB') => `${symbols[currency] || currency} ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(Number(amount) || 0)}`;
const dateLabel = (value) => toDate(value).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });

export default function MobileAppView({
  prestamos = [], currency = 'BOB', theme = 'dark', toggleTheme,
  onSelectLoan, onOpenNewLoan, onPayCuota, onOpenSettings, onSignOut,
  onOpenVouchers, onOpenExpressNotes, loading = false, error = '', onRetry,
  backupCount = 0, backupNames = [], backupBusy = false, onImportBackup,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('todos');
  const today = formatDate(new Date());
  const groups = useMemo(() => agruparPorPersona(prestamos).map((group) => ({
    ...group,
    contratos: group.contratos.filter((loan) => {
      const type = loan.tipo_prestamo || 'otorgado';
      if (filter === 'otorgados' && type !== 'otorgado') return false;
      if (filter === 'recibidos' && type !== 'recibido') return false;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return [loan.nombre, loan.ci, loan.telefono, loan.titulo_prestamo].some((value) => value?.toLowerCase().includes(query));
    }),
  })).filter((group) => group.contratos.length > 0), [prestamos, filter, searchQuery]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f7f5] text-slate-900 dark:bg-[#111713] dark:text-slate-100">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/95 px-4 pb-3 pt-[max(.8rem,env(safe-area-inset-top))] dark:border-white/8 dark:bg-[#171d19]">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-800 dark:text-emerald-300">Work Personal</p><h1 className="mt-1 text-xl font-semibold tracking-tight">Cartera</h1></div>
          <div className="flex items-center gap-1.5">
            <button aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"><span className="text-sm">{theme === 'dark' ? '☼' : '◐'}</span></button>
            <button aria-label="Ajustes" onClick={onOpenSettings} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"><CalendarDays className="h-4 w-4" /></button>
            <button aria-label="Cerrar sesión" onClick={onSignOut} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-black/20"><Search className="h-4 w-4 text-slate-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar persona, CI o teléfono" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />{searchQuery && <button aria-label="Borrar búsqueda" onClick={() => setSearchQuery('')}><X className="h-4 w-4 text-slate-400" /></button>}</div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {[['todos', 'Todos'], ['otorgados', 'Me deben'], ['recibidos', 'Debo']].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${filter === value ? 'bg-[#193a2b] text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'}`}>{label}</button>)}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {error && <div role="alert" className="mb-4 flex items-start justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-900 dark:border-rose-300/15 dark:bg-rose-400/10 dark:text-rose-100"><span>{error}</span><button onClick={onRetry} className="shrink-0 font-semibold underline">Reintentar</button></div>}
        {backupCount > 0 && !loading && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-300/15 dark:bg-amber-400/10"><h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">Respaldo local encontrado</h2><p className="mt-1 text-xs leading-5 text-amber-900/80 dark:text-amber-100/80">{backupCount} registros: {backupNames.join(', ')}{backupCount > backupNames.length ? ', …' : ''}. Confirma que son los correctos antes de importarlos.</p><button disabled={backupBusy} onClick={onImportBackup} className="mt-3 rounded-lg bg-amber-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 dark:bg-amber-100 dark:text-amber-950">{backupBusy ? 'Importando…' : 'Importar respaldo'}</button></div>}
        {loading ? <p className="py-14 text-center text-sm text-slate-500">Cargando cartera…</p> : groups.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center dark:border-white/8 dark:bg-[#19201b]"><UserRound className="mx-auto h-6 w-6 text-slate-400" /><h2 className="mt-3 font-semibold">{prestamos.length ? 'Sin coincidencias' : 'Aún no hay préstamos'}</h2><p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{prestamos.length ? 'Prueba con otro nombre, CI o teléfono.' : 'Registra el primero para llevar el control de sus pagos.'}</p></div>
        ) : <div className="space-y-4">{groups.map((group) => <section key={group.key} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/8 dark:bg-[#19201b]"><div className="border-b border-slate-100 px-4 py-3.5 dark:border-white/8"><h2 className="font-semibold">{group.nombre}</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{group.ci ? `CI ${group.ci} · ` : ''}{group.contratos.length} {group.contratos.length === 1 ? 'préstamo' : 'préstamos'}</p></div><div className="divide-y divide-slate-100 dark:divide-white/8">{group.contratos.map((loan) => {
          const schedule = generarCronograma(loan);
          const next = schedule.find((installment) => !installment.pagado);
          const overdue = next && next.fechaVencimiento < today;
          const loanCurrency = loan.moneda || currency;
          return <article key={loan.id} className="px-4 py-3.5">
            <button onClick={() => onSelectLoan(loan)} className="block w-full text-left"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{loan.titulo_prestamo || 'Préstamo'}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Capital {money(loan.capital, loanCurrency)}</p></div>{next ? <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${overdue ? 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200'}`}>{overdue ? 'Vencido' : next.fechaVencimiento === today ? 'Vence hoy' : `Paga ${dateLabel(next.fechaVencimiento)}`}</span> : <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-white/5">Saldado</span>}</div>{next && <p className="mt-2 text-sm font-semibold tabular-nums">Próxima cuota: {money(next.total, loanCurrency)}</p>}</button>
            <div className="mt-3 flex gap-2"><button onClick={() => onSelectLoan(loan)} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-200"><FileText className="h-3.5 w-3.5" />Ver contrato</button>{next && <button onClick={() => onPayCuota(loan, next)} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#193a2b] text-xs font-semibold text-white"><Check className="h-3.5 w-3.5" />Registrar pago</button>}<button aria-label={`Notas de ${loan.titulo_prestamo || 'préstamo'}`} onClick={() => onOpenExpressNotes(loan)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"><MessageSquareText className="h-4 w-4" /></button></div>
          </article>;
        })}</div></section>)}</div>}
      </main>

      <button onClick={onOpenNewLoan} className="fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-4 z-20 flex h-12 items-center gap-2 rounded-full bg-[#193a2b] px-5 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_rgba(16,60,38,.8)]"><Plus className="h-4 w-4" />Nuevo préstamo</button>
    </div>
  );
}
