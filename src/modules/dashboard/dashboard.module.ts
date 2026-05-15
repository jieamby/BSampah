import { Module } from '@nestjs/common';
import { DashboardAdminController } from './dashboard-admin.controller';
import { DashboardStaffController } from './dashboard-staff.controller';
import { DashboardCustomerController } from './dashboard-customer.controller';
import { DashboardAdminService } from './dashboard-admin.service';
import { DashboardStaffService } from './dashboard-staff.service';
import { DashboardCustomerService } from './dashboard-customer.service';

@Module({
  controllers: [
    DashboardAdminController,
    DashboardStaffController,
    DashboardCustomerController,
  ],
  providers: [
    DashboardAdminService,
    DashboardStaffService,
    DashboardCustomerService,
  ],
})
export class DashboardModule {}
