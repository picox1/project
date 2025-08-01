import React, { useState, useEffect, useRef } from 'react';
import { Save, X, FileText, Calendar } from 'lucide-react';
import type {
  PrescriptionFormData,
  PrescriptionItem
} from '../types/prescription';
import type { Patient } from '../types/patient';
import type { ConsultationWithDetails } from '../types/consultation';
import MEDICATIONS_DATA, { MedicationData } from '../data/medicationsData';

interface PrescriptionFormProps {
  /* … */
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  /* … */
}) => {
  /* états, refs, effets identiques */

  const updateItem = (
    idx: number,
    field: keyof PrescriptionItem,
    value: any
  ) => {
    setFormData(f => {
      const items = [...f.items];
      if (field === 'nom') {
        items[idx].nom = value;
        // on récupère toutes les options pour ce médicament
        const med = MEDICATIONS_DATA.find(m => m.nom === value);
        items[idx].voie = '';
        items[idx].quantite = 1;
        items[idx].unite = '';
        items[idx].frequence = '';
        items[idx].duree = '';
        items[idx].instruction = '';
        if (med) {
          // on garde la liste d’options en mémoire pour le rendu
          (items[idx] as any)._options = med;
        }
      } else {
        items[idx][field] = value;
      }
      return { ...f, items };
    });
  };

  const getOptions = (idx: number): MedicationData | null => {
    return (formData.items[idx] as any)._options || null;
  };

  return (
    <div> 
      {/* … en-tête, patient, consultation identiques */}
      <div>
        <label>Médicaments *</label>
        <div className="grid grid-cols-7 gap-2">
          {/* entêtes */}
        </div>
        {formData.items.map((it, i) => {
          const opts = getOptions(i);
          return (
            <div key={i} className="grid grid-cols-7 gap-2">
              {/* Nom avec dropdown de noms */}
              <div>
                <input
                  value={it.nom}
                  onChange={e => updateItem(i, 'nom', e.target.value)}
                  /* affiche liste filtée de MEDICATIONS_DATA.map(m=>m.nom) */
                />
              </div>

              {/* Voie */}
              <div>
                <select
                  value={it.voie}
                  onChange={e => updateItem(i, 'voie', e.target.value)}
                  disabled={!opts}
                >
                  <option value="">—</option>
                  {opts?.voie.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Quantité */}
              <div>
                <select
                  value={it.quantite}
                  onChange={e => updateItem(i, 'quantite', Number(e.target.value))}
                  disabled={!opts}
                >
                  {opts?.quantite.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {/* Unité */}
              <div>
                <select
                  value={it.unite}
                  onChange={e => updateItem(i, 'unite', e.target.value)}
                  disabled={!opts}
                >
                  <option value="">—</option>
                  {opts?.unite.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Fréquence */}
              <div>
                <select
                  value={it.frequence}
                  onChange={e => updateItem(i, 'frequence', e.target.value)}
                  disabled={!opts}
                >
                  <option value="">—</option>
                  {opts?.frequence.map(fq => (
                    <option key={fq} value={fq}>{fq}</option>
                  ))}
                </select>
              </div>

              {/* Durée */}
              <div>
                <select
                  value={it.duree}
                  onChange={e => updateItem(i, 'duree', e.target.value)}
                  disabled={!opts}
                >
                  <option value="">—</option>
                  {opts?.duree.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Instruction */}
              <div>
                <select
                  value={it.instruction}
                  onChange={e => updateItem(i, 'instruction', e.target.value)}
                  disabled={!opts}
                >
                  <option value="">—</option>
                  {opts?.instruction.map(ins => (
                    <option key={ins} value={ins}>{ins}</option>
                  ))}
                </select>
              </div>

              {/* supprimer */}
              <div>
                <button onClick={() => removeItem(i)}>✕</button>
              </div>
            </div>
          );
        })}
        <button onClick={addItem}>+ Ajouter un médicament</button>
      </div>
      {/* … reste du formulaire identique */}
    </div>
  );
};
