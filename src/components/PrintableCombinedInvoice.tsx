import React from 'react';
import { Printer, Download } from 'lucide-react';
import FormatFCAF from './FormatFCAF';
import { InvoiceWithDetails } from '../types/billing';
import { ClinicService } from '../services/clinicService';

interface PrintableCombinedInvoiceProps {
  invoice: InvoiceWithDetails;
  services: Array<{
    designation: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  onClose: () => void;
}

export const PrintableCombinedInvoice: React.FC<PrintableCombinedInvoiceProps> = ({ 
  invoice, 
  services, 
  onClose 
}) => {
  const clinicService = ClinicService.getInstance();
  const clinicInfo = clinicService.getClinicInfo();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(document.querySelector('.print\\:max-w-none')?.textContent || '')}`;
    link.download = `facture_combinee_${invoice.id}.txt`;
    link.click();
  };

  const generateInvoiceNumber = (invoiceId: string): string => {
    const year = new Date().getFullYear();
    const shortId = invoiceId.slice(-6).toUpperCase();
    return `FC${year}-${shortId}`;
  };

  const totalServices = services.reduce((sum, service) => sum + service.total, 0);

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Boutons d'action - cachés à l'impression */}
      <div className="print:hidden bg-gray-100 p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold text-gray-900">Aperçu de la facture combinée</h2>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger PDF</span>
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
              {clinicInfo.logo && (
                <img src={clinicInfo.logo} alt="Logo" className="h-16 w-auto object-contain" />
              )}
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-blue-800 mb-2">{clinicInfo.nom || '[Nom non défini]'}</h1>
            </div>
            <div className="flex-1"></div>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Adresse : {clinicInfo.adresse || '[Adresse non définie]'}</p>
            <p>Téléphone : {clinicInfo.telephone || '[Téléphone non défini]'} | Email : {clinicInfo.email || '[Email non défini]'}</p>
            <p>RC : {clinicInfo.rccm || '[RCCM non défini]'} | NINEA : {clinicInfo.ninea || '[NINEA non défini]'}</p>
            {clinicInfo.site_web && <p>Site web : {clinicInfo.site_web}</p>}
            <p className="text-xs mt-2">Responsable médical : {clinicInfo.responsable_medical_prenom} {clinicInfo.responsable_medical_nom}</p>
          </div>
        </div>

        {/* Informations facture */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">FACTURE COMBINÉE</h2>
            <div className="space-y-2 text-sm">
              <p><strong>N° Facture :</strong> {generateInvoiceNumber(invoice.id)}</p>
              <p><strong>Date :</strong> {formatDate(invoice.date_facture)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PATIENT</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{invoice.patient_prenom} {invoice.patient_nom}</p>
            </div>
          </div>
        </div>

        {/* Détail des actes médicaux */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            DÉTAIL DES ACTES MÉDICAUX ET SOINS
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
              {services.map((service, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-3">{service.designation}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{service.quantity}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    <FormatFCAF montant={service.unitPrice} />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                    <FormatFCAF montant={service.total} />
                  </td>
                </tr>
              ))}
              
              {/* Ligne de total */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-bold" colSpan={3}>
                  TOTAL GÉNÉRAL
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-lg">
                  <FormatFCAF montant={totalServices} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Récapitulatif financier */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">PRIX TOTAL (PT)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                    <FormatFCAF montant={invoice.montant_total} />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-green-50">MONTANT PAYÉ</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-green-600">
                    <FormatFCAF montant={invoice.montant_paye} />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-red-50">MONTANT RESTANT</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold text-red-600">
                    <FormatFCAF montant={invoice.solde_restant} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Historique des paiements */}
        {invoice.payments.length > 0 && (
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
                    <td className="border border-gray-300 px-4 py-2">{payment.mode_paiement}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.reference || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <FormatFCAF montant={payment.montant} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes et conditions */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-semibold text-gray-900 mb-2">CONDITIONS DE PAIEMENT</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Paiement à réception de facture</p>
            <p>• Modes de paiement acceptés : Espèces, Mobile Money, Chèque, Virement</p>
            <p>• En cas de retard de paiement, des pénalités peuvent s'appliquer</p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>Merci de votre confiance</p>
              <p className="mt-2">{clinicInfo.nom || '[Nom non défini]'}</p>
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