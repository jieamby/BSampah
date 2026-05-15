import { pgTable, uuid, decimal, timestamp } from 'drizzle-orm/pg-core';
import { transactions } from './transactions.schema';
import { wasteTypes } from './waste-types.schema';

export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id),
  wasteTypeId: uuid('waste_type_id').notNull().references(() => wasteTypes.id),
  weight: decimal('weight', { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal('price_per_kg', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});