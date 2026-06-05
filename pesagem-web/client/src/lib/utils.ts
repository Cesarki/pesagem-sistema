import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data do formato ISO (2026-06-05T00:00:00.000Z), YYYY-MM-DD ou YYYYMMDD para DD/MM/YYYY
 * @param dateStr - String de data em formato ISO, YYYY-MM-DD ou YYYYMMDD
 * @returns String formatada em DD/MM/YYYY ou a entrada original se inválida
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';

  // Se for formato ISO (2026-06-05T00:00:00.000Z), extrair apenas a data
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }

  // Remover hífens se existirem (YYYY-MM-DD → YYYYMMDD)
  const cleanDate = dateStr.replace(/-/g, '');

  // Verificar se tem 8 dígitos
  if (cleanDate.length !== 8 || !/^\d{8}$/.test(cleanDate)) {
    return dateStr; // Retornar original se não for válido
  }

  // Extrair ano, mês e dia
  const year = cleanDate.substring(0, 4);
  const month = cleanDate.substring(4, 6);
  const day = cleanDate.substring(6, 8);

  return `${day}/${month}/${year}`;
}
