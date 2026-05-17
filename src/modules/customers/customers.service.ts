import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../../database/database';
import { customers } from '../../database/schema/customers.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  async create(
    dto: CreateCustomerDto,
    file: Express.Multer.File,
    companyId: string,
  ) {
    let profileImageUrl: string | null = null;
    if (file) profileImageUrl = `/uploads/${file.filename}`;

    const customerCode = `CUS-${Date.now()}`;
    const barcode = randomUUID();

    const customer = await db
      .insert(customers)
      .values({
        companyId,
        customerCode,
        barcode,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        profileImageUrl,
      })
      .returning();

    return customer[0];
  }

  async findAll(companyId: string) {
    return db
      .select()
      .from(customers)
      .where(
        and(eq(customers.companyId, companyId), eq(customers.isActive, true)),
      );
  }

  async findOne(id: string, companyId: string) {
    const customer = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.companyId, companyId)));

    if (!customer[0]) throw new NotFoundException('Customer not found');
    return customer[0];
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string) {
    await this.findOne(id, companyId);

    const customer = await db
      .update(customers)
      .set(dto)
      .where(and(eq(customers.id, id), eq(customers.companyId, companyId)))
      .returning();

    return customer[0];
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    await db
      .update(customers)
      .set({ isActive: false })
      .where(and(eq(customers.id, id), eq(customers.companyId, companyId)));

    return { message: 'Customer deleted' };
  }
}
