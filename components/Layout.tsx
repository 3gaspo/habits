
import React from 'react';
import { ViewMode } from '../types';
import { ICONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAddModal: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, onOpenAddModal }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">HabitFlow</h1>
          <button 
            onClick={onOpenAddModal}
            className="p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
          >
            {ICONS.Plus}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 shadow-up">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <button 
            onClick={() => onViewChange(ViewMode.Home)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === ViewMode.Home ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            {ICONS.Home}
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => onViewChange(ViewMode.Calendar)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === ViewMode.Calendar ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            {ICONS.Calendar}
            <span className="text-xs mt-1">Calendar</span>
          </button>
          <button 
            onClick={() => onViewChange(ViewMode.Stats)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === ViewMode.Stats ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            {ICONS.Stats}
            <span className="text-xs mt-1">Stats</span>
          </button>
          <button 
            onClick={() => onViewChange(ViewMode.Settings)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeView === ViewMode.Settings ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            {ICONS.Settings}
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
