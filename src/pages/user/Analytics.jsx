import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Zap, ShieldAlert, Award, ChevronRight, RefreshCw, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export function Analytics() {
  const { schoolId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingCert, setGeneratingCert] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const url = schoolId ? `/analytics/school/${schoolId}` : '/analytics/my-performance';
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load match analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [schoolId]);

  // Generate and download official certificate
  const handleGenerateCertificate = () => {
    if (!data) return;
    setGeneratingCert(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#0D0F14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold / Emerald Border
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#10B981');
      gradient.addColorStop(0.5, '#F59E0B');
      gradient.addColorStop(1, '#10B981');

      ctx.lineWidth = 14;
      ctx.strokeStyle = gradient;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Inner thin border
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

      // Header Brand
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'center';
      ctx.fillText('SCHOLARNNAIRE ARENA CHAMPIONSHIP', canvas.width / 2, 120);

      // Title
      ctx.font = '900 48px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('CERTIFICATE OF PERFORMANCE', canvas.width / 2, 185);

      // Subtitle
      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('This official recognition is presented to the registered team representing', canvas.width / 2, 240);

      // School Name
      ctx.font = '900 42px Inter, sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText(data.school_name || 'Participating Academy', canvas.width / 2, 310);

      // Team & State
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillStyle = '#E5E7EB';
      ctx.fillText(`${data.team_name || data.school_name} • ${data.state || 'Nigeria'}`, canvas.width / 2, 360);

      // Divider Line
      ctx.beginPath();
      ctx.moveTo(350, 395);
      ctx.lineTo(850, 395);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Achievement Description
      ctx.font = '20px Inter, sans-serif';
      ctx.fillStyle = '#D1D5DB';
      ctx.fillText(
        `For outstanding intellectual agility, securing a tournament finish at`,
        canvas.width / 2,
        440
      );

      // Final Standing Badge
      ctx.font = '900 56px Inter, sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText(`RUNG ${data.final_rung}`, canvas.width / 2, 515);

      // Metrics Row
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(
        `Avg Response: ${data.average_response_time}s  |  Fastest Answer: ${data.fastest_answer}s  |  Streaks: ${data.momentum_streaks}`,
        canvas.width / 2,
        565
      );

      // Footer Date & Signature
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'left';
      ctx.fillText(`Date: ${today}`, 100, 700);

      ctx.textAlign = 'right';
      ctx.fillText(`Official Seal: Scholarnnaire Tournament Verification`, canvas.width - 100, 700);

      // Download
      const link = document.createElement('a');
      link.download = `certificate_${data.school_name?.toLowerCase().replace(/\s+/g, '_') || 'scholarnnaire'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate certificate:', err);
      alert('Certificate generation encountered an issue.');
    } finally {
      setGeneratingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-green"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">No Analytics Found</h2>
        <p className="text-gray-400">Unable to retrieve tournament statistics at this time.</p>
        <button
          onClick={fetchAnalytics}
          className="px-6 py-2.5 bg-brand-green text-black font-bold rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Match Analytics</h1>
          <p className="text-gray-400 text-lg mt-1">{data.school_name} - Final Performance Report</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all text-xs font-semibold"
            title="Refresh Stats"
          >
            <RefreshCw size={14} />
            Sync Stats
          </button>
          <div className="text-left md:text-right bg-[#13151A] border border-white/5 px-6 py-3 rounded-2xl shadow-xl">
            <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200">
              Rung {data.final_rung}
            </div>
            <p className="text-yellow-500/70 font-bold uppercase tracking-widest text-xs mt-1">Final Standing</p>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#13151A] rounded-3xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl text-blue-400 flex items-center justify-center"><Clock size={24} /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Avg Response</p>
            <p className="text-3xl font-black text-white">{data.average_response_time}s</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#13151A] rounded-3xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
          <div className="w-12 h-12 bg-brand-green/10 rounded-2xl text-brand-green flex items-center justify-center"><Zap size={24} /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Fastest Answer</p>
            <p className="text-3xl font-black text-white">{data.fastest_answer}s</p>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#13151A] rounded-3xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl text-yellow-400 flex items-center justify-center"><Award size={24} /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Momentum Streaks</p>
            <p className="text-3xl font-black text-white">{data.momentum_streaks}</p>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#13151A] rounded-3xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl text-red-400 flex items-center justify-center"><ShieldAlert size={24} /></div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Downfall Events</p>
            <p className="text-3xl font-black text-white">{data.downfall_events}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Subject Accuracy Chart */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#13151A] rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Subject Accuracy</h2>
          <div className="space-y-6">
            {Object.entries(data.subject_accuracy || {}).map(([subject, accuracy], idx) => (
              <div key={subject}>
                <div className="flex justify-between mb-2 text-sm font-bold">
                  <span className="text-gray-400">{subject}</span>
                  <span className="text-white">{accuracy}%</span>
                </div>
                <div className="w-full bg-[#0A0C10] rounded-full h-3 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    className={`h-full rounded-full ${
                      accuracy >= 80 ? 'bg-brand-green' :
                      accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lifeline Usage & Certificate */}
        <div className="space-y-6 md:space-y-8">
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-[#13151A] rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Lifelines Deployed</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {['phone_a_scholar', 'flip_a_book', 'search_the_net'].map(lifeline => {
                const used = (data.lifelines_used || []).includes(lifeline);
                return (
                  <div key={lifeline} className={`flex-1 p-4 rounded-2xl text-center border transition-colors ${used ? 'bg-blue-500/10 border-blue-500/20' : 'bg-[#0A0C10] border-white/5'}`}>
                    <span className={`block font-bold text-sm mb-1 ${used ? 'text-blue-400' : 'text-gray-500'}`}>
                      {lifeline.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest font-black ${used ? 'text-blue-300' : 'text-gray-600'}`}>
                      {used ? 'Used' : 'Unused'}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="bg-gradient-to-br from-[#13151A] to-[#1A1C23] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <h2 className="text-xl font-bold text-white mb-2 relative z-10">Download Certificate</h2>
            <p className="text-gray-400 mb-6 max-w-sm relative z-10 text-sm">
              Get your official Scholarnnaire participation certificate showing your final rung and stats for {data.school_name}.
            </p>
            <button 
              onClick={handleGenerateCertificate}
              disabled={generatingCert}
              className="flex items-center gap-2 bg-brand-green hover:bg-emerald-500 text-[#0D0F14] px-6 py-3 rounded-xl font-bold transition-all relative z-10 shadow-lg shadow-brand-green/20 disabled:opacity-50"
            >
              {generatingCert ? (
                <>Generating Certificate...</>
              ) : (
                <>
                  <Download size={18} />
                  Download Certificate <ChevronRight size={18} />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
