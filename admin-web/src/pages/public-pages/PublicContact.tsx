import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const PublicContact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] border-2 border-[#F4C542] px-5 py-2 rounded-full uppercase tracking-wider">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] tracking-tight">
            Contact School Alumni Office
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-normal max-w-2xl mx-auto">
            Have questions about reunions, batch registration, or alumni verification? Reach out to our association desk.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Contact Details Column */}
          <div className="space-y-8 bg-gray-50/90 border-2 border-[#E5E7EB] rounded-3xl p-8 shadow-md relative overflow-hidden group">
            {/* Bottom-to-Top Glass Fill Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/80 via-[#FFF7D6]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl font-semibold text-[#111111]">Alumni Secretariat Desk</h2>
              <p className="text-lg text-gray-600 font-normal leading-relaxed">
                Our alumni relationship officers are available Monday to Saturday to assist graduates with batch verification, get-together organizing, and credential updates.
              </p>

              <div className="space-y-6 text-base text-[#111111]">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin className="w-6 h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Campus Location</strong>
                    <span className="font-semibold text-lg">Main Campus, School Alumni Building, Chennai, Tamil Nadu</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Phone className="w-6 h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Helpline</strong>
                    <span className="font-semibold text-lg">+91 9876543210</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#854D0E] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Mail className="w-6 h-6 text-[#854D0E]" />
                  </div>
                  <div>
                    <strong className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Official Email</strong>
                    <span className="font-semibold text-lg">alumni@justgathernow.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-8 shadow-xl space-y-6">
            <h2 className="text-3xl font-semibold text-[#111111]">Send an Inquiry Message</h2>

            {submitted ? (
              <div className="p-8 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-semibold text-[#111111]">Inquiry Received!</h3>
                <p className="text-base text-[#854D0E] font-normal">
                  Thank you <strong>{name}</strong>. Our school alumni desk will get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 bg-[#111111] text-white font-semibold text-sm rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. S. Ramanathan"
                    required
                    className="w-full px-5 py-3.5 bg-white border-2 border-[#E5E7EB] rounded-xl text-base font-semibold focus:outline-none focus:border-[#F4C542] shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wider">Mobile Number *</label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+919876543210"
                      required
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#E5E7EB] rounded-xl text-base font-semibold focus:outline-none focus:border-[#F4C542] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wider">Passing Year</label>
                    <input
                      type="number"
                      value={passingYear}
                      onChange={(e) => setPassingYear(e.target.value)}
                      placeholder="2010"
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#E5E7EB] rounded-xl text-base font-semibold focus:outline-none focus:border-[#F4C542] shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alumnus@example.com"
                    required
                    className="w-full px-5 py-3.5 bg-white border-2 border-[#E5E7EB] rounded-xl text-base font-semibold focus:outline-none focus:border-[#F4C542] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wider">Message / Inquiry *</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your inquiry details..."
                    required
                    className="w-full px-5 py-3.5 bg-white border-2 border-[#E5E7EB] rounded-xl text-base font-normal focus:outline-none focus:border-[#F4C542] shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-base rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0B030]"
                >
                  <Send className="w-5 h-5 text-[#111111]" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
