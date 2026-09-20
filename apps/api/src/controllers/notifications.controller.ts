import { and, desc, eq, isNull } from 'drizzle-orm'
import { notifications } from '@repo/db'
import type { Database, NewNotification, Notification } from '@repo/db'

/**
 * 1. Fetch all notifications for a specific user.
 * Ordered by creation timestamp descending so newest notifications appear first.
 */
export async function listNotifications(db: Database, userId: string): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
}

/**
 * 2. Save a new notification record to the database.
 * Used to insert system events, status changes, etc.
 */
export async function createNotification(
  db: Database,
  input: NewNotification,
): Promise<Notification | null> {
  const [newNotif] = await db.insert(notifications).values(input).returning()
  return newNotif ?? null
}

/**
 * 3. Mark a specific notification as read.
 * Updates readAt to the current timestamp. Ensures the notification belongs to the caller.
 */
export async function markNotificationAsRead(
  db: Database,
  userId: string,
  id: string,
): Promise<Notification | null> {
  const [updated] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning()
  return updated ?? null
}

/**
 * 4. Mark all unread notifications for a user as read.
 * Updates readAt for any notification where readAt is currently null.
 */
export async function markAllNotificationsAsRead(
  db: Database,
  userId: string,
): Promise<Notification[]> {
  return db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
    .returning()
}

/**
 * 5. Simulate sending an email to a student.
 * Since we don't have an active SMTP server, we log the formatted output to the console.
 */
export async function sendEmail(
  apiKey: string | undefined,
  studentEmail: string,
  postingTitle: string,
  companyName: string,
  status: string,
) {
  const subject = `Application Status Update - ${postingTitle} at ${companyName}`
  const htmlBody = `
    <p>Hi,</p>
    <p>Your application status for <strong>${postingTitle}</strong> at <strong>${companyName}</strong> has been updated to <strong>${status}</strong>.</p>
    <p>Best regards,<br>The HireMe Team</p>
  `

  if (!apiKey) {
    const textBody = `Hi,\n\nYour application status for "${postingTitle}" at "${companyName}" has been updated to "${status}".\n\nBest regards,\nThe HireMe Team`
    console.log(`\n--- [SIMULATED EMAIL DISPATCH (No API Key)] ---`)
    console.log(`To:      ${studentEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body:\n${textBody}`)
    console.log(`-----------------------------------------------\n`)
    return {
      success: true,
      simulated: true,
      recipient: studentEmail,
      subject,
    }
  }

  // Call the Resend Emails API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev', // Default sender for testing sandbox
      to: [studentEmail],
      subject,
      html: htmlBody,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend API request failed with status ${response.status}: ${errorText}`)
  }

  const result = (await response.json()) as { id: string }
  return {
    success: true,
    simulated: false,
    id: result.id,
    recipient: studentEmail,
    subject,
  }
}
