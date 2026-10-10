import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, XCircle, Users, Trash2, X, PlusCircle, MinusCircle, Eye } from 'lucide-react';

export function TeamManagement() {
  const { isDarkMode } = useOutletContext();
  const [teams, setTeams] = useState([]);
  const [schools, setSchools] = useState([]);
  const [tournamentTracks, setTournamentTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    school_id: '',
    tournament_track_id: '',
    members: [{ name: '', is_captain: true, is_lifeline_officer: false }]
  });
  const [newSchool, setNewSchool] = useState({
    name: '',
    state: '',
    category: 'Primary'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsRes, schoolsRes, tracksRes] = await Promise.all([
        api.get('/admin/teams'),
        api.get('/admin/schools'),
        api.get('/tournaments/tracks')
      ]);
      setTeams(teamsRes.data);
      setSchools(schoolsRes.data);
      setTournamentTracks(tracksRes.data);
      if (tracksRes.data.length > 0) {
        setNewTeam(prev => ({ ...prev, tournament_track_id: tracksRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await api.delete(`/admin/teams/${teamId}`);
      setTeams(teams.filter(t => t.id !== teamId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete team');
    }
  };

  const handleAddMember = () => {
    setNewTeam({
      ...newTeam,
      members: [...newTeam.members, { name: '', is_captain: false, is_lifeline_officer: false }]
    });
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = newTeam.members.filter((_, i) => i !== index);
    setNewTeam({ ...newTeam, members: updatedMembers });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...newTeam.members];
    updatedMembers[index][field] = value;
    setNewTeam({ ...newTeam, members: updatedMembers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTeam.school_id) {
      alert("Please select a school");
      return;
    }
    
    // Convert school_id to integer
    const payload = {
      ...newTeam,
      school_id: parseInt(newTeam.school_id)
    };

    try {
      const response = await api.post('/admin/teams', payload);
      setTeams([...teams, response.data]);
      setIsModalOpen(false);
      setNewTeam({
        name: '',
        school_id: '',
        tournament_track_id: tournamentTracks.length > 0 ? tournamentTracks[0].id : '',
        members: [{ name: '', is_captain: true, is_lifeline_officer: false }]
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add team');
    }
  };

  const handleAddSchool = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/schools', newSchool);
      setSchools([...schools, response.data]);
      setIsSchoolModalOpen(false);
      setNewTeam({ ...newTeam, school_id: response.data.id });
      setNewSchool({ name: '', state: '', category: 'Primary' });
    } catch (err) {
      console.error(err);
      alert('Failed to add school');
    }
  };

  const filteredTeams = teams.filter(team => {
    const schoolName = schools.find(s => s.id === team.school_id)?.name || '';
    return team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           schoolName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full relative ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-dark'}`}>Team Management</h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add, delete, and manage registered teams and their members.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
            <input 
              type="text" 
              placeholder="Search teams..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-full shadow-sm ${isDarkMode ? 'bg-[#0A0C10] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 cursor-pointer ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            <Plus size={16} /> Add Team
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-red-500' : 'border-red-600'}`}></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <XCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-64 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className={`p-4 rounded-full mb-3 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <Users size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No teams found</p>
            <p className="text-sm mt-1">Try adjusting your search criteria or add a new team</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 backdrop-blur-md shadow-sm z-10 text-sm uppercase tracking-wider font-semibold border-b ${isDarkMode ? 'bg-[#13151A]/90 text-gray-400 border-white/10' : 'bg-gray-50/90 text-gray-500 border-gray-200'}`}>
              <tr>
                <th className="py-4 px-6">Team Name</th>
                <th className="py-4 px-6">School</th>
                <th className="py-4 px-6">Members</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-base ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {filteredTeams.map((team) => {
                const school = schools.find(s => s.id === team.school_id);
                const captain = team.members.find(m => m.is_captain);
                return (
                  <tr key={team.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'}`}>
                    <td className="py-5 px-6">
                      <div className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} flex items-center gap-2`}>
                        {team.name}
                        {team.track && (
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                            team.track.name.toLowerCase().includes('quiz')
                              ? (isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-700 border border-amber-200')
                              : team.track.name.toLowerCase().includes('spell')
                                ? (isDarkMode ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-100 text-purple-700 border border-purple-200')
                                : (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border border-emerald-200')
                          }`}>
                            {team.track.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{school ? school.name : 'Unknown School'}</div>
                    </td>
                    <td className={`py-5 px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{team.members.length} members</span>
                        {captain && <span className={`text-sm px-3 py-1 rounded-full font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>Capt: {captain.name}</span>}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTeam(team);
                            setIsViewModalOpen(true);
                          }}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="View Team Info"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTeam(team.id)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                          title="Delete Team"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Team Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Register New Team</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <form id="add-team-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select School</label>
                      <button 
                        type="button" 
                        onClick={() => setIsSchoolModalOpen(true)}
                        className="text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        + Add new school
                      </button>
                    </div>
                    <select 
                      required
                      value={newTeam.school_id}
                      onChange={e => setNewTeam({...newTeam, school_id: e.target.value})}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      <option value="">-- Choose a School --</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Team Name</label>
                    <input 
                      type="text" 
                      required 
                      value={newTeam.name} 
                      onChange={e => setNewTeam({...newTeam, name: e.target.value})} 
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      placeholder="e.g. Team Alpha"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tournament Track</label>
                  <select 
                    required
                    value={newTeam.tournament_track_id}
                    onChange={e => setNewTeam({...newTeam, tournament_track_id: parseInt(e.target.value)})}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    {tournamentTracks.filter(t => t.is_active).map(track => (
                      <option key={track.id} value={track.id}>{track.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className={`flex items-center justify-between mb-3 border-b pb-2 ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-brand-dark'}`}>Team Members</label>
                    <button 
                      type="button" 
                      onClick={handleAddMember}
                      className={`text-xs font-medium flex items-center gap-1 cursor-pointer ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                    >
                      <PlusCircle size={14} /> Add Member
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newTeam.members.map((member, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-[#0D0F14] border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            required 
                            value={member.name} 
                            onChange={e => handleMemberChange(index, 'name', e.target.value)} 
                            className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#1A1C23] border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                            placeholder="Member Name"
                          />
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <input 
                              type="checkbox" 
                              checked={member.is_captain} 
                              onChange={e => handleMemberChange(index, 'is_captain', e.target.checked)}
                              className="rounded text-red-500 focus:ring-red-500"
                            />
                            Captain
                          </label>
                          <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <input 
                              type="checkbox" 
                              checked={member.is_lifeline_officer} 
                              onChange={e => handleMemberChange(index, 'is_lifeline_officer', e.target.checked)}
                              className="rounded text-red-500 focus:ring-red-500"
                            />
                            Lifeline
                          </label>
                          <button 
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            disabled={newTeam.members.length === 1}
                            className={`cursor-pointer ${isDarkMode ? 'text-gray-500 hover:text-red-400 disabled:opacity-50' : 'text-gray-400 hover:text-red-500 disabled:opacity-50'}`}
                          >
                            <MinusCircle size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className={`p-6 border-t flex justify-end gap-3 ${isDarkMode ? 'border-white/10 bg-[#13151A]' : 'border-gray-100 bg-gray-50'}`}>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/10 bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-gray-100'}`}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-team-form"
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm cursor-pointer ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Save Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add School Modal */}
      {isSchoolModalOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Register New School</h3>
              <button 
                onClick={() => setIsSchoolModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <form id="add-school-form" onSubmit={handleAddSchool} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>School Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newSchool.name} 
                    onChange={e => setNewSchool({...newSchool, name: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    placeholder="e.g. Scholarnnaire Academy"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>State</label>
                  <input 
                    type="text" 
                    required 
                    value={newSchool.state} 
                    onChange={e => setNewSchool({...newSchool, state: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    placeholder="e.g. Lagos"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>School Category</label>
                  <select 
                    required
                    value={newSchool.category}
                    onChange={e => setNewSchool({...newSchool, category: e.target.value})}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="Primary">Primary</option>
                    <option value="Junior Secondary">Junior Secondary</option>
                    <option value="Senior Secondary">Senior Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                    <option value="Corpers">Corpers</option>
                    <option value="Adults / Open">Adults / Open</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className={`p-6 border-t flex justify-end gap-3 ${isDarkMode ? 'border-white/10 bg-[#13151A]' : 'border-gray-100 bg-gray-50'}`}>
              <button 
                type="button"
                onClick={() => setIsSchoolModalOpen(false)}
                className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/10 bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-gray-100'}`}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-school-form"
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm cursor-pointer ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Save School
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Team Modal */}
      {isViewModalOpen && selectedTeam && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTeam.name}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {schools.find(s => s.id === selectedTeam.school_id)?.name || 'Unknown School'}
                </p>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <h4 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Team Members</h4>
              <div className="space-y-3">
                {selectedTeam.members && selectedTeam.members.map((member, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#0D0F14] border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</span>
                    <div className="flex gap-2">
                      {member.is_captain && <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>Captain</span>}
                      {member.is_lifeline_officer && <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>Lifeline</span>}
                    </div>
                  </div>
                ))}
                {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No members registered.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
