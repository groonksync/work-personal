import React, { useState } from 'react';
import { 
  X, Shield, Lock, Phone, MessageSquare, Landmark, 
  HardDrive, Check, Save, Sliders, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { defaultSettings, saveSettings } from '../lib/settings';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onShowToast,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'whatsapp' | 'banco' | 'drive' | 'seguridad'
  const [formData, setFormData] = useState({ ...settings });
  const [showAdminPhone, setShowAdminPhone] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(!settings.securityPin);

  const handleSave = () => {
    saveSettings(formData);
    onUpdateSettings(formData);
    if (onShowToast) onShowToast('Configuración y ajustes guardados');
    onClose();
  };

  const verifyPin = () => {
    if (enteredPin === settings.securityPin) {
      setIsUnlocked(true);
    } else {
      alert('PIN de seguridad incorrecto');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col text-[#ececec] overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabecera Modal */}
        <div className="p-4 px-5 border-b border-[#2e2e2e] flex items-center justify-between bg-[#191919]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] border border-[#383838] flex items-center justify-center text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Ajustes y Auditoría del Sistema
              </h3>
              <span className="text-[11px] text-[#8e8e8e] mt-1 block">
                Configuración financiera, WhatsApp y seguridad de datos
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#a3a3a3] hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verificación de PIN si está bloqueado */}
        {!isUnlocked ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] border border-[#383838] flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Panel Protegido por PIN</h4>
              <p className="text-xs text-[#8e8e8e] max-w-xs mx-auto mt-1">
                Ingresa tu PIN de seguridad para acceder a los ajustes administrativos
              </p>
            </div>
            <div className="flex justify-center gap-2 max-w-xs mx-auto">
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Ingresar PIN"
                className="bg-[#262626] border border-[#3a3a3a] px-3 py-2 rounded-lg text-sm text-center text-white tracking-widest outline-none w-36"
                autoFocus
              />
              <button
                onClick={verifyPin}
                className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg active:scale-95 transition-all"
              >
                Desbloquear
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navegación por pestañas */}
            <div className="flex border-b border-[#2e2e2e] bg-[#1a1a1a] px-3 overflow-x-auto custom-scroll no-scrollbar">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#8e8e8e] hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'whatsapp'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#8e8e8e] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Seguro</span>
              </button>

              <button
                onClick={() => setActiveTab('banco')}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'banco'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#8e8e8e] hover:text-white'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Datos de Cobro</span>
              </button>

              <button
                onClick={() => setActiveTab('drive')}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'drive'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#8e8e8e] hover:text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span>Google Drive</span>
              </button>

              <button
                onClick={() => setActiveTab('seguridad')}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'seguridad'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-[#8e8e8e] hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Seguridad & PIN</span>
              </button>
            </div>

            {/* Contenido de la pestaña activa */}
            <div className="p-5 overflow-y-auto custom-scroll space-y-4 max-h-[60vh] text-xs">
              
              {/* TAB 1: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#8e8e8e] block uppercase">
                        Moneda Principal
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full bg-[#262626] border border-[#383838] px-3 py-2 rounded-lg text-white outline-none"
                      >
                        <option value="BOB">Bolivianos (Bs. BOB)</option>
                        <option value="USD">Dólares ($ USD)</option>
                        <option value="PEN">Soles (S/ PEN)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#8e8e8e] block uppercase">
                        Tasa de Interés por Defecto (%)
                      </label>
                      <input
                        type="number"
                        value={formData.defaultInterestRate}
                        onChange={(e) => setFormData({ ...formData, defaultInterestRate: Number(e.target.value) })}
                        className="w-full bg-[#262626] border border-[#383838] px-3 py-2 rounded-lg text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#8e8e8e] block uppercase">
                        Plazo Típico (Meses)
                      </label>
                      <input
                        type="number"
                        value={formData.defaultTermMonths}
                        onChange={(e) => setFormData({ ...formData, defaultTermMonths: Number(e.target.value) })}
                        className="w-full bg-[#262626] border border-[#383838] px-3 py-2 rounded-lg text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#8e8e8e] block uppercase">
                        Avisar Vencimiento con Anticipación (Días)
                      </label>
                      <input
                        type="number"
                        value={formData.reminderDaysBefore}
                        onChange={(e) => setFormData({ ...formData, reminderDaysBefore: Number(e.target.value) })}
                        className="w-full bg-[#262626] border border-[#383838] px-3 py-2 rounded-lg text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333] space-y-2">
                    <span className="text-[11px] font-semibold text-white block">
                      Política de Abonos a Capital (Por Defecto)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, recalculoDefault: 'reducir_cuota' })}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          formData.recalculoDefault === 'reducir_cuota'
                            ? 'bg-[#333333] border-white text-white font-medium'
                            : 'bg-[#212121] border-[#383838] text-[#8e8e8e]'
                        }`}
                      >
                        <span className="block font-semibold text-white text-xs">Reducir Cuota Mensual</span>
                        <span className="text-[10px] text-[#a3a3a3] block mt-0.5">
                          El plazo se mantiene, disminuye el valor a pagar cada mes.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, recalculoDefault: 'reducir_plazo' })}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          formData.recalculoDefault === 'reducir_plazo'
                            ? 'bg-[#333333] border-white text-white font-medium'
                            : 'bg-[#212121] border-[#383838] text-[#8e8e8e]'
                        }`}
                      >
                        <span className="block font-semibold text-white text-xs">Reducir Plazo</span>
                        <span className="text-[10px] text-[#a3a3a3] block mt-0.5">
                          La cuota se mantiene igual, termina de pagar antes de tiempo.
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WHATSAPP SEGURO */}
              {activeTab === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#262626] border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Línea de Trabajo Protegida (WhatsApp)
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
                        Ofuscado & Seguro
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                      Tu número no se expone en texto plano en GitHub. Se utiliza para generar enlaces directos con clientes y enviar respaldos de cobro.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <input
                          type={showAdminPhone ? 'text' : 'password'}
                          value={formData.adminPhone}
                          onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                          placeholder="Ej: 69109766 o +59169109766"
                          className="w-full bg-[#1e1e1e] border border-[#383838] px-3 py-2 rounded-lg text-white font-mono outline-none pr-9 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPhone(!showAdminPhone)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e8e8e] hover:text-white"
                        >
                          {showAdminPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Plantillas de Mensajes */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[11px] font-semibold text-[#8e8e8e] uppercase block tracking-wider">
                      Plantillas de Mensajes Automáticos
                    </span>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white block">
                        Recordatorio Amable (Antes de Vencer)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.templates.recordatorio}
                        onChange={(e) => setFormData({
                          ...formData,
                          templates: { ...formData.templates, recordatorio: e.target.value }
                        })}
                        className="w-full bg-[#262626] border border-[#383838] p-2.5 rounded-lg text-white outline-none resize-none font-sans text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white block">
                        Aviso de Vencimiento (El Mismo Día)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.templates.hoy}
                        onChange={(e) => setFormData({
                          ...formData,
                          templates: { ...formData.templates, hoy: e.target.value }
                        })}
                        className="w-full bg-[#262626] border border-[#383838] p-2.5 rounded-lg text-white outline-none resize-none font-sans text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white block">
                        Confirmación de Abono / Recibo
                      </label>
                      <textarea
                        rows={2}
                        value={formData.templates.recibo}
                        onChange={(e) => setFormData({
                          ...formData,
                          templates: { ...formData.templates, recibo: e.target.value }
                        })}
                        className="w-full bg-[#262626] border border-[#383838] p-2.5 rounded-lg text-white outline-none resize-none font-sans text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DATOS DE COBRO */}
              {activeTab === 'banco' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-[#8e8e8e] block uppercase">
                      Información Bancaria o Instrucciones de QR
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bankAccountInfo}
                      onChange={(e) => setFormData({ ...formData, bankAccountInfo: e.target.value })}
                      placeholder="Ej: Banco BCP Cta: 123456789 a nombre de Carlos Joel / Solicitar QR actualizado"
                      className="w-full bg-[#262626] border border-[#383838] p-3 rounded-lg text-white outline-none resize-none text-xs"
                    />
                    <p className="text-[10px] text-[#737373]">
                      Este texto se insertará automáticamente en la variable {`{banco_info}`} en los mensajes de WhatsApp.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333] space-y-3">
                    <span className="text-xs font-semibold text-white block">
                      Política de Moras por Retraso
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#8e8e8e] block mb-1">Porcentaje de Mora</label>
                        <input
                          type="number"
                          value={formData.moraRate}
                          onChange={(e) => setFormData({ ...formData, moraRate: Number(e.target.value) })}
                          className="w-full bg-[#1e1e1e] border border-[#383838] px-3 py-2 rounded-lg text-white outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#8e8e8e] block mb-1">Tipo de Cálculo</label>
                        <select
                          value={formData.moraTipo}
                          onChange={(e) => setFormData({ ...formData, moraTipo: e.target.value })}
                          className="w-full bg-[#1e1e1e] border border-[#383838] px-3 py-2 rounded-lg text-white outline-none"
                        >
                          <option value="diaria">% Diario sobre Cuota</option>
                          <option value="fija">% Fijo una sola vez</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GOOGLE DRIVE */}
              {activeTab === 'drive' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#262626] border border-sky-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        Carpeta Raíz de Documentos en Google Drive
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                      Pega el enlace de tu carpeta de Google Drive donde tienes almacenados los contratos escaneados, pagarés y garantías.
                    </p>
                    <input
                      type="url"
                      value={formData.googleDriveUrl}
                      onChange={(e) => setFormData({ ...formData, googleDriveUrl: e.target.value })}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full bg-[#1e1e1e] border border-[#383838] px-3 py-2 rounded-lg text-white font-mono outline-none text-xs"
                    />
                  </div>

                  <p className="text-[11px] text-[#737373] leading-relaxed">
                    Además de la carpeta principal, podrás asignar un enlace específico de Google Drive a cada prestatario individualmente desde su expediente.
                  </p>
                </div>
              )}

              {/* TAB 5: SEGURIDAD & PIN */}
              {activeTab === 'seguridad' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#262626] border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Bloqueo Administrativo con PIN
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                      Establece un código PIN de 4 a 6 dígitos para restringir el acceso a este panel de configuración y proteger tus datos financieros. Si lo dejas en blanco, el panel estará libre.
                    </p>
                    <div className="w-48">
                      <input
                        type="password"
                        maxLength={6}
                        value={formData.securityPin}
                        onChange={(e) => setFormData({ ...formData, securityPin: e.target.value })}
                        placeholder="Sin PIN (Libre)"
                        className="w-full bg-[#1e1e1e] border border-[#383838] px-3 py-2 rounded-lg text-white font-mono text-center tracking-widest outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Pie de Acciones */}
            <div className="p-4 px-5 border-t border-[#2e2e2e] bg-[#191919] flex items-center justify-between">
              <span className="text-[11px] text-[#737373]">
                Los cambios se aplican al instante
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-[#262626] hover:bg-[#303030] text-xs font-medium text-[#d4d4d4] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
