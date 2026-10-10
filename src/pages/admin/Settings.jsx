import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, Shield, Server, Save } from 'lucide-react';

export function Settings() {
  const { isDarkMode } = useOutletContext();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System Configuration', icon: Server },
  ];

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col h-full ${isDarkMode ? 'bg-[#1A1C23] border-white/5' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-brand-dark'}`}>Settings</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your account preferences and system configurations.</p>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-4 shrink-0 overflow-x-auto md:overflow-y-auto ${isDarkMode ? 'border-white/5 bg-[#13151A]' : 'border-gray-100 bg-gray-50/30'}`}>
          <div className="flex md:flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? (isDarkMode ? 'bg-[#2A2D35] text-white shadow-sm border-transparent' : 'bg-white text-brand-dark shadow-sm border border-gray-200/60')
                      : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent' : 'text-gray-500 hover:bg-gray-100 hover:text-brand-dark border-transparent')
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-red-500' : 'text-gray-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-3xl">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h4 className={`text-lg font-bold border-b pb-2 ${isDarkMode ? 'text-white border-white/10' : 'text-brand-dark border-gray-100'}`}>Profile Information</h4>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-red-400 text-white flex items-center justify-center font-bold text-2xl shadow-inner border-4 ${isDarkMode ? 'border-[#1A1C23] ring-white/10' : 'border-white ring-gray-100'}`}>
                    AD
                  </div>
                  <div>
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer border ${isDarkMode ? 'bg-[#2A2D35] border-white/10 text-gray-200 hover:bg-[#323640]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      Change Avatar
                    </button>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                    <input type="text" defaultValue="Admin User" className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                    <input type="email" defaultValue="admin@scholarnnaire.com" className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${isDarkMode ? 'bg-[#0D0F14] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                    <input type="text" defaultValue="Super Administrator" disabled className={`w-full px-4 py-2 border rounded-xl text-sm cursor-not-allowed ${isDarkMode ? 'bg-[#2A2D35]/50 border-white/5 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'}`} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h4 className={`text-lg font-bold border-b pb-2 ${isDarkMode ? 'text-white border-white/10' : 'text-brand-dark border-gray-100'}`}>Global System Settings</h4>
                
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                      <p className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-brand-dark'}`}>Allow New Registrations</p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Toggle whether schools can register from the landing page.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDarkMode ? 'bg-gray-700 peer-checked:bg-red-500' : 'bg-gray-200 peer-checked:bg-red-500'}`}></div>
                    </label>
                  </div>
                  
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-[#13151A] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                      <p className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-brand-dark'}`}>Maintenance Mode</p>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Put the system into maintenance mode. Only admins can log in.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDarkMode ? 'bg-gray-700 peer-checked:bg-red-500' : 'bg-gray-200 peer-checked:bg-red-500'}`}></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer ${isDarkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {(activeTab === 'notifications' || activeTab === 'security') && (
              <div className={`flex flex-col items-center justify-center py-16 animate-in fade-in duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className={`p-4 rounded-full mb-3 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  {activeTab === 'notifications' ? <Bell size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} /> : <Shield size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />}
                </div>
                <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Feature in Development</p>
                <p className="text-sm mt-1">This settings module will be available soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
