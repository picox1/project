// 8. src/pages/MedicamentsPage.tsx
import React, { useState } from 'react';
import { MedicamentList } from '../components/MedicamentList';
import { MedicamentForm } from '../components/MedicamentForm';
import { Medicament } from '../services/medicamentsService';

export default function MedicamentsPage() {
  const [editing, setEditing] = useState<Medicament | undefined>(undefined);
  const refresh = () => setEditing(undefined);
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gestion des médicaments</n2>
      <MedicamentForm defaultValues={editing} onSaved={refresh} />
      <MedicamentList onEdit={setEditing} />
    </div>
  );
}