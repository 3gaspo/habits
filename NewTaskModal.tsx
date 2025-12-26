
import React, { useState } from 'react';
import { PeriodType } from '../types';

interface NewTaskModalProps {
  onClose: () => void;
  onAdd: (title: string, period: PeriodType) => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<PeriodType>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), period);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">Add Habit</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Read for 30 mins"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors text-lg font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Repeat Frequency</label>
            <div className="flex bg-slate-50 p-1 rounded-2xl border-2 border-slate-100">
              {(['daily', 'weekly', 'monthly'] as PeriodType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPeriod(type)}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all capitalize ${period === type ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={!title.trim()}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
            >
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
