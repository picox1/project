// 1. src/services/actesService.ts
export interface Acte {
  id: string;
  code: string;
  description: string;
  tarif: number;
}

let actes: Acte[] = [
  { id: '1', code: 'CONS', description: 'Consultation générale', tarif: 10000 },
  // ajouter d'autres actes déjà en base factice
];

export const ActesService = {
  list: (): Promise<Acte[]> => Promise.resolve(actes),
  get: (id: string): Promise<Acte | undefined> => Promise.resolve(actes.find(a => a.id === id)),
  create: (item: Omit<Acte, 'id'>): Promise<Acte> => {
    const newActe: Acte = { id: Date.now().toString(), ...item };
    actes.push(newActe);
    return Promise.resolve(newActe);
  },
  update: (id: string, data: Partial<Acte>): Promise<Acte | undefined> => {
    const index = actes.findIndex(a => a.id === id);
    if (index === -1) return Promise.resolve(undefined);
    actes[index] = { ...actes[index], ...data };
    return Promise.resolve(actes[index]);
  },
  remove: (id: string): Promise<boolean> => {
    const before = actes.length;
    actes = actes.filter(a => a.id !== id);
    return Promise.resolve(actes.length < before);
  }
};