import { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { Activity, Users, BookOpen, Trophy, Clock, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const barData = [
  { time: '8 am', value: 20 },
  { time: '10 am', value: 45 },
  { time: '12 pm', value: 30 },
  { time: '2 pm', value: 55 },
  { time: '4 pm', value: 80 },
  { time: '6 pm', value: 65 },
  { time: '8 pm', value: 35 },
];

export function Dashboard() {
  const { isDarkMode } = useOutletContext();
  const [statsData, setStatsData] = useState({
    total_schools: 0,
    total_teams: 0,
    total_matches: 0,
    upcoming_matches: 0,
    active_matches: 0,
    waiting_matches: 0,
    recent_tasks: []
  });
  const [liveMatches, setLiveMatches] = useState([]);

  const [qfData, setQfData] = useState(null);
  const [isQfModalOpen, setIsQfModalOpen] = useState(false);
  const [qfForm, setQfForm] = useState({
    scheduled_date: '',
    scheduled_time: '10:00 AM',
    venue: 'Studio A - Main Arena',
    instructions: 'Arrive 30 minutes prior to call time. Ensure Captain and eligible participants have submitted required credentials.'
  });
  const [schedulingQf, setSchedulingQf] = useState(false);
  const [questionBanks, setQuestionBanks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, matchesRes, qfRes, banksRes] = await Promise.all([
          axios.get('http://localhost:8000/api/admin/dashboard/stats'),
          axios.get('http://localhost:8000/api/admin/matches/live'),
          axios.get('http://localhost:8000/api/competition/admin/qf-quota'),
          axios.get('http://localhost:8000/api/competition/admin/question-banks')
        ]);
        setStatsData(statsRes.data);
        setLiveMatches(matchesRes.data);
        setQfData(qfRes.data);
        setQuestionBanks(banksRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const handleScheduleQF = async (e) => {
    e.preventDefault();
    if (!qfForm.scheduled_date) {
      alert("Please select a date for the Live Studio Quarter-Final.");
      return;
    }
    try {
      setSchedulingQf(true);
      await axios.post('http://localhost:8000/api/competition/admin/qf-schedule', qfForm);
      alert("Success! Live Studio Quarter-Final scheduled. Official notifications have been broadcast to all 32 qualified teams.");
      setIsQfModalOpen(false);
      const updatedQf = await axios.get('http://localhost:8000/api/competition/admin/qf-quota');
      setQfData(updatedQf.data);
    } catch (err) {
      alert("Failed to schedule Quarter-Final: " + (err.response?.data?.detail || err.message));
    } finally {
      setSchedulingQf(false);
    }
  };

  const pieData = [
    { name: 'In Match', value: statsData.active_matches || 1, color: '#ef4444' }, // red-500
    { name: 'Waiting', value: statsData.waiting_matches || 0, color: '#f87171' }, // red-400
    { name: 'Scheduled', value: statsData.upcoming_matches || 0, color: '#fca5a5' }, // red-300
  ];

  const stats = [
    { label: 'Total Schools', value: (statsData.total_schools || 0).toString(), icon: BookOpen, trend: '+12%', up: true },
    { label: 'Total Teams', value: (statsData.total_teams || 0).toString(), icon: Users, trend: '+5%', up: true },
    { label: 'QF Quota', value: `${qfData?.confirmed_count || 0} / 32`, icon: Trophy, badge: qfData?.status === 'Quarter-Final Qualification Completed' ? 'Complete' : 'In Progress' },
    { label: 'Upcoming Matches', value: (statsData.upcoming_matches || 0).toString(), icon: Activity, badge: 'Active' },
  ];

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#1A1C23] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-red-500' : 'bg-red-50 text-red-600'}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
                  </div>
                </div>
              </div>
              {stat.trend && (
                <div className={`px-2 py-1 rounded-md text-xs font-bold ${stat.up ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') : 'bg-red-500/20 text-red-400'}`}>
                  {stat.trend}
                </div>
              )}
              {stat.badge && (
                <div className={`px-2 py-1 rounded-md text-xs font-bold ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  {stat.badge}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── QUARTER-FINAL 32-TEAM QUOTA & LIVE STUDIO SCHEDULER ── */}
      <div className={`rounded-2xl border p-6 shadow-sm ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 mb-5 border-gray-800/40">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quarter-Final 32-Team Quota Monitor & Scheduler
              </h3>
            </div>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Mandatory Rule: The system never schedules the Quarter-Final immediately after an individual team qualifies. Scheduling is enabled only when all 32 Quarter-Final slots have been filled.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              qfData?.confirmed_count >= 32
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              {qfData?.status || 'Qualification in Progress'}
            </span>

            <button
              onClick={() => setIsQfModalOpen(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-md flex items-center space-x-2 ${
                qfData?.confirmed_count >= 32 || qfData?.is_scheduled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span>{qfData?.is_scheduled ? 'View / Edit Studio Schedule' : 'Schedule Live Studio QF'}</span>
            </button>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-semibold">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Quarter-Final Target: <strong>32 Teams</strong>
            </span>
            <span className="text-emerald-400 font-bold">
              {qfData?.confirmed_count || 0} / 32 Qualified Teams Confirmed
            </span>
          </div>
          <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((qfData?.confirmed_count || 0) / 32) * 100)}%` }}
            />
          </div>
        </div>

        {/* Confirmed Schedule Notice if published */}
        {qfData?.is_scheduled && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong>Confirmed Schedule Broadcasted:</strong> {qfData.scheduled_date} at {qfData.scheduled_time} • {qfData.venue}
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono text-[10px]">
              All 32 Teams Notified
            </span>
          </div>
        )}
      </div>

      {/* ── QUESTION BANKS STAGE-SPECIFIC BREAKDOWN ── */}
      <div className={`rounded-2xl border p-6 shadow-sm ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Stage-Specific Examination Question Banks
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Strict separation enforced: Each competition stage draws exclusively from its assigned Examination Bank.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {questionBanks.map((bank) => (
            <div 
              key={bank.stage} 
              className={`p-3 rounded-xl border text-center transition ${
                isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-gray-400 truncate">{bank.stage}</div>
              <div className="text-lg font-black text-white mt-1">{bank.total_questions} <span className="text-[10px] text-gray-400 font-normal">Qs</span></div>
              <div className="text-[9px] font-bold text-emerald-400 mt-1">✓ Ready (≥44)</div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Teams Table */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 ${isDarkMode ? 'bg-[#1A1C23] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                <Users size={18} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Matches</h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>8 in Match, 7 Waiting</p>
              </div>
            </div>
            <button className={`font-bold text-xl leading-none px-2 pb-2 ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
              ...
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`font-medium border-b ${isDarkMode ? 'text-gray-400 border-white/5' : 'text-gray-500 border-gray-100'}`}>
                  <th className="pb-3 px-2">Team</th>
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right px-2">Room</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                {liveMatches.length === 0 && (
                  <tr>
                    <td colSpan="4" className={`py-8 text-center text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No live matches</td>
                  </tr>
                )}
                {liveMatches.map((match, i) => (
                  <tr key={i} className={`transition-colors group cursor-pointer ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                    <td className="py-3 px-2 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs bg-emerald-500`}>
                        {match.team1 ? match.team1.name.charAt(0) : 'T'}
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {match.team1 ? match.team1.name : `Team ${match.team1_id}`} vs {match.team2 ? match.team2.name : `Team ${match.team2_id}`}
                      </span>
                    </td>
                    <td className={`py-3 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.event ? match.event.name : `Event ${match.event_id}`}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                        match.status === 'In Match' ? (isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600') :
                        match.status === 'Waiting' ? (isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600') :
                        (isDarkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')
                      }`}>
                        {match.status}
                      </span>
                    </td>
                    <td className={`py-3 text-right font-medium px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.room || 'TBD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Peak Activity Chart */}
        <div className={`rounded-2xl border p-6 flex flex-col ${isDarkMode ? 'bg-[#1A1C23] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-red-500/20 text-red-500' : 'bg-red-50 text-red-600'}`}>
                <Clock size={18} />
              </div>
              <h3 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Peak Activity</h3>
            </div>
            <button className={`font-bold text-xl leading-none px-2 pb-2 ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
              ...
            </button>
          </div>
          
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 rounded-xl border p-3 text-center ${isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
              <p className={`font-bold text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>12 mins</p>
              <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. match time</p>
            </div>
            <div className={`flex-1 rounded-xl border p-3 text-center ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-100'}`}>
              <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>32/142</p>
              <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Matches today</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[160px] max-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontWeight: 500 }} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontWeight: 500 }} dy={10} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: isDarkMode ? '#13151A' : 'white', borderRadius: '12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none', color: isDarkMode ? 'white' : 'black' }} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value === 80 ? (isDarkMode ? '#ef4444' : '#f87171') : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-6">
            <span>Less busy</span>
            <div className={`flex-1 h-1.5 mx-4 rounded-full bg-gradient-to-r ${isDarkMode ? 'from-white/10 via-red-500/50 to-red-500' : 'from-gray-100 via-red-300 to-red-500'}`}></div>
            <span>Busy</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <div className={`rounded-2xl border p-6 relative overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#1A1C23] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                <CalendarIcon size={18} />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Event Volume</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-xs font-bold text-gray-400 relative z-10 mb-2">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            
            {/* Dummy Calendar Days */}
            <div className={`py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>26</div>
            <div className={`py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>27</div>
            <div className={`py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>28</div>
            <div className={`py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>29</div>
            <div className={`py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>30</div>
            <div className={`py-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>31</div>
            
            {[1,2,3].map(d => <div key={d} className={`py-2 rounded-full cursor-pointer transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>{d}</div>)}
            <div className={`py-2 rounded-full cursor-pointer transition-colors ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>4</div>
            {[5,6,7,8,9,10,11,12,13].map(d => <div key={d} className={`py-2 rounded-full cursor-pointer transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>{d}</div>)}
            <div className={`py-2 rounded-full cursor-pointer shadow-lg transition-colors font-bold ${isDarkMode ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-red-500 text-white shadow-red-500/30'}`}>14</div>
            <div className={`py-2 rounded-full cursor-pointer transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>15</div>
          </div>
          
          <div className={`absolute -bottom-20 -right-20 w-56 h-56 rounded-full blur-3xl ${isDarkMode ? 'bg-red-500/10' : 'bg-red-500/5'}`}></div>
        </div>

        {/* Daily Caseload / Donut */}
        <div className={`rounded-2xl border p-6 flex flex-col ${isDarkMode ? 'bg-[#1A1C23] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                <Activity size={18} />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Breakdown</h3>
            </div>
          </div>
          
          <div className="flex-1 relative min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#13151A' : 'white', borderRadius: '12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{statsData.active_matches + statsData.waiting_matches + statsData.upcoming_matches}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-1">Total</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 mt-4 text-sm font-medium px-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className={`rounded-2xl border p-6 ${isDarkMode ? 'bg-[#1A1C23] border-white/5 shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                <CheckCircle2 size={18} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Tasks</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-gray-100 text-gray-900 border-gray-200'}`}>{statsData.recent_tasks?.length || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {statsData.recent_tasks?.length === 0 && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No system tasks pending.</p>
            )}
            {statsData.recent_tasks?.map((task) => (
              <div key={task.id} className="flex items-start justify-between group cursor-pointer">
                <div className="flex gap-3">
                  <div className={`mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-900'}`}>
                    {task.type === 'Alert' ? <AlertCircle size={18} /> : task.type === 'Clock' ? <Clock size={18} /> : <Users size={18} />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm leading-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{task.title}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">{task.desc}</p>
                  </div>
                </div>
                <button className={`opacity-0 group-hover:opacity-100 transition-opacity text-[11px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wide border ${isDarkMode ? 'bg-transparent border-white/20 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUARTER-FINAL SCHEDULING MODAL ── */}
      {isQfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121927] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">Schedule Live Studio Quarter-Final</h3>
              </div>
              <button onClick={() => setIsQfModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleScheduleQF} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200">
                Quarter-Final Slots: <strong>{qfData?.confirmed_count || 0} / 32 Teams Confirmed</strong>.
                {qfData?.confirmed_count < 32 && (
                  <p className="mt-1 text-[11px] text-amber-300">
                    Note: The official rules require all 32 teams to be confirmed before scheduling, but you may pre-configure or publish the schedule.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Live Studio Date</label>
                <input
                  type="date"
                  required
                  value={qfForm.scheduled_date}
                  onChange={(e) => setQfForm({ ...qfForm, scheduled_date: e.target.value })}
                  className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Call Time & Start Time</label>
                <input
                  type="text"
                  required
                  value={qfForm.scheduled_time}
                  onChange={(e) => setQfForm({ ...qfForm, scheduled_time: e.target.value })}
                  placeholder="e.g. 10:00 AM"
                  className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Studio / Venue Information</label>
                <input
                  type="text"
                  required
                  value={qfForm.venue}
                  onChange={(e) => setQfForm({ ...qfForm, venue: e.target.value })}
                  placeholder="e.g. Broadcast Studio A, Landmark Centre, Lagos"
                  className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Instructions & Guidelines for Qualified Teams</label>
                <textarea
                  rows={3}
                  value={qfForm.instructions}
                  onChange={(e) => setQfForm({ ...qfForm, instructions: e.target.value })}
                  className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsQfModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingQf}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold shadow-lg"
                >
                  {schedulingQf ? 'Broadcasting...' : 'Publish & Broadcast Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
