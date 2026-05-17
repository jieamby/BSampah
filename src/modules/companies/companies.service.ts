import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../../database/database';
import { companies } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  async findAll() {
    return db.select().from(companies);
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));
    if (!result[0]) throw new NotFoundException('Company not found');
    return result[0];
  }

  async findBySlug(slug: string) {
    const result = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, slug));
    return result[0] ?? null;
  }

  async create(dto: CreateCompanyDto) {
    const existing = await this.findBySlug(dto.slug);
    if (existing) throw new BadRequestException('Slug already exists');

    const result = await db
      .insert(companies)
      .values({
        name: dto.name,
        slug: dto.slug,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      })
      .returning();

    return result[0];
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findById(id);

    const result = await db
      .update(companies)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string) {
    await this.findById(id);
    await db.delete(companies).where(eq(companies.id, id));
    return { message: 'Company deleted' };
  }
}
