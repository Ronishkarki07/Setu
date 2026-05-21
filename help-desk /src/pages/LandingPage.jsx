import React from 'react';
import { useNavigate } from 'react-router-dom';
import BICImage from '../images/BIC.png';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-[#4F46E5] selection:text-white">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-10 py-5 max-w-7xl mx-auto absolute top-0 left-0 right-0 z-[100]">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-white md:text-[#1E293B]">Academic Nexus</span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <a href="#" className="text-white md:text-[#1E293B] border-b-2 border-white md:border-[#1E293B] pb-0.5">Students</a>
          <a href="#" className="text-white/60 md:text-gray-400 hover:text-white md:hover:text-[#1E293B] transition-colors">Staff</a>
          <a href="#" className="text-white/60 md:text-gray-400 hover:text-white md:hover:text-[#1E293B] transition-colors">Admins</a>
          <a href="#" className="text-white/60 md:text-gray-400 hover:text-white md:hover:text-[#1E293B] transition-colors">About</a>
          <a href="#" className="text-white/60 md:text-gray-400 hover:text-white md:hover:text-[#1E293B] transition-colors">Knowledge Base</a>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-[#0F172A] text-white text-[10px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section - Dark Theme */}
      <section className="relative bg-[#050B1C] pt-32 pb-20 overflow-hidden min-h-[600px] flex flex-col justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={BICImage} 
            alt="Campus Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B1C]/80 via-[#050B1C]/40 to-[#050B1C]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-10 relative z-10 text-left md:text-left">
          <div className="inline-flex items-center px-3 py-1 bg-[#FF4747] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded mb-6">
            Institutional Authority
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-3xl">
            Unified Support for <br />
            Institutional Success
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed mb-10 font-medium">
            The single gateway for academic inquiry, administrative workflows, and departmental coordination. Secure, fast, and authoritative.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-[#0D1F4D] text-white font-black text-xs rounded-lg hover:bg-blue-900 transition-all flex items-center gap-3 border border-white/10 uppercase tracking-widest"
            >
              Student Login <span className="opacity-50">→</span>
            </button>
            <button 
              className="px-8 py-3.5 bg-white text-[#050B1C] font-black text-xs rounded-lg hover:bg-gray-100 transition-all uppercase tracking-widest shadow-xl"
            >
              Department Access
            </button>
            <button 
              onClick={() => navigate('/admin/login')}
              className="px-8 py-3.5 bg-transparent text-white border border-white/20 font-black text-xs rounded-lg hover:bg-white/5 transition-all uppercase tracking-widest"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem value="10k+" label="Students Served" />
          <StatItem value="98%" label="Resolution Rate" color="text-green-500" />
          <StatItem value="6+" label="Institutional Depts" />
          <StatItem value="< 2h" label="Response Time" color="text-[#FF4747]" />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 max-w-7xl mx-auto px-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-[#0d1b3e] leading-tight mb-4">
              The Modern Curator of <br /> Campus Support
            </h2>
            <p className="text-base text-gray-400 font-medium leading-relaxed">
              Our ecosystem replaces fragmented email threads with a sophisticated, centralized intelligence hub designed for the modern university.
            </p>
          </div>
          <div className="text-7xl opacity-5 grayscale">🎓</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="w-12 h-12 bg-[#0D1B3E] rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-900/20 text-white">🎫</div>
            <h3 className="text-xl font-black text-[#0d1b3e] mb-3">Centralized Ticketing</h3>
            <p className="text-sm text-gray-400 font-medium mb-8 leading-relaxed">A unified queue for registrar, financial aid, and academic advising. No student inquiry ever goes unanswered.</p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <Avatar initials="SM" bg="bg-blue-100 text-blue-600" />
                <Avatar initials="AD" bg="bg-red-100 text-red-600" />
                <Avatar initials="JS" bg="bg-green-100 text-green-600" />
                <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-400">+12</div>
              </div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Active Staff Responding</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#050B1C] rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl mb-6 text-white">📈</div>
              <h3 className="text-xl font-black text-white mb-3">Real-time Analytics</h3>
              <p className="text-sm text-blue-200/50 font-medium mb-10 leading-relaxed">Visualize resolution bottlenecks and peak demand periods with institutional-grade reporting.</p>
              <div className="flex items-end gap-1.5 h-16">
                {[30, 60, 40, 80, 50, 100, 70, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#56FF94] rounded-t-sm transition-all duration-700 group-hover:bg-[#4ADE80]" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#F1F5F9] rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10">
             <div className="flex-1">
                <div className="w-10 h-10 bg-[#FF4747] rounded-xl flex items-center justify-center text-lg mb-5 shadow-lg shadow-red-500/20 text-white">🛡️</div>
                <h3 className="text-xl font-black text-[#0d1b3e] mb-3">Institutional Security</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">FERPA-compliant encryption and role-based access control for student privacy.</p>
             </div>
             <div className="w-32 h-32 bg-white rounded-2xl shadow-inner flex items-center justify-center text-4xl grayscale opacity-50">🔒</div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 bg-gray-50 rounded-2xl shadow-inner flex items-center justify-center text-4xl grayscale opacity-50">📁</div>
            <div className="flex-1">
                <h3 className="text-xl font-black text-[#0d1b3e] mb-3">Secure Communication</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-5">Encrypted messaging and document sharing between students and university staff.</p>
                <a href="#" className="text-[10px] font-black text-gray-900 border-b-2 border-gray-200 hover:border-gray-900 transition-all uppercase tracking-widest">Learn about our encryption ↗</a>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-10 py-20">
        <div className="max-w-7xl mx-auto bg-[#050B1C] rounded-[40px] p-16 text-center relative overflow-hidden shadow-3xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-5 tracking-tight">Ready to streamline your <br /> department?</h2>
            <p className="text-blue-200/40 mb-10 font-medium max-w-lg mx-auto text-base">Join 6 other institutional departments in creating a seamless student experience.</p>
            <div className="flex flex-wrap justify-center gap-4">
               <button className="px-10 py-4 bg-[#56FF94] text-[#050B1C] font-black text-xs rounded-lg hover:bg-[#4ADE80] transition-all uppercase tracking-widest">Request Demo</button>
               <button className="px-10 py-4 bg-transparent text-white border border-white/20 font-black text-xs rounded-lg hover:bg-white/5 transition-all uppercase tracking-widest">Contact Support</button>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-10 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <span className="text-lg font-black text-[#0d1b3e] mb-2 block">Academic Nexus</span>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">© 2026 Institutional Authority & Student Success.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Accessibility</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact Support</a>
            <a href="#" className="hover:text-gray-900 transition-colors">University Home</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label, color = "text-gray-900" }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function Avatar({ initials, bg }) {
  return (
    <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black ${bg}`}>
      {initials}
    </div>
  );
}
