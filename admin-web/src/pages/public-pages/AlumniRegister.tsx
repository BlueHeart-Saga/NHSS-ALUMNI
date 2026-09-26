import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, Mail, Phone, User, GraduationCap, Building2, MapPin,
  KeyRound, ArrowRight, CheckCircle2, Lock, Camera, Globe, Briefcase,
  BookOpen, ArrowLeft, Upload, Check, Eye, EyeOff, Info, FileText, CheckSquare, ChevronDown, RotateCw,
  PlayCircle, ExternalLink, Pencil, AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Button } from '../../components/Button';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { DemoVideoModal, VideoType } from '../../components/DemoVideoModal';


interface CountryOption {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const defaultCountryList: CountryOption[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: '🇲🇻' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230', flag: '🇲🇺' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱' }
];

// ============================================================================
// DEMO LINK CONFIGURATION
// Change this to your actual demo URL (YouTube, Loom, hosted demo, etc.)
// Better: put it in .env as VITE_DEMO_LINK and it will pick that up instead.
// ============================================================================
const DEMO_LINK_URL =
  (import.meta.env.VITE_DEMO_LINK as string | undefined) ||
  'https://your-demo-link-here.com';

export const AlumniRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoVideoType, setDemoVideoType] = useState<VideoType>('REGISTRATION');

  const [maxStepReached, setMaxStepReached] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Dynamic Country Code & Search List State (Defaults to India)
  const [countries, setCountries] = useState<CountryOption[]>(defaultCountryList);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    fetch('https://countries.dev/countries?fields=name,alpha2Code,flag&sort=name')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const fetched: CountryOption[] = data.map((c: any) => {
            const match = defaultCountryList.find(
              (d) => d.code === c.alpha2Code || d.name.toLowerCase() === c.name?.toLowerCase()
            );
            return {
              name: c.name,
              code: c.alpha2Code,
              dialCode: match ? match.dialCode : '+1',
              flag: c.flag || match?.flag || '🏳️'
            };
          });

          // Ensure India is at the top of the dropdown options
          const inIdx = fetched.findIndex((c) => c.code === 'IN' || c.name === 'India');
          if (inIdx > -1) {
            const [india] = fetched.splice(inIdx, 1);
            fetched.unshift(india);
          }
          setCountries(fetched);
        }
      })
      .catch(() => {
        // Safe fallback to defaultCountryList
      });
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Step 1 — Email & Verification State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Helper to change step and track max step unlocked for backward & forward navigation
  const goToStep = (targetStep: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!isOtpVerified && targetStep > 1) {
      alertService.showWarning(
        language === 'ta' ? 'கணக்கு சரிபார்ப்பு அவசியம்' : 'Account Verification Required',
        language === 'ta'
          ? 'தொடர்வதற்கு முன் படி 1-இல் OTP மூலம் கணக்கைச் சரிபார்க்க வேண்டும்.'
          : 'Please verify your phone/email via OTP in Step 1 before proceeding to other steps.'
      );
      setStep(1);
      return;
    }
    if (targetStep === 1 && isOtpVerified) {
      alertService.showInfo(
        language === 'ta' ? 'சரிபார்க்கப்பட்டது & பூட்டப்பட்டது' : 'Verified & Locked',
        language === 'ta'
          ? 'உங்கள் கணக்கு சரிபார்ப்பு முடிந்தது. படி 1 மீண்டும் செல்ல முடியாது.'
          : 'Your account verification is complete. Step 1 is locked.'
      );
      return;
    }
    setStep(targetStep);
    setMaxStepReached((prev) => Math.max(prev, targetStep));
  };

  useEffect(() => {
    if (isOtpVerified && step === 1) {
      setStep(2);
    } else if (!isOtpVerified && step > 1) {
      setStep(1);
    }
  }, [isOtpVerified, step]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendOTP = async () => {
    const cleanMob = mobile.replace(/\D/g, '');
    const activeTarget = cleanMob.length >= 10 ? cleanMob : email;
    if (!activeTarget || !activeTarget.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await api.sendOTP(activeTarget);
      setResendCountdown(30);
      alertService.showInfo(
        language === 'ta' ? 'OTP மீண்டும் அனுப்பப்பட்டது' : 'OTP Resent Successfully',
        language === 'ta'
          ? `6-இலக்க OTP குறியீடு SMS மூலம் ${activeTarget} எண்ணிற்கு மீண்டும் அனுப்பப்பட்டுள்ளது.`
          : `A new 6-digit OTP verification code has been dispatched via SMS to ${activeTarget}.`
      );
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to resend verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Personal Information
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Tamil Nadu');
  const [address, setAddress] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [mobilePrefix, setMobilePrefix] = useState('+91');
  const [mobile, setMobile] = useState('');

  // Step 3 — School Details
  const [schoolName, setSchoolName] = useState('NHS School');
  const [joiningYear, setJoiningYear] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [leavingClass, setLeavingClass] = useState('10th');

  // Step 4 — Higher Education Details
  const [hasHigherEducation, setHasHigherEducation] = useState<'YES' | 'NO' | ''>('');
  const [noHigherEducation, setNoHigherEducation] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [otherDegree, setOtherDegree] = useState('');
  const [stream, setStream] = useState('');
  const [collegeJoiningYear, setCollegeJoiningYear] = useState('');
  const [collegePassingYear, setCollegePassingYear] = useState('');

  // Step 5 — Current Professional Details & Social Links
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [totalExperience, setTotalExperience] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isVolunteer, setIsVolunteer] = useState('');       // NEW — 'YES' | 'NO' | ''
  const [willingToDonate, setWillingToDonate] = useState(''); // NEW — 'YES' | 'NO' | ''

  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYearNum - 1959 }, (_, i) => currentYearNum - i);
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const leavingClassOptions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
  const degreeOptions = [
    "B.E.", "B.Tech.", "M.E.", "M.Tech.", "B.Sc.", "M.Sc.", "BCA", "MCA",
    "BBA", "MBA", "B.Com.", "M.Com.", "BA", "MA", "Diploma", "Ph.D.", "Other - write something"
  ];
  const employmentStatusOptions = [
    "Employed", "Business / Self-Employed", "Seeking Opportunities", "Retired"
  ];

  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

  const markInvalidAndScroll = (missingList: { key: string; label: string }[]) => {
    const nextSet = new Set<string>();
    missingList.forEach(m => nextSet.add(m.key));
    setInvalidFields(nextSet);

    if (missingList.length > 0) {
      const firstKey = missingList[0].key;
      const el = document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { el.focus(); } catch (e) { }
      }

      const labels = missingList.map(m => m.label);
      alertService.showWarning(
        language === 'ta' ? 'தேவையான விவரங்கள் விடுபட்டுள்ளன' : 'Required Fields Missing',
        language === 'ta'
          ? `தொடர மஞ்சள் நிறத்தில் குறிக்கப்பட்ட புலங்களை நிரப்பவும்:\n• ${labels.join('\n• ')}`
          : `Please complete the following highlighted fields to continue:\n• ${labels.join('\n• ')}`
      );
    }
  };

  const clearInvalidField = (key: string) => {
    if (invalidFields.has(key)) {
      setInvalidFields(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const getHighlightCls = (key: string) => {
    return invalidFields.has(key)
      ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/80 rounded-xl p-2.5 transition-all shadow-xs"
      : "";
  };

  useEffect(() => {
    // Fetch School Name from backend public stats
    api.getPublicStats()
      .then(stats => {
        if (stats && stats.school_name) setSchoolName(stats.school_name);
      })
      .catch(() => { });

    const paramMobile = searchParams.get('mobile') || searchParams.get('phone') || searchParams.get('identifier') || location.state?.mobile;
    const paramEmail = searchParams.get('email') || location.state?.email;

    if (paramMobile) {
      const cleanMob = String(paramMobile).replace(/\D/g, '').slice(-10);
      if (cleanMob.length === 10) {
        setMobile(cleanMob);
      }
    }
    if (paramEmail) {
      setEmail(paramEmail);
    }

    if (location.state?.email) {
      if (location.state?.isGoogleAuth) {
        setIsGoogleAuth(true);
      }

      if (location.state?.mobile && !location.state?.skipOtpScreen) {
        setOtpSent(true);
        setShowEmailInput(true);
        setStep(1);
        setIsOtpVerified(false);
      } else {
        setOtpSent(false);
        setStep(1);
        setIsOtpVerified(false);
      }

      if (location.state?.isPasswordSetup) {
        setStep(1);
        setMaxStepReached(1);
        setIsOtpVerified(false);
      }
      if (location.state?.hasPassword) setHasExistingPassword(true);
      if (location.state?.fullName) setFullName(location.state.fullName);
      if (location.state?.profilePhotoUrl) setProfilePhotoUrl(location.state.profilePhotoUrl);
    }

    if (api.getToken()) {
      api.getProfile()
        .then((p: any) => {
          if (p) {
            if (p.email) setEmail(p.email);
            if (p.mobile) {
              setMobile(String(p.mobile).replace(/^\+91\s?/, ''));
              setIsOtpVerified(true);
              setOtpSent(true);
              setShowEmailInput(true);
            } else {
              setOtpSent(false);
            }
            if (p.full_name || p.name) setFullName(p.full_name || p.name);
            if (p.profile_photo_url) setProfilePhotoUrl(p.profile_photo_url);
            if (p.mobile) setMobile(String(p.mobile).replace(/^\+91\s?/, ''));
            if (p.address) setAddress(p.address);
            if (p.current_city || p.city) setCurrentCity(p.current_city || p.city);
            if (p.state) setState(p.state);
            if (p.country) setCountry(p.country);
            if (p.country_code) setMobilePrefix(p.country_code);
            if (p.gender) setGender(p.gender);
            if (p.dob) setDob(p.dob);
            if (p.blood_group) setBloodGroup(p.blood_group);
            if (p.father_name) setFatherName(p.father_name);
            if (p.mother_name) setMotherName(p.mother_name);
            if (p.school_name) setSchoolName(p.school_name);
            if (p.joining_year) setJoiningYear(String(p.joining_year));
            if (p.passing_year) setPassingYear(String(p.passing_year));
            if (p.leaving_class) setLeavingClass(p.leaving_class);

            const isNoCollege = p.no_higher_education === true || String(p.no_higher_education).toUpperCase() === 'YES' || String(p.no_higher_education).toLowerCase() === 'true';
            setNoHigherEducation(Boolean(isNoCollege));
            if (p.college_name || p.other_college) setCollegeName(p.college_name || p.other_college);
            if (p.degree) setDegree(p.degree);
            if (p.other_degree) setOtherDegree(p.other_degree);
            if (p.stream || p.other_stream) setStream(p.stream || p.other_stream);
            if (p.college_joining_year) setCollegeJoiningYear(String(p.college_joining_year));
            if (p.college_passing_year) setCollegePassingYear(String(p.college_passing_year));

            if (p.employment_status) setEmploymentStatus(p.employment_status);
            if (p.company) setCompany(p.company);
            if (p.position || p.profession) setPosition(p.position || p.profession);
            if (p.industry) setIndustry(p.industry);
            if (p.total_experience) setTotalExperience(String(p.total_experience));
            if (p.linkedin_url) setLinkedinUrl(p.linkedin_url);
            if (p.instagram_url) setInstagramUrl(p.instagram_url);
            if (p.whatsapp_number) setWhatsappNumber(p.whatsapp_number);
            if (p.is_volunteer) setIsVolunteer(p.is_volunteer);
            if (p.willing_to_donate) setWillingToDonate(p.willing_to_donate);

            // Evaluate exact pending registration step based on filled fields
            const hasPersonal = Boolean(
              (p.full_name || p.name) && (p.mobile || p.email) &&
              p.gender && p.dob && p.address && (p.current_city || p.city)
            );
            const hasSchool = Boolean(
              p.school_name && p.joining_year && p.passing_year && p.leaving_class
            );
            const noCollege = isNoCollege;
            const hasCollege = Boolean(
              (p.college_name || p.other_college) &&
              (p.degree || p.other_degree) &&
              (p.stream || p.other_stream)
            );
            const hasEducation = noCollege || hasCollege;
            const hasVolunteerDonation = Boolean(p.is_volunteer && p.willing_to_donate);

            let pendingStep: 1 | 2 | 3 | 4 | 5 | 6 = 2;
            if (!hasPersonal) pendingStep = 2;
            else if (!hasSchool) pendingStep = 3;
            else if (!hasEducation) pendingStep = 4;
            else if (!hasVolunteerDonation) pendingStep = 5;
            else pendingStep = 6;

            // If all required profile fields are present, auto-redirect directly to the Alumni Portal
            if (pendingStep === 6 && (p.full_name || p.name) && (p.passing_year || p.mobile)) {
              navigate('/alumni', { replace: true });
              return;
            }

            const stepToUse = location.state?.resumeStep || pendingStep;
            setStep(stepToUse as any);
            setMaxStepReached(6);
          }
        })
        .catch(() => { });
    }

    // Restore local draft fallback
    const savedDraft = localStorage.getItem('alumni_register_draft');
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        if (d.fullName) setFullName(d.fullName);
        if (d.email && !email) setEmail(d.email);
        if (d.mobile) setMobile(d.mobile);
        if (d.gender) setGender(d.gender);
        if (d.dob) setDob(d.dob);
        if (d.bloodGroup) setBloodGroup(d.bloodGroup);
        if (d.fatherName) setFatherName(d.fatherName);
        if (d.motherName) setMotherName(d.motherName);
        if (d.country) setCountry(d.country);
        if (d.state) setState(d.state);
        if (d.address) setAddress(d.address);
        if (d.currentCity) setCurrentCity(d.currentCity);
        if (d.schoolName) setSchoolName(d.schoolName);
        if (d.joiningYear) setJoiningYear(String(d.joiningYear));
        if (d.passingYear) setPassingYear(String(d.passingYear));
        if (d.leavingClass) setLeavingClass(d.leavingClass);
        if (d.noHigherEducation !== undefined) setNoHigherEducation(d.noHigherEducation);
        if (d.collegeName) setCollegeName(d.collegeName);
        if (d.degree) setDegree(d.degree);
        if (d.otherDegree) setOtherDegree(d.otherDegree);
        if (d.stream) setStream(d.stream);
        if (d.collegeJoiningYear) setCollegeJoiningYear(String(d.collegeJoiningYear));
        if (d.collegePassingYear) setCollegePassingYear(String(d.collegePassingYear));
        if (d.employmentStatus) setEmploymentStatus(d.employmentStatus);
        if (d.company) setCompany(d.company);
        if (d.position) setPosition(d.position);
        if (d.industry) setIndustry(d.industry);
        if (d.totalExperience) setTotalExperience(String(d.totalExperience));
        if (d.linkedinUrl) setLinkedinUrl(d.linkedinUrl);
        if (d.instagramUrl) setInstagramUrl(d.instagramUrl);
        if (d.whatsappNumber) setWhatsappNumber(d.whatsappNumber);
        if (d.isVolunteer) setIsVolunteer(d.isVolunteer);
        if (d.willingToDonate) setWillingToDonate(d.willingToDonate);
      } catch (e) { }
    }
  }, [location.state]);

  // Photo File Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1: Send OTP for Mobile SMS Signup
  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccountAlreadyExists(false);

    const cleanMob = mobile.replace(/\D/g, '');
    if (!cleanMob || cleanMob.length !== 10 || !['6', '7', '8', '9'].includes(cleanMob[0])) {
      alertService.showWarning(
        language === 'ta' ? 'செல்லுபடியாகும் கைபேசி எண் தேவை' : 'Valid Mobile Number Required',
        language === 'ta'
          ? 'தயவுசெய்து 6, 7, 8 அல்லது 9 இல் தொடங்கும் 10-இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
      );
      return;
    }
    setLoading(true);
    try {
      await api.sendOTP(cleanMob, undefined, false, undefined, false, true);
      setOtpSent(true);
    } catch (err: any) {
      if (err.message && (err.message.includes('ACCOUNT_ALREADY_REGISTERED') || err.message.toLowerCase().includes('already registered'))) {
        setAccountAlreadyExists(true);
      } else {
        alertService.handleApiError(err, 'Failed to send verification OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify OTP and transition to Create Password screen or Step 2
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 6) {
      alertService.showWarning(
        language === 'ta' ? 'சரிபார்ப்புக் குறியீடு தேவை' : 'Verification Code Required',
        language === 'ta'
          ? 'உங்கள் கைபேசிக்கு அனுப்பப்பட்ட 6-இலக்க குறியீட்டை உள்ளிடவும்.'
          : 'Please enter the complete 6-digit security code sent to your mobile phone.'
      );
      return;
    }
    setLoading(true);
    try {
      const cleanMob = mobile.replace(/\D/g, '');
      const activeId = cleanMob.length >= 10 ? cleanMob : email;
      const res = await api.verifyOTP(activeId, otp);
      setIsOtpVerified(true);
      
      const hasPassword = hasExistingPassword || isGoogleAuth || Boolean(res.resume_step && res.resume_step >= 3);
      if (hasPassword) {
        setHasExistingPassword(true);
      }

      if (!location.state?.isPasswordSetup && hasPassword) {
        const targetStep = res.resume_step && res.resume_step >= 3 ? Math.min(res.resume_step - 1, 6) : 2;
        goToStep(Math.max(2, targetStep) as any);
      }
    } catch (err: any) {
      alertService.handleApiError(err, 'Invalid verification code entered.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Save Password and advance to Step 2 or return to login
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.trim().length < 6) {
      alertService.showWarning(
        language === 'ta' ? 'கடவுச்சொல் தேவை' : 'Password Required',
        language === 'ta' ? 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.' : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      alertService.showWarning(
        language === 'ta' ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Password Mismatch',
        language === 'ta' ? 'உள்ளிடப்பட்ட இரண்டு கடவுச்சொற்களும் ஒரே மாதிரியாக இல்லை.' : 'Passwords do not match. Please re-type your password.'
      );
      return;
    }

    setLoading(true);
    try {
      const cleanMob = mobile.replace(/\D/g, '');
      const activeId = cleanMob.length >= 10 ? cleanMob : email;
      if (api.getToken()) {
        await api.updatePassword(password.trim());
      } else if (otp) {
        await api.setPasswordWithOTP(activeId, otp, password.trim());
      } else {
        await api.updatePassword(password.trim());
      }
      setHasExistingPassword(true);
      alertService.showSuccess(
        language === 'ta' ? 'கடவுச்சொல் உருவாக்கப்பட்டது! 🔐' : 'Password Created Successfully! 🔐',
        language === 'ta'
          ? 'உங்கள் கணக்கு கடவுச்சொல் பாதுகாப்பாகச் சேமிக்கப்பட்டது. இப்போது நீங்கள் உள்நுழையலாம்.'
          : 'Your account password has been saved securely in database! You can now log in.'
      );
      if (location.state?.isPasswordSetup) {
        navigate('/login', { state: { mobile: cleanMob, email } });
      } else {
        goToStep(2);
      }
    } catch (err: any) {
      alertService.handleApiError(err, 'Failed to save account password.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate step data persistence helper
  const saveStepDataToDB = async (partialData: any) => {
    try {
      const currentDraft = {
        fullName, email, mobile, gender, dob, bloodGroup, fatherName, motherName,
        country, state, address, currentCity, schoolName, joiningYear, passingYear, leavingClass,
        noHigherEducation, collegeName, degree, otherDegree, stream, collegeJoiningYear, collegePassingYear,
        employmentStatus, company, position, industry, totalExperience, linkedinUrl, instagramUrl, whatsappNumber,
        isVolunteer, willingToDonate,
        ...partialData
      };
      localStorage.setItem('alumni_register_draft', JSON.stringify(currentDraft));
    } catch (e) { }

    try {
      if (api.getToken()) {
        await api.register(partialData);
      }
    } catch (e) {
      console.warn('Step registration draft database sync notice:', e);
    }
  };

  const getFullMobile = () => {
    const raw = mobile.trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return raw.replace(/\s+/g, '');
    const cleanDigits = raw.replace(/\D/g, '');
    const prefix = (mobilePrefix || '+91').trim().replace(/\s+/g, '');
    return `${prefix}${cleanDigits}`;
  };

  // Step 2 Validation: Personal Information -> Step 3 (School Details)
  const handleStep2Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: { key: string; label: string }[] = [];
    if (!fullName || !fullName.trim()) missing.push({ key: 'fullName', label: 'Full Name' });
    if (!gender) missing.push({ key: 'gender', label: 'Gender' });
    if (!dob) missing.push({ key: 'dob', label: 'Date of Birth' });
    if (!country || !country.trim()) missing.push({ key: 'country', label: 'Country' });
    if (!state || !state.trim()) missing.push({ key: 'state', label: 'Current State' });
    if (!address || !address.trim()) missing.push({ key: 'address', label: 'Address' });
    if (!currentCity || !currentCity.trim()) missing.push({ key: 'currentCity', label: 'Current City' });
    if (!mobile || !mobile.trim()) missing.push({ key: 'mobile', label: 'Mobile Phone Number' });

    if (missing.length > 0) {
      markInvalidAndScroll(missing);
      return;
    }

    const cleanMob = mobile.replace(/\D/g, '');
    if (!cleanMob || cleanMob.length !== 10 || !['6', '7', '8', '9'].includes(cleanMob[0])) {
      alertService.showWarning(
        language === 'ta' ? 'செல்லுபடியாகும் கைபேசி எண் தேவை' : 'Valid Mobile Number Required',
        language === 'ta'
          ? 'தயவுசெய்து 6, 7, 8 அல்லது 9 இல் தொடங்கும் 10-இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
      );
      markInvalidAndScroll([{ key: 'mobile', label: '10-digit Indian Mobile Number' }]);
      return;
    }

    if (dob) {
      const selectedDob = new Date(dob);
      const today = new Date();
      if (selectedDob >= today) {
        alertService.showWarning(
          language === 'ta' ? 'செல்லுபடியற்ற பிறந்த தேதி' : 'Invalid Date of Birth',
          language === 'ta'
            ? 'பிறந்த தேதி இன்றைய தேதிக்கு முன்பாக இருக்க வேண்டும்.'
            : 'Date of birth cannot be today or in the future.'
        );
        markInvalidAndScroll([{ key: 'dob', label: 'Valid Date of Birth' }]);
        return;
      }
    }
    setInvalidFields(new Set());

    // Auto-generate avatar if no custom photo was uploaded
    const photoToUse = profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.trim())}&background=F4C542&color=111111`;
    if (!profilePhotoUrl) {
      setProfilePhotoUrl(photoToUse);
    }

    // Save Step 2 details immediately to DB
    const fullMobile = mobile.startsWith('+') ? mobile : `${mobilePrefix} ${mobile}`.trim();
    saveStepDataToDB({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: fullMobile,
      country_code: mobilePrefix,
      gender,
      dob,
      blood_group: bloodGroup || undefined,
      father_name: fatherName.trim() || undefined,
      mother_name: motherName.trim() || undefined,
      profile_photo_url: photoToUse,
      address: address.trim(),
      current_city: currentCity.trim(),
      city: currentCity.trim(),
      state: state.trim(),
      country: country.trim() || 'India',
      passing_year: passingYear ? parseInt(passingYear) : undefined
    });

    goToStep(3);
  };

  const getCalculated10thBatchYear = (leavingClassStr: string, yearStr: string): number | null => {
    const year = parseInt(yearStr, 10);
    if (isNaN(year)) return null;
    const match = leavingClassStr.match(/(\d+)/);
    if (!match) return year;
    const classNum = parseInt(match[1], 10);
    if (isNaN(classNum) || classNum >= 10) return year;
    return year + (10 - classNum);
  };

  // Step 3 Validation: School Details -> Step 4 (Education History)
  const handleStep3Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: { key: string; label: string }[] = [];
    if (!schoolName || !schoolName.trim()) missing.push({ key: 'schoolName', label: 'School Name' });
    if (!passingYear) missing.push({ key: 'passingYear', label: 'Leaving / Passing Year' });
    if (!leavingClass) missing.push({ key: 'leavingClass', label: 'Class / Standard at Leaving' });

    if (missing.length > 0) {
      markInvalidAndScroll(missing);
      return;
    }
    setInvalidFields(new Set());

    // Trigger SweetAlert confirmation for 1st–9th Standard leavers
    if (leavingClass !== '10th') {
      const calculatedBatchYear = getCalculated10thBatchYear(leavingClass, passingYear);
      const title = language === 'ta'
        ? '🎓 உங்கள் Batch ஆண்டு கணக்கிடப்படும்'
        : '🎓 Estimated Alumni Batch Year';

      const htmlContent = language === 'ta'
        ? `<div style="text-align: left; font-size: 13px; line-height: 1.6; color: #374151;">
            <p style="margin-bottom: 10px;">நீங்கள் <strong>${leavingClass} வகுப்பில் ${passingYear}</strong> ஆம் ஆண்டு இந்தப் பள்ளியை விட்டு வெளியேறியதாகத் தேர்வு செய்துள்ளீர்கள்.</p>
            <p style="margin-bottom: 12px;">உங்கள் Alumni Batch, <strong>10-ஆம் வகுப்பு முடித்திருக்க வேண்டிய ஆண்டை அடிப்படையாகக் கொண்டு</strong> கணக்கிடப்படும்.</p>
            <div style="margin: 14px 0; padding: 12px; background-color: #FFF9E6; border: 1px solid #F4C542; border-radius: 14px; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #854D0E;">${leavingClass} வகுப்பு — ${passingYear}</div>
              <div style="font-size: 18px; font-weight: 900; color: #111111; margin: 2px 0;">↓</div>
              <div style="font-size: 15px; font-weight: 800; color: #713F12;">10-ஆம் வகுப்பு Batch — ${calculatedBatchYear || passingYear}</div>
            </div>
            <p style="text-align: center; font-weight: 700; color: #111111; margin-top: 10px;">இந்த விவரங்கள் சரியாக உள்ளதா?</p>
          </div>`
        : `<div style="text-align: left; font-size: 13px; line-height: 1.6; color: #374151;">
            <p style="margin-bottom: 10px;">You selected leaving after <strong>${leavingClass} Standard in ${passingYear}</strong>.</p>
            <p style="margin-bottom: 12px;">Your Alumni Batch is estimated <strong>based on the year you would complete 10th Standard</strong>.</p>
            <div style="margin: 14px 0; padding: 12px; background-color: #FFF9E6; border: 1px solid #F4C542; border-radius: 14px; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #854D0E;">${leavingClass} Std — ${passingYear}</div>
              <div style="font-size: 18px; font-weight: 900; color: #111111; margin: 2px 0;">↓</div>
              <div style="font-size: 15px; font-weight: 800; color: #713F12;">Estimated 10th Batch — ${calculatedBatchYear || passingYear}</div>
            </div>
            <p style="text-align: center; font-weight: 700; color: #111111; margin-top: 10px;">Are these details correct?</p>
          </div>`;

      const confirmBtnText = language === 'ta' ? '✓ ஆம், தொடரவும்' : '✓ Yes, Continue';
      const cancelBtnText = language === 'ta' ? '← மாற்றவும்' : '← Change';

      const confirmed = await alertService.showConfirmHtml(title, htmlContent, confirmBtnText, cancelBtnText);
      if (!confirmed) {
        return; // Stay on Step 3 for user to modify choices
      }
    }

    // Save Step 3 details immediately to DB
    const fullMobile = getFullMobile();
    saveStepDataToDB({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: fullMobile,
      address: address.trim(),
      school_name: schoolName.trim(),
      joining_year: parseInt(joiningYear) || 2010,
      passing_year: parseInt(passingYear) || 2015,
      leaving_class: leavingClass,
      current_city: currentCity.trim()
    });

    goToStep(4);
  };

  // Step 4 Validation: Education History -> Step 5 (Professional Details)
  const handleStep4Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: { key: string; label: string }[] = [];
    if (!hasHigherEducation) {
      missing.push({ key: 'hasHigherEducation', label: 'Did you pursue Higher Education?' });
    }
    if (missing.length > 0) {
      markInvalidAndScroll(missing);
      return;
    }
    setInvalidFields(new Set());

    const hasCollegeData = Boolean(
      (collegeName && collegeName.trim()) ||
      degree ||
      (stream && stream.trim()) ||
      collegePassingYear
    );
    const isNoCollege = hasHigherEducation === 'NO' || !hasCollegeData;

    // Save Step 4 details immediately to DB
    const fullMobile = getFullMobile();
    const finalDegree = degree === 'Other - write something' ? otherDegree : degree;
    saveStepDataToDB({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: fullMobile,
      address: address.trim(),
      passing_year: parseInt(passingYear) || 2015,
      no_higher_education: isNoCollege,
      college_name: !isNoCollege && collegeName ? collegeName.trim() : undefined,
      degree: !isNoCollege && finalDegree ? finalDegree : undefined,
      other_degree: degree === 'Other - write something' && otherDegree ? otherDegree.trim() : undefined,
      stream: !isNoCollege && stream ? stream.trim() : undefined,
      college_joining_year: !isNoCollege && collegeJoiningYear ? parseInt(collegeJoiningYear) : undefined,
      college_passing_year: !isNoCollege && collegePassingYear ? parseInt(collegePassingYear) : undefined,
      current_city: currentCity.trim()
    });

    goToStep(5);
  };

  // Step 5 Validation: Professional Details -> Step 6 (Review & Submit)
  const handleStep5Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: { key: string; label: string }[] = [];
    if (!isVolunteer) missing.push({ key: 'isVolunteer', label: 'Willing to Volunteer?' });
    if (!willingToDonate) missing.push({ key: 'willingToDonate', label: 'Willing to Donate?' });

    if (missing.length > 0) {
      markInvalidAndScroll(missing);
      return;
    }
    setInvalidFields(new Set());

    // Save Step 5 details immediately to DB
    const fullMobile = getFullMobile();
    saveStepDataToDB({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: fullMobile,
      address: address.trim(),
      passing_year: parseInt(passingYear) || 2015,
      employment_status: employmentStatus || undefined,
      company: company.trim() || undefined,
      position: position.trim() || undefined,
      profession: position.trim() || employmentStatus || undefined,
      industry: industry.trim() || undefined,
      total_experience: totalExperience || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      instagram_url: instagramUrl.trim() || undefined,
      whatsapp_number: whatsappNumber.trim() || undefined,
      is_volunteer: isVolunteer || undefined,
      willing_to_donate: willingToDonate || undefined,
      current_city: currentCity.trim()
    });

    goToStep(6);
  };

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Step 6 Submission: Final Register
  const handleFinalRegister = async () => {
    // 1. Validate Step 2: Personal Details
    const missingStep2: { key: string; label: string }[] = [];
    if (!fullName || !fullName.trim()) missingStep2.push({ key: 'fullName', label: 'Full Name' });
    if (!gender) missingStep2.push({ key: 'gender', label: 'Gender' });
    if (!dob) missingStep2.push({ key: 'dob', label: 'Date of Birth' });
    if (!country || !country.trim()) missingStep2.push({ key: 'country', label: 'Country' });
    if (!state || !state.trim()) missingStep2.push({ key: 'state', label: 'Current State' });
    if (!address || !address.trim()) missingStep2.push({ key: 'address', label: 'Address' });
    if (!currentCity || !currentCity.trim()) missingStep2.push({ key: 'currentCity', label: 'Current City' });
    if (!mobile || mobile.replace(/\D/g, '').length < 10) missingStep2.push({ key: 'mobile', label: '10-digit Mobile Phone Number' });

    if (missingStep2.length > 0) {
      const labels = missingStep2.map(m => m.label);
      await alertService.showWarning(
        language === 'ta' ? 'தனிப்பட்ட விவரங்கள் விடுபட்டுள்ளன' : 'Step 2 Details Missing',
        language === 'ta'
          ? `படி 2-ல் பின்வரும் விவரங்கள் பூர்த்தி செய்யப்படவில்லை:\n• ${labels.join('\n• ')}\n\nசரிசெய்ய அந்த படிக்கு மாற்றப்படுகிறீர்கள்.`
          : `The following required fields in Step 2 (Personal Info) are missing:\n• ${labels.join('\n• ')}\n\nRedirecting to Step 2 to complete.`
      );
      goToStep(2);
      setTimeout(() => markInvalidAndScroll(missingStep2), 100);
      return;
    }

    // 2. Validate Step 3: School Details
    const missingStep3: { key: string; label: string }[] = [];
    if (!schoolName || !schoolName.trim()) missingStep3.push({ key: 'schoolName', label: 'School Name' });
    if (!passingYear) missingStep3.push({ key: 'passingYear', label: 'Leaving / Passing Year' });
    if (!leavingClass) missingStep3.push({ key: 'leavingClass', label: 'Class / Standard at Leaving' });

    if (missingStep3.length > 0) {
      const labels = missingStep3.map(m => m.label);
      await alertService.showWarning(
        language === 'ta' ? 'பள்ளி விவரங்கள் விடுபட்டுள்ளன' : 'Step 3 Details Missing',
        language === 'ta'
          ? `படி 3-ல் பின்வரும் விவரங்கள் பூர்த்தி செய்யப்படவில்லை:\n• ${labels.join('\n• ')}\n\nசரிசெய்ய அந்த படிக்கு மாற்றப்படுகிறீர்கள்.`
          : `The following required fields in Step 3 (School Details) are missing:\n• ${labels.join('\n• ')}\n\nRedirecting to Step 3 to complete.`
      );
      goToStep(3);
      setTimeout(() => markInvalidAndScroll(missingStep3), 100);
      return;
    }

    // 3. Validate Step 4: Higher Education Selection
    const missingStep4: { key: string; label: string }[] = [];
    if (!hasHigherEducation) missingStep4.push({ key: 'hasHigherEducation', label: 'Did you pursue Higher Education?' });

    if (missingStep4.length > 0) {
      const labels = missingStep4.map(m => m.label);
      await alertService.showWarning(
        language === 'ta' ? 'உயர் கல்வி விருப்பம் விடுபட்டுள்ளது' : 'Step 4 Selection Missing',
        language === 'ta'
          ? `படி 4-ல் உயர் கல்வி பயின்றீர்களா என்பதைத் தேர்ந்தெடுக்க வேண்டும்:\n• ${labels.join('\n• ')}\n\nசரிசெய்ய அந்த படிக்கு மாற்றப்படுகிறீர்கள்.`
          : `Please select whether you pursued Higher Education in Step 4:\n• ${labels.join('\n• ')}\n\nRedirecting to Step 4 to select.`
      );
      goToStep(4);
      setTimeout(() => markInvalidAndScroll(missingStep4), 100);
      return;
    }

    // 4. Validate Step 5: Volunteer & Donate Preferences
    const missingStep5: { key: string; label: string }[] = [];
    if (!isVolunteer) missingStep5.push({ key: 'isVolunteer', label: 'Willing to Volunteer?' });
    if (!willingToDonate) missingStep5.push({ key: 'willingToDonate', label: 'Willing to Donate?' });

    if (missingStep5.length > 0) {
      const labels = missingStep5.map(m => m.label);
      await alertService.showWarning(
        language === 'ta' ? 'தன்னார்வ / நன்கொடை விருப்பங்கள் விடுபட்டுள்ளன' : 'Step 5 Preferences Missing',
        language === 'ta'
          ? `படி 5-ல் பின்வரும் விருப்பங்கள் தேர்ந்தெடுக்கப்படவில்லை:\n• ${labels.join('\n• ')}\n\nசரிசெய்ய அந்த படிக்கு மாற்றப்படுகிறீர்கள்.`
          : `The following required options in Step 5 are missing:\n• ${labels.join('\n• ')}\n\nRedirecting to Step 5 to select.`
      );
      goToStep(5);
      setTimeout(() => markInvalidAndScroll(missingStep5), 100);
      return;
    }

    // 4. Validate Terms Agreement
    if (!agreeTerms) {
      await alertService.showWarning(
        language === 'ta' ? 'விதிமுறைகளை ஏற்கவும்' : 'Terms & Conditions Required',
        language === 'ta'
          ? 'அதிகாரப்பூர்வ முன்னாள் மாணவர்கள் பதிவைச் சமர்ப்பிக்க விதிகளையும் தனியுரிமைக் கொள்கையையும் ஒப்புக் கொள்ள வேண்டும்.'
          : 'Please check the Terms & Conditions box to agree to the Alumni Association rules before submitting your registration.'
      );
      markInvalidAndScroll([{ key: 'agreeTerms', label: 'Terms & Conditions Agreement' }]);
      return;
    }

    setInvalidFields(new Set());
    setLoading(true);
    setError(null);
    try {
      const hasCollegeData = Boolean(
        (collegeName && collegeName.trim()) ||
        degree ||
        (stream && stream.trim()) ||
        collegeJoiningYear ||
        collegePassingYear
      );
      const isNoCollege = noHigherEducation || !hasCollegeData;
      const finalDegree = degree === 'Other - write something' ? otherDegree : degree;

      const payload = {
        email: email.trim().toLowerCase(),
        mobile: getFullMobile(),
        password: password ? password.trim() : undefined,
        full_name: fullName.trim(),
        gender: gender,
        dob: dob,
        blood_group: bloodGroup || undefined,
        father_name: fatherName.trim() || undefined,
        mother_name: motherName.trim() || undefined,
        country_code: mobilePrefix,
        country: country,
        state: state.trim(),
        address: address.trim(),
        current_city: currentCity.trim(),
        profile_photo_url: profilePhotoUrl,

        // School Education
        school_name: schoolName.trim(),
        joining_year: parseInt(joiningYear) || 2010,
        passing_year: parseInt(passingYear) || 2015,
        leaving_class: leavingClass,

        // Higher Education
        no_higher_education: isNoCollege,
        college_name: !isNoCollege && collegeName ? collegeName.trim() : undefined,
        degree: !isNoCollege && finalDegree ? finalDegree : undefined,
        other_degree: degree === 'Other - write something' && otherDegree ? otherDegree.trim() : undefined,
        stream: !isNoCollege && stream ? stream.trim() : undefined,
        college_joining_year: !isNoCollege && collegeJoiningYear ? parseInt(collegeJoiningYear) : undefined,
        college_passing_year: !isNoCollege && collegePassingYear ? parseInt(collegePassingYear) : undefined,

        // Professional & Social Contact Details
        employment_status: employmentStatus || undefined,
        company: company.trim() || undefined,
        position: position.trim() || undefined,
        profession: position.trim() || employmentStatus || undefined,
        industry: industry.trim() || undefined,
        total_experience: totalExperience || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        instagram_url: instagramUrl.trim() || undefined,
        whatsapp_number: whatsappNumber.trim() || undefined,
        is_volunteer: isVolunteer || 'NO',
        willing_to_donate: willingToDonate || 'NO'
      };

      await api.register(payload);
      await alertService.showSuccess(
        language === 'ta' ? 'பதிவு முடிந்தது & கணக்கு சமர்ப்பிக்கப்பட்டது! 🎉' : 'Registration Submitted Successfully! 🎉',
        language === 'ta'
          ? 'நன்றி! உங்கள் பதிவு பெறப்பட்டது. பள்ளி நிர்வாகத்தின் சரிபார்ப்புக்காகக் காத்திருக்கவும். சரிபார்க்கப்பட்டதும் SMS அறிவிப்பு மற்றும் போர்டல் அணுகல் வழங்கப்படும்.'
          : 'Thank you for registering! Your profile has been submitted and is now awaiting School Admin verification. Once approved, you will receive updates via SMS and gain full portal access.'
      );
      navigate('/alumni');
    } catch (err: any) {
      alertService.handleApiError(err, 'Registration submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    {
      num: 1,
      label: language === 'ta' ? 'கணக்கு சரிபார்ப்பு' : 'Sign Up',
      sub: isOtpVerified
        ? (language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified')
        : (language === 'ta' ? 'SMS OTP சரிபார்க்க' : 'Verify Mobile OTP')
    },
    {
      num: 2,
      label: language === 'ta' ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Info',
      sub: language === 'ta' ? 'தொடர்பு & புகைப்பட விவரங்கள்' : 'Contact & Profile Photo'
    },
    {
      num: 3,
      label: language === 'ta' ? 'பள்ளி விவரங்கள்' : 'School Details',
      sub: language === 'ta' ? '10-ஆம் வகுப்பு ஆண்டு & பிரிவு' : '10th Year & Alumni Batch'
    },
    {
      num: 4,
      label: language === 'ta' ? 'உயர் கல்வி' : 'Education History',
      sub: language === 'ta' ? 'கல்லூரி & பட்டப்படிப்பு' : 'College & Qualification'
    },
    {
      num: 5,
      label: language === 'ta' ? 'தொழில்/பணி விவரங்கள்' : 'Professional Details',
      sub: language === 'ta' ? 'வேலை & பணி அனுபவம்' : 'Employment & Career'
    },
    {
      num: 6,
      label: language === 'ta' ? 'சரிபார்த்து சமர்ப்பிக்க' : 'Review & Submit',
      sub: language === 'ta' ? 'சுயவிவரம் & பதிவு' : 'Preview & Registration'
    },
  ];

  const effectiveBatchYear = passingYear ? parseInt(passingYear) : 2010;
  const calculatedBatchName = passingYear
    ? (leavingClass === '10th' ? `Batch of ${passingYear}` : `Left after ${leavingClass} Standard (${passingYear})`)
    : 'Select Passing Year';

  // Helper to check if a specific step's required form data is fully filled
  const isStepCompleted = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return Boolean(isOtpVerified && (hasExistingPassword || isGoogleAuth || (password && password.trim().length >= 6)));
      case 2:
        return Boolean(
          fullName && fullName.trim() !== '' &&
          gender && gender !== '' &&
          dob && dob !== '' &&
          country && country.trim() !== '' &&
          state && state.trim() !== '' &&
          address && address.trim() !== '' &&
          currentCity && currentCity.trim() !== '' &&
          mobile && mobile.replace(/\D/g, '').length >= 10
        );
      case 3:
        return Boolean(
          schoolName && schoolName.trim() !== '' &&
          passingYear && passingYear !== '' &&
          leavingClass && leavingClass !== ''
        );
      case 4:
        return Boolean(hasHigherEducation === 'YES' || hasHigherEducation === 'NO');
      case 5:
        return Boolean(
          isVolunteer && (isVolunteer === 'YES' || isVolunteer === 'NO') &&
          willingToDonate && (willingToDonate === 'YES' || willingToDonate === 'NO')
        );
      case 6:
        return Boolean(agreeTerms);
      default:
        return false;
    }
  };

  const completedDataStepsCount = [1, 2, 3, 4, 5, 6].filter(n => isStepCompleted(n)).length;
  const realProgressPercent = Math.round((completedDataStepsCount / 6) * 100);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#FAFAFA] via-[#FFFDF5] to-[#FDFBF7] text-[#111111] pt-6 sm:pt-8 lg:pt-10 pb-6 sm:pb-8 font-sans selection:bg-[#F4C542] selection:text-[#111111] relative">

      {/* Background Premium Dynamic Light Wave & Responsive Height Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Ambient Light Glow Orbs */}
        <div className="absolute -top-24 -left-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-amber-200/35 rounded-full blur-3xl opacity-70 mix-blend-multiply" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 sm:w-[600px] sm:h-[600px] bg-[#F4C542]/20 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-yellow-100/60 rounded-full blur-3xl opacity-80" />

        {/* Top-Right Flowing Curved Line Waves */}
        <svg
          className="absolute top-0 right-0 w-full max-w-[900px] h-[350px] sm:h-[550px] md:h-[700px] text-[#F4C542]/30 opacity-90 transition-all duration-700"
          viewBox="0 0 1000 600"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="regWaveGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F4C542" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#EAB308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="regWaveFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 C300,90 650,20 1000,160 L1000,0 Z"
            fill="url(#regWaveFillGrad)"
          />
          <path
            d="M0,80 C250,180 600,60 1000,240"
            stroke="url(#regWaveGradTop)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M0,130 C300,230 650,110 1000,290"
            stroke="url(#regWaveGradTop)"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <path
            d="M0,180 C350,280 700,160 1000,340"
            stroke="url(#regWaveGradTop)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Bottom Full-Width Responsive Fluid Wave */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[180px] sm:h-[260px] md:h-[340px] opacity-80">
          <svg
            className="w-full h-full text-[#F4C542]"
            viewBox="0 0 1440 320"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="regWaveGradBottom" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#FFF7D6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              fill="url(#regWaveGradBottom)"
              d="M0,160 C280,240 420,100 720,180 C1020,260 1200,140 1440,200 L1440,320 L0,320 Z"
            />
            <path
              d="M0,160 C280,240 420,100 720,180 C1020,260 1200,140 1440,200"
              stroke="#F4C542"
              strokeOpacity="0.3"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Mobile Compact Progress Header (Visible on Mobile & Tablet < 1024px) */}
        <div className="lg:hidden bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3 mb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-2.5 py-1 rounded-full shrink-0">
                {language === 'ta' ? `படி ${step} / 6` : `Step ${step} of 6`}
              </span>
              <span className="text-xs font-bold text-[#111111] truncate">{stepsList[step - 1].label}</span>
            </div>
            <div className="shrink-0">
              <LanguageSelector />
            </div>
          </div>

          {/* Mobile Progress Bar Line */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#F4C542] h-full transition-all duration-300 rounded-full"
              style={{ width: `${realProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Grid: Sticky Sidebar Progress (4 cols) & Form Body (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR: Sticky Scroll Premium Vertical Stepper UI */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 lg:top-[136px] self-start space-y-6">
            <div className="bg-white/95 backdrop-blur-sm border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-md shadow-gray-200/50 transition-all">
              <div className="mb-6 pb-4 border-b border-gray-100">
                {/* <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FFF7D6] text-[#854D0E] text-[11px] font-extrabold uppercase tracking-wider rounded-full border border-[#F4C542]/60 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>{language === 'ta' ? 'பதிவு வழிகாட்டி' : 'Registration Wizard'}</span>
                </div> */}
                <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">
                  {language === 'ta' ? 'கணக்கு உருவாக்கம்' : 'Create Account'}
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  {language === 'ta' ? 'அதிகாரப்பூர்வ முன்னாள் மாணவர்கள் பதிவு' : 'Official Alumni Member Registration'}
                </p>
              </div>

              {/* Continuous Vertical Line Stepper */}
              <div className="relative">
                {stepsList.map((s, index) => {
                  const isActive = step === s.num;
                  const isFilled = isStepCompleted(s.num);
                  const isUnlocked = s.num === 1 ? true : (isOtpVerified && (s.num <= maxStepReached || s.num <= step || isFilled));
                  const isCompleted = isFilled;
                  const isLast = index === stepsList.length - 1;

                  return (
                    <div key={s.num} className="relative flex items-start space-x-4 pb-7 last:pb-0 group">
                      {/* Step Circle & Perfectly Centered Line Container */}
                      <div className="relative flex flex-col items-center shrink-0 w-8">
                        {/* Step Circle Node */}
                        <button
                          type="button"
                          onClick={() => {
                            if (s.num === 1 && isOtpVerified) {
                              alertService.showInfo(
                                language === 'ta' ? 'சரிபார்க்கப்பட்டது & பூட்டப்பட்டது' : 'Verified & Locked',
                                language === 'ta'
                                  ? 'உங்கள் கணக்கு சரிபார்ப்பு முடிந்தது. படி 1 மீண்டும் செல்ல முடியாது.'
                                  : 'Your account verification is complete. Step 1 is locked.'
                              );
                              return;
                            }
                            if (!isOtpVerified && s.num > 1) {
                              alertService.showWarning(
                                language === 'ta' ? 'கணக்கு சரிபார்ப்பு அவசியம்' : 'Account Verification Required',
                                language === 'ta'
                                  ? 'தொடர்வதற்கு முன் படி 1-இல் OTP மூலம் கணக்கைச் சரிபார்க்க வேண்டும்.'
                                  : 'Please verify your phone/email via OTP in Step 1 first.'
                              );
                              setStep(1);
                              return;
                            }
                            if (isUnlocked) {
                              goToStep(s.num as any);
                            } else {
                              alertService.showWarning(
                                language === 'ta' ? 'படி பூட்டப்பட்டுள்ளது' : 'Step Locked',
                                language === 'ta'
                                  ? `படி ${s.num}-க்கு செல்லும் முன் படி ${step}-ஐ பூர்த்தி செய்ய வேண்டும்.`
                                  : `Please complete Step ${step} first before advancing to Step ${s.num}.`
                              );
                            }
                          }}
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all cursor-pointer ${isCompleted
                              ? isActive
                                ? 'bg-[#10B981] text-white ring-4 ring-[#10B981]/30 shadow-xs scale-105'
                                : 'bg-[#10B981] text-white shadow-xs'
                              : isActive
                                ? 'bg-[#F4C542] text-[#111111] ring-4 ring-[#F4C542]/25 shadow-xs scale-105'
                                : 'bg-gray-100 border border-gray-300 text-gray-400'
                            }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                        </button>

                        {/* Perfectly Centered Vertical Connecting Line */}
                        {!isLast && (
                          <div
                            className={`absolute top-8 -bottom-7 w-0.5 left-1/2 -translate-x-1/2 z-0 transition-colors ${isFilled ? 'bg-[#10B981]' : 'bg-gray-200'
                              }`}
                          />
                        )}
                      </div>

                      {/* Step Text Label */}
                      <div
                        onClick={() => {
                          if (s.num === 1 && isOtpVerified) {
                            alertService.showInfo(
                              language === 'ta' ? 'சரிபார்க்கப்பட்டது & பூட்டப்பட்டது' : 'Verified & Locked',
                              language === 'ta'
                                ? 'உங்கள் கணக்கு சரிபார்ப்பு முடிந்தது. படி 1 மீண்டும் செல்ல முடியாது.'
                                : 'Your account verification is complete. Step 1 is locked.'
                            );
                            return;
                          }
                          if (!isOtpVerified && s.num > 1) {
                            alertService.showWarning(
                              language === 'ta' ? 'கணக்கு சரிபார்ப்பு அவசியம்' : 'Account Verification Required',
                              language === 'ta'
                                ? 'தொடர்வதற்கு முன் படி 1-இல் OTP மூலம் கணக்கைச் சரிபார்க்க வேண்டும்.'
                                : 'Please verify your phone/email via OTP in Step 1 first.'
                            );
                            setStep(1);
                            return;
                          }
                          if (isUnlocked) {
                            goToStep(s.num as any);
                          }
                        }}
                        className={`min-w-0 flex-1 pt-0.5 ${isUnlocked && !(s.num === 1 && isOtpVerified) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <div className={`text-sm leading-tight transition-colors ${isCompleted
                            ? 'font-bold text-[#10B981]'
                            : isActive
                              ? 'font-extrabold text-[#111111]'
                              : 'font-semibold text-gray-400'
                          }`}>
                          {s.label}
                        </div>
                        <div className="text-xs text-gray-400 font-medium truncate mt-0.5">{s.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar & Footer Info */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>{language === 'ta' ? `படி ${step} / 6` : `Step ${step} of 6`}</span>
                  <span className="font-bold text-[#854D0E]">{realProgressPercent}% {language === 'ta' ? 'நிறைவடைந்தது' : 'Completed'}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F4C542] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${realProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Existing User Login Prompt */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 text-center text-xs text-gray-600 shadow-xs">
              {language === 'ta' ? 'ஏற்கனவே சரிபார்க்கப்பட்ட கணக்கு உள்ளதா?' : 'Already have a verified alumni account?'}{' '}
              <Link to="/login" className="font-bold text-[#111111] underline hover:text-[#854D0E]">
                {language === 'ta' ? 'இங்கே உள்நுழையவும்' : 'Log In Here'}
              </Link>
            </div>

            {/* ====================================================== */}
            {/* NEW: Demo Link Card                                    */}
            {/* ====================================================== */}
            <div className="bg-[#FFF7D6] border border-[#F4C542]/60 rounded-2xl p-4 text-center shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#854D0E] mb-1.5">
                {language === 'ta' ? 'புதியவரா?' : 'New to the portal?'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setDemoVideoType('REGISTRATION');
                  setShowDemoModal(true);
                }}
                className="inline-flex items-center justify-center space-x-1.5 text-xs sm:text-sm font-bold text-[#111111] hover:text-[#854D0E] underline underline-offset-2 transition-colors cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 shrink-0 text-[#854D0E]" />
                <span>
                  {language === 'ta' ? 'பதிவு வழிகாட்டி வீடியோவைப் பாருங்கள்' : 'Watch Registration Demo Video'}
                </span>
              </button>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                {language === 'ta'
                  ? 'பதிவு செய்வதற்கு முன் ஒரு விரைவான வீடியோ வழிகாட்டி'
                  : 'A quick video walkthrough before you sign up'}
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: Form Card */}

          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm">

              {/* STEP 1: Sign Up & Mobile Phone SMS Verification */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#111111]">
                      {language === 'ta' ? 'படி 1: கணக்கு சரிபார்ப்பு' : 'Step 1: Account Verification'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ta'
                        ? 'உங்கள் முன்னாள் மாணவர் பதிவைத் தொடங்க உங்கள் முதன்மை கைபேசி எண்ணைச் சரிபார்க்கவும்'
                        : 'Verify your primary mobile number to begin your alumni registration'}
                    </p>
                  </div>

                  {!otpSent ? (
                    <form onSubmit={handleSendEmailOTP} className="space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {language === 'ta' ? 'கைபேசி எண் (10 இலக்கங்கள்)' : 'Mobile Phone Number (10 Digits)'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111] placeholder-gray-400"
                          />
                          <Phone className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {accountAlreadyExists && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-800 space-y-2">
                          <p className="font-bold">
                            {language === 'ta'
                              ? 'இந்த கைபேசி எண்ணில் ஏற்கனவே கணக்கு உள்ளது.'
                              : 'An account already exists with this mobile number.'}
                          </p>
                          <Link to="/login" className="inline-block font-bold text-[#111111] underline">
                            {language === 'ta' ? 'நேரடியாக உள்நுழைய இங்கே கிளிக் செய்யவும் →' : 'Click here to Log In directly →'}
                          </Link>
                        </div>
                      )}

                      <Button type="submit" className="w-full py-3.5 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transition-all cursor-pointer" isLoading={loading}>
                        <span>{language === 'ta' ? 'சமர்ப்பித்து தொடரவும்' : 'Submit & Continue'}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
                      </Button>

                      {/* Divider */}
                      <div className="relative py-2 flex items-center justify-center">
                        <div className="border-t border-gray-200 w-full" />
                        <span className="bg-white px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {language === 'ta' ? 'அல்லது' : 'OR'}
                        </span>
                      </div>

                      {/* Google OAuth Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
                          window.location.href = `${apiBase}/auth/google/login`;
                        }}
                        className="w-full py-3.5 px-6 bg-white border border-gray-300 hover:border-[#111111] rounded-xl font-bold text-sm sm:text-base text-[#111111] flex items-center justify-center space-x-3 shadow-xs hover:shadow-md transition-all cursor-pointer"
                      >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>{language === 'ta' ? 'கூகிள் மூலம் பதிவு செய்க' : 'Sign Up with Google'}</span>
                      </button>
                    </form>
                  ) : !isOtpVerified ? (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs sm:text-sm text-[#854D0E] font-medium flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#854D0E] shrink-0" />
                          <span>
                            {language === 'ta' ? 'SMS சரிபார்ப்பு OTP அனுப்பப்பட்டது: ' : 'Verification OTP code sent via SMS to '}
                            <strong>{mobile}</strong>
                          </span>
                        </div>
                        <button type="button" onClick={() => { setOtpSent(false); setIsOtpVerified(false); }} className="text-xs font-bold text-[#854D0E] underline cursor-pointer">
                          {language === 'ta' ? 'எண்ணை மாற்ற' : 'Change Number'}
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {language === 'ta' ? '6-இலக்க சரிபார்ப்புக் குறியீடு (OTP)' : '6-Digit Verification Code'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-center text-xl font-bold tracking-widest text-[#111111] placeholder-gray-400"
                        />
                      </div>

                      <Button type="submit" className="w-full py-3.5 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer" isLoading={loading}>
                        <span>{language === 'ta' ? 'OTP சரிபார்த்துத் தொடரவும்' : 'Verify Security Code & Continue'}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
                      </Button>

                      {/* Resend OTP Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-4">
                        <span className="text-xs text-gray-500 font-medium">
                          {language === 'ta' ? 'குறியீடு வரவில்லையா?' : "Didn't receive verification code?"}
                        </span>
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={loading || resendCountdown > 0}
                          className="text-xs font-bold text-[#854D0E] hover:underline cursor-pointer disabled:opacity-50 flex items-center space-x-1"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>
                            {resendCountdown > 0
                              ? (language === 'ta' ? `மீண்டும் அனுப்ப (${resendCountdown}s)` : `Resend in ${resendCountdown}s`)
                              : (language === 'ta' ? 'OTP மீண்டும் அனுப்புக' : 'Resend OTP Code')}
                          </span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSavePassword} className="space-y-6 animate-fadeIn">
                      <div className="p-4 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-2xl text-xs sm:text-sm text-[#854D0E] font-medium flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-[#854D0E] shrink-0" />
                        <div>
                          <p className="font-bold text-sm">
                            {language === 'ta' ? 'கைபேசி எண் OTP சரிபார்க்கப்பட்டது!' : 'Mobile OTP Verified Successfully!'}
                          </p>
                          <p className="text-xs opacity-90 mt-0.5">
                            {language === 'ta'
                              ? 'உங்கள் கணக்கில் பாதுகாப்பாக உள்நுழைய கடவுச்சொல்லை உருவாக்கவும்'
                              : 'Create a secure password to access your alumni account anytime'}
                          </p>
                        </div>
                      </div>

                      {/* Create Password Input */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {language === 'ta' ? 'புதிய கடவுச்சொல் (New Password)' : 'Create Password'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={language === 'ta' ? 'குறைந்தது 6 எழுத்துகள்' : 'Minimum 6 characters'}
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111] placeholder-gray-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {language === 'ta' ? 'குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Must be at least 6 characters long'}
                        </p>
                      </div>

                      {/* Confirm Password Input */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {language === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்தவும்' : 'Confirm Password'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={language === 'ta' ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்' : 'Re-enter your password'}
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111] placeholder-gray-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full py-3.5 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer" isLoading={loading}>
                        <KeyRound className="w-4 h-4 mr-1" />
                        <span>{language === 'ta' ? 'கடவுச்சொல்லைச் சேமித்து சுயவிவரத்திற்குச் செல்லவும்' : 'Save Password & Continue to Profile Details'}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
                      </Button>
                    </form>
                  )}
                </div>
              )}


              {/* STEP 2: Personal Information */}
              {step === 2 && (
                <form onSubmit={handleStep2Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#111111]">
                      {language === 'ta' ? 'படி 2: தனிப்பட்ட விவரங்கள்' : 'Step 2: Personal Information'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ta' ? 'உங்கள் தொடர்பு விவரங்கள் மற்றும் சுயவிவரப் புகைப்படத்தை வழங்கவும்' : 'Provide your verified contact details and profile photograph'}
                    </p>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      {language === 'ta' ? 'சுயவிவர புகைப்படம்' : 'Profile Photograph'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                    </label>
                    <div className="flex items-center">
                      <div className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 shadow-xs">
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                          {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <label
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#111111] hover:bg-gray-800 text-white flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer"
                          title={language === 'ta' ? 'புகைப்படத்தை மாற்று' : 'Upload Photo'}
                        >
                          <Pencil className="w-3.5 h-3.5 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div id="field-fullName" className={`sm:col-span-2 ${getHighlightCls('fullName')}`}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'முழு பெயர் (சான்றிதழில் உள்ளது போல்)' : 'Full Name (As per school records)'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          clearInvalidField('fullName');
                        }}
                        placeholder={language === 'ta' ? 'உங்கள் அதிகாரப்பூர்வ முழு பெயரை உள்ளிடவும்' : 'Enter your full official name'}
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                      />
                      {invalidFields.has('fullName') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'முழு பெயரை உள்ளிடவும்' : 'Full Name is required'}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div id="field-gender" className={getHighlightCls('gender')}>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {language === 'ta' ? 'பாலினம்' : 'Gender'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={gender}
                          onChange={(e) => {
                            setGender(e.target.value);
                            clearInvalidField('gender');
                          }}
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111] appearance-none pr-8 cursor-pointer"
                        >
                          <option value="">{language === 'ta' ? 'பாலினத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Gender'}</option>
                          <option value="Male">{language === 'ta' ? 'ஆண்' : 'Male'}</option>
                          <option value="Female">{language === 'ta' ? 'பெண்' : 'Female'}</option>
                          <option value="Other">{language === 'ta' ? 'மற்றவை' : 'Other'}</option>
                          <option value="Prefer not to say">{language === 'ta' ? 'கூற விரும்பவில்லை' : 'Prefer not to say'}</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {invalidFields.has('gender') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'பாலினத்தைத் தேர்ந்தெடுக்கவும்' : 'Gender is required'}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div id="field-dob" className={getHighlightCls('dob')}>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {language === 'ta' ? 'பிறந்த தேதி' : 'Date of Birth'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => {
                          setDob(e.target.value);
                          clearInvalidField('dob');
                        }}
                        className="w-full py-2 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111]"
                      />
                      {invalidFields.has('dob') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'பிறந்த தேதியை உள்ளிடவும்' : 'Date of Birth is required'}
                        </p>
                      )}
                    </div>

                    {/* Blood Group */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                        {language === 'ta' ? 'ரத்த வகை (Blood Group)' : 'Blood Group'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                      </label>
                      <div className="flex flex-wrap gap-2 pt-0.5 mb-2">
                        {bloodGroupOptions.map((bg) => (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setBloodGroup(bg)}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${bloodGroup === bg
                                ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                              }`}
                          >
                            {bg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Number with Country Code */}
                    <div id="field-mobile" className={`sm:col-span-2 grid grid-cols-12 gap-4 ${getHighlightCls('mobile')}`}>
                      <div className="col-span-5 sm:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'நாட்டு குறியீடு' : 'Country Code'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={mobilePrefix}
                            onChange={(e) => {
                              setMobilePrefix(e.target.value);
                              const found = countries.find(c => c.dialCode === e.target.value);
                              if (found) setCountry(found.name);
                            }}
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-sm font-semibold text-[#111111] appearance-none pr-6 cursor-pointer truncate"
                          >
                            {countries.map((c) => (
                              <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                                {c.flag} {c.dialCode} ({c.name})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div className="col-span-7 sm:col-span-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'கைபேசி எண்' : 'Mobile Phone Number'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => {
                            setMobile(e.target.value.replace(/\D/g, ''));
                            clearInvalidField('mobile');
                          }}
                          placeholder="9876543210"
                          maxLength={10}
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                      </div>
                      {invalidFields.has('mobile') && (
                        <p className="col-span-12 text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? '10-இலக்க செல்லுபடியாகும் கைபேசி எண்ணை உள்ளிடவும்' : 'Valid 10-digit mobile number is required'}
                        </p>
                      )}
                    </div>

                    {/* Email Address (For Account Notifications & Approval Notices) */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(அறிவிப்புகள் & உறுதிப்படுத்தல்களுக்கு)' : '(For notifications & confirmations)'}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Country Dropdown */}
                    <div id="field-country" className={getHighlightCls('country')}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'வசிக்கும் நாடு' : 'Country'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            clearInvalidField('country');
                            const found = countries.find(c => c.name === e.target.value);
                            if (found) setMobilePrefix(found.dialCode);
                          }}
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] font-normal appearance-none pr-8 cursor-pointer"
                        >
                          {countries.map((c) => (
                            <option key={`${c.code}-${c.name}`} value={c.name}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {invalidFields.has('country') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'நாட்டைத் தேர்ந்தெடுக்கவும்' : 'Country is required'}
                        </p>
                      )}
                    </div>

                    {/* Current State */}
                    <div id="field-state" className={getHighlightCls('state')}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'தற்போதைய மாநிலம்' : 'Current State'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          clearInvalidField('state');
                        }}
                        placeholder="e.g. Tamil Nadu"
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                      />
                      {invalidFields.has('state') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'மாநிலத்தை உள்ளிடவும்' : 'State is required'}
                        </p>
                      )}
                    </div>

                    {/* Address (NEW) */}
                    <div id="field-address" className={`sm:col-span-2 ${getHighlightCls('address')}`}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'முழு முகவரி' : 'Address'} <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          clearInvalidField('address');
                        }}
                        placeholder={
                          language === 'ta'
                            ? 'எ.கா. 12, வடக்கு தெரு, தூத்துக்குடி'
                            : 'e.g. 12, North Street, Tuticorin, Tamil Nadu'
                        }
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal resize-none"
                      />
                      {invalidFields.has('address') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'முகவரியை உள்ளிடவும்' : 'Address is required'}
                        </p>
                      )}
                    </div>

                    {/* Current City */}
                    <div id="field-currentCity" className={`sm:col-span-2 ${getHighlightCls('currentCity')}`}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'தற்போதைய நகரம்' : 'Current City'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentCity}
                        onChange={(e) => {
                          setCurrentCity(e.target.value);
                          clearInvalidField('currentCity');
                        }}
                        placeholder="e.g. Chennai / Madurai"
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                      />
                      {invalidFields.has('currentCity') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'நகரத்தை உள்ளிடவும்' : 'Current City is required'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div />
                    <Button type="submit" className="font-bold">
                      {language === 'ta' ? 'சேமித்து பள்ளி விவரங்களுக்கு செல்லவும்' : 'Save & Continue to School Details'} <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </form>
              )}


              {/* STEP 3: School Details */}
              {step === 3 && (
                <form onSubmit={handleStep3Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#111111]">
                      {language === 'ta' ? 'படி 3: பள்ளி கல்வி விவரங்கள்' : 'Step 3: School Education Details'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ta'
                        ? 'இப்பள்ளியில் படித்த காலத்தைக் குறிப்பிடவும். உங்கள் முன்னாள் மாணவர்கள் வகுப்பு 10-ஆம் வகுப்பு ஆண்டின் அடிப்படையில் கணக்கிடப்படும்.'
                        : 'Tell us when you studied at this school. Your alumni batch is based on your 10th Standard year.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* School Name */}
                    <div id="field-schoolName" className={getHighlightCls('schoolName')}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'பள்ளியின் பெயர்' : 'School Name'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => {
                          setSchoolName(e.target.value);
                          clearInvalidField('schoolName');
                        }}
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-bold text-[#111111]"
                      />
                      {invalidFields.has('schoolName') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'பள்ளியின் பெயரை உள்ளிடவும்' : 'School Name is required'}
                        </p>
                      )}
                    </div>

                    {/* 10th Standard / School Leaving Year */}
                    <div>
                      <div id="field-passingYear" className={getHighlightCls('passingYear')}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? '10-ஆம் வகுப்பு / பள்ளி வெளியேறிய ஆண்டு' : '10TH STANDARD / SCHOOL LEAVING YEAR'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={passingYear}
                            onChange={(e) => {
                              setPassingYear(e.target.value);
                              clearInvalidField('passingYear');
                            }}
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] font-normal appearance-none pr-8 cursor-pointer"
                          >
                            <option value="">{language === 'ta' ? 'ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Year'}</option>
                            {yearOptions.map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {invalidFields.has('passingYear') && (
                          <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {language === 'ta' ? 'ஆண்டைத் தேர்ந்தெடுக்கவும்' : '10th Standard / School Leaving Year is required'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Class / Standard at Leaving with Selection Chips (1st to 10th only) */}
                    <div id="field-leavingClass" className={getHighlightCls('leavingClass')}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {language === 'ta' ? 'பள்ளி முடித்த போது இருந்த வகுப்பு' : 'Class / Standard at Leaving'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1 mb-2">
                        {leavingClassOptions.map(cls => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              setLeavingClass(cls);
                              clearInvalidField('leavingClass');
                            }}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${leavingClass === cls
                                ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                              }`}
                          >
                            {cls} {language === 'ta' ? 'வகுப்பு' : 'Std'}
                          </button>
                        ))}
                      </div>
                      {invalidFields.has('leavingClass') && (
                        <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {language === 'ta' ? 'வகுப்பைத் தேர்ந்தெடுக்கவும்' : 'Leaving Class is required'}
                        </p>
                      )}

                      {/* Informational Callout for 11th / 12th Students */}
                      <div className="mt-3 p-3.5 bg-[#FFF9E6] border border-[#F4C542]/70 rounded-2xl text-xs text-[#854D0E] font-medium flex items-start space-x-3 shadow-xs">
                        <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-extrabold block text-[#713F12] text-xs sm:text-sm">
                            {language === 'ta' ? 'இங்கு 11 அல்லது 12-ஆம் வகுப்பு படித்தீர்களா?' : 'Studied 11th or 12th Standard here?'}
                          </span>
                          <p className="text-[#854D0E] leading-relaxed">
                            {language === 'ta'
                              ? 'உங்கள் முன்னாள் மாணவர்கள் வகுப்பு 10-ஆம் வகுப்பு தேர்ச்சி ஆண்டின் அடிப்படையில் மட்டுமே கணக்கிடப்படும். தயவுசெய்து மேலே "10th Std" தேர்ந்தெடுத்து, இப்பள்ளியில் 10-ஆம் வகுப்பு முடித்த ஆண்டை உள்ளிடவும்.'
                              : 'Your alumni batch is based on your 10th Standard passing year, not your 11th or 12th year. Please select 10th Std above and enter the year you completed 10th Standard at this school.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Batch Result Box */}
                    {(() => {
                      const calculatedYear = getCalculated10thBatchYear(leavingClass, passingYear);
                      return (
                        <div className="p-4 sm:p-5 bg-[#FFF7D6] border border-[#F4C542]/70 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#F4C542] flex items-center justify-center shrink-0 shadow-xs">
                            <GraduationCap className="w-5 h-5 text-[#854D0E]" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#854D0E] uppercase tracking-wider">
                              {language === 'ta' ? 'உங்கள் முன்னாள் மாணவர்கள் Batch' : 'Your Alumni Batch'}
                            </div>
                            <div className="text-base sm:text-lg font-extrabold text-[#111111]">
                              {leavingClass === '10th' ? (
                                passingYear ? `Batch of ${passingYear}` : (language === 'ta' ? 'ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Passing Year')
                              ) : (
                                calculatedYear ? `${calculatedYear} Batch` : (language === 'ta' ? 'ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Leaving Year')
                              )}
                            </div>
                            <div className="text-xs text-gray-600 font-medium mt-0.5">
                              {leavingClass === '10th' ? (
                                language === 'ta'
                                  ? 'உங்கள் 10-ஆம் வகுப்பு தேர்ச்சி ஆண்டின் அடிப்படையில் கணக்கிடப்பட்டது.'
                                  : 'Calculated using your 10th Standard passing year.'
                              ) : (
                                passingYear ? (
                                  language === 'ta'
                                    ? `${leavingClass} வகுப்பில் ${passingYear}-ல் வெளியேறியதன் அடிப்படையில் கணக்கிடப்பட்டது.`
                                    : `Calculated based on leaving after ${leavingClass} Std in ${passingYear}.`
                                ) : (
                                  language === 'ta'
                                    ? 'கணக்கிடப்பட்ட 10-ஆம் வகுப்பு Alumni Batch.'
                                    : 'Estimated 10th-standard Alumni Batch.'
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'பின்செல்ல' : 'Back'}
                    </Button>
                    <Button type="submit" className="font-bold">
                      {language === 'ta' ? 'சேமித்து உயர் கல்வி விவரங்களுக்கு செல்லவும்' : 'Save & Continue to Education History'} <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </form>
              )}


              {/* STEP 4: Higher Education / College Details */}
              {step === 4 && (
                <form onSubmit={handleStep4Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#111111]">
                      {language === 'ta' ? 'படி 4: உயர் கல்வி விவரங்கள்' : 'Step 4: Education History'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ta' ? 'கல்லூரி, பட்டப்படிப்பு மற்றும் உயர் கல்வி விவரங்கள்' : 'College, Degree, and Higher Education Details'}
                    </p>
                  </div>

                  {/* Option: Radio Button Choice for Higher Education */}
                  <div id="field-hasHigherEducation" className={`p-5 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs space-y-3 ${getHighlightCls('hasHigherEducation')}`}>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-[#854D0E] shrink-0" />
                      <label className="block text-xs sm:text-sm font-extrabold text-[#111111] uppercase tracking-wider">
                        {language === 'ta' ? 'உயர் கல்வி / கல்லூரிப் படிப்பு பயின்றுள்ளீர்களா?' : 'Did you pursue Higher Education / College?'} <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {language === 'ta'
                        ? 'கல்லூரி, பட்டப்படிப்பு அல்லது டிப்ளமோ முடித்திருந்தால் "ஆம்" என்பதைத் தேர்ந்தெடுக்கவும்'
                        : 'Select "Yes" if you attended college, university, or diploma courses after school'}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setHasHigherEducation('YES');
                          setNoHigherEducation(false);
                          clearInvalidField('hasHigherEducation');
                        }}
                        className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all flex items-center space-x-2.5 cursor-pointer ${hasHigherEducation === 'YES'
                            ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${hasHigherEducation === 'YES' ? 'border-white bg-white' : 'border-gray-400 bg-transparent'
                          }`}>
                          {hasHigherEducation === 'YES' && <span className="w-2 h-2 rounded-full bg-[#111111]" />}
                        </span>
                        <span>{language === 'ta' ? 'ஆம், உயர் கல்வி படித்துள்ளேன்' : 'Yes, I pursued Higher Education'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setHasHigherEducation('NO');
                          setNoHigherEducation(true);
                          clearInvalidField('hasHigherEducation');
                        }}
                        className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all flex items-center space-x-2.5 cursor-pointer ${hasHigherEducation === 'NO'
                            ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${hasHigherEducation === 'NO' ? 'border-white bg-white' : 'border-gray-400 bg-transparent'
                          }`}>
                          {hasHigherEducation === 'NO' && <span className="w-2 h-2 rounded-full bg-[#111111]" />}
                        </span>
                        <span>{language === 'ta' ? 'இல்லை / பள்ளி படிப்புடன் முடிந்தது' : 'No / No higher education'}</span>
                      </button>
                    </div>
                    {invalidFields.has('hasHigherEducation') && (
                      <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {language === 'ta' ? 'உயர் கல்வி விருப்பத்தைத் தேர்ந்தெடுக்கவும்' : 'Please select whether you pursued Higher Education'}
                      </p>
                    )}
                  </div>

                  {/* Below fields open ONLY if user selects YES (Higher Education) */}
                  {hasHigherEducation === 'YES' && (
                    <div className="space-y-6 pt-2 animate-fadeIn border-t border-gray-100 mt-4">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {language === 'ta'
                            ? 'உங்கள் கல்லூரி மற்றும் பட்டப்படிப்பு விவரங்களை கீழே உள்ளிடவும்:'
                            : 'Please enter your college and degree details below:'}
                        </span>
                      </div>

                      {/* College / Institution Name */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'கல்லூரி / கல்வி நிறுவனத்தின் பெயர்' : 'College / Institution Name'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                        </label>
                        <input
                          type="text"
                          value={collegeName}
                          onChange={(e) => {
                            setCollegeName(e.target.value);
                            clearInvalidField('collegeName');
                          }}
                          placeholder="e.g. Anna University / IIT Madras / Loyola College"
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                      </div>

                      {/* Degree / Course Dropdown & Chips */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          {language === 'ta' ? 'பட்டப்படிப்பு / தகுதி' : 'Degree / Course'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {["B.E.", "B.Tech.", "B.Sc.", "M.Sc.", "BCA", "MCA", "BBA", "MBA", "B.Com.", "Diploma"].map(deg => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => {
                                setDegree(deg);
                                clearInvalidField('degree');
                              }}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${degree === deg
                                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                                }`}
                            >
                              {deg}
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <select
                            value={degree}
                            onChange={(e) => {
                              setDegree(e.target.value);
                              clearInvalidField('degree');
                            }}
                            className="w-full py-2 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-sm text-[#111111] font-normal appearance-none pr-8 cursor-pointer"
                          >
                            <option value="">{language === 'ta' ? 'மற்ற பட்டப்படிப்பைக் தேர்ந்தெடுக்கவும்' : 'Or select another Degree...'}</option>
                            {degreeOptions.map(deg => (
                              <option key={deg} value={deg}>{deg}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Free-text input if "Other - write something" selected */}
                      {degree === 'Other - write something' && (
                        <div className="p-4 bg-[#FFF7D6]/60 border border-[#F4C542]/40 rounded-xl space-y-1.5">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {language === 'ta' ? 'பட்டப்படிப்பின் பெயரை உள்ளிடவும்' : 'Enter Degree / Qualification Name'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                          </label>
                          <input
                            type="text"
                            value={otherDegree}
                            onChange={(e) => {
                              setOtherDegree(e.target.value);
                              clearInvalidField('otherDegree');
                            }}
                            placeholder="e.g. B.Des / B.Arch / MBBS"
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                          />
                        </div>
                      )}

                      {/* Department / Stream */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'துறை / பாடப்பிரிவு' : 'Department / Stream / Major'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                        </label>
                        <input
                          type="text"
                          value={stream}
                          onChange={(e) => {
                            setStream(e.target.value);
                            clearInvalidField('stream');
                          }}
                          placeholder="e.g. Computer Science / Mechanical Engineering / Physics"
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                      </div>

                      {/* College Passing Year */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'முடித்த ஆண்டு' : 'Graduation / Passing Year'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                        </label>
                        <div className="relative">
                          <select
                            value={collegePassingYear}
                            onChange={(e) => {
                              setCollegePassingYear(e.target.value);
                              clearInvalidField('collegePassingYear');
                            }}
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] font-normal appearance-none pr-8 cursor-pointer"
                          >
                            <option value="">{language === 'ta' ? 'ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Year'}</option>
                            {yearOptions.map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'பின்செல்ல' : 'Back'}
                    </Button>
                    <Button type="submit" className="font-bold">
                      {language === 'ta' ? 'சேமித்து வேலை விவரங்களுக்கு செல்லவும்' : 'Save & Continue to Professional Details'} <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 5: Professional & Work Details */}
              {step === 5 && (
                <form onSubmit={handleStep5Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#111111]">
                      {language === 'ta' ? 'படி 5: தற்போதைய வேலை மற்றும் பணி விவரங்கள்' : 'Step 5: Current Professional Details'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ta' ? 'பணி அனுபவம், தற்போதைய நிறுவனம் மற்றும் திறன்கள்' : 'Work experience, current organization, and skills'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Employment Status with Selection Chips (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {language === 'ta' ? 'வேலை நிலை' : 'Employment Status'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1 mb-2">
                        {[
                          { key: "Employed", labelEn: "Employed", labelTa: "பணியில் உள்ளவர்" },
                          { key: "Business / Self-Employed", labelEn: "Business / Self-Employed", labelTa: "சுயதொழில் / தொழில்முனைவோர்" },
                          { key: "Seeking Opportunities", labelEn: "Seeking Opportunities", labelTa: "வாய்ப்புத் தேடுபவர்" },
                          { key: "Retired", labelEn: "Retired", labelTa: "ஓய்வு பெற்றவர்" },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setEmploymentStatus(opt.key)}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${employmentStatus === opt.key
                                ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                              }`}
                          >
                            {language === 'ta' ? opt.labelTa : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conditional Professional Fields — Hidden when Seeking Opportunities */}
                    {employmentStatus !== 'Seeking Opportunities' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Company / Organization (Optional) */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                              {language === 'ta' ? 'நிறுவனம் / அமைப்பு' : 'Company / Organization'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                            </label>
                            <input
                              type="text"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="e.g. Tata Consultancy Services / Google"
                              className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                            />
                          </div>

                          {/* Position / Job Role (Optional) */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                              {language === 'ta' ? 'பதவி / வேலை தலைப்பு' : 'Position / Job Role'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                            </label>
                            <input
                              type="text"
                              value={position}
                              onChange={(e) => setPosition(e.target.value)}
                              placeholder="e.g. Senior Software Engineer / Manager"
                              className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Industry (Optional) */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                              {language === 'ta' ? 'தொழில் துறை' : 'Industry'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                            </label>
                            <input
                              type="text"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              placeholder="e.g. Information Technology / Healthcare"
                              className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                            />
                          </div>

                          {/* Total Years of Experience (Optional Chips) */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                              {language === 'ta' ? 'மொத்த அனுபவம்' : 'Total Experience'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                            </label>
                            <div className="flex flex-wrap gap-2 pt-0.5">
                              {["0-1 Years", "1-3 Years", "3-5 Years", "5-10 Years", "10+ Years"].map(exp => (
                                <button
                                  key={exp}
                                  type="button"
                                  onClick={() => setTotalExperience(exp)}
                                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${totalExperience === exp
                                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                  {exp}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">



                        {/* Volunteer — NEW */}
                        <div id="field-isVolunteer" className={getHighlightCls('isVolunteer')}>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            {language === 'ta' ? 'தன்னார்வ தொண்டர்' : 'Willing to Volunteer?'} <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsVolunteer('YES');
                                clearInvalidField('isVolunteer');
                              }}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${isVolunteer === 'YES'
                                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                                }`}
                            >
                              {language === 'ta' ? 'ஆம்' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsVolunteer('NO');
                                clearInvalidField('isVolunteer');
                              }}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${isVolunteer === 'NO'
                                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                                }`}
                            >
                              {language === 'ta' ? 'இல்லை' : 'No'}
                            </button>
                          </div>
                          {invalidFields.has('isVolunteer') && (
                            <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              {language === 'ta' ? 'தன்னார்வ விருப்பத்தைத் தேர்ந்தெடுக்கவும்' : 'Willing to Volunteer is required'}
                            </p>
                          )}
                        </div>

                        {/* Willing to Donate — NEW */}
                        <div id="field-willingToDonate" className={getHighlightCls('willingToDonate')}>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            {language === 'ta' ? 'நன்கொடை அளிக்க விருப்பம்' : 'Willing to Donate?'} <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setWillingToDonate('YES');
                                clearInvalidField('willingToDonate');
                              }}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${willingToDonate === 'YES'
                                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                                }`}
                            >
                              {language === 'ta' ? 'ஆம்' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setWillingToDonate('NO');
                                clearInvalidField('willingToDonate');
                              }}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${willingToDonate === 'NO'
                                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                                }`}
                            >
                              {language === 'ta' ? 'இல்லை' : 'No'}
                            </button>
                          </div>
                          {invalidFields.has('willingToDonate') && (
                            <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              {language === 'ta' ? 'நன்கொடை விருப்பத்தைத் தேர்ந்தெடுக்கவும்' : 'Willing to Donate is required'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(4)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'பின்செல்ல' : 'Back'}
                    </Button>
                    <Button type="submit" className="font-bold">
                      {language === 'ta' ? 'சரிபார்த்து சமர்ப்பிக்க செல்லவும்' : 'Review & Submit Registration'} <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 6: Review & Submit */}
              {step === 6 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-[#111111]">
                      {language === 'ta' ? 'படி 6: சரிபார்த்து பதிவை உறுதிசெய்யவும்' : 'Step 6: Review & Confirm Registration'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ta' ? 'இறுதி சமர்ப்பிப்புக்கு முன் உங்கள் அனைத்து விவரங்களையும் கவனமாகச் சரிபார்க்கவும்' : 'Please review all your details carefully before final submission'}
                    </p>
                  </div>

                  {/* Summary Card Preview */}
                  <div className="space-y-5">
                    {/* Header profile section */}
                    <div className="p-4 sm:p-5 bg-[#FFF7D6]/60 border border-[#F4C542]/50 rounded-2xl flex items-center space-x-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-[#F4C542] overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lg sm:text-xl font-extrabold text-[#111111]">{fullName}</h3>
                        <p className="text-xs sm:text-sm text-[#854D0E] font-bold">{calculatedBatchName} • {schoolName}</p>
                        <p className="text-xs text-gray-600 font-medium">{email} • {mobilePrefix} {mobile}</p>
                      </div>
                    </div>

                    {/* Section 1: Personal Info */}
                    <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-white shadow-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] flex items-center">
                          <User className="w-4 h-4 mr-2 text-[#854D0E]" /> {language === 'ta' ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Details'}
                        </h4>
                        <button type="button" onClick={() => goToStep(2)} className="text-xs font-bold text-[#854D0E] hover:underline px-2.5 py-1 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg cursor-pointer">
                          {language === 'ta' ? 'திருத்து' : 'Edit'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'பாலினம்:' : 'Gender:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{gender || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'பிறந்த தேதி:' : 'Date of Birth:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{dob || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'ரத்த வகை:' : 'Blood Group:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{bloodGroup || 'N/A'}</span>
                        </div>

                                                <div className="sm:col-span-2 lg:col-span-3">
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'முகவரி:' : 'Address:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'இடம்:' : 'Location:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{currentCity}, {state}, {country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: School Details */}
                    <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-white shadow-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 text-[#854D0E]" /> {language === 'ta' ? 'பள்ளி கல்வி' : 'School Education'}
                        </h4>
                        <button type="button" onClick={() => goToStep(3)} className="text-xs font-bold text-[#854D0E] hover:underline px-2.5 py-1 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg cursor-pointer">
                          {language === 'ta' ? 'திருத்து' : 'Edit'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'பள்ளி:' : 'School:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{schoolName}</span>
                        </div>
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'படித்த காலம்:' : 'Study Period:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{joiningYear} – {passingYear}</span>
                        </div>
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'வெளியேறிய வகுப்பு:' : 'Class at Leaving:'}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{leavingClass} {language === 'ta' ? 'வகுப்பு' : 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Higher Education */}
                    <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-white shadow-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-[#854D0E]" /> {language === 'ta' ? 'உயர் கல்வி' : 'Higher Education'}
                        </h4>
                        <button type="button" onClick={() => goToStep(4)} className="text-xs font-bold text-[#854D0E] hover:underline px-2.5 py-1 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg cursor-pointer">
                          {language === 'ta' ? 'திருத்து' : 'Edit'}
                        </button>
                      </div>
                      {noHigherEducation ? (
                        <p className="text-sm text-gray-500 italic font-medium">{language === 'ta' ? 'உயர் கல்வி இல்லை / பொருந்தாது' : 'No higher education specified / Not applicable'}</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'கல்லூரி:' : 'College:'}</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111]">{collegeName}</span>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'பட்டப்படிப்பு & துறை:' : 'Degree & Stream:'}</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111]">{degree === 'Other - write something' ? otherDegree : degree} ({stream})</span>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'முடித்த ஆண்டு:' : 'Graduation Year:'}</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111]">{collegePassingYear || 'N/A'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 4: Professional & Social Details */}
                    <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-4 bg-white shadow-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#111111] flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-[#854D0E]" /> {language === 'ta' ? 'தொழில் & சமூக விவரம்' : 'Professional & Social Links'}
                        </h4>
                        <button type="button" onClick={() => goToStep(5)} className="text-xs sm:text-sm font-bold text-[#854D0E] hover:underline px-3 py-1 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg cursor-pointer">
                          {language === 'ta' ? 'திருத்து' : 'Edit'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'வேலை நிலை:' : 'Status:'}</span>
                          <span className="text-sm sm:text-base font-bold text-[#111111]">{employmentStatus}</span>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'நிறுவனம் / பதவி:' : 'Company / Role:'}</span>
                          <span className="text-sm sm:text-base font-bold text-[#111111]">{company || 'N/A'} {position ? `(${position})` : ''}</span>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'பணி அனுபவம்:' : 'Experience:'}</span>
                          <span className="text-sm sm:text-base font-bold text-[#111111]">{totalExperience || 'N/A'}</span>
                        </div>
                        {linkedinUrl && (
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">LinkedIn:</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111] truncate block">{linkedinUrl}</span>
                          </div>
                        )}
                        {instagramUrl && (
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Instagram:</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111] truncate block">{instagramUrl}</span>
                          </div>
                        )}
                        {whatsappNumber && (
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">WhatsApp:</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111] truncate block">{whatsappNumber}</span>
                          </div>
                        )}

                        <div>
                          <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'தன்னார்வ தொண்டர்:' : 'Volunteer:'}</span>
                          <span className="text-sm sm:text-base font-bold text-[#111111]">{isVolunteer === 'YES' ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'நன்கொடை அளிக்க விருப்பம்:' : 'Willing to Donate:'}</span>
                          <span className="text-sm sm:text-base font-bold text-[#111111]">{willingToDonate === 'YES' ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Acceptance */}
                  <div id="field-agreeTerms" className={`p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-2xl flex items-start space-x-3 ${getHighlightCls('agreeTerms')}`}>
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        clearInvalidField('agreeTerms');
                      }}
                      className="w-5 h-5 text-[#F4C542] border-gray-300 rounded focus:ring-[#F4C542] cursor-pointer mt-0.5 shrink-0"
                    />
                    <label htmlFor="agreeTerms" className="text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed cursor-pointer select-none">
                      {language === 'ta'
                        ? 'இந்த பதிவு படிவத்தில் வழங்கப்பட்டுள்ள அனைத்து தகவல்களும் சரியானவை என்பதை உறுதிப்படுத்துகிறேன். முன்னாள் மாணவர்கள் சங்க விதிகளுக்கு உடன்படுகிறேன்.'
                        : 'I confirm that all information provided in this registration form is accurate. I agree to the Alumni Terms of Association and Privacy Guidelines.'}
                    </label>
                  </div>
                  {invalidFields.has('agreeTerms') && (
                    <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      {language === 'ta' ? 'பதிவைச் சமர்ப்பிக்க விதிகளையும் தனியுரிமைக் கொள்கையையும் ஒப்புக் கொள்ள வேண்டும்' : 'Please check the box to accept Terms & Conditions before submitting'}
                    </p>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(5)} className="w-full sm:w-auto">
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'திருத்த பின்செல்ல' : 'Back to Edit'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleFinalRegister}
                      isLoading={loading}
                      className="w-full sm:w-auto bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold py-3.5 px-8 text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>{language === 'ta' ? 'பதிவைச் சமர்ப்பிக்கவும்' : 'Submit Registration'}</span>
                      <ShieldCheck className="w-5 h-5 ml-1.5 stroke-[2.5]" />
                    </Button>
                  </div>
                </div>
              )}


            </div>
          </div>

        </div>

        {/* ====================================================== */}
        {/* Mobile Demo Video Trigger                              */}
        {/* ====================================================== */}
        <div className="lg:hidden mt-6 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-2xl p-4 text-center shadow-xs">
          <button
            type="button"
            onClick={() => {
              setDemoVideoType('REGISTRATION');
              setShowDemoModal(true);
            }}
            className="inline-flex items-center justify-center space-x-1.5 text-xs sm:text-sm font-bold text-[#111111] hover:text-[#854D0E] underline underline-offset-2 transition-colors cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 shrink-0 text-[#854D0E]" />
            <span>{language === 'ta' ? 'பதிவு வழிகாட்டி வீடியோவைப் பாருங்கள்' : 'Watch Registration Demo Video'}</span>
          </button>
        </div>

      </div>

      {/* Embedded Demo Video Modal */}
      <DemoVideoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        initialType={demoVideoType}
        language={language === 'ta' ? 'ta' : 'en'}
      />
    </div>
  );
};