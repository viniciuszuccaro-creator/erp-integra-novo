/**
 * Helpers da ERPDataTable
 * Regra-Mãe 3: extraído de DataTable.jsx — comportamento preservado
 */

// Densidade: controla paddings e alturas (confortável por padrão)
export const DENSITY_PADS = {
  compact: { padX: 'px-2', padYHead: 'py-1', padYCell: 'py-1.5' },
  spacious: { padX: 'px-4', padYHead: 'py-2.5', padYCell: 'py-3' },
  comfortable: { padX: 'px-3', padYHead: 'py-1.5', padYCell: 'py-2' },
};

export function getPads(density = 'comfortable') {
  return DENSITY_PADS[density] || DENSITY_PADS.comfortable;
}

// Aceita Set ou Array para seleção
export function normalizeSelectedSet(selectedIds) {
  if (selectedIds instanceof Set) return selectedIds;
  if (Array.isArray(selectedIds)) return new Set(selectedIds);
  return new Set();
}