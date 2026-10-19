// Motor Financiero, Matemático y de Auditoría de Préstamos — Work Personal
export const TASA_MORA_DIARIA = 0.05; // 5% diario
export const DIAS_GRACIA_DEFAULT = 0;

export function toDate(str) {
  if (!str) return new Date();
  const parts = str.split('-');
  if (parts.length !== 3) return new Date();
  const [y, m, d] = parts.map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return new Date();
  return new Date(y, m - 1, d);
}

export function formatDate(d) {
  if (!d || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diasEntre(fecha1, fecha2) {
  const f1 = new Date(fecha1);
  const f2 = new Date(fecha2);
  return Math.floor((f2 - f1) / (1000 * 60 * 60 * 24));
}

export function getFechaVencimiento(inicio, mesIndex) {
  const d = toDate(inicio);
  const diaPago = d.getDate();
  const venc = new Date(d.getFullYear(), d.getMonth() + 1 + mesIndex, 1);
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

// Genera el cronograma de cuotas (soporta tanto 'mensual' como 'diario')
export function generarCronograma(prestamo) {
  if (!prestamo?.id) return [];
  const { 
    inicio, fin, capital, interes, pagos, plazo_meses, 
    tipo_pago = 'mensual', abonos_capital = [], metodo_recalculo = 'reducir_cuota' 
  } = prestamo;

  const tasaInteres = parseFloat(interes) || 0;
  const capitalInicial = parseFloat(capital) || 0;
  const cuotasCount = parseInt(plazo_meses) || 6;
  const hoy = new Date();
  const hoyStr = formatDate(hoy);

  // Soporte para pagos DIARIOS
  if (tipo_pago === 'diario') {
    const totalDias = cuotasCount * 30;
    const interesTotal = Math.round(capitalInicial * (tasaInteres / 100) * cuotasCount * 100) / 100;
    const capitalDiario = capitalInicial / totalDias;
    const interesDiario = interesTotal / totalDias;
    const cuotaDiaria = Math.round((capitalDiario + interesDiario) * 100) / 100;
    const startDate = toDate(inicio);
    const cuotas = [];

    for (let dia = 0; dia < totalDias; dia++) {
      const fechaActual = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + dia + 1);
      if (isNaN(fechaActual.getTime())) continue;
      const key = formatDate(fechaActual);
      const pagada = isCuotaPaid(pagos, key);
      const diffDays = diasEntre(hoyStr, key);

      let estado = 'pendiente';
      let diasAtraso = 0;
      let mora = 0;

      if (pagada) {
        estado = 'pagado';
      } else if (diffDays < 0) {
        estado = 'vencido';
        diasAtraso = Math.abs(diffDays);
        mora = Math.round(cuotaDiaria * TASA_MORA_DIARIA * diasAtraso * 100) / 100;
      } else if (diffDays === 0) {
        estado = 'hoy';
      } else if (diffDays <= 3) {
        estado = 'proximo';
      } else {
        estado = 'futuro';
      }

      cuotas.push({
        numero: dia + 1,
        key,
        label: `Día ${dia + 1} (${fechaActual.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})`,
        fechaVencimiento: key,
        capital: Math.round(capitalDiario),
        interes: Math.round(interesDiario),
        total: Math.round(cuotaDiaria),
        pagado: pagada,
        mora,
        diasAtraso,
        diasRestantes: diffDays,
        estado,
        tipo_pago: 'diario'
      });
    }

    return cuotas;
  }

  // Soporte para pagos SEMANALES (cada 7 días)
  if (tipo_pago === 'semanal') {
    const totalSemanas = cuotasCount * 4;
    const interesTotal = Math.round(capitalInicial * (tasaInteres / 100) * cuotasCount * 100) / 100;
    const capitalSemanal = capitalInicial / totalSemanas;
    const interesSemanal = interesTotal / totalSemanas;
    const cuotaSemanal = Math.round((capitalSemanal + interesSemanal) * 100) / 100;
    const startDate = toDate(inicio);
    const cuotas = [];

    for (let sem = 0; sem < totalSemanas; sem++) {
      const fechaActual = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + ((sem + 1) * 7));
      if (isNaN(fechaActual.getTime())) continue;
      const key = formatDate(fechaActual);
      const pagada = isCuotaPaid(pagos, key);
      const diffDays = diasEntre(hoyStr, key);

      let estado = 'pendiente';
      let diasAtraso = 0;
      let mora = 0;

      if (pagada) {
        estado = 'pagado';
      } else if (diffDays < 0) {
        estado = 'vencido';
        diasAtraso = Math.abs(diffDays);
        mora = Math.round(cuotaSemanal * TASA_MORA_DIARIA * diasAtraso * 100) / 100;
      } else if (diffDays === 0) {
        estado = 'hoy';
      } else if (diffDays <= 3) {
        estado = 'proximo';
      } else {
        estado = 'futuro';
      }

      cuotas.push({
        numero: sem + 1,
        key,
        label: `Semana ${sem + 1} (${fechaActual.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})`,
        fechaVencimiento: key,
        capital: Math.round(capitalSemanal),
        interes: Math.round(interesSemanal),
        total: Math.round(cuotaSemanal),
        pagado: pagada,
        mora,
        diasAtraso,
        diasRestantes: diffDays,
        estado,
        tipo_pago: 'semanal'
      });
    }

    return cuotas;
  }

  // Soporte para pagos QUINCENALES (cada 15 días)
  if (tipo_pago === 'quincenal') {
    const totalQuincenas = cuotasCount * 2;
    const interesTotal = Math.round(capitalInicial * (tasaInteres / 100) * cuotasCount * 100) / 100;
    const capitalQuincenal = capitalInicial / totalQuincenas;
    const interesQuincenal = interesTotal / totalQuincenas;
    const cuotaQuincenal = Math.round((capitalQuincenal + interesQuincenal) * 100) / 100;
    const startDate = toDate(inicio);
    const cuotas = [];

    for (let q = 0; q < totalQuincenas; q++) {
      const fechaActual = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + ((q + 1) * 15));
      if (isNaN(fechaActual.getTime())) continue;
      const key = formatDate(fechaActual);
      const pagada = isCuotaPaid(pagos, key);
      const diffDays = diasEntre(hoyStr, key);

      let estado = 'pendiente';
      let diasAtraso = 0;
      let mora = 0;

      if (pagada) {
        estado = 'pagado';
      } else if (diffDays < 0) {
        estado = 'vencido';
        diasAtraso = Math.abs(diffDays);
        mora = Math.round(cuotaQuincenal * TASA_MORA_DIARIA * diasAtraso * 100) / 100;
      } else if (diffDays === 0) {
        estado = 'hoy';
      } else if (diffDays <= 3) {
        estado = 'proximo';
      } else {
        estado = 'futuro';
      }

      cuotas.push({
        numero: q + 1,
        key,
        label: `Quincena ${q + 1} (${fechaActual.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})`,
        fechaVencimiento: key,
        capital: Math.round(capitalQuincenal),
        interes: Math.round(interesQuincenal),
        total: Math.round(cuotaQuincenal),
        pagado: pagada,
        mora,
        diasAtraso,
        diasRestantes: diffDays,
        estado,
        tipo_pago: 'quincenal'
      });
    }

    return cuotas;
  }

  // Soporte para pagos MENSUALES (con recálculo por abonos extraordinarios a capital)
  const totalAbonadoCapital = abonos_capital.reduce((acc, a) => acc + (parseFloat(a.monto) || 0), 0);
  const saldoCapitalActual = Math.max(0, capitalInicial - totalAbonadoCapital);

  let cuotasPagadasCount = 0;
  for (let mesIndex = 0; mesIndex < cuotasCount; mesIndex++) {
    const fechaVenc = getFechaVencimiento(inicio, mesIndex);
    const vencDate = toDate(fechaVenc);
    const key = generarKey(vencDate.getFullYear(), vencDate.getMonth());
    if (isCuotaPaid(pagos, key)) {
      cuotasPagadasCount++;
    }
  }

  const cuotasRestantesCount = Math.max(1, cuotasCount - cuotasPagadasCount);
  const cuotaCapitalRecalculada = saldoCapitalActual / cuotasRestantesCount;
  const interesMensualRecalculado = Math.round(saldoCapitalActual * (tasaInteres / 100));
  const valorCuotaRecalculada = Math.round(cuotaCapitalRecalculada + interesMensualRecalculado);

  const cuotaCapitalOriginal = capitalInicial / cuotasCount;
  const interesMensualOriginal = Math.round(capitalInicial * (tasaInteres / 100));
  const valorCuotaOriginal = Math.round(cuotaCapitalOriginal + interesMensualOriginal);

  const cuotas = [];
  for (let mesIndex = 0; mesIndex < cuotasCount; mesIndex++) {
    const fechaVenc = getFechaVencimiento(inicio, mesIndex);
    const vencDate = toDate(fechaVenc);
    const key = generarKey(vencDate.getFullYear(), vencDate.getMonth());
    const pagada = isCuotaPaid(pagos, key);

    const usaRecalculo = !pagada && totalAbonadoCapital > 0;
    const cuotaCap = Math.round(usaRecalculo ? cuotaCapitalRecalculada : cuotaCapitalOriginal);
    const cuotaInt = usaRecalculo ? interesMensualRecalculado : interesMensualOriginal;
    const valorCuota = usaRecalculo ? valorCuotaRecalculada : valorCuotaOriginal;

    let estado = 'pendiente';
    let diasAtraso = 0;
    let mora = 0;
    let diffDays = diasEntre(hoyStr, fechaVenc);

    if (pagada) {
      estado = 'pagado';
    } else if (diffDays < 0) {
      estado = 'vencido';
      diasAtraso = Math.abs(diffDays);
      mora = Math.round(valorCuota * TASA_MORA_DIARIA * diasAtraso * 100) / 100;
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
      mora,
      diasAtraso,
      diasRestantes: diffDays,
      estado,
      capitalInsolutoMomento: saldoCapitalActual,
      tipo_pago: 'mensual'
    });
  }

  return cuotas;
}

