import React from 'react';
import { Printer, Download } from 'lucide-react';
import { AnalysisWithDetails } from '../types/analysis';
import { ClinicService } from '../services/clinicService';

interface PrintableAnalysisProps {
  analysis: AnalysisWithDetails;
  onClose: () => void;
}

export const PrintableAnalysis: React.FC<PrintableAnalysisProps> = ({ analysis, onClose }) => {
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

  const handlePrint = () => {
    window.print();
  };

  const generateAnalysisNumber = (analysisId: string): string => {
    if (!analysisId) return 'N° non généré';
    const year = new Date().getFullYear();
    const shortId = analysisId.slice(-6).toUpperCase();
    return `BUL${year}-${shortId}`;
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'anormal':
        return 'text-orange-600 bg-orange-50';
      case 'critique':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'NORMAL';
      case 'anormal':
        return 'ANORMAL';
      case 'critique':
        return 'CRITIQUE';
      default:
        return 'NON DÉFINI';
    }
  };

  // Vérification des données critiques
  const hasRequiredData = () => {
    return analysis && 
           analysis.patient_nom && 
           analysis.patient_prenom && 
           analysis.professionnel_nom &&
           analysis.professionnel_prenom &&
           analysis.type_analyse &&
           analysis.resultats &&
           analysis.resultats.length > 0 &&
           analysis.date_analyse;
  };

  if (!hasRequiredData()) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">Document incomplet</h2>
          <p className="text-red-700 mb-6">
            Impossible de générer le bulletin d'analyses : données critiques manquantes.
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
        <h2 className="text-lg font-semibold text-gray-900">Aperçu du bulletin d'analyses</h2>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(document.querySelector('.print\\:max-w-none')?.textContent || '')}`;
              link.download = `bulletin_analyses_${analysis.id || 'document'}.pdf`;
              link.click();
            }}
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

        {/* Titre bulletin */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">BULLETIN D'ANALYSES MÉDICALES</h2>
          <div className="text-sm text-gray-600">
            <p>N° Bulletin : {generateAnalysisNumber(analysis.id)}</p>
            <p>Date : {formatDate(analysis.date_analyse)}</p>
          </div>
        </div>

        {/* Informations patient et médecin */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              PATIENT
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nom :</strong> {analysis.patient_nom || 'Nom non renseigné'}</p>
              <p><strong>Prénom :</strong> {analysis.patient_prenom || 'Prénom non renseigné'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              PROFESSIONNEL
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Dr.</strong> {analysis.professionnel_prenom || 'Prénom non renseigné'} {analysis.professionnel_nom || 'Nom non renseigné'}</p>
              <p><strong>Spécialité :</strong> {analysis.professionnel_role || 'Spécialité non renseignée'}</p>
            </div>
          </div>
        </div>

        {/* Type d'analyse */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">TYPE D'ANALYSE</h3>
          <p className="text-blue-800 text-lg font-medium">{analysis.type_analyse || 'Type non spécifié'}</p>
        </div>

        {/* Diagnostic associé */}
        {analysis.consultation_diagnostic && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-900 mb-2">DIAGNOSTIC ASSOCIÉ</h3>
            <p className="text-green-800">{analysis.consultation_diagnostic}</p>
          </div>
        )}

        {/* Résultats d'analyses */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            RÉSULTATS D'ANALYSES
          </h3>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">PARAMÈTRE</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">VALEUR</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">UNITÉ</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">VALEUR NORMALE</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {(analysis.resultats || []).map((result, index) => (
                <tr key={result.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3 font-medium">{result.parametre || 'Paramètre non spécifié'}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-semibold">{result.valeur || 'Valeur non renseignée'}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{result.unite || '-'}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{result.valeur_normale || '-'}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getResultStatusColor(result.statut)}`}>
                      {getResultStatusLabel(result.statut)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conclusion médicale */}
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">CONCLUSION MÉDICALE</h3>
          <p className="text-yellow-800 whitespace-pre-wrap leading-relaxed">
            {analysis.conclusion || 'Conclusion non renseignée'}
          </p>
        </div>

        {/* Signature */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>Date d'analyse : {formatDate(analysis.date_analyse)}</p>
              <p className="mt-2">{clinicInfo?.nom || 'Structure Médicale'}</p>
              <p className="text-xs">
                {clinicInfo?.responsable_medical_prenom || 'Dr.'} {clinicInfo?.responsable_medical_nom || 'Non renseigné'}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-semibold mb-2">
                Dr. {analysis.professionnel_prenom || 'Prénom non renseigné'} {analysis.professionnel_nom || 'Nom non renseigné'}
              </p>
              <p className="text-sm text-gray-600 mb-4">{analysis.professionnel_role || 'Spécialité non renseignée'}</p>
              <div className="border-t border-gray-400 pt-2 mt-8 w-48">
                <p className="text-sm">Signature et cachet</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-8">
            <p>Ce bulletin d'analyses est généré électroniquement et fait foi</p>
            <p className="mt-1">Imprimé via Logiciel Dib Digital</p>
          </div>
        </div>
      </div>
    </div>
  );
};