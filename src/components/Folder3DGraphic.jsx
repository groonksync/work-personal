import React from 'react';

export default function Folder3DGraphic({
  hasDrive = true,
  docType = 'PDF',
  fileCount = 1,
  colorTone = 'neutral',
}) {
  return (
    <div className="relative w-full aspect-[4/3] max-w-[200px] mx-auto flex items-center justify-center select-none group-hover:scale-[1.02] transition-transform duration-200">
      
      {/* CONTENEDOR PRINCIPAL DEL FOLDER 3D */}
      <div className="relative w-[160px] h-[115px] flex items-center justify-center">
        
        {/* 1. PARTE TRASERA DEL FOLDER (BACK SLEEVE CON PESTAÑA SUPERIOR) */}
        <div className="absolute inset-0 bg-[#282a30] dark:bg-[#25272c] rounded-2xl border border-white/5 shadow-md">
          {/* Pestaña superior izquierda */}
          <div className="absolute -top-2 left-3 w-16 h-4 bg-[#282a30] dark:bg-[#25272c] rounded-t-lg border-t border-l border-r border-white/5" />
        </div>

        {/* 2. HOJAS DE DOCUMENTOS SALIENDO DEL INTERIOR (WHITE PAPER SHEETS) */}
        {/* Hoja trasera 2 */}
        <div className="absolute top-2 w-[126px] h-[65px] bg-[#e2e5eb] rounded-lg shadow-xs transform rotate-[-2deg] transition-transform duration-200 group-hover:-translate-y-2 group-hover:rotate-[-3deg]" />

        {/* Hoja trasera 1 */}
        <div className="absolute top-1.5 w-[130px] h-[68px] bg-[#edf0f5] rounded-lg shadow-xs transform rotate-[1.5deg] transition-transform duration-200 group-hover:-translate-y-2.5 group-hover:rotate-[2.5deg]" />

        {/* Hoja principal frontal (Blanco nítido con mini líneas y etiqueta PDF/DOC) */}
        <div className="absolute top-1 w-[134px] h-[72px] bg-white rounded-lg shadow-md p-2 flex flex-col justify-between transition-transform duration-200 group-hover:-translate-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1 w-14">
              <div className="h-1 bg-zinc-200 dark:bg-zinc-300 rounded-full w-full" />
              <div className="h-1 bg-zinc-200 dark:bg-zinc-300 rounded-full w-3/4" />
              <div className="h-1 bg-zinc-200 dark:bg-zinc-300 rounded-full w-1/2" />
            </div>
            {/* Mini badge PDF/DOC como en la imagen */}
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-900 text-white leading-none tracking-tight">
              {docType}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <div className="h-1 bg-zinc-100 rounded-full w-10" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
          </div>
        </div>

        {/* 3. TAPA FRONTAL DEL FOLDER (DARK MATTE CHARCOAL SLEEVE FRONT) */}
        <div className="absolute bottom-0 inset-x-0 h-[78px] bg-gradient-to-b from-[#383a42] to-[#303239] dark:from-[#35373e] dark:to-[#2b2d33] rounded-xl border-t border-white/10 shadow-lg flex flex-col justify-end p-2.5 overflow-hidden">
          
          {/* Brillo sutil de curvatura */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20" />
          
          {/* 4. MICRO-ÍCONOS CIRCULARES SUPERPUESTOS EN LA ESQUINA INFERIOR IZQUIERDA (EXACTOS A LA FOTO) */}
          <div className="relative flex items-center -space-x-1.5 z-10">
            
            {/* Ícono 1: Documento / Notion */}
            <div className="w-5 h-5 rounded-full bg-[#1e1f24] border-2 border-[#33353c] flex items-center justify-center shadow-xs">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-white text-[7px] font-black text-black flex items-center justify-center leading-none">
                N
              </div>
            </div>

            {/* Ícono 2: Google Drive Tri-color */}
            {hasDrive && (
              <div className="w-5 h-5 rounded-full bg-[#1e1f24] border-2 border-[#33353c] flex items-center justify-center shadow-xs" title="Expediente en Google Drive">
                <svg className="w-2.5 h-2.5" viewBox="0 0 87.3 78" fill="none">
                  <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3L27.1 52.8H13.6L6.6 66.85z" fill="#0066DA" />
                  <path d="M43.65 25l-13.5-23.4c-1.3.8-2.4 1.9-3.2 3.3L.4 52.8h27.1L43.65 25z" fill="#00AC47" />
                  <path d="M73.55 76.8c1.3-.8 2.4-1.9 3.2-3.3l3.85-6.65-7-14.05h-27l13.45 23.4c1.3.4 2.4.6 3.5.6z" fill="#EA4335" />
                  <path d="M43.65 25L57.1 1.6C55.8.8 54.3.4 52.8 0H34.5c-1.5.4-3 .8-4.3 1.6L43.65 25z" fill="#00832D" />
                  <path d="M57.1 1.6L43.65 25l13.45 23.4h27.1L70.75 4.9c-.8-1.4-1.9-2.5-3.2-3.3H57.1z" fill="#FFBA00" />
                  <path d="M70.4 48.4H27.1L13.6 71.8c1.3.8 2.8 1.2 4.3 1.2h51.8c1.5 0 3-.4 4.3-1.2l-3.6-23.4z" fill="#2684FC" />
                </svg>
              </div>
            )}

            {/* Ícono 3: Hoja de Cálculo Verde (Excel / Sheets) */}
            <div className="w-5 h-5 rounded-full bg-[#107c41] border-2 border-[#33353c] flex items-center justify-center shadow-xs">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