// Agrupador de préstamos por persona (Carpetas de Expedientes)
export function agruparPorPersona(prestamosList) {
  const groups = {};
  
  (prestamosList || []).forEach(p => {
    const key = p.nombre ? p.nombre.trim().toLowerCase() : 'sin-nombre';
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
        interesMensual: 0,
        cuotaProxima: 0,
        fechaProxima: null,
        diasParaVencer: 999,
        estadoGlobal: 'Al Día',
        driveUrl: p.drive_url || p.drive_contrato || null,
        tipo_prestamo: p.tipo_prestamo || (p.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado'),
        notasExpressCount: 0,
        vouchersCount: 0,
      };
    }

    groups[key].contratos.push(p);
    const cap = parseFloat(p.capital) || 0;
    const abonosCap = (p.abonos_capital || []).reduce((acc, a) => acc + (parseFloat(a.monto) || 0), 0);
    const capActual = Math.max(0, cap - abonosCap);

    groups[key].totalCapital += cap;
    groups[key].totalCapitalActual += capActual;
    groups[key].notasExpressCount += (p.notas_express || []).length;
    if ((p.drive_url || p.drive_contrato) && !groups[key].driveUrl) {
      groups[key].driveUrl = p.drive_url || p.drive_contrato;
    }

    const cuotas = generarCronograma(p);
    const cuotasPendientes = cuotas.filter(c => !c.pagado);
    const saldoPendiente = cuotasPendientes.reduce((acc, c) => acc + c.total, 0);
    groups[key].totalAdeudado += saldoPendiente;

    if (cuotasPendientes.length > 0) {
      const prox = cuotasPendientes[0];
      if (prox.diasRestantes < groups[key].diasParaVencer) {
        groups[key].diasParaVencer = prox.diasRestantes;
        groups[key].fechaProxima = prox.fechaVencimiento;
        groups[key].cuotaProxima = prox.total;
      }
    }
  });

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

  return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

