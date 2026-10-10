import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, Users, Shield,
  MapPin, Trophy, Search, Star, BookOpen, LayoutList
} from 'lucide-react';
import api from '../../utils/api';
import { TournamentStages } from './TournamentStages';

const ROLE_COLORS = {
  Captain:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Member:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  default:  'bg-white/5 text-gray-400 border-white/10',
};

const SUBJECT_COLORS = {
  'General Science': 'bg-emerald-500/10 text-emerald-400',
  'All-Rounder':     'bg-purple-500/10 text-purple-400',
  'English':         'bg-sky-500/10 text-sky-400',
  'Mathematics':     'bg-rose-500/10 text-rose-400',
  default:           'bg-white/5 text-gray-400',
};

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function TournamentEnrolled() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [activeTab, setActiveTab]   = useState('enrolled'); // 'enrolled' or 'stages'

  useEffect(() => { fetchData(); }, [tournamentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tourRes, teamsRes] = await Promise.all([
        api.get('/tournaments/'),
        api.get(`/tournaments/${tournamentId}/teams`),
      ]);
      setTournament(tourRes.data.find(t => String(t.id) === String(tournamentId)) || null);
      setTeams(teamsRes.data);
    } catch (err) {
      console.error('Failed to fetch enrolled schools', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = teams.filter(team => {
    const q = search.toLowerCase();
    const matchesSearch = team.school_name.toLowerCase().includes(q) || team.state.toLowerCase().includes(q);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'finalized' && team.roster_finalized) ||
      (filter === 'pending'   && !team.roster_finalized);
    return matchesSearch && matchesFilter;
  });

  const finalizedCount = teams.filter(t => t.roster_finalized).length;
  const pendingCount   = teams.filter(t => !t.roster_finalized).length;

  return (
    <div className="min-h-screen bg-[#080A0F] text-white -mt-4 sm:-mt-6 md:-mt-8 -mx-4 sm:-mx-6 md:-mx-8">

      {/* ── STICKY TOP BAR ── */}
      <div className="border-b border-white/5 bg-[#0D0F14]/90 backdrop-blur-md sticky -top-4 sm:-top-6 md:-top-8 z-30">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/events')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Events
          </button>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <Trophy size={12} className="text-orange-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-300 truncate">
              {tournament?.name || '…'}
            </span>
          </div>
          <div className="ml-auto text-xs text-gray-600 font-medium">
            {teams.length} school{teams.length !== 1 ? 's' : ''} enrolled
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8 py-8">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-white">{tournament?.name || 'Loading...'}</h1>
              {tournament?.status === 'active' && (
                <span className="px-2 py-1 text-xs font-bold bg-green-500/20 text-green-400 rounded-md uppercase tracking-wider border border-green-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Manage enrolled schools and tournament progression rules.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {tournament?.status !== 'active' && (
              <button
                onClick={async () => {
                  try {
                    await api.post(`/admin/tournaments/${tournamentId}/start`);
                    alert('Tournament started successfully!');
                    fetchData();
                  } catch (err) {
                    alert(err.response?.data?.detail || 'Failed to start tournament.');
                  }
                }}
                className="bg-brand-green text-[#0D0F14] px-4 py-2 rounded-xl text-sm font-black hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(110,209,124,0.3)] hover:shadow-[0_0_25px_rgba(110,209,124,0.5)]"
              >
                START TOURNAMENT
              </button>
            )}
          <div className="flex bg-[#13151A] rounded-xl border border-white/5 p-1">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'enrolled' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={16} /> Enrolled Teams
            </button>
            <button
              onClick={() => setActiveTab('stages')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'stages' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutList size={16} /> Stages & Rules
            </button>
          </div>
          </div>
        </div>

        {activeTab === 'enrolled' ? (
          <>
            {/* ── STAT CHIPS ── */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { label: 'Total Enrolled',  value: teams.length,   icon: <Users size={14} />,       color: 'blue'  },
            { label: 'Finalized',       value: finalizedCount, icon: <CheckCircle size={14} />, color: 'green' },
            { label: 'Pending',         value: pendingCount,   icon: <Clock size={14} />,       color: 'amber' },
            { label: 'Team Size',       value: tournament?.team_size ? `${tournament.team_size} players` : '—',
              icon: <Shield size={14} />, color: 'purple' },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-[#13151A] border-white/5 text-gray-400"
            >
              {stat.icon}
              <span className="text-lg font-black text-white">{stat.value}</span>
              <span className="text-xs font-medium opacity-70">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── SEARCH + FILTER ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search school or state…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/8 bg-[#13151A] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {[
              { key: 'all',       label: 'All' },
              { key: 'finalized', label: '✅ Finalized' },
              { key: 'pending',   label: '⏳ Pending' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  filter === f.key
                    ? 'bg-red-500/10 border-red-500/40 text-red-400'
                    : 'bg-white/4 border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-700">
            <Users size={40} />
            <p className="text-sm font-medium text-gray-500">No schools match your search</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-[#13151A] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1fr_120px_2fr_100px] gap-4 px-5 py-4 border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-white/[0.02]">
              <div>School</div>
              <div>State</div>
              <div>Roster Status</div>
              <div>Selected Players</div>
              <div className="text-right">Players</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/5">
              {filtered.map((team, idx) => (
                <div
                  key={team.team_id}
                  className={`grid grid-cols-[1.5fr_1fr_120px_2fr_100px] gap-4 items-start px-5 py-4 transition-colors hover:bg-white/[0.02] ${
                    team.roster_finalized ? 'bg-[#0d1410]/50' : ''
                  }`}
                >
                  {/* School Name */}
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-sm text-white truncate">{team.school_name}</div>
                    <div className="text-xs text-gray-600 mt-1 truncate">{team.team_name}</div>
                  </div>

                  {/* State */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <MapPin size={12} className="text-gray-600 shrink-0" />
                    <span className="truncate">{team.state}</span>
                  </div>

                  {/* Roster Status */}
                  <div>
                    {team.roster_finalized ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle size={10} /> Finalized
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>

                  {/* Selected Players (Simple List) */}
                  <div className="min-w-0">
                    {team.selected_members.length > 0 ? (
                      <div className="space-y-1.5">
                        {team.selected_members.map(m => (
                          <div key={m.id} className="flex items-center gap-2 text-xs truncate">
                            {m.role === 'Captain' ? (
                              <Star size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                            ) : (
                              <Shield size={10} className="text-gray-600 shrink-0" />
                            )}
                            <span className={`font-semibold ${m.role === 'Captain' ? 'text-amber-400' : 'text-gray-300'}`}>
                              {m.name}
                            </span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-500">{m.role}</span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-500 truncate">{m.subject}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 italic">No players selected</span>
                    )}
                  </div>

                  {/* Players Count */}
                  <div className="text-right">
                    <span className={`text-lg font-black ${team.selected_members.length > 0 ? 'text-white' : 'text-gray-700'}`}>
                      {team.selected_members.length}
                    </span>
                    <span className="text-gray-600 text-sm font-bold">
                      /{tournament?.team_size || '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
          </>
        ) : (
          <TournamentStages tournamentId={tournamentId} />
        )}
      </div>
    </div>
  );
}

