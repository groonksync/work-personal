ALTER TABLE public.prestamos
  ADD COLUMN IF NOT EXISTS titulo_prestamo text NOT NULL DEFAULT 'Préstamo',
  ADD COLUMN IF NOT EXISTS fecha_primer_pago date,
  ADD COLUMN IF NOT EXISTS notas_express jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS abonos_capital jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS metodo_recalculo text NOT NULL DEFAULT 'reducir_cuota';
