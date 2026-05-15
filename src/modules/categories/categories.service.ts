import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../database/database';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categories } from 'src/database/schema/categories.schema';

@Injectable()
export class CategoriesService {
  async create(dto: CreateCategoryDto) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, dto.name));

    if (existing[0]) {
      throw new ConflictException(`Kategori "${dto.name}" sudah ada`);
    }

    const category = await db
      .insert(categories)
      .values({
        name: dto.name,
        description: dto.description,
      })
      .returning();

    return category[0];
  }

  async findAll() {
    return db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true));
  }

  async findOne(id: string) {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category[0]) {
      throw new NotFoundException('Category not found');
    }

    return category[0];
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.name, dto.name));

      if (existing[0] && existing[0].id !== id) {
        throw new ConflictException(`Kategori "${dto.name}" sudah ada`);
      }
    }

    const category = await db
      .update(categories)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return category[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    await db
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.id, id));

    return { message: 'Category deleted' };
  }
}