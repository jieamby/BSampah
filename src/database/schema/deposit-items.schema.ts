import { pgTable, uuid, decimal, timestamp } from 'drizzle-orm/pg-core';
import { deposits } from './deposits.schema';
import { wasteTypes } from './waste-types.schema';

export const depositItems = pgTable('deposit_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  depositId: uuid('deposit_id').notNull().references(() => deposits.id),
  wasteTypeId: uuid('waste_type_id').notNull().references(() => wasteTypes.id),
  weight: decimal('weight', { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal('price_per_kg', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});