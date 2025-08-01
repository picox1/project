// 4. src/components/ActeForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ActesService, Acte } from '../services/actesService';
import { Button } from '@/components/ui/button';

interface FormData { code: string; description: string; tarif: number }
export function ActeForm({ onSaved, defaultValues }: { onSaved: () => void; defaultValues?: Acte }) {
  const { register, handleSubmit, reset } = useForm<FormData>({ defaultValues });
  useEffect(() => { if (defaultValues) reset(defaultValues); }, [defaultValues]);
  const submit = async (data: FormData) => {
    if (defaultValues) await ActesService.update(defaultValues.id, data);
    else await ActesService.create(data);
    onSaved(); reset({ code: '', description: '', tarif: 0 });
  };
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-2 p-4 border rounded">
      <input {...register('code')} placeholder="Code acte" className="w-full p-2 border rounded" />
      <input {...register('description')} placeholder="Description" className="w-full p-2 border rounded" />
      <input type="number" {...register('tarif')} placeholder="Tarif FCFA" className="w-full p-2 border rounded" />
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}