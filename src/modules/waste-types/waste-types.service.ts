import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../database/database';
import { wasteTypes } from '../../database/schema/waste-types.schema';
import { categories } from '../../database/schema/categories.schema';
import { CreateWasteTypeDto } from './dto/create-waste-type.dto';
import { UpdateWasteTypeDto } from './dto/update-waste-type.dto';

@Injectable()
export class WasteTypesService {
  async create(dto: CreateWasteTypeDto) {
    // Validasi category exists
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, dto.categoryId));

    if (!category[0]) {
      throw new NotFoundException('Category not found');
    }

    const wasteType = await db
      .insert(wasteTypes)
      .values({
        name: dto.name,
        categoryId: dto.categoryId,
        description: dto.description,
        pricePerKg: String(dto.pricePerKg),
        unit: dto.unit,
      })
      .returning();

    return wasteType[0];
  }

  async findAll() {
    return db
      .select({
        id: wasteTypes.id,
        name: wasteTypes.name,
        description: wasteTypes.description,
        pricePerKg: wasteTypes.pricePerKg,
        unit: wasteTypes.unit,
        isActive: wasteTypes.isActive,
        createdAt: wasteTypes.createdAt,
        updatedAt: wasteTypes.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(wasteTypes)
      .leftJoin(categories, eq(wasteTypes.categoryId, categories.id))
      .where(eq(wasteTypes.isActive, true));
  }

  async findOne(id: string) {
    const result = await db
      .select({
        id: wasteTypes.id,
        name: wasteTypes.name,
        description: wasteTypes.description,
        pricePerKg: wasteTypes.pricePerKg,
        unit: wasteTypes.unit,
        isActive: wasteTypes.isActive,
        createdAt: wasteTypes.createdAt,
        updatedAt: wasteTypes.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(wasteTypes)
      .leftJoin(categories, eq(wasteTypes.categoryId, categories.id))
      .where(eq(wasteTypes.id, id));

    if (!result[0]) {
      throw new NotFoundException('Waste type not found');
    }

    return result[0];
  }

  async update(id: string, dto: UpdateWasteTypeDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, dto.categoryId));

      if (!category[0]) {
        throw new NotFoundException('Category not found');
      }
    }

    const data: any = { ...dto, updatedAt: new Date() };
    if (dto.pricePerKg !== undefined) {
      data.pricePerKg = String(dto.pricePerKg);
    }

    const wasteType = await db
      .update(wasteTypes)
      .set(data)
      .where(eq(wasteTypes.id, id))
      .returning();

    return wasteType[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    await db
      .update(wasteTypes)
      .set({ isActive: false })
      .where(eq(wasteTypes.id, id));

    return { message: 'Waste type deleted' };
  }
}
