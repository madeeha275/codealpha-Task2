// src/components/MembersPanel.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '@/api/axios';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MembersPanel = ({ projectId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load members');
    }
  };

  useEffect(() => {
    if (isOpen) fetchMembers();
  }, [isOpen, projectId]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setLoading(true);
    try {
      await axios.post(`/api/projects/${projectId}/members`, { email: inviteEmail });
      toast.success('Invitation sent');
      setInviteEmail('');
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await axios.delete(`/api/projects/${projectId}/members/${memberId}`);
      toast.success('Member removed');
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this project?')) return;
    try {
      await axios.delete(`/api/projects/${projectId}/members/${user._id}`);
      toast.success('You left the project');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave project');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Members">
      <div className="space-y-4">
        {/* Invite form */}
        <div className="flex items-center space-x-2">
          <Input
            type="email"
            placeholder="member@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button onClick={handleInvite} disabled={loading}>
            Invite
          </Button>
        </div>
        {/* Members list */}
        <ul className="space-y-3 max-h-80 overflow-y-auto">
          {members.map((m) => (
            <li key={m._id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar src={m.avatar} alt={m.name} size="xs" />
                <span className="font-medium text-gray-800 dark:text-gray-100">{m.name}</span>
                <Badge variant="outline" className="ml-2">
                  {m.role}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {/* Owner/Admin can remove others */}
                {(user.role === 'owner' || user.role === 'admin') && m._id !== user._id && (
                  <Button variant="outline" size="sm" onClick={() => handleRemove(m._id)}>
                    Remove
                  </Button>
                )}
                {/* Current user can leave */}
                {m._id === user._id && (
                  <Button variant="outline" size="sm" onClick={handleLeave}>
                    Leave
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default MembersPanel;