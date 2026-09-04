import React, { useEffect, useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  ShieldCheck,
  X,
  ExternalLink,
  ArrowRight,
  Image as ImageIcon,
  BookOpen,
  Award,
  Sparkles,
  Users,
  Trophy,
  Target,
  Compass,
  Laptop,
  Library,
  HeartHandshake
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CurrentStaffSection } from './components/CurrentStaffSection';
import { OldStaffsSection } from './components/OldStaffsSection';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';

interface PublicSchoolProfile {
  name: string;
  code: string;
  established_year: number;
  total_alumni: number;
  active_batches: number;
  upcoming_events: number;
  cover_url: string;
  logo_url: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}

interface GalleryPhotoItem {
  id: string;
  title: string;
  src: string;
  category: string;
}

export const PublicSchool: React.FC = () => {
  const { t, language, logoUrl } = useLanguage();
  const navigate = useNavigate();

  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhotoItem | null>(null);
  const realCampusBanner = getAssetUrl('/school-images/banner.png');
  const [profile, setProfile] = useState<PublicSchoolProfile>({
    name: '',
    code: '',
    established_year: 1966,
    total_alumni: 0,
    active_batches: 0,
    upcoming_events: 0,
    cover_url: '',
    logo_url: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    // 1. Fetch Dynamic School Stats from Backend API
    api.getPublicStats()
      .then((s: any) => setProfile({
        name: s.school_name || (language === 'ta' ? 'நடராஜன் மேல்நிலைப் பள்ளி' : 'NHSS SCHOOL'),
        code: s.school_code || 'NHSS',
        established_year: s.established_year || s.est_year || 1965,
        total_alumni: s.total_alumni || 0,
        active_batches: s.total_batches || 0,
        upcoming_events: s.total_events || 0,
        cover_url: s.cover_url || '',
        logo_url: s.logo_url || '',
        description: s.description || (language === 'ta'
          ? 'பல தசாப்தங்களாக சிறந்த கல்வி, நல்லொழுக்கம் மற்றும் சமூகப் பொறுப்புள்ள மாணவர்களை உருவாக்கி வரும் வரலாற்றுப் பெருமைமிக்க பள்ளி.'
          : 'Empowering generations through quality education, holistic development, and strong alumni connections.'),
        address: s.address || 'Main Campus, School Alumni Building, Tamil Nadu',
        phone: s.contact_phone || s.phone || '+91 98765 43210',
        email: s.contact_email || s.email || 'info@nhssalumni.com'
      }))
      .catch(console.error);

    // 2. Fetch Real Campus Photos & Events from Database
    Promise.all([
      api.getPublicSchoolEvents().catch(() => []),
      api.getPublicMemories().catch(() => [])
    ]).then(([schoolEvents, memories]) => {
      const photos: GalleryPhotoItem[] = [];

      (schoolEvents || []).forEach((ev: any) => {
        if (ev.cover_image_url) {
          photos.push({
            id: `se-${ev.id}`,
            title: ev.title,
            src: getAssetUrl(ev.cover_image_url),
            category: ev.category?.replace('_', ' ') || 'School Event'
          });
        }
        (ev.gallery_urls || []).forEach((gUrl: string, idx: number) => {
          photos.push({
            id: `se-${ev.id}-g-${idx}`,
            title: `${ev.title} Gallery`,
            src: getAssetUrl(gUrl),
            category: ev.category?.replace('_', ' ') || 'School Event'
          });
        });
      });

      (memories || []).forEach((mem: any) => {
        if (mem.cover_image_url || mem.image_url) {
          photos.push({
            id: `mem-${mem.id}`,
            title: mem.title,
            src: getAssetUrl(mem.cover_image_url || mem.image_url),
            category: mem.album_name || 'Campus Heritage'
          });
        }
      });

      setGalleryPhotos(photos);
    }).finally(() => setLoadingGallery(false));
  }, [language]);

  const schoolFeaturesTa = [
    {
      title: 'தகுதி வாய்ந்த ஆசிரியர்கள்',
      desc: 'அனுபவமிக்க, அர்ப்பணிப்புள்ள ஆசிரியர்களால் சிறந்த கல்வியும் தனிப்பட்ட வழிகாட்டுதலும் வழங்கப்படுகிறது.',
      icon: GraduationCap
    },
    {
      title: 'கணினி மையம் & டிஜிட்டல் வகுப்புகள்',
      desc: 'நவீன கணினி பயன்பாடு மற்றும் மின்னணுக் கற்றல் வகுப்புகள் மூலம் மாணவர்கள் திறம்பட பயில்கிறார்கள்.',
      icon: Laptop
    },
    {
      title: 'சிறந்த நூலக வசதி',
      desc: 'ஆயிரக்கணக்கான புத்தகங்கள், பொது அறிவு இதழ்கள் மற்றும் மின்னூல் சேகரிப்புகள் அடங்கிய நவீன நூலகம்.',
      icon: Library
    },
    {
      title: 'விளையாட்டுத் துறை',
      desc: 'மாணவர்களின் உடல்திறன் மற்றும் விளையாட்டுத் திறமைகளை ஊக்குவிக்கும் விளையாட்டரங்க வசதிகள்.',
      icon: Trophy
    },
    {
      title: 'அறிவியல் ஆய்வகங்கள்',
      desc: 'இயற்பியல், வேதியியல் மற்றும் உயிரியல் பாடங்களுக்கான நவீன செய்முறை ஆய்வகங்கள்.',
      icon: Target
    },
    {
      title: 'ஒழுக்கநெறி & நற்பண்பு பயிற்சி',
      desc: 'ஒழுக்கம், சமூகப் பொறுப்பு, தலைமைப் பண்பு மற்றும் பண்பாட்டு மதிப்புகளை மாணவர்களிடையே வளர்த்தல்.',
      icon: ShieldCheck
    }
  ];

  const schoolFeaturesEn = [
    {
      title: 'Qualified Faculty',
      desc: 'Dedicated and experienced educators providing individualized academic mentoring.',
      icon: GraduationCap
    },
    {
      title: 'Computer Lab & E-Learning',
      desc: 'Modern ICT center and digital smart classrooms for futuristic technology education.',
      icon: Laptop
    },
    {
      title: 'Comprehensive Library',
      desc: 'Vast repository of academic textbooks, journals, reference materials, and e-books.',
      icon: Library
    },
    {
      title: 'Sports & Athletics',
      desc: 'Spacious sports facilities fostering physical fitness, teamwork, and athletic excellence.',
      icon: Trophy
    },
    {
      title: 'Science Laboratories',
      desc: 'Well-equipped Physics, Chemistry, and Biology practical experimental labs.',
      icon: Target
    },
    {
      title: 'Values & Leadership Training',
      desc: 'Instilling moral ethics, social responsibility, discipline, and leadership character.',
      icon: ShieldCheck
    }
  ];

  const featuresList = language === 'ta' ? schoolFeaturesTa : schoolFeaturesEn;

  return (
    <div className="min-h-screen bg-white text-[#111111] animate-fadeIn font-sans">

      {/* 1. HERO — நமது பள்ளி */}
      <div className="relative h-72 sm:h-96 lg:h-[440px] overflow-hidden bg-gray-900">
        <img
          src={(profile.cover_url && profile.cover_url.trim() !== '') ? profile.cover_url : realCampusBanner}
          alt={profile.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = realCampusBanner;
          }}
          className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {/* Left: School Title & Logo */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <img
              src={logoUrl}
              alt={profile.name}
              className="h-14 sm:h-20 w-auto object-contain flex-shrink-0 drop-shadow-md"
            />
            <div className="space-y-1">

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-base text-gray-200 font-medium">
                {profile.address}
              </p>
            </div>
          </div>

          {/* Right Bottom: Established Year Badge */}
          <div className="flex sm:justify-end items-center">
            <span className="inline-flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-[#111111] bg-[#F4C542] px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl uppercase tracking-wider shadow-2xl border-2 border-white/80 transition-all transform hover:scale-105">
              <Calendar className="w-4 h-4 text-[#111111]" />
              <span>{t('established')} {profile.established_year}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">

        {/* 2. நமது பள்ளியைப் பற்றி (ABOUT OUR SCHOOL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-bold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-3 py-1 rounded-full uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#854D0E]" />
              <span>{language === 'ta' ? 'பள்ளியின் வரலாறு & பாரம்பரியம்' : 'School Legacy & Heritage'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] leading-tight">
              {language === 'ta'
                ? 'நமது பள்ளியைப் பற்றி'
                : 'About Our School'}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              <p className="font-semibold text-gray-900 border-l-4 border-[#F4C542] pl-3 py-1 bg-[#FAFAFA] rounded-r-xl">
                {language === 'ta'
                  ? '1924 ஆம் ஆண்டு இந்து நாடார் துவக்கப்பள்ளி தொடங்கப்பட்டது முதல் நடராஜன் மேல்நிலைப்பள்ளி வரை நூற்றாண்டு கண்டது நமது பள்ளி.'
                  : 'Founded in 1924 as Hindu Nadar Primary School and flourishing into Natarajan Higher Secondary School, our school has proudly celebrated its centenary (100 Years of Excellence).'}
              </p>
              <p>
                {language === 'ta'
                  ? 'பள்ளியில் பயின்ற மாணவர்கள் நல்லாசிரியர்களாகவும், IIT போன்ற உயர்கல்வி நிறுவனங்களில் பயின்று பேராசிரியர்களாகவும், விஞ்ஞானிகளாகவும், மருத்துவர்களாகவும், பொறியாளர்களாகவும், வழக்கறிஞர்களாகவும், நீதிபதிகளாகவும், சிறந்த விவசாயப் பெருமக்களாகவும் அனைத்துத் துறைகளிலும் உயர்ந்து உலகம் முழுக்கப் பெருமையுடன் சேவையாற்றி வருகின்றனர். அதற்கு முதன்மைக்காரணம் பள்ளியின் மேன்மைமிகு நிர்வாகிகளின் திறமையும்... சேவை உள்ளம் கொண்ட ஆசிரியர்களுமே ஆகும்.'
                  : 'Our alumni have achieved remarkable success across all walks of life — as noble teachers, professors at premier institutions like IITs, scientists, doctors, engineers, lawyers, judges, and progressive agricultural leaders/farmers, serving with honor around the globe. This legacy is owed to the visionary leadership of our management and the dedicated service of our teachers.'}
              </p>
              <div className="p-4 bg-[#FFF7D6]/60 border border-[#F4C542]/60 rounded-2xl space-y-2 text-[#854D0E] font-medium text-xs sm:text-sm">
                <p>
                  <strong>{language === 'ta' ? 'இலவச மதிய உணவு திட்டம் (23/07/1956):' : 'Historic Midday Meal Scheme (23/07/1956):'}</strong>{' '}
                  {language === 'ta'
                    ? '23/07/1956 ல் அன்றைய தமிழகத்தின் முதல்வர் கர்மவீரர் காமராஜர் அவர்களால் நமது பள்ளி குழந்தைகளுக்கு இலவச மதிய உணவு திட்டத்தை தொடங்கி வைத்து சிறப்பு பெற்றது நமது பள்ளி.'
                    : 'On July 23, 1956, our school earned historic honor when former Chief Minister Karma Veerar K. Kamarajar inaugurated the landmark Free Midday Meal Scheme for our school children.'}
                </p>
                <p>
                  <strong>{language === 'ta' ? 'பள்ளி கட்டிடம் திறப்பு விழா (12/06/1967):' : 'School Building Opening (12/06/1967):'}</strong>{' '}
                  {language === 'ta'
                    ? '12/06/1967 ல் நமது பள்ளி கட்டிடம் அன்றைய கல்வி அமைச்சர் மாண்புமிகு. ரா.நெடுஞ்செழியன் அவர்களால் திறந்து வைக்கப்பட்டு சிறப்பு பெற்றது.'
                    : 'On June 12, 1967, our main school building was officially inaugurated by the then Education Minister, Hon. V. R. Nedunchezhiyan.'}
                </p>
              </div>
              <p>
                {language === 'ta'
                  ? 'கல்வித்தரத்திலும், விளையாட்டுத்துறையிலும், ஒழுக்கத்திலும், சுற்றுப்புறச் சூழலிலும் தூத்துக்குடி கல்வி மாவட்டத்தில் முதன்மையானதாக இருந்தது நமது பள்ளி. இந்த பள்ளியில் பயின்றதால் நாங்கள் அறிவிலும், ஒழுக்கத்திலும், நற்பண்புகளிலும் இன்றளவும் சிறந்து விளங்குகிறோம்.'
                  : 'Recognized as the premier institution in Thoothukudi Educational District for academic standard, sports, discipline, and environmental care, our school instills wisdom, character, and values.'}
              </p>
              <p className="text-xs sm:text-sm bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-800 font-medium">
                {language === 'ta'
                  ? '1962 – 63 முதல் 2025 – 26 வரை 64 வருட மாணவ – மாணவியர்கள் நமது பள்ளியில் பத்தாம் வகுப்பும், 1992-93 முதல் 2025 – 26 வரை 34 வருட மாணவ – மாணவியர்கள் நமது பள்ளியில் பன்னிரண்டாம் வகுப்பும் முடித்து இன்று நல்ல நிலையில் நமது பள்ளியை நினைவில் நிறுத்தி வாழ்கின்றனர்.'
                  : 'Across 64 years of 10th Standard batches (1962-63 to 2025-26) and 34 years of 12th Standard batches (1992-93 to 2025-26), thousands of alumni have graduated, pursued higher achievements, and continue to cherish our school with pride.'}
              </p>
            </div>
          </div>

          {/* Sticky Friendly Support & Contact Card */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-44 self-start transition-all relative">
            {/* Header Badge */}
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] shrink-0">
                <HeartHandshake className="w-5 h-5 text-[#854D0E]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
                  {language === 'ta' ? 'உதவி & தொடர்பு' : 'Friendly Support & Contact'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {language === 'ta' ? 'எப்போதும் உங்களுக்கு உதவ தயாராக உள்ளோம்' : 'We are here to help you anytime'}
                </p>
              </div>
            </div>

            {/* Friendly Welcome Note */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal bg-gray-50 border border-gray-200 p-4 rounded-2xl">
              {language === 'ta'
                ? 'ஏதேனும் கேள்விகள், சந்தேகங்கள் அல்லது பள்ளி பற்றிய தகவல்கள் தேவையா? கீழே உள்ள வாட்ஸ்அப் அல்லது மின்னஞ்சல் வழியாக எங்களை உடனே தொடர்பு கொள்ளலாம்!'
                : 'Have questions, need help, or want to connect with your school network? Send us a quick text or email — we will assist you right away!'}
            </p>

            {/* Contact Methods (Plain & Simple White Card Styling) */}
            <div className="space-y-3">
              {/* WhatsApp Support Button */}
              <a
                href={`https://wa.me/${(profile.phone || '918825905771').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  language === 'ta'
                    ? 'வணக்கம்! எனக்கு NHSS பள்ளி பற்றிய விவரங்கள் தேவை.'
                    : 'Hello! I need information regarding NHSS Alumni.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-emerald-50/60 text-[#111111] p-3.5 rounded-2xl shadow-2xs hover:border-emerald-500 transition-all flex items-center justify-between group cursor-pointer border border-gray-200"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
                      {language === 'ta' ? 'வாட்ஸ்அப் மெசேஜ் / அழைப்பு' : 'WhatsApp / Call Support'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#111111] truncate block">
                      {profile.phone || '+91 88259 05771'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transform group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </a>

              {/* Email Support Button */}
              <a
                href={`mailto:${profile.email || 'info@nhssalumni.com'}?subject=${encodeURIComponent(
                  language === 'ta' ? 'பள்ளித் தகவல் அறிய தொடர்பு' : 'Inquiry & Support Request'
                )}`}
                className="w-full bg-white hover:bg-amber-50/60 text-[#111111] p-3.5 rounded-2xl shadow-2xs hover:border-[#F4C542] transition-all flex items-center justify-between group cursor-pointer border border-gray-200"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#854D0E] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#854D0E]" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      {language === 'ta' ? 'மின்னஞ்சல் அனுப்ப' : 'Send an Email'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#111111] truncate block">
                      {profile.email || 'info@nhssalumni.com'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#854D0E] transform group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </a>
            </div>

            {/* School Location Box */}
            <div className="pt-1 border-t border-gray-100">
              <div className="flex items-start space-x-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200 text-xs text-gray-800">
                <MapPin className="w-4 h-4 text-[#854D0E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 block font-bold mb-0.5">
                    {language === 'ta' ? 'பள்ளி முகவரி' : 'School Location'}
                  </span>
                  <span className="font-semibold text-[#111111] leading-tight block">
                    {profile.address || 'NHSS பள்ளி கட்டிடம், காட்டு நாயக்கன்பட்டி, தூத்துக்குடி'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. நமதுநோக்கம் (OUR PURPOSE: கல்வி | ஒழுக்கம் | சம வாய்ப்பு) */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1 rounded-full uppercase tracking-wider">
              {language === 'ta' ? 'நமதுநோக்கம்' : 'Our Triad Purpose'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111]">
              {language === 'ta' ? 'கல்வி • ஒழுக்கம் • சம வாய்ப்பு' : 'Education • Discipline • Equal Opportunity'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: கல்வி */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xs hover:border-[#F4C542] hover:shadow-xl transition-all space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#111111]">
                {language === 'ta' ? 'கல்வி' : 'Quality Education'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {language === 'ta'
                  ? 'மாணவர்களுக்கு உயர்தரமான கல்வி, நவீன செய்முறை அறிவு மற்றும் சிந்தனைத் திறனை வளர்த்தல்.'
                  : 'Imparting holistic academic knowledge, practical scientific learning, and critical thinking skills.'}
              </p>
            </div>

            {/* Card 2: ஒழுக்கம் */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xs hover:border-[#F4C542] hover:shadow-xl transition-all space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#111111]">
                {language === 'ta' ? 'ஒழுக்கம்' : 'Character & Discipline'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {language === 'ta'
                  ? 'பண்பாடு, நேர்மை, தன்னம்பிக்கை மற்றும் நற்பண்புகளுடன் கூடிய சிறந்த மனிதர்களை உருவாக்குதல்.'
                  : 'Nurturing moral integrity, self-discipline, responsibility, and cultural values.'}
              </p>
            </div>

            {/* Card 3: சம வாய்ப்பு */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xs hover:border-[#F4C542] hover:shadow-xl transition-all space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#111111]">
                {language === 'ta' ? 'சம வாய்ப்பு' : 'Equal Opportunity'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {language === 'ta'
                  ? 'ஒவ்வொரு மாணவனுக்கும் ஏற்றத்தாழ்வின்றி கல்வியிலும் விளையாட்டிலும் சமமான வாய்ப்புகளை வழங்குதல்.'
                  : 'Ensuring equitable access to learning, extracurricular activities, and growth for every student.'}
              </p>
            </div>
          </div>
        </div>

        {/* 4. பள்ளியின் சிறப்புகள் (SCHOOL HIGHLIGHTS) */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111]">
              {language === 'ta' ? 'சிறந்த கற்றல் கட்டமைப்பு வசதிகள்' : 'Modern Academic Infrastructure'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feat, i) => {
              const FeatIcon = feat.icon;
              return (
                <div key={i} className="bg-[#FAFAFA] border border-gray-200 rounded-3xl p-6 space-y-3 hover:border-[#F4C542] transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4C542] flex items-center justify-center text-[#854D0E]">
                    <FeatIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-[#111111]">{feat.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. நமதுசாதனைகள் (OUR ACHIEVEMENTS) */}
        <div className="bg-[#111111] text-white border-2 border-[#F4C542] rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F4C542]">
              {language === 'ta' ? 'கல்வியிலும் விளையாட்டிலும் சாதனைப் பயணம்' : 'Milestones & Achievements'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-gray-800 text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#F4C542]">100%</div>
              <div className="text-xs font-bold text-gray-300 uppercase">{language === 'ta' ? 'பொதுத்தேர்வு தேர்ச்சி' : 'Board Exam Pass Rate'}</div>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-gray-800 text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">50+</div>
              <div className="text-xs font-bold text-gray-300 uppercase">{language === 'ta' ? 'மாநில மற்றும் மாவட்ட தரவரிசைகள்' : 'State & District Rank Holders'}</div>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-gray-800 text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#F4C542]">25+</div>
              <div className="text-xs font-bold text-gray-300 uppercase">{language === 'ta' ? 'விளையாட்டு கோப்பைகள்' : 'Sports Trophies Won'}</div>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-gray-800 text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">10,000+</div>
              <div className="text-xs font-bold text-gray-300 uppercase">{language === 'ta' ? 'பயின்ற மாணவர்கள்' : 'Graduated Students'}</div>
            </div>
          </div>
        </div>

        {/* 6. நமதுவளாகம் (PHOTO GALLERY) */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>

              <h3 className="text-xl sm:text-3xl font-extrabold text-[#111111] mt-2">
                {language === 'ta' ? 'பள்ளி வளாகம் மற்றும் வரலாற்றுத் தருணங்கள்' : 'Glimpses of Our Campus & Traditions'}
              </h3>
            </div>
          </div>

          {loadingGallery ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm">
              Loading Campus Gallery...
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto space-y-2 p-6">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="font-bold text-sm text-[#111111]">
                {language === 'ta' ? 'புகைப்படங்கள் எதுவும் பதிவேற்றப்படவில்லை' : 'No Campus Photos Added Yet'}
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {galleryPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl hover:border-[#F4C542] transition-all bg-white cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="h-44 overflow-hidden bg-gray-100 relative">
                    <img src={photo.src} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 bg-white">
                    <span className="text-[10px] font-bold text-[#854D0E] uppercase">{photo.category}</span>
                    <h4 className="font-bold text-xs text-[#111111] mt-0.5 line-clamp-1">{photo.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. மாணவர் முன்னேற்றம் (STUDENT PROGRESS & CAREER SUPPORT) */}
        <div className="bg-[#FFF7D6]/40 border-2 border-[#F4C542]/60 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="space-y-2">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111]">
              {language === 'ta' ? 'உயர்கல்வி மற்றும் எதிர்கால வளர்ச்சி வழிகாட்டுதல்' : 'Higher Education & Career Counseling'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700 font-normal">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-base text-[#111111]">{language === 'ta' ? 'கல்வி வழிகாட்டுதல்' : 'Academic Mentorship'}</h4>
              <p>{language === 'ta' ? 'மாணவர்களின் உயர்கல்வி தேர்வு, நுழைவுத் தேர்வுகள் மற்றும் பாடநெறி தேர்வுகளுக்கான வழிகாட்டுதல்கள்.' : 'Empowering students to choose higher education streams and competitive exams.'}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-base text-[#111111]">{language === 'ta' ? 'உதவித்தொகைகள்' : 'Scholarships & Aid'}</h4>
              <p>{language === 'ta' ? 'திறமையுள்ள மற்றும் வசதியற்ற மாணவர்களுக்கு கல்வி உதவித்தொகைகள் வழங்குதல்.' : 'Providing scholarships and academic supplies for deserving students.'}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-base text-[#111111]">{language === 'ta' ? 'திறன் பயிற்சி' : 'Skill Workshops'}</h4>
              <p>{language === 'ta' ? 'பேச்சுத்திறன், கணினி அறிவியல் மற்றும் தலைமைப் பண்பு சார்ந்த சிறப்புப் பட்டறைகள்.' : 'Conducting workshops on communication, technology, and leadership.'}</p>
            </div>
          </div>
        </div>

        {/* 8. முன்னாள் மாணவர் இணைப்பு (ALUMNI SYNERGY) */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAFAFA] border-2 border-[#111111] rounded-3xl p-8 sm:p-12 shadow-[8px_8px_0px_0px_#111111]">
          <div className="lg:col-span-8 space-y-4">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111]">
              {language === 'ta' ? 'பள்ளி மற்றும் முன்னாள் மாணவர்களின் இணக்கமான சங்கமம்' : 'Bridging Alumni Legacy with Future Generations'}
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              {language === 'ta'
                ? 'பள்ளியின் வளர்ச்சிக்கும், தற்போதைய மாணவர்களின் எதிர்காலத்திற்கும் முன்னாள் மாணவர்கள் ஒன்றிணைந்து பங்காற்றுகின்றனர்.'
                : 'Alumni globally contribute their experience, resources, and mentorship to support school infrastructure and student success.'}
            </p>
          </div>
          <div className="lg:col-span-4 text-center lg:text-right">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer border-2 border-[#F4C542] inline-flex items-center space-x-2"
            >
              <span>{language === 'ta' ? 'சங்கத்தில் இணையுங்கள்' : 'Join Alumni Network'}</span>
              <ArrowRight className="w-4 h-4 text-[#F4C542]" />
            </button>
          </div>
        </div> */}

        {/* 9. CURRENT SCHOOL STAFF & MANAGEMENT */}
        <CurrentStaffSection />

        {/* 10. HONOURED FORMER STAFF & LEGENDARY TEACHERS */}
        <OldStaffsSection />

        {/* 11. CTA — "நமது பள்ளியுடன் இணைந்திருங்கள்" */}
        <div className="bg-[#111111] text-white border-2 border-[#F4C542] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4C542] leading-tight">
            {language === 'ta' ? 'நமது பள்ளியுடன் இணைந்திருங்கள்' : 'Stay Connected with Our School'}
          </h2>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal">
            {language === 'ta'
              ? 'பள்ளி செய்திகள், நிகழ்வுகள், நினைவுகள் மற்றும் முன்னாள் மாணவர் சந்திப்புகளில் பங்கெடுக்க இப்போதே இணையுங்கள்.'
              : 'Stay informed on school events, alumni reunions, student achievements, and heritage updates.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F4C542] hover:bg-[#e0b236] text-[#111111] font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
            >
              <span>{language === 'ta' ? 'இப்போதே பதிவு செய்யுங்கள்' : 'Register Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-[#F4C542] text-[#F4C542] hover:bg-[#F4C542]/10 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
            >
              <span>{language === 'ta' ? 'உள்நுழைக' : 'Log In'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Lightbox Popup Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border-2 border-[#F4C542]/60">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview */}
            <div className="max-h-[60vh] bg-black overflow-hidden flex items-center justify-center">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-white space-y-4">
              <div>
                <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4C542]">
                  {selectedPhoto.category}
                </span>
                <h3 className="text-xl font-bold text-[#111111] mt-2">{selectedPhoto.title}</h3>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  {language === 'ta' ? 'மேலும் புகைப்படங்கள் மற்றும் நிகழ்வுகளுக்கு உள்நுழைக' : 'Log in to access full school photo gallery'}
                </p>
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    navigate('/login');
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer"
                >
                  <span>{language === 'ta' ? 'உள்நுழைக' : 'Log In'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
