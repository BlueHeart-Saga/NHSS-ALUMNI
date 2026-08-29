import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface SchoolNewsProps {
  announcements: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
}

export const SchoolNews: React.FC<SchoolNewsProps> = ({ announcements, onSelectNews }) => {
  return (
    <section id="school-news" className="py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          {/* <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] border-2 border-[#F4C542] px-5 py-2 rounded-full uppercase tracking-wider">
            FROM OUR SCHOOL
          </span> */}
          <h2 className="text-4xl sm:text-5xl font-semibold text-[#111111] tracking-tight pt-2">
            School News &amp; Official Updates
          </h2>
          {/* <p className="text-lg text-gray-600 font-normal mt-2">
            Keep up with official campus announcements, achievements, and notices
          </p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Bottom-to-Top Glass Fill Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/90 via-[#FFF7D6]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

              <div className="relative z-10 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center space-x-2 text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] px-3.5 py-1.5 rounded-full w-fit mb-4 border border-[#F4C542]/60">
                    <Calendar className="w-4 h-4 text-[#854D0E]" />
                    <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-base text-gray-600 font-normal mt-2.5 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 mt-5 flex items-center justify-between">
                  <button
                    onClick={() => onSelectNews(item)}
                    className="text-base font-semibold text-[#111111] group-hover:text-[#854D0E] flex items-center space-x-2 hover:underline"
                  >
                    <span>Read Full Notice</span>
                    <ArrowRight className="w-5 h-5 text-[#F4C542]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
