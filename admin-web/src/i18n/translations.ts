import { Admin } from "mongodb";

export type Language = 'en' | 'ta';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar & Common
    app_title: "NHS SCHOOL",
    tagline: "Official School Alumni Association",
    nav_home: "Home",
    nav_about: "About Us",
    nav_school_profile: "Our School",
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
    recent_memories_title: "Cherished School Memories",
    view_all_memories: "View Gallery",
    no_memories_yet: "No memories uploaded yet. Be the first to share!",
    school_admin_request_title: "Are You a School Administrator?",
    school_admin_request_desc: "Register your school to manage alumni records, organize batch reunions, publish announcements, and track community engagement.",
    register_school_btn: "REGISTER YOUR SCHOOL",
    find_batch_title: "FIND YOUR FRIENDS & BATCHMATES",
    find_batch_desc: "Search and reconnect with your school friends and batchmates by graduation year and section.",

    // School Profile
    school_profile_title: "SCHOOL PROFILE & HISTORY",
    school_code: "School Code",
    established: "Established",
    location: "Location",
    principal_message: "Principal's Message",
    total_alumni: "Total Alumni",
    active_batches: "Batches Registered",
    contact_info: "Contact Information",

    // Batches Page (Public)
    batches_title: "ALUMNI BATCHES & COHORTS",
    search_batches_placeholder: "Search batch year or stream...",
    view_batch_members: "View Members",
    no_batches_found: "No batches found matching your search.",

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
    upload_photo: "Upload Photo",
    caption_placeholder: "Write a short memory caption...",

    // About Page
    about_title: "ABOUT OUR ALUMNI ASSOCIATION",
    about_subtitle: "Fostering lifelong relationships, celebrating school legacy, and empowering future generations.",
    our_mission_title: "Our Mission",
    our_mission_desc: "To unite alumni across generations, preserve school history, and create impactful opportunities for past and present students.",
    our_vision_title: "Our Vision",
    our_vision_desc: "To be a vibrant global community empowering every alumnus and nurturing educational excellence.",

    // Contact Page
    contact_title: "GET IN TOUCH WITH US",
    contact_subtitle: "Have questions or want to host a reunion? We're here to help.",
    name_label: "Your Full Name",
    email_label: "Email Address",
    phone_label: "Phone",
    email_contact_label: "Email",
    subject_label: "Subject",
    message_label: "Message",
    send_message_btn: "Send Message",

    // Auth Pages (Login & Register)
    auth_alumni_login: "ALUMNI LOGIN",
    mobile_label: "Mobile Number",
    otp_label: "Enter 6-Digit OTP",
    send_otp_btn: "Send OTP",
    verify_otp_btn: "Verify & Login",
    register_title: "ALUMNI REGISTRATION",
    batch_year_label: "Passing Year",
    submit_registration: "Submit Registration",

    // School Admin Navigation
    admin_dashboard: "Dashboard",
    admin_verification: "Verification Queue",
    admin_alumni_directory: "Alumni Directory",
    admin_batches: "Batches Cohorts",
    admin_events: "Events & Reunions",
    admin_school_events: "School Celebrations",
    admin_announcements: "Announcements",
    admin_memories: "Memories Moderation",
    admin_feedback: "Alumni Feedback / கருத்துகள்",
    admin_association_team: "Association Team",
    admin_rank_holders: "Rank Holders",
    admin_reports: "Reports & Export",
    admin_settings: "School Settings",
    admin_portal_name: "Alumni Admin Portal",

    // Alumni Portal Navigation
    alumni_section_main: "MAIN",
    alumni_section_connect: "CONNECT",
    alumni_section_activities: "ACTIVITIES",
    alumni_section_account: "MY ACCOUNT",
    alumni_nav_dashboard: "Dashboard",
    alumni_nav_profile: "My Profile",
    alumni_nav_batches: "My Batches",
    alumni_nav_directory: "Alumni Directory",
    alumni_nav_school_events: "School Events",
    alumni_nav_events: "Events",
    alumni_nav_announcements: "Announcements",
    alumni_nav_gallery: "Gallery & Memories",
    alumni_nav_documents: "Certificates / Docs",
    alumni_nav_notifications: "Notifications",
    alumni_nav_settings: "Settings",
    alumni_search_placeholder: "Search directory, events, notices...",
    alumni_verified_badge: "Verified Alumnus",
    alumni_class_of: "Class of",

    // Footer
    footer_tagline: "Building Lifelong Connections for Schools & Alumni.",
    copyright: "Copyright © 2026. All rights reserved. Powered by Devopstrio.",
    developer_portal: "Developer Portal",
    school_admin_login: "School Admin Portal",

    // =====================================================================
    // ALUMNI MANAGEMENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_alumni_mgmt_title: "Alumni Management & Sheet Editor",
    admin_alumni_mgmt_subtitle: "Manage alumni directory records, inline sheet editing, bulk updates, additions & roster exports.",

    // Toolbar / top controls
    admin_refresh_roster: "Refresh Directory Roster",
    admin_view_standard_table: "Standard Table",
    admin_view_editable_sheet: "Editable Sheet",
    admin_btn_add_new_alumni: "Add New Alumni",
    admin_btn_import_roster: "Import Roster (Excel / CSV)",
    admin_btn_export_excel: "Export Excel",
    admin_btn_exporting_excel: "Exporting Excel...",

    // Filter bar
    admin_filter_search_placeholder: "Search by name, admission no, mobile, email, city, profession...",
    admin_filter_all_batches: "All Batches (1962-2026)",
    admin_filter_class_of: "Class of",
    admin_filter_all_statuses: "All Verification Statuses",
    admin_filter_status_approved: "APPROVED Only",
    admin_filter_status_pending: "PENDING Only",
    admin_filter_status_suspended: "SUSPENDED Only",
    admin_filter_status_rejected: "REJECTED Only",
    admin_filter_all_blood_groups: "All Blood Groups",
    admin_filter_blood_suffix: "Blood Group",
    admin_filter_all_volunteers: "All Volunteers",
    admin_filter_volunteers_yes: "Volunteers Only (YES)",
    admin_filter_non_volunteers: "Non-Volunteers",
    admin_showing_count_prefix: "Showing",
    admin_showing_count_middle: "of",
    admin_showing_count_suffix: "total roster records",
    admin_horizontal_scroll: "Horizontal Scroll:",
    admin_pan_columns: "Pan Columns",
    admin_sheet_mode_active: "Sheet Mode Active: Edit any input directly below",

    // Sort dropdown (values stay the same; labels come from these keys)
    admin_sort_batch_asc: "Batch: Oldest → Newest",
    admin_sort_batch_desc: "Batch: Newest → Oldest",
    admin_sort_name_asc: "A → Z",
    admin_sort_name_desc: "Z → A",

    // Standard Table headers
    admin_col_sno: "S.No",
    admin_col_alumnus_profile: "Alumnus Profile",
    admin_col_batch_section: "Batch & Section",
    admin_col_contact_info: "Contact Information",
    admin_col_address: "Address",
    admin_col_blood_group: "Blood Group",
    admin_col_volunteer: "Volunteer",
    admin_col_willing_donor: "Willing Donor",
    admin_col_status: "Status",
    admin_col_actions: "Actions",
    admin_label_adm_prefix: "Adm:",
    admin_label_batch_prefix: "Batch",
    admin_label_yes: "YES",
    admin_label_no: "NO",
    admin_status_active: "Active",
    admin_status_invite_sent: "Invite Sent",
    admin_status_pending_activation: "Pending Activation",

    // Row actions
    admin_action_approve: "Approve",
    admin_action_suspend: "Suspend",
    admin_action_activate: "Activate",
    admin_action_delete: "Delete",
    admin_action_send_invite: "Send Invite",
    admin_action_resend_invite: "Resend Invite",

    // Bulk action bar
    admin_bulk_selected_count: "Alumni Profile(s) Selected",
    admin_bulk_send_invitation: "Send Invitation",
    admin_bulk_approve: "Bulk Approve",
    admin_bulk_suspend: "Bulk Suspend",
    admin_bulk_delete: "Bulk Delete",
    admin_bulk_deselect_all: "Deselect All",

    // Editable Sheet view
    admin_sheet_editor_title: "Full Spreadsheet Editor — All 41 Fields Editable Directly Below",
    admin_sheet_rows_rendered: "Rows Rendered",
    admin_sheet_save_edited: "Save",
    admin_sheet_saving: "Saving...",
    admin_sheet_edited_rows_suffix: "Edited Row(s)",
    admin_sheet_scroll_left: "Scroll Left",
    admin_sheet_scroll_right: "Scroll Right",
    admin_sheet_footer_tip: "Enhanced high-contrast scrollbar active. Tip: Use Shift + Mouse Wheel or drag the scrollbar below to navigate columns.",
    admin_sheet_upload: "Upload",
    admin_sheet_replace: "Replace",
    admin_sheet_uploading: "Uploading...",
    admin_sheet_remove: "Remove",
    admin_sheet_profile_photo: "Profile Photo",
    admin_sheet_full_name: "Full Name",
    admin_sheet_name_tamil: "Name in Tamil",
    admin_sheet_mobile: "Mobile Number",
    admin_sheet_country_code: "Country Code",
    admin_sheet_gender: "Gender",
    admin_sheet_dob: "Date of Birth",
    admin_sheet_email: "Email",
    admin_sheet_blood_group: "Blood Group",
    admin_sheet_father_name: "Father Name",
    admin_sheet_mother_name: "Mother Name",
    admin_sheet_current_city: "Current City",
    admin_sheet_current_state: "Current State",
    admin_sheet_address: "Address",
    admin_sheet_country: "Country",
    admin_sheet_school_name: "School Name",
    admin_sheet_joining_year: "Joining Year",
    admin_sheet_passing_year: "Passing Year",
    admin_sheet_leaving_class: "Leaving Class",
    admin_sheet_admission_roll: "Admission/Roll No",
    admin_sheet_section: "Section",
    admin_sheet_no_higher_ed: "No Higher Ed",
    admin_sheet_college_name: "College Name",
    admin_sheet_degree: "Degree / Course",
    admin_sheet_custom_degree: "Custom Degree",
    admin_sheet_department: "Department",
    admin_sheet_college_reg_no: "College Reg No",
    admin_sheet_college_joining_yr: "College Joining Yr",
    admin_sheet_college_passing_yr: "College Passing Yr",
    admin_sheet_employment_status: "Employment Status",
    admin_sheet_company_name: "Company Name",
    admin_sheet_designation: "Designation / Position",
    admin_sheet_industry: "Industry",
    admin_sheet_total_experience: "Total Experience",
    admin_sheet_skills: "Skills & Expertise",
    admin_sheet_linkedin: "LinkedIn URL",
    admin_sheet_instagram: "Instagram URL",
    admin_sheet_whatsapp: "WhatsApp Number",
    admin_sheet_website: "Website URL",
    admin_sheet_status: "Status",
    admin_sheet_action: "Action",

    // Suspend modal
    admin_suspend_modal_title: "Suspend Alumni Account",
    admin_suspend_modal_body: "Please provide a reason for suspending this alumni account.",
    admin_suspend_modal_body_suffix: "will be barred from portal access until reactivated.",
    admin_suspend_reason_label: "Reason for Suspension",
    admin_suspend_reason_placeholder: "Enter the reason for suspending this alumni account...",
    admin_suspend_reason_required: "Please provide a reason for suspension.",
    admin_suspend_cancel: "Cancel",
    admin_suspend_confirm: "Suspend Account",
    admin_suspend_in_progress: "Suspending...",

    // Add / Edit Alumni wizard
    admin_add_modal_title: "Add New Alumni Profile",
    admin_add_step_label: "Step",
    admin_add_step_of: "of",
    admin_add_step_personal: "Personal Information",
    admin_add_step_contact: "Contact & Address",
    admin_add_step_school: "School Education",
    admin_add_step_higher: "Higher Education",
    admin_add_step_professional: "Professional & Social",
    admin_add_cancel: "Cancel",
    admin_add_back: "Back",
    admin_add_next: "Next",
    admin_add_submit: "Create Alumni Profile",

    // Import modal
    admin_import_modal_title: "Import Alumni School Roster (Excel / CSV)",
    admin_import_modal_note_title: "Full 44-Field Spreadsheet Bulk Edit & Import:",
    admin_import_modal_note_1: "Excel (.xlsx) & CSV Supported: You can export the roster to Excel, edit any cells, and upload the .xlsx or .csv spreadsheet directly.",
    admin_import_modal_note_2: "Bulk Edit Existing Records: Keep the Alumni ID column intact — the system matches and updates only your modified cells.",
    admin_import_modal_note_3: "Smart Match Fallback: Even if Alumni ID is blank or altered, existing alumni are matched automatically by Admission Number, Mobile, Email, or Roll Number.",
    admin_import_modal_note_4: "Add New Records: Any row without an existing ID or match will be created as a new record (requires Full Name and Passing Year).",
    admin_import_modal_note_5: "Partial Edits: Leave unchanged cells as-is to retain current values. Enter __CLEAR__ to explicitly clear a field.",
    admin_import_modal_start: "Start Roster Import",

    // Import results modal
    admin_import_result_title: "CSV Roster Import Results",
    admin_import_result_total_rows: "Total Rows",
    admin_import_result_valid: "Valid / Processed",
    admin_import_result_updated: "Updated Rows",
    admin_import_result_created: "New Created",
    admin_import_result_unchanged: "Unchanged",
    admin_import_result_failed: "Failed / Skipped",
    admin_import_result_errors_label: "Validation & Import Errors",
    admin_import_result_close: "Close",

    // Misc empty states
    admin_no_alumni_found: "No alumni records found matching filter criteria.",
    admin_photo_upload_title_new: "Upload a new photo",
    admin_photo_upload_title_replace: "Replace existing photo",
    admin_photo_remove_title: "Remove this profile photo",

    // =====================================================================
    // BATCHES & COHORTS PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_batches_page_title: "Batches & Cohorts",
    admin_batches_page_subtitle: "School passing year cohorts and assigned batch coordinators",
    admin_batches_search_placeholder: "Search batch year or name...",
    admin_batches_create_btn: "Create New Batch",
    admin_batches_card_badge: "Batch",
    admin_batches_card_title: "Batch of",
    admin_batches_card_desc_default: "Class of {year} Alumni Cohort",
    admin_batches_coordinator_title: "BATCH COORDINATORS",
    admin_batches_coordinator_assigned: "Assigned",
    admin_batches_coordinator_none: "No Coordinator Assigned",
    admin_batches_member_count_singular: "{count} Member",
    admin_batches_member_count_plural: "{count} Members",
    admin_batches_view_btn: "View Batch",
    admin_batches_modal_title: "Create New Batch Cohort",
    admin_batches_modal_name_label: "Batch Name",
    admin_batches_modal_name_placeholder: "Class of 2026",
    admin_batches_modal_year_label: "Passing Year",
    admin_batches_modal_desc_label: "Description / Motto",
    admin_batches_modal_desc_placeholder: "The Golden Jubilee Batch...",
    admin_batches_modal_cancel: "Cancel",
    admin_batches_modal_save: "Save Batch Cohort",
    admin_batches_success_title: "Batch Created Successfully",
    admin_batches_success_msg: "Batch cohort for Class of {year} has been initialized.",

    // Edit Batch (school-admin batch detail page)
    admin_batches_edit_btn: "Edit Batch",
    admin_batches_edit_modal_title: "Edit Batch Cohort",
    admin_batches_edit_success_title: "Batch Updated Successfully",
    admin_batches_edit_success_msg: "Batch details for Class of {year} have been updated.",
        // NEW: Default batch name pattern (matches backend's "Batch of {year}" fallback)
    admin_batch_default_name: "Batch of {year}",
    
    // =====================================================================
    // BATCH DETAILS / COMMITTEE PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Navigation & header
    admin_batch_back_to_batches: "Back to Batches",
    admin_batch_class_of_cohort: "CLASS OF {year} COHORT",
    admin_batch_verified_cohort: "Verified Batch Cohort",
    admin_batch_not_found: "Batch cohort not found.",

    // Buttons
    admin_batch_assign_committee_btn: "Assign Committee Position",
    admin_batch_assign_modal_title: "Assign Batch Committee Position",

    // Committee structure section
    admin_batch_committee_section_title: "Batch Alumni Committee Structure",
    admin_batch_committee_section_subtitle: "15 Office Bearer Positions Structure per Batch Cohort",
    admin_batch_appointed_count: "{filled} / {total} Appointed",
    admin_batch_no_members_appointed: "No members appointed yet",
    admin_batch_appoint_position_btn: "Appoint Position",
    admin_batch_verified_members_count: "Verified Batch Members ({count})",

    // Modal
    admin_batch_modal_roles_info_title: "Batch Committee Roles Structure (15 Positions Max)",
    admin_batch_modal_roles_info_body: "Select a verified alumnus from {batch_name} and assign their designated committee position.",
    admin_batch_modal_select_alumnus_label: "Select Alumnus from Batch",
    admin_batch_modal_select_role_label: "Select Committee Role Position",
    admin_batch_modal_normal_member: "Normal Alumni Member",
    admin_batch_modal_default_badge: "Default",
    admin_batch_modal_select_placeholder: "Select Verified Member...",
    admin_batch_modal_save_btn: "Save Committee Position",

    // Committee role titles (localized for rendering)
    admin_committee_role_president: "President / Chairman",
    admin_committee_role_vice_president: "Vice President / Vice Chairman",
    admin_committee_role_secretary: "Secretary",
    admin_committee_role_joint_secretary: "Joint / Assistant Secretary",
    admin_committee_role_treasurer: "Treasurer",
    admin_committee_role_executive_member: "Executive / Committee Member",
    admin_committee_role_normal_member: "Alumni Member",

    // Table columns
    admin_batch_col_member_name: "Member Name",
    admin_batch_col_city_profession: "City / Profession",
    admin_batch_col_committee_role: "Committee Role Position",
    admin_batch_col_action: "Action",

    // Table row actions
    admin_batch_action_edit_role: "Edit Role",
    admin_batch_action_assign_role: "Assign Role",
    admin_batch_action_remove_position: "Remove Committee Position",

    // Alerts
    admin_batch_alert_select_alumni_title: "Select Alumni",
    admin_batch_alert_select_alumni_body: "Please choose a batch alumnus to assign.",
    admin_batch_alert_role_appointed_title: "Role Appointed",
    admin_batch_alert_role_removed_title: "Role Removed",
    admin_batch_alert_role_removed_body: "{name} has been reverted to standard Alumni Member.",
    admin_batch_confirm_remove: "Are you sure you want to remove {name} from the batch committee?",
    admin_batch_alert_failed_assign: "Failed to assign committee position.",
    admin_batch_alert_failed_remove: "Failed to remove committee role.",
    admin_batch_alert_failed_update: "Failed to update batch.",

        // =====================================================================
    // SCHOOL-ADMIN EVENTS LIST PAGE (Events & Get-Togethers) — NEW KEYS
    // =====================================================================
    admin_events_page_title: "Events & Get-Togethers",
    admin_events_page_subtitle: "School reunions, batch get-togethers, and attendance rosters",
    admin_events_create_btn: "Create Get-Together",
    admin_events_tab_upcoming: "Upcoming Events ({count})",
    admin_events_tab_past: "Past / Expired Events ({count})",
    admin_events_empty_upcoming_title: "No Upcoming Events",
    admin_events_empty_upcoming_desc: "No upcoming get-togethers are scheduled yet.",
    admin_events_empty_past_title: "No Expired Events",
    admin_events_empty_past_desc: "No past or expired events recorded in history.",
    admin_events_create_reunion_btn: "Create Reunion",
    admin_events_school_wide: "School-wide",
    admin_events_registration_configured: "Registration Link Configured",
    admin_events_confirmed_count: "{count} Confirmed",

        // =====================================================================
    // CREATE / EDIT EVENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_event_page_top_title: "Create Reunion Event",
    admin_event_back_to_events: "Back to Events",
    admin_event_page_title_create: "Create Get-Together Event",
    admin_event_page_title_edit: "Edit Get-Together Event",
    admin_event_page_subtitle_create: "Organize a batch reunion or school-wide alumni gathering",
    admin_event_page_subtitle_edit: "Modify event details, timing, and venue",

    admin_event_label_title_en: "Event Name / Title (English) *",
    admin_event_label_title_ta: "நிகழ்வின் பெயர் (தமிழ் / Tamil Name)",
    admin_event_placeholder_title_en: "2010 Silver Jubilee Reunion",
    admin_event_placeholder_title_ta: "2010 வெள்ளி விழா மறுசந்திப்பு",

    admin_event_label_audience: "Target Audience / Batch Cohort",
    admin_event_option_school_wide: "School-wide Event (All Alumni)",
    admin_event_option_batch_format: "{name} (Year {year})",

    admin_event_label_banner_en: "Event Cover Banner Image (English)",
    admin_event_label_banner_ta: "Event Cover Banner Image (தமிழ் / Tamil)",
    admin_event_placeholder_banner_en: "https://images.unsplash.com/... (English Image URL)",
    admin_event_placeholder_banner_ta: "https://images.unsplash.com/... (Tamil Image URL)",
    admin_event_banner_preview_en: "English Banner Preview",
    admin_event_banner_preview_ta: "தமிழ் பேனர் முன்னோட்டம்",

    admin_event_label_registration: "Event Apply / External Registration Link (Optional)",
    admin_event_placeholder_registration: "https://forms.google.com/... or Registration Portal URL",

    admin_event_label_description_en: "Description & Agenda (English)",
    admin_event_label_description_ta: "விவரங்கள் & நிரல் (தமிழ் / Tamil Description)",
    admin_event_placeholder_description_en: "Details, dress code, schedule overview...",
    admin_event_placeholder_description_ta: "நிகழ்ச்சி விவரங்கள், உடைக்கட்டுப்பாடு, கால அட்டவணை...",

    admin_event_label_date: "Event Date *",
    admin_event_label_start_time: "Start Time",
    admin_event_label_end_time: "End Time",
    admin_event_placeholder_start_time: "10:00 AM",
    admin_event_placeholder_end_time: "05:00 PM",

    admin_event_label_venue: "Venue Name *",
    admin_event_placeholder_venue: "Grand Ballroom, Hotel Taj Connemara",
    admin_event_label_address: "Full Venue Address",
    admin_event_placeholder_address: "Binny Road, Chennai, Tamil Nadu - 600002",

    admin_event_label_capacity: "Maximum Capacity Limit",
    admin_event_label_guest_allowed: "Allow Alumni to Bring Family / Guests",

    admin_event_btn_save_changes: "Save Changes",
    admin_event_btn_save_draft: "Save as Draft",
    admin_event_btn_publish: "Publish Event Immediately",

    // Alerts (confirmation, success, error)
    admin_event_alert_required_title: "Required Fields Missing",
    admin_event_alert_required_body: "Please fill in required fields (Event Title, Date, and Venue) before saving.",
    admin_event_alert_updated_title: "Event Updated",
    admin_event_alert_updated_body: "\"{title}\" has been updated successfully.",
    admin_event_alert_published_title: "Event Published Successfully",
    admin_event_alert_published_body: "Alumni can now view and RSVP for this event.",
    admin_event_alert_draft_title: "Event Saved as Draft",
    admin_event_alert_draft_body: "Your event draft has been saved.",
    admin_event_alert_error_load_title: "Error Loading Event",
    admin_event_alert_error_load_body: "Could not fetch event details.",
    admin_event_alert_error_update: "Failed to update event.",
    admin_event_alert_error_create: "Failed to create event.",

        // =====================================================================
    // SCHOOL EVENTS & CELEBRATIONS PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_school_events_page_title: "School Events & Celebrations",
    admin_school_events_page_badge: "Official School Module",
    admin_school_events_page_subtitle: "Manage official school annual days, sports meets, cultural festivals, science exhibitions, and national celebrations.",
    admin_school_events_reset_samples_btn: "Reset Samples",
    admin_school_events_reset_samples_tooltip: "Restore Default Sample Events",
    admin_school_events_create_btn: "Create School Event",

    // KPI stat cards
    admin_school_events_stat_total: "Total Celebrations",
    admin_school_events_stat_upcoming: "Upcoming School Events",
    admin_school_events_stat_past: "Past Celebrations",
    admin_school_events_stat_categories: "Event Categories",

    // Tabs & search
    admin_school_events_tab_upcoming: "Upcoming Events ({count})",
    admin_school_events_tab_past: "Past Celebrations ({count})",
    admin_school_events_search_placeholder: "Search school events, guest...",

    // Category labels
    admin_school_events_cat_all: "All Celebrations",
    admin_school_events_cat_annual_day: "Annual Day",
    admin_school_events_cat_sports_day: "Sports Day",
    admin_school_events_cat_cultural_fest: "Cultural Fest",
    admin_school_events_cat_national_day: "National Days",
    admin_school_events_cat_exhibition: "Science / Tech Expo",
    admin_school_events_cat_celebration: "Festivals & Celebrations",
    admin_school_events_cat_graduation_day: "Graduation / Convocation",
    admin_school_events_cat_other: "Other School Events",

    // Target audiences
    admin_school_events_aud_all_students: "All Students",
    admin_school_events_aud_parents: "Parents & Guardians",
    admin_school_events_aud_staff: "Teachers & Staff",
    admin_school_events_aud_public: "Public & Visitors",
    admin_school_events_aud_alumni_guests: "Alumni & Special Guests",

    // Event card content
    admin_school_events_chief_guest_prefix: "Chief Guest:",

    // Empty states
    admin_school_events_empty_upcoming_title: "No Upcoming School Events",
    admin_school_events_empty_past_title: "No Past Celebrations",
    admin_school_events_empty_filtered_desc: "No school events match your current filter parameters.",
    admin_school_events_empty_upcoming_desc: "No upcoming school celebrations scheduled yet.",
    admin_school_events_empty_past_desc: "No historical school celebrations recorded.",
    admin_school_events_create_first_btn: "Create First School Event",

    // Create / Edit modal
    admin_school_events_modal_title_edit: "Edit School Celebration",
    admin_school_events_modal_title_create: "Create New School Event",
    admin_school_events_modal_subtitle: "Official School Celebrations & Event Management",
    admin_school_events_form_title_label: "Event Title",
    admin_school_events_form_title_placeholder: "e.g. Annual Sports Meet 2026 or Science Expo",
    admin_school_events_form_category_label: "Category",
    admin_school_events_form_audience_label: "Target Audience",
    admin_school_events_form_event_date_label: "Event Date",
    admin_school_events_form_end_date_label: "End Date (Optional)",
    admin_school_events_form_start_time_label: "Start Time",
    admin_school_events_form_end_time_label: "End Time",
    admin_school_events_form_start_time_placeholder: "09:00 AM",
    admin_school_events_form_end_time_placeholder: "04:00 PM",
    admin_school_events_form_venue_label: "Venue / Location",
    admin_school_events_form_venue_placeholder: "e.g. NHSS Main Play Grounds",
    admin_school_events_form_chief_guest_label: "Chief Guest (Optional)",
    admin_school_events_form_chief_guest_placeholder: "e.g. Honorable Minister or Alumnus",
    admin_school_events_form_banner_label: "Banner Cover Image URL",
    admin_school_events_form_banner_placeholder: "https://...",
    admin_school_events_form_banner_preset_prefix: "Preset:",
    admin_school_events_form_description_label: "Description & Agenda",
    admin_school_events_form_description_placeholder: "Enter details, schedule, highlights of the school celebration...",
    admin_school_events_form_cancel_btn: "Cancel",
    admin_school_events_form_save_btn: "Save Changes",
    admin_school_events_form_publish_btn: "Publish School Event",

    // View modal
    admin_school_events_view_close_btn: "Close View",

    // Alerts
    admin_school_events_alert_title_required_title: "Event Title Required",
    admin_school_events_alert_title_required_body: "Please enter the title for the school event.",
    admin_school_events_alert_date_required_title: "Event Date Required",
    admin_school_events_alert_date_required_body: "Please select a date for the event.",
    admin_school_events_alert_updated_title: "School Event Updated",
    admin_school_events_alert_updated_body: "\"{title}\" details have been saved.",
    admin_school_events_alert_created_title: "School Event Created",
    admin_school_events_alert_created_body: "\"{title}\" has been published.",
    admin_school_events_alert_delete_confirm_title: "Delete School Event?",
    admin_school_events_alert_delete_confirm_body: "Are you sure you want to delete \"{title}\"? This celebration record will be permanently removed.",
    admin_school_events_alert_deleted_title: "Event Removed",
    admin_school_events_alert_deleted_body: "\"{title}\" has been deleted.",
    admin_school_events_alert_seeded_title: "School Events Seeded",
    admin_school_events_alert_seeded_body: "Default school celebrations have been restored.",
    admin_school_events_alert_error_save: "Failed to save school event.",
    admin_school_events_alert_error_delete: "Failed to delete event.",
    admin_school_events_alert_error_seed: "Failed to seed school events.",
    
        // =====================================================================
    // ANNOUNCEMENTS & NEWS MANAGER PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_announcements_page_title: "Announcements & News Manager",
    admin_announcements_page_subtitle: "Publish school news, posters, circulars, and notices in English & தமிழ் (Tamil) with built-in image crop and editing",
    admin_announcements_compose_btn: "Compose New Notice",

    // Filters
    admin_announcements_search_placeholder: "Search news by title, Tamil keyword, content...",
    admin_announcements_filter_all_categories: "All Categories",
    admin_announcements_filter_all_audiences: "All Audiences",
    admin_announcements_filter_school_wide: "School-wide (Public)",
    admin_announcements_filter_batch_targeted: "Batch Targeted",

    // Card
    admin_announcements_no_poster: "No Poster Attached",
    admin_announcements_view_full_poster: "View Full Poster",
    admin_announcements_badge_school_wide: "🌐 School-wide (Public)",
    admin_announcements_badge_batch: "🎯 Batch Cohort",
    admin_announcements_by_prefix: "By {name}",
    admin_announcements_tamil_prefix: "தமிழ்:",

    // Empty state
    admin_announcements_empty_title: "No Announcements Found",
    admin_announcements_empty_filtered: "No notices match your selected filters.",
    admin_announcements_empty_default: "Publish your first school announcement with poster flyers and bilingual text.",
    admin_announcements_empty_create_btn: "Create Announcement",

    // Category labels (used by chips/badges)
    admin_announcements_cat_general: "General Notice",
    admin_announcements_cat_circular: "Official Circular",
    admin_announcements_cat_event_notice: "Event / Reunion",
    admin_announcements_cat_celebration: "Celebration & Festival",
    admin_announcements_cat_academic: "Academic & Exams",
    admin_announcements_cat_achievement: "School Achievement",

    // Compose / Edit modal
    admin_announcements_modal_title_edit: "Edit Announcement Notice",
    admin_announcements_modal_title_create: "Compose Announcement & School News",
    admin_announcements_form_category_label: "Notice Category (அறிவிப்பு வகை)",
    admin_announcements_form_audience_label: "Audience Scope (பார்வையாளர்கள்)",
    admin_announcements_form_audience_school: "School-wide & Public Homepage (அனைவருக்கும்)",
    admin_announcements_form_audience_batch: "Specific Batch Cohort (குறிப்பிட்ட ஆண்டு)",
    admin_announcements_form_batch_label: "Select Target Batch Cohort",
    admin_announcements_form_poster_label: "Notice Poster / Flyer (சுவரொட்டி அல்லது படம்)",
    admin_announcements_form_poster_sublabel: "Drag & drop, upload WebP, crop to 16:9 banner, rotate, or adjust colors.",
    admin_announcements_form_tab_en: "🇬🇧 English Notice Details",
    admin_announcements_form_tab_ta: "🇮🇳 தமிழ் விவரங்கள் (Tamil Details)",
    admin_announcements_form_title_en: "Title (English)",
    admin_announcements_form_title_en_placeholder: "e.g. Annual Alumni Meet 2026 Registration Open",
    admin_announcements_form_title_ta: "அறிவிப்பு தலைப்பு (Tamil Title)",
    admin_announcements_form_title_ta_placeholder: "எ.கா: முன்னாள் மாணவர் சங்க ஆண்டு விழா 2026 பதிவு தொடக்கம்",
    admin_announcements_form_content_en: "Announcement Details (English)",
    admin_announcements_form_content_en_placeholder: "Provide full announcement details, timings, guidelines...",
    admin_announcements_form_content_ta: "முழு விவரம் / செய்தி (Tamil Content)",
    admin_announcements_form_content_ta_placeholder: "அறிவிப்பின் முழு விவரங்கள், நேரம், விதிகளினை உள்ளிடவும்...",
    admin_announcements_form_cancel_btn: "Cancel",
    admin_announcements_form_update_btn: "Update Announcement",
    admin_announcements_form_publish_btn: "Publish Broadcast",

    // Alerts
    admin_announcements_alert_missing_title_title: "Missing Title",
    admin_announcements_alert_missing_title_body: "Please enter at least an English or Tamil title for the announcement.",
    admin_announcements_alert_missing_content_title: "Missing Content",
    admin_announcements_alert_missing_content_body: "Please enter at least English or Tamil content details.",
    admin_announcements_alert_updated_title: "Updated Successfully",
    admin_announcements_alert_updated_body: "The announcement details have been updated.",
    admin_announcements_alert_published_title: "Broadcast Published",
    admin_announcements_alert_published_body: "The announcement has been broadcasted and saved.",
    admin_announcements_alert_deleted_title: "Deleted",
    admin_announcements_alert_deleted_body: "The announcement has been deleted.",
    admin_announcements_alert_load_error: "Failed to load announcements",
    admin_announcements_alert_update_error: "Update failed",
    admin_announcements_alert_create_error: "Broadcast failed",
    admin_announcements_alert_delete_error: "Failed to delete announcement",
    admin_announcements_alert_delete_confirm: "Are you sure you want to delete announcement \"{title}\"? This action cannot be undone.",
 
        // =====================================================================
    // MEMORIES MODERATION PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_memories_page_title: "Memories, Video & Photo Albums",
    admin_memories_page_badge: "Multi-Album Module",
    admin_memories_page_subtitle: "Moderate alumni uploads, organize high-resolution image albums, videos, and campus heritage archives.",
    admin_memories_create_btn: "Create Album / Upload Media",

    // View mode & search
    admin_memories_view_gallery: "All Media Gallery ({count})",
    admin_memories_view_albums: "Albums View ({count})",
    admin_memories_search_placeholder: "Search title, album, uploader...",

    // Status tabs
    admin_memories_tab_all: "All Statuses",
    admin_memories_tab_pending: "Pending Review",
    admin_memories_tab_approved: "Approved & Published",
    admin_memories_tab_rejected: "Rejected",
    admin_memories_tab_changes: "Changes Requested",

    // Media type pills
    admin_memories_type_all: "All Types",
    admin_memories_type_photos: "Photos",
    admin_memories_type_videos: "Videos",
    admin_memories_type_albums: "Photo Albums",

    // Bulk selection
    admin_memories_select_all: "Select All ({count})",
    admin_memories_selected_count: "{count} Selected",
    admin_memories_bulk_delete: "Bulk Delete ({count})",

    // Albums view
    admin_memories_albums_section_title: "School Photo & Video Albums ({count})",
    admin_memories_back_to_albums: "← Back to All Albums",
    admin_memories_badge_album: "Album",
    admin_memories_album_items_recorded: "{count} items recorded",
    admin_memories_view_album_gallery: "View Album Gallery",

    // Media type badges
    admin_memories_badge_video: "Video",
    admin_memories_badge_photo: "Photo",
    admin_memories_badge_album_photos: "{count} Photos Album",

    // Status badges
    admin_memories_status_approved: "Approved",
    admin_memories_status_pending: "Pending Review",
    admin_memories_status_rejected: "Rejected",
    admin_memories_status_changes: "Changes Requested",

    // Gallery card
    admin_memories_album_prefix: "Album:",
    admin_memories_no_description: "No description provided.",
    admin_memories_submitted_by: "Submitted by:",
    admin_memories_batch_label: "Batch:",
    admin_memories_review_btn: "Review",
    admin_memories_edit_btn: "Edit",
    admin_memories_delete_title: "Delete Memory",
    admin_memories_general_gallery: "General Gallery",

    // Empty state
    admin_memories_empty_title: "No Memory Media Items Found",
    admin_memories_empty_description: "No photos or videos match status \"{status}\" or search query.",
    admin_memories_empty_upload_btn: "Upload First Memory",

    // Review modal
    admin_memories_review_modal_title: "Review Memory & Media",
    admin_memories_video_unsupported: "Your browser does not support HTML5 video streaming.",
    admin_memories_photos_count: "{current} / {total} Photos",
    admin_memories_label_uploader: "Uploader:",
    admin_memories_label_batch_year: "Batch Year:",
    admin_memories_label_description: "Description:",
    admin_memories_remarks_label: "Moderation Feedback / Admin Remarks",
    admin_memories_remarks_placeholder: "Enter feedback shown to uploader...",
    admin_memories_reject_btn: "Reject",
    admin_memories_request_changes_btn: "Request Changes",
    admin_memories_approve_btn: "Approve & Publish",

    // Create / Edit modal
    admin_memories_modal_title_edit: "Edit Memory Album",
    admin_memories_modal_title_create: "Create Album & Upload Media",
    admin_memories_modal_badge_edit: "நினைவகம் திருத்து",
    
    admin_memories_modal_subtitle_edit: "Update title, Tamil translation, batch year, audience, or replace individual gallery photos.",
    admin_memories_modal_subtitle_create: "Supports English & Tamil, Audience Ticking, Cover Image & Multiple Photo Gallery Upload",

    admin_memories_form_media_type_label: "Select Media Category",
    admin_memories_form_media_photo: "Single Photo ({count})",
    admin_memories_form_media_photo_sub: "புகைப்படம்",
    admin_memories_form_media_album: "Photo Album ({count})",
    admin_memories_form_media_album_sub: "ஆல்பம்",
    admin_memories_form_media_video: "Video Memory",
    admin_memories_form_media_video_sub: "வீடியோ",

    admin_memories_form_title_en_label: "Title (English) *",
    admin_memories_form_title_en_sub: "ஆங்கிலத் தலைப்பு",
    admin_memories_form_title_en_placeholder: "e.g. Annual Day Cultural Fest 2025",
    admin_memories_form_title_ta_label: "Title (Tamil / தமிழ்)",
    
    admin_memories_form_title_ta_placeholder: "எ.கா. ஆண்டு விழா கலை நிகழ்ச்சிகள் 2025",

    admin_memories_form_album_label: "Target Album Name ",
    admin_memories_form_album_custom_option: "+ Create New Custom Album / புதிய ஆல்பம்",
    admin_memories_form_album_custom_label: "New Custom Album Name * / புதிய ஆல்பத்தின் பெயர்",
    admin_memories_form_album_custom_placeholder: "e.g. 1995 Golden Jubilee Reunion Album",

    admin_memories_form_uploader_label: "Uploader / Submitted By Name*",
    admin_memories_form_uploader_hint: "Write submitter name or use quick presets below",
    admin_memories_form_uploader_show_picker: "Search & Pick Alumnus",
    admin_memories_form_uploader_hide_picker: "Hide Alumni List",
    admin_memories_form_uploader_placeholder: "e.g. School Admin / D. Selwyn / 1995 Batch Alumni",
    admin_memories_form_uploader_quick_fill: "Quick Fill:",
    admin_memories_form_uploader_admin_suffix: "(Admin)",
    admin_memories_form_uploader_school_admin: "School Administration",
    admin_memories_form_uploader_association: "Alumni Association",
    admin_memories_form_uploader_member: "Alumni Member",

    admin_memories_form_alumni_picker_label: "Select Submitter from Registered Alumni ({count} alumni in school):",
    admin_memories_form_alumni_search_placeholder: "Search alumnus by name, mobile, or batch year...",
    admin_memories_form_alumni_empty: "No alumni records found. You can type any name directly in the input box above.",
    admin_memories_form_alumni_use_name: "Use Name",
    admin_memories_form_alumni_class_of: "Class of {year}",
    admin_memories_form_alumni_selected_title: "Submitter Selected",
    admin_memories_form_alumni_selected_body: "Set uploader to {name}",

    admin_memories_form_audience_label: "Audience & Batch Category (Tick Choice)",
    
    admin_memories_form_audience_public_title: "Public / School-Wide Gallery",
    admin_memories_form_audience_public_sub: "அனைவருக்கும் பொதுவானது (Visible to all public visitors & alumni)",
    admin_memories_form_audience_batch_title: "Specific Batch Year Only",
    admin_memories_form_audience_batch_sub: "குறிப்பிட்ட பேட்ச் ஆண்டு (Tagged for a specific batch)",
    admin_memories_form_batch_year_label: "Enter Batch Year * / பேட்ச் ஆண்டு",
    admin_memories_form_batch_year_placeholder: "e.g. 2025 or 1998",

    admin_memories_form_cover_label: "Cover Image URL / Upload Cover File",
    admin_memories_form_cover_placeholder: "https://... or click upload file button",
    admin_memories_form_cover_upload_btn: "Upload Cover / Files",
    admin_memories_form_cover_uploading: "Uploading...",

    admin_memories_form_gallery_label: "Gallery Images List ({count} photos selected)",
    admin_memories_form_gallery_add_btn: "+ Select & Add Multiple Photos",
    admin_memories_form_gallery_uploading_btn: "Uploading Photos...",
    admin_memories_form_gallery_empty: "No photos added yet. Click \"+ Add Multiple Photos\" to upload images.",
    admin_memories_form_upload_progress: "Uploading photo {current} of {total} ({percent}%)",
    admin_memories_form_upload_progress_sub: "படங்கள் ஒன்றன்பின் ஒன்றாக ஏற்றப்படுகின்றன",
    admin_memories_form_upload_cancel_btn: "Cancel Upload / நிறுத்து",
    admin_memories_form_upload_cancel_short: "Cancel",
    admin_memories_form_uploading_label: "Uploading...",

    admin_memories_form_thumb_cover_badge: "Cover",
    admin_memories_form_thumb_set_cover: "Set Cover",
    admin_memories_form_thumb_replace: "Replace",
    admin_memories_form_thumb_remove_title: "Remove image",

    admin_memories_form_video_url_label: "Video Stream / File URL",
    admin_memories_form_video_url_placeholder: "/uploads/video_file.mp4 or YouTube / Video URL",

    admin_memories_form_desc_en_label: "Description (English)",
    
    admin_memories_form_desc_en_placeholder: "Enter memory description in English...",
    admin_memories_form_desc_ta_label: "Description (Tamil / தமிழ்)",
    
    admin_memories_form_desc_ta_placeholder: "நினைவுகள் பற்றிய விவரங்களை தமிழில் உள்ளிடவும்...",

    admin_memories_form_cancel_btn: "Cancel",
    admin_memories_form_update_btn: "Update Memory Record / புதுப்பிக்க",
    admin_memories_form_publish_btn: "Save & Publish Media Record",

    // Alerts & confirms
    admin_memories_alert_moderation_complete: "Moderation Complete",
    admin_memories_alert_approved_body: "Memory Approved & Published!",
    admin_memories_alert_rejected_body: "Memory Rejected.",
    admin_memories_alert_changes_body: "Changes Requested from Uploader.",
    admin_memories_alert_moderation_failed: "Failed to update memory moderation status.",
    admin_memories_alert_delete_confirm_title: "Delete Memory Record?",
    admin_memories_alert_delete_confirm_body: "Are you sure you want to permanently delete this memory item and its media files?",
    admin_memories_alert_delete_confirm_btn: "Delete Memory",
    admin_memories_alert_delete_cancel_btn: "Cancel",
    admin_memories_alert_deleted_title: "Memory Deleted",
    admin_memories_alert_deleted_body: "The memory record has been removed.",
    admin_memories_alert_delete_error: "Failed to delete photo memory.",
    admin_memories_alert_bulk_delete_title: "Bulk Delete Selected Memories?",
    admin_memories_alert_bulk_delete_body: "Are you sure you want to permanently delete {count} selected memory record(s)?",
    admin_memories_alert_bulk_delete_btn: "Delete {count} Items",
    admin_memories_alert_bulk_delete_done_title: "Bulk Delete Complete",
    admin_memories_alert_bulk_delete_done_body: "Successfully deleted {count} memory records.",
    admin_memories_alert_bulk_delete_error: "Failed to bulk delete memory items.",
    admin_memories_alert_title_required_title: "Title Required",
    admin_memories_alert_title_required_body: "Please enter an English title for this memory item.",
    admin_memories_alert_updated_title: "Memory Record Updated",
    admin_memories_alert_updated_body: "Memory details and gallery images updated successfully!",
    admin_memories_alert_published_title: "Memory Published",
    admin_memories_alert_published_body: "New memory item/album created and published!",
    admin_memories_alert_save_error: "Failed to save memory record.",
    admin_memories_alert_upload_stopped_title: "Upload Stopped",
    admin_memories_alert_upload_stopped_files: "Cancelled upload. {done} of {total} files uploaded.",
    admin_memories_alert_upload_stopped_photos: "Cancelled upload. {done} of {total} photos uploaded.",
    admin_memories_alert_files_uploaded_title: "File(s) Uploaded",
    admin_memories_alert_files_uploaded_body: "Uploaded {count} file(s) successfully.",
    admin_memories_alert_photos_added_title: "Photos Added",
    admin_memories_alert_photos_added_body: "Successfully uploaded {count} photo(s) to album gallery.",
    admin_memories_alert_image_replaced_title: "Image Replaced!",
    admin_memories_alert_image_replaced_body: "Image #{index} updated successfully with new file.",
    admin_memories_alert_image_replace_error: "Failed to replace target image file.",
    
        // =====================================================================
    // FEEDBACK MANAGEMENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_feedback_page_title: "Alumni Feedback & Opinions",
    
    admin_feedback_page_subtitle: "Review, moderate, and publish alumni opinions, ratings, memories, and suggestions for management.",

    // Analytics cards
    admin_feedback_stat_total: "Total Feedback",
    admin_feedback_stat_total_sub: "All Submissions",
    admin_feedback_stat_pending: "Pending Review",
    admin_feedback_stat_pending_sub: "Needs Admin Action",
    admin_feedback_stat_approved: "Approved",
    admin_feedback_stat_approved_sub: "Publicly Published",
    admin_feedback_stat_rejected: "Rejected",
    admin_feedback_stat_rejected_sub: "Declined Entries",
    admin_feedback_stat_featured: "Featured Top",
    admin_feedback_stat_featured_sub: "Highlighted Cards",
    admin_feedback_stat_avg: "Avg Rating",
    admin_feedback_stat_avg_sub: "5.0 Star Scale",

    // Tabs & filters
    admin_feedback_tab_pending: "Pending ({count})",
    admin_feedback_tab_approved: "Approved ({count})",
    admin_feedback_tab_featured: "Featured ⭐ ({count})",
    admin_feedback_tab_rejected: "Rejected ({count})",
    admin_feedback_tab_all: "All ({count})",
    admin_feedback_category_filter_label: "Category Filter:",
    admin_feedback_search_placeholder: "Search name, batch, opinion text...",

    // Category labels
    admin_feedback_cat_all: "All Categories",
    admin_feedback_cat_suggestions: "Suggestions",
    admin_feedback_cat_appreciation: "Appreciation",
    admin_feedback_cat_memories: "School Memories",
    admin_feedback_cat_website: "Website Portal",
    admin_feedback_cat_association: "Alumni Association",
    admin_feedback_cat_events: "Events & Reunions",
    admin_feedback_cat_other: "Other",

    // Card badges & action titles
    admin_feedback_batch_prefix: "Batch {year}",
    admin_feedback_featured_tooltip_add: "Feature this feedback",
    admin_feedback_featured_tooltip_remove: "Featured on Top (Click to remove)",
    admin_feedback_delete_tooltip: "Delete Feedback",

    // Card actions
    admin_feedback_action_approve: "Approve",
    admin_feedback_action_reject: "Reject",
    admin_feedback_action_edit_details: "Edit Details",

    // Empty state
    admin_feedback_empty_title: "No Feedback Entries Found",
    admin_feedback_empty_description: "No alumni opinions match status \"{status}\" or search query.",

    // Reject modal
    admin_feedback_reject_modal_title: "Reject Feedback Entry",
    admin_feedback_reject_modal_body: "Rejecting opinion from {name} ({year} Batch).",
    admin_feedback_reject_reason_label: "Rejection Reason / Remarks",
    admin_feedback_reject_reason_placeholder: "Enter feedback for rejection...",
    admin_feedback_reject_cancel: "Cancel",
    admin_feedback_reject_confirm: "Confirm Reject",

    // Edit modal
    admin_feedback_edit_modal_title: "Edit Feedback Record",
    admin_feedback_form_name_label: "Alumni Name *",
    admin_feedback_form_name_ta_label: "Tamil Name",
    admin_feedback_form_name_ta_placeholder: "தமிழ் பெயர்",
    admin_feedback_form_batch_label: "Batch Year *",
    admin_feedback_form_location_label: "Location",
    admin_feedback_form_location_placeholder: "e.g. Chennai, India",
    admin_feedback_form_category_label: "Category",
    admin_feedback_form_rating_label: "Rating Stars (1-5)",
    admin_feedback_form_rating_5: "5 Stars (★★★★★)",
    admin_feedback_form_rating_4: "4 Stars (★★★★☆)",
    admin_feedback_form_rating_3: "3 Stars (★★★☆☆)",
    admin_feedback_form_rating_2: "2 Stars (★★☆☆☆)",
    admin_feedback_form_rating_1: "1 Star (★☆☆☆☆)",
    admin_feedback_form_text_en_label: "Feedback Text (English) *",
    admin_feedback_form_text_ta_label: "Feedback Text (Tamil)",
    admin_feedback_form_text_ta_placeholder: "தமிழில் கருத்து...",
    admin_feedback_form_status_label: "Status",
    admin_feedback_form_status_approved: "Approved & Published",
    admin_feedback_form_status_pending: "Pending Review",
    admin_feedback_form_status_rejected: "Rejected",
    admin_feedback_form_cancel: "Cancel",
    admin_feedback_form_save: "Save Changes",

    // Status badges
    admin_feedback_status_approved: "Approved",
    admin_feedback_status_pending: "Pending Review",
    admin_feedback_status_rejected: "Rejected",

    // Alerts
    admin_feedback_alert_approved_title: "Feedback Approved",
    admin_feedback_alert_approved_body: "Feedback from {name} is now public.",
    admin_feedback_alert_status_updated_title: "Status Updated",
    admin_feedback_alert_status_updated_body: "Feedback marked as {status}.",
    admin_feedback_alert_featured_added_title: "Featured on Top!",
    admin_feedback_alert_featured_removed_title: "Removed from Featured",
    admin_feedback_alert_featured_body: "Feedback from {name} updated.",
    admin_feedback_alert_deleted_title: "Deleted",
    admin_feedback_alert_deleted_body: "Feedback record removed.",
    admin_feedback_alert_updated_title: "Feedback Updated",
    admin_feedback_alert_updated_body: "Feedback details saved successfully.",
    admin_feedback_alert_delete_confirm_title: "Delete Feedback?",
    admin_feedback_alert_delete_confirm_body: "Are you sure you want to permanently delete this alumni feedback entry?",
    admin_feedback_alert_delete_confirm_btn: "Delete Entry",
    admin_feedback_alert_approve_error: "Failed to approve feedback.",
    admin_feedback_alert_status_error: "Failed to update feedback status.",
    admin_feedback_alert_featured_error: "Failed to toggle featured status.",
    admin_feedback_alert_delete_error: "Failed to delete feedback.",
    admin_feedback_alert_update_error: "Failed to update feedback details.",

        // =====================================================================
    // ASSOCIATION TEAM PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_association_page_title: "Alumni Association Team",
    admin_association_page_subtitle: "Manage Sangam central leadership committee & common profiles (Independent of student records)",
    admin_association_add_btn: "+ Add Team Member",

    // Overview cards
    admin_association_stat_total: "Total Team Profiles",
    admin_association_stat_active: "Active Leaders",
    admin_association_stat_linked: "Linked Alumni Leaders",
    admin_association_stat_common: "Common Profiles",

    // Directory table
    admin_association_directory_title: "Association Leadership Directory ({count})",
    admin_association_search_placeholder: "Search team member...",

    // Table columns
    admin_association_col_member: "Team Leader / Member",
    admin_association_col_position: "Association Position",
    admin_association_col_term: "Term Period",
    admin_association_col_contact: "Contact & Location",
    admin_association_col_order: "Order",
    admin_association_col_status: "Status",
    admin_association_col_action: "Action",

    // Member row badges
    admin_association_badge_alumni: "Alumni ' {year}",
    admin_association_badge_common: "Common Profile",
    admin_association_default_location: "Thoothukudi",
    admin_association_status_active: "ACTIVE",
    admin_association_status_inactive: "INACTIVE",

    // Row action titles
    admin_association_action_edit: "Edit Profile",
    admin_association_action_delete: "Delete Team Member",

    // Position names (used for display and dropdown)
    admin_association_pos_president: "President",
    admin_association_pos_vice_president: "Vice President",
    admin_association_pos_secretary: "Secretary",
    admin_association_pos_joint_secretary: "Joint Secretary",
    admin_association_pos_treasurer: "Treasurer",
    admin_association_pos_executive: "Executive Committee Member",
    admin_association_pos_other: "Other",

    // Add/Edit modal
    admin_association_modal_title_add: "Add Association Team Member",
    admin_association_modal_title_edit: "Edit Association Team Member",

    // Modal — creation mode
    admin_association_mode_label: "How do you want to add this team member?",
    admin_association_mode_alumni_title: "Select from Alumni",
    admin_association_mode_alumni_sub: "Search alumni DB & pre-fill info",
    admin_association_mode_common_title: "Create Common Profile",
    admin_association_mode_common_sub: "Add independent leadership profile",

    // Modal — alumni picker
    admin_association_alumni_search_label: "Search Alumni Database",
    admin_association_alumni_search_placeholder: "Type Name, Mobile, Email, or Admission ID...",
    admin_association_alumni_selected_prefix: "Selected:",
    admin_association_alumni_class_of: "(Class of {year})",
    admin_association_alumni_prefilled: "Data Prefilled",
    admin_association_alumni_empty: "No matching alumni found",
    admin_association_alumni_batch_prefix: "Batch {year}",
    admin_association_alumni_select_btn: "Select",

    // Modal — form sections
    admin_association_form_section_personal: "1. Personal & Contact Details",
    admin_association_form_section_position: "2. Association Position & Term",

    // Modal — personal fields
    admin_association_form_name_en_label: "Full Name (English) *",
    admin_association_form_name_en_placeholder: "e.g. D. Selwyn",
    admin_association_form_name_ta_label: "Full Name in Tamil (தமிழ் பெயர்)",
    admin_association_form_name_ta_placeholder: "e.g. D. செல்வின்",
    admin_association_form_email_label: "Email Address",
    admin_association_form_email_placeholder: "email@example.com",
    admin_association_form_mobile_label: "Mobile Number",
    admin_association_form_mobile_placeholder: "+91 98765 43210",
    admin_association_form_location_label: "Current Location / City",
    admin_association_form_location_placeholder: "e.g. Thoothukudi / Chennai",
    admin_association_form_occupation_label: "Occupation / Profession",
    admin_association_form_occupation_placeholder: "e.g. Software Architect / Retired",
    admin_association_form_batch_label: "Batch Year (If Alumni)",
    admin_association_form_batch_placeholder: "e.g. 1976",
    admin_association_form_photo_label: "Profile Photo (சுயவிவரப் படம்)",
    admin_association_form_photo_sublabel: "Upload, crop to square 1:1, rotate, or adjust colors.",

    // Modal — position fields
    admin_association_form_position_en_label: "Association Position (English) *",
    admin_association_form_position_ta_label: "Position in Tamil (பதவி - தமிழ்)",
    admin_association_form_position_ta_placeholder: "e.g. தலைவர் / செயலாளர் / துணைத் தலைவர் / பொருளாளர்",
    admin_association_form_responsibility_label: "Responsibility / Role Overview",
    admin_association_form_responsibility_placeholder: "e.g. Managing Executive Meetings & Events",
    admin_association_form_custom_position_label: "Specify Custom Position (English) *",
    admin_association_form_custom_position_placeholder: "e.g. Academic Committee Head",
    admin_association_form_term_start_label: "Term Start Year",
    admin_association_form_term_start_placeholder: "2024",
    admin_association_form_term_end_label: "Term End Year",
    admin_association_form_term_end_placeholder: "2026",
    admin_association_form_order_label: "Display Order #",
    admin_association_form_order_placeholder: "1",
    admin_association_form_status_label: "Status",
    admin_association_form_status_active: "Active",
    admin_association_form_status_inactive: "Inactive",
    admin_association_form_bio_label: "Profile Description / Bio",
    admin_association_form_bio_placeholder: "Brief leadership overview...",
    admin_association_form_cancel: "Cancel",
    admin_association_form_save_changes: "Save Changes",
    admin_association_form_add_submit: "Add Team Member",

    // Alerts
    admin_association_alert_required_title: "Required Field",
    admin_association_alert_required_body: "Please provide member full name.",
    admin_association_alert_photo_uploaded_title: "Photo Uploaded",
    admin_association_alert_photo_uploaded_body: "Profile photo uploaded successfully.",
    admin_association_alert_photo_error: "Photo upload failed.",
    admin_association_alert_updated_title: "Profile Updated",
    admin_association_alert_updated_body: "{name} association profile updated.",
    admin_association_alert_created_title: "Team Member Added",
    admin_association_alert_created_body: "{name} added as {position}.",
    admin_association_alert_save_error: "Failed to save association team profile.",
    admin_association_alert_removed_title: "Removed",
    admin_association_alert_removed_body: "{name} removed from association team.",
    admin_association_alert_delete_error: "Failed to remove team member.",
    admin_association_alert_status_updated_title: "Status Updated",
    admin_association_alert_status_updated_body: "{name} status set to {status}.",
    admin_association_alert_status_error: "Failed to update status.",
    admin_association_alert_confirm_delete: "Are you sure you want to remove {name} from the Alumni Association Team?",

        // =====================================================================
    // RANK HOLDERS MANAGEMENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_rank_page_title: "School Rank Holders Management",
    admin_rank_page_subtitle: "Showcase students & alumni who achieved top academic rank excellence",
    admin_rank_add_btn: "Add Rank Holder",

    // Filters
    admin_rank_search_placeholder: "Search by student name, rank, or achievement...",
    admin_rank_all_years: "All Academic Years",

    // Table headers
    admin_rank_col_photo: "Photo",
    admin_rank_col_name: "Student / Alumni Name",
    admin_rank_col_year: "Academic Year",
    admin_rank_col_class: "Class",
    admin_rank_col_rank: "Rank",
    admin_rank_col_score: "Score / Marks",
    admin_rank_col_status: "Status",
    admin_rank_col_actions: "Actions",

    // Status badges
    admin_rank_status_active: "Active",
    admin_rank_status_inactive: "Inactive",

    // Row actions
    admin_rank_action_edit: "Edit Rank Holder",
    admin_rank_action_delete: "Delete Rank Holder",

    // Empty state
    admin_rank_empty_title: "No Rank Holders Found",
    admin_rank_empty_description: "Click 'Add Rank Holder' above to record student academic achievements.",
    admin_rank_empty_add_btn: "Add First Rank Holder",

    // Modal
    admin_rank_modal_title_add: "Add School Rank Holder",
    admin_rank_modal_title_edit: "Edit Rank Holder",
    admin_rank_form_alumni_select_label: "Select Alumni Profile (Optional)",
    admin_rank_form_alumni_select_placeholder: "-- Choose Existing Alumni (Autofills details) --",
    admin_rank_form_alumni_option_format: "{name} ({year} Batch)",

    admin_rank_form_name_label: "Student / Alumni Name *",
    admin_rank_form_name_placeholder: "e.g. Arun Kumar",
    admin_rank_form_name_ta_label: "Student Name (Tamil)",
    admin_rank_form_name_ta_placeholder: "e.g. அருண் குமார்",

    admin_rank_form_year_label: "Academic Year *",
    admin_rank_form_class_label: "Class / Standard *",
    admin_rank_form_rank_label: "Rank *",
    admin_rank_form_exam_label: "Exam / Achievement *",
    admin_rank_form_exam_placeholder: "e.g. SSLC / Public Examination",

    admin_rank_form_total_marks_label: "Total Score / Marks *",
    admin_rank_form_total_marks_placeholder: "e.g. 485 or 1150",
    admin_rank_form_max_marks_label: "Out of (Max Marks)",
    admin_rank_form_max_marks_placeholder: "e.g. 500 or 1200",
    admin_rank_form_percentage_label: "Percentage / Grade",
    admin_rank_form_percentage_placeholder: "e.g. 97.0% or A+",

    admin_rank_form_stream_label: "Subject / Stream (Optional)",
    admin_rank_form_stream_placeholder: "e.g. Science Stream / Biology-Maths",
    admin_rank_form_title_label: "Achievement Title",
    admin_rank_form_title_placeholder: "e.g. School First Rank",
    admin_rank_form_photo_label: "Photograph Photo",
    admin_rank_form_description_label: "Short Description (Optional)",
    admin_rank_form_description_placeholder: "Brief note about the student's achievement...",
    admin_rank_form_status_label: "Status",

    admin_rank_form_status_active_option: "Active (Show in Public Portal)",
    admin_rank_form_status_inactive_option: "Inactive (Hidden)",

    admin_rank_form_cancel: "Cancel",
    admin_rank_form_save: "Save Rank Holder",
    admin_rank_form_saving: "Saving...",

    // Rank options (dropdown)
    admin_rank_opt_1st: "1st Rank",
    admin_rank_opt_2nd: "2nd Rank",
    admin_rank_opt_3rd: "3rd Rank",
    admin_rank_opt_school_first: "School First",
    admin_rank_opt_district_first: "District First",
    admin_rank_opt_district_second: "District Second",
    admin_rank_opt_district_third: "District Third",
    admin_rank_opt_state_first: "State First",
    admin_rank_opt_state_second: "State Second",
    admin_rank_opt_state_third: "State Third",
    admin_rank_opt_other: "Other Achievement",

    // Class options
    admin_rank_class_10: "10th Standard",
    admin_rank_class_11: "11th Standard",
    admin_rank_class_12: "12th Standard",
    admin_rank_class_9: "9th Standard",

    // Alerts
    admin_rank_alert_required_title: "Required Fields Missing",
    admin_rank_alert_required_body: "Please fill in Student Name, Academic Year, Class, and Rank.",
    admin_rank_alert_updated_title: "Rank Holder Updated",
    admin_rank_alert_updated_body: "\"{name}\" details updated successfully.",
    admin_rank_alert_added_title: "Rank Holder Added",
    admin_rank_alert_added_body: "\"{name}\" has been added to Rank Holders.",
    admin_rank_alert_save_error: "Failed to save rank holder record.",
    admin_rank_alert_delete_confirm_title: "Delete Rank Holder?",
    admin_rank_alert_delete_confirm_body: "Are you sure you want to delete \"{name}\" from rank holders list?",
    admin_rank_alert_deleted_title: "Deleted",
    admin_rank_alert_deleted_body: "\"{name}\" removed from rank holders.",
    admin_rank_alert_delete_error: "Failed to delete rank holder.",

        // =====================================================================
    // REPORTS & DATA EXPORT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_reports_page_title: "Reports & Data Export",
    admin_reports_page_subtitle: "Aggregate stats, turnout metrics, and downloadable CSV reports",

    // Stats cards
    admin_reports_stat_total: "Total Alumni Registry",
    admin_reports_stat_verified: "Verified Active Alumni",
    admin_reports_stat_checkins: "Completed Check-ins",
    admin_reports_stat_turnout: "Turnout Rate",

    // CSV Export Center
    admin_reports_export_center_title: "CSV Roster & Analytics Export Center",
    admin_reports_export_roster_title: "Full Alumni Roster CSV",
    admin_reports_export_roster_desc: "Export all alumni contact details, admission numbers, and statuses",
    admin_reports_export_roster_btn: "Export Roster",
    admin_reports_export_attendance_title: "Get-Together Attendance Report",
    admin_reports_export_attendance_desc: "Export event RSVP lists, guest counts, and check-in times",
    admin_reports_export_attendance_btn: "Select Event",

    // Alert
    admin_reports_alert_select_event_title: "Select Event to Export",
    admin_reports_alert_select_event_body: "Please navigate to the Events Management tab and select a specific event to download its detailed attendance CSV report.",

        // =====================================================================
    // SCHOOL SETTINGS & HIERARCHY PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_settings_page_title: "School Settings & Hierarchy",
    admin_settings_page_subtitle: "Configure institutional profile, portal controls, and management staff hierarchy",

    // Tabs
    admin_settings_tab_profile: "School Profile & Branding",
    admin_settings_tab_controls: "Portal Controls & Toggles",
    admin_settings_tab_staff: "Management & Staff Hierarchy",

    // Profile tab — Institutional Profile
    admin_settings_section_inst_profile: "School Institutional Profile",
    admin_settings_section_inst_profile_sub: "General information and institutional identification",
    admin_settings_form_name_label: "School Official Name *",
    admin_settings_form_code_label: "School Code *",
    admin_settings_form_type_label: "School Type",
    admin_settings_form_type_placeholder: "e.g. Higher Secondary School",
    admin_settings_form_established_label: "Established Year",
    admin_settings_form_motto_label: "School Motto & Description",
    admin_settings_form_motto_placeholder: "Institutional overview, history, and motto...",

    // Profile tab — Branding
    admin_settings_section_branding: "Portal Branding & Image Uploads",
    admin_settings_section_branding_sub: "Upload or enter URLs for school logo and cover banner",
    admin_settings_form_logo_label: "School Logo Image",
    admin_settings_form_logo_choose: "Choose Logo File",
    admin_settings_form_logo_uploading: "Uploading...",
    admin_settings_form_logo_or_url: "or enter image URL",
    admin_settings_form_logo_url_placeholder: "https://example.com/logo.png",
    admin_settings_form_cover_label: "Banner Cover Image",
    admin_settings_form_cover_choose: "Choose Cover Banner File",
    admin_settings_form_cover_or_url: "or enter image URL",
    admin_settings_form_cover_url_placeholder: "https://example.com/cover.jpg",
    admin_settings_form_portal_name_label: "Alumni Portal Name",
    admin_settings_form_portal_name_placeholder: "NHSS Alumni Portal",
    admin_settings_form_tagline_label: "Portal Tagline",
    admin_settings_form_tagline_placeholder: "Connected Forever. Progressing Together.",
    admin_settings_preview_logo: "Logo Preview:",
    admin_settings_preview_cover: "Cover Banner Preview:",

    // Profile tab — Contact
    admin_settings_section_contact: "Official Contact & Location",
    admin_settings_section_contact_sub: "Campus contact details displayed on public directory",
    admin_settings_form_email_label: "Official Email *",
    admin_settings_form_phone_label: "Contact Phone *",
    admin_settings_form_website_label: "Official Website",
    admin_settings_form_address_label: "Campus Address",
    admin_settings_form_city_label: "City",
    admin_settings_form_district_label: "District",
    admin_settings_form_state_label: "State",
    admin_settings_form_pincode_label: "PIN Code",

    admin_settings_btn_save_profile: "Save Profile Settings",

    // Controls tab
    admin_settings_section_controls: "Portal Feature Control Switches",
    admin_settings_section_controls_sub: "Enable or disable portal registration, approvals, directory access, and notifications",
    admin_settings_toggle_reg_title: "Alumni Registration",
    admin_settings_toggle_reg_sub: "Allow new alumni to register on the public portal",
    admin_settings_toggle_approval_title: "Manual Admin Verification / Approval",
    admin_settings_toggle_approval_sub: "Require school admin verification before granting full portal access",
    admin_settings_toggle_directory_title: "Public Alumni Directory",
    admin_settings_toggle_directory_sub: "Allow verified alumni to browse directory and batch rosters",
    admin_settings_toggle_events_title: "Event RSVP & Ticketing",
    admin_settings_toggle_events_sub: "Enable event RSVP registrations and QR ticket check-ins",
    admin_settings_toggle_announcements_title: "Announcement Broadcast Notifications",
    admin_settings_toggle_announcements_sub: "Allow school management to send broadcast notices to alumni",
    admin_settings_btn_save_controls: "Save Portal Switches",

    // Staff tab
    admin_settings_section_staff: "School Management & Staff Records",
    admin_settings_section_staff_sub: "Manage current active staff hierarchy and record honoured former educators",
    admin_settings_btn_add_current: "Add Current Staff",
    admin_settings_btn_add_past: "Add Former / Old Staff",

    admin_settings_filter_current: "Current Staff ({count})",
    admin_settings_filter_past: "Honoured Former / Old Staff ({count})",
    admin_settings_filter_all: "All Staff ({count})",

    admin_settings_staff_appointed: "{count} Appointed",
    admin_settings_staff_directory_current: "Current School Management & Active Staff",
    admin_settings_staff_directory_past: "Honoured Former / Old Staff Directory",
    admin_settings_staff_directory_all: "Complete Staff Directory",

    // Staff table columns
    admin_settings_col_member: "School Person / Staff Member",
    admin_settings_col_designation: "Designation / Position",
    admin_settings_col_category: "Staff Category & Tenure",
    admin_settings_col_department: "Department",
    admin_settings_col_status: "Status",
    admin_settings_col_action: "Action",

    // Staff table row values
    admin_settings_staff_id_prefix: "Staff ID: {id}",
    admin_settings_staff_id_na: "Staff ID: N/A",
    admin_settings_staff_current_badge: "Current Staff",
    admin_settings_staff_past_badge: "Honoured Former Staff",
    admin_settings_staff_service: "Service: {start} - {end}",
    admin_settings_staff_service_retired: "Retired",
    admin_settings_staff_service_present: "Present",
    admin_settings_staff_department_default: "General Administration",
    admin_settings_staff_status_active: "ACTIVE",
    admin_settings_staff_status_inactive: "INACTIVE",
    admin_settings_staff_action_move_to_current: "Restore to Current Staff",
    admin_settings_staff_action_move_to_past: "Move to Former Staff Records",
    admin_settings_staff_action_edit: "Edit Person Details",
    admin_settings_staff_action_delete: "Delete Staff Record",

    // Staff modal
    admin_settings_staff_modal_edit_title: "Edit School Staff Record",
    admin_settings_staff_modal_add_past_title: "Add Honoured Former / Old Staff Member",
    admin_settings_staff_modal_add_current_title: "Add Current School Staff Member",

    admin_settings_staff_modal_info_past_title: "Former / Old Staff Record",
    admin_settings_staff_modal_info_past_body: "Record past headmasters, veteran teachers, and former employees to display in the school legacy archive.",
    admin_settings_staff_modal_info_current_title: "Current Active Staff Member",
    admin_settings_staff_modal_info_current_body: "Add or update active school staff members and assign their designation position in the school management hierarchy.",

    admin_settings_staff_radio_current: "Current Active Staff",
    admin_settings_staff_radio_past: "Honoured Former / Old Staff",

    admin_settings_form_staff_name_en_label: "Full Name (English) *",
    admin_settings_form_staff_name_en_placeholder: "e.g. Dr. S. Ramesh",
    admin_settings_form_staff_name_ta_label: "Full Name (Tamil / தமிழ் பெயர்)",
    admin_settings_form_staff_name_ta_placeholder: "எ.கா. டாக்டர் எஸ். ரமேஷ்",
    admin_settings_form_staff_position_label: "Designation / School Position *",
    admin_settings_form_staff_position_ta_label: "Position Title (Tamil / தமிழ் பதவி)",
    admin_settings_form_staff_position_ta_placeholder: "எ.கா. தலைமை ஆசிரியர் / மூத்த ஆசிரியர்",
    admin_settings_form_staff_custom_position_label: "Custom Designation / Position Title (English) *",
    admin_settings_form_staff_custom_position_placeholder: "e.g. Academic Coordinator, Former Senior Teacher, Former Warden",
    admin_settings_form_staff_start_year_label: "Service Start Year",
    admin_settings_form_staff_start_year_placeholder: "e.g. 1985",
    admin_settings_form_staff_end_year_label: "Service End Year (Optional)",
    admin_settings_form_staff_end_year_past_label: "Service End Year / Retirement",
    admin_settings_form_staff_end_year_placeholder: "e.g. 2012",
    admin_settings_form_staff_department_en_label: "Department (English)",
    admin_settings_form_staff_department_en_placeholder: "e.g. Science / Mathematics / Tamil",
    admin_settings_form_staff_department_ta_label: "Department (Tamil / தமிழ் துறை)",
    admin_settings_form_staff_department_ta_placeholder: "எ.கா. கணிதத் துறை / அறிவியல் துறை",
    admin_settings_form_staff_email_label: "Official Email",
    admin_settings_form_staff_email_placeholder: "email@school.edu.in",
    admin_settings_form_staff_mobile_label: "Mobile Number",
    admin_settings_form_staff_mobile_placeholder: "+91 98765 43210",
    admin_settings_form_staff_employee_id_label: "Employee / Staff ID",
    admin_settings_form_staff_employee_id_placeholder: "NHSS-STAFF-001",
    admin_settings_form_staff_photo_label: "Profile Photo",
    admin_settings_form_staff_photo_upload_btn: "Upload Photo",
    admin_settings_form_staff_photo_uploading: "Uploading...",
    admin_settings_form_staff_photo_placeholder: "https://example.com/photo.jpg",
    admin_settings_form_staff_achievements_en_label: "Achievements & Awards (English)",
    admin_settings_form_staff_achievements_en_placeholder: "e.g. State Best Teacher Awardee (1998)",
    admin_settings_form_staff_achievements_ta_label: "Achievements (Tamil / தமிழ் சாதனைகள்)",
    admin_settings_form_staff_achievements_ta_placeholder: "எ.கா. மாநில சிறந்த ஆசிரியர் விருது",
    admin_settings_form_staff_status_label: "Status",
    admin_settings_form_staff_status_active: "Active",
    admin_settings_form_staff_status_inactive: "Inactive",
    admin_settings_form_staff_notes_en_label: "Notes (English)",
    admin_settings_form_staff_notes_en_placeholder: "Role responsibilities...",
    admin_settings_form_staff_notes_ta_label: "Notes (Tamil / தமிழ் குறிப்புகள்)",
    admin_settings_form_staff_notes_ta_placeholder: "பங்களிப்பு குறிப்புகள்...",
    admin_settings_staff_modal_cancel: "Cancel",
    admin_settings_staff_modal_save_changes: "Save Changes",
    admin_settings_staff_modal_add_past_submit: "Add Former Staff",
    admin_settings_staff_modal_add_current_submit: "Add Current Staff",

    // School position names (translated for display; DB value stays English)
    admin_settings_pos_principal: "Principal",
    admin_settings_pos_vice_principal: "Vice Principal",
    admin_settings_pos_headmaster: "Headmaster",
    admin_settings_pos_headmistress: "Headmistress",
    admin_settings_pos_asst_headmaster: "Assistant Headmaster",
    admin_settings_pos_asst_headmistress: "Assistant Headmistress",
    admin_settings_pos_dept_head: "Department Head",
    admin_settings_pos_senior_teacher: "Senior Teacher",
    admin_settings_pos_teacher: "Teacher",
    admin_settings_pos_admin_staff: "Administrative Staff",
    admin_settings_pos_other: "Other (Write Custom Position)",

    // Position responsibilities (UI hints)
    admin_settings_pos_principal_resp: "Highest school authority; full school portal management",
    admin_settings_pos_vice_principal_resp: "Supports Principal and manages assigned school operations",
    admin_settings_pos_headmaster_resp: "School administration and academic management",
    admin_settings_pos_headmistress_resp: "School administration and academic management",
    admin_settings_pos_asst_headmaster_resp: "Supports Headmaster and manages delegated responsibilities",
    admin_settings_pos_asst_headmistress_resp: "Supports Headmaster and manages delegated responsibilities",
    admin_settings_pos_dept_head_resp: "Manages department/class-related activities",
    admin_settings_pos_senior_teacher_resp: "Manages department/class-related activities",
    admin_settings_pos_teacher_resp: "Student/alumni-related activities assigned by management",
    admin_settings_pos_admin_staff_resp: "Office and administrative operations",
    admin_settings_pos_other_resp: "Custom school position or designation",

    // Alerts
    admin_settings_alert_logo_uploaded_title: "Logo Uploaded",
    admin_settings_alert_logo_uploaded_body: "School logo image uploaded successfully.",
    admin_settings_alert_logo_error: "Logo upload failed.",
    admin_settings_alert_cover_uploaded_title: "Cover Banner Uploaded",
    admin_settings_alert_cover_uploaded_body: "School banner image uploaded successfully.",
    admin_settings_alert_cover_error: "Banner upload failed.",
    admin_settings_alert_staff_photo_uploaded_title: "Photo Uploaded",
    admin_settings_alert_staff_photo_uploaded_body: "Staff profile photo uploaded successfully.",
    admin_settings_alert_staff_photo_error: "Staff photo upload failed.",
    admin_settings_alert_profile_updated_title: "School Profile Updated",
    admin_settings_alert_profile_updated_body: "School profile, branding, and contact details saved successfully.",
    admin_settings_alert_profile_update_error: "Failed to update school profile.",
    admin_settings_alert_required_title: "Required Field",
    admin_settings_alert_required_body: "Please enter Full Name.",
    admin_settings_alert_staff_updated_title: "Staff Record Updated",
    admin_settings_alert_staff_updated_body: "{name} details updated.",
    admin_settings_alert_staff_added_title: "Staff Added",
    admin_settings_alert_staff_added_body: "{name} added to {target}.",
    admin_settings_alert_staff_added_target_current: "Current Management",
    admin_settings_alert_staff_added_target_past: "Former Staff Records",
    admin_settings_alert_staff_save_error: "Failed to save staff record.",
    admin_settings_alert_staff_confirm_move: "Are you sure you want to move {name} to {target}?",
    admin_settings_alert_staff_move_target_current: "Current Active Staff",
    admin_settings_alert_staff_move_target_past: "Former / Old Staff",
    admin_settings_alert_staff_moved_title: "Staff Status Moved",
    admin_settings_alert_staff_moved_body: "{name} moved to {target}.",
    admin_settings_alert_staff_move_error: "Failed to update staff status.",
    admin_settings_alert_staff_confirm_delete: "Are you sure you want to remove {name} from school staff records?",
    admin_settings_alert_staff_deleted_title: "Staff Removed",
    admin_settings_alert_staff_deleted_body: "{name} removed successfully.",
    admin_settings_alert_staff_delete_error: "Failed to remove staff member.",

        // =====================================================================
    // SCHOOL ADMIN DASHBOARD / OVERVIEW PAGE — NEW KEYS
    // =====================================================================
    // Stats cards
    admin_dashboard_stat_total_alumni: "Total Alumni",
    admin_dashboard_stat_total_alumni_sub: "Configured school registry",
    admin_dashboard_stat_verified: "Verified Alumni",
    admin_dashboard_stat_verified_sub: "Approved active members",
    admin_dashboard_stat_pending: "Pending Applications",
    admin_dashboard_stat_pending_sub: "Awaiting admin review",
    admin_dashboard_stat_cohorts: "Active Cohorts",
    admin_dashboard_stat_cohorts_sub: "2005 - 2025 Batches",
    admin_dashboard_stat_turnout: "Turnout Rate",
    admin_dashboard_stat_turnout_sub: "Event check-in ratio",

    // Hero upcoming event
    admin_dashboard_event_badge: "FEATURED GET-TOGETHER REUNION",
    admin_dashboard_event_confirmed: "{attending} Confirmed ({guests} total guests)",
    admin_dashboard_event_view_rsvp: "View RSVP Roster",

    // Pending queue section
    admin_dashboard_queue_title: "Pending Alumni Verification Queue",
    admin_dashboard_queue_subtitle: "Recent applications requiring school admin verification",
    admin_dashboard_queue_view_all: "View All ({count})",
    admin_dashboard_queue_empty: "✓ No pending applications requiring review!",
    admin_dashboard_queue_meta: "Batch {batch} • Adm No: {adm} • {mobile}",

    // Pending queue row actions
    admin_dashboard_queue_view_details: "View Full Application Details",
    admin_dashboard_queue_approve: "Approve",

    // Alumni detail modal
    admin_dashboard_detail_modal_title: "Alumni Registration Application Details",
    admin_dashboard_detail_batch_line: "Batch {batch} {section} • Adm No: {adm}",
    admin_dashboard_detail_section_suffix: "• Sec {section}",
    admin_dashboard_detail_na: "N/A",
    admin_dashboard_detail_company_prefix: "at {company}",

    admin_dashboard_detail_section_contact: "Contact & Personal Details",
    admin_dashboard_detail_section_academic: "Academic & School Records",
    admin_dashboard_detail_section_professional: "Professional Background",

    admin_dashboard_detail_label_mobile: "Mobile Number:",
    admin_dashboard_detail_label_email: "Email Address:",
    admin_dashboard_detail_label_gender: "Gender:",
    admin_dashboard_detail_label_dob: "Date of Birth:",
    admin_dashboard_detail_label_blood: "Blood Group:",
    admin_dashboard_detail_label_city: "Current City / Location:",
    admin_dashboard_detail_label_address: "Residential Address:",
    admin_dashboard_detail_label_passing_year: "Passing Year (Batch):",
    admin_dashboard_detail_label_admission_no: "Admission Number:",
    admin_dashboard_detail_label_higher_ed: "Higher Education / Degree:",
    admin_dashboard_detail_label_college: "College / Institution:",
    admin_dashboard_detail_label_profession: "Profession:",
    admin_dashboard_detail_label_company: "Company / Employer:",
    admin_dashboard_detail_label_designation: "Designation:",
    admin_dashboard_detail_label_linkedin: "LinkedIn:",
    admin_dashboard_detail_profile_link: "Profile Link",
    admin_dashboard_detail_class_of: "Class of {year}",

    admin_dashboard_detail_close: "Close",
    admin_dashboard_detail_approve_btn: "Approve Application",

    // Approve confirmation modal
    admin_dashboard_confirm_modal_title: "Confirm Alumni Approval",
    admin_dashboard_confirm_heading: "Approve {name}?",
    admin_dashboard_confirm_body: "Are you sure you want to approve this registration application?",
    admin_dashboard_confirm_meta: "Batch {batch} • Admission No: {adm}",
    admin_dashboard_confirm_note: "✓ This will activate their verified alumni profile and dispatch an approval notification.",
    admin_dashboard_confirm_notes_label: "Verification Notes (Optional)",
    admin_dashboard_confirm_notes_placeholder: "e.g. Verified from school permanent record register",
    admin_dashboard_confirm_cancel: "Cancel",
    admin_dashboard_confirm_approving: "Approving...",
    admin_dashboard_confirm_submit: "Confirm & Approve",

    // Alerts
    admin_dashboard_alert_approved_title: "Alumni Approved Successfully",
    admin_dashboard_alert_approved_body: "Alumni registration for {name} has been approved and confirmation notification sent.",
    admin_dashboard_alert_approval_error: "Approval failed.",
    admin_dashboard_approval_default_note: "Approved by school admin from dashboard",

        // =====================================================================
    // SHARED HEADER & PAGE TITLES (school-admin) — NEW KEYS
    // =====================================================================
    // Header
    admin_header_subtitle: "School Alumni Management System",
    admin_header_role_chip: "School Admin",
    admin_header_search_placeholder: "Search alumni, batch...",
    admin_header_default_user_name: "School Admin",
    admin_header_default_user_role: "Administrator",
    admin_header_avatar_alt: "Avatar",

    // Page titles (used by SchoolAdminLayout.getPageTitle)
    admin_page_title_csv_import: "CSV Alumni Roster Import",
    admin_page_title_alumni_directory: "Alumni Directory & Management",
    admin_page_title_verification: "Verification Queue",
    admin_page_title_batches: "Batches & Cohorts",
    admin_page_title_create_event: "Create Reunion Event",
    admin_page_title_school_events: "School Events & Celebrations",
    admin_page_title_events: "Alumni Events & Get-Togethers",
    admin_page_title_announcements: "Announcements Feed",
    admin_page_title_memories: "Memories & Photo Moderation",
    admin_page_title_association: "Association Leadership Team",
    admin_page_title_rank_holders: "Academic Rank Holders & Toppers",
    admin_page_title_reports: "Reports & Analytics",
    admin_page_title_settings: "School Settings",
    admin_page_title_overview: "School Admin Overview",

        // =====================================================================
    // ALUMNI VERIFICATION QUEUE PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_verify_page_title: "Alumni Verification Queue",
    admin_verify_page_subtitle: "Review pending registration applications against school records",

    // Empty state
    admin_verify_empty_title: "Verification Queue Empty",
    admin_verify_empty_desc: "All alumni registration applications have been verified. Excellent work!",

    // Card content
    admin_verify_batch_line: "Batch {batch} (Sec {section})",
    admin_verify_label_admission: "Admission No:",
    admin_verify_label_mobile: "Mobile:",
    admin_verify_label_email: "Email:",
    admin_verify_label_city: "City:",
    admin_verify_label_profession: "Profession:",

    // Card actions
    admin_verify_btn_approve: "Approve",
    admin_verify_btn_reject: "Reject",

    // Review modal
    admin_verify_modal_confirm_approval: "Confirm Approval",
    admin_verify_modal_confirm_rejection: "Confirm Rejection",
    admin_verify_modal_applicant_line: "Applicant: {name} (Batch {batch})",
    admin_verify_modal_notes_label: "Verification Notes",
    admin_verify_modal_notes_placeholder: "Reason or verification note...",
    admin_verify_modal_cancel: "Cancel",
    admin_verify_modal_confirm_btn: "Confirm Decision",

    // Default notes (prefilled)
    admin_verify_default_approve_note: "Verified against permanent school roster",
    admin_verify_default_reject_note: "Records could not be matched with school files",

    // Alerts
    admin_verify_alert_approved_title: "Alumni Approved & Verification Email Sent",
    admin_verify_alert_rejected_title: "Application Rejected",
    admin_verify_alert_approved_body: "Alumni registration for {name} has been approved and notification email dispatched successfully.",
    admin_verify_alert_rejected_body: "Alumni registration for {name} has been rejected successfully.",
    admin_verify_alert_error: "Unable to submit verification decision.",

        // =====================================================================
    // AUDIT & FINANCIAL STATEMENTS — Public + Admin + Alumni
    // =====================================================================
    nav_audit: "Audit",

    audit_page_title: "Audit & Financial Statements",
    audit_page_subtitle: "Transparency builds trust. Explore our annual financial statements, auditor reports, and contribution details.",
    audit_statements_title: "Audit Statements",
    audit_read_more: "Read More",
    audit_back_to_audit: "Back to Audit",
    audit_view_pdf: "View PDF",
    audit_download_pdf: "Download PDF",
    audit_details_title: "Audit Details",
    audit_label_title: "Title",
    audit_label_period: "Period",
    audit_label_posted_on: "Posted on",
    audit_label_file_name: "File Name",
    audit_label_file_size: "File Size",
    audit_no_statements: "No audit statements published yet.",
    audit_no_statements_desc: "Please check back later — audit reports for the current financial year will appear here once published.",
    audit_loading_pdf: "Loading PDF document...",
    audit_pdf_unavailable: "PDF document is not available for this statement.",
    audit_open_in_new_tab: "Open in new tab",

    audit_why_title: "Why We Publish Audit Reports?",
    audit_why_body: "Our alumni association is committed to complete transparency in all financial activities. The audit reports provide a clear view of income, expenditure, and the use of contributions.",
    audit_why_check_1: "Accountability to our alumni community",
    audit_why_check_2: "Proper utilization of funds",
    audit_why_check_3: "Building long-term trust",
    audit_why_check_4: "Supporting a stronger alumni network",

    audit_accountability_quote: "\u201CAccountability Today, A Stronger Tomorrow\u201D",
    audit_accountability_author: "NHS Alumni Association",

    audit_top_contributors_title: "Top Contributors",
    audit_top_contributors_view_all: "View All",
    audit_top_contributors_empty: "No public contributions recorded for this financial year yet.",
    audit_col_sno: "S.NO",
    audit_col_name: "Name",
    audit_col_batch: "Batch",
    audit_col_amount: "Contribution Amount (\u20B9)",
    audit_col_date: "Contribution Date",

    audit_sponsors_title: "Our Sponsors",
    audit_sponsors_empty: "No sponsors listed for this financial year yet.",
    audit_sponsors_visit: "Visit Website",
    audit_sponsors_col_serial: "S.No",
    audit_sponsors_col_date: "Date of Sponsor",
    audit_sponsors_col_name: "Sponsor Name",
    audit_sponsors_col_sponsored_items: "Sponsored Items",
    audit_sponsors_col_budget: "Budget",
    audit_sponsors_col_action: "Action",
    audit_sponsors_view_more: "View More",
    audit_sponsors_detail_title: "Sponsor Details",
    audit_sponsors_detail_date: "Sponsor Date",
    audit_sponsors_detail_financial_year: "Financial Year",
    audit_sponsors_detail_amount: "Amount",
    audit_sponsors_detail_item: "Sponsored Item / Contribution",
    audit_sponsors_detail_description: "Description",

    // Admin — Audit Manager
    admin_financial_management: "Financial Management",
    admin_audit_page_title: "Audit & Financial Statements",
    admin_audit_page_subtitle: "Publish, update, and manage annual audit statements and their PDF attachments.",
    admin_audit_btn_add: "Add Audit Statement",
    admin_audit_empty_title: "No Audit Statements Yet",
    admin_audit_empty_desc: "Create your first audit statement to make it available on the public Audit page.",
    admin_audit_col_title: "Title / Financial Year",
    admin_audit_col_period: "Period",
    admin_audit_col_posted: "Posted On",
    admin_audit_col_status: "Status",
    admin_audit_col_order: "Order",
    admin_audit_col_actions: "Actions",
    admin_audit_badge_published: "Published",
    admin_audit_badge_draft: "Unpublished",
    admin_audit_modal_title_create: "Add Audit Statement",
    admin_audit_modal_title_edit: "Edit Audit Statement",
    admin_audit_form_title_en: "Title (English) *",
    admin_audit_form_title_ta: "Title (Tamil)",
    admin_audit_form_desc_en: "Description (English)",
    admin_audit_form_desc_ta: "Description (Tamil)",
    admin_audit_form_fy: "Financial Year *",
    admin_audit_form_fy_placeholder: "e.g. 2025 - 2026",
    admin_audit_form_period_start: "Period Start *",
    admin_audit_form_period_start_placeholder: "01.04.2025",
    admin_audit_form_period_end: "Period End *",
    admin_audit_form_period_end_placeholder: "31.03.2026",
    admin_audit_form_posted_date: "Posted Date Label",
    admin_audit_form_posted_date_placeholder: "14th May, 2026",
    admin_audit_form_order: "Display Order",
    admin_audit_form_published: "Publish on public Audit page",
    admin_audit_form_pdf: "Audit PDF Document *",
    admin_audit_pdf_attached: "PDF Attached",
    admin_audit_pdf_not_attached: "No PDF uploaded yet",
    admin_audit_pdf_upload: "Upload PDF",
    admin_audit_pdf_replace: "Replace PDF",
    admin_audit_pdf_uploading: "Uploading PDF...",
    admin_audit_pdf_only: "Only PDF files are accepted (max 30MB).",
    admin_audit_alert_missing_title: "Please enter an English title.",
    admin_audit_alert_missing_fy: "Please enter the financial year (e.g. 2025 - 2026).",
    admin_audit_alert_missing_period: "Please enter the audit period start and end dates.",
    admin_audit_alert_missing_pdf: "Please upload the audit PDF before saving.",
    admin_audit_alert_saved_title: "Audit Statement Saved",
    admin_audit_alert_saved_body: "The audit statement has been saved successfully.",
    admin_audit_alert_deleted_title: "Audit Statement Deleted",
    admin_audit_alert_deleted_body: "The audit statement has been removed.",
    admin_audit_confirm_delete: "Are you sure you want to delete this audit statement? This cannot be undone.",

    // Admin — Contribution Manager
    admin_contributions_page_title: "Alumni Contributions",
    admin_contributions_page_subtitle: "Review, verify, and manage alumni contributions. Control public visibility for the Top Contributors list.",
    // admin_contributions_stat_total: "Total Collected",
    admin_contributions_stat_count: "Total Contributions",
    admin_contributions_stat_completed: "Completed",
    admin_contributions_stat_pending: "Pending",
    admin_contributions_filter_all_status: "All Statuses",
    admin_contributions_filter_all_fy: "All Financial Years",
    admin_contributions_search_placeholder: "Search by contributor, reference, purpose...",
    admin_contributions_col_contributor: "Contributor",
    admin_contributions_col_batch: "Batch",
    admin_contributions_col_amount: "Amount (\u20B9)",
    admin_contributions_col_date: "Date",
    admin_contributions_col_fy: "FY",
    admin_contributions_col_purpose: "Purpose",
    admin_contributions_col_status: "Status",
    admin_contributions_col_visibility: "Public",
    admin_contributions_col_actions: "Actions",
    admin_contributions_badge_visible: "Visible",
    admin_contributions_badge_hidden: "Hidden",
    admin_contributions_action_approve: "Mark Completed",
    admin_contributions_action_reject: "Reject",
    admin_contributions_action_edit: "Edit",
    admin_contributions_action_delete: "Delete",
    admin_contributions_action_toggle_visibility: "Toggle public visibility",
    admin_contributions_empty_title: "No Contributions Found",
    admin_contributions_empty_desc: "No alumni contributions match the current filters.",
    admin_contributions_modal_title: "Edit Contribution",
    admin_contributions_form_amount: "Amount (\u20B9)",
    admin_contributions_form_purpose: "Purpose",
    admin_contributions_form_status: "Status",
    admin_contributions_form_date: "Contribution Date",
    admin_contributions_form_fy: "Financial Year",
    admin_contributions_form_reference: "Payment Reference",
    admin_contributions_form_admin_remarks: "Admin Remarks",
    admin_contributions_form_public: "Show in public Top Contributors list",
    admin_contributions_alert_updated_title: "Contribution Updated",
    admin_contributions_alert_updated_body: "The contribution has been updated successfully.",
    admin_contributions_alert_deleted_title: "Contribution Deleted",
    admin_contributions_alert_deleted_body: "The contribution record has been removed.",
    admin_contributions_confirm_delete: "Are you sure you want to delete this contribution record?",

    // Admin — Sponsor Manager
    admin_sponsors_page_title: "Sponsors",
    admin_sponsors_page_subtitle: "Manage sponsors and their logos. Sponsors appear grouped by financial year on the public Audit detail page.",
    admin_sponsors_btn_add: "Add Sponsor",
    admin_sponsors_filter_fy_label: "Financial Year:",
    admin_sponsors_col_logo: "Logo",
    admin_sponsors_col_name: "Sponsor Name",
    admin_sponsors_col_fy: "FY",
    admin_sponsors_col_published: "Published",
    admin_sponsors_col_actions: "Actions",
    admin_sponsors_badge_published: "Published",
    admin_sponsors_badge_draft: "Draft",
    admin_sponsors_empty_title: "No Sponsors Yet",
    admin_sponsors_empty_desc: "Add your first sponsor to appear on the public Audit detail page.",
    admin_sponsors_modal_title_create: "Add Sponsor",
    admin_sponsors_modal_title_edit: "Edit Sponsor",
    admin_sponsors_form_name: "Sponsor Name *",
    admin_sponsors_form_name_ta: "Sponsor Name (Tamil)",
    admin_sponsors_form_logo: "Sponsor Image (optional)",
    admin_sponsors_form_website: "Website URL (optional)",
    admin_sponsors_form_description: "Description",
    admin_sponsors_form_description_ta: "Description (Tamil)",
    admin_sponsors_form_fy: "Financial Year *",
    admin_sponsors_form_amount: "Budget / Amount",
    admin_sponsors_form_sponsored_item: "Sponsored Item / Contribution",
    admin_sponsors_form_published: "Publish on public Audit detail page",
    admin_sponsors_alert_saved_title: "Sponsor Saved",
    admin_sponsors_alert_saved_body: "The sponsor has been saved successfully.",
    admin_sponsors_alert_deleted_title: "Sponsor Deleted",
    admin_sponsors_alert_deleted_body: "The sponsor has been removed.",
    admin_sponsors_confirm_delete: "Are you sure you want to delete this sponsor?",
    admin_sponsors_alert_missing_name: "Please enter the sponsor name.",
    admin_sponsors_alert_missing_fy: "Please enter the financial year.",

    // =====================================================================
    // Alumni — Support School / Contributions
    // =====================================================================
    alumni_section_support: "SUPPORT SCHOOL",
    alumni_nav_support_school: "Support School",
    alumni_nav_contribute: "Contribute",
    alumni_nav_my_contributions: "My Contributions",

    alumni_support_page_title: "Support Our School",
    alumni_support_page_subtitle: "Your contributions directly fund scholarships, infrastructure, and student welfare programs.",

    // NEW — 3 main section headers
    alumni_support_section_my_activities: "My Activities",
    alumni_support_section_contribution: "Contribution",
    alumni_support_section_sponsors: "Sponsors",
    alumni_support_my_activities_subtitle: "A quick summary of what you have contributed and sponsored.",
    alumni_support_activity_total: "Total",
    alumni_support_activity_latest: "Latest",

    alumni_support_cta_contribute: "Make a Contribution",
    alumni_support_cta_history: "View My Contributions",
    alumni_support_cta_sponsors: "Sponsors",
    alumni_support_cta_my_sponsors: "My Sponsors",

    // NEW — Contribution CTA
    alumni_support_cta_make_contribution: "Make a Contribution",
    alumni_support_make_contribution_subtitle: "Support NHS School through your contribution.",
    alumni_my_contributions_title: "My Contributions",

    // NEW — Sponsor CTA
    alumni_support_cta_make_sponsor: "Make a Sponsor",
    alumni_support_make_sponsor_subtitle: "Support a student, school activity or requirement through sponsorship.",

    alumni_support_info_title: "Where Your Contribution Goes",
    alumni_support_info_scholarship: "Student Scholarships",
    alumni_support_info_scholarship_desc: "Supporting deserving students from underprivileged backgrounds.",
    alumni_support_info_infrastructure: "School Infrastructure",
    alumni_support_info_infrastructure_desc: "Classrooms, library, lab equipment, and campus facilities.",
    alumni_support_info_event: "Events & Programs",
    alumni_support_info_event_desc: "Alumni reunions, mentorship programs, and student activities.",
    alumni_support_info_general: "General Fund",
    alumni_support_info_general_desc: "Wherever the school needs it the most.",

    alumni_contribute_title: "Make a Contribution",
    alumni_contribute_subtitle: "Fill in the details below. Your contribution will be reviewed and confirmed by the school admin.",
    alumni_contribute_form_amount: "Amount (\u20B9) *",
    alumni_contribute_form_amount_placeholder: "e.g. 5000",
    alumni_contribute_form_purpose: "Purpose",
    alumni_contribute_form_purpose_note: "Purpose Note (optional)",
    alumni_contribute_form_date: "Contribution Date",
    alumni_contribute_form_payment_method: "Payment Method",
    alumni_contribute_form_reference: "Payment Reference / Transaction ID",
    alumni_contribute_form_proof: "Payment Proof (optional)",
    alumni_contribute_form_remarks: "Remarks (optional)",
    alumni_contribute_form_public: "Show my name in the public Top Contributors list",
    alumni_contribute_submit: "Submit Contribution",
    alumni_contribute_submitting: "Submitting...",
    alumni_contribute_success_title: "Contribution Submitted",
    alumni_contribute_success_body: "Thank you for your support! Your contribution is now awaiting admin verification.",

    alumni_contributions_title: "My Contributions",
    alumni_contributions_subtitle: "A complete history of your contributions to the school.",
    alumni_contributions_total_label: "Total Contributed",
    alumni_contributions_empty_title: "No Contributions Yet",
    alumni_contributions_empty_desc: "You haven't made any contributions yet. Support your school today!",
    alumni_contributions_col_date: "Date",
    alumni_contributions_col_amount: "Amount (\u20B9)",
    alumni_contributions_col_purpose: "Purpose",
    alumni_contributions_col_fy: "Financial Year",
    alumni_contributions_col_status: "Status",
    alumni_contributions_status_pending: "Pending Verification",
    alumni_contributions_status_completed: "Completed",
    alumni_contributions_status_rejected: "Rejected",
    alumni_sponsors_title: "OTHER ALUMNI SPONSORS",
    alumni_sponsors_subtitle: "Published sponsorships supporting our school.",
    alumni_sponsors_add: "Add Sponsor",
    alumni_sponsors_edit: "Edit Sponsor",
    alumni_sponsors_name: "Sponsor Name *",
    alumni_sponsors_name_ta: "Sponsor Name (Tamil)",
    alumni_sponsors_financial_year: "Financial Year *",
    alumni_sponsors_amount: "Sponsorship Amount",
    alumni_sponsors_item: "Sponsored Item / What was sponsored",
    alumni_sponsors_description: "Sponsor Description",
    alumni_sponsors_description_ta: "Sponsor Description (Tamil)",
    alumni_sponsors_website: "Website",
    alumni_sponsors_upload_logo: "Upload Image",
    alumni_sponsors_uploading: "Uploading...",
    alumni_sponsors_submit: "Submit Sponsor",
    alumni_sponsors_cancel: "Cancel",
    alumni_sponsors_pending: "Pending Approval",
    alumni_sponsors_published: "Published",
    alumni_sponsors_empty: "No published sponsors for this financial year yet.",
    alumni_my_sponsors_title: "My Sponsors",
    alumni_my_sponsors_subtitle: "Sponsorships submitted from your account.",
    alumni_my_sponsors_empty: "You have not submitted any sponsorships yet.",
    alumni_sponsors_missing_title: "Missing details",
    alumni_sponsors_missing_body: "Please enter a sponsor name and financial year.",
    alumni_sponsors_saved_title: "Sponsor Submitted",
    alumni_sponsors_saved_body: "Your sponsor has been submitted for admin review.",
    alumni_sponsors_save_error: "Failed to save sponsor.",
    alumni_sponsors_delete_confirm: "Delete this sponsorship?",
    alumni_sponsors_delete_error: "Failed to delete sponsor.",
    alumni_sponsors_upload_error: "Failed to upload sponsor logo.",

    // Purpose labels
    contribution_purpose_general: "General Fund",
    contribution_purpose_scholarship: "Scholarships",
    contribution_purpose_infrastructure: "Infrastructure",
    contribution_purpose_event: "Events & Programs",
    contribution_purpose_other: "Other",

  },
  ta: {
    // Navbar & Common
    app_title: "நடராஜன் மேல்நிலைப் பள்ளி",
    tagline: "பள்ளி முன்னாள் மாணவர்கள் சங்கம்",
    nav_home: "முகப்பு",
    nav_about: "எங்களைப் பற்றி",
    nav_school_profile: "நமது பள்ளி",
    nav_batches: "வகுப்புகள்",
    nav_events: "நிகழ்வுகள்",
    nav_memories: "நினைவுகள்",
    nav_contact: "தொடர்பு",
    nav_get_mobile_app: "மொபைல் செயலி பெறுக",
    nav_register: "பதிவு செய்ய",
    nav_login: "உள்நுழைக",
    nav_logout: "வெளியேறுக",
    language_name: "தமிழ்",

    // Hero & Home Page
    hero_badge: "முன்னாள் மாணவர்கள் வலைப்பின்னல்",
    hero_title_1: "கடந்த காலத்தையும் நிகழ்காலத்தையும் இணைக்கிறது",
    hero_title_2: "முன்னாள் மாணவர்கள் சங்கம்",
    hero_subtitle: "முன்னாள் வகுப்பு தோழர்களுடன் மீண்டும் இணையுங்கள், நினைவுகளைப் பகிர்ந்து கொள்ளுங்கள், நிகழ்வுகளில் பங்கேற்கவும், தாய் பள்ளிக்கு ஆதரவளிக்கவும்.",
    join_network_btn: "சங்கத்தில் சேரவும்",
    explore_events_btn: "நிகழ்வுகளைப் பார்க்க",
    community_stats_title: "நமது சமூகத்தின் பலம்",
    stat_alumni: "பதிவுசெய்த முன்னாள் மாணவர்கள்",
    stat_batches: "செயலில் உள்ள வகுப்புகள்",
    stat_events: "நடத்தப்பட்ட நிகழ்வுகள்",
    stat_memories: "பகிரப்பட்ட நினைவுகள்",
    upcoming_events_title: "வரவிருக்கும் நிகழ்வுகள்",
    view_all_events: "அனைத்து நிகழ்வுகளையும் பார்க்க",
    no_events_yet: "தற்போது புதிய நிகழ்வுகள் எதுவும் திட்டமிடப்படவில்லை.",
    recent_memories_title: "இனிய பள்ளி நினைவுகள்",
    view_all_memories: "கேலரியைப் பார்க்க",
    no_memories_yet: "நினைவுகள் எதுவும் இன்னும் பதிவேற்றப்படவில்லை. முதன்முதலில் பகிரவும்!",
    school_admin_request_title: "நீங்கள் பள்ளி நிர்வாகியா?",
    school_admin_request_desc: "முன்னாள் மாணவர்களை நிர்வகிக்க, வகுப்புகளை உருவாக்க, மறுசந்திப்புகளை ஏற்பாடு செய்ய உங்கள் பள்ளியைப் பதிவு செய்யுங்கள்.",
    register_school_btn: "உங்கள் பள்ளியைப் பதிவு செய்க",
    find_batch_title: "பள்ளி நண்பர்களைக் கண்டறிய 😊",
    find_batch_desc: "தேர்ச்சி பெற்ற ஆண்டு மற்றும் பிரிவு மூலம் உங்கள் தோழர்களைத் தேடி இணையுங்கள்.",

    // School Profile
    school_profile_title: "பள்ளி விவரம் மற்றும் வரலாறு",
    school_code: "பள்ளி குறியீடு",
    established: "நிறுவப்பட்டது",
    location: "இடம்",
    principal_message: "முதல்வரின் செய்தி",
    total_alumni: "மொத்த முன்னாள் மாணவர்கள்",
    active_batches: "பதிவு செய்யப்பட்ட வகுப்புகள்",
    contact_info: "தொடர்பு விவரங்கள்",

    // Batches Page (Public)
    batches_title: "முன்னாள் மாணவர்கள் வகுப்புகள்",
    search_batches_placeholder: "வகுப்பு ஆண்டு அல்லது பிரிவை தேடுக...",
    view_batch_members: "உறுப்பினர்களைப் பார்க்க",
    no_batches_found: "உங்கள் தேடலுக்கு ஏற்ற வகுப்புகள் எதுவும் கிடைக்கவில்லை.",

    // Events Page
    events_page_title: "மறுசந்திப்புகள் மற்றும் நிகழ்வுகள்",
    event_date: "தேதி",
    event_time: "நேரம்",
    event_venue: "இடம்",
    event_capacity: "கொள்ளளவு",
    event_register_btn: "நிகழ்வுக்குப் பதிவு செய்க",
    spots_remaining: "இடங்கள் உள்ளன",

    // Memories Page
    memories_page_title: "முன்னாள் மாணவர்கள் நினைவுகள் சுவர்",
    share_memory_btn: "நினைவைப் பகிரவும்",
    batch_year: "வகுப்பு ஆண்டு",
    uploaded_by: "பகிர்ந்தவர்",
    upload_photo: "புகைப்படத்தைப் பதிவேற்றவும்",
    caption_placeholder: "நினைவு பற்றிய சிறு குறிப்பை எழுதுங்கள்...",

    // About Page
    about_title: "நமது முன்னாள் மாணவர்கள் சங்கத்தைப் பற்றி",
    about_subtitle: "வாழ்நாள் தொடர்புகளை வளர்ப்பது, பள்ளி வரலாற்றைக் கொண்டாடுவது மற்றும் எதிர்கால தலைமுறையினரை ஊக்குவிப்பது.",
    our_mission_title: "நமது நோக்கம்",
    our_mission_desc: "தலைமுறை தலைமுறையாக முன்னாள் மாணவர்களை ஒன்றுபடுத்துதல், பள்ளி வரலாற்றைப் பாதுகாத்தல் மற்றும் புதிய மாணவர்களுக்கு வாய்ப்புகளை உருவாக்குதல்.",
    our_vision_title: "நமது தொலைநோக்கு",
    our_vision_desc: "உலகளாவிய துடிப்பான முன்னாள் மாவர்கள் சமூகமாக விளங்கி, கல்விச் சிறப்பை மேம்படுத்துவது.",

    // Contact Page
    contact_title: "எங்களைத் தொடர்பு கொள்ளவும்",
    contact_subtitle: "கேள்விகள் உள்ளதா அல்லது மறுசந்திப்பை ஏற்பாடு செய்ய வேண்டுமா? நாங்கள் உதவ இருக்கிறோம்.",
    name_label: "உங்கள் முழு பெயர்",
    email_label: "மின்னஞ்சல் முகவரி",
    phone_label: "தொலைபேசி",
    email_contact_label: "மின்னஞ்சல்",
    subject_label: "பொருள்",
    message_label: "செய்தி",
    send_message_btn: "செய்தி அனுப்பவும்",

    // Auth Pages (Login & Register)
    auth_alumni_login: "முன்னாள் மாணவர்கள் உள்நுழைவு",
    mobile_label: "மொபைல் எண்",
    otp_label: "6 இலக்க OTP ஐ உள்ளிடவும்",
    send_otp_btn: "OTP அனுப்புக",
    verify_otp_btn: "சரிபார்த்து உள்நுழைக",
    register_title: "முன்னாள் மாணவர்கள் பதிவு",
    batch_year_label: "தேர்ச்சி பெற்ற ஆண்டு",
    submit_registration: "பதிவைச் சமர்ப்பிக்கவும்",

    // School Admin Navigation
    admin_dashboard: "டாஷ்போர்டு",
    admin_verification: "சரிபார்ப்பு வரிசை",
    admin_alumni_directory: "முன்னாள் மாணவர்கள் முகவரி",
    admin_batches: "வகுப்புகள்",
    admin_events: "நிகழ்வுகள் & மறுசந்திப்புகள்",
    admin_school_events: "பள்ளி விழாக்கள்",
    admin_announcements: "அறிவிப்புகள்",
    admin_memories: "நினைவுகள் நிர்வகிப்பு",
    admin_feedback: " கருத்துகள்",
    admin_association_team: "முன்னாள் மாணவர்கள் சங்கம்",
    admin_rank_holders: "தரவரிசை சாதனையாளர்கள்",
    admin_reports: "அறிக்கைகள் & ஏற்றுமதி",
    admin_settings: "பள்ளி அமைப்புகள்",
    admin_portal_name: "நிர்வாக போர்டல்",

    // Alumni Portal Navigation
    alumni_section_main: "முதன்மை",
    alumni_section_connect: "தொடர்பு கொள்ள",
    alumni_section_activities: "செயல்பாடுகள்",
    alumni_section_account: "என் கணக்கு",
    alumni_nav_dashboard: "டாஷ்போர்டு",
    alumni_nav_profile: "என் சுயவிவரம்",
    alumni_nav_batches: "என் வகுப்புகள்",
    alumni_nav_directory: "முன்னாள் மாணவர்கள் முகவரி",
    alumni_nav_school_events: "பள்ளி விழாக்கள்",
    alumni_nav_events: "நிகழ்வுகள்",
    alumni_nav_announcements: "அறிவிப்புகள்",
    alumni_nav_gallery: "கேலரி & நினைவுகள்",
    alumni_nav_documents: "சான்றிதழ்கள் / ஆவணங்கள்",
    alumni_nav_notifications: "அறிவிப்புகள்",
    alumni_nav_settings: "அமைப்புகள்",
    alumni_search_placeholder: "தேடவும் (முகவரி, நிகழ்வுகள், அறிவிப்புகள்)...",
    alumni_verified_badge: "சரிபார்க்கப்பட்ட உறுப்பினர்",
    alumni_class_of: "வகுப்பு",

    // Footer
    footer_tagline: "பள்ளிகள் மற்றும் முன்னாள் மாணவர்களுக்கான வாழ்நாள் தொடர்புகளை உருவாக்குகிறது.",
    copyright: "காப்புரிமை © 2026. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. Devopstrio மூலம் வழங்கப்படுகிறது.",
    developer_portal: "டெவலப்பர் போர்டல்",
    school_admin_login: "சங்க நிர்வாகம்",

    // =====================================================================
    // ALUMNI MANAGEMENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_alumni_mgmt_title: "முன்னாள் மாணவர் & தாள் நிர்வாகம்",
    admin_alumni_mgmt_subtitle: "முன்னாள் மாணவர் அடைவு, தாள் திருத்தம், மொத்த புதுப்பிப்பு, சேர்க்கை மற்றும் பட்டியல் ஏற்றுமதிகளை நிர்வகிக்கவும்.",

    // Toolbar / top controls
    admin_refresh_roster: "அடைவு பட்டியலை புதுப்பிக்கவும்",
    admin_view_standard_table: "வழக்கமான அட்டவணை",
    admin_view_editable_sheet: "திருத்தக்கூடிய தாள்",
    admin_btn_add_new_alumni: "புதிய மாணவரைச் சேர்க்க",
    admin_btn_import_roster: "இறக்குமதி செய்க (Excel / CSV)",
    admin_btn_export_excel: "Excel ஏற்றுமதி",
    admin_btn_exporting_excel: "Excel ஏற்றுமதி ஆகிறது...",

    // Filter bar
    admin_filter_search_placeholder: "பெயர், சேர்க்கை எண், மொபைல், மின்னஞ்சல், நகரம், தொழில் மூலம் தேடுங்கள்...",
    admin_filter_all_batches: "அணி (1962-2026)",
    admin_filter_class_of: "வகுப்பு",
    admin_filter_all_statuses: "சரிபார்ப்பு நிலை",
    admin_filter_status_approved: "அங்கீகரிக்கப்பட்டவை மட்டும்",
    admin_filter_status_pending: "நிலுவையில் உள்ளவை மட்டும்",
    admin_filter_status_suspended: "இடைநிறுத்தப்பட்டவை மட்டும்",
    admin_filter_status_rejected: "நிராகரிக்கப்பட்டவை மட்டும்",
    admin_filter_all_blood_groups: "இரத்தப் பிரிவு",
    admin_filter_blood_suffix: "இரத்தப் பிரிவு",
    admin_filter_all_volunteers: "தன்னார்வலர்கள்",
    admin_filter_volunteers_yes: "தன்னார்வலர்கள் மட்டும் (ஆம்)",
    admin_filter_non_volunteers: "தன்னார்வலர்கள் அல்லாதவர்கள்",
    admin_showing_count_prefix: "மொத்தம்",
    admin_showing_count_middle: "இல்",
    admin_showing_count_suffix: "பட்டியல் பதிவுகள் காட்டப்படுகின்றன",
    admin_horizontal_scroll: "கிடைமட்ட உருளல்:",
    admin_pan_columns: "நெடுவரிசைகளை நகர்த்தவும்",
    admin_sheet_mode_active: "தாள் பயன்முறை செயலில்: கீழே எந்த உள்ளீட்டையும் நேரடியாக திருத்தவும்",

    // Sort dropdown (values stay the same; labels come from these keys)
    admin_sort_batch_asc: "அணி: பழசு→புதுசு",
    admin_sort_batch_desc: "அணி: புதுசு→பழசு",
    admin_sort_name_asc: "A-Z",
    admin_sort_name_desc: "Z-A",

    // Standard Table headers
    admin_col_sno: "வ.எண்",
    admin_col_alumnus_profile: "முன்னாள் மாணவர் சுயவிவரம்",
    admin_col_batch_section: "தொகுதி & பிரிவு",
    admin_col_contact_info: "தொடர்பு தகவல்",
    admin_col_address: "முகவரி",
    admin_col_blood_group: "இரத்தப் பிரிவு",
    admin_col_volunteer: "தன்னார்வலர்",
    admin_col_willing_donor: "நன்கொடை வழங்க விருப்பம்",
    admin_col_status: "நிலை",
    admin_col_actions: "செயல்கள்",
    admin_label_adm_prefix: "சேர்க்கை:",
    admin_label_batch_prefix: "தொகுதி",
    admin_label_yes: "ஆம்",
    admin_label_no: "இல்லை",
    admin_status_active: "செயலில்",
    admin_status_invite_sent: "அழைப்பு அனுப்பப்பட்டது",
    admin_status_pending_activation: "செயல்படுத்த காத்திருக்கிறது",

    // Row actions
    admin_action_approve: "அங்கீகரி",
    admin_action_suspend: "இடைநிறுத்து",
    admin_action_activate: "மீண்டும் செயல்படுத்து",
    admin_action_delete: "நீக்கு",
    admin_action_send_invite: "அழைப்பை அனுப்பு",
    admin_action_resend_invite: "அழைப்பை மீண்டும் அனுப்பு",

    // Bulk action bar
    admin_bulk_selected_count: "முன்னாள் மாணவர் சுயவிவரம் தேர்ந்தெடுக்கப்பட்டது",
    admin_bulk_send_invitation: "அழைப்பை அனுப்பு",
    admin_bulk_approve: "மொத்த அங்கீகாரம்",
    admin_bulk_suspend: "மொத்த இடைநிறுத்தம்",
    admin_bulk_delete: "மொத்த நீக்கம்",
    admin_bulk_deselect_all: "அனைத்தையும் தேர்வுநீக்கு",

    // Editable Sheet view
    admin_sheet_editor_title: "முழு விரிதாள் தொகுப்பி — கீழே அனைத்து 41 புலங்களும் நேரடியாக திருத்தக்கூடியவை",
    admin_sheet_rows_rendered: "வரிசைகள் காட்டப்படுகின்றன",
    admin_sheet_save_edited: "சேமி",
    admin_sheet_saving: "சேமிக்கப்படுகிறது...",
    admin_sheet_edited_rows_suffix: "திருத்தப்பட்ட வரிசை(கள்)",
    admin_sheet_scroll_left: "இடது உருளல்",
    admin_sheet_scroll_right: "வலது உருளல்",
    admin_sheet_footer_tip: "மேம்படுத்தப்பட்ட உயர்-மாறுபாடு உருளல் பட்டி செயலில் உள்ளது. குறிப்பு: Shift + மவுஸ் சக்கரம் அல்லது கீழே உள்ள உருளல் பட்டியை இழுக்கவும்.",
    admin_sheet_upload: "பதிவேற்று",
    admin_sheet_replace: "மாற்று",
    admin_sheet_uploading: "பதிவேற்றப்படுகிறது...",
    admin_sheet_remove: "நீக்கு",
    admin_sheet_profile_photo: "சுயவிவரப் புகைப்படம்",
    admin_sheet_full_name: "முழுப் பெயர்",
    admin_sheet_name_tamil: "தமிழில் பெயர்",
    admin_sheet_mobile: "மொபைல் எண்",
    admin_sheet_country_code: "நாட்டுக் குறியீடு",
    admin_sheet_gender: "பாலினம்",
    admin_sheet_dob: "பிறந்த தேதி",
    admin_sheet_email: "மின்னஞ்சல்",
    admin_sheet_blood_group: "இரத்தப் பிரிவு",
    admin_sheet_father_name: "தந்தையின் பெயர்",
    admin_sheet_mother_name: "தாயின் பெயர்",
    admin_sheet_current_city: "தற்போதைய நகரம்",
    admin_sheet_current_state: "தற்போதைய மாநிலம்",
    admin_sheet_address: "முகவரி",
    admin_sheet_country: "நாடு",
    admin_sheet_school_name: "பள்ளியின் பெயர்",
    admin_sheet_joining_year: "சேர்ந்த ஆண்டு",
    admin_sheet_passing_year: "தேர்ச்சி ஆண்டு",
    admin_sheet_leaving_class: "விட்டு வெளியேறிய வகுப்பு",
    admin_sheet_admission_roll: "சேர்க்கை/பதிவு எண்",
    admin_sheet_section: "பிரிவு",
    admin_sheet_no_higher_ed: "உயர்கல்வி இல்லை",
    admin_sheet_college_name: "கல்லூரியின் பெயர்",
    admin_sheet_degree: "பட்டம் / படிப்பு",
    admin_sheet_custom_degree: "தனிப்பயன் பட்டம்",
    admin_sheet_department: "துறை",
    admin_sheet_college_reg_no: "கல்லூரி பதிவு எண்",
    admin_sheet_college_joining_yr: "கல்லூரியில் சேர்ந்த ஆண்டு",
    admin_sheet_college_passing_yr: "கல்லூரி தேர்ச்சி ஆண்டு",
    admin_sheet_employment_status: "வேலை நிலை",
    admin_sheet_company_name: "நிறுவனத்தின் பெயர்",
    admin_sheet_designation: "பதவி / நிலை",
    admin_sheet_industry: "தொழில் துறை",
    admin_sheet_total_experience: "மொத்த அனுபவம்",
    admin_sheet_skills: "திறன்கள் & நிபுணத்துவம்",
    admin_sheet_linkedin: "LinkedIn இணைப்பு",
    admin_sheet_instagram: "Instagram இணைப்பு",
    admin_sheet_whatsapp: "WhatsApp எண்",
    admin_sheet_website: "இணையதள முகவரி",
    admin_sheet_status: "நிலை",
    admin_sheet_action: "செயல்",

    // Suspend modal
    admin_suspend_modal_title: "முன்னாள் மாணவர் கணக்கை இடைநிறுத்து",
    admin_suspend_modal_body: "இந்த முன்னாள் மாணவர் கணக்கை இடைநிறுத்துவதற்கான காரணத்தை வழங்கவும்.",
    admin_suspend_modal_body_suffix: "மீண்டும் செயல்படுத்தும் வரை போர்ட்டல் அணுகல் தடுக்கப்படும்.",
    admin_suspend_reason_label: "இடைநிறுத்தத்திற்கான காரணம்",
    admin_suspend_reason_placeholder: "இந்த முன்னாள் மாணவர் கணக்கை இடைநிறுத்துவதற்கான காரணத்தை உள்ளிடவும்...",
    admin_suspend_reason_required: "இடைநிறுத்தத்திற்கான காரணத்தை வழங்கவும்.",
    admin_suspend_cancel: "ரத்து செய்",
    admin_suspend_confirm: "கணக்கை இடைநிறுத்து",
    admin_suspend_in_progress: "இடைநிறுத்தப்படுகிறது...",

    // Add / Edit Alumni wizard
    admin_add_modal_title: "மாணவர் சுயவிவரத்தைச் சேர்க்க",
    admin_add_step_label: "படி",
    admin_add_step_of: "/",
    admin_add_step_personal: "தனிப்பட்ட தகவல்",
    admin_add_step_contact: "தொடர்பு & முகவரி",
    admin_add_step_school: "பள்ளிக் கல்வி",
    admin_add_step_higher: "உயர் கல்வி",
    admin_add_step_professional: "தொழில் & சமூகம்",
    admin_add_cancel: "ரத்து செய்",
    admin_add_back: "பின்செல்",
    admin_add_next: "அடுத்து",
    admin_add_submit: "முன்னாள் மாணவர் சுயவிவரத்தை உருவாக்கு",

    // Import modal
    admin_import_modal_title: "இறக்குமதி செய்க (Excel / CSV)",
    admin_import_modal_note_title: "முழு 44-புல விரிதாள் மொத்த திருத்தம் & இறக்குமதி:",
    admin_import_modal_note_1: "Excel (.xlsx) & CSV ஆதரவு: பட்டியலை Excel ஆக ஏற்றுமதி செய்து, எந்த கலனையும் திருத்தி, .xlsx அல்லது .csv விரிதாளை நேரடியாக பதிவேற்றலாம்.",
    admin_import_modal_note_2: "தற்போதைய பதிவுகளை மொத்தமாக திருத்தவும்: Alumni ID நெடுவரிசையை மாற்றாமல் வைத்திருக்கவும் — மாற்றப்பட்ட கலன்கள் மட்டுமே புதுப்பிக்கப்படும்.",
    admin_import_modal_note_3: "ஸ்மார்ட் பொருத்த மாற்று வழி: Alumni ID காலியாக இருந்தாலும், சேர்க்கை எண், மொபைல், மின்னஞ்சல் அல்லது பதிவு எண் மூலம் தானாக பொருத்தப்படும்.",
    admin_import_modal_note_4: "புதிய பதிவுகளைச் சேர்க்கவும்: பொருந்தாத எந்த வரிசையும் புதிய பதிவாக உருவாக்கப்படும் (முழுப் பெயர் & தேர்ச்சி ஆண்டு தேவை).",
    admin_import_modal_note_5: "பகுதி திருத்தங்கள்: மாற்றப்படாத கலன்களை அப்படியே விடவும். ஒரு புலத்தை வெளிப்படையாக அழிக்க __CLEAR__ என உள்ளிடவும்.",
    admin_import_modal_start: "பட்டியல் இறக்குமதியைத் தொடங்கு",

    // Import results modal
    admin_import_result_title: "CSV பட்டியல் இறக்குமதி முடிவுகள்",
    admin_import_result_total_rows: "மொத்த வரிசைகள்",
    admin_import_result_valid: "சரியானவை / செயலாக்கப்பட்டவை",
    admin_import_result_updated: "புதுப்பிக்கப்பட்ட வரிசைகள்",
    admin_import_result_created: "புதிதாக உருவாக்கப்பட்டவை",
    admin_import_result_unchanged: "மாற்றமில்லாதவை",
    admin_import_result_failed: "தோல்வியடைந்தவை / தவிர்க்கப்பட்டவை",
    admin_import_result_errors_label: "சரிபார்ப்பு & இறக்குமதி பிழைகள்",
    admin_import_result_close: "மூடு",

    // Misc empty states
    admin_no_alumni_found: "வடிகட்டி அளவுகோல்களுடன் பொருந்தும் முன்னாள் மாணவர் பதிவுகள் எதுவும் இல்லை.",
    admin_photo_upload_title_new: "புதிய புகைப்படத்தைப் பதிவேற்றவும்",
    admin_photo_upload_title_replace: "தற்போதைய புகைப்படத்தை மாற்றவும்",
    admin_photo_remove_title: "இந்த சுயவிவரப் புகைப்படத்தை நீக்கவும்",

    // =====================================================================
    // BATCHES & COHORTS PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_batches_page_title: "தொகுதிகள் & குழுக்கள்",
    admin_batches_page_subtitle: "பள்ளி தேர்ச்சி ஆண்டு தொகுதிகள் மற்றும் நியமிக்கப்பட்ட தொகுதி ஒருங்கிணைப்பாளர்கள்",
    admin_batches_search_placeholder: "தொகுதி ஆண்டு அல்லது பெயரைத் தேடவும்...",
    admin_batches_create_btn: "புதிய தொகுதியை உருவாக்கு",
    admin_batches_card_badge: "தொகுதி",
    admin_batches_card_title: "ஆம் ஆண்டு தொகுதி",
    admin_batches_card_desc_default: "{year} அணி முன்னாள் மாணவர்கள்",
    admin_batches_coordinator_title: "தொகுதி ஒருங்கிணைப்பாளர்கள்",
    admin_batches_coordinator_assigned: "நியமிக்கப்பட்டது",
    admin_batches_coordinator_none: "ஒருங்கிணைப்பாளர் நியமிக்கப்படவில்லை",
    admin_batches_member_count_singular: "{count} உறுப்பினர்",
    admin_batches_member_count_plural: "{count} உறுப்பினர்கள்",
    admin_batches_view_btn: "விவரம்",
    admin_batches_modal_title: "புதிய தொகுதியை உருவாக்கு",
    admin_batches_modal_name_label: "தொகுதியின் பெயர்",
    admin_batches_modal_name_placeholder: "2026 ஆம் ஆண்டு வகுப்பு",
    admin_batches_modal_year_label: "தேர்ச்சி ஆண்டு",
    admin_batches_modal_desc_label: "விவரம் / குறிக்கோள்",
    admin_batches_modal_desc_placeholder: "பொன்விழா தொகுதி...",
    admin_batches_modal_cancel: "ரத்து செய்",
    admin_batches_modal_save: "தொகுதியைச் சேமி",
    admin_batches_success_title: "தொகுதி வெற்றிகரமாக உருவாக்கப்பட்டது",
    admin_batches_success_msg: "{year} ஆம் ஆண்டு வகுப்பிற்கான தொகுதி தொடங்கப்பட்டது.",

    // Edit Batch (school-admin batch detail page)
    admin_batches_edit_btn: "தொகுதியைத் திருத்து",
    admin_batches_edit_modal_title: "தொகுதியைத் திருத்து",
    admin_batches_edit_success_title: "தொகுதி வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
    admin_batches_edit_success_msg: "{year} ஆம் ஆண்டு வகுப்பிற்கான தொகுதி விவரங்கள் புதுப்பிக்கப்பட்டன.",
        // NEW: Default batch name pattern (matches backend's "Batch of {year}" fallback)
    admin_batch_default_name: "{year} ஆம் ஆண்டு வகுப்பு தொகுதி",
    // =====================================================================
    // BATCH DETAILS / COMMITTEE PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Navigation & header
  
    admin_batch_back_to_batches: "தொகுதிகளுக்குத் திரும்பு",
    admin_batch_class_of_cohort: "{year} ஆம் ஆண்டு வகுப்பு தொகுதி",
    admin_batch_verified_cohort: "சரிபார்க்கப்பட்ட தொகுதி",
    admin_batch_not_found: "தொகுதி கண்டறியப்படவில்லை.",

    // Buttons
    admin_batch_assign_committee_btn: "குழு பதவியை நியமிக்கவும்",
    admin_batch_assign_modal_title: "தொகுதி குழு பதவியை நியமிக்கவும்",

    // Committee structure section
    admin_batch_committee_section_title: "தொகுதி முன்னாள் மாணவர் குழு அமைப்பு",
    admin_batch_committee_section_subtitle: "தொகுதிக்கு 15 பதவிகளுக்கான அமைப்பு",
    admin_batch_appointed_count: "{filled} / {total} நியமிக்கப்பட்டது",
    admin_batch_no_members_appointed: "இன்னும் யாரும் நியமிக்கப்படவில்லை",
    admin_batch_appoint_position_btn: "பதவியை நியமிக்கவும்",
    admin_batch_verified_members_count: "சரிபார்க்கப்பட்ட தொகுதி உறுப்பினர்கள் ({count})",

    // Modal
    admin_batch_modal_roles_info_title: "தொகுதி குழு பதவிகள் அமைப்பு (அதிகபட்சம் 15 பதவிகள்)",
    admin_batch_modal_roles_info_body: "{batch_name} இல் இருந்து சரிபார்க்கப்பட்ட ஒரு முன்னாள் மாணவரைத் தேர்ந்தெடுத்து, அவர்களின் குழு பதவியை நியமிக்கவும்.",
    admin_batch_modal_select_alumnus_label: "தொகுதியிலிருந்து முன்னாள் மாணவரைத் தேர்ந்தெடுக்கவும்",
    admin_batch_modal_select_role_label: "குழு பதவியைத் தேர்ந்தெடுக்கவும்",
    admin_batch_modal_normal_member: "சாதாரண முன்னாள் மாணவர் உறுப்பினர்",
    admin_batch_modal_default_badge: "இயல்புநிலை",
    admin_batch_modal_select_placeholder: "சரிபார்க்கப்பட்ட உறுப்பினரைத் தேர்ந்தெடுக்கவும்...",
    admin_batch_modal_save_btn: "குழு பதவியைச் சேமி",

    // Committee role titles (localized for rendering)
    admin_committee_role_president: "தலைவர்",
    admin_committee_role_vice_president: "துணைத் தலைவர்",
    admin_committee_role_secretary: "செயலாளர்",
    admin_committee_role_joint_secretary: "இணைச் செயலாளர்",
    admin_committee_role_treasurer: "பொருளாளர்",
    admin_committee_role_executive_member: "நிர்வாகக் குழு உறுப்பினர்",
    admin_committee_role_normal_member: "முன்னாள் மாணவர் உறுப்பினர்",

    // Table columns
    admin_batch_col_member_name: "உறுப்பினர் பெயர்",
    admin_batch_col_city_profession: "நகரம் / தொழில்",
    admin_batch_col_committee_role: "குழு பதவி",
    admin_batch_col_action: "செயல்",

    // Table row actions
    admin_batch_action_edit_role: "பதவியைத் திருத்து",
    admin_batch_action_assign_role: "பதவியை நியமிக்கவும்",
    admin_batch_action_remove_position: "குழு பதவியை நீக்கு",

    // Alerts
    admin_batch_alert_select_alumni_title: "முன்னாள் மாணவரைத் தேர்ந்தெடுக்கவும்",
    admin_batch_alert_select_alumni_body: "நியமிக்க ஒரு தொகுதி முன்னாள் மாணவரைத் தேர்ந்தெடுக்கவும்.",
    admin_batch_alert_role_appointed_title: "பதவி நியமிக்கப்பட்டது",
    admin_batch_alert_role_removed_title: "பதவி நீக்கப்பட்டது",
    admin_batch_alert_role_removed_body: "{name} சாதாரண முன்னாள் மாணவர் உறுப்பினராக மாற்றப்பட்டார்.",
    admin_batch_confirm_remove: "{name} ஐ தொகுதி குழுவிலிருந்து நீக்க விரும்புகிறீர்களா?",
    admin_batch_alert_failed_assign: "குழு பதவியை நியமிக்க முடியவில்லை.",
    admin_batch_alert_failed_remove: "குழு பதவியை நீக்க முடியவில்லை.",
    admin_batch_alert_failed_update: "தொகுதியைப் புதுப்பிக்க முடியவில்லை.",

        // =====================================================================
    // SCHOOL-ADMIN EVENTS LIST PAGE (Events & Get-Togethers) — NEW KEYS
    // =====================================================================
    admin_events_page_title: "நிகழ்வுகள் & சந்திப்புகள்",
    admin_events_page_subtitle: "பள்ளி மீள்சந்திப்புகள், தொகுதி சந்திப்புகள் மற்றும் பங்கேற்பாளர் பட்டியல்கள்",
    admin_events_create_btn: "சந்திப்பை உருவாக்கு",
    admin_events_tab_upcoming: "வரவிருக்கும் நிகழ்வுகள் ({count})",
    admin_events_tab_past: "முடிந்த / காலாவதியான நிகழ்வுகள் ({count})",
    admin_events_empty_upcoming_title: "வரவிருக்கும் நிகழ்வுகள் இல்லை",
    admin_events_empty_upcoming_desc: "வரவிருக்கும் சந்திப்புகள் எதுவும் இதுவரை திட்டமிடப்படவில்லை.",
    admin_events_empty_past_title: "முடிந்த நிகழ்வுகள் இல்லை",
    admin_events_empty_past_desc: "கடந்த கால அல்லது காலாவதியான நிகழ்வுகள் எதுவும் பதிவு செய்யப்படவில்லை.",
    admin_events_create_reunion_btn: "மீள்சந்திப்பை உருவாக்கு",
    admin_events_school_wide: "பள்ளி அளவிலானது",
    admin_events_registration_configured: "பதிவு இணைப்பு அமைக்கப்பட்டது",
    admin_events_confirmed_count: "{count} உறுதிசெய்யப்பட்டது",
        // =====================================================================
    // CREATE / EDIT EVENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_event_page_top_title: "மீள்சந்திப்பு நிகழ்வை உருவாக்கு",
    admin_event_back_to_events: "நிகழ்வுகளுக்குத் திரும்பு",
    admin_event_page_title_create: "சந்திப்பு நிகழ்வை உருவாக்கு",
    admin_event_page_title_edit: "சந்திப்பு நிகழ்வைத் திருத்து",
    admin_event_page_subtitle_create: "தொகுதி மீள்சந்திப்பு அல்லது பள்ளி அளவிலான முன்னாள் மாணவர் கூட்டத்தை ஏற்பாடு செய்யுங்கள்",
    admin_event_page_subtitle_edit: "நிகழ்வு விவரங்கள், நேரம் மற்றும் இடத்தை மாற்றவும்",

    admin_event_label_title_en: "Event Name / Title (English) *",
    admin_event_label_title_ta: "நிகழ்வின் பெயர் (தமிழ் / Tamil Name)",
    admin_event_placeholder_title_en: "2010 Silver Jubilee Reunion",
    admin_event_placeholder_title_ta: "2010 வெள்ளி விழா மறுசந்திப்பு",

    admin_event_label_audience: "இலக்கு பார்வையாளர்கள் / தொகுதி",
    admin_event_option_school_wide: "பள்ளி அளவிலான நிகழ்வு (அனைத்து முன்னாள் மாணவர்கள்)",
    admin_event_option_batch_format: "{name} (ஆண்டு {year})",

    admin_event_label_banner_en: "Event Cover Banner Image (English)",
    admin_event_label_banner_ta: "Event Cover Banner Image (தமிழ் / Tamil)",
    admin_event_placeholder_banner_en: "https://images.unsplash.com/... (ஆங்கிலப் பட URL)",
    admin_event_placeholder_banner_ta: "https://images.unsplash.com/... (தமிழ்ப் பட URL)",
    admin_event_banner_preview_en: "English Banner Preview",
    admin_event_banner_preview_ta: "தமிழ் பேனர் முன்னோட்டம்",

    admin_event_label_registration: "நிகழ்வு விண்ணப்பம் / வெளிப்புற பதிவு இணைப்பு (விருப்பமானது)",
    admin_event_placeholder_registration: "https://forms.google.com/... அல்லது பதிவு போர்டல் URL",

    admin_event_label_description_en: "Description & Agenda (English)",
    admin_event_label_description_ta: "விவரங்கள் & நிரல் (தமிழ் / Tamil Description)",
    admin_event_placeholder_description_en: "Details, dress code, schedule overview...",
    admin_event_placeholder_description_ta: "நிகழ்ச்சி விவரங்கள், உடைக்கட்டுப்பாடு, கால அட்டவணை...",

    admin_event_label_date: "நிகழ்வு தேதி *",
    admin_event_label_start_time: "தொடக்க நேரம்",
    admin_event_label_end_time: "முடிவு நேரம்",
    admin_event_placeholder_start_time: "காலை 10:00",
    admin_event_placeholder_end_time: "மாலை 05:00",

    admin_event_label_venue: "இடத்தின் பெயர் *",
    admin_event_placeholder_venue: "கிராண்ட் பால் ரூம், ஹோட்டல் தாஜ் கானமரா",
    admin_event_label_address: "முழு இட முகவரி",
    admin_event_placeholder_address: "பின்னி சாலை, சென்னை, தமிழ்நாடு - 600002",

    admin_event_label_capacity: "அதிகபட்ச கொள்ளளவு வரம்பு",
    admin_event_label_guest_allowed: "முன்னாள் மாணவர்கள் குடும்பம் / விருந்தினர்களை அழைத்து வர அனுமதிக்கவும்",

    admin_event_btn_save_changes: "மாற்றங்களைச் சேமி",
    admin_event_btn_save_draft: "வரைவாகச் சேமி",
    admin_event_btn_publish: "நிகழ்வை உடனே வெளியிடு",

    // Alerts
    admin_event_alert_required_title: "தேவையான புலங்கள் இல்லை",
    admin_event_alert_required_body: "சேமிப்பதற்கு முன் தேவையான புலங்களை (நிகழ்வு தலைப்பு, தேதி, இடம்) நிரப்பவும்.",
    admin_event_alert_updated_title: "நிகழ்வு புதுப்பிக்கப்பட்டது",
    admin_event_alert_updated_body: "\"{title}\" வெற்றிகரமாக புதுப்பிக்கப்பட்டது.",
    admin_event_alert_published_title: "நிகழ்வு வெற்றிகரமாக வெளியிடப்பட்டது",
    admin_event_alert_published_body: "முன்னாள் மாணவர்கள் இப்போது இந்த நிகழ்வைப் பார்க்கவும் RSVP செய்யவும் முடியும்.",
    admin_event_alert_draft_title: "நிகழ்வு வரைவாகச் சேமிக்கப்பட்டது",
    admin_event_alert_draft_body: "உங்கள் நிகழ்வு வரைவு சேமிக்கப்பட்டது.",
    admin_event_alert_error_load_title: "நிகழ்வை ஏற்றுவதில் பிழை",
    admin_event_alert_error_load_body: "நிகழ்வு விவரங்களைப் பெற முடியவில்லை.",
    admin_event_alert_error_update: "நிகழ்வைப் புதுப்பிக்க முடியவில்லை.",
    admin_event_alert_error_create: "நிகழ்வை உருவாக்க முடியவில்லை.",

        // =====================================================================
    // SCHOOL EVENTS & CELEBRATIONS PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_school_events_page_title: "பள்ளி நிகழ்வுகள்",
    admin_school_events_page_badge: "அதிகாரப்பூர்வ பள்ளி தொகுதி",
    admin_school_events_page_subtitle: "பள்ளி விழாக்கள், விளையாட்டுகள், கலை, அறிவியல் கண்காட்சிகள் மற்றும் தேசிய தினங்களை நிர்வகிக்கவும்.",
    admin_school_events_reset_samples_btn: "மாதிரிகளை மீட்டமை",
    admin_school_events_reset_samples_tooltip: "இயல்புநிலை மாதிரி நிகழ்வுகளை மீட்டெடுக்கவும்",
    admin_school_events_create_btn: "பள்ளி நிகழ்வை உருவாக்கு",

    // KPI stat cards
    admin_school_events_stat_total: "மொத்த கொண்டாட்டங்கள்",
    admin_school_events_stat_upcoming: "வரவிருக்கும் பள்ளி நிகழ்வுகள்",
    admin_school_events_stat_past: "கடந்த கொண்டாட்டங்கள்",
    admin_school_events_stat_categories: "நிகழ்வு வகைகள்",

    // Tabs & search
    admin_school_events_tab_upcoming: "வரவிருக்கும் நிகழ்வுகள் ({count})",
    admin_school_events_tab_past: "கடந்த கொண்டாட்டங்கள் ({count})",
    admin_school_events_search_placeholder: "பள்ளி நிகழ்வுகள், விருந்தினர் தேடுங்கள்...",

    // Category labels
    admin_school_events_cat_all: "அனைத்து கொண்டாட்டங்கள்",
    admin_school_events_cat_annual_day: "ஆண்டு விழா",
    admin_school_events_cat_sports_day: "விளையாட்டு தினம்",
    admin_school_events_cat_cultural_fest: "கலாச்சார விழா",
    admin_school_events_cat_national_day: "தேசிய தினங்கள்",
    admin_school_events_cat_exhibition: "அறிவியல் / தொழில்நுட்ப கண்காட்சி",
    admin_school_events_cat_celebration: "பண்டிகைகள் & கொண்டாட்டங்கள்",
    admin_school_events_cat_graduation_day: "பட்டமளிப்பு விழா",
    admin_school_events_cat_other: "மற்ற பள்ளி நிகழ்வுகள்",

    // Target audiences
    admin_school_events_aud_all_students: "அனைத்து மாணவர்கள்",
    admin_school_events_aud_parents: "பெற்றோர் & பாதுகாவலர்கள்",
    admin_school_events_aud_staff: "ஆசிரியர்கள் & ஊழியர்கள்",
    admin_school_events_aud_public: "பொதுமக்கள் & பார்வையாளர்கள்",
    admin_school_events_aud_alumni_guests: "முன்னாள் மாணவர்கள் & சிறப்பு விருந்தினர்கள்",

    // Event card content
    admin_school_events_chief_guest_prefix: "தலைமை விருந்தினர்:",

    // Empty states
    admin_school_events_empty_upcoming_title: "வரவிருக்கும் பள்ளி நிகழ்வுகள் இல்லை",
    admin_school_events_empty_past_title: "கடந்த கொண்டாட்டங்கள் இல்லை",
    admin_school_events_empty_filtered_desc: "உங்கள் தற்போதைய வடிகட்டி அளவுகோல்களுடன் எந்த பள்ளி நிகழ்வுகளும் பொருந்தவில்லை.",
    admin_school_events_empty_upcoming_desc: "வரவிருக்கும் பள்ளி கொண்டாட்டங்கள் எதுவும் இதுவரை திட்டமிடப்படவில்லை.",
    admin_school_events_empty_past_desc: "வரலாற்று பள்ளி கொண்டாட்டங்கள் எதுவும் பதிவு செய்யப்படவில்லை.",
    admin_school_events_create_first_btn: "முதல் பள்ளி நிகழ்வை உருவாக்கு",

    // Create / Edit modal
    admin_school_events_modal_title_edit: "பள்ளி கொண்டாட்டத்தைத் திருத்து",
    admin_school_events_modal_title_create: "புதிய பள்ளி நிகழ்வை உருவாக்கு",
    admin_school_events_modal_subtitle: "அதிகாரப்பூர்வ பள்ளி கொண்டாட்டங்கள் & நிகழ்வு நிர்வாகம்",
    admin_school_events_form_title_label: "நிகழ்வு தலைப்பு",
    admin_school_events_form_title_placeholder: "எ.கா. ஆண்டு விளையாட்டு போட்டி 2026 அல்லது அறிவியல் கண்காட்சி",
    admin_school_events_form_category_label: "வகை",
    admin_school_events_form_audience_label: "இலக்கு பார்வையாளர்கள்",
    admin_school_events_form_event_date_label: "நிகழ்வு தேதி",
    admin_school_events_form_end_date_label: "முடிவு தேதி (விருப்பமானது)",
    admin_school_events_form_start_time_label: "தொடக்க நேரம்",
    admin_school_events_form_end_time_label: "முடிவு நேரம்",
    admin_school_events_form_start_time_placeholder: "காலை 09:00",
    admin_school_events_form_end_time_placeholder: "மாலை 04:00",
    admin_school_events_form_venue_label: "இடம் / இருப்பிடம்",
    admin_school_events_form_venue_placeholder: "எ.கா. NHSS பிரதான விளையாட்டு மைதானம்",
    admin_school_events_form_chief_guest_label: "தலைமை விருந்தினர் (விருப்பமானது)",
    admin_school_events_form_chief_guest_placeholder: "எ.கா. மாண்புமிகு அமைச்சர் அல்லது முன்னாள் மாணவர்",
    admin_school_events_form_banner_label: "பேனர் அட்டைப் படம் URL",
    admin_school_events_form_banner_placeholder: "https://...",
    admin_school_events_form_banner_preset_prefix: "முன்னமைவு:",
    admin_school_events_form_description_label: "விவரங்கள் & நிரல்",
    admin_school_events_form_description_placeholder: "பள்ளி கொண்டாட்டத்தின் விவரங்கள், அட்டவணை, சிறப்பம்சங்களை உள்ளிடவும்...",
    admin_school_events_form_cancel_btn: "ரத்து செய்",
    admin_school_events_form_save_btn: "மாற்றங்களைச் சேமி",
    admin_school_events_form_publish_btn: "பள்ளி நிகழ்வை வெளியிடு",

    // View modal
    admin_school_events_view_close_btn: "பார்வையை மூடு",

    // Alerts
    admin_school_events_alert_title_required_title: "நிகழ்வு தலைப்பு தேவை",
    admin_school_events_alert_title_required_body: "பள்ளி நிகழ்வுக்கான தலைப்பை உள்ளிடவும்.",
    admin_school_events_alert_date_required_title: "நிகழ்வு தேதி தேவை",
    admin_school_events_alert_date_required_body: "நிகழ்வுக்கான தேதியைத் தேர்ந்தெடுக்கவும்.",
    admin_school_events_alert_updated_title: "பள்ளி நிகழ்வு புதுப்பிக்கப்பட்டது",
    admin_school_events_alert_updated_body: "\"{title}\" விவரங்கள் சேமிக்கப்பட்டன.",
    admin_school_events_alert_created_title: "பள்ளி நிகழ்வு உருவாக்கப்பட்டது",
    admin_school_events_alert_created_body: "\"{title}\" வெளியிடப்பட்டது.",
    admin_school_events_alert_delete_confirm_title: "பள்ளி நிகழ்வை நீக்கவா?",
    admin_school_events_alert_delete_confirm_body: "\"{title}\" ஐ நீக்க விரும்புகிறீர்களா? இந்த கொண்டாட்டப் பதிவு நிரந்தரமாக நீக்கப்படும்.",
    admin_school_events_alert_deleted_title: "நிகழ்வு நீக்கப்பட்டது",
    admin_school_events_alert_deleted_body: "\"{title}\" நீக்கப்பட்டது.",
    admin_school_events_alert_seeded_title: "பள்ளி நிகழ்வுகள் விதைக்கப்பட்டன",
    admin_school_events_alert_seeded_body: "இயல்புநிலை பள்ளி கொண்டாட்டங்கள் மீட்டெடுக்கப்பட்டன.",
    admin_school_events_alert_error_save: "பள்ளி நிகழ்வைச் சேமிக்க முடியவில்லை.",
    admin_school_events_alert_error_delete: "நிகழ்வை நீக்க முடியவில்லை.",
    admin_school_events_alert_error_seed: "பள்ளி நிகழ்வுகளை விதைக்க முடியவில்லை.",

        // =====================================================================
    // ANNOUNCEMENTS & NEWS MANAGER PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_announcements_page_title: "அறிவிப்புகள் & செய்தி நிர்வாகம்",
    admin_announcements_page_subtitle: "பள்ளி செய்திகள், சுவரொட்டிகள், சுற்றறிக்கைகள் மற்றும் அறிவிப்புகளை ஆங்கிலம் & தமிழில் வெளியிடுங்கள் — உள்ளமைந்த பட வெட்டு மற்றும் திருத்தத்துடன்",
    admin_announcements_compose_btn: "புதிய அறிவிப்பை உருவாக்கு",

    // Filters
    admin_announcements_search_placeholder: "தலைப்பு, தமிழ் முக்கியச்சொல், உள்ளடக்கம் மூலம் செய்திகளைத் தேடுங்கள்...",
    admin_announcements_filter_all_categories: "அனைத்து வகைகள்",
    admin_announcements_filter_all_audiences: "அனைத்து பார்வையாளர்கள்",
    admin_announcements_filter_school_wide: "பள்ளி அளவிலானது (பொது)",
    admin_announcements_filter_batch_targeted: "தொகுதி இலக்கு",

    // Card
    admin_announcements_no_poster: "சுவரொட்டி இணைக்கப்படவில்லை",
    admin_announcements_view_full_poster: "முழு சுவரொட்டியைப் பார்க்க",
    admin_announcements_badge_school_wide: "🌐 பள்ளி அளவிலானது (பொது)",
    admin_announcements_badge_batch: "🎯 தொகுதி",
    admin_announcements_by_prefix: "எழுதியவர்: {name}",
    admin_announcements_tamil_prefix: "தமிழ்:",

    // Empty state
    admin_announcements_empty_title: "அறிவிப்புகள் எதுவும் கிடைக்கவில்லை",
    admin_announcements_empty_filtered: "தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு எந்த அறிவிப்புகளும் பொருந்தவில்லை.",
    admin_announcements_empty_default: "சுவரொட்டிகள் மற்றும் இருமொழி உரையுடன் உங்கள் முதல் பள்ளி அறிவிப்பை வெளியிடுங்கள்.",
    admin_announcements_empty_create_btn: "அறிவிப்பை உருவாக்கு",

    // Category labels (used by chips/badges)
    admin_announcements_cat_general: "பொது அறிவிப்பு",
    admin_announcements_cat_circular: "அதிகாரப்பூர்வ சுற்றறிக்கை",
    admin_announcements_cat_event_notice: "நிகழ்வு / சந்திப்பு",
    admin_announcements_cat_celebration: "விழா & கொண்டாட்டம்",
    admin_announcements_cat_academic: "கல்வி & தேர்வுகள்",
    admin_announcements_cat_achievement: "பள்ளி சாதனை",

    // Compose / Edit modal
    admin_announcements_modal_title_edit: "அறிவிப்பைத் திருத்து",
    admin_announcements_modal_title_create: "அறிவிப்பு & பள்ளி செய்தியை உருவாக்கு",
    admin_announcements_form_category_label: "அறிவிப்பு வகை",
    admin_announcements_form_audience_label: "பார்வையாளர் எல்லை",
    admin_announcements_form_audience_school: "பள்ளி அளவிலானது & பொது முகப்பு (அனைவருக்கும்)",
    admin_announcements_form_audience_batch: "குறிப்பிட்ட தொகுதி (குறிப்பிட்ட ஆண்டு)",
    admin_announcements_form_batch_label: "இலக்கு தொகுதியைத் தேர்ந்தெடுக்கவும்",
    admin_announcements_form_poster_label: "சுவரொட்டி / ஃபிளையர்",
    admin_announcements_form_poster_sublabel: "இழுத்து விடவும், WebP பதிவேற்றவும், 16:9 அளவில் வெட்டவும், சுழற்றவும் அல்லது வண்ணங்களை சரிசெய்யவும்.",
    admin_announcements_form_tab_en: "🇬🇧 ஆங்கில அறிவிப்பு விவரங்கள்",
    admin_announcements_form_tab_ta: "🇮🇳 தமிழ் விவரங்கள்",
    admin_announcements_form_title_en: "தலைப்பு (ஆங்கிலம்)",
    admin_announcements_form_title_en_placeholder: "எ.கா: முன்னாள் மாணவர் சங்க ஆண்டு விழா 2026 பதிவு தொடக்கம்",
    admin_announcements_form_title_ta: "அறிவிப்பு தலைப்பு (தமிழ்)",
    admin_announcements_form_title_ta_placeholder: "எ.கா: முன்னாள் மாணவர் சங்க ஆண்டு விழா 2026 பதிவு தொடக்கம்",
    admin_announcements_form_content_en: "அறிவிப்பு விவரங்கள் (ஆங்கிலம்)",
    admin_announcements_form_content_en_placeholder: "முழு அறிவிப்பு விவரங்கள், நேரங்கள், வழிகாட்டுதல்களை வழங்கவும்...",
    admin_announcements_form_content_ta: "முழு விவரம் / செய்தி (தமிழ்)",
    admin_announcements_form_content_ta_placeholder: "அறிவிப்பின் முழு விவரங்கள், நேரம், விதிகளினை உள்ளிடவும்...",
    admin_announcements_form_cancel_btn: "ரத்து செய்",
    admin_announcements_form_update_btn: "அறிவிப்பைப் புதுப்பிக்கவும்",
    admin_announcements_form_publish_btn: "ஒளிபரப்பை வெளியிடு",

    // Alerts
    admin_announcements_alert_missing_title_title: "தலைப்பு தேவை",
    admin_announcements_alert_missing_title_body: "அறிவிப்புக்கு குறைந்தபட்சம் ஆங்கிலம் அல்லது தமிழ் தலைப்பை உள்ளிடவும்.",
    admin_announcements_alert_missing_content_title: "உள்ளடக்கம் தேவை",
    admin_announcements_alert_missing_content_body: "குறைந்தபட்சம் ஆங்கிலம் அல்லது தமிழ் உள்ளடக்க விவரங்களை உள்ளிடவும்.",
    admin_announcements_alert_updated_title: "வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
    admin_announcements_alert_updated_body: "அறிவிப்பு விவரங்கள் புதுப்பிக்கப்பட்டன.",
    admin_announcements_alert_published_title: "ஒளிபரப்பு வெளியிடப்பட்டது",
    admin_announcements_alert_published_body: "அறிவிப்பு ஒளிபரப்பப்பட்டு சேமிக்கப்பட்டது.",
    admin_announcements_alert_deleted_title: "நீக்கப்பட்டது",
    admin_announcements_alert_deleted_body: "அறிவிப்பு நீக்கப்பட்டது.",
    admin_announcements_alert_load_error: "அறிவிப்புகளை ஏற்ற முடியவில்லை",
    admin_announcements_alert_update_error: "புதுப்பிப்பு தோல்வியடைந்தது",
    admin_announcements_alert_create_error: "ஒளிபரப்பு தோல்வியடைந்தது",
    admin_announcements_alert_delete_error: "அறிவிப்பை நீக்க முடியவில்லை",
    admin_announcements_alert_delete_confirm: "\"{title}\" அறிவிப்பை நீக்க விரும்புகிறீர்களா? இந்த செயலை மீட்டெடுக்க முடியாது.",
        // =====================================================================
    // MEMORIES MODERATION PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_memories_page_title: "நினைவுகள், வீடியோ & புகைப்பட ஆல்பங்கள்",
    admin_memories_page_badge: "பல ஆல்பம் தொகுதி",
    admin_memories_page_subtitle: "முன்னாள் மாணவர் பதிவேற்றங்களை நிர்வகிக்கவும், உயர்தர பட ஆல்பங்கள், வீடியோக்கள் மற்றும் வளாக பாரம்பரியக் காப்பகங்களை ஒழுங்கமைக்கவும்.",
    admin_memories_create_btn: "ஆல்பம் / ஊடகத்தை பதிவேற்று",

    // View mode & search
    admin_memories_view_gallery: "அனைத்து ஊடக கேலரி ({count})",
    admin_memories_view_albums: "ஆல்பங்கள் பார்வை ({count})",
    admin_memories_search_placeholder: "தலைப்பு, ஆல்பம், பதிவேற்றியவர் மூலம் தேடுங்கள்...",

    // Status tabs
    admin_memories_tab_all: "அனைத்தும்",
    admin_memories_tab_pending: "நிலுவையில்",
    admin_memories_tab_approved: "வெளியானது",
    admin_memories_tab_rejected: "மறுக்கப்பட்டது",
    admin_memories_tab_changes: "திருத்தக் கோரிக்கை",

    // Media type pills
    admin_memories_type_all: "அனைத்தும்",
    admin_memories_type_photos: "புகைப்படங்கள்",
    admin_memories_type_videos: "வீடியோக்கள்",
    admin_memories_type_albums: "ஆல்பங்கள்",

    // Bulk selection
    admin_memories_select_all: "அனைத்தும் தேர்வாக ({count})",
    admin_memories_selected_count: "{count} தேர்ந்தெடுக்கப்பட்டது",
    admin_memories_bulk_delete: "மொத்தமாக நீக்குக ({count})",

    // Albums view
    admin_memories_albums_section_title: "பள்ளி புகைப்பட & வீடியோ ஆல்பங்கள் ({count})",
    admin_memories_back_to_albums: "← அனைத்து ஆல்பங்களுக்குத் திரும்பு",
    admin_memories_badge_album: "ஆல்பம்",
    admin_memories_album_items_recorded: "{count} உருப்படிகள் பதிவு செய்யப்பட்டன",
    admin_memories_view_album_gallery: "ஆல்பம் கேலரியைப் பார்க்க",

    // Media type badges
    admin_memories_badge_video: "வீடியோ",
    admin_memories_badge_photo: "புகைப்படம்",
    admin_memories_badge_album_photos: "{count} புகைப்படங்கள் ஆல்பம்",

    // Status badges
    admin_memories_status_approved: "அங்கீகரிக்கப்பட்டது",
    admin_memories_status_pending: "மதிப்பாய்வு நிலுவையில்",
    admin_memories_status_rejected: "நிராகரிக்கப்பட்டது",
    admin_memories_status_changes: "மாற்றங்கள் கோரப்பட்டன",

    // Gallery card
    admin_memories_album_prefix: "ஆல்பம்:",
    admin_memories_no_description: "விவரம் எதுவும் வழங்கப்படவில்லை.",
    admin_memories_submitted_by: "சமர்ப்பித்தவர்:",
    admin_memories_batch_label: "தொகுதி:",
    admin_memories_review_btn: "மதிப்பாய்வு",
    admin_memories_edit_btn: "திருத்து",
    admin_memories_delete_title: "நினைவை நீக்கு",
    admin_memories_general_gallery: "பொது கேலரி",

    // Empty state
    admin_memories_empty_title: "நினைவு ஊடக உருப்படிகள் எதுவும் கிடைக்கவில்லை",
    admin_memories_empty_description: "\"{status}\" நிலை அல்லது தேடல் வினவலுக்கு எந்த புகைப்படங்களும் அல்லது வீடியோக்களும் பொருந்தவில்லை.",
    admin_memories_empty_upload_btn: "முதல் நினைவைப் பதிவேற்று",

    // Review modal
    admin_memories_review_modal_title: "நினைவு & ஊடகத்தை மதிப்பாய்வு செய்",
    admin_memories_video_unsupported: "உங்கள் உலாவி HTML5 வீடியோ ஸ்ட்ரீமிங்கை ஆதரிக்கவில்லை.",
    admin_memories_photos_count: "{current} / {total} புகைப்படங்கள்",
    admin_memories_label_uploader: "பதிவேற்றியவர்:",
    admin_memories_label_batch_year: "தொகுதி ஆண்டு:",
    admin_memories_label_description: "விவரம்:",
    admin_memories_remarks_label: "மதிப்பாய்வு கருத்து / நிர்வாக குறிப்புகள்",
    admin_memories_remarks_placeholder: "பதிவேற்றியவருக்குக் காட்டப்படும் கருத்தை உள்ளிடவும்...",
    admin_memories_reject_btn: "நிராகரி",
    admin_memories_request_changes_btn: "மாற்றங்களைக் கோரு",
    admin_memories_approve_btn: "அங்கீகரித்து வெளியிடு",

    // Create / Edit modal
    admin_memories_modal_title_edit: "நினைவு ஆல்பத்தைத் திருத்து",
    admin_memories_modal_title_create: "ஆல்பத்தை உருவாக்கி ஊடகத்தைப் பதிவேற்று",
    admin_memories_modal_badge_edit: "நினைவகம் திருத்து",
    
    admin_memories_modal_subtitle_edit: "தலைப்பு, தமிழ் மொழிபெயர்ப்பு, தொகுதி ஆண்டு, பார்வையாளர்கள் ஆகியவற்றைப் புதுப்பிக்கவும் அல்லது தனிப்பட்ட கேலரி புகைப்படங்களை மாற்றவும்.",
    admin_memories_modal_subtitle_create: "ஆங்கிலம் & தமிழ், பார்வையாளர் தேர்வு, முகப்புப் படம் & பல புகைப்பட கேலரி பதிவேற்றத்தை ஆதரிக்கிறது",

    admin_memories_form_media_type_label: "ஊடக வகையைத் தேர்ந்தெடுக்கவும்",
    admin_memories_form_media_photo: "ஒற்றை புகைப்படம் ({count})",
    admin_memories_form_media_photo_sub: "புகைப்படம்",
    admin_memories_form_media_album: "புகைப்பட ஆல்பம் ({count})",
    admin_memories_form_media_album_sub: "ஆல்பம்",
    admin_memories_form_media_video: "வீடியோ நினைவு",
    admin_memories_form_media_video_sub: "வீடியோ",

    admin_memories_form_title_en_label: "தலைப்பு (ஆங்கிலம்) *",
    
    admin_memories_form_title_en_placeholder: "எ.கா. ஆண்டு விழா கலை நிகழ்ச்சிகள் 2025",
    admin_memories_form_title_ta_label: "தலைப்பு (தமிழ்)",
    
    admin_memories_form_title_ta_placeholder: "எ.கா. ஆண்டு விழா கலை நிகழ்ச்சிகள் 2025",

    admin_memories_form_album_label: "இலக்கு ஆல்பம் பெயர்",
    admin_memories_form_album_custom_option: "+ புதிய தனிப்பயன் ஆல்பத்தை உருவாக்கு",
    admin_memories_form_album_custom_label: "புதிய தனிப்பயன் ஆல்பத்தின் பெயர் *",
    admin_memories_form_album_custom_placeholder: "எ.கா. 1995 பொன்விழா மீள்சந்திப்பு ஆல்பம்",

    admin_memories_form_uploader_label: "பதிவேற்றியவர் / சமர்ப்பித்தவர் பெயர் *",
    admin_memories_form_uploader_hint: "சமர்ப்பிப்பவர் பெயரை எழுதவும் அல்லது கீழே உள்ள விரைவு முன்னமைவுகளைப் பயன்படுத்தவும்",
    admin_memories_form_uploader_show_picker: "முன்னாள் மாணவரைத் தேடி தேர்ந்தெடு",
    admin_memories_form_uploader_hide_picker: "முன்னாள் மாணவர் பட்டியலை மறை",
    admin_memories_form_uploader_placeholder: "எ.கா. பள்ளி நிர்வாகம் / டி. செல்வின் / 1995 தொகுதி முன்னாள் மாணவர்",
    admin_memories_form_uploader_quick_fill: "விரைவு நிரப்பு:",
    admin_memories_form_uploader_admin_suffix: "(நிர்வாகி)",
    admin_memories_form_uploader_school_admin: "பள்ளி நிர்வாகம்",
    admin_memories_form_uploader_association: "முன்னாள் மாணவர் சங்க",
    admin_memories_form_uploader_member: "முன்னாள் மாணவர்",

    admin_memories_form_alumni_picker_label: "பதிவுசெய்யப்பட்ட முன்னாள் மாணவர்களிடமிருந்து சமர்ப்பிப்பவரைத் தேர்ந்தெடுக்கவும் ({count} முன்னாள் மாணவர்கள்):",
    admin_memories_form_alumni_search_placeholder: "பெயர், மொபைல் அல்லது தொகுதி ஆண்டு மூலம் முன்னாள் மாணவரைத் தேடுங்கள்...",
    admin_memories_form_alumni_empty: "முன்னாள் மாணவர் பதிவுகள் எதுவும் கிடைக்கவில்லை. மேலே உள்ள உள்ளீட்டுப் புலத்தில் நேரடியாக எந்தப் பெயரையும் தட்டச்சு செய்யலாம்.",
    admin_memories_form_alumni_use_name: "பெயரைப் பயன்படுத்து",
    admin_memories_form_alumni_class_of: "{year} ஆம் ஆண்டு வகுப்பு",
    admin_memories_form_alumni_selected_title: "சமர்ப்பிப்பவர் தேர்ந்தெடுக்கப்பட்டார்",
    admin_memories_form_alumni_selected_body: "பதிவேற்றியவர் {name} என அமைக்கப்பட்டது",

    admin_memories_form_audience_label: "பார்வையாளர் & தொகுதி வகை (டிக் தேர்வு)",
    
    admin_memories_form_audience_public_title: "பொது / பள்ளி அளவிலான கேலரி",
    admin_memories_form_audience_public_sub: "அனைவருக்கும் பொதுவானது (அனைத்து பொது பார்வையாளர்கள் & முன்னாள் மாணவர்களுக்கும் தெரியும்)",
    admin_memories_form_audience_batch_title: "குறிப்பிட்ட தொகுதி ஆண்டு மட்டும்",
    admin_memories_form_audience_batch_sub: "குறிப்பிட்ட பேட்ச் ஆண்டு (குறிப்பிட்ட தொகுதிக்கு குறிக்கப்பட்டது)",
    admin_memories_form_batch_year_label: "தொகுதி ஆண்டை உள்ளிடவும் *",
    admin_memories_form_batch_year_placeholder: "எ.கா. 2025 அல்லது 1998",

    admin_memories_form_cover_label: "முகப்புப் படம் URL / முகப்பு கோப்பைப் பதிவேற்று",
    admin_memories_form_cover_placeholder: "https://... அல்லது கோப்பு பதிவேற்று பொத்தானைக் கிளிக் செய்யவும்",
    admin_memories_form_cover_upload_btn: "முகப்பு / கோப்புகளைப் பதிவேற்று",
    admin_memories_form_cover_uploading: "பதிவேற்றப்படுகிறது...",

    admin_memories_form_gallery_label: "கேலரி படங்களின் பட்டியல் ({count} புகைப்படங்கள் தேர்ந்தெடுக்கப்பட்டன)",
    admin_memories_form_gallery_add_btn: "+ பல புகைப்படங்களைத் தேர்ந்தெடுத்து சேர்",
    admin_memories_form_gallery_uploading_btn: "புகைப்படங்கள் பதிவேற்றப்படுகின்றன...",
    admin_memories_form_gallery_empty: "இன்னும் புகைப்படங்கள் எதுவும் சேர்க்கப்படவில்லை. படங்களைப் பதிவேற்ற \"+ பல புகைப்படங்களைச் சேர்\" என்பதைக் கிளிக் செய்யவும்.",
    admin_memories_form_upload_progress: "புகைப்படம் {current} / {total} பதிவேற்றப்படுகிறது ({percent}%)",
    admin_memories_form_upload_progress_sub: "படங்கள் ஒன்றன்பின் ஒன்றாக ஏற்றப்படுகின்றன",
    admin_memories_form_upload_cancel_btn: "பதிவேற்றத்தை ரத்து செய்",
    admin_memories_form_upload_cancel_short: "ரத்து",
    admin_memories_form_uploading_label: "பதிவேற்றப்படுகிறது...",

    admin_memories_form_thumb_cover_badge: "முகப்பு",
    admin_memories_form_thumb_set_cover: "முகப்பாக அமை",
    admin_memories_form_thumb_replace: "மாற்று",
    admin_memories_form_thumb_remove_title: "படத்தை நீக்கு",

    admin_memories_form_video_url_label: "வீடியோ ஸ்ட்ரீம் / கோப்பு URL",
    admin_memories_form_video_url_placeholder: "/uploads/video_file.mp4 அல்லது YouTube / வீடியோ URL",

    admin_memories_form_desc_en_label: "விவரம் (ஆங்கிலம்)",
   
    admin_memories_form_desc_en_placeholder: "நினைவு விவரத்தை ஆங்கிலத்தில் உள்ளிடவும்...",
    admin_memories_form_desc_ta_label: "விவரம் (தமிழ்)",
    
    admin_memories_form_desc_ta_placeholder: "நினைவுகள் பற்றிய விவரங்களை தமிழில் உள்ளிடவும்...",

    admin_memories_form_cancel_btn: "ரத்து செய்",
    admin_memories_form_update_btn: "நினைவுப் பதிவைப் புதுப்பிக்கவும்",
    admin_memories_form_publish_btn: "ஊடகப் பதிவைச் சேமித்து வெளியிடு",

    // Alerts & confirms
    admin_memories_alert_moderation_complete: "மதிப்பாய்வு முடிந்தது",
    admin_memories_alert_approved_body: "நினைவு அங்கீகரிக்கப்பட்டு வெளியிடப்பட்டது!",
    admin_memories_alert_rejected_body: "நினைவு நிராகரிக்கப்பட்டது.",
    admin_memories_alert_changes_body: "பதிவேற்றியவரிடமிருந்து மாற்றங்கள் கோரப்பட்டன.",
    admin_memories_alert_moderation_failed: "நினைவு மதிப்பாய்வு நிலையைப் புதுப்பிக்க முடியவில்லை.",
    admin_memories_alert_delete_confirm_title: "நினைவுப் பதிவை நீக்கவா?",
    admin_memories_alert_delete_confirm_body: "இந்த நினைவு உருப்படி மற்றும் அதன் ஊடகக் கோப்புகளை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?",
    admin_memories_alert_delete_confirm_btn: "நினைவை நீக்கு",
    admin_memories_alert_delete_cancel_btn: "ரத்து செய்",
    admin_memories_alert_deleted_title: "நினைவு நீக்கப்பட்டது",
    admin_memories_alert_deleted_body: "நினைவுப் பதிவு நீக்கப்பட்டது.",
    admin_memories_alert_delete_error: "புகைப்பட நினைவை நீக்க முடியவில்லை.",
    admin_memories_alert_bulk_delete_title: "தேர்ந்தெடுக்கப்பட்ட நினைவுகளை மொத்தமாக நீக்கவா?",
    admin_memories_alert_bulk_delete_body: "தேர்ந்தெடுக்கப்பட்ட {count} நினைவுப் பதிவு(களை) நிரந்தரமாக நீக்க விரும்புகிறீர்களா?",
    admin_memories_alert_bulk_delete_btn: "{count} உருப்படிகளை நீக்கு",
    admin_memories_alert_bulk_delete_done_title: "மொத்த நீக்கம் முடிந்தது",
    admin_memories_alert_bulk_delete_done_body: "{count} நினைவுப் பதிவுகள் வெற்றிகரமாக நீக்கப்பட்டன.",
    admin_memories_alert_bulk_delete_error: "நினைவு உருப்படிகளை மொத்தமாக நீக்க முடியவில்லை.",
    admin_memories_alert_title_required_title: "தலைப்பு தேவை",
    admin_memories_alert_title_required_body: "இந்த நினைவு உருப்படிக்கு ஆங்கிலத் தலைப்பை உள்ளிடவும்.",
    admin_memories_alert_updated_title: "நினைவுப் பதிவு புதுப்பிக்கப்பட்டது",
    admin_memories_alert_updated_body: "நினைவு விவரங்கள் மற்றும் கேலரி படங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!",
    admin_memories_alert_published_title: "நினைவு வெளியிடப்பட்டது",
    admin_memories_alert_published_body: "புதிய நினைவு உருப்படி/ஆல்பம் உருவாக்கப்பட்டு வெளியிடப்பட்டது!",
    admin_memories_alert_save_error: "நினைவுப் பதிவைச் சேமிக்க முடியவில்லை.",
    admin_memories_alert_upload_stopped_title: "பதிவேற்றம் நிறுத்தப்பட்டது",
    admin_memories_alert_upload_stopped_files: "பதிவேற்றம் ரத்து செய்யப்பட்டது. {done} / {total} கோப்புகள் பதிவேற்றப்பட்டன.",
    admin_memories_alert_upload_stopped_photos: "பதிவேற்றம் ரத்து செய்யப்பட்டது. {done} / {total} புகைப்படங்கள் பதிவேற்றப்பட்டன.",
    admin_memories_alert_files_uploaded_title: "கோப்பு(கள்) பதிவேற்றப்பட்டன",
    admin_memories_alert_files_uploaded_body: "{count} கோப்பு(கள்) வெற்றிகரமாக பதிவேற்றப்பட்டன.",
    admin_memories_alert_photos_added_title: "புகைப்படங்கள் சேர்க்கப்பட்டன",
    admin_memories_alert_photos_added_body: "{count} புகைப்படம்(கள்) ஆல்பம் கேலரியில் வெற்றிகரமாக பதிவேற்றப்பட்டன.",
    admin_memories_alert_image_replaced_title: "படம் மாற்றப்பட்டது!",
    admin_memories_alert_image_replaced_body: "படம் #{index} புதிய கோப்புடன் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.",
    admin_memories_alert_image_replace_error: "இலக்கு படக் கோப்பை மாற்ற முடியவில்லை.",

        // =====================================================================
    // FEEDBACK MANAGEMENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_feedback_page_title: "முன்னாள் மாணவர் கருத்துகள் & கருத்துரைகள்",
    
    admin_feedback_page_subtitle: "முன்னாள் மாணவர் கருத்துகள், மதிப்பீடுகள், நினைவுகள் மற்றும் நிர்வாகத்திற்கான பரிந்துரைகளை மதிப்பாய்வு செய்து, நிர்வகித்து வெளியிடுங்கள்.",

    // Analytics cards
    admin_feedback_stat_total: "மொத்த கருத்துகள்",
    admin_feedback_stat_total_sub: "அனைத்து சமர்ப்பிப்புகள்",
    admin_feedback_stat_pending: "மதிப்பாய்வு நிலுவையில்",
    admin_feedback_stat_pending_sub: "நிர்வாக நடவடிக்கை தேவை",
    admin_feedback_stat_approved: "அங்கீகரிக்கப்பட்டது",
    admin_feedback_stat_approved_sub: "பொதுவில் வெளியிடப்பட்டது",
    admin_feedback_stat_rejected: "நிராகரிக்கப்பட்டது",
    admin_feedback_stat_rejected_sub: "நிராகரிக்கப்பட்ட பதிவுகள்",
    admin_feedback_stat_featured: "சிறப்பு இடம்",
    admin_feedback_stat_featured_sub: "முன்னிலைப்படுத்தப்பட்ட அட்டைகள்",
    admin_feedback_stat_avg: "சராசரி மதிப்பீடு",
    admin_feedback_stat_avg_sub: "5.0 நட்சத்திர அளவு",

    // Tabs & filters
    admin_feedback_tab_pending: "நிலுவையில் ({count})",
    admin_feedback_tab_approved: "அங்கீகரிக்கப்பட்டது ({count})",
    admin_feedback_tab_featured: "சிறப்பு ⭐ ({count})",
    admin_feedback_tab_rejected: "நிராகரிக்கப்பட்டது ({count})",
    admin_feedback_tab_all: "அனைத்தும் ({count})",
    admin_feedback_category_filter_label: "வகை வடிகட்டி:",
    admin_feedback_search_placeholder: "பெயர், தொகுதி, கருத்து உரை மூலம் தேடுங்கள்...",

    // Category labels
    admin_feedback_cat_all: "அனைத்தும்",
    admin_feedback_cat_suggestions: "பரிந்துரைகள்",
    admin_feedback_cat_appreciation: "பாராட்டுக்கள்",
    admin_feedback_cat_memories: "நினைவுகள்",
    admin_feedback_cat_website: "இணையதளம்",
    admin_feedback_cat_association: "சங்கம்",
    admin_feedback_cat_events: "நிகழ்வுகள் ",
    admin_feedback_cat_other: "பிற",

    // Card badges & action titles
    admin_feedback_batch_prefix: "தொகுதி {year}",
    admin_feedback_featured_tooltip_add: "இந்தக் கருத்தைச் சிறப்பிக்கவும்",
    admin_feedback_featured_tooltip_remove: "சிறப்பு இடத்தில் (நீக்க கிளிக் செய்யவும்)",
    admin_feedback_delete_tooltip: "கருத்தை நீக்கு",

    // Card actions
    admin_feedback_action_approve: "அங்கீகரி",
    admin_feedback_action_reject: "நிராகரி",
    admin_feedback_action_edit_details: "விவரங்களைத் திருத்து",

    // Empty state
    admin_feedback_empty_title: "கருத்துப் பதிவுகள் எதுவும் கிடைக்கவில்லை",
    admin_feedback_empty_description: "\"{status}\" நிலை அல்லது தேடல் வினவலுக்கு எந்த முன்னாள் மாணவர் கருத்துகளும் பொருந்தவில்லை.",

    // Reject modal
    admin_feedback_reject_modal_title: "கருத்துப் பதிவை நிராகரி",
    admin_feedback_reject_modal_body: "{name} ({year} தொகுதி) அவர்களின் கருத்து நிராகரிக்கப்படுகிறது.",
    admin_feedback_reject_reason_label: "நிராகரிப்புக் காரணம் / குறிப்புகள்",
    admin_feedback_reject_reason_placeholder: "நிராகரிப்புக்கான கருத்தை உள்ளிடவும்...",
    admin_feedback_reject_cancel: "ரத்து செய்",
    admin_feedback_reject_confirm: "நிராகரிப்பை உறுதிசெய்",

    // Edit modal
    admin_feedback_edit_modal_title: "கருத்துப் பதிவைத் திருத்து",
    admin_feedback_form_name_label: "முன்னாள் மாணவர் பெயர் *",
    admin_feedback_form_name_ta_label: "தமிழ்ப் பெயர்",
    admin_feedback_form_name_ta_placeholder: "தமிழ் பெயர்",
    admin_feedback_form_batch_label: "தொகுதி ஆண்டு *",
    admin_feedback_form_location_label: "இடம்",
    admin_feedback_form_location_placeholder: "எ.கா. சென்னை, இந்தியா",
    admin_feedback_form_category_label: "வகை",
    admin_feedback_form_rating_label: "மதிப்பீட்டு நட்சத்திரங்கள் (1-5)",
    admin_feedback_form_rating_5: "5 நட்சத்திரங்கள் (★★★★★)",
    admin_feedback_form_rating_4: "4 நட்சத்திரங்கள் (★★★★☆)",
    admin_feedback_form_rating_3: "3 நட்சத்திரங்கள் (★★★☆☆)",
    admin_feedback_form_rating_2: "2 நட்சத்திரங்கள் (★★☆☆☆)",
    admin_feedback_form_rating_1: "1 நட்சத்திரம் (★☆☆☆☆)",
    admin_feedback_form_text_en_label: "கருத்து உரை (ஆங்கிலம்) *",
    admin_feedback_form_text_ta_label: "கருத்து உரை (தமிழ்)",
    admin_feedback_form_text_ta_placeholder: "தமிழில் கருத்து...",
    admin_feedback_form_status_label: "நிலை",
    admin_feedback_form_status_approved: "அங்கீகரிக்கப்பட்டு வெளியிடப்பட்டது",
    admin_feedback_form_status_pending: "மதிப்பாய்வு நிலுவையில்",
    admin_feedback_form_status_rejected: "நிராகரிக்கப்பட்டது",
    admin_feedback_form_cancel: "ரத்து செய்",
    admin_feedback_form_save: "மாற்றங்களைச் சேமி",

    // Status badges
    admin_feedback_status_approved: "அங்கீகரிக்கப்பட்டது",
    admin_feedback_status_pending: "மதிப்பாய்வு நிலுவையில்",
    admin_feedback_status_rejected: "நிராகரிக்கப்பட்டது",

    // Alerts
    admin_feedback_alert_approved_title: "கருத்து அங்கீகரிக்கப்பட்டது",
    admin_feedback_alert_approved_body: "{name} அவர்களின் கருத்து இப்போது பொதுவில் உள்ளது.",
    admin_feedback_alert_status_updated_title: "நிலை புதுப்பிக்கப்பட்டது",
    admin_feedback_alert_status_updated_body: "கருத்து {status} எனக் குறிக்கப்பட்டது.",
    admin_feedback_alert_featured_added_title: "சிறப்பு இடத்தில்!",
    admin_feedback_alert_featured_removed_title: "சிறப்பிலிருந்து நீக்கப்பட்டது",
    admin_feedback_alert_featured_body: "{name} அவர்களின் கருத்து புதுப்பிக்கப்பட்டது.",
    admin_feedback_alert_deleted_title: "நீக்கப்பட்டது",
    admin_feedback_alert_deleted_body: "கருத்துப் பதிவு நீக்கப்பட்டது.",
    admin_feedback_alert_updated_title: "கருத்து புதுப்பிக்கப்பட்டது",
    admin_feedback_alert_updated_body: "கருத்து விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன.",
    admin_feedback_alert_delete_confirm_title: "கருத்தை நீக்கவா?",
    admin_feedback_alert_delete_confirm_body: "இந்த முன்னாள் மாணவர் கருத்துப் பதிவை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?",
    admin_feedback_alert_delete_confirm_btn: "பதிவை நீக்கு",
    admin_feedback_alert_approve_error: "கருத்தை அங்கீகரிக்க முடியவில்லை.",
    admin_feedback_alert_status_error: "கருத்து நிலையைப் புதுப்பிக்க முடியவில்லை.",
    admin_feedback_alert_featured_error: "சிறப்பு நிலையை மாற்ற முடியவில்லை.",
    admin_feedback_alert_delete_error: "கருத்தை நீக்க முடியவில்லை.",
    admin_feedback_alert_update_error: "கருத்து விவரங்களைப் புதுப்பிக்க முடியவில்லை.",

        // =====================================================================
    // ASSOCIATION TEAM PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_association_page_title: "முன்னாள் மாணவர் சங்க குழு",
    admin_association_page_subtitle: "சங்கத்தின் மத்திய தலைமைக் குழு & பொது சுயவிவரங்களை நிர்வகிக்கவும் (மாணவர் பதிவுகளிலிருந்து சுயாதீனமானது)",
    admin_association_add_btn: "+ குழு உறுப்பினரைச் சேர்",

    // Overview cards
    admin_association_stat_total: "மொத்த குழு சுயவிவரங்கள்",
    admin_association_stat_active: "செயலில் உள்ள தலைவர்கள்",
    admin_association_stat_linked: "இணைக்கப்பட்ட முன்னாள் மாணவர் தலைவர்கள்",
    admin_association_stat_common: "பொது சுயவிவரங்கள்",

    // Directory table
    admin_association_directory_title: "சங்க தலைமை அடைவு ({count})",
    admin_association_search_placeholder: "குழு உறுப்பினரைத் தேடுங்கள்...",

    // Table columns
    admin_association_col_member: "குழு தலைவர் / உறுப்பினர்",
    admin_association_col_position: "சங்க பதவி",
    admin_association_col_term: "பதவிக்காலம்",
    admin_association_col_contact: "தொடர்பு & இடம்",
    admin_association_col_order: "வரிசை",
    admin_association_col_status: "நிலை",
    admin_association_col_action: "செயல்",

    // Member row badges
    admin_association_badge_alumni: "முன்னாள் மாணவர் '{year}",
    admin_association_badge_common: "பொது சுயவிவரம்",
    admin_association_default_location: "தூத்துக்குடி",
    admin_association_status_active: "செயலில்",
    admin_association_status_inactive: "செயலில் இல்லை",

    // Row action titles
    admin_association_action_edit: "சுயவிவரத்தைத் திருத்து",
    admin_association_action_delete: "குழு உறுப்பினரை நீக்கு",

    // Position names (used for display and dropdown)
    admin_association_pos_president: "தலைவர்",
    admin_association_pos_vice_president: "துணைத் தலைவர்",
    admin_association_pos_secretary: "செயலாளர்",
    admin_association_pos_joint_secretary: "இணைச் செயலாளர்",
    admin_association_pos_treasurer: "பொருளாளர்",
    admin_association_pos_executive: "செயற்குழு உறுப்பினர்",
    admin_association_pos_other: "பிற",

    // Add/Edit modal
    admin_association_modal_title_add: "சங்க குழு உறுப்பினரைச் சேர்",
    admin_association_modal_title_edit: "சங்க குழு உறுப்பினரைத் திருத்து",

    // Modal — creation mode
    admin_association_mode_label: "இந்த குழு உறுப்பினரை எவ்வாறு சேர்க்க விரும்புகிறீர்கள்?",
    admin_association_mode_alumni_title: "முன்னாள் மாணவர்களிடமிருந்து தேர்ந்தெடு",
    admin_association_mode_alumni_sub: "முன்னாள் மாணவர் தரவுத்தளத்தைத் தேடி தகவலை நிரப்பவும்",
    admin_association_mode_common_title: "பொது சுயவிவரத்தை உருவாக்கு",
    admin_association_mode_common_sub: "சுயாதீன தலைமைச் சுயவிவரத்தைச் சேர்",

    // Modal — alumni picker
    admin_association_alumni_search_label: "முன்னாள் மாணவர் தரவுத்தளத்தைத் தேடுங்கள்",
    admin_association_alumni_search_placeholder: "பெயர், மொபைல், மின்னஞ்சல் அல்லது சேர்க்கை எண்ணை உள்ளிடவும்...",
    admin_association_alumni_selected_prefix: "தேர்ந்தெடுக்கப்பட்டது:",
    admin_association_alumni_class_of: "({year} ஆம் ஆண்டு வகுப்பு)",
    admin_association_alumni_prefilled: "தகவல் நிரப்பப்பட்டது",
    admin_association_alumni_empty: "பொருந்தும் முன்னாள் மாணவர் எவரும் இல்லை",
    admin_association_alumni_batch_prefix: "தொகுதி {year}",
    admin_association_alumni_select_btn: "தேர்ந்தெடு",

    // Modal — form sections
    admin_association_form_section_personal: "1. தனிப்பட்ட & தொடர்பு விவரங்கள்",
    admin_association_form_section_position: "2. சங்க பதவி & பதவிக்காலம்",

    // Modal — personal fields
    admin_association_form_name_en_label: "முழுப் பெயர் (ஆங்கிலம்) *",
    admin_association_form_name_en_placeholder: "எ.கா. D. செல்வின்",
    admin_association_form_name_ta_label: "தமிழில் முழுப் பெயர்",
    admin_association_form_name_ta_placeholder: "எ.கா. D. செல்வின்",
    admin_association_form_email_label: "மின்னஞ்சல் முகவரி",
    admin_association_form_email_placeholder: "email@example.com",
    admin_association_form_mobile_label: "மொபைல் எண்",
    admin_association_form_mobile_placeholder: "+91 98765 43210",
    admin_association_form_location_label: "தற்போதைய இடம் / நகரம்",
    admin_association_form_location_placeholder: "எ.கா. தூத்துக்குடி / சென்னை",
    admin_association_form_occupation_label: "தொழில் / பணி",
    admin_association_form_occupation_placeholder: "எ.கா. மென்பொருள் வல்லுநர் / ஓய்வுபெற்றவர்",
    admin_association_form_batch_label: "தொகுதி ஆண்டு (முன்னாள் மாணவர் எனில்)",
    admin_association_form_batch_placeholder: "எ.கா. 1976",
    admin_association_form_photo_label: "சுயவிவரப் புகைப்படம்",
    admin_association_form_photo_sublabel: "பதிவேற்றவும், சதுர 1:1 வடிவில் வெட்டவும், சுழற்றவும் அல்லது வண்ணங்களை சரிசெய்யவும்.",

    // Modal — position fields
    admin_association_form_position_en_label: "சங்க பதவி (ஆங்கிலம்) *",
    admin_association_form_position_ta_label: "தமிழில் பதவி",
    admin_association_form_position_ta_placeholder: "எ.கா. தலைவர் / செயலாளர் / துணைத் தலைவர் / பொருளாளர்",
    admin_association_form_responsibility_label: "பொறுப்பு / பங்கு கண்ணோட்டம்",
    admin_association_form_responsibility_placeholder: "எ.கா. நிர்வாகக் கூட்டங்கள் & நிகழ்வுகளை நிர்வகித்தல்",
    admin_association_form_custom_position_label: "தனிப்பயன் பதவியைக் குறிப்பிடவும் (ஆங்கிலம்) *",
    admin_association_form_custom_position_placeholder: "எ.கா. கல்விக் குழு தலைவர்",
    admin_association_form_term_start_label: "பதவிக்காலம் தொடக்கம்",
    admin_association_form_term_start_placeholder: "2024",
    admin_association_form_term_end_label: "பதவிக்காலம் முடிவு",
    admin_association_form_term_end_placeholder: "2026",
    admin_association_form_order_label: "காட்சி வரிசை எண்",
    admin_association_form_order_placeholder: "1",
    admin_association_form_status_label: "நிலை",
    admin_association_form_status_active: "செயலில்",
    admin_association_form_status_inactive: "செயலில் இல்லை",
    admin_association_form_bio_label: "சுயவிவர விளக்கம் / சுருக்கம்",
    admin_association_form_bio_placeholder: "சுருக்கமான தலைமைக் கண்ணோட்டம்...",
    admin_association_form_cancel: "ரத்து செய்",
    admin_association_form_save_changes: "மாற்றங்களைச் சேமி",
    admin_association_form_add_submit: "குழு உறுப்பினரைச் சேர்",

    // Alerts
    admin_association_alert_required_title: "தேவையான புலம்",
    admin_association_alert_required_body: "உறுப்பினரின் முழுப் பெயரை வழங்கவும்.",
    admin_association_alert_photo_uploaded_title: "புகைப்படம் பதிவேற்றப்பட்டது",
    admin_association_alert_photo_uploaded_body: "சுயவிவரப் புகைப்படம் வெற்றிகரமாக பதிவேற்றப்பட்டது.",
    admin_association_alert_photo_error: "புகைப்படப் பதிவேற்றம் தோல்வியடைந்தது.",
    admin_association_alert_updated_title: "சுயவிவரம் புதுப்பிக்கப்பட்டது",
    admin_association_alert_updated_body: "{name} சங்க சுயவிவரம் புதுப்பிக்கப்பட்டது.",
    admin_association_alert_created_title: "குழு உறுப்பினர் சேர்க்கப்பட்டார்",
    admin_association_alert_created_body: "{name} {position} ஆக சேர்க்கப்பட்டார்.",
    admin_association_alert_save_error: "சங்க குழு சுயவிவரத்தைச் சேமிக்க முடியவில்லை.",
    admin_association_alert_removed_title: "நீக்கப்பட்டது",
    admin_association_alert_removed_body: "{name} சங்க குழுவிலிருந்து நீக்கப்பட்டார்.",
    admin_association_alert_delete_error: "குழு உறுப்பினரை நீக்க முடியவில்லை.",
    admin_association_alert_status_updated_title: "நிலை புதுப்பிக்கப்பட்டது",
    admin_association_alert_status_updated_body: "{name} நிலை {status} என அமைக்கப்பட்டது.",
    admin_association_alert_status_error: "நிலையைப் புதுப்பிக்க முடியவில்லை.",
    admin_association_alert_confirm_delete: "முன்னாள் மாணவர் சங்க குழுவிலிருந்து {name} ஐ நீக்க விரும்புகிறீர்களா?",

        // =====================================================================
    // RANK HOLDERS MANAGEMENT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_rank_page_title: "பள்ளி தரவரிசை சாதனையாளர்கள் நிர்வாகம்",
    admin_rank_page_subtitle: "சிறந்த கல்வித் தரவரிசை சாதனைகளைப் பெற்ற மாணவர்கள் & முன்னாள் மாணவர்களைக் காட்சிப்படுத்துங்கள்",
    admin_rank_add_btn: "தரவரிசை சாதனையாளரைச் சேர்",

    // Filters
    admin_rank_search_placeholder: "மாணவர் பெயர், தரவரிசை அல்லது சாதனை மூலம் தேடுங்கள்...",
    admin_rank_all_years: "அனைத்து கல்வி ஆண்டுகள்",

    // Table headers
    admin_rank_col_photo: "புகைப்படம்",
    admin_rank_col_name: "மாணவர் / முன்னாள் மாணவர் பெயர்",
    admin_rank_col_year: "கல்வி ஆண்டு",
    admin_rank_col_class: "வகுப்பு",
    admin_rank_col_rank: "தரவரிசை",
    admin_rank_col_score: "மதிப்பெண்",
    admin_rank_col_status: "நிலை",
    admin_rank_col_actions: "செயல்கள்",

    // Status badges
    admin_rank_status_active: "செயலில்",
    admin_rank_status_inactive: "செயலில் இல்லை",

    // Row actions
    admin_rank_action_edit: "தரவரிசை சாதனையாளரைத் திருத்து",
    admin_rank_action_delete: "தரவரிசை சாதனையாளரை நீக்கு",

    // Empty state
    admin_rank_empty_title: "தரவரிசை சாதனையாளர்கள் எவரும் கிடைக்கவில்லை",
    admin_rank_empty_description: "மாணவர் கல்வி சாதனைகளைப் பதிவு செய்ய மேலே உள்ள 'தரவரிசை சாதனையாளரைச் சேர்' என்பதைக் கிளிக் செய்யவும்.",
    admin_rank_empty_add_btn: "முதல் தரவரிசை சாதனையாளரைச் சேர்",

    // Modal
    admin_rank_modal_title_add: "பள்ளி தரவரிசை சாதனையாளரைச் சேர்",
    admin_rank_modal_title_edit: "தரவரிசை சாதனையாளரைத் திருத்து",
    admin_rank_form_alumni_select_label: "முன்னாள் மாணவர் சுயவிவரத்தைத் தேர்ந்தெடுக்கவும் (விருப்பமானது)",
    admin_rank_form_alumni_select_placeholder: "-- தற்போதைய முன்னாள் மாணவரைத் தேர்ந்தெடுக்கவும் (விவரங்கள் தானாக நிரப்பப்படும்) --",
    admin_rank_form_alumni_option_format: "{name} ({year} தொகுதி)",

    admin_rank_form_name_label: "மாணவர் / முன்னாள் மாணவர் பெயர் *",
    admin_rank_form_name_placeholder: "எ.கா. அருண் குமார்",
    admin_rank_form_name_ta_label: "மாணவர் பெயர் (தமிழ்)",
    admin_rank_form_name_ta_placeholder: "எ.கா. அருண் குமார்",

    admin_rank_form_year_label: "கல்வி ஆண்டு *",
    admin_rank_form_class_label: "வகுப்பு / தரநிலை *",
    admin_rank_form_rank_label: "தரவரிசை *",
    admin_rank_form_exam_label: "தேர்வு / சாதனை *",
    admin_rank_form_exam_placeholder: "எ.கா. SSLC / பொதுத் தேர்வு",

    admin_rank_form_total_marks_label: "மொத்த மதிப்பெண் *",
    admin_rank_form_total_marks_placeholder: "எ.கா. 485 அல்லது 1150",
    admin_rank_form_max_marks_label: "அதிகபட்ச மதிப்பெண்",
    admin_rank_form_max_marks_placeholder: "எ.கா. 500 அல்லது 1200",
    admin_rank_form_percentage_label: "சதவீதம் / தரம்",
    admin_rank_form_percentage_placeholder: "எ.கா. 97.0% அல்லது A+",

    admin_rank_form_stream_label: "பாடம் / பிரிவு (விருப்பமானது)",
    admin_rank_form_stream_placeholder: "எ.கா. அறிவியல் பிரிவு / உயிரியல்-கணிதம்",
    admin_rank_form_title_label: "சாதனை தலைப்பு",
    admin_rank_form_title_placeholder: "எ.கா. பள்ளி முதல் தரவரிசை",
    admin_rank_form_photo_label: "புகைப்படம்",
    admin_rank_form_description_label: "சிறு விவரம் (விருப்பமானது)",
    admin_rank_form_description_placeholder: "மாணவரின் சாதனை பற்றிய சிறு குறிப்பு...",
    admin_rank_form_status_label: "நிலை",

    admin_rank_form_status_active_option: "செயலில் (பொது போர்ட்டலில் காட்டு)",
    admin_rank_form_status_inactive_option: "செயலில் இல்லை (மறைக்கப்பட்டது)",

    admin_rank_form_cancel: "ரத்து செய்",
    admin_rank_form_save: "தரவரிசை சாதனையாளரைச் சேமி",
    admin_rank_form_saving: "சேமிக்கப்படுகிறது...",

    // Rank options (dropdown)
    admin_rank_opt_1st: "1வது தரவரிசை",
    admin_rank_opt_2nd: "2வது தரவரிசை",
    admin_rank_opt_3rd: "3வது தரவரிசை",
    admin_rank_opt_school_first: "பள்ளி முதல்",
    admin_rank_opt_district_first: "மாவட்ட முதல்",
    admin_rank_opt_district_second: "மாவட்ட இரண்டாம்",
    admin_rank_opt_district_third: "மாவட்ட மூன்றாம்",
    admin_rank_opt_state_first: "மாநில முதல்",
    admin_rank_opt_state_second: "மாநில இரண்டாம்",
    admin_rank_opt_state_third: "மாநில மூன்றாம்",
    admin_rank_opt_other: "பிற சாதனை",

    // Class options
    admin_rank_class_10: "10ஆம் வகுப்பு",
    admin_rank_class_11: "11ஆம் வகுப்பு",
    admin_rank_class_12: "12ஆம் வகுப்பு",
    admin_rank_class_9: "9ஆம் வகுப்பு",

    // Alerts
    admin_rank_alert_required_title: "தேவையான புலங்கள் இல்லை",
    admin_rank_alert_required_body: "மாணவர் பெயர், கல்வி ஆண்டு, வகுப்பு மற்றும் தரவரிசையை நிரப்பவும்.",
    admin_rank_alert_updated_title: "தரவரிசை சாதனையாளர் புதுப்பிக்கப்பட்டார்",
    admin_rank_alert_updated_body: "\"{name}\" விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன.",
    admin_rank_alert_added_title: "தரவரிசை சாதனையாளர் சேர்க்கப்பட்டார்",
    admin_rank_alert_added_body: "\"{name}\" தரவரிசை சாதனையாளர்கள் பட்டியலில் சேர்க்கப்பட்டார்.",
    admin_rank_alert_save_error: "தரவரிசை சாதனையாளர் பதிவைச் சேமிக்க முடியவில்லை.",
    admin_rank_alert_delete_confirm_title: "தரவரிசை சாதனையாளரை நீக்கவா?",
    admin_rank_alert_delete_confirm_body: "\"{name}\" ஐ தரவரிசை சாதனையாளர்கள் பட்டியலிலிருந்து நீக்க விரும்புகிறீர்களா?",
    admin_rank_alert_deleted_title: "நீக்கப்பட்டது",
    admin_rank_alert_deleted_body: "\"{name}\" தரவரிசை சாதனையாளர்களிலிருந்து நீக்கப்பட்டார்.",
    admin_rank_alert_delete_error: "தரவரிசை சாதனையாளரை நீக்க முடியவில்லை.",

        // =====================================================================
    // REPORTS & DATA EXPORT PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_reports_page_title: "அறிக்கைகள் & தரவு ஏற்றுமதி",
    admin_reports_page_subtitle: "ஒட்டுமொத்த புள்ளிவிவரங்கள், வருகை அளவீடுகள் மற்றும் பதிவிறக்கம் செய்யக்கூடிய CSV அறிக்கைகள்",

    // Stats cards
    admin_reports_stat_total: "மொத்த முன்னாள் மாணவர் பதிவேடு",
    admin_reports_stat_verified: "சரிபார்க்கப்பட்ட செயலில் உள்ள முன்னாள் மாணவர்கள்",
    admin_reports_stat_checkins: "நிறைவு செய்யப்பட்ட வருகைப் பதிவுகள்",
    admin_reports_stat_turnout: "வருகை விகிதம்",

    // CSV Export Center
    admin_reports_export_center_title: "CSV பட்டியல் & பகுப்பாய்வு ஏற்றுமதி மையம்",
    admin_reports_export_roster_title: "முழு முன்னாள் மாணவர் பட்டியல் CSV",
    admin_reports_export_roster_desc: "அனைத்து முன்னாள் மாணவர் தொடர்பு விவரங்கள், சேர்க்கை எண்கள் மற்றும் நிலைகளை ஏற்றுமதி செய்யவும்",
    admin_reports_export_roster_btn: "பட்டியலை ஏற்றுமதி செய்",
    admin_reports_export_attendance_title: "மீள்சந்திப்பு வருகை அறிக்கை",
    admin_reports_export_attendance_desc: "நிகழ்வு RSVP பட்டியல்கள், விருந்தினர் எண்ணிக்கை மற்றும் வருகை நேரங்களை ஏற்றுமதி செய்யவும்",
    admin_reports_export_attendance_btn: "நிகழ்வைத் தேர்ந்தெடு",

    // Alert
    admin_reports_alert_select_event_title: "ஏற்றுமதி செய்ய நிகழ்வைத் தேர்ந்தெடுக்கவும்",
    admin_reports_alert_select_event_body: "விரிவான வருகை CSV அறிக்கையைப் பதிவிறக்க, நிகழ்வு மேலாண்மை தாவலுக்குச் சென்று ஒரு குறிப்பிட்ட நிகழ்வைத் தேர்ந்தெடுக்கவும்.",

        // =====================================================================
    // SCHOOL SETTINGS & HIERARCHY PAGE (school-admin) — NEW KEYS
    // =====================================================================
    // Page header
    admin_settings_page_title: "பள்ளி அமைப்புகள் & படிநிலை",
    admin_settings_page_subtitle: "நிறுவன சுயவிவரம், போர்ட்டல் கட்டுப்பாடுகள் மற்றும் நிர்வாக ஊழியர் படிநிலையை உள்ளமைக்கவும்",

    // Tabs
    admin_settings_tab_profile: "பள்ளி சுயவிவரம் & பிராண்டிங்",
    admin_settings_tab_controls: "போர்ட்டல் கட்டுப்பாடுகள் & நிலைமாற்றங்கள்",
    admin_settings_tab_staff: "நிர்வாகம் & ஊழியர் படிநிலை",

    // Profile tab — Institutional Profile
    admin_settings_section_inst_profile: "பள்ளி நிறுவன சுயவிவரம்",
    admin_settings_section_inst_profile_sub: "பொது தகவல் மற்றும் நிறுவன அடையாளம்",
    admin_settings_form_name_label: "பள்ளியின் அதிகாரப்பூர்வ பெயர் *",
    admin_settings_form_code_label: "பள்ளி குறியீடு *",
    admin_settings_form_type_label: "பள்ளி வகை",
    admin_settings_form_type_placeholder: "எ.கா. மேல்நிலைப் பள்ளி",
    admin_settings_form_established_label: "நிறுவப்பட்ட ஆண்டு",
    admin_settings_form_motto_label: "பள்ளியின் குறிக்கோள் & விவரம்",
    admin_settings_form_motto_placeholder: "நிறுவன கண்ணோட்டம், வரலாறு மற்றும் குறிக்கோள்...",

    // Profile tab — Branding
    admin_settings_section_branding: "போர்ட்டல் பிராண்டிங் & படப் பதிவேற்றங்கள்",
    admin_settings_section_branding_sub: "பள்ளி லோகோ மற்றும் அட்டை பேனருக்கான URLகளை பதிவேற்றவும் அல்லது உள்ளிடவும்",
    admin_settings_form_logo_label: "பள்ளி லோகோ படம்",
    admin_settings_form_logo_choose: "லோகோ கோப்பைத் தேர்ந்தெடு",
    admin_settings_form_logo_uploading: "பதிவேற்றப்படுகிறது...",
    admin_settings_form_logo_or_url: "அல்லது பட URL ஐ உள்ளிடவும்",
    admin_settings_form_logo_url_placeholder: "https://example.com/logo.png",
    admin_settings_form_cover_label: "பேனர் அட்டைப் படம்",
    admin_settings_form_cover_choose: "அட்டை பேனர் கோப்பைத் தேர்ந்தெடு",
    admin_settings_form_cover_or_url: "அல்லது பட URL ஐ உள்ளிடவும்",
    admin_settings_form_cover_url_placeholder: "https://example.com/cover.jpg",
    admin_settings_form_portal_name_label: "முன்னாள் மாணவர் போர்ட்டல் பெயர்",
    admin_settings_form_portal_name_placeholder: "NHSS முன்னாள் மாணவர் போர்ட்டல்",
    admin_settings_form_tagline_label: "போர்ட்டல் முழக்கம்",
    admin_settings_form_tagline_placeholder: "எப்போதும் இணைந்திருப்போம். ஒன்றாக முன்னேறுவோம்.",
    admin_settings_preview_logo: "லோகோ முன்னோட்டம்:",
    admin_settings_preview_cover: "அட்டை பேனர் முன்னோட்டம்:",

    // Profile tab — Contact
    admin_settings_section_contact: "அதிகாரப்பூர்வ தொடர்பு & இடம்",
    admin_settings_section_contact_sub: "பொது அடைவில் காட்டப்படும் வளாக தொடர்பு விவரங்கள்",
    admin_settings_form_email_label: "அதிகாரப்பூர்வ மின்னஞ்சல் *",
    admin_settings_form_phone_label: "தொடர்பு தொலைபேசி *",
    admin_settings_form_website_label: "அதிகாரப்பூர்வ இணையதளம்",
    admin_settings_form_address_label: "வளாக முகவரி",
    admin_settings_form_city_label: "நகரம்",
    admin_settings_form_district_label: "மாவட்டம்",
    admin_settings_form_state_label: "மாநிலம்",
    admin_settings_form_pincode_label: "அஞ்சல் குறியீடு",

    admin_settings_btn_save_profile: "சுயவிவர அமைப்புகளைச் சேமி",

    // Controls tab
    admin_settings_section_controls: "போர்ட்டல் அம்சக் கட்டுப்பாட்டு சுவிட்சுகள்",
    admin_settings_section_controls_sub: "போர்ட்டல் பதிவு, அங்கீகாரங்கள், அடைவு அணுகல் மற்றும் அறிவிப்புகளை இயக்கவும் அல்லது முடக்கவும்",
    admin_settings_toggle_reg_title: "முன்னாள் மாணவர் பதிவு",
    admin_settings_toggle_reg_sub: "புதிய முன்னாள் மாணவர்கள் பொது போர்ட்டலில் பதிவு செய்ய அனுமதிக்கவும்",
    admin_settings_toggle_approval_title: "கைமுறை நிர்வாக சரிபார்ப்பு / அங்கீகாரம்",
    admin_settings_toggle_approval_sub: "முழு போர்ட்டல் அணுகலை வழங்குவதற்கு முன் பள்ளி நிர்வாகி சரிபார்ப்பு தேவை",
    admin_settings_toggle_directory_title: "பொது முன்னாள் மாணவர் அடைவு",
    admin_settings_toggle_directory_sub: "சரிபார்க்கப்பட்ட முன்னாள் மாணவர்கள் அடைவு மற்றும் தொகுதி பட்டியல்களை உலாவ அனுமதிக்கவும்",
    admin_settings_toggle_events_title: "நிகழ்வு RSVP & டிக்கெட்",
    admin_settings_toggle_events_sub: "நிகழ்வு RSVP பதிவுகள் மற்றும் QR டிக்கெட் வருகைப் பதிவுகளை இயக்கவும்",
    admin_settings_toggle_announcements_title: "அறிவிப்பு ஒளிபரப்பு அறிவிப்புகள்",
    admin_settings_toggle_announcements_sub: "பள்ளி நிர்வாகம் முன்னாள் மாணவர்களுக்கு ஒளிபரப்பு அறிவிப்புகளை அனுப்ப அனுமதிக்கவும்",
    admin_settings_btn_save_controls: "போர்ட்டல் சுவிட்சுகளைச் சேமி",

    // Staff tab
    admin_settings_section_staff: "பள்ளி நிர்வாகம் & ஊழியர் பதிவுகள்",
    admin_settings_section_staff_sub: "தற்போதைய செயலில் உள்ள ஊழியர் படிநிலையை நிர்வகிக்கவும், மதிக்கப்படும் முன்னாள் ஆசிரியர்களைப் பதிவு செய்யவும்",
    admin_settings_btn_add_current: "தற்போதைய ஊழியரைச் சேர்",
    admin_settings_btn_add_past: "முன்னாள் / பழைய ஊழியரைச் சேர்",

    admin_settings_filter_current: "தற்போதைய ஊழியர்கள் ({count})",
    admin_settings_filter_past: "மதிக்கப்படும் முன்னாள் / பழைய ஊழியர்கள் ({count})",
    admin_settings_filter_all: "அனைத்து ஊழியர்கள் ({count})",

    admin_settings_staff_appointed: "{count} நியமிக்கப்பட்டது",
    admin_settings_staff_directory_current: "தற்போதைய பள்ளி நிர்வாகம் & செயலில் உள்ள ஊழியர்கள்",
    admin_settings_staff_directory_past: "மதிக்கப்படும் முன்னாள் / பழைய ஊழியர் அடைவு",
    admin_settings_staff_directory_all: "முழுமையான ஊழியர் அடைவு",

    // Staff table columns
    admin_settings_col_member: "பள்ளி நபர் / ஊழியர் உறுப்பினர்",
    admin_settings_col_designation: "பதவி / நிலை",
    admin_settings_col_category: "ஊழியர் வகை & பணிக்காலம்",
    admin_settings_col_department: "துறை",
    admin_settings_col_status: "நிலை",
    admin_settings_col_action: "செயல்",

    // Staff table row values
    admin_settings_staff_id_prefix: "ஊழியர் ID: {id}",
    admin_settings_staff_id_na: "ஊழியர் ID: இல்லை",
    admin_settings_staff_current_badge: "தற்போதைய ஊழியர்",
    admin_settings_staff_past_badge: "மதிக்கப்படும் முன்னாள் ஊழியர்",
    admin_settings_staff_service: "பணிக்காலம்: {start} - {end}",
    admin_settings_staff_service_retired: "ஓய்வு",
    admin_settings_staff_service_present: "தற்போது",
    admin_settings_staff_department_default: "பொது நிர்வாகம்",
    admin_settings_staff_status_active: "செயலில்",
    admin_settings_staff_status_inactive: "செயலில் இல்லை",
    admin_settings_staff_action_move_to_current: "தற்போதைய ஊழியராக மீட்டமை",
    admin_settings_staff_action_move_to_past: "முன்னாள் ஊழியர் பதிவுகளுக்கு நகர்த்து",
    admin_settings_staff_action_edit: "நபர் விவரங்களைத் திருத்து",
    admin_settings_staff_action_delete: "ஊழியர் பதிவை நீக்கு",

    // Staff modal
    admin_settings_staff_modal_edit_title: "பள்ளி ஊழியர் பதிவைத் திருத்து",
    admin_settings_staff_modal_add_past_title: "மதிக்கப்படும் முன்னாள் / பழைய ஊழியர் உறுப்பினரைச் சேர்",
    admin_settings_staff_modal_add_current_title: "தற்போதைய பள்ளி ஊழியர் உறுப்பினரைச் சேர்",

    admin_settings_staff_modal_info_past_title: "முன்னாள் / பழைய ஊழியர் பதிவு",
    admin_settings_staff_modal_info_past_body: "பள்ளி பாரம்பரியக் காப்பகத்தில் காட்ட முன்னாள் தலைமை ஆசிரியர்கள், அனுபவம் வாய்ந்த ஆசிரியர்கள் மற்றும் முன்னாள் ஊழியர்களைப் பதிவு செய்யவும்.",
    admin_settings_staff_modal_info_current_title: "தற்போதைய செயலில் உள்ள ஊழியர் உறுப்பினர்",
    admin_settings_staff_modal_info_current_body: "செயலில் உள்ள பள்ளி ஊழியர் உறுப்பினர்களைச் சேர்க்கவும் அல்லது புதுப்பிக்கவும், மேலும் பள்ளி நிர்வாக படிநிலையில் அவர்களின் பதவியை நியமிக்கவும்.",

    admin_settings_staff_radio_current: "தற்போதைய செயலில் உள்ள ஊழியர்",
    admin_settings_staff_radio_past: "மதிக்கப்படும் முன்னாள் / பழைய ஊழியர்",

    admin_settings_form_staff_name_en_label: "முழுப் பெயர் (ஆங்கிலம்) *",
    admin_settings_form_staff_name_en_placeholder: "எ.கா. டாக்டர் எஸ். ரமேஷ்",
    admin_settings_form_staff_name_ta_label: "முழுப் பெயர் (தமிழ்)",
    admin_settings_form_staff_name_ta_placeholder: "எ.கா. டாக்டர் எஸ். ரமேஷ்",
    admin_settings_form_staff_position_label: "பதவி / பள்ளி நிலை *",
    admin_settings_form_staff_position_ta_label: "பதவி தலைப்பு (தமிழ்)",
    admin_settings_form_staff_position_ta_placeholder: "எ.கா. தலைமை ஆசிரியர் / மூத்த ஆசிரியர்",
    admin_settings_form_staff_custom_position_label: "தனிப்பயன் பதவி / நிலை தலைப்பு (ஆங்கிலம்) *",
    admin_settings_form_staff_custom_position_placeholder: "எ.கா. கல்வி ஒருங்கிணைப்பாளர், முன்னாள் மூத்த ஆசிரியர், முன்னாள் விடுதி காப்பாளர்",
    admin_settings_form_staff_start_year_label: "பணி தொடக்க ஆண்டு",
    admin_settings_form_staff_start_year_placeholder: "எ.கா. 1985",
    admin_settings_form_staff_end_year_label: "பணி முடிவு ஆண்டு (விருப்பமானது)",
    admin_settings_form_staff_end_year_past_label: "பணி முடிவு ஆண்டு / ஓய்வு",
    admin_settings_form_staff_end_year_placeholder: "எ.கா. 2012",
    admin_settings_form_staff_department_en_label: "துறை (ஆங்கிலம்)",
    admin_settings_form_staff_department_en_placeholder: "எ.கா. அறிவியல் / கணிதம் / தமிழ்",
    admin_settings_form_staff_department_ta_label: "துறை (தமிழ்)",
    admin_settings_form_staff_department_ta_placeholder: "எ.கா. கணிதத் துறை / அறிவியல் துறை",
    admin_settings_form_staff_email_label: "அதிகாரப்பூர்வ மின்னஞ்சல்",
    admin_settings_form_staff_email_placeholder: "email@school.edu.in",
    admin_settings_form_staff_mobile_label: "மொபைல் எண்",
    admin_settings_form_staff_mobile_placeholder: "+91 98765 43210",
    admin_settings_form_staff_employee_id_label: "ஊழியர் / பணியாளர் ID",
    admin_settings_form_staff_employee_id_placeholder: "NHSS-STAFF-001",
    admin_settings_form_staff_photo_label: "சுயவிவரப் புகைப்படம்",
    admin_settings_form_staff_photo_upload_btn: "புகைப்படத்தைப் பதிவேற்று",
    admin_settings_form_staff_photo_uploading: "பதிவேற்றப்படுகிறது...",
    admin_settings_form_staff_photo_placeholder: "https://example.com/photo.jpg",
    admin_settings_form_staff_achievements_en_label: "சாதனைகள் & விருதுகள் (ஆங்கிலம்)",
    admin_settings_form_staff_achievements_en_placeholder: "எ.கா. மாநில சிறந்த ஆசிரியர் விருது பெற்றவர் (1998)",
    admin_settings_form_staff_achievements_ta_label: "சாதனைகள் (தமிழ்)",
    admin_settings_form_staff_achievements_ta_placeholder: "எ.கா. மாநில சிறந்த ஆசிரியர் விருது",
    admin_settings_form_staff_status_label: "நிலை",
    admin_settings_form_staff_status_active: "செயலில்",
    admin_settings_form_staff_status_inactive: "செயலில் இல்லை",
    admin_settings_form_staff_notes_en_label: "குறிப்புகள் (ஆங்கிலம்)",
    admin_settings_form_staff_notes_en_placeholder: "பங்கு பொறுப்புகள்...",
    admin_settings_form_staff_notes_ta_label: "குறிப்புகள் (தமிழ்)",
    admin_settings_form_staff_notes_ta_placeholder: "பங்களிப்பு குறிப்புகள்...",
    admin_settings_staff_modal_cancel: "ரத்து செய்",
    admin_settings_staff_modal_save_changes: "மாற்றங்களைச் சேமி",
    admin_settings_staff_modal_add_past_submit: "முன்னாள் ஊழியரைச் சேர்",
    admin_settings_staff_modal_add_current_submit: "தற்போதைய ஊழியரைச் சேர்",

    // School position names
    admin_settings_pos_principal: "தலைமை ஆசிரியர்",
    admin_settings_pos_vice_principal: "துணைத் தலைமை ஆசிரியர்",
    admin_settings_pos_headmaster: "தலைமையாசிரியர்",
    admin_settings_pos_headmistress: "தலைமை ஆசிரியை",
    admin_settings_pos_asst_headmaster: "உதவி தலைமையாசிரியர்",
    admin_settings_pos_asst_headmistress: "உதவி தலைமை ஆசிரியை",
    admin_settings_pos_dept_head: "துறைத் தலைவர்",
    admin_settings_pos_senior_teacher: "மூத்த ஆசிரியர்",
    admin_settings_pos_teacher: "ஆசிரியர்",
    admin_settings_pos_admin_staff: "நிர்வாக ஊழியர்",
    admin_settings_pos_other: "பிற (தனிப்பயன் பதவியை எழுதவும்)",

    // Position responsibilities (UI hints)
    admin_settings_pos_principal_resp: "பள்ளியின் உயர்ந்த அதிகாரம்; முழு பள்ளி போர்ட்டல் நிர்வாகம்",
    admin_settings_pos_vice_principal_resp: "தலைமை ஆசிரியருக்கு உதவி, ஒதுக்கப்பட்ட பள்ளி செயல்பாடுகளை நிர்வகித்தல்",
    admin_settings_pos_headmaster_resp: "பள்ளி நிர்வாகம் மற்றும் கல்வி மேலாண்மை",
    admin_settings_pos_headmistress_resp: "பள்ளி நிர்வாகம் மற்றும் கல்வி மேலாண்மை",
    admin_settings_pos_asst_headmaster_resp: "தலைமையாசிரியருக்கு உதவி, ஒப்படைக்கப்பட்ட பொறுப்புகளை நிர்வகித்தல்",
    admin_settings_pos_asst_headmistress_resp: "தலைமையாசிரியருக்கு உதவி, ஒப்படைக்கப்பட்ட பொறுப்புகளை நிர்வகித்தல்",
    admin_settings_pos_dept_head_resp: "துறை/வகுப்பு தொடர்பான செயல்பாடுகளை நிர்வகித்தல்",
    admin_settings_pos_senior_teacher_resp: "துறை/வகுப்பு தொடர்பான செயல்பாடுகளை நிர்வகித்தல்",
    admin_settings_pos_teacher_resp: "நிர்வாகத்தால் ஒதுக்கப்பட்ட மாணவர்/முன்னாள் மாணவர் தொடர்பான செயல்பாடுகள்",
    admin_settings_pos_admin_staff_resp: "அலுவலகம் மற்றும் நிர்வாக செயல்பாடுகள்",
    admin_settings_pos_other_resp: "தனிப்பயன் பள்ளி பதவி அல்லது நிலை",

    // Alerts
    admin_settings_alert_logo_uploaded_title: "லோகோ பதிவேற்றப்பட்டது",
    admin_settings_alert_logo_uploaded_body: "பள்ளி லோகோ படம் வெற்றிகரமாக பதிவேற்றப்பட்டது.",
    admin_settings_alert_logo_error: "லோகோ பதிவேற்றம் தோல்வியடைந்தது.",
    admin_settings_alert_cover_uploaded_title: "அட்டை பேனர் பதிவேற்றப்பட்டது",
    admin_settings_alert_cover_uploaded_body: "பள்ளி பேனர் படம் வெற்றிகரமாக பதிவேற்றப்பட்டது.",
    admin_settings_alert_cover_error: "பேனர் பதிவேற்றம் தோல்வியடைந்தது.",
    admin_settings_alert_staff_photo_uploaded_title: "புகைப்படம் பதிவேற்றப்பட்டது",
    admin_settings_alert_staff_photo_uploaded_body: "ஊழியர் சுயவிவரப் புகைப்படம் வெற்றிகரமாக பதிவேற்றப்பட்டது.",
    admin_settings_alert_staff_photo_error: "ஊழியர் புகைப்படப் பதிவேற்றம் தோல்வியடைந்தது.",
    admin_settings_alert_profile_updated_title: "பள்ளி சுயவிவரம் புதுப்பிக்கப்பட்டது",
    admin_settings_alert_profile_updated_body: "பள்ளி சுயவிவரம், பிராண்டிங் மற்றும் தொடர்பு விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன.",
    admin_settings_alert_profile_update_error: "பள்ளி சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை.",
    admin_settings_alert_required_title: "தேவையான புலம்",
    admin_settings_alert_required_body: "முழுப் பெயரை உள்ளிடவும்.",
    admin_settings_alert_staff_updated_title: "ஊழியர் பதிவு புதுப்பிக்கப்பட்டது",
    admin_settings_alert_staff_updated_body: "{name} விவரங்கள் புதுப்பிக்கப்பட்டன.",
    admin_settings_alert_staff_added_title: "ஊழியர் சேர்க்கப்பட்டார்",
    admin_settings_alert_staff_added_body: "{name} {target} இல் சேர்க்கப்பட்டார்.",
    admin_settings_alert_staff_added_target_current: "தற்போதைய நிர்வாகம்",
    admin_settings_alert_staff_added_target_past: "முன்னாள் ஊழியர் பதிவுகள்",
    admin_settings_alert_staff_save_error: "ஊழியர் பதிவைச் சேமிக்க முடியவில்லை.",
    admin_settings_alert_staff_confirm_move: "{name} ஐ {target} க்கு நகர்த்த விரும்புகிறீர்களா?",
    admin_settings_alert_staff_move_target_current: "தற்போதைய செயலில் உள்ள ஊழியர்",
    admin_settings_alert_staff_move_target_past: "முன்னாள் / பழைய ஊழியர்",
    admin_settings_alert_staff_moved_title: "ஊழியர் நிலை நகர்த்தப்பட்டது",
    admin_settings_alert_staff_moved_body: "{name} {target} க்கு நகர்த்தப்பட்டார்.",
    admin_settings_alert_staff_move_error: "ஊழியர் நிலையைப் புதுப்பிக்க முடியவில்லை.",
    admin_settings_alert_staff_confirm_delete: "{name} ஐ பள்ளி ஊழியர் பதிவுகளிலிருந்து நீக்க விரும்புகிறீர்களா?",
    admin_settings_alert_staff_deleted_title: "ஊழியர் நீக்கப்பட்டார்",
    admin_settings_alert_staff_deleted_body: "{name} வெற்றிகரமாக நீக்கப்பட்டார்.",
    admin_settings_alert_staff_delete_error: "ஊழியர் உறுப்பினரை நீக்க முடியவில்லை.",

        // =====================================================================
    // SCHOOL ADMIN DASHBOARD / OVERVIEW PAGE — NEW KEYS
    // =====================================================================
    // Stats cards
    admin_dashboard_stat_total_alumni: "மொத்த முன்னாள் மாணவர்கள்",
    admin_dashboard_stat_total_alumni_sub: "உள்ளமைக்கப்பட்ட பள்ளி பதிவேடு",
    admin_dashboard_stat_verified: "சரிபார்க்கப்பட்ட முன்னாள் மாணவர்கள்",
    admin_dashboard_stat_verified_sub: "அங்கீகரிக்கப்பட்ட செயலில் உள்ள உறுப்பினர்கள்",
    admin_dashboard_stat_pending: "நிலுவையில் உள்ள விண்ணப்பங்கள்",
    admin_dashboard_stat_pending_sub: "நிர்வாக மதிப்பாய்வுக்காக காத்திருக்கிறது",
    admin_dashboard_stat_cohorts: "செயலில் உள்ள தொகுதிகள்",
    admin_dashboard_stat_cohorts_sub: "2005 - 2025 தொகுதிகள்",
    admin_dashboard_stat_turnout: "வருகை விகிதம்",
    admin_dashboard_stat_turnout_sub: "நிகழ்வு வருகை விகிதம்",

    // Hero upcoming event
    admin_dashboard_event_badge: "சிறப்பு மீள்சந்திப்பு",
    admin_dashboard_event_confirmed: "{attending} உறுதிசெய்யப்பட்டது ({guests} மொத்த விருந்தினர்கள்)",
    admin_dashboard_event_view_rsvp: "RSVP பட்டியலைப் பார்க்க",

    // Pending queue section
    admin_dashboard_queue_title: "நிலுவையில் உள்ள முன்னாள் மாணவர் சரிபார்ப்பு வரிசை",
    admin_dashboard_queue_subtitle: "பள்ளி நிர்வாகி சரிபார்ப்பு தேவைப்படும் சமீபத்திய விண்ணப்பங்கள்",
    admin_dashboard_queue_view_all: "அனைத்தையும் பார்க்க ({count})",
    admin_dashboard_queue_empty: "✓ மதிப்பாய்வு தேவைப்படும் நிலுவையில் உள்ள விண்ணப்பங்கள் எதுவும் இல்லை!",
    admin_dashboard_queue_meta: "தொகுதி {batch} • சேர்க்கை எண்: {adm} • {mobile}",

    // Pending queue row actions
    admin_dashboard_queue_view_details: "முழு விண்ணப்ப விவரங்களைப் பார்க்க",
    admin_dashboard_queue_approve: "அங்கீகரி",

    // Alumni detail modal
    admin_dashboard_detail_modal_title: "முன்னாள் மாணவர் பதிவு விண்ணப்ப விவரங்கள்",
    admin_dashboard_detail_batch_line: "தொகுதி {batch} {section} • சேர்க்கை எண்: {adm}",
    admin_dashboard_detail_section_suffix: "• பிரிவு {section}",
    admin_dashboard_detail_na: "இல்லை",
    admin_dashboard_detail_company_prefix: "{company} இல்",

    admin_dashboard_detail_section_contact: "தொடர்பு & தனிப்பட்ட விவரங்கள்",
    admin_dashboard_detail_section_academic: "கல்வி & பள்ளி பதிவுகள்",
    admin_dashboard_detail_section_professional: "தொழில் பின்னணி",

    admin_dashboard_detail_label_mobile: "மொபைல் எண்:",
    admin_dashboard_detail_label_email: "மின்னஞ்சல் முகவரி:",
    admin_dashboard_detail_label_gender: "பாலினம்:",
    admin_dashboard_detail_label_dob: "பிறந்த தேதி:",
    admin_dashboard_detail_label_blood: "இரத்தப் பிரிவு:",
    admin_dashboard_detail_label_city: "தற்போதைய நகரம் / இடம்:",
    admin_dashboard_detail_label_address: "குடியிருப்பு முகவரி:",
    admin_dashboard_detail_label_passing_year: "தேர்ச்சி ஆண்டு (தொகுதி):",
    admin_dashboard_detail_label_admission_no: "சேர்க்கை எண்:",
    admin_dashboard_detail_label_higher_ed: "உயர்கல்வி / பட்டம்:",
    admin_dashboard_detail_label_college: "கல்லூரி / நிறுவனம்:",
    admin_dashboard_detail_label_profession: "தொழில்:",
    admin_dashboard_detail_label_company: "நிறுவனம் / வேலை வழங்குநர்:",
    admin_dashboard_detail_label_designation: "பதவி:",
    admin_dashboard_detail_label_linkedin: "LinkedIn:",
    admin_dashboard_detail_profile_link: "சுயவிவர இணைப்பு",
    admin_dashboard_detail_class_of: "{year} ஆம் ஆண்டு வகுப்பு",

    admin_dashboard_detail_close: "மூடு",
    admin_dashboard_detail_approve_btn: "விண்ணப்பத்தை அங்கீகரி",

    // Approve confirmation modal
    admin_dashboard_confirm_modal_title: "முன்னாள் மாணவர் அங்கீகாரத்தை உறுதிசெய்",
    admin_dashboard_confirm_heading: "{name} ஐ அங்கீகரிக்கவா?",
    admin_dashboard_confirm_body: "இந்த பதிவு விண்ணப்பத்தை அங்கீகரிக்க விரும்புகிறீர்களா?",
    admin_dashboard_confirm_meta: "தொகுதி {batch} • சேர்க்கை எண்: {adm}",
    admin_dashboard_confirm_note: "✓ இது அவர்களின் சரிபார்க்கப்பட்ட முன்னாள் மாணவர் சுயவிவரத்தை செயல்படுத்தி அங்கீகார அறிவிப்பை அனுப்பும்.",
    admin_dashboard_confirm_notes_label: "சரிபார்ப்பு குறிப்புகள் (விருப்பமானது)",
    admin_dashboard_confirm_notes_placeholder: "எ.கா. பள்ளியின் நிரந்தர பதிவு புத்தகத்திலிருந்து சரிபார்க்கப்பட்டது",
    admin_dashboard_confirm_cancel: "ரத்து செய்",
    admin_dashboard_confirm_approving: "அங்கீகரிக்கப்படுகிறது...",
    admin_dashboard_confirm_submit: "உறுதிசெய்து அங்கீகரி",

    // Alerts
    admin_dashboard_alert_approved_title: "முன்னாள் மாணவர் வெற்றிகரமாக அங்கீகரிக்கப்பட்டார்",
    admin_dashboard_alert_approved_body: "{name} அவர்களின் முன்னாள் மாணவர் பதிவு அங்கீகரிக்கப்பட்டு உறுதிப்படுத்தல் அறிவிப்பு அனுப்பப்பட்டது.",
    admin_dashboard_alert_approval_error: "அங்கீகாரம் தோல்வியடைந்தது.",
    admin_dashboard_approval_default_note: "டாஷ்போர்டிலிருந்து பள்ளி நிர்வாகியால் அங்கீகரிக்கப்பட்டது",

        // =====================================================================
    // SHARED HEADER & PAGE TITLES (school-admin) — NEW KEYS
    // =====================================================================
    // Header
    admin_header_subtitle: "பள்ளி முன்னாள் மாணவர் மேலாண்மை அமைப்பு",
    admin_header_role_chip: "பள்ளி நிர்வாகி",
    admin_header_search_placeholder: "முன்னாள் மாணவர், தொகுதி தேடுங்கள்...",
    admin_header_default_user_name: "பள்ளி நிர்வாகி",
    admin_header_default_user_role: "நிர்வாகி",
    admin_header_avatar_alt: "அவதார்",

    // Page titles (used by SchoolAdminLayout.getPageTitle)
    admin_page_title_csv_import: "CSV முன்னாள் மாணவர் பட்டியல் இறக்குமதி",
    admin_page_title_alumni_directory: "முன்னாள் மாணவர் அடைவு & நிர்வாகம்",
    admin_page_title_verification: "சரிபார்ப்பு வரிசை",
    admin_page_title_batches: "தொகுதிகள் & குழுக்கள்",
    admin_page_title_create_event: "மீள்சந்திப்பு நிகழ்வை உருவாக்கு",
    admin_page_title_school_events: "பள்ளி நிகழ்வுகள் & கொண்டாட்டங்கள்",
    admin_page_title_events: "முன்னாள் மாணவர் நிகழ்வுகள் & சந்திப்புகள்",
    admin_page_title_announcements: "அறிவிப்புகள் ஊட்டம்",
    admin_page_title_memories: "நினைவுகள் & புகைப்பட மதிப்பாய்வு",
    admin_page_title_association: "சங்க தலைமைக் குழு",
    admin_page_title_rank_holders: "கல்வித் தரவரிசை சாதனையாளர்கள் & முதலிடம்",
    admin_page_title_reports: "அறிக்கைகள் & பகுப்பாய்வு",
    admin_page_title_settings: "பள்ளி அமைப்புகள்",
    admin_page_title_overview: "பள்ளி நிர்வாகி கண்ணோட்டம்",

        // =====================================================================
    // ALUMNI VERIFICATION QUEUE PAGE (school-admin) — NEW KEYS
    // =====================================================================
    admin_verify_page_title: "முன்னாள் மாணவர் சரிபார்ப்பு வரிசை",
    admin_verify_page_subtitle: "பள்ளி பதிவுகளுடன் நிலுவையில் உள்ள பதிவு விண்ணப்பங்களை மதிப்பாய்வு செய்யவும்",

    // Empty state
    admin_verify_empty_title: "சரிபார்ப்பு வரிசை காலியாக உள்ளது",
    admin_verify_empty_desc: "அனைத்து முன்னாள் மாணவர் பதிவு விண்ணப்பங்களும் சரிபார்க்கப்பட்டுள்ளன. சிறப்பான பணி!",

    // Card content
    admin_verify_batch_line: "தொகுதி {batch} (பிரிவு {section})",
    admin_verify_label_admission: "சேர்க்கை எண்:",
    admin_verify_label_mobile: "மொபைல்:",
    admin_verify_label_email: "மின்னஞ்சல்:",
    admin_verify_label_city: "நகரம்:",
    admin_verify_label_profession: "தொழில்:",

    // Card actions
    admin_verify_btn_approve: "அங்கீகரி",
    admin_verify_btn_reject: "நிராகரி",

    // Review modal
    admin_verify_modal_confirm_approval: "அங்கீகாரத்தை உறுதிசெய்",
    admin_verify_modal_confirm_rejection: "நிராகரிப்பை உறுதிசெய்",
    admin_verify_modal_applicant_line: "விண்ணப்பதாரர்: {name} (தொகுதி {batch})",
    admin_verify_modal_notes_label: "சரிபார்ப்பு குறிப்புகள்",
    admin_verify_modal_notes_placeholder: "காரணம் அல்லது சரிபார்ப்புக் குறிப்பு...",
    admin_verify_modal_cancel: "ரத்து செய்",
    admin_verify_modal_confirm_btn: "முடிவை உறுதிசெய்",

    // Default notes (prefilled)
    admin_verify_default_approve_note: "நிரந்தர பள்ளி பட்டியலுடன் சரிபார்க்கப்பட்டது",
    admin_verify_default_reject_note: "பள்ளி கோப்புகளுடன் பதிவுகளைப் பொருத்த முடியவில்லை",

    // Alerts
    admin_verify_alert_approved_title: "முன்னாள் மாணவர் அங்கீகரிக்கப்பட்டு சரிபார்ப்பு மின்னஞ்சல் அனுப்பப்பட்டது",
    admin_verify_alert_rejected_title: "விண்ணப்பம் நிராகரிக்கப்பட்டது",
    admin_verify_alert_approved_body: "{name} அவர்களின் முன்னாள் மாணவர் பதிவு அங்கீகரிக்கப்பட்டு அறிவிப்பு மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது.",
    admin_verify_alert_rejected_body: "{name} அவர்களின் முன்னாள் மாணவர் பதிவு வெற்றிகரமாக நிராகரிக்கப்பட்டது.",
    admin_verify_alert_error: "சரிபார்ப்பு முடிவைச் சமர்ப்பிக்க முடியவில்லை.",

        // =====================================================================
    // AUDIT & FINANCIAL STATEMENTS — Public + Admin + Alumni (Tamil)
    // =====================================================================
    nav_audit: "தணிக்கை",

    audit_page_title: "தணிக்கை & நிதி அறிக்கைகள்",
    audit_page_subtitle: "வெளிப்படைத்தன்மை நம்பிக்கையை உருவாக்குகிறது. எங்கள் ஆண்டு நிதி அறிக்கைகள், தணிக்கையாளர் அறிக்கைகள் மற்றும் பங்களிப்பு விவரங்களை ஆராயுங்கள்.",
    audit_statements_title: "தணிக்கை அறிக்கைகள்",
    audit_read_more: "மேலும் படிக்க",
    audit_back_to_audit: "தணிக்கைக்குத் திரும்பு",
    audit_view_pdf: "PDF பார்க்க",
    audit_download_pdf: "PDF பதிவிறக்கம்",
    audit_details_title: "தணிக்கை விவரங்கள்",
    audit_label_title: "தலைப்பு",
    audit_label_period: "காலம்",
    audit_label_posted_on: "வெளியிடப்பட்டது",
    audit_label_file_name: "கோப்பு பெயர்",
    audit_label_file_size: "கோப்பு அளவு",
    audit_no_statements: "இன்னும் தணிக்கை அறிக்கைகள் வெளியிடப்படவில்லை.",
    audit_no_statements_desc: "பின்னர் மீண்டும் பார்க்கவும் — நடப்பு நிதியாண்டிற்கான தணிக்கை அறிக்கைகள் வெளியிடப்பட்டவுடன் இங்கே தோன்றும்.",
    audit_loading_pdf: "PDF ஆவணம் ஏற்றப்படுகிறது...",
    audit_pdf_unavailable: "இந்த அறிக்கைக்கான PDF ஆவணம் கிடைக்கவில்லை.",
    audit_open_in_new_tab: "புதிய தாவலில் திற",

    audit_why_title: "தணிக்கை அறிக்கைகளை ஏன் வெளியிடுகிறோம்?",
    audit_why_body: "எங்கள் முன்னாள் மாணவர் சங்கம் அனைத்து நிதி நடவடிக்கைகளிலும் முழுமையான வெளிப்படைத்தன்மைக்கு உறுதிபூண்டுள்ளது. தணிக்கை அறிக்கைகள் வருமானம், செலவு மற்றும் பங்களிப்புகளின் பயன்பாட்டைப் பற்றிய தெளிவான பார்வையை வழங்குகின்றன.",
    audit_why_check_1: "முன்னாள் மாணவர் சமூகத்திற்கு பொறுப்புணர்வு",
    audit_why_check_2: "நிதியின் சரியான பயன்பாடு",
    audit_why_check_3: "நீண்டகால நம்பிக்கையை உருவாக்குதல்",
    audit_why_check_4: "வலுவான முன்னாள் மாணவர் வலையமைப்பை ஆதரித்தல்",

    audit_accountability_quote: "\u201Cஇன்று பொறுப்புணர்வு, நாளை வலுவான எதிர்காலம்\u201D",
    audit_accountability_author: "NHS முன்னாள் மாணவர் சங்கம்",

    audit_top_contributors_title: "சிறந்த பங்களிப்பாளர்கள்",
    audit_top_contributors_view_all: "அனைத்தையும் காண்க",
    audit_top_contributors_empty: "இந்த நிதியாண்டிற்கு இன்னும் பொது பங்களிப்புகள் பதிவு செய்யப்படவில்லை.",
    audit_col_sno: "#",
    audit_col_name: "பெயர்",
    audit_col_batch: "தொகுதி",
    audit_col_amount: "பங்களிப்புத் தொகை (\u20B9)",
    audit_col_date: "பங்களிப்பு தேதி",

    audit_sponsors_title: "எங்கள் நல்கையாளர்கள்",
    audit_sponsors_empty: "இந்த நிதியாண்டிற்கு இன்னும் நல்கையாளர்கள் பட்டியலிடப்படவில்லை.",
    audit_sponsors_visit: "இணையதளத்தைப் பார்க்க",
    audit_sponsors_col_serial: "வ.எண்",
    audit_sponsors_col_date: "நல்கையாளர் தேதி",
    audit_sponsors_col_name: "நல்கையாளர் பெயர்",
    audit_sponsors_col_sponsored_items: "வழங்கப்பட்ட பொருட்கள்",
    audit_sponsors_col_budget: "பட்ஜெட்",
    audit_sponsors_col_action: "செயல்",
    audit_sponsors_view_more: "மேலும் காண்க",
    audit_sponsors_detail_title: "நல்கையாளர் விவரங்கள்",
    audit_sponsors_detail_date: "நல்கையாளர் தேதி",
    audit_sponsors_detail_financial_year: "நிதியாண்டு",
    audit_sponsors_detail_amount: "தொகை",
    audit_sponsors_detail_item: "வழங்கப்பட்ட பொருள் / பங்களிப்பு",
    audit_sponsors_detail_description: "விவரம்",

    // Admin — Audit Manager (Tamil)
    admin_financial_management: "நிதி மேலாண்மை",
    admin_audit_page_title: "தணிக்கை & நிதி அறிக்கைகள்",
    admin_audit_page_subtitle: "ஆண்டு தணிக்கை அறிக்கைகள் மற்றும் அவற்றின் PDF இணைப்புகளை வெளியிடவும், புதுப்பிக்கவும், நிர்வகிக்கவும்.",
    admin_audit_btn_add: "தணிக்கை அறிக்கையைச் சேர்",
    admin_audit_empty_title: "இன்னும் தணிக்கை அறிக்கைகள் இல்லை",
    admin_audit_empty_desc: "பொது தணிக்கைப் பக்கத்தில் கிடைக்க முதல் தணிக்கை அறிக்கையை உருவாக்கவும்.",
    admin_audit_col_title: "தலைப்பு / நிதியாண்டு",
    admin_audit_col_period: "காலம்",
    admin_audit_col_posted: "வெளியிடப்பட்டது",
    admin_audit_col_status: "நிலை",
    admin_audit_col_order: "வரிசை",
    admin_audit_col_actions: "செயல்கள்",
    admin_audit_badge_published: "வெளியிடப்பட்டது",
    admin_audit_badge_draft: "வெளியிடப்படவில்லை",
    admin_audit_modal_title_create: "தணிக்கை அறிக்கையைச் சேர்",
    admin_audit_modal_title_edit: "தணிக்கை அறிக்கையைத் திருத்து",
    admin_audit_form_title_en: "தலைப்பு (ஆங்கிலம்) *",
    admin_audit_form_title_ta: "தலைப்பு (தமிழ்)",
    admin_audit_form_desc_en: "விவரம் (ஆங்கிலம்)",
    admin_audit_form_desc_ta: "விவரம் (தமிழ்)",
    admin_audit_form_fy: "நிதியாண்டு *",
    admin_audit_form_fy_placeholder: "எ.கா. 2025 - 2026",
    admin_audit_form_period_start: "கால தொடக்கம் *",
    admin_audit_form_period_start_placeholder: "01.04.2025",
    admin_audit_form_period_end: "கால முடிவு *",
    admin_audit_form_period_end_placeholder: "31.03.2026",
    admin_audit_form_posted_date: "வெளியிடப்பட்ட தேதி லேபிள்",
    admin_audit_form_posted_date_placeholder: "14 மே, 2026",
    admin_audit_form_order: "காட்சி வரிசை",
    admin_audit_form_published: "பொது தணிக்கைப் பக்கத்தில் வெளியிடு",
    admin_audit_form_pdf: "தணிக்கை PDF ஆவணம் *",
    admin_audit_pdf_attached: "PDF இணைக்கப்பட்டுள்ளது",
    admin_audit_pdf_not_attached: "இன்னும் PDF பதிவேற்றப்படவில்லை",
    admin_audit_pdf_upload: "PDF பதிவேற்று",
    admin_audit_pdf_replace: "PDF மாற்று",
    admin_audit_pdf_uploading: "PDF பதிவேற்றப்படுகிறது...",
    admin_audit_pdf_only: "PDF கோப்புகள் மட்டுமே ஏற்றுக்கொள்ளப்படும் (அதிகபட்சம் 30MB).",
    admin_audit_alert_missing_title: "ஆங்கிலத் தலைப்பை உள்ளிடவும்.",
    admin_audit_alert_missing_fy: "நிதியாண்டை உள்ளிடவும் (எ.கா. 2025 - 2026).",
    admin_audit_alert_missing_period: "தணிக்கைக் காலத்தின் தொடக்க மற்றும் முடிவு தேதிகளை உள்ளிடவும்.",
    admin_audit_alert_missing_pdf: "சேமிப்பதற்கு முன் தணிக்கை PDF ஐ பதிவேற்றவும்.",
    admin_audit_alert_saved_title: "தணிக்கை அறிக்கை சேமிக்கப்பட்டது",
    admin_audit_alert_saved_body: "தணிக்கை அறிக்கை வெற்றிகரமாக சேமிக்கப்பட்டது.",
    admin_audit_alert_deleted_title: "தணிக்கை அறிக்கை நீக்கப்பட்டது",
    admin_audit_alert_deleted_body: "தணிக்கை அறிக்கை நீக்கப்பட்டது.",
    admin_audit_confirm_delete: "இந்த தணிக்கை அறிக்கையை நீக்க விரும்புகிறீர்களா? இதை மீட்டெடுக்க முடியாது.",

    // Admin — Contribution Manager (Tamil)
    admin_contributions_page_title: "பங்களிப்புகள்",
    admin_contributions_page_subtitle: "முன்னாள் மாணவர் பங்களிப்புகளை மதிப்பாய்வு செய்யவும், சரிபார்க்கவும், நிர்வகிக்கவும். சிறந்த பங்களிப்பாளர்கள் பட்டியலுக்கான பொது தெரிவுநிலையைக் கட்டுப்படுத்தவும்.",
    admin_contributions_stat_total: "மொத்தம் சேகரிக்கப்பட்டது",
    admin_contributions_stat_count: "மொத்த பங்களிப்புகள்",
    admin_contributions_stat_completed: "நிறைவடைந்தது",
    admin_contributions_stat_pending: "நிலுவையில்",
    admin_contributions_filter_all_status: "அனைத்து நிலைகள்",
    admin_contributions_filter_all_fy: "அனைத்து நிதியாண்டுகள்",
    admin_contributions_search_placeholder: "பங்களிப்பாளர், குறிப்பு, நோக்கம் மூலம் தேடுங்கள்...",
    admin_contributions_col_contributor: "பங்களிப்பாளர்",
    admin_contributions_col_batch: "தொகுதி",
    admin_contributions_col_amount: "தொகை (\u20B9)",
    admin_contributions_col_date: "தேதி",
    admin_contributions_col_fy: "நிதியாண்டு",
    admin_contributions_col_purpose: "நோக்கம்",
    admin_contributions_col_status: "நிலை",
    admin_contributions_col_visibility: "பொது",
    admin_contributions_col_actions: "செயல்கள்",
    admin_contributions_badge_visible: "தெரியும்",
    admin_contributions_badge_hidden: "மறைக்கப்பட்டது",
    admin_contributions_action_approve: "நிறைவு எனக் குறி",
    admin_contributions_action_reject: "நிராகரி",
    admin_contributions_action_edit: "திருத்து",
    admin_contributions_action_delete: "நீக்கு",
    admin_contributions_action_toggle_visibility: "பொது தெரிவுநிலையை மாற்று",
    admin_contributions_empty_title: "பங்களிப்புகள் எதுவும் கிடைக்கவில்லை",
    admin_contributions_empty_desc: "தற்போதைய வடிகட்டிகளுக்கு எந்த முன்னாள் மாணவர் பங்களிப்புகளும் பொருந்தவில்லை.",
    admin_contributions_modal_title: "பங்களிப்பைத் திருத்து",
    admin_contributions_form_amount: "தொகை (\u20B9)",
    admin_contributions_form_purpose: "நோக்கம்",
    admin_contributions_form_status: "நிலை",
    admin_contributions_form_date: "பங்களிப்பு தேதி",
    admin_contributions_form_fy: "நிதியாண்டு",
    admin_contributions_form_reference: "கட்டணக் குறிப்பு",
    admin_contributions_form_admin_remarks: "நிர்வாகக் குறிப்புகள்",
    admin_contributions_form_public: "பொது சிறந்த பங்களிப்பாளர் பட்டியலில் என் பெயரைக் காட்டு",
    admin_contributions_alert_updated_title: "பங்களிப்பு புதுப்பிக்கப்பட்டது",
    admin_contributions_alert_updated_body: "பங்களிப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது.",
    admin_contributions_alert_deleted_title: "பங்களிப்பு நீக்கப்பட்டது",
    admin_contributions_alert_deleted_body: "பங்களிப்பு பதிவு நீக்கப்பட்டது.",
    admin_contributions_confirm_delete: "இந்த பங்களிப்பு பதிவை நீக்க விரும்புகிறீர்களா?",

    // Admin — Sponsor Manager (Tamil)
    admin_sponsors_page_title: "நல்கையாளர்கள்",
    admin_sponsors_page_subtitle: "நல்கையாளர்கள் மற்றும் அவர்களின் லோகோக்களை நிர்வகிக்கவும். பொது தணிக்கை விவரப் பக்கத்தில் நிதியாண்டு வாரியாக குழுவாகத் தோன்றும்.",
    admin_sponsors_btn_add: "நல்கையாளரைச் சேர்",
    admin_sponsors_filter_fy_label: "நிதியாண்டு:",
    admin_sponsors_col_logo: "லோகோ",
    admin_sponsors_col_name: "நல்கையாளர் பெயர்",
    admin_sponsors_col_fy: "நிதியாண்டு",
    admin_sponsors_col_published: "வெளியிடப்பட்டது",
    admin_sponsors_col_actions: "செயல்கள்",
    admin_sponsors_badge_published: "வெளியிடப்பட்டது",
    admin_sponsors_badge_draft: "வரைவு",
    admin_sponsors_empty_title: "இன்னும் நல்கையாளர்கள் இல்லை",
    admin_sponsors_empty_desc: "பொது தணிக்கை விவரப் பக்கத்தில் தோன்ற உங்கள் முதல் நல்கையாளரைச் சேர்க்கவும்.",
    admin_sponsors_modal_title_create: "நல்கையாளரைச் சேர்",
    admin_sponsors_modal_title_edit: "நல்கையாளரைத் திருத்து",
    admin_sponsors_form_name: "நல்கையாளர் பெயர் *",
    admin_sponsors_form_name_ta: "நல்கையாளர் பெயர் (தமிழ்)",
    admin_sponsors_form_logo: "நல்கையாளர் லோகோ",
    admin_sponsors_form_website: "இணையதள URL",
    admin_sponsors_form_description: "விவரம்",
    admin_sponsors_form_description_ta: "விவரம் (தமிழ்)",
    admin_sponsors_form_fy: "நிதியாண்டு *",
    admin_sponsors_form_amount: "பட்ஜெட் / தொகை",
    admin_sponsors_form_sponsored_item: "வழங்கப்பட்ட பொருள் / பங்களிப்பு",
    admin_sponsors_form_published: "பொது தணிக்கை விவரப் பக்கத்தில் வெளியிடு",
    admin_sponsors_alert_saved_title: "நல்கையாளர் சேமிக்கப்பட்டார்",
    admin_sponsors_alert_saved_body: "நல்கையாளர் வெற்றிகரமாக சேமிக்கப்பட்டார்.",
    admin_sponsors_alert_deleted_title: "நல்கையாளர் நீக்கப்பட்டார்",
    admin_sponsors_alert_deleted_body: "நல்கையாளர் நீக்கப்பட்டார்.",
    admin_sponsors_confirm_delete: "இந்த நல்கையாளரை நீக்க விரும்புகிறீர்களா?",
    admin_sponsors_alert_missing_name: "நல்கையாளர் பெயரை உள்ளிடவும்.",
    admin_sponsors_alert_missing_fy: "நிதியாண்டை உள்ளிடவும்.",

    // =====================================================================
    // Alumni — Support School / Contributions (Tamil)
    // =====================================================================
    alumni_section_support: "பள்ளிக்கு ஆதரவு",
    alumni_nav_support_school: "பள்ளிக்கு ஆதரவு",
    alumni_nav_contribute: "பங்களிக்க",
    alumni_nav_my_contributions: "என் பங்களிப்புகள்",

    alumni_support_page_title: "எங்கள் பள்ளிக்கு ஆதரவு",
    alumni_support_page_subtitle: "உங்கள் பங்களிப்புகள் உதவித்தொகைகள், உள்கட்டமைப்பு மற்றும் மாணவர் நலத்திட்டங்களுக்கு நேரடியாக நிதியளிக்கின்றன.",

    // NEW — 3 main section headers
    alumni_support_section_my_activities: "என் செயல்பாடுகள்",
    alumni_support_section_contribution: "நன்கொடை",
    alumni_support_section_sponsors: "ஆதரவாளர்கள்",
    alumni_support_my_activities_subtitle: "நீங்கள் அளித்த நன்கொடை மற்றும் ஆதரவின் சுருக்கம்.",
    alumni_support_activity_total: "மொத்தம்",
    alumni_support_activity_latest: "சமீபத்திய",

    alumni_support_cta_contribute: "பங்களிப்பு செய்யுங்கள்",
    alumni_support_cta_history: "என் பங்களிப்புகளைப் பார்க்க",
    alumni_support_cta_sponsors: "நல்கையாளர்கள்",
    alumni_support_cta_my_sponsors: "எனது நல்கையாளர்கள்",

    // NEW — Contribution CTA
    alumni_support_cta_make_contribution: "நன்கொடை அளிக்க",
    alumni_support_make_contribution_subtitle: "உங்கள் நன்கொடையின் மூலம் NHS பள்ளிக்கு ஆதரவளியுங்கள்.",
    alumni_my_contributions_title: "என் பங்களிப்புகள்",

    // NEW — Sponsor CTA
    alumni_support_cta_make_sponsor: "ஆதரவு அளிக்க",
    alumni_support_make_sponsor_subtitle: "மாணவர், பள்ளி நடவடிக்கை அல்லது தேவையை ஆதரவு மூலம் ஆதரவளியுங்கள்.",

    alumni_support_info_title: "உங்கள் பங்களிப்பு எங்கே செல்கிறது",
    alumni_support_info_scholarship: "மாணவர் உதவித்தொகைகள்",
    alumni_support_info_scholarship_desc: "பின்தங்கிய பின்னணியில் இருந்து தகுதியான மாணவர்களை ஆதரித்தல்.",
    alumni_support_info_infrastructure: "பள்ளி உள்கட்டமைப்பு",
    alumni_support_info_infrastructure_desc: "வகுப்பறைகள், நூலகம், ஆய்வக உபகரணங்கள் மற்றும் வளாக வசதிகள்.",
    alumni_support_info_event: "நிகழ்வுகள் & திட்டங்கள்",
    alumni_support_info_event_desc: "முன்னாள் மாணவர் மறுசந்திப்புகள், வழிகாட்டுதல் திட்டங்கள் மற்றும் மாணவர் செயல்பாடுகள்.",
    alumni_support_info_general: "பொது நிதி",
    alumni_support_info_general_desc: "பள்ளிக்கு எங்கு மிகவும் தேவையோ அங்கு.",

    alumni_contribute_title: "பங்களிப்பு செய்யுங்கள்",
    alumni_contribute_subtitle: "கீழே உள்ள விவரங்களை நிரப்பவும். உங்கள் பங்களிப்பு பள்ளி நிர்வாகியால் மதிப்பாய்வு செய்யப்பட்டு உறுதிப்படுத்தப்படும்.",
    alumni_contribute_form_amount: "தொகை (\u20B9) *",
    alumni_contribute_form_amount_placeholder: "எ.கா. 5000",
    alumni_contribute_form_purpose: "நோக்கம்",
    alumni_contribute_form_purpose_note: "நோக்கக் குறிப்பு (விருப்பமானது)",
    alumni_contribute_form_date: "பங்களிப்பு தேதி",
    alumni_contribute_form_payment_method: "கட்டண முறை",
    alumni_contribute_form_reference: "கட்டணக் குறிப்பு / பரிவர்த்தனை ID",
    alumni_contribute_form_proof: "கட்டண ஆதாரம் (விருப்பமானது)",
    alumni_contribute_form_remarks: "குறிப்புகள் (விருப்பமானது)",
    alumni_contribute_form_public: "பொது சிறந்த பங்களிப்பாளர் பட்டியலில் என் பெயரைக் காட்டு",
    alumni_contribute_submit: "பங்களிப்பைச் சமர்ப்பி",
    alumni_contribute_submitting: "சமர்ப்பிக்கப்படுகிறது...",
    alumni_contribute_success_title: "பங்களிப்பு சமர்ப்பிக்கப்பட்டது",
    alumni_contribute_success_body: "உங்கள் ஆதரவுக்கு நன்றி! உங்கள் பங்களிப்பு இப்போது நிர்வாக சரிபார்ப்புக்காக காத்திருக்கிறது.",

    alumni_contributions_title: "என் பங்களிப்புகள்",
    alumni_contributions_subtitle: "பள்ளிக்கு நீங்கள் செய்த பங்களிப்புகளின் முழுமையான வரலாறு.",
    alumni_contributions_total_label: "மொத்த பங்களிப்பு",
    alumni_contributions_empty_title: "இன்னும் பங்களிப்புகள் இல்லை",
    alumni_contributions_empty_desc: "நீங்கள் இன்னும் எந்தப் பங்களிப்பையும் செய்யவில்லை. இன்று உங்கள் பள்ளிக்கு ஆதரவளியுங்கள்!",
    alumni_contributions_col_date: "தேதி",
    alumni_contributions_col_amount: "தொகை (\u20B9)",
    alumni_contributions_col_purpose: "நோக்கம்",
    alumni_contributions_col_fy: "நிதியாண்டு",
    alumni_contributions_col_status: "நிலை",
    alumni_contributions_status_pending: "சரிபார்ப்பு நிலுவையில்",
    alumni_contributions_status_completed: "நிறைவு",
    alumni_contributions_status_rejected: "நிராகரிக்கப்பட்டது",
    alumni_sponsors_title: "இதர முன்னாள் மாணவர் நிதியுதவிகள்",
    alumni_sponsors_subtitle: "எங்கள் பள்ளியை ஆதரிக்கும் வெளியிடப்பட்ட நல்கைகள்.",
    alumni_sponsors_add: "நல்கையாளரைச் சேர்",
    alumni_sponsors_edit: "நல்கையாளரைத் திருத்து",
    alumni_sponsors_name: "நல்கையாளர் பெயர் *",
    alumni_sponsors_name_ta: "நல்கையாளர் பெயர் (தமிழ்)",
    alumni_sponsors_financial_year: "நிதியாண்டு *",
    alumni_sponsors_amount: "நல்கைத் தொகை",
    alumni_sponsors_item: "வழங்கப்பட்ட பொருள் / பங்களிப்பு",
    alumni_sponsors_description: "நல்கையாளர் விவரம்",
    alumni_sponsors_description_ta: "நல்கையாளர் விவரம் (தமிழ்)",
    alumni_sponsors_website: "இணையதளம்",
    alumni_sponsors_upload_logo: "புகைப்படத்தைப் பதிவேற்றவும்",
    alumni_sponsors_uploading: "பதிவேற்றுகிறது...",
    alumni_sponsors_submit: "நல்கையாளரைச் சமர்ப்பி",
    alumni_sponsors_cancel: "ரத்து",
    alumni_sponsors_pending: "ஒப்புதலுக்காக காத்திருக்கிறது",
    alumni_sponsors_published: "வெளியிடப்பட்டது",
    alumni_sponsors_empty: "இந்த நிதியாண்டிற்கு வெளியிடப்பட்ட நல்கையாளர்கள் இல்லை.",
    alumni_my_sponsors_title: "எனது நிதியுதவிகள்",
    alumni_my_sponsors_subtitle: "உங்கள் கணக்கிலிருந்து சமர்ப்பிக்கப்பட்ட நல்கைகள்.",
    alumni_my_sponsors_empty: "நீங்கள் இன்னும் எந்த நல்கையையும் சமர்ப்பிக்கவில்லை.",
    alumni_sponsors_missing_title: "விவரங்கள் இல்லை",
    alumni_sponsors_missing_body: "நல்கையாளர் பெயர் மற்றும் நிதியாண்டை உள்ளிடவும்.",
    alumni_sponsors_saved_title: "நல்கையாளர் சமர்ப்பிக்கப்பட்டார்",
    alumni_sponsors_saved_body: "உங்கள் நல்கையாளர் நிர்வாக மதிப்பாய்வுக்காக சமர்ப்பிக்கப்பட்டது.",
    alumni_sponsors_save_error: "நல்கையாளரைச் சேமிக்க முடியவில்லை.",
    alumni_sponsors_delete_confirm: "இந்த நல்கையை நீக்கவா?",
    alumni_sponsors_delete_error: "நல்கையாளரை நீக்க முடியவில்லை.",
    alumni_sponsors_upload_error: "நல்கையாளர் லோகோவைப் பதிவேற்ற முடியவில்லை.",

    // Purpose labels
    contribution_purpose_general: "பொது நிதி",
    contribution_purpose_scholarship: "உதவித்தொகைகள்",
    contribution_purpose_infrastructure: "உள்கட்டமைப்பு",
    contribution_purpose_event: "நிகழ்வுகள் & திட்டங்கள்",
    contribution_purpose_other: "மற்றவை",
  }
};