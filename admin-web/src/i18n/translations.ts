export type Language = 'en' | 'ta';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar & Common
    app_title: "ALUMNI PORTAL",
    tagline: "Official School Alumni Association",
    nav_home: "Home",
    nav_about: "About Us",
    nav_school_profile: "School Profile",
    nav_batches: "Batches",
    nav_events: "Events",
    nav_memories: "Memories",
    nav_contact: "Contact",
    nav_get_mobile_app: "GET MOBILE APP",
    nav_register: "REGISTER",
    nav_login: "LOGIN",
    nav_logout: "LOGOUT",
    language_name: "English",

    // Hero & Home Page
    hero_badge: "Official Alumni Network Platform",
    hero_title_1: "CONNECTING PAST & PRESENT",
    hero_title_2: "ALUMNI NETWORK",
    hero_subtitle: "Reconnect with batchmates, share cherished memories, attend reunions, and support your alma mater's growth.",
    join_network_btn: "JOIN ALUMNI NETWORK",
    explore_events_btn: "EXPLORE EVENTS",
    community_stats_title: "STRENGTH OF OUR COMMUNITY",
    stat_alumni: "Registered Alumni",
    stat_batches: "Active Batches",
    stat_events: "Events Hosted",
    stat_memories: "Shared Memories",
    upcoming_events_title: "UPCOMING ALUMNI EVENTS",
    view_all_events: "View All Events",
    no_events_yet: "No upcoming events scheduled at this moment.",
    recent_memories_title: "CHERISHED MEMORIES",
    view_all_memories: "View Gallery",
    no_memories_yet: "No memories uploaded yet. Be the first to share!",
    school_admin_request_title: "Are You a School Administrator?",
    school_admin_request_desc: "Register your school to manage alumni records, organize batch reunions, publish announcements, and track community engagement.",
    register_school_btn: "REGISTER YOUR SCHOOL",

    // School Profile
    school_profile_title: "SCHOOL PROFILE & HISTORY",
    school_code: "School Code",
    established: "Established",
    location: "Location",
    principal_message: "Principal's Message",
    total_alumni: "Total Alumni",
    active_batches: "Batches Registered",
    contact_info: "Contact Information",

    // Events Page
    events_page_title: "REUNIONS & ALUMNI EVENTS",
    event_date: "Date",
    event_time: "Time",
    event_venue: "Venue",
    event_capacity: "Capacity",
    event_register_btn: "Register for Event",
    spots_remaining: "spots left",

    // Memories Page
    memories_page_title: "ALUMNI MEMORY WALL",
    share_memory_btn: "Share a Memory",
    batch_year: "Batch Year",
    uploaded_by: "Uploaded by",

    // Footer
    footer_tagline: "Building Lifelong Connections for Schools & Alumni.",
    copyright: "Copyright © 2026. All rights reserved. Powered by JustGatherNow.",
    developer_portal: "Developer Portal",
    school_admin_login: "School Admin Portal",
  },
  ta: {
    // Navbar & Common
    app_title: "பழைய மாணவர்கள் சங்கம்",
    tagline: "அதிகாரப்பூர்வ பள்ளி பழைய மாணவர்கள் சங்கம்",
    nav_home: "முகப்பு",
    nav_about: "எங்களைப் பற்றி",
    nav_school_profile: "பள்ளி விவரம்",
    nav_batches: "வகுப்புகள்",
    nav_events: "நிகழ்வுகள்",
    nav_memories: "நினைவுகள்",
    nav_contact: "தொடர்புகொள்ள",
    nav_get_mobile_app: "மொபைல் செயலி பெறுக",
    nav_register: "பதிவு செய்ய",
    nav_login: "உள்நுழைக",
    nav_logout: "வெளியேறுக",
    language_name: "தமிழ்",

    // Hero & Home Page
    hero_badge: "அதிகாரப்பூர்வ பழைய மாணவர்கள் வலைப்பின்னல்",
    hero_title_1: "கடந்த காலத்தையும் நிகழ்காலத்தையும் இணைக்கிறது",
    hero_title_2: "பழைய மாணவர்கள் சங்கம்",
    hero_subtitle: "பழைய வகுப்பு தோழர்களுடன் மீண்டும் இணையுங்கள், நினைவுகளைப் பகிர்ந்து கொள்ளுங்கள், நிகழ்வுகளில் பங்கேற்கவும், தாய் பள்ளிக்கு ஆதரவளிக்கவும்.",
    join_network_btn: "சங்கத்தில் சேரவும்",
    explore_events_btn: "நிகழ்வுகளைப் பார்க்க",
    community_stats_title: "நமது சமூகத்தின் பலம்",
    stat_alumni: "பதிவுசெய்த பழைய மாணவர்கள்",
    stat_batches: "செயலில் உள்ள வகுப்புகள்",
    stat_events: "நடத்தப்பட்ட நிகழ்வுகள்",
    stat_memories: "பகிரப்பட்ட நினைவுகள்",
    upcoming_events_title: "வரவிருக்கும் நிகழ்வுகள்",
    view_all_events: "அனைத்து நிகழ்வுகளையும் பார்க்க",
    no_events_yet: "தற்போது புதிய நிகழ்வுகள் எதுவும் திட்டமிடப்படவில்லை.",
    recent_memories_title: "போற்றத்தக்க நினைவுகள்",
    view_all_memories: "கேலரியைப் பார்க்க",
    no_memories_yet: "நினைவுகள் எதுவும் இன்னும் பதிவேற்றப்படவில்லை. முதன்முதலில் பகிரவும்!",
    school_admin_request_title: "நீங்கள் பள்ளி நிர்வாகியா?",
    school_admin_request_desc: "பழைய மாணவர்களை நிர்வகிக்க, வகுப்புகளை உருவாக்க, மறுசந்திப்புகளை ஏற்பாடு செய்ய உங்கள் பள்ளியைப் பதிவு செய்யுங்கள்.",
    register_school_btn: "உங்கள் பள்ளியைப் பதிவு செய்க",

    // School Profile
    school_profile_title: "பள்ளி விவரம் மற்றும் வரலாறு",
    school_code: "பள்ளி குறியீடு",
    established: "நிறுவப்பட்டது",
    location: "இடம்",
    principal_message: "முதல்வரின் செய்தி",
    total_alumni: "மொத்த பழைய மாணவர்கள்",
    active_batches: "பதிவு செய்யப்பட்ட வகுப்புகள்",
    contact_info: "தொடர்பு விவரங்கள்",

    // Events Page
    events_page_title: "மறுசந்திப்புகள் மற்றும் நிகழ்வுகள்",
    event_date: "தேதி",
    event_time: "நேரம்",
    event_venue: "இடம்",
    event_capacity: "கொள்ளளவு",
    event_register_btn: "நிகழ்வுக்குப் பதிவு செய்க",
    spots_remaining: "இடங்கள் உள்ளன",

    // Memories Page
    memories_page_title: "பழைய மாணவர்கள் நினைவுகள் சுவர்",
    share_memory_btn: "நினைவைப் பகிரவும்",
    batch_year: "வகுப்பு ஆண்டு",
    uploaded_by: "பகிர்ந்தவர்",

    // Footer
    footer_tagline: "பள்ளிகள் மற்றும் பழைய மாணவர்களுக்கான வாழ்நாள் தொடர்புகளை உருவாக்குகிறது.",
    copyright: "காப்புரிமை © 2026. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. JustGatherNow மூலம் வழங்கப்படுகிறது.",
    developer_portal: "டெவலப்பர் போர்டல்",
    school_admin_login: "பள்ளி நிர்வாக போர்டல்",
  }
};
