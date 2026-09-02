import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Building2, MapPin, User, UserPlus, X, Mail, Phone, ExternalLink, Award, Globe, RotateCcw, Loader2 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { AlumniProfile } from '../../types';

export const AlumniDirectoryPage: React.FC = () => {
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [professionFilter, setProfessionFilter] = useState<string>('ALL');

  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [connectModalAlumni, setConnectModalAlumni] = useState<AlumniProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState('');

  const fetchDirectory = () => {
    setLoading(true);
    api.getAlumniDirectory()
      .then(res => setAlumniList(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const filteredAlumni = alumniList.filter(a => {
    const matchSearch = search === '' || 
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.profession?.toLowerCase().includes(search.toLowerCase()) ||
      a.company?.toLowerCase().includes(search.toLowerCase()) ||
      a.current_city?.toLowerCase().includes(search.toLowerCase());
    
    const matchBatch = batchFilter === 'ALL' || a.passing_year?.toString() === batchFilter;
    const matchCity = cityFilter === 'ALL' || (a.current_city && a.current_city.toLowerCase().includes(cityFilter.toLowerCase()));
    const matchProf = professionFilter === 'ALL' || (a.profession && a.profession.toLowerCase().includes(professionFilter.toLowerCase()));
    
    return matchSearch && matchBatch && matchCity && matchProf;
  });

  const uniqueBatches = Array.from(new Set(alumniList.map(a => a.passing_year).filter(Boolean))).sort((a, b) => b - a);
  const uniqueCities = Array.from(new Set(alumniList.map(a => a.current_city).filter(Boolean))).sort();
  const uniqueProfessions = Array.from(new Set(alumniList.map(a => a.profession).filter(Boolean))).sort();

  const resetFilters = () => {
    setSearch('');
    setBatchFilter('ALL');
    setCityFilter('ALL');
    setProfessionFilter('ALL');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#111111]">
      {/* Header & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">Global Alumni Directory</h2>
            <p className="text-xs text-[#6B7280]">Connect with verified alumni across batches, companies, and cities worldwide</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, profession..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-gray-500 font-semibold">
              <Filter className="w-3.5 h-3.5 text-amber-700" />
              <span>Filter By:</span>
            </div>

            <select
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#F4C542] font-medium"
            >
              <option value="ALL">All Batches ({uniqueBatches.length})</option>
              {uniqueBatches.map(b => (
                <option key={b} value={b?.toString()}>Class of {b}</option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#F4C542] font-medium"
            >
              <option value="ALL">All Cities ({uniqueCities.length})</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={professionFilter}
              onChange={e => setProfessionFilter(e.target.value)}
              className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#F4C542] font-medium"
            >
              <option value="ALL">All Professions ({uniqueProfessions.length})</option>
              {uniqueProfessions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {(batchFilter !== 'ALL' || cityFilter !== 'ALL' || professionFilter !== 'ALL' || search !== '') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center space-x-1 text-xs text-amber-800 font-semibold hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-[#111111]">{filteredAlumni.length}</strong> of {alumniList.length} Alumni
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#854D0E] animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Loading verified alumni directory...</p>
        </div>
      ) : filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredAlumni.map(a => (
            <div key={a.id || a.mobile} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-amber-300 transition-all">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F4C542] bg-[#FFF7D6] flex items-center justify-center shrink-0">
                  {a.profile_photo_url ? (
                    <img src={a.profile_photo_url} alt={a.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-[#854D0E]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[#111111] truncate">{a.full_name}</h4>
                  <span className="text-[10px] font-semibold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-block mt-1 border border-[#F4C542]/30">
                    Class of {a.passing_year} {a.section ? `(${a.section})` : ''}
                  </span>
                  <div className="text-xs text-[#6B7280] mt-2 space-y-1">
                    {a.profession && (
                      <div className="truncate flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">{a.profession} {a.company ? `@ ${a.company}` : ''}</span>
                      </div>
                    )}
                    {a.current_city && (
                      <div className="truncate flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{a.current_city} {a.state ? `, ${a.state}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setSelectedAlumni(a)}
                  className="flex-1 py-2 text-xs font-bold text-[#111111] bg-[#FAFAFA] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-all text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => setConnectModalAlumni(a)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-gray-800 rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E5E7EB] text-center space-y-3">
          <User className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-sm text-[#111111]">No Alumni Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No verified alumni match your filter criteria. Try clearing or expanding your search filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-gray-800"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* High-Level Alumni Profile Detail Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <button 
              onClick={() => setSelectedAlumni(null)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-[#111111] p-1 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <div className="w-18 h-18 rounded-full bg-[#FFF7D6] border-2 border-[#F4C542] overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {selectedAlumni.profile_photo_url ? (
                  <img src={selectedAlumni.profile_photo_url} alt={selectedAlumni.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-9 h-9 text-[#854D0E]" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-[#111111]">{selectedAlumni.full_name}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-extrabold text-[#854D0E] bg-[#FFF7D6] px-2.5 py-0.5 rounded-full border border-[#F4C542]/40">
                    Class of {selectedAlumni.passing_year} {selectedAlumni.section ? `(${selectedAlumni.section})` : ''}
                  </span>
                  {selectedAlumni.admission_number && (
                    <span className="text-gray-500 font-semibold">Adm: {selectedAlumni.admission_number}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Summary */}
            {selectedAlumni.bio && (
              <div className="p-3.5 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] text-xs text-[#374151] italic leading-relaxed">
                "{selectedAlumni.bio}"
              </div>
            )}

            {/* Career & Location */}
            <div className="space-y-2.5 text-xs text-[#374151] pt-3 border-t border-[#E5E7EB]">
              {selectedAlumni.profession && (
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong className="text-[#111111]">{selectedAlumni.profession}</strong>
                    {selectedAlumni.company ? ` at ${selectedAlumni.company}` : ''}
                  </span>
                </div>
              )}

              {selectedAlumni.current_city && (
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.current_city} {selectedAlumni.state ? `, ${selectedAlumni.state}` : ''} {selectedAlumni.country ? `, ${selectedAlumni.country}` : ''}</span>
                </div>
              )}

              {selectedAlumni.email && (
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.email_visible ? selectedAlumni.email : 'Email Hidden (Privacy On)'}</span>
                </div>
              )}

              {selectedAlumni.mobile && selectedAlumni.phone_visible && (
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.mobile}</span>
                </div>
              )}
            </div>

            {/* Skills Badges */}
            {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111]">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Key Skills & Expertise</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlumni.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[11px] font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Links */}
            {(selectedAlumni.linkedin_url || selectedAlumni.website_url) && (
              <div className="flex flex-wrap gap-3 pt-3 border-t border-[#E5E7EB]">
                {selectedAlumni.linkedin_url && (
                  <a
                    href={selectedAlumni.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0A66C2] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all"
                  >
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedAlumni.website_url && (
                  <a
                    href={selectedAlumni.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-xl hover:bg-black transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3">
              <button
                onClick={() => { setConnectModalAlumni(selectedAlumni); setSelectedAlumni(null); }}
                className="w-full py-2.5 bg-[#111111] text-white hover:bg-black rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4 text-[#F4C542]" />
                <span>Send Connection Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {connectModalAlumni && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setConnectModalAlumni(null)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#111111]">Connect with {connectModalAlumni.full_name}</h3>
            <p className="text-xs text-gray-500">Include a friendly greeting message with your connection request.</p>

            <textarea
              rows={4}
              value={connectMessage}
              onChange={e => setConnectMessage(e.target.value)}
              placeholder="Hi! I am also an alumnus of our school. Would love to connect..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#F4C542]"
            ></textarea>

            <button
              onClick={() => {
                setConnectModalAlumni(null);
                setConnectMessage('');
                Swal.fire({ icon: 'success', title: 'Connection Request Sent', text: `Your connection request was sent to ${connectModalAlumni.full_name}.`, confirmButtonColor: '#111111' });
              }}
              className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-black"
            >
              Send Connection Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
