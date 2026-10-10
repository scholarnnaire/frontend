import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Trophy, Edit2, Trash2, X, CheckCircle, Users, Shield, BookOpen } from 'lucide-react';
import axios from 'axios';

export function MatchEvents() {
  const { isDarkMode } = useOutletContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [currentTournament, setCurrentTournament] = useState({ name: '', description: '', tournament_track_id: '', is_active: true, start_date: '', end_date: '', school_categories: [], scope: 'global', state: '', entry_fee: '', is_free: false });
  const [isEditingTournament, setIsEditingTournament] = useState(false);

  const SCHOOL_CATEGORIES = ['Primary', 'Junior Secondary', 'Senior Secondary', 'Tertiary', 'Corpers', 'Adults / Open'];

  const NIGERIAN_STATES = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
    'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara',
    'Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo',
    'Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'
  ];

  const toggleCategory = (cat) => {
    const current = currentTournament.school_categories || [];
    const updated = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
    setCurrentTournament({ ...currentTournament, school_categories: updated });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tournRes, tracksRes] = await Promise.all([
        fetch('http://localhost:8000/api/tournaments/').then(r => r.json()),
        fetch('http://localhost:8000/api/tournaments/tracks').then(r => r.json())
      ]);
      setTournaments(tournRes);
      setTracks(tracksRes);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEnrolledTeams = (tournament) => {
    navigate(`/admin/events/${tournament.id}/enrolled`);
  };

  const handleOpenTournamentModal = (tournament = null) => {
    if (tournament) {
      setCurrentTournament({
        ...tournament,
        school_categories: tournament.school_categories ? tournament.school_categories.split(',').map(s => s.trim()) : [],
        scope: tournament.scope || 'global',
        state: tournament.state || ''
      });
      setIsEditingTournament(true);
    } else {
      setCurrentTournament({ name: '', description: '', tournament_track_id: '', is_active: true, start_date: '', end_date: '', school_categories: [], scope: 'global', state: '', entry_fee: '', is_free: false });
      setIsEditingTournament(false);
    }
    setIsTournamentModalOpen(true);
  };

  const handleSaveTournament = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentTournament,
        school_categories: Array.isArray(currentTournament.school_categories)
          ? currentTournament.school_categories.join(',')
          : currentTournament.school_categories,
        start_date: currentTournament.start_date || null,
        end_date: currentTournament.end_date || null,
        scope: currentTournament.scope || 'global',
        state: currentTournament.scope === 'state' ? currentTournament.state : null,
      };
      const url = isEditingTournament 
        ? `http://localhost:8000/api/tournaments/${currentTournament.id}` 
        : `http://localhost:8000/api/tournaments/`;
      
      const method = isEditingTournament ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to save tournament');
      }
      
      await fetchData();
      setIsTournamentModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this tournament? Teams assigned to it will be affected.`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/tournaments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `Failed to delete tournament`);
      }
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full relative ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-dark'}`}>Match & Events</h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Schedule tournaments, manage groups, and generate access codes.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
            <input 
              type="text" 
              placeholder="Search match events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-full shadow-sm ${isDarkMode ? 'bg-[#0A0C10] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
            />
          </div>
          <button 
            onClick={() => navigate('/admin/arena')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shrink-0 cursor-pointer bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border border-red-400/30"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Live Arena Console
          </button>
          <button 
            onClick={() => handleOpenTournamentModal()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 cursor-pointer ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            <Plus size={16} /> Create Match & Event
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(() => {
            const now = new Date();
            const active = tournaments.filter(t => t.is_active).length;
            const upcoming = tournaments.filter(t => t.start_date && new Date(t.start_date) > now).length;
            const stateScoped = tournaments.filter(t => t.scope === 'state').length;
            const globalScoped = tournaments.filter(t => !t.scope || t.scope === 'global').length;
            return [
              { label: 'Active Events', value: active, icon: <Calendar size={22}/>, color: 'blue', sub: `${tournaments.length - active} completed` },
              { label: 'Upcoming', value: upcoming, icon: <Trophy size={22}/>, color: 'orange', sub: `${upcoming} not yet started` },
              { label: 'Global', value: globalScoped, icon: null, color: 'indigo', emoji: '🌐', sub: 'Open nationwide' },
              { label: 'State', value: stateScoped, icon: null, color: 'purple', emoji: '📍', sub: 'State-restricted' },
            ].map(stat => (
              <div key={stat.label} className={`p-4 rounded-xl border flex items-center gap-4 ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                {stat.icon && (
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    stat.color === 'blue' ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') :
                    stat.color === 'orange' ? (isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600') :
                    stat.color === 'indigo' ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600') :
                    (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600')
                  }`}>
                    {stat.icon}
                  </div>
                )}
                {!stat.icon && (
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    stat.color === 'indigo' ? (isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50') : (isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50')
                  }`}>
                    {stat.emoji}
                  </div>
                )}
                <div className="min-w-0">
                  <div className={`text-xs font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                  <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{stat.sub}</div>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* ── TABLE VIEW ── */}
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
          {/* Table header */}
          <div className={`grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_0.8fr_auto] items-center px-5 py-3 border-b text-[10px] uppercase tracking-widest font-bold ${isDarkMode ? 'border-white/5 text-gray-500 bg-white/2' : 'border-gray-100 text-gray-400 bg-gray-50'}`}>
            <span>Event</span>
            <span>Track / Scope</span>
            <span>Dates</span>
            <span>Entry Fee</span>
            <span>Team Size</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {tournaments.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 gap-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              <Trophy size={32} />
              <p className="text-sm font-medium">No events found</p>
            </div>
          ) : (
            tournaments
              .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((tournament, idx, arr) => (
                <div
                  key={tournament.id}
                  className={`group grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_0.8fr_auto] items-center px-5 py-4 transition-colors ${
                    idx !== arr.length - 1 ? (isDarkMode ? 'border-b border-white/5' : 'border-b border-gray-100') : ''
                  } ${isDarkMode ? 'hover:bg-white/3' : 'hover:bg-gray-50/80'}`}
                >
                  {/* Event name + categories */}
                  <div className="min-w-0 pr-4">
                    <div className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tournament.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tournament.school_categories && tournament.school_categories.split(',').map(cat => (
                        <span key={cat.trim()} className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                          {cat.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Track + Scope */}
                  <div className="min-w-0 pr-4">
                    <div className={`text-xs font-semibold truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tournament.track?.name || '—'}
                    </div>
                    <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      tournament.scope === 'state'
                        ? (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600')
                        : (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')
                    }`}>
                      {tournament.scope === 'state' ? `📍 ${tournament.state}` : '🌐 Global'}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className={`text-xs pr-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tournament.start_date ? (
                      <>
                        <div>{new Date(tournament.start_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'2-digit' })}</div>
                        <div className={`mt-0.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          → {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'2-digit' }) : 'TBD'}
                        </div>
                      </>
                    ) : (
                      <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>—</span>
                    )}
                  </div>

                  {/* Entry Fee */}
                  <div className="pr-4">
                    {tournament.is_free ? (
                      <span className="text-xs font-black text-green-500 uppercase">Free</span>
                    ) : (
                      <div>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {tournament.entry_fee || tournament.track?.entry_fee || '—'}
                        </span>
                        {tournament.entry_fee && tournament.track?.entry_fee && tournament.entry_fee !== tournament.track.entry_fee && (
                          <span className={`block text-[10px] line-through ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                            {tournament.track.entry_fee}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Team Size */}
                  <div className="pr-4">
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tournament.team_size || 5} players
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      tournament.is_active
                        ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-500')
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tournament.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                      {tournament.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pl-4">
                    <button
                      onClick={() => handleViewEnrolledTeams(tournament)}
                      title="View enrolled schools"
                      className={`relative p-2 rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800'}`}
                    >
                      <Users size={13} />
                      {(tournament.enrolled_count ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-black bg-red-500 text-white leading-none">
                          {tournament.enrolled_count}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenTournamentModal(tournament)}
                      title="Edit"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteTournament(tournament.id)}
                      title="Delete"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-500' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>


      {/* Edit/Create Tournament Modal */}
      {isTournamentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-[#0D0F14] border-white/10 shadow-black/50' : 'bg-white border-gray-200 shadow-gray-200/50'} overflow-hidden`}>
            
            <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEditingTournament ? 'Edit Match & Event' : 'New Match & Event'}
              </h3>
              <button onClick={() => setIsTournamentModalOpen(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="p-6 overflow-y-auto max-h-[75vh]">
              {/* Row 1: Event Name + Track */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Event Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required 
                    value={currentTournament.name} onChange={e => setCurrentTournament({...currentTournament, name: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    placeholder="e.g. 2026 Winter Regionals"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parent Module / Track <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={currentTournament.tournament_track_id} 
                    onChange={e => setCurrentTournament({...currentTournament, tournament_track_id: parseInt(e.target.value) || ''})}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="" disabled>Select a module</option>
                    {tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Start & End Dates */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                  <input 
                    type="date"
                    value={currentTournament.start_date || ''} onChange={e => setCurrentTournament({...currentTournament, start_date: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                  <input 
                    type="date"
                    value={currentTournament.end_date || ''} onChange={e => setCurrentTournament({...currentTournament, end_date: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Row 2.5: Limits */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Max Participating Schools</label>
                  <input 
                    type="number"
                    min="1"
                    value={currentTournament.max_schools || 100} onChange={e => setCurrentTournament({...currentTournament, max_schools: parseInt(e.target.value) || 100})}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Students Per Team</label>
                  <input 
                    type="number"
                    min="1"
                    value={currentTournament.team_size || 5} onChange={e => setCurrentTournament({...currentTournament, team_size: parseInt(e.target.value) || 5})}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Row 2b: Geolocation Scope */}
              <div className="mb-5">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Competition Scope</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { value: 'global', label: '🌐 Global', desc: 'Open to all schools nationwide' },
                    { value: 'state', label: '📍 State', desc: 'Visible only to schools in a specific state' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCurrentTournament({ ...currentTournament, scope: opt.value, state: '' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        currentTournament.scope === opt.value
                          ? (isDarkMode ? 'bg-red-500/15 border-red-500/60 text-red-400' : 'bg-red-50 border-red-400 text-red-700')
                          : (isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300')
                      }`}
                    >
                      <div className="font-bold text-sm">{opt.label}</div>
                      <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {/* State selector — shown only when scope = 'state' */}
                {currentTournament.scope === 'state' && (
                  <select
                    required
                    value={currentTournament.state || ''}
                    onChange={e => setCurrentTournament({ ...currentTournament, state: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="" disabled>Select a state…</option>
                    {NIGERIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Row 3: School Categories */}
              <div className="mb-5">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>School Categories <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(select all that apply)</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {SCHOOL_CATEGORIES.map(cat => {
                    const selected = (currentTournament.school_categories || []).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                          selected
                            ? (isDarkMode ? 'bg-red-500/15 border-red-500/60 text-red-400' : 'bg-red-50 border-red-400 text-red-600')
                            : (isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/8' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100')
                        }`}
                      >
                        <span className={`inline-block w-4 h-4 rounded mr-1.5 border text-center leading-none text-[10px] ${selected ? (isDarkMode ? 'bg-red-500 border-red-500 text-white' : 'bg-red-500 border-red-500 text-white') : (isDarkMode ? 'border-white/20' : 'border-gray-300')}`}>
                          {selected ? '✓' : ''}
                        </span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3b: Entry Fee Override */}
              <div className="mb-5">
                <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Custom Entry Fee
                  <span className={`text-xs font-normal ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {currentTournament.tournament_track_id && tracks.find(t => t.id === Number(currentTournament.tournament_track_id))?.entry_fee
                      ? `(Track default: ${tracks.find(t => t.id === Number(currentTournament.tournament_track_id)).entry_fee})`
                      : '(Optional — leave blank to use track default)'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentTournament.entry_fee || ''}
                    onChange={e => setCurrentTournament({...currentTournament, entry_fee: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    placeholder="e.g. ₦5,000 — overrides track fee"
                  />
                  {currentTournament.entry_fee && (
                    <button
                      type="button"
                      onClick={() => setCurrentTournament({...currentTournament, entry_fee: ''})}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                    >
                      clear
                    </button>
                  )}
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="mb-5">
                <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(Optional)</span></label>
                <textarea 
                  rows="3"
                  value={currentTournament.description || ''} onChange={e => setCurrentTournament({...currentTournament, description: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                  placeholder="Specific rules or details for this event (inherits module description if blank)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Active toggle */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDarkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={currentTournament.is_active} onChange={e => setCurrentTournament({...currentTournament, is_active: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <div>
                    <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Status</div>
                    <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Make visible for enrollment</div>
                  </div>
                </div>

                {/* Free toggle */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={currentTournament.is_free} onChange={e => setCurrentTournament({...currentTournament, is_free: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <div>
                    <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free Event</div>
                    <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Waive all entry fees</div>
                  </div>
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-5 mt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <button type="button" onClick={() => setIsTournamentModalOpen(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20">
                  <CheckCircle size={16} /> Save Match & Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
