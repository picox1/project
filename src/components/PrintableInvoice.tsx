import React from 'react';
import { Printer } from 'lucide-react';
import FormatFCAF from './FormatFCAF';
import { InvoiceWithDetails } from '../types/billing';
import { ClinicService } from '../services/clinicService';

interface PrintableInvoiceProps {
  invoice: InvoiceWithDetails;
  onClose: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice, onClose }) => {
  const clinicService = ClinicService.getInstance();
  const clinicInfo = clinicService.getClinicInfo();

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrint = () => window.print();

  const generateInvoiceNumber = (invoiceId: string): string => {
    if (!invoiceId) return 'N° non généré';
    const year = new Date().getFullYear();
    const shortId = invoiceId.slice(-6).toUpperCase();
    return `F${year}-${shortId}`;
  };

  // Vérification des données critiques
  const hasRequiredData = () => (
    invoice && invoice.patient_nom && invoice.patient_prenom && invoice.montant_total > 0 && invoice.date_facture
  );

  if (!hasRequiredData()) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">Document incomplet</h2>
          <p className="text-red-700 mb-6">
            Impossible de générer la facture : données critiques manquantes.
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
    <div className="fixed inset-0 bg-white z-50">
      {/* Boutons d'action - cachés à l'impression */}
      <div className="print:hidden bg-gray-100 p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold text-gray-900">Aperçu de la facture</h2>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Document imprimable */}
      <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen print:p-6 print:max-w-none">
        {/* En-tête du cabinet */}
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {clinicInfo?.logo ? (
                <img src={clinicInfo.logo} alt="Logo" className="h-16 w-auto object-contain" />
              ) : (
                <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-lg">LOGO</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-blue-800 mb-2">
                {clinicInfo?.nom || 'Structure Médicale'}
              </h1>
            </div>
            <div className="flex-1"></div>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Adresse : {clinicInfo?.adresse || 'Adresse non renseignée'}</p>
            <p>Téléphone : {clinicInfo?.telephone || 'Non renseigné'} | Email : {clinicInfo?.email || 'Non renseigné'}</p>
            <p>RC : {clinicInfo?.rccm || 'Non renseigné'} | NINEA : {clinicInfo?.ninea || 'Non renseigné'}</p>
            {clinicInfo?.site_web && <p>Site web : {clinicInfo.site_web}</p>}
            <p className="text-xs mt-2">
              Responsable médical : {clinicInfo?.responsable_medical_prenom || 'Dr.'} {clinicInfo?.responsable_medical_nom || 'Non renseigné'}
            </p>
          </div>
        </div>

        {/* Informations facture */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">FACTURE</h2>
            <div className="space-y-2 text-sm">
              <p><strong>N° Facture :</strong> {generateInvoiceNumber(invoice.id)}</p>
              <p><strong>Date :</strong> {formatDate(invoice.date_facture)}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PATIENT</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                {invoice.patient_prenom || 'Prénom non renseigné'} {invoice.patient_nom || 'Nom non renseigné'}
              </p>
            </div>
          </div>
        </div>

        {/* Détail des actes médicaux */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            DÉTAIL DES ACTES MÉDICAUX
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">DÉSIGNATION</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">QTÉ</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">PRIX UNITAIRE</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">MONTANT</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.actes && invoice.actes.length > 0) ? (
                invoice.actes.map((acte, idx) => (
                  <tr key={acte.id || idx}>
                    <td className="border border-gray-300 px-4 py-3">{acte.nom || 'Acte médical'}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{acte.quantite || 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      <FormatFCAF montant={acte.prix_unitaire || 0} />
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                      <FormatFCAF montant={(acte.quantite || 1) * (acte.prix_unitaire || 0)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-gray-300 px-4 py-3">{invoice.description || 'Service médical'}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">1</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    <FormatFCAF montant={invoice.montant_total || 0} />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                    <FormatFCAF montant={invoice.montant_total || 0} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Récapitulatif financier */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">MONTANT TOTAL</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                    <FormatFCAF montant={invoice.montant_total || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-green-50">MONTANT PAYÉ</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-green-600">
                    <FormatFCAF montant={invoice.montant_paye || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-red-50">MONTANT RESTANT</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold text-red-600">
                    <FormatFCAF montant={invoice.solde_restant || 0} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Historique des paiements */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
              HISTORIQUE DES PAIEMENTS
            </h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">DATE</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">MODE</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">RÉFÉRENCE</th>
                  <th className="border border-gray-300 px-4 py-2 text-right font-semibold">MONTANT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(payment.date_paiement)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{payment.mode_paiement || 'Non spécifié'}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.reference || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <FormatFCAF montant={payment.montant || 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>Merci de votre confiance</p>
              <p className="mt-2">{clinicInfo?.nom || 'Structure Médicale'}</p>
            </div>
            <div className="text-right">
              <div className="border-t border-gray-400 pt-2 mt-8 w-48">
                <p className="text-sm font-semibold">Signature et cachet</p>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-8">
            <p>Cette facture est générée électroniquement et fait foi</p>
            <p className="mt-1">Imprimé via Logiciel Dib Digital</p>
          </div>
        </div>
      </div>
    </div>
  );
};
