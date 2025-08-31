
import React, { useEffect, useState } from 'react';
import { Intervention } from '../../types';

interface AddInterventionModalProps {
  modalState: {
    isOpen: boolean;
    intervention: Intervention | null;
  };
  onClose: () => void;
  onSave: (intervention: Omit<Intervention, 'id' | 'created_at' | 'updated_at'> & { id?: number }) => void;
}

const AddInterventionModal: React.FC<AddInterventionModalProps> = ({ modalState, onClose, onSave }) => {
  const { isOpen, intervention: initialData } = modalState;
  const [nombre, setNombre] = useState('');
  const [numeros, setNumeros] = useState('');
  const [caso, setCaso] = useState('');
  const [fecha, setFecha] = useState('');
  const [estado, setEstado] = useState<Intervention['estado']>('Pendiente');

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setNumeros(initialData.numeros);
      setCaso(initialData.caso);
      setFecha(initialData.fecha);
      setEstado(initialData.estado);
    } else {
      setNombre('');
      setNumeros('');
      setCaso('');
      setFecha('');
      setEstado('Pendiente');
    }
  }, [initialData, isOpen]);

  const normalizeNumeros = (value: string): string => {
    const matches = (value.match(/\d{7,13}/g) || []).map(n => {
      let num = n;
      if (num.startsWith('57') && num.length === 12) num = num.slice(2);
      if (num.length > 10) num = num.slice(-10);
      return num;
    });
    const tenDigits = matches.filter(n => n.length === 10);
    const unique = tenDigits.filter((v, i, a) => a.indexOf(v) === i);
    return unique.join(', ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      nombre,
      numeros: normalizeNumeros(numeros),
      caso,
      fecha,
      estado,
      // Remove userId since it's not part of the Intervention type
      // Remove created_at since it's excluded in the type definition
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">{initialData ? 'Editar Intervención' : 'Añadir Intervención'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
            <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="numeros" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Números</label>
            <input id="numeros" type="text" value={numeros} onChange={(e) => setNumeros(e.target.value)} placeholder="Ej: 3023887093, +57 3023887093" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Se guardará en formato canónico: 10 dígitos únicos separados por coma.</p>
          </div>

          <div>
            <label htmlFor="caso" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Caso</label>
            <textarea id="caso" value={caso} onChange={(e) => setCaso(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
              <input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
              <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as Intervention['estado'])} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInterventionModal;