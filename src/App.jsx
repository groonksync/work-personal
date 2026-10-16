import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoanInspectorDrawer from './components/LoanInspectorDrawer';
import TimelineNodesView from './components/TimelineNodesView';
import MobileStreamView from './components/MobileStreamView';
import MobileAppView from './components/MobileAppView';
import FolderCard from './components/FolderCard';
import FolderView from './components/FolderView';
import AlertsDrawer from './components/AlertsDrawer';
import NewLoanModal from './components/NewLoanModal';
import ReceiptModal from './components/ReceiptModal';
import { supabase } from './lib/supabaseClient';
import { agruparPorPersona, extraerAlertasAnticipadas } from './lib/amortizacion';
import { loadSettings, saveSettings } from './lib/settings';
import { allOriginalLoans } from './data/initialLoans';
import { Search, Plus, RefreshCw, Folder as FolderIcon } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [theme, setTheme] = useState(settings.theme || 'dark');
  const [currency, setCurrency] = useState(settings.currency || 'BOB');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' (Img 1) | 'folders' | 'stream' (Img 2)
  const [carteraFiltro, setCarteraFiltro] = useState('todos'); // 'todos' | 'otorgados' | 'recibidos'
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderKey, setSelectedFolderKey] = useState(null);
  const [selectedLoanForInspector, setSelectedLoanForInspector] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales y Drawers
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
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

  // Enviar mensaje de WhatsApp
  const handleSendWhatsApp = (folder, customCuota = null) => {
    const tel = folder.telefono?.replace(/[^0-9]/g, '');
    const monto = customCuota ? customCuota.total : (folder.cuotaProxima || 0);
    const symbol = currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ ';
    const mensaje = encodeURIComponent(
      `Hola ${folder.nombre}, un saludo cordial. Te recordamos que la cuota de tu préstamo por ${symbol}${monto} está programada para su cobro. Por favor haznos llegar el comprobante una vez realizada la transferencia. ¡Muchas gracias!`
    );

    if (tel) {
      window.open(`https://wa.me/${tel}?text=${mensaje}`, '_blank');
    } else {
      navigator.clipboard.writeText(decodeURIComponent(mensaje));
      showToast('Mensaje de WhatsApp copiado al portapapeles');
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-[#212121] text-[#ececec] font-sans antialiased">
      
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
          onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
          onOpenNewLoan={() => setIsNewLoanOpen(true)}
          onPayCuota={handlePayCuota}
          onSendWhatsApp={handleSendWhatsApp}
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
        />

        {/* 2. ÁREA DE TRABAJO PRINCIPAL (EXTENSIÓN COMPLETA, ESTILO CHATGPT) */}
        <div className="flex-1 h-screen flex flex-col overflow-hidden bg-[#212121] relative">
          
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
                />
              </div>
            ) : viewMode === 'timeline' ? (
              /* VISTA CRONOGRAMA CON NODOS (PANTALLA COMPLETA 100% ANCHO) */
              <TimelineNodesView
                prestamos={prestamosFiltrados}
                currency={currency}
                onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
                onOpenNewLoan={() => setIsNewLoanOpen(true)}
              />
            ) : viewMode === 'stream' ? (
              /* VISTA STREAM MÓVIL VERTICAL CON NODOS */
              <div className="flex-1 overflow-y-auto custom-scroll p-6 flex justify-center">
                <MobileStreamView
                  prestamos={prestamosFiltrados}
                  currency={currency}
                  onSelectLoan={(loan) => setSelectedLoanForInspector(loan)}
                  onOpenNewLoan={() => setIsNewLoanOpen(true)}
                  onPayCuota={handlePayCuota}
                />
              </div>
            ) : (
              /* VISTA CUADRÍCULA DE EXPEDIENTES (CARPETAS) */
              <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {carteraFiltro === 'recibidos' ? 'Carpetas de Prestamistas' : 'Carpetas de Prestatarios'}
                    </h2>
                    <p className="text-xs text-[#717382]">
                      Selecciona una carpeta para ver contratos, amortizaciones y recibos
                    </p>
                  </div>
                  <span className="text-xs text-[#8e909f] font-mono">
                    {carpetas.length} carpetas activas
                  </span>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-xs text-[#a3a3a3] flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Cargando expedientes...</span>
                  </div>
                ) : carpetas.length === 0 ? (
                  <div className="p-16 text-center space-y-3 border border-[#333333] rounded-xl bg-[#262626]">
                    <FolderIcon className="w-10 h-10 mx-auto text-[#737373]" />
                    <h3 className="text-sm font-semibold text-white">No hay expedientes</h3>
                    <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
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

      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-black px-4 py-2.5 rounded-lg text-xs font-semibold shadow-2xl animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

    </div>
  );
}
