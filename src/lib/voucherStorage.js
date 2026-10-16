// Gestor de almacenamiento de comprobantes (Vouchers / Bauchers)
import { supabase } from './supabaseClient';

const DB_NAME = 'WorkPersonal_VouchersDB';
const STORE_NAME = 'vouchers';
const DB_VERSION = 1;

// Inicializar IndexedDB para almacenamiento de alta capacidad local
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('prestamoId', 'prestamoId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

// Comprimir imagen usando Canvas para optimizar espacio y velocidad
export function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // Si es PDF u otro, retornar como Base64 directo
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result, name: file.name, type: file.type });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          name: file.name.replace(/\.[^.]+$/, '.jpg'),
          type: 'image/jpeg',
          sizeBytes: Math.round(dataUrl.length * (3 / 4)),
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Guardar comprobante
export async function saveVoucher(prestamoId, fileData, metadata = {}) {
  const voucher = {
    id: `vouch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    prestamoId,
    cuotaKey: metadata.cuotaKey || null,
    monto: metadata.monto || null,
    moneda: metadata.moneda || 'BOB',
    tipoPago: metadata.tipoPago || 'QR / Transferencia',
    notas: metadata.notas || '',
    fecha: metadata.fecha || new Date().toISOString(),
    dataUrl: fileData.dataUrl,
    name: fileData.name,
    type: fileData.type,
    synced: false,
  };

  // 1. Guardar en IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(voucher);
    } else {
      // Fallback a localStorage
      const existing = JSON.parse(localStorage.getItem(`vouchers_${prestamoId}`) || '[]');
      existing.unshift(voucher);
      localStorage.setItem(`vouchers_${prestamoId}`, JSON.stringify(existing));
    }
  } catch (err) {
    console.warn('Error guardando en IndexedDB, usando fallback:', err);
  }

  // 2. Intentar respaldo en Supabase si la tabla existe
  if (supabase) {
    try {
      await supabase.from('prestamos_vouchers').insert([{
        id: voucher.id,
        prestamo_id: prestamoId,
        cuota_key: voucher.cuotaKey,
        monto: voucher.monto,
        data_url: voucher.dataUrl.length < 500000 ? voucher.dataUrl : null,
        nombre_archivo: voucher.name,
        notas: voucher.notas,
        fecha: voucher.fecha,
      }]);
    } catch (e) {
      // Offline mode
    }
  }

  return voucher;
}

// Obtener comprobantes de un préstamo
export async function getVouchers(prestamoId) {
  try {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('prestamoId');
        const request = index.getAll(prestamoId);
        request.onsuccess = () => {
          const results = request.result || [];
          results.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          resolve(results);
        };
        request.onerror = () => resolve([]);
      });
    } else {
      const list = JSON.parse(localStorage.getItem(`vouchers_${prestamoId}`) || '[]');
      return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
  } catch (err) {
    const list = JSON.parse(localStorage.getItem(`vouchers_${prestamoId}`) || '[]');
    return list;
  }
}

// Eliminar un comprobante
export async function deleteVoucher(voucherId, prestamoId) {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(voucherId);
    }
    if (prestamoId) {
      const existing = JSON.parse(localStorage.getItem(`vouchers_${prestamoId}`) || '[]');
      const filtered = existing.filter(v => v.id !== voucherId);
      localStorage.setItem(`vouchers_${prestamoId}`, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Error eliminando comprobante:', e);
  }
}
