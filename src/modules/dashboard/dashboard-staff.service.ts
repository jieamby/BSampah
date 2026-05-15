import { Injectable } from '@nestjs/common';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { db } from '../../database/database';
import { customers } from '../../database/schema/customers.schema';
import { deposits } from '../../database/schema/deposits.schema';
import { depositItems } from '../../database/schema/deposit-items.schema';
import { transactions } from '../../database/schema/transactions.schema';
import { transactionItems } from '../../database/schema/transaction-items.schema';
import { wasteTypes } from '../../database/schema/waste-types.schema';
import { categories } from '../../database/schema/categories.schema';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardStaffService {
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

  // ===== OVERVIEW PETUGAS =====
  async getOverview(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    const [
      totalCustomers,
      totalDeposits,
      totalTransactions,
      totalRevenue,
      totalWeight,
    ] = await Promise.all([
      db
        .select({ count: sql`count(*)` })
        .from(customers)
        .then((r) => Number(r[0].count)),

      db
        .select({ count: sql`count(*)` })
        .from(deposits)
        .where(
          and(
            gte(deposits.depositDate, startDate),
            lte(deposits.depositDate, endDate),
          ),
        )
        .then((r) => Number(r[0].count)),

      db
        .select({ count: sql`count(*)` })
        .from(transactions)
        .where(
          and(
            gte(transactions.createdAt, startDate),
            lte(transactions.createdAt, endDate),
          ),
        )
        .then((r) => Number(r[0].count)),

      db
        .select({ total: sql`COALESCE(SUM(${deposits.totalAmount}), 0)` })
        .from(deposits)
        .where(
          and(
            eq(deposits.status, 'completed'),
            gte(deposits.depositDate, startDate),
            lte(deposits.depositDate, endDate),
          ),
        )
        .then((r) => String(r[0].total)),

      db
        .select({ total: sql`COALESCE(SUM(${depositItems.weight}), 0)` })
        .from(depositItems)
        .leftJoin(deposits, eq(depositItems.depositId, deposits.id))
        .where(
          and(
            eq(deposits.status, 'completed'),
            gte(deposits.depositDate, startDate),
            lte(deposits.depositDate, endDate),
          ),
        )
        .then((r) => String(r[0].total)),
    ]);

    return {
      period: dto?.period || 'today',
      summary: {
        totalCustomers,
        totalDeposits,
        totalTransactions,
        totalRevenue,
        totalWeight,
      },
    };
  }

  // ===== TRANSAKSI HARI INI =====
  async getTodayTransactions(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    return db
      .select({
        id: transactions.id,
        transactionCode: transactions.transactionCode,
        customerName: customers.fullName,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(customers, eq(transactions.customerId, customers.id))
      .where(
        and(
          gte(transactions.createdAt, startDate),
          lte(transactions.createdAt, endDate),
        ),
      )
      .orderBy(transactions.createdAt);
  }

  // ===== RINGKASAN PER JENIS SAMPAH =====
  async getWasteSummary(dto?: DashboardQueryDto) {
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
          eq(deposits.status, 'completed'),
          gte(deposits.depositDate, startDate),
          lte(deposits.depositDate, endDate),
        ),
      )
      .groupBy(wasteTypes.id, wasteTypes.name, categories.name)
      .orderBy(sql`total_weight DESC`);
  }

  // ===== RINGKASAN PER KATEGORI =====
  async getCategorySummary(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    return db
      .select({
        categoryName: categories.name,
        totalWeight: sql<number>`COALESCE(SUM(${depositItems.weight}), 0)`,
        totalAmount: sql<string>`COALESCE(SUM(${depositItems.subtotal}), '0')`,
        wasteTypeCount: sql<number>`COUNT(DISTINCT ${wasteTypes.id})`,
      })
      .from(depositItems)
      .leftJoin(deposits, eq(depositItems.depositId, deposits.id))
      .leftJoin(wasteTypes, eq(depositItems.wasteTypeId, wasteTypes.id))
      .leftJoin(categories, eq(wasteTypes.categoryId, categories.id))
      .where(
        and(
          eq(deposits.status, 'completed'),
          gte(deposits.depositDate, startDate),
          lte(deposits.depositDate, endDate),
        ),
      )
      .groupBy(categories.name)
      .orderBy(sql`total_amount DESC`);
  }

  // ===== TREND BULANAN =====
  async getMonthlyTrend(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    const results = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', "deposits"."deposit_date")`,
        totalDeposits: sql<number>`COUNT("deposits"."id")`,
        totalAmount: sql<string>`COALESCE(SUM("deposits"."total_amount"), '0')`,
        totalWeight: sql<number>`COALESCE(SUM("deposit_items"."weight"), 0)`,
      })
      .from(deposits)
      .leftJoin(depositItems, eq(deposits.id, depositItems.depositId))
      .where(
        and(
          eq(deposits.status, 'completed'),
          gte(deposits.depositDate, startDate),
          lte(deposits.depositDate, endDate),
        ),
      )
      .groupBy(sql`DATE_TRUNC('month', "deposits"."deposit_date")`)
      .orderBy(sql`DATE_TRUNC('month', "deposits"."deposit_date")`);

    return results;
  }
}
