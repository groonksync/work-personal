import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoanInspectorDrawer from './components/LoanInspectorDrawer';
import TimelineNodesView from './components/TimelineNodesView';
import MobileAppView from './components/MobileAppView';
import FolderCard from './components/FolderCard';
import FolderView from './components/FolderView';
import AlertsDrawer from './components/AlertsDrawer';
import NewLoanModal from './components/NewLoanModal';
import ReceiptModal from './components/ReceiptModal';
import SettingsModal from './components/SettingsModal';
import VoucherManagerModal from './components/VoucherManagerModal';
import ExpressNotesModal from './components/ExpressNotesModal';
import CapitalPaymentModal from './components/CapitalPaymentModal';
import { supabase } from './lib/supabaseClient';
import AuthScreen from './components/AuthScreen';
import { agruparPorPersona, extraerAlertasAnticipadas, isCuotaPaid, generarCronograma } from './lib/amortizacion';
import { loadSettings, saveSettings, defaultTemplates } from './lib/settings';
import { Search, Plus, RefreshCw, Folder as FolderIcon } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError('No se pudo comprobar la sesión. Intenta recargar la página.');
      setSession(data?.session || null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      setAuthError('');
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const sendAccessLink = async (email) => {
    if (!supabase) return;
    setAuthBusy(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setLinkSent(true);
    } catch (error) {
      console.error('No se pudo enviar el enlace de acceso:', error);
      setAuthError('No se pudo enviar el enlace. Verifica el correo autorizado o inténtalo más tarde.');
    } finally {
      setAuthBusy(false);
    }
  };

  if (!supabase) return <AuthScreen configured={false} />;
  if (authLoading) return <div className="grid min-h-screen place-items-center bg-[#f5f7f5] text-sm text-slate-500 dark:bg-[#111713]">Comprobando acceso seguro…</div>;
  if (!session) return <AuthScreen configured onSendLink={sendAccessLink} busy={authBusy} error={authError} sent={linkSent} />;
  return <LoanWorkspace key={session.user.id} session={session} onSignOut={() => supabase.auth.signOut()} />;
}

