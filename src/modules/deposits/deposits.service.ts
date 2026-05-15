import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../database/database';
import { deposits } from '../../database/schema/deposits.schema';
import { depositItems } from '../../database/schema/deposit-items.schema';
import { customers } from '../../database/schema/customers.schema';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { wasteTypes } from 'src/database/schema/waste-types.schema';

@Injectable()
export class DepositsService {
  async create(dto: CreateDepositDto) {
    // Validasi customer
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, dto.customerId));

    if (!customer[0]) {
      throw new NotFoundException('Customer not found');
    }

    if (!dto.items.length) {
      throw new BadRequestException('Minimal 1 item deposit');
    }

    // Ambil harga semua waste type
    let totalAmount = 0;
    const itemsData: {
      wasteTypeId: string;
      weight: string;
      pricePerKg: string;
      subtotal: string;
    }[] = [];

    for (const item of dto.items) {
      const wasteType = await db
        .select()
        .from(wasteTypes)
        .where(eq(wasteTypes.id, item.wasteTypeId));

      if (!wasteType[0]) {
        throw new NotFoundException(`Waste type "${item.wasteTypeId}" not found`);
      }

      const pricePerKg = Number(wasteType[0].pricePerKg);
      const subtotal = pricePerKg * item.weight;
      totalAmount += subtotal;

      itemsData.push({
        wasteTypeId: item.wasteTypeId,
        weight: String(item.weight),
        pricePerKg: String(pricePerKg),
        subtotal: String(subtotal),
      });
    }

    // Insert deposit
    const depositCode = `DEP-${Date.now()}`;

    const deposit = await db
      .insert(deposits)
      .values({
        depositCode,
        customerId: dto.customerId,
        totalAmount: String(totalAmount),
        notes: dto.notes,
      })
      .returning();

    // Insert deposit items
    const items = await db
      .insert(depositItems)
      .values(
        itemsData.map((item) => ({
          ...item,
          depositId: deposit[0].id,
        })),
      )
      .returning();

    return {
      ...deposit[0],
      items,
    };
  }

  async findAll() {
    const result = await db
      .select({
        id: deposits.id,
        depositCode: deposits.depositCode,
        totalAmount: deposits.totalAmount,
        status: deposits.status,
        notes: deposits.notes,
        depositDate: deposits.depositDate,
        createdAt: deposits.createdAt,
        customer: {
          id: customers.id,
          fullName: customers.fullName,
          customerCode: customers.customerCode,
        },
      })
      .from(deposits)
      .leftJoin(customers, eq(deposits.customerId, customers.id))
      .orderBy(deposits.createdAt);

    return result;
  }

  async findOne(id: string) {
    const deposit = await db
      .select({
        id: deposits.id,
        depositCode: deposits.depositCode,
        totalAmount: deposits.totalAmount,
        status: deposits.status,
        notes: deposits.notes,
        depositDate: deposits.depositDate,
        createdAt: deposits.createdAt,
        customer: {
          id: customers.id,
          fullName: customers.fullName,
          customerCode: customers.customerCode,
        },
      })
      .from(deposits)
      .leftJoin(customers, eq(deposits.customerId, customers.id))
      .where(eq(deposits.id, id));

    if (!deposit[0]) {
      throw new NotFoundException('Deposit not found');
    }

    // Get items
    const items = await db
      .select({
        id: depositItems.id,
        weight: depositItems.weight,
        pricePerKg: depositItems.pricePerKg,
        subtotal: depositItems.subtotal,
        wasteType: {
          id: wasteTypes.id,
          name: wasteTypes.name,
        },
      })
      .from(depositItems)
      .leftJoin(wasteTypes, eq(depositItems.wasteTypeId, wasteTypes.id))
      .where(eq(depositItems.depositId, id));

    return {
      ...deposit[0],
      items,
    };
  }

  async update(id: string, dto: UpdateDepositDto) {
    await this.findOne(id);

    const deposit = await db
      .update(deposits)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(deposits.id, id))
      .returning();

    return deposit[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    await db
      .update(deposits)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(deposits.id, id));

    return { message: 'Deposit cancelled' };
  }
}