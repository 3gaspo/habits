
import React from 'react';
import { Home, Calendar, BarChart3, Plus, CheckCircle2, Circle, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

export const COLORS = {
  daily: 'bg-emerald-500',
  weekly: 'bg-indigo-500',
  monthly: 'bg-amber-500',
  success: 'text-emerald-600',
  muted: 'text-slate-400',
  border: 'border-slate-200',
};

export const ICONS = {
  Home: <Home size={20} />,
  Calendar: <Calendar size={20} />,
  Stats: <BarChart3 size={20} />,
  Plus: <Plus size={20} />,
  Checked: <CheckCircle2 className="text-emerald-500" size={24} />,
  Unchecked: <Circle className="text-slate-300" size={24} />,
  Left: <ChevronLeft size={20} />,
  Right: <ChevronRight size={20} />,
  Settings: <Settings size={20} />,
};
