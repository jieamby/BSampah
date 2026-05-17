import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { companies } from './companies.schema';
import { customers } from './customers.schema';

export const deposits = pgTable('deposits', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  depositCode: varchar('deposit_code', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  notes: text('notes'),
  depositDate: timestamp('deposit_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});