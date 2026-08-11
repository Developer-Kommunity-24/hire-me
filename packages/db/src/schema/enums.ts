import { pgEnum } from 'drizzle-orm/pg-core';

// ==========================================
// ENUMS
// ==========================================

export const userRoleEnum = pgEnum('user_role', [
  'student',
  'recruiter',
  'core_admin',
  'club_admin',
]);

export const dk24StatusEnum = pgEnum('dk24_status', [
  'none',
  'pending',
  'verified',
  'rejected',
  'revoked',
]);

export const verificationDecisionEnum = pgEnum('verification_decision', [
  'pending',
  'approved',
  'rejected',
]);

export const postingStatusEnum = pgEnum('posting_status', [
  'active',
  'closed',
  'expired',
]);

export const employmentTypeEnum = pgEnum('employment_type', [
  'internship',
  'full_time',
  'part_time',
  'contract',
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'applied',
  'under_review',
  'shortlisted',
  'accepted',
  'rejected',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'new_matching_posting',
  'application_received',
  'status_changed',
  'verification_result',
  'recruiter_approved',
  'admin_queue_reminder',
]);

export const workArrangementEnum = pgEnum('work_arrangement', [
  'in_person',
  'remote',
  'hybrid',
]);

export const achievementTypeEnum = pgEnum('achievement_type', [
  'hackathon',
  'certification',
  'award',
  'other',
]);

export const clubRoleEnum = pgEnum('club_role', ['admin', 'member']);
