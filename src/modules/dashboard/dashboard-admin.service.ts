import { Injectable } from '@nestjs/common';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { db } from '../../database/database';
import { customers } from '../../database/schema/customers.schema';
import { deposits } from '../../database/schema/deposits.schema';
import { depositItems } from '../../database/schema/deposit-items.schema';
import { transactions } from '../../database/schema/transactions.schema';
import { wasteTypes } from '../../database/schema/waste-types.schema';
import { categories } from '../../database/schema/categories.schema';
import { reports } from '../../database/schema/reports.schema';
import { GenerateReportDto } from './dto/generate-report.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardAdminService {
  private async getDateRange(dto?: DashboardQueryDto) {
    let startDate: Date;
    let endDate: Date;

    if (dto?.startDate && dto?.endDate) {
      startDate = new Date(dto.startDate);
      endDate = new Date(dto.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default: bulan berjalan (tanggal 1 → hari ini)
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

  // ===== OVERVIEW ADMIN =====
  async getOverview(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    const [
      totalCustomers,
      totalDeposits,
      totalTransactions,
      totalRevenue,
      totalWeight,
      activeWasteTypes,
      totalWasteTypes,
      totalCategories,
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

      db
        .select({ count: sql`count(*)` })
        .from(wasteTypes)
        .where(eq(wasteTypes.isActive, true))
        .then((r) => Number(r[0].count)),

      db
        .select({ count: sql`count(*)` })
        .from(wasteTypes)
        .then((r) => Number(r[0].count)),

      db
        .select({ count: sql`count(*)` })
        .from(categories)
        .where(eq(categories.isActive, true))
        .then((r) => Number(r[0].count)),
    ]);

    return {
      period: dto?.period || 'today',
      dateRange: { startDate, endDate },
      summary: {
        totalCustomers,
        totalDeposits,
        totalTransactions,
        totalRevenue,
        totalWeight,
      },
      wasteTypes: {
        active: activeWasteTypes,
        total: totalWasteTypes,
      },
      categories: {
        total: totalCategories,
      },
    };
  }

  // ===== RINGKASAN PER JENIS SAMPAH =====
  async getWasteSummary(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    const results = await db
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
      .orderBy(sql`COALESCE(SUM(${depositItems.weight}), 0) DESC`);

    return results;
  }

  // ===== RINGKASAN PER CUSTOMER (TOP DEPOSITORS) =====
  async getCustomerSummary(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    const results = await db
      .select({
        customerId: customers.id,
        customerCode: customers.customerCode,
        fullName: customers.fullName,
        phoneNumber: customers.phoneNumber,
        totalDeposits: sql<number>`COUNT(${deposits.id})`,
        totalAmount: sql<string>`COALESCE(SUM(${deposits.totalAmount}), '0')`,
        totalWeight: sql<number>`COALESCE(SUM(${depositItems.weight}), 0)`,
        currentBalance: customers.balance,
      })
      .from(customers)
      .leftJoin(deposits, eq(customers.id, deposits.customerId))
      .leftJoin(depositItems, eq(deposits.id, depositItems.depositId))
      .where(
        and(
          eq(deposits.status, 'completed'),
          gte(deposits.depositDate, startDate),
          lte(deposits.depositDate, endDate),
        ),
      )
      .groupBy(
        customers.id,
        customers.customerCode,
        customers.fullName,
        customers.phoneNumber,
        customers.balance,
      )
      .orderBy(sql`COALESCE(SUM(${deposits.totalAmount}), 0) DESC`)
      .limit(20);

    return results;
  }

  // ===== RINGKASAN PER KATEGORI =====
  async getCategorySummary(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    const results = await db
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
      .orderBy(sql`COALESCE(SUM(${depositItems.subtotal}), 0) DESC`);

    return results;
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

  // ===== STATUS DEPOSIT (PIE CHART) =====
  async getDepositStatusSummary(dto?: DashboardQueryDto) {
    const { startDate, endDate } = await this.getDateRange(dto);

    const results = await db
      .select({
        status: deposits.status,
        count: sql<number>`COUNT(${deposits.id})`,
        totalAmount: sql<string>`COALESCE(SUM(${deposits.totalAmount}), '0')`,
      })
      .from(deposits)
      .where(
        and(
          gte(deposits.depositDate, startDate),
          lte(deposits.depositDate, endDate),
        ),
      )
      .groupBy(deposits.status);

    return results;
  }

  // ===== GENERATE REPORT (simpan ke tabel reports) =====
  async generateReport(dto: GenerateReportDto) {
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

    const report = await db
      .insert(reports)
      .values({
        reportType: dto.reportType || 'custom',
        periodStart: startDate,
        periodEnd: endDate,
        totalCustomers: String(totalCustomers),
        totalDeposits: String(totalDeposits),
        totalTransactions: String(totalTransactions),
        totalRevenue,
        totalWeight,
      })
      .returning();

    return report[0];
  }
}
