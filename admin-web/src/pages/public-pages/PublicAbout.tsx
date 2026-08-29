import React, { useEffect, useState } from 'react';
import { GraduationCap, Award, Users, Heart, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export const PublicAbout: React.FC = () => {
  const [stats, setStats] = useState<any>({
    school_name: 'Our School',
    total_alumni: 0,
    total_batches: 0,
    years_connected: 0
  });

  useEffect(() => {
    api.getPublicStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] border-2 border-[#F4C542] px-5 py-2 rounded-full uppercase tracking-wider">
            ABOUT OUR ASSOCIATION
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] tracking-tight">
            Connecting Generations of Excellence
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed">
            The official alumni association of <strong className="text-[#111111] font-semibold">{stats.school_name}</strong> brings together students, educators, and leaders across passing cohorts.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">
        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center space-x-2 text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] px-4 py-1.5 rounded-full border border-[#F4C542]">
              <Sparkles className="w-5 h-5 text-[#F4C542]" />
              <span>OUR LEGACY &amp; MISSION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] leading-tight">
              Fostering Lifelong Connections &amp; Mutual Growth
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              Established with a vision to preserve the cherished memories of campus life, our alumni network provides a platform for mentorship, professional collaboration, and celebratory reunions.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3.5 text-base sm:text-lg font-semibold text-[#111111]">
                <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Verified Alumni Roster ensuring authentic school community engagement</span>
              </div>
              <div className="flex items-start space-x-3.5 text-base sm:text-lg font-semibold text-[#111111]">
                <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Annual get-togethers, batch Silver &amp; Golden Jubilees, and reunions</span>
              </div>
              <div className="flex items-start space-x-3.5 text-base sm:text-lg font-semibold text-[#111111]">
                <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Mentorship for current school students and career guidance</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#FFF7D6] rounded-full blur-3xl -z-10"></div>
            
            <h3 className="text-3xl font-semibold text-[#111111]">Association Milestones</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 border border-[#E5E7EB] rounded-2xl">
                <div className="text-4xl font-semibold text-[#111111]">{stats.total_alumni}+</div>
                <div className="text-sm font-semibold text-gray-500 mt-2">Verified Alumni</div>
              </div>
              <div className="p-6 bg-gray-50 border border-[#E5E7EB] rounded-2xl">
                <div className="text-4xl font-semibold text-[#111111]">{stats.total_batches}+</div>
                <div className="text-sm font-semibold text-gray-500 mt-2">Batch Cohorts</div>
              </div>
              <div className="p-6 bg-gray-50 border border-[#E5E7EB] rounded-2xl">
                <div className="text-4xl font-semibold text-[#111111]">{stats.years_connected}+</div>
                <div className="text-sm font-semibold text-gray-500 mt-2">Years Connected</div>
              </div>
              <div className="p-6 bg-gray-50 border border-[#E5E7EB] rounded-2xl">
                <div className="text-4xl font-semibold text-[#111111]">100%</div>
                <div className="text-sm font-semibold text-gray-500 mt-2">School Pride</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-white border-2 border-[#F4C542] rounded-3xl p-12 text-center space-y-7 shadow-xl">
          <h3 className="text-3xl sm:text-4xl font-semibold text-[#111111]">Are you a graduate of {stats.school_name}?</h3>
          <p className="text-lg text-gray-600 font-normal max-w-2xl mx-auto">
            Join your passing batch cohort today. Verify your admission details and start connecting.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/login"
              className="px-10 py-4.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-lg rounded-2xl shadow-md border border-[#E0B030] inline-flex items-center space-x-3"
            >
              <span>Join Alumni Association</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
