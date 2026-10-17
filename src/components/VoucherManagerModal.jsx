import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UploadCloud, Receipt, Trash2, Download, Eye, 
  Calendar, Check, AlertCircle, Plus, FileText, ChevronRight
} from 'lucide-react';
import { compressImage, saveVoucher, getVouchers, deleteVoucher } from '../lib/voucherStorage';

export default function VoucherManagerModal({
  isOpen,
  onClose,
  loan,
  currency = 'BOB',
  onShowToast,
}) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedVoucherForLightbox, setSelectedVoucherForLightbox] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Formulario rápido de comprobante
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [tipoPago, setTipoPago] = useState('QR Simple');
  const fileInputRef = useRef(null);

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  const loanId = loan?.id;

  // Cargar comprobantes
  const loadVouchersList = async () => {
    setLoading(true);
    try {
      if (!loanId) return;
      const list = await getVouchers(loanId);
      setVouchers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !loanId) return;
    setSelectedVoucherForLightbox(null);
    setMonto('');
    setNotas('');
    loadVouchersList();
  }, [isOpen, loanId]);

  if (!isOpen || !loan) return null;

  // Manejar subida de archivo
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      await saveVoucher(loan.id, compressed, {
        monto: monto ? parseFloat(monto) : null,
        moneda: currency,
        tipoPago,
        notas,
        fecha: new Date().toISOString(),
      });

      setMonto('');
      setNotas('');
      if (onShowToast) onShowToast('Comprobante guardado con éxito');
      await loadVouchersList();
    } catch (err) {
      console.error('Error al guardar comprobante:', err);
      alert('Error al procesar la imagen del comprobante.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (voucherId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este comprobante?')) return;
    await deleteVoucher(voucherId, loan.id);
    if (selectedVoucherForLightbox?.id === voucherId) {
      setSelectedVoucherForLightbox(null);
    }
    await loadVouchersList();
    if (onShowToast) onShowToast('Comprobante eliminado');
  };

  const handleDownload = (voucher) => {
    const a = document.createElement('a');
    a.href = voucher.dataUrl;
    a.download = `Voucher-${loan.nombre}-${voucher.fecha.slice(0, 10)}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      
      {/* Contenedor Modal */}
      <div 
        className="w-full max-w-3xl bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col text-zinc-900 dark:text-[#ececec] overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 px-5 border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between bg-zinc-50 dark:bg-[#171717]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
                Bóveda de Comprobantes (Bauchers)
              </h3>
              <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1 block">
                Expediente: <strong className="text-zinc-900 dark:text-white">{loan.nombre}</strong> • {vouchers.length} archivo(s) guardado(s)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-200/70 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333333] text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 overflow-y-auto custom-scroll space-y-5 max-h-[75vh]">
          
          {/* Zona de Carga / Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
              dragActive 
                ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-[#262626]' 
                : 'border-zinc-300 dark:border-[#383838] bg-zinc-50 dark:bg-[#1a1a1a] hover:border-zinc-400 dark:hover:border-[#4d4d4d]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200/80 dark:bg-[#262626] border border-zinc-300 dark:border-[#383838] flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5 text-zinc-600 dark:text-[#8e8e8e]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-white block">
                  Subir nuevo comprobante de pago QR o transferencia
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] block mt-0.5">
                  Arrastra tu captura o selecciona desde tu galería / cámara
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-black font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{uploading ? 'Guardando...' : 'Seleccionar Archivo'}</span>
              </button>
            </div>
          </div>

          {/* Formulario Complementario de Datos del Comprobante */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] text-xs">
            <div>
              <label className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold block mb-1">Monto Abonado</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 300"
                className="w-full bg-white dark:bg-[#1c1c1c] border border-zinc-300 dark:border-[#383838] px-2.5 py-1.5 rounded-lg text-zinc-900 dark:text-white font-mono outline-none text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold block mb-1">Medio de Pago</label>
              <select
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value)}
                className="w-full bg-white dark:bg-[#1c1c1c] border border-zinc-300 dark:border-[#383838] px-2.5 py-1.5 rounded-lg text-zinc-900 dark:text-white outline-none text-xs"
              >
                <option value="QR Simple">QR Simple</option>
                <option value="Transferencia BCP">Transferencia BCP</option>
                <option value="Transferencia Banco Unión">Transferencia Unión</option>
                <option value="Transferencia Fassil / Otro">Otra Transferencia</option>
                <option value="Efectivo en Mano">Efectivo</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold block mb-1">Detalle / Cuota</label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Cuota 4 de Octubre"
                className="w-full bg-white dark:bg-[#1c1c1c] border border-zinc-300 dark:border-[#383838] px-2.5 py-1.5 rounded-lg text-zinc-900 dark:text-white outline-none text-xs"
              />
            </div>
          </div>

          {/* Galería de Comprobantes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#8e8e8e] uppercase tracking-wider block">
                Comprobantes Almacenados ({vouchers.length})
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-[#737373]">
                Haz clic en una imagen para ampliarla en alta definición
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-zinc-400 dark:text-[#8e8e8e]">
                Cargando comprobantes...
              </div>
            ) : vouchers.length === 0 ? (
              <div className="p-12 text-center border border-zinc-200 dark:border-[#2e2e2e] rounded-xl bg-zinc-50 dark:bg-[#191919] space-y-2">
                <Receipt className="w-8 h-8 text-zinc-300 dark:text-[#555555] mx-auto" />
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">No hay comprobantes guardados</h4>
                <p className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] max-w-xs mx-auto">
                  Sube capturas de transferencias o pagos QR para mantener un respaldo inalterable de cada abono.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {vouchers.map((v) => (
                  <div
                    key={v.id}
                    className="group relative rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] hover:border-zinc-400 dark:hover:border-[#4d4d4d] overflow-hidden flex flex-col transition-all shadow-xs"
                  >
                    {/* Miniatura clickeable */}
                    <div
                      onClick={() => setSelectedVoucherForLightbox(v)}
                      className="h-40 bg-zinc-100 dark:bg-[#161616] overflow-hidden relative cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={v.dataUrl}
                        alt="Comprobante"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-250"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-2 rounded-lg bg-zinc-900/90 text-white text-xs flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Ampliar
                        </span>
                      </div>
                    </div>

                    {/* Metadatos */}
                    <div className="p-3 text-xs space-y-1.5 bg-white dark:bg-[#262626] flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                            {v.monto ? `${symbol} ${Number(v.monto).toLocaleString()}` : 'Abono'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#383838] text-zinc-600 dark:text-[#a3a3a3]">
                            {v.tipoPago}
                          </span>
                        </div>
                        {v.notas && (
                          <p className="text-[11px] text-zinc-600 dark:text-[#b4b4b4] mt-1 line-clamp-1">
                            {v.notas}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-[#333333] text-[10px] text-zinc-500 dark:text-[#8e8e8e]">
                        <span className="font-mono">{new Date(v.fecha).toLocaleDateString()}</span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownload(v)}
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-[#333333] text-zinc-600 dark:text-[#d4d4d4] hover:text-zinc-900 dark:hover:text-white"
                            title="Descargar"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v.id)}
                            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 dark:text-[#8e8e8e] hover:text-rose-600 dark:hover:text-rose-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* LIGHTBOX EN PANTALLA COMPLETA */}
      {selectedVoucherForLightbox && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedVoucherForLightbox(null)}
        >
          <div 
            className="w-full max-w-4xl flex items-center justify-between text-white shrink-0 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="text-sm font-bold">{loan.nombre} — Comprobante de Pago</h4>
              <span className="text-xs text-[#a3a3a3] font-mono">
                {selectedVoucherForLightbox.monto ? `${symbol} ${selectedVoucherForLightbox.monto} • ` : ''}
                {new Date(selectedVoucherForLightbox.fecha).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(selectedVoucherForLightbox)}
                className="px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333] text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>
              <button
                onClick={() => setSelectedVoucherForLightbox(null)}
                className="w-8 h-8 rounded-lg bg-[#262626] hover:bg-[#333] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div 
            className="flex-1 flex items-center justify-center overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedVoucherForLightbox.dataUrl}
              alt="Comprobante en detalle"
              className="max-w-full max-h-[80vh] object-contain rounded-lg border border-[#2e2e2e] shadow-2xl"
            />
          </div>

          <div className="text-xs text-[#8e8e8e] py-2">
            Presiona ESC o haz clic en cualquier lugar para cerrar
          </div>
        </div>
      )}

    </div>
  );
}
