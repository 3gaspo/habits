
import React from 'react';
import { AppState, PeriodType, PeriodSnapshot, TaskTemplate } from '../types';
import { format } from 'date-fns';
import { Trash2, Download, RefreshCcw, AlertTriangle, LogOut } from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
  getSnapshot: (date: Date, type: PeriodType) => PeriodSnapshot;
  onDeleteTemplate: (id: string) => void;
  onDeleteOneOff: (date: Date, type: PeriodType, id: string) => void;
  onResetAll: () => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, getSnapshot, onDeleteTemplate, onDeleteOneOff, onResetAll, onLogout }) => {
  const now = new Date();
  
  const activeTemplates = state.templates.filter(t => t.active);
  
  // Get current one-off tasks for management
  const dailySnap = getSnapshot(now, 'daily');
  const weeklySnap = getSnapshot(now, 'weekly');
  const monthlySnap = getSnapshot(now, 'monthly');

  const exportToCSV = () => {
    const headers = ['Period Type', 'Period Key', 'Total Tasks', 'Completed Tasks', 'Ratio (%)', 'Recurring Tasks', 'One-Off Tasks'];
    const rows = Object.values(state.snapshots).map((snap: any) => {
      const recurringTotal = snap.dueTaskIds.length;
      const recurringCompleted = Object.values(snap.completionMap).filter(Boolean).length;
      const oneOffTotal = snap.oneOffTasks.length;
      const oneOffCompleted = snap.oneOffTasks.filter((t: any) => t.completed).length;
      const total = recurringTotal + oneOffTotal;
      const completed = recurringCompleted + oneOffCompleted;
      const ratio = total === 0 ? 0 : Math.round((completed / total) * 100);

      const recurringDetails = snap.dueTaskIds.map((id: string) => {
        const t = state.templates.find(temp => temp.id === id);
        return `${t?.title || id}: ${snap.completionMap[id] ? 'Done' : 'Pending'}`;
      }).join(' | ');

      const oneOffDetails = snap.oneOffTasks.map((t: any) => 
        `${t.title}: ${t.completed ? 'Done' : 'Pending'}`
      ).join(' | ');

      return [
        snap.periodType,
        snap.periodKey,
        total,
        completed,
        ratio,
        `"${recurringDetails}"`,
        `"${oneOffDetails}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `habitflow_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-extrabold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Manage habits and system data</p>
      </div>

      <div className="space-y-6 mb-10">
        <h3 className="text-sm font-bold text-slate-800 px-2 uppercase tracking-wide">Recurring Habits</h3>
        <div className="space-y-2">
          {activeTemplates.map(t => (
            <div key={t.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center group">
              <div>
                <p className="font-bold text-slate-800">{t.title}</p>
                <p className="text-xs text-slate-400 capitalize">{t.period} • Started {format(t.createdAt, 'MMM d')}</p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(`Stop tracking "${t.title}" from today onwards? (Past history will be preserved)`)) {
                    onDeleteTemplate(t.id);
                  }
                }}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {activeTemplates.length === 0 && (
            <p className="text-center py-4 text-slate-400 text-sm italic">No active recurring habits.</p>
          )}
        </div>
      </div>

      <div className="space-y-6 mb-10">
        <h3 className="text-sm font-bold text-slate-800 px-2 uppercase tracking-wide">Current One-Off Tasks</h3>
        <div className="space-y-2">
          {[dailySnap, weeklySnap, monthlySnap].map(snap => (
            snap.oneOffTasks.map(t => (
              <div key={t.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center group">
                <div>
                  <p className="font-bold text-slate-600 italic">{t.title}</p>
                  <p className="text-xs text-slate-400 capitalize">{snap.periodType} • {t.completed ? 'Completed' : 'Active'}</p>
                </div>
                <button 
                  onClick={() => onDeleteOneOff(now, snap.periodType, t.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ))}
          {dailySnap.oneOffTasks.length === 0 && weeklySnap.oneOffTasks.length === 0 && monthlySnap.oneOffTasks.length === 0 && (
            <p className="text-center py-4 text-slate-400 text-sm italic">No one-off tasks in current periods.</p>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 px-2 uppercase tracking-wide text-red-500">System & Utilities</h3>
        <div className="grid grid-cols-1 gap-3 px-1">
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Download size={18} />
            Export History (CSV)
          </button>
          
          <button 
            onClick={onResetAll}
            className="flex items-center justify-center gap-2 w-full py-4 bg-red-50 border-2 border-red-100 text-red-600 font-bold rounded-2xl shadow-sm hover:bg-red-100 transition-all active:scale-95"
          >
            <RefreshCcw size={18} />
            Reset All Data
          </button>

          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center px-4 mt-2">
          <AlertTriangle size={10} className="inline mr-1 mb-0.5" />
          Data is stored locally in your browser. Clearing browser cache may delete your progress.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
