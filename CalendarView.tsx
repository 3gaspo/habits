
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, eachWeekOfInterval, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { PeriodType, TaskTemplate, PeriodSnapshot } from '../types';
import { ICONS } from '../constants';
import TaskItem from '../components/TaskItem';

interface CalendarViewProps {
  templates: TaskTemplate[];
  getSnapshot: (date: Date, type: PeriodType) => PeriodSnapshot;
  onToggle: (date: Date, type: PeriodType, taskId: string) => void;
  onToggleOneOff: (date: Date, type: PeriodType, oneOffId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ templates, getSnapshot, onToggle, onToggleOneOff }) => {
  const [viewType, setViewType] = useState<PeriodType>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewType === 'daily') newDate.setMonth(currentDate.getMonth() + direction);
    else if (viewType === 'weekly') newDate.setMonth(currentDate.getMonth() + direction);
    else if (viewType === 'monthly') newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const isCompleted = (date: Date, type: PeriodType) => {
    const snap = getSnapshot(date, type);
    const totalDue = snap.dueTaskIds.length + snap.oneOffTasks.length;
    if (totalDue === 0) return false;
    
    const recurringFull = snap.dueTaskIds.every(id => snap.completionMap[id]);
    const oneOffFull = snap.oneOffTasks.every(t => t.completed);
    
    return recurringFull && oneOffFull;
  };

  const hasTasks = (date: Date, type: PeriodType) => {
    const snap = getSnapshot(date, type);
    return snap.dueTaskIds.length > 0 || snap.oneOffTasks.length > 0;
  };

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startDay = startOfWeek(start, { weekStartsOn: 1 });
    const endDay = endOfWeek(end, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDay, end: endDay });
  }, [currentDate]);

  const weeks = useMemo(() => {
    const start = startOfYear(currentDate);
    const end = endOfYear(currentDate);
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  }, [currentDate]);

  const months = useMemo(() => {
    const start = startOfYear(currentDate);
    const end = endOfYear(currentDate);
    return eachMonthOfInterval({ start, end });
  }, [currentDate]);

  const renderDaily = () => (
    <div className="grid grid-cols-7 gap-1">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
        <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-2">{d}</div>
      ))}
      {days.map(day => {
        const full = isCompleted(day, 'daily');
        const empty = !hasTasks(day, 'daily');
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        return (
          <div 
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`
              aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
              ${!isSameMonth(day, currentDate) ? 'opacity-20' : 'opacity-100'}
              ${isSelected ? 'ring-2 ring-emerald-500 ring-inset' : ''}
              ${full ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-700'}
              border ${isSelected ? 'border-transparent' : 'border-slate-100'}
            `}
          >
            <span className="text-sm font-semibold">{format(day, 'd')}</span>
            {full && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-0.5 animate-pulse"></div>}
            {!empty && !full && <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-0.5"></div>}
          </div>
        );
      })}
    </div>
  );

  const renderList = (items: Date[], type: PeriodType, labelFormat: string) => (
    <div className="space-y-2">
      {items.map(item => {
        const full = isCompleted(item, type);
        const empty = !hasTasks(item, type);
        const isSelected = selectedDate && (type === 'monthly' ? item.getMonth() === selectedDate.getMonth() : isSameDay(item, selectedDate));
        
        if (empty) return null;

        return (
          <div 
            key={item.toISOString()}
            onClick={() => setSelectedDate(item)}
            className={`
              flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all
              ${full ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}
              ${isSelected ? 'ring-2 ring-emerald-500' : ''}
            `}
          >
            <div className="flex items-center">
              <span className={`font-bold ${full ? 'text-emerald-700' : 'text-slate-700'}`}>
                {format(item, labelFormat)}
              </span>
              {type === 'weekly' && (
                <span className="ml-2 text-xs text-slate-400">
                  {format(item, 'MMM d')} - {format(endOfWeek(item, { weekStartsOn: 1 }), 'MMM d')}
                </span>
              )}
            </div>
            {full && <div className="bg-emerald-500 p-1 rounded-full text-white">{ICONS.Checked}</div>}
          </div>
        );
      })}
    </div>
  );

  const activeSnapshot = selectedDate ? getSnapshot(selectedDate, viewType) : null;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
        {(['daily', 'weekly', 'monthly'] as PeriodType[]).map(type => (
          <button
            key={type}
            onClick={() => { setViewType(type); setSelectedDate(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${viewType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-slate-800">
          {viewType === 'daily' && format(currentDate, 'MMMM yyyy')}
          {viewType === 'weekly' && format(currentDate, 'yyyy')}
          {viewType === 'monthly' && format(currentDate, 'yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">{ICONS.Left}</button>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-full">{ICONS.Right}</button>
        </div>
      </div>

      <div className="mb-8">
        {viewType === 'daily' && renderDaily()}
        {viewType === 'weekly' && renderList(weeks, 'weekly', "'Week' II")}
        {viewType === 'monthly' && renderList(months, 'monthly', 'MMMM')}
      </div>

      {selectedDate && activeSnapshot && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">
              {viewType === 'daily' ? format(selectedDate, 'MMM do, yyyy') : 
               viewType === 'weekly' ? `Week ${format(selectedDate, 'II')}, ${format(selectedDate, 'yyyy')}` :
               format(selectedDate, 'MMMM yyyy')}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-slate-400 text-sm font-medium">Close</button>
          </div>
          <div className="space-y-1">
            {activeSnapshot.dueTaskIds.map(id => {
              const task = templates.find(t => t.id === id);
              if (!task) return null;
              return (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  isCompleted={!!activeSnapshot.completionMap[id]} 
                  onToggle={() => onToggle(selectedDate, viewType, id)} 
                />
              );
            })}
            {activeSnapshot.oneOffTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => onToggleOneOff(selectedDate, viewType, task.id)}
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
            {activeSnapshot.dueTaskIds.length === 0 && activeSnapshot.oneOffTasks.length === 0 && (
              <p className="text-center py-4 text-slate-400 text-sm">No tasks were due this period.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
