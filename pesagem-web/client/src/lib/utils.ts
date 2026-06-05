import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data do formato YYYY-MM-DD ou YYYYMMDD para DD/MM/YYYY
 * @param dateStr - String de data em formato YYYY-MM-DD ou YYYYMMDD
 * @returns String formatada em DD/MM/YYYY ou a entrada original se inválida
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';

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
