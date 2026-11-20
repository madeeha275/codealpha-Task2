// src/components/KanbanBoard.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Column from '@/components/Column';
import TaskCard from '@/components/TaskCard';
import { DragOverlay } from '@dnd-kit/core';

// Helper component to make TaskCard sortable
const SortableTask = ({ task, columnId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        title={task.title}
        priority={task.priority}
        dueDate={task.dueDate}
        assignees={task.assignees}
        commentCount={task.commentCount}
        labels={task.labels}
      />
    </div>
  );
};

const KanbanBoard = () => {
  // Initial mock data â€“ replace with fetch from server as needed
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'inprogress', title: 'In Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] },
  ]);

  const [activeTask, setActiveTask] = useState(null);

  // ----- Column actions -------------------------------------------------
  const addColumn = () => {
    const title = prompt('New column title');
    if (title) {
      setColumns((cols) => [...cols, { id: Date.now().toString(), title, tasks: [] }]);
    }
  };

  const renameColumn = (colId, newTitle) => {
    setColumns((cols) =>
      cols.map((c) => (c.id === colId ? { ...c, title: newTitle } : c))
    );
  };

  const deleteColumn = (colId) => {
    setColumns((cols) => cols.filter((c) => c.id !== colId));
  };

  const addTask = (colId) => {
    const title = prompt('Task title');
    if (!title) return;
    const newTask = {
      id: Date.now().toString(),
      title,
      priority: 'medium',
      dueDate: null,
      assignees: [],
      commentCount: 0,
      labels: [],
    };
    setColumns((cols) =>
      cols.map((c) => (c.id === colId ? { ...c, tasks: [...c.tasks, newTask] } : c))
    );
  };

  // ----- Drag & Drop ---------------------------------------------------
  const findColumnByTaskId = (taskId) => columns.find((col) => col.tasks.some((t) => t.id === taskId));
  const findTaskIndex = (col, taskId) => col.tasks.findIndex((t) => t.id === taskId);

  const handleDragStart = (event) => {
    const { active } = event;
    const col = findColumnByTaskId(active.id);
    if (col) {
      const task = col.tasks.find((t) => t.id === active.id);
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeCol = findColumnByTaskId(active.id);
    const overCol = findColumnByTaskId(over.id) || columns.find((c) => c.id === over.id);
    if (!activeCol || !overCol) return;

    const activeIdx = findTaskIndex(activeCol, active.id);
    const overIdx = over.id === overCol.id ? overCol.tasks.length : findTaskIndex(overCol, over.id);

    // If moving within same column
    if (activeCol.id === overCol.id) {
      if (activeIdx === overIdx) return;
      const newTasks = arrayMove(activeCol.tasks, activeIdx, overIdx);
      setColumns((cols) =>
        cols.map((c) => (c.id === activeCol.id ? { ...c, tasks: newTasks } : c))
      );
      // Optimistic API call
      try {
        await axios.patch(`/api/tasks/${active.id}/move`, {
          columnId: activeCol.id,
          position: overIdx,
        });
      } catch (err) {
        // revert UI
        setColumns((cols) =>
          cols.map((c) => (c.id === activeCol.id ? { ...c, tasks: activeCol.tasks } : c))
        );
        toast.error(err.response?.data?.message || 'Failed to move task');
      }
      return;
    }

    // Moving to a different column
    const movingTask = activeCol.tasks[activeIdx];
    const newSourceTasks = [...activeCol.tasks];
    newSourceTasks.splice(activeIdx, 1);
    const newDestTasks = [...overCol.tasks];
    const insertIdx = over.id === overCol.id ? newDestTasks.length : overIdx;
    newDestTasks.splice(insertIdx, 0, movingTask);

    const prevState = columns;
    setColumns((cols) =>
      cols.map((c) => {
        if (c.id === activeCol.id) return { ...c, tasks: newSourceTasks };
        if (c.id === overCol.id) return { ...c, tasks: newDestTasks };
        return c;
      })
    );

    try {
      await axios.patch(`/api/tasks/${movingTask.id}/move`, {
        columnId: overCol.id,
        position: insertIdx,
      });
    } catch (err) {
      // revert to previous state
      setColumns(prevState);
      toast.error(err.response?.data?.message || 'Failed to move task');
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Project Board</h2>
        <button
          onClick={addColumn}
          className="bg-primary-600 text-white px-3 py-1 rounded-xl hover:bg-primary-700 transition-colors"
        >
          + Add Column
        </button>
      </div>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex overflow-x-auto space-x-4" style={{ minHeight: '400px' }}>
          {columns.map((col) => (
            <Column
              key={col.id}
              columnId={col.id}
              title={col.title}
              tasks={col.tasks}
              onAddTask={addTask}
              onRename={renameColumn}
              onDelete={deleteColumn}
            >
              <SortableContext items={col.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {col.tasks.map((task) => (
                  <SortableTask key={task.id} task={task} columnId={col.id} />
                ))}
              </SortableContext>
            </Column>
          ))}
        </div>
        <DragOverlay>{activeTask && <TaskCard {...activeTask} />}</DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
