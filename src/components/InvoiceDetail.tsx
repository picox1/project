import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import FormatFCAF from './FormatFCAF';
import { X, User, Calendar, CreditCard, DollarSign, FileText, Plus } from 'lucide-react';
import { InvoiceWithDetails } from '../types/billing';
import { PrintableInvoice } from './PrintableInvoice';

interface InvoiceDetailProps {
  invoice: InvoiceWithDetails;
  onClose: () => void;
  onEdit: (invoice: InvoiceWithDetails) => void;
  onAddPayment: (invoice: InvoiceWithDetails) => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
  invoice,
  onClose,
  onEdit,
  onAddPayment
}) => {
  const [showPrintableInvoice, setShowPrintableInvoice] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payée':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Partiellement payée':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Impayée':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Espèces':
        return '💵';
      case 'Mobile Money':
        return '📱';
      case 'Chèque':
        return '🏦';
      case 'Virement':
        return '💳';
      default:
        return '💰';
    }
  };

  // Vérification des données critiques
  if (!invoice || !invoice.patient_nom || !invoice.patient_prenom) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">Données manquantes</h2>
          <p className="text-red-700 mb-6">
            Impossible d'afficher les détails : informations patient manquantes.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <span>Détails de la facture #{invoice.id?.slice(-6) || 'XXXXXX'}</span>
            </h2>
            <div className="flex items-center space-x-2">
              {invoice.solde_restant > 0 && (
                <button
                  onClick={() => onAddPayment(invoice)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Paiement</span>
                </button>
              )}
              <button
                onClick={() => setShowPrintableInvoice(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Voir PDF</span>
              </button>
              <button
                onClick={() => onEdit(invoice)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Modifier
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Informations générales</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Patient</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {invoice.patient_prenom || 'Prénom non renseigné'} {invoice.patient_nom || 'Nom non renseigné'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Date de facturation</span>
                </div>
                <p className="text-gray-900">{formatDate(invoice.date_facture)}</p>
              </div>
              
              {invoice.consultation_diagnostic && (
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Consultation associée</span>
                  </div>
                  <p className="text-gray-900">{invoice.consultation_diagnostic}</p>
                  <p className="text-sm text-gray-600">
                    {invoice.consultation_date && formatDate(invoice.consultation_date)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Détail des actes médicaux */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Détail des actes médicaux</span>
            </h3>
            {invoice.actes && invoice.actes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Acte</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Qté</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Prix unitaire</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.actes.map((acte, idx) => (
                      <tr key={acte.id || idx}>
                        <td className="border border-gray-300 px-4 py-2">{acte.nom}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{acte.quantite}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          <FormatFCAF montant={acte.prix_unitaire} />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          <FormatFCAF montant={acte.quantite * acte.prix_unitaire} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {invoice.description || 'Aucun acte médical renseigné.'}
                </p>
              </div>
            )}
          </div>

          {/* Détails financiers */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Détails financiers</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Montant total</p>
                <p className="text-2xl font-bold text-blue-700">
                  <FormatFCAF montant={invoice.montant_total || 0} />
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Montant payé</p>
                <p className="text-2xl font-bold text-green-700">
                  <FormatFCAF montant={invoice.montant_paye || 0} />
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Solde restant</p>
                <p className="text-2xl font-bold text-red-700">
                  <FormatFCAF montant={invoice.solde_restant || 0} />
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(invoice.statut || 'Impayée')}`}>
                {invoice.statut || 'Statut non défini'}
              </span>
            </div>
          </div>

          {/* Historique des paiements */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <span>Historique des paiements ({invoice.payments?.length || 0})</span>
            </h3>
            {!invoice.payments || invoice.payments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun paiement enregistré</p>
                {invoice.solde_restant > 0 && (
                  <button
                    onClick={() => onAddPayment(invoice)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enregistrer un paiement
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getPaymentMethodIcon(payment.mode_paiement || 'Espèces')}</span>
                        <div>
                          <p className="font-medium text-gray-900">
                            <FormatFCAF montant={payment.montant || 0} /> - {payment.mode_paiement || 'Mode non spécifié'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(payment.date_paiement)}
                            {payment.reference && ` • Réf: ${payment.reference}`}
                          </p>
                          {payment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
            {invoice.solde_restant > 0 && (
              <button
                onClick={() => onAddPayment(invoice)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Ajouter un paiement</span>
              </button>
            )}
            <button
              onClick={() => onEdit(invoice)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier la facture
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'impression */}
      {showPrintableInvoice && (
        <PrintableInvoice
          invoice={invoice}
          onClose={() => setShowPrintableInvoice(false)}
        />
      )}
    </div>
  );
};
