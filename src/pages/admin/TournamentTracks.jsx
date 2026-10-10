import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Target, Plus, Edit2, Trash2, X, CheckCircle, ShieldAlert } from 'lucide-react';

export function TournamentTracks() {
  const { isDarkMode } = useOutletContext();
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({ name: '', description: '', entry_fee: '', is_active: true });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/tournaments/tracks');
      if (!res.ok) throw new Error('Failed to fetch tracks');
      const data = await res.json();
      setTracks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (track = null) => {
    if (track) {
      setCurrentTrack(track);
      setIsEditing(true);
    } else {
      setCurrentTrack({ name: '', description: '', entry_fee: '', is_active: true });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `http://localhost:8000/api/tournaments/tracks/${currentTrack.id}` 
        : `http://localhost:8000/api/tournaments/tracks`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTrack)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to save track');
      }
      
      await fetchTracks();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module? Teams assigned to it will be affected.")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/tournaments/tracks/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to delete track');
      }
      await fetchTracks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full relative ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>Tournament Tracks</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage competition tracks, rules, and entry fees.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-red-500/20 active:scale-95"
        >
          <Plus size={18} /> New Module
        </button>
      </div>
      
      <div className="p-6 flex-1 flex flex-col space-y-6">

      {error && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-700">
          <Target size={40} />
          <p className="text-sm font-medium text-gray-500">No tournament tracks found</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-white border-gray-200'} overflow-hidden`}>
          {/* Table Header */}
          <div className={`grid grid-cols-[3fr_1.5fr_1fr_100px] gap-4 px-5 py-3 border-b text-[10px] uppercase tracking-widest font-bold ${isDarkMode ? 'border-white/5 text-gray-500 bg-white/[0.02]' : 'border-gray-100 text-gray-400 bg-gray-50'}`}>
            <div>Module</div>
            <div>Entry Fee</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
            {tracks.map(track => (
              <div
                key={track.id}
                className={`grid grid-cols-[3fr_1.5fr_1fr_100px] gap-4 items-center px-5 py-4 transition-colors ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
              >
                {/* Module Name & Desc */}
                <div className="min-w-0 pr-4">
                  <div className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{track.name}</div>
                  <div className={`text-xs mt-1 truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {track.description || 'No rules/description defined.'}
                  </div>
                </div>

                {/* Entry Fee */}
                <div>
                  <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    {track.entry_fee || 'Free'}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${
                    track.is_active 
                      ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border border-emerald-200')
                      : (isDarkMode ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-gray-200 text-gray-500 border border-gray-300')
                  }`}>
                    {track.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleOpenModal(track)} 
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(track.id)} 
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-500' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-[#0D0F14] border-white/10 shadow-black/50' : 'bg-white border-gray-200 shadow-gray-200/50'} overflow-hidden`}>
            
            <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Edit Track' : 'New Tournament Track'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Module Name</label>
                <input 
                  type="text" required 
                  value={currentTrack.name} onChange={e => setCurrentTrack({...currentTrack, name: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  placeholder="e.g. Science Olympiad"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description & Rules</label>
                <textarea 
                  rows="4"
                  value={currentTrack.description} onChange={e => setCurrentTrack({...currentTrack, description: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  placeholder="Module rules, format, or general description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Entry Fee</label>
                  <input 
                    type="text" 
                    value={currentTrack.entry_fee} onChange={e => setCurrentTrack({...currentTrack, entry_fee: e.target.value})}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#13151A] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    placeholder="e.g. N10,000"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className={`relative inline-flex items-center cursor-pointer`}>
                    <input type="checkbox" className="sr-only peer" checked={currentTrack.is_active} onChange={e => setCurrentTrack({...currentTrack, is_active: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    <span className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Active Module</span>
                  </label>
                </div>
              </div>

              <div className={`flex justify-end gap-3 pt-5 mt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/20">
                  <CheckCircle size={16} /> Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
