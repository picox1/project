/**
 * Utilitaires pour la gestion de la monnaie (Franc CFA)
 */

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} F CFA`;
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M F CFA`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K F CFA`;
  }
  return `${amount.toLocaleString('fr-FR')} F CFA`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};

export const formatCurrencyInput = (amount: number): string => {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const CURRENCY_SYMBOL = 'F CFA';
export const CURRENCY_CODE = 'XOF'; // Code ISO pour le Franc CFA