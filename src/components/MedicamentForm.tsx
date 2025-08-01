// 6. src/components/MedicamentForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MedicamentsService, Medicament } from '../services/medicamentsService';
import { Button } from '@/components/ui/button';

interface FormData { name: string; voie: string; posologie: string }
export function MedicamentForm({ onSaved, defaultValues }: { onSaved: () => void; defaultValues?: Medicament }) {
  const { register, handleSubmit, reset } = useForm<FormData>({ defaultValues });
  useEffect(() => { if (defaultValues) reset(defaultValues); }, [defaultValues]);
  const submit = async (data: FormData) => {
    if (defaultValues) await MedicamentsService.update(defaultValues.id, data);
    else await MedicamentsService.create(data);
    onSaved(); reset({ name: '', voie: '', posologie: '' });
  };
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-2 p-4 border rounded">
      <input {...register('name')} placeholder="Nom médicament" className="w-full p-2 border rounded" />
      <input {...register('voie')} placeholder="Voie d'administration" className="w-full p-2 border rounded" />
      <input {...register('posologie')} placeholder="Posologie" className="w-full p-2 border rounded" />
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
