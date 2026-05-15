import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { customers } from './customers.schema';

export const deposits = pgTable('deposits', {
  id: uuid('id').defaultRandom().primaryKey(),
  depositCode: varchar('deposit_code', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, completed, cancelled
  notes: text('notes'),
  depositDate: timestamp('deposit_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});