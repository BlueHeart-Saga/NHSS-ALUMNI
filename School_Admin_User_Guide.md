# SCHOOL + ALUMNI MANAGEMENT PORTAL
## SCHOOL ADMIN USER GUIDE
### Complete Module & Data Entry Reference

**Intended User:** School Admin  
**Version:** 1.0  

**Purpose of this Guide:**
This guide outlines the complete, field-by-field data entry requirements for managing your School and Alumni network. It explains exactly what information the School Admin needs to prepare and enter into the system for every module, what fields are mandatory, and what the dependencies are. 

---

## 12 SCHOOL ADMIN MODULES OVERVIEW

1. **Dashboard:** High-level metrics, insights, and filters for system engagement.
2. **Verification Queue:** Moderation area to approve or reject newly registered alumni.
3. **Alumni Directory:** Master database of all registered and verified alumni profiles.
4. **Batches & Committees:** Groups alumni by graduating year and allows assignment of batch leaders.
5. **Events Management:** Tools to create and manage alumni-focused gatherings (Reunions, Networking).
6. **School Celebrations:** Tools to create and manage public school events (Sports Day, Annual Day).
7. **Announcements:** Broadcast system for publishing news and urgent updates to the alumni feed.
8. **Memories Moderation:** Moderation area for photos and stories uploaded by alumni.
9. **Association Team:** Manages the official Alumni Association core committee (President, Secretary, etc.).
10. **Rank Holders:** Hall of Fame to showcase top academic achievers (10th/12th standard).
11. **Reports & Analytics:** Dashboard for generating and exporting specific data reports.
12. **School Settings:** Core tenant configuration, including branding, staff, and platform feature toggles.

---

## REQUIRED VS OPTIONAL FIELD SUMMARY

- **Required Fields:** Must be provided before submitting a form. These are essential for system logic (e.g., *Passing Year* groups alumni into batches; *Event Date* triggers calendar features).
- **Optional Fields:** Enhances the profile or feature but is not strictly necessary for creation (e.g., *Current City*, *Cover Image*).

---

## VALIDATION & RULES

- **Images:** All uploaded images (Logos, Banners, Profile Photos, Memories) should be under 5MB and formatted as JPG, PNG, or WebP.
- **Dates/Times:** Standard format handling. End dates/times must occur after start dates/times.
- **Emails/Phones:** Must follow standard formatting (e.g., containing an '@' and domain).

---

## MODULE DEPENDENCIES

- **Alumni Directory:** Is the central dependency. You cannot assign a *Batch Coordinator*, add an *Association Team Member*, or *Check-in an attendee* unless their profile exists and is approved in the Alumni Directory.
- **Batches:** *Announcements* can be filtered by Batches. A Batch must exist for alumni to be grouped.

---

## FIELD-BY-FIELD DATASET
*(For the exact CSV format of this table, please refer to the generated `school_admin_manual_guide.csv` file).*

