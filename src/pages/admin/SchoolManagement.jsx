import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, XCircle, GraduationCap, Trash2, X, Edit, ShieldCheck, CheckCircle, Eye, Power } from 'lucide-react';
import naijaStates from 'naija-state-local-government';

export function SchoolManagement() {
  const { isDarkMode } = useOutletContext();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
  const [schoolActivities, setSchoolActivities] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' or 'matches'
  
  const [currentSchool, setCurrentSchool] = useState({
    id: null,
    name: '',
    state: '',
    lga: '',
    category: 'Primary',
    contact_email: '',
    contact_phone: ''
  });
  
  const [categories, setCategories] = useState([]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/schools');
      setSchools(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
    
    api.get('/user/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const handleApprove = async (schoolId) => {
    try {
      await api.post(`/admin/schools/${schoolId}/approve`);
      setSchools(schools.map(school => 
        school.id === schoolId ? { ...school, is_approved: true } : school
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to approve school');
    }
  };

  const handleDelete = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete this school? This will also delete any teams associated with it!")) return;
    try {
      await api.delete(`/admin/schools/${schoolId}`);
      setSchools(schools.filter(s => s.id !== schoolId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete school');
    }
  };

  const handleToggleStatus = async (school) => {
    try {
      await api.patch(`/admin/schools/${school.id}/toggle-status`);
      setSchools(schools.map(s => 
        s.id === school.id ? { ...s, is_flagged: !s.is_flagged } : s
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle school status');
    }
  };

  const openActivitiesModal = async (school) => {
    setSchoolActivities(null);
    setActivitiesModalOpen(true);
    setLoadingActivities(true);
    setActiveTab('teams');
    try {
      const res = await api.get(`/admin/schools/${school.id}/activities`);
      setSchoolActivities(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load activities');
      setActivitiesModalOpen(false);
    } finally {
      setLoadingActivities(false);
    }
  };

  const openEditModal = (school) => {
    setCurrentSchool(school);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentSchool({
      id: null,
      name: '',
      state: '',
      lga: '',
      category: 'Primary',
      contact_email: '',
      contact_phone: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Exclude ID and complex fields for PUT
        const payload = {
          name: currentSchool.name,
          state: currentSchool.state,
          lga: currentSchool.lga,
          category: currentSchool.category,
          contact_email: currentSchool.contact_email,
          contact_phone: currentSchool.contact_phone
        };
        const response = await api.put(`/admin/schools/${currentSchool.id}`, payload);
        setSchools(schools.map(s => s.id === currentSchool.id ? response.data : s));
      } else {
        const response = await api.post('/admin/schools', currentSchool);
        setSchools([...schools, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save school details');
    }
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    school.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full relative ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-dark'}`}>School Management</h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add, update, approve, and manage registered schools.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
            <input 
              type="text" 
              placeholder="Search schools..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-full shadow-sm ${isDarkMode ? 'bg-[#0A0C10] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
            />
          </div>
          <button 
            onClick={openAddModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 cursor-pointer ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            <Plus size={16} /> Add School
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
        ) : filteredSchools.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-64 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className={`p-4 rounded-full mb-3 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <GraduationCap size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No schools found</p>
            <p className="text-sm mt-1">Try adjusting your search criteria or add a new school</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 backdrop-blur-md shadow-sm z-10 text-sm uppercase tracking-wider font-semibold border-b ${isDarkMode ? 'bg-[#13151A]/90 text-gray-400 border-white/10' : 'bg-gray-50/90 text-gray-500 border-gray-200'}`}>
              <tr>
                <th className="py-4 px-6">School Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-base ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {filteredSchools.map((school) => (
                <tr key={school.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'}`}>
                  <td className="py-5 px-6">
                    <div className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{school.name}</div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{school.contact_email || 'No email provided'}</div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {school.category}
                    </span>
                  </td>
                  <td className={`py-5 px-6 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {school.state}{school.lga ? `, ${school.lga}` : ''}
                  </td>
                  <td className="py-5 px-6 text-center">
                    {school.is_flagged ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        <XCircle size={14} /> Deactivated
                      </span>
                    ) : school.is_approved ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${isDarkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        <ShieldCheck size={14} /> Approved
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-orange-400' : 'bg-amber-500'}`}></div> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {!school.is_approved && !school.is_flagged && (
                        <button 
                          onClick={() => handleApprove(school.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => openActivitiesModal(school)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        title="View Activities"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => openEditModal(school)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Edit School"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(school)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-orange-400 hover:bg-orange-400/10' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                        title={school.is_flagged ? "Activate School" : "Deactivate School"}
                      >
                        <Power size={18} className={school.is_flagged ? "text-orange-500" : ""} />
                      </button>
                      <button 
                        onClick={() => handleDelete(school.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        title="Delete School"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit School Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Edit School' : 'Register New School'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <form id="school-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>School Name</label>
                  <input 
                    type="text" 
                    required 
                    value={currentSchool.name} 
                    onChange={e => setCurrentSchool({...currentSchool, name: e.target.value})} 
                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    placeholder="e.g. Scholarnnaire Academy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>State</label>
                    <select 
                      required 
                      value={currentSchool.state} 
                      onChange={e => setCurrentSchool({...currentSchool, state: e.target.value, lga: ''})} 
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    >
                      <option value="" disabled>Select State</option>
                      {naijaStates.states().map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>LGA (Optional)</label>
                    <select 
                      value={currentSchool.lga || ''} 
                      onChange={e => setCurrentSchool({...currentSchool, lga: e.target.value})} 
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      disabled={!currentSchool.state}
                    >
                      <option value="" disabled>Select LGA</option>
                      {currentSchool.state && naijaStates.lgas(currentSchool.state)?.lgas?.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>School Category</label>
                  <select 
                    required
                    value={currentSchool.category}
                    onChange={e => setCurrentSchool({...currentSchool, category: e.target.value})}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className={`grid grid-cols-2 gap-4 pt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                    <input 
                      type="email" 
                      value={currentSchool.contact_email || ''} 
                      onChange={e => setCurrentSchool({...currentSchool, contact_email: e.target.value})} 
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      placeholder="admin@school.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                    <input 
                      type="text" 
                      value={currentSchool.contact_phone || ''} 
                      onChange={e => setCurrentSchool({...currentSchool, contact_phone: e.target.value})} 
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      placeholder="+234..."
                    />
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
                form="school-form"
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-2 ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <CheckCircle size={16} />
                {isEditing ? 'Save Changes' : 'Save School'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Activities Modal */}
      {activitiesModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  School Activities
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {schoolActivities?.school?.name || 'Loading...'}
                </p>
              </div>
              <button 
                onClick={() => setActivitiesModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={`flex border-b ${isDarkMode ? 'border-white/10 bg-[#13151A]' : 'border-gray-200 bg-gray-50'}`}>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === 'teams' ? (isDarkMode ? 'border-red-500 text-white' : 'border-red-600 text-red-600') : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')}`}
              >
                Registered Teams
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === 'matches' ? (isDarkMode ? 'border-red-500 text-white' : 'border-red-600 text-red-600') : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')}`}
              >
                Match History
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50/20">
              {loadingActivities ? (
                <div className="flex items-center justify-center h-48">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-red-500' : 'border-red-600'}`}></div>
                </div>
              ) : schoolActivities ? (
                activeTab === 'teams' ? (
                  schoolActivities.teams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schoolActivities.teams.map((team, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#0D0F14] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                          <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{team.name}</h4>
                          <div className="space-y-2">
                            {team.members.map((member, mIdx) => (
                              <div key={mIdx} className={`flex justify-between items-center text-sm p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{member.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{member.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-12 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No teams registered for this school yet.
                    </div>
                  )
                ) : (
                  schoolActivities.match_results.length > 0 ? (
                    <div className="space-y-3">
                      {schoolActivities.match_results.map((match, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex justify-between items-center ${isDarkMode ? 'bg-[#0D0F14] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                          <div>
                            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Final Rung: {match.final_rung}
                            </div>
                            <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Momentum Streaks: {match.momentum_streaks}
                            </div>
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(match.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-12 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No match history available for this school.
                    </div>
                  )
                )
              ) : null}
            </div>
            
            <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'border-white/10 bg-[#13151A]' : 'border-gray-100 bg-gray-50'}`}>
              <button 
                onClick={() => setActivitiesModalOpen(false)}
                className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'text-white bg-white/10 hover:bg-white/20' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
