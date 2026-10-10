import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, 
  Download, Shield, Sparkles, ChevronRight, RotateCcw, FileText, Check, Trophy
} from 'lucide-react';
import api from '../utils/api';

export function OnlineGroupStageExam({ 
  memberId, 
  stage = "Group Stage 1", 
  teamName = "Kings College Academy Team",
  onClose,
  onComplete
}) {
  const [examState, setExamState] = useState('loading'); // 'loading', 'active', 'finished'
  const [examData, setExamData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Scoring & Stats
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [lastAnswerFeedback, setLastAnswerFeedback] = useState(null); // 'correct', 'incorrect', 'missed'
  const [examResult, setExamResult] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // 1. Initialize Exam
  useEffect(() => {
    const startExamSession = async () => {
      try {
        const res = await api.post('/competition/exam/start', {
          team_member_id: memberId,
          stage: stage
        });
        setExamData(res.data);
        setExamState('active');
        setCurrentIndex(0);
        setTimeLeft(10);
      } catch (err) {
        console.error("Failed to start exam:", err);
        alert("Failed to initialize Group Stage Examination. Please try again.");
        if (onClose) onClose();
      }
    };
    startExamSession();
  }, [memberId, stage]);

  // 2. 10-Second Countdown Timer per question
  useEffect(() => {
    if (examState !== 'active' || !examData || submitting) return;

    if (timeLeft <= 0) {
      // Time is up! Submit as missed (no point deduction!)
      handleAnswerSubmit(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examState, examData, submitting]);

  // Handle Answer Selection & Submission
  const handleAnswerSubmit = async (chosenOption) => {
    if (submitting || !examData) return;
    setSubmitting(true);
    setSelectedOption(chosenOption);

    const currentQ = examData.questions[currentIndex];

    try {
      const res = await api.post('/competition/exam/answer', {
        session_id: examData.session_id,
        question_id: currentQ.id,
        selected_option: chosenOption,
        time_taken: 10 - timeLeft
      });

      // Update local state based on backend response
      setScore(res.data.current_score);
      setCorrectCount(res.data.correct_count);
      setIncorrectCount(res.data.incorrect_count);
      setMissedCount(res.data.missed_count);

      if (chosenOption === null) {
        setLastAnswerFeedback('missed');
      } else if (res.data.is_correct) {
        setLastAnswerFeedback('correct');
      } else {
        setLastAnswerFeedback('incorrect');
      }

      // Short delay for visual feedback, then proceed
      setTimeout(async () => {
        setLastAnswerFeedback(null);
        setSelectedOption(null);
        setSubmitting(false);

        if (currentIndex + 1 < examData.questions.length) {
          setCurrentIndex(prev => prev + 1);
          setTimeLeft(10); // Reset to 10s for next question
        } else {
          // All 44 questions finished! Finalize Exam
          await finalizeExam(examData.session_id);
        }
      }, 700);

    } catch (err) {
      console.error("Error submitting answer:", err);
      setSubmitting(false);
    }
  };

  const finalizeExam = async (sessionId) => {
    setExamState('loading');
    try {
      const res = await api.post('/competition/exam/complete', {
        session_id: sessionId
      });
      setExamResult(res.data);
      setExamState('finished');
      if (res.data.is_qualified) {
        setShowCertificateModal(true);
      }
      if (onComplete) onComplete(res.data);
    } catch (err) {
      console.error("Error completing exam:", err);
      setExamState('finished');
    }
  };

  const questionsCount = examData?.questions?.length || 44;
  const currentQ = examData?.questions?.[currentIndex];
  const qualificationThreshold = 24; // 24 / 44 required (~55%)
  const answersNeeded = Math.max(0, qualificationThreshold - correctCount);
  const progressPercent = Math.min(100, Math.round((correctCount / qualificationThreshold) * 100));

  if (examState === 'loading') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0d14]/95 backdrop-blur-md flex flex-col items-center justify-center text-white">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
          <div className="w-full h-full rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold tracking-wide">Initializing Examination Bank...</h2>
        <p className="text-gray-400 mt-2 text-sm">Loading 44 randomized questions for {stage}</p>
      </div>
    );
  }

  // 3. Finished Screen
  if (examState === 'finished' && examResult) {
    const isQualified = examResult.is_qualified;
    return (
      <div className="fixed inset-0 z-50 bg-[#07090e] text-white overflow-y-auto p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-gradient-to-b from-[#131926] to-[#0c1017] rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
          {/* Decorative ambient background */}
          <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${isQualified ? 'bg-emerald-500/20' : 'bg-red-500/10'}`} />
          <div className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${isQualified ? 'bg-amber-500/15' : 'bg-blue-500/10'}`} />

          <div className="relative z-10 text-center">
            {isQualified ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Award className="w-10 h-10 text-emerald-400" />
                </div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold px-3 py-1 bg-emerald-950/60 rounded-full border border-emerald-500/30 mb-2">
                  Official Qualification Confirmed
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                  🎉 Congratulations!
                </h1>
                <p className="text-gray-300 text-sm md:text-base max-w-lg mb-6">
                  You have successfully qualified from <span className="text-emerald-400 font-semibold">{stage}</span> to <span className="text-amber-400 font-semibold">{examResult.next_stage || 'the Next Stage'}</span>!
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mb-4">
                  <RotateCcw className="w-10 h-10 text-amber-400" />
                </div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold px-3 py-1 bg-amber-950/60 rounded-full border border-amber-500/30 mb-2">
                  Examination Concluded
                </span>
                <h1 className="text-3xl font-extrabold text-white mb-2">
                  Group Stage Not Scaled
                </h1>
                <p className="text-gray-300 text-sm max-w-lg mb-6">
                  You scored {examResult.correct_answers}/44 correct. A minimum of 24/44 (~55%) is required to qualify.
                </p>
              </motion.div>
            )}

            {/* Score Cards Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="bg-[#1a2333]/60 p-4 rounded-2xl border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase font-semibold">Final Score</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{examResult.final_score} <span className="text-xs text-gray-400 font-normal">/ 4,400</span></div>
              </div>
              <div className="bg-[#1a2333]/60 p-4 rounded-2xl border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase font-semibold">Correct Answers</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{examResult.correct_answers} <span className="text-xs text-gray-400 font-normal">/ 44</span></div>
              </div>
              <div className="bg-[#1a2333]/60 p-4 rounded-2xl border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase font-semibold">Accuracy</div>
                <div className="text-2xl font-black text-blue-400 mt-1">{examResult.percentage}%</div>
              </div>
              <div className="bg-[#1a2333]/60 p-4 rounded-2xl border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase font-semibold">Threshold Status</div>
                <div className={`text-sm font-bold mt-2 ${isQualified ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isQualified ? '✓ Qualified (≥24)' : '✕ Below 24'}
                </div>
              </div>
            </div>

            {/* Qualification Code & Certificate Box */}
            {isQualified && examResult.certificate && (
              <div className="bg-gradient-to-r from-emerald-950/40 via-amber-950/30 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-300">Official Qualification Code</span>
                  </div>
                  <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30 font-bold">
                    {examResult.certificate.qualification_code}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  A Certificate of Qualification has been officially issued. Check your registered email address to download it, or access it directly below. Use this qualification code to link yourself to your team for the next round.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-900/30"
                  >
                    <Award className="w-4 h-4" />
                    <span>View & Download Certificate</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-800">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-bold rounded-xl transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificateModal && examResult?.certificate && (
          <CertificateModal 
            cert={examResult.certificate} 
            onClose={() => setShowCertificateModal(false)} 
          />
        )}
      </div>
    );
  }

  // 4. Live Examination Interface
  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col font-sans overflow-hidden select-none">
      
      {/* ── HEADER BAR ── */}
      <header className="h-20 bg-[#0d121c] border-b border-gray-800 px-4 md:px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-lg shadow-lg">
            M
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
              <span>{stage}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{teamName}</span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-white truncate max-w-xs md:max-w-md">
              Online Group Stage Examination
            </h1>
          </div>
        </div>

        {/* Real-time score & question tracker */}
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-400">Current Score</div>
            <div className="text-xl font-black text-amber-400">
              {score.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ 4,400</span>
            </div>
          </div>

          {/* 10-Second Timer Ring */}
          <div className="flex items-center space-x-3 bg-[#161d2b] px-4 py-2 rounded-2xl border border-gray-700">
            <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Time Left</span>
              <span className={`text-2xl font-black leading-none ${timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── PROGRESS & QUALIFICATION TRACKER BAR ── */}
      <div className="bg-[#0b0f17] border-b border-gray-800/80 px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center space-x-3 font-semibold text-gray-300">
          <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Question {currentIndex + 1} of {questionsCount}
          </span>
          <span>Correct: <strong className="text-emerald-400 font-bold">{correctCount}</strong></span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 hidden sm:inline">100 marks / correct answer</span>
        </div>

        {/* Qualification threshold meter (24/44) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-400">Target: <strong className="text-amber-400">24 / 44</strong></span>
            {answersNeeded > 0 ? (
              <span className="text-gray-300">({answersNeeded} more needed)</span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> <span>Threshold Scaled!</span>
              </span>
            )}
          </div>
          <div className="w-24 md:w-32 bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${correctCount >= 24 ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── TIMER BAR (Animated 10s Countdown) ── */}
      <div className="w-full bg-gray-800 h-1.5 overflow-hidden flex-shrink-0">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${(timeLeft / 10) * 100}%` }}
        />
      </div>

      {/* ── MAIN QUESTION BODY ── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl w-full mx-auto overflow-y-auto">
        {currentQ ? (
          <motion.div 
            key={currentQ.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full space-y-6"
          >
            {/* Subject Badge & Question Text */}
            <div className="bg-[#101623] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/30 uppercase tracking-wide">
                  {currentQ.subject || 'General Knowledge'}
                </span>
                <span className="text-xs text-gray-400">
                  Question #{currentIndex + 1}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                {currentQ.text}
              </h2>

              {/* No Negative Marking Alert (Subtle reminder) */}
              <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center text-[11px] text-gray-400 space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>No negative marking: incorrect or missed questions do not deduct previously earned points.</span>
              </div>
            </div>

            {/* Answer Options (A, B, C, D) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'A', text: currentQ.option_a },
                { key: 'B', text: currentQ.option_b },
                { key: 'C', text: currentQ.option_c },
                { key: 'D', text: currentQ.option_d },
              ].map((opt) => {
                const isSelected = selectedOption === opt.key;
                let btnStyle = "bg-[#101623] hover:bg-[#182030] border-gray-800 text-gray-200";

                if (isSelected) {
                  if (lastAnswerFeedback === 'correct') {
                    btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40";
                  } else if (lastAnswerFeedback === 'incorrect') {
                    btnStyle = "bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/40";
                  } else {
                    btnStyle = "bg-blue-900/60 border-blue-500 text-white";
                  }
                }

                return (
                  <button
                    key={opt.key}
                    disabled={submitting}
                    onClick={() => handleAnswerSubmit(opt.key)}
                    className={`flex items-center p-4 md:p-5 rounded-2xl border text-left font-medium transition-all transform active:scale-98 shadow-md ${btnStyle}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {opt.key}
                    </div>
                    <span className="text-sm md:text-base leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="text-gray-400">Question data unavailable</div>
        )}
      </main>

      {/* ── FOOTER / INFO STATUS ── */}
      <footer className="h-14 bg-[#0a0d14] border-t border-gray-800 px-4 md:px-8 flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
        <div>
          Participant: <strong className="text-gray-200">{examData?.participant_name}</strong> ({examData?.participant_id})
        </div>
        <div className="flex items-center space-x-2">
          <span>Passing Criterion: Correctly answer ≥ 24 of 44 questions</span>
        </div>
      </footer>
    </div>
  );
}

