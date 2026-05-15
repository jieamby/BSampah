import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core';
import { customers } from './customers.schema';
import { deposits } from './deposits.schema';
import { depositItems } from './deposit-items.schema';
import { transactions } from './transactions.schema';
import { wasteTypes } from './waste-types.schema';
import { categories } from './categories.schema';

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportType: varchar('report_type', { length: 50 }).notNull(), // daily, weekly, monthly
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  totalCustomers: decimal('total_customers', { precision: 10, scale: 0 })
    .default('0')
    .notNull(),
  totalDeposits: decimal('total_deposits', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  totalTransactions: decimal('total_transactions', { precision: 10, scale: 0 })
    .default('0')
    .notNull(),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  totalWeight: decimal('total_weight', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
