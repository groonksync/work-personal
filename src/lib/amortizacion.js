// Constantes del motor financiero de préstamos
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

// Genera el cronograma de cuotas mensuales
export function generarCronograma(prestamo) {
  if (!prestamo?.id) return [];
  const { inicio, fin, capital, interes, pagos, plazo_meses } = prestamo;
  const tasaInteres = parseFloat(interes) || 0;
  const capitalNum = parseFloat(capital) || 0;
  const cuotasCount = parseInt(plazo_meses) || 6;
  const cuotaCapital = capitalNum / cuotasCount;
  const interesMensual = Math.round(capitalNum * (tasaInteres / 100));
  const valorCuota = Math.round(cuotaCapital + interesMensual);
  
  const cuotas = [];
  const startDate = toDate(inicio);
  const hoy = new Date();
  const hoyStr = formatDate(hoy);

  for (let mesIndex = 0; mesIndex < cuotasCount; mesIndex++) {
    const fechaVenc = getFechaVencimiento(inicio, mesIndex);
    const vencDate = toDate(fechaVenc);
    const key = generarKey(vencDate.getFullYear(), vencDate.getMonth());
    const pagada = isCuotaPaid(pagos, key);

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
      capital: Math.round(cuotaCapital),
      interes: interesMensual,
      total: valorCuota,
      pagado: pagada,
      mora,
      diasAtraso,
      diasRestantes: diffDays,
      estado,
    });
  }

  return cuotas;
}

// Agrupador de préstamos por persona (Carpetas)
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
        totalAdeudado: 0,
        interesMensual: 0,
        cuotaProxima: 0,
        fechaProxima: null,
        diasParaVencer: 999,
        estadoGlobal: 'Al Día',
        tipo_prestamo: p.tipo_prestamo || (p.notas?.includes('[TIPO:recibido]') ? 'recibido' : 'otorgado'),
      };
    }

    groups[key].contratos.push(p);
    const cap = parseFloat(p.capital) || 0;
    const interes = parseFloat(p.interes) || 0;
    groups[key].totalCapital += cap;

    // Calcular cuotas para este contrato
    const cuotas = generarCronograma(p);
    const cuotasPendientes = cuotas.filter(c => !c.pagado);
    const saldoPendiente = cuotasPendientes.reduce((acc, c) => acc + c.total, 0);
    groups[key].totalAdeudado += saldoPendiente;

    // Próxima cuota pendiente
    if (cuotasPendientes.length > 0) {
      const prox = cuotasPendientes[0];
      if (prox.diasRestantes < groups[key].diasParaVencer) {
        groups[key].diasParaVencer = prox.diasRestantes;
        groups[key].fechaProxima = prox.fechaVencimiento;
        groups[key].cuotaProxima = prox.total;
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
