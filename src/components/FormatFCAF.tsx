import React from 'react';

interface FormatFCAFProps {
  montant: number;
  className?: string;
}

const FormatFCAF: React.FC<FormatFCAFProps> = ({ montant, className = '' }) => {
  const formatMontant = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  return (
    <span className={className}>
      {formatMontant(montant)} F CFA
    </span>
  );
};

export default FormatFCAF;