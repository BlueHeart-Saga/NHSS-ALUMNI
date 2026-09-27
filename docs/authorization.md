# Role & Permission Matrix

## 1. User Roles Overview
The platform defines 3 explicit roles:

1. **`SCHOOL_ADMIN`**: Global school administrator. Manages entire school setup, all batches, alumni verification, school events, global announcements, and reports.
2. **`BATCH_COORDINATOR`**: Assigned leader for a specific batch cohort. Can manage batch members, create/publish events for their assigned batch, scan QR check-ins, and broadcast batch announcements.
3. **`ALUMNI`**: Verified school graduate. Can view batchmates, RSVP to events, access event QR tickets, upload memories/photos, and view announcements.

---

## 2. Granular Permissions Matrix

| Feature / Action | SCHOOL_ADMIN | BATCH_COORDINATOR (Own Batch) | BATCH_COORDINATOR (Other Batch) | ALUMNI (Verified) | ALUMNI (Pending) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Manage School Profile** | Yes | - | - | - | - |
| **Create / Archive Batches** | Yes | - | - | - | - |
| **Assign Batch Coordinators** | Yes | - | - | - | - |
| **Verify / Reject Alumni** | Yes | View Pending | - | - | - |
| **Import Alumni CSV** | Yes | - | - | - | - |
| **View Alumni Directory** | Yes | Yes | Yes | Yes | - |
| **View Member Profile** | Yes | Yes | Yes | Yes (Respects Privacy) | - |
| **Create School Event** | Yes | - | - | - | - |
| **Create Batch Event** | Yes | Yes | - | - | - |
| **Publish / Cancel Event** | Yes | Yes (Own Batch) | - | - | - |
| **Submit Event RSVP** | Yes | Yes | Yes | Yes | - |
| **View RSVP Dashboard** | Yes | Yes (Own Batch) | - | - | - |
| **Scan QR Check-In** | Yes | Yes (Own Batch) | - | - | - |
| **Broadcast Announcement** | Yes (School/Batch) | Yes (Own Batch) | - | - | - |
| **Upload Memories** | Yes | Yes | Yes | Yes | - |
| **Moderate / Delete Photos** | Yes | Yes (Own Batch) | - | Yes (Own Uploads) | - |
| **Export Reports / CSV** | Yes | - | - | - | - |
| **View Audit Logs** | Yes | - | - | - | - |

---

## 3. Scope Enforcement Rules
- **School Isolation**: Every backend handler parses `user.school_id` from the JWT claims and validates that requested resources belong to the user's school.
- **Batch Coordinator Scope**: When a user with `BATCH_COORDINATOR` role attempts write/admin operations on an event or batch, the backend checks:
  `user.managed_batch_ids` includes `resource.batch_id`. If not, returns `403 Forbidden`.
- **Unverified Alumni Block**: Users with `verification_status != "APPROVED"` are blocked by backend middleware from accessing directory, RSVP, memories, or event QR features. They only see the "Verification Pending" screen.
