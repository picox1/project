// src/components/PrescriptionForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Save, X, FileText, Plus, Trash2 } from 'lucide-react';
import type { PrescriptionFormData, PrescriptionLine } from '../types/prescription';
import type { Patient } from '../types/patient';
import type { ConsultationWithDetails } from '../types/consultation';
import MEDICATIONS_DATA from '../data/medicationsData';

interface PrescriptionFormProps {
  prescription?: PrescriptionFormData;
  patients: Patient[];
  consultations?: ConsultationWithDetails[];
  selectedConsultation?: ConsultationWithDetails;
  onSave: (data: PrescriptionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  prescription,
  patients,
  consultations = [],
  selectedConsultation,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patient_id: '',
    consultation_id: '',
    lines: [{ nom: '', voie: '', quantite: 1, unite: '', frequence: '', duree: '', instruction: '' }],
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<PrescriptionFormData>>({});
  const [dropdownIdx, setDropdownIdx] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);

  // Ferme dropdown au clic extérieur
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownIdx(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Initialisation en édition ou à partir d'une consultation
  useEffect(() => {
    if (prescription) {
      setFormData(prescription);
    } else if (selectedConsultation) {
      setFormData(f => ({
        ...f,
        patient_id: selectedConsultation.patient_id,
        consultation_id: selectedConsultation.id,
      }));
    }
  }, [prescription, selectedConsultation]);

  // Mise à jour des champs génériques
  const handleField = <K extends keyof PrescriptionFormData>(
    field: K,
    value: PrescriptionFormData[K]
  ) => {
    setFormData(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  // Mise à jour d'une ligne
  const updateLine = (idx: number, field: keyof PrescriptionLine, value: any) => {
    setFormData(f => {
      const lines = [...f.lines];
      lines[idx] = { ...lines[idx], [field]: value };
      return { ...f, lines };
    });
  };

  const addLine = () => {
    setFormData(f => ({
      ...f,
      lines: [...f.lines, { nom: '', voie: '', quantite: 1, unite: '', frequence: '', duree: '', instruction: '' }],
    }));
  };

  const removeLine = (idx: number) => {
    setFormData(f => ({
      ...f,
      lines: f.lines.length > 1 ? f.lines.filter((_, i) => i !== idx) : f.lines,
    }));
  };

  // Validation minimale
  const validate = () => {
    const e: Partial<PrescriptionFormData> = {};
    if (!formData.patient_id) e.patient_id = 'Sélectionnez un patient';
    if (formData.lines.some(l => !l.nom)) e.lines = 'Chaque ligne doit avoir un médicament choisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const filteredPatients = patients;
  const filteredConsults = consultations.filter(c => c.patient_id === formData.patient_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <form
        ref={wrapperRef}
        onSubmit={onSubmit}
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span>{prescription ? 'Modifier' : 'Nouvelle'} ordonnance</span>
          </h2>
          <button type="button" onClick={onCancel}>
            <X className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* Choix du patient */}
        <div>
          <label className="font-medium">Patient *</label>
          <select
            value={formData.patient_id}
            onChange={e => handleField('patient_id', e.target.value)}
            disabled={!!selectedConsultation}
            className={`mt-1 w-full border rounded p-2 ${errors.patient_id ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">-- Choisir --</option>
            {filteredPatients.map(p => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom}
              </option>
            ))}
          </select>
          {errors.patient_id && <p className="text-red-500 text-sm">{errors.patient_id}</p>}
        </div>

        {/* Consultation associée */}
        <div>
          <label className="font-medium">Consultation (opt.)</label>
          <select
            value={formData.consultation_id}
            onChange={e => handleField('consultation_id', e.target.value)}
            className="mt-1 w-full border rounded p-2 border-gray-300"
          >
            <option value="">-- Aucune --</option>
            {filteredConsults.map(c => (
              <option key={c.id} value={c.id}>
                {c.diagnostic} – {new Date(c.date_consultation).toLocaleDateString('fr-FR')}
              </option>
            ))}
          </select>
        </div>

        {/* Lignes de prescription */}
        <div>
          <label className="font-medium">Médicaments *</label>
          {formData.lines.map((line, i) => {
            const query = line.nom;
            const suggestions =
              query.length > 1
                ? MEDICATIONS_DATA.filter(m =>
                    m.nom.toLowerCase().includes(query.toLowerCase())
                  )
                : [];

            return (
              <div key={i} className="flex items-center space-x-2 mt-2 relative">
                <div className="flex-1">
                  <input
                    type="text"
                    value={line.nom}
                    onChange={e => {
                      updateLine(i, 'nom', e.target.value);
                      setDropdownIdx(e.target.value.trim().length > 0 ? i : null);
                    }}
                    onFocus={() => setDropdownIdx(i)}
                    onBlur={() => setTimeout(() => setDropdownIdx(null), 200)}
                    placeholder="Chercher un médicament..."
                    className="w-full border rounded p-2"
                  />
                  {dropdownIdx === i && suggestions.length > 0 && (
                    <ul className="absolute bg-white border rounded shadow w-full max-h-40 overflow-auto z-10">
                      {suggestions.slice(0, 20).map(m => (
                        <li
                          key={m.nom}
                          onMouseDown={e => {
                            e.preventDefault();
                            updateLine(i, 'nom', m.nom);
                            updateLine(i, 'voie', m.voie ?? '');
                            updateLine(i, 'quantite', m.quantite ?? 1);
                            updateLine(i, 'unite', m.unite ?? '');
                            updateLine(i, 'frequence', m.frequence ?? '');
                            updateLine(i, 'duree', m.duree ?? '');
                            updateLine(i, 'instruction', m.instruction ?? '');
                            setDropdownIdx(null);
                          }}
                          className="px-3 py-2 hover:bg-green-100 cursor-pointer flex justify-between"
                        >
                          <span>{m.nom}</span>
                          <small className="text-gray-500">{m.voie}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="voie"
                  value={line.voie}
                  onChange={e => updateLine(i, 'voie', e.target.value)}
                  className="w-20 border rounded p-2"
                />
                <input
                  type="number"
                  min={1}
                  value={line.quantite}
                  onChange={e => updateLine(i, 'quantite', Number(e.target.value))}
                  className="w-16 border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="unité"
                  value={line.unite}
                  onChange={e => updateLine(i, 'unite', e.target.value)}
                  className="w-20 border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="fréq."
                  value={line.frequence}
                  onChange={e => updateLine(i, 'frequence', e.target.value)}
                  className="w-24 border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="durée"
                  value={line.duree}
                  onChange={e => updateLine(i, 'duree', e.target.value)}
                  className="w-20 border rounded p-2"
                />
                <button type="button" onClick={() => removeLine(i)} className="p-1 text-red-500">
                  <Trash2 />
                </button>
              </div>
            );
          })}
          {errors.lines && <p className="text-red-500 text-sm mt-1">{errors.lines}</p>}
          <button type="button" onClick={addLine} className="mt-2 flex items-center space-x-1 text-green-600">
            <Plus className="h-4 w-4" /> <span>Ajouter un médicament</span>
          </button>
        </div>

        {/* Notes libres */}
        <div>
          <label className="font-medium">Instructions / Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => handleField('notes', e.target.value)}
            rows={3}
            className="mt-1 w-full border rounded p-2 border-gray-300"
          />
        </div>

        {/* Footer */}
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
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>{prescription ? 'Mettre à jour' : 'Créer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
