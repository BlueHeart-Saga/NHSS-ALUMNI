import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, MapPin, QrCode, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { EventItem } from '../../types';
import { AlumniContextType } from '../../layouts/AlumniLayout';

export const AlumniEventsPage: React.FC = () => {
  const { user } = useOutletContext<AlumniContextType>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsSubTab, setEventsSubTab] = useState<'upcoming' | 'registered' | 'past'>('upcoming');

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [rsvpGuestAdults, setRsvpGuestAdults] = useState(1);
  const [rsvpGuestChildren, setRsvpGuestChildren] = useState(0);
  const [rsvpStatus, setRsvpStatus] = useState<'ATTENDING' | 'MAYBE' | 'DECLINED'>('ATTENDING');
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [qrTicketEvent, setQrTicketEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  const handleConfirmRSVP = () => {
    if (!selectedEvent) return;
    if (!registeredEventIds.includes(selectedEvent.id)) {
      setRegisteredEventIds([...registeredEventIds, selectedEvent.id]);
    }
    setShowRsvpModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Registration Confirmed!',
      text: `You have successfully registered for "${selectedEvent.title}" as ${rsvpStatus}. Ticket QR generated!`,
      confirmButtonColor: '#111111'
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#111111]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#111111]">Alumni Events & Reunions</h2>
          <p className="text-xs text-[#6B7280]">Browse upcoming events, view your registered passes, and check past archives</p>
        </div>

        <div className="flex gap-2 border-b border-[#E5E7EB] sm:border-0 pb-1 sm:pb-0 text-xs font-bold">
          {[
            { id: 'upcoming', label: 'Upcoming Events' },
            { id: 'registered', label: 'My Registrations' },
            { id: 'past', label: 'Past Events' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setEventsSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all ${
                eventsSubTab === tab.id
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAFAFA] text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* UPCOMING EVENTS */}
      {eventsSubTab === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length > 0 ? (
            events.map(ev => (
              <div key={ev.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  {ev.cover_image_url ? (
                    <img src={ev.cover_image_url} alt={ev.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-r from-[#111111] to-[#2D2D2D] p-6 text-white flex flex-col justify-end">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">ALUMNI GATHERING</span>
                      <h3 className="font-extrabold text-base">{ev.title}</h3>
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-base text-[#111111]">{ev.title}</h3>
                    <p className="text-xs text-[#4B5563] line-clamp-2">{ev.description}</p>
                    <div className="text-xs text-gray-500 space-y-1.5 pt-2 border-t border-[#E5E7EB]">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{new Date(ev.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{ev.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {registeredEventIds.includes(ev.id) ? (
                    <button
                      onClick={() => setQrTicketEvent(ev)}
                      className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Ticket Pass</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSelectedEvent(ev); setShowRsvpModal(true); }}
                      className="w-full py-2.5 bg-[#111111] text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Register / RSVP Now
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-[#111111]">No Upcoming Events</h3>
              <p className="text-xs text-[#6B7280] mt-1">Check back soon for new reunion and sports meet announcements.</p>
            </div>
          )}
        </div>
      )}

      {/* MY REGISTRATIONS */}
      {eventsSubTab === 'registered' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h3 className="font-bold text-base text-[#111111]">My Event Tickets & Passes</h3>
          {registeredEventIds.length > 0 ? (
            events.filter(e => registeredEventIds.includes(e.id)).map(ev => (
              <div key={ev.id} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#111111]">{ev.title}</h4>
                  <p className="text-xs text-gray-500">{ev.event_date} • {ev.venue}</p>
                </div>
                <button
                  onClick={() => setQrTicketEvent(ev)}
                  className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Ticket Pass</span>
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">You have not registered for any upcoming events yet.</p>
          )}
        </div>
      )}

      {/* PAST EVENTS ARCHIVE */}
      {eventsSubTab === 'past' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h3 className="font-bold text-base text-[#111111]">Past Events Archive</h3>
          {events.filter(e => new Date(e.event_date) < new Date()).length > 0 ? (
            events.filter(e => new Date(e.event_date) < new Date()).map(ev => (
              <div key={ev.id} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                <h4 className="font-bold text-xs text-[#111111]">{ev.title}</h4>
                <p className="text-xs text-gray-500 mt-1">Held on {new Date(ev.event_date).toLocaleDateString()} • {ev.venue}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No past events recorded in the archive yet.</p>
          )}
        </div>
      )}

      {/* RSVP Modal */}
      {showRsvpModal && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-xs">
            <button onClick={() => setShowRsvpModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-base text-[#111111]">{selectedEvent.title}</h3>
              <p className="text-gray-500 mt-1">{selectedEvent.event_date} • {selectedEvent.venue}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">RSVP Status</label>
                <div className="grid grid-cols-3 gap-2 font-bold">
                  {(['ATTENDING', 'MAYBE', 'DECLINED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRsvpStatus(st)}
                      className={`py-2 rounded-xl border transition-all ${
                        rsvpStatus === st ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#FAFAFA] border-[#E5E7EB] text-[#4B5563]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {rsvpStatus !== 'DECLINED' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Adult Guests</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={rsvpGuestAdults}
                      onChange={e => setRsvpGuestAdults(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Child Guests</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={rsvpGuestChildren}
                      onChange={e => setRsvpGuestChildren(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmRSVP}
              className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-sm hover:bg-gray-800"
            >
              Confirm Registration
            </button>
          </div>
        </div>
      )}

      {/* Ticket QR Code Modal */}
      {qrTicketEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button onClick={() => setQrTicketEvent(null)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>

            <div className="inline-block p-3 bg-amber-100 rounded-full text-amber-900 mb-1">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#111111]">{qrTicketEvent.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Official Alumni Gate Pass</p>
            </div>

            <div className="p-4 bg-[#FAFAFA] border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=EVENT-${qrTicketEvent.id}-ALUMNI-${user?.id}`}
                alt="QR Pass"
                className="w-40 h-40 object-contain rounded-lg"
              />
              <p className="text-[10px] font-mono text-gray-400 mt-2">PASS-{qrTicketEvent.id.slice(0, 8)}</p>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-bold">{user?.full_name}</p>
              <p>{qrTicketEvent.venue}</p>
              <p>{qrTicketEvent.event_date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