function LoanWorkspace({ session, onSignOut }) {
  const [settings, setSettings] = useState(loadSettings);
  const [theme, setTheme] = useState(settings.theme || 'dark');
  const [currency, setCurrency] = useState(settings.currency || 'BOB');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' (Img 1) | 'folders' | 'stream' (Img 2)
  const [carteraFiltro, setCarteraFiltro] = useState('todos'); // 'todos' | 'otorgados' | 'recibidos'
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [backupLoans, setBackupLoans] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('work_prestamos_cache') || 'null');
      return Array.isArray(saved) ? saved.filter((loan) => loan?.nombre && Number(loan.capital) > 0 && !String(loan.id || '').startsWith('mock-')) : [];
    } catch { return []; }
  });
  const [backupBusy, setBackupBusy] = useState(false);
  const [selectedFolderKey, setSelectedFolderKey] = useState(null);
  const [selectedLoanForInspector, setSelectedLoanForInspector] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales y Drawers de Auditoría y Control
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLoanForVouchers, setSelectedLoanForVouchers] = useState(null);
  const [selectedLoanForNotes, setSelectedLoanForNotes] = useState(null);
  const [selectedLoanForCapital, setSelectedLoanForCapital] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Inicializar tema visual
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const updated = { ...settings, theme, currency };
    setSettings(updated);
    saveSettings(updated);
  }, [theme, currency]);

  // Cargar datos de préstamos desde Supabase o Caché local
  const fetchPrestamos = async () => {
    setLoading(true);
    setDataError('');
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('prestamos')
          .select('*');

        if (error) throw error;
        const sorted = [...(data || [])].sort((a, b) => String(a.inicio || '').localeCompare(String(b.inicio || '')));
        setPrestamos(sorted.reverse());
      } else {
        setPrestamos([]);
      }
    } catch (err) {
      console.error('No se pudo cargar la cartera:', err);
      setPrestamos([]);
      setDataError('No se pudo cargar la cartera desde la base de datos. Revisa tu conexión e inténtalo otra vez.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Filtrado de préstamos por búsqueda y filtro de cartera
  const prestamosFiltrados = useMemo(() => {
    return prestamos.filter((p) => {
      const tipo = p.tipo_prestamo || (p.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado');
      if (carteraFiltro === 'otorgados' && tipo !== 'otorgado') return false;
      if (carteraFiltro === 'recibidos' && tipo !== 'recibido') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.nombre?.toLowerCase().includes(q);
        const matchCI = p.ci?.toLowerCase().includes(q);
        const matchTel = p.telefono?.includes(q);
        if (!matchName && !matchCI && !matchTel) return false;
      }
      return true;
    });
  }, [prestamos, carteraFiltro, searchQuery]);

  // Conteos para sidebar
  const counts = useMemo(() => {
    const otorgados = prestamos.filter(p => (p.tipo_prestamo || 'otorgado') === 'otorgado').length;
    const recibidos = prestamos.filter(p => p.tipo_prestamo === 'recibido' || p.notas?.includes('[TIPO:recibido]')).length;
    return {
      total: prestamos.length,
      otorgados,
      recibidos,
    };
  }, [prestamos]);

  // Totales financieros
  const { totalCapital, totalRendimiento } = useMemo(() => {
    const totals = {};
    prestamos.forEach((p) => {
      if ((p.tipo_prestamo || 'otorgado') === 'otorgado') {
        const code = p.moneda || currency;
        const c = Number(p.capital) || 0;
        const t = Number(p.interes) || 0;
        totals[code] = totals[code] || { capital: 0, rendimiento: 0 };
        totals[code].capital += c;
        totals[code].rendimiento += Math.round(c * (t / 100) * 100) / 100;
      }
    });
    return { totalCapital: totals, totalRendimiento: totals };
  }, [prestamos, currency]);

  // Agrupar en Carpetas
  const carpetas = useMemo(() => {
    return agruparPorPersona(prestamosFiltrados);
  }, [prestamosFiltrados]);

  // Alertas de vencimientos
  const alertasAnticipadas = useMemo(() => {
    return extraerAlertasAnticipadas(prestamos);
  }, [prestamos]);

  // Carpeta activa seleccionada
  const activeFolder = useMemo(() => {
    if (!selectedFolderKey) return null;
    return carpetas.find((c) => c.key === selectedFolderKey) || null;
  }, [carpetas, selectedFolderKey]);

  const commitLoan = (loanId, patch) => {
    const updated = prestamos.map((loan) => loan.id === loanId ? { ...loan, ...patch } : loan);
    setPrestamos(updated);
    if (selectedLoanForInspector?.id === loanId) setSelectedLoanForInspector({ ...selectedLoanForInspector, ...patch });
    if (selectedLoanForNotes?.id === loanId) setSelectedLoanForNotes({ ...selectedLoanForNotes, ...patch });
    if (selectedLoanForCapital?.id === loanId) setSelectedLoanForCapital({ ...selectedLoanForCapital, ...patch });
    return updated;
  };

  // Registrar un abono de cuota. La interfaz cambia solo después de confirmar el guardado remoto.
  const handlePayCuota = async (contrato, cuota) => {
    const currentPagos = Array.isArray(contrato.pagos) ? [...contrato.pagos] : [];
    if (isCuotaPaid(currentPagos, cuota.key)) return false;
    const newPayment = { key: cuota.key, fecha: new Date().toISOString(), monto: Number(cuota.total) || 0, moneda: contrato.moneda || currency };
    const newPagos = [...currentPagos, newPayment];
    try {
      const { error } = await supabase.from('prestamos').update({ pagos: newPagos }).eq('id', contrato.id).select('id').single();
      if (error) throw error;
      commitLoan(contrato.id, { pagos: newPagos });
      showToast(`Pago de ${newPayment.moneda} ${newPayment.monto} guardado para ${contrato.nombre}`);
      return true;
    } catch (error) {
      console.error('No se pudo guardar el pago:', error);
      showToast('No se guardó el pago. La cartera no se modificó.');
      return false;
    }
  };

  // Guardar un nuevo préstamo
  const handleSaveNewLoan = async (newLoan) => {
    try {
      const { data, error } = await supabase.from('prestamos').insert([{ ...newLoan, user_id: session.user.id }]).select('*').single();
      if (error) throw error;
      setPrestamos((current) => [data, ...current]);
      showToast(`Préstamo guardado para ${data.nombre}`);
      return true;
    } catch (error) {
      console.error('No se pudo registrar el préstamo:', error);
      showToast('No se pudo guardar el préstamo. Revisa la conexión y vuelve a intentar.');
      return false;
    }
  };

  // Guardar una bitácora propia de este préstamo.
  const handleSaveNotes = async (loanId, newNotes) => {
    try {
      const { error } = await supabase.from('prestamos').update({ notas_express: newNotes }).eq('id', loanId).select('id').single();
      if (error) throw error;
      commitLoan(loanId, { notas_express: newNotes });
      return true;
    } catch (error) {
      console.error('No se pudo guardar la nota:', error);
      return false;
    }
  };

  // Registrar Abono Extraordinario a Capital
  const handleConfirmCapitalPayment = async (loanId, nuevoAbono) => {
    const loan = prestamos.find(p => p.id === loanId);
    if (!loan) return;
    const currentAbonos = Array.isArray(loan.abonos_capital) ? loan.abonos_capital : [];
    const updatedAbonos = [...currentAbonos, nuevoAbono];
    try {
      const patch = { abonos_capital: updatedAbonos, metodo_recalculo: nuevoAbono.metodo };
      const { error } = await supabase.from('prestamos').update(patch).eq('id', loanId).select('id').single();
      if (error) throw error;
      commitLoan(loanId, patch);
      showToast(`Abono a capital guardado · ${loan.moneda || currency} ${nuevoAbono.monto}`);
      return true;
    } catch (error) {
      console.error('No se pudo guardar el abono a capital:', error);
      showToast('No se guardó el abono a capital.');
      return false;
    }
  };

  const handleImportLocalBackup = async () => {
    if (!backupLoans.length || prestamos.length || backupBusy || dataError) return;
    setBackupBusy(true);
    const knownColumns = ['nombre', 'ci', 'telefono', 'capital', 'interes', 'inicio', 'fin', 'estado', 'garantia', 'drive_contrato', 'drive_fotos', 'moneda', 'pagos', 'tipo_pago', 'plazo_meses', 'cuenta_bancaria', 'direccion', 'referencias', 'ocupacion', 'email', 'foto', 'tipogarantia', 'notas', 'tipoGarantia', 'tipo_prestamo', 'notas_express', 'abonos_capital', 'metodo_recalculo', 'titulo_prestamo', 'fecha_primer_pago'];
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const prepared = backupLoans.map((loan) => {
      const record = Object.fromEntries(knownColumns.filter((key) => loan[key] !== undefined).map((key) => [key, loan[key]]));
      if (uuidPattern.test(loan.id || '')) record.id = loan.id;
      record.user_id = session.user.id;
      return record;
    });
    try {
      const { data, error } = await supabase.from('prestamos').insert(prepared).select('*');
      if (error) throw error;
      setPrestamos(data || []);
      setBackupLoans([]);
      showToast(`${data?.length || 0} préstamos importados y guardados.`);
    } catch (error) {
      console.error('No se pudo importar el respaldo local:', error);
      showToast('La importación no se completó. El respaldo local sigue intacto.');
    } finally {
      setBackupBusy(false);
    }
  };

  // Enviar mensaje de WhatsApp usando plantillas parametrizadas
  const handleSendWhatsApp = (folderOrLoan, customCuota = null) => {
    const telRaw = folderOrLoan.telefono?.replace(/[^0-9]/g, '') || '';
    const tel = telRaw.length === 8 ? `591${telRaw}` : telRaw;
    const monto = customCuota ? customCuota.total : (folderOrLoan.cuotaProxima || 0);
    const loanCurrency = folderOrLoan.moneda || folderOrLoan.contratos?.[0]?.moneda || currency;
    const symbol = loanCurrency === 'BOB' ? 'Bs. ' : loanCurrency === 'PEN' ? 'S/ ' : '$ ';
    const fecha = customCuota?.fechaVencimiento || new Date().toLocaleDateString();
    
    // Plantilla de recordatorio personalizada
    const templateBase = settings.templates?.recordatorio || defaultTemplates.recordatorio;
    const mensajeTexto = templateBase
      .replace('{nombre}', folderOrLoan.nombre || 'Estimado/a cliente')
      .replace('{monto}', `${symbol}${monto.toLocaleString()}`)
      .replace('{fecha}', fecha)
      .replace('{cuota}', customCuota?.numero ? `#${customCuota.numero}` : 'programada')
      .replace('{banco_info}', settings.bankAccountInfo || 'Transferencia / QR')
      .replace('{saldo}', `${symbol}${folderOrLoan.totalAdeudado || monto}`);

    const encoded = encodeURIComponent(mensajeTexto);

    if (tel) {
      window.open(`https://wa.me/${tel}?text=${encoded}`, '_blank');
    } else {
      navigator.clipboard.writeText(mensajeTexto).then(() => showToast('Mensaje de WhatsApp copiado al portapapeles')).catch(() => showToast('No se pudo copiar el mensaje.'));
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-[#f7f7f8] text-[#171717] dark:bg-[#212121] dark:text-[#ececec] font-sans antialiased transition-colors duration-150">
      
      {/* ========================================================================= */}
      {/* VISTA MÓVIL ESPECIALIZADA (DETECCIÓN AUTOMÁTICA EN DISPOSITIVOS MÓVILES)  */}
      {/* ========================================================================= */}
      <div className="flex md:hidden w-full h-full flex-col overflow-hidden">
        <MobileAppView
          prestamos={prestamos}
          currency={currency}
          theme={theme}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
          onOpenNewLoan={() => setIsNewLoanOpen(true)}
          onPayCuota={handlePayCuota}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSignOut={onSignOut}
          onOpenVouchers={(loan) => setSelectedLoanForVouchers(loan)}
          onOpenExpressNotes={(loan) => setSelectedLoanForNotes(loan)}
          loading={loading}
          error={dataError}
          onRetry={fetchPrestamos}
          backupCount={!prestamos.length ? backupLoans.length : 0}
          backupNames={backupLoans.slice(0, 3).map((loan) => loan.nombre)}
          backupBusy={backupBusy}
          onImportBackup={handleImportLocalBackup}
        />
      </div>

      {/* ========================================================================= */}
      {/* VISTA ESCRITORIO (100% INTACTA, PANTALLA COMPLETA, ESTILO CHATGPT)         */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full h-full overflow-hidden">
        
        {/* 1. SIDEBAR IZQUIERDO UNIFICADO (PANTALLA COMPLETA, ESTILO CHATGPT) */}
        <Sidebar
          viewMode={viewMode}
          setViewMode={(mode) => {
            setViewMode(mode);
            setSelectedFolderKey(null);
          }}
          carteraFiltro={carteraFiltro}
          setCarteraFiltro={setCarteraFiltro}
          counts={counts}
          totalCapital={totalCapital}
          totalRendimiento={totalRendimiento}
          currency={currency}
          setCurrency={setCurrency}
          theme={theme}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          alertasCount={alertasAnticipadas.length}
          onOpenNewLoan={() => setIsNewLoanOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSignOut={onSignOut}
        />

        {/* 2. ÁREA DE TRABAJO PRINCIPAL (EXTENSIÓN COMPLETA, ESTILO CHATGPT) */}
        <div className="flex-1 h-screen flex flex-col overflow-hidden bg-[#f7f7f8] dark:bg-[#212121] relative transition-colors duration-150">
          
          {/* TOPBAR UNIFICADA (UNA SOLA CABECERA) */}
          <Topbar
            viewMode={viewMode}
            breadcrumb={
              activeFolder 
                ? `Expediente › ${activeFolder.nombre}`
                : viewMode === 'timeline' 
                  ? 'Cronograma de Vencimientos' 
                  : viewMode === 'folders' 
                    ? 'Expedientes por Persona' 
                    : 'Flujo Diario'
            }
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenNewLoan={() => setIsNewLoanOpen(true)}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            alertasCount={alertasAnticipadas.length}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSignOut={onSignOut}
          />

          {/* 3. LIENZO CENTRAL A PANTALLA COMPLETA */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {activeFolder ? (
              /* Vista del Expediente de la Carpeta */
              <div className="flex-1 overflow-y-auto custom-scroll p-6">
                <FolderView
                  folder={activeFolder}
                  currency={currency}
                  onBack={() => setSelectedFolderKey(null)}
                  onPayCuota={(contrato, cuota) => handlePayCuota(contrato, cuota)}
                  onOpenReceipt={(folder, contrato, cuota) =>
                    setReceiptData({ folder, contrato, cuota })
                  }
                  onSendWhatsApp={handleSendWhatsApp}
                  onOpenVouchers={(contrato) => setSelectedLoanForVouchers(contrato)}
                  onOpenExpressNotes={(contrato) => setSelectedLoanForNotes(contrato)}
                  onOpenCapitalPayment={(contrato) => setSelectedLoanForCapital(contrato)}
                  defaultDriveUrl={settings.googleDriveUrl}
                />
              </div>
            ) : viewMode !== 'folders' ? (
              <TimelineNodesView
                prestamos={prestamosFiltrados}
                currency={currency}
                onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
                onOpenNewLoan={() => setIsNewLoanOpen(true)}
                loading={loading}
                error={dataError}
                onRetry={fetchPrestamos}
                backupCount={!prestamos.length ? backupLoans.length : 0}
                backupNames={backupLoans.slice(0, 3).map((loan) => loan.nombre)}
                backupBusy={backupBusy}
                onImportBackup={handleImportLocalBackup}
              />
            ) : (
              /* VISTA CUADRÍCULA DE EXPEDIENTES (CARPETAS) */
              <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                      {carteraFiltro === 'recibidos' ? 'Carpetas de Prestamistas' : 'Carpetas de Prestatarios'}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-[#8e909f]">
                      Selecciona una carpeta para ver contratos, amortizaciones y recibos
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-[#8e909f] font-mono">
                    {carpetas.length} carpetas activas
                  </span>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-xs text-zinc-500 dark:text-[#a3a3a3] flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-800 dark:text-white" />
                    <span>Cargando expedientes...</span>
                  </div>
                ) : carpetas.length === 0 ? (
                  <div className="p-16 text-center space-y-3 border border-zinc-200 dark:border-[#333333] rounded-xl bg-white dark:bg-[#262626]">
                    <FolderIcon className="w-10 h-10 mx-auto text-zinc-400 dark:text-[#737373]" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">No hay expedientes</h3>
                    <p className="text-xs text-zinc-500 dark:text-[#a3a3a3] max-w-sm mx-auto">
                      {searchQuery ? 'No hay resultados que coincidan con la búsqueda.' : 'Crea un primer préstamo con el botón superior.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {carpetas.map((folder) => (
                      <FolderCard
                        key={folder.key}
                        folder={folder}
                        currency={currency}
                        onSelect={() => setSelectedFolderKey(folder.key)}
                        onQuickPay={(f) => {
                          const contrato = f.contratos[0];
                          if (contrato) {
                            const cuota = { key: f.fechaProxima || 'cuota-rapida', label: 'Cuota Inmediata', total: f.cuotaProxima };
                            handlePayCuota(contrato, cuota);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 4. DRAWER / BOTTOM SHEET INSPECTOR (PARA MÓVIL Y ESCRITORIO) */}
      {selectedLoanForInspector && (
        <LoanInspectorDrawer
          loan={selectedLoanForInspector}
          onClose={() => setSelectedLoanForInspector(null)}
          currency={currency}
          onPayCuota={(loan, cuota) => {
            handlePayCuota(loan, cuota);
          }}
          onOpenReceipt={(loan, cuota) => {
            const folder = carpetas.find(c => c.nombre === loan.nombre) || { nombre: loan.nombre, ci: loan.ci, telefono: loan.telefono };
            setReceiptData({ folder, contrato: loan, cuota });
          }}
          onSendWhatsApp={(loan, cuota) => {
            const folder = carpetas.find(c => c.nombre === loan.nombre) || { nombre: loan.nombre, ci: loan.ci, telefono: loan.telefono };
            handleSendWhatsApp(folder, cuota);
          }}
          onOpenCapitalPayment={(loan) => setSelectedLoanForCapital(loan)}
          onOpenVouchers={(loan) => setSelectedLoanForVouchers(loan)}
          onOpenExpressNotes={(loan) => setSelectedLoanForNotes(loan)}
          defaultDriveUrl={settings.googleDriveUrl}
        />
      )}

      {/* Centro de Alertas Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alertas={alertasAnticipadas}
        currency={currency}
        onPayAlert={(alerta) => {
          const contrato = prestamos.find((p) => p.id === alerta.prestamoId);
          if (contrato) {
            handlePayCuota(contrato, { key: alerta.cuotaKey, label: `Cuota #${alerta.cuotaNumero}`, total: alerta.montoCuota });
          }
        }}
        onSendWhatsAppAlert={(alerta) => {
          const folder = carpetas.find((c) => c.nombre === alerta.nombre);
          if (folder) {
            handleSendWhatsApp(folder, { total: alerta.montoCuota });
          }
        }}
      />

      {/* Modal de Nuevo Préstamo */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        onSave={handleSaveNewLoan}
        currency={currency}
      />

      {/* Modal de Recibo Digital */}
      <ReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        data={receiptData}
        currency={currency}
      />

      {/* Modal de Ajustes y Auditoría */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onShowToast={showToast}
      />

      {/* Modal de Gestión de Comprobantes / Bauchers QR */}
      <VoucherManagerModal
        isOpen={!!selectedLoanForVouchers}
        onClose={() => setSelectedLoanForVouchers(null)}
        loan={selectedLoanForVouchers}
        currency={currency}
        onShowToast={showToast}
      />

      {/* Modal de Bitácora de Notas Express */}
      <ExpressNotesModal
        isOpen={!!selectedLoanForNotes}
        onClose={() => setSelectedLoanForNotes(null)}
        loan={selectedLoanForNotes}
        onSaveNotes={handleSaveNotes}
        onShowToast={showToast}
      />

      {/* Modal de Abono Extraordinario a Capital */}
      <CapitalPaymentModal
        isOpen={!!selectedLoanForCapital}
        onClose={() => setSelectedLoanForCapital(null)}
        loan={selectedLoanForCapital}
        currency={currency}
        onConfirmCapitalPayment={handleConfirmCapitalPayment}
        onShowToast={showToast}
      />

      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-black px-4 py-2.5 rounded-lg text-xs font-semibold shadow-2xl animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

    </div>
  );
}
