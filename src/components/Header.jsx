import React from 'react';
import { Bell, Moon, Sun, Plus, Wallet, ShieldAlert, ArrowLeftRight } from 'lucide-react';

export default function Header({
  carteraTipo,
  setCarteraTipo,
  alertasCount,
  onOpenAlerts,
  theme,
  onToggleTheme,
  currency,
  onChangeCurrency,
  onOpenNewLoan,
}) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border-fine)] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Identidad */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] flex items-center justify-center font-bold text-sm">
            W
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-[var(--text-main)] block leading-none">
                WORK
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-fine)]">
                PERSONAL
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-normal">
              Carpetas de Préstamos
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[var(--border-fine)] hidden sm:block"></div>

        {/* Selector de Cartera: Presté vs Me Prestaron */}
        <div className="hidden sm:flex items-center p-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-fine)] gap-1">
          <button
            onClick={() => setCarteraTipo('otorgados')}
            className={`btn-base h-8 px-3 rounded-lg ${
              carteraTipo === 'otorgados'
                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Personas que me deben
          </button>
          <button
            onClick={() => setCarteraTipo('recibidos')}
            className={`btn-base h-8 px-3 rounded-lg ${
              carteraTipo === 'recibidos'
                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Mis Prestamistas (A quién debo)
          </button>
        </div>
      </div>

      {/* Controles de la barra superior */}
      <div className="flex items-center gap-2">
        {/* Selector de Moneda */}
        <select
          value={currency}
          onChange={(e) => onChangeCurrency(e.target.value)}
          className="btn-base h-9 px-2.5 card-base bg-[var(--bg-subtle)] text-[var(--text-main)] text-xs font-mono outline-none cursor-pointer"
        >
          <option value="BOB">Bs. BOB</option>
          <option value="USD">$ USD</option>
          <option value="PEN">S/ PEN</option>
        </select>

        {/* Campana de Notificaciones Anticipadas */}
        <button
          onClick={onOpenAlerts}
          className="btn-base h-9 px-3 card-base bg-[var(--bg-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] relative"
          title="Centro de Alertas con Fecha"
        >
          <Bell className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs font-medium hidden sm:inline">Avisos</span>
          {alertasCount > 0 && (
            <span className="px-1.5 py-0.2 text-[11px] font-mono rounded bg-[var(--badge-warn)] text-black font-bold ml-1">
              {alertasCount}
            </span>
          )}
        </button>

        {/* Toggle Tema */}
        <button
          onClick={onToggleTheme}
          className="btn-base h-9 w-9 p-0 card-base bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          title="Cambiar Modo Claro / Oscuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Botón Nuevo Préstamo */}
        <button
          onClick={onOpenNewLoan}
          className="btn-base h-9 px-3.5 bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Anotar Préstamo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>
    </header>
  );
}