// MOTOR DE AGRUPACIÓN POR DÍAS PARA EL CALENDARIO & CRONOGRAMA DINÁMICO
// Agrupa personas y cuotas por fecha exacta, garantizando que quienes deben pagar
// en la misma fecha aparezcan en la misma columna.
export function obtenerCobrosPorDias(prestamosList = [], options = {}) {
  const {
    year = new Date().getFullYear(),
    month = new Date().getMonth(), // 0-indexed (0 = Enero, 9 = Octubre)
    filtroUrgencia = 'todos', // 'todos' | 'vencidos' | 'hoy' | 'semana' | 'pagados'
    carteraFiltro = 'todos', // 'todos' | 'otorgados' | 'recibidos'
    searchQuery = '',
  } = options;

  const hoy = new Date();
  const hoyStr = formatDate(hoy);
  const q = searchQuery.toLowerCase().trim();

  // Mapa de fechas a array de items
  const dayMap = {};

  (prestamosList || []).forEach(prestamo => {
    const tipo = prestamo.tipo_prestamo || (prestamo.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado');
    if (carteraFiltro === 'otorgados' && tipo !== 'otorgado') return;
    if (carteraFiltro === 'recibidos' && tipo !== 'recibido') return;

    if (q) {
      const matchName = prestamo.nombre?.toLowerCase().includes(q);
      const matchCI = prestamo.ci?.toLowerCase().includes(q);
      const matchTel = prestamo.telefono?.includes(q);
      if (!matchName && !matchCI && !matchTel) return;
    }

    const cuotas = generarCronograma(prestamo);

    cuotas.forEach(cuota => {
      const fechaStr = cuota.fechaVencimiento;
      if (!fechaStr) return;

      const fDate = toDate(fechaStr);
      const cuotaYear = fDate.getFullYear();
      const cuotaMonth = fDate.getMonth();

      // Filtrar si pertenece al mes o si está vencido pendiente de meses anteriores
      const perteneceAlMes = cuotaYear === year && cuotaMonth === month;
      const esVencidoPendiente = !cuota.pagado && cuota.diasRestantes < 0;

      // Mostrar eventos del mes actual, o vencidos si el filtro lo permite
      if (!perteneceAlMes && !(filtroUrgencia === 'vencidos' && esVencidoPendiente)) {
        return;
      }

      // Filtro de urgencia
      if (filtroUrgencia === 'vencidos' && cuota.estado !== 'vencido') return;
      if (filtroUrgencia === 'hoy' && cuota.estado !== 'hoy') return;
      if (filtroUrgencia === 'semana' && (cuota.diasRestantes < 0 || cuota.diasRestantes > 7)) return;
      if (filtroUrgencia === 'pagados' && !cuota.pagado) return;

      if (!dayMap[fechaStr]) {
        dayMap[fechaStr] = [];
      }

      dayMap[fechaStr].push({
        id: `${prestamo.id}-${cuota.key}`,
        prestamo,
        cuota,
        nombre: prestamo.nombre,
        ci: prestamo.ci,
        telefono: prestamo.telefono,
        driveUrl: prestamo.drive_url || prestamo.drive_contrato,
        tipo_prestamo: tipo,
        monto: cuota.total,
        capital: cuota.capital,
        interes: cuota.interes,
        mora: cuota.mora,
        pagado: cuota.pagado,
        estado: cuota.estado,
        diasAtraso: cuota.diasAtraso,
        diasRestantes: cuota.diasRestantes,
        label: cuota.label,
      });
    });
  });

  // Generar columnas ordenadas cronológicamente
  const diasSemana = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Ordenar fechas cronológicamente
  const sortedDates = Object.keys(dayMap).sort((a, b) => a.localeCompare(b));

  const dayColumns = sortedDates.map(fechaStr => {
    const d = toDate(fechaStr);
    const items = dayMap[fechaStr];
    const totalDia = items.reduce((acc, it) => acc + (parseFloat(it.monto) || 0), 0);
    const totalPagado = items.filter(it => it.pagado).reduce((acc, it) => acc + (parseFloat(it.monto) || 0), 0);
    const totalPendiente = totalDia - totalPagado;
    const diffDays = diasEntre(hoyStr, fechaStr);

    return {
      fecha: fechaStr,
      fechaObj: d,
      diaNumero: d.getDate(),
      diaSemana: diasSemana[d.getDay()],
      mesNombre: mesesNombres[d.getMonth()],
      esHoy: fechaStr === hoyStr,
      esAyer: diffDays === -1,
      esManana: diffDays === 1,
      esPasado: diffDays < 0,
      esFuturo: diffDays > 0,
      totalDia,
      totalPagado,
      totalPendiente,
      cobrosCount: items.length,
      pagadosCount: items.filter(it => it.pagado).length,
      morososCount: items.filter(it => !it.pagado && it.estado === 'vencido').length,
      items,
    };
  });

  return dayColumns;
}

// Simulador financiero rápido para cotizaciones instantáneas
export function simularPrestamo({ capital = 1000, interes = 10, plazo = 6, tipoPago = 'mensual' }) {
  const cap = parseFloat(capital) || 0;
  const t = parseFloat(interes) || 0;
  const p = parseInt(plazo) || 1;

  if (tipoPago === 'diario') {
    const totalDias = p * 30;
    const totalInteres = cap * (t / 100) * p;
    const cuotaDiaria = (cap + totalInteres) / totalDias;
    return {
      capital: cap,
      interesTotal: Math.round(totalInteres),
      totalRetorno: Math.round(cap + totalInteres),
      cuotaPeriodica: Math.round(cuotaDiaria * 100) / 100,
      frecuenciaLabel: `${totalDias} cuotas diarias`,
      gananciaPorcentual: t * p,
    };
  }

  const cuotaCapital = cap / p;
  const interesMensual = cap * (t / 100);
  const totalInteres = interesMensual * p;
  const cuotaMensual = Math.round(cuotaCapital + interesMensual);

  return {
    capital: cap,
    interesMensual: Math.round(interesMensual),
    interesTotal: Math.round(totalInteres),
    totalRetorno: Math.round(cap + totalInteres),
    cuotaPeriodica: cuotaMensual,
    frecuenciaLabel: `${p} cuotas mensuales`,
    gananciaPorcentual: t * p,
  };
}
