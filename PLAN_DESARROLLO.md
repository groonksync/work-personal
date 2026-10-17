# Plan de desarrollo — Work Personal

## Objetivo

Convertir la app en un registro fiable y privado de personas deudoras, varios préstamos por persona, vencimientos, pagos, incidencias por préstamo y su documento de Google Drive.

## Fases

### Fase 1 — Base fiable y acceso privado (pendiente de completar)

- Mantener la cartera protegida por la política RLS de Supabase.
- Reintegrar un acceso por correo que no oculte la interfaz y probarlo en el dominio publicado.
- No sustituir errores ni carteras vacías por préstamos de demostración.
- Persistir únicamente en la tabla `prestamos`, protegida por RLS; confirmar cada cambio después de guardarlo.
- Guardar notas, pagos y documentos en el registro del préstamo correspondiente.
- Criterio de salida: la cartera vacía se ve vacía, el propietario puede iniciar sesión y los cambios fallidos nunca se presentan como guardados.

### Fase 2 — Registro de personas y contratos (implementada)

- Agrupar contratos por CI cuando exista; usar el nombre normalizado cuando no exista CI.
- Permitir registrar varios contratos independientes para una misma persona.
- Añadir título/referencia de contrato y resumen de saldo, tasa, moneda y estado.
- Asociar una URL de Google Drive a cada contrato.
- Criterio de salida: abrir una persona permite distinguir y revisar cada contrato suyo sin mezclar sus pagos.

### Fase 3 — Vencimientos, pagos y bitácora (implementada; mora automática pendiente de regla)

- Generar fechas mensuales desde la fecha del primer vencimiento y el plazo del contrato.
- Mostrar próximo pago, vencido, pagado y saldo restante con cálculo reproducible.
- Registrar pagos con fecha, cuota y monto dentro del préstamo.
- Anotar llamadas, prórrogas y motivos de impago dentro del préstamo correcto.
- No calcular penalidades automáticamente hasta definir la regla contractual aplicable.
- Criterio de salida: el saldo y el estado de las cuotas cambian al confirmar un pago guardado.

### Fase 4 — Interfaz profesional y móvil (implementación inicial)

- Sustituir el cronograma de muestra por una agenda generada desde datos reales.
- Unificar la ficha de persona/contrato, jerarquía visual, buscador y estados vacíos/error.
- Mantener acciones claras para ver un contrato, registrar pago, nota y documento.
- Mejorar accesibilidad de formularios y controles móviles.
- Criterio de salida: escritorio y móvil muestran la misma cartera y permiten las tareas principales.

### Fase 5 — Verificación y publicación (en curso)

- Revisar el diff, compilar producción y validar el flujo visible.
- Confirmar variables de entorno y redirecciones de Supabase Auth en Vercel.
- Subir el cambio a `main` para activar el despliegue conectado a Vercel.
- Criterio de salida: despliegue listo, URL disponible y pasos restantes documentados si la consola requiere configuración manual.

## Notas de seguridad pendientes

- La inspección detectó RLS desactivado en `prestamos_historial` y `prestamistas_notas`. La app no debe usar esas tablas sin políticas propias. No se alterarán automáticamente; se presentará una migración segura específica cuando corresponda.
- `prestamos` sí tiene RLS y una política que exige la sesión autenticada del propietario.
