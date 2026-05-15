import { Injectable, NotFoundException } from '@nestjs/common';

import { eq } from 'drizzle-orm';

import { randomUUID } from 'crypto';

import { db } from '../../database/database';

import { customers } from '../../database/schema/customers.schema';

import { CreateCustomerDto } from './dto/create-customer.dto';

import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  async create(dto: CreateCustomerDto,
    file: Express.Multer.File,
  ) {

    let profileImageUrl: string | null = null;

    if (file) {
        profileImageUrl = `/uploads/${file.filename}`;
    }
    const customerCode = `CUS-${Date.now()}`;

    const barcode = randomUUID();

    const customer = await db
      .insert(customers)
      .values({
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

  async findAll() {
    return db.select().from(customers);
  }

  async findOne(id: string) {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!customer[0]) {
      throw new NotFoundException('Customer not found');
    }

    return customer[0];
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    const customer = await db
      .update(customers)
      .set(dto)
      .where(eq(customers.id, id))
      .returning();

    return customer[0];
  }

  async remove(id: string) {
    await this.findOne(id);

    await db
      .update(customers)
      .set({
        isActive: false,
      })
      .where(eq(customers.id, id));

    return {
      message: 'Customer deleted',
    };
  }
}