| Module | Section | Field Name | Required / Optional | Field Type | What Admin Needs to Enter | Example | Validation / Rules | Depends On | Visibility | After Save / Result | Admin Notes | Confirmation Needed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dashboard | Filters | Date Range | Optional | Dropdown | Select time range | "Last 30 Days" | None | None | Admin Only | Updates graphs | Useful for tracking recent activity | No |
| Verification Queue | Action | Verification Notes | Optional | Text Area | Reason for rejection | "Invalid admission number" | None | None | Admin Only | Saves to profile audit | Helps track moderation decisions | No |
| Verification Queue | Action | Action | Required | Button | Approve or Reject | "Approve" | None | None | Admin Only | Notifies alumni via email | - | Yes |
| Alumni Directory | Profile | Full Name | Required | Text | Legal name | "Arun Kumar" | None | None | Public/Alumni | Profile is updated | - | No |
| Alumni Directory | Profile | Email Address | Required | Email | Valid email | "arun@example.com" | Must be unique | None | Alumni (If public) | Used for login | - | Yes |
| Alumni Directory | Profile | Mobile | Optional | Text | Phone number | "+91 9876543210" | Numeric | None | Admin Only | - | - | No |
| Alumni Directory | Profile | Passing Year | Required | Dropdown | Graduating year | "2015" | 4-digit year | Batches | Public/Alumni | Groups user into batch | - | No |
| Alumni Directory | Profile | Admission Number | Required | Text | School Roll Number | "ADM-104" | None | None | Admin Only | - | Crucial for verification | No |
| Alumni Directory | Profile | Section | Optional | Text | Class section | "A" | None | None | Public/Alumni | - | - | No |
| Alumni Directory | Profile | Current City | Optional | Text | Residing city | "Chennai" | None | None | Public/Alumni | - | - | No |
| Alumni Directory | Profile | Profession | Optional | Text | Job title | "Software Engineer" | None | None | Public/Alumni | - | - | No |
| Alumni Directory | Profile | Profile Photo | Optional | Upload | Headshot | "photo.jpg" | Max 5MB | None | Public/Alumni | Shows on ID card | - | No |
| Alumni Directory | Settings | Email Visibility | Optional | Toggle | Show/Hide email | "ON" | Boolean | None | Public/Alumni | Controls privacy | - | No |
| Batches & Committees | Detail | Batch Year | Required | Text | Graduating class year | "2010" | 4-digit year | None | Public/Alumni | Creates batch group | - | No |
| Batches & Committees | Detail | Coordinator | Optional | Dropdown | Lead for the batch | "Arun Kumar" | Must be verified | Alumni | Public/Alumni | Grants batch permissions | - | Yes |
| Batches & Committees | Committee | Select Alumni | Required | Dropdown | Committee member | "Sara Thomas" | Must be verified | Alumni | Public/Alumni | - | - | No |
| Batches & Committees | Committee | Role | Required | Dropdown | Role (e.g. President) | "President" | Predefined limits | None | Public/Alumni | Shows on Batch page | Enforces quotas | No |
| Events Management | Detail | Title | Required | Text | Event name | "Class of 2010 Reunion" | None | None | Public/Alumni | Event page created | - | No |
| Events Management | Detail | Date | Required | Date | Date of event | "2026-12-15" | Future date | None | Public/Alumni | Shown on calendar | - | No |
| Events Management | Detail | Start/End Time | Required | Time | Event timing | "10:00 AM" | End > Start | None | Public/Alumni | - | - | No |
| Events Management | Detail | Venue & Address | Required | Text | Physical location | "School Auditorium" | None | None | Public/Alumni | - | - | No |
| Events Management | Detail | Guest Allowed | Optional | Toggle | Can bring family? | "ON" | Boolean | None | Public/Alumni | Modifies RSVP form | - | Yes |
| Events Management | Detail | Max Capacity | Optional | Number | Limit attendees | "500" | Numeric > 0 | None | Public/Alumni | Closes RSVP if full | - | No |
| Events Management | Detail | Registration URL | Optional | URL | External ticket link | "https://ticketing..." | Valid URL | None | Public/Alumni | Replaces native RSVP | - | No |
| Events Management | Detail | Status | Required | Dropdown | Event state | "PUBLISHED" | Draft/Published | None | Public/Alumni | Controls visibility | - | Yes |
| School Celebrations | Detail | Title | Required | Text | Name of celebration | "Annual Sports Day" | None | None | Public | Public page created | - | No |
| School Celebrations | Detail | Category | Required | Dropdown | Event type | "Sports Day" | Predefined | None | Public | - | - | No |
| School Celebrations | Detail | Chief Guest | Optional | Text | Special invitee | "Mr. Rahman" | None | None | Public | - | - | No |
| School Celebrations | Detail | Target Audience | Optional | Text | Who can attend | "All Alumni" | None | None | Public | - | - | No |
| Announcements | Content | Title | Required | Text | Announcement title | "Mentorship Call" | None | None | Public/Alumni | Sent to feed | - | No |
| Announcements | Content | Message | Required | Text | Full details | "We need mentors..." | None | None | Public/Alumni | - | - | No |
| Announcements | Targeting | Priority | Optional | Dropdown | Urgency level | "High" | None | None | Public/Alumni | High sends push alert | - | Yes |
| Announcements | Targeting | Expiry Date | Optional | Date | When to hide it | "2026-12-31" | Future date | None | Admin System | Hides from feed | - | No |
| Announcements | Targeting | Target Batch | Optional | Dropdown | Limit visibility | "2010" | None | Batches | Targeted Alumni | Only visible to batch | - | No |
| Memories Moderation | Action | Moderation | Required | Button | Approve/Reject media | "Approve" | None | None | Public/Alumni | Approved goes to wall | - | No |
| Association Team | Detail | Member Type | Required | Dropdown | Alumni vs External | "Alumni" | None | None | Public | - | - | No |
| Association Team | Detail | Alumni Name | Required | Dropdown | Name of member | "John Doe" | Required if Alumni | Alumni | Public | Auto-fills data | - | No |
| Association Team | Detail | Position | Required | Text | Association Role | "President" | None | None | Public | - | - | No |
| Association Team | Detail | Display Order | Required | Number | Page sorting | "1" | Numeric | None | Public | Sorts page layout | - | No |
| Rank Holders | Detail | English Name | Required | Text | Achiever name | "Arun Kumar" | None | None | Public | Adds to Hall of Fame | - | No |
| Rank Holders | Detail | Tamil Name | Optional | Text | Name in Tamil | "அருண் குமார்" | None | None | Public | Shows under English | - | No |
| Rank Holders | Detail | Academic Year | Required | Dropdown | Year of exam | "2025-26" | None | None | Public | - | - | No |
| Rank Holders | Detail | Class Standard | Required | Dropdown | 10th or 12th | "10th" | None | None | Public | - | - | No |
| Rank Holders | Detail | Rank/Achievement| Required | Text | What they won | "School First" | None | None | Public | - | - | No |
| Rank Holders | Detail | Marks / Percentage| Optional | Text | Score details | "485" | None | None | Public | - | - | No |
| School Settings | Identity | School Name | Required | Text | Official name | "St. Jude's High" | None | None | Public | Rebrands portal | - | Yes |
| School Settings | Contact | Email / Phone | Required | Text | Official contact | "admin@school.com" | Valid formatting | None | Public | Used for support | - | Yes |
| School Settings | Brand | Logo / Cover | Optional | Upload | Portal graphics | "logo.png" | Max 5MB | None | Public | Rebrands portal | - | No |
| School Settings | Features | Manual Approval | Optional | Toggle | Moderate signups | "ON" | None | None | Admin System | Forces approval queue | - | Yes |
| School Settings | Staff | Name & Role | Required | Text | Internal staff | "Jane Doe - Principal" | None | None | Admin/Public | Displays in directory | - | No |


