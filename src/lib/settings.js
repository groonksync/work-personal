// Configuración y preferencias de usuario para Work Personal
const SETTINGS_KEY = 'work_personal_settings';

export const defaultSettings = {
  currency: 'BOB', // BOB, USD, PEN
  theme: 'dark',
  defaultInterestRate: 5,
  defaultTermMonths: 6,
  reminderDaysBefore: 3,
  moraRate: 5,
  bankAccountInfo: '',
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (e) {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error guardando configuración:', e);
  }
}
