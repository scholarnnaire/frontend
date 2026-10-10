import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '../../utils/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff, Users, 
  Shield, Trophy, Copy, Check, Sparkles, Camera, ArrowRight, Upload 
} from 'lucide-react';
import naijaStates from 'naija-state-local-government';

export function Registration() {
  const [searchParams] = useSearchParams();
  const initialTeamCode = searchParams.get('team_code') || searchParams.get('team') || '';
  const navigate = useNavigate();

  // Mode: 'participant' (Rule 1 Team Formation) vs 'school' (Institution Setup)
  const [regMode, setRegMode] = useState(initialTeamCode ? 'participant' : 'participant');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  
  // Participant Registration State
  const [participantForm, setParticipantForm] = useState({
    name: '',
    email: '',
    role: 'Member',
    subject: 'General Science',
    team_selection_mode: initialTeamCode ? 'existing' : 'existing', // 'existing' or 'create'
    selected_team_id: '',
    team_code: initialTeamCode,
    new_team_umbrella_name: '',
    passport_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    qualification_code: ''
  });

  const [publicTeams, setPublicTeams] = useState([]);
  const [participantSuccess, setParticipantSuccess] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // School Registration State
  const [step, setStep] = useState(1);
  const [formStep, setFormStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [verifyToken, setVerifyToken] = useState('');

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  ];

  const [schoolFormData, setSchoolFormData] = useState({
    name: '',
    state: '',
    lga: '',
    type: '',
    category: 'Senior Secondary',
    contact_email: '',
    contact_phone: '',
    admin_username: '',
    password: ''
  });

  useEffect(() => {
    // Fetch categories and public teams
    axios.get('http://localhost:8000/api/user/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to load categories", err));

    api.get('/competition/teams/public')
      .then(res => {
        setPublicTeams(res.data);
        if (res.data.length > 0 && !initialTeamCode) {
          setParticipantForm(prev => ({ ...prev, selected_team_id: res.data[0].id }));
        }
      })
      .catch(err => console.error("Failed to load public teams", err));
  }, [initialTeamCode]);

  const handleSchoolChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' && (value === 'Corpers' || value === 'Adult/Open')) {
      setSchoolFormData({ ...schoolFormData, category: value, type: '' });
    } else if (name === 'state') {
      setSchoolFormData({ ...schoolFormData, state: value, lga: '' });
    } else {
      setSchoolFormData({ ...schoolFormData, [name]: value });
    }
  };

  const isTypeDisabled = schoolFormData.category === 'Corpers' || schoolFormData.category === 'Adult/Open';

  const handleSchoolNext = () => {
    setError(null);
    if (formStep === 1) {
      if (!schoolFormData.name) return setError("School Name is required.");
      if (!isTypeDisabled && !schoolFormData.type) return setError("School Type is required.");
    } else if (formStep === 2) {
      if (!schoolFormData.state || !schoolFormData.lga) return setError("State and LGA are required.");
    }
    setFormStep(prev => prev + 1);
  };

  const handleSchoolPrev = () => {
    setError(null);
    setFormStep(prev => prev - 1);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setParticipantForm(prev => ({ ...prev, passport_photo_url: event.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      setUploadingPhoto(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await api.post('/competition/upload-passport', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setParticipantForm(prev => ({ ...prev, passport_photo_url: `http://localhost:8000${res.data.url}` }));
      }
    } catch (err) {
      console.warn('Upload error:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const registerParticipant = async (e) => {
    e.preventDefault();
    setError(null);

    if (!participantForm.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (participantForm.team_selection_mode === 'create' && !participantForm.new_team_umbrella_name.trim()) {
      setError("Please specify an approved Team Umbrella Name to create.");
      return;
    }

    if (participantForm.team_selection_mode === 'existing' && !participantForm.selected_team_id && !participantForm.team_code) {
      setError("Please select a team or enter a Team Code.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: participantForm.name.trim(),
        email: participantForm.email.trim() || undefined,
        role: participantForm.team_selection_mode === 'create' ? 'Captain' : participantForm.role,
        subject: participantForm.subject,
        passport_photo_url: participantForm.passport_photo_url,
        qualification_code: participantForm.qualification_code.trim() || undefined,
        team_id: participantForm.team_selection_mode === 'existing' && participantForm.selected_team_id ? Number(participantForm.selected_team_id) : undefined,
        team_code: participantForm.team_selection_mode === 'existing' && participantForm.team_code ? participantForm.team_code.trim().toUpperCase() : undefined,
        new_team_umbrella_name: participantForm.team_selection_mode === 'create' ? participantForm.new_team_umbrella_name.trim() : undefined
      };

      const res = await api.post('/competition/participant/register', payload);
      setParticipantSuccess(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const registerSchool = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!schoolFormData.contact_email || !schoolFormData.admin_username || !schoolFormData.password) {
      setError("Please fill all required admin details.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/user/register', {
        ...schoolFormData,
        category: schoolFormData.category
      });
      setStep(2);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration failed. School might already be registered.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (code) => {
    const inviteUrl = `${window.location.origin}/register?team_code=${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 w-full">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
            M
          </div>
          <span className="font-bold text-xl tracking-tight text-brand-dark">Millionaires on Wheels</span>
        </Link>
        <div className="flex gap-4 items-center font-medium">
          <Link to="/user/dashboard" className="text-brand-green hover:underline font-bold text-sm">
            Go to Dashboard
          </Link>
          <Link to="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full py-8">
        
        <div className="w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-brand-dark/5 border border-gray-100">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-brand-green text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy size={14} /> National Quiz Championship
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-brand-dark mb-2">
              Portal Registration
            </h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto">
              Every participant must be registered with personal information and a passport photograph under one approved umbrella team name.
            </p>
          </div>

          {/* Mode Switcher */}
          {!participantSuccess && (
            <div className="grid grid-cols-2 p-1.5 bg-gray-100 rounded-2xl max-w-md mx-auto mb-8 text-sm font-bold">
              <button
                type="button"
                onClick={() => { setRegMode('participant'); setError(null); }}
                className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  regMode === 'participant' 
                    ? 'bg-white text-brand-dark shadow-sm' 
                    : 'text-gray-500 hover:text-brand-dark'
                }`}
              >
                <Users size={16} /> Participant / Member
              </button>
              <button
                type="button"
                onClick={() => { setRegMode('school'); setError(null); }}
                className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  regMode === 'school' 
                    ? 'bg-white text-brand-dark shadow-sm' 
                    : 'text-gray-500 hover:text-brand-dark'
                }`}
              >
                <Shield size={16} /> School / Institution
              </button>
            </div>
          )}
          
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
              <AlertCircle size={20} className="shrink-0" /> {error}
            </motion.div>
          )}

          {/* PARTICIPANT REGISTRATION FORM (SECTION 1 RULES) */}
          {regMode === 'participant' && (
            <div>
              {participantSuccess ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle size={44} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-brand-dark">Registration Completed!</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      You are officially registered under approved team <strong className="text-brand-dark">{participantSuccess.team.umbrella_name}</strong>.
                    </p>
                  </div>

                  {/* Registered Participant Card */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 max-w-md mx-auto text-left space-y-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={participantSuccess.member.passport_photo_url} 
                        alt="Passport" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-brand-green shadow-sm"
                      />
                      <div>
                        <div className="font-black text-lg text-brand-dark flex items-center gap-1.5">
                          {participantSuccess.member.name}
                          {participantSuccess.member.is_captain && <span title="Team Captain">🏅</span>}
                        </div>
                        <div className="text-xs font-mono font-bold text-gray-500">
                          Participant ID: {participantSuccess.member.participant_id}
                        </div>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-green/10 text-brand-green">
                          {participantSuccess.member.role === 'Captain' ? '🏅 TEAM CAPTAIN' : 'PARTICIPATING MEMBER'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Umbrella Team:</span>
                        <span className="font-bold text-brand-dark">{participantSuccess.team.umbrella_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Team Code:</span>
                        <span className="font-mono font-bold text-brand-dark">{participantSuccess.team.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Initial Stage:</span>
                        <span className="font-bold text-emerald-600">{participantSuccess.member.current_stage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Team Constitution:</span>
                        <span className="font-bold text-brand-dark">
                          {participantSuccess.constitution.total_members} / 11 Members Registered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Share Team Invite Link */}
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md mx-auto space-y-3">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      Invite Remaining Team Members (Min 11 Required)
                    </div>
                    <p className="text-xs text-emerald-700">
                      Share this invite link with your teammates so they can register under your team umbrella name.
                    </p>
                    <button
                      onClick={() => copyShareLink(participantSuccess.team.code)}
                      className="w-full py-3 bg-brand-green text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-md"
                    >
                      {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                      {copiedLink ? 'Invite Link Copied to Clipboard!' : 'Copy Team Registration Link'}
                    </button>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/user/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-dark text-white font-bold rounded-xl text-base hover:bg-black transition-all shadow-lg"
                    >
                      Go to Competition Dashboard <ArrowRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={registerParticipant} className="space-y-6">
                  {/* Step A: Personal Information & Passport */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-brand-dark flex items-center gap-2 border-b pb-2">
                      <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center">1</span>
                      Personal Details & Passport Photo
                    </h3>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Participant Full Name *</label>
                      <input
                        type="text"
                        required
                        value={participantForm.name}
                        onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                        placeholder="e.g. David Ogunleye"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={participantForm.email}
                          onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })}
                          placeholder="e.g. david@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject Specialty</label>
                        <select
                          value={participantForm.subject}
                          onChange={(e) => setParticipantForm({ ...participantForm, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-base bg-white"
                        >
                          <option value="General Science">General Science</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="English">English</option>
                          <option value="Current Affairs">Current Affairs</option>
                          <option value="All-Rounder">All-Rounder</option>
                        </select>
                      </div>
                    </div>

                    {/* Passport Photo Upload & Selector */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Passport Photograph *</label>
                      <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img 
                              src={participantForm.passport_photo_url || samplePhotos[0]} 
                              alt="Passport preview" 
                              className="w-16 h-16 rounded-full object-cover border-2 border-brand-green shadow-sm"
                            />
                            {uploadingPhoto && (
                              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
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
                              id="reg-passport-upload"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingPhoto}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
                            >
                              <Upload size={15} />
                              {uploadingPhoto ? 'Uploading Image...' : 'Upload Passport from Computer'}
                            </button>
                            <p className="text-[11px] text-gray-500">
                              Upload an official portrait from your device (JPG, PNG, WEBP).
                            </p>
                          </div>
                        </div>

                        {/* Presets and URL Fallback */}
                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          <p className="text-xs text-gray-500">Or select a preset photograph:</p>
                          <div className="flex gap-2">
                            {samplePhotos.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setParticipantForm({ ...participantForm, passport_photo_url: url })}
                                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                                  participantForm.passport_photo_url === url ? 'border-brand-green scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>

                          <div className="pt-2">
                            <input
                              type="url"
                              value={participantForm.passport_photo_url}
                              onChange={(e) => setParticipantForm({ ...participantForm, passport_photo_url: e.target.value })}
                              placeholder="Or paste an image URL..."
                              className="w-full bg-white border border-gray-300 focus:ring-2 focus:ring-brand-green rounded-xl px-3.5 py-2 text-xs text-gray-700 transition-all outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step B: Team Umbrella Linkage (Rule 1 & 5) */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-black text-brand-dark flex items-center gap-2 border-b pb-2">
                      <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center">2</span>
                      Approved Team Umbrella Name Linkage
                    </h3>

                    {/* Mode: Join vs Create */}
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setParticipantForm({ ...participantForm, team_selection_mode: 'existing' })}
                        className={`py-2.5 rounded-lg transition-all ${
                          participantForm.team_selection_mode === 'existing'
                            ? 'bg-white text-brand-dark shadow-sm'
                            : 'text-gray-500 hover:text-brand-dark'
                        }`}
                      >
                        Join Existing Umbrella Team
                      </button>
                      <button
                        type="button"
                        onClick={() => setParticipantForm({ ...participantForm, team_selection_mode: 'create', role: 'Captain' })}
                        className={`py-2.5 rounded-lg transition-all ${
                          participantForm.team_selection_mode === 'create'
                            ? 'bg-white text-brand-dark shadow-sm'
                            : 'text-gray-500 hover:text-brand-dark'
                        }`}
                      >
                        Create New Team Umbrella (as Captain 🏅)
                      </button>
                    </div>

                    {participantForm.team_selection_mode === 'create' ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                        <div>
                          <label className="block text-sm font-bold text-emerald-900 mb-1">
                            New Approved Umbrella / Team Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={participantForm.new_team_umbrella_name}
                            onChange={(e) => setParticipantForm({ ...participantForm, new_team_umbrella_name: e.target.value })}
                            placeholder="e.g. Corona High School"
                            className="w-full px-4 py-3 rounded-xl border border-emerald-300 focus:ring-2 focus:ring-brand-green outline-none text-base bg-white"
                          />
                        </div>
                        <p className="text-xs text-emerald-700">
                          Creating a new team will automatically register you as <strong>Team Captain 🏅</strong>. You will receive a unique Team Code to invite the remaining 10 participating members.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Approved Team</label>
                            <select
                              value={participantForm.selected_team_id}
                              onChange={(e) => setParticipantForm({ ...participantForm, selected_team_id: e.target.value, team_code: '' })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-base bg-white"
                            >
                              <option value="">-- Choose from existing teams --</option>
                              {publicTeams.map(t => (
                                <option key={t.id} value={t.id}>{t.umbrella_name || t.name} ({t.code})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Or Enter Team Code</label>
                            <input
                              type="text"
                              value={participantForm.team_code}
                              onChange={(e) => setParticipantForm({ ...participantForm, team_code: e.target.value.toUpperCase(), selected_team_id: '' })}
                              placeholder="e.g. KC-0001"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none font-mono text-base uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">Team Role</label>
                          <select
                            value={participantForm.role}
                            onChange={(e) => setParticipantForm({ ...participantForm, role: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-base bg-white"
                          >
                            <option value="Member">Participating Member</option>
                            <option value="Captain">🏅 Team Captain</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step C: Optional Qualification Code for Next Rounds */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Stage Progression / Qualification Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={participantForm.qualification_code}
                      onChange={(e) => setParticipantForm({ ...participantForm, qualification_code: e.target.value.toUpperCase() })}
                      placeholder="e.g. QC-GS1-A4829F (leave empty for Group Stage 1)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none font-mono text-xs uppercase"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      If you qualified from an earlier stage, provide the unique code from your qualification certificate.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-green text-white font-black text-lg rounded-2xl hover:bg-emerald-600 transition-all active:scale-[0.99] shadow-lg shadow-brand-green/20 disabled:opacity-80 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : 'Complete Registration & Link to Team'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SCHOOL / INSTITUTION REGISTRATION (EXISTING ADMIN FLOW) */}
          {regMode === 'school' && (
            <div>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    
                    {/* Stepper Indicator */}
                    <div className="flex items-center justify-between mb-8 relative max-w-sm mx-auto">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green rounded-full z-0 transition-all duration-300" style={{ width: `${((formStep - 1) / 2) * 100}%` }}></div>
                      {[1, 2, 3].map(num => (
                        <div key={num} className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${formStep >= num ? 'bg-brand-green text-white shadow-md shadow-brand-green/30 scale-110' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                          {num}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={registerSchool} className="space-y-6">
                      {formStep === 1 && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div>
                            <label className="block text-base font-semibold text-brand-dark mb-2">School / Umbrella Name *</label>
                            <input type="text" name="name" required value={schoolFormData.name} onChange={handleSchoolChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base" placeholder="e.g. King's College Lagos" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-base font-semibold text-brand-dark mb-2">Category *</label>
                              <select name="category" value={schoolFormData.category} onChange={handleSchoolChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base">
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-base font-semibold text-brand-dark mb-2">School Type {!isTypeDisabled && '*'}</label>
                              <select name="type" value={schoolFormData.type} onChange={handleSchoolChange} required={!isTypeDisabled} disabled={isTypeDisabled} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base disabled:opacity-50">
                                <option value="" disabled>Select School Type</option>
                                <option value="Private">Private</option>
                                <option value="Public">Public</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {formStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-base font-semibold text-brand-dark mb-2">State *</label>
                            <select name="state" required value={schoolFormData.state} onChange={handleSchoolChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base">
                              <option value="" disabled>Select State</option>
                              {naijaStates.states().map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-base font-semibold text-brand-dark mb-2">LGA *</label>
                            <select name="lga" required value={schoolFormData.lga} onChange={handleSchoolChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base disabled:opacity-50" disabled={!schoolFormData.state}>
                              <option value="" disabled>Select LGA</option>
                              {schoolFormData.state && naijaStates.lgas(schoolFormData.state)?.lgas?.map(l => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}

                      {formStep === 3 && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-base font-semibold text-brand-dark mb-2">Contact Email *</label>
                              <input type="email" name="contact_email" required value={schoolFormData.contact_email} onChange={handleSchoolChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base" placeholder="admin@school.edu.ng" />
                            </div>
                            <div>
                              <label className="block text-base font-semibold text-brand-dark mb-2">Contact Phone</label>
                              <input type="text" name="contact_phone" value={schoolFormData.contact_phone} onChange={handleSchoolChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base" placeholder="+234..." />
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Credentials</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Admin Username *</label>
                                <input type="text" name="admin_username" required value={schoolFormData.admin_username} onChange={handleSchoolChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base" placeholder="admin_username" />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-brand-dark mb-2">Password *</label>
                                <div className="relative">
                                  <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    required 
                                    value={schoolFormData.password} 
                                    onChange={handleSchoolChange} 
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green transition-all text-base pr-12" 
                                    placeholder="Password" 
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors"
                                  >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="pt-4 flex gap-4">
                        {formStep > 1 && (
                          <button type="button" onClick={handleSchoolPrev} className="px-6 py-4 bg-white border border-gray-200 text-brand-dark text-base font-bold rounded-xl hover:bg-gray-50 transition-all">
                            Back
                          </button>
                        )}
                        
                        {formStep < 3 ? (
                          <button type="button" onClick={handleSchoolNext} className="flex-1 py-4 bg-brand-green text-white text-base font-bold rounded-xl hover:bg-green-500 transition-all shadow-md">
                            Continue
                          </button>
                        ) : (
                          <button type="submit" disabled={loading} className="flex-1 py-4 bg-brand-green text-white text-base font-bold rounded-xl hover:bg-green-500 transition-all shadow-md flex justify-center items-center gap-3 disabled:opacity-80">
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : 'Register School'}
                          </button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                    <div className="w-24 h-24 bg-brand-green rounded-full mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-brand-green/30">
                      <CheckCircle size={48} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-black text-brand-dark mb-2">Registration Successful!</h3>
                    <p className="text-gray-500 text-base mb-6 max-w-md mx-auto">
                      A 6-digit verification code has been generated for your account. Please enter it below:
                    </p>
                    
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!verifyToken) return setError("Please enter your verification code");
                        try {
                          setLoading(true);
                          const res = await api.post('/user/verify-email', { token: verifyToken });
                          localStorage.setItem('token', res.data.access_token);
                          navigate(`/user/dashboard`);
                        } catch (err) {
                          setError(err.response?.data?.detail || "Invalid verification code");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="max-w-md mx-auto mb-6 flex flex-col gap-4"
                    >
                      <input 
                        type="text"
                        value={verifyToken}
                        onChange={(e) => setVerifyToken(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code"
                        className="w-full text-center tracking-widest px-6 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green text-lg font-bold bg-white"
                        maxLength={6}
                        required
                      />
                      <button type="submit" disabled={loading} className="w-full py-3.5 bg-brand-green text-white text-base font-bold rounded-xl hover:bg-green-500 transition-all shadow-md disabled:opacity-80 flex justify-center items-center">
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : 'Verify & Continue'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-gray-200 text-center text-gray-500 text-xs bg-white">
        <p>&copy; 2026 Millionaires on Wheels. Official Competition Portal.</p>
      </footer>
    </div>
  );
}
