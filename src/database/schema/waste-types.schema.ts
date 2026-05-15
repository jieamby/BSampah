import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { categories } from './categories.schema';

export const wasteTypes = pgTable('waste_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id),
  description: text('description'),
  pricePerKg: decimal('price_per_kg', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 20 }).default('kg').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
