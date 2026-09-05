import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck, Mail, Phone, User, GraduationCap, Building2, MapPin,
  KeyRound, ArrowRight, CheckCircle2, Lock, Camera, Globe, Briefcase,
  BookOpen, ArrowLeft, Upload, Check, Eye, EyeOff, Info, FileText, CheckSquare, ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { Button } from '../../components/Button';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/LanguageSelector';


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

export const AlumniRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

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

  // Helper to change step and track max step unlocked for backward & forward navigation
  const goToStep = (targetStep: 1 | 2 | 3 | 4 | 5 | 6) => {
    setStep(targetStep);
    setMaxStepReached((prev) => Math.max(prev, targetStep));
  };

  // Step 1 — Email & Verification State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [accountAlreadyExists, setAccountAlreadyExists] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const [currentCity, setCurrentCity] = useState('');
  const [mobilePrefix, setMobilePrefix] = useState('+91');
  const [mobile, setMobile] = useState('');

  // Step 3 — School Details
  const [schoolName, setSchoolName] = useState('NHS School');
  const [joiningYear, setJoiningYear] = useState('2010');
  const [passingYear, setPassingYear] = useState('2015');
  const [leavingClass, setLeavingClass] = useState('10th');

  // Step 4 — Higher Education Details
  const [noHigherEducation, setNoHigherEducation] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [otherDegree, setOtherDegree] = useState('');
  const [stream, setStream] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [collegeJoiningYear, setCollegeJoiningYear] = useState('');
  const [collegePassingYear, setCollegePassingYear] = useState('');

  // Step 5 — Current Professional Details & Social Links
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [totalExperience, setTotalExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYearNum - 1959 }, (_, i) => currentYearNum - i);
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const leavingClassOptions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
  const degreeOptions = [
    "B.E.", "B.Tech.", "M.E.", "M.Tech.", "B.Sc.", "M.Sc.", "BCA", "MCA",
    "BBA", "MBA", "B.Com.", "M.Com.", "BA", "MA", "Diploma", "Ph.D.", "Other - write something"
  ];
  const employmentStatusOptions = [
    "Employed", "Business / Self-Employed", "Student", "Unemployed", "Retired"
  ];

  useEffect(() => {
    // Fetch School Name from backend public stats
    api.getPublicStats()
      .then(stats => {
        if (stats && stats.school_name) setSchoolName(stats.school_name);
      })
      .catch(() => { });

    if (location.state?.email) {
      setEmail(location.state.email);
      setOtpSent(true);
      setShowEmailInput(true);
      if (location.state?.resumeStep) goToStep(location.state.resumeStep as any);
      if (location.state?.hasPassword) setHasExistingPassword(true);
      if (location.state?.fullName) setFullName(location.state.fullName);
      if (location.state?.profilePhotoUrl) setProfilePhotoUrl(location.state.profilePhotoUrl);
      if (location.state?.isGoogleAuth) setIsGoogleAuth(true);
    }

    if (api.getToken()) {
      api.getProfile()
        .then((p: any) => {
          if (p) {
            if (p.email) { setEmail(p.email); setOtpSent(true); setShowEmailInput(true); }
            if (p.full_name) setFullName(p.full_name);
            if (p.profile_photo_url) setProfilePhotoUrl(p.profile_photo_url);
            if (p.mobile) setMobile(p.mobile.replace(/^\+91\s?/, ''));
            if (p.current_city || p.city) setCurrentCity(p.current_city || p.city);
            if (p.gender) setGender(p.gender);
            if (p.dob) setDob(p.dob);
            if (p.blood_group) setBloodGroup(p.blood_group);
            if (p.father_name) setFatherName(p.father_name);
            if (p.mother_name) setMotherName(p.mother_name);
            if (p.school_name) setSchoolName(p.school_name);
            if (p.joining_year) setJoiningYear(String(p.joining_year));
            if (p.passing_year) setPassingYear(String(p.passing_year));
            if (p.leaving_class) setLeavingClass(p.leaving_class);
            if (p.no_higher_education) setNoHigherEducation(Boolean(p.no_higher_education));
            if (p.college_name || p.other_college) setCollegeName(p.college_name || p.other_college);
            if (p.degree) setDegree(p.degree);
            if (p.other_degree) setOtherDegree(p.other_degree);
            if (p.stream || p.other_stream) setStream(p.stream || p.other_stream);
            if (p.employment_status) setEmploymentStatus(p.employment_status);
            if (p.company) setCompany(p.company);
            if (p.position) setPosition(p.position);
            if (p.industry) setIndustry(p.industry);
            if (p.total_experience) setTotalExperience(p.total_experience);
            if (p.skills) setSkills(p.skills);
            if (p.linkedin_url) setLinkedinUrl(p.linkedin_url);
            if (p.instagram_url) setInstagramUrl(p.instagram_url);
            if (p.whatsapp_number) setWhatsappNumber(p.whatsapp_number);
            if (p.website_url) setWebsiteUrl(p.website_url);

            // Unlock up to step 6 if user profile data exists
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
        if (d.mobile) setMobile(d.mobile);
        if (d.gender) setGender(d.gender);
        if (d.dob) setDob(d.dob);
        if (d.bloodGroup) setBloodGroup(d.bloodGroup);
        if (d.fatherName) setFatherName(d.fatherName);
        if (d.motherName) setMotherName(d.motherName);
        if (d.currentCity) setCurrentCity(d.currentCity);
        if (d.passingYear) setPassingYear(d.passingYear);
        if (d.joiningYear) setJoiningYear(d.joiningYear);
        if (d.instagramUrl) setInstagramUrl(d.instagramUrl);
        if (d.whatsappNumber) setWhatsappNumber(d.whatsappNumber);
        if (d.websiteUrl) setWebsiteUrl(d.websiteUrl);
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

  // Step 1: Send OTP for Email Signup
  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccountAlreadyExists(false);

    if (!email || !email.trim() || !email.includes('@')) {
      alertService.showWarning('Email Address Required', 'Please enter a valid email address to receive your OTP verification code.');
      return;
    }
    setLoading(true);
    try {
      await api.sendOTP(email, undefined, false, undefined, false, true);
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

  // Step 1: Verify OTP and proceed directly to Step 2
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 6) {
      alertService.showWarning('Verification Code Required', 'Please enter the complete 6-digit security code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOTP(email, otp);
      if (res.resume_step && res.resume_step > 2) {
        setHasExistingPassword(true);
      }
      goToStep(2);
    } catch (err: any) {
      alertService.handleApiError(err, 'Invalid verification code entered.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate step data persistence helper
  const saveStepDataToDB = async (partialData: any) => {
    try {
      await api.register(partialData);
    } catch (e) {
      console.warn('Step registration draft database sync notice:', e);
    }
  };

  // Step 2 Validation: Personal Information -> Step 3 (School Details)
  const handleStep2Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: string[] = [];
    if (!fullName || !fullName.trim()) missing.push('Full Name');
    if (!gender) missing.push('Gender');
    if (!dob) missing.push('Date of Birth');
    if (!profilePhotoUrl) missing.push('Profile Photograph');
    if (!country || !country.trim()) missing.push('Country');
    if (!state || !state.trim()) missing.push('Current State');
    if (!currentCity || !currentCity.trim()) missing.push('Current City');
    if (!mobile || !mobile.trim()) missing.push('Mobile Number');

    if (missing.length > 0) {
      alertService.showWarning(
        'Required Personal Information Missing',
        `Please complete the following required fields to continue:\n• ${missing.join('\n• ')}`
      );
      return;
    }

    if (mobile.replace(/\D/g, '').length < 10) {
      alertService.showWarning('Invalid Mobile Number', 'Please enter a valid 10-digit mobile phone number.');
      return;
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
      profile_photo_url: profilePhotoUrl,
      current_city: currentCity.trim(),
      city: currentCity.trim(),
      state: state.trim(),
      country: country.trim() || 'India',
      passing_year: parseInt(passingYear) || 2015
    });

    goToStep(3);
  };

  // Step 3 Validation: School Details -> Step 4 (Education History)
  const handleStep3Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: string[] = [];
    if (!schoolName || !schoolName.trim()) missing.push('School Name');
    if (!joiningYear) missing.push('Admission / Joining Year');
    if (!passingYear) missing.push('Leaving / Passing Year');
    if (!leavingClass) missing.push('Class / Standard at Leaving');

    if (missing.length > 0) {
      alertService.showWarning(
        'Required School Details Missing',
        `Please complete the following required fields to continue:\n• ${missing.join('\n• ')}`
      );
      return;
    }

    if (parseInt(joiningYear) > parseInt(passingYear)) {
      alertService.showWarning(
        'Invalid School Education Timeline',
        `Admission / Joining Year (${joiningYear}) cannot be greater (later) than Leaving / Passing Year (${passingYear}). Please correct your school timeline.`
      );
      return;
    }

    // Save Step 3 details immediately to DB
    const fullMobile = mobile.startsWith('+') ? mobile : `${mobilePrefix} ${mobile}`.trim();
    saveStepDataToDB({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: fullMobile,
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

    if (!noHigherEducation) {
      const missing: string[] = [];
      if (!collegeName || !collegeName.trim()) missing.push('College / Institution Name');
      if (!degree) missing.push('Degree / Course');
      if (degree === 'Other - write something' && (!otherDegree || !otherDegree.trim())) missing.push('Custom Degree Name');
      if (!stream || !stream.trim()) missing.push('Department / Stream');
      if (!collegeJoiningYear) missing.push('College Joining Year');
      if (!collegePassingYear) missing.push('College Passing Year');

      if (missing.length > 0) {
        alertService.showWarning(
          'Required College Details Missing',
          `Please complete the following required fields (or check "No higher education") to continue:\n• ${missing.join('\n• ')}`
        );
        return;
      }

      if (parseInt(collegeJoiningYear) > parseInt(collegePassingYear)) {
        alertService.showWarning(
          'Invalid College Education Timeline',
          `College Admission / Joining Year (${collegeJoiningYear}) cannot be greater (later) than College Passing / Graduation Year (${collegePassingYear}). Please correct your college timeline.`
        );
        return;
      }
    }

    // Save Step 4 details immediately to DB
    const fullMobile = mobile.startsWith('+') ? mobile : `${mobilePrefix} ${mobile}`.trim();
    const finalDegree = degree === 'Other - write something' ? otherDegree : degree;
    saveStepDataToDB({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: fullMobile,
      passing_year: parseInt(passingYear) || 2015,
      no_higher_education: noHigherEducation,
      college_name: !noHigherEducation ? collegeName.trim() : undefined,
      degree: !noHigherEducation ? finalDegree : undefined,
      other_degree: degree === 'Other - write something' ? otherDegree.trim() : undefined,
      stream: !noHigherEducation ? stream.trim() : undefined,
      register_number: !noHigherEducation ? registerNumber.trim() : undefined,
      college_joining_year: !noHigherEducation && collegeJoiningYear ? parseInt(collegeJoiningYear) : undefined,
      college_passing_year: !noHigherEducation && collegePassingYear ? parseInt(collegePassingYear) : undefined,
      current_city: currentCity.trim()
    });

    goToStep(5);
  };

  // Step 5 Validation: Professional Details -> Step 6 (Review & Submit)
  const handleStep5Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: string[] = [];
    if (!employmentStatus) missing.push('Employment Status');
    if (!currentCity || !currentCity.trim()) missing.push('Current City');

    if (missing.length > 0) {
      alertService.showWarning(
        'Required Professional Details Missing',
        `Please complete the following required fields to continue:\n• ${missing.join('\n• ')}`
      );
      return;
    }

    // Save Step 5 details immediately to DB
    const fullMobile = mobile.startsWith('+') ? mobile : `${mobilePrefix} ${mobile}`.trim();
    saveStepDataToDB({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: fullMobile,
      passing_year: parseInt(passingYear) || 2015,
      employment_status: employmentStatus,
      company: company.trim() || undefined,
      position: position.trim() || undefined,
      profession: position.trim() || employmentStatus,
      industry: industry.trim() || undefined,
      total_experience: totalExperience || undefined,
      skills: skills.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      instagram_url: instagramUrl.trim() || undefined,
      whatsapp_number: whatsappNumber.trim() || undefined,
      website_url: websiteUrl.trim() || undefined,
      current_city: currentCity.trim()
    });

    goToStep(6);
  };

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Step 6 Submission: Final Register
  const handleFinalRegister = async () => {
    if (!agreeTerms) {
      alertService.showWarning(
        language === 'ta' ? 'விதிமுறைகளை ஏற்கவும்' : 'Terms Required',
        language === 'ta'
          ? 'பதிவைச் சமர்ப்பிக்க விதிகளையும் தனியுரிமைக் கொள்கையையும் ஒப்புக் கொள்ள வேண்டும்.'
          : 'Please accept the Alumni Terms & Association policies before submitting your registration.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const finalDegree = degree === 'Other - write something' ? otherDegree : degree;

      const payload = {
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        full_name: fullName.trim(),
        gender: gender,
        dob: dob,
        blood_group: bloodGroup || undefined,
        father_name: fatherName.trim() || undefined,
        mother_name: motherName.trim() || undefined,
        country_code: mobilePrefix,
        country: country,
        state: state.trim(),
        current_city: currentCity.trim(),
        profile_photo_url: profilePhotoUrl,

        // School Education
        school_name: schoolName.trim(),
        joining_year: parseInt(joiningYear) || 2010,
        passing_year: parseInt(passingYear) || 2015,
        leaving_class: leavingClass,
        admission_number: "ADM-" + Math.floor(1000 + Math.random() * 9000),

        // Higher Education
        no_higher_education: noHigherEducation,
        college_name: !noHigherEducation ? collegeName.trim() : undefined,
        degree: !noHigherEducation ? finalDegree : undefined,
        other_degree: degree === 'Other - write something' ? otherDegree.trim() : undefined,
        stream: !noHigherEducation ? stream.trim() : undefined,
        register_number: !noHigherEducation ? registerNumber.trim() : undefined,
        college_joining_year: !noHigherEducation && collegeJoiningYear ? parseInt(collegeJoiningYear) : undefined,
        college_passing_year: !noHigherEducation && collegePassingYear ? parseInt(collegePassingYear) : undefined,

        // Professional & Social Contact Details
        employment_status: employmentStatus,
        company: company.trim() || undefined,
        position: position.trim() || undefined,
        profession: position.trim() || employmentStatus,
        industry: industry.trim() || undefined,
        total_experience: totalExperience || undefined,
        skills: skills.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        instagram_url: instagramUrl.trim() || undefined,
        whatsapp_number: whatsappNumber.trim() || undefined,
        website_url: websiteUrl.trim() || undefined
      };

      await api.register(payload);
      await alertService.showSuccess(
        language === 'ta' ? 'பதிவு முடிந்தது & மின்னஞ்சல் அனுப்பப்பட்டது! 📧' : 'Registration Submitted & Confirmation Email Sent! 📧',
        language === 'ta'
          ? 'நன்றி! உங்கள் பதிவு பெறப்பட்டது. உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பப்பட்டுள்ளது. பள்ளி நிர்வாகத்தின் சரிபார்ப்புக்காகக் காத்திருக்கவும். சரிபார்க்கப்பட்டதும் மின்னஞ்சல் அறிவிப்பு மற்றும் போர்டல் அணுகல் வழங்கப்படும்.'
          : 'Thank you for registering! A confirmation email has been sent. Your profile is now awaiting School Admin verification. Once verified, you will receive an approval email and full portal access.'
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
      sub: language === 'ta' ? 'மின்னஞ்சல் OTP சரிபார்க்க' : 'Verify Email OTP'
    },
    {
      num: 2,
      label: language === 'ta' ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Info',
      sub: language === 'ta' ? 'தொடர்பு & புகைப்பட விவரங்கள்' : 'Contact & Profile Photo'
    },
    {
      num: 3,
      label: language === 'ta' ? 'பள்ளி விவரங்கள்' : 'School Details',
      sub: language === 'ta' ? 'படித்த ஆண்டு & வகுப்பு' : 'Passing Year & Batch'
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

  // Helper to compute expected 12th graduation batch year
  const getEffectiveBatchYear = (passingYearStr: string, classStr: string): number => {
    const yr = parseInt(passingYearStr) || 2015;
    if (!classStr) return yr;
    const num = parseInt(classStr.replace(/\D/g, ''));
    if (isNaN(num) || num >= 12 || num < 1) return yr;
    return yr + (12 - num);
  };
  const effectiveBatchYear = getEffectiveBatchYear(passingYear, leavingClass);
  const calculatedBatchName = passingYear ? `Batch of ${effectiveBatchYear}` : 'Select Passing Year';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pt-6 sm:pt-8 pb-16 font-sans selection:bg-[#F4C542] selection:text-[#111111]">


      <div className="max-w-6xl mx-auto px-4 sm:px-6">

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
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Grid: Sticky Sidebar Progress (4 cols) & Form Body (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR: Sticky Scroll Premium Vertical Stepper UI (Anchored comfortably below header) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-[148px] self-start space-y-6">
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
                  const isUnlocked = s.num <= maxStepReached || s.num <= step || (otpSent && s.num <= maxStepReached + 1);
                  const isCompleted = s.num < step || s.num < maxStepReached;
                  const isLast = index === stepsList.length - 1;

                  return (
                    <div key={s.num} className="relative flex items-start space-x-4 pb-7 last:pb-0 group">
                      {/* Step Circle & Perfectly Centered Line Container */}
                      <div className="relative flex flex-col items-center shrink-0 w-8">
                        {/* Step Circle Node */}
                        <button
                          type="button"
                          onClick={() => {
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
                              ? 'bg-[#10B981] text-white shadow-xs'
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
                            className={`absolute top-8 -bottom-7 w-0.5 left-1/2 -translate-x-1/2 z-0 transition-colors ${isCompleted ? 'bg-[#10B981]' : 'bg-gray-200'
                              }`}
                          />
                        )}
                      </div>

                      {/* Step Text Label */}
                      <div
                        onClick={() => isUnlocked && goToStep(s.num as any)}
                        className={`min-w-0 flex-1 pt-0.5 ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <div className={`text-sm leading-tight transition-colors ${isActive
                            ? 'font-extrabold text-[#111111]'
                            : isCompleted
                              ? 'font-bold text-gray-800 hover:text-[#111111]'
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
                  <span className="font-bold text-[#854D0E]">{Math.round((step / 6) * 100)}% {language === 'ta' ? 'நிறைவடைந்தது' : 'Completed'}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F4C542] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(step / 6) * 100}%` }}
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
          </div>

          {/* RIGHT COLUMN: Form Card */}

          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm">

              {/* STEP 1: Sign Up & Email Verification */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#111111]">
                        {language === 'ta' ? 'படி 1: கணக்கு சரிபார்ப்பு' : 'Step 1: Account Verification'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ta'
                          ? 'உங்கள் முன்னாள் மாணவர் பதிவைத் தொடங்க உங்கள் முதன்மை மின்னஞ்சல் முகவரியைச் சரிபார்க்கவும்'
                          : 'Verify your primary email address to begin your alumni registration'}
                      </p>
                    </div>
                    {maxStepReached > 1 && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => goToStep(2)}>
                        {language === 'ta' ? 'படி 2-க்கு செல்ல' : 'Forward to Step 2'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>

                  {!otpSent ? (
                    <form onSubmit={handleSendEmailOTP} className="space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          {language === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111] placeholder-gray-400"
                          />
                          <Mail className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {accountAlreadyExists && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-800 space-y-2">
                          <p className="font-bold">
                            {language === 'ta'
                              ? 'இந்த மின்னஞ்சல் முகவரியில் ஏற்கனவே கணக்கு உள்ளது.'
                              : 'An account already exists with this email address.'}
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
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs sm:text-sm text-[#854D0E] font-medium flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#854D0E] shrink-0" />
                          <span>
                            {language === 'ta' ? 'சரிபார்ப்பு OTP அனுப்பப்பட்டது: ' : 'Verification OTP code sent to '}
                            <strong>{email}</strong>
                          </span>
                        </div>
                        <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-bold text-[#854D0E] underline">
                          {language === 'ta' ? 'மின்னஞ்சலை மாற்ற' : 'Change Email'}
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
                    </form>
                  )}
                </div>
              )}


              {/* STEP 2: Personal Information */}
              {step === 2 && (
                <form onSubmit={handleStep2Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#111111]">
                        {language === 'ta' ? 'படி 2: தனிப்பட்ட விவரங்கள்' : 'Step 2: Personal Information'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ta' ? 'உங்கள் தொடர்பு விவரங்கள் மற்றும் சுயவிவரப் புகைப்படத்தை வழங்கவும்' : 'Provide your verified contact details and profile photograph'}
                      </p>
                    </div>
                    {maxStepReached > 2 && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => goToStep(3)}>
                        {language === 'ta' ? 'படி 3-க்கு செல்ல' : 'Forward to Step 3'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      {language === 'ta' ? 'சுயவிவர புகைப்படம்' : 'Profile Photograph'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center space-x-5">
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#111111] text-xs font-semibold rounded-xl cursor-pointer transition-all border border-gray-200">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'புகைப்படத்தைப் பதிவேற்றவும்' : 'Upload Photo'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        <p className="text-[11px] text-gray-500">JPG, PNG format up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'முழு பெயர் (சான்றிதழில் உள்ளது போல்)' : 'Full Name (As per school records)'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={language === 'ta' ? 'உங்கள் அதிகாரப்பூர்வ முழு பெயரை உள்ளிடவும்' : 'Enter your full official name'}
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {language === 'ta' ? 'பாலினம்' : 'Gender'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
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
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {language === 'ta' ? 'பிறந்த தேதி' : 'Date of Birth'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full py-2 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111]"
                      />
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

                    {/* Father's Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {language === 'ta' ? 'தந்தையின் பெயர்' : "Father's Name"} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                      </label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder={language === 'ta' ? 'தந்தையின் பெயர் உள்ளிடவும்' : "Enter father's full name"}
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111] placeholder-gray-400"
                      />
                    </div>

                    {/* Mother's Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        {language === 'ta' ? 'தாயாரின் பெயர்' : "Mother's Name"} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                      </label>
                      <input
                        type="text"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        placeholder={language === 'ta' ? 'தாயாரின் பெயர் உள்ளிடவும்' : "Enter mother's full name"}
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-semibold text-[#111111] placeholder-gray-400"
                      />
                    </div>

                    {/* Mobile Number with Country Code */}
                    <div className="sm:col-span-2 grid grid-cols-12 gap-4">
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
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          maxLength={10}
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                      </div>
                    </div>

                    {/* Country Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'வசிக்கும் நாடு' : 'Country'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
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
                    </div>

                    {/* Current State */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'தற்போதைய மாநிலம்' : 'Current State'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Tamil Nadu"
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                      />
                    </div>

                    {/* Current City */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'தற்போதைய நகரம்' : 'Current City'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentCity}
                        onChange={(e) => setCurrentCity(e.target.value)}
                        placeholder="e.g. Chennai / Madurai"
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'பின்செல்ல' : 'Back'}
                    </Button>
                    <div className="flex items-center space-x-2">
                      {maxStepReached > 2 && (
                        <Button type="button" variant="secondary" onClick={() => goToStep(3)}>
                          {language === 'ta' ? 'முன்னோக்கி →' : 'Forward →'}
                        </Button>
                      )}
                      <Button type="submit" className="font-bold">
                        {language === 'ta' ? 'சேமித்து பள்ளி விவரங்களுக்கு செல்லவும்' : 'Save & Continue to School Details'} <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </form>
              )}


              {/* STEP 3: School Details */}
              {step === 3 && (
                <form onSubmit={handleStep3Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#111111]">
                        {language === 'ta' ? 'படி 3: பள்ளி கல்வி விவரங்கள்' : 'Step 3: School Education Details'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ta' ? 'உங்கள் பள்ளி, சேர்ந்த ஆண்டு, தேர்ச்சி பெற்ற ஆண்டு மற்றும் வகுப்பைக் குறிப்பிடவும்' : 'Specify your school study timeline and passing batch'}
                      </p>
                    </div>
                    {maxStepReached > 3 && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => goToStep(4)}>
                        {language === 'ta' ? 'படி 4-க்கு செல்ல' : 'Forward to Step 4'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* School Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'பள்ளியின் பெயர்' : 'School Name'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base font-bold text-[#111111]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Admission / Joining Year */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'பள்ளியில் சேர்ந்த ஆண்டு' : 'Admission / Joining Year'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={joiningYear}
                            onChange={(e) => setJoiningYear(e.target.value)}
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] font-normal appearance-none pr-8 cursor-pointer"
                          >
                            <option value="">{language === 'ta' ? 'சேர்ந்த ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Joining Year'}</option>
                            {yearOptions.map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Leaving / Passing Year */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'பள்ளியை விட்டு வெளியேறிய / தேர்ச்சி பெற்ற ஆண்டு' : 'Leaving / Passing Year'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={passingYear}
                            onChange={(e) => setPassingYear(e.target.value)}
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] font-normal appearance-none pr-8 cursor-pointer"
                          >
                            <option value="">{language === 'ta' ? 'தேர்ச்சி பெற்ற ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Passing Year'}</option>
                            {yearOptions.map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Class / Standard at Leaving with Selection Chips */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {language === 'ta' ? 'பள்ளி முடித்த போது இருந்த வகுப்பு' : 'Class / Standard at Leaving'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1 mb-2">
                        {leavingClassOptions.map(cls => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setLeavingClass(cls)}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${leavingClass === cls
                                ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                              }`}
                          >
                            {cls} {language === 'ta' ? 'வகுப்பு' : 'Std'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-generated Batch Preview Box */}
                    <div className="p-4 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="w-6 h-6 text-[#854D0E]" />
                        <div>
                          <div className="text-xs text-[#854D0E] font-medium">
                            {language === 'ta' ? 'ஒதுக்கப்பட்ட கல்வி வகுப்புத் தொகுதி' : 'Assigned Academic Batch'}
                          </div>
                          <div className="text-sm font-bold text-[#111111]">{calculatedBatchName}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-[#F4C542] text-[#111111] text-xs font-bold rounded-lg">
                        {language === 'ta' ? 'தானாக உருவாக்கப்பட்டது' : 'Auto Generated'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'பின்செல்ல' : 'Back'}
                    </Button>
                    <div className="flex items-center space-x-2">
                      {maxStepReached > 3 && (
                        <Button type="button" variant="secondary" onClick={() => goToStep(4)}>
                          {language === 'ta' ? 'முன்னோக்கி →' : 'Forward →'}
                        </Button>
                      )}
                      <Button type="submit" className="font-bold">
                        {language === 'ta' ? 'சேமித்து உயர் கல்வி விவரங்களுக்கு செல்லவும்' : 'Save & Continue to Education History'} <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </form>
              )}


              {/* STEP 4: Higher Education / College Details */}
              {step === 4 && (
                <form onSubmit={handleStep4Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#111111]">
                        {language === 'ta' ? 'படி 4: உயர் கல்வி விவரங்கள்' : 'Step 4: Education History'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ta' ? 'கல்லூரி, பட்டப்படிப்பு மற்றும் உயர் கல்வி விவரங்கள்' : 'College, Degree, and Higher Education Details'}
                      </p>
                    </div>
                    {maxStepReached > 4 && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => goToStep(5)}>
                        {language === 'ta' ? 'படி 5-க்கு செல்ல' : 'Forward to Step 5'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>

                  {/* Option: Checkbox for No Higher Education */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="noHigherEducation"
                      checked={noHigherEducation}
                      onChange={(e) => setNoHigherEducation(e.target.checked)}
                      className="w-5 h-5 text-[#F4C542] border-gray-300 rounded focus:ring-[#F4C542] cursor-pointer"
                    />
                    <label htmlFor="noHigherEducation" className="text-xs font-semibold text-[#111111] cursor-pointer select-none">
                      {language === 'ta' ? 'உயர் கல்வி இல்லை / பள்ளி படிப்புடன் முடிந்தது' : 'No higher education / Not applicable or prefer not to say'}
                    </label>
                  </div>

                  {!noHigherEducation && (
                    <div className="space-y-6 pt-2">
                      {/* College / Institution Name */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'கல்லூரி / கல்வி நிறுவனத்தின் பெயர்' : 'College / Institution Name'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={!noHigherEducation}
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          placeholder="e.g. Anna University / IIT Madras / Loyola College"
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                      </div>

                      {/* Degree / Course Dropdown & Chips */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          {language === 'ta' ? 'பட்டப்படிப்பு / தகுதி' : 'Degree / Course'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {["B.E.", "B.Tech.", "B.Sc.", "M.Sc.", "BCA", "MCA", "BBA", "MBA", "B.Com.", "Diploma"].map(deg => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => setDegree(deg)}
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
                            required={!noHigherEducation}
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
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
                            {language === 'ta' ? 'பட்டப்படிப்பின் பெயரை உள்ளிடவும்' : 'Enter Degree / Qualification Name'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={otherDegree}
                            onChange={(e) => setOtherDegree(e.target.value)}
                            placeholder="e.g. B.Des / B.Arch / MBBS"
                            className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                          />
                        </div>
                      )}

                      {/* Department / Stream */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'துறை / பாடப்பிரிவு' : 'Department / Stream / Major'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={!noHigherEducation}
                          value={stream}
                          onChange={(e) => setStream(e.target.value)}
                          placeholder="e.g. Computer Science / Mechanical Engineering / Physics"
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                      </div>

                      {/* Register / Roll Number (Optional) */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {language === 'ta' ? 'பதிவு எண்' : 'Register / Roll Number'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                        </label>
                        <input
                          type="text"
                          value={registerNumber}
                          onChange={(e) => setRegisterNumber(e.target.value)}
                          placeholder="e.g. 710015104001"
                          className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* College Joining Year */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            {language === 'ta' ? 'சேர்ந்த ஆண்டு' : 'Admission / Joining Year'} <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              required={!noHigherEducation}
                              value={collegeJoiningYear}
                              onChange={(e) => setCollegeJoiningYear(e.target.value)}
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

                        {/* College Passing Year */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            {language === 'ta' ? 'முடித்த ஆண்டு' : 'Graduation / Passing Year'} <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              required={!noHigherEducation}
                              value={collegePassingYear}
                              onChange={(e) => setCollegePassingYear(e.target.value)}
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
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'பின்செல்ல' : 'Back'}
                    </Button>
                    <div className="flex items-center space-x-2">
                      {maxStepReached > 4 && (
                        <Button type="button" variant="secondary" onClick={() => goToStep(5)}>
                          {language === 'ta' ? 'முன்னோக்கி →' : 'Forward →'}
                        </Button>
                      )}
                      <Button type="submit" className="font-bold">
                        {language === 'ta' ? 'சேமித்து வேலை விவரங்களுக்கு செல்லவும்' : 'Save & Continue to Professional Details'} <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* STEP 5: Professional & Work Details */}
              {step === 5 && (
                <form onSubmit={handleStep5Next} className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#111111]">
                        {language === 'ta' ? 'படி 5: தற்போதைய வேலை மற்றும் பணி விவரங்கள்' : 'Step 5: Current Professional Details'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {language === 'ta' ? 'பணி அனுபவம், தற்போதைய நிறுவனம் மற்றும் திறன்கள்' : 'Work experience, current organization, and skills'}
                      </p>
                    </div>
                    {maxStepReached > 5 && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => goToStep(6)}>
                        {language === 'ta' ? 'படி 6-க்கு செல்ல' : 'Forward to Step 6'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Employment Status with Selection Chips */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {language === 'ta' ? 'வேலை நிலை' : 'Employment Status'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1 mb-2">
                        {[
                          { key: "Employed", labelEn: "Employed", labelTa: "பணியில் உள்ளவர்" },
                          { key: "Business / Self-Employed", labelEn: "Business / Self-Employed", labelTa: "சுயதொழில் / தொழில்முனைவோர்" },
                          { key: "Student", labelEn: "Student", labelTa: "மாணவர்" },
                          { key: "Unemployed", labelEn: "Unemployed", labelTa: "வேலையில்லாதவர்" },
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

                    {/* Professional Skills (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'ta' ? 'முக்கிய தொழில் திறன்கள்' : 'Professional Skills'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                      </label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. Python, React, Project Management, Sales"
                        className="w-full py-2.5 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-base text-[#111111] placeholder-gray-400 font-normal"
                      />
                    </div>

                    {/* Social & Contact Share Links Section */}
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-[#854D0E]" />
                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                          {language === 'ta' ? 'சமூக ஊடக & தொடர்பு பகிர்தல் இணைப்புகள்' : 'Social & Contact Share Links'} <span className="text-gray-400 font-normal">{language === 'ta' ? '(விருப்பமானது)' : '(Optional)'}</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* LinkedIn Profile */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                            LinkedIn Profile
                          </label>
                          <input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full py-2 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-sm font-semibold text-[#111111] placeholder-gray-400"
                          />
                        </div>

                        {/* Instagram Profile */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                            Instagram Profile / Handle
                          </label>
                          <input
                            type="text"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            placeholder="https://instagram.com/username or @username"
                            className="w-full py-2 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-sm font-semibold text-[#111111] placeholder-gray-400"
                          />
                        </div>

                        {/* WhatsApp Number */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                            WhatsApp Phone Number
                          </label>
                          <input
                            type="tel"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="+919876543210"
                            className="w-full py-2 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-sm font-semibold text-[#111111] placeholder-gray-400"
                          />
                        </div>

                        {/* Website URL */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                            Personal / Business Website
                          </label>
                          <input
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full py-2 px-0 bg-transparent border-b-2 border-gray-300 focus:border-[#111111] focus:outline-none transition-colors text-sm font-semibold text-[#111111] placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(4)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'பின்செல்ல' : 'Back'}
                    </Button>
                    <div className="flex items-center space-x-2">
                      {maxStepReached > 5 && (
                        <Button type="button" variant="secondary" onClick={() => goToStep(6)}>
                          {language === 'ta' ? 'முன்னோக்கி →' : 'Forward →'}
                        </Button>
                      )}
                      <Button type="submit" className="font-bold">
                        {language === 'ta' ? 'சரிபார்த்து சமர்ப்பிக்க செல்லவும்' : 'Review & Submit Registration'} <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
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
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'தந்தையின் பெயர்:' : "Father's Name:"}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{fatherName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'தாயாரின் பெயர்:' : "Mother's Name:"}</span>
                          <span className="text-xs sm:text-sm font-semibold text-[#111111]">{motherName || 'N/A'}</span>
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
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{language === 'ta' ? 'கல்லூரி காலம்:' : 'College Period:'}</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111]">{collegeJoiningYear || 'N/A'} – {collegePassingYear || 'N/A'}</span>
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
                        {websiteUrl && (
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Website:</span>
                            <span className="text-sm sm:text-base font-bold text-[#111111] truncate block">{websiteUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Acceptance */}
                  <div className="p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-2xl flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-5 h-5 text-[#F4C542] border-gray-300 rounded focus:ring-[#F4C542] cursor-pointer mt-0.5 shrink-0"
                    />
                    <label htmlFor="agreeTerms" className="text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed cursor-pointer select-none">
                      {language === 'ta'
                        ? 'இந்த பதிவு படிவத்தில் வழங்கப்பட்டுள்ள அனைத்து தகவல்களும் சரியானவை என்பதை உறுதிப்படுத்துகிறேன். முன்னாள் மாணவர்கள் சங்க விதிகளுக்கு உடன்படுகிறேன்.'
                        : 'I confirm that all information provided in this registration form is accurate. I agree to the Alumni Terms of Association and Privacy Guidelines.'}
                    </label>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => goToStep(5)} className="w-full sm:w-auto">
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> {language === 'ta' ? 'திருத்த பின்செல்ல' : 'Back to Edit'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleFinalRegister}
                      isLoading={loading}
                      disabled={!agreeTerms}
                      className="w-full sm:w-auto bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-extrabold py-3.5 px-8 text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{language === 'ta' ? 'அதிகாரப்பூர்வ பதிவைச் சமர்ப்பிக்கவும்' : 'Submit Official Registration'}</span>
                      <ShieldCheck className="w-5 h-5 ml-1.5 stroke-[2.5]" />
                    </Button>
                  </div>
                </div>
              )}


            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
