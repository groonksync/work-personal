import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

export default function AuthScreen({ configured, onSendLink, busy, error, sent }) {
  const [email, setEmail] = useState('');

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-5 py-10 text-slate-900 dark:bg-[#101512] dark:text-slate-100 sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_-48px_rgba(15,23,42,.45)] dark:border-white/10 dark:bg-[#171d19]">
        <div className="bg-[#193a2b] px-7 py-8 text-white sm:px-9">
          <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><ShieldCheck className="h-5 w-5" /></div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-100/70">Work Personal</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Tu cartera, bajo control.</h1>
          <p className="mt-2 text-sm leading-6 text-emerald-50/75">Accede a tus personas, contratos, vencimientos y notas privadas.</p>
        </div>
        <div className="space-y-5 px-7 py-7 sm:px-9 sm:py-8">
          {!configured ? (
            <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">Falta conectar Supabase en las variables de entorno de este despliegue. La app no abrirá una cartera local de reemplazo.</div>
          ) : sent ? (
            <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"><strong className="block">Revisa tu correo</strong>Enviamos un enlace de acceso si {email} tiene una cuenta autorizada.</div>
          ) : (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSendLink(email.trim()); }}>
              <label className="block text-sm font-medium" htmlFor="owner-email">Correo autorizado</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10 dark:border-white/10 dark:bg-black/20">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <input id="owner-email" autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </div>
              {error && <p role="alert" className="text-sm leading-5 text-rose-600 dark:text-rose-300">{error}</p>}
              <button disabled={busy || !configured} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#193a2b] px-4 text-sm font-semibold text-white transition hover:bg-[#24503b] disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? 'Enviando enlace…' : 'Enviar enlace de acceso'}<ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
          <div className="flex items-start gap-2.5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500 dark:border-white/10 dark:text-slate-400"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /><p>El acceso se valida con Supabase. Los datos financieros no se cargan desde ejemplos ni desde una copia pública.</p></div>
        </div>
      </section>
    </main>
  );
}
