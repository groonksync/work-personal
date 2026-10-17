import React, { useEffect, useState } from 'react';
import { Check, Link2, X } from 'lucide-react';

function localDateInput() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addMonths(dateString, amount) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1 + amount, 1);
  target.setDate(Math.min(day, new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

export default function NewLoanModal({ isOpen, onClose, onSave, currency = 'BOB' }) {
  const today = localDateInput();
  const [tipo, setTipo] = useState('otorgado');
  const [nombre, setNombre] = useState('');
  const [titulo, setTitulo] = useState('Préstamo');
  const [telefono, setTelefono] = useState('');
  const [ci, setCi] = useState('');
  const [capital, setCapital] = useState('1000');
  const [interes, setInteres] = useState('10');
  const [plazoMeses, setPlazoMeses] = useState('6');
  const [inicio, setInicio] = useState(today);
  const [fechaPrimerPago, setFechaPrimerPago] = useState(() => addMonths(today, 1));
  const [driveContrato, setDriveContrato] = useState('');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const start = localDateInput();
    setTipo('otorgado'); setNombre(''); setTitulo('Préstamo'); setTelefono(''); setCi('');
    setCapital('1000'); setInteres('10'); setPlazoMeses('6'); setInicio(start);
    setFechaPrimerPago(addMonths(start, 1)); setDriveContrato(''); setNotas(''); setIsSaving(false); setFormError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const capitalNumber = Number(capital) || 0;
  const interestNumber = Number(interes) || 0;
  const termNumber = Number(plazoMeses) || 0;
  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  const installmentEstimate = termNumber > 0 ? capitalNumber / termNumber + capitalNumber * interestNumber / 100 : 0;
  const totalEstimate = installmentEstimate * termNumber;
  const field = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10 dark:border-white/10 dark:bg-white/[.035] dark:text-white dark:focus:border-emerald-400 dark:focus:bg-[#1c241e]';
  const label = 'block text-xs font-medium text-slate-600 dark:text-slate-300';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!nombre.trim()) return setFormError('Escribe el nombre de la persona.');
    if (!capitalNumber || capitalNumber < 0.01) return setFormError('El capital debe ser mayor que cero.');
    if (!Number.isInteger(termNumber) || termNumber < 1 || termNumber > 60) return setFormError('El plazo debe ser de 1 a 60 meses.');
    if (interestNumber < 0 || !Number.isFinite(interestNumber)) return setFormError('La tasa debe ser cero o mayor.');
    if (!inicio || !fechaPrimerPago || fechaPrimerPago < inicio) return setFormError('El primer vencimiento debe ser igual o posterior a la fecha de inicio.');
    if (driveContrato && !/^https:\/\//i.test(driveContrato.trim())) return setFormError('El enlace debe comenzar con https://');

    const loan = {
      nombre: nombre.trim(), titulo_prestamo: titulo.trim() || 'Préstamo', telefono: telefono.trim(), ci: ci.trim(),
      capital: capitalNumber, interes: interestNumber, plazo_meses: termNumber, tipo_prestamo: tipo,
      tipo_pago: 'mensual', moneda: currency, inicio, fecha_primer_pago: fechaPrimerPago,
      fin: addMonths(fechaPrimerPago, termNumber - 1), drive_contrato: driveContrato.trim(),
      estado: 'Activo', pagos: [], notas, notas_express: [], abonos_capital: [], metodo_recalculo: 'reducir_cuota',
    };
    setIsSaving(true);
    try {
      const saved = await onSave(loan);
      if (saved) onClose();
      else setFormError('No se guardó el préstamo. Conservamos lo que escribiste; vuelve a intentarlo.');
    } catch {
      setFormError('No se guardó el préstamo. Conservamos lo que escribiste; vuelve a intentarlo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="new-loan-title" className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-[0_32px_100px_-40px_rgba(0,0,0,.65)] dark:border-white/10 dark:bg-[#171d19] dark:text-slate-100">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-5 dark:border-white/8 sm:px-7">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-800 dark:text-emerald-300">Nuevo contrato</p><h2 id="new-loan-title" className="mt-1 text-lg font-semibold tracking-tight">Registrar préstamo</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">La persona puede tener varios contratos independientes.</p></div>
          <button onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"><X className="h-4 w-4" /></button>
        </header>

        <form onSubmit={handleSubmit} className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {[['otorgado', 'Me deben'], ['recibido', 'Debo yo']].map(([value, labelText]) => <button key={value} type="button" onClick={() => setTipo(value)} className={`h-10 rounded-lg text-sm font-semibold transition ${tipo === value ? 'bg-white text-slate-900 shadow-sm dark:bg-[#2b382f] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{labelText}</button>)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${label} sm:col-span-2`}>Nombre completo *<input required autoFocus maxLength={120} value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Nombre de la persona" className={field} /></label>
            <label className={label}>Referencia de este préstamo<input maxLength={80} value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Ej. Negocio · octubre" className={field} /></label>
            <label className={label}>Teléfono / WhatsApp<input value={telefono} onChange={(event) => setTelefono(event.target.value)} placeholder="Número de contacto" className={field} /></label>
            <label className={label}>CI / identificación<input value={ci} onChange={(event) => setCi(event.target.value)} placeholder="Número de documento" className={field} /></label>
            <label className={label}>Capital ({symbol})<input type="number" min="0.01" step="0.01" required value={capital} onChange={(event) => setCapital(event.target.value)} className={field} /></label>
            <label className={label}>Interés mensual (%)<input type="number" min="0" step="0.01" required value={interes} onChange={(event) => setInteres(event.target.value)} className={field} /></label>
            <label className={label}>Plazo (meses)<input type="number" min="1" max="60" step="1" required value={plazoMeses} onChange={(event) => setPlazoMeses(event.target.value)} className={field} /></label>
            <label className={label}>Fecha de inicio<input type="date" required value={inicio} onChange={(event) => { setInicio(event.target.value); setFechaPrimerPago(addMonths(event.target.value, 1)); }} className={field} /></label>
            <label className={label}>Primer vencimiento<input type="date" required min={inicio} value={fechaPrimerPago} onChange={(event) => setFechaPrimerPago(event.target.value)} className={field} /></label>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">Documento del contrato en Google Drive<div className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-700 focus-within:ring-4 focus-within:ring-emerald-700/10 dark:border-white/10 dark:bg-white/[.035]"><Link2 className="h-4 w-4 shrink-0 text-slate-400" /><input type="url" value={driveContrato} onChange={(event) => setDriveContrato(event.target.value)} placeholder="https://drive.google.com/file/d/..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" /></div><span className="mt-1 block text-[11px] font-normal text-slate-400">Este enlace queda guardado únicamente en este contrato.</span></label>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">Garantía y observaciones iniciales<textarea rows={3} maxLength={2000} value={notas} onChange={(event) => setNotas(event.target.value)} placeholder="Acuerdos, garantía o condiciones del préstamo" className={`${field} h-auto resize-y py-3`} /></label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/80 px-4 py-3.5 dark:border-emerald-100/10 dark:bg-emerald-400/[.07]"><div><p className="text-xs text-emerald-950/70 dark:text-emerald-100/70">Cuota mensual estimada</p><p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-950 dark:text-emerald-50">{symbol} {new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(installmentEstimate)}</p></div><div className="text-right"><p className="text-xs text-emerald-950/70 dark:text-emerald-100/70">Total estimado del plan</p><p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-950 dark:text-emerald-50">{symbol} {new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(totalEstimate)}</p></div></div>
          <p className="text-[11px] leading-5 text-slate-400">Estimación: capital dividido entre cuotas más interés mensual sobre el capital inicial. La app no añade mora automática.</p>
          {formError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800 dark:border-rose-300/15 dark:bg-rose-400/10 dark:text-rose-200">{formError}</p>}
          <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/8"><button type="button" disabled={isSaving} onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">Cancelar</button><button type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#193a2b] px-4 text-sm font-semibold text-white hover:bg-[#24503b] disabled:opacity-60"><Check className="h-4 w-4" />{isSaving ? 'Guardando…' : 'Guardar préstamo'}</button></footer>
        </form>
      </section>
    </div>
  );
}
