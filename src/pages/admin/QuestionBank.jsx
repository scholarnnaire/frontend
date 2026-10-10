import { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, XCircle, FileQuestion, BookOpen, X, ChevronRight, Edit2, Trash2, Power, PowerOff, ArrowLeft } from 'lucide-react';

export function QuestionBank() {
  const { isDarkMode } = useOutletContext();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tracks, setTracks] = useState([]);
  
  // New States
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const competitionStages = [
    'Group Stage 1', 'Group Stage 2', 'Group Stage 3', 'Group Stage 4',
    'Quarter-Final', 'Semi-Final', '3rd-Place', 'Final'
  ];
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [uploadForm, setUploadForm] = useState({
    file: null,
    tournament_track_id: '',
    stage: 'Group Stage 1',
    question_mode: 'Standard',
    question_type: 'Multiple Choice',
    subject: 'General',
    difficulty: 'Primary',
    school_category: 'Primary'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, tracksRes] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/questions/?limit=10000'),
        axios.get('http://localhost:8000/api/tournaments/tracks')
      ]);
      setQuestions(questionsRes.data);
      setTracks(tracksRes.data);
      if (tracksRes.data.length > 0 && !uploadForm.tournament_track_id) {
        setUploadForm(prev => ({ ...prev, tournament_track_id: tracksRes.data[0].id }));
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

  const handleUploadCSV = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      alert("Please select a CSV file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('tournament_track_id', uploadForm.tournament_track_id);
    formData.append('question_mode', uploadForm.question_mode);
    formData.append('question_type', uploadForm.question_type);
    formData.append('subject', uploadForm.subject);
    formData.append('difficulty', uploadForm.difficulty);
    formData.append('school_category', uploadForm.school_category);

    try {
      await axios.post('http://localhost:8000/api/admin/questions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      setIsModalOpen(false);
      setUploadForm(prev => ({ ...prev, file: null }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload questions: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/admin/questions/${currentQuestion.id}`, editForm);
      fetchData();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update question');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/admin/questions/${currentQuestion.id}`);
      fetchData();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to delete question');
    }
  };

  const toggleQuestionStatus = async (q) => {
    try {
      await axios.put(`http://localhost:8000/api/admin/questions/${q.id}`, { is_active: !q.is_active });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to toggle status');
    }
  };

  const openEditModal = (q) => {
    setCurrentQuestion(q);
    setEditForm({
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      subject: q.subject,
      stage: q.stage || 'Group Stage 1',
      difficulty: q.difficulty,
      school_category: q.school_category,
      question_mode: q.question_mode,
      question_type: q.question_type
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (q) => {
    setCurrentQuestion(q);
    setIsDeleteModalOpen(true);
  };

  // Reset page when search, track, or stage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTrack, selectedStage]);

  const filteredQuestions = (selectedTrack || selectedStage) ? questions.filter(q => {
    const matchesTrack = selectedTrack ? q.tournament_track_id === selectedTrack.id : true;
    const matchesStage = selectedStage ? q.stage === selectedStage : true;
    const matchesSearch = (q.text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           q.subject?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTrack && matchesStage && matchesSearch;
  }) : [];

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full relative ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <div>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-brand-dark'}`}>
            {(selectedTrack || selectedStage) && (
              <button onClick={() => { setSelectedTrack(null); setSelectedStage(null); }} className="hover:text-red-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            {selectedStage ? `${selectedStage} Examination Bank` : selectedTrack ? selectedTrack.name : 'Question Banks & Examination Archives'}
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {selectedStage 
              ? `Dedicated Examination Bank for ${selectedStage} (Strict stage-exclusive question drawing)`
              : selectedTrack 
              ? `Managing questions for ${selectedTrack.name}` 
              : 'Strict Examination Banks partitioned by competition stage (GS1 - GS4, QF, SF, 3rd-Place, Final).'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {(selectedTrack || selectedStage) && (
            <div className="relative flex-1 sm:w-64">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-full shadow-sm ${isDarkMode ? 'bg-[#0A0C10] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
              />
            </div>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 cursor-pointer ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            <Plus size={16} /> Upload CSV
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
        ) : (!selectedTrack && !selectedStage) ? (
          <div className="p-6 space-y-8">
            {/* Stage-Specific Examination Question Banks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-base font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Stage-Specific Examination Question Banks
                </h4>
                <span className="text-xs text-gray-500">Exclusive 44 Q drawing per stage</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {competitionStages.map(stageName => {
                  const count = questions.filter(q => q.stage === stageName).length;
                  return (
                    <div
                      key={stageName}
                      onClick={() => setSelectedStage(stageName)}
                      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-lg ${
                        isDarkMode ? 'bg-[#13151A] border-white/5 hover:border-emerald-500/50' : 'bg-white border-gray-200 hover:border-emerald-500/50 hover:bg-emerald-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          count >= 44 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {count >= 44 ? '✓ Ready (≥44)' : 'Needs More'}
                        </span>
                        <ChevronRight size={18} className="text-gray-500 group-hover:text-emerald-400 transition" />
                      </div>
                      <h5 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stageName}</h5>
                      <div className="text-xs text-gray-400 mt-1">
                        {count} Questions in Bank
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tournament Tracks */}
            <div>
              <h4 className={`text-base font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Tournament Tracks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map(track => {
                  const count = questions.filter(q => q.tournament_track_id === track.id).length;
                  return (
                    <div 
                      key={track.id} 
                      onClick={() => setSelectedTrack(track)}
                      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all cursor-pointer hover:shadow-lg ${isDarkMode ? 'bg-[#13151A] border-white/5 hover:border-red-500/50' : 'bg-white border-gray-200 hover:border-red-500/50 hover:bg-red-50/30'}`}
                    >
                      <div className={`absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        <ChevronRight size={24} />
                      </div>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 shadow-sm ${isDarkMode ? 'bg-[#1A1C23] border border-white/10 text-red-400' : 'bg-gray-50 border border-gray-100 text-red-600'}`}>
                        <FileQuestion size={24} />
                      </div>
                      <h4 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{track.name}</h4>
                      <div className={`flex items-center gap-2 mt-4 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className={`px-2.5 py-1 rounded-md ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                          {count} {count === 1 ? 'Question' : 'Questions'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-64 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className={`p-4 rounded-full mb-3 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <FileQuestion size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No questions found</p>
            <p className="text-sm mt-1">Upload questions for this track to get started</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 backdrop-blur-md shadow-sm z-10 text-sm uppercase tracking-wider font-semibold border-b ${isDarkMode ? 'bg-[#13151A]/90 text-gray-400 border-white/10' : 'bg-gray-50/90 text-gray-500 border-gray-200'}`}>
                  <tr>
                    <th className="py-4 px-6 w-16">#</th>
                    <th className="py-4 px-6 w-1/2">Question</th>
                    <th className="py-4 px-6">Subject</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Difficulty</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-base ${isDarkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                  {paginatedQuestions.map((q, index) => (
                <tr key={q.id} className={`transition-colors ${!q.is_active ? 'opacity-50' : ''} ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'}`}>
                  <td className={`py-5 px-6 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-5 px-6">
                    <div className={`font-semibold line-clamp-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {!q.is_active && <span className="text-red-500 mr-2">[Disabled]</span>}
                      {q.text}
                    </div>
                    <div className={`text-sm mt-1.5 flex flex-wrap gap-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>Ans: Option {q.correct_option}</span>
                      <span>Bank: <strong className="text-emerald-400">{q.stage || 'Group Stage 1'}</strong></span>
                      <span>Mode: {q.question_mode}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border ${isDarkMode ? 'bg-white/5 text-gray-300 border-white/10' : 'bg-gray-100 text-gray-600 border-transparent'}`}>
                      <BookOpen size={14} /> {q.subject}
                    </span>
                  </td>
                  <td className={`py-5 px-6 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{q.school_category}</td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${isDarkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleQuestionStatus(q)} className={`p-2 rounded-lg transition-colors ${q.is_active ? 'text-orange-500 hover:bg-orange-500/10' : 'text-green-500 hover:bg-green-500/10'}`} title={q.is_active ? "Disable" : "Enable"}>
                        {q.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                      <button onClick={() => openEditModal(q)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => openDeleteModal(q)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between px-6 py-4 border-t sticky bottom-0 ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Showing <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{(currentPage - 1) * itemsPerPage + 1}</span> to <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.min(currentPage * itemsPerPage, filteredQuestions.length)}</span> of <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{filteredQuestions.length}</span> questions
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    Previous
                  </button>
                  <span className={`text-sm font-medium px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload CSV Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Questions CSV</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <form id="upload-csv-form" onSubmit={handleUploadCSV} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>CSV File</label>
                  <input 
                    type="file" 
                    accept=".csv"
                    required
                    onChange={e => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <div className="flex justify-between items-start mt-2">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Ensure your CSV has the following headers: <b>text, option_a, option_b, option_c, option_d, correct_option</b>.
                    </p>
                    <a 
                      href="data:text/csv;charset=utf-8,text,option_a,option_b,option_c,option_d,correct_option%0AExample%20Question,A,B,C,D,A" 
                      download="questions_template.csv"
                      className={`text-xs font-medium whitespace-nowrap ml-4 hover:underline ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
                    >
                      Download Template
                    </a>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tournament Track</label>
                  <select 
                    value={uploadForm.tournament_track_id} 
                    required
                    onChange={e => setUploadForm({...uploadForm, tournament_track_id: e.target.value})} 
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="" disabled>Select Tournament Track</option>
                    {tracks.map(track => (
                      <option key={track.id} value={track.id}>{track.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stage Examination Bank</label>
                  <select 
                    value={uploadForm.stage} 
                    onChange={e => setUploadForm({...uploadForm, stage: e.target.value})} 
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    {competitionStages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subject</label>
                    <select 
                      value={uploadForm.subject} 
                      onChange={e => setUploadForm({...uploadForm, subject: e.target.value})} 
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      <option value="General">General</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English Language">English Language</option>
                      <option value="Basic Science">Basic Science</option>
                      <option value="Social Studies">Social Studies</option>
                      <option value="Current Affairs">Current Affairs</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Difficulty</label>
                    <select 
                      value={uploadForm.difficulty} 
                      onChange={e => setUploadForm({...uploadForm, difficulty: e.target.value})} 
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      {['Nursery', 'Kindergarten', 'Primary', 'Secondary', 'Tertiary', 'Masters', 'Don', 'Ph.D.', 'Associate Professor', 'Professor', 'Scholarnnaire'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>School Category</label>
                    <select 
                      value={uploadForm.school_category} 
                      onChange={e => setUploadForm({...uploadForm, school_category: e.target.value})} 
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      {['Primary', 'Junior Secondary', 'Senior Secondary', 'Tertiary', 'Corpers', 'Adults / Open'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Question Mode</label>
                    <select 
                      value={uploadForm.question_mode} 
                      onChange={e => setUploadForm({...uploadForm, question_mode: e.target.value})} 
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Speed">Speed / Rapid Fire</option>
                      <option value="Visual">Visual</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Question Type</label>
                    <select 
                      value={uploadForm.question_type} 
                      onChange={e => setUploadForm({...uploadForm, question_type: e.target.value})} 
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      <option value="Multiple Choice">Multiple Choice</option>
                      <option value="True/False">True / False</option>
                      <option value="Fill in the Blank">Fill in the Blank</option>
                    </select>
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
                form="upload-csv-form"
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm cursor-pointer ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Upload & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {isEditModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Question</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <form id="edit-question-form" onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Question Text</label>
                  <textarea 
                    required
                    value={editForm.text || ''}
                    onChange={e => setEditForm({...editForm, text: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Option A</label>
                    <input 
                      type="text" required value={editForm.option_a || ''}
                      onChange={e => setEditForm({...editForm, option_a: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Option B</label>
                    <input 
                      type="text" required value={editForm.option_b || ''}
                      onChange={e => setEditForm({...editForm, option_b: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Option C</label>
                    <input 
                      type="text" required value={editForm.option_c || ''}
                      onChange={e => setEditForm({...editForm, option_c: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Option D</label>
                    <input 
                      type="text" required value={editForm.option_d || ''}
                      onChange={e => setEditForm({...editForm, option_d: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Correct Option</label>
                  <select 
                    value={editForm.correct_option || ''} 
                    onChange={e => setEditForm({...editForm, correct_option: e.target.value})} 
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stage Examination Bank</label>
                  <select 
                    value={editForm.stage || 'Group Stage 1'} 
                    onChange={e => setEditForm({...editForm, stage: e.target.value})} 
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  >
                    {competitionStages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            
            <div className={`p-6 border-t flex justify-end gap-3 ${isDarkMode ? 'border-white/10 bg-[#13151A]' : 'border-gray-100 bg-gray-50'}`}>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/10 bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-gray-100'}`}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-question-form"
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm cursor-pointer ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 border text-center ${isDarkMode ? 'bg-[#1A1C23] border-white/10' : 'bg-white border-transparent'}`}>
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Question</h3>
            <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Are you sure you want to permanently delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
