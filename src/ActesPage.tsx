// 7. src/pages/ActesPage.tsx
import React, { useState } from 'react';
import { ActeList } from '../components/ActeList';
import { ActeForm } from '../components/ActeForm';
import { Acte } from '../services/actesService';

export default function ActesPage() {
  const [editing, setEditing] = useState<Acte | undefined>(undefined);
  const refresh = () => setEditing(undefined);
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gestion des actes médicaux</h2>
      <ActeForm defaultValues={editing} onSaved={refresh} />
      <ActeList onEdit={setEditing} />
    </div>
  );
}