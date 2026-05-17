import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { companies } from './companies.schema';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  isActive: boolean('is_active').default(true),
  refreshToken: text('refresh_token'),
  createdAt: timestamp('created_at').defaultNow(),
});
