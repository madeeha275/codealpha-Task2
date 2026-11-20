// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/api/axios';
import { toast } from 'react-hot-toast';
import NewProjectModal from '@/components/NewProjectModal';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/projects');
      setProjects(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/projects/${id}`);
  };

  const handleCreate = async (project) => {
    try {
      const { data } = await axios.post('/api/projects', project);
      // Server now returns { project }
      const id = data.project?._id || data.project?.id || data._id || data.id;
      if (id) {
        navigate(`/projects/${id}`);
      } else {
        toast.error('Project created but no ID returned');
      }
      setShowModal(false);
      fetchProjects();
      toast.success('Project created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 rounded" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center mt-12 text-gray-600 dark:text-gray-300">
          No projects yet. Click "New Project" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleCardClick(project._id)}
              className="cursor-pointer rounded shadow p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition"
              style={{ borderLeft: `4px solid ${project.color || '#4F46E5'}` }}
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {project.name}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                {project.description}
              </p>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {project.members?.length || 0} member{project.members?.length === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal isOpen={showModal} onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
};

export default DashboardPage;
