// 5. src/components/MedicamentList.tsx
import React, { useEffect, useState } from 'react';
import { MedicamentsService, Medicament } from '../services/medicamentsService';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';

export function MedicamentList({ onEdit }: { onEdit: (m: Medicament) => void }) {
  const [items, setItems] = useState<Medicament[]>([]);
  useEffect(() => { MedicamentsService.list().then(setItems); }, []);
  const remove = async (id: string) => { await MedicamentsService.remove(id); setItems(await MedicamentsService.list()); };
  return (
    <div className="space-y-2">
      {items.map(m => (
        <div key={m.id} className="flex justify-between p-2 border rounded">
          <div>{m.name} – {m.voie} – {m.posologie}</div>
          <div className="space-x-2">
            <Button size="sm" onClick={() => onEdit(m)}><Edit size={16} /></Button>
            <Button size="sm" variant="destructive" onClick={() => remove(m.id)}><Trash size={16} /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}
