import React, { useEffect, useState } from 'react';
import { Plus, Settings2, Users, LayoutList, GripVertical, Trash2, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

export function TournamentStages({ tournamentId }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    stage_order: 1,
    qualifier_count: 1,
    match_format: 'knockout'
  });

  useEffect(() => {
    fetchStages();
  }, [tournamentId]);

  const fetchStages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/tournaments/${tournamentId}/stages`);
      setStages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (stage = null) => {
    if (stage) {
      setEditingStage(stage);
      setFormData({
        name: stage.name,
        stage_order: stage.stage_order,
        qualifier_count: stage.qualifier_count,
        match_format: stage.match_format
      });
    } else {
      setEditingStage(null);
      setFormData({
        name: '',
        stage_order: stages.length + 1,
        qualifier_count: 1,
        match_format: 'knockout'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingStage) {
        await api.put(`/admin/stages/${editingStage.id}`, formData);
      } else {
        await api.post(`/admin/tournaments/${tournamentId}/stages`, formData);
      }
      setIsModalOpen(false);
      fetchStages();
    } catch (err) {
      console.error(err);
      alert('Error saving stage');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stage?')) return;
    try {
      await api.delete(`/admin/stages/${id}`);
      fetchStages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateMatches = async (stageId) => {
    if (!window.confirm('This will auto-group teams into matches based on the format and delete any existing matches for this stage. Proceed?')) return;
    try {
      await api.post(`/admin/stages/${stageId}/generate-matches`);
      alert('Matches generated successfully!');
      fetchStages(); // Refresh to show active status
    } catch (err) {
      console.error(err);
      alert('Error generating matches: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleStartMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to start this match?')) return;
    try {
      await api.post(`/admin/matches/${matchId}/start`);
      fetchStages(); // Refresh to update match status
    } catch (err) {
      console.error(err);
      alert('Error starting match: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRestartMatch = async (matchId) => {
    if (!window.confirm('This will reset all scores and restart the match from the beginning. Are you sure?')) return;
    try {
      await api.post(`/admin/matches/${matchId}/restart`);
      alert('Match restarted successfully!');
      fetchStages();
    } catch (err) {
      console.error(err);
      alert('Error restarting match: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Competition Stages</h2>
          <p className="text-sm text-gray-500 mt-1">Define the progression rules and match formats.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors text-sm"
        >
          <Plus size={16} /> Add Stage
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-white/5 bg-[#13151A] rounded-2xl border-dashed">
          <LayoutList size={40} className="text-gray-600 mb-3" />
          <h3 className="text-white font-bold mb-1">No stages defined</h3>
          <p className="text-gray-500 text-sm">Create your first stage to organize the tournament.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="group flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-[#13151A] hover:bg-white/[0.02] transition-colors relative">
              
              <div className="mt-1 text-gray-600 cursor-grab">
                <GripVertical size={20} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                      {stage.stage_order}
                    </span>
                    <h3 className="text-lg font-bold text-white">{stage.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${stage.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-white/10'}`}>
                      {stage.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {stage.stage_order === 1 && (
                      <button onClick={() => handleGenerateMatches(stage.id)} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors">
                        Generate Matches
                      </button>
                    )}
                    <button onClick={() => handleOpenModal(stage)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <Settings2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(stage.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users size={16} className="text-gray-500" />
                    <span>Qualifiers: <strong className="text-white">{stage.qualifier_count} teams</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <LayoutList size={16} className="text-gray-500" />
                    <span>Format: <strong className="text-white capitalize">{stage.match_format.replace('_', ' ')}</strong></span>
                  </div>
                </div>
                
                {stage.matches && stage.matches.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Generated Matches</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stage.matches.map(match => (
                        <div key={match.id} className="bg-black/20 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-white font-medium text-sm block">{match.name}</span>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              match.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                              match.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {match.status}
                            </span>
                          </div>
                          {match.status === 'pending' && (
                            <button 
                              onClick={() => handleStartMatch(match.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
                            >
                              Start Match
                            </button>
                          )}
                          {(match.status === 'completed' || match.status === 'active') && (
                            <button 
                              onClick={() => handleRestartMatch(match.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-colors"
                            >
                              <RefreshCw size={12} />
                              Restart
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A1C23] border border-white/10 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">{editingStage ? 'Edit Stage' : 'Add Stage'}</h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Stage Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#13151A] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="e.g., Regional Qualifiers"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Order</label>
                  <input 
                    type="number" min="1"
                    value={formData.stage_order} 
                    onChange={e => setFormData({...formData, stage_order: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#13151A] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Qualifiers to Next</label>
                  <input 
                    type="number" min="1"
                    value={formData.qualifier_count} 
                    onChange={e => setFormData({...formData, qualifier_count: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#13151A] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" 
                    title="How many teams qualify from this stage?"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Match Format</label>
                <select 
                  value={formData.match_format}
                  onChange={e => setFormData({...formData, match_format: e.target.value})}
                  className="w-full px-3 py-2 bg-[#13151A] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="knockout">Knockout (1v1)</option>
                  <option value="group">Group Stage (Pools of 4)</option>
                  <option value="round_robin">Round Robin (All vs All)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 text-sm">Save Stage</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
