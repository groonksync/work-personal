import React, { useEffect, useState } from 'react';
import { 
  X, MessageSquare, Clock, Plus, Trash2, Tag, 
  CheckCircle2, AlertTriangle, ShieldAlert, Sparkles
} from 'lucide-react';

export default function ExpressNotesModal({
  isOpen,
  onClose,
  loan,
  onSaveNotes,
  onShowToast,
}) {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Prórroga');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(Array.isArray(loan?.notas_express) ? [...loan.notas_express] : []);
    setNewNoteText('');
    setSelectedTag('Prórroga');
  }, [loan?.id, isOpen]);

  if (!isOpen || !loan) return null;

  const availableTags = [
    { label: 'Prórroga', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
    { label: 'Promesa de Pago', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
    { label: 'Incidencia', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
    { label: 'Garantía', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
    { label: 'Acuerdo', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
    { label: 'General', color: 'border-neutral-500/30 text-neutral-300 bg-neutral-500/10' },
  ];

  const quickPhrases = [
    'No pagó este mes por viaje personal, prometió cancelar el 25.',
    'Solicitó prórroga de 1 semana sin recargo por mora.',
    'Abonará mitad de cuota hoy y el saldo al cobrar sueldo.',
    'Acuerdo verbal de refinanciamiento de saldo restante.',
  ];

  const handleAddNote = async () => {
    if (!newNoteText.trim() || saving) return;

    const newNote = {
      id: `note-${Date.now()}`,
      fecha: new Date().toISOString(),
      texto: newNoteText.trim(),
      etiqueta: selectedTag,
    };

    const updated = [newNote, ...notes];
    setSaving(true);
    const saved = await onSaveNotes(loan.id, updated);
    setSaving(false);
    if (saved) {
      setNotes(updated);
      setNewNoteText('');
      if (onShowToast) onShowToast('Nota guardada en este préstamo');
    } else if (onShowToast) onShowToast('No se pudo guardar la nota.');
  };

  const handleDeleteNote = async (noteId) => {
    if (saving) return;
    const updated = notes.filter(n => n.id !== noteId);
    setSaving(true);
    const saved = await onSaveNotes(loan.id, updated);
    setSaving(false);
    if (saved) {
      setNotes(updated);
      if (onShowToast) onShowToast('Nota eliminada');
    } else if (onShowToast) onShowToast('No se pudo eliminar la nota.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col text-zinc-900 dark:text-[#ececec] overflow-hidden max-h-[90vh] transition-colors duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between bg-zinc-50 dark:bg-[#171717] transition-colors duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-[#262626] border border-amber-200 dark:border-[#383838] flex items-center justify-center text-zinc-800 dark:text-white">
              <MessageSquare className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
                Bitácora de Notas Express & Incidencias
              </h3>
              <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1 block">
                Expediente: <strong className="text-zinc-900 dark:text-white">{loan.nombre}</strong> · <strong>{loan.titulo_prestamo || 'Préstamo'}</strong> • {notes.length} registro(s)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333333] text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all border border-zinc-200 dark:border-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario de Entrada Rápida */}
        <div className="p-4 bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-[#2a2a2a] space-y-3 transition-colors duration-150">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block">
              Nueva Nota o Justificación de No Pago
            </label>
            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Escribe el motivo del retraso, acuerdo de prórroga o modificación..."
              className="w-full bg-white dark:bg-[#262626] border border-zinc-300 dark:border-[#383838] focus:border-zinc-400 dark:focus:border-[#555] p-2.5 rounded-lg text-zinc-900 dark:text-white outline-none text-xs leading-relaxed resize-none shadow-2xs"
            />
          </div>

          {/* Selector de Etiqueta */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {availableTags.map(tag => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setSelectedTag(tag.label)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                    selectedTag === tag.label
                      ? `${tag.color} font-semibold ring-1 ring-zinc-400/40 dark:ring-white/20`
                      : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-[#737373] dark:hover:text-white bg-zinc-200/60 dark:bg-[#222]'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddNote}
              disabled={!newNoteText.trim() || saving}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1 shadow-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{saving ? 'Guardando…' : 'Asentar Nota'}</span>
            </button>
          </div>

          {/* Frases Rápidas (Chips de 1 clic) */}
          <div className="pt-1">
            <span className="text-[10px] text-zinc-400 dark:text-[#737373] block mb-1">Motivos rápidos habituales:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewNoteText(phrase)}
                  className="px-2 py-0.5 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-[#242424] dark:hover:bg-[#2e2e2e] text-zinc-600 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white text-[10px] transition-all text-left"
                >
                  {phrase.slice(0, 38)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Muro Cronológico de Notas */}
        <div className="p-4 overflow-y-auto custom-scroll space-y-2.5 max-h-[45vh] text-xs bg-[#f7f7f8] dark:bg-[#1e1e1e]">
          {notes.length === 0 ? (
            <div className="p-8 text-center border border-zinc-200 dark:border-[#2e2e2e] rounded-xl bg-white dark:bg-[#191919] space-y-1.5">
              <MessageSquare className="w-7 h-7 text-zinc-400 dark:text-[#555] mx-auto" />
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Sin notas asentadas</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">
                Registra aquí cualquier justificación o llamada de coordinación con este cliente.
              </p>
            </div>
          ) : (
            notes.map((note) => {
              const tagConfig = availableTags.find(t => t.label === note.etiqueta) || availableTags[0];
              const dateObj = new Date(note.fecha);

              return (
                <div 
                  key={note.id}
                  className="p-3 rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] space-y-1.5 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tagConfig.color}`}>
                      {note.etiqueta}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400 dark:text-[#737373]" />
                        {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={saving}
                        className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:text-[#737373] dark:hover:text-rose-400 dark:hover:bg-[#333]"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-zinc-900 dark:text-white text-xs leading-relaxed font-sans pt-0.5 whitespace-pre-wrap">
                    {note.texto}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-zinc-200 dark:border-[#2e2e2e] bg-zinc-50 dark:bg-[#171717] flex justify-end transition-colors duration-150">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-[#2a2a2a] dark:hover:bg-[#333] text-xs font-medium text-zinc-800 dark:text-white transition-all shadow-2xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
