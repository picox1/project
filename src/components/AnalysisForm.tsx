import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, BarChart3, User, Users, Calendar, TestTube } from 'lucide-react';
import { Analysis, AnalysisFormData, AnalysisResult } from '../types/analysis';
import { Patient } from '../types/patient';
import { User as UserType } from '../types/user';
import { ConsultationWithDetails } from '../types/consultation';

interface AnalysisFormProps {
  analysis?: Analysis | null;
  patients: Patient[];
  professionals: UserType[];
  consultations?: ConsultationWithDetails[];
  selectedConsultation?: ConsultationWithDetails | null;
  onSave: (analysisData: AnalysisFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  analysis,
  patients,
  professionals,
  consultations = [],
  selectedConsultation,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AnalysisFormData>({
    patient_id: '',
    consultation_id: '',
    professionnel_id: '',
    type_analyse: '',
    resultats: [],
    conclusion: ''
  });

  const [errors, setErrors] = useState<Partial<AnalysisFormData>>({});

  useEffect(() => {
    if (analysis) {
      setFormData({
        patient_id: analysis.patient_id,
        consultation_id: analysis.consultation_id || '',
        professionnel_id: analysis.professionnel_id,
        type_analyse: analysis.type_analyse,
        resultats: analysis.resultats,
        conclusion: analysis.conclusion
      });
    } else if (selectedConsultation) {
      setFormData(prev => ({
        ...prev,
        patient_id: selectedConsultation.patient_id,
        professionnel_id: selectedConsultation.professionnel_id,
        consultation_id: selectedConsultation.id
      }));
    }
  }, [analysis, selectedConsultation]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AnalysisFormData> = {};

    if (!formData.patient_id) newErrors.patient_id = 'Veuillez sélectionner un patient';
    if (!formData.professionnel_id) newErrors.professionnel_id = 'Veuillez sélectionner un professionnel';
    if (!formData.type_analyse.trim()) newErrors.type_analyse = 'Le type d\'analyse est requis';
    if (formData.resultats.length === 0) {
      newErrors.resultats = 'Veuillez ajouter au moins un résultat' as any;
    }
    if (!formData.conclusion.trim()) newErrors.conclusion = 'La conclusion est requise';

    // Valider chaque résultat
    const resultErrors = formData.resultats.some(result => 
      !result.parametre.trim() || !result.valeur.trim()
    );
    
    if (resultErrors) {
      newErrors.resultats = 'Tous les paramètres et valeurs sont requis' as any;
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

  const handleInputChange = (field: keyof AnalysisFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addResult = () => {
    const newResult: AnalysisResult = {
      id: Date.now().toString(),
      parametre: '',
      valeur: '',
      unite: '',
      valeur_normale: '',
      statut: 'normal'
    };
    
    setFormData(prev => ({
      ...prev,
      resultats: [...prev.resultats, newResult]
    }));
  };

  const removeResult = (resultId: string) => {
    setFormData(prev => ({
      ...prev,
      resultats: prev.resultats.filter(result => result.id !== resultId)
    }));
  };

  const updateResult = (resultId: string, field: keyof AnalysisResult, value: string) => {
    setFormData(prev => ({
      ...prev,
      resultats: prev.resultats.map(result =>
        result.id === resultId ? { ...result, [field]: value } : result
      )
    }));
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  const analysisTypes = [
    'Bilan sanguin complet',
    'Analyse d\'urine',
    'Bilan lipidique',
    'Glycémie',
    'Fonction rénale',
    'Fonction hépatique',
    'Hormones thyroïdiennes',
    'Marqueurs cardiaques',
    'Vitamines et minéraux',
    'Autre'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>{analysis ? 'Modifier le bulletin d\'analyses' : 'Nouveau bulletin d\'analyses'}</span>
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {selectedConsultation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Analyses basées sur la consultation :</strong> {selectedConsultation.diagnostic} - 
                {new Date(selectedConsultation.date_consultation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection patient et professionnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Patient *</span>
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => handleInputChange('patient_id', e.target.value)}
                disabled={!!selectedConsultation}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.patient_id ? 'border-red-500' : 'border-gray-300'
                } ${selectedConsultation ? 'bg-gray-100' : ''}`}
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.prenom} {patient.nom} - {patient.numero_dossier}
                  </option>
                ))}
              </select>
              {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>}
              
              {selectedPatient && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Âge:</strong> {new Date().getFullYear() - new Date(selectedPatient.date_de_naissance).getFullYear()} ans | 
                    <strong> Groupe sanguin:</strong> {selectedPatient.groupe_sanguin}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Professionnel *</span>
              </label>
              <select
                value={formData.professionnel_id}
                onChange={(e) => handleInputChange('professionnel_id', e.target.value)}
                disabled={!!selectedConsultation}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.professionnel_id ? 'border-red-500' : 'border-gray-300'
                } ${selectedConsultation ? 'bg-gray-100' : ''}`}
              >
                <option value="">Sélectionner un professionnel</option>
                {professionals.filter(prof => ['médecin', 'spécialiste'].includes(prof.role)).map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.prenom} {prof.nom} - {prof.role}
                  </option>
                ))}
              </select>
              {errors.professionnel_id && <p className="text-red-500 text-sm mt-1">{errors.professionnel_id}</p>}
            </div>
          </div>

          {/* Type d'analyse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <TestTube className="h-4 w-4" />
              <span>Type d'analyse *</span>
            </label>
            <select
              value={formData.type_analyse}
              onChange={(e) => handleInputChange('type_analyse', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.type_analyse ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un type d'analyse</option>
              {analysisTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type_analyse && <p className="text-red-500 text-sm mt-1">{errors.type_analyse}</p>}
          </div>

          {/* Résultats d'analyses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Résultats d'analyses *</span>
              </label>
              <button
                type="button"
                onClick={addResult}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un résultat</span>
              </button>
            </div>

            {formData.resultats.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun résultat ajouté</p>
                <button
                  type="button"
                  onClick={addResult}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ajouter le premier résultat
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.resultats.map((result, index) => (
                  <div key={result.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Résultat {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeResult(result.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paramètre *</label>
                        <input
                          type="text"
                          value={result.parametre}
                          onChange={(e) => updateResult(result.id, 'parametre', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Hémoglobine"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valeur *</label>
                        <input
                          type="text"
                          value={result.valeur}
                          onChange={(e) => updateResult(result.id, 'valeur', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 14.2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                        <input
                          type="text"
                          value={result.unite || ''}
                          onChange={(e) => updateResult(result.id, 'unite', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: g/dL"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valeur normale</label>
                        <input
                          type="text"
                          value={result.valeur_normale || ''}
                          onChange={(e) => updateResult(result.id, 'valeur_normale', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 12-16"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                          value={result.statut}
                          onChange={(e) => updateResult(result.id, 'statut', e.target.value as 'normal' | 'anormal' | 'critique')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="normal">Normal</option>
                          <option value="anormal">Anormal</option>
                          <option value="critique">Critique</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.resultats && <p className="text-red-500 text-sm mt-1">{errors.resultats as string}</p>}
          </div>

          {/* Conclusion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>Conclusion médicale *</span>
            </label>
            <textarea
              value={formData.conclusion}
              onChange={(e) => handleInputChange('conclusion', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.conclusion ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Interprétation des résultats et recommandations..."
            />
            {errors.conclusion && <p className="text-red-500 text-sm mt-1">{errors.conclusion}</p>}
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{analysis ? 'Mettre à jour' : 'Créer le bulletin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};