
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import CalendarView from './views/CalendarView';
import StatsView from './views/StatsView';
import SettingsView from './views/SettingsView';
import AuthView from './views/AuthView';
import NewTaskModal from './components/NewTaskModal';
import { ViewMode } from './types';
import { useHabits } from './hooks/useHabits';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.Home);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    state, 
    loading: dbLoading,
    syncError,
    getSnapshot, 
    toggleTask, 
    addTask, 
    addOneOffTask, 
    toggleOneOffTask, 
    deleteOneOffTask,
    deleteTemplate, 
    resetAllData 
  } = useHabits(currentUser?.uid || null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleReset = () => {
    if (resetAllData()) {
      setActiveView(ViewMode.Home);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (authInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Checking Authentication...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView />;
  }

  const renderView = () => {
    const errorBanner = syncError ? (
      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
        Unable to sync habits: {syncError}
      </div>
    ) : null;

    if (dbLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Habits...</p>
        </div>
      );
    }

    switch (activeView) {
      case ViewMode.Home:
        return (
          <>
            {errorBanner}
            <HomeView 
              templates={state.templates} 
              getSnapshot={getSnapshot} 
              onToggle={toggleTask}
              onAddOneOff={addOneOffTask}
              onToggleOneOff={toggleOneOffTask}
            />
          </>
        );
      case ViewMode.Calendar:
        return (
          <>
            {errorBanner}
            <CalendarView 
              templates={state.templates} 
              getSnapshot={getSnapshot} 
              onToggle={toggleTask}
              onToggleOneOff={toggleOneOffTask}
            />
          </>
        );
      case ViewMode.Stats:
        return (
          <>
            {errorBanner}
            <StatsView 
              state={state} 
              getSnapshot={getSnapshot}
            />
          </>
        );
      case ViewMode.Settings:
        return (
          <>
            {errorBanner}
            <SettingsView 
              state={state} 
              getSnapshot={getSnapshot}
              onDeleteTemplate={deleteTemplate}
              onDeleteOneOff={deleteOneOffTask}
              onResetAll={handleReset}
              onLogout={handleLogout}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      onOpenAddModal={() => setIsModalOpen(true)}
    >
      {renderView()}
      
      {isModalOpen && (
        <NewTaskModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addTask} 
        />
      )}
    </Layout>
  );
};

export default App;
