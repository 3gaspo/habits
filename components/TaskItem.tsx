
import React from 'react';
import { TaskTemplate } from '../types';
import { ICONS } from '../constants';

interface TaskItemProps {
  task: TaskTemplate;
  isCompleted: boolean;
  onToggle: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isCompleted, onToggle }) => {
  return (
    <div 
      onClick={onToggle}
      className="flex items-center p-3 mb-2 bg-white border border-slate-100 rounded-xl shadow-sm cursor-pointer hover:border-emerald-200 transition-all active:scale-95 select-none"
    >
      <div className="mr-3">
        {isCompleted ? ICONS.Checked : ICONS.Unchecked}
      </div>
      <span className={`text-slate-700 font-medium ${isCompleted ? 'line-through text-slate-400' : ''}`}>
        {task.title}
      </span>
    </div>
  );
};

export default TaskItem;