---

## MODULE-WISE ADMIN INSTRUCTIONS

- **Alumni Directory:** Keep this clean. If an alumni changes their email, ensure it is updated here.
- **Verification Queue:** Check the *Admission Number* against your physical school records before hitting Approve. 
- **Batches:** Create batches sequentially (e.g. 2010, 2011) and assign active coordinators to delegate event management.
- **Events & Announcements:** Always use clear descriptions and expiry dates for announcements so the feed doesn't get cluttered.
- **Memories Moderation:** Ensure photos align with the school's guidelines before approving them to the public feed.
- **School Settings:** Do not toggle "Manual Approval" to OFF unless you want anyone on the internet to instantly join the alumni network.

---

## OPEN QUESTIONS / INFORMATION NEEDED FROM SCHOOL ADMIN

*The following items require confirmation from the School Administration to configure the portal properly.*

| Module | Question / Information Needed | Why It Is Needed | Example Answer | Priority |
|---|---|---|---|---|
| Batches & Committees | What are the exact maximum quotas for Committee Roles? | The system limits how many Presidents/Secretaries can be assigned. | "Max 1 President, Max 3 Exec Members" | High |
| School Settings | Who should receive administrative alert emails? | Needed for system notifications. | "principal@school.edu" | High |
| Verification | Do you want Manual Approval turned ON by default? | Dictates if new sign-ups are instantly allowed in or queued. | "Yes, turn it ON" | High |
| Alumni Directory | Are admission numbers standardized (e.g., specific format)? | Helps set up automatic validation rules for signups. | "Yes, all start with ADM-" | Medium |
