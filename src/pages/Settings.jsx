import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  LogOut,
  Camera,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { initialLeads, initialProjects } from '../data/mockData';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useCrmStore();

  // Profile Form state
  const [profileName, setProfileName] = useState('Admin Photographer');
  const [profileEmail, setProfileEmail] = useState('admin@lensflow.studio');
  const [studioName, setStudioName] = useState('LensFlow Studio Mumbai');
  const [isSaved, setIsSaved] = useState(false);

  // Notification Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsAppReminders, setWhatsAppReminders] = useState(true);
  const [newLeadNotifications, setNewLeadNotifications] = useState(true);
  const [bookingSms, setBookingSms] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all leads and projects back to initial demo data?')) {
      localStorage.removeItem('lensflow_crm_store');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Row */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">System and profile preferences.</p>
      </div>

      <div className="space-y-6">
        {/* 1. Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Studio Profile</h2>
              <p className="text-xs text-slate-500">Manage your admin identity and business details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Row */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg ring-2 ring-slate-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
                >
                  Change Avatar
                </button>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or WebP up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              {isSaved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                  <Check className="w-4 h-4" /> Changes saved successfully!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* 2. Notifications Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications & Alerts</h2>
              <p className="text-xs text-slate-500">Configure reminder channels and enquiry alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Email Notifications</h4>
                <p className="text-[11px] text-slate-500">Receive daily summary digests of incoming enquiries</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  emailAlerts ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800">WhatsApp Follow-up Reminders</h4>
                <p className="text-[11px] text-slate-500">Alert me 30 minutes before a scheduled follow-up call</p>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppReminders(!whatsAppReminders)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  whatsAppReminders ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    whatsAppReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800">New Lead Alerts</h4>
                <p className="text-[11px] text-slate-500">Instant notification when a form enquiry is submitted</p>
              </div>
              <button
                type="button"
                onClick={() => setNewLeadNotifications(!newLeadNotifications)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  newLeadNotifications ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    newLeadNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Client Booking SMS</h4>
                <p className="text-[11px] text-slate-500">Send automatic booking confirmation SMS to clients</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingSms(!bookingSms)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  bookingSms ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    bookingSms ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Account & Demo Utilities Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Demo State & Session</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Reset demo localStorage data or sign out of your session</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetData}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Mock Data</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200/60 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
