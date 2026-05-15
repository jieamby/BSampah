import {
  boolean,
  decimal,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),

  customerCode: text('customer_code').notNull().unique(),

  fullName: text('full_name').notNull(),

  phoneNumber: text('phone_number'),

  address: text('address'),

  barcode: text('barcode').notNull().unique(),

  profileImageUrl: text('profile_image_url'),

  balance: decimal('balance', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),

  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
});
