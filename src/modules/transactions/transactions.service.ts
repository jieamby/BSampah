import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../database/database';
import { transactions } from '../../database/schema/transactions.schema';
import { transactionItems } from '../../database/schema/transaction-items.schema';
import { deposits } from '../../database/schema/deposits.schema';
import { depositItems } from '../../database/schema/deposit-items.schema';
import { customers } from '../../database/schema/customers.schema';
import { wasteTypes } from '../../database/schema/waste-types.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  async scanBarcode(barcode: string, companyId: string) {
    const customer = await db
      .select()
      .from(customers)
      .where(
        and(eq(customers.barcode, barcode), eq(customers.companyId, companyId)),
      );

    if (!customer[0]) throw new NotFoundException('Customer tidak ditemukan');
    return customer[0];
  }

  async create(dto: CreateTransactionDto, companyId: string) {
    const customer = await this.scanBarcode(dto.barcode, companyId);

    if (!dto.items.length)
      throw new BadRequestException('Minimal 1 item transaksi');

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

    // 1. Buat deposit
    const depositCode = `DEP-${Date.now()}`;
    const deposit = await db
      .insert(deposits)
      .values({
        companyId,
        depositCode,
        customerId: customer.id,
        totalAmount: String(totalAmount),
        status: 'completed',
        notes: dto.notes,
      })
      .returning();

    // 2. Insert deposit items
    await db.insert(depositItems).values(
      itemsData.map((item) => ({
        ...item,
        depositId: deposit[0].id,
      })),
    );

    // 3. Buat transaksi
    const transactionCode = `TRX-${Date.now()}`;
    const transaction = await db
      .insert(transactions)
      .values({
        companyId,
        transactionCode,
        customerId: customer.id,
        depositId: deposit[0].id,
        type: 'deposit',
        totalAmount: String(totalAmount),
        status: 'completed',
        notes: dto.notes,
      })
      .returning();

    // 4. Insert transaction items
    const txItems = await db
      .insert(transactionItems)
      .values(
        itemsData.map((item) => ({
          ...item,
          transactionId: transaction[0].id,
        })),
      )
      .returning();

    // 5. Update saldo customer
    await db
      .update(customers)
      .set({ balance: sql`${customers.balance} + ${totalAmount}` })
      .where(eq(customers.id, customer.id));

    // 6. Ambil saldo terbaru
    const updatedCustomer = await db
      .select({ balance: customers.balance })
      .from(customers)
      .where(eq(customers.id, customer.id));

    return {
      ...transaction[0],
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        customerCode: customer.customerCode,
        balance: updatedCustomer[0].balance,
      },
      deposit: {
        id: deposit[0].id,
        depositCode: deposit[0].depositCode,
      },
      items: txItems,
    };
  }

  async findAll(companyId: string) {
    return db
      .select({
        id: transactions.id,
        transactionCode: transactions.transactionCode,
        type: transactions.type,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
        customer: {
          id: customers.id,
          fullName: customers.fullName,
          customerCode: customers.customerCode,
        },
      })
      .from(transactions)
      .leftJoin(customers, eq(transactions.customerId, customers.id))
      .where(eq(transactions.companyId, companyId))
      .orderBy(transactions.createdAt);
  }

  async findOne(id: string, companyId: string) {
    const transaction = await db
      .select({
        id: transactions.id,
        transactionCode: transactions.transactionCode,
        depositId: transactions.depositId,
        type: transactions.type,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
        customer: {
          id: customers.id,
          fullName: customers.fullName,
          customerCode: customers.customerCode,
        },
      })
      .from(transactions)
      .leftJoin(customers, eq(transactions.customerId, customers.id))
      .where(
        and(eq(transactions.id, id), eq(transactions.companyId, companyId)),
      );

    if (!transaction[0]) throw new NotFoundException('Transaction not found');

    const items = await db
      .select({
        id: transactionItems.id,
        weight: transactionItems.weight,
        pricePerKg: transactionItems.pricePerKg,
        subtotal: transactionItems.subtotal,
        wasteType: {
          id: wasteTypes.id,
          name: wasteTypes.name,
        },
      })
      .from(transactionItems)
      .leftJoin(wasteTypes, eq(transactionItems.wasteTypeId, wasteTypes.id))
      .where(eq(transactionItems.transactionId, id));

    return { ...transaction[0], items };
  }

  async findByCustomer(customerId: string, companyId: string) {
    return db
      .select({
        id: transactions.id,
        transactionCode: transactions.transactionCode,
        type: transactions.type,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.customerId, customerId),
          eq(transactions.companyId, companyId),
        ),
      )
      .orderBy(transactions.createdAt);
  }
}
