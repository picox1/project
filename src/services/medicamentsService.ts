// 2. src/services/medicamentsService.ts
export interface Medicament {
  id: string;
  name: string;
  voie: string;
  posologie: string;
}

let medicaments: Medicament[] = [
  { id: '1', name: 'Paracétamol', voie: 'Orale', posologie: '500mg toutes les 6h' },
  // ajouter d'autres médicaments en base factice
];

export const MedicamentsService = {
  list: (): Promise<Medicament[]> => Promise.resolve(medicaments),
  get: (id: string): Promise<Medicament | undefined> => Promise.resolve(medicaments.find(m => m.id === id)),
  create: (item: Omit<Medicament, 'id'>): Promise<Medicament> => {
    const newMed: Medicament = { id: Date.now().toString(), ...item };
    medicaments.push(newMed);
    return Promise.resolve(newMed);
  },
  update: (id: string, data: Partial<Medicament>): Promise<Medicament | undefined> => {
    const index = medicaments.findIndex(m => m.id === id);
    if (index === -1) return Promise.resolve(undefined);
    medicaments[index] = { ...medicaments[index], ...data };
    return Promise.resolve(medicaments[index]);
  },
  remove: (id: string): Promise<boolean> => {
    const before = medicaments.length;
    medicaments = medicaments.filter(m => m.id !== id);
    return Promise.resolve(medicaments.length < before);
  }
};