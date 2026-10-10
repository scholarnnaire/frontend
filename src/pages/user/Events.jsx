import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Trophy, Globe, MapPin, Calendar, Users, Search,
  CheckCircle2, ChevronRight, Loader2, AlertCircle, Sparkles, Lock
} from 'lucide-react';
import api from '../../utils/api';

export function Events() {
  const { isDarkMode } = useOutletContext();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'global' | 'state' | 'enrolled'

  // Enroll modal
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (event) => {
    if (event.is_enrolled) return;
    setEnrollTarget(event);
    setEnrollError('');
  };

  const handleConfirmEnroll = async () => {
    if (!enrollTarget) return;
    setEnrollError('');

    let paymentRef = null;
    const isFree = enrollTarget.is_free;
    const feeStr = enrollTarget.entry_fee;
    const isPaid = !isFree && feeStr && feeStr.toLowerCase() !== 'free';

    if (isPaid) {
      const numericFee = parseFloat(feeStr.replace(/[^\d.]/g, '')) || 0;
      try {
        setEnrolling(true);
        const initRes = await api.post('/payment/initialize', {
          amount: numericFee,
          payment_type: 'tournament_entry',
          tournament_id: enrollTarget.id,
          description: `Entry fee for ${enrollTarget.name}`
        });

        const { reference, authorization_url, access_code } = initRes.data;

        let popupOpened = false;
        if (window.PaystackPop && access_code) {
          try {
            const popup = new window.PaystackPop();
            if (typeof popup.resumeTransaction === 'function') {
              popup.resumeTransaction(access_code, {
                onSuccess: async (transaction) => {
                  try {
                    await api.post('/user/enroll', {
                      tournament_id: enrollTarget.id,
                      payment_reference: transaction?.reference || reference,
                    });
                    setEnrollTarget(null);
                    await fetchEvents();
                    navigate('/user/team', { state: { justEnrolled: true } });
                  } catch (err) {
                    setEnrollError(err?.response?.data?.detail || 'Enrollment registration failed.');
                  } finally {
                    setEnrolling(false);
                  }
                },
                onCancel: () => {
                  setEnrolling(false);
                }
              });
              popupOpened = true;
            }
          } catch (popupErr) {
            console.warn('Paystack popup error:', popupErr);
          }
        }

        if (!popupOpened && authorization_url) {
          window.location.href = authorization_url;
          return;
        } else if (popupOpened) {
          return;
        }
      } catch (err) {
        setEnrollError(err?.response?.data?.detail || err.message || 'Failed to initialize Paystack payment.');
        setEnrolling(false);
        return;
      }
    }

    try {
      setEnrolling(true);
      await api.post('/user/enroll', {
        tournament_id: enrollTarget.id,
        payment_reference: paymentRef,
      });
      setEnrollTarget(null);
      await fetchEvents();
      navigate('/user/team', { state: { justEnrolled: true } });
    } catch (err) {
      let msg = err?.response?.data?.detail || 'Failed to enroll. Please try again.';
      if (typeof msg !== 'string') {
        msg = JSON.stringify(msg);
      }
      setEnrollError(msg);
    } finally {
      setEnrolling(false);
    }
  };

  const filtered = events.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.track_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'global') return matchSearch && e.scope === 'global';
    if (filter === 'state') return matchSearch && e.scope === 'state';
    if (filter === 'enrolled') return matchSearch && e.is_enrolled;
    return matchSearch;
  });

  const scopeColors = {
    global: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: Globe },
    state: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: MapPin },
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Match & Events</h1>
        <p className="text-gray-400 text-sm">Browse and enroll in tournaments open to your school.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'global', label: '🌐 Global' },
            { key: 'state', label: '📍 State' },
            { key: 'enrolled', label: '✅ Enrolled' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f.key
                  ? 'bg-brand-green text-[#0A0C10] shadow-sm shadow-brand-green/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 bg-[#13151A] border border-white/10 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm text-white placeholder-gray-600 w-full"
          />
        </div>
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={36} className="text-brand-green animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <Trophy size={28} className="text-gray-600" />
          </div>
          <p className="text-gray-500 font-medium">No events found.</p>
          <p className="text-sm text-gray-600 mt-1">Try a different filter or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((event, i) => {
              const scope = scopeColors[event.scope] || scopeColors.global;
              const ScopeIcon = scope.icon;
              const spotsLeft = event.max_schools - event.enrolled_schools;
              const isFull = spotsLeft <= 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`relative rounded-3xl border p-6 flex flex-col transition-all duration-300 ${
                    event.is_enrolled
                      ? 'bg-brand-green/5 border-brand-green/30'
                      : 'bg-[#13151A] border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Enrolled badge */}
                  {event.is_enrolled && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-brand-green/20 text-brand-green text-xs font-bold px-2.5 py-1 rounded-full border border-brand-green/30">
                      <CheckCircle2 size={12} />
                      Enrolled
                    </div>
                  )}

                  {/* Scope + Track */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border ${scope.bg} ${scope.text} ${scope.border}`}>
                      <ScopeIcon size={11} />
                      {event.scope === 'state' ? `${event.state || 'State'}` : 'Global'}
                    </span>
                    {event.track_name && (
                      <span className="px-2.5 py-1 bg-white/5 text-gray-400 text-xs font-bold rounded-lg">
                        {event.track_name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-black text-white mb-1.5 leading-snug">{event.name}</h2>
                  {event.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                  )}

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                    <div className="bg-[#0D0F14] rounded-xl px-3 py-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-gray-600 font-bold mb-0.5">Entry Fee</div>
                      <div className={`text-sm font-black ${event.is_free ? 'text-brand-green' : 'text-white'}`}>
                        {event.is_free ? 'Free' : (event.entry_fee || 'Free')}
                      </div>
                    </div>
                    <div className="bg-[#0D0F14] rounded-xl px-3 py-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-gray-600 font-bold mb-0.5">Team Size</div>
                      <div className="text-sm font-black text-white flex items-center gap-1">
                        <Users size={12} className="text-gray-500" />
                        {event.team_size} players
                      </div>
                    </div>
                    <div className="bg-[#0D0F14] rounded-xl px-3 py-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-gray-600 font-bold mb-0.5">Schools</div>
                      <div className={`text-sm font-black ${isFull ? 'text-red-400' : 'text-white'}`}>
                        {event.enrolled_schools}/{event.max_schools}
                        {isFull && ' · Full'}
                      </div>
                    </div>
                    {event.start_date && (
                      <div className="bg-[#0D0F14] rounded-xl px-3 py-2.5">
                        <div className="text-[10px] uppercase tracking-wider text-gray-600 font-bold mb-0.5">Starts</div>
                        <div className="text-sm font-black text-white flex items-center gap-1">
                          <Calendar size={11} className="text-gray-500" />
                          {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {event.is_enrolled ? (
                    <button
                      onClick={() => navigate('/user/team')}
                      className="w-full py-3 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      View Roster <ChevronRight size={16} />
                    </button>
                  ) : isFull ? (
                    <button disabled className="w-full py-3 bg-white/5 text-gray-600 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                      <Lock size={14} /> Tournament Full
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnrollClick(event)}
                      className="w-full py-3 bg-brand-green hover:bg-emerald-400 text-[#0A0C10] font-black rounded-2xl text-sm transition-all shadow-sm shadow-brand-green/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      Enroll Now
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Enroll Confirm Modal */}
      <AnimatePresence>
        {enrollTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#13151A] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-5">
                <Trophy size={28} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Confirm Enrollment</h2>
              <p className="text-gray-400 text-sm mb-6">
                You are about to enroll in <span className="text-white font-bold">{enrollTarget.name}</span>.
              </p>

              <div className="bg-[#0D0F14] rounded-2xl p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Entry Fee</span>
                  <span className={`font-bold ${enrollTarget.is_free ? 'text-brand-green' : 'text-white'}`}>
                    {enrollTarget.is_free ? 'Free' : enrollTarget.entry_fee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Team Size</span>
                  <span className="font-bold text-white">{enrollTarget.team_size} players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scope</span>
                  <span className="font-bold text-white capitalize">{enrollTarget.scope}</span>
                </div>
              </div>

              {enrollError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
                  <AlertCircle size={16} className="shrink-0" />
                  {enrollError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setEnrollTarget(null)}
                  disabled={enrolling}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEnroll}
                  disabled={enrolling}
                  className="flex-1 py-3 bg-brand-green hover:bg-emerald-400 text-[#0A0C10] font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {enrolling ? (
                    <><Loader2 size={16} className="animate-spin" /> Enrolling...</>
                  ) : (
                    <>Confirm</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
