// Las fechas de cuidado representan un día de calendario, conservado en UTC.
export function displayDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(/^\d+$/.test(String(value)) ? Number(value) : value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-MX', { timeZone: 'UTC' });
}
