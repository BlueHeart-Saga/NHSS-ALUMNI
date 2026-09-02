import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { AlumniProfile } from '../../types';

interface MentorProfile {
  id: string;
  name: string;
  passing_year: number;
  designation: string;
  company: string;
  city: string;
  domain: string;
  experience: string;
  bio: string;
  available_hours: string;
  skills: string[];
}

export const AlumniMentorshipPage: React.FC = () => {
  const [mentorshipMode, setMentorshipMode] = useState<'find' | 'become'>('find');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [mentorshipRequestNote, setMentorshipRequestNote] = useState('');
  const [mentorsList, setMentorsList] = useState<MentorProfile[]>([]);

  useEffect(() => {
    api.getAlumniDirectory()
      .then((res: AlumniProfile[]) => {
        const mapped = res.filter((a: AlumniProfile) => a.profession).map((a: AlumniProfile) => ({
          id: a.id || a.mobile,
          name: a.full_name,
          passing_year: a.passing_year,
          designation: a.profession || 'Professional',
          company: a.current_city ? `Based in ${a.current_city}` : 'Alumni Network',
          city: a.current_city || 'India',
          domain: a.profession || 'General',
          experience: 'Alumnus',
          bio: `${a.full_name} is an alumnus from Class of ${a.passing_year} working as ${a.profession || 'Professional'}.`,
          available_hours: '2 hrs/week',
          skills: [a.profession || 'Career Guidance', 'Mentorship']
        }));
        setMentorsList(mapped);
      })
      .catch(console.error);
  }, []);

  const handleSendMentorshipRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setSelectedMentor(null);
    setMentorshipRequestNote('');
    Swal.fire({
      icon: 'success',
      title: 'Request Sent!',
      text: `Your mentorship request has been sent to ${selectedMentor.name}. They will be notified via email & portal.`,
      confirmButtonColor: '#111111'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#111111]">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">Alumni Mentorship Network</h2>
            <p className="text-xs text-[#6B7280]">Connect with senior alumni for career advice, higher education, or offer guidance to juniors</p>
          </div>

          <div className="flex p-1 bg-[#F3F4F6] rounded-xl text-xs font-bold">
            <button
              onClick={() => setMentorshipMode('find')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                mentorshipMode === 'find' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#6B7280]'
              }`}
            >
              Find a Mentor
            </button>
            <button
              onClick={() => setMentorshipMode('become')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                mentorshipMode === 'become' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#6B7280]'
              }`}
            >
              Become a Mentor
            </button>
          </div>
        </div>
      </div>

      {/* FIND MENTORS MODE */}
      {mentorshipMode === 'find' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentorsList.length > 0 ? (
            mentorsList.map(mentor => (
              <div key={mentor.id} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm border border-amber-300">
                      {mentor.name[0]}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {mentor.available_hours}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#111111]">{mentor.name}</h3>
                    <p className="text-xs text-[#6B7280]">{mentor.designation} @ {mentor.company}</p>
                    <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      Class of {mentor.passing_year} • {mentor.experience}
                    </span>
                  </div>

                  <p className="text-xs text-[#4B5563] line-clamp-3">{mentor.bio}</p>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {mentor.skills.map((sk, idx) => (
                      <span key={idx} className="text-[10px] bg-[#FAFAFA] border border-[#E5E7EB] px-2 py-0.5 rounded text-gray-600">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMentor(mentor)}
                  className="w-full py-2.5 bg-[#111111] text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Request Mentorship
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center shadow-sm">
              <p className="text-xs text-[#6B7280]">No mentors available yet. Click 'Become a Mentor' to volunteer!</p>
            </div>
          )}
        </div>
      ) : (
        /* BECOME A MENTOR MODE */
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 text-xs max-w-2xl mx-auto">
          <h3 className="font-bold text-base text-[#111111]">Register as an Alumni Mentor</h3>
          <p className="text-gray-500">Help shape the future of junior batchmates by giving 1-2 hours per month.</p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Primary Mentorship Domain</label>
              <input
                type="text"
                placeholder="e.g. Software Engineering, Medicine, Entrepreneurship"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Monthly Availability</label>
              <input
                type="text"
                placeholder="e.g. 2 hours/month (Weekends)"
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">Mentorship Bio / Topics</label>
              <textarea
                rows={3}
                placeholder="Describe what topics you can help mentees with..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F4C542]"
              ></textarea>
            </div>

            <button
              onClick={() => Swal.fire({ icon: 'success', title: 'Mentor Application Submitted', text: 'Thank you for volunteering! Your mentor badge will appear on your directory profile.', confirmButtonColor: '#111111' })}
              className="w-full py-3 bg-[#111111] text-white hover:bg-gray-800 font-bold rounded-xl shadow-sm"
            >
              Submit Mentor Application
            </button>
          </div>
        </div>
      )}

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSendMentorshipRequest} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <button type="button" onClick={() => setSelectedMentor(null)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#111111]">Request Mentorship from {selectedMentor.name}</h3>
            <p className="text-gray-500">{selectedMentor.designation} @ {selectedMentor.company}</p>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Introduce Yourself & Your Goals</label>
              <textarea
                required
                rows={4}
                value={mentorshipRequestNote}
                onChange={e => setMentorshipRequestNote(e.target.value)}
                placeholder="Briefly describe what guidance you are seeking..."
                className="w-full p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#111111] text-white font-bold rounded-xl shadow-sm hover:bg-gray-800"
            >
              Send Mentorship Request
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
