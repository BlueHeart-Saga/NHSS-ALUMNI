import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Image as ImageIcon, Search, LogOut, 
  CheckCircle, ShieldCheck, MapPin, Building2, User, Sparkles 
} from 'lucide-react';
import { api } from '../../services/api';
import { AlumniProfile, EventItem, SchoolProfile } from '../../types';

export const AlumniPortal: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AlumniProfile | null>(null);
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'EVENTS' | 'PROFILE'>('DIRECTORY');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await api.getMe();
        setUser(u);
        const [schData, evData, dirData] = await Promise.all([
          api.getSchoolProfile().catch(() => null),
          api.getEvents().catch(() => []),
          api.getAlumniDirectory().catch(() => [])
        ]);
        if (schData) setSchool(schData);
        if (evData) setEvents(evData);
        if (dirData) setAlumniList(dirData);
      } catch (err) {
        console.error('Failed to load alumni portal:', err);
        api.clearToken();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    api.clearToken();
    navigate('/');
  };

  const filteredAlumni = alumniList.filter(a => 
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.profession?.toLowerCase().includes(search.toLowerCase()) ||
    a.current_city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] flex flex-col">
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {activeTab === 'DIRECTORY' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-[#111111]">School Alumni Directory</h2>
                <p className="text-xs text-[#6B7280]">Search batchmates, profession, and locations</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, city, job..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((a) => (
                <div key={a.id || a.mobile} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#FFF7D6] flex items-center justify-center text-[#854D0E] shrink-0">
                    {a.profile_photo_url ? (
                      <img
                        src={a.profile_photo_url}
                        alt={a.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 stroke-[2.2] text-[#854D0E]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#111111] truncate">{a.full_name}</h4>
                    <span className="text-[11px] font-semibold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Class of {a.passing_year}
                    </span>
                    <div className="text-xs text-[#6B7280] mt-2 space-y-1">
                      {a.profession && <div className="truncate flex items-center space-x-1"><Building2 className="w-3 h-3" /><span>{a.profession}</span></div>}
                      {a.current_city && <div className="truncate flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{a.current_city}</span></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
