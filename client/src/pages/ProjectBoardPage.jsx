// src/pages/ProjectBoardPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "@/api/axios";
import { toast } from "react-hot-toast";
import Column from "@/components/Column";
import TaskCard from "@/components/TaskCard";
import MembersPanel from "@/components/MembersPanel";
import ProjectSettingsModal from "@/components/ProjectSettingsModal";
import { Users, Settings } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Simple avatar placeholder (fallback if Avatar component missing)
const Avatar = ({ src, name }) => (
  <img
    src={src || "https://www.gravatar.com/avatar/?d=mp"}
    alt={name}
    className="w-6 h-6 rounded-full"
  />
);

// Add‑task form tied to a specific column
const AddTaskForm = ({ projectId, columnId, onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await axios.post(`/api/projects/${projectId}/tasks`, {
        title,
        description: "",
        columnId,
        priority,
      });
      toast.success("Task created");
      setTitle("");
      setPriority("medium");
      onTaskAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring"
        disabled={loading}
      />
      <div className="flex items-center mt-1 space-x-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border rounded px-2 py-1"
          disabled={loading}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Add
        </button>
      </div>
    </form>
  );
};

const ProjectBoardPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    assignee: "",
    priority: "",
    label: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: proj }, { data: tks }, { data: mems }] = await Promise.all([
        axios.get(`/api/projects/${projectId}`),
        axios.get(`/api/projects/${projectId}/tasks`),
        axios.get(`/api/projects/${projectId}/members`),
      ]);
      setProject(proj);
      setTasks(tks);
      setMembers(mems);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load project';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleTaskAdded = () => {
    fetchData();
  };

  // ----- Filtering logic -------------------------------------------------
  const uniqueLabels = Array.from(new Set(tasks.flatMap((t) => t.labels || [])));
  const filteredTasks = tasks.filter((t) => {
    // Search in title (case‑insensitive)
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    // Assignee filter (member _id)
    if (filters.assignee) {
      const hasAssignee = (t.assignees || []).some((a) => a._id === filters.assignee);
      if (!hasAssignee) return false;
    }
    // Priority filter
    if (filters.priority && t.priority !== filters.priority) {
      return false;
    }
    // Label filter
    if (filters.label) {
      const hasLabel = (t.labels || []).includes(filters.label);
      if (!hasLabel) return false;
    }
    return true;
  });

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== "").length;

  const clearFilters = () => {
    setFilters({ search: "", assignee: "", priority: "", label: "" });
  };

  // Build columns from project definition using filtered tasks
  const columns = (project?.columns || []).map((col) => {
    const colTasks = filteredTasks.filter((t) => t.column === col._id);
    return { ...col, tasks: colTasks };
  });

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-pulse h-8 bg-gray-300 dark:bg-gray-700 mb-4" />
        <div className="flex space-x-4 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-64 bg-gray-200 dark:bg-gray-700 h-96 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-300">
        Project not found.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{project.name}</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMembers(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            title="Members"
          >
            <Users size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            title="Project Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-soft">
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-48"
        />
        <select
          value={filters.assignee}
          onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All assignees</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filters.label}
          onChange={(e) => setFilters({ ...filters, label: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="">All labels</option>
          {uniqueLabels.map((lbl) => (
            <option key={lbl} value={lbl}>
              {lbl}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={clearFilters}>Clear</Button>
        {activeFilterCount > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
          </span>
        )}
      </div>

      {/* Board columns */}
      <div className="flex space-x-4">
        {columns.map((col) => (
          <Column
            key={col._id}
            columnId={col._id}
            title={col.title}
            tasks={col.tasks}
            onAddTask={addTask}
            onRename={renameColumn}
            onDelete={deleteColumn}
          >
            {col.tasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No tasks</p>
            ) : (
              col.tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  title={task.title}
                  priority={task.priority}
                  dueDate={task.dueDate}
                  assignees={task.assignees || []}
                  commentCount={task.comments?.length || 0}
                />
              ))
            )}
            {/* Add task form for this column */}
            <AddTaskForm projectId={projectId} columnId={col._id} onTaskAdded={handleTaskAdded} />
          </Column>
        ))}
      </div>

      {/* Modals */}
      <MembersPanel projectId={projectId} isOpen={showMembers} onClose={() => setShowMembers(false)} />
      <ProjectSettingsModal
        projectId={projectId}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdated={fetchData}
      />
    </div>
  );
};

export default ProjectBoardPage;