// ── CERTIFICATE MODAL COMPONENT (Official Gold Seal) ──
export function CertificateModal({ cert, onClose }) {
  const handlePrintDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full bg-[#fdfbf7] text-gray-900 rounded-3xl p-8 border-4 border-amber-500/80 shadow-[0_0_60px_rgba(245,158,11,0.3)] relative overflow-hidden"
      >
        {/* Intricate decorative border frame */}
        <div className="absolute inset-3 border-2 border-amber-600/40 rounded-2xl pointer-events-none" />
        <div className="absolute inset-4 border border-dashed border-amber-700/30 rounded-xl pointer-events-none" />

        <div className="text-center relative z-10 py-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="w-8 h-8 text-amber-600" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-800">
              Millionaires on Wheels • Academic Arena
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900 uppercase tracking-wide">
            Certificate of Qualification
          </h2>
          <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">
            This is to officially certify that
          </p>

          <div className="my-6">
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-900 border-b-2 border-amber-700/40 inline-block px-8 pb-1">
              {cert.participant_name}
            </h3>
            <p className="text-xs font-semibold text-gray-700 mt-2">
              Representing: <strong>{cert.team_name}</strong>
            </p>
          </div>

          <p className="text-xs md:text-sm text-gray-700 max-w-lg mx-auto leading-relaxed">
            Has successfully satisfied all required examination standards in <strong>{cert.stage}</strong> by correctly scaling the qualification threshold with an official score of <strong>{cert.score} marks</strong>.
          </p>

          {/* Gold Seal & Verification Details */}
          <div className="mt-8 pt-4 border-t border-amber-600/30 flex items-center justify-between text-left">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Certificate Number</div>
              <div className="font-mono text-xs font-bold text-gray-800">{cert.certificate_number}</div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold mt-1">Date Issued</div>
              <div className="text-xs text-gray-800">{cert.issued_date}</div>
            </div>

            {/* Official Gold Seal Badge */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 flex items-center justify-center shadow-lg border-2 border-amber-700">
              <div className="w-full h-full rounded-full border border-dashed border-amber-900/50 flex flex-col items-center justify-center text-center">
                <Award className="w-6 h-6 text-amber-950" />
                <span className="text-[7px] font-black uppercase text-amber-950 tracking-tighter">OFFICIAL SEAL</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Qualification Code</div>
              <div className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 inline-block">
                {cert.qualification_code}
              </div>
              <div className="text-[9px] text-gray-500 mt-1">Verified Competition Record</div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-amber-700/20">
          <button
            onClick={handlePrintDownload}
            className="flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Download / Print Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
