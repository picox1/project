import FormatFCAF from './FormatFCAF';
import React, { useState } from 'react';
import { Save, X, CreditCard, DollarSign, Calendar, FileText } from 'lucide-react';
import { PaymentFormData } from '../types/billing';

interface PaymentFormProps {
  invoiceId: string;
  maxAmount: number;
  onSave: (paymentData: PaymentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  invoiceId,
  maxAmount,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    facture_id: invoiceId,
    montant: 0,
    mode_paiement: 'Espèces',
    reference: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.montant || formData.montant <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0';
    } else if (formData.montant > maxAmount) {
      newErrors.montant = `Le montant ne peut pas dépasser ${maxAmount}€`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const paymentMethods = [
    { value: 'Espèces', label: 'Espèces' },
    { value: 'Mobile Money', label: 'Mobile Money' },
    { value: 'Chèque', label: 'Chèque' },
    { value: 'Virement', label: 'Virement bancaire' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-green-600" />
              <span>Enregistrer un paiement</span>
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Montant restant à payer :</strong> <FormatFCAF montant={maxAmount} />
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Montant du paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Montant du paiement (F CFA) *</span>
            </label>
            <input
              type="number"
              min="0"
              max={maxAmount}
              step="1000"
              value={formData.montant || ''}
              onChange={(e) => handleInputChange('montant', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.montant ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Montant en Franc CFA (F CFA)</p>
            {errors.montant && <p className="text-red-500 text-sm mt-1">{errors.montant}</p>}
            
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => handleInputChange('montant', maxAmount)}
               className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors flex items-center space-x-1"
              >
               <span>Montant total (</span><FormatFCAF montant={maxAmount} /><span>)</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('montant', maxAmount / 2)}
               className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
               <span>50% (</span><FormatFCAF montant={maxAmount / 2} /><span>)</span>
              </button>
            </div>
          </div>

          {/* Mode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <CreditCard className="h-4 w-4" />
              <span>Mode de paiement *</span>
            </label>
            <select
              value={formData.mode_paiement}
              onChange={(e) => handleInputChange('mode_paiement', e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Référence (optionnel)</span>
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Numéro de chèque, référence virement..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Notes (optionnel)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>Enregistrer le paiement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};