/**
 * Utility to determine smart target route based on user roles and registration status.
 * Priority:
 * 1. Platform Developer: SUPER_ADMIN, DEVELOPER, PLATFORM_DEVELOPER -> /developer
 * 2. School Admin: SCHOOL_ADMIN -> /school-admin
 * 3. Alumni: ALUMNI (or default) -> /register if registration is required, otherwise /alumni
 */
export const getRedirectPathForRoles = (
  roles: string[] = [],
  registrationRequired: boolean = false,
  verificationStatus?: string
): string => {
  const normStatus = verificationStatus?.toUpperCase();
  const isAlreadyRegistered =
    normStatus === 'APPROVED' ||
    normStatus === 'VERIFIED' ||
    normStatus === 'PENDING' ||
    normStatus === 'REJECTED';

  if (!roles || !Array.isArray(roles)) {
    return (!isAlreadyRegistered && registrationRequired) ? '/register' : '/alumni';
  }

  const upperRoles = roles.map((r) => String(r).toUpperCase());

  if (
    upperRoles.includes('SUPER_ADMIN') ||
    upperRoles.includes('DEVELOPER') ||
    upperRoles.includes('PLATFORM_DEVELOPER')
  ) {
    return '/developer';
  }

  if (upperRoles.includes('SCHOOL_ADMIN')) {
    return '/school-admin';
  }

  // If user has already completed registration and submitted it (APPROVED, PENDING, REJECTED),
  // they track their status or access features inside /alumni — NEVER send them to /register!
  if (isAlreadyRegistered) {
    return '/alumni';
  }

  if (registrationRequired) {
    return '/register';
  }

  return '/alumni';
};
