import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../database/database';
import { categories } from '../../database/schema/categories.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  async create(dto: CreateCategoryDto, companyId: string) {
    const existing = await db
      .select()
      .from(categories)
      .where(
        and(eq(categories.name, dto.name), eq(categories.companyId, companyId)),
      );

    if (existing[0])
      throw new ConflictException(`Kategori "${dto.name}" sudah ada`);

    const category = await db
      .insert(categories)
      .values({
        companyId,
        name: dto.name,
        description: dto.description,
      })
      .returning();

    return category[0];
  }

  async findAll(companyId: string) {
    return db
      .select()
      .from(categories)
      .where(
        and(eq(categories.isActive, true), eq(categories.companyId, companyId)),
      );
  }

  async findOne(id: string, companyId: string) {
    const category = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.companyId, companyId)));

    if (!category[0]) throw new NotFoundException('Category not found');
    return category[0];
  }

  async update(id: string, dto: UpdateCategoryDto, companyId: string) {
    await this.findOne(id, companyId);

    if (dto.name) {
      const existing = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.name, dto.name),
            eq(categories.companyId, companyId),
          ),
        );

      if (existing[0] && existing[0].id !== id) {
        throw new ConflictException(`Kategori "${dto.name}" sudah ada`);
      }
    }

    const category = await db
      .update(categories)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.companyId, companyId)))
      .returning();

    return category[0];
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    await db
      .update(categories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.companyId, companyId)));

    return { message: 'Category deleted' };
  }
}
