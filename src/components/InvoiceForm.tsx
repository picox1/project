import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  X,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  FileText,
  Trash2
} from 'lucide-react';
import type { InvoiceFormData, ActeMedical } from '../types/billing';
import type { Patient } from '../types/patient';
import type { ConsultationWithDetails } from '../types/consultation';
import ACTES_MEDICO_DATA from '../data/actesMedicoData';

interface InvoiceFormProps {
  invoice?: {
    patient_id: string;
    consultation_id?: string;
    actes?: ActeMedical[];
    montant_total: number;
    description?: string;
  };
  patients: Patient[];
  consultations?: ConsultationWithDetails[];
  selectedConsultation?: ConsultationWithDetails;
  onSave: (data: InvoiceFormData) => void;
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
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    patient_id: '',
    consultation_id: '',
    actes: [{ nom: '', quantite: 1, prix_unitaire: 0 }],
    montant_total: 0,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<InvoiceFormData>>({});
  const [dropdownIdx, setDropdownIdx] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);

  /** Ferme le dropdown si click en dehors */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownIdx(null);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  /** Initialise formData si édition ou consultation sélectionnée */
  useEffect(() => {
    if (invoice) {
      setFormData({
        patient_id: invoice.patient_id,
        consultation_id: invoice.consultation_id ?? '',
        actes:
          invoice.actes && invoice.actes.length > 0
            ? invoice.actes
            : [{ nom: '', quantite: 1, prix_unitaire: 0 }],
        montant_total: invoice.montant_total,
        description: invoice.description ?? '',
      });
    } else if (selectedConsultation) {
      setFormData(f => ({
        ...f,
        patient_id: selectedConsultation.patient_id,
        consultation_id: selectedConsultation.id,
        description: `Consultation du ${new Date(
          selectedConsultation.date_consultation
        ).toLocaleDateString('fr-FR')} – ${selectedConsultation.diagnostic}`,
      }));
    }
  }, [invoice, selectedConsultation]);

  /** Re-calcul automatique du montant total */
  useEffect(() => {
    const total = formData.actes.reduce(
      (sum, a) => sum + a.quantite * a.prix_unitaire,
      0
    );
    setFormData(f => ({ ...f, montant_total: total }));
  }, [formData.actes]);

  /** Met à jour un champ simple */
  const handleField = <K extends keyof InvoiceFormData>(
    field: K,
    value: InvoiceFormData[K]
  ) => {
    setFormData(f => ({ ...f, [field]: value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  /** Met à jour un acte (nom, quantité ou prix) */
  const updateActe = (
    idx: number,
    field: keyof ActeMedical,
    value: string | number
  ) => {
    setFormData(f => {
      const actes = [...f.actes];
      if (field === 'nom') {
        const nom = (value as string).trim();
        actes[idx].nom = nom;
        const found = ACTES_MEDICO_DATA.find(
          item => item.nom.toLowerCase() === nom.toLowerCase()
        );
        actes[idx].prix_unitaire = found ? found.prix_unitaire : 0;
      } else {
        actes[idx][field] = Number(value);
      }
      return { ...f, actes };
    });
  };

  const addActe = () =>
    setFormData(f => ({
      ...f,
      actes: [...f.actes, { nom: '', quantite: 1, prix_unitaire: 0 }],
    }));

  const removeActe = (idx: number) =>
    setFormData(f => ({
      ...f,
      actes:
        f.actes.length > 1 ? f.actes.filter((_, i) => i !== idx) : f.actes,
    }));

  /** Validation avant envoi */
  const validate = () => {
    const e: Partial<InvoiceFormData> = {};
    if (!formData.patient_id) e.patient_id = 'Sélectionnez un patient';
    if (formData.montant_total <= 0)
      e.montant_total = 'Le montant doit être > 0';
    if (formData.actes.some(a => !a.nom || a.prix_unitaire === 0))
      e.actes = 'Chaque acte doit être choisi dans la liste';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <form
        ref={wrapperRef}
        onSubmit={onSubmit}
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto p-6 space-y-6"
      >
        {/** — Header — */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>{invoice ? 'Modifier' : 'Nouvelle'} facture</span>
          </h2>
          <button type="button" onClick={onCancel}>
            <X className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/** — Sélection du patient — */}
        <div>
          <label className="font-medium flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>Patient *</span>
          </label>
          <select
            value={formData.patient_id}
            onChange={e => handleField('patient_id', e.target.value)}
            disabled={!!selectedConsultation}
            className={`mt-1 w-full border rounded p-2 ${
              errors.patient_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">-- Choisir --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom}
              </option>
            ))}
          </select>
          {errors.patient_id && (
            <p className="text-red-500 text-sm">{errors.patient_id}</p>
          )}
          {selectedPatient && (
            <p className="text-sm text-gray-600 mt-1">
              Tél: {selectedPatient.telephone} | Email:{' '}
              {selectedPatient.email ?? '—'}
            </p>
          )}
        </div>

        {/** — Consultation associée — */}
        <div>
          <label className="font-medium flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Consultation (opt.)</span>
          </label>
          <select
            value={formData.consultation_id}
            onChange={e => handleField('consultation_id', e.target.value)}
            className="mt-1 w-full border rounded p-2 border-gray-300"
          >
            <option value="">-- Aucune --</option>
            {consultations
              .filter(c => c.patient_id === formData.patient_id)
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.diagnostic} –{' '}
                  {new Date(c.date_consultation).toLocaleDateString(
                    'fr-FR'
                  )}
                </option>
              ))}
          </select>
        </div>

        {/** — Actes médicaux — */}
        <div>
          <label className="font-medium flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>Actes médicaux *</span>
          </label>
          {formData.actes.map((acte, i) => {
            const query = acte.nom;
            const list =
              query.length > 1
                ? ACTES_MEDICO_DATA.filter(a =>
                    a.nom.toLowerCase().includes(query.toLowerCase())
                  )
                : [];
            return (
              <div
                key={i}
                className="flex items-center space-x-2 mt-2 relative"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={acte.nom}
                    onChange={e => {
                      updateActe(i, 'nom', e.target.value);
                      setDropdownIdx(
                        e.target.value.trim().length > 0 ? i : null
                      );
                    }}
                    onFocus={() => setDropdownIdx(i)}
                    onBlur={() => setTimeout(() => setDropdownIdx(null), 200)}
                    placeholder="Tapez pour chercher..."
                    className="w-full border rounded p-2"
                  />
                  {dropdownIdx === i && list.length > 0 && (
                    <ul className="absolute bg-white border rounded shadow w-full max-h-48 overflow-auto z-10">
                      {list.slice(0, 20).map(item => (
                        <li
                          key={item.nom}
                          onMouseDown={e => {
                            e.preventDefault();
                            updateActe(i, 'nom', item.nom);
                            updateActe(i, 'prix_unitaire', item.prix_unitaire);
                            setDropdownIdx(null);
                          }}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer flex justify-between"
                        >
                          {item.nom}
                          <span className="text-sm text-gray-500">
                            {item.prix_unitaire} F
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  type="number"
                  min={1}
                  value={acte.quantite}
                  onChange={e =>
                    updateActe(i, 'quantite', Number(e.target.value))
                  }
                  className="w-16 border rounded p-2"
                />
                <input
                  type="number"
                  min={0}
                  value={acte.prix_unitaire}
                  readOnly
                  className="w-24 border rounded p-2 bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => removeActe(i)}
                  className="p-1 text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            );
          })}
          {errors.actes && (
            <p className="text-red-500 text-sm mt-1">{errors.actes}</p>
          )}
          <button
            type="button"
            onClick={addActe}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Ajouter un acte
          </button>
        </div>

        {/** — Montant total — */}
        <div>
          <label className="font-medium flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>Montant total</span>
          </label>
          <input
            type="number"
            readOnly
            value={formData.montant_total}
            className="mt-1 w-full border rounded p-2 bg-gray-100"
          />
          {errors.montant_total && (
            <p className="text-red-500 text-sm">
              {errors.montant_total}
            </p>
          )}
        </div>

        {/** — Footer — */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
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
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-1" />
            {invoice ? 'Mettre à jour' : 'Créer'} facture
          </button>
        </div>
      </form>
    </div>
  );
};
