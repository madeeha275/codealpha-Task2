// src/components/TaskModal.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '@/api/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

// Simple relative time helper (e.g., "5 min ago")
const relativeTime = (dateStr) => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
};

const TaskModal = ({ isOpen, onClose, task = {}, projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Load task details when modal opens
  useEffect(() => {
    if (isOpen && task._id) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      setLabels(task.labels || []);
      setAssignees(task.assignees || []);
    }
  }, [isOpen, task]);

  // Load project members for assignee selector
  useEffect(() => {
    if (!projectId) return;
    const fetchMembers = async () => {
      try {
        const { data } = await axios.get(`/api/projects/${projectId}/members`);
        setMembers(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load members');
      }
    };
    fetchMembers();
  }, [projectId]);

  // Load comments for the task
  useEffect(() => {
    if (!task._id) return;
    const fetchComments = async () => {
      try {
        const { data } = await axios.get(`/api/tasks/${task._id}/comments`);
        setComments(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load comments');
      }
    };
    fetchComments();
  }, [task._id]);

  const handleSave = async () => {
    try {
      const payload = {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        labels,
        assignees: assignees.map((id) => id),
      };
      if (task._id) {
        await axios.patch(`/api/tasks/${task._id}`, payload);
        toast.success('Task updated');
      } else {
        await axios.post('/api/tasks', { ...payload, projectId });
        toast.success('Task created');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async () => {
    if (!task._id) return;
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/tasks/${task._id}`);
      toast.success('Task deleted');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // ----- Comment actions -------------------------------------------------
  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await axios.post(`/api/tasks/${task._id}/comments`, {
        text: newComment.trim(),
      });
      setComments((c) => [...c, data]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const editComment = async (commentId, newText) => {
    try {
      const { data } = await axios.put(`/api/comments/${commentId}`, { text: newText });
      setComments((c) => c.map((cmt) => (cmt._id === commentId ? data : cmt)));
      toast.success('Comment edited');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit comment');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments((c) => c.filter((cmt) => cmt._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {task._id ? 'Edit Task' : 'New Task'}
        </h2>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            className="w-full border rounded p-2 focus:outline-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {/* Priority & Due date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              className="w-full border rounded p-2 focus:outline-none"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        {/* Labels */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Labels (comma separated)
          </label>
          <Input
            value={labels.join(', ')}
            onChange={(e) => setLabels(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            placeholder="bug, frontend, highâ€‘priority"
          />
        </div>
        {/* Assignee multiâ€‘select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignees
          </label>
          <select
            multiple
            className="w-full border rounded p-2 focus:outline-none h-32"
            value={assignees.map((a) => a.toString())}
            onChange={(e) => {
              const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
              setAssignees(opts);
            }}
          >
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </div>
        {/* Action buttons */}
        <div className="flex justify-end space-x-2 mb-6">
          {task._id && (
            <Button variant="outline" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
        {/* Comments */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Comments</h3>
          {/* Comment list */}
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c._id} className="flex items-start space-x-3">
                <Avatar src={c.author.avatar} alt={c.author.name} size="xs" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {c.author.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {relativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{c.text}</p>
                  {c.author._id === (task?.user?._id || '') && (
                    <div className="mt-1 flex space-x-2 text-xs">
                      <button
                        className="text-primary-600 hover:underline"
                        onClick={() => {
                          const newText = prompt('Edit comment', c.text);
                          if (newText !== null && newText !== c.text) {
                            editComment(c._id, newText);
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => deleteComment(c._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Add comment */}
          <div className="flex items-start space-x-2">
            <Avatar src={/* current user avatar placeholder */ ''} size="xs" />
            <textarea
              className="flex-1 border rounded p-2 focus:outline-none"
              rows={2}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button variant="primary" size="sm" onClick={addComment}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
