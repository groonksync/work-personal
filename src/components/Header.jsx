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
  viewMode = 'timeline',
  setViewMode,
}) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border-fine)] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Identidad */}
      <div className="flex items-center gap-4">
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
            <span className="text-[11px] text-[var(--text-muted)] font-normal hidden sm:block">
              Gestor de Préstamos
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[var(--border-fine)] hidden sm:block"></div>

        {/* Conmutador de Vistas de Diseño: Timeline Nodos (Img 1) | Carpetas | Stream Móvil (Img 2) */}
        <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-fine)] gap-1">
          <button
            onClick={() => setViewMode && setViewMode('timeline')}
            className={`btn-base h-7 px-2.5 rounded-md text-xs transition-all ${
              viewMode === 'timeline'
                ? 'bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] shadow-xs font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Timeline Nodos (Inspirado en Imagen 1)"
          >
            <span className="text-purple-400">∿</span>
            <span className="hidden md:inline">Timeline</span>
          </button>

          <button
            onClick={() => setViewMode && setViewMode('folders')}
            className={`btn-base h-7 px-2.5 rounded-md text-xs transition-all ${
              viewMode === 'folders'
                ? 'bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] shadow-xs font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Vista Carpetas de Expediente"
          >
            <span>📁</span>
            <span className="hidden md:inline">Carpetas</span>
          </button>

          <button
            onClick={() => setViewMode && setViewMode('stream')}
            className={`btn-base h-7 px-2.5 rounded-md text-xs transition-all ${
              viewMode === 'stream'
                ? 'bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] shadow-xs font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Stream Vertical con Nodos (Inspirado en Imagen 2)"
          >
            <span className="text-amber-400">⚡</span>
            <span className="hidden md:inline">Stream</span>
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
