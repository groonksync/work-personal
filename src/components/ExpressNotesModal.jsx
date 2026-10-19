import React, { useState } from 'react';
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
  if (!isOpen || !loan) return null;

  const [notes, setNotes] = useState(Array.isArray(loan.notas_express) ? [...loan.notas_express] : []);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Prórroga');

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

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      fecha: new Date().toISOString(),
      texto: newNoteText.trim(),
      etiqueta: selectedTag,
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setNewNoteText('');
    onSaveNotes(loan.id, updated);
    if (onShowToast) onShowToast('Nota Express registrada');
  };

  const handleDeleteNote = (noteId) => {
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    onSaveNotes(loan.id, updated);
    if (onShowToast) onShowToast('Nota eliminada');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#151619] border border-[#222327] rounded-2xl shadow-2xl flex flex-col text-white overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-[#222327] flex items-center justify-between bg-[#111215]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center text-[#3b82f6]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Bitácora de Notas Express & Incidencias
              </h3>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Expediente: <strong className="text-white">{loan.nombre}</strong> • {notes.length} registro(s)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1b1c20] hover:bg-[#202126] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-[#222327]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario de Entrada Rápida */}
        <div className="p-4 bg-[#111215] border-b border-[#222327] space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-semibold text-zinc-400 block">
              Nueva Nota o Justificación de No Pago
            </label>
            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Escribe el motivo del retraso, acuerdo de prórroga o modificación..."
              className="w-full bg-[#1b1c20] border border-[#222327] focus:border-[#2563eb] p-2.5 rounded-xl text-white outline-none text-xs leading-relaxed resize-none shadow-2xs placeholder-zinc-500"
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    selectedTag === tag.label
                      ? `${tag.color} font-semibold ring-1 ring-[#2563eb]/40`
                      : 'border-[#222327] text-zinc-400 hover:text-white bg-[#1b1c20]'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddNote}
              disabled={!newNoteText.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center gap-1 shadow-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Asentar Nota</span>
            </button>
          </div>

          {/* Frases Rápidas (Chips de 1 clic) */}
          <div className="pt-1">
            <span className="text-[10px] text-zinc-400 block mb-1">Motivos rápidos habituales:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewNoteText(phrase)}
                  className="px-2 py-0.5 rounded-lg bg-[#1b1c20] hover:bg-[#202126] border border-[#222327] text-zinc-400 hover:text-white text-[10px] transition-colors text-left"
                >
                  {phrase.slice(0, 38)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Muro Cronológico de Notas */}
        <div className="p-4 overflow-y-auto custom-scroll space-y-2.5 max-h-[45vh] text-xs bg-[#151619]">
          {notes.length === 0 ? (
            <div className="p-8 text-center border border-[#222327] rounded-xl bg-[#1b1c20] space-y-1.5">
              <MessageSquare className="w-7 h-7 text-zinc-500 mx-auto" />
              <h4 className="text-xs font-semibold text-white">Sin notas asentadas</h4>
              <p className="text-[11px] text-zinc-400">
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
                  className="p-3 rounded-xl bg-[#1b1c20] border border-[#222327] space-y-1.5 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${tagConfig.color}`}>
                      {note.etiqueta}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-white text-xs leading-relaxed font-sans pt-0.5 whitespace-pre-wrap">
                    {note.texto}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-[#222327] bg-[#111215] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-xs font-medium text-zinc-300 border border-[#222327] transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
