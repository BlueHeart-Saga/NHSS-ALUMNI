import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BookOpen, Users, UserCheck, MessageSquare, ChevronRight, User, X, Mail, 
  MapPin, Briefcase, GraduationCap, Droplet, HandHeart, Heart, ShieldCheck, 
  Building2, Calendar, Sparkles, ExternalLink, UserPlus, Clock, CheckCircle2,
  UserMinus, Search, UserX, Send, ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { api } from '../../services/api';
import { AlumniProfile, Announcement } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { 
  getConnectionsStore, sendConnectionRequest, updateConnectionStatus, 
  removeConnection, ConnectionItem 
} from '../../utils/connectionStorage';

export const AlumniBatchesPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useOutletContext<AlumniContextType>();
  const [batchSubTab, setBatchSubTab] = useState<'info' | 'members' | 'classmates' | 'friends' | 'updates'>('members');
  const [batchMembers, setBatchMembers] = useState<AlumniProfile[]>([]);
  const [batchNotices, setBatchNotices] = useState<Announcement[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [connectModalAlumni, setConnectModalAlumni] = useState<AlumniProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Connection Network State
  const [connections, setConnections] = useState<ConnectionItem[]>(getConnectionsStore());
  const [friendsFilter, setFriendsFilter] = useState<'CONNECTED' | 'SENT' | 'RECEIVED'>('CONNECTED');
  const [friendsSearch, setFriendsSearch] = useState('');

  const reloadConnections = () => {
    setConnections(getConnectionsStore());
  };

  useEffect(() => {
    reloadConnections();
    const handleUpdate = () => reloadConnections();
    window.addEventListener('connections_updated', handleUpdate);
    return () => window.removeEventListener('connections_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!user?.passing_year) return;
    setLoading(true);
    
    Promise.all([
      api.searchAlumni(undefined, user.passing_year, 'APPROVED').catch(() => []),
      api.getAnnouncements(user.batch_id).catch(() => [])
    ]).then(([membersData, noticesData]) => {
      // Strictly filter to ONLY include students belonging to user.passing_year
      const currentYear = Number(user.passing_year);
      const batchOnly = (membersData || []).filter(a => Number(a.passing_year) === currentYear);
      setBatchMembers(batchOnly);
      setBatchNotices(noticesData || []);
    }).finally(() => setLoading(false));
  }, [user?.passing_year, user?.batch_id]);

  const committeeMembers = batchMembers.filter(a => a.committee_role || a.roles?.includes('BATCH_COORDINATOR'));
  const uniqueCities = Array.from(new Set(batchMembers.map(a => a.current_city).filter(Boolean)));
  const volunteersCount = batchMembers.filter(a => a.is_volunteer === 'YES').length;
  const donorsCount = batchMembers.filter(a => a.willing_to_donate === 'YES').length;

  // Connection Lists
  const connectedList = connections.filter(c => c.status === 'ACCEPTED');
  const sentRequests = connections.filter(c => c.direction === 'SENT' && c.status === 'PENDING');
  const receivedRequests = connections.filter(c => c.direction === 'RECEIVED' && c.status === 'PENDING');

  const getConnectionStatus = (alumnusId: string) => {
    const item = connections.find(c => c.id === alumnusId);
    if (!item) return 'NONE';
    return item.status; // 'PENDING' | 'ACCEPTED' | 'DECLINED'
  };

  const handleConnectClick = (alumnus: AlumniProfile) => {
    const id = alumnus.id || alumnus.mobile || alumnus.full_name;
    const status = getConnectionStatus(id);

    if (status === 'ACCEPTED') {
      Swal.fire({
        title: language === 'ta' ? 'தொடர்பில் உள்ளார்' : 'Already Connected',
        text: `${alumnus.full_name} is already in your friends & connected list.`,
        icon: 'info',
        confirmButtonColor: '#111111'
      });
      return;
    }

    if (status === 'PENDING') {
      Swal.fire({
        title: language === 'ta' ? 'கோரிக்கை அனுப்பப்பட்டது' : 'Request Pending',
        text: `You have already sent a connection request to ${alumnus.full_name}.`,
        icon: 'info',
        confirmButtonColor: '#111111'
      });
      return;
    }

    setConnectModalAlumni(alumnus);
  };

  const handleSendRequest = () => {
    if (!connectModalAlumni) return;
    sendConnectionRequest(connectModalAlumni, connectMessage);
    const name = connectModalAlumni.full_name;
    setConnectModalAlumni(null);
    setConnectMessage('');
    reloadConnections();

    Swal.fire({
      icon: 'success',
      title: language === 'ta' ? 'கோரிக்கை அனுப்பப்பட்டது!' : 'Connection Request Sent!',
      text: language === 'ta'
        ? `${name}-க்கு இணைப்பு கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது.`
        : `Your connection request has been sent to ${name}. It will appear under Friends & Connections tab.`,
      confirmButtonColor: '#111111',
      timer: 2000
    });
  };

  const handleAcceptRequest = (req: ConnectionItem) => {
    updateConnectionStatus(req.id, 'ACCEPTED');
    reloadConnections();
    Swal.fire({
      icon: 'success',
      title: language === 'ta' ? 'இணைப்பு ஏற்றுக்கொள்ளப்பட்டது!' : 'Connection Accepted!',
      text: `${req.targetName} is now added to your friends list.`,
      confirmButtonColor: '#111111',
      timer: 1800
    });
  };

  const handleDeclineRequest = (req: ConnectionItem) => {
    updateConnectionStatus(req.id, 'DECLINED');
    reloadConnections();
  };

  const handleRemoveFriend = (friend: ConnectionItem) => {
    Swal.fire({
      title: language === 'ta' ? 'நண்பரை நீக்கவா?' : 'Remove Connection?',
      text: `Remove ${friend.targetName} from your friends list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: language === 'ta' ? 'ஆம், நீக்கு' : 'Yes, Remove',
      cancelButtonText: language === 'ta' ? 'ரத்துசெய்' : 'Cancel',
      confirmButtonColor: '#DC2626'
    }).then(res => {
      if (res.isConfirmed) {
        removeConnection(friend.id);
        reloadConnections();
      }
    });
  };

  // Filtered Friends in Friends Tab
  const activeFriendsList = (
    friendsFilter === 'CONNECTED' ? connectedList :
    friendsFilter === 'SENT' ? sentRequests : receivedRequests
  ).filter(f => {
    const q = friendsSearch.toLowerCase().trim();
    return !q || f.targetName.toLowerCase().includes(q) || (f.targetCompany || '').toLowerCase().includes(q) || (f.targetCity || '').toLowerCase().includes(q);
  });

  const isOwnAccount = (alumnus: AlumniProfile) => {
    if (!user) return false;
    if (alumnus.id && user.id && alumnus.id === user.id) return true;
    if (alumnus.mobile && user.mobile && alumnus.mobile === user.mobile) return true;
    if (alumnus.email && user.email && alumnus.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (alumnus.full_name && user.full_name && alumnus.full_name.toLowerCase() === user.full_name.toLowerCase()) return true;
    return false;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#111111] pb-12">
      {/* Header Banner */}
      <div className="bg-black text-white p-5 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30 inline-block">
            {language === 'ta' ? `வகுப்பு ${user?.passing_year || ''}` : `Batch of ${user?.passing_year || 'Alumni'}`}
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold mt-3">
            {language === 'ta' ? `${user?.passing_year || ''} வகுப்பு தோழர்கள் தளம்` : `Class of ${user?.passing_year || ''} Hub`}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200 mt-2 max-w-xl">
            {language === 'ta'
              ? `உங்கள் ${user?.passing_year} ஆம் ஆண்டு வகுப்புத் தோழர்களுடன் தொடர்பில் இருங்கள், கோரிக்கைகளை ஏற்கவும்.`
              : `Connected exclusively with verified student batchmates from the Class of ${user?.passing_year}.`}
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold scrollbar-none">
        {[
          { id: 'members', label: language === 'ta' ? `வகுப்பு தோழர்கள் (${batchMembers.length})` : `Classmates (${batchMembers.length})`, icon: Users },
          { id: 'friends', label: language === 'ta' ? `நண்பர்கள் & தொடர்புகள் (${connectedList.length})` : `Friends & Connections (${connectedList.length})`, icon: Heart, badge: receivedRequests.length },
          { id: 'info', label: language === 'ta' ? 'வகுப்பு விவரங்கள்' : 'Batch Information', icon: BookOpen },
          { id: 'updates', label: language === 'ta' ? `அறிவிப்புப் பலகை (${batchNotices.length})` : `Batch Notice Board (${batchNotices.length})`, icon: MessageSquare }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setBatchSubTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer relative ${
              batchSubTab === tab.id
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111111]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {Boolean(tab.badge && tab.badge > 0) && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-bounce">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: BATCH MEMBERS / CLASSMATES (Strictly our batch only) */}
      {(batchSubTab === 'members' || batchSubTab === 'classmates') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="font-extrabold text-sm text-[#111111]">
                {language === 'ta' ? `${user?.passing_year} வகுப்பு தோழர்கள் பட்டியல்` : `Verified Classmates of ${user?.passing_year}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'ta' ? 'உங்கள் வகுப்பைச் சேர்ந்த மாணவர்கள் மட்டும் கீழே காட்டப்படுகிறார்கள்' : 'Showing verified alumni matching your graduation passing year only'}
              </p>
            </div>
            <span className="bg-[#FFF7D6] text-[#854D0E] font-extrabold text-xs px-3 py-1 rounded-full border border-[#F4C542]">
              {batchMembers.length} {language === 'ta' ? 'தோழர்கள்' : 'Students'}
            </span>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-xs text-gray-500">
              Loading batchmates...
            </div>
          ) : batchMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchMembers.map(a => {
                const connStatus = getConnectionStatus(a.id || a.mobile || a.full_name);
                const isOwnAccount = (alumnus: AlumniProfile) => {
    if (!user) return false;
    if (alumnus.id && user.id && alumnus.id === user.id) return true;
    if (alumnus.mobile && user.mobile && alumnus.mobile === user.mobile) return true;
    if (alumnus.email && user.email && alumnus.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (alumnus.full_name && user.full_name && alumnus.full_name.toLowerCase() === user.full_name.toLowerCase()) return true;
    return false;
  };

  return (
                  <div key={a.id || a.full_name} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md hover:border-amber-300 transition-all">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#F4C542] bg-[#FFF7D6] flex items-center justify-center shrink-0">
                        {a.profile_photo_url ? (
                          <img src={a.profile_photo_url} alt={a.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-[#854D0E]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#111111] truncate">{a.full_name}</h4>
                        {a.name_ta && <p className="text-[11px] text-gray-500 font-serif">{a.name_ta}</p>}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="text-[10px] font-semibold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-block">
                            Class of {a.passing_year}
                          </span>
                          {a.blood_group && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-flex items-center space-x-0.5 border border-rose-200">
                              <Droplet className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                              <span>{a.blood_group}</span>
                            </span>
                          )}
                          {a.is_volunteer === 'YES' && (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              VOLUNTEER
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] mt-2 truncate">
                          {a.profession || 'Alumnus'} {a.company ? `@ ${a.company}` : ''} {a.current_city ? `• ${a.current_city}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                      <button
                        onClick={() => setSelectedAlumni(a)}
                        className="flex-1 py-1.5 text-xs font-bold text-[#111111] bg-[#FAFAFA] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-all text-center cursor-pointer"
                      >
                        Full Profile
                      </button>

                      {isOwnAccount(a) ? (
                        <span className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl flex items-center justify-center space-x-1 cursor-default">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                          <span>You</span>
                        </span>
                      ) : connStatus === 'ACCEPTED' ? (
                        <button
                          disabled
                          className="px-3 py-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-center space-x-1 cursor-default"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected</span>
                        </button>
                      ) : connStatus === 'PENDING' ? (
                        <button
                          disabled
                          className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-center space-x-1 cursor-default"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Sent</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnectClick(a)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#111111] hover:bg-gray-800 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-[#F4C542]" />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-[#E5E7EB] text-center space-y-2">
              <Users className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-600 font-semibold">No registered members found for Class of {user?.passing_year} yet.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: FRIENDS & CONNECTIONS NETWORK TAB (Instagram / Social style) */}
      {batchSubTab === 'friends' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#111111] flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>{language === 'ta' ? 'நண்பர்கள் & சமூக தொடர்புகள்' : 'Friends & Social Connection Network'}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'ta'
                  ? 'உங்கள் நண்பர்கள் பட்டியல், அனுப்பப்பட்ட மற்றும் வந்த இணைப்பு கோரிக்கைகள்'
                  : 'Manage your active connections, pending outgoing invites, and incoming requests.'}
              </p>
            </div>

            {/* Sub Filter Switcher */}
            <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFriendsFilter('CONNECTED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  friendsFilter === 'CONNECTED' ? 'bg-[#111111] text-white shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                Friends ({connectedList.length})
              </button>
              <button
                type="button"
                onClick={() => setFriendsFilter('RECEIVED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                  friendsFilter === 'RECEIVED' ? 'bg-[#111111] text-white shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                <span>Requests</span>
                {receivedRequests.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 rounded-full">{receivedRequests.length}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFriendsFilter('SENT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  friendsFilter === 'SENT' ? 'bg-[#111111] text-white shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                Sent ({sentRequests.length})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search in friends list..."
              value={friendsSearch}
              onChange={e => setFriendsSearch(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
            />
          </div>

          {/* List Display */}
          {activeFriendsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeFriendsList.map(item => (
                <div key={item.id} className="p-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xs space-y-3 hover:border-amber-300 transition-all flex flex-col justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-[#FFF7D6] flex items-center justify-center shrink-0">
                      {item.targetPhoto ? (
                        <img src={item.targetPhoto} alt={item.targetName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-[#854D0E]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-[#111111] truncate">{item.targetName}</h4>
                      {item.targetNameTa && <p className="text-[11px] text-gray-500 font-serif">{item.targetNameTa}</p>}
                      <div className="text-[10px] font-bold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-block mt-1">
                        Batch of {item.targetBatch || user?.passing_year}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {item.targetProfession || 'Alumnus'} {item.targetCity ? `• ${item.targetCity}` : ''}
                      </p>
                      {item.message && (
                        <p className="text-[11px] italic text-gray-600 bg-gray-50 p-2 rounded-lg mt-2 border border-gray-100">
                          "{item.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions depending on filter tab */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    {friendsFilter === 'CONNECTED' && (
                      <>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected Friend</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(item)}
                          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      </>
                    )}

                    {friendsFilter === 'RECEIVED' && (
                      <div className="flex items-center space-x-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(item)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(item)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {friendsFilter === 'SENT' && (
                      <>
                        <span className="text-[11px] text-amber-800 font-bold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Approval</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => { removeConnection(item.id); reloadConnections(); }}
                          className="text-gray-400 hover:text-red-600 text-[11px] font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
              <UserCheck className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="font-bold text-sm text-[#111111]">
                {friendsFilter === 'CONNECTED' ? 'No Connected Friends Yet' :
                 friendsFilter === 'SENT' ? 'No Pending Sent Requests' : 'No Incoming Connection Requests'}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {friendsFilter === 'CONNECTED'
                  ? 'Connect with your classmates and batchmates to build your personal alumni network list.'
                  : 'Requests will be listed here.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: BATCH INFO */}
      {batchSubTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs md:col-span-2 space-y-4">
            <h3 className="font-bold text-base text-[#111111]">
              {language === 'ta' ? 'வகுப்பு கண்ணோட்டம் & குழுத் தலைவர்கள்' : 'Batch Overview & Committee'}
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              {language === 'ta'
                ? `${user?.passing_year} ஆம் ஆண்டு வகுப்பில் ${batchMembers.length} சரிபார்க்கப்பட்ட முன்னாள் மாணவர்கள் இணைந்துள்ளனர்.`
                : `The batch of ${user?.passing_year} consists of ${batchMembers.length} verified alumni members.`}
            </p>
            
            <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
              <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider text-gray-500">Batch Leadership</h4>
              {committeeMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {committeeMembers.map((cm, idx) => (
                    <div key={cm.id || idx} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB] flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 overflow-hidden">
                        {cm.profile_photo_url ? (
                          <img src={cm.profile_photo_url} alt={cm.full_name} className="w-full h-full object-cover" />
                        ) : (
                          cm.full_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#111111]">{cm.full_name}</p>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                          {cm.committee_role_title || cm.committee_role || 'Batch Representative'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E7EB] text-xs text-gray-500 text-center">
                  Batch committee members and coordinators for Class of {user?.passing_year} are being appointed.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#111111]">Batch Quick Facts</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Passing Year</span>
                <span className="font-bold">{user?.passing_year || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Registered Classmates</span>
                <span className="font-bold">{batchMembers.length} Alumni</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Active Cities</span>
                <span className="font-bold">{uniqueCities.length} Cities</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Volunteers</span>
                <span className="font-bold text-emerald-700">{volunteersCount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Willing Donors</span>
                <span className="font-bold text-[#854D0E]">{donorsCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BATCH UPDATES */}
      {batchSubTab === 'updates' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#111111]">Batch Notice Board</h3>
          {batchNotices.length > 0 ? (
            <div className="space-y-3">
              {batchNotices.map(notice => (
                <div key={notice.id} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-1 sm:gap-0">
                    <span className="font-bold text-[#111111]">{notice.title}</span>
                    <span>{formatDateDDMMYYYY(notice.created_at)}</span>
                  </div>
                  <p className="text-xs text-[#374151] leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#FAFAFA] text-center border border-dashed border-[#E5E7EB] space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs text-[#6B7280]">No active announcements posted for Class of {user?.passing_year} yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Profile Detail Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-xs max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button onClick={() => setSelectedAlumni(null)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111] p-1 rounded-full hover:bg-gray-100 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F4C542] bg-[#FFF7D6] flex items-center justify-center shrink-0 shadow-sm">
                {selectedAlumni.profile_photo_url ? (
                  <img src={selectedAlumni.profile_photo_url} alt={selectedAlumni.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-[#854D0E]" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#111111]">{selectedAlumni.full_name}</h3>
                {selectedAlumni.name_ta && <p className="text-xs text-gray-500 font-serif">{selectedAlumni.name_ta}</p>}
                <p className="text-amber-800 font-extrabold text-xs mt-0.5">Class of {selectedAlumni.passing_year}</p>
              </div>
            </div>

            {/* Academic & Section details */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Roll No</span>
                <span className="font-bold">{selectedAlumni.roll_no || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Section</span>
                <span className="font-bold">{selectedAlumni.section || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Leaving Class</span>
                <span className="font-bold">{selectedAlumni.leaving_class || '10th'}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedAlumni.blood_group && (
                <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-1">
                  <Droplet className="w-3 h-3 fill-rose-600 text-rose-600" />
                  <span>{selectedAlumni.blood_group}</span>
                </span>
              )}
              {selectedAlumni.is_volunteer === 'YES' && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold flex items-center gap-1">
                  <HandHeart className="w-3 h-3 text-emerald-700" />
                  <span>VOLUNTEER</span>
                </span>
              )}
              {selectedAlumni.willing_to_donate === 'YES' && (
                <span className="px-2.5 py-1 rounded-full bg-[#FFF7D6] border border-[#F4C542] text-[#854D0E] font-extrabold flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-[#854D0E]" />
                  <span>DONOR</span>
                </span>
              )}
            </div>

            {/* Profession, Location, Email */}
            <div className="space-y-2 pt-2 border-t border-gray-100 text-gray-700">
              {selectedAlumni.profession && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong className="text-[#111111]">{selectedAlumni.profession}</strong> {selectedAlumni.company ? `@ ${selectedAlumni.company}` : ''}</span>
                </div>
              )}
              {selectedAlumni.current_city && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.current_city} {selectedAlumni.state ? `, ${selectedAlumni.state}` : ''}</span>
                </div>
              )}
              {selectedAlumni.email && selectedAlumni.email_visible !== false && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.email}</span>
                </div>
              )}
            </div>

            {/* Connect Button */}
            <div className="pt-2">
              {isOwnAccount(selectedAlumni) ? (
                <div className="w-full py-2.5 bg-gray-100 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-default">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>This is your own profile</span>
                </div>
              ) : getConnectionStatus(selectedAlumni.id || selectedAlumni.mobile || selectedAlumni.full_name) === 'ACCEPTED' ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Connected Friend</span>
                </button>
              ) : (
                <button
                  onClick={() => { handleConnectClick(selectedAlumni); setSelectedAlumni(null); }}
                  className="w-full py-2.5 bg-[#111111] text-[#F4C542] hover:bg-black rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#F4C542]" />
                  <span>Connect with Classmate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Message Modal */}
      {connectModalAlumni && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setConnectModalAlumni(null)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111] cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#111111]">Connect with {connectModalAlumni.full_name}</h3>
            <p className="text-xs text-gray-500">Send a greeting message to connect with your classmate.</p>

            <textarea
              rows={4}
              value={connectMessage}
              onChange={e => setConnectMessage(e.target.value)}
              placeholder="Hi! I am also from the class of our school. Would love to connect..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#F4C542]"
            ></textarea>

            <button
              onClick={handleSendRequest}
              className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-black cursor-pointer flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4 text-[#F4C542]" />
              <span>Send Connection Request</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
