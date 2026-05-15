import { Injectable } from '@nestjs/common';

import { eq } from 'drizzle-orm';

import { db } from '../../database/database';

import { users } from '../../database/schema/users.schema';

@Injectable()
export class UsersService {
  async findByEmail(email: string) {
    const user = await db.select().from(users).where(eq(users.email, email));

    return user[0];
  }

  async findById(id: string) {
    const user = await db.select().from(users).where(eq(users.id, id));

    return user[0];
  }

  async create(data: typeof users.$inferInsert) {
    const user = await db.insert(users).values(data).returning();

    return user[0];
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    await db
      .update(users)
      .set({
        refreshToken,
      })
      .where(eq(users.id, userId));
  }
}
