
import React, { useState } from 'react';
import { TaskTemplate, PeriodType, OneOffTask, PeriodSnapshot } from '../types';
import TaskItem from '../components/TaskItem';
import { format } from 'date-fns';
import { ICONS } from '../constants';

interface HomeViewProps {
  templates: TaskTemplate[];
  getSnapshot: (date: Date, type: PeriodType) => PeriodSnapshot;
  onToggle: (date: Date, type: PeriodType, taskId: string) => void;
  onAddOneOff: (date: Date, type: PeriodType, title: string) => void;
  onToggleOneOff: (date: Date, type: PeriodType, oneOffId: string) => void;
}

const OneOffInput: React.FC<{ onAdd: (title: string) => void }> = ({ onAdd }) => {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 p-2 mt-1 transition-colors"
      >
        {ICONS.Plus} ADD ONE-OFF TASK
      </button>
    );
  }

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onAdd(value.trim());
          setValue('');
          setIsOpen(false);
        }
      }}
      className="flex gap-2 mt-2 px-1"
    >
      <input 
        autoFocus
        type="text"
        placeholder="One-off task..."
        className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => !value && setIsOpen(false)}
      />
      <button type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold">ADD</button>
    </form>
  );
};

const Section: React.FC<{ 
  title: string; 
  subtitle: string;
  tasks: TaskTemplate[]; 
  completionMap: Record<string, boolean>;
  onToggle: (id: string) => void;
  oneOffTasks: OneOffTask[];
  onToggleOneOff: (id: string) => void;
  onAddOneOff: (title: string) => void;
}> = ({ title, subtitle, tasks, completionMap, onToggle, oneOffTasks, onToggleOneOff, onAddOneOff }) => {
  const hasContent = tasks.length > 0 || oneOffTasks.length > 0;
  if (!hasContent) return null;

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{subtitle}</span>
      </div>
      <div className="space-y-1">
        {tasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            isCompleted={!!completionMap[task.id]} 
            onToggle={() => onToggle(task.id)} 
          />
        ))}
        {oneOffTasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onToggleOneOff(task.id)}
            className="flex items-center p-3 mb-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-200 transition-all select-none"
          >
            <div className="mr-3 opacity-60">
              {task.completed ? ICONS.Checked : ICONS.Unchecked}
            </div>
            <span className={`text-slate-600 italic text-sm ${task.completed ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
      <OneOffInput onAdd={onAddOneOff} />
    </section>
  );
};

const HomeView: React.FC<HomeViewProps> = ({ templates, getSnapshot, onToggle, onAddOneOff, onToggleOneOff }) => {
  const now = new Date();
  
  const dailySnap = getSnapshot(now, 'daily');
  const weeklySnap = getSnapshot(now, 'weekly');
  const monthlySnap = getSnapshot(now, 'monthly');

  const getTasksFromSnap = (snap: PeriodSnapshot) => {
    return snap.dueTaskIds.map(id => templates.find(t => t.id === id)).filter(Boolean) as TaskTemplate[];
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6 px-1">
        <p className="text-slate-500 text-sm font-medium">{format(now, 'EEEE, MMM do')}</p>
        <h1 className="text-2xl font-extrabold text-slate-800">My Priorities</h1>
      </div>

      <Section 
        title="Today" 
        subtitle="Daily"
        tasks={getTasksFromSnap(dailySnap)}
        completionMap={dailySnap.completionMap}
        onToggle={(id) => onToggle(now, 'daily', id)}
        oneOffTasks={dailySnap.oneOffTasks}
        onToggleOneOff={(id) => onToggleOneOff(now, 'daily', id)}
        onAddOneOff={(title) => onAddOneOff(now, 'daily', title)}
      />

      <Section 
        title="This Week" 
        subtitle="Weekly"
        tasks={getTasksFromSnap(weeklySnap)}
        completionMap={weeklySnap.completionMap}
        onToggle={(id) => onToggle(now, 'weekly', id)}
        oneOffTasks={weeklySnap.oneOffTasks}
        onToggleOneOff={(id) => onToggleOneOff(now, 'weekly', id)}
        onAddOneOff={(title) => onAddOneOff(now, 'weekly', title)}
      />

      <Section 
        title="This Month" 
        subtitle="Monthly"
        tasks={getTasksFromSnap(monthlySnap)}
        completionMap={monthlySnap.completionMap}
        onToggle={(id) => onToggle(now, 'monthly', id)}
        oneOffTasks={monthlySnap.oneOffTasks}
        onToggleOneOff={(id) => onToggleOneOff(now, 'monthly', id)}
        onAddOneOff={(title) => onAddOneOff(now, 'monthly', title)}
      />

      {templates.filter(t => !t.deletedAt).length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <div className="bg-slate-100 p-6 rounded-full mb-4">✨</div>
          <p className="text-slate-600 font-medium">No active habits yet.<br/>Add your first recurring task!</p>
        </div>
      )}
    </div>
  );
};

export default HomeView;
