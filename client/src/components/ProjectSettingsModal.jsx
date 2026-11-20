// src/components/ProjectSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from '@/api/axios';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const ProjectSettingsModal = ({ projectId, isOpen, onClose, onUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/api/projects/${projectId}`);
        setName(data.name || '');
        setDescription(data.description || '');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load project');
      }
    };
    fetch();
  }, [isOpen, projectId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.patch(`/api/projects/${projectId}`, { name, description });
      toast.success('Project updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/projects/${projectId}`);
      toast.success('Project deleted');
      // Redirect to landing after deletion
      window.location.href = '/landing';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Settings">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            className="w-full border rounded p-2 focus:outline-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleDelete} disabled={loading}>
            Delete Project
          </Button>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectSettingsModal;