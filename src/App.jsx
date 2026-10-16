import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FolderCard from './components/FolderCard';
import FolderView from './components/FolderView';
import AlertsDrawer from './components/AlertsDrawer';
import NewLoanModal from './components/NewLoanModal';
import ReceiptModal from './components/ReceiptModal';
import { supabase } from './lib/supabaseClient';
import { agruparPorPersona, extraerAlertasAnticipadas, isCuotaPaid } from './lib/amortizacion';
import { loadSettings, saveSettings } from './lib/settings';
import { Search, Plus, AlertCircle, RefreshCw, Folder } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [theme, setTheme] = useState(settings.theme || 'dark');
  const [currency, setCurrency] = useState(settings.currency || 'BOB');
  const [carteraTipo, setCarteraTipo] = useState('otorgados'); // 'otorgados' vs 'recibidos'
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderKey, setSelectedFolderKey] = useState(null);
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

  // Cargar datos de préstamos desde Supabase
  const fetchPrestamos = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('prestamos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setPrestamos(data);
          localStorage.setItem('work_prestamos_cache', JSON.stringify(data));
        } else {
          // Si la tabla está vacía, chequear cache
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
        setPrestamos(JSON.parse(cached));
        return;
      } catch (e) {}
    }
    // Datos iniciales de demostración con la misma estructura
    const mock = [
      {
        id: 'mock-1',
        nombre: 'Carlos Salazar',
        telefono: '70012345',
        ci: '8492019 LP',
        capital: 2100,
        interes: 5,
        plazo_meses: 6,
        inicio: '2026-08-17',
        fin: '2027-02-17',
        estado: 'Activo',
        tipo_prestamo: 'otorgado',
        moneda: currency,
        pagos: ['2026-09', '2026-10'],
        notas: '[TIPO:otorgado]',
      },
      {
        id: 'mock-2',
        nombre: 'Manuel Rodríguez',
        telefono: '71123456',
        ci: '4928102 SC',
        capital: 1500,
        interes: 10,
        plazo_meses: 10,
        inicio: '2026-05-20',
        fin: '2027-03-20',
        estado: 'Activo',
        tipo_prestamo: 'otorgado',
        moneda: currency,
        pagos: ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'],
        notas: '[TIPO:otorgado]',
      },
      {
        id: 'mock-3',
        nombre: 'Don Roberto (Prestamista)',
        telefono: '72234567',
        ci: '1092831 CB',
        capital: 5000,
        interes: 5,
        plazo_meses: 10,
        inicio: '2026-05-23',
        fin: '2027-03-23',
        estado: 'Activo',
        tipo_prestamo: 'recibido',
        moneda: currency,
        pagos: ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'],
        notas: '[TIPO:recibido]',
      },
      {
        id: 'mock-4',
        nombre: 'David Arteaga',
        telefono: '73345678',
        ci: '5829103 LP',
        capital: 2000,
        interes: 5,
        plazo_meses: 4,
        inicio: '2026-08-14',
        fin: '2026-12-14',
        estado: 'Activo',
        tipo_prestamo: 'otorgado',
        moneda: currency,
        pagos: ['2026-09'],
        notas: '[TIPO:otorgado]',
      }
    ];
    setPrestamos(mock);
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

  // Filtrar préstamos por cartera activa: otorgados (cobros) vs recibidos (pagos)
  const prestamosFiltradosPorCartera = useMemo(() => {
    return prestamos.filter((p) => {
      const tipo = p.tipo_prestamo || (p.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado');
      return carteraTipo === 'otorgados' ? tipo === 'otorgado' : tipo === 'recibido';
    });
  }, [prestamos, carteraTipo]);

  // Agrupar en Carpetas
  const carpetas = useMemo(() => {
    return agruparPorPersona(prestamosFiltradosPorCartera);
  }, [prestamosFiltradosPorCartera]);

  // Filtrar carpetas por término de búsqueda
  const carpetasFiltradas = useMemo(() => {
    if (!searchQuery.trim()) return carpetas;
    const q = searchQuery.toLowerCase().trim();
    return carpetas.filter((c) =>
      c.nombre.toLowerCase().includes(q) ||
      (c.telefono && c.telefono.includes(q)) ||
      (c.ci && c.ci.toLowerCase().includes(q))
    );
  }, [carpetas, searchQuery]);

  // Extraer alertas anticipadas para la campana de avisos
  const alertasAnticipadas = useMemo(() => {
    return extraerAlertasAnticipadas(prestamosFiltradosPorCartera);
  }, [prestamosFiltradosPorCartera]);

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

    // Guardar en Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from('prestamos')
          .update({ pagos: newPagos })
          .eq('id', contrato.id);

        if (error) console.error('Error al actualizar pago en Supabase:', error);

        // Registro de auditoría
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
    const monto = customCuota ? customCuota.total : folder.cuotaProxima;
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors duration-200">
      {/* Header Unificado */}
      <Header
        carteraTipo={carteraTipo}
        setCarteraTipo={(t) => {
          setCarteraTipo(t);
          setSelectedFolderKey(null);
        }}
        alertasCount={alertasAnticipadas.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        currency={currency}
        onChangeCurrency={setCurrency}
        onOpenNewLoan={() => setIsNewLoanOpen(true)}
      />

      {/* Banner de Alertas Anticipadas en Pantalla */}
      {alertasAnticipadas.length > 0 && !selectedFolderKey && (
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border-fine)] px-4 lg:px-8 py-2.5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--badge-warn)] animate-pulse"></span>
              <span className="font-semibold text-[var(--text-main)]">Avisos importantes:</span>
              <span className="text-[var(--text-muted)]">
                {alertasAnticipadas[0].nombre} ({alertasAnticipadas[0].labelTiempo})
                {alertasAnticipadas.length > 1 && ` • y ${alertasAnticipadas.length - 1} aviso(s) más`}
              </span>
            </div>
            <button
              onClick={() => setIsAlertsOpen(true)}
              className="text-[var(--text-main)] underline hover:opacity-80 font-medium"
            >
              Ver las {alertasAnticipadas.length} alertas →
            </button>
          </div>
        </section>
      )}

      {/* Contenedor Principal */}
      <main className="flex-1 p-4 lg:p-8 flex justify-center custom-scroll overflow-y-auto">
        <div className="w-full max-w-6xl space-y-6">
          {activeFolder ? (
            /* Vista del Expediente de la Carpeta */
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
          ) : (
            /* Vista General de Todas las Carpetas */
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-main)]">
                    {carteraTipo === 'otorgados'
                      ? 'Personas que te deben (Capital Propio)'
                      : 'Carpetas de Prestamistas (A quién le debes)'}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Toca cualquier carpeta para ver sus cuotas, registrar abonos o enviar recibos
                  </p>
                </div>

                {/* Buscador de Personas */}
                <div className="flex items-center gap-2 card-base bg-[var(--bg-surface)] px-3 py-1.5 w-full sm:w-64">
                  <Search className="w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o CI..."
                    className="bg-transparent text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none w-full"
                  />
                </div>
              </div>

              {/* Cuadrícula de Carpetas */}
              {loading ? (
                <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cargando carpetas de préstamos...</span>
                </div>
              ) : carpetasFiltradas.length === 0 ? (
                <div className="card-base p-12 text-center space-y-3">
                  <Folder className="w-10 h-10 mx-auto text-[var(--text-muted)] opacity-50" />
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    No se encontraron carpetas
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    {searchQuery
                      ? 'No hay registros que coincidan con la búsqueda.'
                      : 'Aún no tienes préstamos en esta categoría. Puedes anotar uno nuevo con el botón superior.'}
                  </p>
                  <button
                    onClick={() => setIsNewLoanOpen(true)}
                    className="btn-base h-9 bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Primer Préstamo</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carpetasFiltradas.map((folder) => (
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
      </main>

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
        <div className="fixed bottom-5 right-5 z-50 bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] px-4 py-2.5 rounded-lg text-xs font-medium card-base shadow-lg animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
