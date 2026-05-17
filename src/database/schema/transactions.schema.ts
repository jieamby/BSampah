import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { companies } from './companies.schema';
import { customers } from './customers.schema';
import { deposits } from './deposits.schema';

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  transactionCode: varchar('transaction_code', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  depositId: uuid('deposit_id').references(() => deposits.id),
  type: varchar('type', { length: 20 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  status: varchar('status', { length: 20 }).default('completed').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});