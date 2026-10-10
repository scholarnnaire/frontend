import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, User, MapPin, Mail, Phone, Camera, Building2 } from 'lucide-react';
import api from '../../utils/api';

export function Profile() {
  const fileInputRef = useRef(null);
  const [school, setSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    lga: '',
    category: '',
    type: '',
    contact_email: '',
    contact_phone: '',
  });

  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/dashboard');
      const schoolData = response.data.school;
      setSchool(schoolData);
      setFormData({
        name: schoolData.name || '',
        state: schoolData.state || '',
        lga: schoolData.lga || '',
        category: schoolData.category || '',
        type: schoolData.type || '',
        contact_email: schoolData.contact_email || '',
        contact_phone: schoolData.contact_phone || '',
      });
      if (schoolData.logo_url) {
        setLogoPreview(schoolData.logo_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/user/profile', formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      const response = await api.post('/user/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setLogoPreview(response.data.logo_url);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 h-full overflow-y-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">School Profile</h1>
          <p className="text-gray-400">Manage your institution's details and branding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LOGO UPLOAD COLUMN */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#13151A] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-6"
          >
            <div 
              className="w-full aspect-square max-w-[200px] rounded-3xl bg-[#0A0C10] border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="School Logo" className="w-full h-full object-contain p-4 relative z-10" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Camera size={32} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                  <Upload size={32} className="text-brand-green opacity-50" />
                  <span className="text-sm font-bold">Upload Logo</span>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="hidden" 
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">{formData.name || 'Your School'}</h3>
              <p className="text-sm text-gray-500">Logo should be a square PNG or JPG, max 5MB.</p>
            </div>
            
            {isUploading && (
              <div className="text-brand-green text-sm font-bold animate-pulse">Uploading...</div>
            )}
          </motion.div>
        </div>

        {/* PROFILE DETAILS COLUMN */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#13151A] border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl"
          >
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={14} /> School Name
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0C10] border border-white/5 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={14} /> Contact Email
                  </label>
                  <input 
                    type="email" 
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0C10] border border-white/5 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} /> Contact Phone
                  </label>
                  <input 
                    type="tel" 
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0C10] border border-white/5 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} /> State
                  </label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0C10] border border-white/5 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none opacity-50 cursor-not-allowed"
                    required
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} /> LGA
                  </label>
                  <input 
                    type="text" 
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0C10] border border-white/5 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={14} /> Category
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0C10] border border-white/5 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                  >
                    <option value="Primary">Primary</option>
                    <option value="Junior Secondary">Junior Secondary</option>
                    <option value="Senior Secondary">Senior Secondary</option>
                    <option value="Tertiary">Tertiary</option>
                    <option value="Corpers">Corpers</option>
                    <option value="Adults / Open">Adults / Open</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={14} /> Type
                  </label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0C10] border border-white/5 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                  >
                    <option value="">Select Type...</option>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-brand-green hover:bg-emerald-500 text-[#0D0F14] font-bold rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
