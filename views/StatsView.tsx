
import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PeriodType, TaskTemplate, PeriodSnapshot, AppState } from '../types';
import { subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from 'date-fns';

interface StatsViewProps {
  state: AppState;
  getSnapshot: (date: Date, type: PeriodType) => PeriodSnapshot;
}

const StatsView: React.FC<StatsViewProps> = ({ state, getSnapshot }) => {
  const [viewType, setViewType] = useState<PeriodType>('daily');
  
  const statsData = useMemo(() => {
    const now = new Date();
    let dates: Date[] = [];
    
    if (viewType === 'daily') dates = eachDayOfInterval({ start: subDays(now, 13), end: now });
    else if (viewType === 'weekly') dates = eachWeekOfInterval({ start: subWeeks(now, 11), end: now }, { weekStartsOn: 1 });
    else if (viewType === 'monthly') dates = eachMonthOfInterval({ start: subMonths(now, 11), end: now });

    return dates.map(date => {
      const snap = getSnapshot(date, viewType);
      
      const recurringTotal = snap.dueTaskIds.length;
      const recurringCompleted = Object.values(snap.completionMap).filter(Boolean).length;
      
      const oneOffTotal = snap.oneOffTasks.length;
      const oneOffCompleted = snap.oneOffTasks.filter(t => t.completed).length;

      const total = recurringTotal + oneOffTotal;
      const completed = recurringCompleted + oneOffCompleted;
      
      const ratio = total === 0 ? 0 : Math.round((completed / total) * 100);
      
      return {
        key: snap.periodKey,
        label: viewType === 'daily' ? format(date, 'MMM d') : 
               viewType === 'weekly' ? `W${format(date, 'II')}` : 
               format(date, 'MMM'),
        ratio,
        completed,
        total
      };
    });
  }, [viewType, state.snapshots, state.templates, getSnapshot]);

  const averageRatio = useMemo(() => {
    const relevant = statsData.filter(d => d.total > 0);
    if (relevant.length === 0) return 0;
    return Math.round(relevant.reduce((acc, curr) => acc + curr.ratio, 0) / relevant.length);
  }, [statsData]);

  const activeTemplatesCount = state.templates.filter(t => t.active && t.period === viewType).length;

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-extrabold text-slate-800">Insights</h1>
        <p className="text-slate-500 text-sm font-medium">Performance tracking</p>
      </div>

      <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
        {(['daily', 'weekly', 'monthly'] as PeriodType[]).map(type => (
          <button
            key={type}
            onClick={() => setViewType(type)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${viewType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Avg Score</p>
          <p className="text-3xl font-black text-emerald-600">{averageRatio}%</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Active Habits</p>
          <p className="text-3xl font-black text-slate-800">{activeTemplatesCount}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 h-64">
        <h3 className="text-sm font-bold text-slate-800 mb-4 px-2">Completion Trend</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={statsData}>
            <defs>
              <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: any) => [`${value}% Completion`, 'Ratio']}
            />
            <Area 
              type="monotone" 
              dataKey="ratio" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRatio)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsView;
