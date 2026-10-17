// Motor Financiero y Matemático de Auditoría de Préstamos
export const DIAS_GRACIA_DEFAULT = 0;

export function toDate(str) {
  if (str instanceof Date) return new Date(str.getFullYear(), str.getMonth(), str.getDate());
  if (!str) return new Date();
  const match = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    const parsed = new Date(str);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diasEntre(fecha1, fecha2) {
  const toUtcDay = (value) => {
    const date = toDate(value);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  };
  return Math.round((toUtcDay(fecha2) - toUtcDay(fecha1)) / 86400000);
}

export function getFechaVencimiento(inicio, mesIndex, fechaPrimerPago = null) {
  const base = toDate(fechaPrimerPago || inicio);
  const monthOffset = fechaPrimerPago ? mesIndex : mesIndex + 1;
  const diaPago = base.getDate();
  const venc = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const ultimoDiaMes = new Date(venc.getFullYear(), venc.getMonth() + 1, 0).getDate();
  const diaSeguro = Math.min(diaPago, ultimoDiaMes);
  venc.setDate(diaSeguro);
  return formatDate(venc);
}

export function generarKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function isCuotaPaid(pagos, key) {
  const arr = Array.isArray(pagos) ? pagos : [];
  return arr.includes(key) || arr.includes(`${key}_ocultado`) || arr.some(p => typeof p === 'object' && p?.key === key);
}

// Genera el cronograma de cuotas mensuales con soporte para abonos a capital
export function generarCronograma(prestamo) {
  if (!prestamo?.id) return [];
  const { inicio, fecha_primer_pago, capital, interes, pagos, plazo_meses, abonos_capital = [], metodo_recalculo = 'reducir_cuota' } = prestamo;
  const tasaInteres = parseFloat(interes) || 0;
  const capitalInicial = parseFloat(capital) || 0;
  const cuotasCount = parseInt(plazo_meses, 10);
  if (prestamo.tipo_pago && prestamo.tipo_pago !== 'mensual') return [];
  if (!Number.isInteger(cuotasCount) || cuotasCount < 1 || !inicio) return [];

  // Calcular abonos extraordinarios a capital
  const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  const totalAbonadoCapital = (Array.isArray(abonos_capital) ? abonos_capital : []).reduce((acc, a) => acc + (parseFloat(a.monto) || 0), 0);
  const saldoCapitalActual = Math.max(0, roundMoney(capitalInicial - totalAbonadoCapital));

  const cuotas = [];
  const hoy = new Date();
  const hoyStr = formatDate(hoy);

  // Cuotas pagadas previamente
  let cuotasPagadasCount = 0;
  let pendingOrdinal = 0;
  for (let mesIndex = 0; mesIndex < cuotasCount; mesIndex++) {
    const fechaVenc = getFechaVencimiento(inicio, mesIndex, fecha_primer_pago);
    const vencDate = toDate(fechaVenc);
    const key = generarKey(vencDate.getFullYear(), vencDate.getMonth());
    if (isCuotaPaid(pagos, key)) {
      cuotasPagadasCount++;
    }
  }

  const cuotasRestantesCount = Math.max(1, cuotasCount - cuotasPagadasCount);

  // Base original (sin abonos)
  const cuotaCapitalOriginal = roundMoney(capitalInicial / cuotasCount);
  const interesMensualOriginal = roundMoney(capitalInicial * (tasaInteres / 100));

  // Con reducir cuota se conserva el plazo; con reducir plazo se conserva
  // el capital periódico original y el saldo termina antes.
  const cuotaCapitalRecalculada = metodo_recalculo === 'reducir_plazo'
    ? cuotaCapitalOriginal
    : roundMoney(saldoCapitalActual / cuotasRestantesCount);
  const interesMensualRecalculado = roundMoney(saldoCapitalActual * (tasaInteres / 100));
  let saldoRestanteConAbono = saldoCapitalActual;

  for (let mesIndex = 0; mesIndex < cuotasCount; mesIndex++) {
    const fechaVenc = getFechaVencimiento(inicio, mesIndex, fecha_primer_pago);
    const vencDate = toDate(fechaVenc);
    const key = generarKey(vencDate.getFullYear(), vencDate.getMonth());
    const pagada = isCuotaPaid(pagos, key);
    if (!pagada && totalAbonadoCapital > 0 && metodo_recalculo === 'reducir_plazo' && saldoRestanteConAbono <= 0) break;

    // Si ya está pagada usa el valor original, si está pendiente y hay abono a capital usa el valor recalculado
    const usaRecalculo = !pagada && totalAbonadoCapital > 0;
    let cuotaCap = usaRecalculo ? cuotaCapitalRecalculada : cuotaCapitalOriginal;
    const cuotaInt = roundMoney(usaRecalculo
      ? metodo_recalculo === 'reducir_plazo' ? saldoRestanteConAbono * (tasaInteres / 100) : interesMensualRecalculado
      : interesMensualOriginal);
    if (usaRecalculo && metodo_recalculo === 'reducir_plazo') {
      cuotaCap = roundMoney(Math.min(cuotaCapitalOriginal, saldoRestanteConAbono));
      saldoRestanteConAbono = roundMoney(Math.max(0, saldoRestanteConAbono - cuotaCap));
    } else if (!pagada && pendingOrdinal === cuotasRestantesCount - 1 && usaRecalculo) {
      cuotaCap = roundMoney(Math.max(0, saldoCapitalActual - cuotaCapitalRecalculada * Math.max(0, cuotasRestantesCount - 1)));
    } else if (mesIndex === cuotasCount - 1 && !usaRecalculo) {
      cuotaCap = roundMoney(Math.max(0, capitalInicial - cuotaCapitalOriginal * Math.max(0, cuotasCount - 1)));
    }
    if (!pagada) pendingOrdinal++;
    cuotaCap = roundMoney(cuotaCap);
    const valorCuota = roundMoney(cuotaCap + cuotaInt);

    let estado = 'pendiente';
    let diasAtraso = 0;
    let diffDays = diasEntre(hoyStr, fechaVenc);

    if (pagada) {
      estado = 'pagado';
    } else if (diffDays < 0) {
      estado = 'vencido';
      diasAtraso = Math.abs(diffDays);
    } else if (diffDays === 0) {
      estado = 'hoy';
    } else if (diffDays <= 3) {
      estado = 'proximo';
    } else {
      estado = 'futuro';
    }

    cuotas.push({
      numero: mesIndex + 1,
      key,
      label: `Cuota ${mesIndex + 1} (${vencDate.toLocaleString('es-ES', { month: 'short', year: 'numeric' })})`,
      fechaVencimiento: fechaVenc,
      capital: cuotaCap,
      interes: cuotaInt,
      total: valorCuota,
      pagado: pagada,
      mora: 0,
      diasAtraso,
      diasRestantes: diffDays,
      estado,
      capitalInsolutoMomento: saldoCapitalActual,
    });
  }

  return cuotas;
}

// Agrupador de préstamos por persona (Carpetas)
export function agruparPorPersona(prestamosList) {
  const groups = {};

  const normalizeIdentity = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '');
  
  (prestamosList || []).forEach(p => {
    const identity = normalizeIdentity(p.ci);
    const key = identity ? `ci:${identity}` : `nombre:${normalizeIdentity(p.nombre) || 'SINNOMBRE'}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        nombre: p.nombre || 'Sin Nombre',
        ci: p.ci || '',
        telefono: p.telefono || '',
        contratos: [],
        totalCapital: 0,
        totalCapitalActual: 0,
        totalAdeudado: 0,
        totalAdeudadoPorMoneda: {},
        totalCapitalPorMoneda: {},
        totalCapitalActualPorMoneda: {},
        cuotasPagadasCount: 0,
        cuotasPendientesCount: 0,
        interesMensual: 0,
        cuotaProxima: 0,
        fechaProxima: null,
        diasParaVencer: 999,
        estadoGlobal: 'Al Día',
        driveUrl: p.drive_contrato || p.drive_url || null,
        tipo_prestamo: p.tipo_prestamo || (p.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado'),
        notasExpressCount: 0,
        vouchersCount: 0,
      };
    }

    groups[key].contratos.push(p);
    const cap = parseFloat(p.capital) || 0;
    const abonosCap = (Array.isArray(p.abonos_capital) ? p.abonos_capital : []).reduce((acc, a) => acc + (parseFloat(a.monto) || 0), 0);
    const capActual = Math.max(0, cap - abonosCap);
    const moneda = p.moneda || 'BOB';

    groups[key].totalCapital += cap;
    groups[key].totalCapitalActual += capActual;
    groups[key].totalCapitalPorMoneda[moneda] = (groups[key].totalCapitalPorMoneda[moneda] || 0) + cap;
    groups[key].totalCapitalActualPorMoneda[moneda] = (groups[key].totalCapitalActualPorMoneda[moneda] || 0) + capActual;
    groups[key].notasExpressCount += (Array.isArray(p.notas_express) ? p.notas_express.length : 0);
    if ((p.drive_contrato || p.drive_url) && !groups[key].driveUrl) {
      groups[key].driveUrl = p.drive_contrato || p.drive_url;
    }

    // Calcular cuotas para este contrato
    const cuotas = generarCronograma(p);
    const cuotasPendientes = cuotas.filter(c => !c.pagado);
    groups[key].cuotasPagadasCount += cuotas.filter(c => c.pagado).length;
    groups[key].cuotasPendientesCount += cuotasPendientes.length;
    const saldoPendiente = cuotasPendientes.reduce((acc, c) => acc + c.total, 0);
    groups[key].totalAdeudado += saldoPendiente;
    groups[key].totalAdeudadoPorMoneda[moneda] = (groups[key].totalAdeudadoPorMoneda[moneda] || 0) + saldoPendiente;

    // Próxima cuota pendiente
    if (cuotasPendientes.length > 0) {
      const prox = cuotasPendientes[0];
      if (prox.diasRestantes < groups[key].diasParaVencer) {
        groups[key].diasParaVencer = prox.diasRestantes;
        groups[key].fechaProxima = prox.fechaVencimiento;
        groups[key].cuotaProxima = prox.total;
        groups[key].monedaProxima = moneda;
      }
    }
  });

  // Evaluar estado global de la carpeta
  Object.values(groups).forEach(g => {
    if (g.diasParaVencer < 0) {
      g.estadoGlobal = 'Atrasado';
    } else if (g.diasParaVencer === 0) {
      g.estadoGlobal = 'Vence Hoy';
    } else if (g.diasParaVencer <= 3) {
      g.estadoGlobal = 'Vence Pronto';
    } else if (g.totalAdeudado === 0 && g.totalCapital > 0) {
      g.estadoGlobal = 'Saldado';
    } else {
      g.estadoGlobal = 'Al Día';
    }
  });

  return Object.values(groups);
}

// Extracción de alertas anticipadas ordenadas por urgencia cronológica
export function extraerAlertasAnticipadas(prestamosList) {
  const alertas = [];
  const hoyStr = formatDate(new Date());

  (prestamosList || []).forEach(p => {
    const cuotas = generarCronograma(p);
    cuotas.filter(c => !c.pagado).forEach(c => {
      let urgencia = 'informativa';
      let labelTiempo = '';

      if (c.diasRestantes < 0) {
        urgencia = 'atrasado';
        labelTiempo = `Atrasado ${Math.abs(c.diasRestantes)} día(s)`;
      } else if (c.diasRestantes === 0) {
        urgencia = 'hoy';
        labelTiempo = 'Vence Hoy (Menos de 24h)';
      } else if (c.diasRestantes === 1) {
        urgencia = 'manana';
        labelTiempo = 'Vence Mañana (24h)';
      } else if (c.diasRestantes <= 5) {
        urgencia = 'proximo';
        labelTiempo = `Faltan ${c.diasRestantes} días (${c.fechaVencimiento})`;
      }

      if (urgencia !== 'informativa') {
        alertas.push({
          id: `${p.id}-${c.key}`,
          prestamoId: p.id,
          nombre: p.nombre,
          telefono: p.telefono,
          moneda: p.moneda || 'BOB',
          cuotaKey: c.key,
          cuotaNumero: c.numero,
          montoCuota: c.total,
          fechaVencimiento: c.fechaVencimiento,
          diasRestantes: c.diasRestantes,
          urgencia,
          labelTiempo,
        });
      }
    });
  });

  // Ordenar: primero atrasados, luego hoy, luego mañana y próximos
  return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
}
