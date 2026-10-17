import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, FileText, Plus, UserRound, UsersRound } from 'lucide-react';
import { agruparPorPersona, formatDate, generarCronograma, toDate } from '../lib/amortizacion';

const symbols = { BOB: 'Bs.', USD: '$', PEN: 'S/' };
const money = (amount, currency = 'BOB') => `${symbols[currency] || currency} ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(Number(amount) || 0)}`;
const dateLabel = (value) => toDate(value).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });

function totalByCurrency(items) {
  return items.reduce((totals, item) => {
    const code = item.moneda || 'BOB';
    totals[code] = (totals[code] || 0) + item.amount;
    return totals;
  }, {});
}

export default function TimelineNodesView({
  prestamos = [], currency = 'BOB', onSelectLoan, onOpenNewLoan,
  loading = false, error = '', onRetry, backupCount = 0, backupNames = [],
  backupBusy = false, onImportBackup,
}) {
  const [scope, setScope] = useState('30');
  const today = formatDate(new Date());
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 30);
  const horizonKey = formatDate(horizon);

  const schedule = useMemo(() => prestamos.flatMap((loan) => generarCronograma(loan)
    .filter((installment) => !installment.pagado)
    .map((installment) => ({ loan, installment, moneda: loan.moneda || currency })))
    .sort((a, b) => a.installment.fechaVencimiento.localeCompare(b.installment.fechaVencimiento)), [prestamos, currency]);

  const dueNow = schedule.filter(({ installment }) => installment.fechaVencimiento <= today);
  const next30 = schedule.filter(({ installment }) => installment.fechaVencimiento >= today && installment.fechaVencimiento <= horizonKey);
  const activeLoans = prestamos.filter((loan) => generarCronograma(loan).some((installment) => !installment.pagado));
  const peopleCount = agruparPorPersona(prestamos).length;
  const totalsDue = totalByCurrency(dueNow.map(({ installment, moneda }) => ({ amount: installment.total, moneda })));
  const visibleItems = scope === 'overdue'
    ? schedule.filter(({ installment }) => installment.fechaVencimiento < today)
    : scope === 'all'
      ? schedule
      : schedule.filter(({ installment }) => installment.fechaVencimiento <= horizonKey);

  const totalsLabel = Object.entries(totalsDue);

  return (
    <main className="flex-1 min-h-0 overflow-y-auto custom-scroll bg-[#f5f7f5] text-slate-900 dark:bg-[#111713] dark:text-slate-100">
      <div className="mx-auto w-full max-w-[1440px] space-y-7 px-5 py-7 sm:px-8 sm:py-9">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-emerald-800 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Resumen de cartera</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Control de préstamos</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">Personas, contratos y vencimientos en un solo lugar. Cada pago y cada nota queda asociado a su préstamo.</p>
          </div>
          <button onClick={onOpenNewLoan} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#193a2b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24503b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"><Plus className="h-4 w-4" />Registrar préstamo</button>
        </section>

        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-300/15 dark:bg-rose-400/10 dark:text-rose-100"><span>{error}</span><button onClick={onRetry} className="font-semibold underline underline-offset-4">Volver a intentar</button></div>}

        {backupCount > 0 && !loading && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-300/15 dark:bg-amber-400/10"><h2 className="font-semibold text-amber-950 dark:text-amber-100">Respaldo local encontrado en este dispositivo</h2><p className="mt-1 text-sm leading-5 text-amber-900/80 dark:text-amber-100/80">Hay {backupCount} registros —{backupNames.join(', ')}{backupCount > backupNames.length ? ', …' : ''}— que todavía no aparecen en la cartera en línea. Revisa los nombres antes de importarlos.</p><button disabled={backupBusy} onClick={onImportBackup} className="mt-3 rounded-lg bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-60 dark:bg-amber-100 dark:text-amber-950">{backupBusy ? 'Importando…' : `Importar ${backupCount} registros`}</button></section>}

        <section aria-label="Resumen" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_-18px_rgba(15,23,42,.25)] dark:border-white/8 dark:bg-[#19201b]">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Personas</span><UsersRound className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /></div>
            <strong className="mt-3 block text-3xl font-semibold tracking-tight">{peopleCount}</strong><span className="mt-1 block text-xs text-slate-400">Con uno o más contratos</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_-18px_rgba(15,23,42,.25)] dark:border-white/8 dark:bg-[#19201b]">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Préstamos activos</span><FileText className="h-4 w-4 text-slate-400" /></div>
            <strong className="mt-3 block text-3xl font-semibold tracking-tight">{activeLoans.length}</strong><span className="mt-1 block text-xs text-slate-400">Contratos con cuotas pendientes</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_-18px_rgba(15,23,42,.25)] dark:border-white/8 dark:bg-[#19201b]">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Vencidos / hoy</span><AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" /></div>
            <strong className="mt-3 block text-3xl font-semibold tracking-tight">{dueNow.length}</strong>
            <span className="mt-1 block truncate text-xs text-slate-400">{totalsLabel.length ? totalsLabel.map(([code, amount]) => money(amount, code)).join(' · ') : 'Sin pagos vencidos'}</span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-[#eaf4ed] p-5 dark:border-emerald-300/10 dark:bg-[#1b2b20]">
            <div className="flex items-center justify-between"><span className="text-sm text-emerald-900/70 dark:text-emerald-100/70">Próximos 30 días</span><CalendarDays className="h-4 w-4 text-emerald-800 dark:text-emerald-300" /></div>
            <strong className="mt-3 block text-3xl font-semibold tracking-tight text-emerald-950 dark:text-emerald-50">{next30.length}</strong><span className="mt-1 block text-xs text-emerald-900/60 dark:text-emerald-100/60">Cuotas programadas</span>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-32px_rgba(15,23,42,.35)] dark:border-white/8 dark:bg-[#171d19]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/8 sm:px-6">
            <div><h2 className="font-semibold tracking-tight">Agenda de cobros</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Revisa cada vencimiento y abre el contrato para registrar el pago o una nota.</p></div>
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5" role="tablist" aria-label="Filtrar agenda">
              {[['30', '30 días'], ['overdue', 'Vencidos'], ['all', 'Todos']].map(([value, label]) => <button key={value} role="tab" aria-selected={scope === value} onClick={() => setScope(value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${scope === value ? 'bg-white text-slate-900 shadow-sm dark:bg-[#2b382f] dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>{label}</button>)}
            </div>
          </div>

          {loading ? <div className="px-6 py-16 text-center text-sm text-slate-500">Cargando tus préstamos…</div> : visibleItems.length === 0 ? (
            <div className="px-6 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300"><CheckCircle2 className="h-5 w-5" /></div><h3 className="mt-4 font-semibold">{prestamos.length ? 'Todo al día' : 'Tu cartera está vacía'}</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{prestamos.length ? 'No hay cuotas en este rango. Los próximos pagos aparecerán aquí.' : 'Registra el primer préstamo para empezar a controlar personas, contratos y fechas.'}</p>{!prestamos.length && <button onClick={onOpenNewLoan} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#193a2b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#24503b]"><Plus className="h-4 w-4" />Registrar préstamo</button>}</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/8">
              {visibleItems.map(({ loan, installment, moneda }, index) => {
                const overdue = installment.fechaVencimiento < today;
                const dueToday = installment.fechaVencimiento === today;
                return <button key={`${loan.id}-${installment.key}-${index}`} onClick={() => onSelectLoan(loan)} className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600/40 dark:hover:bg-white/[.025] sm:grid-cols-[minmax(180px,1.35fr)_minmax(140px,1fr)_minmax(100px,.7fr)_auto] sm:px-6">
                  <div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${overdue ? 'bg-rose-500' : dueToday ? 'bg-amber-500' : 'bg-emerald-500'}`} /><span className="truncate font-medium">{loan.nombre || 'Persona sin nombre'}</span></div><p className="mt-1 truncate pl-4 text-xs text-slate-500 dark:text-slate-400">{loan.titulo_prestamo || 'Préstamo'} · cuota {installment.numero} de {generarCronograma(loan).length}</p></div>
                  <div className="hidden min-w-0 sm:block"><span className="block truncate text-sm font-medium">{dateLabel(installment.fechaVencimiento)}</span><span className="mt-1 block text-xs text-slate-400">CI {loan.ci || 'Sin registrar'}</span></div>
                  <div className="text-right"><span className="block font-semibold tabular-nums">{money(installment.total, moneda)}</span><span className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${overdue ? 'text-rose-600 dark:text-rose-300' : dueToday ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400'}`}><Clock3 className="h-3 w-3" />{overdue ? `${Math.abs(installment.diasRestantes)} días de atraso` : dueToday ? 'Vence hoy' : dateLabel(installment.fechaVencimiento)}</span></div>
                  <ArrowUpRight className="hidden h-4 w-4 text-slate-300 transition group-hover:text-emerald-700 dark:text-slate-500 dark:group-hover:text-emerald-300 sm:block" />
                </button>;
              })}
            </div>
          )}
        </section>

        {!loading && prestamos.length > 0 && <p className="flex items-center gap-2 px-1 text-xs text-slate-400"><UserRound className="h-3.5 w-3.5" />Importes mostrados en la moneda de cada contrato; no se aplica conversión entre monedas.</p>}
      </div>
    </main>
  );
}
