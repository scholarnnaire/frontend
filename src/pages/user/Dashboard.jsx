import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Award, Shield, Users, Clock, Calendar, CheckCircle2, 
  XCircle, AlertCircle, ArrowRight, RefreshCw, Download, FileText, 
  ChevronRight, Sparkles, Bell, History, Play, UserCheck, Edit3,
  LayoutDashboard, User, BarChart2, LogOut, Check, X, QrCode,
  HelpCircle, ExternalLink, Columns, Eye, ChevronDown, CheckSquare
} from 'lucide-react';
import api from '../../utils/api';
import { OnlineGroupStageExam, CertificateModal } from '../../components/OnlineGroupStageExam';
import VisionariesCrest from '../../components/VisionariesCrest';
import CircularProgress from '../../components/CircularProgress';

export function UserDashboard() {
  const navigate = useNavigate();

  // Mode: 'member', 'captain', or 'split' (Side-by-side like the user's attachment)
  const initialRole = localStorage.getItem('user_role') === 'captain' ? 'captain' : 'member';
  const [activeView, setActiveView] = useState(initialRole);
  const [loading, setLoading] = useState(false);

  // Active navigation tab within dashboard
  const [memberNavTab, setMemberNavTab] = useState('dashboard');
  const [captainNavTab, setCaptainNavTab] = useState('dashboard');

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAllMembersModalOpen, setIsAllMembersModalOpen] = useState(false);

  // Reschedule Form
  const [rescheduleSlot, setRescheduleSlot] = useState({ date: '2025-04-17', time: '10:00 AM' });
  const [rescheduleReason, setRescheduleReason] = useState('Adjust team preparation schedule');
  const [rescheduling, setRescheduling] = useState(false);

  // Substitution Form
  const [subHalf, setSubHalf] = useState('First Half');
  const [outgoingMembers, setOutgoingMembers] = useState(['Chinedu Nwosu']);
  const [incomingMembers, setIncomingMembers] = useState(['Emeka Obi']);
  const [submittingSub, setSubmittingSub] = useState(false);

  // Dynamic countdown timer
  const [countdown, setCountdown] = useState({ days: 2, hours: 5, minutes: 31, seconds: 44 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = () => {
    const d = String(countdown.days).padStart(2, '0');
    const h = String(countdown.hours).padStart(2, '0');
    const m = String(countdown.minutes).padStart(2, '0');
    return `${d} Days : ${h} Hours : ${m} Minutes`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('participant_id');
    localStorage.removeItem('member_name');
    navigate('/login');
  };

  // Mocked rich datasets adhering exactly to the screenshots
  const memberData = {
    profile: {
      name: "Daniel Okafor",
      participantId: "P001245",
      role: "Member",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      team: "Visionaries",
      teamId: "T0023",
      registrationStatus: "Verified",
      currentStage: "Group Stage 2",
      qualificationStatus: "In Progress",
      accountStatus: "Active"
    },
    teamInfo: {
      name: "Visionaries",
      teamId: "T0023",
      captainName: "Sarah Johnson",
      totalMembers: 11,
      verifiedMembers: 11,
      qualifiedCount: 4,
      completedCount: 7,
      pendingCount: 0
    },
    nextExam: {
      stage: "Group Stage 2",
      date: "15 Apr 2025",
      time: "10:00 AM (WAT)",
      timeZone: "West Africa Time (WAT)",
      questions: 44,
      timePerQuestion: "10 sec",
      qualification: "24/44 (55%)"
    },
    examStatus: {
      badge: "Scheduled",
      subtitle: "Your exam is scheduled and ready.",
      loginStatus: "Completed",
      startTime: "15 Apr 2025, 10:00 AM",
      questions: 44,
      timePerQuestion: "10 seconds",
      qualification: "24/44 (55%)"
    },
    examRecords: [
      { stage: "Group Stage 1", date: "05 Apr 2025", score: "3,200 / 4,400 (73%)", status: "Qualified" },
      { stage: "Group Stage 2", date: "15 Apr 2025", score: "2,400 / 4,400 (55%)", status: "In Progress" },
      { stage: "Group Stage 3", date: "—", score: "—", status: "Not Started" },
      { stage: "Group Stage 4", date: "—", score: "—", status: "Not Started" }
    ]
  };

  const captainData = {
    profile: {
      name: "Sarah Johnson",
      participantId: "P000987",
      role: "Team Captain",
      badge: "TEAM CAPTAIN",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      team: "Visionaries",
      teamId: "T0023",
      registrationStatus: "Verified",
      currentStage: "Group Stage 2",
      qualificationStatus: "In Progress",
      accountStatus: "Active"
    },
    constitution: {
      name: "Visionaries",
      motto: "Together We Achieve More",
      required: 11,
      registered: 11,
      verified: 11,
      statusBadge: "FULLY CONSTITUTED"
    },
    overview: {
      total: 11,
      verified: 11,
      qualified: 4,
      inProgress: 7,
      pending: 0
    },
    teamProgressList: [
      { id: 1, name: "Sarah Johnson (C)", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "Qualified" },
      { id: 2, name: "Daniel Okafor", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "In Progress" },
      { id: 3, name: "Amaka Eze", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "In Progress" },
      { id: 4, name: "Chinedu Nwosu", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: false, s4: false, status: "Eliminated" },
      { id: 5, name: "Fatima Bello", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "Qualified" },
      { id: 6, name: "Emeka Obi", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "Qualified" },
      { id: 7, name: "Zainab Ibrahim", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "In Progress" },
      { id: 8, name: "Tunde Bakare", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "In Progress" },
      { id: 9, name: "Grace Adeleke", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "Qualified" },
      { id: 10, name: "Ibrahim Musa", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "In Progress" },
      { id: 11, name: "Blessing Okon", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80", s1: true, s2: true, s3: true, s4: false, status: "In Progress" }
    ],
    scheduleInfo: {
      currentStage: "Group Stage 2",
      date: "15 Apr 2025",
      time: "10:00 AM (WAT)",
      status: "Scheduled"
    },
    qualificationStatus: {
      stage: "Quarter-Final",
      targetQuota: 32,
      confirmedCount: 11,
      note: "Waiting for remaining teams to qualify."
    },
    recentNotifications: [
      { id: 1, text: "Team constitution completed", date: "10 Apr 2025, 09:15 AM", color: "text-emerald-500", bg: "bg-emerald-500" },
      { id: 2, text: "Examination scheduled for Group Stage 2", date: "12 Apr 2025, 04:20 PM", color: "text-blue-500", bg: "bg-blue-500" },
      { id: 3, text: "Member qualified for Group Stage 2", date: "13 Apr 2025, 11:05 AM", color: "text-emerald-500", bg: "bg-emerald-500" },
      { id: 4, text: "Substitution request approved", date: "14 Apr 2025, 02:30 PM", color: "text-blue-500", bg: "bg-blue-500" }
    ]
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    setRescheduling(true);
    setTimeout(() => {
      setRescheduling(false);
      setIsRescheduleModalOpen(false);
      alert(`Success! Examination rescheduled to ${rescheduleSlot.date} at ${rescheduleSlot.time}. All team members have been notified.`);
    }, 700);
  };

  const handleConfirmSubstitution = (e) => {
    e.preventDefault();
    setSubmittingSub(true);
    setTimeout(() => {
      setSubmittingSub(false);
      setIsSubstitutionModalOpen(false);
      alert("Substitution request transmitted to the Moderator Dashboard! The match will pause once verified by the Moderator.");
    }, 700);
  };

  // -------------------------------------------------------------------------------------------------
  // RENDER: MEMBER UI (Matching the Left Screen in Attached Image)
  // -------------------------------------------------------------------------------------------------
  const renderMemberUI = () => (
    <div className="flex flex-col min-h-screen bg-[#F4F6FB] text-slate-800 font-sans">
      
      {/* ── MEMBER TOP HEADER BAR ── */}
      <header className="bg-[#0B111E] text-white px-5 py-3 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 font-black shadow-md shadow-amber-500/20">
            🏆
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white">
              Global Quiz Challenge
            </div>
            <div className="text-[10px] text-gray-400 font-medium tracking-wider mt-0.5">
              Think • Learn • Win
            </div>
          </div>
        </div>

        {/* Right Header items */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsNotificationsModalOpen(true)}
            className="text-gray-400 hover:text-white relative p-1.5 rounded-full hover:bg-gray-800 transition"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
            <img 
              src={memberData.profile.avatar} 
              alt={memberData.profile.name} 
              className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-sm"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-none">
                {memberData.profile.name}
              </div>
              <div className="text-[10px] text-gray-400 leading-none mt-1">
                Participant
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MEMBER BODY (SIDEBAR + MAIN CONTENT) ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Dark Sidebar */}
        <aside className="w-56 bg-[#0B111E] border-r border-gray-800/80 flex flex-col justify-between shrink-0 p-3 hidden md:flex">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'team', label: 'My Team', icon: Users },
              { id: 'exam', label: 'My Examination', icon: FileText },
              { id: 'results', label: 'My Results', icon: BarChart2 },
              { id: 'certs', label: 'My Certificates', icon: Award },
              { id: 'notifs', label: 'Notifications', icon: Bell },
            ].map(item => {
              const Icon = item.icon;
              const isActive = memberNavTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setMemberNavTab(item.id);
                    if (item.id === 'certs') setSelectedCertificate({
                      certificate_number: "GQC-CERT-2025-0814",
                      qualification_code: "QC-VIS-8819",
                      participant_name: "Daniel Okafor",
                      team_name: "Visionaries",
                      stage: "Group Stage 1",
                      score: 3200,
                      issued_date: "05 Apr 2025"
                    });
                    if (item.id === 'exam') setIsExamModalOpen(true);
                    if (item.id === 'notifs') setIsNotificationsModalOpen(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 font-bold' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition mt-4"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Member Main Dashboard Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
          
          {/* CARD 1: PROFILE HERO CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md shrink-0 bg-slate-100">
                <img 
                  src={memberData.profile.avatar} 
                  alt={memberData.profile.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {memberData.profile.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Participant ID:</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{memberData.profile.participantId}</span>
                  <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-1">
                    Member
                  </span>
                </div>
                <div className="text-xs text-slate-500 pt-1">
                  Team: <strong className="text-slate-800">{memberData.profile.team}</strong>
                  <span className="mx-2 text-slate-300">•</span>
                  Team ID: <span className="font-mono font-bold text-slate-700">{memberData.profile.teamId}</span>
                </div>
              </div>
            </div>

            {/* Right Status 2x2 Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-slate-500">Registration Status</span>
                <span className="font-bold text-emerald-600 ml-auto">Verified</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={12} strokeWidth={2.5} />
                </div>
                <span className="text-slate-500">Current Stage</span>
                <span className="font-bold text-slate-900 ml-auto">Group Stage 2</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                </div>
                <span className="text-slate-500">Qualification Status</span>
                <span className="font-bold text-amber-600 ml-auto">In Progress</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-slate-500">Account Status</span>
                <span className="font-bold text-emerald-600 ml-auto">Active</span>
              </div>
            </div>
          </div>

          {/* CARD 2: MY TEAM CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">My Team</h2>
              <button 
                onClick={() => setIsAllMembersModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View Team Details</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Team Info with Crest */}
              <div className="flex items-center gap-4">
                <VisionariesCrest className="w-16 h-16" />
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 leading-tight">Visionaries</h3>
                  <div className="text-xs text-slate-500 font-medium">Team ID: <span className="font-mono text-slate-700 font-bold">T0023</span></div>
                  <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <span>👑</span> Captain: <strong className="text-slate-900">Sarah Johnson</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5">
                    <span>👥 Total Members: <strong className="text-slate-700">11</strong></span>
                    <span>🛡️ Verified Members: <strong className="text-slate-700">11</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Team Progress Gauges */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-8">
                <div className="text-xs font-bold text-slate-700 mb-3 text-center lg:text-left">Team Progress</div>
                <div className="flex items-center justify-center gap-6 sm:gap-8">
                  <CircularProgress value={4} total={4} label="Qualified Members" color="emerald" size={74} />
                  <CircularProgress value={7} total={11} label="Members Completed" color="blue" size={74} />
                  <CircularProgress value={0} total={11} label="Pending Members" color="amber" size={74} />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: COMPETITION PROGRESS STEPPER */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-5">
              Competition Progress
            </h2>

            <div className="flex items-center justify-between relative px-2 sm:px-6">
              {/* Connector line */}
              <div className="absolute left-8 right-8 top-4 h-0.5 bg-slate-200 -z-0"></div>
              <div className="absolute left-8 w-[25%] top-4 h-0.5 bg-emerald-500 -z-0"></div>

              {/* Step 1: Done */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-emerald-600 mt-2">Group Stage 1</span>
              </div>

              {/* Step 2: Active */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/30 ring-4 ring-blue-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                </div>
                <span className="text-xs font-black text-blue-600 mt-2">Group Stage 2</span>
              </div>

              {/* Step 3: Pending */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="text-xs font-medium text-slate-400 mt-2">Group Stage 3</span>
              </div>

              {/* Step 4: Pending */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <span className="text-xs font-medium text-slate-400 mt-2">Group Stage 4</span>
              </div>

              {/* Step 5: Quarter-Final */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center font-bold text-xs">
                  🏆
                </div>
                <span className="text-xs font-medium text-slate-400 mt-2">Quarter-Final</span>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN ROW 1: NEXT EXAMINATION & EXAMINATION STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* NEXT EXAMINATION CARD */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-700">
                  <Calendar size={18} className="text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Next Examination</h3>
                </div>
                <div className="text-lg font-black text-slate-900 mb-3">Group Stage 2</div>

                <div className="text-xs text-slate-600 space-y-1.5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📅 Date:</span>
                    <strong className="text-slate-800">15 Apr 2025</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">🕒 Time:</span>
                    <strong className="text-slate-800">10:00 AM (WAT)</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">🌐 Time Zone:</span>
                    <span className="text-slate-600 font-medium">West Africa Time (WAT)</span>
                  </div>
                </div>

                {/* Countdown banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3.5 text-center text-white shadow-md shadow-blue-600/20 mb-4">
                  <div className="text-base sm:text-lg font-mono font-black tracking-wider">
                    {formatCountdown()}
                  </div>
                  <div className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider mt-0.5">
                    Countdown to Exam
                  </div>
                </div>

                {/* 3 Metrics Boxes */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Questions</div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">44</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Time per Question</div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">10 sec</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Qualification</div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">24/44 (55%)</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => setIsInstructionsModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <FileText size={14} />
                  <span>View Exam Instructions</span>
                </button>

                <button
                  onClick={() => setIsExamModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Start Online Exam</span>
                </button>
              </div>
            </div>

            {/* EXAMINATION STATUS CARD */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-3">Examination Status</h3>

                {/* Big Green Alert Badge */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <div className="font-black text-sm text-emerald-800">Scheduled</div>
                    <div className="text-xs text-emerald-600 font-medium">Your exam is scheduled and ready.</div>
                  </div>
                </div>

                {/* Status Checklist items */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <span className="text-blue-500">🚀</span> Login
                    </span>
                    <strong className="text-emerald-600 flex items-center gap-1">
                      <Check size={14} /> Completed
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" /> Start Time
                    </span>
                    <strong className="text-slate-800">15 Apr 2025, 10:00 AM</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <HelpCircle size={14} className="text-slate-400" /> Questions
                    </span>
                    <strong className="text-slate-800">44</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" /> Time Per Question
                    </span>
                    <strong className="text-slate-800">10 seconds</strong>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Trophy size={14} className="text-slate-400" /> Qualification
                    </span>
                    <strong className="text-slate-800">24/44 (55%)</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
                Simultaneous participation enforced. Timer starts at designated slot.
              </div>
            </div>
          </div>

          {/* TWO-COLUMN ROW 2: MY EXAMINATION RECORD & QUICK ACCESS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* MY EXAMINATION RECORD TABLE */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">My Examination Record</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase font-bold">
                      <th className="pb-2.5 font-bold">Stage</th>
                      <th className="pb-2.5 font-bold">Date</th>
                      <th className="pb-2.5 font-bold">Score</th>
                      <th className="pb-2.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {memberData.examRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 font-bold text-slate-800">{r.stage}</td>
                        <td className="py-2.5 text-slate-500">{r.date}</td>
                        <td className="py-2.5 font-mono text-slate-700">{r.score}</td>
                        <td className="py-2.5">
                          {r.status === 'Qualified' && (
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Qualified
                            </span>
                          )}
                          {r.status === 'In Progress' && (
                            <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              In Progress
                            </span>
                          )}
                          {r.status === 'Not Started' && (
                            <span className="text-slate-400 text-[11px]">Not Started</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUICK ACCESS TILES */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">Quick Access</h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedCertificate({
                    certificate_number: "GQC-CERT-2025-0814",
                    qualification_code: "QC-VIS-8819",
                    participant_name: "Daniel Okafor",
                    team_name: "Visionaries",
                    stage: "Group Stage 1",
                    score: 3200,
                    issued_date: "05 Apr 2025"
                  })}
                  className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-200 transition text-left flex flex-col items-center sm:items-start group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <FileText size={18} />
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">View Certificates</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">Official qualification certs</div>
                </button>

                <button
                  onClick={() => setIsCodeModalOpen(true)}
                  className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-200 transition text-left flex flex-col items-center sm:items-start group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <QrCode size={18} />
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">View Qualification Code</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">Passcode for next round</div>
                </button>

                <button
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-200 transition text-left flex flex-col items-center sm:items-start group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Bell size={18} />
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">My Notifications</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">Recent competition alerts</div>
                </button>

                <button
                  onClick={() => alert("Global Quiz Challenge Support: support@globalquiz.org • Hotlines active on match days.")}
                  className="p-4 rounded-xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-200 transition text-left flex flex-col items-center sm:items-start group"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <HelpCircle size={18} />
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">Help & Support</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">Competition desk assistance</div>
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------------------------------
  // RENDER: CAPTAIN UI (Matching the Right Screen in Attached Image)
  // -------------------------------------------------------------------------------------------------
  const renderCaptainUI = () => (
    <div className="flex flex-col min-h-screen bg-[#F4F6FB] text-slate-800 font-sans">
      
      {/* ── CAPTAIN TOP HEADER BAR ── */}
      <header className="bg-[#0B111E] text-white px-5 py-3 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-950 font-black shadow-md shadow-amber-500/20">
            🏆
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white">
              Global Quiz Challenge
            </div>
            <div className="text-[10px] text-gray-400 font-medium tracking-wider mt-0.5">
              Think • Learn • Win
            </div>
          </div>
        </div>

        {/* Right Header items */}
        <div className="flex items-center gap-4">
          <div className="text-amber-400 text-lg hidden sm:block" title="Captain Privilege">
            👑
          </div>

          <button 
            onClick={() => setIsNotificationsModalOpen(true)}
            className="text-gray-400 hover:text-white relative p-1.5 rounded-full hover:bg-gray-800 transition"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
            <div className="relative">
              <img 
                src={captainData.profile.avatar} 
                alt={captainData.profile.name} 
                className="w-8 h-8 rounded-full object-cover border-2 border-amber-400 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B111E]"></span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-none">
                {captainData.profile.name}
              </div>
              <div className="text-[10px] text-amber-400 font-semibold leading-none mt-1">
                Team Captain
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── CAPTAIN BODY (SIDEBAR + MAIN CONTENT) ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Dark Sidebar with Captain Links */}
        <aside className="w-56 bg-[#0B111E] border-r border-gray-800/80 flex flex-col justify-between shrink-0 p-3 hidden md:flex">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'management', label: 'Team Management', icon: Shield },
              { id: 'progress', label: 'Team Progress', icon: BarChart2 },
              { id: 'schedule', label: 'Examination Schedule', icon: Calendar },
              { id: 'reschedule', label: 'Reschedule Exam', icon: Clock },
              { id: 'substitution', label: 'Substitution Request', icon: RefreshCw },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'team', label: 'My Team', icon: Users },
              { id: 'exam', label: 'My Examination', icon: FileText },
              { id: 'results', label: 'My Results', icon: Trophy },
              { id: 'certs', label: 'My Certificates', icon: Award },
              { id: 'notifs', label: 'Notifications', icon: Bell },
            ].map(item => {
              const Icon = item.icon;
              const isActive = captainNavTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCaptainNavTab(item.id);
                    if (item.id === 'reschedule') setIsRescheduleModalOpen(true);
                    if (item.id === 'substitution') setIsSubstitutionModalOpen(true);
                    if (item.id === 'certs') setSelectedCertificate({
                      certificate_number: "GQC-CAPT-2025-0012",
                      qualification_code: "QC-VIS-0987",
                      participant_name: "Sarah Johnson",
                      team_name: "Visionaries",
                      stage: "Group Stage 1",
                      score: 3800,
                      issued_date: "05 Apr 2025"
                    });
                    if (item.id === 'exam') setIsExamModalOpen(true);
                    if (item.id === 'notifs') setIsNotificationsModalOpen(true);
                    if (item.id === 'progress' || item.id === 'management') setIsAllMembersModalOpen(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 font-bold' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition mt-4"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Captain Main Dashboard Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
          
          {/* CARD 1: CAPTAIN PROFILE HERO CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md shrink-0 bg-slate-100 relative">
                <img 
                  src={captainData.profile.avatar} 
                  alt={captainData.profile.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <span>👑</span> TEAM CAPTAIN
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {captainData.profile.name}
                </h1>
                <div className="text-xs text-slate-500 font-medium">
                  Participant ID: <span className="font-mono font-bold text-slate-700">{captainData.profile.participantId}</span>
                </div>
                <div className="text-xs text-slate-500 pt-0.5">
                  Team: <strong className="text-slate-800">{captainData.profile.team}</strong>
                  <span className="mx-2 text-slate-300">•</span>
                  Team ID: <span className="font-mono font-bold text-slate-700">{captainData.profile.teamId}</span>
                </div>
              </div>
            </div>

            {/* Right Status 2x2 Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-slate-500">Registration Status</span>
                <span className="font-bold text-emerald-600 ml-auto">Verified</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={12} strokeWidth={2.5} />
                </div>
                <span className="text-slate-500">Current Stage</span>
                <span className="font-bold text-slate-900 ml-auto">Group Stage 2</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                </div>
                <span className="text-slate-500">Qualification Status</span>
                <span className="font-bold text-amber-600 ml-auto">In Progress</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-slate-500">Account Status</span>
                <span className="font-bold text-emerald-600 ml-auto">Active</span>
              </div>
            </div>
          </div>

          {/* CARD 2: TEAM CONSTITUTION BANNER (NAVY GRADIENT WITH CREST) */}
          <div className="bg-gradient-to-r from-[#0C1733] via-[#102047] to-[#15295B] border border-blue-900/50 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <VisionariesCrest className="w-16 h-16" />
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Visionaries</h2>
                <p className="text-xs text-blue-200 italic mt-0.5">Together We Achieve More</p>
              </div>
            </div>

            {/* Constitution stats on right */}
            <div className="w-full md:w-auto bg-[#0A1329]/60 border border-blue-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-xs">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Team Constitution</div>
                <div className="flex items-center gap-4 text-xs">
                  <div>Required Members: <strong className="text-white">11</strong></div>
                  <div>Registered: <strong className="text-white">11</strong></div>
                  <div>Verified: <strong className="text-white">11</strong></div>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-gray-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Check size={14} strokeWidth={3} />
                <span>FULLY CONSTITUTED</span>
              </span>
            </div>
          </div>

          {/* CARD 3: TEAM OVERVIEW 5 METRICS */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Team Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">11</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Total Members</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">11</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Verified Members</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">4</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Qualified Members</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">7</div>
                  <div className="text-[11px] text-slate-500 font-semibold">In Progress</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">0</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN ROW 1: UPCOMING EXAM & TEAM PROGRESS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* COLUMN 1: UPCOMING EXAM & SUBSTITUTION REQUEST */}
            <div className="space-y-5">
              
              {/* Upcoming Examination Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-700 mb-1">
                    <Calendar size={18} className="text-blue-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">Upcoming Examination</h3>
                  </div>
                  <div className="text-lg font-black text-slate-900">Group Stage 2</div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>📅 Date: <strong className="text-slate-800">15 Apr 2025</strong></div>
                  <div>🕒 Time: <strong className="text-slate-800">10:00 AM (WAT)</strong></div>
                  <div>🌐 Time Zone: <span className="text-slate-600 font-medium">West Africa Time (WAT)</span></div>
                </div>

                {/* Countdown banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 text-center text-white shadow-md shadow-blue-600/20">
                  <div className="text-base sm:text-lg font-mono font-black tracking-wider">
                    {formatCountdown()}
                  </div>
                  <div className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider mt-0.5">
                    Countdown
                  </div>
                </div>

                {/* Captain Reschedule Action */}
                <div>
                  <button
                    onClick={() => setIsRescheduleModalOpen(true)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2"
                  >
                    <Clock size={16} />
                    <span>RESCHEDULE EXAMINATION</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5 italic">
                    Only the Captain can reschedule examinations
                  </p>
                </div>
              </div>

              {/* Live Studio - Substitution Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <RefreshCw size={17} className="text-blue-600" />
                  <span>Live Studio - Substitution</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You can request 1 substitution per half (up to 3 members).
                </p>

                <button
                  onClick={() => setIsSubstitutionModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span>REQUEST SUBSTITUTION</span>
                </button>
              </div>

            </div>

            {/* COLUMN 2: TEAM PROGRESS TABLE & MINI CARDS */}
            <div className="space-y-5">
              
              {/* Team Progress Table Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Team Progress</h3>
                  <button 
                    onClick={() => setIsAllMembersModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All Members
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase font-bold">
                        <th className="pb-2 font-bold">Member</th>
                        <th className="pb-2 font-bold text-center">Stage 1</th>
                        <th className="pb-2 font-bold text-center">Stage 2</th>
                        <th className="pb-2 font-bold text-center">Stage 3</th>
                        <th className="pb-2 font-bold text-center">Stage 4</th>
                        <th className="pb-2 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {captainData.teamProgressList.slice(0, 5).map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-2.5 flex items-center gap-2.5">
                            <img src={m.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                            <span className="font-bold text-slate-800 truncate max-w-[120px]">{m.name}</span>
                          </td>
                          <td className="py-2.5 text-center">
                            {m.s1 ? <Check size={14} className="text-emerald-500 mx-auto" strokeWidth={3} /> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-2.5 text-center">
                            {m.s2 ? <Check size={14} className="text-emerald-500 mx-auto" strokeWidth={3} /> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-2.5 text-center">
                            {m.s3 ? <Check size={14} className="text-emerald-500 mx-auto" strokeWidth={3} /> : (m.status === 'Eliminated' ? <X size={14} className="text-red-500 mx-auto" strokeWidth={3} /> : <span className="text-slate-300">—</span>)}
                          </td>
                          <td className="py-2.5 text-center text-slate-300">—</td>
                          <td className="py-2.5 text-right">
                            {m.status === 'Qualified' && (
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                Qualified
                              </span>
                            )}
                            {m.status === 'In Progress' && (
                              <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                In Progress
                              </span>
                            )}
                            {m.status === 'Eliminated' && (
                              <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                Eliminated
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 pt-2 text-center">
                  <button 
                    onClick={() => setIsAllMembersModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View All Members →
                  </button>
                </div>
              </div>

              {/* Side-by-side Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Team Examination Schedule */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Calendar size={14} className="text-blue-600" />
                      <span>Team Examination Schedule</span>
                    </h4>
                    <div className="space-y-1 text-slate-600">
                      <div>Current Stage: <strong className="text-slate-800">Group Stage 2</strong></div>
                      <div>Date: <strong className="text-slate-800">15 Apr 2025</strong></div>
                      <div>Time: <strong className="text-slate-800">10:00 AM (WAT)</strong></div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        Status: <span className="font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Scheduled</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsInstructionsModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:underline mt-3 pt-2 border-t border-slate-100 text-left"
                  >
                    View Full Schedule
                  </button>
                </div>

                {/* Team Qualification Status */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm text-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Trophy size={14} className="text-amber-500" />
                      <span>Team Qualification Status</span>
                    </h4>
                    <div className="text-sm font-black text-slate-900">Quarter-Final</div>
                    <div className="text-[11px] text-slate-500">32 Teams Required</div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>Confirmed: 11 Teams</span>
                        <span>11 / 32</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(11 / 32) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    Waiting for remaining teams to qualify.
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* TWO-COLUMN ROW 2: RECENT NOTIFICATIONS & QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* RECENT NOTIFICATIONS */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 mb-3.5 flex items-center gap-2">
                <Bell size={16} className="text-blue-600" />
                <span>Recent Notifications</span>
              </h3>

              <div className="space-y-2.5">
                {captainData.recentNotifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${n.bg} shrink-0`}></span>
                      <span className="font-bold text-slate-800">{n.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 mb-3.5">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsAllMembersModalOpen(true)}
                  className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-200 transition text-left flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">View Team Members</div>
                    <div className="text-[10px] text-slate-500">All 11 contestants</div>
                  </div>
                </button>

                <button
                  onClick={() => setIsInstructionsModalOpen(true)}
                  className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-200 transition text-left flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                    <BarChart2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">View Stages</div>
                    <div className="text-[10px] text-slate-500">Competition bracket</div>
                  </div>
                </button>

                <button
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-200 transition text-left flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Team Notifications</div>
                    <div className="text-[10px] text-slate-500">Official alerts</div>
                  </div>
                </button>

                <button
                  onClick={() => alert("Global Quiz Challenge Captain Concierge: captain@globalquiz.org")}
                  className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-200 transition text-left flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Help & Support</div>
                    <div className="text-[10px] text-slate-500">Direct hotline</div>
                  </div>
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans">
      
      {/* ── TOP MULTI-VIEW SWITCHER CONTROL BAR ── */}
      <div className="bg-[#0B111E] border-b border-gray-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-extrabold uppercase tracking-wider text-emerald-400">Official Portal Active:</span>
          <span className="text-gray-300 font-semibold hidden sm:inline">
            Visionaries (T0023) • Group Stage 2
          </span>
        </div>

        {/* View Switcher: Member View, Captain View, or Side-by-Side Dual View */}
        <div className="flex items-center gap-1.5 bg-[#141B2D] p-1 rounded-xl border border-gray-700/60">
          <button
            onClick={() => setActiveView('member')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'member'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={14} />
            <span>Member UI (Daniel)</span>
          </button>

          <button
            onClick={() => setActiveView('captain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'captain'
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/30 font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>👑 Captain UI (Sarah)</span>
          </button>

          <button
            onClick={() => setActiveView('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'split'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                : 'text-gray-400 hover:text-white'
            }`}
            title="View both screens side-by-side like the image"
          >
            <Columns size={14} />
            <span>Side-by-Side View</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 font-semibold transition"
        >
          <LogOut size={14} />
          <span>Exit</span>
        </button>
      </div>

      {/* ── VIEW RENDERING ── */}
      {activeView === 'member' && renderMemberUI()}
      {activeView === 'captain' && renderCaptainUI()}
      {activeView === 'split' && (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-gray-800">
          <div className="overflow-hidden border-b xl:border-b-0">
            <div className="bg-blue-600/20 text-blue-300 text-xs font-bold px-4 py-1.5 border-b border-blue-500/30 flex items-center justify-between">
              <span>LEFT SCREEN: Participating Member UI</span>
              <span className="font-mono">Daniel Okafor (P001245)</span>
            </div>
            {renderMemberUI()}
          </div>
          <div className="overflow-hidden">
            <div className="bg-amber-500/20 text-amber-300 text-xs font-bold px-4 py-1.5 border-b border-amber-500/30 flex items-center justify-between">
              <span>RIGHT SCREEN: Team Captain UI</span>
              <span className="font-mono">Sarah Johnson (P000987)</span>
            </div>
            {renderCaptainUI()}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}

      {/* 1. Exam Modal */}
      {isExamModalOpen && (
        <OnlineGroupStageExam 
          memberId={activeView === 'captain' ? 1 : 2}
          stage="Group Stage 2"
          teamName="Visionaries"
          onClose={() => setIsExamModalOpen(false)}
          onComplete={() => setIsExamModalOpen(false)}
        />
      )}

      {/* 2. Reschedule Exam Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#121927] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">Reschedule Team Examination</h3>
              </div>
              <button onClick={() => setIsRescheduleModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div className="p-3 bg-[#182338] rounded-xl border border-gray-700/60 text-gray-300">
                Current Scheduled Slot: <strong>15 Apr 2025</strong> at <strong>10:00 AM (WAT)</strong>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 font-bold uppercase tracking-wider text-[11px]">
                  Select Available Alternative Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { date: '16 Apr 2025', time: '10:00 AM' },
                    { date: '16 Apr 2025', time: '02:00 PM' },
                    { date: '17 Apr 2025', time: '10:00 AM' },
                    { date: '17 Apr 2025', time: '04:00 PM' },
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRescheduleSlot(s)}
                      className={`p-3 rounded-xl border text-left transition ${
                        rescheduleSlot.date === s.date && rescheduleSlot.time === s.time
                          ? 'bg-amber-500 text-gray-950 border-amber-400 font-extrabold shadow-md'
                          : 'bg-[#182236] text-gray-300 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-bold">{s.date}</div>
                      <div className="text-[10px] opacity-80">{s.time} (WAT)</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold text-[11px]">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl font-black shadow-lg"
                >
                  {rescheduling ? 'Saving...' : 'Confirm New Schedule'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Live Studio Substitution Modal */}
      {isSubstitutionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#121927] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold">Request Live Studio Substitution</h3>
              </div>
              <button onClick={() => setIsSubstitutionModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmSubstitution} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-200">
                Rule: Maximum 1 substitution request per half (up to 3 members). The game enters PAUSE MODE upon verification.
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">Game Half</label>
                <select
                  value={subHalf}
                  onChange={(e) => setSubHalf(e.target.value)}
                  className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none"
                >
                  <option value="First Half">First Half (1 substitution permitted)</option>
                  <option value="Second Half">Second Half (1 substitution permitted)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-bold">Outgoing Member</label>
                  <select 
                    value={outgoingMembers[0]} 
                    onChange={e => setOutgoingMembers([e.target.value])}
                    className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="Chinedu Nwosu">Chinedu Nwosu</option>
                    <option value="Amaka Eze">Amaka Eze</option>
                    <option value="Daniel Okafor">Daniel Okafor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-bold">Replacement Member</label>
                  <select 
                    value={incomingMembers[0]} 
                    onChange={e => setIncomingMembers([e.target.value])}
                    className="w-full bg-[#182338] border border-gray-700 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="Emeka Obi">Emeka Obi</option>
                    <option value="Zainab Ibrahim">Zainab Ibrahim</option>
                    <option value="Grace Adeleke">Grace Adeleke</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubstitutionModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSub}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black shadow-lg"
                >
                  {submittingSub ? 'Transmitting...' : 'Transmit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal 
          cert={selectedCertificate} 
          onClose={() => setSelectedCertificate(null)} 
        />
      )}

      {/* 5. Qualification Passcode Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#121927] border border-gray-700 rounded-3xl p-6 max-w-sm w-full text-white text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <QrCode size={32} />
            </div>
            <h3 className="text-lg font-black mb-1">Official Qualification Code</h3>
            <p className="text-xs text-gray-400 mb-4">Group Stage 1 Verified Passcode</p>
            <div className="bg-[#182338] p-4 rounded-2xl border border-emerald-500/40 font-mono text-xl font-black text-emerald-400 tracking-widest mb-4">
              QC-VIS-8819
            </div>
            <p className="text-[11px] text-gray-400 mb-6">
              Use this code to verify eligibility or re-enroll under the Visionaries umbrella.
            </p>
            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* 6. Exam Instructions Modal */}
      {isInstructionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#121927] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-md w-full text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                <span>Group Stage Examination Instructions</span>
              </h3>
              <button onClick={() => setIsInstructionsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed mb-6">
              <p>• <strong>Simultaneous Participation:</strong> All 11 team members will receive 44 randomized questions simultaneously at the assigned exam slot.</p>
              <p>• <strong>Strict Timer:</strong> Exactly 10 seconds per question. Unanswered questions automatically move to the next item.</p>
              <p>• <strong>Qualification Threshold:</strong> Minimum 24 correct answers (55%) out of 44 required to achieve qualification.</p>
              <p>• <strong>No Downward Marking:</strong> Scores accumulate based on correct responses with zero negative penalties.</p>
            </div>
            <button
              onClick={() => {
                setIsInstructionsModalOpen(false);
                setIsExamModalOpen(true);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg"
            >
              Start Exam Now
            </button>
          </motion.div>
        </div>
      )}

      {/* 7. Notifications Modal */}
      {isNotificationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#121927] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-md w-full text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Bell size={18} className="text-blue-400" />
                <span>Competition Notifications</span>
              </h3>
              <button onClick={() => setIsNotificationsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto mb-6 text-xs">
              {captainData.recentNotifications.map(n => (
                <div key={n.id} className="p-3 bg-[#182338] rounded-xl border border-gray-800">
                  <div className="font-bold text-white mb-0.5">{n.text}</div>
                  <div className="text-[10px] text-gray-400">{n.date}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsNotificationsModalOpen(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* 8. All Members Modal */}
      {isAllMembersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#121927] border border-gray-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4 shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <span>Visionaries Roster (11 Members)</span>
              </h3>
              <button onClick={() => setIsAllMembersModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="overflow-y-auto flex-1 divide-y divide-gray-800 text-xs">
              {captainData.teamProgressList.map(m => (
                <div key={m.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-700" />
                    <div>
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="text-[10px] text-gray-400">Team Visionaries • Group Stage 2</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    m.status === 'Qualified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    m.status === 'Eliminated' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800 mt-4 shrink-0">
              <button
                onClick={() => setIsAllMembersModalOpen(false)}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default UserDashboard;
