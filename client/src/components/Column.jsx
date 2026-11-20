// src/components/Column.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Edit2, Trash2, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

const Column = ({
  columnId,
  title,
  tasks,
  onAddTask,
  onRename,
  onDelete,
  children,
}) => {
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== title) {
      onRename(columnId, newTitle.trim());
    }
    setEditing(false);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-md w-64 min-w-[250px] p-4 flex flex-col">
      {/* Header */}
      <div className="bg-primary-600 text-white rounded-t-md px-3 py-2 flex items-center justify-between">
        {editing ? (
          <input
            className="bg-primary-600 text-white focus:outline-none w-full mr-2"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        ) : (
          <h2 className="text-lg font-semibold">{title}</h2>
        )}
        <div className="flex items-center space-x-1">
          <button onClick={() => setEditing(true)} className="p-1 hover:text-gray-200">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(columnId)} className="p-1 hover:text-gray-200">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {/* Task count and Add button */}
      <div className="flex items-center justify-between mt-2 mb-2 px-1">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
        <Button size="sm" variant="outline" onClick={() => onAddTask(columnId)}>
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">{children}</div>
    </div>
  );
};

Column.propTypes = {
  columnId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  tasks: PropTypes.array,
  onAddTask: PropTypes.func,
  onRename: PropTypes.func,
  onDelete: PropTypes.func,
  children: PropTypes.node,
};

export default Column;
