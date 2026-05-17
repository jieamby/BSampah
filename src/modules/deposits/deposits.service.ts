import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../database/database';
import { deposits } from '../../database/schema/deposits.schema';
import { depositItems } from '../../database/schema/deposit-items.schema';
import { customers } from '../../database/schema/customers.schema';
import { wasteTypes } from '../../database/schema/waste-types.schema';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';

@Injectable()
export class DepositsService {
  async create(dto: CreateDepositDto, companyId: string) {
    const customer = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.id, dto.customerId),
          eq(customers.companyId, companyId),
        ),
      );

    if (!customer[0]) throw new NotFoundException('Customer not found');
    if (!dto.items.length)
      throw new BadRequestException('Minimal 1 item deposit');

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
        .where(
          and(
            eq(wasteTypes.id, item.wasteTypeId),
            eq(wasteTypes.companyId, companyId),
          ),
        );

      if (!wasteType[0])
        throw new NotFoundException(
          `Waste type "${item.wasteTypeId}" not found`,
        );

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

    const depositCode = `DEP-${Date.now()}`;
    const deposit = await db
      .insert(deposits)
      .values({
        companyId,
        depositCode,
        customerId: dto.customerId,
        totalAmount: String(totalAmount),
        notes: dto.notes,
      })
      .returning();

    const items = await db
      .insert(depositItems)
      .values(
        itemsData.map((item) => ({
          ...item,
          depositId: deposit[0].id,
        })),
      )
      .returning();

    return { ...deposit[0], items };
  }

  async findAll(companyId: string) {
    return db
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
      .where(eq(deposits.companyId, companyId))
      .orderBy(deposits.createdAt);
  }

  async findOne(id: string, companyId: string) {
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
      .where(and(eq(deposits.id, id), eq(deposits.companyId, companyId)));

    if (!deposit[0]) throw new NotFoundException('Deposit not found');

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

    return { ...deposit[0], items };
  }

  async update(id: string, dto: UpdateDepositDto, companyId: string) {
    await this.findOne(id, companyId);

    const deposit = await db
      .update(deposits)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(deposits.id, id), eq(deposits.companyId, companyId)))
      .returning();

    return deposit[0];
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    await db
      .update(deposits)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(deposits.id, id), eq(deposits.companyId, companyId)));

    return { message: 'Deposit cancelled' };
  }
}
