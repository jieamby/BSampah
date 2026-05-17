import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { companies } from './companies.schema';

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  reportType: varchar('report_type', { length: 50 }).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalCustomers: decimal('total_customers', { precision: 10, scale: 0 }).default('0').notNull(),
  totalDeposits: decimal('total_deposits', { precision: 12, scale: 2 }).default('0').notNull(),
  totalTransactions: decimal('total_transactions', { precision: 10, scale: 0 }).default('0').notNull(),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0').notNull(),
  totalWeight: decimal('total_weight', { precision: 12, scale: 2 }).default('0').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});