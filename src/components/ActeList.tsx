// 3. src/components/ActeList.tsx
import React, { useEffect, useState } from 'react';
import { ActesService, Acte } from '../services/actesService';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';

export function ActeList({ onEdit }: { onEdit: (acte: Acte) => void }) {
  const [items, setItems] = useState<Acte[]>([]);
  useEffect(() => { ActesService.list().then(setItems); }, []);
  const remove = async (id: string) => { await ActesService.remove(id); setItems(await ActesService.list()); };
  return (
    <div className="space-y-2">
      {items.map(acte => (
        <div key={acte.id} className="flex justify-between p-2 border rounded">
          <div>{acte.code} – {acte.description} ({acte.tarif} FCFA)</div>
          <div className="space-x-2">
            <Button size="sm" onClick={() => onEdit(acte)}><Edit size={16} /></Button>
            <Button size="sm" variant="destructive" onClick={() => remove(acte.id)}><Trash size={16} /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}