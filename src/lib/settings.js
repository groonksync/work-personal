// Configuración, Auditoría y Seguridad para Work Personal
const SETTINGS_KEY = 'work_personal_settings';

// Funciones de ofuscación simple para que datos sensibles no residan en texto plano
function obfuscate(str) {
  if (!str) return '';
  return btoa(encodeURIComponent(str));
}

function deobfuscate(str) {
  if (!str) return '';
  try {
    return decodeURIComponent(atob(str));
  } catch (e) {
    return str;
  }
}

// Número de trabajo protegido (+591 69109766)
// Se inicializa desde variable de entorno o fallback ofuscado en base64
const DEFAULT_OBF_PHONE = 'NjkxMDk3NjY='; // Ofuscado: 69109766

export const defaultTemplates = {
  recordatorio: `Hola {nombre}, un saludo cordial. Te recordamos amablemente que el {fecha} corresponde la cuota de tu préstamo por {monto}. Por favor haznos llegar tu comprobante una vez realizada la transferencia. ¡Muchas gracias!`,
  hoy: `Hola {nombre}, buen día. Te informamos que hoy {fecha} vence la cuota de tu préstamo por {monto}. Puedes realizar la transferencia o pago QR a: {banco_info}. Quedamos atentos a tu comprobante.`,
  recibo: `Estimado/a {nombre}, confirmamos el registro de tu pago por {monto}. Tu cuota ha sido asentada correctamente en tu expediente digital. ¡Muchas gracias por tu puntualidad!`,
  mora: `Estimado/a {nombre}, te escribimos para coordinar la regularización de tu cuota pendiente por {monto}, que venció el {fecha}. Por favor contáctanos para ponernos al día. Saludos cordiales.`,
};

export const defaultSettings = {
  currency: 'BOB', // BOB, USD, PEN
  theme: 'dark',
  defaultInterestRate: 10,
  defaultTermMonths: 6,
  reminderDaysBefore: 3,
  moraRate: 5, // 5% mora diaria o fija
  moraTipo: 'diaria', // 'diaria' | 'fija'
  bankAccountInfo: 'Banco BCP / QR habilitado',
  googleDriveUrl: 'https://drive.google.com/drive/my-drive',
  adminPhone: import.meta.env.VITE_ADMIN_WHATSAPP || deobfuscate(DEFAULT_OBF_PHONE),
  securityPin: '', // PIN opcional para bloquear auditoría
  templates: defaultTemplates,
  recalculoDefault: 'reducir_cuota', // 'reducir_cuota' | 'reducir_plazo'
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      templates: { ...defaultTemplates, ...(parsed.templates || {}) },
      adminPhone: parsed.adminPhone ? deobfuscate(parsed.adminPhone) : defaultSettings.adminPhone,
    };
  } catch (e) {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  try {
    const toSave = {
      ...settings,
      adminPhone: obfuscate(settings.adminPhone || ''),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error guardando configuración:', e);
  }
}
