
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, TaskTemplate, PeriodType, PeriodSnapshot, OneOffTask } from '../types';
import { getPeriodKey, getPeriodBounds, isTaskValidForPeriod } from '../utils/dateUtils';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

const INITIAL_STATE: AppState = {
  templates: [
    { id: '1', title: 'Morning Exercise', period: 'daily', createdAt: Date.now(), active: true },
    { id: '2', title: 'Read 20 Pages', period: 'daily', createdAt: Date.now(), active: true },
  ],
  snapshots: {},
};

export const useHabits = (userId: string | null) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const docRef = useMemo(() => {
    if (!userId) return null;
    return doc(db, 'users', userId, 'data', 'appState');
  }, [userId]);

  // Synchronize with Firestore
  useEffect(() => {
    if (!docRef) {
      setSyncError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSyncError(null);

    let unsubscribe = () => {};
    let loadingSettled = false;

    const settleLoading = () => {
      if (!loadingSettled) {
        loadingSettled = true;
        setLoading(false);
      }
    };

    const initialize = async () => {
      try {
        const existing = await getDoc(docRef);
        if (existing.exists()) {
          setState(existing.data() as AppState);
        } else {
          await setDoc(docRef, INITIAL_STATE);
          setState(INITIAL_STATE);
        }

        unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setState(snapshot.data() as AppState);
            }
            setSyncError(null);
            settleLoading();
          },
          (error) => {
            console.error('Firestore sync error', error);
            setSyncError(error.message || 'Unable to sync habits');
            settleLoading();
          }
        );
      } catch (error: any) {
        console.error('Failed to initialize habits sync', error);
        setSyncError(error?.message || 'Unable to sync habits');
      } finally {
        settleLoading();
      }
    };

    initialize();

    return () => unsubscribe();
  }, [docRef]);

  const updateCloud = async (newState: AppState) => {
    if (!docRef) return;
    try {
      await setDoc(docRef, newState);
      setSyncError(null);
    } catch (error: any) {
      console.error('Failed to update cloud state', error);
      setSyncError(error?.message || 'Unable to save habits');
    }
  };

  const getSnapshot = useCallback((date: Date, type: PeriodType): PeriodSnapshot => {
    const key = getPeriodKey(date, type);
    const existing = state.snapshots[key];

    if (existing) return existing;

    const { start: pStart, end: pEnd } = getPeriodBounds(date, type);
    const dueTaskIds = state.templates
      .filter(t => t.active && t.period === type && isTaskValidForPeriod(t.createdAt, pStart, pEnd, t.deletedAt))
      .filter(t => !t.deletedAt || t.deletedAt > pStart.getTime())
      .map(t => t.id);

    return {
      periodKey: key,
      periodType: type,
      dueTaskIds,
      completionMap: Object.fromEntries(dueTaskIds.map(id => [id, false])),
      oneOffTasks: []
    };
  }, [state.templates, state.snapshots]);

  const toggleTask = (date: Date, type: PeriodType, taskId: string) => {
    const key = getPeriodKey(date, type);
    const currentSnapshot = getSnapshot(date, type);
    
    const updatedSnapshot: PeriodSnapshot = {
      ...currentSnapshot,
      completionMap: {
        ...currentSnapshot.completionMap,
        [taskId]: !currentSnapshot.completionMap[taskId]
      }
    };

    const newState = {
      ...state,
      snapshots: { ...state.snapshots, [key]: updatedSnapshot }
    };
    setState(newState);
    updateCloud(newState);
  };

  const addOneOffTask = (date: Date, type: PeriodType, title: string) => {
    const key = getPeriodKey(date, type);
    const currentSnapshot = getSnapshot(date, type);
    
    const newTask: OneOffTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false
    };

    const updatedSnapshot: PeriodSnapshot = {
      ...currentSnapshot,
      oneOffTasks: [...currentSnapshot.oneOffTasks, newTask]
    };

    const newState = {
      ...state,
      snapshots: { ...state.snapshots, [key]: updatedSnapshot }
    };
    setState(newState);
    updateCloud(newState);
  };

  const toggleOneOffTask = (date: Date, type: PeriodType, oneOffId: string) => {
    const key = getPeriodKey(date, type);
    const currentSnapshot = getSnapshot(date, type);
    
    const updatedSnapshot: PeriodSnapshot = {
      ...currentSnapshot,
      oneOffTasks: currentSnapshot.oneOffTasks.map(task => 
        task.id === oneOffId ? { ...task, completed: !task.completed } : task
      )
    };

    const newState = {
      ...state,
      snapshots: { ...state.snapshots, [key]: updatedSnapshot }
    };
    setState(newState);
    updateCloud(newState);
  };

  const deleteOneOffTask = (date: Date, type: PeriodType, oneOffId: string) => {
    const key = getPeriodKey(date, type);
    const currentSnapshot = getSnapshot(date, type);
    
    const updatedSnapshot: PeriodSnapshot = {
      ...currentSnapshot,
      oneOffTasks: currentSnapshot.oneOffTasks.filter(task => task.id !== oneOffId)
    };

    const newState = {
      ...state,
      snapshots: { ...state.snapshots, [key]: updatedSnapshot }
    };
    setState(newState);
    updateCloud(newState);
  };

  const addTask = (title: string, period: PeriodType) => {
    const newTask: TaskTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      period,
      createdAt: Date.now(),
      active: true,
    };

    const newState = {
      ...state,
      templates: [...state.templates, newTask]
    };
    setState(newState);
    updateCloud(newState);
  };

  const deleteTemplate = (id: string) => {
    const newState = {
      ...state,
      templates: state.templates.map(t => 
        t.id === id ? { ...t, deletedAt: Date.now(), active: false } : t
      )
    };
    setState(newState);
    updateCloud(newState);
  };

  const resetAllData = () => {
    if (window.confirm("Are you absolutely sure? This will delete all habits and history from your account.")) {
      const newState = { templates: [], snapshots: {} };
      setState(newState);
      updateCloud(newState);
      return true;
    }
    return false;
  };

  return {
    state,
    loading,
    syncError,
    getSnapshot,
    toggleTask,
    addOneOffTask,
    toggleOneOffTask,
    deleteOneOffTask,
    addTask,
    deleteTemplate,
    resetAllData
  };
};
