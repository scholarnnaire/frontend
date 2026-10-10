import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Users, UserPlus, Shield, Edit2, Trash2, X, BookOpen, 
  Trophy, CheckCircle2, AlertCircle, Star, Copy, Check,
  Camera, ExternalLink, Sparkles, Upload
} from 'lucide-react';
import api from '../../utils/api';

export function Team() {
  const { isDarkMode } = useOutletContext();
  const location = useLocation();

  const [teamMembers, setTeamMembers] = useState([]);
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [constitution, setConstitution] = useState(null);
  const [teamMeta, setTeamMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    role: 'Member', 
    subject: 'General Science', 
    status: 'Active',
    passport_photo_url: '',
    participant_id: '',
    verification_status: 'Verified'
  });
  const [formError, setFormError] = useState('');

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  ];

  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-400 to-teal-500',
    'from-orange-400 to-red-500',
    'from-purple-500 to-pink-600',
    'from-cyan-400 to-blue-500',
    'from-rose-400 to-pink-500',
  ];

  const getInitials = (name) => {
    if (!name) return 'TM';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [membersRes, teamRes, infoRes] = await Promise.all([
        api.get('/team/school/members'),
        api.get('/team/my-team'),
        api.get('/team/tournament-info').catch(() => ({ data: null })),
      ]);

      const teamData = teamRes.data;
      const teamId = teamData.team_id;
      const constData = teamData.constitution;

      const enriched = membersRes.data.map((m, i) => ({
        ...m,
        color: colors[i % colors.length],
        avatar: getInitials(m.name),
        passport_photo_url: m.passport_photo_url || samplePhotos[i % samplePhotos.length]
      }));

      setTeamMembers(enriched);
      setTournamentInfo(infoRes?.data || null);
      setConstitution(constData);

      setTeamMeta({
        id: teamId,
        name: teamData.team_name,
        umbrella_name: teamData.umbrella_name || teamData.school_name,
        code: teamData.team_code,
      });
    } catch (error) {
      console.error('Failed to fetch team data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    setFormError('');
    if (member) {
      setEditingMember(member);
      setFormData({ 
        name: member.name, 
        role: member.role || (member.is_captain ? 'Captain' : 'Member'), 
        subject: member.subject || 'General Science', 
        status: member.status || 'Active',
        passport_photo_url: member.passport_photo_url || '',
        participant_id: member.participant_id || '',
        verification_status: member.verification_status || 'Verified'
      });
    } else {
      setEditingMember(null);
      const nextIndex = teamMembers.length + 1;
      setFormData({ 
        name: '', 
        role: teamMembers.some(m => m.role === 'Captain' || m.is_captain) ? 'Member' : 'Captain', 
        subject: 'General Science', 
        status: 'Active',
        passport_photo_url: samplePhotos[teamMembers.length % samplePhotos.length],
        participant_id: `P-${teamMeta?.code || 'PAR'}-${nextIndex.toString().padStart(3, '0')}`,
        verification_status: 'Verified'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setFormError('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, passport_photo_url: event.target.result }));
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploadingPhoto(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await api.post('/competition/upload-passport', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, passport_photo_url: `http://localhost:8000${res.data.url}` }));
      }
    } catch (err) {
      console.warn('Server upload notice:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setFormError('');

    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        subject: formData.subject,
        status: formData.status,
        is_captain: formData.role === 'Captain',
        passport_photo_url: formData.passport_photo_url,
        participant_id: formData.participant_id || `P-${teamMeta?.code || 'PAR'}-${(teamMembers.length + 1).toString().padStart(3, '0')}`,
        verification_status: formData.verification_status,
        current_stage: 'Group Stage 1',
        qualification_status: 'In Progress'
      };

      if (editingMember) {
        const response = await api.put(`/team/members/${editingMember.id}`, payload);
        setTeamMembers(teamMembers.map(m =>
          m.id === editingMember.id
            ? { ...m, ...response.data, avatar: getInitials(response.data.name) }
            : m
        ));
      } else {
        const response = await api.post('/team/school/members', payload);
        const newMember = {
          ...response.data,
          avatar: getInitials(response.data.name),
          color: colors[teamMembers.length % colors.length],
        };
        setTeamMembers([...teamMembers, newMember]);
      }
      handleCloseModal();
      fetchAll();
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Failed to save team member.';
      setFormError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.delete(`/team/members/${id}`);
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      fetchAll();
    } catch (error) {
      console.error('Failed to delete team member', error);
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/register?team_code=${teamMeta?.code || 'KC-0001'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(teamMeta?.code || 'KC-0001');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const memberCount = teamMembers.length;
  const captain = teamMembers.find(m => m.role === 'Captain' || m.is_captain);
  const regularCount = teamMembers.filter(m => m !== captain).length;
  const verifiedCount = teamMembers.filter(m => m.verification_status === 'Verified').length;
  const isFullyConstituted = memberCount >= 11 && captain && verifiedCount >= 11;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-green"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-20">

      {/* ── SECTION 1 & 16: TEAM CONSTITUTION & UMBRELLA BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border ${
          isFullyConstituted
            ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border-emerald-500/40'
            : 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 border-amber-500/40'
        }`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isFullyConstituted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isFullyConstituted ? '✅ Ready for Group Stage Examination' : '⚠️ Constitution In Progress'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">
                Approved Umbrella Team
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                {teamMeta?.umbrella_name || "Team Umbrella"}
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  {teamMeta?.code || 'KC-0001'}
                </span>
              </h1>
              <p className="text-sm text-gray-400 max-w-2xl mt-1">
                Official Competition Rule: Each team shall consist of a minimum of eleven (11) members: 
                <strong> 10 participating members</strong> and <strong>1 Team Captain</strong>, each registered with personal information and a passport photograph under this approved umbrella name.
              </p>
            </div>

            {/* Constitution Pill Counters */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-gray-400">Total Registered:</span>
                <span className={`font-black ${memberCount >= 11 ? 'text-emerald-400' : 'text-amber-400'}`}>{memberCount} / 11 Min</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-gray-400">Team Captain:</span>
                <span className={`font-black ${captain ? 'text-amber-400' : 'text-red-400'}`}>
                  {captain ? `🏅 ${captain.name.split(' ')[0]}` : 'Missing'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-gray-400">Participating Members:</span>
                <span className={`font-black ${regularCount >= 10 ? 'text-emerald-400' : 'text-gray-300'}`}>{regularCount} / 10</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-gray-400">Passport Verified:</span>
                <span className={`font-black ${verifiedCount >= 11 ? 'text-emerald-400' : 'text-amber-400'}`}>{verifiedCount} / {memberCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Sharing & Invite Links */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto">
            <button
              onClick={copyInviteLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 shadow-lg"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copiedLink ? 'Invite Link Copied!' : 'Copy Member Invite Link'}
            </button>
            <button
              onClick={copyTeamCode}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-gray-300 font-mono text-xs transition-all border border-white/10"
            >
              {copiedCode ? <Check size={14} className="text-emerald-400" /> : <span className="font-bold">Code:</span>}
              <span>{teamMeta?.code || 'KC-0001'}</span>
            </button>
          </div>
        </div>

        {/* 11-Slot Visual Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
            <span>Team Constitution Progress (10 Participating + 1 Captain)</span>
            <span className={isFullyConstituted ? 'text-emerald-400' : 'text-amber-400'}>
              {memberCount}/11 Members {isFullyConstituted ? '— Fully Constituted' : `(${Math.max(0, 11 - memberCount)} needed)`}
            </span>
          </div>
          <div className="grid grid-cols-11 gap-1.5">
            {Array.from({ length: 11 }).map((_, i) => {
              const isFilled = i < memberCount;
              const isCapSlot = (i === 0);
              return (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isFilled
                      ? (isCapSlot ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : isFullyConstituted ? 'bg-emerald-400 shadow-sm shadow-emerald-400/30' : 'bg-brand-green')
                      : 'bg-white/10'
                  }`}
                  title={isCapSlot ? 'Slot 1: Team Captain' : `Slot ${i + 1}: Participating Member`}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── HEADER & ADD MEMBER BUTTON ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">
            Registered Team Members
          </h2>
          <p className="text-gray-400 text-sm">
            All registered participants under umbrella <span className="text-white font-bold">{teamMeta?.umbrella_name}</span>.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl transition-all shadow-lg bg-brand-green hover:bg-emerald-500 text-[#0D0F14] shadow-brand-green/20"
        >
          <UserPlus size={18} />
          Register Team Member
        </button>
      </div>

      {/* ── MEMBERS ROSTER TABLE ── */}
      <div className="bg-[#13151A] border border-white/5 rounded-3xl overflow-hidden shadow-xl w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#0A0C10] border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Participant & Passport</th>
                <th className="px-6 py-4">Role & Identity</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Stage & Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {teamMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                          <Users size={28} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No team members registered yet. Click "Register Team Member" to begin building your 11-member team.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  teamMembers.map((member, index) => {
                    const isCaptain = member.role === 'Captain' || member.is_captain;
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.03 }}
                        className={`border-b border-white/5 transition-colors group hover:bg-white/5 ${
                          isCaptain ? 'bg-amber-400/[0.03]' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-gray-500 font-bold text-sm">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative">
                              <img
                                src={member.passport_photo_url || samplePhotos[index % samplePhotos.length]}
                                alt={member.name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-white/10 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              {isCaptain && (
                                <span className="absolute -bottom-1 -right-1 text-sm bg-[#0D0F14] rounded-full p-0.5">
                                  🏅
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                {member.name}
                              </div>
                              <span className="text-xs font-mono text-gray-400">
                                {member.participant_id || `P-${teamMeta?.code || 'TM'}-${(index + 1).toString().padStart(3, '0')}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            isCaptain 
                              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30' 
                              : 'text-brand-green bg-brand-green/10 border border-brand-green/20'
                          }`}>
                            {isCaptain ? '🏅 TEAM CAPTAIN' : 'PARTICIPANT'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <BookOpen size={14} className="text-gray-500" />
                            {member.subject || 'General Science'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">
                              {member.current_stage || 'Group Stage 1'}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {member.qualification_status || 'In Progress'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} />
                            Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenModal(member)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer information */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#0A0C10] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div>
            Showing <strong>{teamMembers.length}</strong> team members. Minimum required: <strong>11 (10 members + 1 Captain)</strong>.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={14} /> Zero Negative Scoring in Online Stages
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Trophy size={14} /> 24/44 Min to Qualify
            </span>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT MEMBER MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#13151A] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingMember ? 'Edit Participant Details' : 'Register New Team Member'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Team Umbrella: <span className="text-white font-bold">{teamMeta?.umbrella_name}</span>
                  </p>
                </div>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                {formError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={16} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Participant Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Samuel Adekunle"
                    required
                    className="w-full bg-[#0A0C10] border border-white/10 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Team Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-[#0A0C10] border border-white/10 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none"
                    >
                      <option value="Captain">🏅 Team Captain</option>
                      <option value="Member">Participating Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Participant ID</label>
                    <input
                      type="text"
                      value={formData.participant_id}
                      onChange={(e) => setFormData({ ...formData, participant_id: e.target.value })}
                      placeholder="e.g. P-KC-001"
                      className="w-full bg-[#0A0C10] border border-white/10 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white font-mono text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Passport Photograph Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    Passport Photograph *
                  </label>
                  
                  <div className="p-4 bg-[#0A0C10] rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={formData.passport_photo_url || samplePhotos[0]}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-brand-green/60 shadow-md"
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                          id="passport-file-upload"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-500 text-[#0D0F14] font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
                        >
                          <Upload size={15} />
                          {uploadingPhoto ? 'Uploading Image...' : 'Upload Passport from Computer'}
                        </button>
                        <p className="text-[11px] text-gray-400">
                          Click to select a photo from your device (JPG, PNG, WEBP).
                        </p>
                      </div>
                    </div>

                    {/* Presets and URL Fallback */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <p className="text-xs text-gray-400">Or select a preset photograph:</p>
                      <div className="flex gap-2">
                        {samplePhotos.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFormData({ ...formData, passport_photo_url: url })}
                            className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                              formData.passport_photo_url === url ? 'border-brand-green scale-110 shadow-sm shadow-brand-green/40' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <input
                          type="url"
                          value={formData.passport_photo_url}
                          onChange={(e) => setFormData({ ...formData, passport_photo_url: e.target.value })}
                          placeholder="Or paste an image URL..."
                          className="w-full bg-[#13151A] border border-white/10 focus:border-brand-green rounded-xl px-3.5 py-2 text-xs text-gray-300 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Specialty Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0A0C10] border border-white/10 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none"
                  >
                    <option value="General Science">General Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Current Affairs">Current Affairs</option>
                    <option value="All-Rounder">All-Rounder</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-brand-green hover:bg-emerald-500 text-[#0D0F14] font-bold rounded-xl transition-all shadow-lg shadow-brand-green/20"
                  >
                    {editingMember ? 'Save Changes' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
