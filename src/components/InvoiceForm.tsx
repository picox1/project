// src/components/InvoiceForm.tsx
import React, { useState, useEffect } from 'react';
import { Save, X, CreditCard, User, Calendar, DollarSign, FileText, Trash2 } from 'lucide-react';
import { Invoice, InvoiceFormData, ActeMedical } from '../types/billing';
import { Patient } from '../types/patient';
import { ConsultationWithDetails } from '../types/consultation';
import ACTES_MEDICO_DATA, { ActeMedicalData } from '../data/actesMedicoData';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  patients: Patient[];
  consultations?: ConsultationWithDetails[];
  selectedConsultation?: ConsultationWithDetails | null;
  onSave: (invoiceData: InvoiceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  patients,
  consultations = [],
  selectedConsultation,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    patient_id: '',
    consultation_id: '',
    actes: [{ nom: '', quantite: 1, prix_unitaire: 0 }],
    montant_total: 0,
    description: ''
  });
  const [errors, setErrors] = useState<Partial<InvoiceFormData>>({});
  const [dropdownIdx, setDropdownIdx] = useState<number | null>(null);

  // Initialisation en cas de modification ou consultation pré-sélectionnée
  useEffect(() => {
    if (invoice) {
      setFormData({
        patient_id: invoice.patient_id,
        consultation_id: invoice.consultation_id || '',
        actes: invoice.actes && invoice.actes.length > 0
          ? invoice.actes
          : [{ nom: '', quantite: 1, prix_unitaire: 0 }],
        montant_total: invoice.montant_total,
        description: invoice.description || ''
      });
    } else if (selectedConsultation) {
      setFormData(fd => ({
        ...fd,
        patient_id: selectedConsultation.patient_id,
        consultation_id: selectedConsultation.id,
        description: `Consultation du ${new Date(selectedConsultation.date_consultation).toLocaleDateString('fr-FR')} – ${selectedConsultation.diagnostic}`
      }));
    }
  }, [invoice, selectedConsultation]);

  // Recalcul du total
  useEffect(() => {
    const total = formData.actes.reduce(
      (sum, a) => sum + a.quantite * a.prix_unitaire,
      0
    );
    setFormData(fd => ({ ...fd, montant_total: total }));
  }, [formData.actes]);

  // Change any field of un acte
  const updateActe = (idx: number, updated: Partial<ActeMedical>) => {
    setFormData(fd => {
      const actes = [...fd.actes];
      actes[idx] = { ...actes[idx], ...updated };
      return { ...fd, actes };
    });
  };

  // Sélection dans la dropdown
  const pickActe = (idx: number, acte: ActeMedicalData) => {
    updateActe(idx, { nom: acte.nom, prix_unitaire: acte.prix_unitaire });
    setDropdownIdx(null);
  };

  const addActe = () =>
    setFormData(fd => ({
      ...fd,
      actes: [...fd.actes, { nom: '', quantite: 1, prix_unitaire: 0 }]
    }));

  const removeActe = (idx: number) =>
    setFormData(fd => ({
      ...fd,
      actes: fd.actes.filter((_, i) => i !== idx)
    }));

  // Validation
  const validate = (): boolean => {
    const errs: Partial<InvoiceFormData> = {};
    if (!formData.patient_id) errs.patient_id = 'Sélectionnez un patient';
    if (formData.montant_total <= 0) errs.montant_total = 'Le montant doit être > 0';
    if (
      formData.actes.some(a => !a.nom) ||
      formData.actes.length === 0
    ) {
      errs.actes = 'Ajoutez au moins un acte valide';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  const handleField = <K extends keyof InvoiceFormData>(field: K, value: InvoiceFormData[K]) => {
    setFormData(fd => ({ ...fd, [field]: value }));
    setErrors(errs => ({ ...errs, [field]: undefined }));
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* En‑tête */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span>{invoice ? 'Modifier la facture' : 'Nouvelle facture'}</span>
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient */}
          <div>
            <label className="block mb-1 font-medium">Patient *</label>
            <select
              value={formData.patient_id}
              onChange={e => handleField('patient_id', e.target.value)}
              className={`w-full border p-2 rounded ${errors.patient_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Sélectionnez --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom}
                </option>
              ))}
            </select>
            {errors.patient_id && <p className="mt-1 text-red-500">{errors.patient_id}</p>}
            {selectedPatient && (
              <p className="mt-1 text-sm text-gray-600">
                📞 {selectedPatient.telephone} • ✉️ {selectedPatient.adresse}
              </p>
            )}
          </div>

          {/* Consultation liée */}
          {!selectedConsultation && (
            <div>
              <label className="block mb-1 font-medium">Consultation (optionnel)</label>
              <select
                value={formData.consultation_id}
                onChange={e => handleField('consultation_id', e.target.value)}
                className="w-full border p-2 rounded border-gray-300"
              >
                <option value="">Aucune</option>
                {consultations
                  .filter(c => c.patient_id === formData.patient_id)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.diagnostic} — {new Date(c.date_consultation).toLocaleDateString()}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Actes */}
          <div>
            <label className="block mb-1 font-medium">Actes médicaux *</label>
            {formData.actes.map((acte, idx) => {
              const query = acte.nom.toLowerCase();
              const suggestions = query.length > 0
                ? ACTES_MEDICO_DATA.filter(a =>
                    a.nom.toLowerCase().includes(query)
                  )
                : [];
              return (
                <div key={idx} className="flex items-center gap-2 mb-2 relative">
                  {/* Input auto‑complétion */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={acte.nom}
                      onChange={e => updateActe(idx, { nom: e.target.value })}
                      onFocus={() => setDropdownIdx(idx)}
                      className="w-full border p-2 rounded"
                      placeholder="Nom de l'acte"
                    />
                    {dropdownIdx === idx && suggestions.length > 0 && (
                      <ul className="absolute z-10 bg-white border rounded shadow mt-1 w-full max-h-40 overflow-auto">
                        {suggestions.map(a => (
                          <li
                            key={a.nom}
                            className="p-2 hover:bg-blue-100 cursor-pointer flex justify-between"
                            onMouseDown={e => {
                              e.preventDefault();
                              pickActe(idx, a);
                            }}
                          >
                            <span>{a.nom}</span>
                            <span className="text-sm text-gray-500">
                              {a.prix_unitaire} CFA
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Quantité */}
                  <input
                    type="number"
                    min={1}
                    value={acte.quantite}
                    onChange={e => updateActe(idx, { quantite: Number(e.target.value) })}
                    className="w-20 border p-2 rounded"
                  />
                  {/* Prix unitaire */}
                  <input
                    type="number"
                    min={0}
                    value={acte.prix_unitaire}
                    onChange={e => updateActe(idx, { prix_unitaire: Number(e.target.value) })}
                    className="w-28 border p-2 rounded bg-gray-100"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => removeActe(idx)}
                    className="p-2 text-red-500"
                  >
                    <Trash2 />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addActe}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              + Ajouter un acte
            </button>
            {errors.actes && <p className="mt-1 text-red-500">{errors.actes}</p>}
          </div>

          {/* Montant total */}
          <div>
            <label className="block mb-1 font-medium">Montant total</label>
            <input
              type="number"
              value={formData.montant_total}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />
            {errors.montant_total && <p className="mt-1 text-red-500">{errors.montant_total}</p>}
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isLoading ? '…' : <span className="flex items-center gap-1"><Save /> Enregistrer</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
