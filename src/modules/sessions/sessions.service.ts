import { Injectable } from '@nestjs/common';

import { eq } from 'drizzle-orm';

import { db } from '../../database/database';

import { userSessions } from '../../database/schema/user-sessions.schema';

@Injectable()
export class SessionsService {
  async create(data: typeof userSessions.$inferInsert) {
    const session = await db.insert(userSessions).values(data).returning();

    return session[0];
  }

  async findByUser(userId: string) {
    return db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId));
  }

  async revokeSession(id: string) {
    await db
      .update(userSessions)
      .set({
        isRevoked: true,
      })
      .where(eq(userSessions.id, id));
  }

  async revokeAll(userId: string) {
    await db
      .update(userSessions)
      .set({
        isRevoked: true,
      })
      .where(eq(userSessions.userId, userId));
  }
}
