import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoanInspectorDrawer from './components/LoanInspectorDrawer';
import TimelineNodesView from './components/TimelineNodesView';
import MobileStreamView from './components/MobileStreamView';
import MobileAppView from './components/MobileAppView';
import FolderCard from './components/FolderCard';
import FolderView from './components/FolderView';
import FoldersWorkspaceView from './components/FoldersWorkspaceView';
import AlertsDrawer from './components/AlertsDrawer';
import NewLoanModal from './components/NewLoanModal';
import ReceiptModal from './components/ReceiptModal';
import SettingsModal from './components/SettingsModal';
import VoucherManagerModal from './components/VoucherManagerModal';
import ExpressNotesModal from './components/ExpressNotesModal';
import CapitalPaymentModal from './components/CapitalPaymentModal';
import ContractExtensionModal from './components/ContractExtensionModal';
import LoanSimulatorModal from './components/LoanSimulatorModal';
import { supabase } from './lib/supabaseClient';
import { agruparPorPersona, extraerAlertasAnticipadas } from './lib/amortizacion';
import { loadSettings, saveSettings, defaultTemplates } from './lib/settings';
import { allOriginalLoans } from './data/initialLoans';
import { Search, Plus, RefreshCw, Folder as FolderIcon } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [theme, setTheme] = useState(settings.theme || 'dark');
  const [currency, setCurrency] = useState(settings.currency || 'BOB');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' (Cronograma Principal) | 'folders' (Carpetas) | 'stream' (Flujo Diario)
  const [carteraFiltro, setCarteraFiltro] = useState('todos'); // 'todos' | 'otorgados' | 'recibidos'
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderKey, setSelectedFolderKey] = useState(null);
  const [selectedLoanForInspector, setSelectedLoanForInspector] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales y Drawers de Auditoría y Control
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedLoanForExtension, setSelectedLoanForExtension] = useState(null);
  const [newLoanPrefill, setNewLoanPrefill] = useState(null);
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
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('prestamos')
          .select('*');

        if (error) throw error;
        if (data && data.length > 0) {
          const sorted = [...data].sort((a, b) => {
            const dateA = String(a.inicio || a.id || '');
            const dateB = String(b.inicio || b.id || '');
            return dateB.localeCompare(dateA);
          });
          setPrestamos(sorted);
          localStorage.setItem('work_prestamos_cache', JSON.stringify(sorted));
        } else {
          loadCacheOrMock();
        }
      } else {
        loadCacheOrMock();
      }
    } catch (err) {
      console.warn('Error al conectar con Supabase, usando datos en caché:', err);
      loadCacheOrMock();
    } finally {
      setLoading(false);
    }
  };

  const loadCacheOrMock = () => {
    const cached = localStorage.getItem('work_prestamos_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(p => p.id?.startsWith('mock-'))) {
          setPrestamos(parsed);
          return;
        }
      } catch (e) {}
    }
    setPrestamos(allOriginalLoans);
    localStorage.setItem('work_prestamos_cache', JSON.stringify(allOriginalLoans));
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
    let cap = 0;
    let rend = 0;
    prestamos.forEach((p) => {
      if ((p.tipo_prestamo || 'otorgado') === 'otorgado') {
        const c = Number(p.capital) || 0;
        const t = Number(p.interes) || 0;
        cap += c;
        rend += Math.round(c * (t / 100));
      }
    });
    return { totalCapital: cap || 380200, totalRendimiento: rend || 23220 };
  }, [prestamos]);

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

  // Registrar un abono de cuota
  const handlePayCuota = async (contrato, cuota) => {
    const currentPagos = Array.isArray(contrato.pagos) ? [...contrato.pagos] : [];
    if (currentPagos.includes(cuota.key)) return;

    const newPagos = [...currentPagos, cuota.key];
    const updatedPrestamos = prestamos.map((p) =>
      p.id === contrato.id ? { ...p, pagos: newPagos } : p
    );
    setPrestamos(updatedPrestamos);
    localStorage.setItem('work_prestamos_cache', JSON.stringify(updatedPrestamos));

    // Actualizar el préstamo seleccionado en el inspector si está abierto
    if (selectedLoanForInspector && selectedLoanForInspector.id === contrato.id) {
      setSelectedLoanForInspector({ ...selectedLoanForInspector, pagos: newPagos });
    }

    // Guardar en Supabase
    if (supabase) {
      try {
        await supabase
          .from('prestamos')
          .update({ pagos: newPagos })
          .eq('id', contrato.id);

        await supabase.from('prestamos_historial').insert([{
          prestamo_id: contrato.id,
          accion: 'PAGO_CUOTA',
          detalle: `Abono de cuota ${cuota.label}: ${cuota.total} ${contrato.moneda || currency}`,
        }]);
      } catch (err) {
        console.warn('Modo offline: Pago registrado localmente');
      }
    }

    showToast(`✅ Abono registrado para ${contrato.nombre}`);
  };

  // Guardar un nuevo préstamo
  const handleSaveNewLoan = async (newLoan) => {
    let savedLoan = { ...newLoan, id: `loan-${Date.now()}` };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('prestamos')
          .insert([newLoan])
          .select();

        if (!error && data && data[0]) {
          savedLoan = data[0];
        }
      } catch (err) {
        console.warn('Guardado en cache local:', err);
      }
    }

    const updated = [savedLoan, ...prestamos];
    setPrestamos(updated);
    localStorage.setItem('work_prestamos_cache', JSON.stringify(updated));
    showToast(`📁 Carpeta creada para ${savedLoan.nombre}`);
  };

  // Guardar Notas Express
  const handleSaveNotes = async (loanId, newNotes) => {
    const updated = prestamos.map(p => p.id === loanId ? { ...p, notas_express: newNotes } : p);
    setPrestamos(updated);
    localStorage.setItem('work_prestamos_cache', JSON.stringify(updated));
    if (selectedLoanForInspector && selectedLoanForInspector.id === loanId) {
      setSelectedLoanForInspector({ ...selectedLoanForInspector, notas_express: newNotes });
    }
    if (supabase) {
      try {
        await supabase.from('prestamos').update({ notas_express: newNotes }).eq('id', loanId);
      } catch (e) {}
    }
  };

  // Registrar Abono Extraordinario a Capital
  const handleConfirmCapitalPayment = async (loanId, nuevoAbono) => {
    const loan = prestamos.find(p => p.id === loanId);
    if (!loan) return;
    const currentAbonos = Array.isArray(loan.abonos_capital) ? loan.abonos_capital : [];
    const updatedAbonos = [...currentAbonos, nuevoAbono];
    const updated = prestamos.map(p => p.id === loanId ? { 
      ...p, 
      abonos_capital: updatedAbonos, 
      metodo_recalculo: nuevoAbono.metodo 
    } : p);
    setPrestamos(updated);
    localStorage.setItem('work_prestamos_cache', JSON.stringify(updated));
    if (selectedLoanForInspector && selectedLoanForInspector.id === loanId) {
      setSelectedLoanForInspector({ 
        ...selectedLoanForInspector, 
        abonos_capital: updatedAbonos, 
        metodo_recalculo: nuevoAbono.metodo 
      });
    }
    if (supabase) {
      try {
        await supabase.from('prestamos').update({
          abonos_capital: updatedAbonos,
          metodo_recalculo: nuevoAbono.metodo
        }).eq('id', loanId);
        await supabase.from('prestamos_historial').insert([{
          prestamo_id: loanId,
          accion: 'ABONO_CAPITAL',
          detalle: `Abono extraordinario a capital: ${nuevoAbono.monto} ${currency}`,
        }]);
      } catch (e) {}
    }
    showToast(`Abono a capital de ${nuevoAbono.monto} ${currency} registrado`);
  };

  // Confirmar prórroga o extensión de contrato
  const handleConfirmExtension = async (payload) => {
    const { loanId, nuevoPlazoMeses, nuevaFechaFin, nuevaTasa, motivo, mesesAgregados } = payload;
    const loan = prestamos.find(p => p.id === loanId);
    if (!loan) return;

    const currentNotes = Array.isArray(loan.notas_express) ? loan.notas_express : [];
    const nuevaNota = {
      id: `ext-${Date.now()}`,
      fecha: new Date().toISOString(),
      texto: `Prórroga de contrato concedida: +${mesesAgregados} mes(es). Nuevo vencimiento: ${nuevaFechaFin}. Motivo: ${motivo}`,
      etiqueta: 'Prórroga',
    };
    const updatedNotes = [nuevaNota, ...currentNotes];

    const updatedLoans = prestamos.map(p => {
      if (p.id === loanId) {
        return {
          ...p,
          plazo_meses: nuevoPlazoMeses,
          fin: nuevaFechaFin,
          interes: nuevaTasa,
          notas_express: updatedNotes,
        };
      }
      return p;
    });

    setPrestamos(updatedLoans);
    localStorage.setItem('work_prestamos_cache', JSON.stringify(updatedLoans));

    if (selectedLoanForInspector && selectedLoanForInspector.id === loanId) {
      setSelectedLoanForInspector({
        ...selectedLoanForInspector,
        plazo_meses: nuevoPlazoMeses,
        fin: nuevaFechaFin,
        interes: nuevaTasa,
        notas_express: updatedNotes,
      });
    }

    if (supabase) {
      try {
        await supabase
          .from('prestamos')
          .update({
            plazo_meses: nuevoPlazoMeses,
            fin: nuevaFechaFin,
            interes: nuevaTasa,
            notas_express: updatedNotes,
          })
          .eq('id', loanId);

        await supabase.from('prestamos_historial').insert([{
          prestamo_id: loanId,
          accion: 'PRORROGA_CONTRATO',
          detalle: `Extensión de plazo por ${mesesAgregados} meses hasta ${nuevaFechaFin}. Motivo: ${motivo}`,
        }]);
      } catch (err) {
        console.warn('Prórroga registrada en modo local');
      }
    }

    showToast(`⏱️ Prórroga confirmada: +${mesesAgregados} mes(es) para ${loan.nombre}`);
  };

  // Actualizar datos del préstamo (ej. Google Drive URL, notas, garantía)
  const handleUpdateLoan = async (updatedLoan) => {
    const updated = prestamos.map(p => p.id === updatedLoan.id ? updatedLoan : p);
    setPrestamos(updated);
    localStorage.setItem('work_prestamos_cache', JSON.stringify(updated));
    if (selectedLoanForInspector && selectedLoanForInspector.id === updatedLoan.id) {
      setSelectedLoanForInspector(updatedLoan);
    }
    if (supabase) {
      try {
        await supabase
          .from('prestamos')
          .update({
            drive_url: updatedLoan.drive_url || null,
            drive_contrato: updatedLoan.drive_contrato || null,
            telefono: updatedLoan.telefono || null,
            ci: updatedLoan.ci || null,
            garantia: updatedLoan.garantia || null,
            notas: updatedLoan.notas || null,
          })
          .eq('id', updatedLoan.id);
      } catch (err) {}
    }
    showToast(`✅ Expediente de ${updatedLoan.nombre} actualizado`);
  };

  // Enviar mensaje de WhatsApp usando plantillas parametrizadas
  const handleSendWhatsApp = (folderOrLoan, customCuota = null) => {
    const telRaw = folderOrLoan.telefono?.replace(/[^0-9]/g, '') || '';
    const tel = telRaw.length === 8 ? `591${telRaw}` : telRaw;
    const monto = customCuota ? customCuota.total : (folderOrLoan.cuotaProxima || 0);
    const symbol = currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ ';
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
      navigator.clipboard.writeText(mensajeTexto);
      showToast('Mensaje de WhatsApp copiado al portapapeles');
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-[#111214] text-[#f3f4f6] font-sans antialiased select-none">
      
      {/* ========================================================================= */}
      {/* VISTA MÓVIL ESPECIALIZADA (DETECCIÓN AUTOMÁTICA EN DISPOSITIVOS MÓVILES)  */}
      {/* ========================================================================= */}
      <div className="flex md:hidden w-full h-full flex-col overflow-hidden">
        <MobileAppView
          prestamos={prestamos}
          carpetas={carpetas}
          alertas={alertasAnticipadas}
          currency={currency}
          setCurrency={setCurrency}
          theme={theme}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
          onOpenNewLoan={() => setIsNewLoanOpen(true)}
          onPayCuota={handlePayCuota}
          onSendWhatsApp={handleSendWhatsApp}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenExtension={(loan) => setSelectedLoanForExtension(loan)}
          onOpenVouchers={(loan) => setSelectedLoanForVouchers(loan)}
          onOpenExpressNotes={(loan) => setSelectedLoanForNotes(loan)}
          onOpenCapitalPayment={(loan) => setSelectedLoanForCapital(loan)}
        />
      </div>

      {/* ========================================================================= */}
      {/* VISTA ESCRITORIO — ESTRUCTURA LIMPIA CON SIDEBAR ÚNICO Y CRONOGRAMA       */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full h-full overflow-hidden">
        
        {/* BARRA LATERAL ÚNICA DE CONTROL Y NAVEGACIÓN */}
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
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#111214] relative">
          
          {/* TOPBAR UNIFICADA */}
          <Topbar
            viewMode={viewMode}
            breadcrumb={
              activeFolder 
                ? `Expediente › ${activeFolder.nombre}`
                : viewMode === 'folders' 
                  ? 'Carpetas de Expedientes' 
                  : viewMode === 'timeline' 
                    ? 'Cronograma de Vencimientos' 
                    : 'Flujo Diario'
            }
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenNewLoan={() => setIsNewLoanOpen(true)}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            alertasCount={alertasAnticipadas.length}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />

          {/* LIENZO CENTRAL */}
          <div className="flex-1 overflow-hidden relative flex flex-col bg-[#111214]">
            {activeFolder ? (
              /* Vista del Expediente de la Carpeta */
              <div className="flex-1 overflow-y-auto custom-scroll p-6 bg-[#111214]">
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
            ) : viewMode === 'folders' ? (
              /* VISTA DE CARPETAS CON LAS TARJETAS 3D (media_1792334706104_4e7dec7a.png) */
              <FoldersWorkspaceView
                carpetas={carpetas}
                prestamos={prestamosFiltrados}
                currency={currency}
                activeCategory={
                  carteraFiltro === 'recibidos'
                    ? 'Por Pagar (Fondeo)'
                    : carteraFiltro === 'otorgados'
                      ? 'Por Cobrar (Cartera)'
                      : 'Todos los Expedientes'
                }
                onSelectFolder={(key) => setSelectedFolderKey(key)}
                onQuickPay={(f) => {
                  const contrato = f.contratos[0];
                  if (contrato) {
                    const cuota = { key: f.fechaProxima || 'cuota-rapida', label: 'Cuota Inmediata', total: f.cuotaProxima };
                    handlePayCuota(contrato, cuota);
                  }
                }}
                onPayCuota={handlePayCuota}
                onSendWhatsApp={handleSendWhatsApp}
                onOpenReceipt={(folder, contrato, cuota) => setReceiptData({ folder, contrato, cuota })}
                onOpenNewLoan={() => setIsNewLoanOpen(true)}
                onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
                loading={loading}
              />
            ) : viewMode === 'timeline' ? (
              /* VISTA CRONOGRAMA CON COLUMNAS POR DÍA Y MATRIZ MENSUAL */
              <TimelineNodesView
                prestamos={prestamosFiltrados}
                currency={currency}
                onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
                onOpenNewLoan={() => setIsNewLoanOpen(true)}
                onPayCuota={handlePayCuota}
                onSendWhatsApp={handleSendWhatsApp}
                onOpenReceipt={(folder, contrato, cuota) =>
                  setReceiptData({ folder, contrato, cuota })
                }
                onOpenSimulator={() => setIsSimulatorOpen(true)}
                onOpenExtension={(loan) => setSelectedLoanForExtension(loan)}
              />
            ) : (
              /* VISTA STREAM MÓVIL VERTICAL CON NODOS */
              <div className="flex-1 overflow-y-auto custom-scroll p-6 flex justify-center bg-[#111214]">
                <MobileStreamView
                  prestamos={prestamosFiltrados}
                  currency={currency}
                  onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
                  onOpenNewLoan={() => setIsNewLoanOpen(true)}
                  onPayCuota={handlePayCuota}
                  onSendWhatsApp={handleSendWhatsApp}
                />
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
          onOpenExtension={(loan) => setSelectedLoanForExtension(loan)}
          onUpdateLoan={handleUpdateLoan}
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
        onClose={() => {
          setIsNewLoanOpen(false);
          setNewLoanPrefill(null);
        }}
        onSave={(nuevoPrestamo) => {
          handleSaveNewLoan(nuevoPrestamo);
          setNewLoanPrefill(null);
        }}
        currency={currency}
        prefill={newLoanPrefill}
      />

      {/* Modal de Prórroga / Extensión de Contrato */}
      <ContractExtensionModal
        isOpen={!!selectedLoanForExtension}
        onClose={() => setSelectedLoanForExtension(null)}
        loan={selectedLoanForExtension}
        currency={currency}
        onConfirmExtension={handleConfirmExtension}
      />

      {/* Modal de Simulador Financiero de Crédito */}
      <LoanSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currency={currency}
        onApplySimulationToNewLoan={(simData) => {
          setNewLoanPrefill(simData);
          setIsSimulatorOpen(false);
          setIsNewLoanOpen(true);
        }}
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
