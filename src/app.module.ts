import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { WasteTypesModule } from './modules/waste-types/waste-types.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    AuthModule,
    CustomersModule,
    CategoriesModule,
    WasteTypesModule,
    DepositsModule,
    TransactionsModule,
    DashboardModule,
  ],
})
export class AppModule {}
