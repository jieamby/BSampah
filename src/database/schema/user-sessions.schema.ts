import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id').notNull(),

  refreshToken: text('refresh_token').notNull(),

  userAgent: text('user_agent'),

  ipAddress: text('ip_address'),

  isRevoked: boolean('is_revoked').default(false).notNull(),

  expiresAt: timestamp('expires_at').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
});
