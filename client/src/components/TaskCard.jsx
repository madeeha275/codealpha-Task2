// src/components/TaskCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

// Helper to pick a color for priority badge
const priorityColor = {
  low: 'bg-green-200 text-green-800',
  medium: 'bg-yellow-200 text-yellow-800',
  high: 'bg-red-200 text-red-800',
};

const TaskCard = ({
  title,
  priority = 'medium',
  dueDate,
  assignees = [],
  commentCount = 0,
  labels = [],
}) => {
  const now = new Date();
  const isOverdue = dueDate && new Date(dueDate) < now;
  const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : null;

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{title}</h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${priorityColor[priority] || priorityColor.medium}`}
        >
          {priority}
        </span>
      </div>
      {formattedDate && (
        <div
          className={`text-xs mb-1 ${isOverdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Due: {formattedDate}
        </div>
      )}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {labels.map((label, idx) => (
            <Badge key={idx} variant="neutral" className="bg-slate-200 text-slate-800">
              {label}
            </Badge>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex -space-x-1">
          {assignees.slice(0, 3).map((user) => (
            <Avatar key={user._id} src={user.avatar} alt={user.name} size="xs" />
          ))}
          {assignees.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              +{assignees.length - 3}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {commentCount} comment{commentCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  title: PropTypes.string.isRequired,
  priority: PropTypes.oneOf(['low', 'medium', 'high']),
  dueDate: PropTypes.string,
  assignees: PropTypes.arrayOf(PropTypes.object),
  commentCount: PropTypes.number,
  labels: PropTypes.arrayOf(PropTypes.string),
};

export default TaskCard;
