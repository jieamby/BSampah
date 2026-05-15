import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { db } from '../../database/database';
import { customers } from '../../database/schema/customers.schema';
import { deposits } from '../../database/schema/deposits.schema';
import { depositItems } from '../../database/schema/deposit-items.schema';
import { transactions } from '../../database/schema/transactions.schema';
import { wasteTypes } from '../../database/schema/waste-types.schema';
import { categories } from '../../database/schema/categories.schema';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardCustomerService {
  private async getDateRange(dto?: DashboardQueryDto) {
    let startDate: Date;
    let endDate: Date;

    if (dto?.startDate && dto?.endDate) {
      startDate = new Date(dto.startDate);
      endDate = new Date(dto.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    startDate = new Date(
      startDate.getTime() - startDate.getTimezoneOffset() * 60000,
    );
    endDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

    return { startDate, endDate };
  }

  // ===== PROFILE & SALDO CUSTOMER =====
  async getProfile(customerId: string) {
    const [profile, summary] = await Promise.all([
      db
        .select({
          id: customers.id,
          customerCode: customers.customerCode,
          barcode: customers.barcode,
          fullName: customers.fullName,
          phoneNumber: customers.phoneNumber,
          address: customers.address,
          balance: customers.balance,
          profileImageUrl: customers.profileImageUrl,
        })
        .from(customers)
        .where(eq(customers.id, customerId))
        .then((r) => {
          if (!r[0]) {
            throw new NotFoundException('Customer not found');
          }
          return r[0];
        }),

      db
        .select({
          totalDeposits: sql<string>`COALESCE(SUM(${deposits.totalAmount}), '0')`,
          totalWeight: sql<string>`COALESCE(SUM(${depositItems.weight}), '0')`,
          depositCount: sql<number>`COUNT(${deposits.id})`,
        })
        .from(deposits)
        .leftJoin(depositItems, eq(deposits.id, depositItems.depositId))
        .where(
          and(
            eq(deposits.customerId, customerId),
            eq(deposits.status, 'completed'),
          ),
        ),
    ]);

    return {
      ...profile,
      depositSummary: {
        totalDeposits: summary[0].totalDeposits,
        totalWeight: summary[0].totalWeight,
        depositCount: summary[0].depositCount,
      },
    };
  }

  // ===== RIWAYAT DEPOSIT CUSTOMER =====
  async getMyDeposits(customerId: string, dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    return db
      .select({
        id: deposits.id,
        depositCode: deposits.depositCode,
        totalAmount: deposits.totalAmount,
        status: deposits.status,
        depositDate: deposits.depositDate,
        createdAt: deposits.createdAt,
      })
      .from(deposits)
      .where(
        and(
          eq(deposits.customerId, customerId),
          gte(deposits.depositDate, startDate),
          lte(deposits.depositDate, endDate),
        ),
      )
      .orderBy(deposits.createdAt);
  }

  // ===== RIWAYAT TRANSAKSI CUSTOMER =====
  async getMyTransactions(customerId: string, dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    return db
      .select({
        id: transactions.id,
        transactionCode: transactions.transactionCode,
        type: transactions.type,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.customerId, customerId),
          gte(transactions.createdAt, startDate),
          lte(transactions.createdAt, endDate),
        ),
      )
      .orderBy(transactions.createdAt);
  }

  // ===== RINGKASAN PER JENIS SAMPAH (untuk customer) =====
  async getMyWasteSummary(customerId: string, dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    return db
      .select({
        wasteTypeId: wasteTypes.id,
        wasteTypeName: wasteTypes.name,
        categoryName: categories.name,
        totalWeight: sql<number>`COALESCE(SUM(${depositItems.weight}), 0)`,
        totalSubtotal: sql<string>`COALESCE(SUM(${depositItems.subtotal}), '0')`,
        transactionCount: sql<number>`COUNT(${depositItems.id})`,
      })
      .from(depositItems)
      .leftJoin(deposits, eq(depositItems.depositId, deposits.id))
      .leftJoin(wasteTypes, eq(depositItems.wasteTypeId, wasteTypes.id))
      .leftJoin(categories, eq(wasteTypes.categoryId, categories.id))
      .where(
        and(
          eq(deposits.customerId, customerId),
          eq(deposits.status, 'completed'),
          gte(deposits.depositDate, startDate),
          lte(deposits.depositDate, endDate),
        ),
      )
      .groupBy(wasteTypes.id, wasteTypes.name, categories.name)
      .orderBy(sql`total_weight DESC`);
  }
}
