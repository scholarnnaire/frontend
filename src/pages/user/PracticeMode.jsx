import React from 'react';
import { motion } from 'framer-motion';
import { Target, BookOpen, Calculator, FlaskConical, Globe, ChevronRight } from 'lucide-react';

export function PracticeMode() {
  const subjects = [
    { id: 'math', name: 'Mathematics', icon: Calculator, color: 'from-blue-500 to-indigo-600', questions: 1250 },
    { id: 'eng', name: 'English Language', icon: BookOpen, color: 'from-purple-500 to-pink-600', questions: 840 },
    { id: 'sci', name: 'General Science', icon: FlaskConical, color: 'from-emerald-400 to-teal-600', questions: 1020 },
    { id: 'soc', name: 'Current Affairs', icon: Globe, color: 'from-orange-400 to-red-500', questions: 430 }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3 text-brand-green mb-2">
            <Target size={24} />
            <span className="font-bold tracking-wider uppercase text-sm">Training Ground</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Practice Mode</h1>
          <p className="text-gray-400 text-lg">Sharpen your skills with past tournament questions. Scores here do not affect your national ranking.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {subjects.map((subject, index) => (
          <motion.div 
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#13151A] border border-white/5 p-6 md:p-8 rounded-3xl group hover:border-white/10 hover:bg-[#1A1C23] transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br ${subject.color} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg`}>
                  <subject.icon size={28} className="text-white" />
                </div>
                <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-300 border border-white/10">
                  {subject.questions.toLocaleString()} Questions
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{subject.name}</h3>
              <p className="text-gray-400 text-sm mb-8 flex-1">Practice time-pressured questions from past Scholarnnaire tournaments.</p>
              
              <div className="flex items-center text-brand-green font-bold text-sm group-hover:translate-x-2 transition-transform">
                Start Session
                <ChevronRight size={18} className="ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
